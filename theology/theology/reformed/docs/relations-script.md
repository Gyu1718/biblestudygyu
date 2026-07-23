# Relations Script

`js/relations.js`는 자료 사이의 관계를 화면에 붙이는 통합 스크립트입니다.

## 1. 통합한 기능

기존에는 다음 기능이 개별 보조 스크립트로 분리되어 있었습니다.

- 주제 → 역사 항목 연결
- 학자 → 역사 항목 연결
- 본문 → 주제/역사 연결
- 책 ↔ 본문 연결
- `#passage=<id>` 본문 상세 라우트

이제 위 기능은 `js/relations.js`에서 한 번에 처리합니다.

## 2. 남겨둔 별도 스크립트

다음 스크립트는 역할이 다르기 때문에 아직 분리해 둡니다.

- `js/history-nav-enhance.js`: 역사 상세 페이지의 이전/다음 이동
- `js/compact-related-passages.js`: 책 카드 목록에서 관련 본문을 대표 3개 칩으로 축약
- `js/passage-depth-enhance.js`: 본문 카드 목록에서 본문 연구 노트 표시
- `js/ui-polish.js`: 검색 초기화, 카드 접힘, 모바일/시각 정리

## 3. 사용하는 데이터 파일

`relations.js`는 다음 데이터를 읽습니다.

```txt
data/books.json
data/authors.json
data/topics.json
data/passages.json
data/topic-history-links.json
data/author-history-links.json
data/passage-theology-links.json
data/tradition-history.json
data/neo-orthodoxy-history.json
data/neo-orthodoxy-doctrine-history.json
```

## 4. 주요 화면 동작

### 주제 카드/상세

주제 카드나 주제 상세 페이지에 관련 역사 항목을 붙입니다.

### 학자 카드

학자 카드에 관련 역사 항목을 붙입니다.

### 본문 카드

본문 카드에 다음을 붙입니다.

- 신학 연결
- 관련 주제
- 관련 역사
- 관련 책

### 책 카드/책 상세

책 카드와 책 상세 페이지에 관련 성경 본문을 붙입니다. 책 카드 목록에서 관련 본문이 너무 많아질 경우, `compact-related-passages.js`가 대표 본문 3개와 상세 페이지 이동 버튼으로 축약합니다.

### 본문 상세 라우트

다음 해시를 실제 본문 상세 화면으로 렌더링합니다.

```txt
#passage=romans-9
#passage=john-1-14
#passage=2-timothy-3-16
```

## 5. 운영 원칙

- 관계 데이터는 가능하면 JSON에 넣고, 화면 로직은 `relations.js`가 읽어 붙입니다.
- `app.js`는 핵심 렌더러로 두고, 관계 확장은 별도 레이어에서 처리합니다.
- 관계 연결과 UI 정리의 스타일 규칙은 `css/style.css`에서 관리합니다.
- `relations.js`는 화면 구조와 라우팅만 담당하고, `<style>` 태그를 직접 만들지 않습니다.
