/*
  Shared Room Modules — Phase 06

  Authority boundary:
  - reusable media-module behavior belongs here;
  - navigation remains in house-navigation.js;
  - atmosphere remains in room-atmosphere.js.

  The Listen parent currently activates no full audio transport. Individual-work
  chambers activate playback, seeking, ordered-work navigation, timing cues,
  transcript state, and recovery through explicit data-module markup.
*/

(() => {
  "use strict";

  const protectedArtwork = document.querySelectorAll("[data-protected-art] img");

  protectedArtwork.forEach((image) => {
    image.draggable = false;
    image.addEventListener("dragstart", (event) => event.preventDefault());
    image.addEventListener("contextmenu", (event) => event.preventDefault());
  });

  document.documentElement.dataset.roomModules = "ready";
})();
