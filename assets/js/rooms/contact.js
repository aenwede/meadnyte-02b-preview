(() => {
  "use strict";

  const form = document.querySelector("[data-contact-form]");
  const status = document.querySelector("#contact-status");
  if (!form || !status) return;

  const routes = Object.freeze({
    general: { label: "General Correspondence", recipient: "myheartis@meadnyte.com" },
    legal: { label: "Legal Matter", recipient: "legal@meadnyte.com" },
    social: { label: "Press & Social Media", recipient: "social@meadnyte.com" },
    management: { label: "House Management", recipient: "cos@meadnyte.com" },
    collaboration: { label: "Creative Collaboration", recipient: "myheartis@meadnyte.com" }
  });

  const clean = (value) => String(value || "").replace(/[\r\n]+/g, " ").trim();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const route = routes[clean(data.get("subject"))];
    if (!route) return;

    const name = clean(data.get("name"));
    const email = clean(data.get("email"));
    const phone = clean(data.get("phone"));
    const message = String(data.get("message") || "").trim();
    const subject = `[Meadnyte Contact] ${route.label} — ${name}`;
    const body = [
      `Category: ${route.label}`,
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || "Not provided"}`,
      "",
      "Message:",
      message
    ].join("\r\n");
    const mailto = `mailto:${route.recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    const fallback = document.createElement("a");
    fallback.href = mailto;
    fallback.textContent = route.recipient;

    status.dataset.state = "success";
    status.replaceChildren(
      document.createTextNode("Your email application should now open with a prepared message to "),
      fallback,
      document.createTextNode(". Review it and press Send there to deliver it to the House.")
    );
    status.hidden = false;
    window.location.href = mailto;
  });
})();
