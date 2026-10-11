// Mobile menu, theme switcher, reading progress and the footer video link.
import { STORAGE_KEYS, VIDEO_URL } from "./config.js";

export function initNavigation() {
  const toggle = document.querySelector("#nav-toggle");
  const nav = document.querySelector("#site-nav");
  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", open);
    toggle.querySelector(".toggle-label").textContent = open ? "Close menu" : "Menu";
    nav.classList.toggle("is-open", open);
  };
  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { setOpen(false); toggle.focus(); }
  });
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
}

export function initTheme() {
  const button = document.querySelector("#theme-toggle");
  const apply = (theme) => {
    document.documentElement.dataset.theme = theme;
    button.setAttribute("aria-pressed", theme === "night");
    button.querySelector(".theme-label").textContent = theme === "night" ? "Light theme" : "Night theme";
  };
  apply(document.documentElement.dataset.theme === "night" ? "night" : "light");
  button.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "night" ? "light" : "night";
    apply(next);
    try { localStorage.setItem(STORAGE_KEYS.theme, next); } catch { /* storage unavailable: the choice lasts for this visit only */ }
  });
}

export function initScrollProgress() {
  const bar = document.querySelector("#progress");
  if (!bar) return;
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = `${max > 0 ? Math.min(100, (scrollY / max) * 100) : 0}%`;
  };
  addEventListener("scroll", update, { passive: true });
  update();
}

export function initVideoLink() {
  document.querySelectorAll("[data-video-link]").forEach((link) => {
    if (!VIDEO_URL.includes("REPLACE")) {
      link.href = VIDEO_URL;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
  });
}
