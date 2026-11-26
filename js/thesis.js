/* ══ thesis: streetwear's share of the eight, 2019 vs 2025 ═════════════════ */
DATA.then(({ share }) => {
  const at = y => Object.fromEntries(share.aesthetics.map(a => [a.key, share.share[a.key][share.years.indexOf(y)]]));
  const a = at(2019), b = at(2025);

  // stacked share bar: streetwear first and solid, the rest after it
  const draw = (id, row, year) => {
    d3.select("#" + id).selectAll("span").data(ORDER).join("span")
      .style("width", k => row[k] + "%")
      .style("background", k => colorOf(k))
      .html(k => row[k] >= 8 ? '<b style="color:' + textOn(colorOf(k)) + '">' + Math.round(row[k]) + "</b>" : "")
      .on("pointermove", (ev, k) => showTip(ev, '<div class="tt">' + year + "</div>" + tipRow(k, nameOf(k), row[k] + "%", true)))
      .on("pointerleave", hideTip);
  };
  draw("bar2019", a, 2019);
  draw("bar2025", b, 2025);


  d3.select("#barKey").selectAll("span").data(ORDER).join("span")
    .style("--c", k => colorOf(k)).html(k => "<i></i>" + nameOf(k));

  // headline number counts down from the 2019 value to 2025's
  const big = document.getElementById("bigStat");
  const from = Math.round(a.street), to = Math.round(b.street);
  big.innerHTML = from + "<sup>%</sup>";
  document.getElementById("bigStatSub").textContent = "2019 → " + to + "% in 2025";
  const io = new IntersectionObserver(es => {
    if (!es[0].isIntersecting) return;
    io.disconnect();
    d3.select(big).transition().delay(300).duration(1400).ease(d3.easeCubicOut)
      .tween("n", () => { const i = d3.interpolateRound(from, to); return t => { big.innerHTML = i(t) + "<sup>%</sup>"; }; });
  }, { threshold: .6 });
  io.observe(big);

  document.getElementById("thesisTitle").textContent = "Streetwear used to be almost every search. By 2025, " + (100 - to) + " in every 100 went to other aesthetics.";
  document.getElementById("thesisLede").textContent =
    "In 2019, " + inWords(from) + " of every hundred searches for these " + inWords(ORDER.length) + " aesthetics were for streetwear. By 2025 it was " + inWords(to) +
    ". The rest went to " + inWords(ORDER.length - 1) + " aesthetics that each rose on their own schedule. That spread is the story this page follows.";
});
