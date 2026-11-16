/* Rent tab for RE-agent: injects a RENT tab between Sell and Compare.
 *
 * Renter journey: pick a city -> see what public data says about rents there
 * -> open real rental listings on the external portals (where contacting the
 * agent/landlord happens) -> check the building's public record before
 * signing (records live on the Buy tab; a button takes the renter there by
 * pre-filling and submitting the Buy city search).
 *
 * Self-contained: the main page keeps its own resolver inside a closure, so
 * this file re-implements city resolution against the same bundled files
 * (cities.json, world.json) and the same coverage rules. CITY_MARKET is a
 * page-level constant and is read directly.
 *
 * Data policy (same as the rest of the app): free, verified sources only,
 * every figure named with source and period; where no rent figure or route
 * is wired the tab says so plainly instead of inventing data.
 * - US 20 cities: Zillow Research ZORI typical asking rent, 2026-09.
 * - London: ONS Price Index of Private Rents, 2026-08 (OGL v3.0).
 * - Singapore: HDB median approved sublet rents by flat type, Bishan town,
 *   2026-Q3 (data.gov.sg, Singapore Open Data Licence).
 * - NOT shown: HK RVD rents (terms pending owner approval) and CMHC rents
 *   (licence conflict unresolved) - both stay disabled as in compare-data.js.
 */
