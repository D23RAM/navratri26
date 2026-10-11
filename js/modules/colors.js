// Home-page colour strip and the full Colours page (gallery, wheel, explorer).
import { getColors, getDevis } from "./data.js";
import { cardTemplate } from "./cards.js";
import { openDeviModal } from "./modal.js";
import { applyColors, escapeHTML, readableTextColor } from "./utils.js";

const $ = (selector) => document.querySelector(selector);

// Finds the Devi paired with a colour in the chart year
const assignmentFor = (color, year) => color.assignments?.[year] ?? null;

function detailTemplate(color, year, devi) {
  const link = devi
    ? `<p>On the ${year} chart: <strong>Day ${assignmentFor(color, year).day}</strong>, <a href="devis.html?devi=${devi.id}">${escapeHTML(devi.name)}</a>.</p>`
    : "";
  return `
    <h3>${escapeHTML(color.name)} <span class="hex">${color.hex}</span></h3>
    <p class="detail-lead">${escapeHTML(color.symbolism)}</p>
    <p>${escapeHTML(color.description)}</p>
    ${link}
    <p class="note"><strong>Variation:</strong> ${escapeHTML(color.variationNote)}</p>`;
}

/* ---------- Home page: swatch strip ---------- */
export async function initColorPreview() {
  const strip = $("#color-strip");
  const detail = $("#color-detail");
  try {
    const [{ colors, chartYear, chartNote }, devis] = await Promise.all([getColors(), getDevis()]);
    $("#color-note").textContent = chartNote;
    strip.innerHTML = colors.map((c) => `
      <li><button type="button" class="chip" data-color-id="${c.id}" data-bg="${c.hex}" aria-pressed="false">
        <span class="chip-swatch" aria-hidden="true"></span>${escapeHTML(c.name)}</button></li>`).join("");
    strip.querySelectorAll("[data-bg]").forEach((b) => b.style.setProperty("--chip", b.dataset.bg));

    strip.addEventListener("click", (event) => {
      const button = event.target.closest("[data-color-id]");
      if (!button) return;
      strip.querySelectorAll("[data-color-id]").forEach((b) => b.setAttribute("aria-pressed", b === button));
      const color = colors.find((c) => c.id === button.dataset.colorId);
      const assignment = assignmentFor(color, chartYear);
      detail.innerHTML = detailTemplate(color, chartYear, devis.find((d) => d.id === assignment?.deviId));
    });
  } catch (err) {
    console.error(err);
    strip.innerHTML = "";
    detail.textContent = "The colour information could not be loaded. Please reload the page.";
  }
}

/* ---------- Colours page ---------- */
export async function initColorsPage() {
  const gallery = $("#color-gallery");
  const wheel = $("#color-wheel");
  const explorer = $("#color-explorer");

  async function load() {
    $("#colors-error").hidden = true;
    try {
      const [{ colors, chartYear, chartNote }, devis] = await Promise.all([getColors(), getDevis()]);
      $("#chart-note").textContent = chartNote;
      build(colors, devis, chartYear);
    } catch (err) {
      console.error(err);
      $("#colors-error").hidden = false;
    } finally {
      $("#loading").hidden = true;
    }
  }

  function build(colors, devis, year) {
    // Gallery cards: a real swatch plus a visible name, hex value and short text
    gallery.innerHTML = colors.map((c) => `
      <li class="color-card" data-bg="${c.hex}">
        <div class="color-swatch"><span>${escapeHTML(c.name)}</span></div>
        <div class="color-info">
          <p class="hex">${c.hex}</p>
          <p>${escapeHTML(c.symbolism)}</p>
          <p class="note">${assignmentFor(c, year) ? `${year} chart: Day ${assignmentFor(c, year).day}` : ""}</p>
          <button type="button" class="btn btn-ghost" data-pick="${c.id}" aria-pressed="false">Explore ${escapeHTML(c.name)}</button>
        </div>
      </li>`).join("");
    gallery.querySelectorAll("[data-bg]").forEach((el) => {
      el.style.setProperty("--swatch", el.dataset.bg);
      el.style.setProperty("--swatch-ink", readableTextColor(el.dataset.bg));
    });

    // Wheel: nine buttons placed around a circle with CSS custom properties
    wheel.innerHTML = colors.map((c, i) => `
      <button type="button" class="wheel-btn" data-pick="${c.id}" data-bg="${c.hex}" data-i="${i}" aria-pressed="false" aria-label="${escapeHTML(c.name)}" title="${escapeHTML(c.name)}">
        <span class="wheel-num" aria-hidden="true">${i + 1}</span>
      </button>`).join("") + '<div class="wheel-center" id="wheel-center" aria-hidden="true">Choose a colour</div>';
    wheel.querySelectorAll("[data-bg]").forEach((b) => {
      b.style.setProperty("--swatch", b.dataset.bg);
      b.style.setProperty("--swatch-ink", readableTextColor(b.dataset.bg));
      b.style.setProperty("--i", b.dataset.i);
    });

    let selected = null;

    function select(id) {
      selected = id;
      document.querySelectorAll("[data-pick]").forEach((b) => {
        const on = b.dataset.pick === id;
        b.setAttribute("aria-pressed", on);
        b.closest(".color-card")?.classList.toggle("is-selected", on);
        if (b.classList.contains("wheel-btn")) b.classList.toggle("is-selected", on);
      });
      const color = colors.find((c) => c.id === id);
      $("#wheel-center").textContent = color.name;
      const assignment = assignmentFor(color, year);
      const related = devis.filter((d) => d.id === assignment?.deviId);
      explorer.innerHTML = `
        ${detailTemplate(color, year, related[0])}
        <div class="card-grid compact">${related.map((d) => cardTemplate(d)).join("")}</div>
        <button type="button" class="btn btn-primary" id="clear-color">Clear selection</button>`;
      applyColors(explorer);
      $("#clear-color").addEventListener("click", clear);
      explorer.focus();
    }

    function clear() {
      selected = null;
      $("#wheel-center").textContent = "Choose a colour";
      document.querySelectorAll("[data-pick]").forEach((b) => b.setAttribute("aria-pressed", "false"));
      document.querySelectorAll(".is-selected").forEach((el) => el.classList.remove("is-selected"));
      explorer.innerHTML = "<p>Select a colour from the wheel or the gallery to read about it and see the Devi paired with it on the 2026 chart.</p>";
    }

    document.addEventListener("click", (event) => {
      const pick = event.target.closest("[data-pick]");
      if (pick) return pick.dataset.pick === selected ? clear() : select(pick.dataset.pick);
      const explore = event.target.closest("[data-explore]");
      if (explore) {
        const devi = devis.find((d) => d.id === explore.dataset.explore);
        if (devi) openDeviModal(devi, explore);
      }
    });
    clear();
  }

  $("#retry-btn").addEventListener("click", load);
  await load();
}
