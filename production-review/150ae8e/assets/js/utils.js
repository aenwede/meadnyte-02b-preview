// File: meadnyte-site/assets/js/utils.js

/*
  Phase: 02_Index_Page_and_Menu

  Purpose:
  - Shared helpers for the Meadnyte entry page JavaScript.
  - This file contains no design decisions.
  - It supports later files without changing the page visually by itself.

  Future modification instructions:
  - Keep this file generic.
  - Do not place room IDs, planet coordinates, animation speeds, asset paths, or DOM-specific behavior here.
*/

(function () {
  "use strict";

  window.MEADNYTE_UTILS = Object.freeze({
    clamp: function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    },

    prefersReducedMotion: function prefersReducedMotion() {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    },

    getHashId: function getHashId() {
      return window.location.hash.replace("#", "").trim();
    },

    selectAll: function selectAll(selector, root) {
      return Array.from((root || document).querySelectorAll(selector));
    }
  });
})();