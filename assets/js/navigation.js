/*
  File: meadnyte-site/assets/js/navigation.js
  Phase: 03_Global_Page_Scaffold_and_Viewport

  Purpose:
  - Keeps landing-page navigation clean after the room cards have been removed.
  - Allows orbital planet links to navigate to real destination index.htm pages.
  - Handles only safe same-page utility anchors such as #main-content and #entry-threshold.
  - Removes same-page room reveal behavior.
  - Does not alter orbital planet design, speed, placement, orbit math, or animation.

  Future modification instructions:
  - Do not reintroduce same-page room panel reveal logic here.
  - Do not prevent default behavior for destination room links.
  - Use this file only for light landing-page navigation helpers and active page state.
*/

(function () {
  "use strict";

  const MODULE_NAME = "MEADNYTE_NAVIGATION";

  const SELECTORS = {
    samePageLinks: 'a[href^="#"]',
    footerYear: "#copyright-year"
  };

  let initialized = false;

  function prefersReducedMotion() {
    return window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function normalizeHash(hash) {
    if (!hash || hash === "#") {
      return "";
    }

    try {
      return decodeURIComponent(hash.replace("#", "").trim());
    } catch (error) {
      return hash.replace("#", "").trim();
    }
  }

  function scrollToElement(element) {
    if (!element) {
      return false;
    }

    const top = Math.max(0, window.scrollY + element.getBoundingClientRect().top);

    window.scrollTo({
      top,
      left: 0,
      behavior: prefersReducedMotion() ? "auto" : "smooth"
    });

    return true;
  }

  function bindUtilityAnchors() {
    const links = document.querySelectorAll(SELECTORS.samePageLinks);

    links.forEach(function (link) {
      link.addEventListener("click", function (event) {
        const targetId = normalizeHash(link.getAttribute("href"));
        const target = document.getElementById(targetId);

        if (!target) {
          return;
        }

        event.preventDefault();
        scrollToElement(target);
      });
    });
  }

  function setFooterYear() {
    const yearElement = document.querySelector(SELECTORS.footerYear);

    if (!yearElement) {
      return;
    }

    yearElement.textContent = String(new Date().getFullYear());
  }

  function markNavigationReady() {
    document.documentElement.classList.add("navigation-ready");
    document.body.setAttribute("data-navigation-state", "destination-links-ready");
  }

  function initNavigation() {
    if (initialized) {
      return;
    }

    bindUtilityAnchors();
    setFooterYear();
    markNavigationReady();

    initialized = true;
  }

  window[MODULE_NAME] = Object.freeze({
    init: initNavigation
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNavigation, { once: true });
  } else {
    initNavigation();
  }
})();