/* ══ evidence: three linked D3 views ═════════════════════════════════════
   When  (timeline)  ─ click an era ─▶  Where (map)  ─ click a country ─▶  Zoom in (country lines)
   The aesthetic chips filter the When chart only (and clear when it scrolls away).
   One `state` object; one update() redraws whatever changed. */
(function evidence() {
  const state = { era: "2023–2024", mode: "stand", country: "IND" };
  const ERA_RANGE = { "2004–2012": [2004, 2012], "2013–2017": [2013, 2017], "2018–2020": [2018, 2020],
                      "2021–2022": [2021, 2022], "2023–2024": [2023, 2024], "2025": [2025, 2025] };
  const ERA_LABEL = { "2004–2012": "2004–12", "2013–2017": "’13–17", "2018–2020": "’18–20", "2021–2022": "’21–22", "2023–2024": "’23–24", "2025": "’25" };

  const FOC = focusGroup(document.querySelector("#slotLines").closest(".card"));   // the filter belongs to the When chart only
  chips("#vkey", FOC);

  Promise.all([
    loadData("timeline_worldwide"),
    loadData("geo_by_era"),
    loadData("world-110m")
  ]).then(([timeline, geo, world]) => {
    const AES = ORDER.map(k => timeline.aesthetics.find(a => a.key === k));   // legend order
    const months = timeline.months.map(parseMonth);
    const N = months.length;
    const smooth = a => a.map((_, i) => d3.mean(a.slice(Math.max(0, i - 1), i + 2)));   // 3-month centred mean
    const series = AES.map(a => ({ key: a.key, raw: timeline.series[a.key], v: smooth(timeline.series[a.key]) }));

    /* ── When: line chart ─────────────────────────────────────────────── */
    const W = 1100, H = 470, m = { t: 14, r: 14, b: 76, l: 34 };
    const svgL = d3.select("#slotLines").append("svg").attr("class", "viz").attr("viewBox", [0, 0, W, H]);
    const x = d3.scaleUtc().domain(d3.extent(months)).range([m.l, W - m.r]);
    const y = d3.scaleLinear().domain([0, 100]).range([H - m.b, m.t]);
    const eraShade = svgL.append("rect").attr("y", m.t).attr("height", H - m.b - m.t).attr("fill", "rgba(13,16,19,.12)").attr("stroke", INK.ink).attr("stroke-width", 1.5).attr("rx", 6);

    svgL.append("g").attr("class", "grid").selectAll("line").data([0, 50, 100]).join("line")
      .attr("x1", m.l).attr("x2", W - m.r).attr("y1", y).attr("y2", y);
    svgL.append("g").selectAll("text").data([0, 50, 100]).join("text")
      .attr("x", m.l - 6).attr("y", d => y(d) + 3).attr("text-anchor", "end").text(d => d);
    svgL.append("g").selectAll("text").data(d3.range(2004, 2026, 3)).join("text")
      .attr("class", "yr").attr("x", d => x(new Date(Date.UTC(d, 0, 1)))).attr("y", H - m.b + 15)
      .attr("text-anchor", "middle").text(d => d);

    const line = d3.line().x((d, i) => x(months[i])).y(d => y(d)).curve(d3.curveMonotoneX);
    const lines = svgL.append("g").selectAll("g").data(series).join("g").attr("class", "ln");
    lines.append("path").attr("d", d => line(d.v)).attr("stroke", d => colorOf(d.key));
    // a dot where each aesthetic peaks (every line is scaled so its peak = 100)
    lines.append("circle").attr("class", "pk").attr("r", 6).attr("fill", d => colorOf(d.key)).attr("stroke", "#fff").attr("stroke-width", 2.5)
      .attr("cx", d => x(months[d3.maxIndex(d.v)])).attr("cy", y(100));

    // era strip: click to choose the map's era
    const eraY = H - m.b + 28, eraH = 24;
    const eraX = e => {
      const [a, b] = ERA_RANGE[e];
      return [x(new Date(Date.UTC(a, 0, 1))), Math.min(x(new Date(Date.UTC(b + 1, 0, 1))), W - m.r)];
    };
    const eras = svgL.append("g").selectAll("g").data(geo.eras).join("g").attr("class", "era")
      .attr("tabindex", 0).attr("role", "button").attr("aria-label", d => "Show era " + d)
      .on("click", (ev, d) => { state.era = d; update(); })
      .on("keydown", (ev, d) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); state.era = d; update(); } });
    eras.append("rect").attr("x", d => eraX(d)[0] + 1).attr("width", d => eraX(d)[1] - eraX(d)[0] - 2)
      .attr("y", eraY).attr("height", eraH).attr("rx", 12);
    eras.append("text").attr("x", d => (eraX(d)[0] + eraX(d)[1]) / 2).attr("y", eraY + 15.5)
      .attr("text-anchor", "middle").attr("class", "yr").text(d => d);
    svgL.append("text").attr("x", m.l).attr("y", eraY + eraH + 16).attr("class", "yr").style("letter-spacing", ".12em")
      .text("SHADED ERA = WHAT THE MAP SHOWS · TAP TO CHANGE");

    // hover readout: crosshair + every aesthetic's value that month
    const cross = svgL.append("line").attr("y1", m.t).attr("y2", H - m.b).attr("stroke", INK.ink2).attr("stroke-dasharray", "2 3").attr("visibility", "hidden");
    const dots = svgL.append("g");
    svgL.append("rect").attr("x", m.l).attr("y", m.t).attr("width", W - m.l - m.r).attr("height", H - m.b - m.t)
      .attr("fill", "transparent").style("cursor", "crosshair")
      .on("pointermove", ev => {
        const i = Math.max(0, Math.min(N - 1, d3.bisector(d => d).center(months, x.invert(d3.pointer(ev)[0]))));
        cross.attr("x1", x(months[i])).attr("x2", x(months[i])).attr("visibility", "visible");
        dots.selectAll("circle").data(series).join("circle").attr("r", 4).attr("stroke", "#fff").attr("stroke-width", 2)
          .attr("cx", x(months[i])).attr("cy", d => y(d.v[i])).attr("fill", d => colorOf(d.key))
          .attr("opacity", d => !FOC.key || FOC.key === d.key ? 1 : .15);
        const rows = series.slice().sort((a, b) => b.raw[i] - a.raw[i]).map(s => tipRow(s.key, nameOf(s.key), s.raw[i], s.key === FOC.key)).join("");
        showTip(ev, '<div class="tt">' + fmtMonth(months[i]) + "</div>" + rows);
      })
      .on("pointerleave", () => { hideTip(); cross.attr("visibility", "hidden"); dots.selectAll("*").remove(); });

    /* ── Where: map ───────────────────────────────────────────────────── */
    const MW = 560, MH = 300;
    const svgM = d3.select("#slotMap").append("svg").attr("class", "viz").attr("viewBox", [0, 0, MW, MH]);
    const land = topojson.feature(world, world.objects.countries).features;
    const proj = d3.geoNaturalEarth1().fitExtent([[2, 2], [MW - 2, MH - 2]], { type: "FeatureCollection", features: land });
    const path = d3.geoPath(proj);
    svgM.append("path").attr("d", path({ type: "Sphere" })).attr("fill", "rgba(255,255,255,.55)").attr("stroke", INK.rule);
    // every country that has data in at least one era can be zoomed into
    const DRILL = new Set(land.map(f => f.id).filter(id => geo.eras.some(e => geo.shares[e][id])));
    const NAME = Object.fromEntries(land.map(f => [f.id, f.properties.name]));
    const countries = svgM.append("g").selectAll("path").data(land).join("path")
      .attr("class", f => "country" + (DRILL.has(f.id) ? " drill" : "")).attr("d", path)
      .on("pointermove", (ev, f) => countryTip(ev, f))
      .on("pointerleave", hideTip)
      .on("click", (ev, f) => {
        if (!DRILL.has(f.id)) return;
        state.country = f.id; update();
        const r = document.getElementById("drillCard").getBoundingClientRect();     // make the click visibly do something
        if (r.bottom > innerHeight || r.top < 0) document.getElementById("drillCard").scrollIntoView({ behavior: "smooth", block: "nearest" });
      });

    // which aesthetic "leads" each country in an era
    function leaders(era, mode) {
      const g = geo.shares[era], ids = Object.keys(g);
      const mean = Object.fromEntries(AES.map(a => [a.key, d3.mean(ids, c => g[c][a.key])]));
      const out = {};
      ids.forEach(c => {
        let best = null, score = -1;
        AES.forEach(({ key: k }) => {
          const v = g[c][k];
          // "stands out": share relative to that term's average share across countries (needs >= 1% to count)
          const s = mode === "most" ? v : (mean[k] >= 1 && v >= 1 ? v / mean[k] : -1);
          if (s > score) { score = s; best = k; }
        });
        out[c] = best;
      });
      return out;
    }
    let LEAD = {};
    function countryTip(ev, f) {
      const v = geo.shares[state.era][f.id];
      const zoom = DRILL.has(f.id) ? '<div style="margin-top:6px;font-family:var(--mono);font-size:9.5px;letter-spacing:.1em;text-transform:uppercase">Click to zoom in ↓</div>' : "";
      if (!v) { showTip(ev, '<div class="tt">' + f.properties.name + "</div>Too little search volume" + zoom); return; }
      const rows = AES.filter(a => v[a.key] > 0).sort((a, b) => v[b.key] - v[a.key])
        .map(a => tipRow(a.key, a.name, v[a.key] + "%", a.key === LEAD[f.id])).join("");
      showTip(ev, '<div class="tt">' + f.properties.name + "</div>" +
        '<div style="margin-bottom:4px">Leads: <b style="font-weight:500;color:' + INK.ink + '">' + nameOf(LEAD[f.id]) + "</b></div>" + rows + zoom);
    }
    d3.select("#mStand").on("click", () => { state.mode = "stand"; update(); });
    d3.select("#mMost").on("click", () => { state.mode = "most"; update(); });

    /* ── Zoom in: any country's share of the eight, era by era ──────────── */
    const ERAS = geo.eras;
    const DW = 640, DH = 260, dm = { t: 14, r: 96, b: 30, l: 34 };
    const svgD = d3.select("#slotDrill").append("svg").attr("class", "viz").attr("viewBox", [0, 0, DW, DH]);
    const dx = d3.scalePoint().domain(ERAS).range([dm.l + 22, DW - dm.r - 22]);
    const dy = d3.scaleLinear().range([DH - dm.b, dm.t]);
    const dBand = svgD.append("rect").attr("y", dm.t).attr("height", DH - dm.t - dm.b).attr("width", 44).attr("rx", 6)
      .attr("fill", "rgba(13,16,19,.12)").attr("stroke", INK.ink).attr("stroke-width", 1.5);
    const dGrid = svgD.append("g").attr("class", "grid");
    const dYlab = svgD.append("g");
    svgD.append("g").selectAll("text").data(ERAS).join("text")
      .attr("class", "yr").attr("x", dx).attr("y", DH - 8).attr("text-anchor", "middle").text(d => ERA_LABEL[d] || d);
    const DKEYS = ORDER.filter(k => k !== "street");          // streetwear is "the rest"
    const dLine = d3.line().defined(d => d != null).x((d, i) => dx(ERAS[i])).y(d => dy(d)).curve(d3.curveMonotoneX);
    const dLines = svgD.append("g").selectAll("g").data(DKEYS).join("g").attr("class", "ln");
    dLines.append("path").attr("stroke", k => colorOf(k));
    const dDots = svgD.append("g").selectAll("g").data(DKEYS).join("g").attr("fill", k => colorOf(k));
    const dLabels = svgD.append("g").selectAll("text").data(DKEYS).join("text")
      .attr("x", DW - dm.r + 8).style("font-size", "10.5px").style("fill", INK.ink2).text(k => nameOf(k));
    const dCross = svgD.append("line").attr("y1", dm.t).attr("y2", DH - dm.b).attr("stroke", INK.ink2).attr("stroke-dasharray", "2 3").attr("visibility", "hidden");
    // one country's series: share of `k` in each era (null where Google had too little volume)
    const ser = (id, k) => ERAS.map(e => { const v = geo.shares[e][id]; return v ? v[k] : null; });
    svgD.append("rect").attr("x", dm.l).attr("y", dm.t).attr("width", DW - dm.l - dm.r).attr("height", DH - dm.t - dm.b)
      .attr("fill", "transparent").style("cursor", "crosshair")
      .on("pointermove", ev => {
        const i = d3.minIndex(ERAS, e => Math.abs(dx(e) - d3.pointer(ev)[0]));
        const v = geo.shares[ERAS[i]][state.country];
        dCross.attr("x1", dx(ERAS[i])).attr("x2", dx(ERAS[i])).attr("visibility", "visible");
        const head = '<div class="tt">' + NAME[state.country] + " · " + ERAS[i] + "</div>";
        if (!v) { showTip(ev, head + "Too little search volume"); return; }
        showTip(ev, head + ORDER.slice().sort((a, b) => v[b] - v[a]).map(k => tipRow(k, nameOf(k), v[k] + "%", false)).join(""));
      })
      .on("pointerleave", () => { hideTip(); dCross.attr("visibility", "hidden"); });

    // menu: every country with data, A to Z (handy for small countries)
    d3.select("#drillSelect").selectAll("option")
      .data([...DRILL].sort((p, q) => NAME[p].localeCompare(NAME[q]))).join("option")
      .attr("value", id => id).text(id => NAME[id]);
    d3.select("#drillSelect").on("change", function () { state.country = this.value; update(); });

    function drawDrill() {
      const id = state.country, name = NAME[id];
      d3.select("#drillSelect").property("value", id);
      const S = Object.fromEntries(DKEYS.map(k => [k, ser(id, k)]));
      const max = d3.max(DKEYS, k => d3.max(S[k])) || 0;
      dy.domain([0, Math.max(10, Math.ceil(max / 10) * 10)]);
      const ticks = dy.ticks(4);
      dGrid.selectAll("line").data(ticks).join("line").attr("x1", dm.l).attr("x2", DW - dm.r)
        .transition().duration(600).attr("y1", dy).attr("y2", dy);
      dYlab.selectAll("text").data(ticks).join("text").attr("x", dm.l - 6).attr("text-anchor", "end")
        .text(d => d + "%").transition().duration(600).attr("y", d => dy(d) + 3);
      dBand.transition().duration(400).attr("x", dx(state.era) - 22);
      dLines.select("path").transition().duration(750).ease(d3.easeCubicInOut).attr("d", k => dLine(S[k]));
      dDots.selectAll("circle").data(k => S[k].map((v, i) => ({ v, i }))).join("circle")
        .attr("r", 3.5).attr("stroke", "#fff").attr("stroke-width", 1.5).attr("cx", d => dx(ERAS[d.i]))
        .attr("visibility", d => d.v == null ? "hidden" : "visible")
        .transition().duration(750).attr("cy", d => d.v == null ? 0 : dy(d.v));
      // end labels at each line's last available era, nudged apart so they never overlap
      const lastV = k => { const a = S[k].filter(v => v != null); return a.length ? a[a.length - 1] : null; };
      const ends = DKEYS.filter(k => lastV(k) != null).map(k => ({ k, y: dy(lastV(k)) })).sort((a, b) => a.y - b.y);
      for (let i = 1; i < ends.length; i++) ends[i].y = Math.max(ends[i].y, ends[i - 1].y + 12);
      const yAt = Object.fromEntries(ends.map(e => [e.k, e.y]));
      dLabels.style("display", k => yAt[k] == null ? "none" : null).transition().duration(750).attr("y", k => (yAt[k] ?? 0) + 3.5);

      // side panel: this country's biggest non-streetwear moment
      let best = { k: null, v: -1, e: null };
      DKEYS.forEach(k => S[k].forEach((v, i) => { if (v != null && v > best.v && +ERAS[i].slice(0, 4) >= 2018) best = { k, v, e: ERAS[i] }; }));   // 2018 on: before that the new aesthetics barely existed, so a share is just low-volume noise
      const st = ser(id, "street").map((v, i) => ({ v, e: ERAS[i] })).filter(d => d.v != null);
      const first = st[0], last = st[st.length - 1];
      d3.select("#drillTitle").text(name + ": " + nameOf(best.k) + " peaked at " + Math.round(best.v) + "% in " + best.e);
      d3.select("#drillSide").html(
        '<div class="tag">Peak moment</div>' +
        '<div class="big">' + Math.round(best.v) + "%</div>" +
        "<p>In " + best.e + ", <b style=\"font-weight:500\">" + nameOf(best.k) + "</b> reached " + Math.round(best.v) +
        "% of searches for the " + inWords(ORDER.length) + " aesthetics in " + name + ". " +
        (st.length > 1 ? "Streetwear's share went from " + Math.round(first.v) + "% in " + first.e + " to " + Math.round(last.v) + "% in " + last.e + "."
                       : "Only " + first.e + " has enough search volume here to chart.") + "</p>" +
        '<p class="vhint" style="margin-top:14px">Eras with too little search volume are left blank · click any country on the map</p>');
    }

    /* ── one update for all three views ───────────────────────────────── */
    function update() {
      LEAD = leaders(state.era, state.mode);
      const [ex0, ex1] = eraX(state.era);
      eraShade.transition().duration(400).attr("x", ex0).attr("width", ex1 - ex0);
      eras.classed("on", d => d === state.era);
      countries.transition().duration(500)
        .attr("fill", f => LEAD[f.id] ? colorOf(LEAD[f.id]) : INK.nodata);
      countries.classed("picked", f => f.id === state.country);
      countries.filter(f => f.id === state.country).raise();
      d3.select("#mStand").attr("aria-pressed", String(state.mode === "stand"));
      d3.select("#mMost").attr("aria-pressed", String(state.mode === "most"));
      const counts = d3.rollup(Object.values(LEAD), v => v.length, d => d);
      const top = [...counts].sort((a, b) => b[1] - a[1]);
      const total = Object.keys(LEAD).length;
      d3.select("#mapTitle").text(top.length === 1
        ? nameOf(top[0][0]) + (state.mode === "most" ? " is the most-searched aesthetic in all " : " stands out in all ") + total + " countries in " + state.era
        : state.mode === "most"
          ? nameOf(top[0][0]) + " is the most-searched aesthetic in " + top[0][1] + " of " + total + " countries in " + state.era + ", but " + inWords(top.length - 1) + " others lead somewhere"
          : cap(inWords(top.length)) + " different aesthetics stand out across " + total + " countries in " + state.era);
      d3.select("#mapSub").text("Where · " + state.era + " · " + (state.mode === "most" ? "colored by the most-searched aesthetic" : "colored by the aesthetic searched most above its global average"));
      d3.select("#mapHint").text(top.slice(0, 3).map(([k, n]) => nameOf(k) + " " + n).join(" · ") + " countries · click any country to zoom in");
      drawDrill();
      applyFocus(FOC.key);
    }
    function applyFocus(f) {
      lines.select("path")
        .attr("opacity", d => !f || f === d.key ? 1 : .12)
        .attr("stroke-width", d => f === d.key ? 4 : 2.6);
      lines.select("circle.pk").attr("opacity", d => !f || f === d.key ? 1 : .15);
      lines.filter(d => d.key === f).raise();
    }
    FOC.on(applyFocus);
    // on phones the chart scrolls sideways: start at the right-hand end, where the peaks are
    setTimeout(() => { const f = document.getElementById("slotLines"); f.scrollLeft = f.scrollWidth; }, 0);
    update();
  }).catch(err => {
    console.error(err);
    ["#slotLines", "#slotMap", "#slotDrill"].forEach(s => d3.select(s).html('<p class="vnote">Could not load the data files. Make sure the <code>data</code> folder is next to <code>index.html</code>.</p>'));
  });
})();

// the "When" title counts the aesthetics that broke out in 2020 or later
DATA.then(() => {
  const n = Object.values(LIFE).filter(a => +a.breakout.slice(0, 4) >= 2020).length;
  const t = document.getElementById("whenTitle"); if (t) t.textContent = cap(inWords(n)) + " of the " + inWords(ORDER.length) + " aesthetics took off in 2020 or later, each on its own schedule";
});
