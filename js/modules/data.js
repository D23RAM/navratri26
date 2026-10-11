// Loads the JSON files with the Fetch API.
// Each loader returns a Promise, so callers use async/await and try...catch.
import { DATA_PATHS } from "./config.js";

const cache = new Map();

export async function fetchJSON(path) {
  if (cache.has(path)) return cache.get(path);

  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Could not load ${path} (HTTP ${response.status})`);
  }
  const data = await response.json(); // JSON parsing
  cache.set(path, data);              // only successful loads are cached, so Retry works
  return data;
}

export const getDevis = async () => (await fetchJSON(DATA_PATHS.devis)).devis;
export const getColors = () => fetchJSON(DATA_PATHS.colors);
export const getFestival = () => fetchJSON(DATA_PATHS.festival);
export const getSymbolism = async () => (await fetchJSON(DATA_PATHS.symbolism)).entries;
