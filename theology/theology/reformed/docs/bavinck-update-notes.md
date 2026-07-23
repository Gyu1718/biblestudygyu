# 바빙크 『개혁교의학 개요』 업로드 패치 노트

## 목적

이 패치는 `Reformed_Theology_Research_Archive`의 기존 바빙크 항목 `bavinck-reformed-dogmatics`를 보완하기 위한 공개 저장소용 데이터입니다. 원문 전문, OCR TXT, 긴 인용문은 포함하지 않고, 장별 직접 요약·소주제 설명·짧은 표제급 인용·인용 위치 포인터만 포함했습니다.

## 중요: 중복 추가 금지

현재 `data/books.json`에는 이미 `id: bavinck-reformed-dogmatics` 항목이 있습니다. 따라서 새 항목으로 append하지 말고, 기존 바빙크 객체를 `data/books.bavinck.replacement.json`의 내용으로 **교체**해야 합니다.

## 포함 파일

- `data/books.bavinck.replacement.json`
  - `data/books.json`의 기존 바빙크 항목을 대체할 완성 객체입니다.
  - `parts → chapters → quotes/context` 구조로 소주제 설명과 인용 설명을 보강했습니다.

- `data/books.bavinck.patch.json`
  - 위 replacement 파일과 같은 내용의 병합용 사본입니다.

- `data/quotes/bavinck-reformed-dogmatics.json`
  - 공개 가능한 짧은 인용팩입니다.
  - 각 인용에는 `context`를 별도로 작성했습니다.
  - `context`는 책 전체 설명을 반복하지 않고, 해당 장·소주제·인용 위치와 연결되도록 작성했습니다.

- `data/topic-links.bavinck.patch.json`
  - 주제별 연결 보강 참고 파일입니다.

- `data/passage-links.bavinck.patch.json`
  - 성경 본문 연결 보강 참고 파일입니다.

- `scripts/apply-bavinck-update.py`
  - 로컬 저장소 루트에서 실행하면 기존 `data/books.json`의 바빙크 항목을 자동 교체합니다.

## 자동 병합 방법

이 패치팩의 파일들을 저장소 루트에 복사한 뒤 다음을 실행합니다.

```bash
python scripts/apply-bavinck-update.py
python -m json.tool data/books.json > /dev/null
python -m json.tool data/quotes/bavinck-reformed-dogmatics.json > /dev/null
```

## 수동 병합 방법

1. `data/books.json`에서 `"id": "bavinck-reformed-dogmatics"` 객체를 찾습니다.
2. 그 객체 전체를 `data/books.bavinck.replacement.json`의 객체로 교체합니다.
3. `data/quotes/bavinck-reformed-dogmatics.json`은 그대로 `data/quotes/` 폴더에 추가합니다.
4. `topic-links`와 `passage-links`는 현재 앱의 연결 방식에 맞춰 필요한 것만 병합합니다.

## 이번 보완의 핵심 기준

### 1. 인용 설명 강화

각 인용의 `context`는 다음 기준으로 작성했습니다.

- 인용의 `ref`와 연결될 것
- 인용의 `topic`과 `subtopic`을 설명할 것
- 책 전체 요약을 반복하지 않을 것
- 같은 파트 설명을 복붙하지 않을 것
- “왜 이 인용이 이 장에 붙는가”를 설명할 것

### 2. 소주제 설명 강화

각 장은 다음 세 층위로 나누었습니다.

- `summary`: 해당 장 자체의 짧은 설명
- `detail`: 책 전체 논증 안에서 해당 장이 맡는 역할
- `keyPoints`: 장의 핵심 논지 3개

이렇게 분리하면 카드 상단 설명, 상세 페이지 설명, 인용 위 설명이 모두 같은 문장으로 반복되는 문제를 줄일 수 있습니다.

## 확인 필요 사항

- 번역자 정보는 기존 저장소 항목의 표기를 따라 `원광연`으로 반영했습니다.
- 원제와 원서 연도는 공개 데이터에 넣기 전 최종 확인을 권장합니다.
- 페이지 번호 대신 전자책 장 단위 위치를 사용했습니다.

## 권장 커밋 메시지

```txt
Improve Bavinck dogmatics data and quote contexts
```
