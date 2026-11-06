// SauleTrust RE-agent worldwide city resolution proxy.
// Enforces the Nominatim usage policy server-side for ALL clients:
// - serialized requests, minimum 1.1s apart (policy: max 1 req/s)
// - identifying User-Agent (policy requirement)
// - 24h edge caching of results (policy: cache results)
// - remote kill-switch: consults geoconf.json on (nearly) every request, so the
//   service can be switched off or repointed instantly for every client,
//   with no app redeploy and no fail-open fallback.
let last = 0;
let confCache = { t: 0, conf: null };
async function getConf() {
  if (confCache.conf && Date.now() - confCache.t < 30000) return confCache.conf;
  const r = await fetch('https://raw.githubusercontent.com/sweet-little-adder/hk-building-detective/main/geoconf.json', { cache: 'no-store' });
  if (!r.ok) throw new Error('conf ' + r.status);
  const conf = await r.json();
  confCache = { t: Date.now(), conf };
  return conf;
}
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  let conf;
  try { conf = await getConf(); }
  catch (e) { res.status(503).json({ error: 'geocoder configuration unavailable' }); return; }
  if (!conf || conf.enabled === false || typeof conf.endpoint !== 'string' || !conf.endpoint) {
    res.status(503).json({ error: 'worldwide city search is switched off' }); return;
  }
  const q = String((req.query && req.query.q) || '').slice(0, 120).trim();
  if (!q) { res.status(400).json({ error: 'q required' }); return; }
  const now = Date.now();
  const next = Math.max(now, last + 1100);
  if (next - now > 8000) { res.status(429).json({ error: 'busy, retry shortly' }); return; }
  last = next;
  await new Promise(r => setTimeout(r, next - now));
  try {
    const u = conf.endpoint + '?format=jsonv2&limit=1&featureType=city&q=' + encodeURIComponent(q);
    const up = await fetch(u, { headers: { 'User-Agent': 'SauleTrust-RE-agent/1.0 (https://hk-building-detective.vercel.app)' } });
    if (!up.ok) throw new Error('upstream ' + up.status);
    const data = await up.json();
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    res.status(200).json(data);
  } catch (e) {
    res.status(502).json({ error: 'geocoder upstream failed' });
  }
};
