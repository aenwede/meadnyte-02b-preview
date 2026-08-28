(() => {
  "use strict";
  const form = document.querySelector("[data-contact-form]");
  const status = document.querySelector("#contact-status");
  if (!form || !status) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    status.dataset.state = "error";
    status.textContent = "This GitHub sandbox displays the Contact Room but cannot execute its Plesk mail handler. Delivery testing must be completed on meadnyte.com after deployment.";
    status.hidden = false;
    status.scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();
