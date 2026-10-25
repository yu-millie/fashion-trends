"""
Fashion Trend Cycle: data pipeline.

Input : raw/google_trends_raw.json (Google Trends explore widgets, worldwide, collected 2026-10-25)
Output: ../data/*.json  (read by index.html with d3.json)
        qc_report.json

Cleaning rules
- A cell Google marks as "no data" is stored as null -> treated as missing, then as 0 when
  summing shares (no searches recorded). Real low values stay as their integer.
- Google Trends compares at most 5 terms and rescales each comparison to its own max (=100).
  Our six aesthetics need two comparisons, so "streetwear" is in both as an anchor. Batch B is
  multiplied by sum(streetwear in A) / sum(streetwear in B). Summed totals, not month-by-month
  ratios, so integer rounding on small months doesn't become noise.
- Country shares: same anchor idea per country, then renormalised to 100 %.
- Country codes: ISO 3166-1 alpha-2 from Google -> alpha-3 to match the map.
"""
import json, sys
from pathlib import Path
import numpy as np
import pandas as pd
import pycountry

HERE = Path(__file__).parent
OUT = HERE.parent / "data"
OUT.mkdir(parents=True, exist_ok=True)
X = json.load(open(HERE / "raw" / "google_trends_raw.json"))
Q = X["queries"]
qc = {"collected": X["collected"], "source": X["source"], "anchor_ratios": {}, "missing_cells": {}, "unresolved_countries": [], "notes": []}

AES = [  # key used by the site, display name, Google search term
    ("street", "Streetwear", "streetwear"),
    ("y2k", "Y2K", "y2k fashion"),
    ("gorp", "Gorpcore", "gorpcore"),
    ("quiet", "Quiet Luxury", "quiet luxury"),
    ("academia", "Dark Academia", "dark academia"),
    ("coquette", "Coquette", "coquette aesthetic"),
]
KEY = {term: k for k, _, term in AES}
qc["notes"].append('Coquette uses "coquette aesthetic": plain "coquette" is also a French/Spanish word '
                   'and had a ~25% share of these six terms already in 2004, before the aesthetic existed.')


def series(qid, start):
    q = Q[qid]
    idx = pd.period_range(start, periods=len(q["ts"]), freq="M")
    df = pd.DataFrame(q["ts"], index=idx, columns=q["kw"], dtype=float)
    qc["missing_cells"][qid] = int(df.isna().sum().sum())
    return df


def anchored(qa, qb, start, label):
    """Join two 5-term comparisons through the shared 'streetwear' column."""
    a, b = series(qa, start), series(qb, start)
    ratio = a["streetwear"].sum() / b["streetwear"].sum()
    qc["anchor_ratios"][label] = round(float(ratio), 4)
    b = b.drop(columns="streetwear") * ratio
    df = pd.concat([a, b], axis=1).fillna(0)
    return df[[t for _, _, t in AES]].rename(columns=KEY)


def iso3(a2):
    c = pycountry.countries.get(alpha_2=a2)
    if c is None:
        qc["unresolved_countries"].append(a2)
    return c.alpha_3 if c else None


def dump(name, obj):
    json.dump(obj, open(OUT / name, "w"), separators=(",", ":"), ensure_ascii=False)


meta = [{"key": k, "name": n, "term": t} for k, n, t in AES]

# 1 ── timeline: each term queried on its own (0-100 = its own peak), monthly 2004-2025
alone = {k: series("alone:" + t, "2004-01")[t].fillna(0) for k, _, t in AES}
months = [str(p) for p in alone["street"].index]
dump("timeline_worldwide.json", {
    "source": "Google Trends, worldwide web search, monthly. Each term queried alone (100 = its own 2004-2025 peak).",
    "aesthetics": meta, "months": months,
    "series": {k: s.astype(int).tolist() for k, s in alone.items()},
})

# 2 ── share of search among the six, by year (anchored comparisons)
web = anchored("shareA", "shareB", "2004-01", "web 2004-2025")
yr = web.groupby(web.index.year).mean()
share = (yr.div(yr.sum(axis=1), axis=0) * 100).round(1)
dump("share_annual.json", {
    "source": "Google Trends, worldwide web search. Annual mean interest, six terms on one scale via the streetwear anchor; share = % of the six.",
    "aesthetics": meta, "years": share.index.tolist(),
    "share": {k: share[k].tolist() for k in share.columns},
})

# 3 ── lifecycle per aesthetic, from the solo series
life = []
for k, n, t in AES:
    s = alone[k]
    pk = s.idxmax()
    above25 = s[s >= 25]
    life.append({
        "key": k, "name": n,
        "breakout": str(above25.index.min()),            # first month at >= 25 % of peak
        "peak": str(pk),
        "fade": str(above25.index.max()),                # last month at >= 25 % of peak
        "months_above_half": int((s >= 50).sum()),        # months at >= 50 % of peak
        "months_breakout_to_peak": int((pk - above25.index.min()).n),
        "latest_pct_of_peak": int(s.iloc[-1]),
    })
dump("lifecycle.json", {"source": "Derived from the solo Google Trends series (2004-2025).", "rule": "breakout = first month >= 25 of 100; fade = last month >= 25; lifespan = months >= 50", "aesthetics": life})

