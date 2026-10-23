// MemoryOrb tracking endpoint (Vercel serverless function, Node 18+).
//
// POST /api/track   { "trackingNumber": "LP123..." }                      -> status by tracking number (Track123)
// POST /api/track   { "order": "#1001", "contact": "mail@or.phone" }      -> looks the order up in Shopify first (optional)
//
// Environment variables (Vercel -> Project -> Settings -> Environment Variables). NEVER put these in code or send them to anyone:
//   TRACK123_API_SECRET        required   key from Track123 -> Developers -> API
//   SHOPIFY_STORE_DOMAIN       optional   e.g. your-store.myshopify.com        (only for order-number lookup)
//   SHOPIFY_ADMIN_TOKEN        optional   Admin API access token, scope read_orders (only for order-number lookup)
//   TRACK_DEBUG                optional   set to "1" to allow ?debug=1 (returns the raw Track123 answer, for setup only)

const TRACK123 = 'https://api.track123.com/gateway/open-api';
const SHOPIFY_API_VERSION = '2025-01';

// -------- tiny in-memory rate limit (per instance) --------
const hits = new Map();
function limited(ip) {
  const now = Date.now(), win = 60 * 1000, max = 20;
  const arr = (hits.get(ip) || []).filter((t) => now - t < win);
  arr.push(now); hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > max;
}

const STATUS = {
  INIT: { text: 'Order registered', step: 0 },
  NO_RECORD: { text: 'Waiting for the carrier', step: 0 },
  INFO_RECEIVED: { text: 'Shipping label created', step: 1 },
  IN_TRANSIT: { text: 'On its way', step: 2 },
  WAITING_DELIVERY: { text: 'Out for delivery or ready for pickup', step: 3 },
  DELIVERY_FAILED: { text: 'Delivery attempt failed', step: 3, issue: true },
  ABNORMAL: { text: 'There is an issue with the parcel', step: 2, issue: true },
  DELIVERED: { text: 'Delivered', step: 4 },
  EXPIRED: { text: 'No updates for a long time', step: 2, issue: true },
};

// -------- tolerant reading of the Track123 answer (the exact schema is not confirmed, so we search for known fields) --------
function walk(node, fn, depth = 0) {
  if (!node || depth > 8) return;
  if (Array.isArray(node)) { node.forEach((n) => walk(n, fn, depth + 1)); return; }
  if (typeof node === 'object') { fn(node); Object.values(node).forEach((n) => walk(n, fn, depth + 1)); }
}
const TIME_KEYS = ['eventTime', 'checkpointTime', 'time', 'date', 'dateTime', 'occurTime', 'updateTime'];
const TEXT_KEYS = ['eventDetail', 'description', 'detail', 'message', 'statusDescription', 'checkpointStatusDesc', 'trackingDetail', 'event'];
function pick(o, keys) { for (const k of keys) if (o && o[k] != null && o[k] !== '') return o[k]; return ''; }

function normalize(body, trackNo) {
  let status = '', node = null;
  walk(body, (o) => {
    if (node) return;
    const no = o.trackNo || o.trackingNo || o.trackingNumber;
    if (no && String(no).toLowerCase() === String(trackNo).toLowerCase()) node = o;
  });
  if (!node) walk(body, (o) => { if (!node && (o.transitStatus || o.trackingStatus)) node = o; });
  if (!node) return null;
  status = String(node.transitStatus || '').toUpperCase();
  const events = [];
  walk(node, (o) => {
    const when = pick(o, TIME_KEYS), text = pick(o, TEXT_KEYS);
    if (when && text && typeof text === 'string') {
      const where = typeof o.address === 'string' ? o.address : (o.location || o.city || '');
      events.push({ when: String(when), text: String(text).slice(0, 300), where: String(where || '').slice(0, 120) });
    }
  });
  const seen = new Set();
  const uniq = events.filter((e) => { const k = e.when + e.text; if (seen.has(k)) return false; seen.add(k); return true; });
  uniq.sort((a, b) => (Date.parse(b.when) || 0) - (Date.parse(a.when) || 0));
  const meta = STATUS[status] || { text: status ? status.replace(/_/g, ' ').toLowerCase() : 'Waiting for the carrier', step: 0 };
  return { status, text: meta.text, step: meta.step, issue: !!meta.issue, events: uniq.slice(0, 30), carrier: String(node.courierName || node.courierCode || node.carrier || '') };
}

