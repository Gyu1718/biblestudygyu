(function () {
  function loadJson(path, fallback) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", path, false);
      xhr.send(null);
      if (xhr.status >= 200 && xhr.status < 300) return JSON.parse(xhr.responseText);
    } catch (error) {
      console.warn(path + " was not loaded for relation linking.", error);
    }
    return fallback;
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function arr(value) {
    return Array.isArray(value) ? value : [];
  }

  function uniq(items) {
    var seen = {};
    return arr(items).filter(function (item) {
      if (!item || seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }

  var books = loadJson("./data/books.json", []);
  var authors = loadJson("./data/authors.json", []);
  var topics = loadJson("./data/topics.json", []);
  var topicHistoryLinks = loadJson("./data/topic-history-links.json", []);
  var authorHistoryLinks = loadJson("./data/author-history-links.json", []);
  var bookTopicLinks = loadJson("./data/book-topic-links.json", []);
  var historyItems = [].concat(
    loadJson("./data/tradition-history.json", []),
    loadJson("./data/neo-orthodoxy-history.json", []),
    loadJson("./data/neo-orthodoxy-doctrine-history.json", [])
  ).filter(function (item) { return item && item.id; });

  var TOPIC_ALIASES = {
    "신학서론": "theological-method",
    "신학방법론": "theological-method",
    "교의학": "theological-method",
    "계시": "revelation",
    "계시론": "revelation",
    "일반계시": "revelation",
    "특별계시": "revelation",
    "성경": "scripture",
    "성경론": "scripture",
    "신론": "doctrine-of-god",
    "하나님": "doctrine-of-god",
    "삼위일체": "trinity",
    "삼위일체론": "trinity",
    "예정": "predestination",
    "예정론": "predestination",
    "선택": "predestination",
    "언약": "creation-covenant",
    "언약신학": "creation-covenant",
    "창조": "creation-covenant",
    "창조론": "creation-covenant",
    "섭리": "providence-and-evil",
    "죄": "sin",
    "죄론": "sin",
    "인간론": "humanity",
    "기독론": "christology",
    "그리스도": "christology",
    "화해": "atonement-reconciliation",
    "화해론": "atonement-reconciliation",
    "속죄": "atonement-reconciliation",
    "속죄론": "atonement-reconciliation",
    "구원론": "soteriology",
    "구원": "soteriology",
    "칭의": "justification",
    "성화": "sanctification",
    "교회론": "ecclesiology",
    "교회": "ecclesiology",
    "성례론": "ecclesiology",
    "성례": "ecclesiology",
    "종말론": "eschatology"
  };

  var bookMap = {};
  var authorIdByLabel = {};
  var topicIdByLabel = {};
  var topicMap = {};
  var historyMap = {};
  var topicHistoryMap = {};
  var authorHistoryMap = {};
  var bookTopicMap = {};

  books.forEach(function (book) { if (book && book.id) bookMap[book.id] = book; });
  authors.forEach(function (author) {
    if (!author || !author.id) return;
    if (author.koreanName) authorIdByLabel[author.koreanName.trim()] = author.id;
    if (author.name) authorIdByLabel[author.name.trim()] = author.id;
  });
  topics.forEach(function (topic) {
    if (!topic || !topic.id) return;
    topicMap[topic.id] = topic;
    topicIdByLabel[topic.id] = topic.id;
    if (topic.name) topicIdByLabel[topic.name.trim()] = topic.id;
    if (topic.latin) topicIdByLabel[topic.latin.trim()] = topic.id;
    arr(topic.relatedTopics).forEach(function (label) { if (label) topicIdByLabel[String(label).trim()] = topic.id; });
    arr(topic.keywords).forEach(function (label) { if (label) topicIdByLabel[String(label).trim()] = topic.id; });
  });
  Object.keys(TOPIC_ALIASES).forEach(function (label) {
    if (topicMap[TOPIC_ALIASES[label]]) topicIdByLabel[label] = TOPIC_ALIASES[label];
  });
  historyItems.forEach(function (item) { if (item && item.id) historyMap[item.id] = item; });
  topicHistoryLinks.forEach(function (entry) { if (entry && entry.topicId) topicHistoryMap[entry.topicId] = entry; });
  authorHistoryLinks.forEach(function (entry) { if (entry && entry.authorId) authorHistoryMap[entry.authorId] = entry; });
  bookTopicLinks.forEach(function (entry) { if (entry && entry.bookId) bookTopicMap[entry.bookId] = entry; });

  function rawHash() { return decodeURIComponent((location.hash || "").replace(/^#/, "")); }
  function route(type) {
    var raw = rawHash();
    if (raw.indexOf(type + "=") !== 0) return null;
    return raw.split("=")[1] || null;
  }
  function go(type, id) { if (id) location.hash = type + "=" + encodeURIComponent(id); }

  function relationButton(kind, id, label, sub, className) {
    return '<button type="button" class="' + esc(className || "relation-btn") + '" data-relation-kind="' + esc(kind) + '" data-relation-id="' + esc(id) + '"><span>' + esc(sub || kind) + '</span><b>' + esc(label) + '</b></button>';
  }

  function historyButton(historyId, className) {
    var item = historyMap[historyId];
    if (!item) return "";
    return relationButton("history", item.id, item.title || item.id, item.category || "역사", className || "history-link-btn");
  }

  function topicButton(topicId, className) {
    var topic = topicMap[topicId];
    if (!topic) return "";
    return relationButton("topic", topic.id, topic.name || topic.id, topic.category || "교리", className || "topic-link-btn");
  }

  function topicCard(topicId) {
    var topic = topicMap[topicId];
    if (!topic) return "";
    return '<article class="relation-card topic-relation-card">' +
      '<span class="relation-meta">' + esc(topic.category || "교리") + '</span>' +
      '<h5>' + esc(topic.name || topic.id) + '</h5>' +
      (topic.summary ? '<p>' + esc(topic.summary) + '</p>' : '') +
      '<button type="button" data-relation-kind="topic" data-relation-id="' + esc(topic.id) + '">교리 페이지 열기 →</button>' +
    '</article>';
  }

  function historyCard(historyId) {
    var item = historyMap[historyId];
    if (!item) return "";
    return '<article class="relation-card history-relation-card">' +
      '<span class="relation-meta history-relation-meta">' + esc(item.period || item.category || "역사 항목") + '</span>' +
      '<h5>' + esc(item.title || item.id) + '</h5>' +
      (item.summary || item.definition ? '<p>' + esc(item.summary || item.definition) + '</p>' : '') +
      '<button type="button" data-relation-kind="history" data-relation-id="' + esc(item.id) + '">역사 항목 열기 →</button>' +
    '</article>';
  }

  function wire(scope) {
    (scope || document).querySelectorAll("[data-relation-kind][data-relation-id]").forEach(function (button) {
      button.onclick = function () { go(button.getAttribute("data-relation-kind"), button.getAttribute("data-relation-id")); };
    });
  }

  function historySection(entry, sectionClass, title, mode) {
    if (!entry || !entry.historyIds || !entry.historyIds.length) return "";
    var isCard = mode === "card";
    var body = entry.historyIds.map(function (id) {
      return isCard ? historyCard(id) : historyButton(id, "history-link-btn");
    }).filter(Boolean).join("");
    if (!body) return "";
    return '<section class="' + esc(sectionClass || "history-relation-section") + '"><h4>' + esc(title || "관련 역사 항목") + '</h4>' +
      (entry.note ? '<p class="relation-note">' + esc(entry.note) + '</p>' : '') +
      '<div class="' + (isCard ? 'history-relation-card-grid' : 'relation-grid') + '">' + body + '</div></section>';
  }

  function compactHistorySection(entry, sectionClass, title) {
    var ids = arr(entry && entry.historyIds).filter(function (id) { return historyMap[id]; });
    if (!ids.length) return "";
    var buttons = ids.map(function (id) { return historyButton(id, "compact-relation-btn history-link-btn"); }).join("");
    return '<details class="' + esc(sectionClass || "topic-history-section") + ' book-relation-compact relation-compact-section">' +
      '<summary><span>' + esc(title || "관련 역사 항목") + '</span><b>' + ids.length + '개</b></summary>' +
      (entry.note ? '<p class="relation-note">' + esc(entry.note) + '</p>' : '') +
      '<div class="compact-relation-block"><div class="compact-relation-grid">' + buttons + '</div></div>' +
    '</details>';
  }

  function bookLabels(book) {
    var labels = [].concat(arr(book.topics));
    arr(book.parts).forEach(function (part) {
      if (part.title) labels.push(part.title);
      if (part.summary) labels.push(part.summary);
      arr(part.chapters).forEach(function (chapter) {
        labels = labels.concat(arr(chapter.concepts));
        if (chapter.title) labels.push(chapter.title);
        if (chapter.summary) labels.push(chapter.summary);
        if (chapter.detail) labels.push(chapter.detail);
      });
    });
    arr(book.chapters).forEach(function (chapter) {
      labels = labels.concat(arr(chapter.concepts));
      if (chapter.title) labels.push(chapter.title);
      if (chapter.summary) labels.push(chapter.summary);
    });
    return labels.filter(Boolean).map(String);
  }

  function autoTopicIdsForBook(book) {
    var seen = {};
    var result = [];
    bookLabels(book).forEach(function (label) {
      Object.keys(topicIdByLabel).forEach(function (candidate) {
        if (!candidate || seen[topicIdByLabel[candidate]]) return;
        if (label === candidate || label.indexOf(candidate) >= 0) {
          var id = topicIdByLabel[candidate];
          if (topicMap[id]) { seen[id] = true; result.push(id); }
        }
      });
    });
    return result;
  }

  function resolveTopicIdsForBook(book) {
    var manual = bookTopicMap[book.id];
    var manualIds = uniq(arr(manual && manual.topicIds)).filter(function (id) { return topicMap[id]; });
    var autoIds = autoTopicIdsForBook(book).filter(function (id) { return manualIds.indexOf(id) < 0; });
    return manualIds.concat(autoIds).slice(0, 8);
  }

  function historyIdsForBook(book, topicIds) {
    var seen = {};
    var ids = [];
    function add(id) { if (!id || seen[id] || !historyMap[id]) return; seen[id] = true; ids.push(id); }
    var manual = bookTopicMap[book.id];
    arr(manual && manual.historyIds).forEach(add);
    topicIds.forEach(function (topicId) {
      var entry = topicHistoryMap[topicId];
      arr(entry && entry.historyIds).forEach(add);
    });
    return ids.slice(0, 6);
  }

  function installBookRelations() {
    var bookId = route("book");
    if (!bookId) return;
    var book = bookMap[bookId];
    var detailMain = document.querySelector("#view .detail-page .detail-main");
    if (!book || !detailMain || detailMain.querySelector(".book-relation-section")) return;

    var link = bookTopicMap[book.id];
    var topicIds = resolveTopicIdsForBook(book);
    var historyIds = historyIdsForBook(book, topicIds);
    if (!topicIds.length && !historyIds.length) return;

    var topicButtons = topicIds.map(function (id) { return topicButton(id, "compact-relation-btn topic-link-btn"); }).filter(Boolean).join("");
    var historyButtons = historyIds.map(function (id) { return historyButton(id, "compact-relation-btn history-link-btn"); }).filter(Boolean).join("");
    var html = '<details class="topic-section book-relation-section book-relation-compact">' +
      '<summary><span>연결 지도</span><b>교리 ' + topicIds.length + ' · 역사 ' + historyIds.length + '</b></summary>' +
      '<p class="relation-note">' + esc((link && link.note) || "책의 주제어와 장별 개념을 바탕으로 함께 읽을 교리 페이지와 역사 항목을 묶었습니다.") + '</p>' +
      (topicButtons ? '<div class="book-relation-block compact-relation-block"><h5>교리</h5><div class="compact-relation-grid">' + topicButtons + '</div></div>' : '') +
      (historyButtons ? '<div class="book-relation-block compact-relation-block"><h5>역사</h5><div class="compact-relation-grid">' + historyButtons + '</div></div>' : '') +
    '</details>';
    detailMain.insertAdjacentHTML("beforeend", html);
    wire(detailMain);
  }

  function ensureRelationStyles() {
    if (document.querySelector("#relation-card-styles")) return;
    var style = document.createElement("style");
    style.id = "relation-card-styles";
    style.textContent = "\
      .topic-history-section{margin-top:18px;}\
      .relation-note{color:var(--muted);line-height:1.7;margin:0 0 12px;}\
      .history-relation-card-grid,.relation-card-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;}\
      .relation-card,.history-relation-card{border:1px solid var(--line);background:var(--surface);border-radius:13px;padding:14px;}\
      .relation-card .relation-meta,.history-relation-card .history-relation-meta{display:block;font-family:var(--font-mono);font-size:.7rem;color:var(--muted);letter-spacing:.08em;margin-bottom:6px;}\
      .relation-card h5,.history-relation-card h5{font-family:var(--font-display);font-size:1rem;margin:0 0 8px;}\
      .relation-card p,.history-relation-card p{color:var(--muted);font-size:.9rem;line-height:1.65;margin:0 0 12px;}\
      .relation-card button,.history-relation-card button{border:1px solid var(--line-strong);background:var(--surface-2);border-radius:999px;padding:8px 11px;cursor:pointer;color:var(--ink);font-size:.84rem;}\
      .relation-card button:hover,.history-relation-card button:hover{border-color:var(--ink);background:var(--surface);}\
      .book-relation-section{margin:22px 0 0;}\
      .book-relation-compact,.relation-compact-section{border:1px dashed var(--line);background:var(--surface-2);border-radius:14px;padding:0;}\
      .book-relation-compact summary,.relation-compact-section summary{display:flex;align-items:center;justify-content:space-between;gap:12px;cursor:pointer;padding:12px 14px;list-style:none;}\
      .book-relation-compact summary::-webkit-details-marker,.relation-compact-section summary::-webkit-details-marker{display:none;}\
      .book-relation-compact summary span,.relation-compact-section summary span{font-family:var(--font-display);font-weight:700;}\
      .book-relation-compact summary b,.relation-compact-section summary b{font-family:var(--font-mono);font-size:.76rem;color:var(--muted);font-weight:500;}\
      .book-relation-compact[open],.relation-compact-section[open]{padding-bottom:12px;}\
      .book-relation-compact[open] summary,.relation-compact-section[open] summary{border-bottom:1px solid var(--line);margin-bottom:12px;}\
      .book-relation-compact .relation-note,.relation-compact-section .relation-note{font-size:.9rem;margin:0 14px 12px;}\
      .book-relation-block{margin-top:14px;}\
      .book-relation-block h5{font-family:var(--font-display);font-size:.98rem;margin:0 0 10px;}\
      .compact-relation-block{margin:10px 14px 0;}\
      .compact-relation-block h5{font-size:.88rem;margin-bottom:8px;color:var(--muted);}\
      .compact-relation-grid{display:flex;gap:7px;flex-wrap:wrap;}\
      .compact-relation-btn{border:1px solid var(--line);background:var(--surface);border-radius:999px;padding:7px 10px;cursor:pointer;color:var(--ink);font-size:.82rem;}\
      .compact-relation-btn span{font-family:var(--font-mono);font-size:.66rem;color:var(--muted);margin-right:5px;}\
      .compact-relation-btn:hover{border-color:var(--ink);background:var(--surface-2);}\
      .relation-grid{display:flex;gap:8px;flex-wrap:wrap;}\
      .relation-grid .history-link-btn{border:1px solid var(--line);background:var(--surface);border-radius:999px;padding:8px 12px;cursor:pointer;color:var(--ink);}\
      .relation-grid .history-link-btn span{font-family:var(--font-mono);font-size:.68rem;color:var(--muted);margin-right:6px;}\
      @media(max-width:820px){.history-relation-card-grid,.relation-card-grid{grid-template-columns:1fr;}.book-relation-compact summary,.relation-compact-section summary{align-items:flex-start;flex-direction:column;gap:4px;}}\
    ";
    document.head.appendChild(style);
  }

  function installTopicHistory() {
    var topicId = route("topic");
    if (topicId) {
      var detailBody = document.querySelector("#view .topic-detail-body");
      if (detailBody && !detailBody.querySelector(".topic-history-section")) {
        var html = compactHistorySection(topicHistoryMap[topicId], "topic-section topic-history-section", "관련 역사 항목");
        if (html) {
          var refs = detailBody.querySelector(".refs");
          if (refs) refs.insertAdjacentHTML("beforebegin", html);
          else detailBody.insertAdjacentHTML("beforeend", html);
          wire(detailBody);
        }
      }
      return;
    }

    var compareHead = document.querySelector("#view .compare .compare-head");
    if (!compareHead || compareHead.querySelector(".topic-history-section")) return;
    var title = compareHead.querySelector("h3");
    if (!title) return;
    var label = title.childNodes && title.childNodes.length ? title.childNodes[0].textContent.trim() : title.textContent.trim();
    var id = topicIdByLabel[label];
    var html = historySection(topicHistoryMap[id], "topic-history-section", "관련 역사 항목", "button");
    if (html) { compareHead.insertAdjacentHTML("beforeend", html); wire(compareHead); }
  }

  function installAuthorHistory() {
    var activeTab = document.querySelector('.tab.is-active[data-view="authors"]');
    if (!activeTab) return;
    document.querySelectorAll("#view .card").forEach(function (card) {
      if (card.querySelector(".author-history-section")) return;
      var title = card.querySelector("h3");
      if (!title) return;
      var authorId = authorIdByLabel[title.textContent.trim()];
      var html = historySection(authorHistoryMap[authorId], "author-history-section", "관련 역사 항목", "button");
      if (html) { card.insertAdjacentHTML("beforeend", html); wire(card); }
    });
  }

  function installRelations() {
    ensureRelationStyles();
    installBookRelations();
    installTopicHistory();
    installAuthorHistory();
  }

  var view = document.querySelector("#view");
  if (view) {
    var observer = new MutationObserver(function () { installRelations(); });
    observer.observe(view, { childList: true, subtree: true });
  }
  window.addEventListener("hashchange", function () { setTimeout(installRelations, 0); });
  document.addEventListener("DOMContentLoaded", installRelations);
  setTimeout(installRelations, 0);
})();
