---
slug: mathematical-reasoning-robustness
translationKey: mathematical-reasoning-robustness
locale: "ko"
kind: article
title: "숫자가 바뀌어도 추론할까? 수학적 견고성 평가"
description: "GSM-Symbolic의 근거와 한계를 읽고 통제된 변형, 대응 통계, 계산기 조건으로 수학 능력을 검토합니다."
category: "평가 방법"
tags: [수학, 추론, 벤치마크]
authorId: iris-wu
modelIds: []
benchmarkSlugs: []
relatedSlugs: [llm-benchmark-rankings-contamination, long-context-effective-understanding]
publishedAt: '2026-11-14'
updatedAt: '2026-11-14'
sources:
  - id: gsm-symbolic
    label: Mirzadeh 외, GSM-Symbolic，2025년 개정판
    url: https://arxiv.org/abs/2410.05229v2
    checkedAt: '2026-11-14'
    claimScope: official
  - id: irrelevant-context
    label: Shi 외, Large Language Models Can Be Easily Distracted by Irrelevant Context，2023
    url: https://proceedings.mlr.press/v202/shi23a.html
    checkedAt: '2026-11-14'
    claimScope: official
  - id: causal-robustness
    label: Stolfo 외, A Causal Framework to Quantify the Robustness of Mathematical Reasoning with Language Models，2023
    url: https://aclanthology.org/2023.acl-long.32/
    checkedAt: '2026-11-14'
    claimScope: official
  - id: frontiermath
    label: Glazer 외, FrontierMath，2025년 개정판
    url: https://arxiv.org/abs/2411.04872v7
    checkedAt: '2026-11-14'
    claimScope: official
  - id: error-bars
    label: Miller, Adding Error Bars to Evals，2024
    url: https://arxiv.org/abs/2411.00640v1
    checkedAt: '2026-11-14'
    claimScope: official
  - id: construct-validity
    label: Bean 외, Measuring what Matters，2025
    url: https://arxiv.org/abs/2511.04703v1
    checkedAt: '2026-11-14'
    claimScope: official
---

정답은 한 번의 출력이 기대 결과와 맞았음을 보여 줍니다. 이름이나 숫자를 바꾸거나 무관한 문장을 추가할 때 성능이 흔들리면 어디서 실패했는지 확인해야 합니다. 수학 평가는 어려운 문제뿐 아니라 통제된 조건과 진단이 필요합니다.

자료 확인일은 2026-11-14입니다. 이 글은 연구 방법과 실험 제안을 다룹니다. Folkbench는 모델을 실행하지 않았으며 다음 문항과 수치는 설명용 예시입니다.

## 수학 능력을 이루는 여러 단계

문장제 해결에는 수량과 단위 인식, 관계 이해, 식 구성, 계산, 지정 형식의 답변이 필요합니다. 어느 단계의 오류도 같은 0점이 될 수 있습니다. 최종 정답률은 산출물을 평가하지만 오류 기제를 단독으로 설명하지 못합니다.

올바른 식에 곱셈 오류가 난 경우와 잘못된 관계로 우연히 정답을 얻은 경우는 다릅니다. 관측되는 식과 답변을 보되 유창한 풀이를 내부 계산의 완전한 기록으로 간주하지 않습니다. 도구가 있으면 호출과 결과 활용도 점검합니다.

## GSM-Symbolic이 통제하는 것

