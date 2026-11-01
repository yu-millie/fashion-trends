# Enter the Wardrobe: Fashion Trend Cycle (CS 1710 Prototype II)

Team: Joanna Zhang, Amelia Yu, Yuankang Li

## Run it
Double-click `index.html` to open it, or serve the folder. The JSON files are also bundled in `data/bundle.js`, so the page works opened straight from disk.

```
python3 -m http.server 8000
# open http://localhost:8000
```
It also runs as is on GitHub Pages. Fonts come from Google Fonts. Offline, the page falls back to system fonts.

## Structure
- `index.html`: page layout and all CSS. Laid out like a magazine issue: cover → lookbook → thesis → evidence → cycle → seasons → platforms → shops, with torn-page edges between features and pull quotes on taped paper scraps.
- `js/`: one script per part of the story, loaded in order:
  | file | what it does |
  |---|---|
  | `core.js` | the six aesthetics + colours, data loading, shared tooltip, shared aesthetic focus (`setFocus` / `onFocus`) |
  | `people.js` | the six look photos (`assets/people/`), their pose type and the pieces in each outfit |
  | `magazine.js` | torn page edges, folios (page headers/numbers), torn pull-quote scraps |
  | `cover.js` | magazine cover: cover star, the five looks behind the masthead, data-driven cover lines |
  | `lookbook.js` | scroll-driven carousel: the section is pinned while you scroll, and each scroll step brings the next look to the centre with its description, pieces and search sparkline |
  | `thesis.js` | streetwear share bars + count-down number |
  | `evidence.js` | linked timeline → map → country zoom-in |
  | `cycle.js` | trend ring + table |
  | `seasons.js` | seasonal clock + table |
  | `platforms.js` | Google vs YouTube share, and who peaks first |
  | `shop.js` | the shops section: shared year + "following" state (`SHOP`), year-in-review spread, the hot 20 (animated Lyst ranking), the shop (brands as product tiles) and brands per look |
  | `brands.js` | the full data tables behind the shops section (search-growth heatmap, Lyst rank by quarter), tied to the same `SHOP` state |
  | `scroll.js` | reveal-on-scroll, nav highlight |
- `data/`: JSON files every chart loads with `d3.json`.
- `pipeline/`: the raw Google Trends export plus `build.py`, which cleans it and writes `data/`. `qc_report.json` records anchor ratios, missing cells and unresolved countries.
- `lib/`: D3 v7.9.0 and topojson-client v3.1.0, saved locally.
- `assets/people/`: background-removed cut-outs of the six look photos (WebP with transparency).
- `drafts/`: the static Prototype I drafts that became the new views.

## Linked interactions
- **Aesthetic chips** (evidence and seasons): highlight one aesthetic in every chart on the page: timeline, map, country lines, ring, clock, both platform charts.
- **Timeline era strip → map**: picks the era the map shows.
- **Map → country zoom-in**: click the outlined US, Chile or India (or use the US/Chile/India toggle).
- **Ring ↔ table**, **clock ↔ table**: hover either to highlight the other.
- **Lookbook**: scrolling turns the carousel; the arrows, the name tabs and clicking a faded look jump to it.
- **Shops section**: one year drives everything. The slider, year ticks, the hot 20's quarter slider and play button, and clicks in the data tables all set it; the year-in-review page, product tags and prices, the hot 20 and the year marker in brands per look all follow.
- **Following**: heart a brand in the shop, click it in the hot 20, or click its tag in brands per look; it's highlighted in all three.

## What every chart shows (all from Google Trends)
| Section | Chart | Data file |
|---|---|---|
| Thesis | Streetwear's share of the six aesthetics, 2019 vs 2025 | `share_annual.json` |
| Evidence | **When**: worldwide search per aesthetic, 2004–2025 | `timeline_worldwide.json` |
| Evidence | **Where**: leading aesthetic by country, per era | `geo_by_era.json` |
| Evidence | **Zoom in** (new): one country's share of the six, 2015–2025 | `country_trends.json` |
| Cycle | Trend ring: breakout → peak → fade, months on top | `lifecycle.json` |
| Seasons | **Seasonal clock** (new): average interest by calendar month, 2021–2025 | `seasonal.json` |
| Platforms | Share on Google vs YouTube, 2023–2025 | `platforms.json` |
| Platforms | **Who peaks first** (new): peak month on Google vs YouTube | `peaks.json` |
| Shops | **Year in review** (new): one magazine page per year: the look, Lyst's #1 brand, the five fastest-rising brand searches | `summary_by_year.json`, `lyst.json` |
| Shops | **The hot 20** (new): Lyst's top 20 re-sorting quarter by quarter, our brands coloured by the year's look | `lyst.json` |
| Shops | **The shop** (new): each brand as a product tile. Price = Lyst rank that year (struck-through = last year), tag = Bestseller / Trending / Markdown / New in / Sold out from the rank change, front image = search interest, hover image = Lyst rank history | `brands.json`, `lyst.json` |
| Shops | **Brands per look** (new): each aesthetic's time on top with brand search spikes placed by year | `lifecycle.json`, `brands.json` |
| Shops (full data) | **The hot list**: every brand's year-over-year search growth as a heatmap table; outlined cells = that year's top 5 | `brands.json` |
| Shops (full data) | **Search vs. shop**: each brand's quarterly Lyst Index rank, 2017–2026, with the year its searches grew fastest marked, and whether it climbed Lyst's chart the year after | `lyst.json` |

## Changes since Prototype I
- **New views:** country zoom-in, seasonal clock, who-peaks-first (the three Prototype I drafts) and the hot list. We tried Brands in Flux (fabric ribbons) first and dropped it: each brand is scaled to its own peak, so ribbon widths could not be compared across brands. Growth rates are comparable across brands, so the hot list shows each brand's yearly growth as a heatmap table. A bump chart of growth ranks was tried in between and dropped because ranks swing so much that the lines tangled.
- **Second data source:** the Lyst Index (quarterly hottest-brands rankings) now sits next to Google Trends in the brands section, so we can test whether shopping followed searching instead of just saying it did.
- **Lookbook:** a scroll-driven carousel of the six looks, modelled on shop lookbooks (centre look in focus, the rest faded).
- **More linking:** the aesthetic focus now runs through every chart, not only the timeline and map. The year state drives three views.
- **Redesign:** the black background is gone. The page reads like a magazine issue: a cover with masthead and cover lines, paper-coloured pages with torn edges, folios, and pull quotes on taped scraps. Charts sit on rounded cards. The line-drawn figures are replaced by real look photos.
- **Colours:** the six aesthetic colours were re-picked for the light background and checked with a colour-vision-deficiency validator. Adjacent legend colours stay distinguishable, and every chart also names each aesthetic in a legend, label or tooltip.
- **Code:** split the single inline script into `js/` files, one per part of the story.

## Photo credits
The six look photos in `assets/people/` are reference images the team collected (fashion editorial and brand campaign images). They are used here for a class prototype only and should be credited to their sources (or replaced with our own or freely licensed photos) before the site is published more widely. The Coquette image carries a watermark, and the Streetwear image had collage graphics painted out.
