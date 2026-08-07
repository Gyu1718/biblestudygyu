/* Barth CD III/1 subtopic-level explanation patch.
   This file must run after preload-data.js and before app.js.
   It replaces generic creation-doctrine summaries with distinct explanations for each official subtopic. */
(function () {
  var data = window.__DATA__;
  if (!data || !Array.isArray(data.books)) return;

  var entries = [
    {
      ref: "CD III/1 §40",
      summary: "창조주 하나님에 대한 믿음은 세계 일반에서 출발한 우주론이 아니라, 계시 안에서 하나님을 창조주로 고백하는 신앙의 행위다.",
      detail: "바르트는 창조론을 자연 세계에 대한 중립적 설명으로 시작하지 않는다. 창조주 하나님은 세계의 원인을 추론해서 얻어지는 존재가 아니라, 성경의 증언과 예수 그리스도 안의 계시를 통해 믿음으로 고백되는 분이다. 그러므로 창조론의 첫 과제는 세계를 관찰해 하나님을 증명하는 것이 아니라, 하나님이 자신을 창조주로 알려 주신다는 사실을 신앙 안에서 말하는 것이다.",
      concepts: ["창조주 하나님", "믿음", "계시", "자연신학 비판", "창조론"],
      subtopics: [
        { title: "창조주 하나님에 대한 믿음", explanation: "창조 신앙은 자연 세계를 보고 신을 추론하는 철학적 결론이 아니라, 하나님이 자신을 창조주로 계시하셨다는 사실에 대한 교회의 고백이다. 바르트에게 창조론은 신앙고백의 자리에서 시작하며, 세계는 하나님 말씀 아래에서 피조물로 이해된다." }
      ]
    },
    {
      ref: "CD III/1 §41",
      summary: "창조와 언약은 분리된 두 주제가 아니라, 창조가 언약을 향하고 언약이 창조의 내적 목적을 드러내는 관계 안에 있다.",
      detail: "이 단락은 바르트 창조론의 중심 공식이 나오는 부분이다. 창조는 하나님이 인간과 맺으시는 언약을 위한 외적 근거이고, 언약은 창조가 왜 있는지를 밝혀 주는 내적 근거다. 따라서 창조론은 자연론이나 기원론으로 축소되지 않고, 예수 그리스도 안에서 드러나는 하나님의 언약 의지를 향해 배열된다.",
      concepts: ["창조와 언약", "창조사", "언약", "예수 그리스도", "창조론"],
      subtopics: [
        { title: "창조, 역사, 창조사", explanation: "창조는 단순한 과거의 기원 사건이나 신화적 설명이 아니라 하나님이 자신의 뜻을 역사 안에서 드러내시는 창조사로 읽힌다. 바르트는 창조 이야기를 자연과학적 연대기와 경쟁시키기보다, 하나님의 자유로운 행위와 인간을 향한 뜻을 증언하는 신학적 역사로 이해한다." },
        { title: "언약의 외적 근거로서의 창조", explanation: "창조는 하나님과 인간의 언약이 실제로 이루어질 수 있는 세계와 인간의 자리를 마련한다. 이 점에서 창조는 언약을 위한 무대이며, 하나님이 인간과 함께하시려는 목적을 위해 세우신 외적 조건이다." },
        { title: "창조의 내적 근거로서의 언약", explanation: "창조의 가장 깊은 이유는 하나님이 인간과 언약을 맺으시려는 은혜로운 뜻에 있다. 세계는 그 자체로 닫힌 질서가 아니라, 예수 그리스도 안에서 완성될 하나님과 인간의 교제를 향해 창조된 현실이다." }
      ]
    },
    {
      ref: "CD III/1 §42",
      summary: "창조주 하나님의 ‘예’는 피조세계가 하나님의 선한 뜻 아래 혜택·현실화·의롭다 하심의 의미를 갖는다는 창조론적 긍정이다.",
      detail: "바르트는 창조를 단지 존재하게 된 사실로 보지 않고, 하나님이 피조물에게 선하게 말씀하신 ‘예’로 이해한다. 피조물은 우연히 존재하는 것이 아니라 하나님의 선한 의지 아래 혜택을 받고, 현실화되며, 하나님 앞에서 정당한 피조적 자리를 얻는다. 이 긍정은 낙관주의가 아니라 창조주 하나님의 신실한 뜻에 근거한 신학적 긍정이다.",
      concepts: ["창조의 선함", "하나님의 예", "혜택", "현실화", "의롭다 하심"],
      subtopics: [
        { title: "혜택으로서의 창조", explanation: "창조는 피조물에게 주어진 하나님의 선물이며 혜택이다. 피조물은 자기 존재를 스스로 획득하지 않고, 하나님이 선하게 허락하신 생명과 세계 안에서 살아간다." },
        { title: "현실화로서의 창조", explanation: "창조는 가능성의 관념이 아니라 하나님이 피조물을 실제로 존재하게 하시는 행위다. 하나님은 자신의 뜻 안에서 세계와 인간을 현실로 세우시며, 피조물은 하나님의 행위에 의해 구체적 존재를 얻는다." },
        { title: "의롭다 하심으로서의 창조", explanation: "창조주 하나님의 긍정은 피조물이 하나님 앞에서 자기 피조적 자리를 정당하게 받는다는 뜻을 포함한다. 피조물은 하나님과 동일해지지 않으면서도 하나님이 허락하신 선한 질서 안에서 ‘좋다’는 창조주의 판단을 받는다." }
      ]
    }
  ];

  var byRef = {};
  entries.forEach(function (entry) { byRef[entry.ref] = entry; });

  var book = data.books.find(function (item) { return item && item.id === "barth-church-dogmatics"; });
  if (!book || !Array.isArray(book.parts)) return;

  book.parts.forEach(function (part) {
    (part.chapters || []).forEach(function (chapter) {
      var entry = byRef[chapter.ref];
      if (!entry) return;
      chapter.summary = entry.summary;
      chapter.detail = entry.detail;
      chapter.concepts = entry.concepts.slice();
      chapter.subtopicDetails = entry.subtopics.map(function (item) {
        return { title: item.title, explanation: item.explanation };
      });
      chapter.keyPoints = entry.subtopics.map(function (item) {
        return item.title + " — " + item.explanation;
      });
    });
  });
})();
