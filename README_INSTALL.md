# 요엘 연구 세트 Git 통합 패키지

대상 저장소: `Gyu1718/biblestudygyu`

이 패키지는 요엘 연구 자료를 저장소의 표준형 책별 서가 구조에 맞춰 `ot/joel/` 아래에 설치하고, 저장소 현황 문서를 실제 파일과 일치시키기 위한 통합 도구를 포함합니다.

## 포함 파일

```text
repo_files/
└── ot/joel/
    ├── index.html
    ├── overview.html
    ├── ch01.html
    ├── ch02.html
    └── ch03.html
integrate_joel.py
README_INSTALL.md
PACKAGE_MANIFEST.json
checksums.sha256
```

## 반영되는 저장소 파일

설치 스크립트는 다음 파일만 수정합니다.

```text
ot/joel/index.html
ot/joel/overview.html
ot/joel/ch01.html
ot/joel/ch02.html
ot/joel/ch03.html
catalog.js
README.md
AGENTS.md
docs/BOOK_STUDY_MANUAL.md
```

`catalog.js`, `README.md`, `AGENTS.md`, `docs/BOOK_STUDY_MANUAL.md`는 전체 파일로 덮어쓰지 않습니다. 현재 내용을 읽은 뒤 요엘 항목과 적용일만 삽입·갱신합니다.

## 설치

먼저 로컬 저장소의 작업 트리가 깨끗한지 확인합니다.

```bash
git status -sb
```

패키지를 압축 해제한 폴더에서 다음을 실행합니다.

```bash
python3 integrate_joel.py --repo /path/to/biblestudygyu --write
```

Windows에서는 다음처럼 실행할 수 있습니다.

```powershell
py integrate_joel.py --repo "C:\path\to\biblestudygyu" --write
```

통합 상태만 다시 검사하려면 다음을 실행합니다.

```bash
python3 integrate_joel.py --repo /path/to/biblestudygyu --check
```

## 저장소 기본 검사

설치 스크립트 검사를 통과한 뒤 저장소 루트에서 프로젝트 자체 검사도 실행합니다.

```bash
python3 tools/apply_study_tools.py --check
python3 tools/apply_bible_reader.py --check
```

그리고 다음 항목을 브라우저에서 확인합니다.

- `ot/joel/index.html`의 네 단계 순서와 비활성 원어 연구 상태
- 1–3장 성경읽기 링크의 `book=JOL`
- 장별 심층연구 이동과 현재 장 `aria-current`
- 목차 앵커, 모바일 화면, 다크 모드
- 루트 홈페이지의 요엘 카드

## 이번 교정 사항

- `ch01.html`에서 존재하는 3장 자료가 “준비 중”으로 표시되던 오류를 활성 링크로 수정했습니다.
- 세 장의 심층연구 사이드바에 `원어 연구 준비 중` 상태를 추가했습니다.
- 업로드 과정에 종속된 표현을 저장소 문서형 표현으로 정리했습니다.
- 원어 연구 파일은 실제로 없으므로 링크를 만들지 않고 `준비 중`으로 유지했습니다.
- 원본 EPUB·PDF·DJVU·폰트 파일은 포함하지 않았습니다.

## 권장 Git 절차

```bash
git switch -c agent/add-joel-study-set
git add ot/joel catalog.js README.md AGENTS.md docs/BOOK_STUDY_MANUAL.md
git commit -m "Add Joel study set"
git push -u origin agent/add-joel-study-set
```
