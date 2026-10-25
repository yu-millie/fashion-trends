# Enter the Wardrobe: Fashion Trend Cycle (CS 1710 Prototype V1)

Team: Joanna Zhang, Amelia Yu, Yuankang Li

## Run it
Double-click `index.html` to open it, or serve the folder. The JSON files are also bundled in `data/bundle.js`, so the page works opened straight from disk.

```
python3 -m http.server 8000
# open http://localhost:8000
```
It also runs as is on GitHub Pages.

## Structure
- `index.html`: the whole site. Sections run in storyboard order: hero → thesis → evidence → cycle → platforms → summary.
- `data/`: JSON files every chart loads with `d3.json`.
- `pipeline/`: the raw Google Trends export plus `build.py`, which cleans it and writes `data/`. `qc_report.json` records anchor ratios, missing cells and unresolved countries.
- `lib/`: D3 v7.9.0 and topojson-client v3.1.0, saved locally so the site works offline.

## What every chart shows (all from Google Trends)
| Section | Chart | Data file |
|---|---|---|
| Thesis | Streetwear's share of the six aesthetics, 2019 vs 2025 | `share_annual.json` |
| Evidence | **When**: worldwide search per aesthetic, 2004–2025 (linked to the map) | `timeline_worldwide.json` |
| Evidence | **Where**: leading aesthetic by country, per era | `geo_by_era.json` |
| Cycle | Trend ring: breakout → peak → fade, months on top | `lifecycle.json` |
| Platforms | Share on Google vs YouTube, 2023–2025 | `platforms.json` |
| Summary | Each year's rising aesthetic and fastest-rising brand searches | `summary_by_year.json` |
