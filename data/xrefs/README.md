# 절별 관주 데이터

이 폴더의 JSON은 [OpenBible.info Cross References](https://www.openbible.info/labs/cross-references/) 원자료를 한국어 성경 약칭으로 변환한 결과입니다.

- 원자료: `https://a.openbible.info/data/cross-references.zip`
- 라이선스: CC BY
- 생성 도구: `python tools/update_xrefs.py --write`
- 검증 도구: `python tools/update_xrefs.py --check`

현재 연구 서고에 책별 자료가 있는 창세기, 느헤미야, 에스더, 시편, 호세아, 요엘, 학개, 사도행전, 로마서를 제공합니다. 각 파일은 `장 → 절 → 관주 목록` 구조이며, 관주는 원자료의 투표 수가 높은 순서로 정렬됩니다.

관주는 본문 사이의 탐색 가능한 연결을 제공하는 참고 자료입니다. 특정 연결의 문맥적·신학적 타당성은 각 본문과 주석에서 별도로 검토해야 합니다.
