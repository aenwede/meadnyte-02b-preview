(function () {
  "use strict";

  const field = document.querySelector(".chamber-field");
  if (!field) return;

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { alpha: true });
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lost = document.body.classList.contains("chamber-page--lost");
  const stars = [];
  const novaMatter = [];
  const blackHoles = [];
  let width = 0;
  let height = 0;
  let frame = 0;

  canvas.className = "cosmic-canvas";
  canvas.setAttribute("aria-hidden", "true");
  field.prepend(canvas);

  let seed = 80716;
  function random() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }

  function rebuild() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    stars.length = 0;
    const count = Math.min(1200, Math.max(420, Math.round((width * height) / 1250)));
    for (let i = 0; i < count; i += 1) {
      stars.push({
        x: random() * width,
        y: random() * height,
        vx: (random() - .5) * (.8 + random() * 1.7),
        vy: (random() - .5) * (.35 + random() * 1.15),
        r: lost ? .45 + random() * 2.55 : .25 + random() * 1.25,
        a: .16 + random() * .66,
        phase: random() * Math.PI * 2,
        speed: lost ? .38 + random() * 1.8 : .28 + random() * 1.2,
        vanish: random() * Math.PI * 2,
        vanishSpeed: .08 + random() * .42,
        warm: random() > .88
      });
    }

    novaMatter.length = 0;
    for (let i = 0; i < 210; i += 1) {
      novaMatter.push({
        angle: random() * Math.PI * 2,
        orbit: .32 + random() * .82,
        speed: .07 + random() * .31,
        size: .3 + random() * 2.35,
        alpha: .16 + random() * .72,
        wobble: random() * Math.PI * 2,
        heat: random()
      });
    }

    blackHoles.length = 0;
    [
      [.68, .42, .235, .026, .019],
      [.17, .23, .12, -.016, .013],
      [.84, .19, .105, .014, -.012],
      [.26, .78, .132, .013, -.016],
      [.79, .76, .112, -.014, -.011],
      [.48, .12, .098, .012, .014]
    ].forEach(function (entry, index) {
      blackHoles.push({ x: entry[0], y: entry[1], radius: entry[2], dx: entry[3], dy: entry[4], phase: index * 1.37 });
    });
  }

  function blackHoleState(hole, index, seconds, cameraX, cameraY) {
    const breath = 1 + Math.sin(seconds * (.17 + index * .013) + hole.phase) * .13
      + Math.sin(seconds * (.43 + index * .019) + hole.phase * 1.7) * .055;
    return {
      x: width * hole.x + Math.sin(seconds * (.085 + index * .006) + hole.phase) * width * hole.dx + cameraX * (.34 + index * .08),
      y: height * hole.y + Math.cos(seconds * (.069 + index * .005) + hole.phase) * height * hole.dy + cameraY * (.38 + index * .06),
      radius: Math.min(width, height) * hole.radius * breath,
      angle: seconds * (.025 + index * .004) + Math.sin(seconds * .11 + hole.phase) * .24,
      stretchX: 1.12 + Math.sin(seconds * .21 + hole.phase) * .22,
      stretchY: .82 + Math.cos(seconds * .16 + hole.phase * 1.4) * .19
    };
  }

  function drawBlackHoles(seconds, cameraX, cameraY) {
    context.save();
    blackHoles.forEach(function (hole, index) {
      const state = blackHoleState(hole, index, seconds, cameraX, cameraY);
      context.save();
      context.translate(state.x, state.y);
      context.rotate(state.angle);
      context.scale(state.stretchX, state.stretchY);
      for (let lobe = 0; lobe < 5; lobe += 1) {
        const drift = seconds * (.09 + lobe * .007) * (lobe % 2 ? -1 : 1) + hole.phase + lobe * 1.31;
        const lx = Math.cos(drift) * state.radius * (.08 + lobe * .027);
        const ly = Math.sin(drift * 1.17) * state.radius * (.07 + lobe * .021);
        const extent = state.radius * (1.32 + lobe * .12 + Math.sin(drift * 1.8) * .11);
        const voidField = context.createRadialGradient(lx, ly, 0, lx, ly, extent);
        voidField.addColorStop(0, "rgba(0,0,0," + (.27 - lobe * .025) + ")");
        voidField.addColorStop(.38, "rgba(0,0,0," + (.2 - lobe * .018) + ")");
        voidField.addColorStop(.72, "rgba(18,15,27,.07)");
        voidField.addColorStop(1, "rgba(0,0,0,0)");
        context.fillStyle = voidField;
        context.beginPath();
        context.arc(lx, ly, extent, 0, Math.PI * 2);
        context.fill();
      }
      const lens = context.createRadialGradient(0, 0, state.radius * .48, 0, 0, state.radius * 1.72);
      lens.addColorStop(0, "rgba(0,0,0,0)");
      lens.addColorStop(.46, "rgba(130,111,82,.025)");
      lens.addColorStop(.67, "rgba(218,197,150,.075)");
      lens.addColorStop(.82, "rgba(91,81,113,.035)");
      lens.addColorStop(1, "rgba(0,0,0,0)");
      context.fillStyle = lens;
      context.beginPath();
      context.arc(0, 0, state.radius * 1.72, 0, Math.PI * 2);
      context.fill();
      context.restore();
    });
    context.restore();
  }

  function smoothstep(value) {
    return value * value * (3 - 2 * value);
  }

  function searchCamera(seconds) {
    const cycle = 36;
    const phase = (seconds % cycle) / cycle;
    const stops = [
      { at: 0, x: 0, y: 0 },
      { at: .14, x: .09, y: 0 },
      { at: .3, x: -.09, y: .01 },
      { at: .46, x: 0, y: -.085 },
      { at: .62, x: .015, y: .085 },
      { at: .8, x: 0, y: 0 },
      { at: 1, x: 0, y: 0 }
    ];
    let from = stops[0];
    let to = stops[1];
    for (let index = 1; index < stops.length; index += 1) {
      if (phase <= stops[index].at) { to = stops[index]; from = stops[index - 1]; break; }
    }
    const progress = smoothstep(Math.max(0, Math.min(1, (phase - from.at) / (to.at - from.at))));
    return {
      x: width * (from.x + (to.x - from.x) * progress),
      y: height * (from.y + (to.y - from.y) * progress)
    };
  }

  function drawBirthNova(seconds) {
    const bx = width * (lost ? .68 : .58);
    const by = height * (lost ? .42 : .46);
    const radius = Math.min(width, height) * (lost ? .18 : .105);
    const sputter = lost ? .16 : .82 + Math.sin(seconds * 2.35) * .11 + Math.sin(seconds * 7.7) * .07;

    context.save();
    context.globalCompositeOperation = "screen";

    if (!lost) {
      const coronaPulse = 1 + Math.sin(seconds * 2.7) * .035 + Math.sin(seconds * 8.1) * .018;
      const corona = context.createRadialGradient(bx - radius * .12, by - radius * .15, radius * .02, bx, by, radius * 1.72 * coronaPulse);
      corona.addColorStop(0, "rgba(255,255,244,.99)");
      corona.addColorStop(.08, "rgba(255,247,190,.98)");
      corona.addColorStop(.22, "rgba(255,209,79,.94)");
      corona.addColorStop(.48, "rgba(239,132,21,.72)");
      corona.addColorStop(.7, "rgba(144,62,7,.34)");
      corona.addColorStop(1, "rgba(62,20,0,0)");
      context.fillStyle = corona;
      context.beginPath();
      context.arc(bx, by, radius * 1.74 * coronaPulse, 0, Math.PI * 2);
      context.fill();

      for (let ray = 0; ray < 74; ray += 1) {
        const angle = (ray / 74) * Math.PI * 2 + Math.sin(seconds * .8 + ray * 2.17) * .07;
        const flare = .68 + Math.max(0, Math.sin(seconds * (2.2 + (ray % 9) * .17) + ray * 1.91)) * .62;
        const inner = radius * (.7 + Math.sin(ray * 4.3) * .055);
        const outer = radius * (1.05 + flare * .48 + Math.sin(seconds * 4.6 + ray) * .08);
        context.beginPath();
        context.moveTo(bx + Math.cos(angle) * inner, by + Math.sin(angle) * inner);
        context.quadraticCurveTo(
          bx + Math.cos(angle + .08) * ((inner + outer) * .55),
          by + Math.sin(angle + .08) * ((inner + outer) * .55),
          bx + Math.cos(angle) * outer,
          by + Math.sin(angle) * outer
        );
        context.strokeStyle = "rgba(255," + (142 + ray % 72) + ",36," + (.035 + flare * .055) + ")";
        context.lineWidth = .45 + (ray % 4) * .18;
        context.stroke();
      }
    }

    novaMatter.forEach(function (matter, index) {
      const angle = matter.angle + seconds * matter.speed * (index % 2 ? 1 : -1);
      const ripple = Math.sin(seconds * (1.4 + matter.speed * 3) + matter.wobble) * radius * .09;
      const orbitX = radius * matter.orbit + ripple;
      const orbitY = lost ? orbitX * (.28 + matter.orbit * .12) : orbitX * (.78 + matter.orbit * .1);
      const x = bx + Math.cos(angle) * orbitX;
      const y = by + Math.sin(angle) * orbitY;
      const pulse = .5 + Math.max(0, Math.sin(seconds * 3.1 + matter.wobble)) * sputter;
      context.beginPath();
      context.fillStyle = lost
        ? "rgba(118,174,205," + (matter.alpha * pulse * .42) + ")"
        : matter.heat > .84
          ? "rgba(255,250,207," + (matter.alpha * pulse) + ")"
          : matter.heat > .42
            ? "rgba(255,195,55," + (matter.alpha * pulse) + ")"
            : "rgba(235,105,13," + (matter.alpha * pulse) + ")";
      context.arc(x, y, matter.size * pulse, 0, Math.PI * 2);
      context.fill();
    });

    if (!lost) {
      for (let arc = 0; arc < 5; arc += 1) {
        const arcRadius = radius * (.42 + arc * .16 + Math.sin(seconds * 1.6 + arc) * .035);
        context.beginPath();
        context.strokeStyle = "rgba(255,220,106," + (.06 + sputter * .075) + ")";
        context.lineWidth = .7 + arc * .23;
        context.arc(bx, by, arcRadius, seconds * (.18 + arc * .022) + arc, seconds * (.18 + arc * .022) + arc + Math.PI * (.52 + arc * .08));
        context.stroke();
      }
    }
    context.restore();

    return { bx: bx, by: by, radius: radius };
  }

  function draw(time) {
    const seconds = time * .001;
    const camera = lost ? searchCamera(seconds) : { x: 0, y: 0 };
    const cameraX = camera.x;
    const cameraY = camera.y;
    context.clearRect(0, 0, width, height);

    if (lost) drawBlackHoles(seconds, cameraX, cameraY);

    stars.forEach(function (star) {
      let shimmer = reduced ? 1 : .57 + Math.sin(seconds * star.speed + star.phase) * .31 + Math.sin(seconds * star.speed * .27 + star.phase) * .12;
      if (lost && !reduced) {
        const appearance = Math.sin(seconds * star.vanishSpeed + star.vanish);
        shimmer *= appearance < -.28 ? 0 : Math.min(1, (appearance + .28) * 1.8);
      }
      let x = reduced ? star.x : (star.x + seconds * star.vx + cameraX + width * 2) % width;
      let y = reduced ? star.y : (star.y + seconds * star.vy + cameraY + height * 2) % height;
      if (lost && !reduced) {
        blackHoles.forEach(function (hole, holeIndex) {
          const state = blackHoleState(hole, holeIndex, seconds, cameraX, cameraY);
          const dx = x - state.x;
          const dy = y - state.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const reach = state.radius * 2.35;
          if (distance < reach) {
            const gravity = Math.pow(1 - distance / reach, 2);
            const tangent = (holeIndex % 2 ? -1 : 1) * gravity * state.radius * .19;
            x -= dx / distance * gravity * state.radius * .24;
            y -= dy / distance * gravity * state.radius * .24;
            x += -dy / distance * tangent;
            y += dx / distance * tangent;
            shimmer *= Math.max(.04, 1 - gravity * 1.12);
          }
        });
      }
      context.beginPath();
      context.fillStyle = star.warm
        ? "rgba(215,185,111," + (star.a * shimmer) + ")"
        : "rgba(220,232,239," + (star.a * shimmer) + ")";
      context.arc(x, y, star.r * (.88 + shimmer * .16), 0, Math.PI * 2);
      context.fill();
    });

    if (!lost) drawBirthNova(seconds);

    if (!reduced) frame = window.requestAnimationFrame(draw);
  }

  rebuild();
  draw(0);

  const lostTitle = document.querySelector(".chamber-page--lost .terminal__title");
  if (lostTitle) {
    const titleMessage = "Temporal Event Not Found...";
    lostTitle.setAttribute("aria-label", titleMessage);
    if (reduced) {
      lostTitle.textContent = titleMessage;
    } else {
      const lostLines = Array.from(document.querySelectorAll(".chamber-page--lost .terminal__sequence li"));
      function runLostSearchCycle() {
        document.body.classList.remove("is-search-reset");
        lostTitle.textContent = "";
        lostTitle.classList.add("is-title-typing");
        lostLines.forEach(function (line) {
          line.style.animation = "none";
          void line.offsetWidth;
          line.style.animation = "";
        });
        window.setTimeout(function typeLostTitle() {
          let index = 0;
          function typeCharacter() {
            index += 1;
            lostTitle.textContent = titleMessage.slice(0, index);
            if (index < titleMessage.length) window.setTimeout(typeCharacter, 144);
            else lostTitle.classList.remove("is-title-typing");
          }
          typeCharacter();
        }, 420);
        window.setTimeout(function () { document.body.classList.add("is-search-reset"); }, 33500);
        window.setTimeout(runLostSearchCycle, 36000);
      }
      runLostSearchCycle();
    }
  }

  const sequenceLines = Array.from(document.querySelectorAll(".terminal__sequence li"));
  if (sequenceLines.length === 4 && !lost) {
    const messages = sequenceLines.map(function (line) { return line.textContent.trim(); });
    messages.forEach(function (message, index) { sequenceLines[index].setAttribute("aria-label", message); });

    if (reduced) {
      sequenceLines.forEach(function (line, index) { line.textContent = messages[index]; line.classList.add("is-visible", "is-typed"); });
    } else {
      const cycleDuration = 11000;
      const timers = [];
      function schedule(callback, delay) { timers.push(window.setTimeout(callback, delay)); }
      function runSequenceCycle() {
        timers.splice(0).forEach(window.clearTimeout);
        sequenceLines.forEach(function (line) {
          line.textContent = "";
          line.classList.remove("is-visible", "is-typing", "is-typed");
        });
        [350, 1250, 2150].forEach(function (delay, index) {
          schedule(function () {
            sequenceLines[index].textContent = messages[index];
            sequenceLines[index].classList.add("is-visible");
          }, delay);
        });
        schedule(function () {
          const finalLine = sequenceLines[3];
          let index = 0;
          finalLine.classList.add("is-visible", "is-typing");
          function typeCharacter() {
            index += 1;
            finalLine.textContent = messages[3].slice(0, index);
            if (index < messages[3].length) schedule(typeCharacter, 54 + (messages[3].charAt(index - 1) === " " ? 28 : 0));
            else { finalLine.classList.remove("is-typing"); finalLine.classList.add("is-typed"); }
          }
          typeCharacter();
        }, 3050);
        schedule(function () {
          sequenceLines.forEach(function (line) { line.classList.remove("is-visible"); });
        }, 9650);
        schedule(runSequenceCycle, cycleDuration);
      }
      runSequenceCycle();
    }
  }
  window.addEventListener("resize", function () { rebuild(); if (reduced) draw(0); }, { passive: true });
  document.addEventListener("visibilitychange", function () {
    if (reduced) return;
    if (document.hidden) { cancelAnimationFrame(frame); }
    else { frame = requestAnimationFrame(draw); }
  });
})();
