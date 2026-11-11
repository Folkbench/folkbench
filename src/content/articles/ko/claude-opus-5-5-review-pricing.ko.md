---
slug: claude-opus-5-5-review-pricing
translationKey: claude-opus-5-5-review-pricing
locale: ko
kind: article
title: Claude Opus 5.5 사양, 정가, 발표 페이지 벤치마크
description: "Claude Opus 5.5의 공식 사양, 정가, 발표 페이지 벤치마크 표를 정리하고, 마이그레이션할 때 곧바로 400을 반환하는 요청을 짚습니다. 수치는 제조사 공개 페이지에서 가져온 것이며 Folkbench 실측이 아닙니다."
category: 모델
tags: [요금, 벤치마크, api]
authorId: iris-wu
modelIds: [claude-opus-5-5, claude-opus-5, claude-fable-5-1, claude-sonnet-5-5, gpt-6-astra, gpt-5-6-sol]
benchmarkSlugs: []
relatedSlugs: [claude-sonnet-5-5-review-pricing, gpt-6-1-sol-review-pricing]
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: opus-55-announcement
    label: Anthropic, Claude Opus 5.5 발표 페이지
    url: https://www.anthropic.com/claude-opus-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: opus-55-overview
    label: Claude Platform, Opus 5.5 모델 페이지
    url: https://platform.claude.com/docs/en/models/opus-5-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
  - id: opus-55-whats-new
    label: Claude Platform, Opus 5.5 업데이트 안내
    url: https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-5-overview
    label: Claude Platform, Sonnet 5 모델 페이지
    url: https://platform.claude.com/docs/en/models/sonnet-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
---

> 아래의 사양, 정가, 점수는 모두 Anthropic 또는 Anthropic이 인용한 공개 페이지에서 옮겨 온 것이며, 2026년 10월 2일에 확인했습니다. Folkbench는 이 벤치마크를 다시 실행하지 않았습니다. “약 40% 저렴”, “약 5분의 1 비용” 같은 제조사의 문장은 제조사 자체 테스트 환경을 설명한 것입니다.

Claude Opus 5.5는 2026년 9월 22일에 발표된 Claude 5.5 시리즈의 첫 모델입니다. Claude API의 모델 ID는 `claude-opus-5-5`입니다. 모델 페이지에는 컨텍스트 1M 토큰, 최대 출력 128K 토큰, 항상 켜져 있는 적응형 사고(adaptive thinking), 기본 effort `medium`, 그리고 입력 100만 토큰당 $4, 출력 100만 토큰당 $20의 정가가 명시되어 있습니다. 공개 페이지에는 파라미터 수도, 학습 연산량도 나와 있지 않습니다.

같은 날 확인할 수 있는 지점은 주로 세 가지입니다. 정가는 Opus 5보다 낮고, $10 / $50인 Fable 5.1보다는 훨씬 낮습니다. 발표 페이지에 실린 코딩 및 지식 작업 항목에서 Opus 5.5는 Fable 5.1과 Opus 5를 앞서며, 그중 대부분의 항목에서 GPT-6 Astra도 앞섭니다. 방향이 반대인 항목은 두 개입니다. Terminal-Bench-Science 0.1과 Zapier의 AutomationBench에서는 Astra의 점 추정치가 앞섭니다. 범위가 명확한 일상 작업이라면 [Claude Sonnet 5.5](../claude-sonnet-5-5-review-pricing/)와 비교해 보세요. OpenAI 쪽의 긴 컨텍스트 가격 구간은 [GPT-6.1 Sol](../gpt-6-1-sol-review-pricing/)에서 볼 수 있습니다.

## 공개된 사양

| 항목 | Claude Opus 5.5 |
| --- | --- |
| Claude API 모델 ID | `claude-opus-5-5` |
| 발표일 | 2026년 9월 22일 |
| 컨텍스트 윈도우 | 1M 토큰 |
| 최대 출력 | 128K 토큰 |
| Batch API 최대 출력 | 300K 토큰, beta 헤더 `output-300k-2026-03-24` |
| 입출력 형식 | 텍스트와 이미지 입력, 텍스트 출력 |
| 사고 | 적응형, 항상 켜짐 |
| 기본 effort | `medium` |
| effort 값 | `low`, `medium`, `high`, `xhigh`, `max` |
| 모델 페이지의 지연 시간 등급 | 보통 |
| 신뢰할 수 있는 지식 컷오프 | 2026년 6월 |
| 캐시 가능한 프롬프트 최소 길이 | 512 토큰 |
| 파라미터 수 | 공개 모델 페이지에 없음 |

