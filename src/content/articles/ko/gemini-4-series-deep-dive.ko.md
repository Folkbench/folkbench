---
slug: gemini-4-series-deep-dive
translationKey: gemini-4-series-deep-dive
locale: ko
kind: benchmark-review
title: "Gemini 4 시리즈 심층 평가: Argon, Carbon, Hydrogen, Neon의 지능 구조"
description: "Google 모델 카드와 Artificial Analysis, Epoch AI, ARC Prize, Terminal-Bench의 공개 결과를 대조해 Gemini 4 네 모델을 종합 지능, 추상 추론, 수학과 과학, 엔지니어링, 긴 컨텍스트, 안전성 측면에서 분석하고, 추론 예산과 평가 조건이 결론을 어떻게 바꾸는지 살펴본다."
category: 모델
tags: [benchmarks, reasoning, research, long-context]
authorId: iris-wu
modelIds: [gemini-4-neon, gemini-4-carbon, gemini-4-hydrogen, gemini-4-argon]
benchmarkSlugs: []
relatedSlugs: [gpt-6-2-astra-sol-deep-dive, mathematical-reasoning-robustness, long-context-effective-understanding]
publishedAt: '2026-11-19'
updatedAt: '2026-11-19'
sources:
  - id: google-neon
    label: Google · Introducing Gemini 4 Neon
    url: https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: google-carbon
    label: Google · Gemini 4 Carbon announcement
    url: https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: google-argon
    label: Google · Gemini 4 Argon announcement
    url: https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: google-hydrogen
    label: Google · Introducing Gemini 4 Hydrogen
    url: https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: card-neon
    label: Google DeepMind · Gemini 4 Neon model card
    url: https://deepmind.google/models/model-cards/gemini-4-neon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: card-carbon
    label: Google DeepMind · Gemini 4 Carbon model card
    url: https://deepmind.google/models/model-cards/gemini-4-carbon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: card-argon
    label: Google DeepMind · Gemini 4 Argon model card
    url: https://deepmind.google/models/model-cards/gemini-4-argon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: aa-neon
    label: Artificial Analysis · Gemini 4 Neon launch evaluation
    url: https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain
    checkedAt: '2026-11-19'
    claimScope: observed
  - id: epoch-carbon
    label: Epoch AI · Gemini 4 Carbon results
    url: https://epoch.ai/models/gemini-4-carbon
    checkedAt: '2026-11-19'
    claimScope: observed
  - id: arc-carbon
    label: ARC Prize · Verified Gemini 4 Carbon results
    url: https://arcprize.org/results/google-gemini-4-carbon
    checkedAt: '2026-11-19'
    claimScope: observed
  - id: arc-argon
    label: ARC Prize · Verified Gemini 4 Argon results
    url: https://arcprize.org/results/google-gemini-4-argon
    checkedAt: '2026-11-19'
    claimScope: observed
  - id: terminal-bench
    label: Terminal-Bench · 4.1 leaderboard
    url: https://www.tbench.ai/?version=4
    checkedAt: '2026-11-19'
    claimScope: observed
---

