// Accessible Devi profile dialog built on the native <dialog> element.
// showModal() gives us focus trapping, the Escape key and an inert background.
import { escapeHTML } from "./utils.js";

let dialog = null;
let opener = null;

function ensureDialog() {
  if (dialog) return dialog;

  dialog = document.createElement("dialog");
  dialog.id = "devi-dialog";
  dialog.className = "dialog";
  dialog.setAttribute("aria-labelledby", "devi-dialog-title");

  // Clicking the dark backdrop closes the dialog
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  // Whichever way it closes (button, Escape, backdrop), return focus to the opener
  dialog.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
    if (opener && document.contains(opener)) opener.focus();
  });

  document.body.append(dialog);
  return dialog;
}

const list = (items) => `<ul class="plain-list">${items.map((i) => `<li>${escapeHTML(i)}</li>`).join("")}</ul>`;

export function openDeviModal(devi, trigger = document.activeElement) {
  const el = ensureDialog();
  opener = trigger;

  el.innerHTML = `
    <div class="dialog-head">
      <p class="day-badge">Day ${devi.day} of Navratri</p>
      <button class="btn btn-ghost dialog-close" type="button" data-close>Close <span aria-hidden="true">✕</span></button>
    </div>
    <div class="dialog-grid">
      <figure class="dialog-figure" data-color="${devi.colorHex}">
        <img src="${devi.image}" alt="${escapeHTML(devi.imageAlt)}" width="400" height="500" decoding="async">
        <figcaption><span class="swatch" aria-hidden="true"></span>2026 chart colour: ${escapeHTML(devi.color)} (${devi.colorHex})</figcaption>
      </figure>
      <div class="dialog-text">
        <h2 id="devi-dialog-title"><span class="devanagari" lang="sa">${devi.sanskrit}</span> ${escapeHTML(devi.name)}</h2>
        <p class="translit">${escapeHTML(devi.transliteration)}</p>
        <h3>Meaning of the name</h3><p>${escapeHTML(devi.meaning)}</p>
        <h3>Traditional iconography</h3><p>${escapeHTML(devi.iconography)}</p>
        <h3>Qualities</h3>${list(devi.qualities)}
      </div>
    </div>
    <h3>Symbols and what they signify</h3>
    <dl class="symbol-list">
      ${devi.symbols.map((s) => `<div><dt>${escapeHTML(s.name)}</dt><dd>${escapeHTML(s.meaning)}</dd></div>`).join("")}
    </dl>
    <h3>Her story</h3><p>${escapeHTML(devi.story)}</p>
    <h3>Significance in Navratri</h3><p>${escapeHTML(devi.significance)}</p>
    <h3>Mantra</h3>
    <blockquote class="mantra">
      <p class="devanagari" lang="sa">${devi.mantra}</p>
      <p><em>${escapeHTML(devi.mantraTransliteration)}</em></p>
      <p>${escapeHTML(devi.mantraTranslation)}</p>
      <p class="note">${escapeHTML(devi.mantraNote)}</p>
    </blockquote>
    <h3>Sources</h3>
    <ul class="plain-list">
      ${devi.sources.map((s) => `<li><a href="${s.url}" target="_blank" rel="noopener noreferrer">${escapeHTML(s.label)}<span class="visually-hidden"> (opens in a new tab)</span></a></li>`).join("")}
    </ul>
    <p class="note">Stories and iconography vary between Hindu traditions; this is one commonly told version.</p>`;

  el.querySelectorAll("[data-color]").forEach((node) => node.style.setProperty("--devi-color", node.dataset.color));
  el.querySelector("[data-close]").addEventListener("click", () => el.close());
  el.scrollTop = 0;
  document.body.classList.add("modal-open");
  el.showModal();
}