“신뢰할 수 있는 지식 컷오프”는 모델이 기본으로 갖춘 지식이 가장 충실하게 미치는 날짜입니다. 이는 컨텍스트 윈도우와는 별개입니다. 요청에 첨부한 파일은 여전히 해당 요청의 컨텍스트 안에 있습니다.

Fast mode는 같은 모델 ID에서 쓰는 속도 스위치입니다. 업데이트 안내는 이를 Claude API에서만 사용할 수 있는 연구 프리뷰로 표시합니다. 요청에 `speed: "fast"`를 지정하고 beta 헤더 `fast-mode-2026-02-01`을 함께 보냅니다. 발표 페이지가 제시한 가격은 100만 토큰당 $8 / $40이고, 출력 속도는 최대 약 2.5배이며, Claude Code와 Claude Platform에서 사용할 수 있다고 적혀 있습니다. 업데이트 안내에는 Amazon Bedrock, Claude Platform on AWS, Google Cloud, Microsoft Foundry에서는 이 fast mode를 제공하지 않는다고 명시되어 있습니다.

사고 예산을 수동으로 지정하면 거부됩니다. 사고 깊이는 effort로만 제어합니다.

## 공식 정가

단위는 100만 토큰당 미국 달러입니다. Opus 5.5의 5분 캐시 쓰기, 1시간 캐시 쓰기, 배치 가격은 업데이트 안내에서 가져왔습니다. Opus 5의 캐시 쓰기는 발표 페이지 비교표에 있는 단일 “cache writes” 수치로, 이 표는 5분과 1시간을 나누지 않습니다. Fable 5.1, Sonnet 5.5, Haiku 4.5의 입력 및 출력 가격은 모델 페이지의 비교 행에서 가져왔습니다. Sonnet 5는 여전히 legacy로 표시되어 있으며, 모델 페이지에 나온 입력 및 출력 가격은 Sonnet 5.5와 같습니다. 대시(—)는 이 글이 1차 가격 행에서 해당 칸을 가져오지 않았다는 뜻입니다.

| 100만 토큰당 | Opus 5.5 | Opus 5 | Fable 5.1 | Sonnet 5.5 | Haiku 4.5 |
| --- | --- | --- | --- | --- | --- |
| 입력 | $4 | $5 | $10 | $2 | $1 |
| 출력 | $20 | $25 | $50 | $10 | $5 |
| 캐시 읽기 | $0.20 | $0.50 | — | $0.20 | — |
| 캐시 쓰기 | 5분 $5; 1시간 $8 | $6.25 | — | 5분 $2.50; 1시간 $4 | — |
| 배치 입력 / 출력 | $2 / $10 | — | — | 정가의 50% | — |
| Fast mode 입력 / 출력 | $8 / $40 | — | — | — | — |

Opus 5 대비 신규 입력과 출력의 정가는 20% 내려가 $5 / $25에서 $4 / $20이 되었습니다. 발표 페이지는 캐시 읽기가 $0.50에서 $0.20으로 내려갔다고 적고, 이것이 에이전트와 코딩 청구액의 대부분을 차지한다고 설명합니다. Anthropic은 워크로드에 관한 주장도 별도로 내놓았습니다. 기본 설정에서 일반적인 작업 비용이 Opus 5보다 약 40% 낮은데, 모델이 사용하는 토큰 자체도 줄었기 때문이라는 것입니다. 이 40%는 Anthropic 자체 테스트 환경을 설명한 수치입니다. 실제 청구액은 여전히 effort, 캐시 적중, 도구 호출 라운드, 그리고 배치나 fast mode를 사용했는지에 따라 달라집니다.

배치 처리는 새 정가의 절반입니다. Fast mode는 새 정가의 두 배이며, 업데이트 안내는 이를 Claude API로 한정합니다.

공식 정가로 직접 계산해 볼 수 있는 예시 세 가지입니다. 형태는 해당 유형의 입력 토큰 10만 개에 출력 토큰 5,000개를 더한 것입니다. 캐시 행은 사용량 기록이 실제로 이 토큰을 읽기로 계산한다고 가정합니다.

