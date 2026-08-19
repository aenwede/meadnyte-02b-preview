(() => {
  "use strict";

  const PROJECT_ROOT = new URL("../../", document.currentScript.src);
  const DATA_URL = new URL("assets/data/social-portals.json", PROJECT_ROOT);
  const mounts = [...document.querySelectorAll("[data-social-portals]")];

  if (!mounts.length) return;

  const makePortal = (portal) => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    const icon = document.createElement("span");

    item.className = "social-portals__item";
    link.className = "social-portals__link";
    link.href = portal.url;
    link.target = "_blank";
    link.rel = "me noopener noreferrer";
    link.setAttribute("aria-label", `${portal.label} — opens in a new tab`);
    link.dataset.portal = portal.id;
    link.dataset.validation = portal.validation;

    icon.className = "social-portals__icon";
    const iconPath = portal.icon.startsWith("/") ? portal.icon.slice(1) : portal.icon;\n    const iconUrl = new URL(iconPath, PROJECT_ROOT);
    icon.style.setProperty("--social-icon", `url("${iconUrl.href}")`);
    icon.setAttribute("aria-hidden", "true");

    link.append(icon);
    item.append(link);
    return item;
  };

  fetch(DATA_URL, { credentials: "same-origin" })
    .then((response) => {
      if (!response.ok) throw new Error(`Social portal data returned ${response.status}`);
      return response.json();
    })
    .then((data) => {
      mounts.forEach((mount) => {
        const list = document.createElement("ul");
        const variant = mount.dataset.socialVariant || "quiet";
        list.className = `social-portals social-portals--${variant}`;
        list.setAttribute("aria-label", "Meadnyte signal paths");
        list.append(...data.portals.map(makePortal));
        mount.replaceChildren(list);
      });
    })
    .catch((error) => {
      console.error("Meadnyte social portals could not be rendered.", error);
    });
})();
