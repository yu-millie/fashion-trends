/* ══ lookbook: a scroll-driven carousel of the looks ═════════════════
   The section is tall (one 70vh "step" per look) and its inner .lb-pin is
   sticky, so it stays on screen while you scroll through it. Scroll progress
   picks the active look; the track slides it to the centre. The active look is
   full size and in colour; the others shrink and fade, like a shop lookbook.
   Looks run in the order each aesthetic broke out. */
(function lookbook() {
  const ORDER_LB = ["street", "cottage", "y2k", "academia", "gorp", "maxi", "quiet", "coquette"];   // by breakout month (data/lifecycle.json)
  const n = ORDER_LB.length;
  const sec = document.getElementById("lookbook");
  const stage = document.getElementById("lbStage");
  const track = document.getElementById("lbTrack");
  const textEl = document.getElementById("lbText");
  const ghost = document.getElementById("lbGhost");
  sec.style.setProperty("--n", n);
  let active = -1;

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

  function render(i) {
    const k = ORDER_LB[i], t = T[k], L = LIFE[k];
    textEl.classList.add("out");
    setTimeout(() => {
      textEl.innerHTML =
        '<div class="k">Look ' + String(i + 1).padStart(2, "0") + " / " + String(n).padStart(2, "0") + " · aesthetic</div>" +
        "<h3>" + t.name + "</h3>" +
        '<div class="dates">' + (L ? "Broke out " + yearOf(L.breakout) + " · peaked " + yearOf(L.peak) + " · " + L.months_above_half + " months on top" : "") + "</div>" +
        "<p>" + t.def + "</p>" +
        '<ul class="pieces">' + PEOPLE[k].pieces.map(([a, b]) => "<li>" + a + "<span>" + b + "</span></li>").join("") + "</ul>";
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

  DATA.then(() => { active = -1; onScroll(); });
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", layout);
  onScroll();
})();
