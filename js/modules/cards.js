// Devi card markup shared by the home page, the explorer and the colour page.
import { escapeHTML } from "./utils.js";
import { isFavorite } from "./favorites.js";

export function cardTemplate(devi, { showFavorite = false } = {}) {
  const saved = isFavorite(devi.id);
  const favoriteButton = showFavorite ? `
    <button class="btn btn-ghost fav-btn" type="button" data-fav="${devi.id}"
            aria-pressed="${saved}" aria-label="Favourite ${escapeHTML(devi.name)}">
      <span aria-hidden="true">${saved ? "♥" : "♡"}</span>
      <span class="fav-text">${saved ? "Saved" : "Save"}</span>
    </button>` : "";

  return `
  <article class="devi-card" data-id="${devi.id}" data-color="${devi.colorHex}">
    <div class="card-media">
      <img src="${devi.image}" alt="${escapeHTML(devi.imageAlt)}" width="400" height="500" loading="lazy" decoding="async">
    </div>
    <div class="card-body">
      <p class="day-badge">Day ${devi.day}</p>
      <h3 class="card-title">
        <span class="devanagari" lang="sa">${devi.sanskrit}</span>
        <span class="card-name">${escapeHTML(devi.name)}</span>
      </h3>
      <p class="translit">${escapeHTML(devi.transliteration)}</p>
      <p class="color-tag"><span class="swatch" aria-hidden="true"></span>2026 colour: ${escapeHTML(devi.color)}</p>
      <p class="card-text">${escapeHTML(devi.shortDescription)}</p>
      <div class="card-actions">
        <button class="btn btn-primary" type="button" data-explore="${devi.id}"
                aria-label="Explore Devi: ${escapeHTML(devi.name)}">Explore Devi</button>
        ${favoriteButton}
      </div>
    </div>
  </article>`;
}
