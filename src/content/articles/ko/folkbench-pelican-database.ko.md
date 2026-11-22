---
slug: folkbench-pelican-database
translationKey: folkbench-pelican-database
locale: ko
kind: article
title: "Folkbench Pelican Database 오픈소스 공개: models.dev 정렬·507개 모델을 아우르는 세계 최대급 펠리컨 데이터베이스"
description: "Folkbench가 Pelican Database를 오픈소스로 공개합니다. 3,875개 다중 출처 표본에서 507개 정규 모델, 68개 제공사, 454개 원본 SVG 및 507개 표준 PNG를 정제하고 models.dev 정렬과 일일 자동 동기화로 모델 진위 검증을 지원합니다."
category: 평가
tags: [펠리컨벤치마크, 오픈데이터베이스, 모델진위검증, models.dev]
authorId: cang-lin
modelIds: [gpt-6-2-astra, claude-fable-5-2, gemini-4-neon, deepseek-v4-pro]
benchmarkSlugs: []
relatedSlugs: [how-to-score-a-cycling-pelican, how-folkbench-detects-model-degradation, did-the-model-get-dumber]
publishedAt: '2026-11-22'
updatedAt: '2026-11-22'
sources:
  - id: folkbench-pelican-db
    label: Folkbench/pelican-database 오픈소스 저장소
    url: https://github.com/Folkbench/pelican-database
    checkedAt: '2026-11-22'
    claimScope: official
  - id: simon-pelican-tag
    label: Simon Willison, pelican-riding-a-bicycle 태그 아카이브
    url: https://simonwillison.net/tags/pelican-riding-a-bicycle/
    checkedAt: '2026-11-22'
    claimScope: official
  - id: simon-pelican-repo
    label: simonw/pelican-bicycle 원본 실험 저장소
    url: https://github.com/simonw/pelican-bicycle
    checkedAt: '2026-11-22'
    claimScope: official
  - id: unclek-pelicanmap
    label: UncleK/pelicanmap 일일 업데이트 다국어 펠리컨 아카이브
    url: https://github.com/UncleK/pelicanmap
    checkedAt: '2026-11-22'
    claimScope: observed
  - id: models-dev
    label: models.dev 공개 모델 ID 및 메타데이터 API
    url: https://models.dev/api.json
    checkedAt: '2026-11-22'
    claimScope: official
  - id: folkbench-arena
    label: Folkbench 무결성 모니터(Integrity Monitor)
    url: https://folkbench.com/ko/arena
    checkedAt: '2026-11-22'
    claimScope: observed
---

> '자전거 타는 펠리컨' 그림이 단순한 SNS 스크린샷을 넘어 507개 모델을 아우르고 매일 자동 갱신되는 표준 참조 기준선으로 정리되면, 바이럴 벤치마크는 모델의 진위 여부를 검증하는 실질적인 엔지니어링 인프라가 됩니다.

