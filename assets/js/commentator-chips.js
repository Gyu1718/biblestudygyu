/* ============================================================
   성서 연구 서고 — 주석 칩 A–Z 고정 팔레트
   ------------------------------------------------------------
   처리 대상은 이미 주석 칩으로 표시된 span 요소뿐이다.
     <span class="c">M</span>
     <span class="commentator-chip">D</span>
     <span data-commentator-chip>J</span>

   일반 본문, 제목, 원어, 절 번호, 파싱·품사 배지는 검색하지 않는다.
   ============================================================ */
(function () {
  "use strict";

  if (window.__SCRIPTORIUM_COMMENTATOR_CHIPS__) return;
  window.__SCRIPTORIUM_COMMENTATOR_CHIPS__ = true;

  var script = document.currentScript;
  var CSS_URL = script && script.src
    ? new URL("../css/commentator-chips.css?v=20260724.5", script.src).href
    : "assets/css/commentator-chips.css?v=20260724.5";

  var CHIP_SELECTOR = "span.c, span.commentator-chip, span[data-commentator-chip]";
  var LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  /* A–Z 각각에 고정된 배경색. 모든 칩 글자는 흰색으로 통일한다. */
  var PALETTE = {
    A:["#792a2a","#792a2a"], B:["#287c40","#287c40"], C:["#59247f","#59247f"],
    D:["#716726","#716726"], E:["#276e7c","#276e7c"], F:["#932a63","#932a63"],
    G:["#3e792a","#3e792a"], H:["#312d8f","#312d8f"], I:["#7f4224","#7f4224"],
    J:["#28775a","#28775a"], K:["#75277c","#75277c"], L:["#5f7420","#5f7420"],
    M:["#2a5179","#2a5179"], N:["#8f2d42","#8f2d42"], O:["#247f2c","#247f2c"],
    P:["#53318c","#53318c"], Q:["#7c6027","#7c6027"], R:["#20716e","#20716e"],
    S:["#792a65","#792a65"], T:["#477321","#477321"], U:["#24337f","#24337f"],
    V:["#8c3d31","#8c3d31"], W:["#277c4b","#277c4b"], X:["#752a93","#752a93"],
    Y:["#79792a","#79792a"], Z:["#2d728f","#2d728f"]
  };

  function injectCss() {
    if (document.querySelector("link[data-commentator-chips-css]")) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = CSS_URL;
    link.dataset.commentatorChipsCss = "";
    document.head.appendChild(link);
  }

  function normalizeKey(chip) {
    var explicit = chip.getAttribute("data-commentator-key") || chip.getAttribute("data-chip-letter");
    var value = explicit || chip.textContent || "";
    value = String(value).trim().toUpperCase().replace(/\s+/g, "");
    return /^[A-Z]{1,4}$/.test(value) ? value : "";
  }

  function hashKey(value) {
    var hash = 0;
    for (var i = 0; i < value.length; i++) hash = ((hash * 31) + value.charCodeAt(i)) >>> 0;
    return hash;
  }

  function paletteLetter(key) {
    if (key.length === 1 && PALETTE[key]) return key;
    return LETTERS.charAt(hashKey(key) % LETTERS.length);
  }


  function paintChip(chip) {
    if (!chip || chip.nodeType !== 1 || !chip.matches(CHIP_SELECTOR)) return;
    if (chip.closest(".bible-reader-ui, .research-dock")) return;

    var key = normalizeKey(chip);
    if (!key) {
      chip.removeAttribute("data-commentator-color");
      return;
    }

    var letter = paletteLetter(key);
    var colors = PALETTE[letter];
    chip.dataset.commentatorKey = key;
    chip.dataset.commentatorColor = letter;
    chip.style.setProperty("--cc-chip-bg-light", colors[0]);
    chip.style.setProperty("--cc-chip-fg-light", "#ffffff");
    chip.style.setProperty("--cc-chip-bg-dark", colors[1]);
    chip.style.setProperty("--cc-chip-fg-dark", "#ffffff");
  }

  function scan(root) {
    if (!root) return;
    if (root.nodeType === 1 && root.matches && root.matches(CHIP_SELECTOR)) paintChip(root);
    if (!root.querySelectorAll) return;
    root.querySelectorAll(CHIP_SELECTOR).forEach(paintChip);
  }

  function observe() {
    if (!("MutationObserver" in window)) return;
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === "characterData") {
          var parent = mutation.target.parentElement;
          if (parent && parent.matches(CHIP_SELECTOR)) paintChip(parent);
          return;
        }
        mutation.addedNodes.forEach(function (node) { if (node.nodeType === 1) scan(node); });
      });
    });
    observer.observe(document.body, { childList:true, subtree:true, characterData:true });
  }

  function init() {
    injectCss();
    scan(document);
    observe();
    document.dispatchEvent(new CustomEvent("scriptorium:commentatorchipsready"));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
  else init();
})();
