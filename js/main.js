// Entry point: loaded by every page with <script type="module" src="js/main.js">.
// Each page sets <body data-page="..."> so we only start the features it needs.
import { initNavigation, initTheme, initScrollProgress, initVideoLink } from "./modules/navigation.js";
import { initHomePreview, initExplorer } from "./modules/devis.js";
import { initColorPreview, initColorsPage } from "./modules/colors.js";
import { initTimeline } from "./modules/timeline.js";
import { initCalendar } from "./modules/calendar.js";
import { initCountdown } from "./modules/countdown.js";
import { initSymbolism } from "./modules/symbolism.js";
import { initFestivalContent } from "./modules/festival.js";
import { initFeedbackForm, initFormResults } from "./modules/form.js";

initNavigation();
initTheme();
initScrollProgress();
initVideoLink();
initFestivalContent();

const pages = {
  home: () => { initHomePreview(); initColorPreview(); },
  devis: () => initExplorer(),
  colors: () => initColorsPage(),
  navratri: () => { initCountdown(); initCalendar(); initTimeline(); initSymbolism(); },
  about: () => initFeedbackForm(),
  "form-action": () => initFormResults()
};
pages[document.body.dataset.page]?.();
