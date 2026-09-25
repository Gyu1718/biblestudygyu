# 신명기 연구 서가

`ot/deuteronomy/`는 신명기 34장을 종합 개관, 장별 심층연구, 원어 연구로 제공한다. 모든 HTML은 빌더가 생성하므로 직접 고치지 않는다.

## 구성

| 파일 | 역할 |
| --- | --- |
| `index.html` | 서가. 종합 개관, 34장 카드, 성경읽기와 원어 연구 연결 |
| `overview.html` | 종합 개관. 구조 개요 표, 명칭, 배경, 조약 형식과 구조, 저작과 연대, 계기, 정경과 본문, 신학, 해석의 쟁점, 신약이 읽은 신명기, 두 주석의 입장 비교, 더 읽을 문헌 |
| `chNN.html` | 장별 심층연구. 단락의 짜임, 단락별 주해와 그 아래의 절별 주해, 핵심 원어, 신학적 메시지, 상호 참조, 주석 출처 |
| `parsing/chNN.html` | STEPBible TAHOT 기반 인터라이너(959절). `tools/interlinear/` 파이프라인으로 생성 |
| `research_data.py` | 출처(`SOURCES`)와 장별 연구 데이터(`CHAPTERS`) |
| `verse_exegesis.py` | 절별 주해(357항목). 34장 959절을 빠짐없이 덮으며 각 항목은 한 단락 안에 들어간다. 크레이기와 톰슨의 절별 논지를 요약·종합해 쓴 해설이다 |
| `lexicon_spec.py` | 장별 핵심 원어 명세(137항목). 절, Strong 번호, 표제, 설명, 출처 칩 |
| `lexicon_data.py` | 자동 생성 파일. `tools/build_deuteronomy_lexicon.py`가 명세와 STEPBible TAHOT에서 히브리어 표기, 사전형, 음역, 신명기 빈도를 만든다 |
| `overview_data.py` | 종합 개관 데이터(`OVERVIEW`)와 서가 소개문(`INDEX_LEAD`) |
| `study.css` | 서가 전용 스타일 |

## 출처

- `C` Peter C. Craigie, *The Book of Deuteronomy*, NICOT (Eerdmans, 1976)
- `T` J. A. Thompson, *Deuteronomy: An Introduction and Commentary*, TOTC (IVP, 1974)

주석의 논지는 요약해 옮겼고 원문을 길게 인용하지 않는다. 주석 원문은 저장소에 두지 않는다. 성경 인용은 개역개정을 따른다. 크레이기는 히브리어 장절을 함께 쓰므로 13장, 23장, 29장에서는 한국어 장절로 바꾸어 적었다.

## 빌드와 검사

```bash
python3 tools/build_deuteronomy_lexicon.py     # 핵심 원어 데이터 생성(명세를 바꿨을 때)
python3 tools/build_deuteronomy.py --write   # 페이지 생성
python3 tools/build_deuteronomy.py --check   # 데이터 검증과 산출물 일치 확인
```

검사는 장마다 단락과 절별 주해가 각각 1절부터 마지막 절까지 순서대로 빠짐없이 덮이는지, 절별 주해 항목이 단락 경계를 넘지 않는지, 출처 칩이 `SOURCES`에 있는지, 신학적 메시지와 상호 참조가 비어 있지 않은지, 원어 연구 34편이 모두 있는지를 확인한다. 콘텐츠를 바꾼 뒤에는 `python3 tools/apply_site_search.py --write`와 `python3 tools/build_search_index.py --write`로 검색 색인을 갱신한다.
