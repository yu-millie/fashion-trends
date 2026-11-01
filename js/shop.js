/* ══ the shops: year in review → the hot 20 → the shop → brands per look ═══
   SHOP holds the section's shared state:
     SHOP.year    the selected year (slider, ticks, hot-20 quarter, table clicks all set it)
     SHOP.picked  brands the viewer hearted ("following"); highlighted in every view
   Views register with SHOP.onYear / SHOP.onPick. js/brands.js adds the full
   data tables to the same state. */
const SHOP = (() => {
  const S = { year: null, picked: new Set(), onYear: [], onPick: [] };
  S.setYear = (y, src) => {
    if (!S.YEARS[y]) return;
    S.year = y;
    S.onYear.forEach(fn => fn(y, S.YEARS[y], src));
  };
  S.toggle = name => {
    S.picked.has(name) ? S.picked.delete(name) : S.picked.add(name);
    S.onPick.forEach(fn => fn(S.picked));
  };

  S.ready = Promise.all([DATA, loadData("brands"), loadData("lyst")]).then(([{ summary, life }, br, ly]) => {
    S.YEARS = Object.fromEntries(summary.years.map(y => [y.year, y]));
    S.ys = summary.years.map(y => y.year);
    S.Q = ly.quarters;
    S.life = life;
    const lookOf = y => S.YEARS[Math.max(S.ys[0], Math.min(S.ys[S.ys.length - 1], y))].look;
    S.lookColor = y => colorOf(lookOf(y));
    // per brand: search growth by year, the spike year, and Lyst ranks by year
    S.brands = br.brands.map(b => {
      const growth = S.ys.map(y => {
        const i = br.years.indexOf(y), prev = b.annual[i - 1];
        return prev >= 10 ? (b.annual[i] / prev - 1) * 100 : null;      // same rule as the pipeline
      });
      const bestJ = d3.maxIndex(growth.map(g => g ?? -Infinity));
      const lystBest = {};
      S.Q.forEach(q => { const r = q.ranks[b.name]; if (r && (!lystBest[q.year] || r < lystBest[q.year])) lystBest[q.year] = r; });
      return { name: b.name, annual: b.annual, values: b.values, growth, spike: S.ys[bestJ], spikeG: growth[bestJ], lystBest,
               quartersRanked: S.Q.filter(q => q.ranks[b.name]).length, quartersAll: S.Q.filter(q => q.depth).length };
    });
    S.byName = Object.fromEntries(S.brands.map(b => [b.name, b]));
    S.bmonths = br.months.map(parseMonth);
    S.byears = br.years;
    return S;
  });
  return S;
})();

/* ── year controls + year-in-review spread ───────────────────────────── */
SHOP.ready.then(S => {
  const range = document.getElementById("yearRange"), spread = document.getElementById("spread");
  range.min = S.ys[0]; range.max = S.ys[S.ys.length - 1];
  const ticks = d3.select("#yearTicks").selectAll("button").data(S.ys).join("button").text(d => d).on("click", (ev, d) => S.setYear(d));
  range.addEventListener("input", e => S.setYear(+e.target.value));

  // Lyst's hottest brand of a year = the brand at #1 in the most quarters
  const no1 = y => {
    const qs = S.Q.filter(q => q.year === y && q.list && q.list.length);
    const counts = d3.rollups(qs, v => v.length, q => q.list[0]).sort((a, b) => b[1] - a[1]);
    const top = counts.filter(c => c[1] === counts[0][1]).map(c => c[0]);
    return { names: top, n: counts[0][1], of: qs.length };
  };
  let first = true;
  S.onYear.push((y, row) => {
    range.value = y;
    range.style.setProperty("--p", ((y - S.ys[0]) / (S.ys.length - 1) * 100) + "%");
    ticks.classed("on", d => d === y);
    const fill = () => {
      const t = T[row.look], n1 = no1(y);
      document.getElementById("spYear").textContent = y;
      document.getElementById("spPhoto").innerHTML = personImg(row.look);
      document.getElementById("spNo1").textContent = n1.names.join(" / ");
      document.getElementById("spNo1Sub").textContent = "#1 in " + n1.n + " of " + n1.of + " quarters" + (n1.names.length > 1 ? " each" : "") + (y === 2017 ? " (no Q4 index)" : "");
      document.getElementById("spLook").textContent = t.name;
      document.getElementById("spLookSub").textContent = row.look === "street" && row.look_gain < .5
        ? "No aesthetic gained ground, so streetwear still set the look."
        : "Its share of the six grew most this year (+" + row.look_gain + " points).";
      const max = d3.max(row.brands, b => b.growth);
      document.getElementById("spRisers").innerHTML = row.brands.slice(0, 5).map(b =>
        '<li style="--c:' + t.color + '">' + b.name + "<span>+" + b.growth + '%</span><i style="width:' + Math.max(8, b.growth / max * 100) + '%"></i></li>').join("");
      document.getElementById("spPage").textContent = "Lyst Index + Google Trends · " + y;
    };
    if (first) { fill(); first = false; return; }
    spread.classList.add("turn");
    setTimeout(() => { fill(); spread.classList.remove("turn"); }, 260);
  });
});

