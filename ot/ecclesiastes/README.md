# 전도서 연구 서가

`index.html`은 열두 장의 서가와 책 전체의 개관·구조·신학을 함께 싣습니다. `overview.html`은 종합 연구를 별도 문서로 읽기 위한 경로입니다. `ch01.html`–`ch12.html`은 단락별 심층 주해, 절 범위 관찰, 주석 이견, 신학 메시지로 구성됩니다. 성경 본문은 공통 리더의 ECC로 연결하며, 존재하지 않는 원어 연구 파일에는 링크하지 않습니다.

## 자료와 연구 원칙

사용자의 Google Drive `<도서>` 아래에서 본문을 판독하고 대조한 다섯 자료만 사용했습니다.

| 칩 | 자료 | 기능 |
|---|---|---|
| S | C. L. Seow, *Ecclesiastes*, Anchor Yale Bible 18C | 언어·사회경제 배경, 단락 배열과 주해 |
| F | Michael V. Fox, *The JPS Bible Commentary: Ecclesiastes* | 헤벨, 구절별 난제, 유대 해석 전승 |
| M | Roland E. Murphy, *전도서*, WBC 23A 한국어판 | 구조, 히브리어 절 구분, 주해 |
| B | William P. Brown, *전도서*, 현대성서주석 한국어판 | 신학적 읽기와 그리스도교적 대화 |
| H | 목회와신학 편집부 엮음, *전도서 어떻게 설교할 것인가* | 본문 단위의 목회적 수용 |

사용자 소장 PDF는 공개 저장소에 복사하지 않았습니다. AOTC PDF에는 판독 가능한 텍스트가 없어 연구와 출처 표기에서 제외했습니다. 한국어 PDF의 OCR은 손상된 단어가 있어 직접 인용 대신 논지의 의역에 사용했습니다. 원어의 모음·자음과 성경 인용문을 PDF OCR에서 그대로 옮기지 않았습니다. 각 문단의 주석 칩은 페이지 아래의 서지와 해당 장 주해로 이동합니다. 5장 서원 단락은 히브리어 장절의 4:17–5:6과 한국어 장절의 5:1–7 차이를 적었습니다.

11:1–2의 상업·자선 독법, 7:26–29의 여성/의인화된 어리석음, 12:1의 창조주/기력 독법, 12:9–14의 편집자 목소리는 의견 차이를 유지합니다. 주석가의 추정과 본문의 직접 진술, 본문 주해와 기독교적 수용은 구별합니다.

## 재생성 및 검증

연구 원고는 `research_data.py`, `deep_dive.py`, `verse_notes.py`, `cross_references.py`, `overview_data.py`에 저장됩니다. HTML은 다음 명령으로 만듭니다.

```bash
python3 tools/build_ecclesiastes.py --write
python3 tools/build_ecclesiastes.py --check
python3 tools/apply_study_tools.py --check
python3 tools/apply_bible_reader.py --check
```
