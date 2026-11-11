/* Compare tab for RE-agent: injects a COMPARE tab beside Buy/Sell. Standalone page: compare.html */
(function(){
var tabs=document.querySelector('.tabs'),buy=document.querySelector('#tabBuy'),sell=document.querySelector('#tabSell'),sv=document.querySelector('#sellView');
if(!tabs||!buy||!sell||!sv)return;
var lang=(document.documentElement.lang||'en').slice(0,2);
var L={en:'COMPARE',fr:'COMPARER',de:'VERGLEICH',nl:'VERGELIJK',pl:'PORÓWNAJ'};
var NOTE={fr:'Page en anglais.',de:'Inhalt auf Englisch.',nl:'Inhoud in het Engels.',pl:'Treść po angielsku.'};
var st=document.createElement('style');st.textContent="#cmpView{display:none}#cmpView h2{font-family:Georgia,'Times New Roman',serif;font-size:19px;font-weight:400;color:#f1e3c6}#cmpView .note{background:#4a3629;border:1px solid #6e5847;color:#e8d9b8;padding:12px 16px;font-size:12.5px;line-height:1.65;margin:18px 0 6px;max-width:760px}#cmpView .note b{color:#f8efdc}#cmpView table{border-collapse:collapse;width:100%;margin-top:26px;font-size:13.5px}#cmpView th,#cmpView td{text-align:left;padding:11px 12px;border-bottom:1px solid #6e5847;vertical-align:top}#cmpView th{font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:#bda990;font-weight:400}#cmpView td{color:#e3d2b6}#cmpView td b{color:#f8efdc;font-weight:600}#cmpView .num{font-family:Georgia,serif;font-size:16px;color:#f8efdc}#cmpView .src,#cmpView .asm,#cmpView .excl{font-size:11.5px;color:#bda990;line-height:1.5}#cmpView .missing{color:#8f7c64;font-style:italic}#cmpView ul{margin:10px 0;padding-left:18px;max-width:760px}#cmpView li{margin:7px 0;color:#d3bfa2;font-size:12.5px;line-height:1.6}#cmpView li b{color:#f1e3c6}#cmpView details.meth{margin:26px 0 10px}#cmpView details summary{cursor:pointer;font-family:Georgia,serif;font-size:20px}#cmpView td.src summary{font-size:12px;font-family:inherit;opacity:.8}#cmpView details.meth[open] summary{margin-bottom:12px}#cmpView .tw{overflow-x:auto;-webkit-overflow-scrolling:touch;max-width:100%}#cmpView .tw table{min-width:820px}";document.head.appendChild(st);
var cmp=document.createElement('button');cmp.id='tabCmp';cmp.type='button';cmp.textContent=L[lang]||L.en;tabs.appendChild(cmp);
var v=document.createElement('div');v.id='cmpView';
v.innerHTML="<div class=\"tw\"><table id=\"t\">\n  <thead><tr>\n    <th>City</th><th>Price period</th><th>Sales</th><th>Price</th><th>Rent</th><th>Yield / notes</th><th>Source</th>\n  </tr></thead>\n  <tbody></tbody>\n</table></div>\n\n<details class=\"coverage\" style=\"margin-top:22px\"><summary>BETA &middot; city estimates, some costs excluded <span aria-hidden=\"true\">+</span></summary><p class=\"lead\">Compare estimated rental yields by city. These are city averages, not individual properties. Some ownership costs aren't included. Not investment advice.</p></details>";
var scf=document.querySelector('#sourcesCredits footer');
if(scf&&!scf.querySelector('.cmpsrc')){var sp=document.createElement('p');sp.className='cmpsrc';
sp.innerHTML='Compare (beta): Paris, Lyon, Marseille prices = DVF official transactions 2026 H1, median EUR/m&sup2;, apartments (<a href="https://www.data.gouv.fr/datasets/demandes-de-valeurs-foncieres">data.gouv.fr</a>, Licence Ouverte 2.0); rents = Carte des loyers 2025 (ANCT/DHUP), modelled commune-level listing indicators, EUR/m&sup2;/month (Licence Ouverte 2.0). Partial-net = gross minus 5% vacancy and 5% maintenance, with ~7.5% acquisition costs (varies by department and buyer). Excludes property tax, service charges, financing, furnishing, letting fees. Singapore Bishan: HDB resale prices only - buyer eligibility rules apply and no sourced rent is wired, so no yield shown. Illustrative city aggregates, not investment advice.';
scf.appendChild(sp);
  var sp2=document.createElement('p');sp2.className='cmpsrc cmpsrc2';
  sp2.innerHTML='More cities: US typical values/rents = Zillow Research ZHVI/ZORI, Sep 2026, modelled - Data Provided by Zillow Group; London = UK House Price Index (Contains HM Land Registry data &copy; Crown copyright and database right 2026, OGL v3.0) + ONS Price Index of Private Rents (OGL v3.0), Aug 2026; Singapore Bishan = HDB resale prices and median rents via data.gov.sg (Singapore Open Data Licence). City or region averages for different homes, not individual properties or investment advice.';
  scf.appendChild(sp2);}
if(NOTE[lang]){var p=document.createElement('p');p.className='asm';p.style.marginTop='14px';p.textContent=NOTE[lang];v.insertBefore(p,v.firstChild)}
sv.parentNode.insertBefore(v,sv.nextSibling);
var bv=document.querySelector('#buyView');
var h1=document.querySelector('h1'),h1o=h1?h1.innerHTML:'',HT={en:'Estimate Yield',fr:'Estimer le rendement',de:'Rendite sch\u00e4tzen',nl:'Rendement schatten',pl:'Oszacuj rentowno\u015b\u0107'};
var ST={en:'Prepare your property listing',fr:'Pr\u00e9parez votre annonce',de:'Ihr Inserat vorbereiten',nl:'Bereid uw advertentie voor',pl:'Przygotuj og\u0142oszenie'};
function showCmp(){if(h1)h1.textContent=HT[lang]||HT.en;cmp.classList.add('on');buy.classList.remove('on');sell.classList.remove('on');if(bv)bv.style.display='none';sv.style.display='none';v.style.display='block'}
function hideCmp(){if(h1)h1.innerHTML=h1o;cmp.classList.remove('on');v.style.display='none'}
function showSell(){hideCmp();if(h1)h1.textContent=ST[lang]||ST.en}
cmp.addEventListener('click',showCmp);
buy.addEventListener('click',hideCmp);sell.addEventListener('click',showSell);
document.querySelectorAll('a[href="compare.html"]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();showCmp()})});


const d = {
  "generatedAt": "2026-11-11T12:15:59.108Z",
  "rows": [
    {
      "source": {
        "id": "fr-dvf",
        "name": "DVF - Demandes de valeurs foncieres (DGFiP / Etalab)",
        "url": "https://www.data.gouv.fr/datasets/demandes-de-valeurs-foncieres",
        "license": "Licence Ouverte 2.0",
        "country": "FR",
        "kind": "transactions"
      },
      "city": "Paris",
      "query": {
        "dept": "75",
        "communeCode": [
          "101",
          "102",
          "103",
          "104",
          "105",
          "106",
          "107",
          "108",
          "109",
          "110",
          "111",
          "112",
          "113",
          "114",
          "115",
          "116",
          "117",
          "118",
          "119",
          "120"
        ],
        "type": "Appartement",
        "nature": "Vente"
      },
      "transactionRecords": 17643,
      "estimatedUniqueSales": 15425,
      "period": {
        "first": "2026-01-02",
        "last": "2026-06-30"
      },
      "medianPricePerSqm": 10213,
      "medianPrice": 444000,
      "currency": "EUR",
      "computedAt": "2026-11-11T12:15:48.495Z",
      "rent": {
        "source": {
          "id": "fr-carte-des-loyers",
          "name": "Carte des loyers - indicateurs de loyers d'annonce par commune 2025 (ANCT/DHUP)",
          "url": "https://www.data.gouv.fr/datasets/carte-des-loyers-indicateurs-de-loyers-dannonce-par-commune-en-2025",
          "license": "Licence Ouverte 2.0",
          "country": "FR",
          "kind": "rent-indicators",
          "caveat": "listing rents (annonces), modelled per commune; not signed-lease data"
        },
        "area": "paris",
        "codes": [
          "75101",
          "75102",
          "75103",
          "75104",
          "75105",
          "75106",
          "75107",
          "75108",
          "75109",
          "75110",
          "75111",
          "75112",
          "75113",
          "75114",
          "75115",
          "75116",
          "75117",
          "75118",
          "75119",
          "75120"
        ],
        "rentPerSqmMonth": 32.13,
        "lowerBound": 25.36,
        "upperBound": 40.77,
        "observations": 269792,
        "parts": 20,
        "currency": "EUR",
        "computedAt": "2026-11-11T12:15:48.546Z"
      },
      "yield": {
        "ok": true,
        "basis": "per-sqm city aggregate (not an individual property)",
        "currency": "EUR",
        "grossYieldPct": 3.78,
        "netYieldPct": 3.16,
        "periods": {
          "price": "DVF transactions 2026-01-02..2026-06-30",
          "rent": "Carte des loyers 2025 listing indicators (different period than prices)"
        },
        "assumptions": [
          "rent: fr-carte-des-loyers - 32.13/m2/month (Carte des loyers 2025 listing indicators (different period than prices))",
          "price: DVF transactions 2026-01-02..2026-06-30",
          "acquisition: DMTO 5.81% (dept 4.50% + communal 1.20% + frais 2.37% of dept) + CSI 0.10% + notary ~1% + debours ~0.5%, approx (7.5%)",
          "vacancy 5% + maintenance 5% of rent (assumption, not sourced)",
          "copropriete charges and taxe fonciere excluded (vary by property); net yield shown is rent minus vacancy+maintenance only"
        ],
        "computedAt": "2026-11-11T12:15:48.546Z"
      }
    },
    {
      "source": {
        "id": "fr-dvf",
        "name": "DVF - Demandes de valeurs foncieres (DGFiP / Etalab)",
        "url": "https://www.data.gouv.fr/datasets/demandes-de-valeurs-foncieres",
        "license": "Licence Ouverte 2.0",
        "country": "FR",
        "kind": "transactions"
      },
      "city": "Lyon",
      "query": {
        "dept": "69",
        "communeCode": [
          "381",
          "382",
          "383",
          "384",
          "385",
          "386",
          "387",
          "388",
          "389"
        ],
        "type": "Appartement",
        "nature": "Vente"
      },
      "transactionRecords": 4061,
      "estimatedUniqueSales": 3261,
      "period": {
        "first": "2026-01-05",
        "last": "2026-06-30"
      },
      "medianPricePerSqm": 4632,
      "medianPrice": 260750,
      "currency": "EUR",
      "computedAt": "2026-11-11T12:15:50.663Z",
      "rent": {
        "source": {
          "id": "fr-carte-des-loyers",
          "name": "Carte des loyers - indicateurs de loyers d'annonce par commune 2025 (ANCT/DHUP)",
          "url": "https://www.data.gouv.fr/datasets/carte-des-loyers-indicateurs-de-loyers-dannonce-par-commune-en-2025",
          "license": "Licence Ouverte 2.0",
          "country": "FR",
          "kind": "rent-indicators",
          "caveat": "listing rents (annonces), modelled per commune; not signed-lease data"
        },
        "area": "lyon",
        "codes": [
          "69381",
          "69382",
          "69383",
          "69384",
          "69385",
          "69386",
          "69387",
          "69388",
          "69389"
        ],
        "rentPerSqmMonth": 16.57,
        "lowerBound": 12.79,
        "upperBound": 21.5,
        "observations": 144607,
        "parts": 9,
        "currency": "EUR",
        "computedAt": "2026-11-11T12:15:50.714Z"
      },
      "yield": {
        "ok": true,
        "basis": "per-sqm city aggregate (not an individual property)",
        "currency": "EUR",
        "grossYieldPct": 4.29,
        "netYieldPct": 3.59,
        "periods": {
          "price": "DVF transactions 2026-01-05..2026-06-30",
          "rent": "Carte des loyers 2025 listing indicators (different period than prices)"
        },
        "assumptions": [
          "rent: fr-carte-des-loyers - 16.57/m2/month (Carte des loyers 2025 listing indicators (different period than prices))",
          "price: DVF transactions 2026-01-05..2026-06-30",
          "acquisition: DMTO 5.81% (dept 4.50% + communal 1.20% + frais 2.37% of dept) + CSI 0.10% + notary ~1% + debours ~0.5%, approx (7.5%)",
          "vacancy 5% + maintenance 5% of rent (assumption, not sourced)",
          "copropriete charges and taxe fonciere excluded (vary by property); net yield shown is rent minus vacancy+maintenance only"
        ],
        "computedAt": "2026-11-11T12:15:50.714Z"
      }
    },
    {
      "source": {
        "id": "fr-dvf",
        "name": "DVF - Demandes de valeurs foncieres (DGFiP / Etalab)",
        "url": "https://www.data.gouv.fr/datasets/demandes-de-valeurs-foncieres",
        "license": "Licence Ouverte 2.0",
        "country": "FR",
        "kind": "transactions"
      },
      "city": "Marseille",
      "query": {
        "dept": "13",
        "communeCode": [
          "201",
          "202",
          "203",
          "204",
          "205",
          "206",
          "207",
          "208",
          "209",
          "210",
          "211",
          "212",
          "213",
          "214",
          "215",
          "216"
        ],
        "type": "Appartement",
        "nature": "Vente"
      },
      "transactionRecords": 7917,
      "estimatedUniqueSales": 5599,
      "period": {
        "first": "2026-01-02",
        "last": "2026-06-30"
      },
      "medianPricePerSqm": 3871,
      "medianPrice": 220000,
      "currency": "EUR",
      "computedAt": "2026-11-11T12:15:52.831Z",
      "rent": {
        "source": {
          "id": "fr-carte-des-loyers",
          "name": "Carte des loyers - indicateurs de loyers d'annonce par commune 2025 (ANCT/DHUP)",
          "url": "https://www.data.gouv.fr/datasets/carte-des-loyers-indicateurs-de-loyers-dannonce-par-commune-en-2025",
          "license": "Licence Ouverte 2.0",
          "country": "FR",
          "kind": "rent-indicators",
          "caveat": "listing rents (annonces), modelled per commune; not signed-lease data"
        },
        "area": "marseille",
        "codes": [
          "13201",
          "13202",
          "13203",
          "13204",
          "13205",
          "13206",
          "13207",
          "13208",
          "13209",
          "13210",
          "13211",
          "13212",
          "13213",
          "13214",
          "13215",
          "13216"
        ],
        "rentPerSqmMonth": 16.3,
        "lowerBound": 12.76,
        "upperBound": 20.84,
        "observations": 148089,
        "parts": 16,
        "currency": "EUR",
        "computedAt": "2026-11-11T12:15:52.875Z"
      },
      "yield": {
        "ok": true,
        "basis": "per-sqm city aggregate (not an individual property)",
        "currency": "EUR",
        "grossYieldPct": 5.05,
        "netYieldPct": 4.23,
        "periods": {
          "price": "DVF transactions 2026-01-02..2026-06-30",
          "rent": "Carte des loyers 2025 listing indicators (different period than prices)"
        },
        "assumptions": [
          "rent: fr-carte-des-loyers - 16.3/m2/month (Carte des loyers 2025 listing indicators (different period than prices))",
          "price: DVF transactions 2026-01-02..2026-06-30",
          "acquisition: DMTO 5.81% (dept 4.50% + communal 1.20% + frais 2.37% of dept) + CSI 0.10% + notary ~1% + debours ~0.5%, approx (7.5%)",
          "vacancy 5% + maintenance 5% of rent (assumption, not sourced)",
          "copropriete charges and taxe fonciere excluded (vary by property); net yield shown is rent minus vacancy+maintenance only"
        ],
        "computedAt": "2026-11-11T12:15:52.875Z"
      }
    },
    {
      "source": {
        "id": "sg-hdb-resale",
        "name": "HDB Resale Flat Prices (data.gov.sg)",
        "url": "https://data.gov.sg/datasets?query=Resale%20Flat%20Prices",
        "license": "Singapore Open Data Licence",
        "country": "SG",
        "kind": "transactions"
      },
      "query": {
        "town": "BISHAN",
        "since": "2025-11"
      },
      "transactions": 447,
      "period": {
        "first": "2025-11",
        "last": "2026-11"
      },
      "medianPrice": 850000,
      "medianPricePerSqm": 8000,
      "currency": "SGD",
      "note": "HDB resale (public housing); leasehold with remaining lease affecting comparability.",
      "computedAt": "2026-11-11T12:15:59.108Z",
      "city": "Singapore (Bishan, HDB resale)",
      "rent": null,
      "yield": {
        "ok": false,
        "reason": "no sourced rent wired yet for SG"
      }
    }
  ]
};
{
  const tb = document.querySelector('#cmpView #t tbody');
  for (const r of d.rows) {
    const sales = r.estimatedUniqueSales
      ? `<span title="${(r.transactionRecords || r.transactions).toLocaleString()} records">${r.estimatedUniqueSales.toLocaleString()}</span><br><span class="asm">est. unique sales</span>`
      : `${(r.transactionRecords || r.transactions).toLocaleString()} records`;
    const rentCell = r.rent ? `<span class="num">${r.rent.rentPerSqmMonth}</span> ${r.currency}<br><span class="asm">per m&sup2;, listing, 2025</span>` : '<span class="missing">no sourced rent</span>';
    let yc;
    if (r.yield && r.yield.ok) {
      yc = `<span class="num">${r.yield.grossYieldPct}% / ${r.yield.netYieldPct}%</span><br>
        <span class="excl">excl. tax, charges, financing</span>`;
    } else {
      yc = `<span class="missing">${(r.yield && r.yield.reason) || '-'}</span>`;
    }
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><b>${r.city}</b></td>
      <td>${r.period.first} &rarr; ${r.period.last}</td>
      <td>${sales}</td>
      <td><span class="num">${r.medianPricePerSqm.toLocaleString()}</span> ${r.currency}<br><span class="asm">median /m&sup2;</span></td>
      <td>${rentCell}</td>
      <td>${yc}</td>
      <td class="src"><details><summary>Sources</summary>${r.source.name}${r.rent ? '<br>' + r.rent.source.name : ''}</details></td>`;
    tb.appendChild(tr);
  }
}

/* Extra verified cities (compare-data.js): rendered before chip wiring so
   they get chips too. Live sources are fetched on demand inside the module. */
if(window.REAGENT_COMPARE_EXTRA&&window.REAGENT_COMPARE_EXTRA.render){
  window.REAGENT_COMPARE_EXTRA.render(document.querySelector('#cmpView #t tbody'));
}

(function(){
  var tw=v.querySelector('.tw'),tb=v.querySelector('#cmpView #t tbody');
  if(!tw||!tb)return;
  var cs=document.createElement('style');
  cs.textContent='#cmpView .cmpsel{margin:24px 0 0;max-width:760px;position:relative;z-index:5}#cmpView .cmpdet{position:relative}#cmpView .cmpmenu{position:absolute;top:calc(100% + 8px);left:0;right:0;box-sizing:border-box;max-height:min(55vh,440px);overflow-y:auto;overscroll-behavior:contain;background:#57443e;border:1px solid #8b735e;padding:16px 18px;box-shadow:0 12px 26px #20181255;z-index:20}#cmpView .cmpmenu .chips{margin:0;display:flex;flex-wrap:wrap;gap:0 16px}#cmpView .cmpmenu .chips button{min-height:44px}#cmpView .cmpdet summary:focus-visible{outline:1px solid #dcc9ad;outline-offset:5px}#cmpView .cmpdet summary{cursor:pointer;font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:#bda990;margin:0 0 6px;list-style:none;line-height:1.7;display:flex;align-items:baseline;gap:8px}#cmpView .cmpdet summary .cmpsumtxt{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#cmpView .cmpdet summary .cmpsign{flex:none;font-size:14px;font-weight:600;opacity:.8}#cmpView .cmpdet summary::-webkit-details-marker{display:none}#cmpView .cmpdet[open] summary{margin-bottom:6px}#cmpView .cmpsel .chips button{padding:10px 2px;font-size:14px;touch-action:manipulation;-webkit-tap-highlight-color:transparent}#cmpView .cmpsel input,#cmpView .cmpsel .controls button{touch-action:manipulation}@media (max-width:600px){#cmpView .cmpsel .chips button{padding:13px 2px}}#cmpView .cmpsel .chips button.on{color:#fdf6e9;border-bottom-color:#f1e3c6}@media (hover:none){#cmpView .cmpsel .chips button:hover{color:#dcc9ad;border-bottom-color:#7c6650}#cmpView .cmpsel .chips button.on:hover{color:#fdf6e9;border-bottom-color:#f1e3c6}}#cmpView .cmpnone{display:none;margin:16px 0 0;color:#bda990;font-size:13px}#cmpView .cmpform{display:flex;flex-wrap:wrap;align-items:flex-end;gap:0 14px;padding:0;background:none;margin-top:16px}#cmpView .cmpform input{flex:1;min-width:0}#cmpView .cmpform .controls{padding-top:0;flex:none}#cmpView .cmpform .controls button{min-width:100px;white-space:nowrap}@media (max-width:600px){#cmpView .cmpform input{flex-basis:100%}#cmpView .cmpform .controls{flex-basis:100%;padding-top:14px}}';
  document.head.appendChild(cs);
  var dataRows=[].slice.call(tb.querySelectorAll('tr'));
  var otherCities=['Hong Kong','Manchester','Vancouver','Toronto','Calgary','Edmonton'];
  var AL={'nyc':'New York City','new york':'New York City','sf':'San Francisco','la':'Los Angeles','hk':'Hong Kong','hongkong':'Hong Kong'};
  var sel=document.createElement('div');sel.className='cmpsel';
  sel.innerHTML='<details class="cmpdet"><summary><span class="cmpsumtxt">Select your favourite cities to compare</span><span class="cmpsign" aria-hidden="true">&#9662;</span></summary><div class="cmpmenu" role="group" aria-label="Cities to compare"><div class="chips"></div><form class="cmpform" autocomplete="off"><input maxlength="80" aria-label="City to compare" placeholder="e.g. Hong Kong, London, Tokyo"><div class="controls"><button type="submit">Add city &rarr;</button></div></form></div></details>';
  var det=sel.querySelector('details'),box=sel.querySelector('.chips'),sum=sel.querySelector('summary'),input=sel.querySelector('input'),form=sel.querySelector('form');
  det.addEventListener('toggle',sync);
  document.addEventListener('pointerdown',function(e){if(det.open&&!det.contains(e.target))det.open=false});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&det.open){det.open=false;sum.focus();e.preventDefault()}});
  var none=document.createElement('p');none.className='cmpnone';none.textContent='Select at least one city to compare.';
  var chips=[];
  function sync(){
    var n=0;chips.forEach(function(c){if(c.on)n++});
    none.style.display=n?'none':'block';tw.style.display=n?'':'none';
    sum.querySelector('.cmpsign').textContent=det.open?'\u25b4':'\u25be';
  }
  function naRow(name){var tr=document.createElement('tr');var t1=document.createElement('td'),b=document.createElement('b');b.textContent=name;t1.appendChild(b);var t2=document.createElement('td');t2.colSpan=6;var s=document.createElement('span');s.className='missing';s.textContent='not available in this comparison';t2.appendChild(s);tr.appendChild(t1);tr.appendChild(t2);return tr}
  function addChip(name,row,on){
    var c=document.createElement('button');c.type='button';c.setAttribute('data-c',name);
    var item={el:c,name:name,row:row,na:null,on:false};
    function render(){c.textContent=item.name;c.classList.toggle('on',item.on);c.setAttribute('aria-pressed',item.on?'true':'false')}
    function setOn(x){item.on=x;if(item.row){item.row.style.display=x?'':'none'}else{if(x&&!item.na){item.na=naRow(name);tb.appendChild(item.na)}if(!x&&item.na){item.na.remove();item.na=null}}render();sync()}
    c.addEventListener('click',function(){setOn(!item.on);c.blur()});
    chips.push(item);box.appendChild(c);setOn(on);
    return item;
  }
  dataRows.forEach(function(tr){var b=tr.querySelector('td b');addChip((b?b.textContent:'City').split(' (')[0],tr,!tr.hasAttribute('data-extra'))});
  otherCities.forEach(function(n){addChip(n,null,false)});
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var s=(input.value||'').trim().replace(/\s+/g,' ');if(!s)return;
    var k=s.toLowerCase();if(AL[k]){s=AL[k];k=s.toLowerCase()}
    var hit=null;chips.forEach(function(c){if(c.name.toLowerCase()===k)hit=c});
    if(hit){if(!hit.on)hit.el.click()}
    else{addChip(s,null,true)}
    input.value='';
  });
  tw.parentNode.insertBefore(sel,tw);tw.parentNode.insertBefore(none,tw);
})();

function hashCmp(){return (location.hash||'').toLowerCase()==='#compare'}
if(hashCmp())showCmp();
window.addEventListener('hashchange',function(){if(hashCmp())showCmp()});
window.addEventListener('message',function(e){
  if(e.origin!=='https://sauletrust.com'&&e.origin!=='https://www.sauletrust.com')return;
  if(e.data&&e.data.reagentTab==='compare')showCmp();
});
})();
