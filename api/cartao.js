// Cobra cartão (crédito ou débito) com o token gerado pelo Mercado Pago no navegador.
// Os dados do cartão NUNCA passam pelo nosso servidor: só o token.
const { db, mp, base, bad, loadOrder, amount, fail } = require('./_lib');

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).end();
    if (process.env.MP_LIVE_MODE !== 'true') {
      throw Object.assign(
        new Error('Cartão do Mercado Pago desativado até a configuração de credenciais de produção.'),
        { status: 503 }
      );
    }
    const b = req.body || {};
    if (!b.token || !b.payment_method_id) throw bad('Dados do cartão ausentes');
    const { order, products } = await loadOrder(b.orderId);
    if (order.paid) return res.json({ status: 'approved' });
    const total = amount(order, products);
    const installments = order.pay === 'debito' ? 1 : Math.max(1, Math.min(3, parseInt(b.installments) || 1));
    const p = await mp('/v1/payments', {
      method: 'POST',
      headers: { 'X-Idempotency-Key': 'card-' + b.orderId + '-' + String(b.token).slice(-10) },
      body: JSON.stringify({
        transaction_amount: total,
        token: b.token,
        description: 'Pedido ' + b.orderId.slice(0, 5).toUpperCase() + ' - Maná Fit House',
        installments,
        payment_method_id: b.payment_method_id,
        issuer_id: b.issuer_id,
        payer: { email: b.payer && b.payer.email, identification: b.payer && b.payer.identification },
        external_reference: b.orderId,
        notification_url: base(req) + '/api/webhook',
      }),
    });
    if (p.status === 'approved') {
      await db().ref('orders/' + b.orderId).update({ paid: 1, paidAt: Date.now(), mpid: String(p.id), total });
    }
    else if (p.status === 'in_process' || p.status === 'pending') {
      await db().ref('orders/' + b.orderId).update({ mpid: String(p.id) }); // permite cancelar depois
    }
    res.json({ status: p.status, detail: p.status_detail });
  } catch (e) { fail(res, e); }
};
