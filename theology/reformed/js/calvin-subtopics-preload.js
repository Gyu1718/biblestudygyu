/* Calvin Institutes subtopics preload
   Upload path: js/calvin-subtopics-preload.js
   Requires: js/preload-data.js must run first. This file mutates window.__DATA__.books before app.js renders.
*/
(function () {
  function loadJson(path) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", path, false);
      xhr.send(null);
      if (xhr.status >= 200 && xhr.status < 300) return JSON.parse(xhr.responseText);
    } catch (error) {
      console.warn("Calvin subtopics preload failed:", path, error);
    }
    return null;
  }

  function arr(value) {
    return Array.isArray(value) ? value : [];
  }

  function normalizeRef(ref) {
    return String(ref || "").trim();
  }

  function text(value, fallback) {
    if (value == null) return fallback || "";
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value).trim();
    if (Array.isArray(value)) return value.map(function (item) { return text(item); }).filter(Boolean).join(" · ");
    if (typeof value === "object") {
      return text(
        value.title || value.label || value.name || value.text || value.displaySummary || value.summary ||
        value.explanation || value.note || value.description || value.thesis || value.keyQuestion ||
        value.question || value.studyPrompt || value.doctrinalFunction || value.argumentRole,
        fallback
      );
    }
    return fallback || "";
  }

  function textArray(items) {
    if (!Array.isArray(items)) return [];
    return items.map(function (item) { return text(item); }).filter(Boolean);
  }

  function unique(items) {
    var seen = {};
    return (items || []).filter(function (item) {
      var key = text(item).trim();
      if (!key || seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  function slug(value, fallback) {
    var raw = text(value, fallback || "subtopic").toLowerCase();
    return raw.replace(/[^a-z0-9가-힣]+/g, "-").replace(/^-+|-+$/g, "") || (fallback || "subtopic");
  }

  function normalizeTitleKey(value) {
    return text(value).replace(/\s+/g, "").replace(/[·ㆍ,，:：;；()\[\]{}]/g, "").toLowerCase();
  }

  function normalizeSubtopic(item, index, ref) {
    var displaySummary = text(item && (item.displaySummary || item.summary));
    var explanation = text(item && (item.explanation || item.note || item.description)) || displaySummary;
    var title = text(item && (item.title || item.label || item.name)) || displaySummary || "소주제 " + (index + 1);
    var keyQuestion = text(item && (item.keyQuestion || item.question || item.studyPrompt));
    var doctrinalFunction = text(item && (item.doctrinalFunction || item.argumentRole || item.function));
    var reformedContrast = text(item && item.reformedContrast);
    var caution = text(item && item.caution);
    var connections = unique(textArray(item && (item.connections || item.tags || item.concepts)));
    var refs = unique(textArray(item && (item.refs || item.chapters)));
    var quoteTargets = unique(textArray(item && item.quoteTargets));

    return {
      id: text(item && item.id) || slug(ref + "-" + title, "subtopic-" + index),
      title: title,
      displaySummary: displaySummary || explanation,
      summary: displaySummary || explanation,
      explanation: explanation || displaySummary,
      note: explanation || displaySummary,
      keyQuestion: keyQuestion,
      question: keyQuestion,
      doctrinalFunction: doctrinalFunction,
      argumentRole: doctrinalFunction,
      reformedContrast: reformedContrast,
      connections: connections,
      refs: refs,
      quoteTargets: quoteTargets,
      caution: caution,
      _normalized: true
    };
  }

  function normalizePatch(patch) {
    var ref = normalizeRef(patch && patch.ref);
    var subtopics = Array.isArray(patch && patch.subtopics) ? patch.subtopics : [];
    return {
      ref: ref,
      title: text(patch && patch.title),
      chapterFunction: text(patch && (patch.chapterFunction || patch.summary || patch.explanation)),
      subtopics: subtopics.map(function (item, index) { return normalizeSubtopic(item, index, ref); })
    };
  }

  function normalizeStudyNote(note) {
    if (!note || !note.ref) return null;
    var ref = normalizeRef(note.ref);
    var subtopicNotes = Array.isArray(note.subtopicNotes) ? note.subtopicNotes : [];
    return {
      ref: ref,
      question: text(note.question),
      thesis: text(note.thesis),
      argumentFlow: textArray(note.argumentFlow),
      subtopicNotes: subtopicNotes.map(function (item, index) { return normalizeSubtopic(item, index, ref); }),
      reformedContrast: text(note.reformedContrast),
      studyQuestions: textArray(note.studyQuestions),
      concepts: unique(textArray(note.concepts)),
      _source: "data/books/calvin-study-notes-book-*.json"
    };
  }

  function mergeSubtopicObjects(base, extra) {
    var merged = Object.assign({}, base || {}, extra || {});
    ["summary", "displaySummary", "explanation", "note", "keyQuestion", "question", "doctrinalFunction", "argumentRole", "reformedContrast", "caution"].forEach(function (key) {
      merged[key] = text((extra && extra[key]) || (base && base[key]));
    });
    merged.connections = unique(arr(base && base.connections).concat(arr(extra && extra.connections)));
    merged.refs = unique(arr(base && base.refs).concat(arr(extra && extra.refs)));
    merged.quoteTargets = unique(arr(base && base.quoteTargets).concat(arr(extra && extra.quoteTargets)));
    merged.id = text((base && base.id) || (extra && extra.id)) || slug(merged.title || "subtopic", "subtopic");
    merged.title = text((extra && extra.title) || (base && base.title)) || "소주제";
    return merged;
  }

  function mergeSubtopics(patchSubtopics, noteSubtopics) {
    var merged = [];
    var byTitle = {};

    arr(patchSubtopics).forEach(function (item) {
      var key = normalizeTitleKey(item.title);
      if (!key) return;
      byTitle[key] = merged.length;
      merged.push(item);
    });

    arr(noteSubtopics).forEach(function (item) {
      var key = normalizeTitleKey(item.title);
      if (key && byTitle[key] != null) {
        merged[byTitle[key]] = mergeSubtopicObjects(merged[byTitle[key]], item);
      } else {
        byTitle[key] = merged.length;
        merged.push(item);
      }
    });

    return merged.filter(function (item) { return item && item.title; });
  }

  function loadStudyNotes() {
    var paths = [
      "./data/books/calvin-study-notes-book-1.json",
      "./data/books/calvin-study-notes-book-2.json",
      "./data/books/calvin-study-notes-book-3.json",
      "./data/books/calvin-study-notes-book-4.json"
    ];
    var map = {};
    paths.forEach(function (path) {
      var pack = loadJson(path);
      if (!pack || !Array.isArray(pack.notes)) return;
      pack.notes.forEach(function (note) {
        var normalized = normalizeStudyNote(note);
        if (normalized && normalized.ref) map[normalized.ref] = normalized;
      });
    });
    return map;
  }

  var pack = loadJson("./data/books-calvin-subtopics-expanded-v3.json") || { chapterPatches: [] };
  if (!window.__DATA__ || !Array.isArray(window.__DATA__.books)) return;

  var book = window.__DATA__.books.find(function (item) { return item && item.id === (pack.bookId || "calvin-institutes"); });
  if (!book || !Array.isArray(book.parts)) return;

  var patchMap = {};
  (pack.chapterPatches || []).forEach(function (patch) {
    var normalized = normalizePatch(patch);
    if (normalized.ref) patchMap[normalized.ref] = normalized;
  });
  var noteMap = loadStudyNotes();

  book.parts.forEach(function (part) {
    (part.chapters || []).forEach(function (chapter) {
      var ref = normalizeRef(chapter.ref);
      var patch = patchMap[ref];
      var studyNote = noteMap[ref];
      if (!patch && !studyNote) return;

      var mergedSubtopics = mergeSubtopics((patch && patch.subtopics) || [], (studyNote && studyNote.subtopicNotes) || []);
      chapter.studyNote = studyNote || null;
      chapter.chapterFunction = (studyNote && studyNote.thesis) || (patch && patch.chapterFunction) || chapter.chapterFunction || "";
      chapter.detail = (studyNote && studyNote.thesis) || (patch && patch.chapterFunction) || chapter.detail || chapter.summary || "";
      chapter.keyPoints = unique((studyNote && studyNote.argumentFlow && studyNote.argumentFlow.length ? studyNote.argumentFlow : chapter.keyPoints || []));
      chapter.subtopicsRaw = mergedSubtopics;
      chapter.subtopics = mergedSubtopics;
      chapter.subtopicCount = mergedSubtopics.length;
      chapter.subtopicSource = [
        patch ? "data/books-calvin-subtopics-expanded-v3.json" : "",
        studyNote ? "data/books/calvin-study-notes-book-1-4.json" : ""
      ].filter(Boolean).join(" + ");

      var connectionTerms = [];
      mergedSubtopics.forEach(function (subtopic) {
        connectionTerms = connectionTerms.concat(subtopic.connections || []);
      });
      chapter.concepts = unique((chapter.concepts || []).concat((studyNote && studyNote.concepts) || []).concat(connectionTerms).slice(0, 14));
    });
  });
})();
