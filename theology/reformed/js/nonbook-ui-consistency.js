/* Non-book UI consistency enhancer
   Adds lightweight headers and view classes for compare, authors, and history.
   It intentionally skips the books view and book detail route. */
(function () {
  var META = {
    compare: {
      label: "COMPARE · LOCI",
      title: "개념 비교",
      desc: "개혁파 정통과 신정통주의의 입장을 한 주제 안에서 나란히 읽는 비교 화면입니다."
    },
    authors: {
      label: "AUTHORS · THEOLOGIANS",
      title: "학자 색인",
      desc: "주요 신학자의 시대, 전통, 핵심 주제를 빠르게 확인하는 입문용 색인입니다."
    },
    history: {
      label: "HISTORY · TRADITION",
      title: "개혁전통·신정통주의 역사",
      desc: "논쟁, 문헌, 인물, 교리 쟁점을 역사적 흐름 속에서 확인하는 페이지입니다."
    }
  };

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function routeType() {
    var raw = decodeURIComponent((location.hash || "").replace(/^#/, ""));
    if (raw.indexOf("topic=") === 0) return "topic";
    if (raw.indexOf("history=") === 0) return "history-detail";
    if (raw.indexOf("book=") === 0) return "book-detail";
    return null;
  }

  function activeView() {
    var route = routeType();
    if (route) return route;
    var tab = document.querySelector(".tab.is-active");
    return tab ? tab.dataset.view : "compare";
  }

  function setViewClass(name) {
    var view = document.querySelector("#view");
    if (!view) return;
    Array.prototype.slice.call(view.classList).forEach(function (klass) {
      if (klass.indexOf("view-") === 0) view.classList.remove(klass);
    });
    view.classList.add("view-" + name);
  }

  function headerHtml(meta) {
    return '<section class="nonbook-view-header" aria-label="페이지 안내">' +
      '<span class="label">' + esc(meta.label) + '</span>' +
      '<h3>' + esc(meta.title) + '</h3>' +
      '<p>' + esc(meta.desc) + '</p>' +
    '</section>';
  }

  function ensureHeader(name) {
    var view = document.querySelector("#view");
    var meta = META[name];
    if (!view || !meta) return;
    if (view.querySelector(":scope > .nonbook-view-header")) return;
    var target = view.firstElementChild;
    if (!target) return;
    if (target.classList.contains("detail-page") || target.classList.contains("confession-wrap")) return;
    target.insertAdjacentHTML("beforebegin", headerHtml(meta));
  }

  function enhance() {
    var name = activeView();
    setViewClass(name);
    if (name === "books" || name === "book-detail" || name === "confessions") return;
    if (META[name]) ensureHeader(name);
  }

  function patchViewRenderer(name) {
    if (typeof VIEWS === "undefined" || !VIEWS[name] || VIEWS[name].__nonbookConsistency) return;
    var original = VIEWS[name];
    var patched = function () {
      original();
      enhance();
    };
    patched.__nonbookConsistency = true;
    VIEWS[name] = patched;
  }

  function install() {
    ["compare", "authors", "history"].forEach(patchViewRenderer);
    enhance();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();

  var view = document.querySelector("#view");
  if (view) {
    var observer = new MutationObserver(function () { enhance(); });
    observer.observe(view, { childList: true, subtree: false });
  }

  window.addEventListener("hashchange", function () { setTimeout(enhance, 0); });
  document.addEventListener("click", function (event) {
    if (event.target.closest(".tab") || event.target.closest("[data-topic-open]") || event.target.closest("[data-history-open]")) {
      setTimeout(enhance, 0);
    }
  });
  setTimeout(install, 0);
  setTimeout(install, 150);
}());
