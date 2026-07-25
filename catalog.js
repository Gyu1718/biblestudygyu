/* ============================================================
   성서 연구 서고 — 카탈로그
   새 연구 세트를 추가하거나 상태를 변경할 때 실제 저장소 파일과 맞춘다.
   ============================================================ */
window.SITE_CATALOG = {
  site: { name: "성서 연구 서고", updated: "2026-07-25" },
  sections: [
    {
      id: "bible", label: "성경읽기", original: "Biblia · Γραφή", script: "lat",
      studies: [{
        id: "reader", path: "bible/original.html", title: "성경읽기", original: "원어 · 개역개정", script: "lat",
        meta: "성경 66권 — 장·절 선택 · 구약 WLC/OSHB · 신약 NA28 · 개역개정 병렬 대조",
        desc: "성경책과 장절을 선택해 원문과 개역개정을 절 단위로 나란히 읽는다. 원어 단어에 마우스를 올리거나 터치하면 한글 스트롱 사전 풀이를 확인할 수 있다.", volumes: 2
      }]
    },
    {
      id: "lexicon", label: "원어 사전", original: "Λεξικόν · מִלּוֹן", script: "lat",
      studies: [{
        id: "strongs-lexicon", path: "lexicon/index.html", title: "히브리어·헬라어 스트롱 사전", original: "Ἑλληνικά · עִבְרִית", script: "lat",
        meta: "히브리어·아람어 H1–H8674 · 헬라어 실제 Strong 항목 5,523개 · 번호·표제어·발음·뜻 검색 · 원어성경 호버 연결",
        desc: "사용자가 제공한 한글 스트롱 사전 자료를 구조화했다. 상세 페이지에서는 사전 원문을 확인하고, 성경읽기 화면에서는 원어 단어 위에서 간략 풀이를 바로 볼 수 있다.", volumes: 6
      }]
    },
    {
      id: "ot", label: "구약 연구", original: "תַּנַ\"ךְ", script: "heb",
      studies: [
        {
          id: "nehemiah", path: "ot/nehemiah/index.html", title: "느헤미야 연구 서가", original: "דִּבְרֵי נְחֶמְיָה", script: "heb",
          meta: "표준형 서가 — 성경읽기 · 종합 개관 · 장별 심층연구 13편 · 원어 파싱 13편 · 기존 인터라이너 5편",
          desc: "성벽 재건에서 공동체 개혁까지 열세 장 전체를 절 단위로 주해했다. 책별 서가에서 성경읽기, 종합 개관, 장별 심층연구와 원어 연구를 연결한다.", volumes: 14
        },
        {
          id: "esther", path: "ot/esther/index.html", title: "에스더 심층 연구", original: "אֶסְתֵּר", script: "heb",
          meta: "종합 개관 1편 · 장별 심층연구 10편 준비 중 · Macchi·Grossman·Llewellyn-Jones·Carruthers·Bechtel 직접 확인 · 개역개정 대조",
          desc: "하나님의 이름 없이 하나님의 일을 이야기하는 책. 표준형 서가의 기준 사례로 보존하며, 열 장의 심층연구를 개관의 지도 위에 채운다.", volumes: 1
        },
        {
          id: "psalms", path: "ot/psalms/index.html", title: "시편 상세 연구", original: "תְּהִלִּים", script: "heb",
          meta: "예외형 — 전체 개관 1편 · 자료집 1편 · 권별 상세 연구 5편 · 시편 1–150편",
          desc: "시편은 150편을 다섯 권의 정경 구조로 읽는 예외형 연구 세트다. 현재 권별 상세 연구 구조를 유지한다.", volumes: 7
        },
        {
          id: "hosea", path: "ot/hosea/index.html", title: "호세아서 연구 노트", original: "הוֹשֵׁעַ", script: "heb",
          meta: "예외형 — 일곱 주석 종합 · 배경 연구 · 14장 절 단위 주해 · 신학 · 상호 참조 · 복음적 해석",
          desc: "고멜과의 혼인 서사에서 심판과 소생까지 열네 장을 통합 연구 노트로 구성했다. 별도 지시가 있기 전까지 현재 구조를 유지한다.", volumes: 7
        },
        {
          id: "haggai", path: "ot/haggai/index.html", title: "학개 연구 서가", original: "חַגַּי", script: "heb",
          meta: "표준형 서가 — 성경읽기 · 종합 개관 1편 · 장별 심층연구 2편 · 원어 연구 1:1–4 표본",
          desc: "넉 달 동안 선포된 네 신탁을 성경읽기, 종합 개관, 두 장의 심층연구와 파싱·인터라이너 융합 원어 연구 표본으로 연결한다.", volumes: 4
        }
      ]
    },
    {
      id: "nt", label: "신약 연구", original: "Καινὴ Διαθήκη", script: "grk",
      studies: [{
        id: "romans", path: "nt/romans/index.html", title: "로마서 연구 서가", original: "ΠΡΟΣ ΡΩΜΑΙΟΥΣ", script: "grk",
        meta: "표준형 서가 — 성경읽기 · 종합 개관 1편 · 장별 심층연구 1–16장 완성 · 원어 연구 미구현",
        desc: "로마서의 역사적 정황과 신학적 구조를 조망하고, 열여섯 장 전체의 심층연구를 연결한다. 원어 연구는 실제 파일이 추가될 때 장별로 활성화한다.", volumes: 17
      }]
    },
    {
      id: "theology", label: "신학 연구", original: "Θεολογία", script: "grk",
      studies: [{
        id: "reformed", path: "https://gyu1718.github.io/Reformed_Theology_Research_Archive/", title: "개혁신학 연구 아카이브", original: "Reformata Semper Reformanda", script: "lat",
        meta: "개혁파 정통 ⇄ 바르트 신정통 대조 — 4대 조직신학 · 신조 모음 · 인물 · 신학사 · 주제 대조",
        desc: "개혁파 정통과 칼 바르트의 신정통주의를 나란히 읽는 교육 아카이브. 네 권의 조직신학을 장·절 단위로 펼치고 신앙고백서와 신학사, 인물·주제 대조를 데이터로 엮었다.", volumes: 4
      }]
    }
  ]
};

(function () {
  if (typeof document === "undefined") return;
  if (document.querySelector("link[data-home-compact-css]")) return;
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "assets/css/home-compact.css";
  link.dataset.homeCompactCss = "";
  document.head.appendChild(link);
})();

(function () {
  if (typeof document === "undefined" || document.querySelector("script[data-rd-loader]")) return;
  var current = document.currentScript;
  var src = current && current.src
    ? new URL("assets/js/research-dock-loader.js?v=20260725.1", current.src).href
    : "assets/js/research-dock-loader.js?v=20260725.1";
  var node = document.createElement("script");
  node.src = src;
  node.dataset.rdLoader = "";
  document.head.appendChild(node);
})();
