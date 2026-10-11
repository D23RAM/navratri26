// Renders festival.json content: the three arcs, the two Navratris and regional traditions.
import { getFestival } from "./data.js";
import { escapeHTML } from "./utils.js";

const templates = {
  arcs: (f) => f.arcs.map((a) => `
    <article class="arc"><p class="note">${escapeHTML(a.days)}</p><h3>${escapeHTML(a.title)}</h3><p>${escapeHTML(a.text)}</p></article>`).join(""),
  observances: (f) => f.observances.map((o) => `
    <article class="arc"><h3>${escapeHTML(o.name)}</h3>
      <p class="note">${escapeHTML(o.season)} · ${escapeHTML(o.month)}</p>
      <p>${escapeHTML(o.description)}</p><p><strong>Focus:</strong> ${escapeHTML(o.focus)}</p></article>`).join(""),
  traditions: (f) => f.traditions.map((t) => `
    <article class="arc"><h3>${escapeHTML(t.name)}</h3>
      <p class="note">${escapeHTML(t.region)}</p>
      <p>${escapeHTML(t.description)}</p><p><strong>Emphasis:</strong> ${escapeHTML(t.emphasis)}</p></article>`).join("")
};

export async function initFestivalContent() {
  const targets = document.querySelectorAll("[data-festival]");
  if (!targets.length) return;
  try {
    const festival = await getFestival();
    targets.forEach((el) => { el.innerHTML = templates[el.dataset.festival](festival); });
    document.querySelectorAll("[data-festival-note]").forEach((el) => { el.textContent = festival[el.dataset.festivalNote]; });
  } catch (err) {
    console.error(err);
    targets.forEach((el) => { el.innerHTML = '<p class="error-box">This section could not be loaded. Please reload the page.</p>'; });
  }
}
