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
    '.rcmore{margin-top:14px;border-top:1px solid #6b5546;padding-top:4px}.rcmore summary{cursor:pointer;list-style:none;font-size:13px;color:#dcc9ad;padding:12px 0;min-height:44px}.rcmore summary::-webkit-details-marker{display:none}.rcmore summary:before{content:"+ "}.rcmore[open] summary:before{content:"\\2212 "}.rcard .rcrent{font-size:24px;margin:6px 0 2px}.rcard .rcrent .muted{font-size:13px}.rcard .rctotal{margin:0 0 4px;font-size:15px}.rcard .rcact{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;margin:6px 0 0}.rcard .rcact button{background:none;border:0;border-bottom:1px solid #7c6650;color:#dcc9ad;padding:0 6px;font-size:14px;min-width:0;min-height:44px}.rcard .rcact .rcsave{border-bottom-color:#dcc9ad;margin-right:10px;padding-left:0}.rcdet{margin-top:2px;border-top:1px solid #6b5546}.rcdet summary{cursor:pointer;list-style:none;font-size:13px;color:#dcc9ad;min-height:44px;display:flex;align-items:center}.rcdet summary::-webkit-details-marker{display:none}.rcdet summary:before{content:"+ ";margin-right:6px}.rcdet[open] summary:before{content:"\\2212 "}.rcbd p{margin:0 0 6px;font-size:13px;line-height:1.55}.rclab{display:block;font-size:11px;letter-spacing:.04em;color:#bda990;margin:12px 0 2px}.rcwrap{overflow-x:auto;-webkit-overflow-scrolling:touch;max-width:100%}.rctable{border-collapse:collapse;width:100%;margin-top:8px;font-size:13px;min-width:680px}.rctable th,.rctable td{text-align:left;padding:9px 10px;border-bottom:1px solid #6e5847;vertical-align:top}.rctable th{font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:#bda990;font-weight:400}.rctable td{color:#e3d2b6}.rctable td b{color:#f8efdc;font-weight:600}.rctable .num{font-family:Georgia,serif;font-size:15px;color:#f8efdc;white-space:nowrap}.rcard .rcact a.rcopen{color:#dcc9ad;border-bottom:1px solid #dcc9ad;padding:0 6px;font-size:14px;min-height:44px;display:inline-flex;align-items:center}.rcstep-off{display:none}.rcstep{animation:rcfade .32s ease}@keyframes rcfade{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}.rcskip{background:none;border:0;border-bottom:1px solid #7c6650;color:#bda990;padding:2px 0;font-size:12px;cursor:pointer;min-height:44px}';
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
    '<p class="label rcstep rcstep-off" id="rcSec2Lab" style="margin-top:22px">' + t.sec2 + '</p>' +
    '<form id="askbudget" class="rcstep rcstep-off" autocomplete="off"><input id="qbudget" inputmode="numeric" maxlength="12" aria-label="' + t.ariaBudget + '" placeholder="' + t.budgetPh + '"></form>' +
    '<div id="rentPanel" style="margin-top:16px"><div class="finding"><p>' + t.intro + '</p></div></div></section>' +
    '<section><p class="label" style="margin-top:26px">03 / Your shortlist - compare candidate homes</p>' +
    '<div class="finding"><p>Add rentals to the employee plan selected below - switch plans or start a new one any time. Costs you leave blank stay marked unknown and totals say "known so far" - nothing is estimated. Plans and entries stay on this device only; signed in on sauletrust.com you can save a rental to your own account library. A shared company workspace (colleagues seeing the same plans) is not available yet - to share a plan, copy or download its text below.</p></div>' +
    '<div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;margin:16px 0 2px">' +
    '<label class="rclab" for="rcPlanSel" style="margin:0">Employee plan</label>' +
    '<select id="rcPlanSel" style="background:#4a3629;color:#f6ead6;border:0;border-bottom:1px solid #836d55;font:inherit;padding:4px 0;max-width:280px"></select>' +
    '<button type="button" id="rcPlanNew" style="background:none;border:0;border-bottom:1px solid #7c6650;color:#dcc9ad;padding:2px 0;font-size:13px;min-height:44px">+ new plan</button>' +
    '<button type="button" id="rcPlanDel" style="background:none;border:0;border-bottom:1px solid #7c6650;color:#dcc9ad;padding:2px 0;font-size:13px;min-height:44px">remove this plan</button>' +
    '</div>' +
    '<label class="rclab" for="rcPlan">Name of this plan (employee or reference)</label><input id="rcPlan" maxlength="80" placeholder="e.g. R. Silva - Lisbon move, spring 2027">' +
    '<form id="addrental" autocomplete="off" style="margin-top:12px">' +
    '<div class="rcstep" id="rcStep1">' +
    '<label class="rclab" for="rcName">Name or short label</label><input id="rcName" maxlength="80" placeholder="e.g. Flat A - Bishan">' +
    '</div>' +
    '<div class="rcstep rcstep-off" id="rcStep2">' +
    '<label class="rclab" for="rcUrl">Listing link (optional)</label><input id="rcUrl" maxlength="300" inputmode="url" placeholder="https://...">' +
    '<p style="margin:2px 0 0"><button type="button" class="rcskip" id="rcSkipUrl" style="background:none;border:0;border-bottom:1px solid #7c6650;color:#bda990;padding:2px 0;font-size:12px;cursor:pointer;min-height:44px">no link - continue \u2192</button></p>' +
    '</div>' +
    '<div class="rcstep rcstep-off" id="rcStep3">' +
    '<div style="display:flex;gap:18px;flex-wrap:wrap"><span style="flex:1;min-width:150px"><label class="rclab" for="rcRent">Rent per month</label><input id="rcRent" inputmode="decimal" maxlength="12" placeholder="e.g. 3500"></span>' +
    '<span><label class="rclab" for="rcCur">Currency</label><select id="rcCur" style="background:#4a3629;color:#f6ead6;border:0;border-bottom:1px solid #836d55;font:inherit;padding:4px 0;width:100%">' +
    '<option>HKD</option><option>USD</option><option>GBP</option><option>SGD</option><option>EUR</option><option>CAD</option><option>Other</option></select></span></div>' +
    '<p style="margin:2px 0 0"><button type="button" class="rcskip" id="rcSkipRent" style="background:none;border:0;border-bottom:1px solid #7c6650;color:#bda990;padding:2px 0;font-size:12px;cursor:pointer;min-height:44px">rent unknown - continue \u2192</button></p>' +
    '</div>' +
    '<div class="rcstep rcstep-off" id="rcStep4">' +
    '<details id="rcMore" class="rcmore"><summary>Add costs <span class="muted">(optional - blanks stay unknown)</span></summary>' +
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
    '</details>' +
    '<div class="controls" style="justify-content:flex-start;gap:18px"><button type="submit" id="rcSubmit">Add rental →</button><button type="button" id="rcCancel" style="display:none;background:none;border:0;border-bottom:1px solid #7c6650;color:#dcc9ad;padding:2px 0;font-size:13px;min-width:0">cancel edit</button></div>' +
    '</div></form>' +
    '<p class="muted" style="margin-top:10px;font-size:12px">Your <a href="https://sauletrust.com/account/" target="_blank" rel="noopener" style="color:#dcc9ad">account library \u2197</a> holds rentals you save.</p>' +
    '<div id="rentCmp"></div>';
  sv.parentNode.insertBefore(v, sv.nextSibling);
  // Individual is the clean starting view; corporate planning stays intact behind the switch.
  var modeCopy={en:['Individual','Corporate','Who are you renting for?'],fr:['Particulier','Entreprise','Pour qui louez-vous ?'],de:['Privat','Unternehmen','Für wen mieten Sie?'],nl:['Particulier','Zakelijk','Voor wie huurt u?'],pl:['Prywatnie','Firma','Dla kogo wynajmujesz?']}[lang]||['Individual','Corporate','Who are you renting for?'];
  var modeBar=document.createElement('div');modeBar.id='rcMode';modeBar.setAttribute('role','group');modeBar.setAttribute('aria-label',modeCopy[2]);
  modeBar.innerHTML='<button type="button" id="rcIndividual" aria-pressed="true">'+modeCopy[0]+'</button><button type="button" id="rcCorporate" aria-pressed="false">'+modeCopy[1]+'</button>';
  v.insertBefore(modeBar,v.firstChild);
  var corporateSection=v.querySelectorAll('section')[1];corporateSection.id='rcCorporatePlanning';
  var modeCss=document.createElement('style');modeCss.textContent='#rcMode{display:flex;gap:20px;margin:0 0 28px}#rcMode button{background:none;border:0;border-bottom:1px solid transparent;color:#bda990;min-height:44px;padding:6px 0;font-size:12px;letter-spacing:.06em}#rcMode button[aria-pressed=true]{color:#f1e3c6;border-bottom-color:currentColor;font-weight:700}#rcCorporatePlanning[hidden]{display:none!important}';document.head.appendChild(modeCss);
  function setRentMode(corporate){v.dataset.rentMode=corporate?'corporate':'individual';corporateSection.hidden=!corporate;v.querySelector('#rcIndividual').setAttribute('aria-pressed',String(!corporate));v.querySelector('#rcCorporate').setAttribute('aria-pressed',String(corporate))}
  v.querySelector('#rcIndividual').onclick=function(){setRentMode(false)};v.querySelector('#rcCorporate').onclick=function(){setRentMode(true)};
  setRentMode(false);
  var rp = v.querySelector('#rentPanel');
  if (NOTE[lang]) { var np = document.createElement('p'); np.className = 'asm'; np.style.marginTop = '10px'; np.textContent = NOTE[lang]; v.querySelector('section').appendChild(np); }

  // --- Sources & credits line ---------------------------------------------------
  var scf = document.querySelector('#sourcesCredits footer');
  if (scf && !scf.querySelector('.rentsrc')) {
    var sp = document.createElement('p'); sp.className = 'rentsrc';
    sp.innerHTML = 'Rent: US typical asking rents = Zillow Research ZORI, Sep 2026, modelled - Data Provided by Zillow Group; UK city/area average rents = ONS Price Index of Private Rents, Sep 2026 (Source: Office for National Statistics licensed under the Open Government Licence v.3.0); Singapore Bishan = HDB median approved sublet rents by town and flat type, 2026-Q3 (data.gov.sg, Singapore Open Data Licence). Rental listings: Zillow, Rightmove, 28Hse, Idealista, Funda, ImmoScout24, SeLoger, Immobiliare.it (external portals, not verified by RE-agent; contacting the agent or landlord happens there). City averages, not quotes for any specific home. Not investment advice.';
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
  var rmrent = function (label) { return 'https://www.rightmove.co.uk/property-to-rent.html'; };
  var HSE_RENT = 'https://www.28hse.com/en/rent';
  // European rental portals: free listing routes; contacting the agent or landlord happens on the portal.
  var PT_SLUG = { 'lisbon': 'lisboa', 'lisboa': 'lisboa', 'porto': 'porto', 'oporto': 'porto', 'braga': 'braga', 'cascais': 'cascais', 'faro': 'faro', 'coimbra': 'coimbra' };
  function slugPt(city) { var k = normS(city); if (PT_SLUG[k]) return PT_SLUG[k]; return k.replace(/\s+/g, '-'); }
  var EU_PORTALS = {
    'Portugal': { name: 'Idealista', url: function (city) { return 'https://www.idealista.pt/en/arrendar-casas/' + slugPt(city) + '/'; } },
    'Spain': { name: 'Idealista', url: function () { return 'https://www.idealista.com/en/'; } },
    'Netherlands': { name: 'Funda', url: function () { return 'https://www.funda.nl/en/huur/'; } },
    'Germany': { name: 'ImmoScout24', url: function () { return 'https://www.immobilienscout24.de/wohnen/mietwohnungen.html'; } },
    'France': { name: 'SeLoger', url: function () { return 'https://www.seloger.com/'; } },
    'Italy': { name: 'Immobiliare.it', url: function () { return 'https://www.immobiliare.it/en/affitto-case/'; } }
  };

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
          act(extBtn(rmrent(label), 'Search on Rightmove (enter your city there)') + ' · ' + CMP_BTN) + '</div>';
      }
      return '<div class="finding"><h3>Renting in ' + label + '</h3>' +
        '<p>Official city-level rent figures are not wired for ' + label + ' yet - nothing invented. What you can do today: open real rental listings on Rightmove and compare typical rents across covered cities.</p>' +
        act(extBtn(rmrent(label), 'Search on Rightmove (enter your city there)') + ' · ' + CMP_BTN) + '</div>';
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
    var ep = EU_PORTALS[cand.country] || EU_PORTALS[String(cand.country).replace(/^The /, '')];
    if (ep) return '<div class="finding"><h3>' + esc(candName(cand)) + '</h3>' + countryCtx(cand) +
      '<p>Resolved from the GeoNames city database (34,000+ cities). Official city rent figures are not wired for ' + esc(cand.city) + ' yet - said plainly instead of invented. What you can do today: open real rental listings on ' + ep.name + ' and contact the agent or landlord there.</p>' +
      act(extBtn(ep.url(cand.city), 'See rentals on ' + ep.name)) + '</div>';
    return '<div class="finding"><h3>' + esc(candName(cand)) + '</h3>' + countryCtx(cand) +
      '<p>Resolved from the GeoNames city database (34,000+ cities). Rent figures and a listing route are not wired for ' + esc(cand.city) + ' yet - said plainly instead of invented.</p></div>';
  }

  // --- Compare actual rentals: visitor-entered, on-device only (SAU-44) ---------
  var CMP_KEY = 'stRentCmp:v1';
  var PLANS_KEY = 'stRentPlans:v1';
  var CURS = { HKD: 'HK$', USD: '$', GBP: '\u00a3', SGD: 'S$', EUR: '\u20ac', CAD: 'C$', Other: '' };
  var plans = [], ACTIVE = -1, EDIT_I = -1;
  function normItem(r) {
    if (!r.comps) {
      r.comps = fin(r.extra) ? [{ label: 'Extra monthly costs (entered as a total)', amt: r.extra }] : [];
      r.exAll = fin(r.extra);
      delete r.extra;
    }
    return r;
  }
  function curPlan() { return ACTIVE >= 0 && ACTIVE < plans.length ? plans[ACTIVE] : null; }
  function items() { var p = curPlan(); return p ? p.items : []; }
  function planName() { var p = curPlan(); return p && p.name ? p.name : ''; }
  function ensurePlan(name) {
    var p = curPlan();
    if (!p) { plans.push({ name: name || '', items: [] }); ACTIVE = plans.length - 1; p = plans[ACTIVE]; }
    return p;
  }
  function cmpLoad() {
    try {
      var raw = localStorage.getItem(PLANS_KEY);
      if (raw) {
        var d = JSON.parse(raw);
        if (d && Array.isArray(d.plans)) {
          plans = d.plans.map(function (p) { return { name: typeof p.name === 'string' ? p.name : '', items: (Array.isArray(p.items) ? p.items : []).map(normItem) }; });
          ACTIVE = typeof d.active === 'number' && d.active >= 0 && d.active < plans.length ? d.active : (plans.length ? 0 : -1);
        }
      }
      if (!plans.length) {
        var old = localStorage.getItem(CMP_KEY);
        if (old) {
          var o = JSON.parse(old);
          var oi = o && Array.isArray(o.items) ? o.items : [];
          var on = o && typeof o.plan === 'string' ? o.plan : '';
          if (oi.length || on) { plans = [{ name: on, items: oi.map(normItem) }]; ACTIVE = 0; cmpSave(); }
        }
      }
    } catch (e) { }
  }
  function cmpSave() { try { localStorage.setItem(PLANS_KEY, JSON.stringify({ ts: Date.now(), plans: plans, active: ACTIVE })); } catch (e) { } }
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
  function rentalText(r, i) {
      var f = fmtOne(r), t = '';
      t += (i + 1) + '. ' + (r.name || 'Rental ' + (i + 1)) + '\n';
      t += '   Listing: ' + (r.url || '-') + '\n';
      t += '   Figures as of: ' + (r.fdate || '-') + ' (reported by me, not verified)\n';
      t += '   Rent: ' + (f.rentK ? fm(r.cur, r.rent) + '/mo ' + r.cur : 'unknown') + '\n';
      if (!f.compsAny) t += '   Extra monthly costs: unknown' + '\n';
      else {
        (r.comps || []).forEach(function (c) { t += '   - ' + (c.label || 'cost') + ': ' + (fin(c.amt) ? fm(r.cur, c.amt) + '/mo' : 'unknown') + '\n'; });
        t += '   Listed extras total: ' + fm(r.cur, f.compSum) + '/mo' + (f.exK ? ' (all extra monthly costs)' : ' (other extras unknown - not estimated)') + '\n';
      }
      if (r.incl) t += '   Rent includes: ' + r.incl + '\n';
      t += (f.exK ? '   Known monthly total: ' : '   Known so far: ') + (f.rentK ? fm(r.cur, f.monthly) + '/mo' + (f.exK ? '' : ' (more monthly costs may apply)') : 'unknown') + '\n';
      t += '   One-off costs: agency fee ' + (f.feeK ? fm(r.cur, r.fee) : 'unknown') + ' - stamp duty/tax ' + (f.stK ? fm(r.cur, r.stamp) : 'unknown') + ' - other ' + (f.oncK ? fm(r.cur, r.once) : 'unknown') + '\n';
      t += '   Deposit (potentially refundable, subject to tenancy terms and deductions - excluded from expense total): ' + (f.depK ? fm(r.cur, r.dep) : 'unknown') + '\n';
      t += '   First month paid upfront (rent paid early - not an extra cost): ' + (f.fiK ? fm(r.cur, r.first) : 'unknown') + '\n';
      t += '   Known one-off total: ' + (f.onceAny ? fm(r.cur, f.onceSum) + (f.onceAll ? '' : ' (some one-off items unknown)') : 'unknown') + '\n\n';
    return t;
  }
  function exportText() {
    var d = new Date().toISOString().slice(0, 10);
    var s = (planName() ? 'RELOCATION PLAN - ' + planName() + '\n' : 'RENTAL COMPARISON - my figures\n') + 'Exported ' + d + ' from RE-agent on sauletrust.com. All figures below were entered by me (reported by me, not independently verified). Entries are saved on my device until I remove them; nothing is uploaded unless I choose "save to my account".\n\n';
    items().forEach(function (r, i) { s += rentalText(r, i); });
    s += 'Next steps: open each listing link and contact the agent or landlord there.\n';
    s += 'Note: comparison on the site uses only the figures entered and never compares across currencies.\n';
    return s;
  }
  var ACCT_ORIGIN = null;
  try { var _ao = (window.location.ancestorOrigins && window.location.ancestorOrigins.length) ? window.location.ancestorOrigins[0] : null; var _po = _ao || new URL(document.referrer).origin; if (window !== window.top && ['https://sauletrust.com', 'https://www.sauletrust.com'].indexOf(_po) >= 0) ACCT_ORIGIN = _po; } catch (e) { }
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
    var r = items()[i]; if (!r) return '';
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
    if (!items().length) { el.innerHTML = ''; return; }
    var sameCur = items().every(function (r) { return r.cur === items()[0].cur; });
    var h = '';
    items().forEach(function (r, i) {
      var f = fmtOne(r);
      h += '<div class="finding rcard" style="margin-top:12px"><h3>' + esc(r.name || 'Rental ' + (i + 1)) +
        (r.url ? ' <a href="' + esc(r.url) + '" target="_blank" rel="noopener" style="font-size:12px">listing ↗</a>' : '') + '</h3>';
      var qual = f.rentK ? (f.exK ? '' : (f.compsAny ? 'rent + listed extras - more may apply' : 'rent only - extra monthly costs unknown')) : '';
      h += '<p class="rcrent">' + (f.rentK ? '<b>' + fm(r.cur, r.rent) + '</b> <span class="muted">/ month rent</span>' : 'Rent: ' + unk(1)) + '</p>';
      h += '<p class="rctotal"><b>' + (f.rentK ? (f.exK ? 'Known monthly total: ' : 'Known so far: ') + fm(r.cur, f.monthly) + '/mo' : 'Monthly total: unknown') + '</b>' + (qual ? ' <span class="muted">(' + qual + ')</span>' : '') + '</p>';
      h += '<div class="rcact"><button type="button" class="rcacct rcsave" data-i="' + i + '">\u2606 save to my account</button><button type="button" class="rcedit" data-i="' + i + '">edit</button><button type="button" class="rcdel" data-i="' + i + '">remove</button>' + (r.url ? '<a class="rcopen" href="' + esc(r.url) + '" target="_blank" rel="noopener">Open listing - contact there ↗</a>' : '') + '</div>';
      h += '<details class="rcdet"><summary>Full cost breakdown</summary><div class="rcbd">';
      h += '<p>Rent: ' + (f.rentK ? fm(r.cur, r.rent) + '/mo ' + esc(r.cur) : unk(1)) + '</p>';
      if (!f.compsAny) h += '<p>Extra monthly costs: ' + unk(1) + '</p>';
      else {
        (r.comps || []).forEach(function (c) { h += '<p>' + esc(c.label || 'cost') + ': ' + (fin(c.amt) ? fm(r.cur, c.amt) + '/mo' : unk(1)) + '</p>'; });
        h += '<p>Listed extras total: ' + fm(r.cur, f.compSum) + '/mo' + (f.exK ? ' (all extra monthly costs)' : ' <span class="muted">(other extras unknown - nothing estimated)</span>') + '</p>';
      }
      if (r.incl) h += '<p>Rent includes: ' + esc(r.incl) + '</p>';
      h += '<p>Agency fee: ' + (f.feeK ? fm(r.cur, r.fee) : unk(1)) + '</p><p>Stamp duty / tax: ' + (f.stK ? fm(r.cur, r.stamp) : unk(1)) + '</p><p>Other one-off costs: ' + (f.oncK ? fm(r.cur, r.once) : unk(1)) + '</p>';
      h += '<p>Known one-off total: ' + ((f.feeK || f.oncK || f.stK) ? fm(r.cur, f.onceSum) + (f.onceAll ? '' : ' <span class="muted">(some one-off items unknown)</span>') : unk(1)) + '</p>';
      h += '<p>Deposit: ' + (f.depK ? fm(r.cur, r.dep) : unk(1)) + ' <span class="muted">(potentially refundable, subject to tenancy terms and deductions - excluded from expense total)</span></p>';
      h += '<p>First month paid upfront: ' + (f.fiK ? fm(r.cur, r.first) : unk(1)) + ' <span class="muted">(rent paid early - not an extra cost)</span></p>';
      h += '<p class="muted">Figures as of ' + (r.fdate ? esc(r.fdate) : 'no date given') + ' - reported by you, not independently verified.</p></div></details></div>';
    });
    h += '<div class="finding" style="margin-top:12px"><p><b>Side by side</b></p><div class="rcwrap"><table class="rctable"><thead><tr><th>Home</th><th>Monthly (known so far)</th><th>Upfront cash (known)</th><th>Still unknown</th><th>Listing</th></tr></thead><tbody>';
    items().forEach(function (r, i) {
      var f = fmtOne(r);
      var up = (f.depK ? r.dep : 0) + (f.feeK ? r.fee : 0) + (f.oncK ? r.once : 0) + (f.stK ? r.stamp : 0) + (f.fiK ? r.first : 0);
      var upAny = f.depK || f.feeK || f.oncK || f.stK || f.fiK, upAll = f.depK && f.feeK && f.oncK && f.stK && f.fiK;
      var un = [];
      if (!f.rentK) un.push('rent');
      if (!f.exK) un.push('extra monthly');
      if (!f.depK) un.push('deposit');
      if (!f.feeK) un.push('agency fee');
      if (!f.stK) un.push('tax/stamp');
      if (!f.fiK) un.push('first month');
      if (!f.oncK) un.push('other one-off');
      h += '<tr><td><b>' + esc(r.name || 'Rental ' + (i + 1)) + '</b></td><td class="num">' + (f.rentK ? fm(r.cur, f.monthly) + '/mo' : 'unknown') + (f.rentK && !f.exK ? '*' : '') + '</td><td class="num">' + (upAny ? fm(r.cur, up) + (upAll ? '' : '*') : 'unknown') + '</td><td>' + (un.length ? esc(un.join(', ')) : 'none') + '</td><td>' + (r.url ? '<a href="' + esc(r.url) + '" target="_blank" rel="noopener">listing ↗</a>' : '-') + '</td></tr>';
    });
    h += '</tbody></table></div><p class="muted" style="font-size:12px;margin-top:8px">Monthly = rent + listed extra monthly costs. Upfront cash = deposit + agency fee + tax/stamp duty + other one-offs + first month paid upfront (includes the refundable deposit: cash out at signing, not a lost cost). * some items still unknown - nothing is estimated. Figures entered by you, not independently verified.</p></div>';
    if (items().length > 1) {
      h += '<div class="finding" style="margin-top:12px"><p><b>Comparison</b><br>';
      if (!sameCur) h += 'Different currencies - totals are shown per rental, not compared across currencies.';
      else {
        var full = items().filter(function (r) { var f = fmtOne(r); return f.rentK && f.exK; });
        if (full.length === items().length) {
          var minI = 0; full.forEach(function (r, i) { if (fmtOne(r).monthly < fmtOne(full[minI]).monthly) minI = i; });
          h += 'Lowest known monthly total on the figures entered: <b>' + esc(full[minI].name || 'Rental ' + (minI + 1)) + '</b> at ' + fm(full[minI].cur, fmtOne(full[minI]).monthly) + '/mo. ';
        } else h += 'A full monthly-cost comparison is not possible yet - not all recurring monthly costs are known for ' + (items().length - full.length) + ' of ' + items().length + ' rentals. ';
      }
      h += 'Comparison uses only the figures you entered - check each listing for what is actually included.</p></div>';
    }
    h += '<p style="margin-top:14px"><button type="button" id="rcCopy" style="background:none;border:0;border-bottom:1px solid #7c6650;color:#dcc9ad;padding:2px 0;font-size:13px">Copy plan text</button> <button type="button" id="rcDl" style="background:none;border:0;border-bottom:1px solid #7c6650;color:#dcc9ad;padding:2px 0;font-size:13px">Download .txt</button> <span class="muted" id="rcCopied" style="font-size:12px"></span></p>';
    el.innerHTML = h;
    el.querySelectorAll('.rcdel').forEach(function (b) {
      b.onclick = function () { items().splice(+b.dataset.i, 1); cmpSave(); renderCmp(); };
    });
    el.querySelectorAll('.rcedit').forEach(function (b) {
      b.onclick = function () {
        var r = items()[+b.dataset.i]; EDIT_I = +b.dataset.i;
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
        v.querySelector('#rcMore').open = true; revealAllSteps(); v.querySelector('#rcName').focus();
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
  function showStep(n) { var s = v.querySelector('#rcStep' + n); if (s) s.classList.remove('rcstep-off'); }
  function hideSteps(from) { for (var i = from; i <= 4; i++) { var s = v.querySelector('#rcStep' + i); if (s) s.classList.add('rcstep-off'); } }
  function revealAllSteps() { for (var i = 1; i <= 4; i++) showStep(i); }
  v.querySelector('#rcName').addEventListener('input', function () { if (this.value.trim()) showStep(2); });
  v.querySelector('#rcUrl').addEventListener('input', function () { if (this.value.trim()) showStep(3); });
  v.querySelector('#rcSkipUrl').addEventListener('click', function () { showStep(3); });
  v.querySelector('#rcRent').addEventListener('input', function () { if (this.value.trim()) showStep(4); });
  v.querySelector('#rcSkipRent').addEventListener('click', function () { showStep(4); });
  v.querySelector('#rcCancel').addEventListener('click', function () {
    EDIT_I = -1;
    v.querySelector('#addrental').reset();
    resetComps(null);
    hideSteps(2);
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
    var actPlan = ensurePlan(v.querySelector('#rcPlan').value.trim());
    if (EDIT_I >= 0 && EDIT_I < actPlan.items.length) actPlan.items[EDIT_I] = item; else actPlan.items.push(item);
    if (actPlan.items.length > 6) actPlan.items = actPlan.items.slice(-6);
    EDIT_I = -1;
    v.querySelector('#rcSubmit').textContent = 'Add rental →';
    v.querySelector('#rcCancel').style.display = 'none';
    cmpSave(); renderPlanBar(); renderCmp(); e.target.reset(); resetComps(null); hideSteps(2);
  });
  cmpLoad(); renderCmp();
  var planInp = v.querySelector('#rcPlan');
  function syncPlanInput() { if (planInp) planInp.value = planName(); }
  function resetEntryForm() { var f = v.querySelector('#addrental'); if (f) f.reset(); resetComps(null); hideSteps(2); v.querySelector('#rcSubmit').textContent = 'Add rental \u2192'; v.querySelector('#rcCancel').style.display = 'none'; EDIT_I = -1; }
  function renderPlanBar() {
    var sel = v.querySelector('#rcPlanSel'); if (!sel) return;
    sel.innerHTML = '';
    if (!plans.length) { var o0 = document.createElement('option'); o0.textContent = 'No plans yet - add a rental to start one'; sel.appendChild(o0); }
    plans.forEach(function (p, i) { var o = document.createElement('option'); o.value = String(i); o.textContent = p.name || 'Plan ' + (i + 1); sel.appendChild(o); });
    if (ACTIVE >= 0) sel.value = String(ACTIVE);
    var del = v.querySelector('#rcPlanDel'); if (del) del.style.display = curPlan() ? '' : 'none';
  }
  if (planInp) planInp.addEventListener('input', function () { var p = ensurePlan(); p.name = planInp.value.trim().slice(0, 80); cmpSave(); renderPlanBar(); });
  var planSel = v.querySelector('#rcPlanSel');
  if (planSel) planSel.addEventListener('change', function () { if (!plans.length) return; ACTIVE = +planSel.value; resetEntryForm(); cmpSave(); syncPlanInput(); renderCmp(); });
  var planNew = v.querySelector('#rcPlanNew');
  if (planNew) planNew.addEventListener('click', function () { plans.push({ name: '', items: [] }); ACTIVE = plans.length - 1; resetEntryForm(); cmpSave(); renderPlanBar(); syncPlanInput(); renderCmp(); if (planInp) planInp.focus(); });
  var planDel = v.querySelector('#rcPlanDel');
  if (planDel) planDel.addEventListener('click', function () {
    var p = curPlan(); if (!p) return;
    if (p.items.length && !window.confirm('Remove "' + (p.name || 'this plan') + '" and its ' + p.items.length + ' rental' + (p.items.length > 1 ? 's' : '') + '? This cannot be undone.')) return;
    plans.splice(ACTIVE, 1); ACTIVE = plans.length ? Math.min(ACTIVE, plans.length - 1) : -1; resetEntryForm();
    cmpSave(); renderPlanBar(); syncPlanInput(); renderCmp();
  });
  renderPlanBar(); syncPlanInput();

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
    var bs = v.querySelector('#rcSec2Lab'), bf = v.querySelector('#askbudget');
    if (bs) bs.classList.remove('rcstep-off'); if (bf) bf.classList.remove('rcstep-off');
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
    rp.innerHTML = '<div class="finding warn"><h3>Could not resolve that place</h3><p>Worldwide city search (GeoNames database, 34,000+ cities over 15k population) found no match for what was typed - check the spelling or try the nearest major city. Rent figures live today: 20 US cities, London and Singapore (Bishan); rental-listing routes for the US, UK and Hong Kong, portal links for Portugal, Spain, the Netherlands, Germany, France and Italy.</p></div>';
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
