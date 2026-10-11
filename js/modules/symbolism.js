// Searchable symbolism library: 20 entries loaded from symbolism.json.
import { getSymbolism, getDevis } from "./data.js";
import { debounce, escapeHTML } from "./utils.js";

export async function initSymbolism() {
  const list = document.querySelector("#symbol-list");
  const count = document.querySelector("#symbol-count");
  const error = document.querySelector("#symbol-error");
  const loading = document.querySelector("#symbol-loading");
  const search = document.querySelector("#symbol-search");
  const category = document.querySelector("#symbol-category");

  async function load() {
    error.hidden = true;
    loading.hidden = false;
    try {
      const [entries, devis] = await Promise.all([getSymbolism(), getDevis()]);
      const nameOf = (id) => devis.find((d) => d.id === id)?.name ?? id;

      category.innerHTML = '<option value="all">All categories</option>' +
        [...new Set(entries.map((e) => e.category))].map((c) => `<option>${escapeHTML(c)}</option>`).join("");

      const render = () => {
        const q = search.value.trim().toLowerCase();
        const shown = entries.filter((e) =>
          (category.value === "all" || e.category === category.value) &&
          (!q || [e.title, e.description, e.significance, e.category].join(" ").toLowerCase().includes(q)));
        count.textContent = `Showing ${shown.length} of ${entries.length} entries`;
        list.innerHTML = shown.length ? shown.map((e) => `
          <li class="symbol-card">
            <p class="chip-label">${escapeHTML(e.category)}</p>
            <h3>${escapeHTML(e.title)}</h3>
            <p>${escapeHTML(e.description)}</p>
            <p><strong>Significance:</strong> ${escapeHTML(e.significance)}</p>
            ${e.devis.length ? `<p class="note">Seen with: ${e.devis.map((id) => `<a href="devis.html?devi=${id}">${escapeHTML(nameOf(id))}</a>`).join(", ")}</p>` : ""}
            <p class="note">Source: <a href="${e.source.url}" target="_blank" rel="noopener noreferrer">${escapeHTML(e.source.label)}<span class="visually-hidden"> (opens in a new tab)</span></a></p>
          </li>`).join("") : '<li class="notice">No entries match. Try a different word or category.</li>';
      };
      search.addEventListener("input", debounce(render));
      category.addEventListener("change", render);
      render();
    } catch (err) {
      console.error(err);
      error.hidden = false;
    } finally {
      loading.hidden = true;
    }
  }
  document.querySelector("#symbol-retry").addEventListener("click", load);
  document.querySelector("#symbol-form").addEventListener("submit", (e) => e.preventDefault());
  await load();
}
