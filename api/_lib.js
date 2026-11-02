// Funções compartilhadas das rotas de pagamento (Vercel Serverless Functions).
const admin = require('firebase-admin');

const bad = (m) => Object.assign(new Error(m), { status: 400 });
const FEE = Number(process.env.DELIVERY_FEE || 6);

function db() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  }
  return admin.database();
}

async function mp(path, opt = {}) {
  console.log('Token disponível:', Boolean(process.env.MP_ACCESS_TOKEN));
  console.log('Tamanho do token:', process.env.MP_ACCESS_TOKEN?.length || 0);

  const r = await fetch('https://api.mercadopago.com' + path, {
    ...opt,
    headers: { Authorization: 'Bearer ' + process.env.MP_ACCESS_TOKEN, 'Content-Type': 'application/json', ...(opt.headers || {}) },
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(j.message || 'Erro no Mercado Pago'), { status: r.status, body: j });
  return j;
}

const base = (req) => process.env.SITE_URL || 'https://' + req.headers.host;

async function loadOrder(id) {
  if (!/^[a-z0-9]{10}$/.test(String(id))) throw bad('Pedido inválido');
  const d = db();
  const [o, m] = await Promise.all([d.ref('orders/' + id).once('value'), d.ref('config/products').once('value')]);
  const order = o.val();
  if (!order) throw bad('Pedido não encontrado');
  if (order.cancelled) throw bad('Pedido cancelado');
  return { order, products: m.val() || [] };
}

// O valor cobrado é SEMPRE recalculado aqui, com os preços do cardápio salvos no Firebase.
function amount(order, products) {
  const list = Array.isArray(products) ? products : Object.values(products || {});
  const by = {};
  list.forEach((p) => p && (by[p.id] = p));
  let cents = 0;
  const items = Array.isArray(order.items) ? order.items : Object.values(order.items || {});
  if (!items.length) throw bad('Pedido sem itens');
  for (const it of items) {
    const p = by[it.pid];
    if (!p) throw bad('Item inválido');
    const q = Math.max(1, Math.min(99, parseInt(it.q) || 1));
    let unit;
    if (p.opts && Object.keys(p.opts).length) {
      unit = 0;
      const sel = it.sel || {};
      for (const k of Object.keys(sel)) {
        const n = parseInt(sel[k]) || 0;
        if (n < 0) throw bad('Opção inválida');
        if (!n) continue;
        const op = p.opts[k];
        if (!op) throw bad('Opção inválida');
        unit += Math.round(Number(op.p) * 100) * n;
      }
      if (!unit) throw bad('Item sem opção escolhida');
    } else {
      unit = Math.round(Number(p.price) * 100);
    }
    cents += unit * q;
  }
  const fee = order.mode === 'retirada' ? 0 : FEE; // retirada no local não paga entrega
  return (cents + Math.round(fee * 100)) / 100;
}

function fail(res, e) {
  console.error(e && (e.body || e.message));
  res.status(e && e.status && e.status < 500 ? 400 : 500).json({ error: e.message || 'Erro' });
}

module.exports = { db, mp, base, bad, loadOrder, amount, fail };
