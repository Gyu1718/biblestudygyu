/* Render Calvin Institutes study notes on Calvin detail pages.
   The notes are editorial summaries only; no source full text is embedded. */
(function () {
  var NOTE_URLS = [
    "data/books/calvin-study-notes-book-1.json",
    "data/books/calvin-study-notes-book-2.json",
    "data/books/calvin-study-notes-book-3.json",
    "data/books/calvin-study-notes-book-4.json"
  ];
  var notesByRef = {};
  var loaded = false;

  function arr(value) { return Array.isArray(value) ? value : []; }
  function esc(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  function injectStyles() {
    if (document.querySelector("#calvin-study-render-styles")) return;
    var style = document.createElement("style");
    style.id = "calvin-study-render-styles";
    style.textContent = "\n" +
      ".calvin-study-blocks{margin-top:14px;display:grid;gap:10px}\n" +
      ".calvin-study-details{margin-top:12px;border:1px solid var(--line);border-radius:12px;background:var(--surface);padding:0}\n" +
      ".calvin-study-details>summary{cursor:pointer;list-style:none;padding:12px 14px;font-weight:700;color:var(--ink)}\n" +
      ".calvin-study-details>summary::-webkit-details-marker{display:none}\n" +
      ".calvin-study-details>summary:after{content:'＋';float:right;color:var(--muted)}\n" +
      ".calvin-study-details[open]>summary:after{content:'－'}\n" +
      ".calvin-study-details .calvin-study-blocks{padding:0 14px 14px}\n" +
      ".calvin-study-card{border:1px solid var(--line);background:var(--surface-2);border-radius:12px;padding:13px 14px}\n" +
      ".calvin-study-card h5{margin:0 0 7px;font-family:var(--font-mono);font-size:.76rem;letter-spacing:.08em;color:var(--muted);text-transform:uppercase}\n" +
      ".calvin-study-card p{margin:0;color:var(--muted);line-height:1.75}\n" +
      ".calvin-study-card ol,.calvin-study-card ul{margin:0;padding-left:20px;color:var(--muted)}\n" +
      ".calvin-study-card li{margin:6px 0;line-height:1.65}\n" +
      ".calvin-study-subtopics{display:grid;gap:8px}\n" +
      ".calvin-study-subtopics div{border:1px solid var(--line);border-radius:10px;background:var(--surface);padding:10px 11px}\n" +
      ".calvin-study-subtopics span{display:block;color:var(--ink);font-weight:700;margin-bottom:4px}\n" +
      ".calvin-study-subtopics p{margin-top:4px}\n" +
      ".calvin-study-subtopics em{font-style:normal;color:var(--ink);font-weight:700}\n";
    document.head.appendChild(style);
  }
  function loadJson(url) {
    return fetch(url)
      .then(function (response) {
        if (!response.ok) return null;
        return response.json();
      })
      .catch(function (error) {
        console.warn(url + " was not loaded by Calvin study renderer.", error);
        return null;
      });
  }
  function loadNotes() {
    if (loaded) return Promise.resolve(notesByRef);
    return Promise.all(NOTE_URLS.map(loadJson)).then(function (packs) {
      packs.forEach(function (pack) {
        arr(pack && pack.notes).forEach(function (note) {
          if (!note || !note.ref || notesByRef[note.ref]) return;
          notesByRef[note.ref] = note;
        });
      });
      loaded = true;
      return notesByRef;
    });
  }
  function card(title, html) {
    return html ? '<section class="calvin-study-card"><h5>' + esc(title) + '</h5>' + html + '</section>' : "";
  }
  function field(label, value) {
    return value ? '<p><em>' + esc(label) + ':</em> ' + esc(value) + '</p>' : "";
  }
  function subtopicHTML(item) {
    var explanation = item.note || item.description || item.summary || "";
    var hasDistinctExplanation = explanation && explanation !== item.summary;
    return "<div><span>" + esc(item.title) + "</span>" +
      field(hasDistinctExplanation ? "요약" : "소주제 설명", item.summary || explanation) +
      (hasDistinctExplanation ? field("소주제 설명", explanation) : "") +
      field("논증 역할", item.argumentRole) +
      field("개혁파 비교", item.reformedContrast) +
      field("학습 질문", item.studyPrompt) +
      "</div>";
  }
  function renderBlocks(note) {
    var blocks = [];
    blocks.push(card("핵심 질문", note.question ? "<p>" + esc(note.question) + "</p>" : ""));
    blocks.push(card("핵심 주장", note.thesis ? "<p>" + esc(note.thesis) + "</p>" : ""));
    blocks.push(card("논증 흐름", arr(note.argumentFlow).length ? "<ol>" + arr(note.argumentFlow).map(function (item) { return "<li>" + esc(item) + "</li>"; }).join("") + "</ol>" : ""));
    blocks.push(card("소주제 요약·설명", arr(note.subtopicNotes).length ? '<div class="calvin-study-subtopics">' + arr(note.subtopicNotes).map(subtopicHTML).join("") + "</div>" : ""));
    blocks.push(card("개혁파 정통과의 비교", note.reformedContrast ? "<p>" + esc(note.reformedContrast) + "</p>" : ""));
    blocks.push(card("학습 질문", arr(note.studyQuestions).length ? "<ul>" + arr(note.studyQuestions).map(function (item) { return "<li>" + esc(item) + "</li>"; }).join("") + "</ul>" : ""));
    return '<div class="calvin-study-blocks" data-calvin-study-rendered="true">' + blocks.join("") + "</div>";
  }
  function renderDetails(note) {
    return '<details class="calvin-study-details" data-calvin-study-rendered="true"><summary>장별 학습노트 펼치기</summary>' + renderBlocks(note) + '</details>';
  }
  function findRef(text) {
    var match = String(text || "").match(/\b(?:I|II|III|IV)\.\d+\b/);
    return match ? match[0] : "";
  }
  function apply() {
    injectStyles();
    var map = notesByRef;
    if (!Object.keys(map).length) return;

    document.querySelectorAll(".result-card.full-width").forEach(function (cardNode) {
      if (cardNode.querySelector('[data-calvin-study-rendered="true"]')) return;
      var meta = cardNode.querySelector(".card-meta");
      var ref = findRef(meta && meta.textContent);
      var note = map[ref];
      if (!note) return;
      cardNode.insertAdjacentHTML("beforeend", renderBlocks(note));
    });

    document.querySelectorAll(".chapter-item, .result-card:not(.full-width)").forEach(function (node) {
      if (node.querySelector('[data-calvin-study-rendered="true"]')) return;
      var meta = node.querySelector(".card-meta");
      if (!meta) return;
      var ref = findRef(meta.textContent);
      var note = map[ref];
      if (!note) return;
      node.insertAdjacentHTML("beforeend", renderDetails(note));
    });
  }
  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function () {
      scheduled = false;
      loadNotes().then(apply);
    });
  }
  document.addEventListener("DOMContentLoaded", schedule);
  window.addEventListener("popstate", schedule);
  window.addEventListener("hashchange", schedule);
  var root = document.querySelector("#calvin-root");
  if (root) new MutationObserver(schedule).observe(root, { childList: true, subtree: true });
  schedule();
})();
