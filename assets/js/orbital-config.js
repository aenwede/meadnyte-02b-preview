// File: meadnyte-site/assets/js/orbital-config.js

/*
  Phase: 04_Threshold_Starfield_and_Stage_Polish

  Purpose:
  - Central configuration for the six locked orbital rooms.
  - Defines one complete, independent elliptical path around the central sigil for each planet.
  - References the sigil layer depth used by sigil.css: .entry-sigil { z-index: 6; }.
  - Gives every planet a true front half and rear half of its orbit.

  Modification boundary:
  - Tune planet ellipse length, ellipse width, tilt, phase, cycle speed, scale, opacity, and depth here.
  - Do not place DOM behavior here; use orbital-menu.js.
  - Do not style planets here; use orbital-planets.css.
  - Do not change navigation, page structure, room IDs, or destination paths here.
*/

(function () {
  "use strict";

  function freezeOrbit(orbit) {
    return Object.freeze({
      semiMajor: orbit.semiMajor,
      eccentricity: orbit.eccentricity,
      inclinationDegrees: orbit.inclinationDegrees,
      ascendingNodeDegrees: orbit.ascendingNodeDegrees,
      periapsisDegrees: orbit.periapsisDegrees,
      meanAnomalyDegrees: orbit.meanAnomalyDegrees,
      cycleSeconds: orbit.cycleSeconds,
      depthBack: orbit.depthBack,
      depthFront: orbit.depthFront,
      scaleBack: orbit.scaleBack,
      scaleCenter: orbit.scaleCenter,
      scaleFront: orbit.scaleFront,
      opacityBack: orbit.opacityBack,
      opacityCenter: orbit.opacityCenter,
      opacityFront: orbit.opacityFront
    });
  }

  window.MEADNYTE_ORBITAL_CONFIG = Object.freeze({
    roomIds: Object.freeze([
      "about",
      "house",
      "listen",
      "watch",
      "signals",
      "contact"
    ]),

    layers: Object.freeze({
      sigilZIndex: 6,
      planetBehindFarZIndex: 3,
      planetBehindNearZIndex: 5,
      planetFrontNearZIndex: 7,
      planetFrontFarZIndex: 12
    }),

    rooms: Object.freeze({
      // Planet: About
      // Tuning: longer ellipse, narrower short side, full opacity in front and behind.
      about: Object.freeze({
        id: "about",
        label: "About",
        orbit: freezeOrbit({
          semiMajor: 0.54,
          eccentricity: 0.28,
          inclinationDegrees: 84,
          ascendingNodeDegrees: 125,
          periapsisDegrees: 218,
          meanAnomalyDegrees: 200,
          cycleSeconds: 68.2,
          depthBack: -20,
          depthFront: 20,
          scaleBack: 0.74,
          scaleCenter: 0.88,
          scaleFront: 1.03,
          opacityBack: 1,
          opacityCenter: 1,
          opacityFront: 1
        })
      }),

      // Planet: House
      // Tuning: expanded ceremonial ellipse, separated phase, full opacity in front and behind.
      house: Object.freeze({
        id: "house",
        label: "House",
        orbit: freezeOrbit({
          semiMajor: 0.72,
          eccentricity: 0.24,
          inclinationDegrees: 76,
          ascendingNodeDegrees: 4,
          periapsisDegrees: 18,
          meanAnomalyDegrees: 130,
          cycleSeconds: 104,
          depthBack: -18,
          depthFront: 18,
          scaleBack: 0.86,
          scaleCenter: 1.02,
          scaleFront: 1.18,
          opacityBack: 1,
          opacityCenter: 1,
          opacityFront: 1
        })
      }),

      // Planet: Listen
      // Tuning: long ellipse rotated into a taller lane, separated phase, full opacity in front and behind.
      listen: Object.freeze({
        id: "listen",
        label: "Listen",
        orbit: freezeOrbit({
          semiMajor: 0.63,
          eccentricity: 0.15,
          inclinationDegrees: 80,
          ascendingNodeDegrees: 65,
          periapsisDegrees: 112,
          meanAnomalyDegrees: 260,
          cycleSeconds: 84.2,
          depthBack: -19,
          depthFront: 20,
          scaleBack: 0.82,
          scaleCenter: 1,
          scaleFront: 1.17,
          opacityBack: 1,
          opacityCenter: 1,
          opacityFront: 1
        })
      }),

      // Planet: Watch
      // Tuning: widest long-path ellipse, narrow short side, full opacity in front and behind.
      watch: Object.freeze({
        id: "watch",
        label: "Watch",
        orbit: freezeOrbit({
          semiMajor: 0.67,
          eccentricity: 0.18,
          inclinationDegrees: 78,
          ascendingNodeDegrees: 34,
          periapsisDegrees: 64,
          meanAnomalyDegrees: 260,
          cycleSeconds: 94,
          depthBack: -20,
          depthFront: 20,
          scaleBack: 0.68,
          scaleCenter: 0.84,
          scaleFront: 1.04,
          opacityBack: 1,
          opacityCenter: 1,
          opacityFront: 1
        })
      }),

      // Planet: Signals
      // Tuning: widened slanted signal lane, separated phase, full opacity in front and behind.
      signals: Object.freeze({
        id: "signals",
        label: "Signals",
        orbit: freezeOrbit({
          semiMajor: 0.58,
          eccentricity: 0.20,
          inclinationDegrees: 82,
          ascendingNodeDegrees: 95,
          periapsisDegrees: 158,
          meanAnomalyDegrees: 190,
          cycleSeconds: 75,
          depthBack: -20,
          depthFront: 18,
          scaleBack: 0.72,
          scaleCenter: 0.86,
          scaleFront: 1.01,
          opacityBack: 1,
          opacityCenter: 1,
          opacityFront: 1
        })
      }),

      // Planet: Contact
      // Tuning: expanded rounded ellipse, separated phase, full opacity in front and behind.
      contact: Object.freeze({
        id: "contact",
        label: "Contact",
        orbit: freezeOrbit({
          semiMajor: 0.50,
          eccentricity: 0.12,
          inclinationDegrees: 86,
          ascendingNodeDegrees: 154,
          periapsisDegrees: 276,
          meanAnomalyDegrees: 180,
          cycleSeconds: 61.8,
          depthBack: -18,
          depthFront: 20,
          scaleBack: 0.76,
          scaleCenter: 0.92,
          scaleFront: 1.09,
          opacityBack: 1,
          opacityCenter: 1,
          opacityFront: 1
        })
      })
    })
  });
})();