| 요청 | 계산 | 금액 |
| --- | --- | --- |
| 캐시되지 않은 입력 10만, 출력 5,000 | 0.1 × $4 + 0.005 × $20 | $0.50 |
| 캐시 읽기 10만, 출력 5,000 | 0.1 × $0.20 + 0.005 × $20 | $0.12 |
| 5분 캐시 쓰기 10만, 출력 5,000 | 0.1 × $5 + 0.005 × $20 | $0.60 |

1시간 캐시 쓰기는 위의 $5 대신 $8로 계산해야 합니다. 중계 서비스나 클라우드 플랫폼의 실제 거래 가격은 이 표에 포함되어 있지 않습니다.

## Opus 5, Fable 5.1과 비교해 요청에서 달라진 점

| 동작 | Opus 5.5 | Opus 5 | Fable 5.1 |
| --- | --- | --- | --- |
| API ID | `claude-opus-5-5` | `claude-opus-5` | `claude-fable-5-1` |
| 컨텍스트 / 최대 출력 | 1M / 128K | 1M / 128K | 1M / 128K |
| 사고 | 항상 켜짐. `disabled`와 수동 예산은 400 반환 | 기본 켜짐. effort가 `high` 이하일 때 `disabled` 허용 | 모델 페이지에 항상 켜짐으로 명시 |
| effort 생략 시 기본값 | `medium` | `high` | `high` |
| 신뢰할 수 있는 지식 컷오프 | 2026년 6월 | 이 글에서 별도로 인용하지 않음 | 2026년 6월 |
| 정가 입력 / 출력 | $4 / $20 | $5 / $25 | $10 / $50 |
| 캐시 읽기 | $0.20 | $0.50 | — |

업데이트 안내는 “Opus 5에서 돌아가던 코드”를 실패하게 만드는 변경 네 가지를 한데 정리해 두었습니다. 앞의 세 가지는 Fable 5.1에도 똑같이 적용됩니다. 모델 문자열만 바꿔서는 여전히 이 문제들에 부딪힙니다.

```text
model: claude-opus-5-5
thinking: {"type": "adaptive"}
tool_choice: {"type": "auto"}
output_config.effort: medium
# 400: thinking 유형이 disabled이거나, enabled이면서 budget_tokens 포함
# 400: tool_choice가 any이거나 tool
# 400, Claude API와 Google Cloud 한정: 도구 유형 computer_20251124
```

`thinking`을 생략하는 것과 `adaptive`를 보내는 것은 같습니다. `tool_choice`의 `auto`와 `none`은 여전히 유효하며, 토큰 계수 엔드포인트에서도 마찬가지입니다. 스키마에 맞는 JSON이 필요하다면, 업데이트 안내는 엄격한 도구 호출(strict tool use)이나 구조화된 출력을 사용하고 프롬프트에 언제 도구를 호출해야 하는지 명시하라고 안내합니다.

Claude API와 Google Cloud에서는 `computer_20251124`를 `computer_toolset_20260801`로 바꾸고, 이전 컴퓨터 사용 beta 헤더를 제거하세요. 업데이트 안내에 따르면 Amazon Bedrock의 Opus 5.5는 여전히 `computer_20251124`를 허용합니다. 이미 새 도구 세트를 사용하는 브라우저 조작 통합이라면 이 부분 때문에 코드를 바꿀 필요가 없습니다.

네 번째 400은 사고 블록 바인딩과 관련됩니다. 2026년 8월 31일 00:00 UTC 이후에 생성된 계정은 Claude API와 클라우드 플랫폼에서, Opus 5.5 사고 블록이 생성된 뒤 시스템 프롬프트, 도구 목록 또는 이전 메시지가 수정되었다면 그 블록을 재전송할 때 400을 받습니다. 문서가 제시하는 방법은 추가만 하는(append-only) 대화 기록입니다. 지시를 꼭 바꿔야 한다면 대화 중간에 시스템 메시지를 넣으세요. 그 이전에 생성된 계정은 같은 검사를 명시적으로 켜야 적용됩니다.

요청은 성공하지만 동작이 달라지는 지점도 세 군데 있습니다. effort를 생략하면 이제 `medium`으로 실행되는데, Opus 5에서는 같은 생략이 `high`로 실행되었습니다. 같은 effort 등급에서 Opus 5.5는 매 턴 Opus 5보다 더 많이 사고하는 경향이 있으며, `xhigh`와 `max`에서 특히 두드러집니다. 이전 설정에서 그대로 가져온 effort 값은 새로운 비용 지점이 되며, `max_tokens`에는 사고 블록이 들어갈 공간을 남겨 두어야 합니다.

