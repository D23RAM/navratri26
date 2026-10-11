# NAVARATRI: Nine Nights. Nine Forms. One Divine Shakti.

Educational website about Navratri and the nine forms of Maa Durga (the Navadurga).
Final project for WDD231 by Dija Ramsoedit. Plain HTML, CSS and vanilla JavaScript (ES modules). No frameworks, no build step, no backend.

Intended address after publishing: `https://d23ram.github.io/wdd231/final/` (not yet deployed).

## Folder structure
```
final/
  index.html  devis.html  colors.html  navratri.html  about.html
  form-action.html  attributions.html  favicon.svg  README.md
  css/styles.css
  js/main.js                 entry point (starts what each page needs)
  js/modules/
    config.js                VIDEO_URL, time zone, default year, data paths
    data.js                  Fetch API loaders (async/await)
    devis.js                 home preview + explorer (search, filters, favourites, Discover)
    cards.js  modal.js       card markup, native <dialog> profile
    favorites.js             localStorage favourites
    colors.js                colour strip, wheel, gallery, explorer
    timeline.js  calendar.js  countdown.js   nine-night timeline, year calendar, status banner
    symbolism.js             20-entry searchable library
    festival.js              arcs, Sharad/Chaitra, regional traditions
    navigation.js            mobile menu, theme switcher, scroll progress, video link
    form.js                  feedback validation + form-action results
    utils.js                 escapeHTML, contrast helper, debounce, date format
  data/  devis.json  colors.json  festival.json  symbolism.json
  images/  9 Devi emblems + hero-mandala.svg (SVG, about 70 kB in total)
```

## Run locally (VS Code)
1. Open the `wdd231` folder in VS Code (File > Open Folder).
2. Install the **Live Server** extension.
3. Right-click `final/index.html` and choose **Open with Live Server**.
Do not double-click the HTML files: browsers block `fetch()` of JSON from `file://`, so the Devis would not load.

## Publish on GitHub Pages
1. Commit and push the `final` folder to the `wdd231` repository.
2. On GitHub: Settings > Pages > Deploy from a branch > `main` / root > Save.
3. After a minute the site is at `https://d23ram.github.io/wdd231/final/`.
All paths are relative, so it works from that subfolder.

## Set your video link (required before submitting)
Open `js/modules/config.js` and replace the value of `VIDEO_URL`. Every page's footer link ("Video Demonstration") picks it up. Until you do, that link points to the Video section on the About page.

## How the data works
`data.js` calls `fetch()` on each JSON file, checks `response.ok`, parses with `response.json()`, and throws on failure. Pages call these inside `try...catch`; on failure they show an error box with a **Try again** button. Cards, colour swatches, the timeline, the calendar and the 20 symbolism entries are all generated from JSON with template literals. Edit the JSON to change content; no HTML edits are needed.

## localStorage
- Favourites: key `navaratri-favorites` (list of Devi ids). Corrupt or blocked storage is handled safely.
- Theme: key `navaratri-theme` (`night` or light).

## Updating the calendar
In `data/festival.json`, under `calendar`, add a year (for example `"2027"`) with `"status": "verified"` and an `observances.sharad` block like the 2026 one (explicit date for every day, not start + 9). Only add dates after checking a panchang or a local Hindu organisation. Years marked `unverified` show "not confirmed" and no countdown. Colour charts per year go in `data/colors.json` under each colour's `assignments`.

## Images
Real photographs or paintings of the deities were **not** included: the build environment could not reach Wikimedia Commons, and I will not invent URLs or guess licences. Each Devi has a symbolic emblem (original SVG artwork made for this project). To use a real image: save a licensed, optimised file in `images/` (WebP or JPEG, about 400 x 500 px, under 60 kB), change `image` and `imageAlt` in `data/devis.json`, and add a row to the table in `attributions.html` with source page, creator and licence.

## Things you must verify before submitting
- [ ] Replace `VIDEO_URL` and test the footer link.
- [ ] Open every source link in `attributions.html` and in the JSON files. I could not open the Wikipedia links, so check that each page exists and says what is summarised.
- [ ] Confirm the 2026 dates with a Suriname temple or pandit. The sources are Indian calendar websites.
- [ ] Have someone familiar with the traditions read the Devi descriptions and mantras.
- [ ] Decide whether to replace the emblems with licensed artwork (your assignment may expect recognisable Devi images).
- [ ] Run Lighthouse and the WDD audit, validate HTML at validator.w3.org, and test in Firefox/Safari. These were not run.
- [ ] Test with the keyboard only (Tab, Enter, Escape) and at 320 px width.
