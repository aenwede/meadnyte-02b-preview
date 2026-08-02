// File: meadnyte-site/assets/js/config.js

/*
  02_Index_Page_and_Menu locked file.

  Future modification instructions:
  - This file owns configurable labels, social placeholder URLs, and the six-room registry.
  - Keep the locked public/internal IDs: about, house, listen, watch, signals, contact.
  - Do not restore deprecated IDs: exploration or archive.
  - Update social URLs here only when official links are ready.
*/

(function () {
  "use strict";

  window.MEADNYTE_CONFIG = Object.freeze({
    version: "0.7-02-index-page-and-menu",

    assets: {
      brand: {
        woodmark: "assets/img/woodmark.png",
        logo: "assets/img/logo.png"
      }
    },

    labels: {
      menu: {
        about: "About",
        house: "House",
        listen: "Listen",
        watch: "Watch",
        signals: "Signals",
        contact: "Contact"
      },

      social: {
        facebook: "Facebook",
        soundcloud: "SoundCloud",
        youtube: "YouTube",
        x: "X",
        instagram: "Instagram",
        tiktok: "TikTok"
      }
    },

    urls: {
      social: {
        facebook: "#",
        soundcloud: "#",
        youtube: "#",
        x: "#",
        instagram: "#",
        tiktok: "#"
      }
    },

    sections: [
      { id: "about", labelKey: "menu.about" },
      { id: "house", labelKey: "menu.house" },
      { id: "listen", labelKey: "menu.listen" },
      { id: "watch", labelKey: "menu.watch" },
      { id: "signals", labelKey: "menu.signals" },
      { id: "contact", labelKey: "menu.contact" }
    ],

    socialPortals: [
      {
        id: "facebook",
        labelKey: "social.facebook",
        urlKey: "social.facebook",
        status: "Portal placeholder",
        future: false
      },
      {
        id: "soundcloud",
        labelKey: "social.soundcloud",
        urlKey: "social.soundcloud",
        status: "Portal placeholder",
        future: false
      },
      {
        id: "youtube",
        labelKey: "social.youtube",
        urlKey: "social.youtube",
        status: "Portal placeholder",
        future: false
      },
      {
        id: "x",
        labelKey: "social.x",
        urlKey: "social.x",
        status: "Portal placeholder",
        future: false
      },
      {
        id: "instagram",
        labelKey: "social.instagram",
        urlKey: "social.instagram",
        status: "Future portal",
        future: true
      },
      {
        id: "tiktok",
        labelKey: "social.tiktok",
        urlKey: "social.tiktok",
        status: "Future portal",
        future: true
      }
    ]
  });
})();