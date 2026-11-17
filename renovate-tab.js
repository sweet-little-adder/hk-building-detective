/* Renovate tab for RE-agent: injects a RENOVATE tab after Compare.
 *
 * Renovation journey: found a place (Buy/Rent) -> keep a private renovation
 * brief on this device -> compare the quotations firms give you
 * -> regional tools where wired (Hong Kong today).
 *
 * Data policy (same as the rest of the app): no invented figures, no
 * partners, no referrals. Section 03 is a static reference list of firms'
 * own official websites (public facts checked 2026-11-17, source: SAU-58):
 * links out only, SauleTrust does not contact firms or pass anything on. Briefs and quotations are entered by
 * the user and stored on this device only - nothing is sent anywhere, now
 * or later. Third-party cost
 * figures are linked, not reproduced (Designpedia's terms allow personal use
 * of their information only, so their calculator is linked, never bundled).
 * Regional coverage is stated plainly; where nothing is wired the tab says
 * so instead of inventing data.
 */
(function () {
  var tabs = document.querySelector('.tabs'), buy = document.querySelector('#tabBuy'),
      sell = document.querySelector('#tabSell'), sv = document.querySelector('#sellView'),
      bv = document.querySelector('#buyView'), h1 = document.querySelector('h1');
  if (!tabs || !buy || !sell || !sv || !bv) return;
  if (document.querySelector('#tabReno')) return;
  var lang = (document.documentElement.lang || 'en').slice(0, 2);

  var L = { en: 'RENOVATE', fr: 'RÉNOVER', de: 'RENOVIEREN', nl: 'RENOVEREN', pl: 'REMONT' };
  var HT = {
    en: 'Plan the renovation.',
    fr: 'Planifiez la rénovation.',
    de: 'Die Renovierung planen.',
    nl: 'Plan de renovatie.',
    pl: 'Zaplanuj remont.'
  };
  var NOTE = { fr: 'Page en anglais.', de: 'Inhalt auf Englisch.', nl: 'Inhoud in het Engels.', pl: 'Treść po angielsku.' };

  var st = document.createElement('style');
  st.textContent = '#renoView{display:none}' +
    '#renoView .rnmore{margin-top:14px;border-top:1px solid #6b5546;padding-top:4px}' +
    '#renoView .rnmore summary{cursor:pointer;list-style:none;font-size:13px;color:#dcc9ad;padding:12px 0;min-height:44px}' +
    '#renoView .rnmore summary::-webkit-details-marker{display:none}' +
    '#renoView .rnmore summary:before{content:"+ "}#renoView .rnmore[open] summary:before{content:"\\2212 "}' +
    '#renoView .rnlab{display:block;font-size:11px;letter-spacing:.04em;color:#bda990;margin:12px 0 2px}' +
    '#renoView .rnrow{display:flex;justify-content:space-between;align-items:baseline;gap:14px;border-bottom:1px solid #66503f;padding:11px 2px;font-size:13px;color:#d3bfa2}' +
    '#renoView .rnrow:last-child{border-bottom:0}' +
    '#renoView .rnrow b{color:#f1e3c6}' +
    '#renoView .rnrow .rnamt{font-family:Georgia,serif;font-size:16px;color:#f8efdc;white-space:nowrap}' +
    '#renoView .rnrow .rnsub{display:block;font-size:11px;color:#bda990;margin-top:2px}' +
    '#renoView .rnrow button{background:none;border:0;color:#bda990;font-size:15px;padding:0 2px;min-width:0;min-height:0}' +
    '#renoView .rnrow button:hover{color:#f8efdc}';
  document.head.appendChild(st);

  // --- Tab button, after COMPARE ---------------------------------------------
  var reno = document.createElement('button');
  reno.id = 'tabReno'; reno.type = 'button'; reno.textContent = L[lang] || L.en;
  tabs.appendChild(reno);

  // --- Renovate view -----------------------------------------------------------
  var v = document.createElement('div');
  v.id = 'renoView';
  v.innerHTML =
    '<section><p class="label">01 / Your renovation brief</p>' +
    '<div class="finding"><p>SauleTrust doesn\'t refer, vet or endorse any firm. This brief is a private planning note: it stays on this device and is never sent anywhere by us. You can copy it into a firm\'s own contact form yourself (section 03).</p></div>' +
    '<form id="addbrief" autocomplete="off" style="margin-top:8px">' +
    '<label class="rnlab" for="brLoc">Where is the property?</label><input id="brLoc" maxlength="80" placeholder="e.g. Paris 16e, London, Hong Kong">' +
    '<label class="rnlab">What do you need?</label><div class="chips" id="brNeed">' +
    '<button type="button" data-need="Construction">Construction</button>' +
    '<button type="button" data-need="Interior design">Interior design</button>' +
    '<button type="button" data-need="Both">Both</button></div>' +
    '<label class="rnlab" for="brNote">Scope (optional)</label><input id="brNote" maxlength="160" placeholder="e.g. 900 sq ft flat, two bathrooms and kitchen, keep flooring">' +
    '<div class="controls" style="justify-content:flex-start"><button type="submit">Save brief →</button></div></form>' +
    '<div id="briefList" style="margin-top:6px"></div></section>' +
    '<section><p class="label" style="margin-top:26px">02 / Quotations - your figures</p>' +
    '<div class="finding"><p>Comparing quotations only works when the scope matches. Add each firm\'s figure as you receive it; what you leave blank stays unknown. Entries stay on this device.</p></div>' +
    '<form id="addquote" autocomplete="off" style="margin-top:8px">' +
    '<div style="display:flex;gap:18px;flex-wrap:wrap"><span style="flex:2;min-width:160px"><label class="rnlab" for="qFirm">Firm</label><input id="qFirm" maxlength="80" placeholder="e.g. the contractor who visited Tuesday"></span>' +
    '<span style="flex:1;min-width:120px"><label class="rnlab" for="qPrice">Price - blank if unknown</label><input id="qPrice" inputmode="decimal" maxlength="14" placeholder="e.g. 420000"></span>' +
    '<span><label class="rnlab" for="qCur">Currency</label><select id="qCur" style="background:#4a3629;color:#f6ead6;border:0;border-bottom:1px solid #836d55;font:inherit;padding:4px 0;width:100%">' +
    '<option>HKD</option><option>EUR</option><option>GBP</option><option>USD</option><option>Other</option></select></span></div>' +
    '<label class="rnlab" for="qScope">What the price includes (optional)</label><input id="qScope" maxlength="160" placeholder="e.g. demolition, plumbing, tiling; excludes appliances">' +
    '<div class="controls" style="justify-content:flex-start"><button type="submit">Add quotation →</button></div></form>' +
    '<div id="quoteList" style="margin-top:6px"></div></section>' +
    '<section><p class="label" style="margin-top:26px">03 / Firms to contact yourself - Europe</p>' +
    '<div class="finding"><p>A reference list of 21 firms and the websites they publish themselves. Not partners, not vetted, not recommendations: SauleTrust does not contact them or pass your brief on. Open a firm\'s own site to reach them. Facts checked 17 Nov 2026.</p></div>' +
    '<div class="chips" id="fmCity" style="margin-top:8px"></div>' +
    '<div class="chips" id="fmKind" style="margin-top:4px"><button type="button" data-k="">All</button><button type="button" data-k="build">Builders</button><button type="button" data-k="design">Interior design</button></div>' +
    '<div class="controls" style="justify-content:flex-start"><button type="button" id="fmCopy" style="background:transparent;color:#f1e3c6;border:1px solid #f1e3c6">Copy my latest brief</button><span id="fmMsg" class="asm" style="margin-left:10px" role="status"></span></div>' +
    '<div id="fmList" style="margin-top:6px"></div></section>' +
    '<section><p class="label" style="margin-top:26px">04 / Regional tools</p>' +
    '<div class="finding"><p>Cost tools and public registers are wired for Hong Kong only. Elsewhere none are wired yet, rather than invented.</p></div>' +
    '<details class="rnmore"><summary>Hong Kong</summary>' +
    '<ul style="margin-top:8px">' +
    '<li><a href="https://designpedia.com.hk/latest_article/renovation-cost-hong-kong/" target="_blank" rel="noopener">Renovation budget ranges ↗</a> - Designpedia\'s planning bands and calculator, on their site (their figures, linked not reproduced)</li>' +
    '<li><a href="https://www.bd.gov.hk/en/resources/online-tools/registers-search/registrationsearch.html?reg_type=GBC" target="_blank" rel="noopener">Registered general building contractors ↗</a> - Buildings Department register search</li>' +
    '<li><a href="https://www.bd.gov.hk/en/resources/online-tools/registers-search/registrationsearch.html" target="_blank" rel="noopener">All BD registers ↗</a> - minor works, specialist contractors, authorized persons</li>' +
    '</ul>' +
    '<p style="margin-top:8px">Government registers, not our partners - we don\'t list, vet or endorse any firm. Interior designers carry no statutory licence in Hong Kong; check a contractor\'s registration before structural work.</p></details></section>';
  sv.parentNode.insertBefore(v, sv.nextSibling);
  if (NOTE[lang]) { var np = document.createElement('p'); np.className = 'asm'; np.style.marginTop = '10px'; np.textContent = NOTE[lang]; v.querySelector('section').appendChild(np); }

  // --- Sources & credits line ---------------------------------------------------
  var scf = document.querySelector('#sourcesCredits footer');
  if (scf && !scf.querySelector('.renosrc')) {
    var sp = document.createElement('p'); sp.className = 'renosrc';
    sp.innerHTML = 'Renovate: HK budget figures are linked, not reproduced - <a href="https://designpedia.com.hk/latest_article/renovation-cost-hong-kong/">Designpedia</a> renovation planning bands live on their site (their terms: personal use only); contractor routes = HK Buildings Department public registers (<a href="https://www.bd.gov.hk/en/resources/online-tools/registers-search/registrationsearch.html">bd.gov.hk</a>) - government registers, not SauleTrust partners. Briefs and quotations you enter stay on this device. Not legal, surveying or investment advice.';
    scf.appendChild(sp);
  }

  // --- On-device storage -----------------------------------------------------------
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function load(k) { try { var a = JSON.parse(localStorage.getItem(k) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function save(k, a) { try { localStorage.setItem(k, JSON.stringify(a)); } catch (e) { } }
  var BK = 'st-reno-briefs', QK = 'st-reno-quotes';
  var briefs = load(BK), quotes = load(QK), need = '';

  // --- Reference firms (official websites; links out only) ---------------------------
  var FIRMS = [{"n":"Kelly Hoppen Interiors","c":"London","k":"United Kingdom","t":"design","w":"https://kellyhoppeninteriors.com","m":"info@kellyhoppen.co.uk","d":"Luxury interior design studio, 45+ years, residential/commercial/maritime couture projects worldwide."},{"n":"David Collins Studio","c":"London","k":"United Kingdom","t":"design","w":"https://www.davidcollins.studio","m":"","d":"Interior architecture, design and product practice for luxury hospitality, residential and retail since 1985."},{"n":"1508 London","c":"London","k":"United Kingdom","t":"design","w":"https://1508london.com","m":"info@1508london.com","d":"International interior design and architecture firm (est. 2010) for private residential, developments, hospitality and superyachts."},{"n":"Studio Ashby","c":"London","k":"United Kingdom","t":"design","w":"https://www.studioashby.com","m":"","d":"Interior design studio founded 2014 by Sophie Ashby; homes, boutique hotels; portfolio incl. London, New York, Hong Kong, South Africa."},{"n":"Winch Design","c":"London","k":"United Kingdom","t":"design","w":"https://www.winchdesign.com","m":"info@winchdesign.com","d":"Bespoke design and architectural studio for homes, yachts, private jets and helicopters, global clientele."},{"n":"Taylor Howes","c":"London","k":"United Kingdom","t":"design","w":"https://www.taylorhowes.co.uk","m":"","d":"Luxury interior design studio, London; International Interior Designer of the Year 2023 (Design et al)."},{"n":"Finchatton","c":"London","k":"United Kingdom","t":"design","w":"https://www.finchatton.com","m":"info@finchatton.com","d":"Design-led luxury residential developer; head office 72 Royal Hospital Road, London SW3."},{"n":"Liaigre (Studio Liaigre)","c":"Paris","k":"France","t":"design","w":"https://www.studioliaigre.com","m":"","d":"Paris-based maison for interior architecture, furniture and lighting; ~30-person design team; global showroom network."},{"n":"Pierre Yovanovitch","c":"Paris","k":"France","t":"design","w":"https://www.pierreyovanovitch.com","m":"","d":"Interior architect with made-to-measure haute-couture approach; furniture brand launched 2021; artisans in France and Switzerland."},{"n":"Joseph Dirand Architecture","c":"Paris","k":"France","t":"design","w":"https://www.josephdirand.com","m":"","d":"French architect and interior designer based in Paris; projects across Paris, New York, Miami, London, Tokyo."},{"n":"PINTO (Alberto Pinto)","c":"Paris","k":"France","t":"design","w":"https://www.albertopinto.com","m":"","d":"Paris luxury interior design house founded by Alberto Pinto; collaborations under PINTO X."},{"n":"India Mahdavi","c":"Paris","k":"France","t":"design","w":"https://india-mahdavi.com","m":"","d":"Paris studio; residential, hospitality, retail and cultural projects worldwide (Sketch London, Laduree, Villa Medici)."},{"n":"Gilles & Boissier","c":"Paris","k":"France","t":"design","w":"https://www.gillesetboissier.com","m":"","d":"Paris interior architecture agency (20+ years); ultra-luxury residences, hospitality, yachting, 250+ Moncler boutiques."},{"n":"Tristan Auer","c":"Paris","k":"France","t":"design","w":"https://www.tristanauer.com","m":"contact@tristanauer.com","d":"Paris interior designer; studio at 1 rue Ambroise Thomas, 75009 Paris."},{"n":"Patricia Urquiola","c":"Milan","k":"Italy","t":"design","w":"https://www.patriciaurquiola.com","m":"","d":"Milan studio (Patricia Urquiola S.p.A. architecture / Design S.r.l. product), via Bartolomeo Eustachi 45, Milan."},{"n":"Dimorestudio","c":"Milan","k":"Italy","t":"design","w":"https://www.dimorestudio.eu","m":"","d":"Full-service architectural and design studio established Milan 2003 by Britt Moran and Emiliano Salci."},{"n":"Vudafieri Saverino Partners","c":"Milan","k":"Italy","t":"design","w":"https://vudafierisaverino.it","m":"info@vudafierisaverino.it","d":"Architecture studio established Milan 1999, led by Tiziano Vudafieri and Claudio Saverino; Milan and Shanghai."},{"n":"Studio Matteo Nunziati","c":"Milan","k":"Italy","t":"design","w":"https://matteonunziati.com","m":"info@matteonunziati.com","d":"Milan studio founded 2000; international high-end residential, hospitality and large-scale developments."},{"n":"Humbert & Poyet","c":"Monaco","k":"Monaco","t":"design","w":"https://www.humbertpoyet.com","m":"info@humbertpoyet.com","d":"Monaco-headquartered interior architecture agency (founded 2007/2008), AD100-listed; Beefbar, Mandarin Oriental Vienna."},{"n":"J.B. Pastor & Fils","c":"Monaco","k":"Monaco","t":"build","w":"https://jbpastoretfils.mc","m":"","d":"Monaco construction group (100+ years, 975 staff); 100+ luxury developments in the Principality; Villa Clotilde, 46 bd du Jardin Exotique."},{"n":"Engeco","c":"Monaco","k":"Monaco","t":"build","w":"https://engeco.mc","m":"","d":"Monaco builder founded 1984, high-end buildings and civil engineering; Athos Palace, 2 rue de la Lujerneta, Monaco."}];
  var fmCity = '', fmKind = '';
  var cityBox = v.querySelector('#fmCity'), kindBox = v.querySelector('#fmKind');
  var cities = []; FIRMS.forEach(function (f) { if (cities.indexOf(f.c) < 0) cities.push(f.c); });
  cityBox.innerHTML = '<button type="button" data-c="">All cities</button>' + cities.map(function (c) { return '<button type="button" data-c="' + esc(c) + '">' + esc(c) + '</button>'; }).join('');
  function mark(box, attr, val) {
    box.querySelectorAll('button').forEach(function (b) {
      var on = (b.getAttribute(attr) || '') === val;
      b.style.color = on ? '#fdf6e9' : ''; b.style.borderBottomColor = on ? '#f1e3c6' : '';
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  function renderFirms() {
    mark(cityBox, 'data-c', fmCity); mark(kindBox, 'data-k', fmKind);
    var rows = FIRMS.filter(function (f) { return (!fmCity || f.c === fmCity) && (!fmKind || f.t === fmKind); });
    v.querySelector('#fmList').innerHTML = rows.map(function (f) {
      return '<div class="rnrow"><span><b>' + esc(f.n) + '</b> · ' + esc(f.c) + ', ' + esc(f.k) + ' · ' + (f.t === 'build' ? 'builder' : 'interior design') +
        '<span class="rnsub">' + esc(f.d) + '</span>' +
        '<span class="rnsub"><a href="' + esc(f.w) + '" target="_blank" rel="noopener noreferrer">Official website ↗</a>' +
        (f.m ? ' · published contact: <a href="mailto:' + esc(f.m) + '">' + esc(f.m) + '</a>' : '') + '</span></span></div>';
    }).join('') || '<p class="asm">No firms in this selection.</p>';
  }
  cityBox.onclick = function (e) { var b = e.target.closest('button'); if (!b) return; fmCity = b.getAttribute('data-c') || ''; renderFirms(); };
  kindBox.onclick = function (e) { var b = e.target.closest('button'); if (!b) return; fmKind = b.getAttribute('data-k') || ''; renderFirms(); };
  v.querySelector('#fmCopy').onclick = function () {
    var msg = v.querySelector('#fmMsg'), b = briefs[briefs.length - 1];
    if (!b) { msg.textContent = 'Save a brief in section 01 first.'; return; }
    var t = 'Renovation enquiry - ' + b.need + ' - ' + b.loc + (b.note ? '\n' + b.note : '');
    function ok() { msg.textContent = 'Copied. Paste it into the firm\'s own contact form or email.'; }
    function fail() { msg.textContent = 'Could not copy - select the brief text and copy it manually.'; }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok, fail); else fail();
  };
  renderFirms();

  // --- Briefs ----------------------------------------------------------------------
  var needBox = v.querySelector('#brNeed');
  needBox.querySelectorAll('button').forEach(function (b) {
    b.onclick = function () {
      need = b.dataset.need;
      needBox.querySelectorAll('button').forEach(function (x) { x.style.color = ''; x.style.borderBottomColor = ''; });
      b.style.color = '#fdf6e9'; b.style.borderBottomColor = '#f1e3c6';
    };
  });
  function renderBriefs() {
    var box = v.querySelector('#briefList');
    if (!briefs.length) { box.innerHTML = ''; return; }
    box.innerHTML = briefs.map(function (b, i) {
      return '<div class="rnrow"><span><b>' + esc(b.loc) + '</b> · ' + esc(b.need) +
        (b.note ? '<span class="rnsub">' + esc(b.note) + '</span>' : '') +
        '<span class="rnsub">Saved ' + esc(b.when) + ' - on this device only</span></span>' +
        '<button type="button" data-delb="' + i + '" aria-label="Remove brief">×</button></div>';
    }).join('');
    box.querySelectorAll('[data-delb]').forEach(function (x) {
      x.onclick = function () { briefs.splice(+x.dataset.delb, 1); save(BK, briefs); renderBriefs(); };
    });
  }
  v.querySelector('#addbrief').addEventListener('submit', function (e) {
    e.preventDefault();
    var loc = v.querySelector('#brLoc').value.trim();
    if (!loc) { v.querySelector('#brLoc').focus(); return; }
    if (!need) need = 'Both';
    briefs.push({ loc: loc, need: need, note: v.querySelector('#brNote').value.trim(), when: new Date().toISOString().slice(0, 10) });
    save(BK, briefs);
    v.querySelector('#brLoc').value = ''; v.querySelector('#brNote').value = '';
    needBox.querySelectorAll('button').forEach(function (x) { x.style.color = ''; x.style.borderBottomColor = ''; }); need = '';
    renderBriefs();
  });

  // --- Quotations -------------------------------------------------------------------
  function fmtQ(q) {
    if (!(q.price > 0)) return 'price unknown';
    var sym = { HKD: 'HK$', EUR: '€', GBP: '£', USD: '$' }[q.cur] || (q.cur + ' ');
    return sym + Math.round(q.price).toLocaleString('en-GB');
  }
  function renderQuotes() {
    var box = v.querySelector('#quoteList');
    if (!quotes.length) { box.innerHTML = ''; return; }
    box.innerHTML = quotes.map(function (q, i) {
      return '<div class="rnrow"><span><b>' + esc(q.firm) + '</b>' +
        (q.scope ? '<span class="rnsub">Includes: ' + esc(q.scope) + '</span>' : '') +
        '</span><span style="display:flex;align-items:baseline;gap:12px"><span class="rnamt">' + esc(fmtQ(q)) + '</span>' +
        '<button type="button" data-delq="' + i + '" aria-label="Remove quotation">×</button></span></div>';
    }).join('');
    box.querySelectorAll('[data-delq]').forEach(function (x) {
      x.onclick = function () { quotes.splice(+x.dataset.delq, 1); save(QK, quotes); renderQuotes(); };
    });
  }
  v.querySelector('#addquote').addEventListener('submit', function (e) {
    e.preventDefault();
    var firm = v.querySelector('#qFirm').value.trim();
    if (!firm) { v.querySelector('#qFirm').focus(); return; }
    var price = parseFloat(v.querySelector('#qPrice').value.replace(/[,\s]/g, ''));
    quotes.push({ firm: firm, price: price > 0 ? price : null, cur: v.querySelector('#qCur').value, scope: v.querySelector('#qScope').value.trim() });
    save(QK, quotes);
    v.querySelector('#qFirm').value = ''; v.querySelector('#qPrice').value = ''; v.querySelector('#qScope').value = '';
    renderQuotes();
  });
  renderBriefs(); renderQuotes();

  // --- Tab switching --------------------------------------------------------------
  var rentBtn = document.querySelector('#tabRent'), cmpBtn = document.querySelector('#tabCmp');
  var rv = document.querySelector('#rentView'), cv = document.querySelector('#cmpView');
  function showReno() {
    if (h1) h1.textContent = HT[lang] || HT.en;
    reno.classList.add('on'); buy.classList.remove('on'); sell.classList.remove('on');
    if (rentBtn) rentBtn.classList.remove('on');
    if (cmpBtn) cmpBtn.classList.remove('on');
    bv.style.display = 'none'; sv.style.display = 'none';
    if (rv) rv.style.display = 'none';
    if (cv) cv.style.display = 'none';
    v.style.display = 'block';
  }
  function hideReno() { reno.classList.remove('on'); v.style.display = 'none'; }
  reno.addEventListener('click', showReno);
  buy.addEventListener('click', hideReno);
  sell.addEventListener('click', hideReno);
  if (rentBtn) rentBtn.addEventListener('click', hideReno);
  if (cmpBtn) cmpBtn.addEventListener('click', hideReno);

  // --- Deep link: #renovate selects the tab ----------------------------------------
  function routeReno(h) {
    h = (h === undefined ? location.hash : h) || '';
    if (h.toLowerCase() === '#renovate') { showReno(); return true; }
    return false;
  }
  window.addEventListener('hashchange', function () { routeReno(); });
  routeReno();
})();