# 4 ── platforms: share of the six on YouTube search vs Google web search, 2023-2025
yt = anchored("ytA", "ytB", "2008-01", "youtube 2008-2025")
win = slice(pd.Period("2023-01", "M"), pd.Period("2025-12", "M"))
def share_in(df):
    tot = df.loc[win].sum()
    return (tot / tot.sum() * 100).round(1)
g, y = share_in(web), share_in(yt)
dump("platforms.json", {
    "source": "Google Trends worldwide, 2023-2025. Each platform's six terms on one scale (streetwear anchor); value = share of the six on that platform.",
    "period": "2023–2025",
    "aesthetics": [{"key": k, "name": n, "google": float(g[k]), "youtube": float(y[k])} for k, n, _ in AES],
})

# 5 ── countries: share of the six per country per era
eras = ["2004–2012", "2013–2017", "2018–2020", "2021–2022", "2023–2024", "2025"]
geo = {}
for era in eras:
    A, B = Q["geoA:" + era], Q["geoB:" + era]
    rows = {}
    for code, (name, va) in A["geo"].items():
        vb = B["geo"].get(code, [name, [None] * len(B["kw"])])[1]
        a = dict(zip(A["kw"], [v or 0 for v in va]))
        b = dict(zip(B["kw"], [v or 0 for v in vb]))
        if a["streetwear"] and b["streetwear"]:
            r = a["streetwear"] / b["streetwear"]
        elif not b["streetwear"] and not any(b.values()):
            r = 0  # batch B has nothing for this country
        else:
            continue  # cannot be put on one scale
        vals = {KEY[t]: a.get(t, 0) for t in A["kw"]}
        vals["coquette"] = b["coquette aesthetic"] * r
        tot = sum(vals.values())
        c3 = iso3(code)
        if tot and c3:
            rows[c3] = {k: round(v / tot * 100, 1) for k, v in vals.items()}
    geo[era] = rows
dump("geo_by_era.json", {
    "source": "Google Trends, the six terms compared within each country (two comparisons joined per country through streetwear). Values = % of the six.",
    "eras": eras, "shares": geo,
})
qc["countries_per_era"] = {e: len(v) for e, v in geo.items()}

# 6 ── summary: rising aesthetic and fastest-rising brand searches per year
BR = [k[6:] for k in Q if k.startswith("bterm:")]
NAMES = {"gucci": "Gucci", "balenciaga": "Balenciaga", "saint laurent": "Saint Laurent", "versace": "Versace", "prada": "Prada",
         "bottega veneta": "Bottega Veneta", "nike": "Nike", "jacquemus": "Jacquemus", "dior": "Dior", "miu miu": "Miu Miu",
         "moncler": "Moncler", "loewe": "Loewe", "alaia": "Alaïa"}
qc["notes"].append("Brands are search terms, each queried alone (2016-2025). Google Trends brand *topics* were tried first "
                   "but had gaps and near-zero values in 2017-2020 (e.g. Dior), so they were dropped. Brands whose names "
                   "are common words (Off-White, Diesel, The Row, Valentino) were left out.")
brand = pd.DataFrame({NAMES[b]: series("bterm:" + b, "2016-01")[b].fillna(0) for b in BR})
by = brand.groupby(brand.index.year).mean()
growth = (by.pct_change() * 100).round(0).where(by.shift(1) >= 10)  # ignore growth from a tiny base (prior-year mean < 10)
years = []
for y_ in range(2017, 2026):
    gain = (share.loc[y_] - share.loc[y_ - 1]).drop("street")
    top = growth.loc[y_].sort_values(ascending=False).head(5)
    look = gain.idxmax() if gain.max() >= 0.5 else "street"   # no aesthetic gained >= 0.5 pts -> streetwear still sets the look
    years.append({
        "year": y_,
        "look": look, "look_gain": round(float(gain.max()), 1),
        "brands": [{"name": b, "growth": int(v)} for b, v in top.items()],
    })
dump("summary_by_year.json", {
    "source": "Look = aesthetic whose share of search grew most that year (streetwear if none grew by 0.5 points). Brands = largest year-over-year growth in Google search interest (annual mean) among 13 brands that appear in Lyst Index Hottest Brands lists 2017-2025, each queried alone as a Google search term.",
    "years": years,
})

# 7 ── thesis numbers
qc["streetwear_share"] = {int(y_): float(share.loc[y_, "street"]) for y_ in [2004, 2019, 2024, 2025]}
json.dump(qc, open(HERE / "qc_report.json", "w"), indent=2, ensure_ascii=False)
print(json.dumps({k: qc[k] for k in ["anchor_ratios", "countries_per_era", "streetwear_share", "unresolved_countries"]}, ensure_ascii=False))

# 8 ── bundle every JSON into one script so index.html also works opened from disk (file://)
bundle = {f.stem: json.load(open(f)) for f in sorted(OUT.glob("*.json"))}
(OUT / "bundle.js").write_text("window.SITE_DATA = " + json.dumps(bundle, separators=(",", ":"), ensure_ascii=False) + ";\n")
