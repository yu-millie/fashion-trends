/* ══ the shops: year in review → the hot 20 ═══
   SHOP holds the section's shared state:
     SHOP.year    the selected year (slider, ticks, hot-20 quarter, table clicks all set it)
     SHOP.picked  brands the viewer clicked to follow; highlighted in the Hot 20
   Views register with SHOP.onYear / SHOP.onPick. */
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
      const prev = S.YEARS[y - 1];
      const rw = typeof runwayHTML === "function"
        ? runwayHTML(y, { look: row.look, prev: prev ? prev.brands.slice(0, 5).map(b => b.name) : null, tracked: new Set(S.brands.map(b => b.name)) }) : null;           // runway photos first, the look cutout as a fallback
      spread.classList.toggle("rw", !!rw); spread.classList.toggle("duo", !!rw && rw.n > 1);
      document.getElementById("spPhoto").innerHTML = rw ? rw.html : personImg(row.look);
      document.getElementById("spNo1").textContent = n1.names.join(" / ");
      document.getElementById("spNo1Sub").textContent = "#1 in " + n1.n + " of " + n1.of + " quarters" + (n1.names.length > 1 ? " each" : "") + (y === 2017 ? " (no Q4 index)" : "");
      document.getElementById("spLook").textContent = t.name;
      document.getElementById("spLookSub").textContent = row.look === "street" && row.look_gain < .5
        ? "No aesthetic gained ground, so streetwear still set the look."
        : "Its share of the " + inWords(ORDER.length) + " grew most this year (+" + row.look_gain + " points).";
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
  // the current year, large, in the empty corner under the short bars, with the quarter and the year's look beneath it
  const bigYear = svg.append("text").attr("class", "bigyear").attr("x", W - 6).attr("y", H - 58).attr("text-anchor", "end");
  const bigSub = svg.append("text").attr("class", "bigsub").attr("x", W - 10).attr("y", H - 20).attr("text-anchor", "end");
  const x = d3.scaleLinear().domain([0, 20]).range([0, W - L - 70]);
  const ours = new Set(S.brands.map(b => b.name));
  let qi = 0, timer = null;
  {   // title: the year in which the largest share of assessed top-20 brands matched the year's look, fully or partly
    const tally = {};
    S.Q.filter(q => q.list && q.list.length && S.YEARS[q.year]).forEach(q => {
      const t = tally[q.year] = tally[q.year] || { m: 0, n: 0 };
      q.list.filter(n => n !== "?").forEach(n => { const v = brandYearVerdict(n, q.year, S.YEARS[q.year].look); if (v.s === "yes" || v.s === "part" || v.s === "no") { t.n++; if (v.s !== "no") t.m++; } });
    });
    // years where at least 45 % of the assessed brands matched the year's look, fully or partly (and enough brands were assessed to say)
    const good = Object.entries(tally).filter(([, t]) => t.n >= 20 && t.m / t.n >= .45).map(([y]) => y).sort();
    const ht = document.getElementById("h20Title");
    if (ht && good.length) ht.textContent = "Most top-20 brands did not match the year's look, except in " + (good.length === 1 ? good[0] : good.slice(0, -1).join(", ") + " and " + good[good.length - 1]);
  }

  function draw() {
    const q = QS[qi], prev = QS[qi - 1];
    label.textContent = q.q.replace("Q", " Q");
    bigYear.text(q.year);
    slider.value = qi;
    const prevRank = n => prev ? (prev.list.indexOf(n) + 1 || null) : null;
    const rows = q.list.map((n, i) => ({ n, r: i + 1, p: n === "?" ? null : prevRank(n) }));
    const beyond = q.year > S.ys[S.ys.length - 1];
    const look = beyond || !S.YEARS[q.year] ? null : S.YEARS[q.year].look;
    // did this brand's runway match the year's look? (the shows we studied, same coding as the timeline)
    rows.forEach(r => { const v = brandYearVerdict(r.n, q.year, look); r.s = v.s; r.shows = v.shows; r.era = !!v.era; });
    const c = beyond ? INK.ink2 : S.lookColor(q.year);
    bigSub.text("Q" + q.q.slice(-1) + (look ? " · " + nameOf(look) + " year" : "")).style("fill", look ? c : INK.ink3);
    d3.select("#h20Key").html(look
      ? '<span style="--c:' + c + '"><i></i>Runway matched ' + q.year + "'s look (" + nameOf(look) + ')</span><span><i class="part" style="--c:' + c + '"></i>Partly matched</span>' +
        '<span><i class="no"></i>Studied, did not match</span><span><i class="none"></i>No runway</span><span>▲ up / ▼ down vs last quarter</span>'
      : '<span><i class="grey"></i>No look assigned after ' + S.ys[S.ys.length - 1] + ', so no runway match is shown</span><span><i class="none"></i>No runway</span><span>▲ up / ▼ down vs last quarter</span>');
    const g = svg.selectAll("g.row").data(rows, d => d.n).join(enter => {
      const e = enter.append("g").attr("class", "row").attr("transform", "translate(0," + H + ")").style("opacity", 0);
      e.append("text").attr("class", "rk").attr("x", 22).attr("y", rowH / 2 + 4).attr("text-anchor", "end");
      e.append("text").attr("class", "nm").attr("x", L - 12).attr("y", rowH / 2 + 4).attr("text-anchor", "end");
      e.append("rect").attr("class", "bar").attr("x", L).attr("y", 3).attr("height", rowH - 6).attr("rx", 4).attr("width", 0);
      e.append("text").attr("class", "al").attr("x", L + 9).attr("y", rowH / 2 + 4.5);
      e.append("text").attr("class", "ch").attr("y", rowH / 2 + 4);
      return e;
    }, u => u, ex => ex.transition().duration(400).style("opacity", 0).attr("transform", "translate(0," + H + ")").remove());
    g.on("click", (ev, d) => ours.has(d.n) && S.toggle(d.n)).style("cursor", d => ours.has(d.n) ? "pointer" : "default")
      .on("pointermove", (ev, d) => showTip(ev, '<div class="tt">' + d.n + "</div>#" + d.r + " in " + q.q.replace("Q", " Q") +
        (d.p ? "<br>" + (d.p === d.r ? "same as" : d.p > d.r ? "up from" : "down from") + " #" + d.p + " last quarter" : prev ? "<br>new to the list" : "") +
        (d.s === "none" ? '<div style="margin-top:6px;font-size:11.5px">Doesn\'t have a runway: ' + d.shows[0] + "</div>"
          : look && (ours.has(d.n) || d.s !== "na") ? '<div style="margin-top:6px;font-size:11.5px">' +
          (d.s === "yes" ? "Runway matched " + q.year + "'s look (" + nameOf(look) + "): " + d.shows.join(", ")
            : d.s === "part" ? "Runway partly matched " + q.year + "'s look (" + nameOf(look) + "): " + d.shows.join(", ")
            : d.s === "no" ? "Runway did not match " + q.year + "'s look (" + nameOf(look) + ")" : "No runway studied this year") +
          (d.era && d.s !== "na" ? "<br><i>A reading of the brand's designer era, not one show" + (d.s === "no" ? ": " + d.shows.join("; ") : "") + "</i>" : "") + "</div>" : "") +
        (ours.has(d.n) ? '<div style="margin-top:3px;font-size:11px">Click to follow this brand</div>' : "")))
      .on("pointerleave", hideTip);
    g.classed("picked", d => S.picked.has(d.n));
    g.transition().duration(1200).ease(d3.easeCubicInOut).attr("transform", d => "translate(0," + (d.r - 1) * rowH + ")").style("opacity", 1);
    g.select(".rk").text(d => d.r);
    g.select(".nm").text(d => d.n === "?" ? "(not reported)" : d.n).style("fill", d => ours.has(d.n) ? INK.ink : INK.ink3)
      .style("font-weight", d => d.s === "yes" || d.s === "part" ? 700 : null).style("font-style", d => d.s === "none" ? "italic" : null);
    g.select(".bar").transition().duration(1200).attr("width", d => x(21 - d.r))
      .attr("fill", d => d.s === "yes" || d.s === "part" ? c : d.s === "no" ? "#a39e94" : d.s === "none" ? "#f8f6f1" : "#e6e2d9").attr("fill-opacity", d => d.s === "part" ? .34 : 1);
    g.select(".bar").attr("stroke", d => d.s === "part" ? c : d.s === "none" ? "#b3ad9f" : null).attr("stroke-width", d => d.s === "part" ? 1.8 : d.s === "none" ? 1.3 : null)
      .attr("stroke-dasharray", d => d.s === "part" ? "4 3" : d.s === "none" ? "3 3" : null);
    g.select(".al").text(d => d.s === "yes" ? "✓" : d.s === "part" ? "◐" : "").style("fill", d => d.s === "yes" && c.startsWith("#") ? textOn(c) : INK.ink)
      .style("font-size", "13px").style("font-weight", 700).style("pointer-events", "none");
    g.select(".ch").transition().duration(1200).attr("x", d => L + x(21 - d.r) + 8)
      .text(d => !prev || d.n === "?" ? "" : !d.p ? "NEW" : d.p === d.r ? "" : (d.p > d.r ? "▲" : "▼") + Math.abs(d.p - d.r))
      .style("fill", d => !d.p || d.p > d.r ? INK.ink : INK.ink3);
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
    timer = setInterval(() => { if (qi >= QS.length - 1) return stop(); goQ(qi + 1); }, 2400);
  });
  S.onYear.push((y, row, src) => {
    if (src === "h20") return;
    const last = QS.map(q => q.year).lastIndexOf(y);
    if (last >= 0) { qi = last; draw(); }
  });
  S.onPick.push(() => svg.selectAll("g.row").classed("picked", d => S.picked.has(d.n)));
});

/* ── following: a pick lasts only while the Hot 20 is on screen ── */
SHOP.ready.then(S => {
  const cards = ["slotH20"].map(id => document.getElementById(id)).filter(Boolean).map(e => e.closest(".card"));
  const seen = new Set();
  const io = new IntersectionObserver(es => {
    es.forEach(e => e.isIntersecting ? seen.add(e.target) : seen.delete(e.target));
    if (!seen.size && S.picked.size) [...S.picked].forEach(n => S.toggle(n));
  });
  cards.forEach(c => io.observe(c));
});

SHOP.ready.then(S => setTimeout(() => { S.setYear(S.ys[0]); S.onPick.forEach(fn => fn(S.picked)); }, 0));
