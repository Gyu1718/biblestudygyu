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
    ? new URL("../css/commentator-chips.css?v=20260724.4", script.src).href
    : "assets/css/commentator-chips.css?v=20260724.4";

  var CHIP_SELECTOR = "span.c, span.commentator-chip, span[data-commentator-chip]";
  var LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  /* A–Z 각각에 고정된 라이트·다크 테마 색상 */
  var PALETTE = {
    A:["#792a2a","#da8b8b"], B:["#2d8f4a","#98e2ad"], C:["#59247f","#b98ed7"],
    D:["#8c8031","#dfd79a"], E:["#276e7c","#88cfdd"], F:["#932a63","#dd9dbf"],
    G:["#3e792a","#9fda8b"], H:["#312d8f","#9b98e2"], I:["#7f4224","#d7a68e"],
    J:["#318c6a","#9adfc5"], K:["#75277c","#d688dd"], L:["#7d932a","#cfdd9d"],
    M:["#2a5179","#8bb2da"], N:["#8f2d42","#e298a7"], O:["#247f2c","#8ed794"],
    P:["#53318c","#b49adf"], Q:["#7c6027","#ddc188"], R:["#2a938f","#9dddda"],
    S:["#792a65","#da8bc6"], T:["#5a8f2d","#b9e298"], U:["#24337f","#8e9ad7"],
    V:["#8c3d31","#dfa39a"], W:["#277c4b","#88ddac"], X:["#752a93","#ca9ddd"],
    Y:["#79792a","#dada8b"], Z:["#2d728f","#98cce2"]
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

  function relativeLuminance(hex) {
    var rgb = [1, 3, 5].map(function (start) {
      var value = parseInt(hex.slice(start, start + 2), 16) / 255;
      return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
    });
    return (0.2126 * rgb[0]) + (0.7152 * rgb[1]) + (0.0722 * rgb[2]);
  }

  function contrast(a, b) {
    var high = Math.max(relativeLuminance(a), relativeLuminance(b));
    var low = Math.min(relativeLuminance(a), relativeLuminance(b));
    return (high + 0.05) / (low + 0.05);
  }

  function readableInk(background, darkCandidate) {
    var white = "#ffffff";
    var dark = darkCandidate || "#15171c";
    return contrast(background, white) >= contrast(background, dark) ? white : dark;
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
    chip.style.setProperty("--cc-chip-fg-light", readableInk(colors[0], "#15171c"));
    chip.style.setProperty("--cc-chip-bg-dark", colors[1]);
    chip.style.setProperty("--cc-chip-fg-dark", readableInk(colors[1], "#15171c"));
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
