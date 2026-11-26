# What changed: from the initial prototype to Prototype III

*Enter the Aesthetic (formerly Enter the Wardrobe): Fashion Trend Cycle (CS 1710), Milestone 11. Compared against the prototype we uploaded at the start of this work session (`fashion-trends-prototype-II_5.zip`).*

**Team members:** *(list every student who actively worked on this submission here, as the milestone requires)*

---

## Fig. 8 simplified to match the team's mockup (26 Nov 2026)

- **2020–2025 only, two eras** (Concept 2020–22, Clothes-led 2023–25), **two rows** (the year's look, the runway shows). The streetwear-share row, the #1-on-Lyst row and the 2017–19 streetwear era are gone; streetwear's fall is Fig. 1 and the #1 brands are in the year-in-review and the hot 20.
- **Title** "Since 2020, only 2 of 15 shows matched the year's look" (the mockup said "After 2020", but the 15 shows include 2020's), subtitle "Shows by Lyst's #1 brands, 2020–2025", how-to "Hover a dot for the show.", the legend above the chart, one caption per era ("8 of 11 shows were spectacle (a livestream, a film, The Simpsons). None fully matched." / "Clothes-led again; 2 of 4 matched (Prada, Miu Miu).") and one footnote ("Labels and eras are our reading of reviews."). All counts are computed.
- **The one-show walkthrough box and the finding paragraph above the card are gone.** To keep the teacher's "one runway before all of them", the chart now does what Figs. 5 and 6 do: the first time it comes into view, only Prada Fall/Winter 2023 is lit, with a two-line note beside it ("Example · Prada, Feb 2023 / Clothes-led; the ring: it matched Quiet Luxury"). After about 4.5 s every show appears. Hovering the chart ends it early.
- Shows within about a month of each other now stack instead of overlapping (Off-White and Gucci in early 2020).
- **Closing takeaway** now counts the same years as Fig. 8: "Since 2020, 2 of 7 clothes-led shows matched the year's look; none of the 8 concept-led shows did."

## Fig. 5 centre label no longer overlaps (26 Nov 2026)

- The "≈20 median months" label in the middle of the ring ran into the innermost arc (Coquette). The arcs are now spaced 14 apart instead of 18, so the innermost sits at radius 56, not 24. The label is a little smaller and stacked on two lines ("≈20 / MEDIAN / MONTHS", or "2 / MONTHS / ON TOP" when one aesthetic is picked), so it fits inside with room to spare.

## Colours re-picked (26 Nov 2026)

The teacher noted some colours were similar. We measured it: with the old muted set, 7 of the 28 pairs were hard to tell apart even with full colour vision. The worst were Quiet Luxury blue and Cottagecore teal (OKLab ΔE 8.8; the floor is 15), and Quiet Luxury and Gorpcore green (10.0). Under colour-blind simulation, Quiet Luxury and Y2K nearly merged (ΔE 2.2). Four of the colours were also so muted they read as greyish.

New set, with each aesthetic kept in its own colour family:

| Aesthetic | Old | New |
|---|---|---|
| Streetwear | `#CC623E` | `#D85218` orange |
| Quiet Luxury | `#497C9C` | `#2762BD` blue |
| Gorpcore | `#44765B` | `#1B8E51` green |
| Y2K | `#CB648E` | `#B8338A` magenta |
| Coquette | `#9475B5` | `#9680F2` lavender |
| Dark Academia | `#574052` | `#823A25` oxblood brown |
| Cottagecore | `#369894` | `#28B9C4` aqua |
| Maximalism | `#BD922F` | `#C1A233` gold |

How they were chosen: a search over each aesthetic's colour family (hue, lightness and saturation ranges) that maximised the closest pair, then a check with a colour-palette validator. Because all eight lines cross on the timeline and the clock and any two countries can touch on the map, **every** pair was tested, not just legend neighbours. Results: closest pair ΔE 18.2 for full colour vision (was 8.8, floor 15) and 8.6 under protanopia/deuteranopia simulation (was 2.2, target 8). All eight sit inside the lightness band and above the saturation floor. Coquette, Cottagecore and Maximalism are lighter than 3:1 against the page, which the method allows only when colours are also named, and every chart does that (legend, chips, end labels, tooltips). Text on coloured blocks still switches between white and dark automatically.

## Two kinds of show, a takeaway that includes luxury, and the top 10 → top 20 note (26 Nov 2026)

- **"Two kinds of show" is now its own block**, before the three-eras timeline and outside the chart. It opens with a short lead line, "We noticed the big luxury shows came in two kinds.", then the four runway photos under the matching filled or hollow dot: Gucci 2018 Cyborg and Gucci 2021 Aria (concept-led), Balenciaga 2017 and Prada 2023 (clothes-led). Captions are just brand, year and show name. **Hover, tap or tab to a photo** for the full story: why it got its label in one line, plus the show description already used in the year-in-review panel (built from `RUNWAY` in `js/runway.js`). Fig. 8 now opens straight on its one-show walkthrough.
- **The closing takeaway now ties in luxury design.** It was only about search. It now reads "Aesthetics now move in waves, each on top for about 20 months. Luxury runways kept up only when the show was about the clothes.", with a smaller line underneath: "New looks broke out in 2020, 2022 and 2023. 5 of 11 clothes-led shows matched the year's look; none of the 10 concept-led shows did." It is computed in `js/eras.js` from the same show coding as Fig. 8, and the luxury sentence only appears while clothes-led shows match more often than concept-led ones.
- **Top 10 → top 20 note on the hot 20.** While the chart shows a 2017–18 quarter, the empty rows say "Lyst only published a top 10 until the end of 2018. From 2019 on, its list has 20 brands." The slider has a "Top 10 | Top 20" marker where the list grows, and the subtitle says "(a top 10 until 2018)". In Q1 2019, rows 11–20 are no longer tagged NEW, since they only appear because the list got longer.

## One example first on Figs. 5 and 6 (26 Nov 2026)

- **Brings back the teacher's "one example first" note on the ring and the clock, while keeping the key and the All-then-filter setup.** The first time each chart comes into view, it shows one aesthetic on its own: Cottagecore on the ring (it has the whole life cycle) and Coquette on the clock (the most seasonal). The panel shows that aesthetic's numbers with an "Example" tag and a short progress bar, then the chart opens up to all eight by itself (about 4.5 s and 4 s). Clicking a chip or hovering an arc ends the example early. It plays once per page load (`introDemo` in `js/core.js`).
- With Fig. 8's one-show walkthrough, all three new chart forms now open on one example before showing everything.

## Filter instead of tables on Figs. 5 and 6 (26 Nov 2026)

- **Tables removed** under the ring and the clock.
- **See all, then filter down.** Both charts now have a chip row that starts on **All**. Pick one aesthetic and the chart isolates it, and a panel under the chart shows its numbers: broke out, peaked and months on top for the ring; best month, quietest month and swing for the clock. The ring's centre switches from the median to that aesthetic's months. Hovering an arc previews it. **All**, or scrolling away, resets the chart.
- The same **All** chip is now on the timeline's filter (Fig. 2) too, so every filter works the same way (`chips` / `filterPanel` in `js/core.js`).

## Runway photos as examples of concept-led vs clothes-led (26 Nov 2026; later moved into its own block, see above)

- **Photo key in Fig. 8**, next to the one-show walkthrough. Two runway photos for each label, from our own photos. Concept-led: Gucci 2018 "Cyborg" (models carried copies of their own heads) and Gucci 2021 Aria (a mirrored-tunnel set). Clothes-led: Balenciaga 2017 (tailoring on a plain runway) and Prada 2023 (pared-back pieces; also the walkthrough's show). Each half shows the matching filled or hollow dot from the chart, so the photos teach how to read the dots. It stacks under the walkthrough on a phone.
- **Hover definitions show a photo too.** The concept-led and clothes-led tooltips now carry a thumbnail (Gucci 2018 and Prada 2023), and their example text now names those same shows (`TERMS` in `js/core.js`).

## Third feedback round (26 Nov 2026): layout and transition

- **Figs. 5 and 6 side by side** in one feature ("The cycle"), each in its own card: title, key, chart, table. The old seasons section and the pull quote between them are gone. That quote's line ("And inside every year, each one has a month of its own.") is now the feature's subtitle. The nav link reads "cycle & seasons", and the shops are now Feature 04.
- **Yearly vs monthly titles:** shorter titles that open with the label and drop the extra specifics: "Yearly: a typical aesthetic stays on top for about 20 months" (Fig. 5) and "Monthly: each aesthetic has its own peak month" (Fig. 6). The median is still computed from the data.
- **A key instead of the step-by-step example** on both. Ring: small dot = broke out, big dot = peak, arc length = time on top, clockwise 2016 to 2025. Clock: dot = best month, further out = more searched, round loop = steady, loop closes = the year repeats. (Fig. 8's one-show walkthrough stays.)
- **The hot 20 moved up**, directly under the year-in-review and its slider, so it is now Fig. 7. The three-eras timeline comes after the transition as Fig. 8.
- **New transition** before the timeline: "But look deeper, and a pattern appears." (shortened to match the other transitions) The finding under it now states the pattern: 3 of 6 shows matched in 2017–19 and 2 of 4 from 2023 on, but none of 11 in 2020–22. Both lines are computed in `js/eras.js`. The transition only claims a pattern when the eras' match rates differ by at least 25 points.

## Second feedback round (26 Nov 2026): less text, runway page shows only the match

- **Condensed text.** Walkthrough notes on Figs. 5–7 cut to one short line each. Removed the long paragraphs beside the ring and the clock, since the title and the walkthrough now carry the point. Fig. 7's finding is one sentence, its era captions are one line each, and its definitions footnote is gone (the hover tooltips cover it). Every "How to" line is now one short sentence. The Hot 20 notes and the shops intro are shorter.
- **Year-in-review page: only "did the runway match the look?"** Removed the "Searches rising fastest" list, the concept-led / clothes-led chip and the "rising in search last year" chip. These are gone from the photo panel too. Each photo now shows the brand, the show, "Runway read as <aesthetic>" and the match chip. The right column shows Lyst's #1 brand and the year's look.
- Fig. 7 keeps its concept-led / clothes-led dot fill, since its title is about that, but its walkthrough now talks only about the match.

## Prototype III feedback round (26 Nov 2026)

| Feedback | What we did |
|---|---|
| Some colours are a little similar | **Kept as is** (every chart still labels its colours directly). |
| Tooltip for concept-led vs clothes-led | The terms are now underlined (with a small "?") wherever they appear: the chips under each year-in-review runway photo and in its click-open panel, the Fig. 7 era names (in the chart and in the captions under it), the Fig. 7 legend and its footnote. Hover, tap or tab to one to see a definition with an example show. "Matches the year's look" got the same treatment. Definitions live in `TERMS` in `js/core.js`; mark any element with `data-def="concept"` to reuse them. |
| Font colour and size: no grey on grey, bigger text | Grey ink darkened site-wide (`--ink-2` #4a525b → #323941, `--ink-3` #7b848d → #525a63, `--steel-2` #6f8497 → #4a6073, same in `INK` in `js/core.js`). Small text enlarged: body 15 → 16 px, "How to" lines 13 → 15, subtitles 12.5 → 14.5, mono notes and sources 9.5 → 11.5–12, chart axis and table text up 2–3 px, the zoom-in chart's labels and the Fig. 7 timeline labels redrawn larger. The ring and clock tables now highlight a row instead of fading the others. Nike's lane in Fig. 7 is darker so its white letter reads. |
| Introduce the three novel charts (e.g. talk about one runway before all of them) | Fig. 5 (trend ring), Fig. 6 (seasonal clock) and Fig. 7 (three eras) now open on **one worked example** with numbered badges on the chart and matching notes beside it, then a "Now show all" button (or the 1 / 2 tabs) reveals the full chart. Ring: Cottagecore's arc (broke out, peaked, faded). Clock: Coquette's loop (best month, quietest month, December joining January). Three eras: one show, Prada Fall/Winter 2023, read down its column (hollow dot = clothes-led, blue ring = matched, the year's look, the #1 Lyst brand that quarter, streetwear's share that year); the rest are dimmed until step 2. On a phone the timeline scrolls to that show. The examples and numbers are computed from the data (`introSteps` in `js/core.js`). |
| The circle one doesn't connect | The trend ring is now an **open ring**: a gap at 12 o'clock separates START (2016) from END (2026), with an arrowhead showing the direction, so a run that lasts to 2025 no longer appears to loop back to 2016. The seasonal clock stays closed on purpose, and its walkthrough says why (the calendar repeats; the trend timeline does not). |

## 1. At a glance

| | Initial | Now |
|---|---|---|
| Aesthetics tracked | 6 | **8** (added Cottagecore, Maximalism) |
| Features on the page | 6 (fall, evidence, cycle, seasons, platforms, shops) | **5** (platforms cut) |
| Chart cards | 11 | **8**, each numbered "Fig. 1 to 8" with a takeaway title |
| Headline number | Streetwear 97% (2019) to 73% (2025) of the six | **97% to 66%** of the eight, with a low of **46% in 2021** |
| 2020's "look" | Dark Academia | **Cottagecore** (+23.5 points) |
| Runway material | none | 10 runway photos, 21 shows studied, 40 brands judged against each year's look (all of the top 20 from 2017 to 2025) |
| Country zoom-in | 3 countries (US, Chile, India) | **Any of 59 countries** with data, by era |
| Transitions | 5 | 5 (2 reworded, 1 added, 1 removed with the platforms feature, 2 unchanged) |
| Files | | 17 added (plus this change log), 2 removed, 23 changed |

**The story, in one paragraph.** Streetwear used to be almost every search for these aesthetics, and by 2020 searches spread across many named aesthetics. We then asked whether the biggest fashion brands were showing those aesthetics on the runway. Mostly they were not: in 2020 to 2022, none of the 11 shows we studied matched the year's look, and 8 of the 11 were staged spectacle (a livestream, a film, twins, The Simpsons). Runway and search matched more often when the shows were about the clothes (5 of 11 shows) than when they were about the staging (0 of 10). We can show that pattern; we cannot show that one caused the other.

---

## 2. Feedback from the think-aloud study (Milestone 10) and what we did

| Feedback | Source | What we did |
|---|---|---|
| "Wardrobe" (now "Aesthetic") wordmark and italic transition lines hard to read | Lorena | Wordmark heavier with a soft shadow; transition quotes and cover-line figures changed from italic serif to upright Jost. **Done** |
| Opening chart too small | Lorena | Thesis chart now spans the full width with taller bars and bigger labels. **Done** |
| Selected era on the "When" timeline too pale | Lorena | Now a dark, outlined band; helper text says "shaded era = what the map shows". **Done** |
| Clicking an outlined country to zoom was confusing (only three countries) | Lorena | Any country with data can be clicked; an A to Z menu is also offered; the chosen country is outlined. **Done, and went further than asked** |
| Hot 20 moves too fast | Lorena, Marco and Helen | 2.4 seconds per quarter (was 1.1), with slower row moves. **Done** |
| Lyst colours had no clear meaning | Lorena, Marco and Helen | Replaced with a key and a meaning: bars are highlighted when the brand's runway matched the year's look. **Done** |
| Each brand in the Hot 20 should have its own colour | Marco and Helen | **Not done**: eight more hues would clash with the aesthetic colours, and the brand's name is already on each row. |
| Too many visualizations, some irrelevant (Google vs YouTube) | Marco and Helen | Platforms feature cut, then the shop view, the full data tables and Brands per look. **Done** |
| Clicking on the last chart changed nothing | Marco and Helen | Fixed, then the chart was removed with the data tables. **Done** |
| Unclear what the points on the trend ring mean | Marco and Helen | Legend added under the ring. **Done** |
| Add "why it matters" so every insight ties back to the trend cycle | Our own write-up | Takeaway titles on every chart, a "How to" line on every chart, era captions and a tie transition. **Done** |

---

## 3. Structure and storytelling

- **Takeaway titles.** Every chart title now states its finding, with the old label kept as a small subtitle (for example the thesis chart: "Streetwear used to be almost every search. By 2025, 34 in every 100 went to other aesthetics."). Titles are computed from the chart's own data, so they stay true if the data changes, and the map and zoom titles change with the era, mode and country chosen.
- **"How to" line on every chart**, saying exactly what to hover, click or drag, for someone seeing it cold.
- **Transitions.** Reworded: "And every year, the calendar turns them over" is now "And inside every year, each one has a month of its own." "And the shops followed" overclaimed (the shops did not simply follow the trends), so it now reads "The shops initially didn't match the general aesthetic patterns." Added a short transition between the year pages and the timeline: "In the concept years, luxury drifted furthest from the trend." (shown only when the data supports it: none of the 11 shows in 2020 to 22 matched the year's look.) This replaces a small line that sat under the timeline chart.
- **Shops section** now runs: year-in-review spread, the finding paragraph, the three-eras timeline, the Hot 20. The section is split in two around the tie transition; the nav keeps "brands" highlighted across both halves.
- **Plain-language definitions** for terms an outsider would not know: Lyst (a fashion shopping site whose quarterly Index ranks brands by shopper activity), concept-led and clothes-led.
- **Page footer** now credits both Google Trends collections (25 Oct and 14 Nov 2026) and the Lyst Index. The scrolling strip above it is replaced by one static takeaway: "There is a pattern to the aesthetic changes: new looks break out in waves (2020, 2022 and 2023), and a typical one stays on top for about 20 months." (built from the data).
- **Renamed** from "Wardrobe" to "Aesthetic" (cover wordmark, nav, page title, page folios). The cover's "hot list" line, which pointed at a removed table, now reads "The hot 20 / 34 quarters".

## 4. Chart by chart

| Fig. | Initial | Now |
|---|---|---|
| 1. Thesis | Stacked bars, six aesthetics | Stacked bars, eight aesthetics, full width, taller, labels that switch between white and charcoal for contrast. (We tried an overhead-runway version with 100 models per year and reverted it.) |
| 2. When | Six lines, small, pale selected era | Eight lines, full width and taller; a dot marks each aesthetic's peak; dark outlined era band; filter chips that only affect this chart and clear when you scroll away |
| 3. Where | Map; click an outlined country | Map with "stands out" and "most searched" modes; title changes with era and mode; click any country |
| 4. Zoom in | Three countries, yearly lines | Any country, share of the eight by era, with the era from the timeline marked; the peak statement only considers 2018 on (earlier shares are low-volume noise) |
| 5. Ring | Trend ring and table | Same, with a legend for the dots and arcs and a computed takeaway ("about 20 months, from 2 to 52") |
| 6. Seasons | One circular clock with eight overlapping loops, plus a table | Same seasonal clock and table, with a computed takeaway title; the filter chips only affect this chart and clear when you scroll away. (We tried eight small charts on one scale and went back.) |
| 7. Three eras (new) | none | One timeline stacking streetwear's share, the year's look, the #1 Lyst brand each quarter and every show studied, against three shaded eras; shows that matched the year's look are ringed; captions under each era |
| 8. Hot 20 | Bars coloured by the year's look for our 13 brands; slower animation requested | Bars are highlighted by whether the brand's runway matched the year's look (matched, partly, did not match, no runway); every brand in the top 20 from 2017 to 2025 is assessed; the current year is shown as a large numeral on the chart |

**Removed:** Where it's searched and Who peaks first (platforms), the shop view (13 product tiles), the expandable full data tables (hot list and Lyst-rank heatmap), and Brands per look.

**Year-in-review spread (new content).** Each year's page now shows runway photos of the #1 Lyst brand's show (two photos in 2017, one in other years) in place of the look cutouts, with a caption, chips ("concept-led" or "clothes-led", "rising in search last year", "matches the year's look") and a click-open panel describing the show. Photos are credited "courtesy of" their brand.

## 5. New content: Cottagecore and Maximalism

- **Data.** Collected 14 Nov 2026 through Google Trends Explore, same settings as the first six: monthly series for "cottagecore" and "maximalist fashion", a three-term comparison with streetwear (the shared anchor), and the same comparison by country for all six eras. Every transferred value was checked against a checksum. The new streetwear series correlates 0.998 with the October one, and the scaling ratio is 1.01, so the new terms sit on the same scale.
- **Term choice.** We used "maximalist fashion", not plain "maximalism", because plain "maximalism" is also an art and interior-design word and already averaged about 7 (of its own peak) over 2004 to 2012, while "maximalist fashion" averaged under 1 until 2018.
- **Finding about Maximalism.** It is a very small search term next to streetwear (about 0% of the shared scale). It shows a real shape on charts that scale each aesthetic to its own peak (timeline, ring, seasons) but is about 0% on share charts, so it gets no model or sliver there. We report this as a finding about the term, not a bug.
- **Cottagecore is large:** about 29% of the eight in 2021, and the year's look for 2020.
- **Lookbook.** Two new looks with cut-out photos (backgrounds removed and edges cleaned), a definition and a list of pieces each.
- **Colours.** The site keeps its ivory and charcoal look. The eight aesthetics use a richer editorial set: burnt orange `#CC623E` (Streetwear), steel blue `#497C9C` (Quiet Luxury), forest green `#44765B` (Gorpcore), raspberry pink `#CB648E` (Y2K), lavender `#9475B5` (Coquette), deep plum `#574052` (Dark Academia), teal `#369894` (Cottagecore), golden ochre `#BD922F` (Maximalism). Three pairs (blue and lavender, blue and raspberry, raspberry and teal) are close for red-green colour-blind readers, so every chart also labels its colours directly.

## 6. Data pipeline changes (`pipeline/`)

- `raw/google_trends_raw.json`: new queries `alone:cottagecore`, `alone:maximalist fashion`, `shareC`, and `geoC:<era>` for six eras, with the collection date and method noted.
- `build.py`: now joins three comparisons through streetwear; produces eight aesthetics throughout; platform, country-series and peak outputs stay on the original six terms (the page no longer uses them).
- **Breakout rule changed:** the first month of a run of three or more months at 25% or more of the peak (a single noisy month in a sparse series no longer counts). Streetwear's breakout moved from March to June 2017.
- **Despeckle rule added:** in each solo series, a month with data and nothing within two months either side is dropped as sampling noise. It removed values of at most 4 from the original six, and a lone 41 in October 2010 from "maximalist fashion"; the dropped months are listed in `qc_report.json`.
- `qc_report.json` records the new anchor ratios, countries per era and the two notes on Maximalism.

## 7. Analyses we ran and what they showed

All of these are exploratory. Several tests were run and we reported what stood out, so treat p-values as leads.

1. **Did brand runways match the year's look?** 18 shows from 8 brand runs at #1 on Lyst were compared with the year's look: 4 matched, 3 partly, 11 did not (later extended to 21 shows: 5 matched). Matches came in two stretches, the streetwear years (3 of 6 shows, 2017 to 19) and 2023 to 24 (Prada, Miu Miu); none of 11 in 2020 to 22.
2. **Is streetwear actually declining?** No: its share fell because new terms appeared; its own search series is at its highest in 2025. Effective number of aesthetics went from 1.06 (2019) to 2.3 (2020), about 3.3 (2024) and 2.2 (2025). Streetwear's share rebounded from 46% (2021) to 66% (2025).
3. **Did COVID cause it?** The fall was global (all 43 countries with data) and three aesthetics broke out between June and September 2020. But it did not track local lockdowns: stringency did not predict the size of the fall (rank correlation +0.06), and across 21 countries the lockdown start date did not predict the Cottagecore breakout (−0.05, p = 0.84). Cottagecore broke out first in Canada, the US and the UK and reached Spain, France and Argentina months later; Sweden (mildest restrictions) broke out the same week as Australia and Germany, and Italy (earliest lockdown) in August. This fits an online trend spreading outward during the pandemic, not local lockdown severity. Lockdown data: Oxford COVID-19 Government Response Tracker (via Our World in Data).
4. **Do brand searches lead the matching aesthetic?** Five brand and aesthetic pairs tested: only Miu Miu and Coquette led (by about seven months, r = 0.55); the other pairs showed no consistent lead, and across all 104 brand and aesthetic pairs there was no tendency for brands to lead.
5. **Do shows line up month by month with their aesthetic's searches?** No more often than chance. One clean case: Quiet Luxury rose from 6 to 43 in the six months after Prada's Fall/Winter 2023. (An earlier note that Gucci's Cosmogonie preceded a rise in Maximalism was wrong: the rise came first.)
6. **Which brand is #1 turns over mostly in Q2 and Q3** (16 of 19 quarters against 7 of 17 in Q1 and Q4, p = 0.014).
7. **From 2023, #1 brands were the ones whose searches rose the year before** (8 of 8 slots, against 3 of 13 in 2018 to 22).
8. **Are our search terms the problem?** Alternative phrasings tracked our chosen terms closely (correlation 0.8 to 0.97 for most); only Quiet Luxury would grow notably ("old money outfit" adds about 60%). Maximalism stays tiny under every phrasing.
9. **Should more aesthetics be added?** Candidates tested against streetwear's volume: only Grunge was a new, sizeable aesthetic (about 6% of streetwear's volume); athleisure and techwear overlap existing aesthetics; most others were under 2% or had large searches long before the period. No more aesthetics were added; Gucci's themes have no searchable name (15 candidate names tested).

## 8. How runways were judged (method)

- **Closest aesthetic.** Our reading of published reviews of each show, matched to the eight aesthetics, with a fit of strong, fair or loose.
- **Match.** A show is compared with the year's look for the year it was shown. *Matched*: its closest aesthetic is that look. *Partly*: a looser reading fits. *Did not match*: neither.
- **Concept-led or clothes-led.** Concept-led means the staging was the headline idea (a film, a stunt, a set); clothes-led means the clothes were.
- **Hot 20.** Gucci, Balenciaga, Off-White, Prada, Miu Miu and Saint Laurent are judged show by show. 34 more brands with a runway (for example Versace, Moncler, Bottega Veneta, Loewe, Fendi, Louis Vuitton, Dior, Valentino, Burberry, Dolce & Gabbana, Givenchy, The Row, Coach, COS, Totême, Ferragamo) use a looser reading of the designer's era, from one or two representative shows each. Thirteen brands that do not stage runway shows (Nike, Adidas, New Balance, On, UGG, Birkenstock, Dr Martens, Canada Goose, Stone Island, Skims, Massimo Dutti, Yeezy, Fear of God) are marked "no runway". No top-20 brand from 2017 to 2025 is left unassessed (619 brand slots: 67 matched, 88 partly, 390 did not, 74 no runway).

## 9. Known gaps (be upfront about these)

- **Our coding is judgment, not measurement**, and rests on 21 shows. Have a teammate re-code a sample before presenting.
- **Photo credits** are to the brand only; if any photo came from an agency, check the licence.
- **Balenciaga 2021** has no runway photo.
- **Gucci 2022:** the photo now has the Cosmogonie description (Resort 2023, the show nearest the quarter Gucci took #1), but the image itself is a digital render on a black grid that does not look like that show or Twinsburg. Swap in a real runway photo if you can.
- **Era-level readings** for 34 brands are looser than the show-level ones and are labelled so in the tooltip. They come from reviews of one or two shows per designer era, so a different pick could shift a few.
- **Colour-blind pairs** noted in section 5.

## 10. Checks done for a first-time visitor

Loaded at desktop and phone width and used every control (lookbook, chart filters, era and country clicks, map modes, zoom menu, year slider and runway panel, timeline hover, Hot 20 play and pause): no console errors, no broken images, no unlabelled buttons, no sideways page scroll, and no placeholder text. Wide charts scroll sideways inside their own box on a phone.

## 11. File changes

**Added (17, plus `CHANGELOG.md`):** `js/eras.js`, `js/runway.js`, `assets/people/cottage.webp`, `assets/people/maxi.webp`, ten runway photos in `assets/runway/`, and a `drafts/` folder holding the cut platforms feature and an unused Saint Laurent photo.
**Removed (2):** `js/platforms.js` (kept in `drafts/`), `js/brands.js`.
**Changed (23):** `index.html`, `README.md`, `js/core.js`, `cover.js`, `cycle.js`, `evidence.js`, `lookbook.js`, `people.js`, `scroll.js`, `seasons.js`, `shop.js`, `thesis.js`, `pipeline/README.md`, `pipeline/build.py`, `pipeline/qc_report.json`, `pipeline/raw/google_trends_raw.json`, and the rebuilt data files (`bundle.js`, `geo_by_era`, `lifecycle`, `seasonal`, `share_annual`, `summary_by_year`, `timeline_worldwide`).
