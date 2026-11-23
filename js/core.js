/* ══ core: the eight aesthetics, colours, data loading, shared helpers ══════
   Every other script reads from here. Loaded first. */

// Colours are the validated categorical order (adjacent pairs pass CVD checks
// on the silver page surface). ORDER is the legend order everywhere.
const TRENDS_ALL = [
  { key: "street",   name: "Streetwear",    color: "#CC623E",
    def: "Skate and hip-hop dress codes turned luxury: oversized hoodies, box logos, sneakers released in drops." },
  { key: "quiet",    name: "Quiet Luxury",  color: "#497C9C",
    def: "Logo-free cashmere, camel coats and a tote that costs a month's rent. Wealth that declines to announce itself." },
  { key: "gorp",     name: "Gorpcore",      color: "#44765B",
    def: "Technical outdoor kit worn in the city: puffers, fleece, trail shoes. Named for the trail mix." },
  { key: "y2k",      name: "Y2K",           color: "#CB648E",
    def: "Low-rise everything, baby tees and frosted lip. The millennium's own idea of the future, worn back as nostalgia." },
  { key: "coquette", name: "Coquette",      color: "#9475B5",
    def: "Ribbons, lace trim, ballet flats and bows on everything. Girlhood staged as an aesthetic." },
  { key: "academia", name: "Dark Academia", color: "#574052",
    def: "Tweed, pleats, oxfords and a satchel of unread Greek. Campus gothic for people who miss the library." },
  // added after the first six (data collected 14 Nov 2026). `extra` entries are charted only if the data has a series for them.
  { key: "cottage",  name: "Cottagecore",   color: "#369894", extra: true,
    def: "Gingham, pointelle knits and headscarves, dressed as if the orchard were next door. Pastoral calm for people who live in cities." },
  { key: "maxi",     name: "Maximalism",    color: "#BD922F", extra: true,
    def: "Clashing prints, saturated colour and statement accessories piled on at once. More is the whole idea." }
];
// an aesthetic is charted only if the data has a series for it
const HAS_SERIES = k => { const L = window.SITE_DATA && window.SITE_DATA.lifecycle; return L ? L.aesthetics.some(a => a.key === k) : true; };
const TRENDS = TRENDS_ALL.filter(t => !t.extra || HAS_SERIES(t.key));
const T = Object.fromEntries(TRENDS_ALL.map(t => [t.key, t]));
// label colour for text drawn on a coloured fill: white or charcoal, whichever has the higher WCAG contrast
function textOn(hex) {
  const lum = h => { const n = parseInt(h.slice(1), 16), f = v => { v /= 255; return v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(n >> 16) + .7152 * f((n >> 8) & 255) + .0722 * f(n & 255); };
  const l = lum(hex), white = 1.05 / (l + .05), dark = (l + .05) / (lum("#0d1013") + .05);
  return white >= dark ? "#fff" : "#0d1013";
}

const ORDER = TRENDS.map(t => t.key);
const colorOf = k => (T[k] && T[k].color) || "#7b848d";
const nameOf = k => (T[k] && T[k].name) || k;

// chart ink (matches the CSS tokens)
const INK = { ink: "#0d1013", ink2: "#4a525b", ink3: "#7b848d", grid: "rgba(13,16,19,.09)", rule: "rgba(13,16,19,.14)", nodata: "#c9d1d8", paper: "#e6eaee" };

/* ── data: every chart reads from data/ (built by pipeline/build.py).
   data/bundle.js holds the same JSON so the page also works opened from disk. */
const loadData = n => (window.SITE_DATA && window.SITE_DATA[n]) ? Promise.resolve(window.SITE_DATA[n]) : d3.json("data/" + n + ".json");
const DATA = Promise.all(["share_annual", "lifecycle", "platforms", "summary_by_year"].map(loadData))
  .then(([share, life, platforms, summary]) => ({ share, life, platforms, summary }));
const LIFE = {};
DATA.then(({ life }) => life.aesthetics.forEach(a => { LIFE[a.key] = a; }));

/* ── small helpers ── */
const yearOf = ym => +ym.slice(0, 4);
const parseMonth = d3.utcParse("%Y-%m");
const fmtMonth = d3.utcFormat("%b %Y");
const WORDS = ["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];
const TENS = ["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];
const inWords = n => n < 20 ? WORDS[n] : TENS[Math.floor(n / 10)] + (n % 10 ? "-" + WORDS[n % 10] : "");
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

/* ── one shared tooltip ── */
const tip = document.createElement("div");
tip.className = "vtip"; tip.hidden = true; document.body.appendChild(tip);
function showTip(ev, html) {
  tip.innerHTML = html; tip.hidden = false;
  const w = tip.offsetWidth, h = tip.offsetHeight;
  let x = ev.clientX + 16, y = ev.clientY + 16;
  if (x + w > innerWidth - 10) x = ev.clientX - w - 16;
  if (y + h > innerHeight - 10) y = ev.clientY - h - 16;
  tip.style.left = Math.max(8, x) + "px"; tip.style.top = Math.max(8, y) + "px";
}
const hideTip = () => { tip.hidden = true; };
const tipRow = (k, label, v, top) => '<div class="tr' + (top ? " top" : "") + '" style="--c:' + colorOf(k) + '"><i></i><span>' + label + "</span><b>" + v + "</b></div>";

/* ── aesthetic filter: each chart owns its own (no filter carries from one chart to another).
   A group resets itself when its chart scrolls out of view, so a forgotten filter never follows the reader. */
function focusGroup(scope) {
  const G = { key: null, fns: [] };
  G.on = fn => G.fns.push(fn);
  G.set = k => { G.key = G.key === k ? null : k; G.fns.forEach(fn => fn(G.key)); };
  G.clear = () => { if (G.key) { G.key = null; G.fns.forEach(fn => fn(null)); } };
  if (scope) new IntersectionObserver(es => { if (!es[0].isIntersecting) G.clear(); }).observe(scope);
  return G;
}
// builds a row of aesthetic chips wired to one chart's filter
function chips(sel, G) {
  const key = d3.select(sel).selectAll("button").data(TRENDS).join("button")
    .style("--c", d => d.color).attr("aria-pressed", "false")
    .html(d => "<i></i>" + d.name)
    .on("click", (ev, d) => G.set(d.key));
  G.on(f => key.attr("aria-pressed", d => String(f === d.key)));
}
