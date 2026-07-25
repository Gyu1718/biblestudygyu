# 로마서 연구 서가

## 현재 구조

```text
index.html          서가 홈페이지
overview.html       종합 개관
ch01.html–ch16.html 장별 심층연구
원어 연구           미구현
```

## A–E 보완 작업

사용자가 제공한 `romans-patch-A-E.zip`의 내용을 로마서 서가에 추가한다.

### A. 연구 자료 정합화

자료 칩을 다음 두 층으로 구분한다.

```text
직접 확인: Cranfield · Kruse · Stott · Moo · Dunn · Gaventa · Barth
재인용: Jewett · Longenecker
```

서가 홈페이지와 종합 개관, 각 장의 자료 범례에 이 구분을 표시한다.

### B. 바르트 독법 보강

다음 장의 `주석별 독법`에 바르트 해설을 보강한다.

```text
1 · 3 · 5 · 7 · 8 · 9 · 11장
```

### C. 로마서 13장 수용사

13장에 국가 권력, 저항, 복종과 관련된 해석사의 주요 사용 사례를 다루는 별도 보론을 추가한다.

### D. 주석별 독법 보완

누락됐던 다음 장에 `주석별 독법` 섹션을 추가한다.

```text
2 · 4 · 6 · 10 · 12 · 13 · 14 · 15 · 16장
```

### E. 후반부 해설 증량

12–16장의 주요 본문에 해설 박스 11개를 추가한다.

```text
12장  논리적 예배, 제의 언어, 은사 목록
13장  하나님의 사역자, 칼
14장  믿음으로 하지 않는 것, 강한 자의 양보
15장  제사장적 자기 이해, 예루살렘 연보
16장  뵈뵈의 직분과 후원, 문안 명단의 의미
```

## 적용 방식

현재 GitHub Pages에서는 다음 로더가 로마서 서가·개관·1–16장에 보완 내용을 적용한다.

```text
assets/js/romans-supplement.js
assets/js/research-dock-loader.js
```

원본 ZIP은 저장소에서 재구성 가능한 일곱 개의 Base64 조각으로 보존한다.

```text
tools/romans-patches/payload.part00.b64
...
tools/romans-patches/payload.part06.b64
```

정적 HTML로 병합할 때는 다음 명령을 사용한다.

```bash
python3 tools/apply_romans_patch.py --repo . --write
python3 tools/apply_romans_patch.py --repo . --check
```

패치 ZIP SHA-256:

```text
54cf96d9288452d6904b84287d1f865500fcb8b88fd9bca5418574b5b0b2c260
```

## 검증 기준

- 서가·개관·1–16장 총 18개 페이지 적용
- 바르트 보강 7개 장
- 주석별 독법 보완 9개 장
- 로마서 13장 수용사 1개 보론
- 후반부 해설 박스 11개
- 중복 HTML ID 0
- 깨진 목차 앵커 0
- 원어 연구 영역 변경 없음