Artificial Analysis Intelligence Index v5.0.1에서 지수 전체를 실행하는 데 쓰인 출력 토큰을 1억 1,000만~1억 2,400만 개로 맞추면, Gemini 4 Argon(high)은 **50**, Hydrogen(high)은 **51**, Carbon(medium)은 **58**, Neon(high)은 **60**이다. 네 모델의 지식 컷오프는 모두 2026년 3월이다. Google 모델 카드에 따르면 Carbon은 Argon을 기반으로 하고, Hydrogen과 Neon은 Carbon을 개조한 모델이다. ARC‑AGI‑3 표준 하네스에서는 같은 low 설정 기준으로 Carbon이 Argon보다 **15.3%p** 높고, Epoch AI가 기록한 FrontierMath Tier 4 격차는 **17%p**다. 7주 동안 네 번의 출시, 동일한 지식 컷오프. Gemini 4 시리즈는 사후 학습과 추론 예산에 관한 공개 실험에 가깝다. 동시에 같은 예산으로 비교할 때와 같은 설정 이름으로 비교할 때 서로 다른 두 개의 순위표가 나온다는 점도 보여 준다. [Artificial Analysis Neon 출시 평가](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain) · [ARC Prize Carbon 검증 결과](https://arcprize.org/results/google-gemini-4-carbon) · [Epoch Carbon 모델 데이터](https://epoch.ai/models/gemini-4-carbon)

Google은 9월 30일 Argon을, 10월 28일 Carbon을 발표했고 Carbon은 11월 10일 전면 공개됐다. 이어 11월 12일 Hydrogen, 18일 Neon을 출시했다. 이 글은 11월 19일 기준으로 확인 가능한 공개 결과를 근거로 한 Folkbench의 2차 분석이다. 모델 카드와 발표 글의 점수는 Google이 보고한 것이며, 비교 모델 점수 중 일부는 Google이 직접 실행했고 일부는 제3자 실행으로 표시돼 있다. Artificial Analysis, Epoch AI, ARC Prize, Terminal-Bench의 결과는 각 평가 기관에 속한다. Folkbench는 이번에 모델을 다시 실행하지 않았다. 백분율은 각 순위표의 정의를 따르며, 추론 설정, 하네스, 평가 실행 주체에 따라 달라지는 결론은 해당 조건 안에서만 성립한다. [Google Argon 발표](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/) · [Google Carbon 전면 공개](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/) · [Google Neon 발표](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/)

## 하나의 기반, 네 번의 사후 학습

| 모델 | 발표일 | 공식 포지셔닝 | 모델 카드에 적힌 출처 | API 가격(입력 / 출력, 100만 토큰당) | AA 지수 v5.0.1 최고 설정 |
| --- | --- | --- | --- | --- | ---: |
| Gemini 4 Argon | 9월 30일 | 코딩, 기업 지식 업무, 사이버 방어 | 새로 학습한 희소 MoE 모델 | 도입가 2 / 10달러, 이후 4 / 20달러 | 50(high) |
| Gemini 4 Carbon | 10월 28일, 11월 10일 전면 공개 | 장기 과제와 사이버 보안 | Argon 기반 | 11월 30일까지 2 / 10달러, 이후 4 / 20달러 | 60(high) |
| Gemini 4 Hydrogen | 11월 12일 | 빠른 일상 작업 | Carbon을 개조 | 1.50 / 7.50달러 | 54(xhigh) |
| Gemini 4 Neon | 11월 18일 | 깊이와 효율의 균형 | Carbon을 개조 | 3 / 15달러 | 61(xhigh) |

[Argon 모델 카드](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Carbon 모델 카드](https://deepmind.google/models/model-cards/gemini-4-carbon/) · [Hydrogen 모델 카드](https://deepmind.google/models/model-cards/gemini-4-hydrogen/) · [Neon 모델 카드](https://deepmind.google/models/model-cards/gemini-4-neon/)

이 세대의 유일한 아키텍처 설명은 Argon 모델 카드에 있다. 대규모 희소 전문가 혼합(MoE) Transformer로, 텍스트·시각·오디오 입력을 기본 지원하며, 기존 모델을 미세 조정한 것이 아니라 새로 학습한 모델이다. TPU에서 JAX와 ML Pathways로 학습했고, 사후 학습에는 지시 튜닝, 인간 선호 데이터, 그리고 다단계 추론·문제 해결·정리 증명 데이터를 포함한 강화 학습이 쓰였다. Carbon 모델 카드는 아키텍처, 학습 데이터, 하드웨어 세부 사항을 모두 Argon에 미루고, Hydrogen과 Neon 모델 카드는 Carbon에서 개조(adapted from)했다고 밝히며 세부 사항을 다시 Carbon에 미룬다. 네 모델 모두 입력과 출력을 합쳐 최대 100만 토큰의 컨텍스트를 지원한다. [Argon 모델 카드](https://deepmind.google/models/model-cards/gemini-4-argon/)

이 구조가 시리즈 내 발전을 읽는 방식을 정한다. 지식 컷오프가 바뀌지 않았으므로 Argon에서 Carbon으로의 향상을 새로운 세계 지식 덕분이라고 볼 수 없고, 사후 학습 데이터, 강화 학습, 추론 설정의 변화에서 왔을 가능성이 더 크다. Google은 파라미터 수를 공개하지 않았고, '개조'가 증류인지 추가 학습인지 다른 방법인지도 설명하지 않았다. 따라서 Hydrogen과 Neon의 규모와 학습 경로는 공개 자료로 추정할 수 없다. 분명한 것은 이 세대 안의 능력 차이 대부분이 사전 학습 이후에 생겼다는 점이다.

## 지능: 같은 설정 이름이 같은 추론 예산은 아니다

Carbon은 10월 28일 발표 당시 v5.0 지수 **59**로 1위였다. 3주 뒤 v5.0.1 재채점에서 **60**이 됐지만, 1위는 Claude Fable 5.2의 **65**로 바뀌었고 GPT‑6.2 Astra **62**, Neon **61**이 뒤따른다. Claude Opus 5.5는 **59**, GPT‑6.2 Sol은 **57**이다. Epoch AI의 ECI도 비슷한 위치를 보여 준다. Carbon은 **170**으로 추적 중인 241개 모델 가운데 3위이고, Argon은 **167**, Fable 5.2는 **174**, GPT‑6 Astra는 **169**다. 두 지수는 방법이 다르지만 모두 Carbon을 최상위 그룹에, 현재 선두보다 약간 아래에 둔다. 11월 19일 기준 Epoch는 Neon 기록을 공개하지 않았고, Hydrogen은 개별 결과는 있으나 ECI는 아직 없다. 종합 지수 순위는 주 단위로 바뀌므로 한 번의 '1위'가 갖는 설득력은 제한적이다. [Google Carbon 발표](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/) · [Artificial Analysis GPT‑6.2 출시 평가](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [Neon 모델 카드](https://deepmind.google/models/model-cards/gemini-4-neon/) · [Epoch Carbon 모델 데이터](https://epoch.ai/models/gemini-4-carbon)

더 많은 정보를 주는 것은 추론 설정별 곡선이다. 괄호 안은 지수 전체를 실행하는 데 쓴 출력 토큰 수다.

| AA 지수 v5.0.1 | Neon | Hydrogen | Carbon | Argon |
| --- | ---: | ---: | ---: | ---: |
| low | 44(2,830만) | 27(2,030만) | 54(8,390만) | 미게재 |
| medium | 55(6,290만) | 41(5,440만) | 58(1억 2,400만) | 48(8,170만) |
| high(기본값) | 60(1억 2,300만) | 51(1억 1,000만) | 60(2억 500만) | 50(1억 1,300만) |
| xhigh | 61(2억 8,300만) | 54(3억 400만) | 설정 없음 | 설정 없음 |

[Neon 설정별 데이터](https://artificialanalysis.ai/models/gemini-4-neon) · [Hydrogen 설정별 데이터](https://artificialanalysis.ai/models/releases/gemini-4-hydrogen) · [Carbon 설정별 데이터](https://artificialanalysis.ai/models/gemini-4-carbon) · [Argon 설정별 데이터](https://artificialanalysis.ai/models/gemini-4-argon)

첫째, 수확 체감이 빠르다. Neon을 high에서 xhigh로 올리면 출력 토큰이 **2.3배**가 되지만 지수는 **1점**만 오르고, 과제당 소요 시간은 14.8분에서 21.5분으로 늘어난다. Hydrogen은 같은 단계에서 **2.8배**의 토큰을 써 **3점**을 얻는다. 둘째, 설정 이름은 예산 단위가 아니다. Carbon의 low 설정은 8,390만 토큰을 써서 Neon의 medium보다 많다. 비슷한 총예산으로 맞추면 Argon 50, Hydrogen 51, Carbon 58, Neon 60 순이며, 모두를 기본 설정으로 비교하는 것보다 사후 학습의 효과를 더 잘 보여 준다. 다만 이 비교에도 한계가 있다. 토큰 수는 지수 전체의 합계이지 문항별로 맞춘 값이 아니다. 출력 속도도 달라서 Neon high는 초당 약 101토큰, Carbon은 초당 55~58토큰이므로 같은 토큰 수라도 대기 시간은 다르다.

셋째, 작은 모델일수록 예산에 민감하다. low에서 high까지 Hydrogen은 **24점**, Neon은 **16점**, Carbon은 **6점** 차이가 난다. Hydrogen 같은 빠른 모델에서는 설정을 잘못 고른 손해가 모델을 바꾸는 것보다 클 수 있다.

## 추상 추론: ARC‑AGI‑3에서는 오래 생각할수록 좋은 것이 아니다

| ARC Prize 검증 결과 | Gemini 4 Argon | Gemini 4 Carbon |
| --- | ---: | ---: |
| ARC‑AGI‑2, low / medium / high | 42.1% / 87.1% / 91.3% | 49.6% / 94.2% / 92.1% |
| ARC‑AGI‑3 표준 하네스, low / medium | 49.8% / 46.3% | 65.1% / 63.9% |
| ARC‑AGI‑3 표준 하네스, high | 집계 제외(55게임 중 19게임 완료) | 집계 제외(55게임 중 30게임 완료) |
| ARC‑AGI‑3 Provider Adapter, low / medium / high | 97.5% / 97.3% / 97.3% | 97.7% / 99.1% / 96.9% |

[ARC Prize Argon 검증 결과](https://arcprize.org/results/google-gemini-4-argon) · [ARC Prize Carbon 검증 결과](https://arcprize.org/results/google-gemini-4-carbon)

눈여겨볼 점이 세 가지 있다. 첫째, 추론 설정과 점수는 단조롭게 움직이지 않는다. Carbon은 ARC‑AGI‑2에서 medium이 high보다 높고, ARC‑AGI‑3 표준 하네스에서는 low가 medium보다 높다. Argon도 ARC‑AGI‑3에서는 low가 가장 높다. 둘째, 최고 설정은 상호작용 환경에서 아예 실패할 수 있다. Carbon의 high 설정은 행동 사이 간격이 너무 길어 게임 세션이 만료됐고 30게임만 완료했다. Argon의 high는 API 문제로 19게임만 완료했다. 정적인 질의응답에서는 오래 생각해도 비용만 늘지만, 상호작용 환경에서는 환경 시간까지 소모한다. 셋째, 하네스 차이가 세대 차이보다 훨씬 크다. Carbon은 Provider Adapter에서 **99.1%**에 이르지만 표준 하네스에서는 최고 **65.1%**로, 차이가 약 **34%p**다. ARC Prize 설명에 따르면 표준 하네스는 모델이 스스로 남기기로 한 메모만 이어 갈 수 있게 하고, Provider Adapter는 요청 사이에 불투명한 추론 상태를 보존하며 긴 대화에서는 컨텍스트를 압축한다.

환경별로 보면 감점은 소수의 게임에 몰려 있다. 표준 하네스에서 G50T는 Argon과 Carbon의 low·medium 모두 **0.0%**, BP35는 모두 **1.0%** 이하, TU93은 모두 **5.3%** 이하다. 같은 세 게임은 Provider Adapter에서 대부분 100%다. 전체 점수는 15%p 올랐지만 이 게임들은 거의 움직이지 않았다. 타당하지만 검증되지 않은 해석은, 이 게임들이 단일 단계 추론이 아니라 단계 간 상태 유지에서 막혀 있으며, 세대 간 향상은 원래 부분적으로 풀리던 환경에서 주로 일어났다는 것이다. 참고로 표준 하네스 max 설정에서 GPT‑6.2 Astra는 **70.3%**, GPT‑6.2 Sol은 **54.9%**이며 Carbon은 그 사이에 있다. [ARC Prize GPT‑6.2 검증 결과](https://arcprize.org/results/openai-gpt-6-2)

## 학술 능력: 지식 보정, 수학, 과학적 실행

| Epoch AI 기록 | Gemini 4 Argon | Gemini 4 Carbon | Gemini 4 Hydrogen | GPT‑6 Astra | Claude Fable 5.2 |
| --- | ---: | ---: | ---: | ---: | ---: |
| GPQA Diamond | 96% | 97% | 97% | 96% | 96% |
| SimpleQA Verified | 76% | 78% | 71% | 76% | 94% |
| FrontierMath Tiers 1–3(v2) | 86% | 91% | 88% | 94% | 95% |
| FrontierMath Tier 4(v2) | 78% | 95% | 88% | 98% | 100% |
| FrontierMath Erdős | 1% | 3% | 미측정 | 3% | 미측정 |
| Chess Puzzles | 59% | 78% | 60% | 76% | 79% |
| EBR‑bench(Earthborne Rangers) | 65% | 88% | 70% | 76% | 90% |

[Epoch Carbon 모델 데이터](https://epoch.ai/models/gemini-4-carbon) · [Epoch Hydrogen 모델 데이터](https://epoch.ai/models/gemini-4-hydrogen)

**지식과 보정.** GPQA Diamond는 더 이상 최전선 모델을 가려내지 못한다. 표의 다섯 모델 모두 96~97% 사이에 있다. 차이를 더 잘 드러내는 것은 사실 회상, 그리고 모를 때 어떻게 행동하느냐다. Epoch의 SimpleQA Verified에서 Carbon은 **78%**로 Fable 5.2보다 **16%p** 낮다. 반면 Artificial Analysis의 AA‑Omniscience v1.1에서는 Carbon(medium)과 Argon(high)의 환각률이 모두 **4%**이고, Carbon이 순위표에서 가장 낮다. 이 지표의 분모는 완전히 맞지 않은 모든 응답, 분자는 그중 명백히 틀린 응답이다. 비교하면 GPT‑6.2 Astra와 Sol의 max 설정은 각각 **59%**와 **55%**다. 두 결과는 서로 다른 문항 세트에서 나왔으므로 합칠 수 없지만 방향은 같다. Gemini 4는 가장 많이 기억하지는 않을 수 있어도, 모를 때는 답을 보류하거나 부분 답만 내는 경향이 강하고 지어내는 경우가 적다. 적어도 이런 지식 문항에서는 확정적으로 답한 내용의 오류 비율이 낮다. 문헌 검토에 쓸 때는 포괄성을 검색으로 보완해야 한다. [AA‑Omniscience 지표 정의와 순위표](https://artificialanalysis.ai/evaluations/omniscience)

HLE‑Diamond는 Carbon이 v5.0의 9개 평가 중 1위를 차지한 4개 항목 가운데 하나다. Google은 Neon **71.3%**, Opus 5.5 **67.9%**, GPT‑6.2 Sol **64.0%**, Hydrogen **58.8%**를 보고했으며, 이 수치는 모두 Google 모델 카드에서 나왔다. [DeepLearning.AI의 v5.0 결과 정리](https://www.deeplearning.ai/the-batch/gemini-leads-the-pack-again) · [Neon 모델 카드](https://deepmind.google/models/model-cards/gemini-4-neon/)

**수학.** Argon에서 Carbon으로 FrontierMath Tier 4는 **17%p** 올랐다. 이 데이터에서 가장 큰 세대 간 도약으로, GPT‑6 Astra와 Fable 5.2에 근접했다. 그러나 FrontierMath Erdős는 **1%**에서 **3%**로 오르는 데 그쳤다. 이 68문항은 벤치마크 제작 당시 미해결 문제였고, 제출된 증명이나 반증은 Lean으로 검사한다. 현재 최고는 GPT‑6.2 Astra의 **10%**다. 정답이 알려진 연구 수준 문제는 포화되고 있지만, 미해결 문제는 거의 손대지 못한 상태다. Google이 자체 보고한 RiemannBench는 Argon **76.0%**, Carbon **80.0%**에서 Neon **84.0%**로 올라 방향은 같지만 공급사 자체 측정이다. Epoch의 퍼즐 계열 평가도 비슷한 사후 학습 효과를 보여 준다. 체스 퍼즐은 59%에서 78%로, EBR‑bench는 65%에서 88%로 올랐다. 둘 다 규칙 제약 아래 다단계 탐색이 필요한 과제로, ARC‑AGI‑3 표준 하네스의 향상과 방향이 같다. 빠른 모델인 Hydrogen은 Tier 4에서 **88%**로 Argon보다 **10%p** 높지만, 퍼즐 계열 성적은 Argon과 비슷하고 SimpleQA Verified 회상은 **71%**에 그친다. 수학처럼 답을 자동으로 검증할 수 있는 능력은 빠른 모델로 개조할 때 더 온전히 유지되고, 암기형 지식은 모델 용량에 더 의존한다는 설명이 가능하지만, 공개 자료만으로는 확인할 수 없다. [FrontierMath Erdős 방법론](https://epoch.ai/benchmarks/frontiermath-erdos)

**과학적 실행.** Terminal‑Bench‑Science 0.1은 테스트로 검사할 수 있는 연구 산출물을 터미널에서 제출하도록 요구한다. Carbon 모델 카드에 실린 Artificial Analysis 실행 결과는 Carbon **64.8%**, Argon **52.9%**, GPT‑6 Astra **63.3%**, Opus 5.5 **59.0%**다. Neon 모델 카드는 Neon을 **70.5%**로 보고해 GPT‑6.2 Sol의 **68.0%**, Opus 5.5의 **63.3%**보다 높다. Google은 Neon을 동급 최고라고 하는데, 이는 Google이 고른 비교군 안에서는 맞다. 하지만 Artificial Analysis 전체 순위표에서는 GPT‑6.2 Astra xhigh가 **78.6%**로 여전히 **8.1%p** 높다. Hydrogen은 **51.4%**로 비교 대상인 Claude Sonnet 5.5(**59.9%**)보다 낮다. [Terminal‑Bench‑Science 순위표](https://artificialanalysis.ai/evaluations/terminal-bench-science) · [Carbon 모델 카드](https://deepmind.google/models/model-cards/gemini-4-carbon/)

## 엔지니어링과 에이전트: 답의 절반은 하네스가 정한다

Terminal‑Bench 4.1 공식 순위표에서 Carbon(high, Antigravity CLI)은 **64.5% ± 3.2%**이고 전체 실행 비용은 약 **1,400달러**다. Claude Opus 5.5와 Fable 5.2가 **65.8%**로 공동 1위, GPT‑6.2 Astra는 **62.1%**다. Carbon과 1위의 차이는 신뢰 구간 안에 있다. 더 흥미로운 것은 시리즈 내부 비교다. Hydrogen은 **56.4% ± 3.0%**에 약 **800달러**, Argon은 **55.5% ± 2.8%**에 약 **1,100달러**로, 빠른 모델이 약 4분의 3의 비용으로 6주 전 플래그십을 따라잡았다. Neon의 **65.2%**는 Google 모델 카드 수치이며, 11월 19일 기준 공식 순위표에는 아직 없다. [Terminal‑Bench 4.1 순위표](https://www.tbench.ai/?version=4)

모델 카드끼리 비교할 때는 먼저 누가 실행했는지 확인해야 한다. Argon 모델 카드의 Terminal‑bench 4.0은 Argon **57.4%**, Opus 5.5 **66.4%**다. 2주 뒤 Carbon 모델 카드는 Artificial Analysis가 실행한 Terminal‑Bench 4.0으로 바꾸어 Argon **57.1%**, Opus 5.5 **59.6%**로 적었다. 같은 이름의 벤치마크에서 같은 비교 모델이 **6.8%p** 차이 나는데 Argon 자신은 거의 변하지 않았다. Argon 카드의 Opus 66.4%를 그대로 쓰면 Carbon의 65.2%는 앞서지 않으며, 공식 4.1 순위표에서도 Carbon은 Opus보다 약간 낮다. Terminal‑Bench‑Science도 마찬가지다. GPT‑6 Astra는 Argon 카드에서 **68.1%**, Carbon 카드의 AA 실행 기준으로는 **63.3%**다. [Argon 모델 카드](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Carbon 모델 카드](https://deepmind.google/models/model-cards/gemini-4-carbon/)

| SWE‑sweep(Neon 모델 카드) | mini‑SWE 중립 하네스 | 각 사 자체 하네스 |
| --- | ---: | ---: |
| Gemini 4 Neon | 12.8% | 39.0% |
| Claude Opus 5.5 | 3.6% | 10.1% |
| GPT‑6.2 Sol | 11.6% | 8.3% |

중립적인 mini‑SWE 하네스에서 Neon은 GPT‑6.2 Sol보다 **1.2%p** 높을 뿐이다. 각 사 자체 하네스로 바꾸면 차이는 **30.7%p**로 벌어진다. Neon은 Antigravity에서 mini‑SWE의 약 3배, Opus 5.5는 자사 환경에서 약 2.8배가 되고, Sol은 오히려 떨어진다. 공급사 하네스는 제품의 일부이므로, 이 수치는 모델 단독이 아니라 '모델과 도구 체인'의 조합을 측정한다. Carbon 모델 카드의 SWE‑sweep은 열이 하나뿐이고 하네스 표기도 없다(Carbon **9.6%**, Argon **4.3%**). 그중 Opus 5.5의 3.6%가 Neon 카드의 mini‑SWE 값과 같아 같은 조건으로 추정된다. 추정이 맞다면 시리즈의 mini‑SWE 경로는 4.3%, 9.6%, 12.8%다. [Neon 모델 카드](https://deepmind.google/models/model-cards/gemini-4-neon/)

다른 코딩 평가는 더 절제된 그림을 보여 준다. FrontierSWE 2에서 Carbon은 **61.2%**로 GPT‑6 Astra **65.5%**, Opus 5.5 **62.3%**보다 낮다. FrontierCode 2.0에서 Neon은 **46.2%**로 Opus 5.5의 **47.3%**에 약간 못 미친다. Artificial Analysis의 Coding Agent Index에서는 Neon(xhigh, Antigravity CLI)이 **59**로 1위, Fable 5.2(xhigh)와 Opus 5.5(max)는 모두 **58**이며, 과제당 평균 비용은 각각 **6.86**, **15.47**, **12.61달러**다. Neon의 강점은 주로 비용에 있다. 컴퓨터 조작은 시리즈 전반에 걸친 약점이다. OSWorld‑2.1 오프라인 부분집합에서 Carbon **81.5%**는 Opus 5.5 **87.2%**보다, Hydrogen **77.6%**는 Claude Sonnet 5.5 **83.9%**보다 낮다. [Artificial Analysis Neon 출시 평가](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain) · [Hydrogen 모델 카드](https://deepmind.google/models/model-cards/gemini-4-hydrogen/)

지식 업무에서는 Zapier의 AutomationBench가 Argon **51.3%**, Carbon **53.9%**에서 Neon **56.3%**로 올랐고, Vending‑Bench 2의 모의 경영 잔액은 **13,718달러**에서 **16,843달러**로 늘었다. Argon은 Harvey 법률 에이전트 벤치마크에서 **19.6%**를 기록했고 비교 모델은 모두 **6.7%** 이하였다. 격차는 크지만 절댓값을 보면 이런 법률 과제는 아직 실무 수준과 거리가 멀다. 이름에도 주의해야 한다. Hydrogen 카드의 AutomationBench‑AA(**76.1%**)는 Artificial Analysis 버전으로, Zapier 버전과 직접 비교할 수 없다.

## 긴 컨텍스트와 멀티모달: 합성 과제에서는 앞서지만 실제 자료는 따로 검증해야

Google이 보고한 GraphWalks(256K~100만 토큰, 너비 우선 탐색, F1)는 시리즈가 가장 크게 앞서는 항목이다. Argon **84.2%**, Carbon **96.2%**, Neon **95.2%**에 비해 Opus 5.5는 **66.8%**, GPT‑6 Astra는 **71.8%**, GPT‑6.2 Sol은 **80.1%**다. 128K 이내에서는 Argon이 이미 **99.7%**에 이른다. GraphWalks는 긴 입력 곳곳에 그래프의 간선을 흩어 놓고 따라가게 하여, 먼 거리의 정보를 찾아 잇는 능력을 측정한다. 이 우위는 초장문 입력에서의 검색과 연결 능력이 뛰어나다는 뜻이지만, 합성 그래프 과제에는 의미 충돌, 문서 버전, 숨은 전제가 없다. 계약서 검토나 여러 문헌의 종합에 쓰려면 자신의 자료로 검증해야 한다. 이 결과는 Google 자체 측정이며 아직 제3자 재현이 없다. Neon과 Hydrogen은 기본 동기 출력이 최대 6만 4,000토큰이고, 백그라운드 장시간 디코딩으로 최대 100만 토큰까지 출력할 수 있다. [Argon 모델 카드](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Neon 모델 카드](https://deepmind.google/models/model-cards/gemini-4-neon/)

멀티모달에서는 한 군데 후퇴가 있다. 장편 영상 이해 LVBench에서 Argon은 **91.7%**, Carbon을 개조한 Neon은 **89.0%**다. Opus 5.5 **83.7%**, GPT‑6.2 Sol **87.6%**보다는 여전히 높지만 자사 이전 세대보다 **2.7%p** 낮다. 차트 이해 Chartography에서는 Neon **73.5%**가 Sol **75.1%**보다 낮다. Artificial Analysis의 GDP.pdf 시각 추론 평가에서도 추론 설정과의 관계가 단조롭지 않다. Neon은 high에서 **33.4%**인데 xhigh에서는 오히려 **28.0%**로 떨어지고, Carbon high는 **28.4%**다. [Artificial Analysis Neon 출시 평가](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain)

## 안전성과 정렬: 사이버 능력이 강할수록 공개는 단계적으로

사이버 보안은 Google이 가장 강조하는 능력이자 단계적 공개의 이유다. 취약점 발견 SEC‑bench Pro는 Argon **83.4%**, Carbon **88.2%**에서 Neon **90.5%**로 올랐고, 익스플로잇 ExploitGym에서는 Carbon **54.8%**, Argon **42.0%**다. Argon과 Carbon은 모두 Fairwind 프로그램을 통해 신뢰할 수 있는 사이버 방어자에게 먼저 제공됐으며, Google은 이들 방어자와 내부 팀에 사이버 보안 가드레일을 제거한 버전도 제공한다. [Google Argon 발표](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/) · [Google Carbon 발표](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/)

Argon 모델 카드는 2026년 4월판 프런티어 안전 프레임워크에 따른 판정을 제시한다. 생물학과 사이버 보안의 Level 1 핵심 능력 수준(CCL)은 배제할 수 없어 Google이 안전성 논증을 마련했고, 보호 조치 아래에서는 CCL 미만으로 평가했다. 화학·방사능·핵 분야는 추적 임계값에 이르지 않았고, 머신러닝 연구 개발의 가속과 자동화는 모두 CCL에 이르지 않았다. Hydrogen은 표적 시험 결과 CBRN과 사이버 모두 CCL에는 이르지 않았지만 경보 임계값에는 도달했다. Neon 모델 카드는 Argon 대비 범용 능력 증가가 '중대한 능력 변화' 임계값보다 낮아 핵심 능력 평가를 전부 다시 하지 않고 Argon의 판정을 이어받았다고 밝힌다. 주목할 점은 Artificial Analysis 지수에서 Neon이 Argon보다 **11점** 높다는 것이다. Google이 이 임계값을 어떻게 정하는지는 공개 자료로 외부에서 확인할 수 없다. [Argon 모델 카드](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Hydrogen 모델 카드](https://deepmind.google/models/model-cards/gemini-4-hydrogen/) · [Neon 모델 카드](https://deepmind.google/models/model-cards/gemini-4-neon/)

행동 측면에서 Carbon과 Neon은 Terminal‑Bench 4.0의 부정행위 성공률이 모두 **0.0%**이고, Gray Swan 간접 프롬프트 주입 시험의 공격 성공률도 **0.0%**다(Neon은 최고 추론 설정). Argon은 **0.7%**다. Google의 에이전트 정직성 평가에서 Carbon은 과제의 **92%**, Argon은 **70%**를 통과했다. Neon과 Hydrogen은 각각 **99.2%**와 **94%**를 보고했지만, 같은 문항 세트인지는 발표 글에 나와 있지 않다. Hydrogen 모델 카드는 대가도 공개한다. Gemini 3.8 Flash와 비교해 정당한 이유 없는 거부가 **5.57%p** 늘었고, 특히 멀티모달 프롬프트에서 두드러진다. [Google Carbon 전면 공개](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/) · [Google Neon 발표](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/) · [Google Hydrogen 발표](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/)

## 비용과 선택: 검수를 통과한 과제 기준으로 값을 매기기

Hydrogen은 100만 토큰당 입력 **1.50달러**, 출력 **7.50달러**이며 100만 토큰 컨텍스트 전체에 같은 요금이 적용된다. Neon은 **3 / 15달러**, 캐시 입력은 **0.15달러**다. Carbon의 도입가 **2 / 10달러**는 11월 30일까지이며, 이후 **4 / 20달러**가 된다. Argon, Carbon, Neon의 캐시 입력은 모두 입력 가격의 5%다. Artificial Analysis의 과제당 비용으로 보면 Hydrogen xhigh는 **3.16달러**에 54점, Argon high는 **4.97달러**(도입가 기준)에 50점, Neon xhigh는 **6.44달러**에 61점, Carbon high는 **7.76달러**(표준가 기준)에 60점이다. Neon의 high는 Carbon high와 같은 60점이면서 과제당 비용은 절반이 안 된다. [Google Hydrogen 발표](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/) · [Artificial Analysis Neon 출시 평가](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain)

직접 검산할 수 있는 예를 들어 보자. 캐시되지 않은 입력 10만 토큰과 출력 1만 토큰으로 된 요청 1건은 도구 요금을 빼면 Hydrogen **0.225달러**, Neon **0.45달러**, Carbon은 도입가 기간 **0.30달러**, 표준가 복귀 후 **0.60달러**다. 먼저 Hydrogen으로 처리하고 실패하면 Neon으로 넘기는 라우팅을 생각해 보자. 건당 비용 비율을 1:2로 고정하면, 상향 전환 비율이 **50%** 미만인 한 순수 모델 비용은 Neon을 바로 쓰는 것보다 낮다. Artificial Analysis의 xhigh 과제당 비용(3.16달러 대 6.44달러)을 쓰면 손익분기점은 약 **51%**다. 실제 비교에는 재시도, 지연 시간, 최종 통과율도 포함해야 한다. 이 계산 예는 비용 구조를 설명하기 위한 것이며 Folkbench의 실측치가 아니다.

자동으로 검수할 수 있는 일괄 작업이라면 Hydrogen을 가장 먼저 검증할 만하다. AA 지수와 Terminal‑Bench 모두에서 Argon과 같거나 높고 가격도 더 싸다. 일상적인 코딩과 지식 업무에서는 Neon이 두 모델 카드에 공통으로 있는 평가 대부분에서 Carbon과 같거나 약간 높고(Agents' Last Exam과 GraphWalks는 약간 낮다), 11월 30일 이후에는 단가도 Carbon보다 낮다. 장기 엔지니어링, 사이버 보안, ARC‑AGI‑3 같은 상호작용 과제에서는 Carbon이 여전히 근거가 가장 탄탄한 모델이다. 무엇을 고르든 추론 설정은 자신의 과제로 실측해야 한다. ARC‑AGI와 GDP.pdf에서 최고 설정이 늘 최선은 아니었다.

Gemini 4가 출시 시점에 갖는 가치는 어느 한 항목의 1위가 아니다. 7주 동안 같은 지식 컷오프 위에서, 사후 학습과 추론 설정이 능력을 어디까지 끌어올릴 수 있는지 보여 줬다. AA 지수 11점, ARC‑AGI‑3 표준 하네스 15%p, FrontierMath Tier 4 17%p의 향상이다. 동시에 이 방식으로 아직 움직이지 못한 영역도 드러냈다. 미해결 수학 문제는 여전히 한 자릿수이고, 컴퓨터 조작은 Claude에 뒤처지며, 표준 하네스의 몇몇 ARC‑AGI‑3 게임은 여전히 0점이다. 공급사 모델 카드는 비교군과 실행 주체를 고르고, 독립 순위표는 재채점과 버전 교체를 거듭한다. 이 점수가 실제 성과로 이어질지는 결국 여러분의 과제를 어떻게 검수하느냐에 달려 있다.
