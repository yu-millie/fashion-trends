# Enter the Wardrobe: Fashion Trend Cycle (CS 1710 Prototype V1)

Team: Joanna Zhang, Amelia Yu, Yuankang Li

## Run it
The page loads JSON with `fetch`, so it has to be served. Opening the file directly will not work.

```
python3 -m http.server 8000
# open http://localhost:8000
```
It also runs as is on GitHub Pages.

## Structure
- `index.html`: the whole site. Sections run in storyboard order: hero → thesis → evidence → cycle → platforms → summary.
- `data/`: JSON read by the D3 views (see `data/README.md`).
- `lib/`: D3 v7.9.0 and topojson-client v3.1.0, saved locally so the site works offline.

## What is functional vs. draft
- **Functional D3 (data loaded from `data/`):** the "When" timeline and the "Where" map in the evidence section. The two are linked.
- **Drafts (layout only, values typed into the page):** the thesis share bars, the trend ring (cycle), the Google-vs-YouTube dumbbell (platforms), and the Lyst year summary.
