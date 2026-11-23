/* ══ platforms: Google vs YouTube ═════════════════════════════════════════
   Left: share of the six on each platform (dumbbell, log scale).
   Right (new): who peaks first — the month each aesthetic peaked on each. */
DATA.then(({ platforms }) => {
  const rows = platforms.aesthetics.map(a => ({ ...a, ratio: a.youtube / a.google })).sort((a, b) => b.ratio - a.ratio);
  const lo = 0.5, hi = 100;                                        // log scale, % share
  const x = n => 3 + (Math.log(Math.max(n, lo) / lo) / Math.log(hi / lo)) * 94;
  const video = rows[0], search = rows[rows.length - 1];
  document.getElementById("platTitle").innerHTML = nameOf(search.key) + " is a search. <em>" + nameOf(video.key) + " is a video.</em>";
  const dr = d3.select("#dumb").selectAll("div.drow").data(rows).join("div").attr("class", "drow").style("--c", d => colorOf(d.key))
    .html(v => {
      const c = colorOf(v.key);
      const label = v.ratio >= 1 ? v.ratio.toFixed(1) + "× YT" : (1 / v.ratio).toFixed(1) + "× G";
      return '<span class="dn">' + nameOf(v.key) + "</span>" +
        '<svg viewBox="0 0 100 26" preserveAspectRatio="none">' +
          '<line x1="3" x2="97" y1="13" y2="13" stroke="rgba(13,16,19,.12)" stroke-width="1" vector-effect="non-scaling-stroke"/>' +
          '<line x1="' + x(v.google) + '" x2="' + x(v.youtube) + '" y1="13" y2="13" stroke="' + c + '" stroke-width="3" vector-effect="non-scaling-stroke" opacity=".55"/>' +
        "</svg>" + '<span class="dd">' + label + "</span>";
    })
    .each(function (v) {
      // dots as HTML-positioned circles inside the svg so they stay round when the svg stretches
      const svg = d3.select(this).select("svg");
      const box = svg.node().parentNode;
      svg.style("position", "relative");
      const holder = d3.select(box).insert("div", ".dd").style("position", "relative").style("height", "26px");
      holder.node().appendChild(svg.node());
      [["google", false], ["youtube", true]].forEach(([p, solid]) =>
        holder.append("i").style("position", "absolute").style("top", "6px").style("left", "calc(" + x(v[p]) + "% - 7px)")
          .style("width", "14px").style("height", "14px").style("border-radius", "50%")
          .style("background", solid ? colorOf(v.key) : "#fff").style("border", "2px solid " + colorOf(v.key))
          .style("box-shadow", "0 0 0 2px rgba(255,255,255,.9)"));
    })
    .on("pointermove", (ev, v) => showTip(ev, '<div class="tt">' + nameOf(v.key) + "</div>" +
      tipRow(v.key, "Google", v.google + "%") + tipRow(v.key, "YouTube", v.youtube + "%", true)))
    .on("pointerleave", hideTip);
  onFocus(f => dr.style("opacity", d => !f || d.key === f ? 1 : .3));
});

loadData("peaks").then(pk => {
  const rows = pk.aesthetics.slice().sort((a, b) => a.lag_months - b.lag_months);
  const W = 560, rowH = 40, m = { t: 10, r: 112, b: 30, l: 108 }, H = m.t + rows.length * rowH + m.b;
  const svg = d3.select("#slotPeaks").append("svg").attr("class", "viz").attr("viewBox", [0, 0, W, H]);
  const x = d3.scaleUtc().domain([new Date(Date.UTC(2018, 0, 1)), new Date(Date.UTC(2026, 6, 1))]).range([m.l, W - m.r]);
  const yy = (d, i) => m.t + i * rowH + rowH / 2;
  svg.append("g").attr("class", "grid").selectAll("line").data(d3.range(2018, 2027, 2)).join("line")
    .attr("x1", d => x(new Date(Date.UTC(d, 0, 1)))).attr("x2", d => x(new Date(Date.UTC(d, 0, 1)))).attr("y1", m.t).attr("y2", H - m.b);
  svg.append("g").selectAll("text").data(d3.range(2018, 2027, 2)).join("text").attr("class", "yr")
    .attr("x", d => x(new Date(Date.UTC(d, 0, 1)))).attr("y", H - 10).attr("text-anchor", "middle").text(d => d);

  const g = svg.append("g").selectAll("g").data(rows).join("g").style("cursor", "default");
  g.append("rect").attr("x", 0).attr("width", W).attr("y", (d, i) => yy(d, i) - rowH / 2 + 2).attr("height", rowH - 4)
    .attr("rx", 8).attr("fill", "transparent");
  g.append("text").attr("x", m.l - 14).attr("y", (d, i) => yy(d, i) + 4).attr("text-anchor", "end")
    .style("font-size", "13px").style("fill", INK.ink).text(d => nameOf(d.key));
  const gx = d => x(parseMonth(d.google)), yx = d => x(parseMonth(d.youtube));
  const conn = g.append("line").attr("y1", yy).attr("y2", yy).attr("x1", gx).attr("x2", gx)
    .attr("stroke", d => colorOf(d.key)).attr("stroke-width", 3).attr("opacity", .5).attr("stroke-linecap", "round");
  g.append("circle").attr("cy", yy).attr("cx", gx).attr("r", 7).attr("fill", "#fff").attr("stroke", d => colorOf(d.key)).attr("stroke-width", 2.2);
  const yt = g.append("circle").attr("cy", yy).attr("cx", gx).attr("r", 7).attr("fill", d => colorOf(d.key)).attr("stroke", "#fff").attr("stroke-width", 2);
  const lagTxt = d => d.lag_months === 0 ? "same month" : Math.abs(d.lag_months) + " mo " + (d.lag_months > 0 ? "later" : "earlier");
  g.append("text").attr("x", W - m.r + 14).attr("y", (d, i) => yy(d, i) + 4)
    .style("font-family", "var(--mono)").style("font-size", "10.5px").style("fill", INK.ink2)
    .text(d => d.lag_months === 0 ? "same month" : "YT " + lagTxt(d));

  // YouTube dot slides out from the Google dot when the chart is first seen
  new IntersectionObserver((es, io) => {
    if (!es[0].isIntersecting) return; io.disconnect();
    yt.transition().delay((d, i) => 200 + i * 120).duration(900).ease(d3.easeCubicInOut).attr("cx", yx);
    conn.transition().delay((d, i) => 200 + i * 120).duration(900).ease(d3.easeCubicInOut).attr("x2", yx);
  }, { threshold: .4 }).observe(svg.node());

  g.on("pointerenter", function () { d3.select(this).select("rect").attr("fill", "rgba(255,255,255,.7)"); })
    .on("pointermove", (ev, d) => showTip(ev, '<div class="tt">' + nameOf(d.key) + "</div>" +
      tipRow(d.key, "Google peak", fmtMonth(parseMonth(d.google))) + tipRow(d.key, "YouTube peak", fmtMonth(parseMonth(d.youtube)), true) +
      '<div style="margin-top:5px">YouTube ' + lagTxt(d) + "</div>"))
    .on("pointerleave", function () { d3.select(this).select("rect").attr("fill", "transparent"); hideTip(); });
  onFocus(f => g.style("opacity", d => !f || d.key === f ? 1 : .25));
});
