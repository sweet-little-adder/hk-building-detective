# building detective

A Hong Kong building-records lookup prototype. Enter a building name or street;
it checks the address against two public Buildings Department datasets and shows
what it found, with source links and the coverage limits stated next to every result.

- s.24 removal orders (unauthorised building works): https://data.gov.hk/en-data/dataset/hk-bd-opendata-s24-order-1
- s.26 repair orders (dangerous buildings): https://data.gov.hk/en-data/dataset/hk-bd-opendata-s26-order-1
- Per-order compliance status: https://www.bd.gov.hk/en/resources/online-tools/orders-search/ordersearch.html

Static site: `index.html` + a bundled `buildings.json` snapshot (BD data, dated
2026-10-15, orders issued after 1 May 2023). No backend, no tracking, no AI.

Not legal, surveying or investment advice. A building not appearing in these
datasets is a coverage gap, not proof of a clean record.