/* ── the hot 20: Lyst's ranking, quarter by quarter ───────────────────── */
SHOP.ready.then(S => {
  const QS = S.Q.filter(q => q.depth);
  const slider = document.getElementById("h20Range"), label = document.getElementById("h20Q"), play = document.getElementById("h20Play");
  slider.min = 0; slider.max = QS.length - 1;
  const W = 1100, rowH = 25, H = 20 * rowH + 6, L = 250;
  const svg = d3.select("#slotH20").append("svg").attr("class", "viz h20").attr("viewBox", [0, 0, W, H]);
  const x = d3.scaleLinear().domain([0, 20]).range([0, W - L - 70]);
  const ours = new Set(S.brands.map(b => b.name));
  let qi = 0, timer = null;

  function draw() {
    const q = QS[qi], prev = QS[qi - 1];
    label.textContent = q.q.replace("Q", " Q");
    slider.value = qi;
    const prevRank = n => prev ? (prev.list.indexOf(n) + 1 || null) : null;
    const rows = q.list.map((n, i) => ({ n, r: i + 1, p: n === "?" ? null : prevRank(n) }));
    const c = q.year > S.ys[S.ys.length - 1] ? INK.ink2 : S.lookColor(q.year);
    const g = svg.selectAll("g.row").data(rows, d => d.n).join(enter => {
      const e = enter.append("g").attr("class", "row").attr("transform", "translate(0," + H + ")").style("opacity", 0);
      e.append("text").attr("class", "rk").attr("x", 22).attr("y", rowH / 2 + 4).attr("text-anchor", "end");
      e.append("text").attr("class", "nm").attr("x", L - 12).attr("y", rowH / 2 + 4).attr("text-anchor", "end");
      e.append("rect").attr("class", "bar").attr("x", L).attr("y", 3).attr("height", rowH - 6).attr("rx", 4).attr("width", 0);
      e.append("text").attr("class", "ch").attr("y", rowH / 2 + 4);
      return e;
    }, u => u, ex => ex.transition().duration(400).style("opacity", 0).attr("transform", "translate(0," + H + ")").remove());
    g.on("click", (ev, d) => ours.has(d.n) && S.toggle(d.n)).style("cursor", d => ours.has(d.n) ? "pointer" : "default")
      .on("pointermove", (ev, d) => showTip(ev, '<div class="tt">' + d.n + "</div>#" + d.r + " in " + q.q.replace("Q", " Q") +
        (d.p ? "<br>" + (d.p === d.r ? "same as" : d.p > d.r ? "up from" : "down from") + " #" + d.p + " last quarter" : prev ? "<br>new to the list" : "") +
        (ours.has(d.n) ? '<div style="margin-top:4px;font-size:11px">Click to follow this brand</div>' : "")))
      .on("pointerleave", hideTip);
    g.classed("picked", d => S.picked.has(d.n));
    g.transition().duration(650).ease(d3.easeCubicInOut).attr("transform", d => "translate(0," + (d.r - 1) * rowH + ")").style("opacity", 1);
    g.select(".rk").text(d => d.r);
    g.select(".nm").text(d => d.n === "?" ? "(not reported)" : d.n).style("fill", d => ours.has(d.n) ? INK.ink : INK.ink3);
    g.select(".bar").transition().duration(650).attr("width", d => x(21 - d.r)).attr("fill", d => ours.has(d.n) ? c : "#dfe3e7");
    g.select(".ch").transition().duration(650).attr("x", d => L + x(21 - d.r) + 8)
      .text(d => !prev || d.n === "?" ? "" : !d.p ? "NEW" : d.p === d.r ? "" : (d.p > d.r ? "▲" : "▼") + Math.abs(d.p - d.r))
      .style("fill", d => !d.p ? INK.ink : d.p > d.r ? "#c4302b" : "#1c5cab");
  }
  const goQ = (i, src) => {
    qi = Math.max(0, Math.min(QS.length - 1, i)); draw();
    const y = QS[qi].year;
    if (S.YEARS[y] && y !== S.year) S.setYear(y, "h20");
  };
  slider.addEventListener("input", e => goQ(+e.target.value));
  const stop = () => { clearInterval(timer); timer = null; play.textContent = "▶"; };
  play.addEventListener("click", () => {
    if (timer) return stop();
    if (qi >= QS.length - 1) goQ(0);
    play.textContent = "❚❚";
    timer = setInterval(() => { if (qi >= QS.length - 1) return stop(); goQ(qi + 1); }, 1100);
  });
  S.onYear.push((y, row, src) => {
    if (src === "h20") return;
    const last = QS.map(q => q.year).lastIndexOf(y);
    if (last >= 0) { qi = last; draw(); }
  });
  S.onPick.push(() => svg.selectAll("g.row").classed("picked", d => S.picked.has(d.n)));
});

