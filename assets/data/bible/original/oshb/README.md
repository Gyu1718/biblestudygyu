# WLC / OSHB 로컬 본문 데이터

이 폴더는 Open Scriptures Hebrew Bible의 MorphHB 2.0.2 XML을 브라우저용 JSON으로 변환한 정적 데이터 패키지입니다.

- 원자료: Open Scriptures Hebrew Bible Project / MorphHB
- 고정 버전: `morphhb@2.0.2`
- 본문 기반: Westminster Leningrad Codex
- 생성 도구: `python tools/build_oshb_chunks.py --write`
- 검증 도구: `python tools/build_oshb_chunks.py --check`
- 저장 형식: 구약 39권을 각각 하나의 결정적 gzip JSON 파일로 저장

브라우저는 선택한 책의 압축 파일만 이 저장소에서 받아 해제합니다. 외부 CDN에서 XML 전체를 내려받거나 `DOMParser`로 파싱하지 않습니다.

사용·배포 시 Open Scriptures Hebrew Bible Project를 표시해야 합니다. 상세 라이선스와 출처 정보는 `manifest.json`에도 기록됩니다.
