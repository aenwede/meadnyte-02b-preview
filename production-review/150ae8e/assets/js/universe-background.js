// File: meadnyte-site/assets/js/universe-background.js

/*
  Phase: 04_Threshold_Starfield_and_Stage_Polish

  Purpose:
  - Adds an organic animated starfield layer to the existing entry threshold.
  - Increases starfield density and visible slow movement.
  - Adds subtle deep-background novae and black-hole/gravity-well depth marks.
  - This file enhances the starfield; it does not redesign the entry page.

  Modification boundary:
  - Tune star count, drift, twinkle, novae, and black-hole depth here.
  - Do not create planets here; planets belong to orbital-menu.js / orbital-planets.css.
  - Do not alter the woodmark, sigil, room panels, navigation, or menu structure here.
  - Do not replace the CSS threshold layers; this should sit behind the portal as enhancement.
*/

(function () {
  "use strict";

  const STAR_COUNT = 1200;
  const NOVA_COUNT = 20;
  const BLACK_HOLE_COUNT = 5;

  function getUtils() {
    return window.MEADNYTE_UTILS;
  }

  function createStar(seed, width, height) {
    const depth = 0.28 + seed.depth * 1.35;
    const size = 0.38 + seed.size * 1.75;
    const isGold = seed.warm > 0.74;
    const isBright = seed.opacity > 0.84;

    return {
      x: seed.x * width,
      y: seed.y * height,
      baseX: seed.x * width,
      baseY: seed.y * height,
      size: size,
      depth: depth,
      opacity: 0.18 + seed.opacity * 0.76,
      twinkleSpeed: 0.72 + seed.twinkleSpeed * 2.15,
      twinkleOffset: seed.twinkleOffset * Math.PI * 2,
      driftX: -1.35 + seed.driftX * 2.7,
      driftY: -0.82 + seed.driftY * 1.64,
      halo: isBright ? 1.8 + seed.size * 2.6 : 0,
      color: isGold ? "214, 189, 120" : "242, 234, 217"
    };
  }

  function createNova(seed, width, height) {
    return {
      x: seed.x * width,
      y: seed.y * height,
      radius: 42 + seed.size * 92,
      period: 8.5 + seed.twinkleSpeed * 13,
      phaseOffset: seed.twinkleOffset,
      intensity: 0.16 + seed.opacity * 0.22,
      driftX: (-0.22 + seed.driftX * 0.44),
      driftY: (-0.14 + seed.driftY * 0.28),
      color: seed.warm > 0.55 ? "214, 189, 120" : "242, 234, 217"
    };
  }

  function createBlackHole(seed, width, height) {
    return {
      x: seed.x * width,
      y: seed.y * height,
      radius: 54 + seed.size * 96,
      ringRadius: 72 + seed.size * 132,
      opacity: 0.4 + seed.opacity * 0.2,
      pulseSpeed: 0.08 + seed.twinkleSpeed * 0.16,
      pulseOffset: seed.twinkleOffset * Math.PI * 2,
      driftX: -0.08 + seed.driftX * 0.16,
      driftY: -0.05 + seed.driftY * 0.1
    };
  }

  function buildSeeds(count) {
    const seeds = [];
    let value = 0.417;

    function next() {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    }

    for (let index = 0; index < count; index += 1) {
      seeds.push({
        x: next(),
        y: next(),
        depth: next(),
        size: next(),
        warm: next(),
        opacity: next(),
        twinkleSpeed: next(),
        twinkleOffset: next(),
        driftX: next(),
        driftY: next()
      });
    }

    return seeds;
  }

  function wrapPosition(value, limit, margin) {
    if (value < -margin) {
      return value + limit + margin * 2;
    }

    if (value > limit + margin) {
      return value - limit - margin * 2;
    }

    return value;
  }

  function drawBlackHole(context, blackHole, elapsed, width, height) {
    const pulse = 0.72 + Math.sin(elapsed * blackHole.pulseSpeed + blackHole.pulseOffset) * 0.28;
    const x = wrapPosition(blackHole.x + elapsed * blackHole.driftX, width, blackHole.ringRadius);
    const y = wrapPosition(blackHole.y + elapsed * blackHole.driftY, height, blackHole.ringRadius);
    const coreRadius = blackHole.radius * pulse;
    const ringRadius = blackHole.ringRadius * (0.94 + pulse * 0.12);

    let gradient = context.createRadialGradient(x, y, 0, x, y, ringRadius);
    gradient.addColorStop(0, "rgba(0, 0, 0, " + (blackHole.opacity * 0.95).toFixed(3) + ")");
    gradient.addColorStop(0.38, "rgba(0, 0, 0, " + (blackHole.opacity * 0.62).toFixed(3) + ")");
    gradient.addColorStop(0.62, "rgba(34, 28, 48, " + (blackHole.opacity * 0.28).toFixed(3) + ")");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    context.beginPath();
    context.fillStyle = gradient;
    context.arc(x, y, ringRadius, 0, Math.PI * 2);
    context.fill();

    gradient = context.createRadialGradient(x, y, coreRadius * 0.58, x, y, ringRadius * 0.88);
    gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(0.55, "rgba(214, 189, 120, " + (blackHole.opacity * 0.22).toFixed(3) + ")");
    gradient.addColorStop(0.78, "rgba(242, 234, 217, " + (blackHole.opacity * 0.12).toFixed(3) + ")");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    context.beginPath();
    context.fillStyle = gradient;
    context.arc(x, y, ringRadius * 0.9, 0, Math.PI * 2);
    context.fill();
  }

  function drawNova(context, nova, elapsed, width, height) {
    const cycle = ((elapsed / nova.period) + nova.phaseOffset) % 1;
    const bloom = Math.exp(-Math.pow((cycle - 0.18) / 0.105, 2));

    if (bloom < 0.012) {
      return;
    }

    const x = wrapPosition(nova.x + elapsed * nova.driftX, width, nova.radius);
    const y = wrapPosition(nova.y + elapsed * nova.driftY, height, nova.radius);
    const radius = nova.radius * (0.38 + bloom * 0.78);
    const opacity = nova.intensity * bloom;
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);

    gradient.addColorStop(0, "rgba(" + nova.color + ", " + (opacity * 0.95).toFixed(3) + ")");
    gradient.addColorStop(0.18, "rgba(" + nova.color + ", " + (opacity * 0.46).toFixed(3) + ")");
    gradient.addColorStop(0.48, "rgba(" + nova.color + ", " + (opacity * 0.16).toFixed(3) + ")");
    gradient.addColorStop(1, "rgba(" + nova.color + ", 0)");

    context.beginPath();
    context.fillStyle = gradient;
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();

    context.beginPath();
    context.fillStyle = "rgba(" + nova.color + ", " + (opacity * 0.82).toFixed(3) + ")";
    context.arc(x, y, 1.2 + bloom * 2.4, 0, Math.PI * 2);
    context.fill();
  }

  function drawStar(context, star, elapsed, width, height) {
    const twinkle = 0.58 + Math.sin(elapsed * star.twinkleSpeed + star.twinkleOffset) * 0.42;
    const driftX = elapsed * star.driftX * star.depth;
    const driftY = elapsed * star.driftY * star.depth;
    const margin = 24;

    const x = wrapPosition(star.baseX + driftX, width, margin);
    const y = wrapPosition(star.baseY + driftY, height, margin);
    const radius = Math.max(0.28, star.size * star.depth);
    const opacity = star.opacity * twinkle;

    if (star.halo > 0) {
      const haloRadius = radius + star.halo * star.depth;
      const gradient = context.createRadialGradient(x, y, 0, x, y, haloRadius);

      gradient.addColorStop(0, "rgba(" + star.color + ", " + (opacity * 0.38).toFixed(3) + ")");
      gradient.addColorStop(1, "rgba(" + star.color + ", 0)");

      context.beginPath();
      context.fillStyle = gradient;
      context.arc(x, y, haloRadius, 0, Math.PI * 2);
      context.fill();
    }

    context.beginPath();
    context.fillStyle = "rgba(" + star.color + ", " + opacity.toFixed(3) + ")";
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }

  function initUniverseBackground() {
    const utils = getUtils();
    const threshold = document.querySelector(".entry-threshold");

    if (!threshold || !utils) {
      return;
    }

    if (threshold.querySelector(".universe-background-canvas")) {
      return;
    }

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const seeds = buildSeeds(STAR_COUNT + NOVA_COUNT + BLACK_HOLE_COUNT);
    const starSeeds = seeds.slice(0, STAR_COUNT);
    const novaSeeds = seeds.slice(STAR_COUNT, STAR_COUNT + NOVA_COUNT);
    const blackHoleSeeds = seeds.slice(STAR_COUNT + NOVA_COUNT);
    let stars = [];
    let novae = [];
    let blackHoles = [];
    let width = 0;
    let height = 0;
    let animationFrame = null;
    let startTime = null;

    canvas.className = "universe-background-canvas";
    canvas.setAttribute("aria-hidden", "true");

    Object.assign(canvas.style, {
      position: "absolute",
      inset: "-8%",
      zIndex: "2",
      width: "116%",
      height: "116%",
      pointerEvents: "none",
      mixBlendMode: "normal"
    });

    threshold.insertBefore(canvas, threshold.firstElementChild);

    function resize() {
      const rect = threshold.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;

      width = Math.max(1, Math.floor(rect.width * 1.16));
      height = Math.max(1, Math.floor(rect.height * 1.16));

      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);

      canvas.style.width = width + "px";
      canvas.style.height = height + "px";

      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      stars = starSeeds.map(function (seed) {
        return createStar(seed, width, height);
      });

      novae = novaSeeds.map(function (seed) {
        return createNova(seed, width, height);
      });

      blackHoles = blackHoleSeeds.map(function (seed) {
        return createBlackHole(seed, width, height);
      });
    }

    function draw(timestamp) {
      if (!startTime) {
        startTime = timestamp;
      }

      const elapsed = (timestamp - startTime) / 1000;

      context.clearRect(0, 0, width, height);

      blackHoles.forEach(function (blackHole) {
        drawBlackHole(context, blackHole, elapsed, width, height);
      });

      novae.forEach(function (nova) {
        drawNova(context, nova, elapsed, width, height);
      });

      stars.forEach(function (star) {
        drawStar(context, star, elapsed, width, height);
      });

      animationFrame = window.requestAnimationFrame(draw);
    }

    function drawReducedMotion() {
      context.clearRect(0, 0, width, height);

      blackHoles.forEach(function (blackHole) {
        drawBlackHole(context, blackHole, 0, width, height);
      });

      novae.forEach(function (nova) {
        drawNova(context, nova, nova.period * 0.18, width, height);
      });

      stars.forEach(function (star) {
        context.beginPath();
        context.fillStyle = "rgba(" + star.color + ", " + star.opacity.toFixed(3) + ")";
        context.arc(star.baseX, star.baseY, star.size * star.depth, 0, Math.PI * 2);
        context.fill();
      });
    }

    resize();

    window.addEventListener("resize", resize);

    if (utils.prefersReducedMotion()) {
      drawReducedMotion();
      return;
    }

    animationFrame = window.requestAnimationFrame(draw);

    document.addEventListener("visibilitychange", function () {
      if (document.hidden && animationFrame) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = null;
        return;
      }

      if (!document.hidden && !animationFrame) {
        startTime = null;
        animationFrame = window.requestAnimationFrame(draw);
      }
    });
  }

  window.MEADNYTE_UNIVERSE_BACKGROUND = Object.freeze({
    init: initUniverseBackground
  });
})();