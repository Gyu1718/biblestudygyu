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
    updated: "2026-07-20"
  },
  sections: [
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
          meta: "전 14권 — 종합 노트 1편 · 장별 연구 13편 · 다섯 주석 대조 · 절 단위 주해 · 원어 파싱 13편 · 인터라이너(1장) 별도 수록",
          desc: "성벽 재건에서 마지막 개혁까지 열세 장 전체를 절 단위로 주해했다. 히브리어 표제와 원어 병기, 상호 참조 총람, 장별 신학 종합을 갖췄다. 서재 안에 장별 원어 파싱(발음·뜻·문법·어근)과 전 단어 인터라이너 문서도 함께 둔다.",
          volumes: 14
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
      studies: []
    }
  ]
};
