/* Bavinck quote preloader.
   Adds short, complete-sentence Korean quotations to Bavinck's Reformed Dogmatics before app.js renders. */
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

  function completeSentence(text) {
    var t = (text || "").trim();
    if (!t) return "";
    return /[.!?。！？다요임됨함니다습니다]$/.test(t) ? t : t + "입니다.";
  }

  function normalizeBavinckQuote(quote) {
    return {
      text: completeSentence(quote.textKo || quote.text || ""),
      source: quote.source || "헤르만 바빙크, 『개혁교의학』 한국어판",
      ref: quote.ref || [quote.section, quote.chapter, quote.subtopic].filter(Boolean).join(" — "),
      topic: quote.topic || quote.subtopic || quote.chapter || "개혁교의학",
      context: quote.context || "",
      purpose: quote.purpose || "",
      placement: quote.placement || "quote-block",
      priority: quote.priority || ""
    };
  }

  function attachBavinckQuotes(data, quotePacks) {
    if (!data || !Array.isArray(data.books)) return data;
    var packs = Array.isArray(quotePacks) ? quotePacks : [quotePacks];
    var quotes = [];
    packs.forEach(function (pack) {
      if (pack && Array.isArray(pack.quotes)) quotes = quotes.concat(pack.quotes);
    });
    if (!quotes.length) return data;

    var book = data.books.find(function (item) { return item && item.id === "bavinck-reformed-dogmatics"; });
    if (!book || !Array.isArray(book.parts)) return data;

    quotes = quotes.filter(function (quote) { return quote.book === "bavinck-reformed-dogmatics"; });
    book.parts.forEach(function (part) {
      (part.chapters || []).forEach(function (chapter) {
        var matched = quotes.filter(function (quote) {
          return chapter.ref === quote.section || (quote.ref && quote.ref.indexOf(chapter.ref) === 0);
        });
        if (!matched.length) return;
        var existing = Array.isArray(chapter.quotes) ? chapter.quotes : [];
        var merged = existing.concat(matched.map(normalizeBavinckQuote));
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

  var quotePacks = [
    loadJson("./data/quotes/bavinck-reformed-dogmatics-quotes-v1.json", null),
    loadJson("./data/quotes/bavinck-reformed-dogmatics-quotes-v2.json", null),
    loadJson("./data/quotes/bavinck-reformed-dogmatics-quotes-v3.json", null),
    loadJson("./data/quotes/bavinck-reformed-dogmatics-quotes-v4.json", null)
  ].filter(Boolean);
  window.__DATA__ = attachBavinckQuotes(window.__DATA__, quotePacks);
})();
