(function () {
  "use strict";

  var script = document.currentScript;
  var siteRoot = script && script.src ? new URL("../../", script.src).href : "/biblestudygyu/";
  var DATA_ROOT = new URL("assets/data/bible/kor/", siteRoot).href;
  var MANIFEST_URL = new URL("manifest.json", DATA_ROOT).href;
  var ORIGINAL_URL = new URL("bible/original.html", siteRoot).href;
  var BOOKS = [
    ["GEN", "창세기", "창", "genesis"], ["EXO", "출애굽기", "출", "exodus"],
    ["LEV", "레위기", "레", "leviticus"], ["NUM", "민수기", "민", "numbers"],
    ["DEU", "신명기", "신", "deuteronomy"], ["JOS", "여호수아", "수", "joshua"],
    ["JDG", "사사기", "삿", "judges"], ["RUT", "룻기", "룻", "ruth"],
    ["1SA", "사무엘상", "삼상", "1-samuel"], ["2SA", "사무엘하", "삼하", "2-samuel"],
    ["1KI", "열왕기상", "왕상", "1-kings"], ["2KI", "열왕기하", "왕하", "2-kings"],
    ["1CH", "역대상", "대상", "1-chronicles"], ["2CH", "역대하", "대하", "2-chronicles"],
    ["EZR", "에스라", "스", "ezra"], ["NEH", "느헤미야", "느", "nehemiah"],
    ["EST", "에스더", "에", "esther"], ["JOB", "욥기", "욥", "job"],
    ["PSA", "시편", "시", "psalms"], ["PRO", "잠언", "잠", "proverbs"],
    ["ECC", "전도서", "전", "ecclesiastes"], ["SNG", "아가", "아", "song-of-songs"],
    ["ISA", "이사야", "사", "isaiah"], ["JER", "예레미야", "렘", "jeremiah"],
    ["LAM", "예레미야애가", "애", "lamentations"], ["EZK", "에스겔", "겔", "ezekiel"],
    ["DAN", "다니엘", "단", "daniel"], ["HOS", "호세아", "호", "hosea"],
    ["JOL", "요엘", "욜", "joel"], ["AMO", "아모스", "암", "amos"],
    ["OBA", "오바댜", "옵", "obadiah"], ["JON", "요나", "욘", "jonah"],
    ["MIC", "미가", "미", "micah"], ["NAM", "나훔", "나", "nahum"],
    ["HAB", "하박국", "합", "habakkuk"], ["ZEP", "스바냐", "습", "zephaniah"],
    ["HAG", "학개", "학", "haggai"], ["ZEC", "스가랴", "슥", "zechariah"],
    ["MAL", "말라기", "말", "malachi"], ["MAT", "마태복음", "마", "matthew"],
    ["MRK", "마가복음", "막", "mark"], ["LUK", "누가복음", "눅", "luke"],
    ["JHN", "요한복음", "요", "john"], ["ACT", "사도행전", "행", "acts"],
    ["ROM", "로마서", "롬", "romans"], ["1CO", "고린도전서", "고전", "1-corinthians"],
    ["2CO", "고린도후서", "고후", "2-corinthians"], ["GAL", "갈라디아서", "갈", "galatians"],
    ["EPH", "에베소서", "엡", "ephesians"], ["PHP", "빌립보서", "빌", "philippians"],
    ["COL", "골로새서", "골", "colossians"], ["1TH", "데살로니가전서", "살전", "1-thessalonians"],
    ["2TH", "데살로니가후서", "살후", "2-thessalonians"], ["1TI", "디모데전서", "딤전", "1-timothy"],
    ["2TI", "디모데후서", "딤후", "2-timothy"], ["TIT", "디도서", "딛", "titus"],
    ["PHM", "빌레몬서", "몬", "philemon"], ["HEB", "히브리서", "히", "hebrews"],
    ["JAS", "야고보서", "약", "james"], ["1PE", "베드로전서", "벧전", "1-peter"],
    ["2PE", "베드로후서", "벧후", "2-peter"], ["1JN", "요한일서", "요일", "1-john"],
    ["2JN", "요한이서", "요이", "2-john"], ["3JN", "요한삼서", "요삼", "3-john"],
    ["JUD", "유다서", "유", "jude"], ["REV", "요한계시록", "계", "revelation"]
  ];

  var aliasToBook = Object.create(null);
  var codeToBook = Object.create(null);
  var folderToCode = Object.create(null);
  BOOKS.forEach(function (row) {
    var book = { code: row[0], name: row[1], short: row[2], folder: row[3] };
    codeToBook[book.code] = book;
    folderToCode[book.folder] = book.code;
    [book.name, book.short].forEach(function (alias) { aliasToBook[alias] = book; });
  });

  var aliasPattern = Object.keys(aliasToBook).sort(function (a, b) { return b.length - a.length; }).map(escapeRegExp).join("|");
  var explicitRe = new RegExp("(" + aliasPattern + ")\\s*(\\d{1,3})(?:\\s*장)?(?:\\s*[:：]\\s*(\\d{1,3})(?:\\s*[–—-]\\s*(\\d{1,3}))?\\s*(?:절)?)?", "g");
  var bareRe = /(^|[^0-9가-힣A-Za-z])(\d{1,3})\s*[:：]\s*(\d{1,3})(?:\s*[–—-]\s*(\d{1,3}))?/g;

  var manifestPromise = null;
  var chunkCache = new Map();
  var bookCache = new Map();
  var ui = null;
  var hoverTimer = null;

  function escapeRegExp(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  function escapeHtml(value) { return String(value).replace(/[&<>\"]/g, function (ch) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]; }); }

  function contextFromPage() {
    var path = location.pathname.toLowerCase().split("/").filter(Boolean);
    var code = null;
    Object.keys(folderToCode).some(function (folder) {
      if (path.indexOf(folder) !== -1) { code = folderToCode[folder]; return true; }
      return false;
    });
    var file = path[path.length - 1] || "";
    var m = file.match(/(?:ch|chapter)[-_]?(\d{1,3})\.html?$/i);
    var chapter = m ? Number(m[1]) : null;
    if (!chapter) {
      var titleMatch = document.title.match(/(\d{1,3})장/);
      chapter = titleMatch ? Number(titleMatch[1]) : null;
    }
    return { code: code, chapter: chapter || 1 };
  }

  function refKey(ref) {
    return ref.code + "." + ref.chapter + (ref.verse ? "." + ref.verse + (ref.endVerse && ref.endVerse !== ref.verse ? "-" + ref.endVerse : "") : "");
  }

  function labelFor(ref) {
    var book = codeToBook[ref.code];
    var label = (book ? book.name : ref.code) + " " + ref.chapter;
    if (ref.verse) label += ":" + ref.verse + (ref.endVerse && ref.endVerse !== ref.verse ? "–" + ref.endVerse : "");
    else label += "장";
    return label;
  }

  function originalUrl(ref) {
    var url = new URL(ORIGINAL_URL);
    url.searchParams.set("book", ref.code);
    url.searchParams.set("chapter", String(ref.chapter || 1));
    if (ref.verse) url.searchParams.set("verse", String(ref.verse));
    if (ref.endVerse && ref.endVerse !== ref.verse) url.searchParams.set("end", String(ref.endVerse));
    return url.href;
  }

  function parseReferenceText(text, pageContext) {
    explicitRe.lastIndex = 0;
    bareRe.lastIndex = 0;
    var candidates = [];
    var match;
    while ((match = explicitRe.exec(text))) {
      var book = aliasToBook[match[1]];
      if (!book) continue;
      candidates.push({
        start: match.index,
        end: explicitRe.lastIndex,
        raw: match[0],
        ref: { code: book.code, chapter: Number(match[2]), verse: match[3] ? Number(match[3]) : null, endVerse: match[4] ? Number(match[4]) : (match[3] ? Number(match[3]) : null) }
      });
    }
    while ((match = bareRe.exec(text))) {
      var offset = match[1] ? match[1].length : 0;
      var start = match.index + offset;
      var end = bareRe.lastIndex;
      if (candidates.some(function (c) { return start < c.end && end > c.start; })) continue;
      var inherited = null;
      for (var i = candidates.length - 1; i >= 0; i--) {
        var prev = candidates[i];
        if (prev.end <= start && /^\s*[;,·]\s*$/.test(text.slice(prev.end, start))) { inherited = prev.ref.code; break; }
      }
      var code = inherited || pageContext.code;
      if (!code) continue;
      candidates.push({
        start: start,
        end: end,
        raw: text.slice(start, end),
        ref: { code: code, chapter: Number(match[2]), verse: Number(match[3]), endVerse: match[4] ? Number(match[4]) : Number(match[3]) }
      });
    }
    return candidates.sort(function (a, b) { return a.start - b.start; }).filter(validBasicRef);
  }

  function validBasicRef(candidate, index, all) {
    var r = candidate.ref;
    if (!r.code || r.chapter < 1 || r.chapter > 150) return false;
    if (r.verse !== null && (r.verse < 1 || r.verse > 176)) return false;
    if (r.endVerse !== null && r.endVerse < r.verse) return false;
    if (index && candidate.start < all[index - 1].end) return false;
    return true;
  }

  function shouldSkip(node) {
    var parent = node.parentElement;
    if (!parent || !node.nodeValue || !node.nodeValue.trim()) return true;
    return Boolean(parent.closest("a,button,script,style,pre,code,textarea,input,select,option,nav,.bible-reader-ui,.hw,[data-no-scripture-link]"));
  }

  function linkReferences() {
    var root = document.querySelector("main, article") || document.body;
    var pageContext = contextFromPage();
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var nodes = [];
    while (walker.nextNode()) if (!shouldSkip(walker.currentNode)) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      var text = node.nodeValue;
      var matches = parseReferenceText(text, pageContext);
      if (!matches.length) return;
      var frag = document.createDocumentFragment();
      var pos = 0;
      matches.forEach(function (item) {
        if (item.start > pos) frag.appendChild(document.createTextNode(text.slice(pos, item.start)));
        var a = document.createElement("a");
        a.className = "scripture-ref";
        a.href = "#bible=" + encodeURIComponent(refKey(item.ref));
        a.dataset.bibleRef = refKey(item.ref);
        a.setAttribute("aria-label", labelFor(item.ref) + " 성경 본문 열기");
        a.textContent = item.raw;
        frag.appendChild(a);
        pos = item.end;
      });
      if (pos < text.length) frag.appendChild(document.createTextNode(text.slice(pos)));
      node.parentNode.replaceChild(frag, node);
    });
  }

  function loadManifest() {
    if (!manifestPromise) {
      manifestPromise = fetch(MANIFEST_URL, { credentials: "same-origin" }).then(function (response) {
        if (!response.ok) throw new Error("성경 목록을 불러오지 못했습니다");
        return response.json();
      });
    }
    return manifestPromise;
  }

  function decompressJson(response) {
    if (!response.ok) throw new Error("성경 데이터를 불러오지 못했습니다");
    if (typeof DecompressionStream !== "function") throw new Error("이 브라우저는 압축 성경 데이터 읽기를 지원하지 않습니다. 최신 Chrome·Edge·Safari를 사용해 주세요.");
    var stream = response.body.pipeThrough(new DecompressionStream("gzip"));
    return new Response(stream).json();
  }

  function loadChunk(chunkName, manifest) {
    if (chunkCache.has(chunkName)) return chunkCache.get(chunkName);
    var info = manifest.chunks[chunkName];
    if (!info) return Promise.reject(new Error("성경 데이터 묶음을 찾지 못했습니다"));
    var promise = fetch(new URL(info.path, DATA_ROOT).href, { credentials: "same-origin" }).then(decompressJson);
    chunkCache.set(chunkName, promise);
    return promise;
  }

  function loadBook(code) {
    if (bookCache.has(code)) return bookCache.get(code);
    var promise = loadManifest().then(function (manifest) {
      var info = manifest.books[code];
      if (!info) throw new Error("성경책 정보를 찾지 못했습니다");
      return loadChunk(info.chunk, manifest).then(function (chunk) {
        var data = chunk.books ? chunk.books[code] : chunk[code];
        if (!data) throw new Error("해당 성경 본문을 찾지 못했습니다");
        return data;
      });
    });
    bookCache.set(code, promise);
    return promise;
  }

  function getVerses(data, ref, limit) {
    var chapter = data.chapters[String(ref.chapter)];
    if (!chapter) return [];
    var start = ref.verse || 1;
    var verseNumbers = Object.keys(chapter).map(Number);
    var end = ref.verse ? (ref.endVerse || ref.verse) : Math.max.apply(null, verseNumbers);
    var rows = [];
    for (var v = start; v <= end; v++) if (chapter[String(v)]) rows.push({ verse: v, text: chapter[String(v)] });
    return limit ? rows.slice(0, limit) : rows;
  }

  function renderVerses(rows) {
    return rows.map(function (row) {
      return '<p class="br-verse"><b>' + row.verse + '</b><span>' + escapeHtml(row.text) + '</span></p>';
    }).join("");
  }

  function ensureUI() {
    if (ui) return ui;
    var tab = document.createElement("button");
    tab.type = "button";
    tab.className = "bible-reader-tab bible-reader-ui";
    tab.textContent = "성경";
    tab.setAttribute("aria-expanded", "false");
    tab.setAttribute("aria-controls", "bible-reader-panel");

    var backdrop = document.createElement("div");
    backdrop.className = "bible-reader-backdrop bible-reader-ui";

    var panel = document.createElement("aside");
    panel.id = "bible-reader-panel";
    panel.className = "bible-reader-panel bible-reader-ui";
    panel.setAttribute("aria-hidden", "true");
    panel.innerHTML = [
      '<header class="br-head">',
      '<div><div class="br-eyebrow">BIBLE READER</div><h2>성경 탐색기</h2></div>',
      '<button class="br-close" type="button" aria-label="성경 패널 닫기">×</button>',
      '</header>',
      '<div class="br-modes" role="tablist"><button type="button" class="is-active" data-br-mode="reference">장절 열기</button><button type="button" data-br-mode="text">본문 검색</button></div>',
      '<form class="br-search br-reference-search" data-br-form="reference"><input type="search" placeholder="예: 학개 1:5–6" aria-label="성경 장절 검색"><button type="submit">열기</button></form>',
      '<form class="br-search br-text-search" data-br-form="text" hidden><input type="search" placeholder="예: 하늘의 하나님" aria-label="성경 본문 단어 검색"><button type="submit">검색</button></form>',
      '<div class="br-status" aria-live="polite"></div>',
      '<div class="br-content"><p class="br-empty">연구 페이지의 성경 장절을 누르거나 장절을 입력하세요.</p></div>',
      '<footer class="br-foot">개역개정 66권 · 학업·학술용 허가 범위 내 사용</footer>'
    ].join("");

    var tip = document.createElement("div");
    tip.className = "bible-reader-tooltip bible-reader-ui";
    tip.setAttribute("role", "tooltip");
    tip.hidden = true;

    document.body.appendChild(tab);
    document.body.appendChild(backdrop);
    document.body.appendChild(panel);
    document.body.appendChild(tip);

    function openPanel() {
      panel.classList.add("is-open");
      backdrop.classList.add("is-open");
      tab.setAttribute("aria-expanded", "true");
      panel.setAttribute("aria-hidden", "false");
      document.documentElement.classList.add("bible-reader-open");
    }
    function closePanel() {
      panel.classList.remove("is-open");
      backdrop.classList.remove("is-open");
      tab.setAttribute("aria-expanded", "false");
      panel.setAttribute("aria-hidden", "true");
      document.documentElement.classList.remove("bible-reader-open");
    }

    tab.addEventListener("click", openPanel);
    backdrop.addEventListener("click", closePanel);
    panel.querySelector(".br-close").addEventListener("click", closePanel);
    document.addEventListener("keydown", function (event) { if (event.key === "Escape") closePanel(); });

    panel.querySelectorAll("[data-br-mode]").forEach(function (button) {
      button.addEventListener("click", function () {
        panel.querySelectorAll("[data-br-mode]").forEach(function (item) { item.classList.toggle("is-active", item === button); });
        var mode = button.dataset.brMode;
        panel.querySelectorAll("[data-br-form]").forEach(function (form) { form.hidden = form.dataset.brForm !== mode; });
        setStatus("");
        panel.querySelector(".br-content").innerHTML = mode === "reference" ? '<p class="br-empty">책 이름과 장절을 입력하세요.</p>' : '<p class="br-empty">두 글자 이상의 단어나 문장을 검색합니다. 검색할 때에만 전체 성경 데이터를 읽습니다.</p>';
      });
    });

    panel.querySelector('[data-br-form="reference"]').addEventListener("submit", function (event) {
      event.preventDefault();
      var value = event.currentTarget.querySelector("input").value.trim();
      var parsed = parseReferenceText(value, contextFromPage());
      if (!parsed.length) return setStatus("장절을 인식하지 못했습니다. 예: 학개 1:5–6");
      openReference(parsed[0].ref, true);
    });

    panel.querySelector('[data-br-form="text"]').addEventListener("submit", function (event) {
      event.preventDefault();
      var value = event.currentTarget.querySelector("input").value.trim();
      searchBibleText(value);
    });

    ui = { tab: tab, panel: panel, backdrop: backdrop, tip: tip, open: openPanel, close: closePanel };
    return ui;
  }

  function setStatus(message) { ensureUI().panel.querySelector(".br-status").textContent = message || ""; }

  function openReference(ref, updateHash) {
    var view = ensureUI();
    view.open();
    setStatus("본문을 불러오는 중…");
    view.panel.querySelector(".br-content").innerHTML = "";
    loadBook(ref.code).then(function (data) {
      var rows = getVerses(data, ref);
      if (!rows.length) throw new Error("해당 장절을 찾지 못했습니다");
      setStatus("");
      view.panel.querySelector(".br-content").innerHTML = [
        '<div class="br-ref-title"><span>' + escapeHtml(data.translation || "개역개정") + '</span><h3>' + escapeHtml(labelFor(ref)) + '</h3></div>',
        renderVerses(rows),
        '<a class="br-original-link" href="' + escapeHtml(originalUrl(ref)) + '" target="_blank" rel="noopener">원어성경과 나란히 보기 ↗</a>'
      ].join("");
      if (updateHash !== false) history.replaceState(null, "", "#bible=" + encodeURIComponent(refKey(ref)));
    }).catch(function (error) {
      setStatus("");
      view.panel.querySelector(".br-content").innerHTML = '<div class="br-error"><b>' + escapeHtml(labelFor(ref)) + '</b><p>' + escapeHtml(error.message) + '</p></div>';
    });
  }

  function normalizeSearch(value) {
    return String(value || "").toLocaleLowerCase("ko-KR").replace(/[\s·ㆍ,.;:!?"'‘’“”()\[\]{}<>—–-]+/g, "");
  }

  function searchBibleText(query) {
    var normalized = normalizeSearch(query);
    var view = ensureUI();
    view.open();
    if (normalized.length < 2) return setStatus("두 글자 이상 입력해 주세요.");
    var content = view.panel.querySelector(".br-content");
    content.innerHTML = '<p class="br-empty">66권 본문을 검색하고 있습니다…</p>';
    setStatus("검색 데이터를 필요할 때만 불러옵니다.");
    loadManifest().then(function (manifest) {
      var chunkNames = Object.keys(manifest.chunks);
      var results = [];
      var chain = Promise.resolve();
      chunkNames.forEach(function (chunkName, index) {
        chain = chain.then(function () {
          setStatus("성경 본문 검색 중 " + (index + 1) + "/" + chunkNames.length);
          return loadChunk(chunkName, manifest).then(function (chunk) {
            var books = chunk.books || chunk;
            Object.keys(books).forEach(function (code) {
              var data = books[code];
              Object.keys(data.chapters).forEach(function (chapter) {
                var verses = data.chapters[chapter];
                Object.keys(verses).forEach(function (verse) {
                  if (results.length >= 100) return;
                  var text = verses[verse];
                  if (normalizeSearch(text).indexOf(normalized) !== -1) results.push({ code: code, chapter: Number(chapter), verse: Number(verse), text: text });
                });
              });
            });
          });
        });
      });
      return chain.then(function () { return results; });
    }).then(function (results) {
      setStatus(results.length >= 100 ? "앞의 100건을 표시합니다." : results.length + "건을 찾았습니다.");
      if (!results.length) {
        content.innerHTML = '<p class="br-empty">일치하는 구절을 찾지 못했습니다.</p>';
        return;
      }
      content.innerHTML = '<div class="br-results">' + results.map(function (row) {
        var ref = { code: row.code, chapter: row.chapter, verse: row.verse, endVerse: row.verse };
        return '<button type="button" class="br-result" data-bible-result="' + escapeHtml(refKey(ref)) + '"><b>' + escapeHtml(labelFor(ref)) + '</b><span>' + escapeHtml(row.text) + '</span></button>';
      }).join("") + '</div>';
      content.querySelectorAll("[data-bible-result]").forEach(function (button) {
        button.addEventListener("click", function () {
          var ref = parseKey(button.dataset.bibleResult);
          if (ref) openReference(ref, true);
        });
      });
    }).catch(function (error) {
      setStatus("");
      content.innerHTML = '<div class="br-error"><p>' + escapeHtml(error.message) + '</p></div>';
    });
  }

  function parseKey(key) {
    var m = String(key || "").match(/^([1-3A-Z]{3})\.(\d{1,3})(?:\.(\d{1,3})(?:-(\d{1,3}))?)?$/);
    return m ? { code: m[1], chapter: Number(m[2]), verse: m[3] ? Number(m[3]) : null, endVerse: m[4] ? Number(m[4]) : (m[3] ? Number(m[3]) : null) } : null;
  }

  function showTooltip(anchor, ref) {
    if (matchMedia("(hover: none)").matches) return;
    var view = ensureUI();
    loadBook(ref.code).then(function (data) {
      var rows = getVerses(data, ref, 3);
      if (!rows.length) return;
      view.tip.innerHTML = '<b>' + escapeHtml(labelFor(ref)) + '</b>' + renderVerses(rows) + (getVerses(data, ref).length > 3 ? '<small>클릭하여 전체 범위 보기</small>' : '');
      var rect = anchor.getBoundingClientRect();
      view.tip.hidden = false;
      var tipRect = view.tip.getBoundingClientRect();
      var left = Math.min(window.innerWidth - tipRect.width - 12, Math.max(12, rect.left));
      var top = rect.bottom + 8;
      if (top + tipRect.height > window.innerHeight - 12) top = rect.top - tipRect.height - 8;
      view.tip.style.left = left + "px";
      view.tip.style.top = Math.max(12, top) + "px";
    }).catch(function () {});
  }

  function hideTooltip() {
    clearTimeout(hoverTimer);
    if (ui && ui.tip) ui.tip.hidden = true;
  }

  function bindReferences() {
    document.addEventListener("click", function (event) {
      var anchor = event.target.closest(".scripture-ref");
      if (!anchor) return;
      event.preventDefault();
      hideTooltip();
      var ref = parseKey(anchor.dataset.bibleRef);
      if (ref) openReference(ref, true);
    });
    document.addEventListener("mouseover", function (event) {
      var anchor = event.target.closest(".scripture-ref");
      if (!anchor) return;
      clearTimeout(hoverTimer);
      var ref = parseKey(anchor.dataset.bibleRef);
      if (ref) hoverTimer = setTimeout(function () { showTooltip(anchor, ref); }, 300);
    });
    document.addEventListener("mouseout", function (event) { if (event.target.closest(".scripture-ref")) hideTooltip(); });
    document.addEventListener("focusin", function (event) {
      var anchor = event.target.closest(".scripture-ref");
      if (anchor) { var ref = parseKey(anchor.dataset.bibleRef); if (ref) showTooltip(anchor, ref); }
    });
    document.addEventListener("focusout", function (event) { if (event.target.closest(".scripture-ref")) hideTooltip(); });
  }

  function injectOriginalButton() {
    var nav = document.querySelector("nav.toc");
    if (!nav || nav.querySelector("[data-original-bible-link]")) return;
    var context = contextFromPage();
    var ref = { code: context.code || "GEN", chapter: context.chapter || 1 };
    var link = document.createElement("a");
    link.className = "original-bible-nav bible-reader-ui";
    link.href = originalUrl(ref);
    link.target = "_blank";
    link.rel = "noopener";
    link.dataset.originalBibleLink = "";
    link.innerHTML = '<span>원어성경 보기</span><b aria-hidden="true">↗</b>';
    var anchor = nav.querySelector(".site-nav") || nav.querySelector(".brand-sub") || nav.firstElementChild;
    if (anchor && anchor.nextSibling) nav.insertBefore(link, anchor.nextSibling);
    else nav.appendChild(link);
  }

  function openHashReference() {
    var m = location.hash.match(/^#bible=(.+)$/);
    if (!m) return;
    var ref = parseKey(decodeURIComponent(m[1]));
    if (ref) openReference(ref, false);
  }

  function init() {
    ensureUI();
    injectOriginalButton();
    linkReferences();
    bindReferences();
    openHashReference();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();