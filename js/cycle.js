/* ══ cycle: the trend ring — each aesthetic's time on top ════════════════
   Circular timeline 2016 → 2026 (12 o'clock = Jan 2016). One arc per aesthetic
   from breakout (≥ 25 of 100) to fade (last month ≥ 25); dot = peak.
   Hovering an arc or a table row highlights both. */
DATA.then(({ life }) => {
  const svg = d3.select("#ring");
  const cx = 220, cy = 220, R = 168;
  const Y0 = 2016, Y1 = 2026;   // every breakout in the data falls after 2016
  const mIdx = ym => (yearOf(ym) - Y0) * 12 + (+ym.slice(5, 7) - 1);
  const span = (Y1 - Y0) * 12;
  const ang = m => (m / span) * Math.PI * 2;                     // d3.arc: 0 = 12 o'clock
  const pt = (m, r) => [cx + Math.sin(ang(m)) * r, cy - Math.cos(ang(m)) * r];
  const items = life.aesthetics.slice().sort((a, b) => mIdx(a.breakout) - mIdx(b.breakout));

  svg.append("circle").attr("class", "band").attr("cx", cx).attr("cy", cy).attr("r", R);
  for (let yr = Y0; yr <= Y1; yr++) {
    const major = yr % 2 === 0, m = (yr - Y0) * 12;
    const [x1, y1] = pt(m, R - (major ? 9 : 4)), [x2, y2] = pt(m, R);
    svg.append("line").attr("class", "tick").attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2).attr("opacity", major ? 1 : .5);
    if (major && yr < Y1) {
      const [lx, ly] = pt(m, R + 18);
      svg.append("text").attr("class", "yrlab").attr("x", lx).attr("y", ly).attr("text-anchor", "middle").attr("dominant-baseline", "middle").text(yr);
    }
  }
  // SVG arc from month m0 to m1 at radius r (centred on 0,0)
  const arcPath = (m0, m1, r) => {
    const p0 = [Math.sin(ang(m0)) * r, -Math.cos(ang(m0)) * r], p1 = [Math.sin(ang(m1)) * r, -Math.cos(ang(m1)) * r];
    return "M" + p0.map(v => v.toFixed(1)) + "A" + r + "," + r + " 0 " + ((m1 - m0) / span > .5 ? 1 : 0) + " 1 " + p1.map(v => v.toFixed(1));
  };
  const g = svg.selectAll("g.rev").data(items).join("g").attr("class", "rev").attr("data-key", d => d.key)
    .attr("transform", "translate(" + cx + "," + cy + ")");
  g.append("path").attr("class", "arc").attr("stroke", d => colorOf(d.key))
    .attr("d", (d, i) => arcPath(mIdx(d.breakout), mIdx(d.fade) + 1, R - 18 - i * 18));
  g.each(function (d, i) {
    const r = R - 18 - i * 18, s = d3.select(this);
    const [ox, oy] = pt(mIdx(d.breakout), r), [px, py] = pt(mIdx(d.peak), r);
    s.append("circle").attr("class", "node").attr("cx", ox - cx).attr("cy", oy - cy).attr("r", 3.5).attr("fill", colorOf(d.key)).attr("fill-opacity", .45);
    s.append("circle").attr("class", "node").attr("cx", px - cx).attr("cy", py - cy).attr("r", 6).attr("fill", colorOf(d.key));
  });
  g.on("pointermove", (ev, d) => showTip(ev, '<div class="tt">' + nameOf(d.key) + "</div>Broke out " + fmtMonth(parseMonth(d.breakout)) +
      "<br>Peaked " + fmtMonth(parseMonth(d.peak)) + "<br><b style=\"font-weight:500;color:" + INK.ink + "\">" + d.months_above_half + " months</b> above half its peak"))
    .on("pointerleave", hideTip);

  // grow the arcs in the first time the ring scrolls into view
  g.select(".arc").each(function () { const L = this.getTotalLength(); d3.select(this).attr("stroke-dasharray", L + " " + L).attr("stroke-dashoffset", L); });
  new IntersectionObserver((es, io) => {
    if (!es[0].isIntersecting) return; io.disconnect();
    g.select(".arc").transition().delay((d, i) => i * 140).duration(1300).ease(d3.easeCubicOut).attr("stroke-dashoffset", 0);
  }, { threshold: .4 }).observe(svg.node());

  const median = Math.round(d3.median(items, a => a.months_above_half));
  svg.append("text").attr("x", cx).attr("y", cy + 2).attr("text-anchor", "middle").attr("fill", INK.ink)
    .style("font-family", "var(--display)").style("font-weight", 100).style("font-size", "40px").text("≈" + median);
  svg.append("text").attr("x", cx).attr("y", cy + 18).attr("text-anchor", "middle").attr("fill", INK.ink3)
    .style("font-family", "var(--mono)").style("font-size", "8.5px").style("letter-spacing", ".18em").text("MEDIAN MONTHS");

  const rows = d3.select("#gaps").selectAll("div.gaprow")
    .data(life.aesthetics.slice().sort((a, b) => a.months_above_half - b.months_above_half)).join("div")
    .attr("class", "gaprow").attr("data-key", d => d.key).style("--c", d => colorOf(d.key))
    .html(d => '<span class="gn"><i></i>' + nameOf(d.key) + '</span><span class="gv">' + yearOf(d.breakout) +
      '</span><span class="gv">' + yearOf(d.peak) + '</span><span class="gg">' + d.months_above_half + "</span>");

  const link = (key, on) => { g.classed("on", d => on && d.key === key); rows.classed("on", d => on && d.key === key); };
  g.on("pointerenter", (ev, d) => link(d.key, true)).on("pointerleave.link", () => link(null, false));
  rows.on("pointerenter", (ev, d) => link(d.key, true)).on("pointerleave", () => link(null, false));
  onFocus(f => { g.style("opacity", d => !f || d.key === f ? 1 : .2); rows.style("opacity", d => !f || d.key === f ? 1 : .35); });
});
