/* ══ people: one cut-out photo per aesthetic (assets/people/) ══════════════
   kind: "stand" = full body, "knee" = cropped at the knee (faded at the bottom),
   "seated" = sitting pose (drawn shorter so heads line up sensibly).
   pieces: what the look is made of, listed lookbook-style. */
const PEOPLE = {
  street: { kind: "stand", alt: "Streetwear look: washed red zip hoodie, studded cap, wide grey shorts, rubber boots",
    pieces: [["Zip hoodie", "Washed fleece, sprayed logo"], ["Cap", "Distressed denim, studded"], ["Shorts", "Wide-leg wool"], ["Boots", "Moulded rubber"]] },
  academia: { kind: "stand", alt: "Dark Academia look: oversized houndstooth blazer, striped shirt and tie, white socks, platform loafers",
    pieces: [["Blazer", "Houndstooth wool, oversized"], ["Shirt", "Striped cotton poplin"], ["Tie", "Woven stripe"], ["Loafers", "Platform leather, white crew socks"]] },
  y2k: { kind: "knee", alt: "Y2K look: white halter top, cut-off denim shorts, orange on-ear headphones",
    pieces: [["Halter top", "Cotton jersey"], ["Shorts", "Cut-off denim"], ["Headphones", "On-ear, orange foam"], ["Hoops", "Gold"]] },
  gorp: { kind: "stand", alt: "Gorpcore look: hooded nylon shell, backpack rain cover, olive cargo trousers, black sneakers",
    pieces: [["Shell", "Hooded nylon"], ["Pack cover", "Silicone-coated nylon"], ["Cargo trousers", "Olive cotton, toggled hem"], ["Sneakers", "Black canvas"]] },
  quiet: { kind: "stand", alt: "Quiet Luxury look: cream mohair turtleneck and knit maxi skirt, oversized brown leather clutch",
    pieces: [["Turtleneck", "Cream mohair"], ["Skirt", "Knit maxi"], ["Clutch", "Gathered leather, oversized"], ["Flats", "Pointed black leather"]] },
  cottage: { kind: "knee", alt: "Cottagecore look: cream pointelle cardigan with lace cuffs, white crochet headscarf, blue gingham skirt gathered to hold apples",
    pieces: [["Cardigan", "Cream pointelle knit, gold buttons, lace cuffs"], ["Headscarf", "Pale crochet"], ["Skirt", "Blue gingham, gathered"]] },
  maxi: { kind: "stand", alt: "Maximalism look: red baby tee with a black rabbit print, blue plaid draped maxi skirt, cobalt lace-up boots, layered silver jewellery",
    pieces: [["Tee", "Red ringer, oversized rabbit print"], ["Skirt", "Blue plaid, draped asymmetric maxi"], ["Boots", "Cobalt patent, lace-up heel"], ["Jewellery", "Layered silver collar and cuffs"], ["Bag", "Black leather, studs and hardware"]] },
  coquette: { kind: "seated", alt: "Coquette look: pink tulle mini dress, knee-high black kitten-heel boots",
    pieces: [["Dress", "Pink jersey bodice, tulle skirt"], ["Boots", "Knee-high, kitten heel"], ["Hair", "Low ponytail"]] }
};
const photo = k => "assets/people/" + k + ".webp";
// <img> for a look, with the right class for its pose
const personImg = (k, extra = "") =>
  '<img src="' + photo(k) + '" alt="' + PEOPLE[k].alt + '" class="' + (PEOPLE[k].kind !== "stand" ? PEOPLE[k].kind : "") + " " + extra + '" loading="lazy" decoding="async">';
