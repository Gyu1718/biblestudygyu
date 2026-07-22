# Berkhof upload package v3

이 패키지는 벌코프 『조직신학』 상세 페이지 보강용입니다.

## 핵심 수정

v2에서 인용 블록 안에 `subtopicExplanation`이 함께 들어가 중복이 생겼습니다. v3에서는 역할을 분리했습니다.

- 장/소주제 영역: `subtopicOverview`, `subtopicExplanations`, `subtopicQuestions` 표시
- 인용 영역: 인용문, 출처, `quoteExplanation`만 표시
- 인용 JSON: 각 인용 항목에서 `subtopicExplanation`, `teachingUse`, `compareNote` 제거

## 업로드 경로

압축을 풀고 아래 경로 그대로 업로드하세요.

```txt
js/berkhof-preload.js
data/books/berkhof-chapter-profiles.json
data/quotes/berkhof-systematic-theology-quotes-explained-v3.json
```

기존 v1-v6 일반 인용팩은 삭제하지 않아도 됩니다. `berkhof-preload.js`는 설명 포함 v3 인용팩을 우선 읽고, 없을 때 v2/v1 또는 기존 v1-v6 일반팩을 fallback으로 읽습니다.

## 화면 표시 규칙

### 소주제 설명

소주제 설명은 장 상세의 `소주제 설명` 박스에서만 보입니다.

### 인용 설명

인용 블록에는 다음만 표시됩니다.

```txt
인용문
출처
인용 설명
```

`소주제 설명`은 인용 블록에 표시하지 않습니다. 이로써 같은 내용이 두 번 반복되는 문제를 제거했습니다.
