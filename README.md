# RE-agent (building detective)

Public building-records lookup prototype. Type a city, then an address; it checks
public records and market data and shows what it found, with source links and the
coverage limits stated next to every result.

Records lookup:
- Hong Kong: BD s.24 removal orders + s.26 repair orders (bundled snapshot `buildings.json`, dated 2026-10-15, orders issued after 1 May 2023) via https://data.gov.hk
- New York City: DOB Violations, live via NYC Open Data (3h2n-5cm9)
- Chicago: Building Violations, live via data.cityofchicago.org (22u3-xenr)
- Vancouver: Property Tax Report (assessed values, zoning, year built), live via opendata.vancouver.ca, 2026 roll - City of Vancouver proper, assessed != sale price
- Toronto: RentSafeTO apartment-building evaluations (bundled snapshot `toronto.json`, fetched 2026-11-09; rental apartment buildings 3+ storeys / 10+ units)
- Calgary: Current Year Property Assessments, live via data.calgary.ca (4bsw-nn7w)
- Edmonton: Property Assessment Data, live via data.edmonton.ca (q7d6-ambg)

Market snapshots: Zillow Research ZHVI/ZORI for 20 US cities; UK House Price Index
sold prices for 14 UK cities. City search resolves 34,000+ cities worldwide from a
bundled GeoNames extract (`cities.json`); places without wired data are named as
gaps rather than given invented numbers.

Static site: `index.html` + bundled JSON snapshots. No backend, no tracking, no AI.

Not legal, surveying or investment advice. A building not appearing in these
datasets is a coverage gap, not proof of a clean record.
