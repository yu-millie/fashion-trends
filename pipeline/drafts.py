import json, numpy as np, pandas as pd, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
Q = json.load(open(__import__("pathlib").Path(__file__).parent / "raw" / "google_trends_raw.json"))["queries"]
OUT = str(__import__("pathlib").Path(__file__).parent.parent / "drafts") + "/"
C = {"streetwear": "#f2762e", "y2k fashion": "#ff5c8a", "gorpcore": "#a8c66c", "quiet luxury": "#d8cdb4",
     "dark academia": "#b84a4f", "coquette aesthetic": "#c9a0e8"}
NAME = {"streetwear": "Streetwear", "y2k fashion": "Y2K", "gorpcore": "Gorpcore", "quiet luxury": "Quiet Luxury",
        "dark academia": "Dark Academia", "coquette aesthetic": "Coquette"}
TERMS = list(C)
INK, INK2, INK3, RULE = "#f2ede3", "#a39d92", "#6b665e", "#262220"
plt.rcParams.update({"figure.facecolor": "#000", "axes.facecolor": "#000", "savefig.facecolor": "#000",
    "text.color": INK, "axes.labelcolor": INK2, "xtick.color": INK3, "ytick.color": INK3, "axes.edgecolor": RULE,
    "font.family": "DejaVu Serif", "font.size": 10})

def ts(id, start):
    q = Q[id]
    return pd.DataFrame(q["ts"], index=pd.period_range(start, periods=len(q["ts"]), freq="M"), columns=q["kw"], dtype=float)

def joined(a, b, start):
    A, B = ts(a, start), ts(b, start)
    r = A["streetwear"].sum() / B["streetwear"].sum()
    return pd.concat([A, B.drop(columns="streetwear") * r], axis=1).fillna(0)[TERMS]

def title(fig, t, sub):
    fig.text(0.04, 0.95, "DRAFT", color=INK3, fontsize=8, family="DejaVu Sans", weight="bold")
    fig.text(0.04, 0.89, t, fontsize=19)
    fig.text(0.04, 0.845, sub, color=INK2, fontsize=9.5, family="DejaVu Sans")

# ── Draft 1: country drill-down ─────────────────────────────────────────
fig, axs = plt.subplots(1, 3, figsize=(12, 4.6), sharey=True)
fig.subplots_adjust(top=0.72, bottom=0.14, left=0.06, right=0.98, wspace=0.08)
title(fig, "Click a country, see its own trend story",
      "Share of searches among the six aesthetics, by year (streetwear = the rest). Google Trends, 2015–2025.")
for ax, (geo, nm) in zip(axs, [("US", "United States"), ("CL", "Chile"), ("IN", "India")]):
    d = joined("ctyA:" + geo, "ctyB:" + geo, "2015-01")
    yr = d.groupby(d.index.year).mean()
    sh = yr.div(yr.sum(axis=1), axis=0) * 100
    for t in TERMS[1:]:
        ax.plot(sh.index, sh[t], color=C[t], lw=2)
    ax.set_title(nm, loc="left", fontsize=13, style="italic", color=INK)
    ax.grid(axis="y", color=RULE); ax.set_xticks([2015, 2020, 2025])
    for s in ["top", "right", "left"]: ax.spines[s].set_visible(False)
axs[0].set_ylabel("% of searches")
for i, t in enumerate(TERMS[1:]):
    fig.text(0.06 + i * 0.12, 0.04, "● " + NAME[t], color=C[t], fontsize=9, family="DejaVu Sans")
fig.savefig(OUT + "draft1_country_drilldown.png", dpi=180); plt.close(fig)

# ── Draft 2: who peaks first, Google or YouTube ─────────────────────────
yt = joined("ytA", "ytB", "2008-01")
rows = []
for t in TERMS:
    g = ts("alone:" + t, "2004-01")[t].rolling(3, center=True).mean()
    y = yt[t].rolling(3, center=True).mean()
    rows.append((t, g.idxmax(), y.idxmax()))
rows.sort(key=lambda r: (r[2] - r[1]).n)
fig, ax = plt.subplots(figsize=(12, 4.8))
fig.subplots_adjust(top=0.72, bottom=0.12, left=0.16, right=0.86)
title(fig, "Who peaks first: Google or YouTube?",
      "Month of each aesthetic's highest search interest (3-month average), worldwide. ○ Google   ● YouTube")
x = lambda p: p.year + (p.month - 1) / 12
for i, (t, gp, yp) in enumerate(rows):
    ax.plot([x(gp), x(yp)], [i, i], color=C[t], lw=1.4, alpha=.7)
    ax.scatter([x(gp)], [i], s=70, facecolor="#000", edgecolor=C[t], lw=1.6, zorder=3)
    ax.scatter([x(yp)], [i], s=70, color=C[t], zorder=3)
    lag = (yp - gp).n
    lab = "same month" if lag == 0 else (f"YouTube {abs(lag)} mo later" if lag > 0 else f"YouTube {abs(lag)} mo earlier")
    ax.text(2026.4, i, lab, va="center", color=C[t], fontsize=9.5, family="DejaVu Sans")
ax.set_yticks(range(len(rows))); ax.set_yticklabels([NAME[r[0]] for r in rows], color=INK2, family="DejaVu Sans")
ax.set_xlim(2017.5, 2026.3); ax.grid(axis="x", color=RULE)
for s in ["top", "right", "left"]: ax.spines[s].set_visible(False)
ax.tick_params(axis="y", length=0)
fig.savefig(OUT + "draft2_who_peaks_first.png", dpi=180); plt.close(fig)

# ── Draft 3: seasonal spiral ────────────────────────────────────────────
fig = plt.figure(figsize=(9, 7.6))
title(fig, "When in the year is each aesthetic searched?",
      "Average Google interest by calendar month, 2021–2025, scaled so each aesthetic's best month = 100.")
ax = fig.add_axes([0.12, 0.05, 0.62, 0.74], projection="polar")
ax.set_theta_zero_location("N"); ax.set_theta_direction(-1)
th = np.linspace(0, 2 * np.pi, 13)
for t in TERMS:
    g = ts("alone:" + t, "2004-01")[t]["2021":"2025"]
    m = g.groupby(g.index.month).mean(); v = (m / m.max() * 100).tolist()
    ax.plot(th, v + v[:1], color=C[t], lw=2)
    k = int(np.argmax(v)); ax.scatter([th[k]], [100], color=C[t], s=28, zorder=3)
ax.set_xticks(th[:-1]); ax.set_xticklabels(["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"], color=INK2, family="DejaVu Sans", fontsize=8.5)
ax.set_yticks([25, 50, 75, 100]); ax.set_yticklabels([]); ax.set_ylim(0, 108)
ax.grid(color=RULE); ax.spines["polar"].set_color(RULE)
for i, t in enumerate(TERMS):
    fig.text(0.78, 0.66 - i * 0.05, "● " + NAME[t], color=C[t], fontsize=10, family="DejaVu Sans")
fig.text(0.78, 0.30, "Dots mark each\naesthetic's peak month.", color=INK3, fontsize=8.5, family="DejaVu Sans")
fig.savefig(OUT + "draft3_seasonal_spiral.png", dpi=180); plt.close(fig)
for t,gp,yp in rows: print(NAME[t], gp, yp)
