(function () {
  "use strict";

  if (window.__SCRIPTORIUM_GLOBAL_STUDY_FEATURES__) return;
  window.__SCRIPTORIUM_GLOBAL_STUDY_FEATURES__ = true;

  var body = document.body;
  if (!body) return;

  function isResearchSurface() {
    if (body.hasAttribute("data-no-reading-progress")) return false;
    if (body.classList.contains("book-shelf-page")) return true;
    if (body.getAttribute("data-book")) return true;
    return /\/(?:ot|nt)\//i.test(location.pathname);
  }

  function mountReadingProgress() {
    if (!isResearchSurface() || document.querySelector(".reading-progress")) return;

    var bar = document.createElement("div");
    bar.className = "reading-progress";
    bar.setAttribute("aria-hidden", "true");
    bar.innerHTML = "<span></span>";
    body.prepend(bar);

    var fill = bar.firstElementChild;
    var scheduled = false;

    function update() {
      scheduled = false;
      var doc = document.documentElement;
      var top = window.pageYOffset || doc.scrollTop || body.scrollTop || 0;
      var height = Math.max(doc.scrollHeight, body.scrollHeight);
      var viewport = window.innerHeight || doc.clientHeight || 1;
      var max = Math.max(1, height - viewport);
      var percent = Math.min(100, Math.max(0, top / max * 100));
      fill.style.width = percent.toFixed(3) + "%";
      bar.classList.toggle("is-complete", percent >= 99.75);
    }

    function requestUpdate() {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    window.addEventListener("load", requestUpdate, { once: true });

    if ("ResizeObserver" in window) {
      var observer = new ResizeObserver(requestUpdate);
      observer.observe(document.documentElement || body);
    }

    update();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountReadingProgress, { once: true });
  } else {
    mountReadingProgress();
  }
})();
