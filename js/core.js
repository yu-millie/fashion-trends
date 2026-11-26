/* ══ core: the eight aesthetics, colours, data loading, shared helpers ══════
   Every other script reads from here. Loaded first. */

// Colours re-picked after Prototype III feedback ("some colours are similar"): each aesthetic keeps its colour family, stepped so that
// EVERY pair (not just neighbours, since all eight lines cross on the timeline and clock) stays apart: worst pair OKLab ΔE 18.2 for
// full colour vision (floor 15) and 8.6 under protan/deutan simulation (target 8), on the card surface #f8f6f1.
// Coquette, Cottagecore and Maximalism sit below 3:1 contrast, so every chart also names them (legend, chips, labels, tooltips).
// ORDER is the legend order everywhere.
const TRENDS_ALL = [
  { key: "street",   name: "Streetwear",    color: "#D85218",
    def: "Skate and hip-hop dress codes turned luxury: oversized hoodies, box logos, sneakers released in drops." },
  { key: "quiet",    name: "Quiet Luxury",  color: "#2762BD",
    def: "Logo-free cashmere, camel coats and a tote that costs a month's rent. Wealth that declines to announce itself." },
  { key: "gorp",     name: "Gorpcore",      color: "#1B8E51",
    def: "Technical outdoor kit worn in the city: puffers, fleece, trail shoes. Named for the trail mix." },
  { key: "y2k",      name: "Y2K",           color: "#B8338A",
    def: "Low-rise everything, baby tees and frosted lip. The millennium's own idea of the future, worn back as nostalgia." },
  { key: "coquette", name: "Coquette",      color: "#9680F2",
    def: "Ribbons, lace trim, ballet flats and bows on everything. Girlhood staged as an aesthetic." },
  { key: "academia", name: "Dark Academia", color: "#823A25",
    def: "Tweed, pleats, oxfords and a satchel of unread Greek. Campus gothic for people who miss the library." },
  // added after the first six (data collected 14 Nov 2026). `extra` entries are charted only if the data has a series for them.
  { key: "cottage",  name: "Cottagecore",   color: "#28B9C4", extra: true,
    def: "Gingham, pointelle knits and headscarves, dressed as if the orchard were next door. Pastoral calm for people who live in cities." },
  { key: "maxi",     name: "Maximalism",    color: "#C1A233", extra: true,
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
const INK = { ink: "#0d1013", ink2: "#323941", ink3: "#525a63", grid: "rgba(13,16,19,.09)", rule: "rgba(13,16,19,.14)", nodata: "#c9d1d8", paper: "#e6eaee" };

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
/* ── definitions on hover: any element with data-def="<key>" shows that term's definition in the shared tooltip
   (on hover, tap or keyboard focus). Used for concept-led / clothes-led wherever they appear. */
const TERMS = {
  concept: ["Concept-led show", "The <b>staging</b> was the headline idea. At Gucci's 2018 \u201cCyborg\u201d show, models carried copies of their own heads.", "2018-gucci.jpg"],
  clothes: ["Clothes-led show", "The <b>clothes</b> were the headline idea. Prada's Fall/Winter 2023 was a plain runway of pared-back pieces.", "2023-prada.jpg"],
  match: ["Matches the year's look", "The show's closest aesthetic, from our reading of reviews, is the aesthetic that gained most in search that year. <b>Partly</b>: a looser reading fits."]
};
const defHTML = k => TERMS[k] ? (TERMS[k][2] ? '<img class="tpic" alt="" src="assets/runway/' + TERMS[k][2] + '">' : "") + '<div class="tt">' + TERMS[k][0] + "</div>" + TERMS[k][1] + '<div class="tnote">Our reading of published reviews, not a measurement.</div>' : "";
document.addEventListener("pointerover", ev => { const t = ev.target.closest && ev.target.closest("[data-def]"); if (t) showTip(ev, defHTML(t.dataset.def)); });
document.addEventListener("pointermove", ev => { const t = ev.target.closest && ev.target.closest("[data-def]"); if (t && !tip.hidden) showTip(ev, defHTML(t.dataset.def)); });
document.addEventListener("pointerout", ev => { const t = ev.target.closest && ev.target.closest("[data-def]"); if (t && !t.contains(ev.relatedTarget)) hideTip(); });
document.addEventListener("focusin", ev => { const t = ev.target.closest && ev.target.closest("[data-def]"); if (!t) return; const r = t.getBoundingClientRect(); showTip({ clientX: r.left, clientY: r.bottom }, defHTML(t.dataset.def)); });
document.addEventListener("focusout", ev => { if (ev.target.closest && ev.target.closest("[data-def]")) hideTip(); });
const term = (k, label) => '<span class="term" data-def="' + k + '" tabindex="0">' + label + "</span>";

/* ── "read one, then all": the three new chart forms open on a single worked example before showing every series.
   root holds buttons with data-step="0|1" and blocks with data-show="0|1"; onStep(i) redraws the chart. */
function introSteps(root, onStep) {
  const set = i => {
    root.dataset.step = i;
    root.querySelectorAll(".intro-tabs [data-step]").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.step === i)));
    root.querySelectorAll("[data-show]").forEach(e => { e.hidden = +e.dataset.show !== i; });
    onStep(i);
  };
  root.addEventListener("click", ev => { const b = ev.target.closest("[data-step]"); if (b) set(+b.dataset.step); });
  return set;
}

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
  const row = d3.select(sel);
  const all = row.selectAll("button.all").data([0]).join("button").attr("class", "all").attr("aria-pressed", "true").text("All")
    .on("click", () => G.clear());
  const key = row.selectAll("button.k").data(TRENDS).join("button").attr("class", "k")
    .style("--c", d => d.color).attr("aria-pressed", "false")
    .html(d => "<i></i>" + d.name)
    .on("click", (ev, d) => G.set(d.key));
  G.on(f => { key.attr("aria-pressed", d => String(f === d.key)); all.attr("aria-pressed", String(!f)); });
}
/* one example first: the first time the chart is in view (and nothing is filtered), show one aesthetic with its numbers
   for `ms`, then open up to all eight. Any filter click or hover ends it early (call the returned function). */
function introDemo(node, G, show, exKey, panel, ms) {
  let t = null, done = false;
  const finish = () => { if (t) { clearTimeout(t); t = null; } panel.classList.remove("demo"); };
  const cancel = () => { done = true; finish(); };
  new IntersectionObserver((es, io) => {
    if (!es[0].isIntersecting || done) return; io.disconnect(); done = true;
    if (G.key) return;
    show(exKey);
    const nm = panel.querySelector(".fd-name"); if (nm) nm.insertAdjacentHTML("afterbegin", '<span class="fd-ex">Example</span>');
    panel.style.setProperty("--ms", ms + "ms"); panel.classList.add("demo");
    t = setTimeout(() => { finish(); show(G.key); }, ms);
  }, { threshold: .5 }).observe(node);
  return cancel;
}
/* the small panel under a filtered chart: one aesthetic's numbers, or a prompt when "All" is on */
function filterPanel(el, key, cells, prompt) {
  if (!key) { el.innerHTML = '<span class="fd-all">' + prompt + "</span>"; el.style.removeProperty("--c"); return; }
  el.style.setProperty("--c", colorOf(key));
  el.innerHTML = '<span class="fd-name"><i></i>' + nameOf(key) + "</span>" +
    cells.map(([k, v]) => '<span class="fd-cell"><small>' + k + "</small><b>" + v + "</b></span>").join("");
}
