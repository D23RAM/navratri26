// Home-page preview grid and the full Devi explorer (search, filters, favourites, discover).
import { getDevis } from "./data.js";
import { cardTemplate } from "./cards.js";
import { openDeviModal } from "./modal.js";
import { getFavorites, toggleFavorite } from "./favorites.js";
import { applyColors, debounce, escapeHTML } from "./utils.js";

const $ = (selector) => document.querySelector(selector);
let allDevis = [];

// Fetches the data and shows a loading message or a friendly error with a Retry button.
export async function loadDevis() {
  const loading = $("#loading");
  const error = $("#error-state");
  loading.hidden = false;
  error.hidden = true;
  try {
    allDevis = await getDevis();
    return allDevis;
  } catch (err) {
    console.error(err);
    $("#error-message").textContent =
      "The Devi information could not be loaded. Check your connection, or that the site is running from a web server, then try again.";
    error.hidden = false;
    return null;
  } finally {
    loading.hidden = true;
  }
}

// One click handler for every card grid: opens the profile for the clicked card.
function handleExplore(event) {
  const button = event.target.closest("[data-explore]");
  if (!button) return false;
  const devi = allDevis.find((d) => d.id === button.dataset.explore);
  if (devi) openDeviModal(devi, button);
  return true;
}

/* ---------- Home page ---------- */
export async function initHomePreview() {
  const grid = $("#devi-grid");
  const render = async () => {
    const devis = await loadDevis();
    if (!devis) return;
    grid.innerHTML = devis.map((d) => cardTemplate(d)).join("");
    applyColors(grid);
  };
  $("#retry-btn").addEventListener("click", render);
  grid.addEventListener("click", handleExplore);
  await render();
}

