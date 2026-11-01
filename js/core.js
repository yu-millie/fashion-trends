/* ══ core: the six aesthetics, colours, data loading, shared helpers ══════
   Every other script reads from here. Loaded first. */

// Colours are the validated categorical order (adjacent pairs pass CVD checks
// on the silver page surface). ORDER is the legend order everywhere.
const TRENDS = [
  { key: "street",   name: "Streetwear",    color: "#eb6834",
    def: "Skate and hip-hop dress codes turned luxury: oversized hoodies, box logos, sneakers released in drops." },
  { key: "quiet",    name: "Quiet Luxury",  color: "#2a78d6",
    def: "Logo-free cashmere, camel coats and a tote that costs a month's rent. Wealth that declines to announce itself." },
  { key: "gorp",     name: "Gorpcore",      color: "#008300",
    def: "Technical outdoor kit worn in the city: puffers, fleece, trail shoes. Named for the trail mix." },
  { key: "y2k",      name: "Y2K",           color: "#e87ba4",
    def: "Low-rise everything, baby tees and frosted lip. The millennium's own idea of the future, worn back as nostalgia." },
  { key: "coquette", name: "Coquette",      color: "#6250d6",
    def: "Ribbons, lace trim, ballet flats and bows on everything. Girlhood staged as an aesthetic." },
  { key: "academia", name: "Dark Academia", color: "#e34948",
    def: "Tweed, pleats, oxfords and a satchel of unread Greek. Campus gothic for people who miss the library." }
];
const T = Object.fromEntries(TRENDS.map(t => [t.key, t]));
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

/* ── shared focus: tapping an aesthetic chip highlights it in every chart.
   Charts register a redraw with onFocus(fn). */
const FOCUS = { key: null, fns: [] };
const onFocus = fn => FOCUS.fns.push(fn);
function setFocus(k) {
  FOCUS.key = FOCUS.key === k ? null : k;
  FOCUS.fns.forEach(fn => fn(FOCUS.key));
}
// builds a row of aesthetic chips wired to the shared focus
function chips(sel) {
  const key = d3.select(sel).selectAll("button").data(TRENDS).join("button")
    .style("--c", d => d.color).attr("aria-pressed", "false")
    .html(d => "<i></i>" + d.name)
    .on("click", (ev, d) => setFocus(d.key));
  onFocus(f => key.attr("aria-pressed", d => String(f === d.key)));
}
