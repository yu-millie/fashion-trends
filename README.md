# Enter the Aesthetic: Fashion Trend Cycle (CS 1710 Prototype III)

Team: Joanna Zhang, Amelia Yu, Yuankang Li

## Run it
Double-click `index.html` to open it, or serve the folder. The JSON files are also bundled in `data/bundle.js`, so the page works opened straight from disk.

```
python3 -m http.server 8000
# open http://localhost:8000
```
It also runs as is on GitHub Pages. Fonts come from Google Fonts. Offline, the page falls back to system fonts.

## Structure
- `index.html`: page layout and all CSS. Laid out like a magazine issue: cover → lookbook → thesis → evidence → cycle → seasons → shops, with torn-page edges between features and pull quotes on taped paper scraps.
- `js/`: one script per part of the story, loaded in order:
  | file | what it does |
  |---|---|
  | `core.js` | the eight aesthetics + colours, data loading, shared tooltip, per-chart aesthetic filters (`focusGroup` / `chips`) |
  | `people.js` | the eight look photos (`assets/people/`), their pose type and the pieces in each outfit |
  | `magazine.js` | torn page edges, folios (page headers/numbers), torn pull-quote scraps |
  | `cover.js` | magazine cover: cover star, the five looks behind the masthead, data-driven cover lines |
  | `lookbook.js` | scroll-driven carousel: the section is pinned while you scroll, and each scroll step brings the next look to the centre with its description, pieces and search sparkline |
  | `thesis.js` | streetwear share bars + count-down number |
  | `evidence.js` | linked timeline → map → country zoom-in |
  | `cycle.js` | trend ring + table |
  | `seasons.js` | seasonal clock + table |
  | `shop.js` | the shops section: shared year + "following" state (`SHOP`), year-in-review spread, and the hot 20 (animated Lyst ranking) |
  | `scroll.js` | reveal-on-scroll, nav highlight |
- `data/`: JSON files every chart loads with `d3.json`.
- `pipeline/`: the raw Google Trends export plus `build.py`, which cleans it and writes `data/`. `qc_report.json` records anchor ratios, missing cells and unresolved countries.
- `lib/`: D3 v7.9.0 and topojson-client v3.1.0, saved locally.
- `assets/people/`: background-removed cut-outs of the eight look photos (WebP with transparency).
- `drafts/`: the static Prototype I drafts that became the new views.

## Linked interactions
- **Aesthetic chips**: the chips in the When card isolate one line there; nothing carries from one chart to the next, and the filter clears itself when you scroll away.
- **Timeline era strip → map**: picks the era the map shows.
- **Map → country zoom-in**: click any country that has data (or pick it from the menu); it is outlined on the map, and the chart shows its share of the six in each era, with the map's era marked.
- **Ring ↔ table**: hover either to highlight the other. **Seasons**: hover any small chart to see the same month in all eight.
- **Lookbook**: scrolling turns the carousel; the arrows, the name tabs and clicking a faded look jump to it.
- **Shops section**: one year drives it. The slider, the year ticks and the hot 20's quarter slider and play button all set the year; the year-in-review page and the hot 20 follow.
- **Following**: click one of our 13 brands in the hot 20 to highlight it; it clears when you scroll away.

## What every chart shows (all from Google Trends)
| Section | Chart | Data file |
|---|---|---|
| Thesis | Streetwear's share of the eight aesthetics, 2019 vs 2025 | `share_annual.json` |
| Evidence | **When**: worldwide search per aesthetic, 2004–2025 | `timeline_worldwide.json` |
| Evidence | **Where**: leading aesthetic by country, per era | `geo_by_era.json` |
| Evidence | **Zoom in** (new): any country's share of the eight, era by era | `geo_by_era.json` |
| Cycle | Trend ring: breakout → peak → fade, months on top | `lifecycle.json` |
| Seasons | **Seasonal clock** (new): average interest by calendar month, 2021–2025 | `seasonal.json` |
| Shops | **Year in review** (new): one magazine page per year: the look, Lyst's #1 brand, the five fastest-rising brand searches | `summary_by_year.json`, `lyst.json` |
| Shops | **The hot 20** (new): Lyst's top 20 re-sorting quarter by quarter; a brand is highlighted when its runway matched the year's look | `lyst.json`, `js/runway.js` |

