// File: assets/js/main.js

/*
  Meadnyte Website Build v0.5
  Main initializer.

  This file should stay light.
  It confirms the page has loaded, exposes a small Meadnyte namespace,
  and provides a safe place for future global coordination.
*/

(function () {
  "use strict";

  const Meadnyte = window.Meadnyte || {};

  Meadnyte.version = "0.5";

  Meadnyte.state = {
    ready: false,
    initializedAt: null
  };

  Meadnyte.dom = {
    root: document.documentElement,
    body: document.body,
    main: document.getElementById("main-content")
  };

  Meadnyte.dispatch = function dispatchMeadnyteEvent(eventName, detail) {
    const event = new CustomEvent(eventName, {
      bubbles: true,
      detail: detail || {}
    });

    document.dispatchEvent(event);
  };

  Meadnyte.setReady = function setReady() {
    Meadnyte.state.ready = true;
    Meadnyte.state.initializedAt = new Date().toISOString();

    document.documentElement.classList.add("meadnyte-ready");
    document.body.setAttribute("data-meadnyte-state", "ready");

    Meadnyte.dispatch("meadnyte:ready", {
      version: Meadnyte.version,
      initializedAt: Meadnyte.state.initializedAt
    });
  };

  function confirmRequiredRegions() {
    const requiredSelectors = [
      ".site-header",
      ".site-main",
      ".site-footer"
    ];

    const missingSelectors = requiredSelectors.filter(function (selector) {
      return !document.querySelector(selector);
    });

    if (missingSelectors.length) {
      document.body.setAttribute("data-meadnyte-warning", "missing-regions");
      console.warn("Meadnyte warning: missing required regions:", missingSelectors);
    }
  }

  function initMain() {
    window.Meadnyte = Meadnyte;

    confirmRequiredRegions();
    Meadnyte.setReady();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMain);
  } else {
    initMain();
  }
})();