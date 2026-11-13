const admin = require('firebase-admin');
const { db, fail } = require('./_lib');

async function verifyMerchant(req) {
  db(); // Inicializa o Firebase Admin antes da validação do token.
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) throw Object.assign(new Error('Autenticação necessária'), { status: 401 });
  const decoded = await admin.auth().verifyIdToken(token);
  const allowed = String(process.env.MERCHANT_EMAIL || '').trim().toLowerCase();
  if (!allowed) throw Object.assign(new Error('Configure MERCHANT_EMAIL na Vercel'), { status: 503 });
  if (!decoded.email || decoded.email.toLowerCase() !== allowed) {
    throw Object.assign(new Error('Acesso restrito ao lojista'), { status: 403 });
  }
}

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
    await verifyMerchant(req);
    const { action, orderId, st, config } = req.body || {};
    const database = db();

    if (action === 'orders') {
      const snapshot = await database.ref('orders').orderByChild('at').limitToLast(60).once('value');
      const orders = Object.values(snapshot.val() || {}).sort((a, b) => b.at - a.at);
      return res.status(200).json({ orders });
    }

    if (action === 'config') {
      if (!config || !Array.isArray(config.products) || !Array.isArray(config.cats)) {
        return res.status(400).json({ error: 'Cardápio inválido' });
      }
      await database.ref('config').set(config);
      return res.status(200).json({ ok: true });
    }

    if (!/^[a-z0-9]{10}$/.test(String(orderId || ''))) {
      return res.status(400).json({ error: 'Pedido inválido' });
    }
    const ref = database.ref('orders/' + orderId);
    const snapshot = await ref.once('value');
    const order = snapshot.val();
    if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });

    if (action === 'status') {
      const next = Number(st);
      const max = order.mode === 'entrega' ? 2 : 3;
      if (!Number.isInteger(next) || next !== Number(order.st) + 1 || next > max) {
        return res.status(400).json({ error: 'Atualização de status inválida' });
      }
      await ref.update({ st: next });
      return res.status(200).json({ ok: true, st: next });
    }

    if (action === 'paid') {
      await ref.update({ paid: 1, paidAt: Date.now() });
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Ação inválida' });
  } catch (error) {
    return fail(res, error);
  }
};
