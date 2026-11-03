// Gera o Pix (QR Code + copia e cola), invalida o código anterior e expira em 5 minutos.
// O Mercado Pago só permite expiração a partir de 30 min, então os 5 min são aplicados aqui:
// o site esconde o código e esta rota CANCELA a cobrança pendente (ao expirar e ao gerar outro).
const { db, mp, base, bad, loadOrder, amount, fail } = require('./_lib');

const TTL = Number(process.env.PIX_TTL_SECONDS || 300);
// limite de segurança do próprio Mercado Pago: 30 min (horário de Brasília, -03:00)
const exp30 = () => new Date(Date.now() + 30 * 60 * 1000 - 3 * 3600 * 1000).toISOString().replace('Z', '-03:00');

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).end();
    if (process.env.MP_LIVE_MODE !== 'true') {
      throw Object.assign(
        new Error('Pix do Mercado Pago desativado até a configuração de credenciais de produção.'),
        { status: 503 }
      );
    }
    const { orderId, renew, action } = req.body || {};
    const { order, products } = await loadOrder(orderId);
    if (order.paid) return res.json({ paid: true });
    const ref = db().ref('orders/' + orderId);

    // mesma chamada repetida dentro do prazo: devolve o mesmo código
    const age = Date.now() - (order.pixAt || 0);
    if (action !== 'expire' && !renew && order.mpid && order.pix && age < TTL * 1000) {
      return res.json({ qr_code: order.pix, total: order.total, ttl: Math.max(1, Math.ceil((TTL * 1000 - age) / 1000)) });
    }

    // invalida o código anterior (se já foi pago nesse meio tempo, só confirma)
    if (order.mpid) {
      const old = await mp('/v1/payments/' + order.mpid);
      if (old.status === 'approved') {
        await ref.update({ paid: 1, paidAt: Date.now() });
        return res.json({ paid: true });
      }
      if (old.status === 'pending' || old.status === 'in_process') {
        await mp('/v1/payments/' + order.mpid, { method: 'PUT', body: JSON.stringify({ status: 'cancelled' }) });
      }
    }
    if (action === 'expire') return res.json({ expired: true });

    const n = (order.pixN || 0) + 1;
    if (n > 10) throw bad('Muitos códigos gerados. Fale com a loja.');
    const total = amount(order, products);
    const p = await mp('/v1/payments', {
      method: 'POST',
      headers: { 'X-Idempotency-Key': 'pix-' + orderId + '-' + n },
      body: JSON.stringify({
        transaction_amount: total,
        description: 'Pedido ' + orderId.slice(0, 5).toUpperCase() + ' - Maná Fit House',
        payment_method_id: 'pix',
        date_of_expiration: exp30(),
        external_reference: orderId,
        notification_url: base(req) + '/api/webhook',
        payer: { email: `pedido-${orderId}@manafithouse.com.br`, first_name: String(order.name || 'Cliente').split(' ')[0] },
      }),
    });
    const t = p.point_of_interaction.transaction_data;
    await ref.update({ pix: t.qr_code, mpid: String(p.id), total, pixAt: Date.now(), pixN: n });
    res.json({ qr_code: t.qr_code, qr_base64: t.qr_code_base64, total, ttl: TTL });
  } catch (e) { fail(res, e); }
};