도구 호출 사이에 작성된 텍스트는 사고 블록 안으로 돌아갑니다. 기본 display 값인 `omitted`에서는 이 블록의 텍스트가 비어 있습니다. 예전에 이 텍스트를 스트리밍으로 보여 주던 UI는 조용해지지만, 요청 자체는 여전히 성공합니다. 이런 진행 상황 표시가 필요하다면 display를 따로 설정하고, 위치로 추측하지 말고 블록의 `type` 값으로 골라내야 합니다.

생물 분류기는 사이버보안 분류기와 함께 실행됩니다. 모델이 “추론을 보이는 답변에 그대로 옮겨 적도록” 유도하는 프롬프트는 `reasoning_extraction`으로 거부될 수 있습니다. 업데이트 안내에는 시각 도구를 붙이기 전부터 차트와 스크린숏을 더 정확하게 읽는다는 내용도 있으므로, 예전에 약한 이미지 인식을 보완하려고 작성한 프롬프트는 따로 다시 실행해 볼 가치가 있습니다.

거부된 요청은 HTTP 200으로 반환되며 `stop_reason`은 `"refusal"`입니다. 이것은 전송 실패가 아닙니다. 과금 여부는 거부 유형에 따라 다르며, 속도 제한에는 여전히 포함됩니다.

## 발표 페이지 벤치마크를 읽는 법

아래 표는 2026년 10월 2일 기준 발표 페이지에 실린 그대로입니다. 각주에 별도 설명이 없으면 Opus 5.5는 적응형 사고를 사용하며 effort는 max입니다. Terminal-Bench 4.0이 바로 그 각주 대상입니다. Opus 5.5는 `xhigh`, GPT-6 Astra는 `high`를 사용했고, 각각 해당 모델이 공개한 최고 점수를 썼습니다. Astra와 GPT-5.6 Sol의 수치는 OpenAI의 보고서를 인용했습니다. 프로덕션 안전장치는 켜져 있었습니다. 안전장치가 개입하면 사이버보안 작업은 Opus 4.8이, 생물 및 프런티어 LLM 개발 작업은 Opus 5가 완료했습니다. Anthropic은 이 때문에 Opus 5.5의 점수가 낮아진다고 설명합니다.

| 벤치마크 | Opus 5.5 | Fable 5.1 | Opus 5 | GPT-6 Astra | GPT-5.6 Sol |
| --- | --- | --- | --- | --- | --- |
| Terminal-Bench 4.0 | 66.4% | 55.8% | 52.3% | 57.9% | 37.3% |
| FrontierCode v1.1(Main) | 54.4% | 50.3% | 48.0% | 53.3% | 47.5% |
| CursorBench 4.0 | 57.8% | 51.8% | 46.6% | — | 41.7% |
| GDPval-AA v2.1 | 1846 | 1735 | 1708 | 1542 | 1588 |
| AutomationBench | 40.0% | 31.4% | 26.9% | 41.4% | 28.8% |
| Humanity's Last Exam, 도구 사용 | 67.7% | 65.6% | 63.6% | 57.2% | — |
| Terminal-Bench-Science 0.1 | 58.7% | 52.6% | 29.0% | 64.6% | 22.4% |
| OSWorld 2.1, partial | 81.8% | 80.7% | 74.0% | — | — |
| Chartography, 도구 사용 | 89.0% | 88.4% | 83.4% | — | — |

격차는 공개된 오차와 나란히 놓고 보세요. Terminal-Bench 4.0에서 Opus 5.5의 오차는 ±2.6포인트, 다른 Claude 모델은 ±1.6~±2포인트입니다. 66.4%에서 Astra의 57.9%, Fable의 55.8%까지의 격차는 모두 이 오차보다 넓습니다. 같은 각주에는 공개 리더보드의 Opus 5가 51.8%이고, Anthropic 환경에서 재현한 값은 52.3%로 노이즈 범위 안에 든다고 적혀 있습니다.

Terminal-Bench-Science의 오차는 모델별로 ±3.5~±5포인트입니다. Astra의 64.6%와 Opus 5.5의 58.7%의 차이는 이 오차 폭과 비슷하며, 점 추정치로는 Astra가 앞섭니다. 공개 리더보드의 Opus 5는 30.0%이고, Anthropic 환경에서 재현한 값은 29.0%입니다.

