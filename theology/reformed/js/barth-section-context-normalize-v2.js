/* Barth section-context normalizer v2.
   Reads data/barth-section-contexts-v2.json synchronously before app.js renders.
   It upgrades Barth chapters and quote cards with section-specific explanations. */
(function () {
  function loadJson(path, fallback) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", path, false);
      xhr.send(null);
      if (xhr.status >= 200 && xhr.status < 300) return JSON.parse(xhr.responseText);
    } catch (error) {
      console.warn(path + " was not loaded.", error);
    }
    return fallback;
  }

  function arr(value) { return Array.isArray(value) ? value : []; }
  function unique(values) {
    var seen = {};
    return arr(values).filter(function (value) {
      if (!value || seen[value]) return false;
      seen[value] = true;
      return true;
    });
  }

  var pack = loadJson("./data/barth-section-contexts-v2.json", null);
  if (!pack || !Array.isArray(pack.sections) || !window.__DATA__ || !Array.isArray(window.__DATA__.books)) return;

  var byRef = {};
  pack.sections.forEach(function (section) { if (section && section.ref) byRef[section.ref] = section; });

  var book = window.__DATA__.books.find(function (item) { return item && item.id === "barth-church-dogmatics"; });
  if (!book || !Array.isArray(book.parts)) return;

  book.parts.forEach(function (part) {
    arr(part.chapters).forEach(function (chapter) {
      var section = byRef[chapter.ref];
      if (!section) return;

      chapter.summary = section.oneLineSummary || section.summary || chapter.summary;
      chapter.detail = section.detail || chapter.detail;
      chapter.keyPoints = unique(arr(section.keyPoints).concat(arr(chapter.keyPoints)));
      chapter.concepts = unique(arr(section.concepts).concat(arr(chapter.concepts)));
      chapter.reformedComparison = section.reformedComparison || "";
      chapter.researchUse = section.researchUse || "";

      arr(chapter.quotes).forEach(function (quote) {
        if (!quote.context || quote.context.length < 90) quote.context = section.quoteContext || section.summary || chapter.summary;
        quote.purpose = quote.purpose || "chapter-detail";
        quote.placement = quote.placement || "quote-block";
      });
    });
  });
})();
