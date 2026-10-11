// Feedback form validation (about.html) and the results page (form-action.html).

export function initFeedbackForm() {
  const form = document.querySelector("#feedback-form");
  if (!form) return;
  const summary = document.querySelector("#form-errors");

  const messageFor = (field) => {
    if (field.validity.valueMissing) return `${field.labels[0].textContent.replace("*", "").trim()} is required.`;
    if (field.validity.typeMismatch) return "Enter a valid email address, such as name@example.com.";
    if (field.validity.tooShort) return `Message needs at least ${field.minLength} characters.`;
    return "";
  };

  form.addEventListener("submit", (event) => {
    const invalid = [...form.elements].filter((f) => f.willValidate && !f.checkValidity());
    if (!invalid.length) return; // valid: the browser sends the GET request to form-action.html
    event.preventDefault();
    summary.hidden = false;
    summary.innerHTML = `<p><strong>Please fix ${invalid.length} ${invalid.length === 1 ? "field" : "fields"}:</strong></p><ul>` +
      invalid.map((f) => `<li><a href="#${f.id}">${messageFor(f)}</a></li>`).join("") + "</ul>";
    invalid[0].focus();
  });
  form.addEventListener("input", () => { if (form.checkValidity()) summary.hidden = true; });
}

// Shows submitted values using textContent, so user text can never run as HTML.
export function initFormResults() {
  const target = document.querySelector("#submission");
  if (!target) return;
  const params = new URLSearchParams(location.search);
  const fields = [["name", "Name"], ["email", "Email"], ["category", "Category"], ["message", "Message"]];
  const present = fields.filter(([key]) => params.get(key)?.trim());

  if (!present.length) {
    target.textContent = "No form data was found. Please use the feedback form on the About page.";
    return;
  }
  const dl = document.createElement("dl");
  dl.className = "results-list";
  fields.forEach(([key, label]) => {
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = label;
    dd.textContent = params.get(key)?.trim() || "Not provided";
    dl.append(dt, dd);
  });
  target.replaceChildren(dl);
}
