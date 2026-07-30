/* 성서 지식사전 · 선택 영역 자동 연결 + 호버 카드
 * 자동 스캔 대상: [data-encyclopedia-scan], .encyclopedia-scan, .dict-scan
 * 성경 구절(.scripture-ref/[data-bible-ref])과 원어([data-strong])는 절대 재가공하지 않는다.
 */
(function () {
  "use strict";
  if (window.Encyclopedia) return;

  var CAT = {person:"인물",place:"지명",people:"민족",group:"집단",institution:"제도·직분",object:"사물·건축",event:"사건",concept:"신학 개념",text:"성경 문헌"};
  var script = document.currentScript;
  var siteRoot = script && script.src ? new URL("../../", script.src).href : "/biblestudygyu/";
  var indexUrl = script && script.dataset.index ? new URL(script.dataset.index, location.href).href : new URL("assets/data/encyclopedia/index.json", siteRoot).href;
  var entryBase = new URL("encyclopedia/entry.html?id=", siteRoot).href;
  var byId = Object.create(null);
  var patterns = [];
  var matcher = null;
  var popover = null;
  var activeAnchor = null;
  var hideTimer = null;
  var pinned = false;
  var scanned = new WeakSet();

  var SKIP_SELECTOR = [
    "a","button","script","style","pre","code","kbd","samp","textarea","input","select","option","nav","svg","math",
    "[data-strong]",".original-word",".hw",".lexicon-popover",
    ".scripture-ref","[data-bible-ref]","[data-bible-range]",".bible-reader-ui",".bible-reader-tooltip",
    "[data-entity]",".encyclopedia-link",".encyclopedia-popover","[data-encyclopedia-skip]",
    ".xref-panel",".legend",".apparatus",".bibliography","footer"
  ].join(",");

  var Encyclopedia = window.Encyclopedia = {
    siteRoot: siteRoot,
    index: [],
    byId: byId,
    scan: scan,
    scanAll: scanAll,
    hide: function () { hide(true); }
  };

  Encyclopedia.ready = fetch(indexUrl, { credentials: "same-origin" })
    .then(function (response) {
      if (!response.ok) throw new Error("성서 지식사전 목록을 불러오지 못했습니다.");
      return response.json();
    })
    .then(function (index) {
      Encyclopedia.index = index;
      index.forEach(function (entry) { byId[entry.id] = entry; });
      buildMatcher(index);
      mountPopover();
      prepareManualEntities(document);
      waitForScriptureThenScan();
      return index;
    })
    .catch(function (error) {
      console.warn("[encyclopedia]", error.message);
      return [];
    });

  function escapeRegExp(value) { return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>\"]/g, function (ch) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch];
    });
  }

  function buildMatcher(index) {
    var claims = Object.create(null);
    index.forEach(function (entry) {
      ((entry.match && entry.match.ignore) || []).forEach(function (term) {
        if (term) claims[term] = { kind: "ignore", term: term };
      });
    });
    index.forEach(function (entry) {
      ((entry.match && entry.match.primary) || []).forEach(function (term) {
        if (term && !claims[term]) claims[term] = { kind: "entity", term: term, id: entry.id };
      });
    });
    patterns = Object.keys(claims).map(function (term) { return claims[term]; })
      .sort(function (a, b) { return b.term.length - a.term.length; });
    if (patterns.length) matcher = new RegExp("(" + patterns.map(function (item) { return escapeRegExp(item.term); }).join("|") + ")", "g");
    Encyclopedia.claims = claims;
  }

  function shouldSkipTextNode(node) {
    var parent = node.parentElement;
    if (!parent || !node.nodeValue || !node.nodeValue.trim()) return true;
    return Boolean(parent.closest(SKIP_SELECTOR));
  }

  function blockFor(node, root) {
    return node.parentElement.closest("p,li,td,th,.note,.caveat,.vs,.field,blockquote") || root;
  }

  function scan(root) {
    if (!root || !matcher || scanned.has(root)) return;
    scanned.add(root);
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var nodes = [];
    while (walker.nextNode()) {
      var node = walker.currentNode;
      if (shouldSkipTextNode(node)) continue;
      matcher.lastIndex = 0;
      if (matcher.test(node.nodeValue)) nodes.push(node);
    }

    var states = new WeakMap();
    nodes.forEach(function (node) {
      var block = blockFor(node, root);
      var state = states.get(block) || { ids: Object.create(null), count: 0 };
      states.set(block, state);
      linkNode(node, state);
    });
  }

  function linkNode(node, state) {
    var text = node.nodeValue;
    var claims = Encyclopedia.claims || {};
    var fragment = document.createDocumentFragment();
    var last = 0;
    var match;
    matcher.lastIndex = 0;

    while ((match = matcher.exec(text))) {
      var raw = match[0];
      var claim = claims[raw];
      if (match.index > last) fragment.appendChild(document.createTextNode(text.slice(last, match.index)));

      if (!claim || claim.kind === "ignore" || state.count >= 4 || state.ids[claim.id]) {
        fragment.appendChild(document.createTextNode(raw));
      } else {
        var entry = byId[claim.id];
        if (!entry) fragment.appendChild(document.createTextNode(raw));
        else {
          var anchor = document.createElement("a");
          anchor.className = "encyclopedia-link t-" + entry.type;
          anchor.dataset.entity = entry.id;
          anchor.href = entryUrl(entry.id);
          anchor.textContent = raw;
          anchor.setAttribute("aria-label", entry.name.ko + " 성서 지식사전 열기");
          fragment.appendChild(anchor);
          state.ids[entry.id] = true;
          state.count += 1;
        }
      }
      last = match.index + raw.length;
    }
    if (last < text.length) fragment.appendChild(document.createTextNode(text.slice(last)));
    if (last) node.parentNode.replaceChild(fragment, node);
  }

  function scanAll() {
    prepareManualEntities(document);
    document.querySelectorAll("[data-encyclopedia-scan],.encyclopedia-scan,.dict-scan").forEach(scan);
  }

  function waitForScriptureThenScan() {
    var bibleScriptPresent = Boolean(document.querySelector('script[data-bible-reader-js],script[src*="bible-reader.js"]'));
    if (!bibleScriptPresent) { scanAll(); return; }
    var attempts = 0;
    (function wait() {
      if (window.__SCRIPTORIUM_REFERENCE_ENGINE__) { setTimeout(scanAll, 0); return; }
      if (attempts++ < 100) { setTimeout(wait, 50); return; }
      scanAll();
    })();
  }

  function prepareManualEntities(root) {
    root.querySelectorAll("[data-entity]").forEach(function (node) {
      if (node.closest(".scripture-ref,[data-bible-ref],[data-bible-range],[data-strong]")) return;
      var entry = byId[node.dataset.entity];
      if (!entry) return;
      node.classList.add("encyclopedia-link", "t-" + entry.type);
      if (node.tagName === "A") node.href = entryUrl(entry.id);
      else {
        node.setAttribute("role", "link");
        if (!node.hasAttribute("tabindex")) node.tabIndex = 0;
      }
    });
  }

  function entryUrl(id) {
    return entryBase + encodeURIComponent(id);
  }

  function mountPopover() {
    if (popover) return;
    popover = document.createElement("aside");
    popover.className = "encyclopedia-popover";
    popover.setAttribute("role", "dialog");
    popover.setAttribute("aria-label", "성서 지식사전 미리보기");
    popover.hidden = true;
    document.body.appendChild(popover);
    popover.addEventListener("mouseenter", function () { clearTimeout(hideTimer); });
    popover.addEventListener("mouseleave", function () { if (!pinned) hide(); });

    document.addEventListener("mouseover", function (event) {
      if (matchMedia("(hover: none)").matches) return;
      var anchor = targetOf(event.target);
      if (!anchor) return;
      clearTimeout(hideTimer);
      hideTimer = setTimeout(function () { show(anchor, false); }, 260);
    });
    document.addEventListener("mouseout", function (event) {
      var anchor = targetOf(event.target);
      if (!anchor || pinned) return;
      var next = event.relatedTarget;
      if (popover && next && popover.contains(next)) return;
      hideTimer = setTimeout(function () { hide(); }, 110);
    });
    document.addEventListener("focusin", function (event) { var anchor = targetOf(event.target); if (anchor) show(anchor, false); });
    document.addEventListener("focusout", function (event) { if (targetOf(event.target)) hide(); });
    document.addEventListener("click", function (event) {
      var anchor = targetOf(event.target);
      if (anchor && matchMedia("(hover: none)").matches) {
        event.preventDefault();
        show(anchor, true);
        return;
      }
      if (popover && !popover.contains(event.target) && !anchor) hide(true);
    });
    document.addEventListener("keydown", function (event) {
      var anchor = targetOf(event.target);
      if (anchor && (event.key === "Enter" || event.key === " ") && anchor.tagName !== "A") {
        event.preventDefault();
        show(anchor, true);
      }
      if (event.key === "Escape") hide(true);
    });
    window.addEventListener("scroll", function () { if (!pinned) hide(true); }, { passive: true });
  }

  function targetOf(node) {
    var target = node && node.closest ? node.closest(".encyclopedia-link,[data-entity]") : null;
    if (!target || target.closest(".scripture-ref,[data-bible-ref],[data-bible-range],[data-strong]")) return null;
    return target;
  }

  function hideCompetingPopovers() {
    if (window.BibleLexiconHover && typeof window.BibleLexiconHover.hide === "function") window.BibleLexiconHover.hide();
    var scripture = document.querySelector(".bible-reader-tooltip");
    if (scripture) scripture.hidden = true;
  }

  function show(anchor, pin) {
    var entry = byId[anchor.dataset.entity];
    if (!entry) return;
    hideCompetingPopovers();
    activeAnchor = anchor;
    pinned = Boolean(pin);
    popover.className = "encyclopedia-popover t-" + entry.type;
    popover.innerHTML = [
      '<div class="ep-top"></div>',
      '<div class="ep-chips"><span>' + escapeHtml(CAT[entry.type] || entry.type) + '</span>' + (entry.subtype ? '<span>' + escapeHtml(entry.subtype) + '</span>' : '') + '</div>',
      '<div class="ep-name"><b>' + escapeHtml(entry.name.ko) + '</b><span>' + escapeHtml(entry.name.en) + '</span></div>',
      '<p class="ep-line">' + escapeHtml(entry.line) + '</p>',
      '<p class="ep-hover">' + escapeHtml(entry.hover) + '</p>',
      '<a class="ep-more" href="' + escapeHtml(entryUrl(entry.id)) + '">자세히 보기 →</a>'
    ].join("");
    position(anchor);
  }

  function position(anchor) {
    if (!popover || activeAnchor !== anchor) return;
    var rect = anchor.getBoundingClientRect();
    popover.hidden = false;
    popover.style.visibility = "hidden";
    var box = popover.getBoundingClientRect();
    var left = Math.max(12, Math.min(window.innerWidth - box.width - 12, rect.left));
    var top = rect.bottom + 9;
    if (top + box.height > window.innerHeight - 12) top = rect.top - box.height - 9;
    popover.style.left = left + "px";
    popover.style.top = Math.max(12, top) + "px";
    popover.style.visibility = "visible";
  }

  function hide(force) {
    clearTimeout(hideTimer);
    if (pinned && !force) return;
    pinned = false;
    activeAnchor = null;
    if (popover) popover.hidden = true;
  }

  ["mouseover", "focusin", "click"].forEach(function (eventName) {
    document.addEventListener(eventName, function (event) {
      var target = event.target && event.target.closest ? event.target.closest("[data-strong],.scripture-ref,[data-bible-ref],[data-bible-range]") : null;
      if (target) hide(true);
    }, true);
  });
})();
