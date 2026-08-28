(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".about-reveal"));

  if (reducedMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (element) { element.classList.add("is-visible"); });
    return;
  }

  document.documentElement.classList.add("about-motion-enabled");

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });

  reveals.forEach(function (element) { observer.observe(element); });

  var constellation = document.querySelector(".about-constellation");
  var forms = Array.prototype.slice.call(document.querySelectorAll(".about-form"));
  var ticking = false;

  function updateDepth() {
    if (!constellation) return;
    var rect = constellation.getBoundingClientRect();
    var centerDelta = (window.innerHeight * 0.5) - (rect.top + rect.height * 0.5);
    forms.forEach(function (form, index) {
      var depth = (index % 2 === 0 ? 1 : -1) * (4 + index * 1.25);
      var movement = Math.max(-18, Math.min(18, centerDelta / window.innerHeight * depth));
      form.style.setProperty("--about-parallax", movement.toFixed(2) + "px");
    });
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(updateDepth);
      ticking = true;
    }
  }, { passive: true });

  updateDepth();
}());
