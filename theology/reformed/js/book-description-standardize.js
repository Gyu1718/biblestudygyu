/* Book description standardizer.
   Keeps every book detail page on the same Barth-style explanation layout:
   summary row, detail paragraph, key-point list, quote block, concept tags.
   This runs after book preload scripts and before app.js renders. */
(function () {
  function arr(value) {
    return Array.isArray(value) ? value : [];
  }

  function text(value, fallback) {
    if (value == null) return fallback || "";
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value).trim();
    if (Array.isArray(value)) return value.map(function (item) { return text(item); }).filter(Boolean).join(" · ");
    if (typeof value === "object") {
      return text(
        value.title || value.label || value.name || value.text || value.displaySummary ||
        value.summary || value.explanation || value.note || value.description || value.thesis,
        fallback
      );
    }
    return fallback || "";
  }

  function unique(items) {
    var seen = {};
    return arr(items).map(function (item) { return text(item); }).filter(function (item) {
      var key = item.trim();
      if (!key || key === "[object Object]" || seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  function subtopicTitle(item, index) {
    return text(item && (item.title || item.label || item.name)) || text(item) || "소주제 " + (index + 1);
  }

  function subtopicExplanation(item, index, chapter) {
    var direct = text(item && (item.explanation || item.note || item.description || item.displaySummary || item.summary));
    if (direct) return direct;
    return text(arr(chapter && chapter.subtopicExplanations)[index]);
  }

  function subtopicPoint(item, index, chapter) {
    var title = subtopicTitle(item, index);
    var explanation = subtopicExplanation(item, index, chapter);
    return explanation && explanation !== title ? title + " — " + explanation : title;
  }

  function standardKeyPoints(chapter) {
    var subtopicPoints = arr(chapter.subtopics).map(function (item, index) {
      return subtopicPoint(item, index, chapter);
    });
    var existing = arr(chapter.keyPoints);
    return unique(subtopicPoints.concat(existing));
  }

  function standardSubtopicTitles(chapter) {
    return arr(chapter.subtopics).map(function (item, index) {
      return subtopicTitle(item, index);
    }).filter(function (item) { return item && item !== "[object Object]"; });
  }

  function normalizeChapter(chapter) {
    if (!chapter || chapter.__barthStyleDescription === true) return;
    var note = chapter.studyNote || {};
    var rawSubtopics = arr(chapter.subtopics).slice();

    if (!chapter.detail) {
      chapter.detail = text(note.thesis || chapter.chapterFunction || chapter.summary);
    }

    var keyPoints = standardKeyPoints(chapter);
    if (keyPoints.length) chapter.keyPoints = keyPoints;

    var noteConcepts = arr(note.concepts);
    if (noteConcepts.length) chapter.concepts = unique(arr(chapter.concepts).concat(noteConcepts));

    if (rawSubtopics.length && !arr(chapter.subtopicDetails).length) {
      chapter.subtopicDetails = rawSubtopics.map(function (item, index) {
        return {
          title: subtopicTitle(item, index),
          explanation: subtopicExplanation(item, index, chapter)
        };
      }).filter(function (item) { return item.title && item.title !== "[object Object]"; });
    }

    if (rawSubtopics.length) {
      chapter.subtopics = standardSubtopicTitles({ subtopics: rawSubtopics });
    }

    chapter.__barthStyleDescription = true;
  }

  function normalizeBook(book) {
    if (!book) return;
    arr(book.parts).forEach(function (part) {
      arr(part.chapters).forEach(normalizeChapter);
    });
    arr(book.chapters).forEach(normalizeChapter);
  }

  if (!window.__DATA__ || !Array.isArray(window.__DATA__.books)) return;
  window.__DATA__.books.forEach(normalizeBook);
})();
