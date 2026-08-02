/*
  File: meadnyte-site/assets/js/room-novae.js
  Phase: 03_Global_Page_Scaffold_and_Viewport

  Purpose:
  - Makes the room-novae layer visible as atmospheric support for the full page scaffold.
  - Creates a subtle bridge between the threshold/stage and the visible room field below.
  - Adds decorative particles to the threshold edge and room field so the whole vertical site relationship can be judged.
  - Does not control, style, move, resize, or retime orbital planets.

  Current design decision:
  - Room-novae is a decorative atmosphere system.
  - It is not a hidden reserved layer anymore.
  - It is not a replacement for the starfield.
  - It is not a room panel controller.
  - It is not a scroll engine.
  - It must remain safe if the room field or threshold is missing.

  Future modification instructions:
  - Use this file only for room-adjacent particles, atmospheric bridge effects, and passive visual accents.
  - Do not alter planet speed here.
  - Do not alter planet positions here.
  - Do not alter orbital menu behavior here.
  - Do not alter starfield generation here; that belongs in universe-background.js.
  - Do not alter page scroll/navigation here; that belongs in navigation.js.
*/

(function () {
  "use strict";

  const MODULE_NAME = "MEADNYTE_ROOM_NOVAE";

  const SELECTORS = {
    threshold: ".entry-threshold",
    roomField: ".house-room-field",
    thresholdLayer: ".room-novae-layer",
    roomFieldLayer: ".room-novae-field"
  };

  const CLASS_NAMES = {
    thresholdLayer: "room-novae-layer",
    roomFieldLayer: "room-novae-field",
    particle: "room-novae-particle",
    soft: "is-soft",
    gold: "is-gold",
    violet: "is-violet"
  };

  const PARTICLE_COUNTS = {
    threshold: 26,
    roomField: 54,
    reducedMotionThreshold: 12,
    reducedMotionRoomField: 22
  };

  let initialized = false;

  function prefersReducedMotion() {
    return window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function getParticleCount(type) {
    const reduced = prefersReducedMotion();

    if (type === "threshold") {
      return reduced ? PARTICLE_COUNTS.reducedMotionThreshold : PARTICLE_COUNTS.threshold;
    }

    return reduced ? PARTICLE_COUNTS.reducedMotionRoomField : PARTICLE_COUNTS.roomField;
  }

  function seededRandom(seed) {
    /*
      Deterministic pseudo-random value so the page does not reshuffle every time
      a module reinitializes during local testing.
    */
    const value = Math.sin(seed * 9301 + 49297) * 233280;
    return value - Math.floor(value);
  }

  function randomBetween(seed, min, max) {
    return min + seededRandom(seed) * (max - min);
  }

  function pickTone(index) {
    if (index % 7 === 0) {
      return CLASS_NAMES.violet;
    }

    if (index % 4 === 0) {
      return CLASS_NAMES.gold;
    }

    return "";
  }

  function createLayer(parent, className, selector, label) {
    if (!parent) {
      return null;
    }

    const existingLayer = parent.querySelector(selector);

    if (existingLayer) {
      existingLayer.setAttribute("aria-hidden", "true");
      existingLayer.setAttribute("data-room-novae", label);
      return existingLayer;
    }

    const layer = document.createElement("div");
    layer.className = className;
    layer.setAttribute("aria-hidden", "true");
    layer.setAttribute("data-room-novae", label);

    parent.insertBefore(layer, parent.firstElementChild);

    return layer;
  }

  function clearGeneratedParticles(layer) {
    if (!layer) {
      return;
    }

    const particles = layer.querySelectorAll("[data-novae-particle]");

    particles.forEach(function (particle) {
      particle.remove();
    });
  }

  function configureParticle(particle, options) {
    particle.className = options.className;
    particle.setAttribute("aria-hidden", "true");
    particle.setAttribute("data-novae-particle", options.type);

    particle.style.left = options.left;
    particle.style.top = options.top;
    particle.style.setProperty("--novae-size", options.size);
    particle.style.setProperty("--novae-opacity", options.opacity);
    particle.style.setProperty("--novae-scale", options.scale);
    particle.style.setProperty("--novae-duration", options.duration);
    particle.style.setProperty("--novae-delay", options.delay);
    particle.style.setProperty("--novae-drift-x", options.driftX);
    particle.style.setProperty("--novae-drift-y", options.driftY);
  }

  function buildThresholdParticle(index) {
    const seed = index + 100;
    const particle = document.createElement("span");
    const tone = pickTone(index);
    const classNames = [CLASS_NAMES.particle];

    if (tone) {
      classNames.push(tone);
    }

    if (index % 3 === 0) {
      classNames.push(CLASS_NAMES.soft);
    }

    configureParticle(particle, {
      type: "threshold",
      className: classNames.join(" "),
      left: randomBetween(seed + 1, 8, 92).toFixed(2) + "%",
      top: randomBetween(seed + 2, 58, 97).toFixed(2) + "%",
      size: randomBetween(seed + 3, 1.2, 3.7).toFixed(2) + "px",
      opacity: randomBetween(seed + 4, 0.22, 0.58).toFixed(2),
      scale: randomBetween(seed + 5, 0.8, 1.45).toFixed(2),
      duration: randomBetween(seed + 6, 16, 31).toFixed(2) + "s",
      delay: "-" + randomBetween(seed + 7, 0, 18).toFixed(2) + "s",
      driftX: randomBetween(seed + 8, -18, 18).toFixed(2) + "px",
      driftY: randomBetween(seed + 9, -34, -8).toFixed(2) + "px"
    });

    return particle;
  }

  function buildRoomFieldParticle(index) {
    const seed = index + 500;
    const particle = document.createElement("span");
    const tone = pickTone(index + 2);
    const classNames = [CLASS_NAMES.particle];

    if (tone) {
      classNames.push(tone);
    }

    if (index % 2 === 0) {
      classNames.push(CLASS_NAMES.soft);
    }

    configureParticle(particle, {
      type: "room-field",
      className: classNames.join(" "),
      left: randomBetween(seed + 1, 4, 96).toFixed(2) + "%",
      top: randomBetween(seed + 2, 2, 98).toFixed(2) + "%",
      size: randomBetween(seed + 3, 1, 3.2).toFixed(2) + "px",
      opacity: randomBetween(seed + 4, 0.16, 0.46).toFixed(2),
      scale: randomBetween(seed + 5, 0.72, 1.32).toFixed(2),
      duration: randomBetween(seed + 6, 20, 42).toFixed(2) + "s",
      delay: "-" + randomBetween(seed + 7, 0, 28).toFixed(2) + "s",
      driftX: randomBetween(seed + 8, -24, 24).toFixed(2) + "px",
      driftY: randomBetween(seed + 9, -28, 18).toFixed(2) + "px"
    });

    return particle;
  }

  function populateLayer(layer, type) {
    if (!layer) {
      return;
    }

    clearGeneratedParticles(layer);

    const fragment = document.createDocumentFragment();
    const count = getParticleCount(type);

    for (let index = 0; index < count; index += 1) {
      const particle = type === "threshold"
        ? buildThresholdParticle(index)
        : buildRoomFieldParticle(index);

      fragment.appendChild(particle);
    }

    layer.appendChild(fragment);
  }

  function prepareRoomFieldLayer(layer) {
    /*
      The room field has its own background and cards. This inline stack level
      keeps particles visible as a decorative field while pointer-events remain disabled.
    */
    if (!layer) {
      return;
    }

    layer.style.zIndex = "0";
  }

  function markNovaeReady() {
    document.documentElement.classList.add("room-novae-ready");
    document.body.setAttribute("data-room-novae-state", "ready");
  }

  function initRoomNovae() {
    if (initialized) {
      return;
    }

    const threshold = document.querySelector(SELECTORS.threshold);
    const roomField = document.querySelector(SELECTORS.roomField);

    const thresholdLayer = createLayer(
      threshold,
      CLASS_NAMES.thresholdLayer,
      SELECTORS.thresholdLayer,
      "threshold"
    );

    const roomFieldLayer = createLayer(
      roomField,
      CLASS_NAMES.roomFieldLayer,
      SELECTORS.roomFieldLayer,
      "room-field"
    );

    prepareRoomFieldLayer(roomFieldLayer);

    populateLayer(thresholdLayer, "threshold");
    populateLayer(roomFieldLayer, "room-field");

    markNovaeReady();

    initialized = true;
  }

  window[MODULE_NAME] = Object.freeze({
    init: initRoomNovae
  });
})();