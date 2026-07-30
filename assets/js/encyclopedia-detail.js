/* 성서 지식사전 · Markdown 런타임 상세 렌더러 */
(function () {
  "use strict";
  var CAT = {person:"인물",place:"지명",people:"민족",group:"집단",institution:"제도·직분",object:"사물·건축",event:"사건",concept:"신학 개념",text:"성경 문헌"};
  function idFromQuery() { return new URLSearchParams(location.search).get("id"); }
  function h(value) { var div = document.createElement("div"); div.textContent = value == null ? "" : value; return div.innerHTML; }

  window.Encyclopedia.ready.then(function () {
    var id = idFromQuery();
    var entry = window.Encyclopedia.byId[id];
    var root = document.getElementById("encyclopedia-entry");
    if (!entry) { root.innerHTML = '<p class="enc-error">항목을 찾을 수 없습니다: <code>' + h(id) + '</code></p>'; return; }
    document.title = entry.name.ko + " · 성서 지식사전";
    var relations = (entry.relations || []).map(function (relationId) {
      var related = window.Encyclopedia.byId[relationId];
      return '<a class="enc-relation encyclopedia-link t-' + h(related ? related.type : "concept") + '" data-entity="' + h(relationId) + '" href="entry.html?id=' + encodeURIComponent(relationId) + '">' + h(related ? related.name.ko : relationId) + '</a>';
    }).join("") || "—";
    var sources = (entry.sources || []).map(function (source) { return "<li>" + h(source) + "</li>"; }).join("");

    root.className = "encyclopedia-entry t-" + entry.type;
    root.innerHTML = [
      '<a class="enc-back" href="index.html">← 지식사전 목록</a>',
      '<header class="enc-head">',
        '<div class="enc-chips"><span class="enc-chip enc-chip-cat">' + h(CAT[entry.type] || entry.type) + '</span>' + (entry.subtype ? '<span class="enc-chip">' + h(entry.subtype) + '</span>' : '') + (entry.level ? '<span class="enc-chip">' + h(entry.level) + '</span>' : '') + '</div>',
        '<h1>' + h(entry.name.ko) + '</h1>',
        '<div class="enc-names"><span>' + h(entry.name.en) + '</span><code>' + h([entry.name.original, entry.name.translit].filter(Boolean).join(" · ")) + '</code></div>',
        '<p class="enc-summary">' + h(entry.line) + '</p>',
      '</header>',
      '<div class="enc-body" data-encyclopedia-scan id="encyclopedia-body"><p class="enc-loading">본문 불러오는 중…</p></div>',
      '<aside class="enc-apparatus">',
        apparatusRow("주요 본문", entry.refs && entry.refs.primary),
        apparatusRow("핵심", entry.refs && entry.refs.key),
        '<div class="enc-row"><span class="enc-label">관계</span><div>' + relations + '</div></div>',
        '<div class="enc-sources"><span class="enc-label">자료</span><ul>' + sources + '</ul></div>',
      '</aside>'
    ].join("");

    fetch(new URL("content/encyclopedia/" + entry.type + "/" + id + ".md", window.Encyclopedia.siteRoot).href, { credentials: "same-origin" })
      .then(function (response) { if (!response.ok) throw new Error(); return response.text(); })
      .then(function (markdown) {
        var body = document.getElementById("encyclopedia-body");
        body.innerHTML = '<div class="enc-body-content">' + renderBody(stripFrontmatter(markdown)) + '</div>';
        window.Encyclopedia.scan(body.firstElementChild);
      })
      .catch(function () { document.getElementById("encyclopedia-body").innerHTML = '<p class="enc-error">본문을 불러오지 못했습니다.</p>'; });
  });

  function apparatusRow(label, values) {
    var content = values && values.length ? values.map(function (value) { return '<span class="enc-ref">' + h(value) + '</span>'; }).join("") : '<span class="enc-ref is-empty">—</span>';
    return '<div class="enc-row"><span class="enc-label">' + label + '</span><div>' + content + '</div></div>';
  }
  function stripFrontmatter(markdown) {
    if (markdown.slice(0, 3) !== "---") return markdown;
    var end = markdown.indexOf("\n---", 3);
    return end === -1 ? markdown : markdown.slice(markdown.indexOf("\n", end + 1) + 1);
  }
  function renderBody(markdown) {
    return markdown.trim().split(/\n{2,}/).map(function (block) {
      block = block.trim();
      if (!block) return "";
      if (block.slice(0, 4) === "### ") return "<h3>" + inline(block.slice(4)) + "</h3>";
      if (block.slice(0, 3) === "## ") return "<h2>" + inline(block.slice(3)) + "</h2>";
      return "<p>" + inline(block.replace(/\n/g, " ")) + "</p>";
    }).join("");
  }
  function inline(text) {
    text = h(text);
    text = text.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\*(.+?)\*/g, "<i>$1</i>");
    return text.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  }
})();
