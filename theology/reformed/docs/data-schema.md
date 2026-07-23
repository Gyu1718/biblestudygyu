# Data Schema

이 문서는 공개 아카이브의 JSON 데이터 입력 규칙입니다.

## 현재 관리 파일

- `data/books.json`: 책 정보
- `data/authors.json`: 학자 정보
- `data/topics.json`: 교리 주제 정보
- `data/passages.json`: 성경 본문 정보
- `data/tradition-history.json`: 개혁전통 역사 정보
- `data/neo-orthodoxy-history.json`: 신정통주의 역사 정보
- `data/neo-orthodoxy-doctrine-history.json`: 신정통주의 세부 교리사 정보
- `data/author-history-links.json`: 학자와 역사 항목 연결
- `data/topic-history-links.json`: 주제와 역사 항목 연결
- `data/passage-theology-links.json`: 본문과 주제·역사 항목 연결
- `data/taxonomy.json`: 표준 주제 분류
- `data/quotes/*.json`: 공개 가능한 짧은 인용문과 인용 위치·맥락 정보

## 입력 원칙

- 책 데이터는 서지정보, 목차, 장별 요약, 주제 태그를 중심으로 입력합니다.
- 학자 데이터는 이름, 시대, 전통, 핵심 주제, 주요 저작을 중심으로 입력합니다.
- 주제 데이터는 개념 요약, 관련 주제, 문헌 위치, 전통별 입장을 중심으로 입력합니다.
- 본문 데이터는 성경 본문 표기, 요약, 관련 주제, 관련 문헌을 중심으로 입력합니다.
- 역사 데이터는 시대, 정의, 배경, 주요 인물, 주요 문헌, 신학 쟁점, 연결 색인을 중심으로 입력합니다.
- 긴 원문은 넣지 않고, 필요한 경우 위치 정보와 짧은 인용문만 기록합니다.
- `id`는 링크와 검색에 사용되므로 한 번 정하면 가급적 바꾸지 않습니다.

## 책 항목 필드

책 항목은 단순한 책 소개가 아니라 연구 색인의 기준점입니다.

- `id`: 책 고유 ID. 예: `calvin-institutes`, `barth-church-dogmatics`
- `title`: 한국어 책 제목
- `author`: 한국어 저자명
- `originalAuthor`: 원어 저자명
- `tradition`: 전통 구분. 예: `개혁파 정통`, `신정통주의`
- `category`: 문헌 유형
- `language`: 데이터 기준 언어
- `summary`: 책 전체 요약. 2-4문장
- `researchUse`: 연구·설교·교리교육에서의 활용 방식
- `topics`: 대표 교리 주제
- `parts`: 권/부/대주제 단위 배열

## part / chapter / quote 설명 단위

인용구 위 설명이 모두 동일해지는 문제를 막기 위해 설명 단위를 반드시 구분합니다.

### `part.summary`

- 권, 부, 대주제 전체 설명입니다.
- 예: `CD IV/1`이라면 화해론 제1형식, 낮아지신 주님과 칭의의 큰 흐름을 설명합니다.
- 이 문장을 각 인용구 위에 반복하지 않습니다.

### `chapter.summary`

- 특정 장, 절, §, 소주제 자체의 짧은 설명입니다.
- 예: `CD IV/1 §62 성령과 그리스도교 공동체의 모임`이라면 성령께서 그리스도교 공동체를 불러 모으시는 교회론적 대목이라고 설명합니다.
- 책 전체 설명이나 part 설명을 복붙하지 않습니다.

### `chapter.detail`

- 해당 소주제가 책 전체 논증 안에서 수행하는 역할을 설명합니다.
- 바르트의 경우 `CD 권/부 §번호` 단위로, 칼빈의 경우 `권.장` 단위로, 벌코프와 바빙크의 경우 장/항목 단위로 작성합니다.
- 최소 2문장 이상 권장합니다.

### `quotes[].context`

- 인용구 바로 위에 표시되는 고유 설명입니다.
- 반드시 해당 인용의 `ref`, `topic`, `subtopic`, `chapter.title` 중 하나 이상을 반영해야 합니다.
- 책 전체 요약, 저자 일반 설명, 같은 part 설명을 반복하지 않습니다.
- 인용문이 왜 그 위치에 붙는지 설명합니다.

예시:

```json
{
  "ref": "CD IV/1 §62",
  "title": "성령과 그리스도교 공동체의 모임",
  "summary": "성령께서 그리스도교 공동체를 불러 모으시고 그 공동체 안에서 그리스도의 화해 사역이 증언되는 방식을 다룹니다.",
  "detail": "이 절은 바르트가 화해론의 교회론적 귀결을 다루며, 성령께서 예수 그리스도의 완성된 화해 사역을 공동체의 모임 안에서 현실화하시는 방식을 설명하는 대목입니다. 교회는 인간의 종교 단체로 먼저 정의되지 않고, 성령께서 그리스도의 몸을 불러 모아 말씀을 듣고 증언하게 하시는 사건으로 이해됩니다.",
  "quotes": [
    {
      "text": "짧은 인용문 또는 표제급 표현",
      "source": "Karl Barth, Church Dogmatics IV/1",
      "ref": "CD IV/1 §62",
      "topic": "성령과 공동체",
      "context": "이 인용은 바르트가 교회를 제도 자체로 먼저 정의하지 않고, 성령께서 그리스도의 화해를 증언하도록 불러 모으시는 공동체로 설명하는 대목에 붙입니다.",
      "placement": "quote-block",
      "priority": "high"
    }
  ]
}
```

## quote pack 필드

`data/quotes/*.json`의 각 인용 항목은 다음 필드를 사용합니다.

- `book`: 연결될 책 ID
- `volume`: 바르트처럼 권/부 구분이 필요한 경우. 예: `CD IV/1`
- `section`: 칼빈·벌코프·바빙크의 장 번호 또는 바르트의 § 번호
- `chapter`: 장 또는 소주제 제목
- `subtopic`: 더 작은 주제
- `textKo` 또는 `text`: 공개 가능한 짧은 인용문
- `source`: 출처 표시
- `ref`: 화면에 표시할 정확한 위치
- `topic`: 주제 태그
- `context`: 인용구 위 고유 설명
- `purpose`: 활용 목적. 예: `topic-card`, `chapter-detail`, `comparison`
- `placement`: 화면 배치. 예: `quote-block`
- `priority`: 우선순위. 예: `high`, `medium`, `low`
- `pageOmitted`: 공개 저장소에서 페이지 정보를 생략했는지 여부

## 역사 항목 필드

역사 항목은 다음 필드를 사용합니다.

- `id`
- `title`
- `period`
- `category`
- `summary`
- `definition`
- `historicalBackground`
- `keyQuestions`
- `keyFigures`
- `keyDocuments`
- `theologicalIssues`
- `relatedTopics`
- `relatedBooks`
- `relatedAuthors`
- `relatedPassages`
- `misunderstandings`
- `researchUses`
- `quotePointers`
- `status`

## 태그 관리 원칙

태그는 너무 세분화하지 않고, 먼저 대주제를 고정합니다.

대표 태그: 신학서론, 계시론, 성경론, 신론, 삼위일체, 작정, 예정론, 섭리, 창조, 인간론, 죄론, 기독론, 속죄론, 구원론, 칭의, 성화, 교회론, 성례론, 언약신학, 종말론, 성경신학, 신학방법론, 자연신학, 현대신학, 신정통주의, 변증법적 신학.
