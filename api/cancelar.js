// Cancela um pedido ainda NÃO pago (e ainda não em preparo), invalidando cobranças pendentes.
const { db, mp, bad, fail } = require('./_lib');

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).end();
    const { orderId } = req.body || {};
    if (!/^[a-z0-9]{10}$/.test(String(orderId))) throw bad('Pedido inválido');
    const ref = db().ref('orders/' + orderId);
    const order = (await ref.once('value')).val();
    if (!order) throw bad('Pedido não encontrado');
    if (order.paid) return res.json({ paid: true });
    if (order.cancelled) return res.json({ cancelled: true });
    if ((order.st || 0) > 0) throw bad('O pedido já está em preparo e não pode ser cancelado aqui. Fale com a loja.');
    if (order.mpid) {
      const p = await mp('/v1/payments/' + order.mpid);
      if (p.status === 'approved') {
        await ref.update({ paid: 1, paidAt: Date.now() });
        return res.json({ paid: true });
      }
      if (p.status === 'pending' || p.status === 'in_process') {
        await mp('/v1/payments/' + order.mpid, { method: 'PUT', body: JSON.stringify({ status: 'cancelled' }) });
      }
    }
    await ref.update({ cancelled: 1, cancelledAt: Date.now() });
    res.json({ cancelled: true });
  } catch (e) { fail(res, e); }
};
