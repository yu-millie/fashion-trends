/* ══ lookbook: a scroll-driven carousel of the six looks ═════════════════
   The section is tall (one 70vh "step" per look) and its inner .lb-pin is
   sticky, so it stays on screen while you scroll through it. Scroll progress
   picks the active look; the track slides it to the centre. The active look is
   full size and in colour; the others shrink and fade, like a shop lookbook.
   Looks run in the order each aesthetic broke out. */
(function lookbook() {
  const ORDER_LB = ["street", "academia", "y2k", "gorp", "quiet", "coquette"];
  const n = ORDER_LB.length;
  const sec = document.getElementById("lookbook");
  const stage = document.getElementById("lbStage");
  const track = document.getElementById("lbTrack");
  const textEl = document.getElementById("lbText");
  const ghost = document.getElementById("lbGhost");
  sec.style.setProperty("--n", n);
  let active = -1, SERIES = null, MONTHS = null;

  track.innerHTML = ORDER_LB.map((k, i) => '<div class="lb-slot" data-i="' + i + '">' + personImg(k) + "</div>").join("");
  const slots = [...track.children];
  const dots = d3.select("#lbDots").selectAll("button").data(ORDER_LB).join("button")
    .style("--c", k => colorOf(k)).text(k => nameOf(k)).on("click", (ev, k) => goTo(ORDER_LB.indexOf(k)));

  // scroll position that shows look i
  const posOf = i => {
    const top = sec.getBoundingClientRect().top + scrollY;
    return top + ((i + .5) / n) * (sec.offsetHeight - innerHeight);
  };
  const goTo = i => scrollTo({ top: posOf(Math.max(0, Math.min(n - 1, i))), behavior: "smooth" });
  slots.forEach((s, i) => s.addEventListener("click", () => goTo(i)));
  document.getElementById("lbPrev").addEventListener("click", () => goTo(active - 1));
  document.getElementById("lbNext").addEventListener("click", () => goTo(active + 1));

  function layout() {
    const W = stage.clientWidth;
    const slotW = Math.max(130, Math.min(300, W / 3.6));
    track.style.setProperty("--slot", slotW + "px");
    track.style.transform = "translateX(" + (W / 2 - (Math.max(active, 0) + .5) * slotW) + "px)";
  }

  // small search sparkline for the panel (2004–2025, each line's own peak = 100)
  function spark(k) {
    if (!SERIES) return "";
    const v = SERIES[k].map((_, i, a) => d3.mean(a.slice(Math.max(0, i - 1), i + 2)));
    const x = d3.scaleLinear().domain([0, v.length - 1]).range([0, 280]);
    const y = d3.scaleLinear().domain([0, 100]).range([52, 4]);
    const area = d3.area().x((d, i) => x(i)).y0(52).y1(y).curve(d3.curveMonotoneX)(v);
    const line = d3.line().x((d, i) => x(i)).y(y).curve(d3.curveMonotoneX)(v);
    const pk = d3.maxIndex(v), c = colorOf(k);
    return '<svg class="spark" viewBox="0 0 280 64" aria-label="Search interest for ' + nameOf(k) + ', 2004 to 2025">' +
      '<path d="' + area + '" fill="' + c + '" fill-opacity=".14"/><path d="' + line + '" fill="none" stroke="' + c + '" stroke-width="2"/>' +
      '<circle cx="' + x(pk) + '" cy="' + y(v[pk]) + '" r="4" fill="' + c + '" stroke="#fff" stroke-width="1.5"/>' +
      '<text x="0" y="63" style="font:9px var(--mono);fill:#7b848d">2004</text><text x="280" y="63" text-anchor="end" style="font:9px var(--mono);fill:#7b848d">2025</text>' +
      '<text x="' + Math.min(x(pk), 230) + '" y="' + Math.max(10, y(v[pk]) - 7) + '" text-anchor="middle" style="font:9px var(--mono);fill:#0d1013">PEAK ' + MONTHS[pk].slice(0, 4) + "</text></svg>";
  }

  function render(i) {
    const k = ORDER_LB[i], t = T[k], L = LIFE[k];
    textEl.classList.add("out");
    setTimeout(() => {
      textEl.innerHTML =
        '<div class="k">Look ' + String(i + 1).padStart(2, "0") + " / " + String(n).padStart(2, "0") + " · aesthetic</div>" +
        "<h3>" + t.name + "</h3>" +
        '<div class="dates">' + (L ? "Broke out " + yearOf(L.breakout) + " · peaked " + yearOf(L.peak) + " · " + L.months_above_half + " months on top" : "") + "</div>" +
        "<p>" + t.def + "</p>" +
        '<ul class="pieces">' + PEOPLE[k].pieces.map(([a, b]) => "<li>" + a + "<span>" + b + "</span></li>").join("") + "</ul>" +
        '<div class="k" style="margin-bottom:4px">Worldwide search</div>' + spark(k);
      textEl.classList.remove("out");
    }, active === -1 ? 0 : 230);
    ghost.textContent = t.name;
    document.getElementById("lbCount").textContent = String(i + 1).padStart(2, "0") + " / " + String(n).padStart(2, "0");
    slots.forEach((s, j) => s.classList.toggle("on", j === i));
    dots.classed("on", d => d === k);
  }

  function onScroll() {
    const r = sec.getBoundingClientRect();
    const p = Math.max(0, Math.min(.9999, -r.top / (sec.offsetHeight - innerHeight)));
    const i = Math.floor(p * n);
    if (i !== active) { render(i); active = i; layout(); }
  }

  Promise.all([DATA, loadData("timeline_worldwide")]).then(([, tl]) => {
    SERIES = tl.series; MONTHS = tl.months;
    active = -1; onScroll();
  });
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", layout);
  onScroll();
})();
