# pipeline/

`python3 build.py` (needs pandas, numpy, pycountry) turns `raw/google_trends_raw.json` into the JSON files in `../data/` and writes `qc_report.json`.

## Collection
- Source: Google Trends, worldwide, all categories, collected 25 Oct 2026 through the Explore page in a browser.
- What was saved: the same time-series and by-country numbers the page's CSV download gives. A cell Google marks as having no data is stored as `null`.
- Terms: streetwear, y2k fashion, gorpcore, quiet luxury, dark academia, coquette aesthetic.
  - Plain "coquette" was also collected and rejected. It is a French/Spanish word, so it held about a quarter of the six terms' share in 2004, before the aesthetic existed.
- Brands: 13 brands from Lyst's Hottest Brands lists, as search terms, monthly 2016–2025.
  - Brands whose names are everyday words (Off-White, Diesel, The Row, Valentino) were left out.

| raw query id | what |
|---|---|
| `alone:<term>` | each aesthetic on its own, monthly 2004–2025 (100 = its own peak) |
| `shareA`, `shareB` | the six terms on Google web search in two comparisons that share "streetwear" |
| `ytA`, `ytB` | the same two comparisons on YouTube search, 2008–2025 |
| `geoA:<era>`, `geoB:<era>` | by-country comparisons for each era |
| `bterm:<brand>` | each brand on its own, monthly 2016–2025 |
| `ctyA:<country>`, `ctyB:<country>` | the six terms for the US, Chile and India, monthly 2015–2025 (used for the country drill-down draft) |

## Cleaning and joining
- Google compares at most 5 terms and rescales each comparison to 100. To get six terms, two comparisons are joined through the shared "streetwear" term.
- Batch B is multiplied by sum(streetwear in A) / sum(streetwear in B). Summed totals are used, not month-by-month ratios, so rounding on small integers doesn't turn into noise.
- Country shares use the same anchor per country and are then renormalised to 100 %. Codes are converted to ISO alpha-3 for the map.

## Outputs (`../data/`)
| file | used by |
|---|---|
| `share_annual.json` | thesis bars (2019 vs 2025) |
| `timeline_worldwide.json` | "When" line chart |
| `geo_by_era.json` + `world-110m.json` | "Where" map |
| `lifecycle.json` | trend ring + table |
| `platforms.json` | Google vs YouTube dumbbell |
| `summary_by_year.json` | "What the year was wearing" |

## Derived-metric rules
- **Breakout**: first month at ≥ 25 of 100. **Fade**: last month at ≥ 25. **Months on top**: months at ≥ 50.
- **Platform share**: each aesthetic's share of the six on that platform, summed over 2023–2025.
- **Year's look**: the aesthetic whose share grew most that year. If none grew by at least 0.5 points, streetwear.
- **Rising brands**: year-over-year growth in annual mean search interest. Growth from a tiny base (prior-year mean < 10) is ignored.
