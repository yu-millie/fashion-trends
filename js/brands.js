/* ══ the full data tables (inside "See the full data tables") ═════════════
   The hot list (search growth by year) and Search vs. shop (Lyst rank by
   quarter). They share the shops section's year state from js/shop.js:
   clicking a year or cell calls SHOP.setYear, and both tables follow it. */
(function tables() {
  Promise.all([SHOP.ready, loadData("brands"), loadData("lyst")]).then(([S, br, ly]) => {
    const YEARS = S.YEARS, ys = S.ys, setYear = y => S.setYear(y), onYear = S.onYear;

    /* ── the hot list: growth of every brand, every year ─────────────────
       Growth = change in annual mean search interest vs the year before
       (same rule as the pipeline: ignored when the prior year's mean < 10). */
    const brands = br.brands.map(b => {
      const growth = ys.map(y => {
        const i = br.years.indexOf(y), prev = b.annual[i - 1], cur = b.annual[i];
        return prev >= 10 ? (cur / prev - 1) * 100 : null;
      });
      return { name: b.name, growth, rank: [] };
    });
    ys.forEach((y, j) => {
      brands.filter(b => b.growth[j] !== null).sort((a, b) => b.growth[j] - a.growth[j]).forEach((b, r) => { b.rank[j] = r + 1; });
    });
    const N = brands.length;
    const fmt = g => g == null ? "—" : (g >= 0 ? "+" : "") + Math.round(g) + "%";

    /* ── heatmap table: brands × years ──────────────────────────────────
       Cell colour = growth (diverging: blue = searches fell, grey = flat,
       red = searches rose; clamped at ±60%). Outlined cells are that
       year's top 5. Rows are ordered by the year each brand grew fastest,
       so the table reads as "who was hot when", top to bottom. */
    brands.forEach(b => { b.best = d3.maxIndex(b.growth.map(g => g ?? -Infinity)); });
    brands.sort((p, q) => p.best - q.best || (q.growth[q.best] - p.growth[p.best]));
    const W = 1100, m = { t: 40, r: 8, b: 8, l: 150 }, H = m.t + N * 34 + m.b;
    const svg = d3.select("#slotHot").append("svg").attr("class", "viz heat").attr("viewBox", [0, 0, W, H]);
    svg.append("defs").html('<pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#f4f2ed"/><line x1="0" y1="0" x2="0" y2="6" stroke="rgba(13,16,19,.12)" stroke-width="2"/></pattern>');
    const x = d3.scaleBand().domain(ys).range([m.l, W - m.r]).paddingInner(.06);
    const y = d3.scaleBand().domain(brands.map(b => b.name)).range([m.t, H - m.b]).paddingInner(.12);
    const color = d3.scaleDiverging([-60, 0, 60], t => t < .5
      ? d3.interpolateRgb("#1c5cab", "#f0efec")(t * 2)
      : d3.interpolateRgb("#f0efec", "#c4302b")((t - .5) * 2)).clamp(true);

    // selected-year column outline (drawn first, behind the cells)
    const band = svg.append("rect").attr("class", "yband").attr("y", 6).attr("height", H - 8).attr("width", x.bandwidth() + 10).attr("rx", 10);
    const ylab = svg.append("g").selectAll("text").data(ys).join("text").attr("class", "ylab")
      .attr("x", d => x(d) + x.bandwidth() / 2).attr("y", 27).attr("text-anchor", "middle").text(d => d).on("click", (ev, d) => setYear(d));

    const rows = svg.append("g").selectAll("g").data(brands).join("g").attr("class", "hrow")
      .attr("transform", b => "translate(0," + y(b.name) + ")");
    rows.append("rect").attr("class", "rowbg").attr("x", 0).attr("width", m.l - 4).attr("y", -2).attr("height", y.bandwidth() + 4).attr("rx", 8);
    rows.append("text").attr("class", "rname").attr("x", m.l - 14).attr("y", y.bandwidth() / 2 + 4).attr("text-anchor", "end").text(b => b.name);
    const cells = rows.selectAll("g.cell").data(b => ys.map((yy, j) => ({ b, yy, j, g: b.growth[j], r: b.rank[j] }))).join("g")
      .attr("class", d => "cell" + (d.r && d.r <= 5 ? " top" : "") + (d.g == null ? " na" : ""))
      .attr("transform", d => "translate(" + x(d.yy) + ",0)")
      .on("click", (ev, d) => setYear(d.yy));
    cells.append("rect").attr("width", x.bandwidth()).attr("height", y.bandwidth()).attr("rx", 5)
      .attr("fill", d => d.g == null ? "url(#hatch)" : color(d.g));
    const light = g => g != null && Math.abs(g) > 34;     // white text on the strongest colours
    cells.append("text").attr("class", "gv").attr("x", x.bandwidth() / 2).attr("y", y.bandwidth() / 2 + 4).attr("text-anchor", "middle")
      .style("fill", d => light(d.g) ? "#fff" : INK.ink).text(d => fmt(d.g));
    cells.filter(d => d.r && d.r <= 5).append("text").attr("class", "rk").attr("x", 6).attr("y", 11)
      .style("fill", d => light(d.g) ? "#fff" : INK.ink).text(d => "#" + d.r);

    // hover: highlight the row, tooltip for the cell
    cells.on("pointermove", (ev, d) => showTip(ev, '<div class="tt">' + d.b.name + " · " + d.yy + "</div>" +
        (d.g == null ? "Searches too low the year before to measure growth" :
          fmt(d.g) + " search growth vs " + (d.yy - 1) + (d.r ? "<br>Rank " + d.r + " of " + brands.filter(b => b.growth[d.j] != null).length + " that year" : ""))));

    // legend: diverging bar + what the outline and hatching mean
    d3.select("#slotHot").append("div").attr("class", "heatkey").html(
      '<span>Searches fell</span><i style="background:linear-gradient(90deg,' + d3.range(0, 1.0001, .1).map(t => color(-60 + t * 120)).join(",") + ')"></i><span>rose</span>' +
      '<span class="sw outl">#1</span><span>top 5 that year</span><span class="sw na"></span><span>base too small to measure</span>');

    onYear.push(year => {
      const j = ys.indexOf(year);
      band.transition().duration(450).ease(d3.easeCubicOut).attr("x", x(year) - 5);
      ylab.classed("on", d => d === year);
      cells.classed("dim", d => d.yy !== year);
      rows.classed("rise", b => b.rank[j] != null && b.rank[j] <= 5);
    });

    /* ── search vs. shop: Lyst Index rank, quarter by quarter ────────────
       Same rows, same order as the hot list, so the two tables line up.
       Dark cell = high Lyst rank (1 = hottest). The red bar under each row
       marks the year that brand's searches grew fastest, so you can see
       whether the shop chart followed the search spike. */
    const Q = ly.quarters, NQ = Q.length;
    const LW = 1100, lm = { t: 46, r: 92, b: 8, l: 150 }, LH = lm.t + N * 34 + lm.b;
    const lsvg = d3.select("#slotLyst").append("svg").attr("class", "viz heat lyst").attr("viewBox", [0, 0, LW, LH]);
    lsvg.append("defs").html('<pattern id="hatch2" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="#f4f2ed"/><line x1="0" y1="0" x2="0" y2="5" stroke="rgba(13,16,19,.14)" stroke-width="1.6"/></pattern>');
    const qx = d3.scaleBand().domain(Q.map(q => q.q)).range([lm.l, LW - lm.r]).paddingInner(.08);
    const ly_ = d3.scaleBand().domain(brands.map(b => b.name)).range([lm.t, LH - lm.b]).paddingInner(.12);
    const shade = d3.scaleSequential(t => d3.interpolateRgb("#0d1013", "#d3d9df")(t)).domain([1, 20]);
    const years = [...new Set(Q.map(q => q.year))];
    const yStart = y => qx(Q.find(q => q.year === y).q), yEnd = y => { const qs = Q.filter(q => q.year === y); return qx(qs[qs.length - 1].q) + qx.bandwidth(); };

    const lband = lsvg.append("rect").attr("class", "yband").attr("y", 8).attr("height", LH - 10).attr("rx", 8);
    const lylab = lsvg.append("g").selectAll("text").data(years).join("text").attr("class", "ylab")
      .attr("x", y => (yStart(y) + yEnd(y)) / 2).attr("y", 22).attr("text-anchor", "middle").text(y => "’" + String(y).slice(2))
      .on("click", (ev, y) => YEARS[y] && setYear(y));
    // bracket over the quarters where Lyst only published a top 10
    const t10 = Q.filter(q => q.depth === 10);
    lsvg.append("path").attr("d", "M" + qx(t10[0].q) + " 42V38H" + (qx(t10[t10.length - 1].q) + qx.bandwidth()) + "V42").attr("fill", "none").attr("stroke", INK.ink3);
    lsvg.append("text").attr("x", qx(t10[0].q) + 2).attr("y", 35).style("font", "8px var(--mono)").style("fill", INK.ink3).text("TOP 10 ONLY");
    lsvg.append("text").attr("x", qx("2026Q1")).attr("y", 40).style("font", "8px var(--mono)").style("fill", INK.ink3).text("NEW METHOD");

    const lrows = lsvg.append("g").selectAll("g").data(brands).join("g").attr("class", "hrow")
      .attr("transform", b => "translate(0," + ly_(b.name) + ")");
    lrows.append("rect").attr("class", "rowbg").attr("x", 0).attr("width", lm.l - 4).attr("y", -2).attr("height", ly_.bandwidth() + 4).attr("rx", 8);
    lrows.append("text").attr("class", "rname").attr("x", lm.l - 14).attr("y", ly_.bandwidth() / 2 + 4).attr("text-anchor", "end").text(b => b.name);
    const lcells = lrows.selectAll("g.cell").data(b => Q.map(q => ({ b, q, r: q.ranks[b.name] }))).join("g").attr("class", "cell")
      .attr("transform", d => "translate(" + qx(d.q.q) + ",0)")
      .on("click", (ev, d) => YEARS[d.q.year] && setYear(d.q.year));
    lcells.append("rect").attr("width", qx.bandwidth()).attr("height", ly_.bandwidth()).attr("rx", 3)
      .attr("fill", d => !d.q.depth ? "url(#hatch2)" : d.r ? shade(d.r) : "#f1efea");
    lcells.filter(d => d.r).append("text").attr("class", "gv").attr("x", qx.bandwidth() / 2).attr("y", ly_.bandwidth() / 2 + 3.5)
      .attr("text-anchor", "middle").style("font-size", "9px").style("fill", d => d.r <= 11 ? "#fff" : INK.ink).text(d => d.r);
    // red bar: the year this brand's searches grew fastest (from the hot list)
    lrows.append("rect").attr("class", "speak").attr("x", b => yStart(ys[b.best])).attr("width", b => yEnd(ys[b.best]) - yStart(ys[b.best]))
      .attr("y", ly_.bandwidth() + 1).attr("height", 3).attr("rx", 1.5).attr("fill", "#c4302b");

    // did the shop chart follow? Lyst rank in the year after the search spike vs the year before it
    // (unranked quarters count as one place below the published list; spikes in 2017 have no
    //  earlier Lyst year, so the spike year itself is the "before")
    const meanRank = (b, y) => {
      const qs = Q.filter(q => q.year === y && q.depth);
      return qs.length ? d3.mean(qs, q => q.ranks[b.name] || q.depth + 1) : null;
    };
    brands.forEach(b => {
      const Y = ys[b.best];
      const before = meanRank(b, Y - 1) ?? meanRank(b, Y), after = meanRank(b, Y + 1);
      b.move = before == null || after == null ? null : before - after;     // + = climbed
    });
    const moveTxt = m => m == null ? "–" : Math.abs(m) < 1 ? "held" : (m > 0 ? "▲ " : "▼ ") + Math.round(Math.abs(m)) + " places";
    lrows.append("text").attr("class", "lag").attr("x", LW - lm.r + 10).attr("y", ly_.bandwidth() / 2 + 4)
      .style("font", "10px var(--mono)").style("fill", b => b.move >= 1 ? INK.ink : INK.ink3).style("font-weight", b => b.move >= 1 ? 600 : 400)
      .text(b => moveTxt(b.move));
    lsvg.append("text").attr("x", LW - lm.r + 10).attr("y", 33).style("font", "8px var(--mono)").style("fill", INK.ink3).text("LYST RANK,");
    lsvg.append("text").attr("x", LW - lm.r + 10).attr("y", 42).style("font", "8px var(--mono)").style("fill", INK.ink3).text("YEAR AFTER SPIKE");
    const up = brands.filter(b => b.move >= 1).length, known = brands.filter(b => b.move != null).length;
    document.getElementById("lystSub").textContent = "Each brand's quarterly rank in the Lyst Index (1 = hottest; darker = higher). The red bar marks the year its Google searches grew fastest. " +
      "In the year after that search spike, the brand climbed Lyst's chart for " + up + " of " + known + " brands.";

    lcells.on("pointermove", (ev, d) => showTip(ev, '<div class="tt">' + d.b.name + " · " + d.q.q.replace("Q", " Q") + "</div>" +
      (!d.q.depth ? "No Lyst Index found for this quarter" :
        d.r ? "Lyst rank <b style=\"font-weight:500;color:" + INK.ink + "\">#" + d.r + "</b> of the top " + d.q.depth : "Not in the published top " + d.q.depth) +
      (d.q.top3.length ? '<div style="margin-top:5px;font-size:11px">That quarter\'s top 3: ' + d.q.top3.join(", ") + "</div>" : "")));

    // hovering a brand in either table highlights it in both
    const linkRow = name => { rows.classed("hl", b => b.name === name); lrows.classed("hl", b => b.name === name); };
    [rows, lrows].forEach(sel => sel.on("pointerenter", (ev, b) => linkRow(b.name)).on("pointerleave", () => { linkRow(null); hideTip(); }));

    onYear.push(year => {
      lband.transition().duration(450).ease(d3.easeCubicOut).attr("x", yStart(year) - 3).attr("width", yEnd(year) - yStart(year) + 6);
      lylab.classed("on", y => y === year);
      lcells.classed("dim", d => d.q.year !== year);
    });

  });
})();
