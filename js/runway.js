/* ══ On the runway: the show nearest the quarter each brand was #1 on Lyst ═════
   One entry per brand per year. Edit this list to change a caption or swap a photo.
   file: null = no photo yet (that year keeps its look cutout).  credit: who the photo is credited to (defaults to the brand, shown as "Photo courtesy of ...").
   about: a description of the show (this is what the click-open panel shows; no about = the photo is not clickable).
   look:  what the model in the photo is wearing (kept for reference, not shown).
   led:   concept (the staging is the idea) or clothes (the clothes are the idea): our reading of the show.
   alt:   a looser aesthetic reading, used for "partly matches the year's look".
   read:  our own reading of the show, matched to the six aesthetics (key) with a
   fit of strong | fair | loose; key null = outside our aesthetics. */
const RUNWAY = {
  2017: [
    { brand: "Gucci", show: "Fall/Winter 2017", q: "Q2 2017", file: "2017-gucci.jpg", credit: "", led: "concept",
      alt: "Model in a pink embroidered floral dress with a bow collar, holding a green fringed parasol",
      look: "A long pink dress covered in oversized embroidered flowers, finished with a white collar and a green bow. She carries a green and gold fringed parasol and wears yellow platform shoes over patterned socks.",
      about: "Alessandro Michele's show was titled “The Alchemist's Garden: an anti-modern laboratory,” and was the first time Gucci showed menswear and womenswear together. Florals, tweed, bows and parasols piled up, with a rocker edge underneath.",
      read: { key: "maxi", fit: "strong" } },
    { brand: "Balenciaga", show: "Spring/Summer 2018", q: "Q3 2017", file: "2017-balenciaga.jpg", credit: "", led: "clothes",
      alt: "Model in a belted beige trench coat with strong shoulders and tan leather boots",
      look: "A belted stone-coloured trench with exaggerated, padded shoulders over a black pleated top, worn with tall cognac boots with square toes and oversized grey disc earrings, all on a plain white runway.",
      about: "Demna Gvasalia's Spring/Summer 2018 collection reworked everyday officewear and tailoring, with tartan trousers and ironic prints. Reviewers read it as Balenciaga's tailored heritage meeting Demna's nostalgia for streetwear.",
      read: { key: "street", fit: "fair" } }
  ],
  2018: [
    { brand: "Gucci", show: "Fall/Winter 2018 · Cyborg", q: "Q2 2018", file: "2018-gucci.jpg", credit: "", led: "concept",
      alt: "Model in a houndstooth coat carrying a replica of their own head",
      look: "A long houndstooth overcoat over a striped shirt with a heavy crystal necklace, pale trousers and brown loafers. The model carries a lifelike replica of his own head in the crook of his arm.",
      about: "Titled “Cyborg,” the show was staged in a surgical operating theatre and drew on Donna Haraway's essay on cyborgs. Models carried copies of their own heads, baby dragons and reptiles, and the clothes mixed references from medieval Europe to balaclavas and logos.",
      read: { key: "maxi", fit: "fair" } }
  ],
  2019: [
    { brand: "Off-White", show: "Fall/Winter 2019", q: "Q1 2019", file: "2019-off-white.jpg", credit: "", led: "clothes",
      alt: "Model in a black graphic sweater and wide green trousers on a forest-style set",
      look: "A black knit sweater with a pixelated landscape and green OFF lettering, very wide bright-green trousers and a matching green crossbody bag, walking through a mossy forest-style set.",
      about: "Virgil Abloh's collection (the men's show was on January 16, 2019) leaned on bold graphics, oversized denim and technical fabrics, mixed with sleeker tailoring. Abloh said streetwear, the car he rode in on, had become commonplace, and the show added sleek tailoring and minimalism.",
      read: { key: "street", fit: "strong" } }
  ],
  2020: [
    // matched to the Fall/Winter 2020 show (mint-green runway around a glass carousel, February 19, 2020);
    // Gucci held no live runway in Q3 2020, so this is the last one before that quarter
    { brand: "Gucci", show: "Fall/Winter 2020 · The Ritual", q: "Q3 2020", file: "2020-gucci.jpg", credit: "", led: "concept", alt: "cottage",
      alt: "Model in an orange double-breasted coat, striped top, wide blue jeans and a green beanie on a mint runway",
      look: "A long peach double-breasted coat with gold buttons over a red and white striped top, wide-leg blue jeans with a Gucci label sewn on the hem, and a bright green beanie, on a mint-green runway.",
      about: "Michele called the show “The Ritual.” Guests walked in through a backstage door, and models were dressed on a rotating glass-walled platform before walking the runway around it. The clothes ran from ruffled Victorian dresses to seventies suits with flared trousers. It was shown in Milan on February 19, 2020; Gucci's next collection, Epilogue, was a 12-hour livestream in July.",
      read: { key: "maxi", fit: "fair" } }
  ],
  2021: [
    { brand: "Gucci", show: "Fall/Winter 2021 · Aria", q: "Q1–Q2 2021", file: "2021-gucci.jpg", credit: "", led: "concept",
      alt: "Model in a red velvet suit and light-blue shirt on a mirrored runway",
      look: "A red velvet suit with sharp padded shoulders and flared trousers, a pale blue shirt, and a black leather choker and harness with a horsebit buckle, with amber sunglasses, on a mirrored runway lined with stage lights.",
      about: "Aria, released as a film on April 15, 2021, opened Gucci's 100th-anniversary year. It mixed horse-riding references and Tom Ford-era sex appeal, including a red velvet suit inspired by Tom Ford's Fall/Winter 1996 Gucci, with pieces reworked from Balenciaga.",
      read: { key: "y2k", fit: "loose" } },
    { brand: "Balenciaga", show: "Fall 2021 Couture", q: "Q3 2021", file: null, credit: "", alt: "", look: "", read: null }
  ],
  2022: [
    { brand: "Gucci", show: "Resort 2023 · Cosmogonie", q: "Q2 2022", file: "2022-gucci.jpg", credit: "", led: "concept",
      alt: "Model in an oversized black blazer and wide black trousers holding a quilted bag, against a black digital grid",
      look: "An oversized black blazer with soft, dropped shoulders over a dark top and wide-leg black trousers, with gold earrings and a dark quilted bag held at her side. She is shown against a black grid with a pavement-style floor tile.",
      about: "Cosmogonie, the Resort 2023 show on May 16, 2022, was staged at Castel del Monte, a 13th-century castle in Puglia, on the night of a lunar eclipse. Alessandro Michele sent out 101 looks inspired by Walter Benjamin's idea of history as a constellation, with crystal-covered gowns that read as night skies and, unusually for Gucci, the logos and lettering dropped.",
      read: { key: "maxi", fit: "fair" } }
  ],
  2023: [
    { brand: "Prada", show: "Fall/Winter 2023", q: "Q1 2023", file: "2023-prada.jpg", credit: "", led: "clothes",
      alt: "Model in an oversized black coat and grey knit over a white skirt with fabric flowers at the hem",
      look: "An oversized black wool coat worn open over a plain grey knit, with a full white satin skirt whose hem is covered in three-dimensional fabric flowers, and pointed white shoes, against orange columns.",
      about: "Shown in Milan in February 2023, Miuccia Prada and Raf Simons pared the season back to essentials and reworked humble uniforms into a kind of capsule wardrobe. Romantic touches, such as skirts bloomed with fabric flowers, broke through an otherwise austere collection.",
      read: { key: "quiet", fit: "strong" } }
  ],
  2024: [
    { brand: "Miu Miu", show: "Fall/Winter 2024", q: "Q1 2024", file: "2024-miu-miu.jpg", credit: "", led: "clothes", alt: "coquette",
      alt: "Model in a pale blue sleeveless dress with a pearl necklace, a black croc glove and a black bag",
      look: "A pale blue sleeveless scoop-neck dress with a raw hem, a pearl necklace and wraparound sunglasses, with one long black crocodile-embossed glove, a slouchy black leather bag and black Mary Jane heels.",
      about: "Shown in Paris on March 5, 2024, the collection followed clothes through the stages of a life, from childhood to maturity. Classic pieces such as little black dresses, pearls and luncheon suits were recombined in unexpected ways, with a preppy, schoolgirl streak.",
      read: { key: "quiet", fit: "fair" } }
  ],
  2025: [
    { brand: "Saint Laurent", show: "Spring/Summer 2025", q: "Q3 2025", file: "2025-saint-laurent.jpg", credit: "", led: "clothes",
      alt: "Model in an olive-green taffeta gown with huge puffed sleeves and tiered ruffles, in front of white hydrangeas",
      look: "A floor-length gown in olive-chartreuse taffeta with enormous puffed sleeves, a sheer pleated bodice with a ruffled high neck, tiered ruffles down the skirt to a trailing hem, large crystal drop earrings and black shoes, on a sand-coloured runway lined with white hydrangeas.",
      about: "Shown on September 29, 2025 in the Trocadéro gardens in Paris, with the Eiffel Tower lit behind the runway. Anthony Vaccarello paired 80s power dressing, with big shoulders, leather and sharp tailoring, against sheer, billowing evening gowns, and described the Saint Laurent woman as a “louche aristocrat.”",
      read: { key: null, text: "Power dressing and Gilded Age drama, outside our aesthetics" } }
  ]
};

