# Lexicon data layout

- `manifest.json` — 버전, 항목 수, 버킷 크기
- `index.json.gz` — 검색용 경량 색인
- `greek/gNNNN-NNNN.json.gz` — 헬라어 상세 항목
- `hebrew/hNNNN-NNNN.json.gz` — 히브리어·아람어 상세 항목
- `forms/greek.json.gz` — NA28 화면의 활용형을 Strong 번호에 연결하는 역색인
- `build-report.json` — 자동 추출 및 보충 현황

상세 항목은 한글 원문 `rawKo`와 검색·호버용 정규화 필드를 분리합니다.