오늘 우리는 **[Folkbench/pelican-database](https://github.com/Folkbench/pelican-database)** 를 오픈소스로 공개합니다. 이는 LLM이 생성한 '자전거 타는 펠리컨(Pelican Riding a Bicycle)' SVG 및 PNG 참조 데이터셋 중 **세계 최대 규모이자 가장 체계적으로 구축된 데이터베이스 중 하나**입니다.

2024년 10월 Simon Willison이 *"Generate an SVG of a pelican riding a bicycle"* 프롬프트를 대중화한 이후 전 세계 개발자들이 수백 개의 프런티어 및 오픈웨이트 모델을 테스트해 왔습니다. 하지만 기록들이 블로그, X, GitHub Gist, HTML 비교표와 갤러리에 흩어져 있어 모델 명칭이 제각각이고 원본 SVG 없이 스크린샷만 남은 경우가 많았습니다.

`Folkbench/pelican-database`는 이를 체계적으로 수집·정제하고 **[models.dev](https://models.dev)** 표준 식별자(`provider/model_id`)에 맞춘 뒤, GitHub Actions로 매일 증분 동기화하여 [Folkbench](https://folkbench.com/ko)의 모델 진위 검증을 구동합니다.

---

## 1. 숫자로 보는 규모와 완성도

초기 공개 스냅샷(2026-11-22) 기준 핵심 지표는 다음과 같습니다.

| 항목 | 검증 수치 | 세부 내용 |
| --- | --- | --- |
| **통합 후보 표본** | **3,875개** | UncleK/pelicanmap + Simon Willison 태그 글 161편·정적 HTML 비교표·직접 링크 SVG 통합 |
| **정규화된 고유 모델** | **507개** | **799개**의 비정형 모델명 별칭을 표준 `provider/model_id`로 통합 |
| **포함된 제공사** | **68곳** | 주요 상용 AI 연구소부터 오픈웨이트 모델 패밀리까지 포괄 |
| **원본 `.svg` 확보율** | **454개 (89.5%)** | XML 및 태그 검증을 통과한 파싱 가능한 원본 SVG 소스코드 |
| **표준 `.png` 렌더링** | **507개 (100%)** | 헤드리스 브라우저 기반 1024px 흰 배경 통일 렌더링(누락 0건) |
| **실시간 `models.dev` 정확 일치** | **378개 (74.6%)** | 190개 퍼스트파티 제공사 일치 포함, 종료된 구버전 129개도 동일 규격 정규화 |
| **Simon Willison 테스트 포함** | **177개** | `tested_by_simon` 플래그 기록 및 원본 SVG 우선 확보 |
| **수록 기간** | **2024-10-25 ~ 2026-11-21** | 2년 이상 걸친 공간 추론 및 SVG 코드 생성 역량의 진화 기록 |

![Folkbench Pelican Database 내 2024년 기준선과 2026년 프런티어 모델의 원본 SVG 진화 비교(OpenAI, Anthropic, Google).](/blog/figures/folkbench-pelican-database/evolution-grid.png)

*그림 1: `Folkbench/pelican-database`의 원본 `.svg`에서 직접 렌더링한 6개 표본. 상단(2024년 10월)은 `openai/gpt-4o`, `anthropic/claude-3-5-sonnet-20241022`, `google/gemini-1.5-pro-001`, 하단(2026년 11월)은 `openai/gpt-6.2-astra`, `anthropic/claude-fable-5-2`, `google/gemini-4-neon`입니다.*

---

## 2. 프로덕션급 아카이브를 위한 5가지 엔지니어링 설계

![그림 2 아키텍처: Folkbench Pelican Database의 다중 출처 수집, models.dev 정규화, SHA-256 증분 렌더링 및 일일 자동 동기화 파이프라인.](/blog/figures/folkbench-pelican-database/pipeline-architecture-en.svg)

1. **다중 출처 복원으로 원본 SVG 회수**: [UncleK/pelicanmap](https://github.com/UncleK/pelicanmap)[^unclek-pelicanmap] 일일 아카이브와 [Simon Willison의 전체 161편 글](https://simonwillison.net/tags/pelican-riding-a-bicycle/)[^simon-pelican-tag]을 교차 수집해 `static.simonwillison.net` 비교표의 base64 SVG 180건과 직링크 SVG를 복원했으며, **원본 `.svg` > Simon 실측 > classic 프롬프트 > 기본/고추론 설정** 우선순위로 대표 표본을 선정합니다.
2. **`models.dev` 정렬 및 원개발사 귀속 보정**: [`models.dev/api.json`](https://models.dev/api.json)[^models-dev]을 기준으로 OpenAI(72), Google(64), Alibaba/Qwen(63), Anthropic(30), Meta(21), Mistral(21), DeepSeek(19), Z.AI/GLM(19), xAI(16) 등 68개 제공사로 정규화하고, 799개 원본 별칭을 `model_aliases` 테이블에 보존합니다.
3. **헤드리스 브라우저 통일 렌더링 및 무결성 검증**: 크로스플랫폼 Chromium/Edge CDP로 격리된 `<img>` 샌드박스에서 1024px 흰 배경 PNG를 생성하고 507개 전체의 파일 헤더와 해상도를 검증했습니다.
4. **파일 + JSON + SQLite 즉시 활용**: `models/<provider>/<model_id>.{svg,png}`, `catalog.json`, 그리고 4개 테이블과 2개 뷰를 갖춘 `pelicans.sqlite`를 함께 제공합니다.
5. **GitHub Actions 일일 자동 증분 동기화**: `scripts/sync.py`와 `.github/workflows/auto-sync.yml`이 매일 `09:00 UTC`에 자동 실행되며 SHA-256 해시 비교로 신규·변경 모델만 재렌더링합니다.

---

## 3. Folkbench 모델 진위 검증을 구동하는 시각 기준선

[「자전거 타는 펠리컨은 어떻게 채점할까?」](/ko/blog/how-to-score-a-cycling-pelican/)와 [「Folkbench 성능 저하 탐지 공개」](/ko/blog/how-folkbench-detects-model-degradation/)에서 다룬 바와 같이, 서드파티 API 중계소의 저가 모델 몰래 교체나 추론 강도 하향은 단순 HTTP 200 모니터링으로 잡아내기 어렵습니다. `Folkbench/pelican-database`는 [Folkbench Integrity Monitor](https://folkbench.com/ko/arena)[^folkbench-arena]의 시사 프로브, 모델 지문, 독립 공식 API 기준선과 결합해 **공개적으로 재검증 가능한 세대 간 시각 비교 기준선**을 제공합니다.

---

## 4. 빠른 시작

```bash
git clone --depth 1 https://github.com/Folkbench/pelican-database.git
cd pelican-database
```

```sql
SELECT model_id, models_dev_id, svg_path, png_path, date
FROM models
WHERE tested_by_simon = 1 AND has_svg = 1
ORDER BY provider, model_id;
```

---

## 5. 라이선스 및 감사의 글 (Credits & Acknowledgements)

**[Simon Willison](https://simonwillison.net/)**[^simon-pelican-tag][^simon-pelican-repo], **[UncleK / Pelican Map](https://github.com/UncleK/pelicanmap)**[^unclek-pelicanmap], **[models.dev](https://models.dev)**[^models-dev]와 **Tihu**, **Pelican Zoo**, **Museum of Models**, **Pelicans.wtf**, **Pelican Benchmark**를 비롯한 모든 커뮤니티 기여자분들께 깊이 감사드립니다. 파이프라인 스크립트·스키마·문서는 **MIT License**를 따르며, 수록된 제3자 모델 출력물 및 상위 메타데이터의 권리는 원저작자와 원출처에 있습니다(`NOTICE.md` 참고). 저장소 바로가기: **[github.com/Folkbench/pelican-database](https://github.com/Folkbench/pelican-database)**[^folkbench-pelican-db].
