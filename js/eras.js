/* ══ after 2020: the year's look against every show we studied from Lyst's #1 brands ═══
   Reads summary_by_year through SHOP and SHOWS from js/runway.js. Shows that matched the year's look get a ring
   in that look's colour (dashed = partly); the title, captions and the transition above are built from the same coding.
   The years before 2020 are covered by the hot 20, just above. Era boundaries are our grouping: most shows were
   concept-led 2020-22, and all four shows from 2023 on were clothes-led. */
SHOP.ready.then(S => {
  const svg = document.getElementById("erasSvg"); if (!svg) return;
  const NS = "http://www.w3.org/2000/svg";
  const el = (p, n, a = {}, t) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (t != null) e.textContent = t; p.appendChild(e); return e; };
  const y0 = 2020, y1 = S.ys[S.ys.length - 1], N = (y1 - y0 + 1) * 12, x0 = 150, W = 1130;
  const X = i => x0 + i / N * W, mi = m => (+m.slice(0, 4) - y0) * 12 + (+m.slice(5, 7) - 1);
  const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const ERAS = [["Concept era", 2020, 2022, "#0d1013"], ["Clothes-led era", 2023, 2025, "#6f8497"]];
  const lab = (t, y) => el(svg, "text", { x: 0, y, "font-size": 13.5, "font-weight": 600, fill: "#4a525b" }, t);
  const on = (node, html) => { node.addEventListener("pointermove", ev => showTip(ev, html)); node.addEventListener("pointerleave", hideTip); };

  ERAS.forEach(([n, a, b, c], i) => {
    const ea = Math.max(a, y0), eb = Math.min(b, y1); if (ea > eb) return;
    el(svg, "rect", { x: X((ea - y0) * 12), y: 26, width: X((eb - y0 + 1) * 12) - X((ea - y0) * 12), height: 136, fill: c, "fill-opacity": i === 0 ? .07 : .05 });
    el(svg, "text", { x: X((ea - y0) * 12) + 8, y: 17, "font-size": 13, "font-weight": 600, fill: c }, n + " · " + a + "–" + b);
  });
  for (let y = y0; y <= y1; y++) el(svg, "text", { x: X((y - y0) * 12 + 6), y: 182, "text-anchor": "middle", "font-size": 12, fill: "#7b848d" }, y);

  // row 1: the year's look
  lab("The year's look", 60);
  for (let y = y0; y <= y1; y++) {
    const k = S.YEARS[y].look, a = X((y - y0) * 12) + 3, w = X(12) - X(0) - 6, c = colorOf(k);
    const r = el(svg, "rect", { x: a, y: 38, width: w, height: 32, rx: 6, fill: c });
    el(svg, "text", { x: a + w / 2, y: 59, "text-anchor": "middle", "font-size": 13, "font-weight": 600, fill: textOn(c), "pointer-events": "none" }, nameOf(k));
    on(r, '<div class="tt">' + y + "</div>The look: " + nameOf(k) + " (share +" + S.YEARS[y].look_gain + " points)");
  }

  // row 2: the shows
  const base = 132;
  lab("Runway shows", base + 5); el(svg, "line", { x1: x0, x2: x0 + W, y1: base, y2: base, stroke: "rgba(13,16,19,.25)" });
  const placed = [];                                   // [x, level] of dots already drawn, so close shows stack instead of overlapping
  const verdict = ([, , m, , read, alt]) => { const look = S.YEARS[+m.slice(0, 4)].look; return read && read === look ? "yes" : (alt && alt === look ? "part" : "no"); };
  const inRange = s => +s[2].slice(0, 4) >= y0 && +s[2].slice(0, 4) <= y1;
  SHOWS.filter(inRange).forEach(sh => {
    const [brand, name, m, led] = sh, v = verdict(sh), look = S.YEARS[+m.slice(0, 4)].look;
    const cx = X(mi(m)) + 8;
    let lv = 0; while (placed.some(([px, pl]) => pl === lv && Math.abs(px - cx) < 30)) lv++;
    placed.push([cx, lv]); const cy = base - lv * 28;
    if (v !== "no") el(svg, "circle", { cx, cy, r: 14, fill: "none", stroke: colorOf(look), "stroke-width": 3.5, "stroke-dasharray": v === "part" ? "4 3.4" : "none" });
    const c = el(svg, "circle", { cx, cy, r: 8, fill: led === "concept" ? "#0d1013" : "#f6f4ef", stroke: "#0d1013", "stroke-width": 2 });
    on(c, '<div class="tt">' + brand + " · " + name + "</div>" + (led === "concept" ? "Concept-led" : "Clothes-led") +
      ", shown " + MONTH[+m.slice(5, 7) - 1] + " " + m.slice(0, 4) + "<br>" + (v === "yes" ? "Matched" : v === "part" ? "Partly matched" : "Did not match") + " the year's look (" + nameOf(look) + ")");
  });

  // the finding, in words, from the same coding
  const era = (a, b) => { const sh = SHOWS.filter(s => +s[2].slice(0, 4) >= a && +s[2].slice(0, 4) <= b); return { n: sh.length, yes: sh.filter(s => verdict(s) === "yes").length, concept: sh.filter(s => s[3] === "concept").length }; };
  const num = n => ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen"][n] || n;
  const all = era(y0, y1), e2 = era(2020, 2022), e3 = era(2023, y1);
  const et = document.getElementById("erasTitle");
  if (et) et.textContent = "After 2020, only " + all.yes + " of " + all.n + " shows matched the year's look";
  const setEra = (id, color, html) => { const p = document.getElementById(id); if (p) { p.innerHTML = html; p.parentNode.style.setProperty("--c", color); } };
  setEra("er1", ERAS[0][3], e2.concept + " of " + e2.n + " shows were spectacle (a livestream, a film, The Simpsons). " + (e2.yes === 0 ? "None fully matched." : e2.yes + " matched."));
  setEra("er2", ERAS[1][3], "Clothes-led again; " + e3.yes + " of " + e3.n + " matched (Prada, Miu Miu).");

  // the transition above: claimed only when the data says so (the streetwear years matched more often than the years after 2020)
  const link = document.getElementById("erasLink"), before = era(2017, 2019);
  if (link && !(before.yes / before.n > all.yes / all.n)) link.textContent = "Luxury and the trend lined up some years and drifted apart in others.";
});
