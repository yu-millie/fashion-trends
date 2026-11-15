/* ══ three eras: one timeline for streetwear's share, the year's look, the #1 brand and every show we studied ═══
   Reads share_annual, summary_by_year and lyst through SHOP, and SHOWS from js/runway.js. Shows that matched the year's look get a ring
   in that look's colour (dashed = partly); the sentence above the card is built from the same coding.
   Era boundaries are our grouping: streetwear held 97-100 % of the eight to 2019, most shows were concept-led 2020-22,
   and all four shows from 2023 on were clothes-led. */
Promise.all([SHOP.ready, loadData("share_annual")]).then(([S, sa]) => {
  const svg = document.getElementById("erasSvg"); if (!svg) return;
  const NS = "http://www.w3.org/2000/svg";
  const el = (p, n, a = {}, t) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (t != null) e.textContent = t; p.appendChild(e); return e; };
  const y0 = S.ys[0], y1 = S.ys[S.ys.length - 1], N = (y1 - y0 + 1) * 12, x0 = 150, W = 1130;
  const X = i => x0 + i / N * W, mi = m => (+m.slice(0, 4) - y0) * 12 + (+m.slice(5, 7) - 1);
  const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const ERAS = [["Streetwear era", 2017, 2019, colorOf("street")], ["Concept era", 2020, 2022, "#0d1013"], ["Clothes-led era", 2023, 2025, "#6f8497"]];
  const lane = b => ["Gucci", "Balenciaga", "Off-White"].includes(b) ? "#0d1013" : b === "Nike" ? "#9aa3ad" : "#6f8497";
  const letter = b => ({ "Saint Laurent": "S", "Miu Miu": "M", "Off-White": "O" })[b] || b[0];
  const lab = (t, y, sub) => { el(svg, "text", { x: 0, y, "font-size": 12.5, "font-weight": 600, fill: "#4a525b" }, t); if (sub) el(svg, "text", { x: 0, y: y + 16, "font-size": 11, fill: "#7b848d" }, sub); };
  const on = (node, html) => { node.addEventListener("pointermove", ev => showTip(ev, html)); node.addEventListener("pointerleave", hideTip); };

  ERAS.forEach(([n, a, b, c], i) => {
    const ea = Math.max(a, y0), eb = Math.min(b, y1); if (ea > eb) return;
    el(svg, "rect", { x: X((ea - y0) * 12), y: 24, width: X((eb - y0 + 1) * 12) - X((ea - y0) * 12), height: 282, fill: c, "fill-opacity": i === 1 ? .08 : .05 });
    el(svg, "text", { x: X((ea - y0) * 12) + 8, y: 17, "font-size": 13, "font-weight": 600, fill: c }, n + " · " + a + "–" + b);
  });
  for (let y = y0; y <= y1; y++) el(svg, "text", { x: X((y - y0) * 12 + 6), y: 326, "text-anchor": "middle", "font-size": 11, fill: "#7b848d" }, y);

  // row 1: streetwear's share of the eight
  lab("Streetwear's share", 64, "of the eight aesthetics");
  const ya = v => 108 - v * 0.62;
  const pts = sa.years.map((y, i) => [X((y - y0) * 12 + 6), ya(sa.share.street[i]), sa.share.street[i], y]).filter(p => p[3] >= y0 && p[3] <= y1);
  el(svg, "path", { d: pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(""), fill: "none", stroke: colorOf("street"), "stroke-width": 2.6 });
  pts.forEach(p => {
    const c = el(svg, "circle", { cx: p[0], cy: p[1], r: 4.5, fill: colorOf("street"), stroke: "#fff", "stroke-width": 1.5 });
    el(svg, "text", { x: p[0], y: p[1] - 10, "text-anchor": "middle", "font-size": 11, "font-weight": 600, fill: "#0d1013" }, Math.round(p[2]) + "%");
    on(c, '<div class="tt">' + p[3] + '</div>Streetwear held ' + p[2].toFixed(1) + " % of searches for the eight aesthetics");
  });

  // row 2: the year's look
  lab("The year's look", 144);
  S.ys.forEach(y => {
    const k = S.YEARS[y].look, a = X((y - y0) * 12) + 2, w = X(12) - X(0) - 4, c = colorOf(k);
    const r = el(svg, "rect", { x: a, y: 124, width: w, height: 28, rx: 6, fill: c });
    el(svg, "text", { x: a + w / 2, y: 142, "text-anchor": "middle", "font-size": 11, "font-weight": 600, fill: textOn(c), "pointer-events": "none" }, nameOf(k));
    on(r, '<div class="tt">' + y + "</div>The look: " + nameOf(k) + (k === "street" && S.YEARS[y].look_gain < .5 ? " (nothing gained ground)" : " (share +" + S.YEARS[y].look_gain + " points)"));
  });

  // row 3: the #1 Lyst brand in each quarter
  lab("#1 on Lyst", 198);
  S.Q.filter(q => q.year <= y1 && q.list && q.list.length).forEach(q => {
    const b = q.list[0], i = (q.year - y0) * 12 + (+q.q.slice(-1) - 1) * 3, w = X(3) - X(0) - 2;
    const r = el(svg, "rect", { x: X(i) + 1, y: 178, width: w, height: 28, rx: 4, fill: lane(b) });
    el(svg, "text", { x: X(i) + 1 + w / 2, y: 196, "text-anchor": "middle", "font-size": 11, "font-weight": 600, fill: "#fff", "pointer-events": "none" }, letter(b));
    on(r, '<div class="tt">' + q.q.replace(/^(\d{4})Q(\d)$/, "Q$2 $1") + "</div>#1 on Lyst: " + b);
  });

  // row 4: the shows
  lab("Runway shows", 266); el(svg, "line", { x1: x0, x2: x0 + W, y1: 262, y2: 262, stroke: "rgba(13,16,19,.25)" });
  const used = {};
  const verdict = ([, , m, , read, alt]) => { const look = S.YEARS[+m.slice(0, 4)].look; return read && read === look ? "yes" : (alt && alt === look ? "part" : "no"); };
  SHOWS.filter(s => +s[2].slice(0, 4) <= y1).forEach(sh => {
    const [brand, name, m, led] = sh, v = verdict(sh), look = S.YEARS[+m.slice(0, 4)].look;
    const i = mi(m), key = Math.round(i / 2); used[key] = used[key] || 0;
    const cx = X(i), cy = 262 - used[key]++ * 15;
    if (v !== "no") el(svg, "circle", { cx, cy, r: 11.5, fill: "none", stroke: colorOf(look), "stroke-width": 3, "stroke-dasharray": v === "part" ? "3.4 3.2" : "none" });
    const c = el(svg, "circle", { cx, cy, r: 6.5, fill: led === "concept" ? "#0d1013" : "#f6f4ef", stroke: "#0d1013", "stroke-width": 2 });
    on(c, '<div class="tt">' + brand + " · " + name + "</div>" + (led === "concept" ? "Concept-led: the staging was the idea" : "Clothes-led: the clothes were the idea") +
      "<br>Shown " + MONTH[+m.slice(5, 7) - 1] + " " + m.slice(0, 4) + "<br>" + (v === "yes" ? "Matched the year's look" : v === "part" ? "Partly matched the year's look" : "Did not match the year's look") + " (" + nameOf(look) + ")");
  });

  // the finding, in words, from the same coding
  const era = (a, b) => { const sh = SHOWS.filter(s => +s[2].slice(0, 4) >= a && +s[2].slice(0, 4) <= b); return { n: sh.length, yes: sh.filter(s => verdict(s) === "yes").length, concept: sh.filter(s => s[3] === "concept").length }; };
  const all = era(y0, y1), e1 = era(2017, 2019), e2 = era(2020, 2022);
  const num = n => ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"][n] || n;
  const c2 = SHOWS.filter(s => +s[2].slice(0, 4) >= 2020 && +s[2].slice(0, 4) <= 2022), nConcept = c2.filter(s => s[3] === "concept").length;
  const et = document.getElementById("erasTitle");
  if (et) et.textContent = "Streetwear lost share in 2020–22, when " + inWords(nConcept) + " of the " + inWords(c2.length) + " shows we studied were concept-led";
  const f = document.getElementById("erasFinding");
  if (f) f.innerHTML = "Most of the time, the brands on top did <b>not</b> match the year's look: only " + all.yes + " of the " + all.n + " shows we studied did. The matches came in two stretches, " +
    "the streetwear years (" + num(e1.yes) + " of " + num(e1.n) + " shows in 2017–19) and 2023–24, when Prada and Miu Miu matched. In 2020–22, " + (e2.yes === 0 ? "none of the " + num(e2.n) : e2.yes + " of " + e2.n) + " did, and Saint Laurent in 2025 did not either. The timeline below shows the difference.";

  // under the chart: what each era shows, in plain words, and the one-line link between the rows
  const e3 = era(2023, y1), range = (a, b) => { const v = sa.years.map((y, i) => [y, sa.share.street[i]]).filter(([y]) => y >= a && y <= b).map(p => Math.round(p[1])); return Math.min(...v) === Math.max(...v) ? v[0] + "%" : Math.min(...v) + "–" + Math.max(...v) + "%"; };
  const setEra = (i, color, html) => { const p = document.getElementById("er" + i); if (p) { p.innerHTML = html; p.parentNode.style.setProperty("--c", color); } };
  setEra(0, ERAS[0][3], "Streetwear was " + range(2017, 2019) + " of these searches. The top brands were mostly streetwear houses (Balenciaga, Off-White), and " + num(e1.yes) + " of " + num(e1.n) + " shows matched the year's look.");
  setEra(1, ERAS[1][3], "Searches spread to Cottagecore, Dark Academia and Gorpcore, and streetwear fell to " + range(2020, 2022) + ". " + cap(num(e2.concept)) + " of the " + num(e2.n) + " shows we studied were staged spectacle (a livestream, a film, twins, The Simpsons). " + (e2.yes === 0 ? "None of the " + num(e2.n) : cap(num(e2.yes)) + " of the " + num(e2.n)) + " matched the year's look.");
  setEra(2, ERAS[2][3], "The shows were about the clothes again: " + num(e3.yes) + " of " + num(e3.n) + " matched the year's look (Prada and Miu Miu), while Saint Laurent in 2025 did not.");
  // the transition above the chart: which era's shows were furthest from the year's look. Claimed only when the data says so.
  const link = document.getElementById("erasLink"), rate = x => x.yes / x.n, ex = [e1, e2, e3];
  if (link) link.textContent = ex.every((x, i) => i === 1 || rate(e2) < rate(x))
    ? "In the concept years, luxury drifted furthest from the trend."
    : "Luxury and the trend lined up some years and drifted apart in others.";
});
