# 요엘 연구 세트 업로드 안내

이 ZIP은 `Gyu1718/biblestudygyu` 저장소 루트에서 덮어쓸 수 있는 경로 구조로 만들었습니다.

## 업로드할 파일

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

`catalog.js`와 `README.md`는 2026-07-27에 확인한 저장소 상태를 기준으로 요엘 항목을 추가한 전체 교체본입니다. 업로드 직전에 저장소에서 두 파일이 다른 작업으로 수정되었다면, 요엘 항목만 병합하고 최신 파일을 보존하십시오.

## 원본 자료

사용자가 제공한 PDF·EPUB·RTF·BHS 원본은 패키지에 포함하지 않았습니다.

## 업로드 후 검사

```bash
python3 tools/apply_study_tools.py --write
python3 tools/apply_bible_reader.py --write
python3 tools/apply_study_tools.py --check
python3 tools/apply_bible_reader.py --check
```

추가 확인:

- `catalog.js`에서 요엘 카드가 표시되는지
- `ot/joel/index.html`의 성경읽기 링크가 `book=JOL`을 사용하는지
- 1–3장 이동 링크와 현재 장 `aria-current`가 맞는지
- 원어 연구 준비 중 요소가 실제 링크가 아닌지
- 모바일·다크 모드에서 표와 히브리어가 읽히는지
- `docs/BOOK_STUDY_MANUAL_JOEL_PATCH.md` 내용을 기존 매뉴얼에 병합했는지