/* Every show studied for the project: [brand, show, month shown, concept or clothes, closest aesthetic, a looser aesthetic].
   concept = the staging was the headline idea, clothes = the clothes were. Drives the three-eras timeline (js/eras.js).
   Our reading of published reviews, not a measurement. */
const SHOWS = [
  ["Gucci", "Fall/Winter 2017", "2017-02", "concept", "maxi", null], ["Balenciaga", "Spring/Summer 2018", "2017-06", "clothes", "street", null],
  ["Gucci", "Fall/Winter 2018 · Cyborg", "2018-02", "concept", "maxi", null], ["Balenciaga", "Fall/Winter 2018", "2018-03", "clothes", "street", "gorp"],
  ["Off-White", "Fall/Winter 2019", "2019-01", "clothes", "street", null], ["Off-White", "Spring/Summer 2020", "2019-06", "clothes", "street", null],
  ["Off-White", "Fall/Winter 2020", "2020-01", "clothes", "street", null], ["Gucci", "Fall/Winter 2020 · The Ritual", "2020-02", "concept", "maxi", "cottage"],
  ["Gucci", "Epilogue (Resort 2021)", "2020-07", "concept", "maxi", null], ["Gucci", "Spring/Summer 2021", "2020-11", "concept", "maxi", null],
  ["Gucci", "Aria (Fall 2021)", "2021-04", "concept", "maxi", null], ["Balenciaga", "Fall 2021 Couture", "2021-07", "clothes", null, null],
  ["Balenciaga", "Spring/Summer 2022 · The Simpsons", "2021-10", "concept", "street", null], ["Balenciaga", "Fall/Winter 2022", "2022-03", "concept", null, "gorp"],
  ["Gucci", "Cosmogonie (Resort 2023)", "2022-05", "concept", "maxi", null], ["Prada", "Spring/Summer 2023", "2022-09", "clothes", "quiet", null],
  ["Gucci", "Spring/Summer 2023 · Twinsburg", "2022-09", "concept", "maxi", null], ["Prada", "Fall/Winter 2023", "2023-02", "clothes", "quiet", null],
  ["Miu Miu", "Fall/Winter 2024", "2024-03", "clothes", "quiet", "coquette"], ["Miu Miu", "Spring/Summer 2025", "2024-10", "clothes", "coquette", null],
  ["Saint Laurent", "Spring/Summer 2026", "2025-09", "clothes", null, null]
];

