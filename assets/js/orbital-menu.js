// File: meadnyte-site/assets/js/orbital-menu.js

/*
  Phase: 04_Threshold_Starfield_and_Stage_Polish

  Purpose:
  - Controls true orbital planet movement around the central sigil.
  - Builds one independent orbit controller for each planet.
  - Reads each planet's complete elliptical path map from orbital-config.js.
  - Calculates x, y, depth, scale, opacity, z-layer, and Sigil-facing light direction separately for every planet.

  Modification boundary:
  - Do not hard-code new room IDs here.
  - Do not style planet appearance here; use orbital-planets.css.
  - Do not change navigation behavior here; use navigation.js / planet-interactions.js.
  - Do not create a canvas, room panels, page architecture, or destination paths here.
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

  function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  function interpolate(start, end, amount) {
    return start + (end - start) * amount;
  }

  function getNumber(value, fallback) {
    return typeof value === "number" ? value : fallback;
  }

  function getOrbitSettings(settings) {
    return settings && settings.orbit ? settings.orbit : null;
  }

  function getLayerSettings() {
    const config = getConfig();
    const layers = config && config.layers ? config.layers : {};

    return {
      sigilZIndex: getNumber(layers.sigilZIndex, 6),
      planetBehindFarZIndex: getNumber(layers.planetBehindFarZIndex, 3),
      planetBehindNearZIndex: getNumber(layers.planetBehindNearZIndex, 5),
      planetFrontNearZIndex: getNumber(layers.planetFrontNearZIndex, 7),
      planetFrontFarZIndex: getNumber(layers.planetFrontFarZIndex, 12)
    };
  }

  function solveEccentricAnomaly(meanAnomaly, eccentricity) {
    let eccentricAnomaly = meanAnomaly;

    for (let iteration = 0; iteration < 10; iteration += 1) {
      eccentricAnomaly -= (
        eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly) - meanAnomaly
      ) / (1 - eccentricity * Math.cos(eccentricAnomaly));
    }

    return eccentricAnomaly;
  }

  function getMeanAnomaly(orbit, elapsedSeconds) {
    const cycleSeconds = Math.max(1, getNumber(orbit.cycleSeconds, 90));
    const initialAnomaly = degreesToRadians(getNumber(orbit.meanAnomalyDegrees, 0));

    return initialAnomaly + (elapsedSeconds / cycleSeconds) * Math.PI * 2;
  }

  function getKeplerianCoordinates(stageSize, orbit, elapsedSeconds) {
    const semiMajor = stageSize * getNumber(orbit.semiMajor, 0.45);
    const eccentricity = Math.max(0, Math.min(0.8, getNumber(orbit.eccentricity, 0.15)));
    const inclination = degreesToRadians(getNumber(orbit.inclinationDegrees, 78));
    const ascendingNode = degreesToRadians(getNumber(orbit.ascendingNodeDegrees, 0));
    const periapsis = degreesToRadians(getNumber(orbit.periapsisDegrees, 0));
    const meanAnomaly = getMeanAnomaly(orbit, elapsedSeconds);
    const eccentricAnomaly = solveEccentricAnomaly(meanAnomaly, eccentricity);
    const orbitalX = semiMajor * (Math.cos(eccentricAnomaly) - eccentricity);
    const orbitalY = semiMajor * Math.sqrt(1 - eccentricity * eccentricity) * Math.sin(eccentricAnomaly);
    const periapsisX = orbitalX * Math.cos(periapsis) - orbitalY * Math.sin(periapsis);
    const periapsisY = orbitalX * Math.sin(periapsis) + orbitalY * Math.cos(periapsis);
    const inclinedY = periapsisY * Math.cos(inclination);
    const depth = periapsisY * Math.sin(inclination);

    return {
      x: periapsisX * Math.cos(ascendingNode) - inclinedY * Math.sin(ascendingNode),
      y: periapsisX * Math.sin(ascendingNode) + inclinedY * Math.cos(ascendingNode),
      depthUnit: Math.max(-1, Math.min(1, depth / Math.max(1, semiMajor)))
    };
  }

  function getDepthState(orbit, depthUnit) {
    const amount = Math.abs(depthUnit);
    const isFront = depthUnit >= 0;

    if (isFront) {
      return {
        isFront: true,
        amount: amount,
        depth: interpolate(0, getNumber(orbit.depthFront, 20), amount),
        scale: interpolate(
          getNumber(orbit.scaleCenter, 1),
          getNumber(orbit.scaleFront, 1.1),
          amount
        ),
        opacity: interpolate(
          getNumber(orbit.opacityCenter, 1),
          getNumber(orbit.opacityFront, 1),
          amount
        )
      };
    }

    return {
      isFront: false,
      amount: amount,
      depth: interpolate(0, getNumber(orbit.depthBack, -20), amount),
      scale: interpolate(
        getNumber(orbit.scaleCenter, 1),
        getNumber(orbit.scaleBack, 0.78),
        amount
      ),
      opacity: interpolate(
        getNumber(orbit.opacityCenter, 1),
        getNumber(orbit.opacityBack, 1),
        amount
      )
    };
  }

  function getPlanetZIndex(depthState) {
    const layers = getLayerSettings();

    if (depthState.isFront) {
      return Math.round(interpolate(
        layers.planetFrontNearZIndex,
        layers.planetFrontFarZIndex,
        depthState.amount
      ));
    }

    return Math.round(interpolate(
      layers.planetBehindNearZIndex,
      layers.planetBehindFarZIndex,
      depthState.amount
    ));
  }

  function getSigilLightDirection(coordinates, stageSize) {
    /*
      The Sigil sits at stage center.
      Each planet's illumination point should face back toward that center.
      A planet on the right side receives light on its left edge.
      A planet on the left side receives light on its right edge.
      A planet above the Sigil receives light from below, and vice versa.
    */
    const safeStageSize = Math.max(1, stageSize);
    const lightX = 50 - (coordinates.x / safeStageSize) * 90;
    const lightY = 50 - (coordinates.y / safeStageSize) * 90;

    return {
      x: Math.max(18, Math.min(82, lightX)),
      y: Math.max(18, Math.min(82, lightY))
    };
  }

  function calculateOrbitPosition(stageSize, settings, elapsedSeconds) {
    const orbit = getOrbitSettings(settings);

    if (!orbit) {
      return {
        x: 0,
        y: 0,
        depth: 0,
        scale: 1,
        opacity: 1,
        zIndex: getLayerSettings().planetFrontNearZIndex,
        lightX: 50,
        lightY: 50
      };
    }

    const coordinates = getKeplerianCoordinates(stageSize, orbit, elapsedSeconds);
    const depthState = getDepthState(orbit, coordinates.depthUnit);
    const light = getSigilLightDirection(coordinates, stageSize);

    return {
      x: coordinates.x,
      y: coordinates.y,
      depth: depthState.depth,
      scale: depthState.scale,
      opacity: depthState.opacity,
      zIndex: getPlanetZIndex(depthState),
      lightX: light.x,
      lightY: light.y
    };
  }

  function getStageSize(stage) {
    const rect = stage.getBoundingClientRect();

    return Math.min(rect.width, rect.height);
  }

  function preparePlanetLayer(stage) {
    const planetLayer = stage.querySelector(".orbital-planets");

    if (!planetLayer) {
      return;
    }

    /*
      Required layer correction:
      orbital-planets.css sets .orbital-planets to z-index: 10.
      The sigil is z-index: 6.
      If the container remains z-index: 10, every planet stays above the sigil forever.
      Setting the container back to auto lets each planet's own z-index move below or above z-index 6.
    */
    planetLayer.style.zIndex = "auto";
  }

  function applyPlanetPosition(planet, elapsedSeconds) {
    const stageSize = getStageSize(planet.stage);
    const position = calculateOrbitPosition(stageSize, planet.settings, elapsedSeconds);

    planet.node.style.setProperty("--orbit-x", position.x.toFixed(2) + "px");
    planet.node.style.setProperty("--orbit-y", position.y.toFixed(2) + "px");
    planet.node.style.setProperty("--planet-scale", position.scale.toFixed(3));
    planet.node.style.setProperty("--planet-depth", position.depth.toFixed(2));
    planet.node.style.setProperty("--planet-light-x", position.lightX.toFixed(2) + "%");
    planet.node.style.setProperty("--planet-light-y", position.lightY.toFixed(2) + "%");
    planet.node.style.opacity = position.opacity.toFixed(3);
    planet.node.style.zIndex = String(position.zIndex);
  }

  function createPlanetController(stage, node, settings) {
    return Object.freeze({
      draw: function drawPlanet(elapsedSeconds) {
        applyPlanetPosition({
          stage: stage,
          node: node,
          settings: settings
        }, elapsedSeconds);
      }
    });
  }

  function buildPlanetControllers(stage) {
    const config = getConfig();
    const utils = getUtils();

    if (!stage || !config || !utils) {
      return [];
    }

    return utils.selectAll("[data-room-target]", stage)
      .map(function (node) {
        const roomId = node.getAttribute("data-room-target");

        if (!isLockedRoomId(roomId) || !config.rooms[roomId]) {
          return null;
        }

        return createPlanetController(stage, node, config.rooms[roomId]);
      })
      .filter(Boolean);
  }

  function setupOrbitMotion(stage) {
    const utils = getUtils();

    if (!stage || !utils) {
      return;
    }

    preparePlanetLayer(stage);

    const planets = buildPlanetControllers(stage);

    if (!planets.length) {
      return;
    }

    let lastElapsedSeconds = 0;

    function drawAllPlanets(elapsedSeconds) {
      lastElapsedSeconds = elapsedSeconds;

      planets.forEach(function (planet) {
        planet.draw(elapsedSeconds);
      });
    }

    function drawCurrentPositions() {
      drawAllPlanets(lastElapsedSeconds);
    }

    drawCurrentPositions();

    if (utils.prefersReducedMotion()) {
      return;
    }

    let animationFrame = null;
    let startTime = null;

    function animate(timestamp) {
      if (!startTime) {
        startTime = timestamp;
      }

      drawAllPlanets((timestamp - startTime) / 1000);
      animationFrame = window.requestAnimationFrame(animate);
    }

    animationFrame = window.requestAnimationFrame(animate);

    window.addEventListener("resize", drawCurrentPositions);

    document.addEventListener("visibilitychange", function () {
      if (document.hidden && animationFrame) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = null;
        return;
      }

      if (!document.hidden && !animationFrame) {
        startTime = null;
        animationFrame = window.requestAnimationFrame(animate);
      }
    });
  }

  function setupPortalTilt(stage) {
    const utils = getUtils();

    if (!stage || !utils || utils.prefersReducedMotion()) {
      return;
    }

    let frameRequest = null;
    let tiltX = 0;
    let tiltY = 0;

    function applyTilt() {
      stage.style.setProperty("--portal-tilt-x", tiltX.toFixed(2) + "deg");
      stage.style.setProperty("--portal-tilt-y", tiltY.toFixed(2) + "deg");
      frameRequest = null;
    }

    function requestTiltFrame() {
      if (!frameRequest) {
        frameRequest = window.requestAnimationFrame(applyTilt);
      }
    }

    stage.addEventListener("pointermove", function (event) {
      const rect = stage.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      tiltX = utils.clamp(((event.clientY - centerY) / rect.height) * -5, -4, 4);
      tiltY = utils.clamp(((event.clientX - centerX) / rect.width) * 5, -4, 4);

      stage.classList.add("is-orbital-active");
      requestTiltFrame();
    });

    stage.addEventListener("pointerleave", function () {
      tiltX = 0;
      tiltY = 0;

      stage.classList.remove("is-orbital-active");
      requestTiltFrame();
    });
  }

  window.MEADNYTE_ORBITAL_MENU = Object.freeze({
    init: function initOrbitalMenu() {
      const stage = document.querySelector("[data-orbital-stage]");

      setupOrbitMotion(stage);
      setupPortalTilt(stage);
    }
  });
})();
