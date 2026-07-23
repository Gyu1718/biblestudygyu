/* ============================================================
   성서 연구 서고 — 카탈로그
   새 연구 세트를 추가할 때 이 파일만 수정한다.
   절차: ① 해당 분과 폴더에 연구 폴더 생성(허브 index.html 포함)
         ② 아래 studies 배열에 항목 추가
         ③ python3 tools/validate.py 실행
   필드:
     id       폴더명과 동일 (영소문자)
     path     서고 홈 기준 상대 경로 (끝에 index.html까지)
     title    한국어 제목
     original 원어 표제 (히브리어/그리스어/라틴어)
     script   "heb" | "grk" | "lat"  (원어 표기 방향·폰트 결정)
     meta     구성 요약 한 줄 (권수·문서 수·방법)
     desc     소개 한 줄
     volumes  권수 (미니 책등 개수에 반영, 최대 6개 표시)
   ============================================================ */
window.SITE_CATALOG = {
  site: {
    name: "성서 연구 서고",
    updated: "2026-07-23"
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
          desc: "성경책과 장절을 선택해 원문과 개역개정을 절 단위로 나란히 읽는다. 연구 페이지에서 선택한 장절도 같은 화면으로 이어서 확인할 수 있다.",
          volumes: 2
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
          desc: "성벽 재건에서 마지막 개혁까지 열세 장 전체를 절 단위로 주해했다. 히브리어 표제와 원어 병기, 상호 참조 총람, 장별 신학 종합을 갖췄다. 서재 안에 장별 원어 파싱(발음·뜻·문법·어근)과 전 단어 인터라이너 문서도 함께 둔다.",
          volumes: 14
        },
        {
          id: "hosea",
          path: "ot/hosea/index.html",
          title: "호세아서 연구 노트",
          original: "הוֹשֵׁעַ",
          script: "heb",
          meta: "일곱 주석 종합 — 종합 노트 1편(단일 문서) · 배경 연구 · 14장 절 단위 주해 · 신학 · 상호 참조 · 복음적 해석 · 쟁점 대조 · Kidner·Goldingay·Hubbard·Dearman·Keil-Delitzsch·Stuart·Moon",
          desc: "고멜과의 혼인 서사에서 심판과 소생까지, 호세아서 열네 장을 일곱 주석으로 종합했다. 히브리어 병기와 주석가 칩으로 문장 단위 출처를 표시하고, 언약·혼인·지식의 축을 따라 배경·주해·신학·복음적 해석을 한 문서에 담았다.",
          volumes: 7
        },
        {
          id: "haggai",
          path: "ot/haggai/index.html",
          title: "학개 심층 연구",
          original: "חַגַּי",
          script: "heb",
          meta: "3-문서 구조 — 개관 1편 · 장별 심층연구 2편(1·2장) · 원어 융합 표본(1:1–4) · Jacobs·Hill 대조",
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
      studies: []
    },
    {
      id: "theology",
      label: "신학 연구",
      original: "Θεολογία",
      script: "grk",
      studies: [
         {
          id: "reformed",
          path: "theology/reformed/index.html",
          title: "개혁신학 연구 아카이브",
          original: "Reformata Semper Reformanda",
          script: "lat",
          meta: "개혁파 정통 ⇄ 바르트 신정통 대조 — 4대 조직신학(칼빈 기독교강요·벌코프 조직신학·바빙크 개혁교의학 개요·바르트 교회교의학) · 신조 모음 · 인물 · 신학사 · 주제 대조",
          desc: "개혁파 정통과 칼 바르트의 신정통주의를 나란히 읽는 교육 아카이브. 네 권의 조직신학을 장·절 단위로 펼치고, 신앙고백서와 신학사, 인물·주제 대조를 데이터로 엮었다.",
          volumes: 4
        }
]
    }
  ]
};