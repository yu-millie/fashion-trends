/* ══ cover: magazine front page ═════════════════════════════════════════
   Cover star in front, the other five looks lined up behind the masthead.
   Cover lines read their numbers from the data. */
(function cover() {
  const BACK = ["street", "gorp", "academia", "quiet", "coquette"];
  // two on the left, three on the right, leaving the centre for the cover star
  document.getElementById("backline").innerHTML = BACK.map(k => personImg(k)).join("");

  DATA.then(({ share, life }) => {
    const at = (k, y) => share.share[k][share.years.indexOf(y)];
    document.getElementById("clFall").textContent = Math.round(at("street", 2019)) + " → " + Math.round(at("street", 2025));
    const y2k = life.aesthetics.find(a => a.key === "y2k");
    const longest = d3.max(life.aesthetics, a => a.months_above_half);
    document.getElementById("clStar").textContent = y2k.months_above_half + " months on top";
    if (y2k.months_above_half !== longest) document.querySelector("#clStar + small").textContent = "of search above half its peak";
  });

  // decorative barcode
  let s = 3, x = 0, bars = "";
  while (x < 120) { s = (s * 48271) % 2147483647; const w = 1 + (s % 3); if (s % 2) bars += '<rect x="' + x + '" width="' + w + '" height="30"/>'; x += w + 1; }
  document.getElementById("barcode").innerHTML = '<g fill="#0d1013">' + bars + "</g>";

})();

// closing takeaway: the pattern in the aesthetic changes, from the lifecycle data
DATA.then(() => {
  const L = Object.values(LIFE), waves = [...new Set(L.map(a => +a.breakout.slice(0, 4)).filter(y => y >= 2020))].sort();
  const med = Math.round(d3.median(L, a => a.months_above_half)), list = waves.length > 1 ? waves.slice(0, -1).join(", ") + " and " + waves[waves.length - 1] : waves.join("");
  const el = document.getElementById("closingTake");
  if (el && waves.length) el.innerHTML = "<b>There is a pattern to the aesthetic changes:</b> new looks break out in waves (" + list + "), and a typical one stays on top for about " + med + " months.";
});

// cover line: how many quarters of Lyst's top 20 the hot 20 chart plays through
loadData("lyst").then(l => {
  const n = l.quarters.filter(q => q.list && q.list.length && +String(q.q).slice(0, 4) <= 2025).length, el = document.getElementById("clHot");
  if (el && n) el.textContent = n + " quarters";
});
