---
slug: gpt-6-2-astra-sol-deep-dive
translationKey: gpt-6-2-astra-sol-deep-dive
locale: ko
kind: benchmark-review
title: "GPT-6.2 Astra와 Sol 심층 평가: 추론, 소프트웨어 개발, 학술 연구"
description: "공개 벤치마크를 바탕으로 GPT-6.2의 추상 추론, 소프트웨어 작업, 연구 역량과 비용을 분석한다."
category: 모델
tags: [benchmarks, reasoning, coding, research]
authorId: iris-wu
modelIds: [gpt-6-2-astra, gpt-6-2-sol, gpt-6-astra, gpt-6-1-sol]
benchmarkSlugs: []
relatedSlugs: [gpt-6-1-sol-review-pricing, mathematical-reasoning-robustness, llm-benchmark-rankings-contamination]
publishedAt: '2026-11-18'
updatedAt: '2026-11-18'
sources:
  - id: openai-launch
    label: OpenAI · GPT-6.2 Astra and Sol
    url: https://openai.com/index/introducing-gpt-6-2-astra-sol/
    checkedAt: '2026-11-18'
    claimScope: official
  - id: aa-release
    label: Artificial Analysis · GPT-6.2 launch evaluation
    url: https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: epoch-astra
    label: Epoch AI · GPT-6.2 Astra results
    url: https://epoch.ai/models/gpt-6-2-astra
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: arc-prize
    label: ARC Prize · Verified GPT-6.2 results
    url: https://arcprize.org/results/openai-gpt-6-2
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: cognition
    label: Cognition · FrontierCode 2.0
    url: https://cognition.com/frontiercode
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: terminal-bench
    label: Terminal-Bench · 4.0 leaderboard
    url: https://www.tbench.ai/?version=4
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: epoch-work
    label: Epoch AI · Open-ended work evaluation
    url: https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: epoch-erdos
    label: Epoch AI · FrontierMath Erdős
    url: https://epoch.ai/benchmarks/frontiermath-erdos
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: aa-science
    label: Artificial Analysis · Terminal-Bench-Science 0.1
    url: https://artificialanalysis.ai/evaluations/terminal-bench-science
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: aa-omniscience
    label: Artificial Analysis · AA-Omniscience v1.1
    url: https://artificialanalysis.ai/evaluations/omniscience
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: openai-specs
    label: OpenAI API · Model specifications and pricing
    url: https://developers.openai.com/api/docs/models/compare
    checkedAt: '2026-11-18'
    claimScope: official
  - id: system-card
    label: OpenAI · GPT-6.2 system card
    url: https://deploymentsafety.openai.com/gpt-6-2-astra-sol
    checkedAt: '2026-11-18'
    claimScope: official
---

