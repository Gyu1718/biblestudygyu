/* ============================================================
   성서 연구 서고 — 카탈로그
   새 연구 세트를 추가할 때 이 파일만 수정한다.
   ============================================================ */
window.SITE_CATALOG = {
  site: {
    name: "성서 연구 서고",
    updated: "2026-07-24"
  },
  sections: [
    {
      id: "bible",
      label: "성경읽기",
      original: "Biblia · Γραφή",
      script: "lat",
      studies: [
        {
          id: "reader",
          path: "bible/original.html",
          title: "성경읽기",
          original: "원어 · 개역개정",
          script: "lat",
          meta: "성경 66권 — 장·절 선택 · 구약 히브리어 · 신약 헬라어 · 개역개정 병렬 대조",
          desc: "성경책과 장절을 선택해 원문과 개역개정을 절 단위로 나란히 읽는다. 원어 단어에 마우스를 올리거나 터치하면 한글 스트롱 사전 풀이를 확인할 수 있다.",
          volumes: 2
        }
      ]
    },
    {
      id: "lexicon",
      label: "원어 사전",
      original: "Λεξικόν · מִלּוֹן",
      script: "lat",
      studies: [
        {
          id: "strongs-lexicon",
          path: "lexicon/index.html",
          title: "히브리어·헬라어 스트롱 사전",
          original: "Ἑλληνικά · עִבְרִית",
          script: "lat",
          meta: "히브리어·아람어 H1–H8674 · 헬라어 실제 Strong 항목 5,523개 · 한글 원문 보존 · 번호·표제어·발음·뜻 검색 · 원어성경 호버 연결",
          desc: "사용자가 제공한 한글 스트롱 사전 PDF와 HWP를 주자료로 구조화했다. 상세 페이지에서는 사전 원문을 온전히 확인하고, 성경읽기 화면에서는 원어 단어 위에서 간략 풀이를 바로 볼 수 있다.",
          volumes: 6
        }
      ]
    },
    {
      id: "ot",
      label: "구약 연구",
      original: "תַּנַ\"ךְ",
      script: "heb",
      studies: [
        {
          id: "nehemiah",
          path: "ot/nehemiah/index.html",
          title: "느헤미야 심층 연구",
          original: "דִּבְרֵי נְחֶמְיָה",
          script: "heb",
          meta: "전 14권 — 종합 노트 1편 · 장별 연구 13편 · 다섯 주석 대조 · 절 단위 주해 · 원어 파싱 13편 · 인터라이너(1·2·4·5·6장) 별도 수록",
          desc: "성벽 재건에서 마지막 개혁까지 열세 장 전체를 절 단위로 주해했다. 히브리어 표제와 원어 병기, 상호 참조 총람, 장별 신학 종합을 갖췄다. 서재 안에 장별 원어 파싱과 인터라이너 문서도 함께 둔다.",
          volumes: 14
        },
        {
          id: "hosea",
          path: "ot/hosea/index.html",
          title: "호세아서 연구 노트",
          original: "הוֹשֵׁעַ",
          script: "heb",
          meta: "일곱 주석 종합 — 종합 노트 1편 · 배경 연구 · 14장 절 단위 주해 · 신학 · 상호 참조 · 복음적 해석 · 쟁점 대조",
          desc: "고멜과의 혼인 서사에서 심판과 소생까지, 호세아서 열네 장을 일곱 주석으로 종합했다. 히브리어 병기와 주석가 칩으로 문장 단위 출처를 표시한다.",
          volumes: 7
        },
        {
          id: "haggai",
          path: "ot/haggai/index.html",
          title: "학개 심층 연구",
          original: "חַגַּי",
          script: "heb",
          meta: "3-문서 구조 — 개관 1편 · 장별 심층연구 2편 · 원어 융합 표본 · Jacobs·Hill 대조",
          desc: "넉 달의 예언으로 멈춘 성전 공사를 다시 세운 책. 책의 신학과 전체 개관을 갖추고, 원어는 파싱과 인터라이너를 한 문서로 융합한다.",
          volumes: 4
        }
      ]
    },
    {
      id: "nt",
      label: "신약 연구",
      original: "Καινὴ Διαθήκη",
      script: "grk",
      studies: [
        {
          id: "romans",
          path: "nt/romans/index.html",
          title: "로마서 심층 연구",
          original: "ΠΡΟΣ ΡΩΜΑΙΟΥΣ",
          script: "grk",
          meta: "종합 연구 1편 · 장별 심층 연구 1–9장 · 절별 성경 연구 1–16장 · Moo·Dunn·Jewett·Gaventa·Barth 대조 · 개역개정 4판 · NA28",
          desc: "로마서의 역사적 정황과 신학적 구조를 조망하고, 1–9장을 절 단위로 주해한다. 16장 전체에는 개역개정 본문, 원어 성경읽기, 심층 연구를 잇는 절별 성경 연구 허브를 마련했다.",
          volumes: 10
        }
      ]
    },
    {
      id: "theology",
      label: "신학 연구",
      original: "Θεολογία",
      script: "grk",
      studies: [
        {
          id: "reformed",
          path: "https://gyu1718.github.io/Reformed_Theology_Research_Archive/",
          title: "개혁신학 연구 아카이브",
          original: "Reformata Semper Reformanda",
          script: "lat",
          meta: "개혁파 정통 ⇄ 바르트 신정통 대조 — 4대 조직신학 · 신조 모음 · 인물 · 신학사 · 주제 대조",
          desc: "개혁파 정통과 칼 바르트의 신정통주의를 나란히 읽는 교육 아카이브. 네 권의 조직신학을 장·절 단위로 펼치고, 신앙고백서와 신학사, 인물·주제 대조를 데이터로 엮었다.",
          volumes: 4
        }
      ]
    }
  ]
};

/* 홈페이지 카드 밀도 조정용 스타일 로더.
   index.html의 인라인 디자인은 유지하고 카드 크기와 배치만 조정한다. */
(function () {
  if (typeof document === "undefined") return;
  var existing = document.querySelector('link[data-home-compact-css]');
  if (existing) return;
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "assets/css/home-compact.css";
  link.dataset.homeCompactCss = "";
  document.head.appendChild(link);
})();
