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
      sec2: '02 / Your budget (optional)', ariaBudget: 'Your monthly rent budget', budgetPh: 'e.g. 3500 - number only, matched to each city\'s currency',
      intro: 'No listings of our own and nothing invented. See what public data says about rents in a city, open real rental listings on the portals - where you contact the agent or landlord - and check the building\'s public record before you sign.' },
    fr: { sec: '01 / La ville', aria: 'Ville où vous voulez louer', ph: 'p. ex. London, New York City, Hong Kong, Singapore', go: 'Explorer →',
      sec2: '02 / Votre budget (facultatif)', ariaBudget: 'Votre budget loyer mensuel', budgetPh: 'p. ex. 3500 - chiffre seul, dans la devise de la ville',
      intro: 'Pas d\'annonces à nous et rien d\'inventé. Voyez ce que les données publiques disent des loyers d\'une ville, ouvrez de vraies annonces de location sur les portails - où vous contactez l\'agent ou le propriétaire - et vérifiez le dossier public de l\'immeuble avant de signer.' },
    de: { sec: '01 / Die Stadt', aria: 'Stadt, in der Sie mieten möchten', ph: 'z. B. London, New York City, Hong Kong, Singapore', go: 'Entdecken →',
      sec2: '02 / Ihr Budget (optional)', ariaBudget: 'Ihr monatliches Mietbudget', budgetPh: 'z. B. 3500 - nur Zahl, in der Währung der Stadt',
      intro: 'Keine eigenen Inserate und nichts Erfundenes. Sehen Sie, was öffentliche Daten über Mieten in einer Stadt sagen, öffnen Sie echte Mietinserate auf den Portalen - dort kontaktieren Sie den Makler oder Eigentümer - und prüfen Sie die öffentlichen Unterlagen des Gebäudes vor der Unterschrift.' },
    nl: { sec: '01 / De stad', aria: 'Stad waar u wilt huren', ph: 'bijv. London, New York City, Hong Kong, Singapore', go: 'Verkennen →',
      sec2: '02 / Uw budget (optioneel)', ariaBudget: 'Uw maandelijkse huurbudget', budgetPh: 'bijv. 3500 - alleen cijfer, in de valuta van de stad',
      intro: 'Geen eigen advertenties en niets verzonnen. Bekijk wat openbare data over huren in een stad zeggen, open echte huuradvertenties op de portalen - waar u contact opneemt met de makelaar of verhuurder - en controleer de openbare gegevens van het gebouw vóór u tekent.' },
    pl: { sec: '01 / Miasto', aria: 'Miasto, w którym chcesz wynająć', ph: 'np. London, New York City, Hong Kong, Singapore', go: 'Odkryj →',
      sec2: '02 / Twój budżet (opcjonalnie)', ariaBudget: 'Twój miesięczny budżet na czynsz', budgetPh: 'np. 3500 - sama liczba, w walucie miasta',
      intro: 'Żadnych własnych ogłoszeń i nic zmyślonego. Zobacz, co dane publiczne mówią o czynszach w mieście, otwórz prawdziwe oferty wynajmu w portalach - tam skontaktujesz się z agentem lub właścicielem - i sprawdź publiczne dane budynku przed podpisaniem.' }
  };
  var t = T[lang] || T.en;

  var st = document.createElement('style');
  st.textContent = '.tabs{flex-wrap:wrap;row-gap:12px}#rentView{display:none}' +
    '.rclab{display:block;font-size:11px;letter-spacing:.04em;color:#bda990;margin:12px 0 2px}';
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
    '<p class="label" style="margin-top:22px">' + t.sec2 + '</p>' +
    '<form id="askbudget" autocomplete="off"><input id="qbudget" inputmode="numeric" maxlength="12" aria-label="' + t.ariaBudget + '" placeholder="' + t.budgetPh + '"></form>' +
    '<div id="rentPanel" style="margin-top:16px"><div class="finding"><p>' + t.intro + '</p></div></div></section>' +
    '<section><p class="label" style="margin-top:26px">03 / Compare actual rentals - your figures</p>' +
    '<div class="finding"><p>Enter rentals you are actually considering, with the figures you know. Monthly recurring costs and one-off move-in costs stay separate. Anything you do not know is shown as unknown - nothing is estimated or invented. Figures you enter are yours: reported by you, not independently verified. Kept on this device only, and only for up to 7 days - nothing is uploaded or shared, and after 7 days they are gone from here, so copy or download your comparison if you want to keep it.</p></div>' +
    '<form id="addrental" autocomplete="off" style="margin-top:12px">' +
    '<label class="rclab" for="rcName">Name or short label</label><input id="rcName" maxlength="80" placeholder="e.g. Flat A - Bishan">' +
    '<label class="rclab" for="rcUrl">Listing link (optional)</label><input id="rcUrl" maxlength="300" inputmode="url" placeholder="https://...">' +
    '<div style="display:flex;gap:18px;flex-wrap:wrap"><span style="flex:1;min-width:150px"><label class="rclab" for="rcRent">Rent per month</label><input id="rcRent" inputmode="decimal" maxlength="12" placeholder="e.g. 3500"></span>' +
    '<span><label class="rclab" for="rcCur">Currency</label><select id="rcCur" style="background:#4a3629;color:#f6ead6;border:0;border-bottom:1px solid #836d55;font:inherit;padding:4px 0;width:100%">' +
    '<option>HKD</option><option>USD</option><option>GBP</option><option>SGD</option><option>EUR</option><option>CAD</option><option>Other</option></select></span></div>' +
    '<label class="rclab">Extra monthly costs you know - one line per cost (e.g. utilities, management fee, parking); anything not listed stays unknown</label>' +
    '<div id="rcComps"></div>' +
    '<p style="margin-top:6px"><button type="button" id="rcCompAdd" style="background:none;border:0;border-bottom:1px solid #7c6650;color:#dcc9ad;padding:2px 0;font-size:13px">+ add a known monthly cost</button></p>' +
    '<label class="rclab" for="rcExAll" style="display:flex;gap:8px;align-items:center;font-size:13px;text-transform:none;letter-spacing:0"><input type="checkbox" id="rcExAll" style="width:auto">These are all the extra monthly costs - nothing else recurs monthly for this home</label>' +
    '<label class="rclab" for="rcIncl">What the rent includes (optional)</label><input id="rcIncl" maxlength="120" placeholder="e.g. management fee, internet">' +
    '<label class="rclab" for="rcDep">Deposit (one-off) - leave blank if unknown</label><input id="rcDep" inputmode="decimal" maxlength="12" placeholder="blank = unknown">' +
    '<label class="rclab" for="rcFee">Agency fee (one-off) - leave blank if unknown</label><input id="rcFee" inputmode="decimal" maxlength="12" placeholder="blank = unknown">' +
    '<label class="rclab" for="rcStamp">Stamp duty / tax (one-off) - leave blank if unknown</label><input id="rcStamp" inputmode="decimal" maxlength="12" placeholder="blank = unknown">' +
    '<label class="rclab" for="rcFirst">First month paid upfront (one-off) - leave blank if unknown</label><input id="rcFirst" inputmode="decimal" maxlength="12" placeholder="blank = unknown">' +
    '<label class="rclab" for="rcOnce">Other one-off costs - leave blank if unknown</label><input id="rcOnce" inputmode="decimal" maxlength="12" placeholder="blank = unknown">' +
    '<label class="rclab" for="rcDate">Date of these figures (optional)</label><input id="rcDate" maxlength="40" placeholder="e.g. 2026-11-16, from the listing">' +
    '<div class="controls" style="justify-content:flex-start;gap:18px"><button type="submit" id="rcSubmit">Add rental →</button><button type="button" id="rcCancel" style="display:none;background:none;border:0;border-bottom:1px solid #7c6650;color:#dcc9ad;padding:2px 0;font-size:13px;min-width:0">cancel edit</button></div></form>' +
    '<div id="rentCmp"></div>';
  sv.parentNode.insertBefore(v, sv.nextSibling);
  var rp = v.querySelector('#rentPanel');
  if (NOTE[lang]) { var np = document.createElement('p'); np.className = 'asm'; np.style.marginTop = '10px'; np.textContent = NOTE[lang]; v.querySelector('section').appendChild(np); }

  // --- Sources & credits line ---------------------------------------------------
  var scf = document.querySelector('#sourcesCredits footer');
  if (scf && !scf.querySelector('.rentsrc')) {
    var sp = document.createElement('p'); sp.className = 'rentsrc';
    sp.innerHTML = 'Rent: US typical asking rents = Zillow Research ZORI, Sep 2026, modelled - Data Provided by Zillow Group; UK city/area average rents = ONS Price Index of Private Rents, Sep 2026 (Source: Office for National Statistics licensed under the Open Government Licence v.3.0); Singapore Bishan = HDB median approved sublet rents by town and flat type, 2026-Q3 (data.gov.sg, Singapore Open Data Licence). Rental listings: Zillow, Rightmove, 28Hse (external portals, not verified by RE-agent; contacting the agent or landlord happens there). City averages, not quotes for any specific home. Not investment advice.';
    scf.appendChild(sp);
  }

  // --- Rent data ------------------------------------------------------------------
  // ONS Price Index of Private Rents, 2026-09 (21 Oct 2026 edition): average monthly rent, all property
  // types, by local authority (England/Wales) or Broad Rental Market Area (Scotland).
  var UK_RENT = {
    'london': { v: 2338, area: 'London region' },
    'manchester': { v: 1380, area: 'Manchester local authority' },
    'birmingham': { v: 1106, area: 'Birmingham local authority' },
    'leeds': { v: 1148, area: 'Leeds local authority' },
    'liverpool': { v: 916, area: 'Liverpool local authority' },
    'sheffield': { v: 936, area: 'Sheffield local authority' },
    'city-of-bristol': { v: 1893, area: 'Bristol, City of local authority' },
    'newcastle-upon-tyne': { v: 1220, area: 'Newcastle upon Tyne local authority' },
    'nottingham': { v: 1015, area: 'Nottingham local authority' },
    'cardiff': { v: 1179, area: 'Cardiff local authority' },
    'cambridge': { v: 1805, area: 'Cambridge local authority' },
    'oxford': { v: 1957, area: 'Oxford local authority' },
    'city-of-glasgow': { v: 1266, area: 'Greater Glasgow Broad Rental Market Area (not the city alone)' },
    'city-of-edinburgh': { v: 1411, area: 'Lothian Broad Rental Market Area - the BRMA containing Edinburgh, not the city alone' }
  };
  var UK_RENT_MONTH = '2026-09';
  var SG_RENT = { town: 'Bishan', period: '2026-Q3', rows: [['3 ROOM', 3000], ['4 ROOM', 3700], ['5 ROOM', 4100]] }; // HDB via data.gov.sg
  var GBP = function (n) { return '£' + Math.round(n).toLocaleString('en-GB'); };
  var SGD = function (n) { return 'S$' + Math.round(n).toLocaleString('en-SG'); };
  var USD = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };
  var BUDGET = NaN, LAST_RAW = null, LAST_PINNED = false;
  function fmtDiff(fmt, diff) { return diff > 0 ? fmt(diff) + ' over your budget' : (diff < 0 ? fmt(-diff) + ' under your budget' : 'matches your budget'); }
  var BENCH = ' A budget benchmark against a market snapshot - not the total monthly cost of a specific home (deposit, fees and utilities not included).';
  function budgetNote(fmt, typical, what) {
    if (!(BUDGET > 0)) return '';
    return '<p class="muted" style="margin-top:10px">Your budget ' + fmt(BUDGET) + '/mo vs ' + what + ' ' + fmt(typical) + '/mo: ' + fmtDiff(fmt, typical - BUDGET) + '.' + BENCH + '</p>';
  }
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
    if (c && c.indexOf('UK:') === 0) {
      var uk = UK_RENT[c.slice(3)];
      var label = UK_LABELS[c.slice(3)];
      if (uk) {
        return '<div class="finding"><h3>' + label + ' - rent snapshot</h3>' +
          '<p><span class="count">' + GBP(uk.v) + '/mo</span><br>average private rent, all property types</p>' +
          '<p class="muted">ONS Price Index of Private Rents, ' + UK_RENT_MONTH + ': average monthly rent, private rental stock, ' + uk.area + '. An area average, not a quote for any home. <a href="https://www.ons.gov.uk/economy/inflationandpriceindices/datasets/priceindexofprivaterentsukmonthlypricestatistics" target="_blank" rel="noopener">Source ↗</a></p>' +
          budgetNote(GBP, uk.v, 'the area average rent') +
          act(extBtn(rmrent(label), 'See rentals on Rightmove') + ' · ' + CMP_BTN) + '</div>';
      }
      return '<div class="finding"><h3>Renting in ' + label + '</h3>' +
        '<p>Official city-level rent figures are not wired for ' + label + ' yet - nothing invented. What you can do today: open real rental listings on Rightmove and compare typical rents across covered cities.</p>' +
        act(extBtn(rmrent(label), 'See rentals on Rightmove') + ' · ' + CMP_BTN) + '</div>';
    }
    if (typeof CITY_MARKET !== 'undefined' && CITY_MARKET[c]) {
      var m = CITY_MARKET[c];
      var h = '<div class="finding"><h3>' + c + ', ' + m.st + ' - rent snapshot</h3>' +
        '<p><span class="count">' + USD(m.zori) + '/mo</span><br>typical asking rent, all rentals incl. multifamily</p>' +
        '<p class="muted">Zillow Research ZORI, ' + CITY_MARKET._meta.zori_month.slice(0, 7) + '. A city-level typical - neighbourhoods and flats vary widely, and it is not a quote for any specific home. <a href="https://www.zillow.com/research/data/" target="_blank" rel="noopener">Source ↗</a></p>' +
        budgetNote(USD, m.zori, 'the city-typical asking rent');
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
      (BUDGET > 0 ? '<p class="muted" style="margin-top:10px">Your budget ' + SGD(BUDGET) + '/mo vs Bishan medians: ' + SG_RENT.rows.map(function (r) { return 'HDB ' + r[0] + ' ' + SGD(r[1]) + ' (' + fmtDiff(SGD, r[1] - BUDGET) + ')'; }).join(' · ') + '.' + BENCH + '</p>' : '') +
      act(CMP_BTN) + '</div>';
  }

  function renderCandRent(cand) {
    if (cand.cov) return renderCoveredRent(cand.cov);
    if (cand.country === 'Singapore') return renderSg();
    return '<div class="finding"><h3>' + esc(candName(cand)) + '</h3>' + countryCtx(cand) +
      '<p>Resolved from the GeoNames city database (34,000+ cities). Rent figures and a listing route are not wired for ' + esc(cand.city) + ' yet - said plainly instead of invented.</p></div>';
  }

  // --- Compare actual rentals: visitor-entered, on-device only (SAU-44) ---------
  var CMP_KEY = 'stRentCmp:v1', CMP_AGE = 7 * 24 * 3600 * 1000;
  var CURS = { HKD: 'HK$', USD: '$', GBP: '\u00a3', SGD: 'S$', EUR: '\u20ac', CAD: 'C$', Other: '' };
  var rentals = [], EDIT_I = -1;
  function cmpLoad() {
    try {
      var raw = localStorage.getItem(CMP_KEY); if (!raw) return;
      var d = JSON.parse(raw);
      if (d && d.ts && Date.now() - d.ts < CMP_AGE && Array.isArray(d.items)) rentals = d.items;
      else localStorage.removeItem(CMP_KEY);
      rentals = rentals.map(function (r) {
        if (!r.comps) {
          r.comps = fin(r.extra) ? [{ label: 'Extra monthly costs (entered as a total)', amt: r.extra }] : [];
          r.exAll = fin(r.extra);
          delete r.extra;
        }
        return r;
      });
    } catch (e) { }
  }
  function cmpSave() { try { localStorage.setItem(CMP_KEY, JSON.stringify({ ts: Date.now(), items: rentals })); } catch (e) { } }
  function num(v) { if (v === undefined || v === null || String(v).trim() === '') return NaN; var n = parseFloat(String(v).replace(/[^0-9.]/g, '')); return isFinite(n) && n >= 0 ? n : NaN; }
  function fin(x) { return typeof x === 'number' && isFinite(x); }
  function fm(cur, n) { var s = CURS[cur] || ''; return (s ? s : '') + Math.round(n).toLocaleString('en-US') + (s ? '' : (cur === 'Other' ? '' : '')); }
  function unk(b) { return b ? '<span style="color:#e8b9c4">unknown</span>' : ''; }
  function fmtOne(r) {
    var comps = r.comps || [], compSum = 0, compsFinite = true;
    comps.forEach(function (c) { if (fin(c.amt)) compSum += c.amt; else compsFinite = false; });
    var rentK = fin(r.rent);
    var exK = comps.length > 0 && compsFinite && !!r.exAll;
    var monthly = rentK ? r.rent + compSum : NaN;
    var depK = fin(r.dep), feeK = fin(r.fee), oncK = fin(r.once), stK = fin(r.stamp), fiK = fin(r.first);
    var onceSum = (feeK ? r.fee : 0) + (oncK ? r.once : 0) + (stK ? r.stamp : 0);
    return { rentK: rentK, exK: exK, compsAny: comps.length > 0, compsFinite: compsFinite, compSum: compSum, monthly: monthly, depK: depK, feeK: feeK, oncK: oncK, stK: stK, fiK: fiK, onceSum: onceSum, onceAny: depK || feeK || oncK || stK || fiK, onceAll: feeK && oncK && stK };
  }
  function exportText() {
    var d = new Date().toISOString().slice(0, 10);
    var s = 'RENTAL COMPARISON - my figures\nExported ' + d + ' from RE-agent on sauletrust.com. All figures below were entered by me (reported by me, not independently verified). Entries are kept on my device for up to 7 days, then removed - keep this copy if I need them longer.\n\n';
    rentals.forEach(function (r, i) {
      var f = fmtOne(r);
      s += (i + 1) + '. ' + (r.name || 'Rental ' + (i + 1)) + '\n';
      s += '   Listing: ' + (r.url || '-') + '\n';
      s += '   Figures as of: ' + (r.fdate || '-') + ' (reported by me, not verified)\n';
      s += '   Rent: ' + (f.rentK ? fm(r.cur, r.rent) + '/mo ' + r.cur : 'unknown') + '\n';
      if (!f.compsAny) s += '   Extra monthly costs: unknown' + '\n';
      else {
        (r.comps || []).forEach(function (c) { s += '   - ' + (c.label || 'cost') + ': ' + (fin(c.amt) ? fm(r.cur, c.amt) + '/mo' : 'unknown') + '\n'; });
        s += '   Listed extras total: ' + fm(r.cur, f.compSum) + '/mo' + (f.exK ? ' (all extra monthly costs)' : ' (other extras unknown - not estimated)') + '\n';
      }
      if (r.incl) s += '   Rent includes: ' + r.incl + '\n';
      s += (f.exK ? '   Known monthly total: ' : '   Known so far: ') + (f.rentK ? fm(r.cur, f.monthly) + '/mo' + (f.exK ? '' : ' (more monthly costs may apply)') : 'unknown') + '\n';
      s += '   One-off costs: agency fee ' + (f.feeK ? fm(r.cur, r.fee) : 'unknown') + ' - stamp duty/tax ' + (f.stK ? fm(r.cur, r.stamp) : 'unknown') + ' - other ' + (f.oncK ? fm(r.cur, r.once) : 'unknown') + '\n';
      s += '   Deposit (potentially refundable, subject to tenancy terms and deductions - excluded from expense total): ' + (f.depK ? fm(r.cur, r.dep) : 'unknown') + '\n';
      s += '   First month paid upfront (rent paid early - not an extra cost): ' + (f.fiK ? fm(r.cur, r.first) : 'unknown') + '\n';
      s += '   Known one-off total: ' + (f.onceAny ? fm(r.cur, f.onceSum) + (f.onceAll ? '' : ' (some one-off items unknown)') : 'unknown') + '\n\n';
    });
    s += 'Note: comparison on the site uses only the figures entered and never compares across currencies.\n';
    return s;
  }
  var ACCT_ORIGIN = null;
  try { var _po = new URL(document.referrer).origin; if (window !== window.top && ['https://sauletrust.com', 'https://www.sauletrust.com'].indexOf(_po) >= 0) ACCT_ORIGIN = _po; } catch (e) { }
  var acctPending = false, acctBtn = null, acctTimer = 0, acctAuth = false;
  function openAccount() {
    var u = ACCT_ORIGIN + '/account/?lang=' + lang, w = null;
    try { w = window.open(u, '_blank', 'noopener'); } catch (e) { }
    if (!w) { try { window.top.location.href = u; } catch (e) { } }
  }
  function saveToAccount(i, btn) {
    if (!ACCT_ORIGIN) return;
    if (acctAuth) { openAccount(); return; }
    if (acctPending) return;
    var r = rentals[i]; if (!r) return;
    acctPending = true; acctBtn = btn; btn.disabled = true; btn.textContent = 'Saving...';
    var text = rentalText(r, i);
    var links = [];
    if (/^https?:\/\/\S+$/i.test(r.url || '')) links.push({ label: 'Listing', url: r.url });
    var snap = { v: 1, kind: 'research', researchKind: 'rental', lang: lang, capturedAt: new Date().toISOString(), text: text.slice(0, 2700), truncated: text.length > 2700, links: links };
    var notes = JSON.stringify(snap);
    while (notes.length > 3800 && snap.text.length > 200) { snap.text = snap.text.slice(0, -200); snap.truncated = true; notes = JSON.stringify(snap); }
    var url = links.length ? r.url : (ACCT_ORIGIN + (lang === 'en' ? '/' : '/' + lang + '/') + '#rent');
    window.parent.postMessage({ type: 'reagentSave', url: url, label: (r.name || 'Rental ' + (i + 1)).slice(0, 200), notes: notes }, ACCT_ORIGIN);
    clearTimeout(acctTimer);
    acctTimer = setTimeout(function () { if (acctPending) { acctPending = false; btn.disabled = false; btn.textContent = '\u2606 save to my account'; } }, 8000);
  }
  window.addEventListener('message', function (e) {
    if (!ACCT_ORIGIN || e.origin !== ACCT_ORIGIN || !e.data || e.data.type !== 'reagentSaveResult') return;
    clearTimeout(acctTimer);
    var btn = acctBtn; acctPending = false;
    if (!btn) return;
    if (e.data.ok) { btn.disabled = true; btn.textContent = 'Saved \u2713 - in your account library'; acctAuth = false; }
    else if (e.data.authRequired) { acctAuth = true; btn.disabled = false; btn.textContent = 'Sign in to save (opens your account page)'; }
    else { btn.disabled = false; btn.textContent = 'Save failed - try again'; }
  });
  function renderCmp() {
    var el = v.querySelector('#rentCmp');
    if (!rentals.length) { el.innerHTML = ''; return; }
    var sameCur = rentals.every(function (r) { return r.cur === rentals[0].cur; });
    var h = '';
    rentals.forEach(function (r, i) {
      var f = fmtOne(r);
      h += '<div class="finding" style="margin-top:12px"><h3>' + esc(r.name || 'Rental ' + (i + 1)) +
        (r.url ? ' <a href="' + esc(r.url) + '" target="_blank" rel="noopener" style="font-size:12px">listing ↗</a>' : '') + '</h3>';
      h += '<p class="muted">Figures as of ' + (r.fdate ? esc(r.fdate) : 'no date given') + ' - reported by you, not independently verified.</p>';
      h += '<p>' + (f.rentK ? '<b>' + fm(r.cur, r.rent) + '/mo</b> rent (' + esc(r.cur) + ')' : 'Rent: ' + unk(1));
      if (!f.compsAny) h += '<br>Extra monthly costs: ' + unk(1);
      else {
        (r.comps || []).forEach(function (c) { h += '<br>&nbsp;&nbsp;· ' + esc(c.label || 'cost') + ': ' + (fin(c.amt) ? fm(r.cur, c.amt) + '/mo' : unk(1)); });
        h += '<br>&nbsp;&nbsp;Listed extras total: <b>' + fm(r.cur, f.compSum) + '/mo</b>' + (f.exK ? '' : ' <span class="muted">(other extras unknown - nothing estimated)</span>');
      }
      h += (r.incl ? ' · rent includes: ' + esc(r.incl) : '');
      h += '<br><b>' + (f.rentK ? (f.exK ? 'Known monthly total: ' : 'Known so far: ') + fm(r.cur, f.monthly) + '/mo' : 'Monthly total: unknown') + '</b>' + (f.rentK && !f.exK ? ' <span class="muted">(' + (f.compsAny ? 'rent + listed extras - more monthly costs may apply' : 'rent only - extra monthly costs unknown') + ')</span>' : '') + '</p>';
      h += '<p class="muted">One-off move-in costs: agency fee ' + (f.feeK ? fm(r.cur, r.fee) : unk(1)) + ' · stamp duty/tax ' + (f.stK ? fm(r.cur, r.stamp) : unk(1)) + ' · other ' + (f.oncK ? fm(r.cur, r.once) : unk(1)) + '. <b>Known one-off costs total: ' + ((f.feeK || f.oncK || f.stK) ? fm(r.cur, f.onceSum) : 'unknown') + '</b>' + ((f.feeK || f.oncK || f.stK) && !f.onceAll ? ' (some one-off items unknown)' : '') + '</p>';
      h += '<p class="muted">Deposit: ' + (f.depK ? fm(r.cur, r.dep) : unk(1)) + ' (potentially refundable, subject to tenancy terms and deductions - excluded from expense total) · First month paid upfront: ' + (f.fiK ? fm(r.cur, r.first) : unk(1)) + ' (rent paid early - not an extra cost)</p>';
      h += '<p style="margin-top:8px"><button type="button" class="rcedit" data-i="' + i + '" style="background:none;border:0;border-bottom:1px solid #7c6650;color:#dcc9ad;padding:2px 0;font-size:13px">edit</button> <button type="button" class="rcdel" data-i="' + i + '" style="background:none;border:0;border-bottom:1px solid #7c6650;color:#dcc9ad;padding:2px 0;font-size:13px">remove</button> <button type="button" class="rcacct" data-i="' + i + '" style="background:none;border:0;border-bottom:1px solid #7c6650;color:#dcc9ad;padding:2px 0;font-size:13px">\u2606 save to my account</button></p></div>';
    });
    if (rentals.length > 1) {
      h += '<div class="finding" style="margin-top:12px"><p><b>Comparison</b><br>';
      if (!sameCur) h += 'Different currencies - totals are shown per rental, not compared across currencies.';
      else {
        var full = rentals.filter(function (r) { var f = fmtOne(r); return f.rentK && f.exK; });
        if (full.length === rentals.length) {
          var minI = 0; full.forEach(function (r, i) { if (fmtOne(r).monthly < fmtOne(full[minI]).monthly) minI = i; });
          h += 'Lowest known monthly total on the figures entered: <b>' + esc(full[minI].name || 'Rental ' + (minI + 1)) + '</b> at ' + fm(full[minI].cur, fmtOne(full[minI]).monthly) + '/mo. ';
        } else h += 'A full monthly-cost comparison is not possible yet - not all recurring monthly costs are known for ' + (rentals.length - full.length) + ' of ' + rentals.length + ' rentals. ';
      }
      h += 'Comparison uses only the figures you entered - check each listing for what is actually included.</p></div>';
    }
    h += '<p style="margin-top:14px"><button type="button" id="rcCopy" style="background:none;border:0;border-bottom:1px solid #7c6650;color:#dcc9ad;padding:2px 0;font-size:13px">Copy text</button> <button type="button" id="rcDl" style="background:none;border:0;border-bottom:1px solid #7c6650;color:#dcc9ad;padding:2px 0;font-size:13px">Download .txt</button> <span class="muted" id="rcCopied" style="font-size:12px"></span></p>';
    el.innerHTML = h;
    el.querySelectorAll('.rcdel').forEach(function (b) {
      b.onclick = function () { rentals.splice(+b.dataset.i, 1); cmpSave(); renderCmp(); };
    });
    el.querySelectorAll('.rcedit').forEach(function (b) {
      b.onclick = function () {
        var r = rentals[+b.dataset.i]; EDIT_I = +b.dataset.i;
        v.querySelector('#rcName').value = r.name || '';
        v.querySelector('#rcUrl').value = r.url || '';
        v.querySelector('#rcRent').value = fin(r.rent) ? r.rent : '';
        v.querySelector('#rcCur').value = r.cur || 'HKD';
        resetComps(r.comps || []);
        v.querySelector('#rcExAll').checked = !!r.exAll;
        v.querySelector('#rcIncl').value = r.incl || '';
        v.querySelector('#rcDep').value = fin(r.dep) ? r.dep : '';
        v.querySelector('#rcFee').value = fin(r.fee) ? r.fee : '';
        v.querySelector('#rcStamp').value = fin(r.stamp) ? r.stamp : '';
        v.querySelector('#rcFirst').value = fin(r.first) ? r.first : '';
        v.querySelector('#rcOnce').value = fin(r.once) ? r.once : '';
        v.querySelector('#rcDate').value = r.fdate || '';
        v.querySelector('#rcSubmit').textContent = 'Save changes →';
        v.querySelector('#rcCancel').style.display = '';
        v.querySelector('#rcName').focus();
      };
    });
    el.querySelectorAll('.rcacct').forEach(function (b) {
      if (!ACCT_ORIGIN) { b.style.display = 'none'; return; }
      b.onclick = function () { saveToAccount(+b.dataset.i, b); };
    });
    var cp = el.querySelector('#rcCopy');
    if (cp) cp.onclick = function () {
      var txt = exportText();
      function done() { var m = el.querySelector('#rcCopied'); if (m) m.textContent = 'Copied'; }
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(txt).then(done, done); }
      else { var ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) { } ta.remove(); done(); }
    };
    var dl = el.querySelector('#rcDl');
    if (dl) dl.onclick = function () {
      try {
        var blob = new Blob([exportText()], { type: 'text/plain' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'rental-comparison-' + new Date().toISOString().slice(0, 10) + '.txt';
        document.body.appendChild(a); a.click(); a.remove();
      } catch (e) { }
    };
  }
  function compRow(c) {
    var d = document.createElement('div');
    d.className = 'rccomp'; d.style.cssText = 'display:flex;gap:10px;margin-top:6px;align-items:center';
    d.innerHTML = '<input class="rcclab" maxlength="40" placeholder="e.g. utilities" style="flex:1;min-width:120px"><input class="rcamt" inputmode="decimal" maxlength="12" placeholder="amount" style="width:110px;flex:none"><button type="button" class="rccx" style="background:none;border:0;border-bottom:1px solid #7c6650;color:#dcc9ad;padding:2px 0;font-size:13px;flex:none">remove</button>';
    if (c) { d.querySelector('.rcclab').value = c.label || ''; d.querySelector('.rcamt').value = fin(c.amt) ? c.amt : ''; }
    d.querySelector('.rccx').onclick = function () { d.remove(); };
    return d;
  }
  function resetComps(list) {
    var box = v.querySelector('#rcComps'); box.innerHTML = '';
    (list && list.length ? list : [null]).forEach(function (c) { box.appendChild(compRow(c)); });
  }
  v.querySelector('#rcCompAdd').addEventListener('click', function () { v.querySelector('#rcComps').appendChild(compRow(null)); });
  resetComps(null);
  v.querySelector('#rcCancel').addEventListener('click', function () {
    EDIT_I = -1;
    v.querySelector('#addrental').reset();
    resetComps(null);
    v.querySelector('#rcSubmit').textContent = 'Add rental →';
    v.querySelector('#rcCancel').style.display = 'none';
  });
  v.querySelector('#addrental').addEventListener('submit', function (e) {
    e.preventDefault();
    var url = v.querySelector('#rcUrl').value.trim();
    if (url && !/^https?:\/\//i.test(url)) url = '';
    var comps = [];
    v.querySelectorAll('#rcComps .rccomp').forEach(function (d) {
      var lab = d.querySelector('.rcclab').value.trim(), amt = num(d.querySelector('.rcamt').value);
      if (lab || isFinite(amt)) comps.push({ label: lab, amt: amt });
    });
    var item = {
      name: v.querySelector('#rcName').value.trim(), url: url,
      rent: num(v.querySelector('#rcRent').value), cur: v.querySelector('#rcCur').value,
      comps: comps, exAll: v.querySelector('#rcExAll').checked, incl: v.querySelector('#rcIncl').value.trim(),
      dep: num(v.querySelector('#rcDep').value), fee: num(v.querySelector('#rcFee').value), once: num(v.querySelector('#rcOnce').value),
      stamp: num(v.querySelector('#rcStamp').value), first: num(v.querySelector('#rcFirst').value),
      fdate: v.querySelector('#rcDate').value.trim()
    };
    if (EDIT_I >= 0 && EDIT_I < rentals.length) rentals[EDIT_I] = item; else rentals.push(item);
    if (rentals.length > 6) rentals = rentals.slice(-6);
    EDIT_I = -1;
    v.querySelector('#rcSubmit').textContent = 'Add rental →';
    v.querySelector('#rcCancel').style.display = 'none';
    cmpSave(); renderCmp(); e.target.reset(); resetComps(null);
  });
  cmpLoad(); renderCmp();

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
    LAST_RAW = raw; LAST_PINNED = !!pinned;
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
  v.querySelector('#askbudget').addEventListener('submit', function (e) {
    e.preventDefault();
    var rawb = v.querySelector('#qbudget').value.replace(/[^0-9.]/g, '');
    BUDGET = parseFloat(rawb) || NaN;
    if (LAST_RAW) rentPick(LAST_RAW, LAST_PINNED);
  });
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

  // --- Deep links: #buy #sell #rent #compare select the matching tab -------------
  function routeHash(h) {
    h = (h === undefined ? location.hash : h) || ''; h = h.toLowerCase();
    if (h === '#rent') { showRent(); return true; }
    if (h === '#compare') { if (cmpBtn) { cmpBtn.click(); return true; } return false; }
    if (h === '#sell') { sell.click(); return true; }
    if (h === '#buy') { buy.click(); return true; }
    return false;
  }
  routeHash();
  window.addEventListener('hashchange', function () { routeHash(); });
  // The sauletrust.com parent page cannot set this frame's hash without a reload,
  // so it asks for tab switches by message instead.
  window.addEventListener('message', function (e) {
    if (e.origin !== 'https://sauletrust.com' && e.origin !== 'https://www.sauletrust.com') return;
    var d = e.data || {};
    if (d.type === 'st-tab' && typeof d.tab === 'string') routeHash('#' + d.tab);
  });
})();
