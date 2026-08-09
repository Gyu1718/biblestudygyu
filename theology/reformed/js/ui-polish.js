/* UI polish layer.
   Adds search reset, compact relation sections, and mobile tab navigation support
   without rewriting the core app renderer.
   CSS rules live in CSS files. Passage detail routing is handled by relations.js. */
(function () {
  var tabScrollTicking = false;

  function loadJson(path, fallback) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", path, false);
      xhr.send(null);
      if (xhr.status >= 200 && xhr.status < 300) return JSON.parse(xhr.responseText);
    } catch (error) {
      console.warn(path + " was not loaded for UI polish.", error);
    }
    return fallback;
  }

  var passages = loadJson("./data/passages.json", []);
  var passageById = {};
  passages.forEach(function (passage) {
    if (passage && passage.id) passageById[passage.id] = passage;
  });

  function ensureStyles() {
    // Styles for this layer are maintained in CSS files.
  }

  function ensureSearchClear() {
    var search = document.querySelector(".search");
    var input = document.querySelector("#q");
    if (!search || !input) return;
    input.classList.add("has-clear");
    var btn = search.querySelector(".search-clear");
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "search-clear";
      btn.setAttribute("aria-label", "검색어 지우기");
      btn.textContent = "×";
      search.appendChild(btn);
      btn.addEventListener("click", function () {
        input.value = "";
        input.dispatchEvent(new Event("input", { bubbles: true }));
        if ((location.hash || "").indexOf("#passage=") === 0) {
          history.pushState("", document.title, location.pathname + location.search);
        }
        updateSearchClear();
      });
      input.addEventListener("input", updateSearchClear);
    }
    updateSearchClear();
  }

  function updateSearchClear() {
    var input = document.querySelector("#q");
    var btn = document.querySelector(".search-clear");
    if (!input || !btn) return;
    btn.classList.toggle("is-visible", !!input.value.trim());
  }

  function clearFilterFromNotice() {
    var input = document.querySelector("#q");
    if (!input) return;
    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    if ((location.hash || "").indexOf("#passage=") === 0) {
      history.pushState("", document.title, location.pathname + location.search);
    }
    updateSearchClear();
  }

  function ensureFilterNotice() {
    var input = document.querySelector("#q");
    var view = document.querySelector("#view");
    if (!input || !view) return;
    var old = document.querySelector(".filter-notice");
    if (!input.value.trim()) {
      if (old) old.remove();
      return;
    }
    if (!old) {
      old = document.createElement("div");
      old.className = "filter-notice";
      view.parentNode.insertBefore(old, view);
    }
    old.innerHTML = '현재 <b>“' + input.value.trim() + '”</b>로 필터링 중입니다. <button type="button">전체 보기</button>';
    old.querySelector("button").onclick = clearFilterFromNotice;
  }

  function collapseSection(section, label, openOnDetail) {
    if (!section || section.dataset.uiCollapsed === "true") return;
    var card = section.closest(".card");
    var detail = section.closest(".detail-page");
    if (!card && !detail) return;
    if (detail && openOnDetail) return;
    var details = document.createElement("details");
    details.className = "relation-collapse";
    details.dataset.uiCollapsed = "true";
    var summary = document.createElement("summary");
    summary.textContent = label;
    var body = document.createElement("div");
    body.className = "relation-collapse-body";
    section.dataset.uiCollapsed = "true";
    section.parentNode.insertBefore(details, section);
    body.appendChild(section);
    details.appendChild(summary);
    details.appendChild(body);
  }

  function compactRelationSections() {
    document.querySelectorAll("#view .card .passage-theology-section").forEach(function (section) { collapseSection(section, "신학 연결", false); });
    document.querySelectorAll("#view .card .passage-book-section").forEach(function (section) { collapseSection(section, "관련 책", false); });
    document.querySelectorAll("#view .card .book-passage-section").forEach(function (section) { collapseSection(section, "관련 성경 본문", false); });
    document.querySelectorAll("#view .card .author-history-section").forEach(function (section) { collapseSection(section, "관련 역사", false); });
    document.querySelectorAll("#view .card .topic-history-section").forEach(function (section) { collapseSection(section, "관련 역사", false); });
  }

  function updateTabOverflow() {
    var tabs = document.querySelector(".tabs");
    if (!tabs) return;
    var hasOverflow = tabs.scrollWidth > tabs.clientWidth + 4;
    var hasLeft = tabs.scrollLeft > 4;
    var hasRight = tabs.scrollLeft + tabs.clientWidth < tabs.scrollWidth - 4;
    tabs.classList.toggle("tab-overflow-left", hasOverflow && hasLeft);
    tabs.classList.toggle("tab-overflow-right", hasOverflow && hasRight);
    tabs.classList.toggle("has-tab-overflow", hasOverflow);
    var hint = document.querySelector(".tabs-scroll-hint");
    if (hint) hint.hidden = !hasOverflow;
  }

  function centerActiveTab() {
    var tabs = document.querySelector(".tabs");
    var active = tabs && tabs.querySelector(".tab.is-active");
    if (!tabs || !active) return;
    if (tabs.scrollWidth <= tabs.clientWidth + 4) return;
    active.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    setTimeout(updateTabOverflow, 180);
  }

  function ensureMobileTabNavigation() {
    var tabs = document.querySelector(".tabs");
    if (!tabs) return;
    tabs.classList.add("tabs-polished");

    var hint = document.querySelector(".tabs-scroll-hint");
    if (!hint) {
      hint = document.createElement("p");
      hint.className = "tabs-scroll-hint";
      hint.textContent = "탭은 좌우로 밀어 더 볼 수 있습니다.";
      tabs.insertAdjacentElement("afterend", hint);
    }

    if (tabs.dataset.mobileTabWired !== "true") {
      tabs.dataset.mobileTabWired = "true";
      tabs.addEventListener("scroll", function () {
        if (tabScrollTicking) return;
        tabScrollTicking = true;
        requestAnimationFrame(function () {
          updateTabOverflow();
          tabScrollTicking = false;
        });
      });
      tabs.addEventListener("click", function (event) {
        if (!event.target.closest(".tab")) return;
        setTimeout(centerActiveTab, 80);
      });
      window.addEventListener("resize", function () {
        setTimeout(function () {
          updateTabOverflow();
          centerActiveTab();
        }, 120);
      });
    }

    updateTabOverflow();
    setTimeout(centerActiveTab, 0);
  }

  function applyPassageRoute() {
    if (window.__RELATIONS_HANDLES_PASSAGE_ROUTE__) return;
    var raw = decodeURIComponent((location.hash || "").replace(/^#/, ""));
    if (raw.indexOf("passage=") !== 0) return;
    var id = raw.split("=")[1];
    var passage = passageById[id];
    if (!passage) return;
    var input = document.querySelector("#q");
    if (!input) return;
    input.value = passage.reference;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    var tab = document.querySelector('.tab[data-view="passages"]');
    if (tab) tab.click();
    history.replaceState("", document.title, location.pathname + location.search + "#passage=" + encodeURIComponent(id));
    setTimeout(function () {
      var cards = Array.prototype.slice.call(document.querySelectorAll("#view .card.passage"));
      var target = cards.find(function (card) {
        var title = card.querySelector("h3");
        return title && title.textContent.trim() === passage.reference;
      });
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      updateSearchClear();
      ensureFilterNotice();
    }, 120);
  }

  function install() {
    ensureStyles();
    ensureSearchClear();
    updateSearchClear();
    ensureFilterNotice();
    compactRelationSections();
    ensureMobileTabNavigation();
    applyPassageRoute();
  }

  var view = document.querySelector("#view");
  if (view) {
    var observer = new MutationObserver(function () { install(); });
    observer.observe(view, { childList: true, subtree: true });
  }
  window.addEventListener("hashchange", function () {
    setTimeout(function () {
      install();
      centerActiveTab();
    }, 0);
  });
  document.addEventListener("DOMContentLoaded", install);
  setTimeout(install, 0);
})();
