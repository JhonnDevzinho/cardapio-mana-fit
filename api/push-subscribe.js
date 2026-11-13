const { db, fail } = require('./_lib');

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
    const { role, deviceId, subscription } = req.body || {};
    if (!['client', 'merchant'].includes(role) || !/^[a-f0-9]{32}$/.test(String(deviceId || ''))) {
      return res.status(400).json({ error: 'Dispositivo inválido' });
    }
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth || !String(subscription.endpoint).startsWith('https://')) {
      return res.status(400).json({ error: 'Inscrição push inválida' });
    }
    const database = db();
    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ error: 'Autenticação necessária' });
    const decoded = await require('firebase-admin').auth().verifyIdToken(token);
    if (role === 'merchant') {
      const merchantEmail = String(process.env.MERCHANT_EMAIL || '').trim().toLowerCase();
      if (!merchantEmail || String(decoded.email || '').toLowerCase() !== merchantEmail) {
        return res.status(403).json({ error: 'Acesso restrito ao lojista' });
      }
    }
    await database.ref(`push/${role}/${deviceId}`).set({ subscription, updatedAt: Date.now() });
    return res.status(200).json({ ok: true });
  } catch (error) {
    if (error.code === 'auth/argument-error' || error.code === 'auth/id-token-expired' || error.code === 'auth/invalid-id-token') {
      return res.status(401).json({ error: 'Sessão do lojista expirada. Entre novamente.' });
    }
    return fail(res, error);
  }
};
