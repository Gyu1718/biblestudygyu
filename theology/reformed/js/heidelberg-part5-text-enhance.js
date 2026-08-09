/* Heidelberg Catechism self-translation part 5 renderer.
   Reads docs/heidelberg-catechism-self-translation-part5.md and injects Q/A cards on the Heidelberg page. */
(function () {
  var CACHE = null;

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function loadText() {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "./docs/heidelberg-catechism-self-translation-part5.md", false);
      xhr.send(null);
      if (xhr.status >= 200 && xhr.status < 300) return xhr.responseText || "";
    } catch (error) {
      console.warn("Heidelberg Catechism part 5 was not loaded.", error);
    }
    return "";
  }

  function lordDayFor(number) {
    if (number <= 119) return "제45주일";
    if (number <= 121) return "제46주일";
    if (number <= 122) return "제47주일";
    if (number <= 123) return "제48주일";
    if (number <= 124) return "제49주일";
    if (number <= 125) return "제50주일";
    if (number <= 126) return "제51주일";
    if (number <= 129) return "제52주일";
    return "추후 수록";
  }

  function parseMarkdown(text) {
    var items = [];
    var current = null;
    text.split(/\r?\n/).forEach(function (line) {
      var match = line.match(/^###\s+문\s+(\d+)\.\s+(.+)$/);
      if (match) {
        if (current) items.push(current);
        var number = parseInt(match[1], 10);
        current = { number: number, question: match[2].trim(), answer: [], lordDay: lordDayFor(number) };
        return;
      }
      if (current && line.trim() && !/^#/.test(line)) current.answer.push(line.trim());
    });
    if (current) items.push(current);
    items.forEach(function (item) { item.answer = item.answer.join(" "); });
    return items.sort(function (a, b) { return a.number - b.number; });
  }

  function readItems() {
    if (CACHE) return CACHE;
    CACHE = parseMarkdown(loadText());
    return CACHE;
  }

  function currentQuery() {
    return (typeof state !== "undefined" && state.q ? state.q : "").toLowerCase();
  }

  function isHeidelbergPage() {
    var page = document.querySelector(".confession-page");
    if (!page) return false;
    var title = page.querySelector("h3");
    return title && title.textContent.indexOf("하이델베르크 요리문답") !== -1;
  }

  function ensureStyles() {
    if (document.querySelector("#heidelberg-part5-text-styles")) return;
    var style = document.createElement("style");
    style.id = "heidelberg-part5-text-styles";
    style.textContent = "\
      .heidelberg-part5-section{margin-top:18px;border:1px solid var(--line);border-radius:var(--radius);background:var(--surface-2);padding:18px;}\
      .heidelberg-part5-head{display:flex;gap:12px;align-items:flex-end;justify-content:space-between;margin-bottom:14px;}\
      .heidelberg-part5-head h4{font-family:var(--font-display);font-size:1.18rem;margin:0;}\
      .heidelberg-part5-head p{margin:4px 0 0;color:var(--muted);font-size:.9rem;line-height:1.6;}\
      .heidelberg-part5-tools{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;}\
      .heidelberg-part5-filter{border:1px solid var(--line);background:var(--surface);border-radius:999px;padding:7px 10px;font-size:.82rem;cursor:pointer;color:var(--muted);}\
      .heidelberg-part5-filter.is-active{border-color:var(--ink);color:var(--ink);font-weight:700;}\
      .heidelberg-part5-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px;}\
      .heidelberg-part5-card{border:1px solid var(--line);border-radius:14px;background:var(--surface);padding:14px 15px;}\
      .heidelberg-part5-card .num{font-family:var(--font-mono);font-size:.72rem;color:var(--faint);display:block;margin-bottom:5px;}\
      .heidelberg-part5-card h5{margin:0 0 8px;font-family:var(--font-display);font-size:1rem;line-height:1.45;}\
      .heidelberg-part5-card p{margin:0;color:var(--muted);font-size:.88rem;line-height:1.75;}\
      @media(max-width:720px){.heidelberg-part5-head{display:block;}.heidelberg-part5-grid{grid-template-columns:1fr;}}\
    ";
    document.head.appendChild(style);
  }

  function cardHtml(item) {
    return '<article class="heidelberg-part5-card"><span class="num">' + esc(item.lordDay) + ' · 문 ' + item.number + '</span><h5>' + esc(item.question) + '</h5><p>' + esc(item.answer) + '</p></article>';
  }

  function renderCards(container, lordDay) {
    var q = currentQuery();
    var items = readItems().filter(function (item) {
      var text = [item.number, item.question, item.answer, item.lordDay].join(" ").toLowerCase();
      return (!lordDay || item.lordDay === lordDay) && (!q || text.indexOf(q) !== -1);
    });
    container.querySelector(".heidelberg-part5-grid").innerHTML = items.length ? items.map(cardHtml).join("") : '<div class="empty"><b>하이델베르크 5차분</b>에서 조건에 맞는 문답을 찾지 못했습니다.</div>';
    container.querySelector(".heidelberg-part5-count").textContent = String(items.length);
  }

  function install() {
    if (!isHeidelbergPage()) return;
    var page = document.querySelector(".confession-page");
    if (!page || page.querySelector(".heidelberg-part5-section")) return;
    ensureStyles();
    var groups = ["전체", "제45주일", "제46주일", "제47주일", "제48주일", "제49주일", "제50주일", "제51주일", "제52주일"];
    var section = document.createElement("section");
    section.className = "heidelberg-part5-section";
    section.innerHTML = '<div class="heidelberg-part5-head"><div><h4>하이델베르크 요리문답 자체 번역 5차분</h4><p>제45–52주일, 문 116–129까지 수록했습니다. 기도와 주기도문 해설을 다룹니다.</p></div><span class="tag"><b class="heidelberg-part5-count">0</b> 문답</span></div><div class="heidelberg-part5-tools">' + groups.map(function (group, index) { return '<button type="button" class="heidelberg-part5-filter ' + (index === 0 ? 'is-active' : '') + '" data-heidelberg-part5-filter="' + esc(group === "전체" ? "" : group) + '">' + esc(group) + '</button>'; }).join("") + '</div><div class="heidelberg-part5-grid"></div>';
    page.appendChild(section);
    renderCards(section, "");
    section.querySelectorAll("[data-heidelberg-part5-filter]").forEach(function (button) {
      button.onclick = function () {
        section.querySelectorAll(".heidelberg-part5-filter").forEach(function (node) { node.classList.remove("is-active"); });
        button.classList.add("is-active");
        renderCards(section, button.getAttribute("data-heidelberg-part5-filter") || "");
      };
    });
  }

  function boot() {
    install();
    var view = document.querySelector("#view");
    if (view) new MutationObserver(function () { setTimeout(install, 0); }).observe(view, { childList: true, subtree: true });
    document.addEventListener("click", function () { setTimeout(install, 0); });
    window.addEventListener("hashchange", function () { setTimeout(install, 0); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