/* Era-level readings for brands we did not study show by show: [brand, from year, to year, closest aesthetic, a looser aesthetic, what the reading rests on].
   Each is our reading of reviews of one or two representative shows from that designer's era (Versace Spring 2019 and 2024, Moncler Genius,
   Bottega Veneta under Daniel Lee and Matthieu Blazy, Loewe Fall 2021 to Spring 2025, Jacquemus 2020 to 2024, Dior Fall 2022 to Fall 2023,
   Valentino 2022 to 2024, Burberry Fall 2023, and one or two shows each for Fendi, Givenchy, Dolce & Gabbana, Louis Vuitton, Vetements, Balmain, Alexander McQueen,
   Diesel, The Row, Coach, Alaïa, JW Anderson, Ralph Lauren, Chloé, Palm Angels and Rick Owens; also the years between studied shows for Gucci, Balenciaga, Prada,
   Saint Laurent, Miu Miu, Off-White). Looser than the show-level coding above, and shown as such. Used only when SHOWS has nothing for that brand and year. */
const BRAND_ERAS = [
  ["Versace", 2018, 2022, "maxi", "y2k", "clashing archive prints, rave colours and 90s silhouettes"],
  ["Versace", 2023, 2023, "quiet", "coquette", "a turn to tailored minimalism and girlish pastels (Spring 2024)"],
  ["Moncler", 2018, 2025, "gorp", "street", "technical puffers and outerwear, with Genius collaborations by streetwear designers"],
  ["Bottega Veneta", 2019, 2021, null, "street", "Daniel Lee era: bold, street-smart intrecciato and rave boots"],
  ["Bottega Veneta", 2022, 2024, "quiet", "street", "Matthieu Blazy era: minimalism and understated craft, with some grunge"],
  ["Loewe", 2019, 2022, null, "maxi", "Jonathan Anderson: playful, surreal, oversized craft"],
  ["Loewe", 2023, 2024, null, "quiet", "Anderson's reductive, understated everyday clothes"],
  ["Jacquemus", 2020, 2021, null, "cottage", "pastoral Provence: lavender-field and wheat-field shows"],
  ["Jacquemus", 2022, 2025, null, "quiet", "pared-down, natural-fibre minimalism with French romance"],
  ["Dior", 2022, 2022, null, "gorp", "Fall 2022: tactical, utility pieces beside romantic lace"],
  ["Dior", 2022, 2022, null, "cottage", "Spring 2023: meadow florals and a yearning for simpler times"],
  ["Dior", 2023, 2023, null, "quiet", "Fall 2023: relaxed shirts and pencil skirts, an austere Parisian"],
  ["Valentino", 2022, 2022, null, "maxi", "Pink PP: a whole collection in one colour"],
  ["Valentino", 2023, 2024, null, "quiet", "Piccioli's honest, simple clothes, then an all-black collection"],
  ["Burberry", 2023, 2025, "gorp", "street", "Daniel Lee era: outdoors heritage, wellies and camo parkas, with a streetwear lean"],
  ["Fendi", 2017, 2020, null, "street", "Lagerfeld-era logomania: the double-F logo on everything, worn by street-style stars"],
  ["Fendi", 2021, 2023, null, "quiet", "Kim Jones era: functional utility with everyday femininity, in neutral earth tones"],
  ["Fendi", 2022, 2023, "y2k", null, "Spring 2023: the youthful spirit of Y2K for a sophisticated woman, with the Baguette revived"],
  ["Givenchy", 2017, 2020, null, "quiet", "Clare Waight Keller era: understated, feminine tailoring"],
  ["Givenchy", 2021, 2021, null, "street", "Matthew Williams era: bold hardware, slick tailoring and exaggerated proportions from his ALYX label"],
  ["Givenchy", 2021, 2021, null, "gorp", "Fall 2021: weatherproof outerwear beside revealing eveningwear"],
  ["Dolce & Gabbana", 2021, 2022, "y2k", null, "a pivot to a younger audience: the 1990 to 2010 archive revived with sparkle, sequins and graffiti prints"],
  ["Dolce & Gabbana", 2023, 2024, null, "quiet", "monochrome black tailoring and refined silhouettes (Spring 2024)"],
  ["Louis Vuitton", 2021, 2021, null, "street", "Virgil Abloh's menswear era (to Nov 2021): streetwear meets luxury"],
  ["Louis Vuitton", 2022, 2022, null, "maxi", "Ghesquière's women's shows: elemental maximalism and directional detail (men's had no creative director)"],
  ["Louis Vuitton", 2023, 2023, "quiet", null, "Ghesquière's Fall 2023: classic wearable tailoring that echoed quiet luxury"],
  ["Louis Vuitton", 2023, 2024, null, "street", "Pharrell Williams' men's debut: Canal Street colour, workwear and spectacle"],
  ["Vetements", 2017, 2020, "street", null, "oversized hoodies, logo prints and baggy workwear: a streetwear label"],
  ["Balmain", 2019, 2021, "maxi", "y2k", "ornate, body-hugging glamour in jewel tones, with a 90s pop influence"],
  ["Alexander McQueen", 2019, 2022, null, "academia", "Sarah Burton's Victorian-gothic romanticism and British tailoring"],
  ["Alexander McQueen", 2020, 2020, null, "cottage", "Fall 2020: Welsh folklore, quilting and patchwork craft"],
  ["Diesel", 2022, 2024, "y2k", null, "Glenn Martens' low-rise denim and crop tops: an ode to the Y2K era"],
  ["The Row", 2023, 2024, "quiet", null, "the original quiet-luxury label: clean tailoring and understated essentials"],
  ["The Row", 2025, 2025, null, "maxi", "Spring 2026: feathers, sequins and volume, a break from quiet luxury"],
  ["Coach", 2022, 2025, null, null, "Stuart Vevers' modern Americana: New York classics and 90s nostalgia, worn-in and re-loved"],
  ["Coach", 2024, 2024, null, "coquette", "Fall 2024: romantic, with bows, pink and lilac taffeta and 90s nostalgia"],
  ["Alaïa", 2024, 2025, null, null, "Pieter Mulier: sculptural, body-shaping clothes shown as art and architecture"],
  ["JW Anderson", 2023, 2024, null, "maxi", "Jonathan Anderson's playful, sculptural shapes, from plasticine hoodies to feathered bombers"],
  ["Ralph Lauren", 2024, 2025, "quiet", null, "preppy classics, tailoring and understated glamour: the label that long predates quiet luxury"],
  ["Chloé", 2024, 2025, null, "coquette", "Chemena Kamali: romantic boho-chic with sheer lace, ruffles and 70s nostalgia"],
  ["Palm Angels", 2019, 2019, "street", null, "skate- and club-culture streetwear: tracksuits and graphic tees, with tailored utility in Fall 2019"],
  ["Rick Owens", 2020, 2022, null, null, "gothic, draped avant-garde drama"],
  ["Prada", 2017, 2021, null, null, "Miuccia Prada's intellectual, nylon-and-utility ugly chic; from 2020 with Raf Simons"],
  ["Prada", 2024, 2025, null, null, "Prada and Simons: archive pieces and eccentric individual styles, an anti-algorithm plurality and not one look"],
  ["Saint Laurent", 2017, 2024, null, null, "Anthony Vaccarello: 80s-style power tailoring and sensual, rock-edged glamour"],
  ["Saint Laurent", 2022, 2023, null, "quiet", "Fall 2022 and Fall 2023: pared-back, nearly all-black tailoring that reviews called quietly chic and minimal"],
  ["Gucci", 2019, 2019, "maxi", null, "Alessandro Michele's eclectic, maximalist Gucci (the same direction as the 2017 to 2022 shows studied)"],
  ["Gucci", 2023, 2025, "quiet", null, "Sabato De Sarno's Ancora era: pared-back cuts and timeless elegance after Michele's excess, described as playing into quiet luxury"],
  ["Balenciaga", 2019, 2020, "street", null, "Demna's Balenciaga: parkas, sweats, tees, jeans, logomania and the Triple S sneaker"],
  ["Balenciaga", 2023, 2024, null, "street", "Demna's later shows: greatest hits (giant sneakers, spandex gowns) and an eBay-thrift Fall 2024"],
  ["Balenciaga", 2025, 2025, null, "quiet", "Pierpaolo Piccioli's debut (shown Oct 2025): couture purity and restraint, with traces of Demna"],
  ["Miu Miu", 2021, 2023, "y2k", null, "Miuccia Prada's micro-mini and low-rise revival: an early-aughts, distressed prep-school look"],
  ["Miu Miu", 2021, 2021, null, "academia", "Spring 2022: a distressed prep-school take on American preppy"],
  ["Off-White", 2017, 2018, "street", null, "Virgil Abloh's streetwear-meets-luxury label (the same direction as the 2019 to 2020 shows studied)"],
  ["Off-White", 2021, 2022, null, "street", "after Abloh's death in Nov 2021 the label carried on his streetwear codes"],
  ["Valentino", 2017, 2021, null, null, "Pierpaolo Piccioli: romantic couture and bold colour"],
  ["Valentino", 2025, 2025, null, "maxi", "Alessandro Michele's Valentino: romantic maximalism, as at Gucci"],
  ["Burberry", 2018, 2020, "street", null, "Riccardo Tisci's Burberry: heavily branded streetwear, the TB monogram and sporty polos with corsets (Fall 2019)"],
  ["Burberry", 2020, 2020, null, "cottage", "Spring 2021: regeneration and blooming nature"],
  ["Burberry", 2021, 2022, null, null, "Tisci's last seasons: feminine armour, nature and explorers, a label still searching for a voice"],
  ["Versace", 2024, 2025, "maxi", "y2k", "back to the label's rebellious, print-heavy glamour after a quieter Spring 2024"],
  ["Dolce & Gabbana", 2018, 2019, "maxi", null, "ornate Sicilian signatures: lace, brocade, florals, sequins and baroque prints (Spring and Fall 2019)"],
  ["COS", 2024, 2025, "quiet", null, "architectural minimalism in refined, neutral tailoring, shown on the runway at New York Fashion Week"],
  ["Dior", 2021, 2021, null, "academia", "Fall 2021: a moodier, dark-toned fairy-tale collection and a tweed couture show (Spring 2022 turned to bright 60s mod)"],
  ["Loewe", 2025, 2025, null, "quiet", "Fall 2025, Anderson's last: a stark, restrained scrapbook shown on mannequins; Spring 2026 (McCollough and Hernandez's debut) turned to colour and bolder essentials"],
  ["Miu Miu", 2025, 2025, null, null, "Fall 2025: a grown-up take on girlish rebellion; Spring 2026 'At Work': aprons, housecoats and workwear"],
  ["Bottega Veneta", 2025, 2025, null, null, "Louise Trotter's debut (Spring 2026): soft functionality, colour and movement, billed by one outlet as waving goodbye to quiet luxury"],
  ["Totême", 2024, 2025, "quiet", null, "Scandinavian minimalism: a monochrome, sophisticated city uniform (Spring and Fall 2025)"],
  ["Raf Simons", 2017, 2020, "street", null, "youth-culture menswear: oversized knits, graphic tees and lab coats, with adidas and Fred Perry collaborations"],
  ["Moschino", 2019, 2019, "maxi", null, "Jeremy Scott's camp and kitsch: a game-show set, a circus, retro couture and logo sweats"],
  ["Y-3", 2017, 2017, "street", null, "Yohji Yamamoto and adidas fashion sportswear, billed as a modern street uniform"],
  ["Acne Studios", 2019, 2019, null, null, "Fall 2019: youthful power tailoring beside imagined counter-cultures"],
  ["Thom Browne", 2020, 2020, null, "maxi", "theatrical runway productions: Marie Antoinette and punk, Noah's ark, a snowy wonderland"],
  ["Marine Serre", 2020, 2020, null, null, "post-apocalyptic survival wear from upcycled fabric, with crescent-moon prints and face masks"],
  ["Ferragamo", 2023, 2023, null, "quiet", "Maximilian Davis: sleek tailoring and clean classics with old-Hollywood glamour (Fall 2023), though he rejects the 'minimalist' label"],
  ["Victoria Beckham", 2024, 2025, "quiet", null, "sleek, deconstructed tailoring and minimalist dresses, described as understated luxury"]
];

