/* ══ seasons: the seasonal clock (new in Prototype II) ════════════════════
   Radial line chart: angle = calendar month, radius = average interest that
   month (2021–2025), each aesthetic scaled so its best month = 100.
   Hover a month wedge → tooltip with every aesthetic; hover a table row → that loop. */
loadData("seasonal").then(seas => {
  const svg = d3.select("#clock");
  const cx = 230, cy = 230, R0 = 46, R1 = 178;
  const MONTHS = seas.months;
  const a = i => (i / 12) * Math.PI * 2;                         // 0 = Jan at 12 o'clock
  const r = d3.scaleLinear().domain([0, 100]).range([R0, R1]);
  const g = svg.append("g").attr("transform", "translate(" + cx + "," + cy + ")");
  const FOC = focusGroup(document.querySelector("#clock").closest(".card"));   // filter for this clock only
  chips("#skey", FOC);

  // rings + spokes
  g.append("g").selectAll("circle").data([25, 50, 75, 100]).join("circle")
    .attr("r", r).attr("fill", "none").attr("stroke", (d) => d === 100 ? "rgba(13,16,19,.22)" : "rgba(13,16,19,.08)");
  g.append("g").selectAll("text").data([50, 100]).join("text").attr("x", d => Math.sin(a(.5)) * r(d) + 3).attr("y", d => -Math.cos(a(.5)) * r(d) - 3)
    .style("font-family", "var(--mono)").style("font-size", "11px").style("fill", INK.ink2).text(d => d);
  g.append("g").selectAll("line").data(d3.range(12)).join("line").attr("class", "spoke")
    .attr("x1", i => Math.sin(a(i)) * R0).attr("y1", i => -Math.cos(a(i)) * R0)
    .attr("x2", i => Math.sin(a(i)) * (R1 + 6)).attr("y2", i => -Math.cos(a(i)) * (R1 + 6));
  const mlab = g.append("g").selectAll("text").data(MONTHS).join("text").attr("class", "mlab")
    .attr("x", (d, i) => Math.sin(a(i)) * (R1 + 22)).attr("y", (d, i) => -Math.cos(a(i)) * (R1 + 22))
    .attr("text-anchor", "middle").attr("dominant-baseline", "middle").text(d => d.toUpperCase());

  // hover wedges (one per month) sit under the loops
  const wedgeArc = d3.arc().innerRadius(R0).outerRadius(R1 + 30)
    .startAngle(i => a(i) - Math.PI / 12).endAngle(i => a(i) + Math.PI / 12);
  const wedges = g.append("g").selectAll("path").data(d3.range(12)).join("path").attr("class", "wedge").attr("d", wedgeArc);

  // one closed loop per aesthetic
  const radial = d3.lineRadial().angle((d, i) => a(i)).radius(d => r(d)).curve(d3.curveCardinalClosed.tension(.35));
  const loops = g.append("g").style("pointer-events", "none").selectAll("path").data(ORDER).join("path")
    .attr("class", "petal").attr("fill", k => colorOf(k)).attr("stroke", k => colorOf(k))
    .attr("d", k => radial(seas.values[k].map(() => 0)));
  const peaks = g.append("g").style("pointer-events", "none").selectAll("circle").data(ORDER).join("circle")
    .attr("r", 5.5).attr("fill", k => colorOf(k)).attr("stroke", "#fff").attr("stroke-width", 2)
    .attr("cx", k => Math.sin(a(seas.values[k].indexOf(100))) * r(100)).attr("cy", k => -Math.cos(a(seas.values[k].indexOf(100))) * r(100))
    .attr("opacity", 0);
  const centre = g.append("text").attr("text-anchor", "middle").attr("y", 8).attr("fill", INK.ink)
    .style("font-family", "var(--display)").style("font-weight", 200).style("font-size", "30px").text("YEAR");
  const centreSub = g.append("text").attr("text-anchor", "middle").attr("y", 26).attr("fill", INK.ink2)
    .style("font-family", "var(--mono)").style("font-size", "10.5px").style("letter-spacing", ".12em").text("HOVER A MONTH");

  // bloom the loops open when the clock scrolls into view
  new IntersectionObserver((es, io) => {
    if (!es[0].isIntersecting) return; io.disconnect();
    loops.transition().delay((d, i) => i * 120).duration(1100).ease(d3.easeBackOut.overshoot(.8)).attr("d", k => radial(seas.values[k]));
    peaks.transition().delay(900).duration(500).attr("opacity", 1);
  }, { threshold: .35 }).observe(svg.node());

  wedges.on("pointermove", (ev, i) => {
      wedges.classed("on", j => j === i); mlab.classed("on", (d, j) => j === i);
      centre.text(MONTHS[i].toUpperCase()); centreSub.text("AVG 2021–2025");
      const rows = ORDER.slice().sort((p, q) => seas.values[q][i] - seas.values[p][i])
        .map(k => tipRow(k, nameOf(k), Math.round(seas.values[k][i]), seas.values[k][i] === 100)).join("");
      showTip(ev, '<div class="tt">' + MONTHS[i] + "</div>" + rows + '<div class="tnote">100 = that aesthetic\'s best month</div>');
    })
    .on("pointerleave", () => { hideTip(); wedges.classed("on", false); mlab.classed("on", false); centre.text("YEAR"); centreSub.text("HOVER A MONTH"); });

  // filter: All by default; pick one aesthetic to see its best and quietest month in the panel under the clock
  const stats = Object.fromEntries(ORDER.map(k => {
    const v = seas.values[k];
    return [k, { peak: v.indexOf(d3.max(v)), low: v.indexOf(d3.min(v)), swing: Math.round(100 - d3.min(v)) }];
  }));
  document.getElementById("seasonTitle").textContent = "Monthly: each aesthetic has its own peak month";
  const panel = document.getElementById("seasonDetail");
  const show = f => {
    loops.classed("dim", k => f && k !== f).classed("hot", k => f && k === f);
    peaks.style("opacity", k => !f || k === f ? 1 : .15);
    const st = f && stats[f];
    filterPanel(panel, f, st ? [["Best month", MONTHS[st.peak]], ["Quietest", MONTHS[st.low]], ["Swing", st.swing + "% lower"]] : [],
      "All eight shown. Pick one above to see its best and quietest month.");
  };
  show(null);
  // one example first (the most seasonal aesthetic), then all eight
  const exKey = ORDER.slice().sort((p, q) => stats[q].swing - stats[p].swing)[0];
  const stopDemo = introDemo(svg.node(), FOC, show, exKey, panel, 4000);
  FOC.on(f => { stopDemo(); show(f); });
});
