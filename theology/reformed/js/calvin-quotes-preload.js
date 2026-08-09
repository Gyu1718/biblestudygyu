/* Calvin quote preloader.
   Adds short, complete-sentence Korean quotations and quote target coverage notes
   to Calvin's Institutes before app.js renders. */
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

  function arr(value) {
    return Array.isArray(value) ? value : [];
  }

  function completeSentence(text) {
    var t = (text || "").trim();
    if (!t) return "";
    return /[.!?。！？다요임됨함니다습니다]$/.test(t) ? t : t + "입니다.";
  }

  function normalizeCalvinQuote(quote) {
    return {
      text: completeSentence(quote.textKo || quote.text || ""),
      source: quote.source || "존 칼빈, 『기독교 강요』 한국어판",
      ref: quote.ref || [quote.section, quote.chapter, quote.subtopic].filter(Boolean).join(" — "),
      topic: quote.topic || quote.subtopic || quote.chapter || "기독교 강요",
      context: quote.context || "",
      purpose: quote.purpose || "",
      placement: quote.placement || "quote-block",
      priority: quote.priority || ""
    };
  }

  function findCalvinBook(data) {
    if (!data || !Array.isArray(data.books)) return null;
    return data.books.find(function (item) { return item && item.id === "calvin-institutes"; });
  }

  function chapterList(book) {
    var chapters = [];
    arr(book && book.parts).forEach(function (part) {
      arr(part.chapters).forEach(function (chapter) { chapters.push(chapter); });
    });
    return chapters;
  }

  function attachCalvinQuotes(data, quotePacks) {
    var packs = Array.isArray(quotePacks) ? quotePacks : [quotePacks];
    var quotes = [];
    packs.forEach(function (pack) {
      if (pack && Array.isArray(pack.quotes)) quotes = quotes.concat(pack.quotes);
    });
    if (!quotes.length) return data;

    var book = findCalvinBook(data);
    if (!book) return data;

    quotes = quotes.filter(function (quote) { return quote.book === "calvin-institutes"; });
    chapterList(book).forEach(function (chapter) {
      var matched = quotes.filter(function (quote) {
        return chapter.ref === quote.section || (quote.ref && quote.ref.indexOf(chapter.ref) === 0);
      });
      if (!matched.length) return;
      var existing = Array.isArray(chapter.quotes) ? chapter.quotes : [];
      var merged = existing.concat(matched.map(normalizeCalvinQuote));
      var seen = {};
      chapter.quotes = merged.filter(function (item) {
        var key = [item.text, item.ref].join("|");
        if (seen[key]) return false;
        seen[key] = true;
        return true;
      });
    });
    return data;
  }

  function attachCalvinQuoteTargets(data, targetPack) {
    if (!targetPack || !Array.isArray(targetPack.targets)) return data;
    var book = findCalvinBook(data);
    if (!book) return data;

    var bySection = {};
    targetPack.targets.forEach(function (target) {
      if (!target || !target.section) return;
      if (!bySection[target.section]) bySection[target.section] = [];
      bySection[target.section].push({
        target: target.target || target.section,
        topic: target.topic || "인용 후보",
        reason: target.reason || ""
      });
    });

    chapterList(book).forEach(function (chapter) {
      var items = bySection[chapter.ref] || [];
      if (!items.length) return;
      var existing = Array.isArray(chapter.quoteTargets) ? chapter.quoteTargets : [];
      var seen = {};
      chapter.quoteTargets = existing.concat(items).filter(function (item) {
        var key = [item.target || item, item.topic || ""].join("|");
        if (seen[key]) return false;
        seen[key] = true;
        return true;
      });
    });
    return data;
  }

  var quotePacks = [
    loadJson("./data/quotes/calvin-institutes-quotes-v1.json", null),
    loadJson("./data/quotes/calvin-institutes-quotes-v2.json", null),
    loadJson("./data/quotes/calvin-institutes-quotes-v3.json", null),
    loadJson("./data/quotes/calvin-institutes-quotes-v4.json", null)
  ].filter(Boolean);
  var targetPack = loadJson("./data/quotes/calvin-institutes-quote-targets-v1.json", null);

  window.__DATA__ = attachCalvinQuoteTargets(attachCalvinQuotes(window.__DATA__, quotePacks), targetPack);
})();