/* Brands that do not stage runway shows, so there is nothing to compare with the year's look. The Hot 20 draws them with a dashed
   outline and "doesn't have a runway" in the tooltip, not as "not assessed". To mark another brand, add it here with a few words on why. */
const NO_RUNWAY = {
  "Nike": "a sportswear brand", "Adidas": "a sportswear brand", "New Balance": "a sportswear brand", "On": "a sportswear brand",
  "UGG": "a footwear brand", "Birkenstock": "a footwear brand", "Dr Martens": "a footwear brand",
  "Canada Goose": "an outerwear brand that does not stage runway shows", "Stone Island": "a label that does not stage runway shows",
  "Skims": "a shapewear and loungewear brand that does not stage runway shows", "Massimo Dutti": "a high-street brand that does not stage runway shows",
  "Yeezy": "a sneaker-led label that released its clothes through lookbooks and private appointments, not runway shows, in the years it charted",
  "Fear of God": "a label that released its 2020 collection as a lookbook, with its first runway show years later"
};

/* Did a brand's runway match the year's look? Looks at the shows we studied from that brand in that year.
   Returns { s: "yes" | "part" | "no" | "na" | "none", shows: [names of the shows behind a yes or part] }; "na" = no show studied that year, "none" = the brand has no runway (NO_RUNWAY). */