[GSM-Symbolic](https://arxiv.org/abs/2410.05229v2)은 GSM8K 문제에서 기호적 틀을 만들고 여러 사례를 생성합니다. 실험은 100개 틀에서 각 50개, 총 5,000개 사례를 사용합니다. 숫자, 이름, 조건 복잡도, 무관한 정보는 안정성의 서로 다른 측면을 드러냅니다.

활용할 핵심은 관계를 고정한 채 표면 조건을 바꾸는 방법입니다. 과거 결과표를 모든 후속 모델에 적용하는 것이 아닙니다. 연구 대상은 특정 모델과 절차이며 2026년의 모든 시스템이 아닙니다. 저자의 내부 기제 해석과 관찰 결과도 구분합니다.

기존의 [무관한 컨텍스트 연구](https://proceedings.mlr.press/v202/shi23a.html)와 [수학 견고성의 인과 분석](https://aclanthology.org/2023.acl-long.32/)도 관련 방법을 제공합니다. 이 연구들은 통제된 진단을 뒷받침하지만, 주의 분산만으로 모든 과제에서 추론이 없다고 증명하지는 않습니다.

## 유효한 문제 변형 만들기

다음은 독자적인 교육 예시로, 벤치마크 문항이나 모델 실험이 아닙니다. 가게에 연필 6상자가 있고 상자마다 8자루이며 9자루를 나눠 줍니다. 남는 수는 `6 × 8 − 9 = 39`입니다.

| 변형 | 변경 | 기대 확인 |
| --- | --- | --- |
| 이름 | 가게를 학교로 바꾸고 관계 유지 | 정답 39 유지 |
| 숫자 | 7상자, 상자당 6자루, 8자루 배부 | 다시 계산하면 34 |
| 표현 | 지시 대상을 명확히 하며 순서 변경 | 정답 39 유지 |
| 무관한 정보 | 상자가 파란색이라고 추가 | 정답 39 유지 |

숫자를 바꾸면 정답도 다시 계산해야 합니다. 임의의 음수 수량, 원래 나누어떨어지던 분배의 나머지, 지나치게 큰 수 연산을 도입하면 의미나 난도가 달라질 수 있습니다.

무관성은 특히 사람이 검토해야 합니다. 두 상자가 예약됐다고 하면 사용 가능한 재고를 묻는 것으로 해석할 수 있어 정답 불변이 분명하지 않습니다. 추가 정보가 풀이에 영향을 주지 않는지 먼저 확인합니다. 무효 변형은 결과를 보기 전에 제외하고, 특정 모델을 실패시키는 문항만 사후 선택하지 않습니다.

## 층화 실험 설계

여러 관계 유형과 난도를 선택하고 원문항마다 동일한 수의 변형을 만듭니다. 주요 요인은 한 번에 하나씩 바꿉니다. 개발 문항으로 지시와 파서를 조정한 뒤 공식 시험을 고정하고, 시험 점수를 보고 지시를 계속 고르지 않습니다.

버전, 언어, 지시, 도구, 샘플링, 출력 예산, 횟수를 고정합니다. 순서를 무작위화하고 문항마다 독립 컨텍스트를 써서 변형 간 정답 유출을 막습니다. 여러 턴의 학습은 별도 절차로 평가합니다.

표본 수는 탐지할 효과와 예산에 맞춥니다. 한 틀을 많이 복제해도 해당 틀의 안정성을 볼 뿐 다양한 추론 능력을 포괄하지 못합니다. 비슷한 문제 수보다 관계와 난도의 대표성이 중요합니다.

## 정답률과 안정성을 함께 보고하기

변형별 정답률과 원문항의 대응 차이를 제시합니다. 원문항과 변형을 모두 맞힌 비율도 성공의 지속을 보여 줍니다. 원문항을 맞힌 사례만 고른 뒤 전체 비교처럼 제시하면 안 됩니다. 조건부 집합을 분석한다면 분모와 선택 규칙을 밝힙니다.

가령 원문항이 80%, 변형이 68%라면 감소는 **12퍼센트포인트**, 상대 감소는 **15%**입니다. 이는 단위 설명이지 GSM-Symbolic이나 Folkbench의 측정값이 아닙니다. 모든 번역에서 구분을 유지해야 합니다.

동일 틀의 변형은 구조를 공유합니다. [Adding Error Bars to Evals](https://arxiv.org/abs/2411.00640v1)는 상관 문항과 대응 비교를 설명합니다. 틀 단위로 재표집하고 매번 두 모델에 같은 그룹을 적용할 수 있습니다. 방법, 95% 구간, 반복 생성 횟수를 공개합니다.

## 계산기 조건은 진단을 돕지만 대상을 바꾼다

외부 계산 도구가 없는 조건과 동일한 계산기 인터페이스·호출 한도가 있는 조건을 분리할 수 있습니다. 후자는 모델과 도구의 결합 시스템이므로 별도 결과가 필요합니다.

도구가 크게 개선했다면 이전 오류가 산술에 집중됐는지 확인합니다. 나머지 추론이 모두 옳다는 증명은 아닙니다. 지시, 풀이 경로, 시간 예산도 달라질 수 있습니다. 식, 도구 요청, 반환값 활용을 기록해야 더 구체적으로 진단할 수 있습니다.

증명 과제는 수치 정답만으로 특히 부족합니다. 모든 경우를 다뤘는지, 증명되지 않은 가정을 사용했는지 별도 검증이 필요합니다. 형식 검증기는 체계 내 도출을 확인하지만, 형식화가 원문 문제를 충실하게 표현하는지도 점검해야 합니다.

## 난도와 견고성은 다른 축

[FrontierMath](https://arxiv.org/abs/2411.04872v7)는 전문가의 고난도 문제와 자동 검증 가능한 답을 사용합니다. 고난도 성능을 탐구하는 반면 GSM-Symbolic은 통제된 변화에서 안정성을 봅니다. 서로 대체하지 못합니다.

어려운 문제는 풀어도 쉬운 표현 변경에 실패할 수 있고, 안정적이지만 복잡한 수학을 못할 수도 있습니다. 난도, 변형, 도구 조건을 구분하고 수학 IQ로 합치지 않는 편이 낫습니다.

제안하는 기준은 올바른 답, 통제된 변화, 해석 가능한 오류, 적절한 통계 단위, 명시된 예산입니다. 인상적인 풀이를 검토 가능한 비교로 바꿉니다. 공통 기록 요건은 [모델 순위의 신뢰성](/ko/blog/llm-benchmark-rankings-contamination/)을 참고하세요.
