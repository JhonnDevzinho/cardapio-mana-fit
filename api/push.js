const admin = require('firebase-admin');
const crypto = require('crypto');
const webpush = require('web-push');
const { db, fail } = require('./_lib');

function configurePush() {
  const publicKey = process.env.PUSH_VAPID_PUBLIC_KEY;
  const privateKey = process.env.PUSH_VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey || !process.env.PUSH_VAPID_SUBJECT) {
    throw Object.assign(new Error('Web Push não configurado no servidor'), { status: 503 });
  }
  webpush.setVapidDetails(process.env.PUSH_VAPID_SUBJECT, publicKey, privateKey);
}

async function send(record, payload) {
  if (!record?.subscription) return;
  try {
    await webpush.sendNotification(record.subscription, JSON.stringify(payload));
  } catch (error) {
    if (error.statusCode === 404 || error.statusCode === 410) {
      await db().ref(`push/${record.role}/${record.deviceId}`).remove();
      return;
    }
    throw error;
  }
}

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
    configurePush();
    const { event, orderId } = req.body || {};
    if (!/^[a-z0-9]{10}$/.test(String(orderId || ''))) return res.status(400).json({ error: 'Pedido inválido' });
    const database = db();
    const orderRef = database.ref('orders/' + orderId);
    const order = (await orderRef.once('value')).val();
    if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });

    let payload, recipients = [];
    if (event === 'new-order') {
      if (order.st !== 0 || Date.now() - Number(order.at || 0) > 5 * 60 * 1000) return res.status(400).json({ error: 'Pedido fora da janela de notificação' });
      const claimId = crypto.randomUUID();
      const claim = await database.ref(`push/events/new-order/${orderId}`).transaction(value => value || { claimId, at: Date.now() });
      if (!claim.committed || claim.snapshot.val()?.claimId !== claimId) return res.status(200).json({ ok: true, duplicate: true });
      payload = { title: 'Novo pedido', body: `Pedido #${orderId.slice(0, 5).toUpperCase()} de ${order.name || 'cliente'}`, tag: `mana-order-${orderId}`, url: '/lojista/?tab=orders' };
      const subscriptions = (await database.ref('push/merchant').once('value')).val() || {};
      recipients = Object.entries(subscriptions).map(([deviceId, record]) => ({ ...record, role: 'merchant', deviceId }));
    } else if (event === 'status') {
      const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
      if (!token) return res.status(401).json({ error: 'Autenticação necessária' });
      await admin.auth().verifyIdToken(token);
      const currentStatus = Math.max(0, Math.min(3, Number(order.st) || 0));
      if (!order.uid || currentStatus === 0) return res.status(200).json({ ok: true, skipped: true });
      const claimRef = database.ref(`push/events/status/${orderId}/${currentStatus}`);
      const claimId = crypto.randomUUID();
      const claim = await claimRef.transaction(value => value || { claimId, at: Date.now() });
      if (!claim.committed || claim.snapshot.val()?.claimId !== claimId) return res.status(200).json({ ok: true, duplicate: true });
      payload = { title: 'Pedido atualizado', body: `Pedido #${orderId.slice(0, 5).toUpperCase()}: ${['Recebido', 'Em preparo', order.mode === 'retirada' ? 'Pronto para retirada' : 'Saiu para entrega', order.mode === 'retirada' ? 'Retirado' : 'Entregue'][currentStatus]}`, tag: `mana-status-${orderId}-${currentStatus}`, url: '/cliente/?tab=orders' };
      const record = (await database.ref(`push/client/${order.uid}`).once('value')).val();
      if (record) recipients = [{ ...record, role: 'client', deviceId: order.uid }];
    } else {
      return res.status(400).json({ error: 'Evento inválido' });
    }

    await Promise.all(recipients.map(record => send(record, payload)));
    return res.status(200).json({ ok: true, sent: recipients.length });
  } catch (error) {
    return fail(res, error);
  }
};
