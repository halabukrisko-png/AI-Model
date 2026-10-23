// MemoryOrb contact form -> e-mail via Resend (Vercel serverless function).
// Environment variables (Vercel -> Settings -> Environment Variables), never put them in code:
//   RESEND_API_KEY, CONTACT_TO (where messages arrive), CONTACT_FROM (e.g. support@memoryorb-shop.store)
const hits = new Map();
function limited(ip) {
  const now = Date.now(), arr = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  arr.push(now); hits.set(ip, arr); if (hits.size > 5000) hits.clear();
  return arr.length > 5;
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.status(405).json({ error: 'method' }); return; }
  const body = typeof req.body === 'string' ? (() => { try { return JSON.parse(req.body); } catch (e) { return {}; } })() : (req.body || {});
  if (body.website) { res.status(200).json({ ok: true }); return; } // honeypot: bots fill this hidden field
  const ip = String((req.headers['x-forwarded-for'] || '').split(',')[0] || req.socket.remoteAddress || 'x');
  if (limited(ip)) { res.status(429).json({ error: 'rate_limited' }); return; }
  const { RESEND_API_KEY, CONTACT_TO, CONTACT_FROM } = process.env;
  if (!RESEND_API_KEY || !CONTACT_TO || !CONTACT_FROM) { res.status(503).json({ error: 'not_configured' }); return; }

  const name = String(body.name || '').trim().slice(0, 100);
  const email = String(body.email || '').trim().slice(0, 200);
  const phone = String(body.phone || '').trim().slice(0, 50);
  const message = String(body.message || '').trim().slice(0, 4000);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 3) { res.status(400).json({ error: 'invalid' }); return; }

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'MemoryOrb Contact <' + CONTACT_FROM.replace(/^.*<|>.*$/g, '') + '>',
        to: CONTACT_TO.split(',').map((x) => x.trim()).filter(Boolean),
        reply_to: email,
        subject: 'New message from ' + name.replace(/[\r\n]/g, ' '),
        html: '<p><b>Name:</b> ' + esc(name) + '<br><b>Email:</b> ' + esc(email) + '<br><b>Phone:</b> ' + esc(phone || '-') + '</p><p>' + esc(message) + '</p>',
        text: 'Name: ' + name + '\nEmail: ' + email + '\nPhone: ' + (phone || '-') + '\n\n' + message,
      }),
    });
    if (!r.ok) { res.status(502).json({ error: 'upstream' }); return; }
    res.status(200).json({ ok: true });
  } catch (e) { res.status(502).json({ error: 'upstream' }); }
};
