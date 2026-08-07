/* Barth subtopic context normalizer v4.
   Loads data/barth-subtopic-contexts-v4.json and attaches section.subtopicContexts[]
   to the Barth Church Dogmatics book before app.js renders. */
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
  function arr(x) { return Array.isArray(x) ? x : []; }
  function byRef(contexts) {
    var map = {};
    arr(contexts.sections).forEach(function (section) { if (section && section.ref) map[section.ref] = section; });
    return map;
  }
  function pickSubtopic(section, quote, index) {
    var details = arr(section.subtopicContexts);
    if (!details.length) return null;
    var probe = [quote.subtopic, quote.topic, quote.purpose, quote.ref, quote.text].filter(Boolean).join(" ");
    var found = details.find(function (item) { return probe.indexOf(item.label) >= 0; });
    if (found) return found;
    return details[index % details.length] || details[0];
  }
  function attachContexts() {
    if (!window.__DATA__ || !Array.isArray(window.__DATA__.books)) return;
    var contextPack = loadJson("./data/barth-subtopic-contexts-v4.json", null);
    if (!contextPack || !Array.isArray(contextPack.sections)) return;
    var map = byRef(contextPack);
    var book = window.__DATA__.books.find(function (b) { return b && b.id === "barth-church-dogmatics"; });
    if (!book || !Array.isArray(book.parts)) return;
    book.parts.forEach(function (part) {
      arr(part.chapters).forEach(function (chapter) {
        var section = map[chapter.ref];
        if (!section) return;
        chapter.summary = section.sectionSummary || chapter.summary;
        chapter.detail = section.sectionDetail || chapter.detail;
        chapter.subtopicDetails = arr(section.subtopicContexts);
        chapter.keyPoints = arr(section.subtopicContexts).map(function (x) { return x.label; });
        chapter.concepts = Array.from(new Set(arr(chapter.concepts).concat(arr(section.subtopicContexts).flatMap(function (x) { return arr(x.concepts); }))));
        arr(chapter.quotes).forEach(function (quote, idx) {
          var sub = pickSubtopic(section, quote, idx);
          if (!sub) return;
          quote.subtopic = quote.subtopic || sub.label;
          quote.context = quote.context || sub.quoteContext;
          quote.purpose = quote.purpose || "subtopic-context";
        });
      });
    });
  }
  attachContexts();
})();
