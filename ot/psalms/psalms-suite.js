(function () {
  "use strict";

  var ranges = [
    { min: 1, max: 41, file: "book1.html" },
    { min: 42, max: 72, file: "book2.html" },
    { min: 73, max: 89, file: "book3.html" },
    { min: 90, max: 106, file: "book4.html" },
    { min: 107, max: 150, file: "book5.html" }
  ];

  function targetForPsalm(number) {
    for (var i = 0; i < ranges.length; i++) {
      if (number >= ranges[i].min && number <= ranges[i].max) {
        var anchor = number === 9 || number === 10 ? "ps9-10"
          : number === 42 || number === 43 ? "ps42-43"
          : "ps" + number;
        return ranges[i].file + "#" + anchor;
      }
    }
    return null;
  }

  /*
   * 공통 연구 도크와 시편 편 찾기의 충돌 방지.
   * 도크 트리거의 실제 좌표를 읽어 편 찾기를 그 위에 자동 배치한다.
   */
  function syncFloatingControls() {
    var jump = document.querySelector(".ps-jump-button");
    var popover = document.querySelector(".ps-jump-popover");
    if (!jump || !popover) return;

    var trigger = document.querySelector(".research-dock .rd-trigger");
    var right = window.innerWidth <= 767 ? 12 : 16;
    var bottom = window.innerWidth <= 767 ? 12 : 16;

    if (trigger && trigger.getClientRects().length) {
      var dockRect = trigger.getBoundingClientRect();
      right = Math.max(12, Math.round(window.innerWidth - dockRect.right));
      /* 도크 버튼 윗면에서 10px 위에 편 찾기 버튼의 아랫면을 둔다. */
      bottom = Math.max(12, Math.round(window.innerHeight - dockRect.top + 10));
    }

    jump.style.setProperty("--ps-jump-right", right + "px");
    jump.style.setProperty("--ps-jump-bottom", bottom + "px");

    requestAnimationFrame(function () {
      var jumpRect = jump.getBoundingClientRect();
      var popoverBottom = Math.max(bottom + 54, Math.round(window.innerHeight - jumpRect.top + 10));
      popover.style.setProperty("--ps-jump-right", right + "px");
      popover.style.setProperty("--ps-popover-bottom", popoverBottom + "px");
    });
  }

  function watchResearchDock() {
    syncFloatingControls();
    if (document.querySelector(".research-dock .rd-trigger")) return;

    var observer = new MutationObserver(function () {
      if (!document.querySelector(".research-dock .rd-trigger")) return;
      observer.disconnect();
      syncFloatingControls();
    });
    observer.observe(document.body, { childList:true, subtree:true });
    setTimeout(function () {
      observer.disconnect();
      syncFloatingControls();
    }, 5000);
  }

  function createDeclaredReference(documentRef, chapter, start, end, raw) {
    var span = documentRef.createElement("span");
    span.setAttribute("data-bible-ref", "PSA." + chapter + "." + start + (end && end !== start ? "-" + end : ""));
    span.textContent = raw;
    return span;
  }

  function shouldSkip(node) {
    var parent = node.parentElement;
    return !parent || Boolean(parent.closest(
      "a,button,script,style,pre,code,textarea,input,select,option,nav,.hw,.scripture-ref,[data-bible-ref],[data-bible-range],[data-no-scripture-link]"
    ));
  }

  function annotateVerseOnlyReferences(container, chapter) {
    if (!chapter) return;
    var re = /(^|[^0-9가-힣A-Za-z])(\d{1,3})(?:\s*[–—-]\s*(\d{1,3}))?\s*절/g;
    var walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    var nodes = [];
    while (walker.nextNode()) {
      if (!shouldSkip(walker.currentNode) && re.test(walker.currentNode.nodeValue)) {
        nodes.push(walker.currentNode);
      }
      re.lastIndex = 0;
    }

    nodes.forEach(function (node) {
      var text = node.nodeValue;
      var frag = document.createDocumentFragment();
      var pos = 0;
      var match;
      re.lastIndex = 0;
      while ((match = re.exec(text))) {
        var prefix = match[1] || "";
        var startIndex = match.index + prefix.length;
        if (startIndex > pos) frag.appendChild(document.createTextNode(text.slice(pos, startIndex)));
        var raw = text.slice(startIndex, re.lastIndex);
        frag.appendChild(createDeclaredReference(document, chapter, Number(match[2]), match[3] ? Number(match[3]) : null, raw));
        pos = re.lastIndex;
      }
      if (pos < text.length) frag.appendChild(document.createTextNode(text.slice(pos)));
      node.parentNode.replaceChild(frag, node);
    });
  }

  function preparePsalmContexts() {
    document.querySelectorAll("[data-psalm-context]").forEach(function (container) {
      var chapter = Number(container.getAttribute("data-psalm-context"));
      if (chapter > 0) annotateVerseOnlyReferences(container, chapter);
    });
  }

  function mountJump() {
    if (document.querySelector(".ps-jump-button")) return;
    var button = document.createElement("button");
    button.type = "button";
    button.className = "ps-jump-button";
    button.textContent = "편 찾기";
    button.setAttribute("aria-expanded", "false");

    var box = document.createElement("div");
    box.className = "ps-jump-popover";
    box.hidden = true;
    box.innerHTML =
      '<label for="ps-jump-input">이동할 시편 번호</label>' +
      '<form class="ps-jump-form">' +
      '<input id="ps-jump-input" type="number" min="1" max="150" inputmode="numeric" placeholder="1–150">' +
      '<button type="submit">이동</button>' +
      '</form>' +
      '<div class="ps-jump-message" aria-live="polite"></div>';

    document.body.appendChild(button);
    document.body.appendChild(box);

    button.addEventListener("click", function () {
      box.hidden = !box.hidden;
      button.setAttribute("aria-expanded", box.hidden ? "false" : "true");
      document.body.classList.toggle("ps-jump-open", !box.hidden);
      syncFloatingControls();
      if (!box.hidden) box.querySelector("input").focus();
    });

    box.querySelector("form").addEventListener("submit", function (event) {
      event.preventDefault();
      var input = box.querySelector("input");
      var message = box.querySelector(".ps-jump-message");
      var number = Number(input.value);
      var target = targetForPsalm(number);
      if (!target) {
        message.textContent = "1부터 150 사이의 편 번호를 입력하세요.";
        return;
      }
      location.href = target;
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !box.hidden) {
        box.hidden = true;
        document.body.classList.remove("ps-jump-open");
        button.setAttribute("aria-expanded", "false");
      }
    });
  }

  function trackCurrentPsalm() {
    if (!("IntersectionObserver" in window)) return;
    var sections = Array.prototype.slice.call(document.querySelectorAll(".chap[id^='ps'],.psalm[id^='ps']"));
    if (!sections.length) return;
    var links = Array.prototype.slice.call(document.querySelectorAll("nav.toc a[href^='#ps']"));
    var observer = new IntersectionObserver(function (entries) {
      var visible = entries.filter(function (entry) { return entry.isIntersecting; })
        .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; })[0];
      if (!visible) return;
      links.forEach(function (link) {
        link.classList.toggle("is-current", link.getAttribute("href") === "#" + visible.target.id);
      });
    }, { rootMargin: "-20% 0px -68% 0px", threshold: [0, .15, .35] });
    sections.forEach(function (section) { observer.observe(section); });
  }

  function init() {
    preparePsalmContexts();
    mountJump();
    watchResearchDock();
    trackCurrentPsalm();
    window.addEventListener("resize", syncFloatingControls, { passive:true });
    window.addEventListener("orientationchange", function () {
      setTimeout(syncFloatingControls, 120);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
