/* ══ cycle: the trend ring — each aesthetic's time on top ════════════════
   Timeline 2016 → 2026 bent into an OPEN ring: it starts just right of 12 o'clock (Jan 2016) and runs clockwise to just left
   of it (Jan 2026), with a gap at the top so the end never meets the start (time here is not a loop, unlike the seasonal clock).
   One arc per aesthetic from breakout (≥ 25 of 100) to fade (last month ≥ 25); dot = peak.
   A key above the ring explains the marks. Hovering an arc or a table row highlights both. */
DATA.then(({ life }) => {
  const svg = d3.select("#ring");
  const cx = 220, cy = 220, R = 168;
  const Y0 = 2016, Y1 = 2026;   // every breakout in the data falls after 2016
  const GAP = Math.PI / 5.5;    // the open wedge at 12 o'clock between the end (2026) and the start (2016)
  const mIdx = ym => (yearOf(ym) - Y0) * 12 + (+ym.slice(5, 7) - 1);
  const span = (Y1 - Y0) * 12;
  const ang = m => GAP / 2 + (m / span) * (Math.PI * 2 - GAP);   // 0 = 12 o'clock, clockwise
  const pt = (m, r) => [cx + Math.sin(ang(m)) * r, cy - Math.cos(ang(m)) * r];
  const items = life.aesthetics.slice().sort((a, b) => mIdx(a.breakout) - mIdx(b.breakout));
  const radiusOf = i => R - 14 - i * 14;   // innermost arc at r = 56, so the centre label sits clear of it

  // SVG arc from month m0 to m1 at radius r (centred on 0,0)
  const arcPath = (m0, m1, r) => {
    const p0 = [Math.sin(ang(m0)) * r, -Math.cos(ang(m0)) * r], p1 = [Math.sin(ang(m1)) * r, -Math.cos(ang(m1)) * r];
    return "M" + p0.map(v => v.toFixed(1)) + "A" + r + "," + r + " 0 " + (ang(m1) - ang(m0) > Math.PI ? 1 : 0) + " 1 " + p1.map(v => v.toFixed(1));
  };

  // the open band, with an arrowhead at the end so the direction (and the gap) reads at a glance
  svg.append("path").attr("class", "band").attr("transform", "translate(" + cx + "," + cy + ")").attr("d", arcPath(0, span, R));
  const [ex, ey] = pt(span, R), ea = ang(span);
  const tx = Math.cos(ea), ty = Math.sin(ea);          // clockwise tangent at the end
  const nx = Math.sin(ea), ny = -Math.cos(ea);         // outward normal
  svg.append("path").attr("fill", "rgba(13,16,19,.45)")
    .attr("d", "M" + (ex + tx * 9) + "," + (ey + ty * 9) + "L" + (ex + nx * 5) + "," + (ey + ny * 5) + "L" + (ex - nx * 5) + "," + (ey - ny * 5) + "Z");
  for (let yr = Y0; yr <= Y1; yr++) {
    const major = yr % 2 === 0, m = (yr - Y0) * 12;
    const [x1, y1] = pt(m, R - (major ? 9 : 4)), [x2, y2] = pt(m, R);
    svg.append("line").attr("class", "tick").attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2).attr("opacity", major ? 1 : .5);
    if (major) {
      const [lx, ly] = pt(m, R + 20);
      svg.append("text").attr("class", "yrlab").attr("x", lx).attr("y", ly).attr("text-anchor", yr === Y0 ? "start" : yr === Y1 ? "end" : "middle")
        .attr("dominant-baseline", "middle").text(yr);
    }
  }
  // start / end labels either side of the gap
  const [sx, sy] = pt(0, R + 38), [fx, fy] = pt(span, R + 38);
  svg.append("text").attr("class", "endlab").attr("x", sx).attr("y", sy).attr("text-anchor", "start").text("START →");
  svg.append("text").attr("class", "endlab").attr("x", fx).attr("y", fy).attr("text-anchor", "end").text("END");

  const g = svg.selectAll("g.rev").data(items).join("g").attr("class", "rev").attr("data-key", d => d.key)
    .attr("transform", "translate(" + cx + "," + cy + ")");
  g.append("path").attr("class", "arc").attr("stroke", d => colorOf(d.key))
    .attr("d", (d, i) => arcPath(mIdx(d.breakout), mIdx(d.fade) + 1, radiusOf(i)));
  g.each(function (d, i) {
    const r = radiusOf(i), s = d3.select(this);
    const [ox, oy] = pt(mIdx(d.breakout), r), [px, py] = pt(mIdx(d.peak), r);
    s.append("circle").attr("class", "node").attr("cx", ox - cx).attr("cy", oy - cy).attr("r", 3.5).attr("fill", colorOf(d.key)).attr("fill-opacity", .45);
    s.append("circle").attr("class", "node").attr("cx", px - cx).attr("cy", py - cy).attr("r", 6).attr("fill", colorOf(d.key));
  });
  g.on("pointermove", (ev, d) => showTip(ev, '<div class="tt">' + nameOf(d.key) + "</div>Broke out " + fmtMonth(parseMonth(d.breakout)) +
      "<br>Peaked " + fmtMonth(parseMonth(d.peak)) + "<br><b>" + d.months_above_half + " months</b> above half its peak"))
    .on("pointerleave", hideTip);

  // grow the arcs in the first time the ring scrolls into view
  g.select(".arc").each(function () { const L = this.getTotalLength(); d3.select(this).attr("stroke-dasharray", L + " " + L).attr("stroke-dashoffset", L); });
  new IntersectionObserver((es, io) => {
    if (!es[0].isIntersecting) return; io.disconnect();
    g.select(".arc").transition().delay((d, i) => i * 140).duration(1300).ease(d3.easeCubicOut).attr("stroke-dashoffset", 0);
  }, { threshold: .4 }).observe(svg.node());

  const median = Math.round(d3.median(items, a => a.months_above_half));
  const shortest = d3.least(items, a => a.months_above_half), longest = d3.greatest(items, a => a.months_above_half);
  document.getElementById("ringTitle").textContent = "Yearly: a typical aesthetic stays on top for about " + median + " months";
  const cBig = svg.append("text").attr("x", cx).attr("y", cy - 2).attr("text-anchor", "middle").attr("fill", INK.ink)
    .style("font-family", "var(--display)").style("font-weight", 200).style("font-size", "34px");
  const cSub = svg.append("text").attr("x", cx).attr("y", cy + 15).attr("text-anchor", "middle").attr("fill", INK.ink2)
    .style("font-family", "var(--mono)").style("font-size", "10.5px").style("letter-spacing", ".12em");
  const cSub2 = svg.append("text").attr("x", cx).attr("y", cy + 27).attr("text-anchor", "middle").attr("fill", INK.ink2)
    .style("font-family", "var(--mono)").style("font-size", "10.5px").style("letter-spacing", ".12em");

  // filter: All by default; pick one aesthetic (or hover an arc) to see its dates in the panel under the ring
  const FOC = focusGroup(svg.node().closest(".card"));
  chips("#rkey", FOC);
  const panel = document.getElementById("ringDetail");
  const show = f => {
    g.classed("ghost", d => !!f && d.key !== f).classed("on", d => d.key === f);
    const d = f && items.find(a => a.key === f);
    filterPanel(panel, f, d ? [["Broke out", fmtMonth(parseMonth(d.breakout))], ["Peaked", fmtMonth(parseMonth(d.peak))],
      ["On top", d.months_above_half + " months"]] : [], "All eight shown. Pick one above to see its dates.");
    if (d) { cBig.text(d.months_above_half); cSub.text("MONTHS"); cSub2.text("ON TOP"); } else { cBig.text("≈" + median); cSub.text("MEDIAN"); cSub2.text("MONTHS"); }
  };
  show(null);
  // one example first (Cottagecore has the whole life cycle: break out, peak, fade), then all eight
  const exKey = (items.find(a => a.key === "cottage") || d3.least(items, a => Math.abs(a.months_above_half - median))).key;
  const stopDemo = introDemo(svg.node(), FOC, show, exKey, panel, 4500);
  g.on("pointerenter", (ev, d) => { stopDemo(); show(d.key); }).on("pointerleave.link", () => show(FOC.key));
  FOC.on(f => { stopDemo(); show(f); });
});
