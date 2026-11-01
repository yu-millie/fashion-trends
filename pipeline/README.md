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
| `country_trends.json` | country zoom-in (US, Chile, India; `ctyA/ctyB` queries) |
| `peaks.json` | who peaks first, Google vs YouTube |
| `seasonal.json` | seasonal clock |
| `brands.json` | the hot list (brand search growth) |
| `lyst.json` | Search vs. shop (Lyst Index ranks) |
| `bundle.js` | every JSON above in one script, so the page works from `file://` |

New derived rules (Prototype II):
- **Peak month**: month of the highest 3-month centred average. Google uses each term alone (2004–2025); YouTube uses the anchored comparison (2008–2025).
- **Seasonal clock**: mean interest per calendar month over 2021–2025, divided by that aesthetic's best month (best = 100).
- **Brand ribbons**: each brand alone (own peak = 100), 3-month centred average.

## Derived-metric rules
- **Breakout**: first month at ≥ 25 of 100. **Fade**: last month at ≥ 25. **Months on top**: months at ≥ 50.
- **Platform share**: each aesthetic's share of the six on that platform, summed over 2023–2025.
- **Year's look**: the aesthetic whose share grew most that year. If none grew by at least 0.5 points, streetwear.
- **Rising brands**: year-over-year growth in annual mean search interest. Growth from a tiny base (prior-year mean < 10) is ignored.

## Lyst Index (the shop side)
- `raw/lyst_index.csv`: one row per quarter, brands in rank order, with the source URL. Transcribed on 1 Nov 2026 from Lyst's own Index pages (lyst.co.uk / lyst.com) for Q3 2018 – Q3 2026, and from press coverage (Hypebeast, Harper's Bazaar MY, Refinery29) for Q2 2017 – Q2 2018, which Lyst no longer hosts.
- Only the top 10 could be recovered up to Q4 2018 (the press lists stop at 10, and on Lyst's 2018 pages ranks 11–20 sit behind a button that does not load as text). From Q1 2019 on, the full top 20 is recorded. Q4 2017 could not be found. In Q3 2017 rank 9 was never reported, so it is stored as `?`.
- Spellings were merged (Off-White™ → Off-White, YEEZY → Yeezy, D&G → Dolce & Gabbana, Ugg → UGG, Toteme → Totême). Lyst left Off-White out in Q4 2021 after Virgil Abloh's death, and changed its method in Q1 2026.
- `build.py` keeps only our 13 brands' ranks (plus each quarter's top 3 for tooltips). A brand outside the published list is unranked, not zero.
- **Rank change after the search spike:** mean Lyst rank in the year after a brand's biggest search-growth year minus the year before. Unranked quarters count as one place below the published list. For spikes in 2017, the spike year is the "before".
