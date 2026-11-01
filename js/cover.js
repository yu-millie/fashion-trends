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

  // footer marquee (content doubled so the loop is seamless)
  const words = ["Google Trends", "2004–2025", "Six aesthetics", "Thirteen brands", "Two platforms", "One story", "No single cycle"];
  const once = words.map(w => "<span>" + w + "</span>").join("");
  document.getElementById("marquee2").innerHTML = once + once + once + once;
})();
