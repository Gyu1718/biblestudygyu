(function () {
  "use strict";

  var script = document.currentScript;
  var siteRoot = script && script.src ? new URL("../../", script.src).href : "/biblestudygyu/";
  var KOR_DATA_ROOT = new URL("assets/data/bible/kor/", siteRoot).href;
  var KOR_MANIFEST_URL = new URL("manifest.json", KOR_DATA_ROOT).href;
  var NA28_DATA_ROOT = new URL("assets/data/bible/original/na28/", siteRoot).href;
  var NA28_MANIFEST_URL = new URL("manifest.json", NA28_DATA_ROOT).href;

  var BOOKS = [
    ["GEN","창세기","Gen","Gen.xml"],["EXO","출애굽기","Exod","Exod.xml"],["LEV","레위기","Lev","Lev.xml"],["NUM","민수기","Num","Num.xml"],["DEU","신명기","Deut","Deut.xml"],
    ["JOS","여호수아","Josh","Josh.xml"],["JDG","사사기","Judg","Judg.xml"],["RUT","룻기","Ruth","Ruth.xml"],["1SA","사무엘상","1Sam","1Sam.xml"],["2SA","사무엘하","2Sam","2Sam.xml"],
    ["1KI","열왕기상","1Kgs","1Kgs.xml"],["2KI","열왕기하","2Kgs","2Kgs.xml"],["1CH","역대상","1Chr","1Chr.xml"],["2CH","역대하","2Chr","2Chr.xml"],["EZR","에스라","Ezra","Ezra.xml"],
    ["NEH","느헤미야","Neh","Neh.xml"],["EST","에스더","Esth","Esth.xml"],["JOB","욥기","Job","Job.xml"],["PSA","시편","Ps","Ps.xml"],["PRO","잠언","Prov","Prov.xml"],
    ["ECC","전도서","Eccl","Eccl.xml"],["SNG","아가","Song","Song.xml"],["ISA","이사야","Isa","Isa.xml"],["JER","예레미야","Jer","Jer.xml"],["LAM","예레미야애가","Lam","Lam.xml"],
    ["EZK","에스겔","Ezek","Ezek.xml"],["DAN","다니엘","Dan","Dan.xml"],["HOS","호세아","Hos","Hos.xml"],["JOL","요엘","Joel","Joel.xml"],["AMO","아모스","Amos","Amos.xml"],
    ["OBA","오바댜","Obad","Obad.xml"],["JON","요나","Jonah","Jonah.xml"],["MIC","미가","Mic","Mic.xml"],["NAM","나훔","Nah","Nah.xml"],["HAB","하박국","Hab","Hab.xml"],
    ["ZEP","스바냐","Zeph","Zeph.xml"],["HAG","학개","Hag","Hag.xml"],["ZEC","스가랴","Zech","Zech.xml"],["MAL","말라기","Mal","Mal.xml"],
    ["MAT","마태복음"],["MRK","마가복음"],["LUK","누가복음"],["JHN","요한복음"],["ACT","사도행전"],
    ["ROM","로마서"],["1CO","고린도전서"],["2CO","고린도후서"],["GAL","갈라디아서"],["EPH","에베소서"],
    ["PHP","빌립보서"],["COL","골로새서"],["1TH","데살로니가전서"],["2TH","데살로니가후서"],["1TI","디모데전서"],
    ["2TI","디모데후서"],["TIT","디도서"],["PHM","빌레몬서"],["HEB","히브리서"],["JAS","야고보서"],
    ["1PE","베드로전서"],["2PE","베드로후서"],["1JN","요한일서"],["2JN","요한이서"],["3JN","요한삼서"],
    ["JUD","유다서"],["REV","요한계시록"]
  ];

  var bookMap = Object.create(null);
  BOOKS.forEach(function (row, index) {
    bookMap[row[0]] = {
      code: row[0],
      name: row[1],
      sourceCode: row[2] || null,
      file: row[3] || null,
      testament: index < 39 ? "OT" : "NT"
    };
  });

  var koreanManifestPromise = null;
  var na28ManifestPromise = null;
  var koreanChunkCache = new Map();
  var na28ChunkCache = new Map();
  var koreanCache = new Map();
  var originalCache = new Map();

  var bookSelect = document.getElementById("or-book");
  var chapterSelect = document.getElementById("or-chapter");
  var verseInput = document.getElementById("or-verse");
  var openButton = document.getElementById("or-open");
  var prevButton = document.getElementById("or-prev");
  var nextButton = document.getElementById("or-next");
  var status = document.getElementById("or-status");
  var versesBox = document.getElementById("or-verses");
  var originalLabel = document.getElementById("or-original-label");
  var originalSource = document.getElementById("or-original-source");

  function escapeHtml(value) {
    return String(value).replace(/[&<>\"]/g, function (ch) {
      return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[ch];
    });
  }

  function setStatus(message) { status.textContent = message || ""; }

  function loadJson(url, errorMessage) {
    return fetch(url, { credentials: "same-origin" }).then(function (response) {
      if (!response.ok) throw new Error(errorMessage);
      return response.json();
    });
  }

  function loadKoreanManifest() {
    if (!koreanManifestPromise) {
      koreanManifestPromise = loadJson(KOR_MANIFEST_URL, "개역개정 성경 목록을 불러오지 못했습니다.");
    }
    return koreanManifestPromise;
  }

  function loadNa28Manifest() {
    if (!na28ManifestPromise) {
      na28ManifestPromise = loadJson(
        NA28_MANIFEST_URL,
        "NA28 데이터 패키지가 아직 업로드되지 않았습니다. assets/data/bible/original/na28/ 경로를 확인해 주세요."
      );
    }
    return na28ManifestPromise;
  }

  function decompressJson(response, errorMessage) {
    if (!response.ok) throw new Error(errorMessage);
    if (typeof DecompressionStream !== "function") {
      throw new Error("압축 성경 데이터를 읽으려면 최신 Chrome·Edge·Safari가 필요합니다.");
    }
    return new Response(response.body.pipeThrough(new DecompressionStream("gzip"))).json();
  }

  function loadChunk(cache, root, info, errorMessage) {
    var key = info.path;
    if (cache.has(key)) return cache.get(key);
    var promise = fetch(new URL(info.path, root).href, { credentials: "same-origin" })
      .then(function (response) { return decompressJson(response, errorMessage); });
    cache.set(key, promise);
    return promise;
  }

  function loadKorean(code) {
    if (koreanCache.has(code)) return koreanCache.get(code);
    var promise = loadKoreanManifest().then(function (manifest) {
      var info = manifest.books[code];
      if (!info) throw new Error("개역개정 성경책 정보를 찾지 못했습니다.");
      return loadChunk(koreanChunkCache, KOR_DATA_ROOT, manifest.chunks[info.chunk], "개역개정 본문을 불러오지 못했습니다.");
    }).then(function (chunk) {
      var data = (chunk.books || chunk)[code];
      if (!data) throw new Error("개역개정 본문이 없습니다.");
      return data;
    });
    koreanCache.set(code, promise);
    return promise;
  }

  function loadWlcOshb(book) {
    var url = "https://cdn.jsdelivr.net/npm/morphhb@2.0.2/wlc/" + book.file;
    return fetch(url).then(function (response) {
      if (!response.ok) throw new Error("WLC/OSHB 히브리어 본문을 불러오지 못했습니다.");
      return response.text();
    }).then(function (xmlText) {
      var doc = new DOMParser().parseFromString(xmlText, "application/xml");
      if (doc.querySelector("parsererror")) throw new Error("히브리어 원문을 해석하지 못했습니다.");
      var data = {};
      doc.querySelectorAll("verse[osisID]").forEach(function (verse) {
        var id = verse.getAttribute("osisID").split(".");
        var chapter = Number(id[id.length - 2]);
        var verseNumber = Number(id[id.length - 1]);
        var text = verse.textContent.replace(/\s+/g, " ").trim();
        if (!data[chapter]) data[chapter] = {};
        data[chapter][verseNumber] = text;
      });
      return data;
    });
  }

  function loadNa28(code) {
    return loadNa28Manifest().then(function (manifest) {
      var info = manifest.books[code];
      if (!info) throw new Error("NA28 성경책 정보를 찾지 못했습니다.");
      return loadChunk(na28ChunkCache, NA28_DATA_ROOT, manifest.chunks[info.chunk], "NA28 본문 묶음을 불러오지 못했습니다.");
    }).then(function (chunk) {
      var data = (chunk.books || chunk)[code];
      if (!data || !data.chapters) throw new Error("NA28 본문이 없습니다.");
      return data.chapters;
    });
  }

  function loadOriginal(code) {
    if (originalCache.has(code)) return originalCache.get(code);
    var book = bookMap[code];
    var promise = book.testament === "OT" ? loadWlcOshb(book) : loadNa28(code);
    originalCache.set(code, promise);
    return promise;
  }

  function params() {
    var query = new URLSearchParams(location.search);
    var code = (query.get("book") || "GEN").toUpperCase();
    if (!bookMap[code]) code = "GEN";
    return {
      code: code,
      chapter: Math.max(1, Number(query.get("chapter")) || 1),
      verse: Math.max(0, Number(query.get("verse")) || 0),
      end: Math.max(0, Number(query.get("end")) || 0)
    };
  }

  function updateUrl(code, chapter, verse, end) {
    var url = new URL(location.href);
    url.searchParams.set("book", code);
    url.searchParams.set("chapter", String(chapter));
    if (verse) url.searchParams.set("verse", String(verse));
    else url.searchParams.delete("verse");
    if (end && end !== verse) url.searchParams.set("end", String(end));
    else url.searchParams.delete("end");
    history.replaceState(null, "", url);
  }

  function fillBooks() {
    bookSelect.innerHTML = BOOKS.map(function (row, index) {
      return (index === 0 ? '<optgroup label="구약">' : '') +
        (index === 39 ? '</optgroup><optgroup label="신약">' : '') +
        '<option value="' + row[0] + '">' + row[1] + '</option>' +
        (index === 65 ? '</optgroup>' : '');
    }).join("");
  }

  function fillChapters(count, current) {
    var html = "";
    for (var i = 1; i <= count; i++) html += '<option value="' + i + '">' + i + '장</option>';
    chapterSelect.innerHTML = html;
    chapterSelect.value = String(Math.min(current, count));
  }

  function render(code, chapter, selected, end) {
    var book = bookMap[code];
    setStatus(book.name + " " + chapter + "장을 불러오는 중입니다.");
    versesBox.innerHTML = '<div class="or-empty">본문을 불러오는 중입니다.</div>';

    Promise.all([loadKorean(code), loadOriginal(code)]).then(function (values) {
      var korean = values[0];
      var original = values[1];
      var koreanChapter = korean.chapters[String(chapter)] || {};
      var originalChapter = original[String(chapter)] || original[chapter] || {};
      var verseNumbers = Array.from(new Set(
        Object.keys(koreanChapter).concat(Object.keys(originalChapter)).map(Number)
      )).sort(function (a, b) { return a - b; });

      if (!verseNumbers.length) throw new Error("해당 장의 본문을 찾지 못했습니다.");

      originalLabel.textContent = book.testament === "OT" ? "히브리어 원문" : "헬라어 원문";
      originalSource.textContent = book.testament === "OT" ? "WLC / OSHB" : "NA28";

      var missingOriginal = book.testament === "NT"
        ? "NA28에는 해당 절 번호가 없습니다."
        : "원문 장절 구분을 확인해야 합니다.";

      versesBox.innerHTML = verseNumbers.map(function (verseNumber) {
        var active = selected && verseNumber >= selected && verseNumber <= (end || selected);
        var originalText = originalChapter[String(verseNumber)] || originalChapter[verseNumber];
        var koreanText = koreanChapter[String(verseNumber)];
        return '<article class="or-verse-row' + (active ? ' is-selected' : '') + '" id="verse-' + verseNumber + '">' +
          '<div class="or-cell or-original ' + (book.testament === "OT" ? 'is-hebrew' : '') + '">' +
            '<span class="or-num">' + verseNumber + '</span>' +
            (originalText ? escapeHtml(originalText) : '<span class="or-missing">' + missingOriginal + '</span>') +
          '</div>' +
          '<div class="or-cell or-korean">' +
            '<span class="or-num">' + verseNumber + '</span>' +
            (koreanText ? escapeHtml(koreanText) : '<span class="or-missing">개역개정 본문 없음</span>') +
          '</div>' +
        '</article>';
      }).join("");

      setStatus(book.name + " " + chapter + "장 · " + verseNumbers.length + "개 장절 행 · " + (book.testament === "OT" ? "WLC/OSHB" : "NA28"));
      if (selected) {
        var target = document.getElementById("verse-" + selected);
        if (target) setTimeout(function () { target.scrollIntoView({ block: "center", behavior: "smooth" }); }, 50);
      }
    }).catch(function (error) {
      setStatus(error.message);
      versesBox.innerHTML = '<div class="or-empty">' + escapeHtml(error.message) + '</div>';
    });
  }

  function openCurrent() {
    loadKoreanManifest().then(function (manifest) {
      var code = bookSelect.value;
      var max = manifest.books[code].chapters;
      var chapter = Math.min(Number(chapterSelect.value) || 1, max);
      var verse = Math.max(0, Number(verseInput.value) || 0);
      updateUrl(code, chapter, verse, 0);
      updateControls(code, chapter, manifest);
      render(code, chapter, verse, 0);
    });
  }

  function updateControls(code, chapter, manifest) {
    bookSelect.value = code;
    fillChapters(manifest.books[code].chapters, chapter);
    prevButton.disabled = chapter <= 1;
    nextButton.disabled = chapter >= manifest.books[code].chapters;
  }

  function shiftChapter(delta) {
    loadKoreanManifest().then(function (manifest) {
      var code = bookSelect.value;
      var chapter = Math.max(1, Math.min(
        manifest.books[code].chapters,
        (Number(chapterSelect.value) || 1) + delta
      ));
      chapterSelect.value = String(chapter);
      verseInput.value = "";
      updateUrl(code, chapter, 0, 0);
      updateControls(code, chapter, manifest);
      render(code, chapter, 0, 0);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  fillBooks();
  loadKoreanManifest().then(function (manifest) {
    var initial = params();
    var chapter = Math.min(initial.chapter, manifest.books[initial.code].chapters);
    updateControls(initial.code, chapter, manifest);
    verseInput.value = initial.verse || "";
    render(initial.code, chapter, initial.verse, initial.end);
  }).catch(function (error) {
    setStatus(error.message);
    versesBox.innerHTML = '<div class="or-empty">' + escapeHtml(error.message) + '</div>';
  });

  bookSelect.addEventListener("change", function () {
    loadKoreanManifest().then(function (manifest) {
      fillChapters(manifest.books[bookSelect.value].chapters, 1);
      verseInput.value = "";
      openCurrent();
    });
  });
  chapterSelect.addEventListener("change", function () { verseInput.value = ""; openCurrent(); });
  openButton.addEventListener("click", openCurrent);
  verseInput.addEventListener("keydown", function (event) { if (event.key === "Enter") openCurrent(); });
  prevButton.addEventListener("click", function () { shiftChapter(-1); });
  nextButton.addEventListener("click", function () { shiftChapter(1); });
})();