function brandYearVerdict(brand, year, look) {
  if (NO_RUNWAY[brand]) return { s: "none", shows: [NO_RUNWAY[brand]] };
  if (!look) return { s: "na", shows: [] };
  const sh = SHOWS.filter(x => x[0] === brand && +x[2].slice(0, 4) === year);
  const pick = (rows, nameOf) => {       // rows are [.., read, alt] with read and alt at the given indexes
    const yes = rows.filter(x => x.read && x.read === look), part = rows.filter(x => !(x.read && x.read === look) && x.alt && x.alt === look);
    return yes.length ? { s: "yes", shows: yes.map(nameOf) } : part.length ? { s: "part", shows: part.map(nameOf) } : { s: "no", shows: rows.map(nameOf) };
  };
  if (sh.length) return pick(sh.map(x => ({ read: x[4], alt: x[5], name: x[1] })), x => x.name);
  const er = BRAND_ERAS.filter(x => x[0] === brand && year >= x[1] && year <= x[2]);
  if (!er.length) return { s: "na", shows: [] };
  const v = pick(er.map(x => ({ read: x[3], alt: x[4], name: x[5] })), x => x.name);
  return { ...v, era: true };
}

const rwEsc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
function rwReadHTML(e) {
  if (e.read && e.read.key) return '<span class="rw-read"><i style="--c:' + colorOf(e.read.key) + '"></i><span>Closest aesthetic: ' + nameOf(e.read.key) + " · " + e.read.fit + " fit</span></span>";
  if (e.read) return '<span class="rw-read"><i class="none"></i><span>' + rwEsc(e.read.text) + "</span></span>";
  return "";
}