GPT-6.2 Astra와 Claude Fable 5.2는 Epoch AI 종합 역량 지수에서 모두 **174점**을 받았다. 같은 기관이 실제 업무에서 뽑은 개방형 과제에서는 Astra가 평균 **65%**, Fable 5.2가 **82%**였다. 한편 GPT-6.2 Sol은 두 소프트웨어 평가에서 Astra에 근접했고, 터미널 평가 전체 비용은 약 5분의 1이었다. 난제를 푸는 능력, 검증 가능한 결과물을 만드는 능력, 어떤 증거를 찾을지 정하는 능력은 각각 따로 살펴야 한다. [Epoch 모델 결과](https://epoch.ai/models/gpt-6-2-astra) · [Epoch 실무 평가](https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work) · [Terminal-Bench 4.0](https://www.tbench.ai/?version=4)

OpenAI는 2026년 11월 17일 두 모델을 출시했다. 이 글은 11월 18일에 확인할 수 있었던 공개 결과를 분석한다. 측정치는 평가 기관에서, 사양과 가격 및 개발사 비교는 OpenAI에서 가져왔다. Folkbench는 평가를 다시 실행하지 않았다. [OpenAI 발표](https://openai.com/index/introducing-gpt-6-2-astra-sol/)

| 평가와 설정 | GPT-6.2 Astra | GPT-6.2 Sol |
| --- | ---: | ---: |
| Artificial Analysis Intelligence Index v5.0.1, max | 62 | 57 |
| ARC-AGI-2, max | 95.8% | 85.8% |
| ARC-AGI-3, 표준 환경, max | 70.3% | 54.9% |
| Terminal-Bench 4.0, Codex, max | 62.1% ± 2.3% | 61.5% ± 2.8% |
| Epoch Automation Reports, Codex | 65% | 미평가 |

[Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [ARC Prize](https://arcprize.org/results/openai-gpt-6-2) · [Terminal-Bench](https://www.tbench.ai/?version=4) · [Epoch Automation Reports](https://epoch.ai/benchmarks/epoch-automation-reports)

## 지능과 추상 추론, 상태 유지

Artificial Analysis에서 Astra는 이전 Astra보다 **5점** 높은 **62점**이며, Fable 5.2의 **65점** 뒤에 있다. Sol은 **57점**으로 이전 Astra와 같고, 지수에 포함된 작업당 가중 모델 비용은 이전 Astra의 약 **15%**였다. Epoch는 베이즈 문항반응이론으로 벤치마크의 난도와 변별력을 추정하는 별도의 척도를 쓴다. 특정 작업의 성능을 판단하려면 비슷한 유형의 과제와 실행 조건을 봐야 한다. [Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [Epoch 지수 산정법](https://epoch.ai/data/eci-documentation/methodology)

격자 예시에서 규칙을 추론하는 ARC-AGI-2에서 max의 Astra는 Sol을 **10.0%p** 앞선다. 행동의 피드백으로 학습하는 ARC-AGI-3 표준 환경에서는 차이가 **15.4%p**다. 공개 데모의 표준 환경은 모델이 고른 메모를 넘긴다. Provider Adapter는 외부에 드러나지 않는 추론 상태까지 보존하고 긴 대화를 압축한다. 이때 max의 Astra는 **99.8%**, Sol은 **98.2%**다. Astra의 xhigh는 어댑터에서 **100.0%**, 같은 수준의 표준 환경에서는 **56.5%**였다. 이전 시도와 배제한 가설을 어떻게 이어받는지가 성능과 두 모델 사이의 격차를 바꾼다. [ARC Prize 결과와 실행 환경](https://arcprize.org/results/openai-gpt-6-2)

## 소프트웨어 개발과 전문 업무

Terminal-Bench 4.0의 Codex max에서 점추정 차이는 **0.6%p**이고, 공개 구간은 크게 겹친다. 평가 전체 비용은 Astra 약 **1,400달러**, Sol 약 **300달러**다. FrontierCode 2.0은 유지관리자가 작성한 **132개 과제**에서 수정의 정확성, 테스트, 범위를 보고 병합 가능한지 평가한다. OpenAI는 max에서 점수 차이가 **0.5%p** 이내이며 Sol의 비용은 약 5분의 1이라고 보고한다. 별도의 Artificial Analysis Coding Agent Index에서 Astra는 이전 모델과 같고 Sol은 GPT-6.1 Sol보다 **3점** 낮다. 저장소 질의응답인 SWE-Atlas-QnA-AA에서는 중요 사실 누락이 늘며 **14점** 하락했다. 패치 구현과 기존 코드 설명은 따로 검증할 필요가 있다. [Terminal-Bench](https://www.tbench.ai/?version=4) · [Cognition](https://cognition.com/frontiercode) · [OpenAI](https://openai.com/index/introducing-gpt-6-2-astra-sol/) · [Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol)

OpenAI는 Agents’ Last Exam에서 Astra가 Fable 5.2보다 **5.5점** 높고, 비용은 Fable의 **5%**라고 발표했다. Fable이 대체 모델을 사용한 9개 과제는 비교에서 빠졌다. Epoch가 개방형 결과물을 직접 채점했을 때 순서는 **17%p** 차이로 뒤집혔다. 다만 Astra는 이전 Astra의 **56%**를 넘겼다. 표본이 작고 모델별로 과제당 한 번만 실행했으며 에이전트 환경도 달랐다. 보고서를 위임하려면 증거의 선별, 독자에 대한 판단, 초안 수정까지 평가하는지 살펴야 한다. [OpenAI](https://openai.com/index/introducing-gpt-6-2-astra-sol/) · [Epoch 방법과 한계](https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work)

## 학술 지식과 연구 설계

출시 시점 비교에서 Astra는 HLE-Diamond와 CritPt v2 물리 고난도 부분집합에서 모두 Fable 5.2 다음이다. AA-Omniscience의 max 환각률은 Astra **59%**, Sol **55%**다. 분자는 오답, 분모는 오답·부분 정답·미응답의 합이다. 완전한 정답에 도달하지 못했을 때 틀린 답을 내는 경향을 나타낸다. 문헌 인용의 정확성은 원문 확인으로 따로 검증해야 한다. [Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [AA-Omniscience 지표](https://artificialanalysis.ai/evaluations/omniscience)

Epoch의 표시 정밀도를 따르면 FrontierMath Tier 4 v2는 Astra **100%**, 이전 Astra **98%**다. FrontierMath Erdős는 각각 **10%**, **3%**다. 기준을 만들 때 68문제 모두 미해결이었고, 제출한 증명이나 반증을 Lean으로 검증한다. 형식 명제의 검증은 원래 질문을 충실히 옮겼는지와 학술적으로 새로운 성과인지에 대한 판단과 구분된다. [Epoch 결과](https://epoch.ai/models/gpt-6-2-astra) · [FrontierMath Erdős](https://epoch.ai/benchmarks/frontiermath-erdos)

검증 가능한 연구 작업 70개로 구성된 Terminal-Bench-Science 0.1에서 Astra는 xhigh **78.6%**, max **78.1%**였다. 반면 Epoch가 낯선 규칙의 체스 변형을 설계하도록 했을 때는 주로 기물의 표기만 바꿔 실질적으로 같은 규칙을 남겼다. 이 설계로는 익숙한 지식과 새로운 규칙으로의 일반화를 가르기 어렵다. Epoch는 첫 시도 이후 수정이 드문 점도 관찰했다. OpenAI 시스템 카드에서 Astra의 AI 자기 개선 역량은 High 기준에 도달했고 Sol은 그 아래다. 이 분류는 특정 AI 연구 환경에 대한 평가다. [Terminal-Bench-Science](https://artificialanalysis.ai/evaluations/terminal-bench-science) · [Epoch 연구 사례](https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work) · [OpenAI 시스템 카드](https://deploymentsafety.openai.com/gpt-6-2-astra-sol)

## 검수를 통과한 결과 한 건의 비용

두 API의 컨텍스트 창은 **1,050,000 토큰**이며 최대 입력은 **922,000**, 최대 출력은 **128,000**이다. 짧은 표준 요청에서 백만 토큰당 비캐시 입력, 캐시 읽기, 출력은 Astra **8 / 0.40 / 40달러**, Sol **2 / 0.10 / 10달러**다. 입력이 **272K**를 넘으면 전체 요청에서 입력 및 캐시 단가는 2배, 출력은 **1.5배**가 된다. 비캐시 입력 10만과 과금 출력 1만 토큰을 가정하면 도구나 캐시 쓰기를 빼고 Astra **1.20달러**, Sol **0.30달러**다. 시도 비용 비율이 1:4로 고정일 때 Sol을 먼저 쓰고 실패한 건을 한 번 Astra로 넘기면, 전환 비율이 **75%** 미만일 때 모델 비용을 줄일 수 있다. 최종 통과율, 지연, 검토 비용도 비교해야 한다. 검증 가능한 업무에는 Sol이 유력하고, 어려운 형식 추론과 낯선 규칙 발견에는 Astra의 근거가 더 강하다. 개방형 연구에서는 두 모델 모두 인용과 실험 설계를 점검해야 한다. [Astra API](https://developers.openai.com/api/docs/models/gpt-6.2-astra) · [Sol API](https://developers.openai.com/api/docs/models/gpt-6.2-sol)
