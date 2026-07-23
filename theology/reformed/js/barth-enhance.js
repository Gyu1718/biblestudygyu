/* Barth enhancer: deduplicate Barth cards and enrich all Church Dogmatics sections. */
(function () {
  if (!window.__DATA__ || !Array.isArray(window.__DATA__.books)) return;

  function countChapters(book) {
    if (!book || !Array.isArray(book.parts)) return 0;
    return book.parts.reduce(function (n, part) {
      return n + (Array.isArray(part.chapters) ? part.chapters.length : 0);
    }, 0);
  }

  function scoreBook(book) {
    return (Array.isArray(book.parts) ? book.parts.length * 100 : 0) + countChapters(book) * 10 + ((book.summary || '').length);
  }

  function dedupeBooks(books) {
    var map = {};
    books.forEach(function (book) {
      if (!book || !book.id) return;
      if (!map[book.id] || scoreBook(book) >= scoreBook(map[book.id])) map[book.id] = book;
    });
    return Object.keys(map).map(function (id) { return map[id]; });
  }

  var volumeFrames = {
    'I/1': '이 단락은 바르트가 교의학의 가능성과 기준을 하나님의 말씀에서 찾는 제I권 1부의 논의를 이룹니다. 교회는 하나님에 대해 말하지만, 그 말은 스스로 기준이 될 수 없고 계시하시는 하나님의 말씀 앞에서 검토되어야 합니다.',
    'I/2': '이 단락은 말씀이 예수 그리스도 안에서 성육신하고, 성령 안에서 인간에게 현실이 되며, 성경과 교회 선포 안에서 증언되는 방식을 다룹니다. 바르트는 계시를 일반 종교 경험이 아니라 하나님 자신의 자유로운 자기주심으로 이해합니다.',
    'II/1': '이 단락은 하나님을 아는 지식과 하나님의 현실성을 다룹니다. 바르트에게 하나님은 인간이 포착하는 대상이 아니라 자신을 알려 주시는 주체이며, 사랑 안에서 자유롭고 자유 안에서 사랑하시는 분입니다.',
    'II/2': '이 단락은 하나님의 선택과 명령을 다룹니다. 바르트는 예정론을 예수 그리스도 안에서 새롭게 배열하고, 윤리를 독립된 도덕철학이 아니라 하나님의 명령에 대한 교의학적 응답으로 이해합니다.',
    'III/1': '이 단락은 창조의 사역을 언약과 연결해 설명합니다. 바르트에게 창조는 중립적 자연론이 아니라 하나님이 예수 그리스도 안에서 인간과 맺으시는 언약을 향한 신학적 현실입니다.',
    'III/2': '이 단락은 피조물 인간을 다룹니다. 바르트는 인간을 자율적 인간학에서 출발해 정의하지 않고, 예수 그리스도 안에서 드러난 참 인간을 기준으로 이해합니다.',
    'III/3': '이 단락은 창조주와 피조물의 계속적 관계를 다룹니다. 섭리, 보존, 통치, 무와 악, 천사론은 모두 하나님의 주권과 피조물의 의존성 안에서 설명됩니다.',
    'III/4': '이 단락은 창조주 하나님의 명령을 다루는 윤리 부분입니다. 인간의 자유는 하나님 앞에서, 교제 안에서, 생명을 위해, 그리고 하나님이 정하신 제한 안에서 책임 있게 살아가는 형태로 제시됩니다.',
    'IV/1': '이 단락은 화해 교리의 첫 형식, 곧 주님이 종이 되시는 낮아지심과 칭의를 다룹니다. 인간의 교만과 타락은 그리스도의 순종 앞에서 심판받고, 죄인은 하나님의 사면 안에서 의롭다 하심을 받습니다.',
    'IV/2': '이 단락은 화해 교리의 두 번째 형식, 곧 종이 주님으로 높아지시는 사건과 성화를 다룹니다. 인간은 그리스도의 높아지심 안에서 새 삶, 제자도, 회심, 사랑으로 부름받습니다.',
    'IV/3': '이 단락은 화해 교리의 세 번째 형식, 곧 참된 증인 예수 그리스도와 교회의 증언을 다룹니다. 교회는 자기 보존을 위해서가 아니라 세상을 위한 공동체로 파송됩니다.',
    'IV/4': '이 단락은 미완성 단편으로 남은 그리스도인의 삶의 기초를 다룹니다. 성령 세례와 물 세례는 그리스도인의 삶, 응답, 제자도, 성례 이해의 핵심 비교 지점입니다.'
  };

  var specialDetails = {
    'CD I/1 §1': '교의학은 교회가 하나님에 대해 말하는 일을 학문적으로 자기검토하는 작업입니다. 여기서 신학은 교회 밖의 중립 관찰이 아니라 교회 안의 책임 있는 행위이며, 그 기준은 교회 자신의 전통이나 종교 의식이 아니라 하나님 말씀입니다.',
    'CD I/1 §4': '바르트의 말씀론을 대표하는 핵심 단락입니다. 하나님의 말씀은 선포된 말씀, 기록된 말씀, 계시된 말씀의 삼중 형식으로 존재합니다. 설교와 성경과 계시는 서로 분리될 수 없지만, 단순히 동일시될 수도 없습니다.',
    'CD I/1 §5': '하나님의 말씀은 정보나 교리 명제가 아니라 하나님 자신의 말하심이며 행위이고 신비입니다. 인간은 말씀을 소유하지 못하며, 하나님이 말씀하실 때 비로소 그 말씀 앞에 서게 됩니다.',
    'CD I/1 §8': '바르트는 삼위일체론을 계시론의 중심에 둡니다. 하나님은 자신을 계시하실 때 단지 어떤 내용을 알려 주시는 것이 아니라, 성부·성자·성령 하나님 자신을 주님으로 드러내십니다.',
    'CD I/1 §9': '하나님의 삼위일체성은 바르트 계시론의 핵심 결론입니다. 하나님은 성부·성자·성령의 세 존재 방식 안에서 한 분 하나님이시며, 계시의 하나님과 영원한 하나님은 분리되지 않습니다.',
    'CD I/2 §17': '바르트의 종교 비판이 집중되는 단락입니다. 계시는 인간 종교의 완성이 아니라 인간 종교를 심판하고 폐지하며, 동시에 하나님이 기뻐하시는 참된 종교를 창조합니다.',
    'CD I/2 §19': '성경론의 중심 단락입니다. 성경은 계시 자체와 단순 동일하지 않지만, 하나님의 계시를 증언하는 정경적 증언으로서 교회 선포를 규율합니다.',
    'CD II/1 §28': '바르트 신론의 대표 공식이 나오는 단락입니다. 하나님은 사랑 안에서 자유롭고 자유 안에서 사랑하시는 분입니다. 하나님의 존재는 추상적 본질이 아니라 계시 행위 안에서 자신을 주시는 살아 있는 현실입니다.',
    'CD II/2 §32': '바르트 예정론의 출발점입니다. 예정론은 어두운 운명론이 아니라 복음의 총화입니다. 하나님이 인간을 선택하신다는 말은 예수 그리스도 안에서 은혜의 소식으로 이해됩니다.',
    'CD II/2 §33': '바르트 예정론의 가장 중요한 단락입니다. 예수 그리스도는 선택하시는 하나님이자 선택받은 인간입니다. 선택은 그리스도 밖의 추상적 작정이 아니라 그리스도 안의 하나님의 자기결정입니다.',
    'CD III/1 §41': '바르트 창조론의 핵심 공식이 나오는 단락입니다. 창조는 언약의 외적 근거이고, 언약은 창조의 내적 근거입니다. 창조론은 기독론과 언약론으로부터 분리되지 않습니다.',
    'CD IV/1 §61': '칭의론의 중심 단락입니다. 칭의는 인간의 종교적 성취가 아니라 예수 그리스도의 죽음과 부활 안에서 선포된 하나님의 권리와 판결입니다.',
    'CD IV/2 §66': '성화론의 중심 단락입니다. 성화는 칭의와 분리된 두 번째 단계가 아니라, 화해된 인간이 그리스도 안에서 새 삶과 제자도와 회심으로 부름받는 현실입니다.',
    'CD IV/3 §72': '바르트 교회론의 선교적 핵심입니다. 교회는 자기 자신을 위해 존재하지 않고 세상을 위해 파송된 공동체입니다. 교회의 사명은 예수 그리스도를 증언하는 데 있습니다.'
  };

  function volumeOf(ref) {
    var match = (ref || '').match(/^CD\s+([IV]+\/\d|IV\/4)/);
    return match ? match[1] : '';
  }

  function enhanceChapter(chapter) {
    if (!chapter || !chapter.ref) return chapter;
    var vol = volumeOf(chapter.ref);
    var frame = volumeFrames[vol] || '이 단락은 바르트 『교회교의학』의 실제 § 구조를 따라 정리한 항목입니다.';
    var points = Array.isArray(chapter.keyPoints) ? chapter.keyPoints : [];
    var pointText = points.length ? ' 세부 소주제는 ‘' + points.join('’, ‘') + '’입니다.' : '';
    chapter.detail = (specialDetails[chapter.ref] || frame) + pointText;
    chapter.summary = chapter.summary || (points.length ? points.join(' / ') : chapter.title);
    chapter.concepts = Array.from(new Set((chapter.concepts || []).concat(points.slice(0, 3)).concat([chapter.title]))).filter(Boolean);
    return chapter;
  }

  function enhanceBarthBook(book) {
    if (!book || book.id !== 'barth-church-dogmatics') return book;
    book.title = '교회교의학';
    book.author = '칼 바르트';
    book.originalAuthor = '칼 바르트';
    book.category = '교회교의학 / 신정통주의 신학';
    book.language = 'Korean';
    book.summary = '바르트의 『교회교의학』은 하나님의 말씀, 삼위일체, 하나님 인식, 선택, 창조, 화해, 교회의 증언을 중심으로 전개되는 20세기 개신교 교의학의 대표 문헌입니다. 이 항목은 원문 전체가 아니라 권별·§별 구조와 핵심 논지, 한국어 번역 인용, 개혁파 정통과의 비교 지점을 색인합니다.';
    book.researchUse = '칼빈·벌코프·바빙크와 비교할 때, 바르트는 신학의 출발점을 인간의 종교 의식이나 자연신학이 아니라 예수 그리스도 안에서 일어나는 하나님의 자기계시에 둡니다. 계시론, 성경론, 예정론, 창조론, 화해론, 교회론 비교에 특히 중요합니다.';
    if (Array.isArray(book.parts)) {
      var chapterTotal = 0;
      book.parts.forEach(function (part) {
        if (Array.isArray(part.chapters)) {
          chapterTotal += part.chapters.length;
          part.chapters.forEach(enhanceChapter);
        }
      });
      book.edition = '『교회교의학』 영어판 기반 한국어 구조 색인 · ' + book.parts.length + '개 대주제 / ' + chapterTotal + '개 §';
    }
    return book;
  }

  window.__DATA__.books = dedupeBooks(window.__DATA__.books).map(enhanceBarthBook);
})();
