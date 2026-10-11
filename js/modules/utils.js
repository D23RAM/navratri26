// Small helpers shared by several modules.

// Makes text safe to place inside HTML built with template literals.
export function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]
  ));
}

// Returns near-black or white, whichever is easier to read on the given hex colour.
export function readableTextColor(hex) {
  const value = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.4 ? "#1C1028" : "#FFFFFF";
}

// Cards carry their colour in data attributes; this turns them into CSS variables.
export function applyColors(root = document) {
  root.querySelectorAll("[data-color]").forEach((el) => {
    el.style.setProperty("--devi-color", el.dataset.color);
    el.style.setProperty("--devi-ink", readableTextColor(el.dataset.color));
  });
}

export function debounce(fn, wait = 150) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

// "2026-10-11" -> "Sunday, 11 October" (date only, no time zone shifting)
export function formatDate(isoDate, options = { weekday: "long", day: "numeric", month: "long" }) {
  return new Date(`${isoDate}T12:00:00Z`).toLocaleDateString("en-GB", { ...options, timeZone: "UTC" });
}
