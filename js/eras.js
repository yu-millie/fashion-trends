/* ══ Fig. 8: runway shows by Lyst's #1 brands, 2020–2025, against the year's look ═══
   Two rows (the year's look, every show we studied) under two eras: Concept 2020–22, Clothes-led 2023–25.
   Reads summary_by_year through SHOP and SHOWS from js/runway.js. A show that matched the year's look gets a ring in that
   look's colour (dashed = partly). The title, era captions, closing takeaway and transition are computed from the same coding.
   One example first: the first time the chart is in view, one show (Prada Fall/Winter 2023) is lit with a short note,
   then every show appears; hovering the chart ends the example early. */
SHOP.ready.then(S => {
  const svg = document.getElementById("erasSvg"); if (!svg) return;
  const NS = "http://www.w3.org/2000/svg";
  const el = (p, n, a = {}, t) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (t != null) e.textContent = t; p.appendChild(e); return e; };
  const y0 = 2020, y1 = S.ys[S.ys.length - 1], N = (y1 - y0 + 1) * 12, x0 = 172, W = 1108;   // keep x0 / W in step with .eras-reading in index.html
  const X = i => x0 + i / N * W, mi = m => (+m.slice(0, 4) - y0) * 12 + (+m.slice(5, 7) - 1);
  const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const ERAS = [["Concept era", 2020, 2022, "#0d1013", "concept"], ["Clothes-led era", 2023, y1, "#3f5568", "clothes"]];
  const LOOK_Y = 34, LINE_Y = 150, BOTTOM = 196;
  const lab = (t, y) => el(svg, "text", { x: 0, y, "font-size": 16, "font-weight": 600, fill: "#0d1013" }, t);
  const on = (node, html) => { node.addEventListener("pointermove", ev => showTip(ev, html)); node.addEventListener("pointerleave", hideTip); };
  const fades = [];
  const fade = (node, keep) => { node.classList.add("fade"); if (keep) node.classList.add("keep"); fades.push(node); return node; };

  const verdict = ([, , m, , read, alt]) => { const look = S.YEARS[+m.slice(0, 4)].look; return read && read === look ? "yes" : (alt && alt === look ? "part" : "no"); };
  const inRange = s => +s[2].slice(0, 4) >= y0 && +s[2].slice(0, 4) <= y1;
  const shown = SHOWS.filter(inRange);
  const EX = shown.find(s => s[0] === "Prada" && s[1] === "Fall/Winter 2023") || shown.filter(s => verdict(s) === "yes").pop();
  const exY = +EX[2].slice(0, 4);

  // eras: shaded bands with their names (the names explain themselves on hover, tap or focus)
  ERAS.forEach(([n, a, b, c, def], i) => {
    el(svg, "rect", { x: X((a - y0) * 12), y: 26, width: X((b - y0 + 1) * 12) - X((a - y0) * 12), height: BOTTOM - 26, fill: c, "fill-opacity": i === 0 ? .08 : .05 });
    const t = el(svg, "text", { x: X((a - y0) * 12) + 10, y: 17, "font-size": 16, "font-weight": 600, fill: c, "data-def": def, tabindex: 0 }, n + " · " + a + "–" + b);
    t.style.cursor = "help";
  });
  for (let y = y0; y <= y1; y++) el(svg, "text", { x: X((y - y0) * 12 + 6), y: BOTTOM + 24, "text-anchor": "middle", "font-size": 14, fill: "#323941" }, y);

  // row 1: the year's look
  lab("The year's look", LOOK_Y + 21);
  for (let y = y0; y <= y1; y++) {
    const k = S.YEARS[y].look, a = X((y - y0) * 12) + 3, w = X(12) - X(0) - 6, c = colorOf(k);
    const r = fade(el(svg, "rect", { x: a, y: LOOK_Y, width: w, height: 32, rx: 5, fill: c }), y === exY);
    fade(el(svg, "text", { x: a + w / 2, y: LOOK_Y + 21, "text-anchor": "middle", "font-size": 15, "font-weight": 600, fill: textOn(c), "pointer-events": "none" }, nameOf(k)), y === exY);
    on(r, '<div class="tt">' + y + "</div>The look: " + nameOf(k) + " (share +" + S.YEARS[y].look_gain + " points)");
  }

  // row 2: every show; a second show in the same two months stacks above the first
  lab("Runway shows", LINE_Y + 5);
  el(svg, "line", { x1: x0, x2: x0 + W, y1: LINE_Y, y2: LINE_Y, stroke: "rgba(13,16,19,.25)" });
  const placed = [];   // [x, level]: a show stacks up a level when another sits within 30 units on its level
  let exDot = null;
  shown.forEach(sh => {
    const [brand, name, m, led] = sh, v = verdict(sh), look = S.YEARS[+m.slice(0, 4)].look, isEx = sh === EX;
    const cx = X(mi(m)) + 9;
    let level = 0; while (placed.some(([px, pl]) => pl === level && Math.abs(px - cx) < 30)) level++;
    placed.push([cx, level]);
    const cy = LINE_Y - level * 30;
    if (v !== "no") fade(el(svg, "circle", { cx, cy, r: 14, fill: "none", stroke: colorOf(look), "stroke-width": 3.2, "stroke-dasharray": v === "part" ? "3.6 3.4" : "none" }), isEx);
    const c = fade(el(svg, "circle", { cx, cy, r: 8.5, fill: led === "concept" ? "#0d1013" : "#f6f4ef", stroke: "#0d1013", "stroke-width": 2.2 }), isEx);
    if (isEx) exDot = [cx, cy];
    on(c, '<div class="tt">' + brand + " · " + name + "</div>" + (led === "concept" ? "<b>Concept-led:</b> the staging was the headline idea" : "<b>Clothes-led:</b> the clothes were the headline idea") +
      "<br>Shown " + MONTH[+m.slice(5, 7) - 1] + " " + m.slice(0, 4) + "<br>" + (v === "yes" ? "Matched the year's look" : v === "part" ? "Partly matched the year's look" : "Did not match the year's look") + " (" + nameOf(look) + ")");
  });

  // counts for the title, captions, takeaway and transition (all from the same coding)
  const era = (a, b) => { const sh = SHOWS.filter(s => +s[2].slice(0, 4) >= a && +s[2].slice(0, 4) <= b); return { n: sh.length, yes: sh.filter(s => verdict(s) === "yes").length, part: sh.filter(s => verdict(s) === "part").length, concept: sh.filter(s => s[3] === "concept").length }; };
  const all = era(y0, y1), e1 = era(2017, 2019), e2 = era(2020, 2022), e3 = era(2023, y1);
  const et = document.getElementById("erasTitle");
  if (et) et.textContent = "Since " + y0 + ", only " + all.yes + " of " + all.n + " shows matched the year's look";
  const exV = verdict(EX), exLook = S.YEARS[exY].look;

  // one example first: the example show lit with a two-line note beside it, everything else faded, then all shows
  const anno = el(svg, "g", { class: "anno" });
  if (exDot) {
    const tx = exDot[0] + 24, ty = LINE_Y - 44;
    el(anno, "text", { x: tx, y: ty, "font-size": 13, "font-weight": 700, fill: "#0d1013", "letter-spacing": ".06em" }, "EXAMPLE · " + EX[0].toUpperCase() + ", " + MONTH[+EX[2].slice(5, 7) - 1].toUpperCase() + " " + exY);
    el(anno, "text", { x: tx, y: ty + 18, "font-size": 14, fill: "#323941" }, (EX[3] === "concept" ? "Concept-led" : "Clothes-led") + (exV === "no" ? "; no ring: it did not match " : "; the ring: it " + (exV === "part" ? "partly matched " : "matched ")) + nameOf(exLook));
  }
  let timer = null, done = false;
  const finish = () => { if (timer) { clearTimeout(timer); timer = null; } svg.classList.remove("one"); anno.classList.add("off"); };
  anno.classList.add("off");
  svg.addEventListener("pointerenter", () => { done = true; finish(); });
  new IntersectionObserver((es, io) => {
    if (!es[0].isIntersecting || done) return; io.disconnect(); done = true;
    svg.classList.add("one"); anno.classList.remove("off");
    const box = svg.parentNode;   // on a phone the chart scrolls sideways: bring the example into view
    if (exDot && box.scrollWidth > box.clientWidth) box.scrollLeft = Math.max(0, exDot[0] / 1296 * box.scrollWidth - box.clientWidth * .4);
    timer = setTimeout(finish, 4500);
  }, { threshold: .5 }).observe(svg);

  // under the chart: one line per era
  const setEra = (i, color, html) => { const p = document.getElementById("er" + i); if (p) { p.innerHTML = html; p.parentNode.style.setProperty("--c", color); } };
  setEra(0, ERAS[0][3], e2.concept + " of " + e2.n + " shows were spectacle (a livestream, a film, The Simpsons). " + (e2.yes === 0 ? "None fully matched." : e2.yes + " matched."));
  setEra(1, ERAS[1][3], "Clothes-led again; " + e3.yes + " of " + e3.n + " matched (Prada, Miu Miu).");

  // the closing takeaway (page footer): the search pattern AND how luxury runways related to it, over the same years as this chart
  const closing = document.getElementById("closingTake");
  if (closing) {
    const L = S.life.aesthetics, med = Math.round(d3.median(L, a => a.months_above_half));
    const waves = [...new Set(L.map(a => +a.breakout.slice(0, 4)).filter(y => y >= 2020))].sort();
    const wl = waves.length > 1 ? waves.slice(0, -1).join(", ") + " and " + waves[waves.length - 1] : waves.join("");
    const byLed = k => { const g = shown.filter(x => x[3] === k); return { n: g.length, yes: g.filter(x => verdict(x) === "yes").length }; };
    const cl = byLed("clothes"), co = byLed("concept");
    if (cl.yes / cl.n > co.yes / co.n)
      closing.innerHTML = "<b>Aesthetics now move in waves,</b> each on top for about " + med + " months. <b>Luxury runways kept up only when the show was about the clothes.</b>" +
        "<small>New looks broke out in " + wl + ". Since " + y0 + ", " + cl.yes + " of " + cl.n + " clothes-led shows matched the year's look; " + (co.yes ? co.yes + " of " + co.n : "none of the " + co.n) + " concept-led shows did.</small>";
  }

  // the transition before the two-kinds block: claimed only when the eras really differ in how often shows matched
  const link = document.getElementById("erasLink"), rate = x => x.yes / x.n, rates = [e1, e2, e3].map(rate);
  if (link) link.textContent = Math.max(...rates) - Math.min(...rates) >= .25
    ? "But look deeper, and a pattern appears."
    : "And year after year, they stayed apart.";
});
