# 책-바르트 개선점 진단 v5

사용자가 올린 화면에서 `CD IV/1 §59 하나님의 아들의 순종`과 `CD IV/1 §60 인간의 교만과 타락`이 사실상 같은 설명을 공유하고 있었습니다. 문제는 데이터의 양이 아니라 **설명 단위와 화면 렌더링 단위가 맞지 않는 것**입니다.

## 발견한 문제

### 1. `§` 설명이 권/부 설명을 반복함

현재 `preload-data.js`의 바르트 설명 생성 방식은 `specialDetails`에 없는 항목에 대해 권/부 단위의 `volumeFrames`를 가져옵니다. 그래서 `CD IV/1 §59`, `§60`, `§61`, `§62`, `§63`은 서로 다른 절인데도 모두 `IV/1`의 일반 설명처럼 보입니다.

결과적으로 사용자는 각 절의 고유 논증을 읽지 못합니다.

### 2. 책-바르트 구조 맵의 III/IV권 항목이 문자열 중심임

`data/books-barth-structure-map.json`에서 I/1, I/2, II/1, II/2의 여러 항목은 `subtopics` 배열을 갖지만, III권과 IV권의 많은 항목은 단순 문자열입니다.

예:

```json
"sections": [
  "§59 하나님의 아들의 순종",
  "§60 인간의 교만과 타락",
  "§61 인간의 칭의",
  "§62 성령과 그리스도교 공동체의 모임"
]
```

이 구조에서는 화면이 절 아래의 소주제 설명을 만들 수 없습니다.

### 3. `chapter.detail`만으로는 소주제별 설명을 표시할 수 없음

현재 책 상세 화면은 기본적으로 다음 순서로 보여 줍니다.

```txt
chapter.summary
chapter.detail
keyPoints
quotes
```

하지만 사용자가 요청한 것은 다음 구조입니다.

```txt
chapter.summary
chapter.detail
subtopicDetails[]
  - 소주제 1 설명
  - 소주제 2 설명
  - 소주제 3 설명
quotes[].context
```

따라서 단순히 JSON에 `subtopics`를 넣는 것만으로는 해결되지 않습니다. 렌더링도 바뀌어야 합니다.

### 4. 인용구 context가 소주제와 연결되지 않음

기존 quote는 절 단위에 붙습니다. 그러면 `CD IV/1 §62` 안에서도 `그리스도교 공동체의 근거`, `성령에 의한 공동체의 소집`, `모임 안에서의 말씀과 증언`, `칭의의 교회론적 현실화`가 같은 설명을 공유하게 됩니다.

v5는 quote의 `subtopic` 또는 `topic`을 기준으로 가장 가까운 `subtopicContext`를 찾아서 `quote.context`를 보정합니다.

## v5의 해결 방식

v5는 `§`를 최종 단위로 삼지 않습니다. 최종 설명 단위는 **소주제**입니다.

```txt
book
└─ part
   └─ section / §
      └─ subtopicDetails[]
         ├─ oneLineSummary
         ├─ coreThesis
         ├─ detail
         ├─ focusQuestion
         ├─ quoteContext
         ├─ argumentRole
         ├─ reformedComparison
         ├─ researchUse
         └─ misuseWarning
```

## 예시: CD IV/1 §59

기존에는 `IV/1` 일반 설명이 반복되었습니다.

v5에서는 다음 소주제로 나뉩니다.

1. 하나님의 아들의 낮아지심
2. 순종의 자유
3. 대속적 종의 길

각 소주제마다 설명과 인용구 context가 따로 붙습니다.

## 예시: CD IV/1 §60

v5에서는 다음 소주제로 나뉩니다.

1. 인간의 교만
2. 타락의 형태
3. 십자가 아래 드러나는 죄

따라서 `§59`와 `§60`은 더 이상 같은 설명을 공유하지 않습니다.

## 예시: CD IV/1 §62

v5에서는 다음 소주제로 나뉩니다.

1. 그리스도교 공동체의 근거
2. 성령에 의한 공동체의 소집
3. 모임 안에서의 말씀과 증언
4. 칭의의 교회론적 현실화

각 소주제는 별도의 `detail`, `quoteContext`, `reformedComparison`, `researchUse`를 가집니다.
