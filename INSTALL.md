# 요엘 연구 세트 v3 업로드 안내

이 패키지는 v1과 v2를 대체합니다. 이전 패키지는 사용하지 마십시오.

저장소 루트에서 다음 경로를 업로드하거나 덮어씁니다.

```text
ot/joel/index.html
ot/joel/overview.html
ot/joel/ch01.html
ot/joel/ch02.html
ot/joel/ch03.html
ot/joel/README.md
catalog.js
README.md
docs/BOOK_STUDY_MANUAL_JOEL_PATCH.md
```

업로드 후:

```bash
python3 tools/apply_study_tools.py --write
python3 tools/apply_bible_reader.py --write
python3 tools/apply_study_tools.py --check
python3 tools/apply_bible_reader.py --check
```

추가 확인: JOL 성경읽기 링크, 장 이동 `aria-current`, 중복 ID, 모바일·다크 모드, 존재하지 않는 원어 연구 링크 0개, 연구 주장 앞 인용 칩 누락 0개.