async function track123(path, payload) {
  const r = await fetch(TRACK123 + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Track123-Api-Secret': process.env.TRACK123_API_SECRET },
    body: JSON.stringify(payload),
  });
  let json = null; try { json = await r.json(); } catch (e) {}
  return { ok: r.ok, status: r.status, json };
}

// -------- optional: order number + email/phone -> tracking numbers (Shopify Admin GraphQL) --------
async function trackingFromOrder(orderName, contact) {
  const dom = process.env.SHOPIFY_STORE_DOMAIN, tok = process.env.SHOPIFY_ADMIN_TOKEN;
  if (!dom || !tok) return { error: 'order_lookup_disabled' };
  const name = String(orderName).trim().replace(/^#?/, '#');
  const q = `query($q:String!){orders(first:1,query:$q){nodes{name email phone displayFulfillmentStatus fulfillments{trackingInfo{number company}}}}}`;
  const r = await fetch(`https://${dom}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': tok },
    body: JSON.stringify({ query: q, variables: { q: `name:${name}` } }),
  });
  const j = await r.json().catch(() => null);
  const o = j && j.data && j.data.orders && j.data.orders.nodes && j.data.orders.nodes[0];
  if (!o) return { error: 'not_found' };
  const c = String(contact || '').trim().toLowerCase();
  const digits = (s) => String(s || '').replace(/\D/g, '');
  const okMail = c.includes('@') && o.email && o.email.toLowerCase() === c;
  const okPhone = !c.includes('@') && digits(c).length >= 6 && digits(o.phone).endsWith(digits(c).slice(-9));
  if (!okMail && !okPhone) return { error: 'not_found' }; // same answer as "no such order": do not reveal which orders exist
  const nums = [];
  (o.fulfillments || []).forEach((f) => (f.trackingInfo || []).forEach((t) => { if (t.number) nums.push(t.number); }));
  if (!nums.length) return { error: 'not_shipped_yet', fulfillment: o.displayFulfillmentStatus };
  return { numbers: nums };
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.status(405).json({ error: 'method' }); return; }
  const ip = String((req.headers['x-forwarded-for'] || '').split(',')[0] || req.socket.remoteAddress || 'x');
  if (limited(ip)) { res.status(429).json({ error: 'rate_limited' }); return; }
  if (!process.env.TRACK123_API_SECRET) { res.status(503).json({ error: 'not_configured' }); return; }

  const body = typeof req.body === 'string' ? (() => { try { return JSON.parse(req.body); } catch (e) { return {}; } })() : (req.body || {});
  let numbers = [];
  if (body.trackingNumber) {
    const n = String(body.trackingNumber).trim();
    if (!/^[A-Za-z0-9\-]{6,40}$/.test(n)) { res.status(400).json({ error: 'invalid_number' }); return; }
    numbers = [n];
  } else if (body.order && body.contact) {
    if (String(body.order).length > 30 || String(body.contact).length > 120) { res.status(400).json({ error: 'invalid_input' }); return; }
    const r = await trackingFromOrder(body.order, body.contact);
    if (r.error) { res.status(r.error === 'order_lookup_disabled' ? 501 : 404).json({ error: r.error, fulfillment: r.fulfillment }); return; }
    numbers = r.numbers.slice(0, 3);
  } else { res.status(400).json({ error: 'missing' }); return; }

  try {
    const results = [];
    let lastRaw = null;
    for (const no of numbers) {
      let q = await track123('/tk/v2/track/query', { trackNos: [no] });
      let norm = q.json ? normalize(q.json, no) : null;
      if (!norm || (norm.status === '' && !norm.events.length)) {
        // number not registered yet: register it, then ask again
        await track123('/tk/v2/track/import', [{ trackNo: no }]);
        q = await track123('/tk/v2/track/query', { trackNos: [no] });
        norm = q.json ? normalize(q.json, no) : null;
      }
      lastRaw = q.json;
      results.push(norm ? { trackingNumber: no, ...norm } : { trackingNumber: no, status: '', text: 'Waiting for the carrier', step: 0, issue: false, events: [], carrier: '' });
    }
    const out = { results };
    if (process.env.TRACK_DEBUG === '1' && req.query && req.query.debug === '1') out.raw = lastRaw;
    res.status(200).json(out);
  } catch (e) {
    res.status(502).json({ error: 'upstream' });
  }
};
module.exports._normalize = normalize;
