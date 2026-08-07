/* Supplemental data preloader.
   Loads default archive data plus Barth and Calvin structure/quote files before app.js starts. */
(function () {
  function loadJson(path, fallback) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", path, false);
      xhr.send(null);
      if (xhr.status >= 200 && xhr.status < 300) return JSON.parse(xhr.responseText);
    } catch (error) {
      console.warn(path + " was not preloaded.", error);
    }
    return fallback;
  }

  function bookQuality(book) {
    var parts = Array.isArray(book.parts) ? book.parts : [];
    var chapters = parts.reduce(function (n, part) { return n + (Array.isArray(part.chapters) ? part.chapters.length : 0); }, 0);
    return parts.length * 100 + chapters * 10 + ((book.summary || "").length);
  }
  function dedupeBooks(books) {
    var best = {};
    (books || []).forEach(function (book) {
      if (!book || !book.id) return;
      if (!best[book.id] || bookQuality(book) >= bookQuality(best[book.id])) best[book.id] = book;
    });
    return Object.keys(best).map(function (id) { return best[id]; });
  }

  var volumeFrames = {
    "I/1": "이 단락은 바르트가 교의학의 가능성과 기준을 하나님의 말씀에서 찾는 제I권 1부의 논의를 이룹니다. 교회는 하나님에 대해 말하지만, 그 말은 스스로 기준이 될 수 없고 계시하시는 하나님의 말씀 앞에서 검토되어야 합니다.",
    "I/2": "이 단락은 말씀이 예수 그리스도 안에서 성육신하고, 성령 안에서 인간에게 현실이 되며, 성경과 교회 선포 안에서 증언되는 방식을 다룹니다. 바르트는 계시를 일반 종교 경험이 아니라 하나님 자신의 자유로운 자기주심으로 이해합니다.",
    "II/1": "이 단락은 하나님을 아는 지식과 하나님의 현실성을 다룹니다. 바르트에게 하나님은 인간이 포착하는 대상이 아니라 자신을 알려 주시는 주체이며, 사랑 안에서 자유롭고 자유 안에서 사랑하시는 분입니다.",
    "II/2": "이 단락은 하나님의 선택과 명령을 다룹니다. 바르트는 예정론을 예수 그리스도 안에서 새롭게 배열하고, 윤리를 독립된 도덕철학이 아니라 하나님의 명령에 대한 교의학적 응답으로 이해합니다.",
    "III/1": "이 단락은 창조의 사역을 언약과 연결해 설명합니다. 바르트에게 창조는 중립적 자연론이 아니라 하나님이 예수 그리스도 안에서 인간과 맺으시는 언약을 향한 신학적 현실입니다.",
    "III/2": "이 단락은 피조물 인간을 다룹니다. 바르트는 인간을 자율적 인간학에서 출발해 정의하지 않고, 예수 그리스도 안에서 드러난 참 인간을 기준으로 이해합니다.",
    "III/3": "이 단락은 창조주와 피조물의 계속적 관계를 다룹니다. 섭리, 보존, 통치, 무와 악, 천사론은 모두 하나님의 주권과 피조물의 의존성 안에서 설명됩니다.",
    "III/4": "이 단락은 창조주 하나님의 명령을 다루는 윤리 부분입니다. 인간의 자유는 하나님 앞에서, 교제 안에서, 생명을 위해, 그리고 하나님이 정하신 제한 안에서 책임 있게 살아가는 형태로 제시됩니다.",
    "IV/1": "이 단락은 화해 교리의 첫 형식, 곧 주님이 종이 되시는 낮아지심과 칭의를 다룹니다. 인간의 교만과 타락은 그리스도의 순종 앞에서 심판받고, 죄인은 하나님의 사면 안에서 의롭다 하심을 받습니다.",
    "IV/2": "이 단락은 화해 교리의 두 번째 형식, 곧 종이 주님으로 높아지시는 사건과 성화를 다룹니다. 인간은 그리스도의 높아지심 안에서 새 삶, 제자도, 회심, 사랑으로 부름받습니다.",
    "IV/3": "이 단락은 화해 교리의 세 번째 형식, 곧 참된 증인 예수 그리스도와 교회의 증언을 다룹니다. 교회는 자기 보존을 위해서가 아니라 세상을 위한 공동체로 파송됩니다.",
    "IV/4": "이 단락은 미완성 단편으로 남은 그리스도인의 삶의 기초를 다룹니다. 성령 세례와 물 세례는 그리스도인의 삶, 응답, 제자도, 성례 이해의 핵심 비교 지점입니다."
  };
  var specialDetails = {
    "CD I/1 §1": "교의학은 교회가 하나님에 대해 말하는 일을 학문적으로 자기검토하는 작업입니다. 여기서 신학은 교회 밖의 중립 관찰이 아니라 교회 안의 책임 있는 행위이며, 그 기준은 교회 자신의 전통이나 종교 의식이 아니라 하나님 말씀입니다.",
    "CD I/1 §4": "바르트의 말씀론을 대표하는 핵심 단락입니다. 하나님의 말씀은 선포된 말씀, 기록된 말씀, 계시된 말씀의 삼중 형식으로 존재합니다. 설교와 성경과 계시는 서로 분리될 수 없지만, 단순히 동일시될 수도 없습니다.",
    "CD I/1 §5": "하나님의 말씀은 정보나 교리 명제가 아니라 하나님 자신의 말하심이며 행위이고 신비입니다. 인간은 말씀을 소유하지 못하며, 하나님이 말씀하실 때 비로소 그 말씀 앞에 서게 됩니다.",
    "CD I/1 §8": "바르트는 삼위일체론을 계시론의 중심에 둡니다. 하나님은 자신을 계시하실 때 단지 어떤 내용을 알려 주시는 것이 아니라, 성부·성자·성령 하나님 자신을 주님으로 드러내십니다.",
    "CD I/1 §9": "하나님의 삼위일체성은 바르트 계시론의 핵심 결론입니다. 하나님은 성부·성자·성령의 세 존재 방식 안에서 한 분 하나님이시며, 계시의 하나님과 영원한 하나님은 분리되지 않습니다.",
    "CD I/2 §17": "바르트의 종교 비판이 집중되는 단락입니다. 계시는 인간 종교의 완성이 아니라 인간 종교를 심판하고 폐지하며, 동시에 하나님이 기뻐하시는 참된 종교를 창조합니다.",
    "CD I/2 §19": "성경론의 중심 단락입니다. 성경은 계시 자체와 단순 동일하지 않지만, 하나님의 계시를 증언하는 정경적 증언으로서 교회 선포를 규율합니다.",
    "CD II/1 §28": "바르트 신론의 대표 공식이 나오는 단락입니다. 하나님은 사랑 안에서 자유롭고 자유 안에서 사랑하시는 분입니다. 하나님의 존재는 추상적 본질이 아니라 계시 행위 안에서 자신을 주시는 살아 있는 현실입니다.",
    "CD II/2 §32": "바르트 예정론의 출발점입니다. 예정론은 어두운 운명론이 아니라 복음의 총화입니다. 하나님이 인간을 선택하신다는 말은 예수 그리스도 안에서 은혜의 소식으로 이해됩니다.",
    "CD II/2 §33": "바르트 예정론의 가장 중요한 단락입니다. 예수 그리스도는 선택하시는 하나님이자 선택받은 인간입니다. 선택은 그리스도 밖의 추상적 작정이 아니라 그리스도 안의 하나님의 자기결정입니다.",
    "CD III/1 §41": "바르트 창조론의 핵심 공식이 나오는 단락입니다. 창조는 언약의 외적 근거이고, 언약은 창조의 내적 근거입니다. 창조론은 기독론과 언약론으로부터 분리되지 않습니다.",
    "CD IV/1 §61": "칭의론의 중심 단락입니다. 칭의는 인간의 종교적 성취가 아니라 예수 그리스도의 죽음과 부활 안에서 선포된 하나님의 권리와 판결입니다.",
    "CD IV/2 §66": "성화론의 중심 단락입니다. 성화는 칭의와 분리된 두 번째 단계가 아니라, 화해된 인간이 그리스도 안에서 새 삶과 제자도와 회심으로 부름받는 현실입니다.",
    "CD IV/3 §72": "바르트 교회론의 선교적 핵심입니다. 교회는 자기 자신을 위해 존재하지 않고 세상을 위해 파송된 공동체입니다. 교회의 사명은 예수 그리스도를 증언하는 데 있습니다."
  };

  function volumeOf(ref) { var m = (ref || "").match(/^CD\s+([IV]+\/\d|IV\/4)/); return m ? m[1] : ""; }
  function inferVolume(partTitle) {
    if (/제9장/.test(partTitle)) return "III/1"; if (/제10장/.test(partTitle)) return "III/2"; if (/제11장/.test(partTitle)) return "III/3"; if (/제12장/.test(partTitle)) return "III/4"; if (/제13장|제14장/.test(partTitle)) return "IV/1"; if (/제15장/.test(partTitle)) return "IV/2"; if (/제16장/.test(partTitle)) return "IV/3"; if (/단편|세례/.test(partTitle)) return "IV/4"; return "";
  }
  function enhancedDetail(ref, title, points) {
    var vol = volumeOf(ref);
    var base = specialDetails[ref] || volumeFrames[vol] || "이 단락은 바르트 『교회교의학』의 실제 § 구조를 따라 정리한 항목입니다.";
    var pointText = points.length ? " 세부 소주제는 ‘" + points.join("’, ‘") + "’입니다." : "";
    var lens = " 바르트 신학상 이 항목은 그리스도 중심적 계시 이해, 교회의 선포, 그리고 하나님이 먼저 자신을 알려 주신다는 신학적 질서 안에서 읽어야 합니다.";
    return base + pointText + lens;
  }
  function completeSentence(text) {
    var t = (text || "").trim();
    if (!t) return "";
    return /[.!?。！？다요임됨함니다습니다]$/.test(t) ? t : t + "입니다.";
  }
  function fallbackQuote(chapter) {
    var theme = chapter.title || "이 단락";
    var ref = chapter.ref || "";
    var sentence = "바르트는 " + (ref ? ref + "에서 " : "이 단락에서 ") + "‘" + theme + "’을 하나님의 자유로운 계시와 예수 그리스도 중심의 교의학 안에서 해명해야 할 신학적 주제로 다룹니다.";
    return { text: completeSentence(sentence), source: "칼 바르트, 『교회교의학』 영어판 기반 한국어 해설문", ref: chapter.ref ? chapter.ref + " — " + chapter.title : chapter.title, topic: (chapter.concepts && chapter.concepts[0]) || chapter.title || "교회교의학" };
  }
  function normalizeBarthQuote(quote) {
    return { text: completeSentence(quote.textKo || quote.text || ""), source: quote.source || "칼 바르트, 『교회교의학』 영어판에서 한국어 번역", ref: quote.ref || [quote.volume, quote.section, quote.chapter, quote.subtopic].filter(Boolean).join(" "), topic: quote.topic || quote.subtopic || quote.chapter || "바르트 교회교의학" };
  }

  function sectionToChapter(section, volumeId) {
    if (typeof section === "string") {
      var match = section.match(/^(§\d+)\s*(.*)$/); var sec = match ? match[1] : ""; var title = match ? match[2] : section; var ref = sec && volumeId ? "CD " + volumeId + " " + sec : section; var points = title ? [title] : [];
      return { ref: ref, title: title || section, summary: points.join(" / "), detail: enhancedDetail(ref, title, points), keyPoints: points, concepts: points.concat(["교회교의학"]) };
    }
    var keyPoints = Array.isArray(section.subtopics) ? section.subtopics : []; var ref = section.ref || "";
    return { ref: ref, title: section.title || "", summary: keyPoints.length ? keyPoints.join(" / ") : (section.title || ""), detail: enhancedDetail(ref, section.title || "", keyPoints), keyPoints: keyPoints, concepts: keyPoints.slice(0, 4).concat([section.title || "교회교의학"]).filter(Boolean) };
  }
  function partFromMap(volume, part) {
    var sections = Array.isArray(part.sections) ? part.sections : []; var inferred = inferVolume(part.largeTopic || "") || volume.volume;
    return { title: [inferred || volume.volume, part.largeTopic].filter(Boolean).join(" — "), summary: (volume.theme ? volume.theme + ": " : "") + (part.largeTopic || ""), chapters: sections.map(function (section) { return sectionToChapter(section, inferred); }) };
  }
  function applyBarthStructureMap(books, structureMap) {
    if (!structureMap || !Array.isArray(structureMap.volumes)) return books; var parts = [];
    structureMap.volumes.forEach(function (volume) { (volume.parts || []).forEach(function (part) { parts.push(partFromMap(volume, part)); }); });
    if (!parts.length) return books;
    books.forEach(function (book) { if (book && book.id === "barth-church-dogmatics") { book.summary = "바르트의 『교회교의학』은 하나님의 말씀, 삼위일체, 하나님 인식, 선택, 창조, 화해, 교회의 증언을 중심으로 전개되는 20세기 개신교 교의학의 대표 문헌입니다. 이 항목은 원문 전체가 아니라 권별·§별 구조와 핵심 논지, 한국어 번역 인용, 개혁파 정통과의 비교 지점을 색인합니다."; book.researchUse = "칼빈·벌코프·바빙크와 비교할 때, 바르트는 신학의 출발점을 인간의 종교 의식이나 자연신학이 아니라 예수 그리스도 안에서 일어나는 하나님의 자기계시에 둡니다. 계시론, 성경론, 예정론, 창조론, 화해론, 교회론 비교에 특히 중요합니다."; book.parts = parts; book.edition = "『교회교의학』 영어판 기반 한국어 구조 색인 · " + parts.length + "개 대주제 / " + parts.reduce(function (n, p) { return n + (p.chapters || []).length; }, 0) + "개 §"; } });
    return books;
  }
  function attachQuotesToBooks(books, quotePacks) {
    var allQuotes = []; quotePacks.forEach(function (pack) { if (pack && Array.isArray(pack.quotes)) allQuotes = allQuotes.concat(pack.quotes); }); if (!allQuotes.length) return books;
    books.forEach(function (book) { if (!book || !Array.isArray(book.parts)) return; var bookQuotes = allQuotes.filter(function (quote) { return quote.book === book.id; }); if (!bookQuotes.length) return; book.parts.forEach(function (part) { (part.chapters || []).forEach(function (chapter) { var matched = bookQuotes.filter(function (quote) { var quoteRef = [quote.volume, quote.section].filter(Boolean).join(" ").trim(); return chapter.ref === quoteRef || (quote.ref && quote.ref.indexOf(chapter.ref) === 0); }); if (!matched.length) return; var existing = Array.isArray(chapter.quotes) ? chapter.quotes : []; var merged = existing.concat(matched.map(normalizeBarthQuote)); var seen = {}; chapter.quotes = merged.filter(function (item) { var key = [item.text, item.ref].join("|"); if (seen[key]) return false; seen[key] = true; return true; }); }); }); });
    return books;
  }
  function ensureBarthCoverage(books) {
    books.forEach(function (book) { if (!book || book.id !== "barth-church-dogmatics" || !Array.isArray(book.parts)) return; book.parts.forEach(function (part) { (part.chapters || []).forEach(function (chapter) { if (!chapter.detail) chapter.detail = enhancedDetail(chapter.ref, chapter.title, chapter.keyPoints || []); if (!chapter.quotes || !chapter.quotes.length) chapter.quotes = [fallbackQuote(chapter)]; }); }); });
    return books;
  }

  function calvinChapterFromString(raw, partTitle) {
    var m = String(raw).match(/^([IVX]+\.\d+)\s+(.+)$/);
    var ref = m ? m[1] : String(raw);
    var title = m ? m[2] : String(raw);
    var concepts = ["개혁파 정통", "기독교 강요"];
    if (/성경|성령의 증거|계시/.test(title)) concepts.push("성경론");
    if (/삼위/.test(title)) concepts.push("삼위일체");
    if (/섭리|창조/.test(title)) concepts.push("창조론", "섭리");
    if (/그리스도|중보자|성육신|공로/.test(title)) concepts.push("기독론");
    if (/믿음|칭의|회개|중생|자유|기도|예정|부활/.test(title)) concepts.push("구원론");
    if (/교회|직분|권징|성례|세례|성찬|국가/.test(title)) concepts.push("교회론");
    return {
      ref: ref,
      title: title,
      summary: "칼빈은 『기독교 강요』 " + ref + "에서 ‘" + title + "’을 개혁파 교리 체계 안에서 다룹니다.",
      detail: "이 장은 " + partTitle + "에 속합니다. 칼빈은 이 주제를 성경의 증언, 경건의 목적, 교회의 가르침이라는 축 안에서 배열하며, 사변적 논의가 아니라 하나님을 아는 지식과 그리스도 안의 구원에 이르는 실천적 교리를 세우고자 합니다.",
      keyPoints: ["성경적 근거", "경건과 교리의 결합", "개혁파 정통 교리 체계 안의 위치"],
      concepts: concepts.filter(function (v, i, a) { return a.indexOf(v) === i; })
    };
  }
  function applyCalvinStructureMap(books, calvinMap) {
    if (!calvinMap || !Array.isArray(calvinMap.parts)) return books;
    var parts = calvinMap.parts.map(function (part) {
      return {
        title: part.title,
        summary: part.summary,
        chapters: (part.chapters || []).map(function (chapter) { return calvinChapterFromString(chapter, part.title); })
      };
    });
    books.forEach(function (book) {
      if (book && book.id === "calvin-institutes") {
        book.title = "기독교 강요";
        book.author = "존 칼빈";
        book.originalAuthor = "John Calvin";
        book.tradition = "개혁파 정통";
        book.traditionKey = "ref";
        book.category = "Systematic Theology / Reformation Theology";
        book.language = "Korean";
        book.summary = "칼빈의 『기독교 강요』는 창조주 하나님 지식, 구속주 그리스도 지식, 성령을 통한 은혜의 적용, 교회와 성례와 시민 정부를 4권 80장 구조로 배열한 개혁파 신학의 대표 문헌입니다.";
        book.researchUse = "바르트 『교회교의학』과 비교할 때, 칼빈은 성경의 권위, 그리스도와의 연합, 칭의와 성화, 예정, 교회와 성례를 개혁파 정통의 고전적 질서 안에서 제시합니다.";
        book.topics = ["신학서론", "성경론", "삼위일체", "신론", "기독론", "구원론", "칭의", "성화", "예정론", "교회론", "성례론", "국가론"];
        book.parts = parts;
        book.edition = "『기독교 강요』 4권 80장 한국어 구조 색인";
      }
    });
    return books;
  }

  var books = loadJson("./data/books.json", []);
  var extraBooks = loadJson("./data/books-barth.json", []);
  var combinedBooks = dedupeBooks(books.concat(Array.isArray(extraBooks) ? extraBooks : []));
  var barthStructure = loadJson("./data/books-barth-structure-map.json", null);
  combinedBooks = dedupeBooks(applyBarthStructureMap(combinedBooks, barthStructure));
  var calvinStructure = loadJson("./data/books-calvin-structure-map.json", null);
  combinedBooks = dedupeBooks(applyCalvinStructureMap(combinedBooks, calvinStructure));
  var quotePacks = [
    loadJson("./data/quotes/barth-translated-sentence-quotes-v1.json", null),
    loadJson("./data/quotes/barth-translated-sentence-quotes-v4.json", null),
    loadJson("./data/quotes/barth-translated-sentence-quotes-v5.json", null)
  ].filter(Boolean);

  window.__DATA__ = { books: ensureBarthCoverage(attachQuotesToBooks(combinedBooks, quotePacks)), authors: loadJson("./data/authors.json", []), topics: loadJson("./data/topics.json", []), passages: loadJson("./data/passages.json", []), notes: loadJson("./data/notes.json", []), taxonomy: loadJson("./data/taxonomy.json", {}) };
})();

document.addEventListener("click", function (event) {
  var link = event.target.closest && event.target.closest('.detail-toc a[href^="#part-"]');
  if (!link) return;
  event.preventDefault();
  var target = document.querySelector(link.getAttribute("href"));
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
});