(function () {
  var tabs = document.querySelector('.tabs'), buy = document.querySelector('#tabBuy'),
      sell = document.querySelector('#tabSell'), sv = document.querySelector('#sellView'),
      bv = document.querySelector('#buyView'), h1 = document.querySelector('h1');
  if (!tabs || !buy || !sell || !sv || !bv) return;
  if (document.querySelector('#tabRent')) return;
  var lang = (document.documentElement.lang || 'en').slice(0, 2);

  var L = { en: 'RENT', fr: 'LOUER', de: 'MIETEN', nl: 'HUREN', pl: 'WYNAJEM' };
  var HT = {
    en: 'Find the rent. Check the building.',
    fr: 'Trouvez le loyer. Vérifiez l\'immeuble.',
    de: 'Miete finden. Gebäude prüfen.',
    nl: 'Vind de huur. Check het gebouw.',
    pl: 'Znajdź czynsz. Sprawdź budynek.'
  };
  var NOTE = { fr: 'Page en anglais.', de: 'Inhalt auf Englisch.', nl: 'Inhoud in het Engels.', pl: 'Treść po angielsku.' };
  var T = {
    en: { sec: '01 / The city', aria: 'City you want to rent in', ph: 'e.g. London, New York City, Hong Kong, Singapore', go: 'Explore →',
      intro: 'No listings of our own and nothing invented. See what public data says about rents in a city, open real rental listings on the portals - where you contact the agent or landlord - and check the building\'s public record before you sign.' },
    fr: { sec: '01 / La ville', aria: 'Ville où vous voulez louer', ph: 'p. ex. London, New York City, Hong Kong, Singapore', go: 'Explorer →',
      intro: 'Pas d\'annonces à nous et rien d\'inventé. Voyez ce que les données publiques disent des loyers d\'une ville, ouvrez de vraies annonces de location sur les portails - où vous contactez l\'agent ou le propriétaire - et vérifiez le dossier public de l\'immeuble avant de signer.' },
    de: { sec: '01 / Die Stadt', aria: 'Stadt, in der Sie mieten möchten', ph: 'z. B. London, New York City, Hong Kong, Singapore', go: 'Entdecken →',
      intro: 'Keine eigenen Inserate und nichts Erfundenes. Sehen Sie, was öffentliche Daten über Mieten in einer Stadt sagen, öffnen Sie echte Mietinserate auf den Portalen - dort kontaktieren Sie den Makler oder Eigentümer - und prüfen Sie die öffentlichen Unterlagen des Gebäudes vor der Unterschrift.' },
    nl: { sec: '01 / De stad', aria: 'Stad waar u wilt huren', ph: 'bijv. London, New York City, Hong Kong, Singapore', go: 'Verkennen →',
      intro: 'Geen eigen advertenties en niets verzonnen. Bekijk wat openbare data over huren in een stad zeggen, open echte huuradvertenties op de portalen - waar u contact opneemt met de makelaar of verhuurder - en controleer de openbare gegevens van het gebouw vóór u tekent.' },
    pl: { sec: '01 / Miasto', aria: 'Miasto, w którym chcesz wynająć', ph: 'np. London, New York City, Hong Kong, Singapore', go: 'Odkryj →',
      intro: 'Żadnych własnych ogłoszeń i nic zmyślonego. Zobacz, co dane publiczne mówią o czynszach w mieście, otwórz prawdziwe oferty wynajmu w portalach - tam skontaktujesz się z agentem lub właścicielem - i sprawdź publiczne dane budynku przed podpisaniem.' }
  };
  var t = T[lang] || T.en;

  var st = document.createElement('style');
  st.textContent = '.tabs{flex-wrap:wrap;row-gap:12px}#rentView{display:none}';
  document.head.appendChild(st);

  // --- Tab button, between SELL and COMPARE ----------------------------------
  var rent = document.createElement('button');
  rent.id = 'tabRent'; rent.type = 'button'; rent.textContent = L[lang] || L.en;
  var cmpBtn = document.querySelector('#tabCmp');
  if (cmpBtn) tabs.insertBefore(rent, cmpBtn); else tabs.appendChild(rent);

  // --- Rent view ---------------------------------------------------------------
  var v = document.createElement('div');
  v.id = 'rentView';
  var chips = ['New York', 'San Francisco', 'Miami', 'Los Angeles', 'Chicago', 'London', 'Manchester', 'Toronto', 'Hong Kong', 'Singapore'];
  v.innerHTML = '<section><p class="label">' + t.sec + '</p>' +
    '<form id="askrentcity" autocomplete="off"><input id="qrc" maxlength="80" aria-label="' + t.aria + '" placeholder="' + t.ph + '">' +
    '<div class="chips">' + chips.map(function (c) { return '<button type="button" data-rc="' + c + '">' + c + '</button>' }).join('') + '</div>' +
    '<div class="controls"><button type="submit">' + t.go + '</button></div></form>' +
    '<div id="rentPanel" style="margin-top:16px"><div class="finding"><p>' + t.intro + '</p></div></div></section>';
  sv.parentNode.insertBefore(v, sv.nextSibling);
  var rp = v.querySelector('#rentPanel');
  if (NOTE[lang]) { var np = document.createElement('p'); np.className = 'asm'; np.style.marginTop = '10px'; np.textContent = NOTE[lang]; v.querySelector('section').appendChild(np); }

  // --- Sources & credits line ---------------------------------------------------
  var scf = document.querySelector('#sourcesCredits footer');
  if (scf && !scf.querySelector('.rentsrc')) {
    var sp = document.createElement('p'); sp.className = 'rentsrc';
    sp.innerHTML = 'Rent: US typical asking rents = Zillow Research ZORI, Sep 2026, modelled - Data Provided by Zillow Group; London = ONS Price Index of Private Rents, Aug 2026 (Source: Office for National Statistics licensed under the Open Government Licence v.3.0); Singapore Bishan = HDB median approved sublet rents by town and flat type, 2026-Q3 (data.gov.sg, Singapore Open Data Licence). Rental listings: Zillow, Rightmove, 28Hse (external portals, not verified by RE-agent; contacting the agent or landlord happens there). City averages, not quotes for any specific home. Not investment advice.';
    scf.appendChild(sp);
  }

  // --- Rent data ------------------------------------------------------------------
  var LONDON_RENT = { all: 2332, flat: 2056, month: '2026-08' }; // ONS PIPR, London region
  var SG_RENT = { town: 'Bishan', period: '2026-Q3', rows: [['3 ROOM', 3000], ['4 ROOM', 3700], ['5 ROOM', 4100]] }; // HDB via data.gov.sg
  var GBP = function (n) { return '£' + Math.round(n).toLocaleString('en-GB'); };
  var SGD = function (n) { return 'S$' + Math.round(n).toLocaleString('en-SG'); };
  var USD = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };
  var zrent = function (c, stt) { return 'https://www.zillow.com/homes/for_rent/' + c.replace(/ /g, '-') + ',-' + stt + '_rb/'; };
  var rmrent = function (label) { return 'https://www.rightmove.co.uk/property-to-rent/find.html?searchLocation=' + encodeURIComponent(label); };
  var HSE_RENT = 'https://www.28hse.com/en/rent';

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] }); }
  function act(html) { return '<p style="margin-top:10px">' + html + '</p>'; }
  function extBtn(href, label) { return '<a href="' + href + '" target="_blank" rel="noopener">' + label + ' ↗</a>'; }
  function goBuy(city, label) { return '<button type="button" class="gobuy" data-g="' + city + '">' + label + '</button>'; }
  var CMP_BTN = '<button type="button" class="gocmp">Compare cities →</button>';

  // --- City resolution (mirrors the main page's rules; its copy is private) -------
  var UK_LABELS = { 'manchester': 'Manchester', 'london': 'London', 'birmingham': 'Birmingham', 'leeds': 'Leeds', 'liverpool': 'Liverpool', 'sheffield': 'Sheffield', 'city-of-bristol': 'Bristol', 'city-of-edinburgh': 'Edinburgh', 'city-of-glasgow': 'Glasgow', 'newcastle-upon-tyne': 'Newcastle upon Tyne', 'city-of-nottingham': 'Nottingham', 'cardiff': 'Cardiff', 'cambridge': 'Cambridge', 'oxford': 'Oxford' };
  var ALIAS = { 'hong kong': 'HK', 'hk': 'HK', 'hongkong': 'HK', 'new york': 'New York', 'nyc': 'New York', 'new york city': 'New York', 'chicago': 'Chicago', 'chi': 'Chicago', 'manchester': 'UK:manchester', 'london': 'UK:london', 'birmingham': 'UK:birmingham', 'leeds': 'UK:leeds', 'liverpool': 'UK:liverpool', 'sheffield': 'UK:sheffield', 'bristol': 'UK:city-of-bristol', 'edinburgh': 'UK:city-of-edinburgh', 'glasgow': 'UK:city-of-glasgow', 'newcastle': 'UK:newcastle-upon-tyne', 'newcastle upon tyne': 'UK:newcastle-upon-tyne', 'nottingham': 'UK:city-of-nottingham', 'cardiff': 'UK:cardiff', 'cambridge': 'UK:cambridge', 'oxford': 'UK:oxford', 'vancouver': 'CA:Vancouver', 'toronto': 'CA:Toronto', 'calgary': 'CA:Calgary', 'edmonton': 'CA:Edmonton' };
  var US_STATES = { "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA", "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "District of Columbia": "DC", "Washington, D.C.": "DC", "Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA", "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD", "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS", "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT", "Vermont": "VT", "Virginia": "VA", "Washington": "WA", "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY" };
  var Q_ALIAS = { "uk": "united kingdom", "gb": "united kingdom", "great britain": "united kingdom", "us": "united states", "usa": "united states", "america": "united states", "hk": "hong kong" };
  function normS(s) { return (s || '').toLowerCase().replace(/\./g, '').replace(/\s+/g, ' ').trim(); }
  function resolveCity(s) {
    s = (s || '').trim(); if (!s) return null;
    var key = s.toLowerCase().split(',')[0].replace(/\s+/g, ' ').trim();
    if (ALIAS[key]) return ALIAS[key];
    if (typeof CITY_MARKET !== 'undefined') { for (var c in CITY_MARKET) { if (c === '_meta') continue; if (c.toLowerCase() === key) return c; } }
    for (var k in UK_LABELS) { if (UK_LABELS[k].toLowerCase() === key) return 'UK:' + k; }
    return 'OTHER';
  }
  function coveredOf(city, admin, country) {
    var ck = city.toLowerCase();
    if (country === 'Hong Kong' && ck === 'hong kong') return 'HK';
    if (country === 'United States') {
      if (ck === 'new york city' && admin === 'New York') return 'New York';
      if (ck === 'chicago' && admin === 'Illinois') return 'Chicago';
      if (typeof CITY_MARKET !== 'undefined') { for (var c in CITY_MARKET) { if (c === '_meta') continue; if (c.toLowerCase() === ck && US_STATES[admin] === CITY_MARKET[c].st) return c; } }
    }
    if (country === 'United Kingdom') { for (var k in UK_LABELS) { if (UK_LABELS[k].toLowerCase() === ck) return 'UK:' + k; } }
    if (country === 'Canada') {
      if (ck === 'vancouver' && admin === 'British Columbia') return 'CA:Vancouver';
      if (ck === 'toronto' && admin === 'Ontario') return 'CA:Toronto';
      if (ck === 'calgary' && admin === 'Alberta') return 'CA:Calgary';
      if (ck === 'edmonton' && admin === 'Alberta') return 'CA:Edmonton';
    }
    return null;
  }
  function qualMatch(q, c) { q = Q_ALIAS[q] || q; var a = normS(c.admin), co = normS(c.country); if (a && a.indexOf(q) > -1) return true; if (co && co.indexOf(q) > -1) return true; if (US_STATES[c.admin] && US_STATES[c.admin].toLowerCase() === q) return true; return false; }
  function candName(c) { return c.city + (c.admin ? ', ' + c.admin : '') + ', ' + c.country; }
  var CITIES = null, WORLD = null;
  async function resolveInput(raw) {
    try { if (!CITIES) { CITIES = await (await fetch('cities.json')).json(); } } catch (e) { return { kind: 'none' }; }
    try { if (!WORLD) { WORLD = await (await fetch('world.json')).json(); } } catch (e) { }
    var parts = raw.split(',').map(normS).filter(Boolean); if (!parts.length) return { kind: 'none' };
    var cityKey = parts[0], quals = parts.slice(1);
    var cands = [], seen = {};
    function addExact(key) { if (!key) return; for (var i = 0; i < CITIES.length; i++) { var c = CITIES[i]; if (normS(c[0]) === key) { var id = c[0] + '|' + c[1] + '|' + c[2]; if (!seen[id]) { seen[id] = 1; cands.push({ city: c[0], admin: c[1], country: c[2] }); } } } }
    addExact(cityKey);
    if (ALIAS[cityKey]) { var ak = ALIAS[cityKey]; ak = (ak === 'HK') ? 'hong kong' : (ak === 'New York' ? 'new york city' : (ak === 'Chicago' ? 'chicago' : (ak.indexOf('CA:') === 0 ? ak.slice(3).toLowerCase() : UK_LABELS[ak.slice(3)].toLowerCase()))); addExact(ak); }
    if (!cands.length && cityKey.length > 3) { for (var j = 0; j < CITIES.length; j++) { var cc = CITIES[j]; if (normS(cc[0]).indexOf(cityKey) === 0) { cands.push({ city: cc[0], admin: cc[1], country: cc[2] }); break; } } }
    cands.forEach(function (c) { c.cov = coveredOf(c.city, c.admin, c.country); });
    if (quals.length) { cands = cands.filter(function (c) { return quals.every(function (q) { return qualMatch(q, c); }); }); }
    if (!cands.length) return { kind: 'none' };
    cands.sort(function (a, b) { return ((b.cov ? 1 : 0) - (a.cov ? 1 : 0)); });
    if (cands.length === 1) return { kind: 'one', cand: cands[0] };
    return { kind: 'pick', cands: cands.slice(0, 6), total: cands.length };
  }
  function chooserHTML(cands, total) {
    return '<div class="finding"><h3>Several places share that name</h3><p>Pick the one you mean - nothing is shown until you do:</p><div class="suggest" style="display:block;margin-top:8px">' + cands.map(function (c, i) { return '<button type="button" class="cand" data-i="' + i + '">' + esc(candName(c)) + (c.cov ? ' <span class="n">· records or market data available</span>' : '') + '</button>' }).join('') + '</div>' + (total > cands.length ? '<p class="muted" style="margin-top:8px">Showing the ' + cands.length + ' largest of ' + total + ' - add a state, region or country to narrow it.</p>' : '') + '</div>';
  }
  function countryCtx(c) {
    var w = WORLD && WORLD[c.country]; if (!w) return ''; var s = '';
    if (w.yoy !== undefined) { var y = (w.yoy > 0 ? '+' : '') + w.yoy + '%'; s += '<p><b>' + esc(c.country) + ' market (country-wide)</b>: residential property prices ' + y + ' year on year in ' + w.q + ' (BIS nominal index, all dwellings). A country-wide trend, not a city or property figure. <a href="https://data.bis.org/topics/RPP/BIS,WS_SPP,1.0/Q.' + w.cc + '.N.628" target="_blank" rel="noopener">Source ↗</a></p>'; }
    if (w.cur) { s += '<p class="muted">Local currency: ' + w.cur + '.</p>'; }
    return s;
  }

  // --- Rent cards ------------------------------------------------------------------
  function renderCoveredRent(c) {
    if (c === 'HK') {
      return '<div class="finding"><h3>Renting in Hong Kong</h3>' +
        '<p>Official city-wide rent statistics are not published here yet (the Rating &amp; Valuation Department series is still under terms review - said plainly, not invented). What you can do today: browse real rental listings on 28Hse, and check the building\'s public orders record before you sign.</p>' +
        act(extBtn(HSE_RENT, 'Browse rentals on 28Hse') + ' · ' + goBuy('Hong Kong', 'Check a building\'s orders record →')) + '</div>';
    }
    if (c === 'CA:Toronto') {
      return '<div class="finding"><h3>Renting in Toronto</h3>' +
        '<p>Before you sign a lease on a rental apartment building, check its <b>city inspection score out of 100</b> (RentSafeTO, snapshot 2026-11-09; buildings of 3+ storeys and 10+ units). City-wide average rent figures are not published here yet - nothing invented.</p>' +
        act(goBuy('Toronto', 'Check a building\'s inspection score →')) + '</div>';
    }
    if (c === 'CA:Vancouver' || c === 'CA:Calgary' || c === 'CA:Edmonton') {
      var name = c.slice(3);
      return '<div class="finding"><h3>Renting in ' + name + '</h3>' +
        '<p>Rent figures are not wired for ' + name + ' yet - nothing invented. The public records live today are official property assessments (owner-side values, not rents).</p>' +
        act(goBuy(name, 'See the public records →')) + '</div>';
    }
    if (c === 'UK:london') {
      return '<div class="finding"><h3>London - rent snapshot</h3>' +
        '<p><span class="count">' + GBP(LONDON_RENT.flat) + '/mo</span><br>average private rent, flat/maisonette · ' + GBP(LONDON_RENT.all) + '/mo across all property types</p>' +
        '<p class="muted">ONS Price Index of Private Rents, ' + LONDON_RENT.month + ': average monthly rent, private rental stock, London region. A region average, not a quote for any home. <a href="https://www.ons.gov.uk/economy/inflationandpriceindices/datasets/priceindexofprivaterentsukmonthlypricestatistics" target="_blank" rel="noopener">Source ↗</a></p>' +
        act(extBtn(rmrent('London'), 'See rentals on Rightmove') + ' · ' + CMP_BTN) + '</div>';
    }
    if (c && c.indexOf('UK:') === 0) {
      var label = UK_LABELS[c.slice(3)];
      return '<div class="finding"><h3>Renting in ' + label + '</h3>' +
        '<p>Official city-level rent figures are not wired for ' + label + ' yet - nothing invented. What you can do today: open real rental listings on Rightmove and compare typical rents across covered cities.</p>' +
        act(extBtn(rmrent(label), 'See rentals on Rightmove') + ' · ' + CMP_BTN) + '</div>';
    }
    if (typeof CITY_MARKET !== 'undefined' && CITY_MARKET[c]) {
      var m = CITY_MARKET[c];
      var h = '<div class="finding"><h3>' + c + ', ' + m.st + ' - rent snapshot</h3>' +
        '<p><span class="count">' + USD(m.zori) + '/mo</span><br>typical asking rent, all rentals incl. multifamily</p>' +
        '<p class="muted">Zillow Research ZORI, ' + CITY_MARKET._meta.zori_month.slice(0, 7) + '. A city-level typical - neighbourhoods and flats vary widely, and it is not a quote for any specific home. <a href="https://www.zillow.com/research/data/" target="_blank" rel="noopener">Source ↗</a></p>';
      var acts = extBtn(zrent(c, m.st), 'See rentals on Zillow') + ' · ' + CMP_BTN;
      if (c === 'New York') acts += ' · ' + goBuy('New York', 'Check a building\'s DOB record →');
      if (c === 'Chicago') acts += ' · ' + goBuy('Chicago', 'Check a building\'s violations record →');
      return h + act(acts) + '</div>';
    }
    return null;
  }

  function renderSg() {
    var rows = SG_RENT.rows.map(function (r) {
      return '<div class="v"><b>HDB ' + r[0] + '</b> · ' + SGD(r[1]) + '/mo median</div>';
    }).join('');
    return '<div class="finding"><h3>Singapore - rent snapshot (' + SG_RENT.town + ')</h3>' +
      '<div class="vrow">' + rows + '</div>' +
      '<p class="muted" style="margin-top:10px">HDB median approved sublet rents by flat type, ' + SG_RENT.town + ' town, ' + SG_RENT.period + ' (data.gov.sg, Singapore Open Data Licence). Medians for one town, whole flats; HDB rental eligibility rules apply. Not a quote for any specific flat. <a href="https://data.gov.sg/datasets/d_23000a00c52996c55106084ed0339566/view" target="_blank" rel="noopener">Source ↗</a></p>' +
      act(CMP_BTN) + '</div>';
  }

  function renderCandRent(cand) {
    if (cand.cov) return renderCoveredRent(cand.cov);
    if (cand.country === 'Singapore') return renderSg();
    return '<div class="finding"><h3>' + esc(candName(cand)) + '</h3>' + countryCtx(cand) +
      '<p>Resolved from the GeoNames city database (34,000+ cities). Rent figures and a listing route are not wired for ' + esc(cand.city) + ' yet - said plainly instead of invented.</p></div>';
  }

  function bindRent() {
    rp.querySelectorAll('.gobuy').forEach(function (b) {
      b.onclick = function () {
        buy.click();
        var qc = document.querySelector('#qc'), form = document.querySelector('#askcity');
        if (qc && form) { qc.value = b.dataset.g; form.dispatchEvent(new Event('submit', { cancelable: true })); }
      };
    });
    rp.querySelectorAll('.gocmp').forEach(function (b) {
      b.onclick = function () { var cb = document.querySelector('#tabCmp'); if (cb) cb.click(); };
    });
  }

  async function rentPick(raw, pinned) {
    if (pinned) {
      if (normS(raw) === 'singapore') { rp.innerHTML = renderSg(); bindRent(); return; }
      var c = resolveCity(raw);
      if (c && c !== 'OTHER') { rp.innerHTML = renderCoveredRent(c) || ''; bindRent(); return; }
    }
    rp.innerHTML = '<p class="muted">Resolving ' + esc(raw) + '…</p>';
    var res = await resolveInput(raw);
    if (res.kind === 'one') { rp.innerHTML = renderCandRent(res.cand); bindRent(); return; }
    if (res.kind === 'pick') {
      window._rcands = res.cands;
      rp.innerHTML = chooserHTML(res.cands, res.total);
      rp.querySelectorAll('.cand').forEach(function (b) {
        b.onclick = function () { rp.innerHTML = renderCandRent(window._rcands[+b.dataset.i]); bindRent(); };
      });
      return;
    }
    rp.innerHTML = '<div class="finding warn"><h3>Could not resolve that place</h3><p>Worldwide city search (GeoNames database, 34,000+ cities over 15k population) found no match for what was typed - check the spelling or try the nearest major city. Rent figures live today: 20 US cities, London and Singapore (Bishan); rental-listing routes for the US, UK and Hong Kong.</p></div>';
  }

  v.querySelector('#askrentcity').addEventListener('submit', function (e) { e.preventDefault(); rentPick(v.querySelector('#qrc').value); });
  v.querySelectorAll('[data-rc]').forEach(function (b) { b.onclick = function () { v.querySelector('#qrc').value = b.dataset.rc; rentPick(b.dataset.rc, true); }; });

  // --- Tab switching ---------------------------------------------------------------
  var cv = document.querySelector('#cmpView');
  function showRent() {
    if (h1) h1.textContent = HT[lang] || HT.en;
    rent.classList.add('on'); buy.classList.remove('on'); sell.classList.remove('on');
    if (cmpBtn) cmpBtn.classList.remove('on');
    bv.style.display = 'none'; sv.style.display = 'none';
    if (cv) cv.style.display = 'none';
    v.style.display = 'block';
  }
  function hideRent() { rent.classList.remove('on'); v.style.display = 'none'; }
  rent.addEventListener('click', showRent);
  buy.addEventListener('click', hideRent);
  sell.addEventListener('click', hideRent);
  if (cmpBtn) cmpBtn.addEventListener('click', hideRent);

  function hashRent() { return (location.hash || '').toLowerCase() === '#rent'; }
  if (hashRent()) showRent();
  window.addEventListener('hashchange', function () { if (hashRent()) showRent(); else hideRent(); });
})();
