# 원어 사전 패키지 설치

이 ZIP은 `Gyu1718/biblestudygyu` 저장소 루트에 그대로 업로드하거나 압축을 풀어 병합하도록 구성했습니다.

## 새로 추가되는 경로

- `lexicon/`
- `assets/data/lexicon/`
- `assets/js/lexicon-core.js`
- `assets/js/lexicon-hover.js`
- `assets/js/lexicon-page.js`
- `assets/js/original-lexicon-bridge.js`
- `assets/css/lexicon.css`
- `assets/css/lexicon-hover.css`
- `tools/build_lexicon.py`

## 교체되는 파일

- `catalog.js` — 홈 화면에 원어 사전 서가를 추가합니다.
- `bible/original.html` — 원어 단어 호버 스크립트를 연결합니다.

## 동작

1. `lexicon/index.html`에서 Strong 번호·원어·한글 발음·뜻을 검색합니다.
2. `lexicon/entry.html?id=G4267` 형식으로 상세 항목을 엽니다.
3. `bible/original.html`의 히브리어·헬라어 단어에 마우스를 올리거나 터치하면 간략 사전이 뜹니다.
4. 호버의 “상세 사전 열기”를 누르면 해당 사전 페이지로 이동합니다.

## 원어 단어 연결

- 구약: 기존 WLC/OSHB XML의 `lemma`와 `morph` 속성을 이용합니다.
- 신약: 사용자가 제공한 헬라어 스트롱 사전의 활용형 목록을 역색인하여 NA28 표면형과 연결합니다.
- 동형어가 여러 Strong 번호에 연결될 때 호버에 후보 수를 표시하고 상세 페이지에서 확인하도록 했습니다.

## 로컬 테스트

`file://`로 직접 열면 압축 JSON을 가져오지 못할 수 있습니다.

```bash
python3 -m http.server 8000
```

그 뒤 `http://localhost:8000/lexicon/`을 엽니다.

## 공개 전 확인

한글 스트롱 사전은 비영리 학술 목적으로 JSON·HTML 변환 및 공개 허락을 받은 자료입니다. 공개 화면에는 책 제목만 표시하며, 내부 검증용 파일명·쪽수는 사용자에게 노출하지 않습니다. STEP 보충 데이터의 출처는 `assets/data/lexicon/ATTRIBUTION.md`에 기록했습니다.
