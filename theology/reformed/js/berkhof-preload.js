/* Berkhof preloader.
   Loads Berkhof structure, chapter profiles, and explained quotations before app.js renders.
   Rendering is intentionally left to js/app.js after book-description-standardize.js normalizes
   every book into the Barth-style explanation layout. */
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

  function uniq(values) {
    var seen = {};
    return (values || []).filter(function (value) {
      if (!value || seen[value]) return false;
      seen[value] = true;
      return true;
    });
  }

  function completeSentence(text) {
    var t = String(text || "").trim();
    if (!t) return "";
    return /[.!?。！？다요임됨함니다습니다]$/.test(t) ? t : t + "입니다.";
  }

  function profileMap(profiles) {
    var map = {};
    (profiles && profiles.chapters || []).forEach(function (item) {
      if (item && item.ref) map[item.ref] = item;
    });
    return map;
  }

  function chapterFromString(raw, partTitle, profiles) {
    var m = String(raw).match(/^([IVX]+\.\d+)\s+(.+)$/);
    var ref = m ? m[1] : String(raw);
    var title = m ? m[2] : String(raw);
    var profile = profiles[ref] || {};
    return {
      ref: ref,
      title: title,
      summary: profile.summary || ("벌코프는 『조직신학』 " + ref + "에서 ‘" + title + "’을 개혁파 조직신학의 질서 안에서 정리합니다."),
      detail: profile.detail || ("이 장은 " + partTitle + "에 속합니다. 칼빈의 고전적 진술, 바빙크의 유기적 종합, 바르트의 신정통주의적 재구성과 비교할 때 기준점 역할을 합니다."),
      subtopics: profile.subtopics || [],
      subtopicExplanations: profile.subtopicExplanations || [],
      subtopicOverview: profile.subtopicOverview || "",
      subtopicQuestions: profile.subtopicQuestions || [],
      keyPoints: profile.keyPoints || ["개혁파 표준 교리", "교과서형 조직신학", "장별 비교 색인"],
      concepts: uniq(profile.concepts || ["개혁파 정통", "조직신학", "교과서형 교의학"])
    };
  }

  function buildBerkhofBook(map, profiles) {
    if (!map || !Array.isArray(map.parts)) return null;
    return {
      id: "berkhof-systematic-theology",
      title: "조직신학",
      author: "루이스 벌코프",
      originalAuthor: "Louis Berkhof",
      tradition: "개혁파 정통",
      traditionKey: "ref",
      category: "Reformed Systematic Theology / Dogmatics",
      language: "Korean",
      summary: "벌코프의 『조직신학』은 개혁파 교리를 서론, 신론, 인간론, 기독론, 구원론, 교회론, 종말론의 표준 구조로 압축한 대표적 교과서형 조직신학입니다.",
      researchUse: "칼빈과 비교하면 벌코프는 종교개혁 교리의 체계를 교과서적 순서로 정리합니다. 바빙크와 비교하면 더 짧고 명료한 요약형 구조를 제공하며, 바르트와 비교하면 개혁파 정통의 표준 명제와 신정통주의의 계시 중심 재구성을 항목별로 대조하기 좋습니다.",
      topics: ["성경론", "신론", "삼위일체", "창조론", "인간론", "죄론", "기독론", "구원론", "교회론", "성례론", "종말론"],
      authorsMentioned: ["John Calvin", "Herman Bavinck", "Charles Hodge", "A. A. Hodge", "Augustine", "Thomas Aquinas", "Karl Barth"],
      edition: "『조직신학』 구조 한국어 연구색인",
      parts: map.parts.map(function (part) {
        return {
          title: part.title,
          summary: part.summary,
          chapters: (part.chapters || []).map(function (chapter) { return chapterFromString(chapter, part.title, profiles); })
        };
      })
    };
  }

  function upsertBook(data, book) {
    if (!data || !Array.isArray(data.books) || !book) return data;
    var replaced = false;
    data.books = data.books.map(function (item) {
      if (item && item.id === book.id) {
        replaced = true;
        return book;
      }
      return item;
    });
    if (!replaced) data.books.push(book);
    return data;
  }

  function normalizeBerkhofQuote(quote) {
    return {
      text: completeSentence(quote.textKo || quote.text || ""),
      source: quote.source || "루이스 벌코프, 『조직신학』 한국어판",
      ref: quote.ref || [quote.section, quote.chapter, quote.subtopic].filter(Boolean).join(" — "),
      topic: quote.topic || quote.subtopic || quote.chapter || "조직신학",
      subtopic: quote.subtopic || "",
      quoteExplanation: quote.quoteExplanation || quote.explanation || ""
    };
  }

  function collectQuotes(pack) {
    if (pack && Array.isArray(pack.quotes)) return pack.quotes;
    return [];
  }

  function attachBerkhofQuotes(data, quotes) {
    if (!data || !Array.isArray(data.books) || !quotes.length) return data;
    var book = data.books.find(function (item) { return item && item.id === "berkhof-systematic-theology"; });
    if (!book || !Array.isArray(book.parts)) return data;
    quotes = quotes.filter(function (quote) { return quote.book === "berkhof-systematic-theology"; });
    book.parts.forEach(function (part) {
      (part.chapters || []).forEach(function (chapter) {
        var matched = quotes.filter(function (quote) {
          return chapter.ref === quote.section || (quote.ref && quote.ref.indexOf(chapter.ref) === 0);
        });
        if (!matched.length) return;
        var existing = Array.isArray(chapter.quotes) ? chapter.quotes : [];
        var merged = existing.concat(matched.map(normalizeBerkhofQuote));
        var seen = {};
        chapter.quotes = merged.filter(function (item) {
          var key = [item.text, item.ref].join("|");
          if (seen[key]) return false;
          seen[key] = true;
          return true;
        });
      });
    });
    return data;
  }

  var map = loadJson("./data/books-berkhof-structure-map.json", null);
  var profiles = profileMap(loadJson("./data/books/berkhof-chapter-profiles.json", null));
  var book = buildBerkhofBook(map, profiles);
  window.__DATA__ = upsertBook(window.__DATA__, book);

  var explainedPack = loadJson("./data/quotes/berkhof-systematic-theology-quotes-explained-v3.json", null) || loadJson("./data/quotes/berkhof-systematic-theology-quotes-explained-v2.json", null) || loadJson("./data/quotes/berkhof-systematic-theology-quotes-explained-v1.json", null);
  var quotes = collectQuotes(explainedPack);
  if (!quotes.length) {
    ["v1", "v2", "v3", "v4", "v5", "v6"].forEach(function (v) {
      quotes = quotes.concat(collectQuotes(loadJson("./data/quotes/berkhof-systematic-theology-quotes-" + v + ".json", null)));
    });
  }
  window.__DATA__ = attachBerkhofQuotes(window.__DATA__, quotes);
})();