AutomationBench는 Zapier가 운영합니다. 해당 실행에는 대체 모델이 없었기 때문에 안전장치가 개입한 경우는 실패로 처리되었습니다. Anthropic은 실제 점수는 더 높을 것이라고 말합니다. 표에 실린 40.0% 대 Astra의 41.4%는 매우 근접한 공개 결과이며, 점 추정치로는 Astra가 앞섭니다. GDPval-AA v2.1은 44개 직업을 아우르는 실제 전문 업무의 Elo 점수입니다. Opus 5.5는 1846, Fable 5.1은 1735, Opus 5는 1708, Sol은 1588, Astra는 1542입니다.

같은 발표 페이지의 비용 차트에는 기본 effort인 `medium`에서 측정한 두 번째 점수 세트도 있습니다. FrontierCode 54.6%, CursorBench 52.5%입니다. 비교표에 실린 값은 54.4%와 57.8%입니다. 서로 다른 두 effort 설정에서 나온 두 개의 숫자로 보면 됩니다. 차트 주석에는 medium effort에서 FrontierCode가 약 5분의 1의 작업당 비용으로 Astra의 최고 점수 53.3%를 넘고, Terminal-Bench는 약 40%의 비용으로 Astra와 동률을 이룬다고도 적혀 있습니다. 이는 Anthropic 자체 테스트 환경에서의 작업당 비용에 관한 주장입니다.

표 아래의 한 문장이 더 기억해 둘 만합니다. Anthropic 자체 사용에서는 Opus 5.5와 Fable 5.1의 격차가 점수로 보이는 것보다 좁으며, 이 수준에서의 벤치마크 점수 차이는 실제 작업을 가늠하는 지표로서 힘이 더 약하다는 것입니다. 발표 페이지의 고객 인용문은 선별된 증언입니다. 무엇을 다시 실행해 볼지 힌트를 줄 수는 있지만, 이 표에 속하지는 않습니다.

## 트래픽을 전환하기 전에 확인할 사항

1. `claude-opus-5-5`를 고정하세요. 완료된 결과에 표시된 모델명도 확인해야 합니다. 안전장치가 개입하면 사이버보안 작업은 Opus 4.8이, 생물 및 프런티어 LLM 개발 작업은 Opus 5가 완료할 수 있습니다. 로그에 기록된 요청 모델은 여전히 `claude-opus-5-5`로 나올 수 있습니다.
2. 민감한 정보가 없는 같은 세트를 `low`, `medium`, `high`, `xhigh`, `max`에서 각각 다시 실행하세요. 성공률, 실제 소요 시간, 입력, 캐시 읽기, 캐시 쓰기, 출력, 비용을 기록합니다.
3. `thinking: {"type": "disabled"}`나 `budget_tokens`를 포함한 수동 예산을 보내지 마세요. effort는 명시적으로 설정하세요. 생략하면 여기서는 Opus 5의 `high`가 아니라 `medium`으로 실행됩니다.
4. `tool_choice`에는 `auto` 또는 `none`만 사용하세요. Claude API와 Google Cloud의 컴퓨터 사용은 `computer_toolset_20260801`로 바꾸세요.
5. 사고 블록을 재전송하는 대화는 추가만 하는 방식을 유지하세요. 2026년 8월 31일 이후에 생성된 계정은 Opus 5.5 사고 블록 앞의 프리픽스가 바뀌면 400을 받습니다.
6. HTTP 200 거부와 전송 실패는 따로 집계하세요.
7. 짧은 프롬프트 하나와 캐시에 적중할 프롬프트 하나로 청구 금액을 확인하세요. 5분 쓰기, 1시간 쓰기, 배치, fast mode는 서로 다른 네 가지 가격표입니다.
8. 범위가 명확하고 이 Opus 루프가 필요 없는 작업이라면 계속 [Sonnet 5.5](../claude-sonnet-5-5-review-pricing/)의 $2 / $10을 검토하세요. 과학 에이전트 작업과 Zapier의 비즈니스 워크플로에서는 발표 페이지에 실린 점 추정치상 Astra가 앞섭니다.

모델을 정한 뒤, 각 중계 서비스가 이 ID를 제공하는지, 그리고 그 시점의 가용성과 가격은 디렉터리에 게시된 기록을 기준으로 확인하세요. 이 글은 중계 서비스끼리 비교하지 않으며, 제조사 정가를 특정 중계 서비스의 실제 거래 가격으로 쓰지도 않습니다.
