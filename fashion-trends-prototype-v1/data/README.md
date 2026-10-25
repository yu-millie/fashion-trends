# data/

Files the two D3 views in the "Six aesthetics" section load with `d3.json`.

| File | What it holds |
|---|---|
| `timeline_worldwide.json` | Monthly worldwide Google search interest, Jan 2004 – Dec 2025, for six terms (y2k fashion, gorpcore, quiet luxury, old money aesthetic, athleisure, streetwear). Each term was queried alone, so each series is scaled to its own peak (re-scaled so the highest month in 2004–2025 = 100). |
| `geo_by_era.json` | Each country's share of searches (%) across the six terms, for six eras. The six terms were compared within each country (two Google Trends queries joined through "streetwear"). Countries keyed by ISO 3166-1 alpha-3. |
| `world-110m.json` | Natural Earth 110m country outlines as TopoJSON, ids = ISO alpha-3. |

Source: the Google Trends exports collected for Milestone 6.
To switch to the pipeline outputs, keep the same keys (`aesthetics`, `months`, `series`; `eras`, `shares[era][ISO3][key]`) or change the three `d3.json(...)` paths in `index.html`.
