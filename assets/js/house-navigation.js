/*
  House Navigation — shared behavior
  Keeps the navigation stylesheet current and closes an open menu when a
  destination is selected.
*/

(() => {
  "use strict";

  const STYLE_VERSION = "nav.2";

  document.querySelectorAll('link[href*="house-navigation.css"]').forEach((link) => {
    const url = new URL(link.href, document.baseURI);

    if (url.searchParams.get("v") !== STYLE_VERSION) {
      url.searchParams.set("v", STYLE_VERSION);
      link.href = url.href;
    }
  });

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : event.target.parentElement;
    const link = target?.closest(".house-menu__panel a");

    if (!link) return;

    link.closest("details.house-menu")?.removeAttribute("open");
  });
})();