/* Small chips under each runway photo and in its panel. ctx = { look: the year's look, prev: last year's five fastest-rising
   brand searches (null for the first year), tracked: brands that have a search series } */
let RW_CTX = null;
function rwChipsHTML(e, ctx) {
  if (!ctx) return "";
  const out = [];
  if (e.led) out.push('<span class="rw-chip"><i class="led ' + e.led + '"></i>' + (e.led === "concept" ? "Concept-led" : "Clothes-led") + "</span>");
  if (ctx.prev && ctx.tracked && ctx.tracked.has(e.brand)) {
    const up = ctx.prev.includes(e.brand);
    out.push('<span class="rw-chip ' + (up ? "up" : "") + '">' + (up ? "Rising in search last year" : "Not rising in search last year") + "</span>");
  }
  const k = e.read && e.read.key;
  const m = k && k === ctx.look ? "yes" : (e.alt && e.alt === ctx.look ? "part" : "no");
  out.push('<span class="rw-chip m-' + m + '">' + (m === "yes" ? "Matches the year's look" : m === "part" ? "Partly matches the year's look" : "Doesn't match the year's look") + "</span>");
  return '<span class="rw-chips">' + out.join("") + "</span>";
}

/* Markup for the photos of a year, or null when there is no photo yet (the spread then keeps its look cutout). */
function runwayHTML(y, ctx) {
  RW_CTX = ctx || null;
  const list = (RUNWAY[y] || []).filter(e => e.file);
  if (!list.length) return null;
  const html = list.map((e, i) =>
    '<figure class="rw-fig">' + (e.about
      ? '<button type="button" class="rw-open" data-i="' + i + '" aria-label="Read about the ' + rwEsc(e.brand) + ' show">'
      : '<div class="rw-open static">') +
    '<img src="assets/runway/' + rwEsc(e.file) + '" alt="' + rwEsc(e.alt + ", " + e.brand + (e.show ? " " + e.show : "")) + '">' + (e.about ? '<span class="rw-plus" aria-hidden="true">+</span></button>' : "</div>") +
    '<figcaption class="rw-cap"><b>' + rwEsc(e.brand) + '</b><span class="rw-show">' + (e.show ? rwEsc(e.show) + " · " : "") + "#1 in " + rwEsc(e.q) + "</span>" + rwReadHTML(e) + rwChipsHTML(e, ctx) +
    '<span class="rw-credit">Photo courtesy of ' + rwEsc(e.credit || e.brand) + "</span>" + "</figcaption></figure>").join("");
  return { html, n: list.length };
}

