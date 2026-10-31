const crypto = require('crypto');
const { db, mp } = require('./_lib');

module.exports = async (req, res) => {
  try {
    const secret = process.env.MP_WEBHOOK_SECRET;

    if (!secret) {
      console.error('MP_WEBHOOK_SECRET não configurado.');
      return res.status(500).end();
    }

    const body = req.body || {};
    const query = req.query || {};

    const dataId = String(query['data.id'] || '').toLowerCase();
    const requestId = req.headers['x-request-id'];
    const signature = req.headers['x-signature'];

    if (!dataId || !requestId || !signature) {
      return res.status(401).end();
    }

    const parts = Object.fromEntries(
      signature.split(',').map(part => {
        const [key, value] = part.trim().split('=');
        return [key, value];
      })
    );

    const ts = parts.ts;
    const v1 = parts.v1;

    if (!ts || !v1 || !/^[a-f0-9]{64}$/i.test(v1)) {
      return res.status(401).end();
    }

    const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;

    const expected = crypto
      .createHmac('sha256', secret)
      .update(manifest)
      .digest('hex');

    const expectedBuffer = Buffer.from(expected, 'hex');
    const receivedBuffer = Buffer.from(v1, 'hex');

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return res.status(401).end();
    }

    const id = body.data?.id || query['data.id'] || query.id;
    const type = body.type || query.type || query.topic;

    if ((type && type !== 'payment') || !id) {
      return res.status(200).end();
    }

    const payment = await mp(
      '/v1/payments/' + encodeURIComponent(id)
    );

    const ref = String(payment.external_reference || '');

    if (
      payment.status === 'approved' &&
      /^[a-z0-9]{10}$/.test(ref)
    ) {
      const orderRef = db().ref('orders/' + ref);
      const order = (await orderRef.once('value')).val();

      if (order && order.cancelled) {
        await orderRef.update({
          paidAfterCancel: 1,
          mpid: String(payment.id)
        });
      } else if (order && !order.paid) {
        const late = !!(
          order.pixAt &&
          payment.payment_method_id === 'pix' &&
          Date.now() >
            order.pixAt +
            (Number(process.env.PIX_TTL_SECONDS || 300) + 60) * 1000
        );

        await orderRef.update({
          paid: 1,
          paidAt: Date.now(),
          mpid: String(payment.id),
          ...(late ? { late: 1 } : {})
        });
      }
    }

    return res.status(200).end();

  } catch (error) {
    console.error(error && (error.body || error.message));
    return res.status(500).end();
  }
};