# 성서 지식사전 1차 확장 패키지

대상 저장소: `Gyu1718/biblestudygyu`

## 포함 항목

1. `person/sheshbazzar.md` — 세스바살
2. `place/susa.md` — 수산
3. `place/yehud.md` — 예후드
4. `people/judeans.md` — 유다인
5. `group/levites.md` — 레위인
6. `institution/high-priesthood.md` — 대제사장직
7. `object/second-temple.md` — 제2성전
8. `event/jerusalem-wall-rebuilding.md` — 예루살렘 성벽 재건

모든 항목은 현재 저장소의 YAML/Markdown 형식에 맞추었으며 `status: published`입니다.

## 적용 방법

### 로컬 저장소에서 적용

1. ZIP을 저장소 루트에 풉니다.
2. 기존 파일을 덮어쓰라는 메시지가 나오면 `content/encyclopedia` 아래의 새 파일만 추가되었는지 확인합니다.
3. 다음 명령을 실행합니다.

```bash
python -m pip install -r tools/requirements-encyclopedia.txt
python tools/build_encyclopedia_index.py
python tools/verify_encyclopedia_round1.py
```

4. 다음 경로를 함께 커밋합니다.

```text
content/encyclopedia/
assets/data/encyclopedia/index.json
tools/verify_encyclopedia_round1.py
```

### GitHub 웹에서 업로드

GitHub의 파일 업로드 화면은 ZIP을 자동으로 풀지 않습니다. 압축을 푼 뒤 폴더 구조를 유지하여 파일을 업로드해야 합니다. 이후 로컬 환경이나 Codespaces에서 `python tools/build_encyclopedia_index.py`를 실행해 `index.json`을 갱신합니다.

## 자동 인식 정책

- 전역 자동 인식: 세스바살, 수산, 예후드, 유다인, 레위인, 대제사장직, 제2성전, 예루살렘 성벽 재건
- 문맥 인식만 허용: 유대인, 대제사장, 성벽 재건, 스룹바벨 성전
- 자동 인식 금지: 유다, 성전, 성벽 등 다의적 일반 명사

## 검수 사항

- 세스바살과 스룹바벨의 동일성은 확정하지 않았습니다.
- 수산은 페르시아의 유일한 수도로 표현하지 않았습니다.
- 예후드의 경계와 행정 독립 시점은 논쟁으로 표시했습니다.
- 유다인과 현대 유대인을 자동으로 동일시하지 않도록 `유대인`을 contextual에 두었습니다.
- 제사장과 레위인의 관계는 문헌과 시대에 따라 달라진다고 설명했습니다.
- 제2성전의 초기 건물과 헤롯 확장 성전을 구분했습니다.
- 성벽 재건의 52일 기록과 요세푸스의 다른 전승을 구분했습니다.

## 참고

이 패키지는 기존 저장소 파일을 수정하지 않고 새 항목만 추가합니다. 기존 항목에서 새 항목으로 향하는 역방향 관계는 추후 일괄 보완할 수 있습니다.
