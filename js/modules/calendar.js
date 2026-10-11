// Festival calendar with a year selector. Only years marked "verified" show dates.
import { getDevis, getFestival } from "./data.js";
import { DEFAULT_YEAR } from "./config.js";
import { escapeHTML, formatDate } from "./utils.js";

export async function initCalendar() {
  const select = document.querySelector("#year-select");
  const output = document.querySelector("#calendar-output");
  const error = document.querySelector("#calendar-error");

  async function load() {
    error.hidden = true;
    try {
      const [festival, devis] = await Promise.all([getFestival(), getDevis()]);
      const years = Object.keys(festival.calendar).sort();
      select.innerHTML = years.map((y) => `<option value="${y}"${y === DEFAULT_YEAR ? " selected" : ""}>${y}</option>`).join("");
      const draw = () => { output.innerHTML = calendarTemplate(festival.calendar[select.value], select.value, festival, devis); };
      select.addEventListener("change", draw);
      draw();
    } catch (err) {
      console.error(err);
      error.hidden = false;
    }
  }
  document.querySelector("#calendar-retry").addEventListener("click", load);
  await load();
}

function calendarTemplate(year, label, festival, devis) {
  if (!year || year.status !== "verified") {
    return `<p class="notice"><strong>Dates for ${label} are not confirmed.</strong> ${escapeHTML(year?.statusNote ?? "No calendar data has been added for this year.")}</p>`;
  }
  const { sharad, chaitra } = year.observances;
  const rows = sharad.days.map((entry, i) => {
    const devi = devis.find((d) => d.id === entry.deviId);
    return `<tr>
      <th scope="row">Day ${entry.day}</th>
      <td>${formatDate(entry.date)}</td>
      <td>${festival.tithis[i]}${entry.day === 1 ? " (Ghatasthapana)" : ""}</td>
      <td>${escapeHTML(devi.name)}</td>
      <td><span class="swatch" style="--devi-color:${devi.colorHex}" aria-hidden="true"></span>${escapeHTML(devi.color)}</td>
    </tr>`;
  }).join("");

  return `
    <p class="notice">${escapeHTML(year.statusNote)}</p>
    <p class="note">Location: ${escapeHTML(year.location)}</p>
    <dl class="date-summary">
      <div><dt>${escapeHTML(sharad.label)}</dt><dd>${formatDate(sharad.start)} to ${formatDate(sharad.end)}</dd></div>
      <div><dt>Vijayadashami (Dussehra)</dt><dd>${formatDate(sharad.vijayadashami)}, the day after the ninth night</dd></div>
      <div><dt>${escapeHTML(chaitra.label)}</dt><dd>${formatDate(chaitra.start)} to ${formatDate(chaitra.end)}</dd></div>
    </dl>
    <div class="table-wrap">
      <table>
        <caption>Sharad Navratri ${label}: the nine days</caption>
        <thead><tr><th scope="col">Day</th><th scope="col">Date</th><th scope="col">Tithi</th><th scope="col">Devi</th><th scope="col">Colour on the ${label} chart</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <p>Sources:</p>
    <ul class="plain-list">${year.sources.map((s) => `<li><a href="${s.url}" target="_blank" rel="noopener noreferrer">${escapeHTML(s.label)}<span class="visually-hidden"> (opens in a new tab)</span></a></li>`).join("")}</ul>`;
}
