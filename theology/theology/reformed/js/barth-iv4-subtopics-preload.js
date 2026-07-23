/* Barth CD IV/4 fragment subtopic-level explanation patch. */
(function () {
  var data = window.__DATA__;
  if (!data || !Array.isArray(data.books)) return;
  var entries = [
    {
      ref: "\uc131\ub839 \uc138\ub840",
      summary: "\uc131\ub839 \uc138\ub840\ub294 \uadf8\ub9ac\uc2a4\ub3c4\uc778\uc758 \uc0b6\uc774 \uc131\ub839\uc758 \uc0ac\uc5ed\uc5d0 \uadfc\uac70\ud55c\ub2e4\ub294 \uc0ac\uc2e4\uc744 \ub2e4\ub8ec\ub2e4.",
      detail: "\uc774 \ud56d\ubaa9\uc740 IV/4 \ub2e8\ud3b8\uc758 \uccab \uc8fc\uc81c\ub85c, \uadf8\ub9ac\uc2a4\ub3c4\uc778\uc758 \uc0b6\uc758 \uae30\ucd08\ub97c \uc131\ub839\uc758 \uc0ac\uc5ed\uacfc \uc608\uc218 \uadf8\ub9ac\uc2a4\ub3c4\uc758 \ud654\ud574 \uc548\uc5d0\uc11c \uc124\uba85\ud55c\ub2e4.",
      concepts: ["\uc131\ub839 \uc138\ub840", "\uadf8\ub9ac\uc2a4\ub3c4\uc778\uc758 \uc0b6", "\uc131\ub839", "\ud654\ud574"],
      subtopics: [
        { title: "\uadf8\ub9ac\uc2a4\ub3c4\uc778\uc758 \uc0b6\uc758 \uae30\ucd08", explanation: "\uadf8\ub9ac\uc2a4\ub3c4\uc778\uc758 \uc0b6\uc740 \uc778\uac04\uc758 \uc885\uad50\uc801 \uc131\ucde8\uac00 \uc544\ub2c8\ub77c \uc131\ub839\uc758 \uc0ac\uc5ed\uc5d0 \uadfc\uac70\ud55c\ub2e4." },
        { title: "\uc131\ub839\uc758 \uc0ac\uc5ed", explanation: "\uc131\ub839\uc740 \uc608\uc218 \uadf8\ub9ac\uc2a4\ub3c4\uc758 \ud654\ud574\ub97c \uc778\uac04\uc5d0\uac8c \ud604\uc2e4\ud654\ud558\uc2dc\uace0 \uc0c8 \uc0b6\uc73c\ub85c \ubd80\ub974\uc2e0\ub2e4." },
        { title: "\uc778\uac04\uc758 \uc751\ub2f5", explanation: "\uc778\uac04\uc740 \uc131\ub839 \uc548\uc5d0\uc11c \ubbff\uc74c\uacfc \uc21c\uc885\uc73c\ub85c \uc751\ub2f5\ud55c\ub2e4." }
      ]
    },
    {
      ref: "\ubb3c \uc138\ub840: \uadfc\uac70, \ubaa9\ud45c, \uadf8\ub9ac\uc2a4\ub3c4\uad50 \uc138\ub840\uc758 \uc758\ubbf8",
      summary: "\ubb3c \uc138\ub840\ub294 \uadf8\ub9ac\uc2a4\ub3c4\uc778\uc758 \uc0b6\uc744 \uacf5\uac1c\uc801\uc73c\ub85c \uc99d\uc5b8\ud558\ub294 \uc21c\uc885\uc758 \ud45c\uc9c0\ub2e4.",
      detail: "\uc774 \ud56d\ubaa9\uc740 \ubb3c \uc138\ub840\uc758 \uadfc\uac70\uc640 \ubaa9\ud45c\uc640 \uc758\ubbf8\ub97c \uadf8\ub9ac\uc2a4\ub3c4\uc778\uc758 \uc0b6\uc758 \uae30\ucd08\ub77c\ub294 \ub9e5\ub77d\uc5d0\uc11c \uc124\uba85\ud55c\ub2e4.",
      concepts: ["\ubb3c \uc138\ub840", "\uc131\ub840", "\uc21c\uc885", "\uad50\ud68c"],
      subtopics: [
        { title: "\ubb3c \uc138\ub840\uc758 \uadfc\uac70", explanation: "\ubb3c \uc138\ub840\ub294 \uadf8\ub9ac\uc2a4\ub3c4\uc758 \uba85\ub839\uacfc \uc131\ub839\uc758 \uc0ac\uc5ed\uc5d0 \uadfc\uac70\ud55c\ub2e4." },
        { title: "\ubb3c \uc138\ub840\uc758 \ubaa9\ud45c", explanation: "\ubb3c \uc138\ub840\ub294 \uadf8\ub9ac\uc2a4\ub3c4\uc778\uc758 \uc0b6\uc744 \uacf5\uac1c\uc801\uc73c\ub85c \uc2dc\uc791\ud558\uace0 \uad50\ud68c \uc548\uc5d0\uc11c \uc99d\uc5b8\ud558\uac8c \ud55c\ub2e4." },
        { title: "\uadf8\ub9ac\uc2a4\ub3c4\uad50 \uc138\ub840\uc758 \uc758\ubbf8", explanation: "\uc138\ub840\ub294 \uc740\ud61c\ub97c \ub300\uc2e0\ud558\ub294 \ud589\uc704\uac00 \uc544\ub2c8\ub77c \uc740\ud61c\uc5d0 \ub300\ud55c \ucc45\uc784 \uc788\ub294 \uc751\ub2f5\uc774\ub2e4." }
      ]
    }
  ];
  var byRef = {};
  entries.forEach(function (entry) { byRef[entry.ref] = entry; });
  var book = data.books.find(function (item) { return item && item.id === "barth-church-dogmatics"; });
  if (!book || !Array.isArray(book.parts)) return;
  book.parts.forEach(function (part) {
    (part.chapters || []).forEach(function (chapter) {
      var entry = byRef[chapter.ref] || byRef[chapter.title];
      if (!entry) return;
      chapter.summary = entry.summary;
      chapter.detail = entry.detail;
      chapter.concepts = entry.concepts.slice();
      chapter.subtopicDetails = entry.subtopics.map(function (item) { return { title: item.title, explanation: item.explanation }; });
      chapter.keyPoints = entry.subtopics.map(function (item) { return item.title + " — " + item.explanation; });
    });
  });
})();
