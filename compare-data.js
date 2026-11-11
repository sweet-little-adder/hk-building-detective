/* Extra comparison cities for the RE-agent Compare tab.
 *
 * Data policy:
 * - Free, verified sources only; every figure carries its source and period.
 * - No computed yield where price and rent cover different populations
 *   (values are shown side by side instead).
 * - Live fetch only where the provider is CORS-open (UK HPI); bounded URL
 *   allowlist, 24h cache, silent fallback to the bundled snapshot.
 * - Hong Kong and Canada configs are present but DISABLED:
 *   HK pending approval of the data.gov.hk terms (attribution + indemnity);
 *   Canada because CMHC's general site terms conflict with any dataset-level
 *   licence; publication blocked pending resolution (no provider outreach yet).
 *
 * Load BEFORE compare-tab.js. compare-tab.js calls
 * REAGENT_COMPARE_EXTRA.render(tbody) after rendering its own rows and
 * before wiring the city chips, so these rows get chips automatically.
 */
window.REAGENT_COMPARE_EXTRA = (function () {
  var PROVENANCE = {
    zillow: {
      name: 'Zillow Research ZHVI (typical home value) / ZORI (typical rent)',
      url: 'https://www.zillow.com/research/data/',
      files: [
        'https://files.zillowstatic.com/research/public_csvs/zhvi/City_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv',
        'https://files.zillowstatic.com/research/public_csvs/zori/City_zori_uc_sfrcondomfr_sm_month.csv'
      ],
      terms: 'https://www.zillow.com/corporate/terms-of-use/',
      attribution: 'Data Provided by Zillow Group',
      note: 'Modelled typical values, smoothed, seasonally adjusted; not transactions. ZHVI universe: all homes (single-family + condo/co-op). ZORI universe: all rentals incl. multifamily.',
      month: '2026-09'
    },
    ukhpi: {
      name: 'UK House Price Index (HM Land Registry / ONS)',
      url: 'https://landregistry.data.gov.uk/data/ukhpi',
      liveTemplate: 'https://landregistry.data.gov.uk/data/ukhpi/region/london/month/{YYYY-MM}.json',
      license: 'Open Government Licence v3.0',
      attribution: 'Contains HM Land Registry data \u00a9 Crown copyright and database right 2026',
      note: 'Average price of sold dwellings, London region.'
    },
    pipr: {
      name: 'ONS Price Index of Private Rents',
      url: 'https://www.ons.gov.uk/economy/inflationandpriceindices/datasets/priceindexofprivaterentsukmonthlypricestatistics',
      release: '21 October 2026 release, Table 1',
      license: 'Open Government Licence v3.0',
      attribution: 'Source: Office for National Statistics licensed under the Open Government Licence v.3.0',
      note: 'Average monthly rent, private rental stock, London region. Bulk xlsx, bundled as snapshot.',
      month: '2026-08'
    },
    sgRent: {
      name: 'HDB Median Rent By Town And Flat Type',
      url: 'https://data.gov.sg/datasets/d_23000a00c52996c55106084ed0339566/view',
      license: 'Singapore Open Data Licence',
      note: 'Median approved sublet rent by town and flat type, quarterly.',
      period: '2026-Q3'
    },
    sgResale: {
      name: 'HDB Resale Flat Prices',
      url: 'https://data.gov.sg/datasets/d_8b84c4ee58e3cfc0ece0d773c8ca6abc/view',
      license: 'Singapore Open Data Licence',
      note: 'Transaction records; median computed over 2026-07 to 2026-09 by flat type.',
      period: '2026-07..2026-09'
    },
    hkRvd: {
      name: 'HK Rating and Valuation Department - Private Domestic average rents (1.1M) and prices (1.2M) by class and region',
      url: 'https://data.gov.hk/en-data/dataset/hk-rvd-tsinfo_rvd-property-market-statistics',
      files: [
        'http://www.rvd.gov.hk/datagovhk/1.1M.csv',
        'http://www.rvd.gov.hk/datagovhk/1.2M.csv'
      ],
      terms: 'https://data.gov.hk/en/terms-and-conditions',
      attribution: 'Source: Rating and Valuation Department, the Government of the HKSAR, via DATA.GOV.HK',
      note: 'HKD per sqm (rent per month), same flat class and region for rent and price. Classes: A <40 sqm, B 40-69.9, C 70-99.9, D 100-159.9, E 160+ (verified against RVD Property Market Statistics 2026). Provisional.',
      month: '2026-09',
      BLOCKED: 'Terms require attribution + compliance + indemnity of the Government; publication pending owner approval.'
    },
    cmhc: {
      name: 'CMHC Rental Market Survey 2025',
      url: 'https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-data/data-tables/rental-market/rental-market-report-data-tables',
      file: 'https://assets.cmhc-schl.gc.ca/sites/cmhc/professional/housing-markets-data-and-research/housing-data-tables/rental-market/rental-market-report-data-tables/2025/rmr-canada-2025-en.xlsx',
      terms: 'https://www.cmhc-schl.gc.ca/about-us/terms-conditions',
      note: 'CMA-level average rents, purpose-built rental apartment structures 3+ units, October 2025.',
      BLOCKED: 'General CMHC site terms (verified 2026-11-11) restrict reproduction to personal use without prior written consent; a dataset-specific licence may exist but was not found. Blocked pending resolution, no outreach authorized.'
    }
  };

  // US cities: ZHVI / ZORI 2026-09, verified 2026-11-11 against the live CSVs.
  var US = [
    ["New York City", 825854, 4089],
    ["Los Angeles", 927891, 2772],
    ["San Francisco", 1441021, 4784],
    ["Miami", 583705, 2965],
    ["Boston", 761236, 3271],
    ["Seattle", 822572, 2227],
    ["Chicago", 334108, 2311],
    ["San Diego", 980490, 3004],
    ["Washington", 566961, 2484],
    ["Austin", 491960, 1571],
    ["Dallas", 303442, 1604],
    ["Houston", 259465, 1544],
    ["Atlanta", 380331, 1942],
    ["Denver", 520947, 1855],
    ["Las Vegas", 417475, 1700],
    ["Honolulu", 774710, 2715],
    ["Nashville", 425889, 1820],
    ["Phoenix", 404067, 1571],
    ["Portland", 524318, 1719],
    ["Philadelphia", 231584, 1757]
  ];

  // Singapore Bishan: median resale price (Jul-Sep 2026, n sales) and median
  // rent (2026-Q3) by flat type. Rented vs resold flats: different populations,
  // shown side by side only.
  var SG = [
    { type: '3 ROOM', price: 495888, sales: 17, rent: 3000 },
    { type: '4 ROOM', price: 750000, sales: 60, rent: 3700 },
    { type: '5 ROOM', price: 961500, sales: 38, rent: 4100 }
  ];

  // London snapshot (rent) - price comes live from UK HPI when possible.
  var LONDON_RENT = { all: 2332, flat: 2056, month: '2026-08' };
  var LONDON_PRICE_SNAPSHOT = { all: 554430, flat: 427310, month: '2026-08' };

  // Hong Kong RVD 2026-09 (provisional): [rent HKD/sqm/mo, price HKD/sqm].
  // Same class and region for both series. DISABLED pending terms approval.
  var HK = {
    enabled: false,
    rows: [
      ["Class A (<40 sqm)", "HK Island", 546, 144419], ["Class A (<40 sqm)", "Kowloon", 493, 134337], ["Class A (<40 sqm)", "New Territories", 382, 121237],
      ["Class B (40-69.9 sqm)", "HK Island", 438, 157538], ["Class B (40-69.9 sqm)", "Kowloon", 429, 136529], ["Class B (40-69.9 sqm)", "New Territories", 295, 109898],
      ["Class C (70-99.9 sqm)", "HK Island", 490, 187414], ["Class C (70-99.9 sqm)", "Kowloon", 453, 172982], ["Class C (70-99.9 sqm)", "New Territories", 301, 127637],
      ["Class D (100-159.9 sqm)", "HK Island", 481, 201680], ["Class D (100-159.9 sqm)", "Kowloon", 448, 188500], ["Class D (100-159.9 sqm)", "New Territories", 304, 129005],
      ["Class E (160+ sqm)", "HK Island", 496, 308113], ["Class E (160+ sqm)", "Kowloon", 512, 263433], ["Class E (160+ sqm)", "New Territories", 247, 110833]
    ],
    period: '2026-09 (provisional)'
  };

  // Canada CMHC October 2025 (CMA, purpose-built rental apartments):
  // [rent 1-bed, rent 2-bed, vacancy %]. DISABLED: CMHC general terms vs
  // dataset licence conflict unresolved (verified 2026-11-11).
  var CANADA = {
    enabled: false,
    rows: [
      ["Toronto", 2073, 2547, 3.0],
      ["Vancouver", 2107, 2696, 3.7],
      ["Edmonton", 1305, 1600, 3.8],
      ["Calgary", 1562, 1836, 5.0]
    ],
    period: 'October 2025'
  };

  function fmt(n) { return n.toLocaleString('en-US'); }
  function row(cells) {
    var tr = document.createElement('tr');
    tr.setAttribute('data-extra', '1');
    tr.style.display = 'none';
    tr.innerHTML = cells;
    return tr;
  }
  function srcd(html) {
    return '<td class="src"><details><summary>Sources</summary>' + html + '</details></td>';
  }
  function noYield(why) {
    return '<span class="missing">' + why + '</span>';
  }

  function usRow(c) {
    return row(
      '<td><b>' + c[0] + '</b></td>' +
      '<td>' + PROVENANCE.zillow.month + '</td>' +
      '<td><span class="missing">modelled</span></td>' +
      '<td><span class="num">$' + fmt(c[1]) + '</span><br><span class="asm">typical value, all homes</span></td>' +
      '<td><span class="num">$' + fmt(c[2]) + '</span><span class="asm">/mo</span><br><span class="asm">typical rent, all rentals</span></td>' +
      '<td>' + noYield('side by side - value and rent cover different homes') + '</td>' +
      srcd('Zillow Research ZHVI/ZORI, ' + PROVENANCE.zillow.month + ' - ' + PROVENANCE.zillow.attribution)
    );
  }

  function sgRow(s) {
    return row(
      '<td><b>Singapore Bishan, HDB ' + s.type + '</b></td>' +
      '<td>' + PROVENANCE.sgResale.period + ' / rent ' + PROVENANCE.sgRent.period + '</td>' +
      '<td>' + s.sales + ' sales</td>' +
      '<td><span class="num">S$' + fmt(s.price) + '</span><br><span class="asm">median resale, whole flat</span></td>' +
      '<td><span class="num">S$' + fmt(s.rent) + '</span><span class="asm">/mo</span><br><span class="asm">median, whole flat</span></td>' +
      '<td>' + noYield('side by side - rented vs resold flats differ') + '</td>' +
      srcd('HDB resale flat prices + HDB median rent by town and flat type (data.gov.sg, Singapore Open Data Licence)')
    );
  }

  function londonRow(p) {
    return row(
      '<td><b>London</b></td>' +
      '<td class="lp-per">' + p.month + ' / rent ' + LONDON_RENT.month + '</td>' +
      '<td><span class="missing">index</span></td>' +
      '<td class="lp-price"><span class="num">\u00a3' + fmt(p.flat) + '</span><br><span class="asm">avg sold price, flat/maisonette</span></td>' +
      '<td><span class="num">\u00a3' + fmt(LONDON_RENT.flat) + '</span><span class="asm">/mo</span><br><span class="asm">avg rent, flat/maisonette</span></td>' +
      '<td>' + noYield('side by side - sold vs rented stock differ') + '</td>' +
      srcd('UK House Price Index (HM Land Registry, ' + PROVENANCE.ukhpi.attribution + ', OGL v3.0)<br>ONS Price Index of Private Rents (' + PROVENANCE.pipr.attribution + ')')
    );
  }

  function hkRow(h) {
    return row(
      '<td><b>Hong Kong - ' + h[1] + '</b><br><span class="asm">' + h[0] + '</span></td>' +
      '<td>' + HK.period + '</td>' +
      '<td><span class="missing">official averages</span></td>' +
      '<td><span class="num">HK$' + fmt(h[3]) + '</span><span class="asm">/m&sup2;</span><br><span class="asm">avg transacted price</span></td>' +
      '<td><span class="num">HK$' + fmt(h[2]) + '</span><span class="asm">/m&sup2;/mo</span><br><span class="asm">avg rent, same class+region</span></td>' +
      '<td>' + noYield('side by side') + '</td>' +
      srcd(PROVENANCE.hkRvd.attribution + ' (tables 1.1M/1.2M, ' + HK.period + ')')
    );
  }

  function canadaRow(c) {
    return row(
      '<td><b>' + c[0] + '</b></td>' +
      '<td>' + CANADA.period + '</td>' +
      '<td><span class="missing">survey</span></td>' +
      '<td><span class="missing">no reusable sale-price source</span></td>' +
      '<td><span class="num">C$' + fmt(c[1]) + ' / C$' + fmt(c[2]) + '</span><span class="asm">/mo</span><br><span class="asm">avg rent 1-bed / 2-bed, rental apartments</span></td>' +
      '<td>' + noYield('no yield without sale price') + '</td>' +
      srcd('CMHC Rental Market Survey 2025 (CMA level)')
    );
  }

  // Live London price from UK HPI (CORS-open, anonymous). Tries the rent
  // snapshot's month first, then steps back. A fetched price is applied ONLY
  // when its period matches the bundled rent period, so price and rent never
  // silently mix periods. The period cell always shows what is displayed and
  // whether it came live, from cache, or from the bundled snapshot.
  function refreshLondon(tr) {
    var KEY = 'reagent-ukhpi-london';
    markLondon(tr, 'checking live source\u2026');
    try {
      var cached = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (cached && Date.now() - cached.at < 864e5) { applyLondon(tr, cached.data, 'live, cached'); return; }
    } catch (e) {}
    var tries = [];
    var d = new Date();
    for (var i = 0; i < 6; i++) {
      var m = d.getMonth() + 1 - i, y = d.getFullYear();
      while (m < 1) { m += 12; y--; }
      tries.push(y + '-' + ('0' + m).slice(-2));
    }
    (function next() {
      if (!tries.length) { markLondon(tr, 'live source unavailable - showing snapshot'); return; }
      var ym = tries.shift();
      fetch('https://landregistry.data.gov.uk/data/ukhpi/region/london/month/' + ym + '.json')
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (j) {
          var t = j.result.primaryTopic;
          if (t.refMonth !== ym) { next(); return; }
          var data = { month: t.refMonth, flat: Math.round(t.averagePriceFlatMaisonette), all: Math.round(t.averagePrice) };
          if (data.month !== LONDON_RENT.month) { markLondon(tr, 'latest price (' + data.month + ') and rent (' + LONDON_RENT.month + ') periods differ - showing matched snapshot'); return; }
          try { localStorage.setItem(KEY, JSON.stringify({ at: Date.now(), data: data })); } catch (e) {}
          applyLondon(tr, data, 'live');
        })
        .catch(next);
    })();
  }
  function applyLondon(tr, data, how) {
    if (data.month !== LONDON_RENT.month) { markLondon(tr, 'period mismatch - showing matched snapshot'); return; }
    var cell = tr.querySelector('.lp-price');
    if (cell) cell.innerHTML = '<span class="num">\u00a3' + fmt(data.flat) + '</span><br><span class="asm">avg sold price, flat/maisonette</span>';
    markLondon(tr, how);
  }
  function markLondon(tr, how) {
    var per = tr.querySelector('.lp-per');
    if (per) per.innerHTML = LONDON_PRICE_SNAPSHOT.month + ' / rent ' + LONDON_RENT.month + '<br><span class="asm">' + how + '</span>';
  }

  function render(tbody) {
    if (!tbody) return;
    US.forEach(function (c) { tbody.appendChild(usRow(c)); });
    var lr = londonRow(LONDON_PRICE_SNAPSHOT);
    tbody.appendChild(lr);
    markLondon(lr, 'snapshot');
    SG.forEach(function (s) { tbody.appendChild(sgRow(s)); });
    if (HK.enabled) HK.rows.forEach(function (h) { tbody.appendChild(hkRow(h)); });
    if (CANADA.enabled) CANADA.rows.forEach(function (c) { tbody.appendChild(canadaRow(c)); });
    // London live refresh (bounded, cached).
    var lrs = tbody.querySelectorAll('tr[data-extra] .lp-price');
    if (lrs.length) refreshLondon(lrs[lrs.length - 1].closest('tr'));
  }

  return { render: render, PROVENANCE: PROVENANCE };
})();
