// Countdown / status banner. Uses Suriname's calendar date and offset (UTC-03:00).
import { getDevis, getFestival } from "./data.js";
import { TIME_ZONE, TIME_ZONE_OFFSET } from "./config.js";
import { escapeHTML, formatDate } from "./utils.js";

const surinameToday = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

const dayDiff = (a, b) => Math.round((new Date(`${b}T00:00:00Z`) - new Date(`${a}T00:00:00Z`)) / 86400000);

// Flattens every verified observance in festival.json into one list
function collectEvents(festival) {
  return Object.entries(festival.calendar)
    .filter(([, year]) => year.status === "verified")
    .flatMap(([y, year]) => Object.values(year.observances).map((o) => ({ ...o, year: y })));
}

export async function initCountdown() {
  const box = document.querySelector("#countdown");
  if (!box) return;
  try {
    const [festival, devis] = await Promise.all([getFestival(), getDevis()]);
    const events = collectEvents(festival);
    const today = surinameToday();
    let timer = null;

    const current = events.find((e) => today >= e.start && today <= (e.vijayadashami ?? e.end));
    if (current) {
      const dayNumber = dayDiff(current.start, today) + 1;
      const isTenth = dayNumber > 9;
      const entry = current.days?.find((d) => d.day === dayNumber);
      const devi = devis.find((d) => d.id === (entry?.deviId ?? devis[dayNumber - 1]?.id));
      box.innerHTML = isTenth
        ? `<p class="countdown-title">${escapeHTML(current.label)} has ended</p><p>Today is Vijayadashami (Dussehra).</p>`
        : `<p class="countdown-title">${escapeHTML(current.label)} is under way</p>
           <p>Today, ${formatDate(today)}, is night <strong>${dayNumber} of 9</strong>${devi ? `, dedicated to <a href="devis.html?devi=${devi.id}">${escapeHTML(devi.name)}</a>` : ""}.</p>`;
      return;
    }

    const upcoming = events.filter((e) => e.start > today).sort((a, b) => a.start.localeCompare(b.start))[0];
    if (!upcoming) {
      box.innerHTML = `<p class="countdown-title">No confirmed upcoming date</p>
        <p>The next Navratri date has not been verified for this site, so no countdown is shown.</p>`;
      return;
    }
    const target = new Date(`${upcoming.start}T00:00:00${TIME_ZONE_OFFSET}`);
    const tick = () => {
      const ms = target - new Date();
      if (ms <= 0) { clearInterval(timer); initCountdown(); return; }
      const s = Math.floor(ms / 1000);
      box.innerHTML = `<p class="countdown-title">Countdown to ${escapeHTML(upcoming.label)} (starts ${formatDate(upcoming.start)}, Suriname time)</p>
        <p class="countdown-digits"><span>${Math.floor(s / 86400)} days</span> <span>${Math.floor(s % 86400 / 3600)} hours</span> <span>${Math.floor(s % 3600 / 60)} minutes</span></p>`;
    };
    tick();
    timer = setInterval(tick, 30000);
  } catch (err) {
    console.error(err);
    box.innerHTML = "<p>The countdown could not be loaded.</p>";
  }
}