/* ── the shop: every brand as a product tile ─────────────────────────── */
SHOP.ready.then(S => {
  const grid = d3.select("#shopGrid");
  let sortBy = "rank";
  const lastY = S.ys[S.ys.length - 1];
  // the "tag" a shop would print on the tile, from the data for year y
  const tag = (b, y) => {
    const cur = b.lystBest[y], prev = b.lystBest[y - 1], prevKnown = S.Q.some(q => q.year === y - 1 && q.depth);
    if (cur === 1) return ["Bestseller", "hot"];
    if (cur && !prev && prevKnown) return ["New in", ""];
    if (cur && prev && prev - cur >= 3) return ["Trending ▲" + (prev - cur), "up"];
    if (cur && prev && cur - prev >= 3) return ["Markdown ▼" + (cur - prev), "down"];
    if (!cur) return ["Sold out", "out"];
    return null;
  };
  const tiles = grid.selectAll("div.item").data(S.brands, b => b.name).join("div").attr("class", "item");
  tiles.html(b => '<div class="shot"><div class="a"><div class="wm">' + b.name + "<small></small></div></div><div class=\"b\"></div>" +
      '<span class="tagl"></span><button class="heart" aria-label="Follow ' + b.name + '">♡</button></div>' +
      '<div class="meta"><div class="bn">' + b.name + '</div><div class="price"><b></b><s></s></div><div class="info"></div><div class="sizes"></div></div>');
  tiles.select(".heart").on("click", (ev, b) => { ev.stopPropagation(); S.toggle(b.name); });

  // front image: search interest as an area chart under the wordmark, selected year shaded
  const sw = 220, sh = 90;
  const sx = d3.scaleUtc().domain(d3.extent(S.bmonths)).range([0, sw]);
  const sy = d3.scaleLinear().domain([0, 100]).range([sh, 18]);
  tiles.select(".a").append("svg").attr("viewBox", [0, 0, sw, sh]).attr("preserveAspectRatio", "none").each(function (b) {
    const s = d3.select(this);
    s.append("rect").attr("class", "yb").attr("y", 0).attr("height", sh).attr("fill", "#fff").attr("opacity", .7);
    s.append("path").attr("d", d3.area().x((d, i) => sx(S.bmonths[i])).y0(sh).y1(sy).curve(d3.curveBasis)(b.values)).attr("fill", INK.ink).attr("fill-opacity", .1);
    s.append("path").attr("d", d3.line().x((d, i) => sx(S.bmonths[i])).y(sy).curve(d3.curveBasis)(b.values)).attr("fill", "none").attr("stroke", INK.ink).attr("stroke-width", 1.3).attr("vector-effect", "non-scaling-stroke");
  });
  // back image (on hover): Lyst rank, quarter by quarter
  const QS = S.Q.filter(q => q.depth);
  const bx = d3.scalePoint().domain(QS.map(q => q.q)).range([14, 206]), by_ = d3.scaleLinear().domain([1, 21]).range([34, 236]);
  tiles.select(".b").append("svg").attr("viewBox", [0, 0, 220, 275]).each(function (b) {
    const s = d3.select(this);
    s.append("text").attr("x", 14).attr("y", 20).style("font", "9px var(--mono)").style("fill", INK.ink3).text("LYST RANK, 2017–2026");
    [1, 10, 20].forEach(r => { s.append("line").attr("x1", 14).attr("x2", 206).attr("y1", by_(r)).attr("y2", by_(r)).attr("stroke", "rgba(13,16,19,.08)");
      s.append("text").attr("x", 210).attr("y", by_(r) + 3).style("font", "8px var(--mono)").style("fill", INK.ink3).text("#" + r); });
    const pts = QS.map(q => ({ q, r: q.ranks[b.name] }));
    s.append("path").attr("d", d3.line().defined(d => d.r).x(d => bx(d.q.q)).y(d => by_(d.r))(pts)).attr("fill", "none").attr("stroke", INK.ink).attr("stroke-width", 1.6);
    s.selectAll("circle").data(pts.filter(d => d.r)).join("circle").attr("cx", d => bx(d.q.q)).attr("cy", d => by_(d.r)).attr("r", 2.2).attr("fill", d => S.lookColor(d.q.year));
    s.append("text").attr("x", 14).attr("y", 262).style("font", "9.5px var(--mono)").style("fill", INK.ink2)
      .text("in the top 20 for " + b.quartersRanked + " of " + b.quartersAll + " quarters");
  });
  // "sizes": one swatch per year, filled when the brand made Lyst's list that year
  const years = d3.range(S.ys[0], 2027);
  tiles.select(".sizes").selectAll("i").data(b => years.map(y => ({ b, y }))).join("i").attr("title", d => d.y);

  function update() {
    const y = S.year, c = S.lookColor(y);
    tiles.style("--c", c);
    tiles.select(".tagl").each(function (b) { const t = tag(b, y); d3.select(this).attr("class", "tagl " + (t ? t[1] : "")).style("display", t ? null : "none").text(t ? t[0] : ""); });
    tiles.select(".price b").text(b => b.lystBest[y] ? "Lyst #" + b.lystBest[y] : "Not ranked");
    tiles.select(".price s").text(b => b.lystBest[y - 1] && b.lystBest[y - 1] !== b.lystBest[y] ? "#" + b.lystBest[y - 1] : "");
    tiles.select(".price").classed("up", b => b.lystBest[y] && b.lystBest[y - 1] && b.lystBest[y] < b.lystBest[y - 1]);
    tiles.select(".info").text(b => { const g = b.growth[S.ys.indexOf(y)]; return g == null ? "Searches too low to measure in " + y : "Searches " + (g >= 0 ? "+" : "") + Math.round(g) + "% in " + y; });
    tiles.select(".wm small").text(b => b.spike === y ? "search spike year" : "spike " + b.spike);
    tiles.select(".a .yb").attr("x", sx(new Date(Date.UTC(y, 0, 1)))).attr("width", sx(new Date(Date.UTC(y + 1, 0, 1))) - sx(new Date(Date.UTC(y, 0, 1))));
    tiles.selectAll(".sizes i").classed("on", d => !!d.b.lystBest[d.y]).classed("cur", d => d.y === y);
    // sort
    const g = b => b.growth[S.ys.indexOf(y)] ?? -999;
    const order = S.brands.slice().sort(sortBy === "az" ? (p, q) => p.name.localeCompare(q.name)
      : sortBy === "growth" ? (p, q) => g(q) - g(p)
      : (p, q) => (p.lystBest[y] || 99) - (q.lystBest[y] || 99) || p.name.localeCompare(q.name));
    tiles.sort((p, q) => order.indexOf(p) - order.indexOf(q));
    document.getElementById("shopCount").textContent = S.brands.length + " items · " + S.brands.filter(b => b.lystBest[y]).length + " in stock on Lyst in " + y;
  }
  d3.selectAll(".shopbar [data-sort]").on("click", function () {
    sortBy = this.dataset.sort;
    d3.selectAll(".shopbar [data-sort]").attr("aria-pressed", function () { return String(this.dataset.sort === sortBy); });
    update();
  });
  d3.select("#bag").on("click", () => { [...S.picked].forEach(n => S.toggle(n)); });
  S.onYear.push(update);
  S.onPick.push(p => {
    tiles.classed("picked", b => p.has(b.name)).select(".heart").text(b => p.has(b.name) ? "♥" : "♡");
    document.getElementById("bagN").textContent = p.size;
    d3.select("#bag").attr("title", p.size ? "Click to clear" : null);
  });
});