/* ---------- Explorer page ---------- */
export async function initExplorer() {
  const grid = $("#devi-grid");
  const state = { query: "", day: "all", color: "all", theme: "all", favoritesOnly: false };
  let lastDiscovered = null;

  const searchText = (d) => [
    d.name, d.transliteration, d.sanskrit, d.color, d.shortDescription, d.significance, d.iconography,
    ...d.qualities, ...d.themes, ...d.symbols.map((s) => `${s.name} ${s.meaning}`)
  ].join(" ").toLowerCase();

  // Search and every filter are applied together with Array.filter
  function visibleDevis() {
    const query = state.query.trim().toLowerCase();
    const favorites = getFavorites();
    return allDevis.filter((d) =>
      (!query || searchText(d).includes(query)) &&
      (state.day === "all" || String(d.day) === state.day) &&
      (state.color === "all" || d.color === state.color) &&
      (state.theme === "all" || d.themes.includes(state.theme)) &&
      (!state.favoritesOnly || favorites.includes(d.id))
    );
  }

  function updateFavoriteCount() {
    $("#fav-count").textContent = getFavorites().filter((id) => allDevis.some((d) => d.id === id)).length;
  }

  function render() {
    const results = visibleDevis();
    grid.innerHTML = results.map((d) => cardTemplate(d, { showFavorite: true })).join("");
    applyColors(grid);
    $("#result-count").textContent = results.length === allDevis.length
      ? `Showing all ${results.length} Devis`
      : `Showing ${results.length} of ${allDevis.length} Devis`;

    const empty = $("#empty-state");
    empty.hidden = results.length > 0;
    if (!results.length) {
      empty.querySelector("p").textContent = state.favoritesOnly && !getFavorites().length
        ? "You have not saved any favourites yet. Use the Save button on a card, then come back."
        : "No Devi matches those words and filters. Try a shorter search, or reset the filters.";
    }
    updateFavoriteCount();
  }

  function fillSelect(select, values) {
    select.insertAdjacentHTML("beforeend", values.map((v) => `<option value="${escapeHTML(v)}">${escapeHTML(v)}</option>`).join(""));
  }

  function discover(devi, button) {
    const panel = $("#discover-panel");
    panel.hidden = false;
    panel.innerHTML = `
      <div class="discover-media" data-color="${devi.colorHex}">
        <img src="${devi.image}" alt="${escapeHTML(devi.imageAlt)}" width="400" height="500" loading="lazy">
      </div>
      <div>
        <h3><span class="devanagari" lang="sa">${devi.sanskrit}</span> ${escapeHTML(devi.name)}</h3>
        <p class="translit">Day ${devi.day} · ${escapeHTML(devi.transliteration)}</p>
        <p>${escapeHTML(devi.shortDescription)}</p>
        <p><strong>A symbol to notice:</strong> ${escapeHTML(devi.symbols[0].name)}. ${escapeHTML(devi.symbols[0].meaning)}</p>
        <button class="btn btn-primary" type="button" data-explore="${devi.id}" aria-label="Explore Devi: ${escapeHTML(devi.name)}">Explore Devi</button>
      </div>`;
    applyColors(panel);
    panel.focus();
  }

  const devis = await loadDevis();
  if (!devis) {
    $("#retry-btn").addEventListener("click", () => initExplorer(), { once: true });
    return;
  }

  fillSelect($("#filter-day"), allDevis.map((d) => String(d.day)).map((n) => n));
  $("#filter-day").querySelectorAll("option:not([value='all'])").forEach((o) => (o.textContent = `Day ${o.value}`));
  fillSelect($("#filter-color"), [...new Set(allDevis.map((d) => d.color))]);
  fillSelect($("#filter-theme"), [...new Set(allDevis.flatMap((d) => d.themes))].sort());
  render();

  // Search while typing (debounced) and filters on change
  $("#search").addEventListener("input", debounce((e) => { state.query = e.target.value; render(); }));
  $("#filter-day").addEventListener("change", (e) => { state.day = e.target.value; render(); });
  $("#filter-color").addEventListener("change", (e) => { state.color = e.target.value; render(); });
  $("#filter-theme").addEventListener("change", (e) => { state.theme = e.target.value; render(); });

  $("#fav-toggle").addEventListener("click", (e) => {
    state.favoritesOnly = !state.favoritesOnly;
    e.currentTarget.setAttribute("aria-pressed", state.favoritesOnly);
    render();
  });

  $("#reset-filters").addEventListener("click", () => {
    Object.assign(state, { query: "", day: "all", color: "all", theme: "all", favoritesOnly: false });
    $("#filters-form").reset();
    $("#fav-toggle").setAttribute("aria-pressed", "false");
    render();
  });
  $("#filters-form").addEventListener("submit", (e) => e.preventDefault());

  // Card buttons: Explore and Favourite
  grid.addEventListener("click", (event) => {
    if (handleExplore(event)) return;
    const favButton = event.target.closest("[data-fav]");
    if (!favButton) return;
    const devi = allDevis.find((d) => d.id === favButton.dataset.fav);
    const { added, saved } = toggleFavorite(devi.id);
    const status = $("#fav-status");
    status.textContent = saved
      ? `${devi.name} ${added ? "added to" : "removed from"} your favourites.`
      : "Your browser blocked saving favourites, so this change will be lost on reload.";
    if (state.favoritesOnly) return render(); // the card may need to disappear
    favButton.setAttribute("aria-pressed", added);
    favButton.querySelector("[aria-hidden]").textContent = added ? "♥" : "♡";
    favButton.querySelector(".fav-text").textContent = added ? "Saved" : "Save";
    updateFavoriteCount();
  });

  // Discover a Devi: random choice that avoids repeating the previous one
  $("#discover-btn").addEventListener("click", (event) => {
    const choices = allDevis.filter((d) => d.id !== lastDiscovered);
    const pick = choices[Math.floor(Math.random() * choices.length)];
    lastDiscovered = pick.id;
    discover(pick, event.currentTarget);
  });
  $("#discover-panel").addEventListener("click", handleExplore);

  // Links such as devis.html?devi=skandamata open that profile directly
  const requested = new URLSearchParams(location.search).get("devi");
  const match = allDevis.find((d) => d.id === requested);
  if (match) openDeviModal(match, $("#search"));
}
