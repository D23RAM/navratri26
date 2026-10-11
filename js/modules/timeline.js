// Nine-night timeline, generated from devis.json and festival.json.
import { getDevis, getFestival } from "./data.js";
import { DEFAULT_YEAR } from "./config.js";
import { applyColors, escapeHTML, formatDate } from "./utils.js";

export async function initTimeline() {
  const target = document.querySelector("#timeline");
  const error = document.querySelector("#timeline-error");

  async function render() {
    error.hidden = true;
    try {
      const [devis, festival] = await Promise.all([getDevis(), getFestival()]);
      const year = festival.calendar[DEFAULT_YEAR];
      const days = year?.status === "verified" ? year.observances.sharad.days : [];

      target.innerHTML = devis.map((d, i) => {
        const dated = days.find((x) => x.day === d.day);
        return `
        <li class="timeline-item" data-color="${d.colorHex}">
          <span class="timeline-marker" aria-hidden="true">${d.day}</span>
          <div class="timeline-card">
            <p class="day-badge">Day ${d.day} · ${festival.tithis[i]}${dated ? ` · ${formatDate(dated.date, { weekday: "short", day: "numeric", month: "short" })}` : ""}</p>
            <h3><span class="devanagari" lang="sa">${d.sanskrit}</span> ${escapeHTML(d.name)}</h3>
            <p>${escapeHTML(d.shortDescription)}</p>
            <p class="color-tag"><span class="swatch" aria-hidden="true"></span>${escapeHTML(d.color)}</p>
            <a class="text-link" href="devis.html?devi=${d.id}">Read her profile<span class="visually-hidden">: ${escapeHTML(d.name)}</span></a>
          </div>
        </li>`;
      }).join("");
      applyColors(target);
    } catch (err) {
      console.error(err);
      error.hidden = false;
    }
  }
  document.querySelector("#timeline-retry").addEventListener("click", render);
  await render();
}