/* Click a photo: a panel describing the show. */
(function runwayPanel() {
  const modal = document.createElement("div");
  modal.className = "rw-modal"; modal.hidden = true;
  modal.setAttribute("role", "dialog"); modal.setAttribute("aria-modal", "true"); modal.setAttribute("aria-labelledby", "rwmTitle");
  modal.innerHTML = '<div class="rw-panel"><button type="button" class="rw-close" aria-label="Close">×</button><div class="rw-pimg"><img alt="Runway look" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="></div><div class="rw-ptext"></div></div>';
  document.body.appendChild(modal);
  let opener = null;
  const close = () => { modal.hidden = true; document.body.classList.remove("rw-lock"); if (opener) opener.focus(); };
  function open(e, btn) {
    opener = btn;
    const img = modal.querySelector(".rw-pimg img"); img.src = "assets/runway/" + e.file; img.alt = e.alt;
    modal.querySelector(".rw-ptext").innerHTML =
      '<div class="rw-show">' + (e.show ? rwEsc(e.show) + " · " : "") + "#1 on Lyst in " + rwEsc(e.q) + "</div>" +
      '<h4 id="rwmTitle">' + rwEsc(e.brand) + "</h4>" +
      '<div class="rw-k">About the show</div><p>' + rwEsc(e.about) + "</p>" +
      rwReadHTML(e) + rwChipsHTML(e, RW_CTX) + '<div class="rw-credit">Photo courtesy of ' + rwEsc(e.credit || e.brand) + "</div>";
    modal.hidden = false; document.body.classList.add("rw-lock");
    modal.querySelector(".rw-close").focus();
  }
  document.getElementById("spPhoto").addEventListener("click", ev => {
    const btn = ev.target.closest(".rw-open"); if (!btn) return;
    const y = +document.getElementById("spYear").textContent;
    const e = (RUNWAY[y] || []).filter(x => x.file)[+btn.dataset.i];
    if (e) open(e, btn);
  });
  modal.addEventListener("click", ev => { if (ev.target === modal || ev.target.closest(".rw-close")) close(); });
  document.addEventListener("keydown", ev => { if (ev.key === "Escape" && !modal.hidden) close(); });
})();
