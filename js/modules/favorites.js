// Favourite Devis, saved in localStorage so they survive a page reload.
import { STORAGE_KEYS } from "./config.js";

export function getFavorites() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites) || "[]");
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return []; // storage blocked, or the saved value was corrupted
  }
}

function saveFavorites(list) {
  try {
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

export const isFavorite = (id) => getFavorites().includes(id);

// Adds or removes an id. Returns { added, saved } so the page can give feedback.
export function toggleFavorite(id) {
  const favorites = getFavorites();
  const added = !favorites.includes(id);
  const updated = added ? [...favorites, id] : favorites.filter((item) => item !== id);
  return { added, saved: saveFavorites(updated) };
}