/* ── brands per look: each aesthetic's time on top + brand search spikes ── */
SHOP.ready.then(S => {
  const A = S.life.aesthetics.slice().sort((a, b) => a.breakout.localeCompare(b.breakout));
  const t = s => { const [y, m] = s.split("-").map(Number); return y + (m - 1) / 12; };
  const W = 1100, rowH = 40, L = 200, top = 30;
  // brand tags: placed at their spike year, then stacked into the first row where they don't collide
  const cw = b => b.name.length * 7.2 + 20;
  const tagsIn = S.brands.slice().sort((a, b) => a.spike - b.spike || a.name.localeCompare(b.name));
  const xc = y => L + (y + .5 - 2016) / 10.5 * (W - 10 - L);
  const placed = [];
  tagsIn.forEach(b => {
    const x0 = xc(b.spike) - cw(b) / 2, x1 = x0 + cw(b);
    let j = 0;
    while (placed.some(p => p.j === j && p.x0 < x1 + 6 && x0 < p.x1 + 6)) j++;
    placed.push({ b, y: b.spike, j, x0, x1 });
  });
  const maxStack = d3.max(placed, p => p.j) + 1;
  const chipTop = top + A.length * rowH + 26, H = chipTop + maxStack * 26 + 10;
  const svg = d3.select("#slotBPL").append("svg").attr("class", "viz bpl").attr("viewBox", [0, 0, W, H]);
  const x = d3.scaleLinear().domain([2016, 2026.5]).range([L, W - 10]);
  d3.range(2016, 2027).forEach(y => {
    svg.append("line").attr("x1", x(y)).attr("x2", x(y)).attr("y1", top - 8).attr("y2", H - 4).attr("stroke", "rgba(13,16,19,.07)");
    svg.append("text").attr("class", "yr").attr("x", x(y + .5)).attr("y", 14).attr("text-anchor", "middle").text(y);
  });
  const ycur = svg.append("rect").attr("y", top - 10).attr("height", H - top + 6).attr("rx", 6).attr("fill", "rgba(255,255,255,.75)").lower();
  svg.append("defs").selectAll("clipPath").data(A).join("clipPath").attr("id", a => "bpl-" + a.key).append("circle").attr("r", 15).attr("cx", 16).attr("cy", 16);

  const rows = svg.selectAll("g.arow").data(A).join("g").attr("class", "arow").attr("transform", (a, i) => "translate(0," + (top + i * rowH) + ")");
  rows.append("image").attr("href", a => photo(a.key)).attr("x", 0).attr("y", 0).attr("width", 32).attr("height", 32)
    .attr("preserveAspectRatio", "xMidYMin slice").attr("clip-path", a => "url(#bpl-" + a.key + ")");
  rows.append("circle").attr("cx", 16).attr("cy", 16).attr("r", 15.5).attr("fill", "none").attr("stroke", a => colorOf(a.key)).attr("stroke-width", 1.5);
  rows.append("text").attr("x", 42).attr("y", 20).style("font-size", "13px").style("fill", INK.ink).text(a => nameOf(a.key));
  const bars = rows.append("rect").attr("class", "bar").attr("x", a => x(t(a.breakout))).attr("y", 8).attr("height", 16).attr("rx", 8)
    .attr("width", a => Math.max(6, x(t(a.fade) + 1 / 12) - x(t(a.breakout)))).attr("fill", a => colorOf(a.key));
  rows.append("circle").attr("cx", a => x(t(a.peak) + 1 / 24)).attr("cy", 16).attr("r", 4).attr("fill", "#fff").attr("stroke", INK.ink).attr("stroke-width", 1.2);

  svg.append("text").attr("x", 42).attr("y", chipTop + 13).style("font-size", "13px").style("font-weight", 500).style("fill", INK.ink).text("Brand search spikes");
  const chips = svg.selectAll("g.chip").data(placed).join("g").attr("class", "chip")
    .attr("transform", d => "translate(" + x(d.y + .5) + "," + (chipTop + d.j * 26) + ")");
  chips.append("rect").attr("x", d => -(d.b.name.length * 3.6 + 10)).attr("width", d => d.b.name.length * 7.2 + 20).attr("height", 20).attr("rx", 10);
  chips.append("text").attr("y", 14).attr("text-anchor", "middle").text(d => d.b.name);

  const activeIn = (a, y) => t(a.breakout) < y + 1 && t(a.fade) + 1 / 12 > y;      // aesthetic on top at some point in year y
  rows.on("pointerenter", (ev, a) => { chips.classed("dim", d => !activeIn(a, d.y)); rows.classed("dim", r => r !== a); })
    .on("pointermove", (ev, a) => showTip(ev, '<div class="tt">' + nameOf(a.key) + "</div>On top " + a.breakout.slice(0, 4) + "–" + a.fade.slice(0, 4) +
      " · peaked " + fmtMonth(parseMonth(a.peak)) + "<br>Brands that spiked meanwhile: " + (chips.filter(d => activeIn(a, d.y)).data().map(d => d.b.name).join(", ") || "none")))
    .on("pointerleave", () => { chips.classed("dim", false); rows.classed("dim", false); hideTip(); });
  chips.on("pointerenter", (ev, d) => { rows.classed("dim", a => !activeIn(a, d.y)); chips.classed("dim", c => c !== d); })
    .on("pointermove", (ev, d) => showTip(ev, '<div class="tt">' + d.b.name + "</div>Searches +" + Math.round(d.b.spikeG) + "% in " + d.y +
      (d.b.lystBest[d.y] ? "<br>Best Lyst rank that year: #" + d.b.lystBest[d.y] : "<br>Not in Lyst's list that year") +
      "<br>Looks on top: " + (A.filter(a => activeIn(a, d.y)).map(a => nameOf(a.key)).join(", ") || "none") +
      '<div style="margin-top:4px;font-size:11px">Click to follow</div>'))
    .on("pointerleave", () => { rows.classed("dim", false); chips.classed("dim", false); hideTip(); })
    .on("click", (ev, d) => S.toggle(d.b.name));

  S.onYear.push(y => ycur.transition().duration(450).attr("x", x(y)).attr("width", x(y + 1) - x(y)));
  S.onPick.push(p => chips.classed("picked", d => p.has(d.b.name)));
});

// first paint once every view (including js/brands.js) has registered
SHOP.ready.then(S => setTimeout(() => { S.setYear(S.ys[0]); S.onPick.forEach(fn => fn(S.picked)); }, 0));
