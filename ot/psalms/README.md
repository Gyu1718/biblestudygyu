# 시편 연구 Git 업로드 패키지 v1

## 기준 자료

- 최신 권별 상세 연구: `files (3).zip`
- 다섯 권 서재 골격: `files (2).zip`
- 전체 개관·자료집: `psalms-study.zip`

권별 상세 본문은 `files (3)`의 내용을 기준으로 했습니다. `files (2)`의 구판 권별 본문은 중복되므로 넣지 않았고, 구판에 있던 권 이동 기능만 최신 본문에 복원했습니다.

## 저장소에 들어가는 파일

```text
catalog.js
ot/psalms/
  index.html
  overview.html
  sourcebook.html
  book1.html
  book2.html
  book3.html
  book4.html
  book5.html
  psalms-suite.css
  psalms-suite.js
  README.md
```

## 적용 방법

이 ZIP의 내용물을 `biblestudygyu` 저장소 루트에 그대로 덮어씁니다.

- `catalog.js`는 시편 연구 카드를 추가한 현재 카탈로그 전체 파일입니다.
- `ot/psalms/`는 새 폴더입니다.
- 기존 공통 자산(`assets/js/bible-reader.js`, 주석 칩, 연구 도크)은 수정하지 않습니다.

## 기능 정리

- 서고 홈 → 시편 서재 → 전체 개관·자료집·다섯 권 상세 연구 연결
- 제1권부터 제5권까지 이전/다음 권 이동
- 모든 문서에서 시편 번호 1–150 빠른 이동
- 각 권의 현재 시편 블록을 좌측 목차에서 자동 강조
- 성경 장절 자동 호버와 성경읽기 패널 연결
- 권별 다중 시편 문서 안의 `몇 절` 표기를 해당 시편 문맥으로 보완
- 기존 A–Z 주석 칩 팔레트와 흰색 글자 기능 사용
- 공통 연구 도크 사용
- 모바일 반응형과 인쇄 스타일 유지

## 문서 구성

- `index.html`: 시편 전체 서재와 다섯 권 안내
- `overview.html`: 시편 전체 개관, 여섯 주석 종합
- `sourcebook.html`: 구조·장르·신학·150편 해설 검색
- `book1.html`: 시편 1–41편
- `book2.html`: 시편 42–72편
- `book3.html`: 시편 73–89편
- `book4.html`: 시편 90–106편
- `book5.html`: 시편 107–150편

## 주의

`catalog.js`가 패키지 제작 이후 저장소에서 다시 변경되었다면, 시편 항목만 수동 병합해야 합니다. 패키지는 2026-07-24 현재 확인한 카탈로그 구조를 기준으로 만들었습니다.
