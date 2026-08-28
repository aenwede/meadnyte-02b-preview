(() => {
  "use strict";

  const field = document.querySelector("[data-room-atmosphere]");
  if (!field || !field.getContext && field.querySelector("canvas")) return;

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return;

  canvas.className = "room-atmosphere-canvas";
  canvas.setAttribute("aria-hidden", "true");
  field.append(canvas);

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let width = 1;
  let height = 1;
  let stars = [];
  let wells = [];
  let frame = 0;
  let start = 0;
  let resizeTimer = 0;

  const random = (() => {
    let seed = 62026;
    return () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
  })();

  const rebuild = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = Math.max(1, window.innerWidth);
    height = Math.max(1, window.innerHeight);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const starCount = Math.min(260, Math.max(110, Math.round((width * height) / 6500)));
    stars = Array.from({ length: starCount }, () => ({
      x: random() * width,
      y: random() * height,
      radius: 0.28 + random() * 1.15,
      alpha: 0.12 + random() * 0.42,
      speed: 0.02 + random() * 0.08,
      phase: random() * Math.PI * 2,
      warm: random() > 0.82
    }));
    wells = [
      { x: width * 0.78, y: height * 0.28, radius: Math.min(width, height) * 0.19, phase: 0.4 },
      { x: width * 0.16, y: height * 0.76, radius: Math.min(width, height) * 0.14, phase: 2.2 }
    ];
  };

  const drawWell = (well, elapsed) => {
    const pulse = reducedMotion.matches ? 1 : 0.98 + Math.sin(elapsed * 0.08 + well.phase) * 0.02;
    const radius = well.radius * pulse;
    const shadow = context.createRadialGradient(well.x, well.y, 0, well.x, well.y, radius);
    shadow.addColorStop(0, "rgba(0,0,0,.94)");
    shadow.addColorStop(0.48, "rgba(0,0,0,.72)");
    shadow.addColorStop(0.72, "rgba(55,39,76,.14)");
    shadow.addColorStop(1, "rgba(0,0,0,0)");
    context.fillStyle = shadow;
    context.beginPath();
    context.arc(well.x, well.y, radius, 0, Math.PI * 2);
    context.fill();

    const lens = context.createRadialGradient(well.x, well.y, radius * 0.46, well.x, well.y, radius * 0.92);
    lens.addColorStop(0, "rgba(0,0,0,0)");
    lens.addColorStop(0.69, "rgba(215,185,111,.055)");
    lens.addColorStop(0.76, "rgba(168,145,192,.045)");
    lens.addColorStop(1, "rgba(0,0,0,0)");
    context.fillStyle = lens;
    context.beginPath();
    context.arc(well.x, well.y, radius, 0, Math.PI * 2);
    context.fill();
  };

  const draw = (timestamp = 0) => {
    if (!start) start = timestamp;
    const elapsed = (timestamp - start) / 1000;
    context.clearRect(0, 0, width, height);
    wells.forEach((well) => drawWell(well, elapsed));
    stars.forEach((star) => {
      const drift = reducedMotion.matches ? 0 : elapsed * star.speed;
      const alpha = star.alpha * (reducedMotion.matches ? 1 : 0.78 + Math.sin(elapsed * 0.28 + star.phase) * 0.22);
      context.fillStyle = star.warm ? `rgba(215,185,111,${alpha})` : `rgba(238,232,220,${alpha})`;
      context.beginPath();
      context.arc((star.x + drift) % width, star.y, star.radius, 0, Math.PI * 2);
      context.fill();
    });
    frame = reducedMotion.matches ? 0 : requestAnimationFrame(draw);
  };

  const restart = () => {
    if (frame) cancelAnimationFrame(frame);
    start = 0;
    rebuild();
    draw();
  };

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(restart, 150);
  }, { passive: true });
  reducedMotion.addEventListener?.("change", restart);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else if (!document.hidden && !frame && !reducedMotion.matches) {
      start = 0;
      frame = requestAnimationFrame(draw);
    }
  });

  rebuild();
  frame = reducedMotion.matches ? (draw(), 0) : requestAnimationFrame(draw);
})();