## Changes after the think-aloud study (Milestone 10)
- **Renamed:** the site is now "Enter the Aesthetic" (cover wordmark "AESTHETIC", nav, page title and page folios), replacing "Wardrobe". The decorative line through the cover's "o" now runs through the middle "e".
- **Footer takeaway:** the scrolling strip at the bottom of the page is gone. In its place is one static takeaway, built from the lifecycle data in `js/cover.js`: "There is a pattern to the aesthetic changes: new looks break out in waves (2020, 2022 and 2023), and a typical one stays on top for about 20 months." The cover's "hot list" line now reads "The hot 20 / 34 quarters", because the hot list table no longer exists.
- **Gucci 2022:** the 2022 photo now has a show name and description (Cosmogonie, Resort 2023, May 16, 2022, the show nearest the quarter Gucci took #1), so it is clickable like the others. The image itself is a digital render on a black grid and does not look like that show: swap in a real runway photo when you have one (`file` in `js/runway.js`).
- **Figure 6 (seasons):** stays the seasonal clock with its table. We tried replacing it with eight small charts on one scale and went back.
- **Transitions fixed:** "And the shops followed." overclaimed, so it is now "The shops initially didn't match the general aesthetic patterns." "And every year, the calendar turns them over." is now "And inside every year, each one has a month of its own." A new short transition between the year pages and the timeline says "In the concept years, luxury drifted furthest from the trend." (`js/eras.js` only uses that wording when the data shows the concept era had the lowest match rate; 2020 to 22 had none of 11 shows match, while 2019's two clothes-led shows both matched).
- **Runway photo credit:** every photo is credited "Photo courtesy of" its brand (`credit` in `js/runway.js` defaults to the brand and can be overridden).
- **Three eras now says why it matters:** one plain-language caption per era under the chart (aligned to its band, numbers computed from the data), a finding paragraph above it and the tie as a transition. "Concept-led" and "clothes-led" are defined in a line under the legend (`js/eras.js`).
- **Catalogue look:** the thesis chart is back to the two stacked bars (the overhead-runway version is gone). The page keeps its ivory and charcoal look, and charts sit on printed-style plates (paper stock, hairline border, heavy top rule, small square corners, no glass or shadow) with "Fig." numbers. The eight aesthetic colours are a richer editorial set: burnt orange (Streetwear `#CC623E`), steel blue (Quiet Luxury `#497C9C`), forest green (Gorpcore `#44765B`), raspberry pink (Y2K `#CB648E`), lavender (Coquette `#9475B5`), deep plum (Dark Academia `#574052`), teal (Cottagecore `#369894`) and golden ochre (Maximalism `#BD922F`), set in `js/core.js` and the `--street` etc. variables. Text on a colour is white or charcoal, whichever has more contrast (`textOn` in `js/core.js`). Three pairs (blue and lavender, blue and raspberry, raspberry and teal) are close for red-green colour-blind readers, so every chart also labels its colours directly.
- **Removed:** the Brands per look chart (each aesthetic's time on top with brand search spikes by year). `lifecycle.json` and `brands.json` are unchanged; following a brand now works only in the hot 20.
- **Takeaway titles:** each chart's title now states what it shows, with the old label demoted to a small subtitle (e.g. the thesis chart: "Streetwear used to be almost every search. By 2025, 34 in every 100 went to other aesthetics."). Titles are built from the data in the chart's own script (`thesisTitle`, `whenTitle`, `mapTitle`, `drillTitle`, `ringTitle`, `seasonTitle`, `erasTitle`, `h20Title`), so they stay true if the data changes, and the map and zoom titles change with the era, mode and country you pick. The zoom title only considers 2018 on, because before then the newer aesthetics barely existed and a share there is just low-volume noise.
- **Hot 20 shows the year large:** the current year is drawn as a big numeral in the chart's empty lower-right corner, with the quarter and that year's look beneath it (for example "Q3 · Cottagecore year"), and the small quarter label up by the play button is larger too.
- **Hot 20 highlights alignment:** a bar is coloured (in the year's look colour) when that brand's runway matched the year's look, lighter with a dashed outline when it matched partly, grey when it did not match, and drawn with a dashed outline and italic name when the brand has no runway. Every brand in the top 20 from 2017 to 2025 is now assessed: Gucci, Balenciaga, Off-White, Prada, Miu Miu and Saint Laurent show by show (`SHOWS` in `js/runway.js`, the same coding as the three-eras timeline), 34 more brands from one or two representative shows per designer era (`BRAND_ERAS`, looser, and labelled so in the tooltip), and 13 with no runway (`NO_RUNWAY`: Nike, Adidas, New Balance, On, UGG, Birkenstock, Dr Martens, Canada Goose, Stone Island, Skims, Massimo Dutti, Yeezy and Fear of God). To mark another brand, add it there.
- **Removed:** the shop view (brands as product tiles) and the expandable full data tables (the hot list and search vs. shop heatmaps), along with `js/brands.js`. Following a brand now works only in the hot 20, and clears when you scroll away. The underlying data (`brands.json`, `lyst.json`) is unchanged.
- **Three eras timeline** (in the shops section, after the year-in-review and its slider, with a one-paragraph finding above it; `js/eras.js`): one chart that stacks streetwear's share of the eight, the year's look, the #1 Lyst brand in each quarter and every show we studied (`SHOWS` in `js/runway.js`), against three shaded eras: Streetwear 2017–19, Concept 2020–22, Clothes-led 2023–25. Shows that matched the year's look are ringed in that look's colour (dashed: partly), and the sentence above the card counts them from the same coding: 5 of 21 matched, 3 of 6 in 2017–19, none of 11 in 2020–22. The eras and the concept-led / clothes-led coding of each show are our reading, not a measurement.
- **Tags on each year's runway photo:** concept-led or clothes-led, whether the brand's search was among the five fastest rising the year before (left out for Off-White, which has no search series, and for 2017, which has no prior year), and whether the runway matched the year's look (yes, partly, no). They come from `led` and `alt` on each photo in `js/runway.js` plus the site's own data, and also show in the click-open panel.
- **Cottagecore and Maximalism:** added as the seventh and eighth aesthetics everywhere: lookbook (cut-out photos in `assets/people/`), every chart, the year-in-review, and the runway captions. Google Trends data for them was collected on 14 Nov 2026 (`alone:cottagecore`, `alone:maximalist fashion`, `shareC`, `geoC:<era>`) and `pipeline/build.py` was extended to join three comparisons. **Headline numbers changed** because shares are now out of eight: streetwear went from 97 to 66 (was 73), and 2020's look is now Cottagecore. Maximalism is a very small search term next to streetwear, so it appears on the timeline, ring and seasons but is about 0 % on share charts. Maximalism's colour is gold and Cottagecore's is sky blue (`js/core.js`).
- **Runway photos:** the year-in-review spread now shows a look from each year's #1 Lyst brand (the show nearest the quarter it took #1) where the look cutout used to be; years with no photo yet keep the cutout. Click a photo for a panel describing the show (photos with no `about` text are not clickable). Photos live in `assets/runway/`; captions, credits and our aesthetic reading are in `js/runway.js`. **To do before publishing:** fill in each photo's `credit`, add a photo for Balenciaga 2021, and confirm the show for the Gucci 2022 photo (it looks like a digital presentation, not the Cosmogonie castle runway), then fill in its `show` and `about`.
- **Directions:** every chart has a "How to" line saying what to hover, click or drag.
- **Filters:** the aesthetic filter no longer carries through the page; it is local to the When chart and resets when you scroll away.
- **Legibility:** the wordmark is heavier and has a soft shadow; the italic serif pull-quotes and cover-line numbers are now upright sans (Jost); nav mark is upright too.
- **Feature 01:** the share chart now has the full width, taller bars and bigger labels, since it is the opening chart.
- **Feature 02:** the selected era on the *When* timeline is a dark outlined band (was pale white). The zoom-in now works for every country with data, not just three: click any country on the map (or use the A–Z menu). It charts that country's share of the six era by era, using the same data as the map.
- **Feature 03:** a legend under the ring says what the small and big dots and the arc length mean.
- **Feature 05 (shops):** the Hot 20 plays at 2.4 s per quarter (was 1.1 s) with slower row moves and a live key; up/down markers are ink/grey instead of green/red; the section is renumbered and has an intro line.
- **Cut:** the Google vs YouTube platforms feature (old Feature 05) was removed from the story; both testers found it off-message. Kept in `drafts/platforms_section.html` and `drafts/platforms.js` to restore.
- **Not done:** one colour per brand in the Hot 20 (thirteen more hues would clash with the six aesthetic colours; the brand's name is already on the row).

## Changes since Prototype I
- **New views:** country zoom-in, seasonal clock, who-peaks-first (the three Prototype I drafts) and the hot list. We tried Brands in Flux (fabric ribbons) first and dropped it: each brand is scaled to its own peak, so ribbon widths could not be compared across brands. Growth rates are comparable across brands, so the hot list shows each brand's yearly growth as a heatmap table. A bump chart of growth ranks was tried in between and dropped because ranks swing so much that the lines tangled.
- **Second data source:** the Lyst Index (quarterly hottest-brands rankings) now sits next to Google Trends in the brands section, so we can test whether shopping followed searching instead of just saying it did.
- **Lookbook:** a scroll-driven carousel of the eight looks, modelled on shop lookbooks (centre look in focus, the rest faded).
- **More linking:** the aesthetic focus now runs through every chart, not only the timeline and map. The year state drives three views.
- **Redesign:** the black background is gone. The page reads like a magazine issue: a cover with masthead and cover lines, paper-coloured pages with torn edges, folios, and pull quotes on taped scraps. Charts sit on rounded cards. The line-drawn figures are replaced by real look photos.
- **Colours:** the six aesthetic colours were re-picked for the light background and checked with a colour-vision-deficiency validator. Adjacent legend colours stay distinguishable, and every chart also names each aesthetic in a legend, label or tooltip.
- **Code:** split the single inline script into `js/` files, one per part of the story.

## Photo credits
The six look photos in `assets/people/` are reference images the team collected (fashion editorial and brand campaign images). They are used here for a class prototype only and should be credited to their sources (or replaced with our own or freely licensed photos) before the site is published more widely. The Coquette image carries a watermark, and the Streetwear image had collage graphics painted out.
