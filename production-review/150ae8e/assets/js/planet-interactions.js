// File: meadnyte-site/assets/js/planet-interactions.js

/*
  Phase: 02_Index_Page_and_Menu

  Purpose:
  - Controls click behavior for orbital planets.
  - Clicking a planet reveals the matching same-page room panel.
  - This does not create or require separate room index pages.

  Future modification instructions:
  - Keep locked room IDs exactly: about, house, listen, watch, signals, contact.
  - Do not add page navigation here.
  - Do not change planet motion here; use orbital-menu.js.
  - Do not change panel visual design here; use house-room-field.css.
*/

(function () {
  "use strict";

  function getConfig() {
    return window.MEADNYTE_ORBITAL_CONFIG;
  }

  function getUtils() {
    return window.MEADNYTE_UTILS;
  }

  function isLockedRoomId(roomId) {
    const config = getConfig();

    return Boolean(config && config.roomIds.indexOf(roomId) !== -1);
  }

  function setupPlanetInteractions() {
    const utils = getUtils();

    if (!utils) {
      return;
    }

    const nodes = utils.selectAll("[data-room-target]");
    const panels = utils.selectAll("[data-room-id]");
    const closeButtons = utils.selectAll("[data-room-close]");
    const threshold = document.querySelector(".entry-threshold");

    if (!nodes.length || !panels.length || !threshold) {
      return;
    }

    function setNodeState(activeRoomId) {
      nodes.forEach(function (node) {
        const isActive = node.getAttribute("data-room-target") === activeRoomId;

        node.classList.toggle("is-active", isActive);
        node.setAttribute("aria-expanded", isActive ? "true" : "false");
      });
    }

    function setPanelState(activeRoomId) {
      panels.forEach(function (panel) {
        const isActive = panel.getAttribute("data-room-id") === activeRoomId;

        panel.classList.toggle("is-active", isActive);

        if (isActive) {
          panel.removeAttribute("hidden");
        } else {
          panel.setAttribute("hidden", "");
        }
      });
    }

    function openRoom(roomId, updateHash) {
      if (!isLockedRoomId(roomId)) {
        return;
      }

      setNodeState(roomId);
      setPanelState(roomId);
      threshold.classList.add("is-room-open");

      if (updateHash !== false) {
        window.history.replaceState(null, "", "#" + roomId);
      }
    }

    function closeRooms(clearHash) {
      setNodeState(null);
      setPanelState(null);
      threshold.classList.remove("is-room-open");

      if (clearHash !== false && window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }

    nodes.forEach(function (node) {
      const roomId = node.getAttribute("data-room-target");

      if (!isLockedRoomId(roomId)) {
        node.setAttribute("aria-disabled", "true");
        return;
      }

      node.addEventListener("click", function (event) {
        event.preventDefault();
        openRoom(roomId, true);
      });
    });

    closeButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        closeRooms(true);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeRooms(true);
      }
    });

    window.addEventListener("hashchange", function () {
      const roomId = utils.getHashId();

      if (roomId) {
        openRoom(roomId, false);
      } else {
        closeRooms(false);
      }
    });

    const initialRoomId = utils.getHashId();

    if (initialRoomId) {
      openRoom(initialRoomId, false);
    }
  }

  window.MEADNYTE_PLANET_INTERACTIONS = Object.freeze({
    init: setupPlanetInteractions
  });
})();