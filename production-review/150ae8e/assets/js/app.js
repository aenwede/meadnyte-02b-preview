// File: meadnyte-site/assets/js/app.js

/*
  Phase: 02_Index_Page_and_Menu

  Purpose:
  - Boots the Meadnyte entry/menu system.
  - Calls each modular initializer in safe order.
  - This file should not contain design logic.

  Future modification instructions:
  - Add new module boot calls here only after the module exists and has a stable init method.
  - Do not place starfield, planet, room panel, or visual code directly in app.js.
  - Keep app.js as the coordinator only.
*/

(function () {
  "use strict";

  function callInit(moduleName) {
    const module = window[moduleName];

    if (module && typeof module.init === "function") {
      module.init();
    }
  }

  function initApp() {
    callInit("MEADNYTE_NAVIGATION");
    callInit("MEADNYTE_UNIVERSE_BACKGROUND");
    callInit("MEADNYTE_ROOM_NOVAE");
    callInit("MEADNYTE_ORBITAL_MENU");
    callInit("MEADNYTE_PLANET_INTERACTIONS");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }
})();