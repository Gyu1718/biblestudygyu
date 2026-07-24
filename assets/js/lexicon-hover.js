(function () {
  "use strict";
  var core = window.BibleLexiconCore;
  if (!core) return;
  var popup = null;
  var timer = null;
  var active = null;
  var pinned = false;

  function ensurePopup() {
    if (popup) return popup;
    popup = document.createElement("aside");
    popup.className = "lexicon-popover";
    popup.setAttribute("role", "dialog");
    popup.setAttribute("aria-label", "원어 사전 미리보기");
    popup.hidden = true;
    document.body.appendChild(popup);
    popup.addEventListener("mouseenter", function () { clearTimeout(timer); });
    popup.addEventListener("mouseleave", function () { if (!pinned) hide(); });
    return popup;
  }

  function summary(entry) {
    var text = entry.summaryKo || (entry.supplement && (entry.supplement.glossEn || entry.supplement.definitionEn)) || "풀이를 확인하세요.";
    text = String(text).replace(/\s+/g, " ").trim();
    return text.length > 310 ? text.slice(0, 307) + "…" : text;
  }

  function render(entry, alternatives, anchor) {
    var lang = entry.language === "hebrew" ? "히브리어" : "헬라어";
    var lemmaClass = entry.language === "hebrew" ? " is-hebrew" : " is-greek";
    return [
      '<div class="lp-head"><span class="lp-id">' + core.escapeHtml(entry.id) + '</span><span class="lp-lang">' + lang + '</span></div>',
      '<div class="lp-lemma' + lemmaClass + '">' + core.escapeHtml(entry.lemma || entry.id) + '</div>',
      '<div class="lp-meta">' + [entry.transliteration, entry.pronunciationKo, entry.partOfSpeech].filter(Boolean).map(core.escapeHtml).join(" · ") + '</div>',
      (anchor && (anchor.dataset.morph || anchor.textContent.trim() !== entry.lemma) ? '<div class="lp-form">본문 형태 <b>' + core.escapeHtml(anchor.textContent.trim()) + '</b>' + (anchor.dataset.morph ? ' · <code>' + core.escapeHtml(anchor.dataset.morph) + '</code>' : '') + '</div>' : ''),
      '<p class="lp-summary">' + core.escapeHtml(summary(entry)) + '</p>',
      alternatives > 1 ? '<p class="lp-alt">동형어 후보 ' + alternatives + '개 · 상세 페이지에서 확인</p>' : '',
      '<a class="lp-open" href="' + core.escapeHtml(core.entryUrl(entry.id)) + '">상세 사전 열기 →</a>'
    ].join("");
  }

  function position(anchor) {
    var p = ensurePopup();
    var rect = anchor.getBoundingClientRect();
    p.hidden = false;
    p.style.visibility = "hidden";
    var pr = p.getBoundingClientRect();
    var left = Math.max(12, Math.min(window.innerWidth - pr.width - 12, rect.left));
    var top = rect.bottom + 9;
    if (top + pr.height > window.innerHeight - 12) top = rect.top - pr.height - 9;
    p.style.left = left + "px";
    p.style.top = Math.max(12, top) + "px";
    p.style.visibility = "visible";
  }

  function show(anchor, pin) {
    var ids = core.idsFrom(anchor.getAttribute("data-strong") || anchor.textContent);
    if (!ids.length) return;
    active = anchor;
    pinned = Boolean(pin);
    var p = ensurePopup();
    p.hidden = false;
    p.innerHTML = '<div class="lp-loading">사전 항목을 불러오는 중…</div>';
    position(anchor);
    core.loadEntry(ids[0]).then(function (entry) {
      if (active !== anchor) return;
      p.innerHTML = render(entry, ids.length, anchor);
      position(anchor);
    }).catch(function (error) {
      p.innerHTML = '<div class="lp-error">' + core.escapeHtml(error.message) + '</div>';
      position(anchor);
    });
  }

  function hide(force) {
    clearTimeout(timer);
    if (pinned && !force) return;
    pinned = false;
    active = null;
    if (popup) popup.hidden = true;
  }

  function targetOf(node) { return node && node.closest ? node.closest("[data-strong]") : null; }

  document.addEventListener("mouseover", function (event) {
    if (matchMedia("(hover: none)").matches) return;
    var target = targetOf(event.target);
    if (!target) return;
    clearTimeout(timer);
    timer = setTimeout(function () { show(target, false); }, 260);
  });
  document.addEventListener("mouseout", function (event) {
    var target = targetOf(event.target);
    if (!target || pinned) return;
    var next = event.relatedTarget;
    if (popup && next && popup.contains(next)) return;
    timer = setTimeout(function () { hide(); }, 100);
  });
  document.addEventListener("focusin", function (event) { var t = targetOf(event.target); if (t) show(t, false); });
  document.addEventListener("focusout", function (event) { if (targetOf(event.target)) hide(); });
  document.addEventListener("click", function (event) {
    var target = targetOf(event.target);
    if (target && !target.closest("a[href*='lexicon/entry']")) {
      event.preventDefault();
      show(target, true);
      return;
    }
    if (popup && !popup.contains(event.target)) hide(true);
  });
  document.addEventListener("keydown", function (event) { if (event.key === "Escape") hide(true); });
  window.addEventListener("scroll", function () { if (!pinned) hide(true); }, { passive: true });

  window.BibleLexiconHover = { show: show, hide: function () { hide(true); } };
})();
