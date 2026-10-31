// O Mercado Pago avisa aqui quando um pagamento muda. Não confiamos no corpo da
// notificação: consultamos o pagamento direto na API e só então marcamos como pago.
const { db, mp } = require('./_lib');

module.exports = async (req, res) => {
  try {
    const body = req.body || {};
    const q = req.query || {};
    const type = body.type || q.type || q.topic;
    const id = (body.data && body.data.id) || q['data.id'] || q.id;
    if ((type && type !== 'payment') || !id) return res.status(200).end();
    const p = await mp('/v1/payments/' + encodeURIComponent(id));
    const ref = String(p.external_reference || '');
    if (p.status === 'approved' && /^[a-z0-9]{10}$/.test(ref)) {
      const r = db().ref('orders/' + ref);
      const o = (await r.once('value')).val();
      if (o && o.cancelled) {
        // pagamento aprovado depois do cancelamento: avisa o lojista para reembolsar
        await r.update({ paidAfterCancel: 1, mpid: String(p.id) });
      } else if (o && !o.paid) {
        // pagamento que chegou depois do prazo do código (ex.: cliente fechou a página): aceita e avisa o lojista
        const late = !!(o.pixAt && p.payment_method_id === 'pix' && Date.now() > o.pixAt + (Number(process.env.PIX_TTL_SECONDS || 300) + 60) * 1000);
        await r.update({ paid: 1, paidAt: Date.now(), mpid: String(p.id), ...(late ? { late: 1 } : {}) });
      }
    }
    res.status(200).end();
  } catch (e) { console.error(e && (e.body || e.message)); res.status(500).end(); }
};
