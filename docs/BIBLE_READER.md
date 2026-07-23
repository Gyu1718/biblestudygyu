# 공통 성경 리더

성서 연구 서고의 연구 HTML에서 성경 장절을 자동으로 인식하고, 미리보기와 우측 성경 패널을 제공하는 공통 모듈이다.

## 제공 기능

- `학개 1:5–6`, `느 2:1–8`, `호 6:6`과 같은 한국어 장절 표기 자동 인식
- 같은 문서 안의 `1:5–6` 같은 축약 표기 문맥 인식
- 데스크톱에서 마우스를 올리면 최대 3절 미리보기
- 장절을 클릭하면 우측 성경 패널에서 본문 전체 표시
- 우측 `성경` 탭에서 장절 직접 검색
- 모바일에서는 우측 패널을 하단 시트로 전환
- 연구 문서의 기존 스크롤 위치 유지

## 현재 연결된 본문

- 느헤미야 1–13장
- 호세아 1–14장
- 학개 1–2장

본문은 개역개정이며, 학업·학술용으로 허가받은 범위 안에서 사용한다.

## 공통 자산

```text
assets/css/bible-reader.css
assets/js/bible-reader.js
assets/data/bible/kor/*.json
```

연구 HTML에는 다음 태그가 자동 삽입된다.

```html
<link rel="stylesheet" href="상대경로/assets/css/bible-reader.css" data-bible-reader-css>
<script src="상대경로/assets/js/bible-reader.js" defer data-bible-reader-js></script>
```

## 자동 적용

다음 명령은 `ot/`, `nt/`, `theology/` 아래의 모든 HTML을 검사하여 공통 자산 태그를 삽입한다.

```bash
python3 tools/apply_bible_reader.py --write
```

누락 여부만 확인할 때는 다음 명령을 쓴다.

```bash
python3 tools/apply_bible_reader.py --check
```

GitHub Actions가 새 연구 HTML이 `main`에 추가될 때 이 도구를 자동 실행하고 결과를 커밋한다.

## 데이터 빌드

분할된 큰 책 데이터는 다음 명령으로 배포용 JSON과 manifest를 만든다.

```bash
python3 tools/build_bible_data.py
```

현재 느헤미야 데이터가 분할 파일에서 `NEH.json`으로 합쳐진다.

## 자동 인식에서 제외하기

연도, 비율, 표 번호처럼 성경 장절로 해석하지 않아야 하는 부분에는 `data-no-scripture-link`를 붙인다.

```html
<span data-no-scripture-link>Jacobs 1:1 비율 도표</span>
```

`a`, `button`, `nav`, `pre`, `code`, `script`, `style`, 히브리어 표제 `.hw` 내부는 기본적으로 자동 인식에서 제외된다.

## 데이터 확장

새 책을 추가할 때는 다음 형식으로 파일을 추가한다.

```json
{
  "code": "GEN",
  "name": "창세기",
  "translation": "개역개정",
  "chapters": {
    "1": {
      "1": "본문"
    }
  }
}
```

파일명은 성경 리더의 책 코드와 동일하게 `GEN.json`처럼 지정한다. 이후 공통 모듈을 수정하지 않아도 해당 책 본문을 불러올 수 있다.
