(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("room-modules-ready");

  const revealItems = [...document.querySelectorAll("[data-room-reveal]")];
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-present"));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-present");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.08 });
    revealItems.forEach((item) => observer.observe(item));
  }

  document.querySelectorAll("[data-room-media-activate]").forEach((button) => {
    button.addEventListener("click", () => {
      const frame = button.closest(".media-frame");
      const surface = frame?.querySelector(".media-frame__surface");
      const source = button.dataset.embedSrc;
      const title = button.dataset.embedTitle || "Room media";
      if (!frame || !surface) return;

      if (!source) {
        const state = frame.querySelector(".media-frame__placeholder-state");
        if (state) state.hidden = false;
        button.textContent = "Sample activated";
        button.disabled = true;
        return;
      }

      const embed = document.createElement("iframe");
      embed.src = source;
      embed.title = title;
      embed.loading = "lazy";
      embed.allow = "accelerometer; autoplay; encrypted-media; picture-in-picture";
      embed.allowFullscreen = true;
      surface.replaceChildren(embed);
      frame.dataset.mediaState = "active";
    }, { once: true });
  });

  const audioPlayers = [...document.querySelectorAll("audio[data-room-audio]")];
  audioPlayers.forEach((player) => {
    player.addEventListener("play", () => {
      audioPlayers.forEach((other) => {
        if (other !== player && !other.paused) other.pause();
      });
    });
  });

  const menu = document.querySelector(".house-menu");
  if (menu) {
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menu.open) {
        menu.open = false;
        menu.querySelector("summary")?.focus();
      }
    });
    document.addEventListener("pointerdown", (event) => {
      if (menu.open && !menu.contains(event.target)) menu.open = false;
    });
  }
})();
