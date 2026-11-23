"""
Fashion Trend Cycle: data pipeline.

Input : raw/google_trends_raw.json (Google Trends explore widgets, worldwide, collected 2026-10-25)
Output: ../data/*.json  (read by index.html with d3.json)
        qc_report.json

Cleaning rules
- A cell Google marks as "no data" is stored as null -> treated as missing, then as 0 when
  summing shares (no searches recorded). Real low values stay as their integer.
- Google Trends compares at most 5 terms and rescales each comparison to its own max (=100).
  Our eight aesthetics need three comparisons (A, B, C), so "streetwear" is in each as an anchor. Batches B and C
  are multiplied by sum(streetwear in A) / sum(streetwear in B or C). Summed totals, not month-by-month
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
    ("cottage", "Cottagecore", "cottagecore"),            # added 14 Nov 2026 (comparison C)
    ("maxi", "Maximalism", "maximalist fashion"),          # added 14 Nov 2026 (comparison C)
]
AES6 = AES[:6]   # the platform, country-drill and peak-lag outputs were only collected for the first six terms
KEY = {term: k for k, _, term in AES}
qc["notes"].append('Coquette uses "coquette aesthetic": plain "coquette" is also a French/Spanish word '
                   'and had a ~25% share of these six terms already in 2004, before the aesthetic existed.')
qc["notes"].append('Maximalism uses "maximalist fashion", for the same reason: plain "maximalism" is also an art and interior-design word and '
                   'already averaged about 7 (of its own peak = 100) over 2004-2012. "maximalist fashion" averaged under 1 until 2018.')
qc["notes"].append('Maximalism is a very small search term next to streetwear: on the shared scale it rounds to 0 in every month, so it has '
                   'a visible shape only on charts that scale each aesthetic to its own peak (timeline, ring, seasons), and ~0 % on share charts.')


def series(qid, start):
    q = Q[qid]
    idx = pd.period_range(start, periods=len(q["ts"]), freq="M")
    df = pd.DataFrame(q["ts"], index=idx, columns=q["kw"], dtype=float)
    qc["missing_cells"][qid] = int(df.isna().sum().sum())
    return df


def anchored(qids, start, label, aes=None):
    """Join comparisons through the shared 'streetwear' column (the first id is the base)."""
    aes = aes or AES
    base = series(qids[0], start)
    parts = [base]
    for qid in qids[1:]:
        b = series(qid, start)
        ratio = base["streetwear"].sum() / b["streetwear"].sum()
        qc["anchor_ratios"][label + (":" + qid if len(qids) > 2 else "")] = round(float(ratio), 4)
        parts.append(b.drop(columns="streetwear") * ratio)
    df = pd.concat(parts, axis=1).fillna(0)
    return df[[t for _, _, t in aes]].rename(columns=KEY)


def iso3(a2):
    c = pycountry.countries.get(alpha_2=a2)
    if c is None:
        qc["unresolved_countries"].append(a2)
    return c.alpha_3 if c else None


def dump(name, obj):
    json.dump(obj, open(OUT / name, "w"), separators=(",", ":"), ensure_ascii=False)


meta = [{"key": k, "name": n, "term": t} for k, n, t in AES]

def despeckle(s, qid, w=2):
    """Drop a month that has data while every month within w either side has none: at this volume
    it cannot be told from sampling noise (maximalist fashion has a lone 41 in Oct 2010)."""
    ok = s.notna().values
    drop = [i for i in range(len(s)) if ok[i] and not any(ok[j] for j in range(max(0, i - w), min(len(s), i + w + 1)) if j != i)]
    qc.setdefault("despeckled_months", {})[qid] = [str(s.index[i]) + "=" + str(int(s.iloc[i])) for i in drop]
    return s.drop(s.index[drop]).reindex(s.index) if drop else s


# 1 ── timeline: each term queried on its own (0-100 = its own peak), monthly 2004-2025
alone = {k: despeckle(series("alone:" + t, "2004-01")[t], t).fillna(0) for k, _, t in AES}
months = [str(p) for p in alone["street"].index]
dump("timeline_worldwide.json", {
    "source": "Google Trends, worldwide web search, monthly. Each term queried alone (100 = its own 2004-2025 peak).",
    "aesthetics": meta, "months": months,
    "series": {k: s.astype(int).tolist() for k, s in alone.items()},
})

# 2 ── share of search among the six, by year (anchored comparisons)
web = anchored(["shareA", "shareB", "shareC"], "2004-01", "web 2004-2025")
yr = web.groupby(web.index.year).mean()
share = (yr.div(yr.sum(axis=1), axis=0) * 100).round(1)
dump("share_annual.json", {
    "source": "Google Trends, worldwide web search. Annual mean interest, eight terms on one scale via the streetwear anchor; share = % of the eight.",
    "aesthetics": meta, "years": share.index.tolist(),
    "share": {k: share[k].tolist() for k in share.columns},
})

# 3 ── lifecycle per aesthetic, from the solo series
def sustained(s, thr=25, k=3):
    """Months that belong to a run of at least k consecutive months at >= thr. One noisy month in a
    very sparse series (maximalist fashion has one in 2010) is not a breakout."""
    ok, keep, i = (s >= thr).values, np.zeros(len(s), bool), 0
    while i < len(ok):
        if ok[i]:
            j = i
            while j < len(ok) and ok[j]:
                j += 1
            if j - i >= k:
                keep[i:j] = True
            i = j
        else:
            i += 1
    return s[keep]


life = []
for k, n, t in AES:
    s = alone[k]
    pk = s.idxmax()
    above25 = sustained(s)
    life.append({
        "key": k, "name": n,
        "breakout": str(above25.index.min()),            # first month of a run of 3+ months at >= 25 % of peak
        "peak": str(pk),
        "fade": str(above25.index.max()),                # last month of such a run
        "months_above_half": int((s >= 50).sum()),        # months at >= 50 % of peak
        "months_breakout_to_peak": int((pk - above25.index.min()).n),
        "latest_pct_of_peak": int(s.iloc[-1]),
    })
dump("lifecycle.json", {"source": "Derived from the solo Google Trends series (2004-2025).", "rule": "breakout = first month of a run of 3+ months >= 25 of 100; fade = last month of such a run; lifespan = months >= 50", "aesthetics": life})

# 4 ── platforms: share of the six on YouTube search vs Google web search, 2023-2025
yt = anchored(["ytA", "ytB"], "2008-01", "youtube 2008-2025", AES6)
win = slice(pd.Period("2023-01", "M"), pd.Period("2025-12", "M"))
def share_in(df):
    tot = df.loc[win].sum()
    return (tot / tot.sum() * 100).round(1)
g, y = share_in(web[[k for k, _, _ in AES6]]), share_in(yt)   # the six terms YouTube was collected for
dump("platforms.json", {
    "source": "Google Trends worldwide, 2023-2025. Each platform's six terms on one scale (streetwear anchor); value = share of the six on that platform.",
    "period": "2023–2025",
    "aesthetics": [{"key": k, "name": n, "google": float(g[k]), "youtube": float(y[k])} for k, n, _ in AES6],
})

# 5 ── countries: share of the six per country per era
eras = ["2004–2012", "2013–2017", "2018–2020", "2021–2022", "2023–2024", "2025"]
geo = {}
for era in eras:
    A, B, C = Q["geoA:" + era], Q["geoB:" + era], Q["geoC:" + era]
    rows = {}
    for code, (name, va) in A["geo"].items():
        vb = B["geo"].get(code, [name, [None] * len(B["kw"])])[1]
        vc = C["geo"].get(code, [name, [None] * len(C["kw"])])[1]
        a = dict(zip(A["kw"], [v or 0 for v in va]))
        b = dict(zip(B["kw"], [v or 0 for v in vb]))
        c = dict(zip(C["kw"], [v or 0 for v in vc]))
        def ratio(x):
            if a["streetwear"] and x["streetwear"]:
                return a["streetwear"] / x["streetwear"]
            if not x["streetwear"] and not any(x.values()):
                return 0      # that batch has nothing for this country
            return None       # cannot be put on one scale
        rb, rc = ratio(b), ratio(c)
        if rb is None or rc is None:
            continue
        vals = {KEY[t]: a.get(t, 0) for t in A["kw"]}
        vals["coquette"] = b["coquette aesthetic"] * rb
        vals["cottage"] = c["cottagecore"] * rc
        vals["maxi"] = c["maximalist fashion"] * rc
        tot = sum(vals.values())
        c3 = iso3(code)
        if tot and c3:
            rows[c3] = {k: round(v / tot * 100, 1) for k, v in vals.items()}
    geo[era] = rows
dump("geo_by_era.json", {
    "source": "Google Trends, the eight terms compared within each country (three comparisons joined per country through streetwear). Values = % of the eight.",
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
    "source": "Look = aesthetic whose share of the eight grew most that year (streetwear if none grew by 0.5 points). Brands = largest year-over-year growth in Google search interest (annual mean) among 13 brands that appear in Lyst Index Hottest Brands lists 2017-2025, each queried alone as a Google search term.",
    "years": years,
})

# 7a ── country drill-down: the six terms per country, annual share 2015-2025 (Prototype II)
CTY = [("US", "United States"), ("CL", "Chile"), ("IN", "India")]
cty = []
for a2, nm in CTY:
    d = anchored(["ctyA:" + a2, "ctyB:" + a2], "2015-01", "country " + a2, AES6)
    yd = d.groupby(d.index.year).mean()
    sh = (yd.div(yd.sum(axis=1), axis=0) * 100).round(1).fillna(0)
    cty.append({"code": a2, "iso3": iso3(a2), "name": nm, "years": sh.index.tolist(),
                "share": {k: sh[k].tolist() for k in sh.columns}})
dump("country_trends.json", {
    "source": "Google Trends, the six terms within each country (two comparisons joined through streetwear), annual mean, share of the six. Collected for three countries.",
    "countries": cty,
})

# 7b ── who peaks first: month of highest interest (3-month centred mean) on Google vs YouTube
peaks = []
for k, n, t in AES6:
    g = alone[k].rolling(3, center=True).mean()
    y = yt[k].rolling(3, center=True).mean()
    gp, yp = g.idxmax(), y.idxmax()
    peaks.append({"key": k, "name": n, "google": str(gp), "youtube": str(yp), "lag_months": int((yp - gp).n)})
dump("peaks.json", {
    "source": "Month of each aesthetic's highest search interest (3-month centred average), Google web search (term alone, 2004-2025) vs YouTube search (anchored comparison, 2008-2025). Positive lag = YouTube peaked later.",
    "aesthetics": peaks,
})

# 7c ── seasonal clock: average interest by calendar month, 2021-2025, best month = 100
seas = {}
for k, n, t in AES:
    s = alone[k][pd.Period("2021-01", "M"):pd.Period("2025-12", "M")]
    mm = s.groupby(s.index.month).mean()
    seas[k] = (mm / mm.max() * 100).round(1).tolist()
dump("seasonal.json", {
    "source": "Google Trends worldwide, each term alone. Mean interest by calendar month over 2021-2025, scaled so each aesthetic's best month = 100.",
    "aesthetics": meta, "months": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    "values": seas,
})

# 7d ── brands in flux: each brand's monthly search interest (own peak = 100), 2016-2025
bsm = brand.rolling(3, center=True, min_periods=1).mean().round(1)
dump("brands.json", {
    "source": "Google Trends worldwide, each brand queried alone as a search term (100 = that brand's own 2016-2025 peak). Monthly, 3-month centred average. 13 brands from Lyst Index Hottest Brands lists.",
    "months": [str(p) for p in bsm.index],
    "brands": [{"name": b, "values": bsm[b].tolist(), "annual": by[b].round(1).tolist()} for b in bsm.columns],
    "years": by.index.tolist(),
})

# 7e ── Lyst Index: the shop side. Quarterly "hottest brands" rankings, transcribed from
#       Lyst's own Index pages (press articles for 2017-2018 quarters Lyst no longer hosts).
#       raw/lyst_index.csv: one row per quarter, brands in rank order, "?" = rank not reported.
import csv
lyst_rows = list(csv.DictReader(open(HERE / "raw" / "lyst_index.csv", encoding="utf-8")))
OUR = list(NAMES.values())
quarters = []
for r in lyst_rows:
    ranked = [b.strip() for b in r["brands_in_rank_order"].split(";")]
    quarters.append({
        "q": r["quarter"], "year": int(r["quarter"][:4]), "depth": len(ranked), "source": r["source_url"],
        "ranks": {b: i + 1 for i, b in enumerate(ranked) if b in OUR},
        "top3": [b for b in ranked[:3] if b != "?"],
        "list": ranked,                                  # the full published list, "?" = unreported rank
    })
# every quarter from the first index to the latest, with a placeholder for any gap
allq = [f"{y}Q{n}" for y in range(2017, 2027) for n in range(1, 5)]
first, last = quarters[0]["q"], quarters[-1]["q"]
allq = allq[allq.index(first): allq.index(last) + 1]
byq = {q["q"]: q for q in quarters}
qc["lyst_missing_quarters"] = [q for q in allq if q not in byq]
dump("lyst.json", {
    "source": "Lyst Index quarterly Hottest Brands rankings (lyst.com / lyst.co.uk; 2017-2018 from press coverage). Rank 1 = hottest. "
              "Only ranks the source showed are recorded: top 10 until Q4 2018, top 20 after. Lyst changed its method in Q1 2026.",
    "brands": OUR,
    "quarters": [byq.get(q, {"q": q, "year": int(q[:4]), "depth": 0, "source": None, "ranks": {}, "top3": [], "list": []}) for q in allq],
})

# 7 ── thesis numbers
qc["streetwear_share"] = {int(y_): float(share.loc[y_, "street"]) for y_ in [2004, 2019, 2024, 2025]}
json.dump(qc, open(HERE / "qc_report.json", "w"), indent=2, ensure_ascii=False)
print(json.dumps({k: qc[k] for k in ["anchor_ratios", "countries_per_era", "streetwear_share", "unresolved_countries"]}, ensure_ascii=False))

# 8 ── bundle every JSON into one script so index.html also works opened from disk (file://)
bundle = {f.stem: json.load(open(f)) for f in sorted(OUT.glob("*.json"))}
(OUT / "bundle.js").write_text("window.SITE_DATA = " + json.dumps(bundle, separators=(",", ":"), ensure_ascii=False) + ";\n")
