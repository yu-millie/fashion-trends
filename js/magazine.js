/* ══ magazine furniture: torn page edges, folios, torn pull-quote scraps ════ */
(function magazine() {
  // small seeded random so every tear is the same on each load
  let seed = 7;
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  // a torn edge: a ragged top line, filled with the page's own colour, with a
  // thin pale "paper core" just inside the rip
  function tearSVG(color) {
    const W = 1440, H = 28, pts = [];
    let x = 0, y = 14;
    while (x <= W) {
      y = Math.max(3, Math.min(24, y + (rand() - .5) * 9 + (rand() < .06 ? (rand() - .5) * 16 : 0)));
      pts.push([x, y]); x += 6 + rand() * 14;
    }
    pts.push([W, y]);
    const top = pts.map(([px, py], i) => (i ? "L" : "M") + px.toFixed(0) + " " + py.toFixed(1)).join("");
    const core = pts.map(([px, py], i) => (i ? "L" : "M") + px.toFixed(0) + " " + (py + 1.6 + rand() * 1.4).toFixed(1)).join("");
    return '<svg viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="none" aria-hidden="true">' +
      '<path d="' + top + "L" + W + " " + H + "L0 " + H + 'Z" fill="#fffdf9"/>' +
      '<path d="' + core + "L" + W + " " + H + "L0 " + H + 'Z" fill="' + color + '"/></svg>';
  }

  let page = 1;
  document.querySelectorAll("[data-tear]").forEach(sec => {
    const color = getComputedStyle(sec).getPropertyValue("--bg").trim() || "#e2e7ec";
    const t = document.createElement("div");
    t.className = "tear";
    t.innerHTML = tearSVG(color);
    sec.prepend(t);
    if (sec.dataset.folio) {
      page += 1 + Math.round(rand() * 3);
      const f = document.createElement("div");
      f.className = "folio";
      f.innerHTML = "<span>Aesthetic — Fall 2026 · <b>" + sec.dataset.folio + "</b></span><span>P. " + String(page).padStart(2, "0") + "</span>";
      (sec.querySelector(".lb-pin") || sec).appendChild(f);
    }
  });

  // pull-quote scraps: ragged top and bottom edges via clip-path
  document.querySelectorAll(".scrap").forEach(el => {
    const top = [], bot = [];
    for (let x = 0; x <= 100; x += 2 + rand() * 3) top.push(x.toFixed(1) + "% " + (rand() * 3.2).toFixed(1) + "%");
    for (let x = 100; x >= 0; x -= 2 + rand() * 3) bot.push(x.toFixed(1) + "% " + (100 - rand() * 3.2).toFixed(1) + "%");
    el.style.clipPath = "polygon(0% 0%, " + top.join(", ") + ", 100% 0%, 100% 100%, " + bot.join(", ") + ", 0% 100%)";
  });
})();
