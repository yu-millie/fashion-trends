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
    .style("font-family", "var(--mono)").style("font-size", "8.5px").style("fill", INK.ink3).text(d => d);
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
  const centreSub = g.append("text").attr("text-anchor", "middle").attr("y", 24).attr("fill", INK.ink3)
    .style("font-family", "var(--mono)").style("font-size", "8px").style("letter-spacing", ".16em").text("HOVER A MONTH");

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
      showTip(ev, '<div class="tt">' + MONTHS[i] + "</div>" + rows + '<div style="margin-top:5px;font-size:11px">100 = that aesthetic\'s best month</div>');
    })
    .on("pointerleave", () => { hideTip(); wedges.classed("on", false); mlab.classed("on", false); centre.text("YEAR"); centreSub.text("HOVER A MONTH"); });

  // table: peak month, low month, swing (best minus worst month)
  const stats = ORDER.map(k => {
    const v = seas.values[k];
    return { key: k, peak: v.indexOf(d3.max(v)), low: v.indexOf(d3.min(v)), swing: Math.round(100 - d3.min(v)) };
  }).sort((p, q) => q.swing - p.swing);
  const rows = d3.select("#seasonTable").selectAll("div.gaprow").data(stats).join("div")
    .attr("class", "gaprow").style("--c", d => colorOf(d.key))
    .html(d => '<span class="gn"><i></i>' + nameOf(d.key) + '</span><span class="gv">' + MONTHS[d.peak] +
      '</span><span class="gv">' + MONTHS[d.low] + '</span><span class="gg">' + d.swing + "</span>");
  const most = stats[0], least = stats[stats.length - 1];
  document.getElementById("seasonTitle").textContent = "Each aesthetic has its own peak month, and " + nameOf(most.key) + " swings the most through the year";
  d3.select("#seasonLede").text("Each loop is one aesthetic's average year, 2021–2025, scaled so its best month touches the outer ring. " +
    nameOf(most.key) + " is the most seasonal: its quietest month (" + MONTHS[most.low] + ") is " + most.swing + "% below its best (" +
    MONTHS[most.peak] + "). " + nameOf(least.key) + " is the steadiest, swinging " + least.swing + "%. Hover a month to read every aesthetic at once.");

  const show = f => {
    loops.classed("dim", k => f && k !== f).classed("hot", k => f && k === f);
    peaks.style("opacity", k => !f || k === f ? 1 : .15);
    rows.style("opacity", d => !f || d.key === f ? 1 : .35);
  };
  rows.on("pointerenter", (ev, d) => show(d.key)).on("pointerleave", () => show(FOC.key));
  FOC.on(show);
});
