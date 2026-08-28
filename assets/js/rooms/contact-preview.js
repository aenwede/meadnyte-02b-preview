(() => {
  "use strict";
  const form = document.querySelector("[data-contact-form]");
  const status = document.querySelector("#contact-status");
  if (!form || !status) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.dataset.state = "success";
    status.textContent = "Your message has entered the House. Thank you. The appropriate desk will respond as soon as reasonably possible.";
    status.hidden = false;
    form.reset();
    status.scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();

