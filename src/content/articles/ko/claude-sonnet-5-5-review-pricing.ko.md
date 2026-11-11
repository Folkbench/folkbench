---
slug: claude-sonnet-5-5-review-pricing
translationKey: claude-sonnet-5-5-review-pricing
locale: ko
kind: article
title: Claude Sonnet 5.5 사양, 공식 가격, 발표 페이지 벤치마크
description: "Claude Sonnet 5.5의 공식 사양, Sonnet 5와 같은 공식 가격, 발표 페이지에 실린 벤치마크를 정리하고 마이그레이션 시 400을 반환하는 요청을 따로 짚습니다. 이 수치는 Folkbench 실측이 아닙니다."
category: 모델
tags: [요금, 벤치마크, api]
authorId: iris-wu
modelIds: [claude-sonnet-5-5, claude-sonnet-5, claude-opus-5-5, gpt-6-sol]
benchmarkSlugs: []
relatedSlugs: [claude-opus-5-5-review-pricing, gpt-6-1-sol-review-pricing]
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: sonnet-55-announcement
    label: Anthropic, Claude Sonnet 5.5 발표 페이지
    url: https://www.anthropic.com/claude-sonnet-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-55-overview
    label: Claude Platform, Sonnet 5.5 모델 페이지
    url: https://platform.claude.com/docs/en/models/sonnet-5-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-55-whats-new
    label: Claude Platform, Sonnet 5.5 업데이트 안내
    url: https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-55-migration
    label: Claude Platform, Sonnet 5.5 마이그레이션 가이드
    url: https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-5-overview
    label: Claude Platform, Sonnet 5 모델 페이지
    url: https://platform.claude.com/docs/en/models/sonnet-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
---

> 아래의 사양, 공식 가격, 점수는 Anthropic 공개 페이지에서 옮겨 온 것이며 확인일은 2026년 10월 2일입니다. Folkbench는 이 벤치마크를 다시 실행하지 않았습니다. “최대 30% 저렴”, “30% 이상 빠름” 같은 개발사의 문구는 개발사 자체 테스트 환경에서 나온 결과를 설명합니다.

Claude Sonnet 5.5는 2026년 9월 28일에 발표되었으며 Claude 5.5 시리즈의 두 번째 모델입니다. Claude API의 모델 ID는 `claude-sonnet-5-5`입니다. Anthropic은 이 모델을 [Opus 5.5](../claude-opus-5-5-review-pricing/) 옆에 배치합니다. 범위가 분명한 일상 작업, 버그 수정, 문서·슬라이드·스프레드시트 작업에는 이 모델을 쓰고, 복잡하고 범위가 열려 있으며 지속적인 판단이 필요한 작업은 발표 페이지에서도 여전히 Opus 5.5가 더 강하다고 적습니다. 공식 가격은 Sonnet 5와 같아서 입력 100만 토큰당 $2, 출력 100만 토큰당 $10, 캐시 읽기는 100만 토큰당 $0.20입니다.

두 발표 페이지 모두 Haiku 5.5는 앞으로 몇 주 안에 나온다고 적고 있습니다. 이 글은 아직 가격표에 오르지 않은 ID의 가격은 적지 않습니다.

## 공개된 사양

| 항목 | Claude Sonnet 5.5 |
| --- | --- |
| Claude API 모델 ID | `claude-sonnet-5-5` |
| 발표일 | 2026년 9월 28일 |
| 컨텍스트 / 동기 최대 출력 | 1M / 128K 토큰 |
| 입출력 | 텍스트·이미지 입력, 텍스트 출력 |
| 사고(thinking) | 적응형, 기본 활성화 |
| Claude API의 기본 effort | `high` |
| Claude 앱과 Claude Code의 기본 effort | `medium` |
| effort 값 | `low`, `medium`, `high`, `xhigh`, `max` |
| 모델 페이지의 지연 시간 등급 | Fast. 현재 Claude 제품군 안에서의 상대 비교이며 토큰/초 측정값이 아닙니다 |
| 신뢰할 수 있는 지식 컷오프 | 2026년 6월 |
| 캐시 가능한 프롬프트 최소 길이 | 512 토큰 |
| 토크나이저 | Sonnet 5와 같습니다. 같은 텍스트는 토큰 수도 같습니다 |

Sonnet 5 모델 페이지는 여전히 이 모델을 legacy이자 사용 가능으로 표시하며, 입력과 출력 가격도 $2 / $10이고 신뢰할 수 있는 지식 컷오프는 2026년 1월입니다. 지원 종료 약속은 2027년 6월 30일 이전에는 종료하지 않는다는 것입니다. Sonnet 5.5 업데이트 안내는 5.5로 옮길 것을 권합니다.

사전 사고를 끄는 가장 낮은 설정은 `thinking: {"type": "between_tools"}`이며 `low`, `medium`, `high`에서만 허용됩니다. `xhigh`와 `max`에서는 적응형 사고로 되돌려야 합니다. 마이그레이션 가이드에 따르면 `temperature`, `top_p`, `top_k`를 기본값이 아닌 값으로 설정하면 400이 반환됩니다.

## 공식 가격

단위는 100만 토큰당 미국 달러입니다. Sonnet 5.5 열은 모델 페이지에서 가져왔습니다. Opus 5.5의 입력, 출력, 캐시 읽기는 같은 발표 페이지의 비교표에서 가져왔습니다. 업데이트 안내에 따르면 Sonnet 5.5의 가격은 프롬프트 캐싱과 배치를 포함해 Sonnet 5와 같습니다. 배치 할인은 입력과 출력의 50%입니다.

| 1M 토큰당 | Sonnet 5.5 | 발표 페이지의 Opus 5.5 |
| --- | --- | --- |
| 입력 | $2 | $4 |
| 출력 | $10 | $20 |
| 캐시 읽기 | $0.20 | $0.20 |
| 캐시 쓰기 | 5분 $2.50, 1시간 $4 | 발표 페이지에는 $5 하나로 표기, 업데이트 안내에서는 5분 $5와 1시간 $8로 나눔 |
| 배치 입력 / 출력 | 공식 가격의 50% | 이 발표 페이지 비교표에는 없음 |

입력과 출력은 Opus 5.5의 절반입니다. 캐시 읽기는 두 모델 모두 $0.20입니다. 발표 페이지는 Opus 5.5의 캐시 쓰기를 $5 하나로 표기하고 5분과 1시간을 나누지 않았습니다. Sonnet 5.5 모델 페이지는 두 구간을 나눠 적습니다.

Anthropic은 작업량에 관한 주장도 두 가지 내놓습니다. 같은 작업에 드는 토큰이 대체로 더 적어서 대부분의 작업이 최대 30% 저렴하고, 출력 생성은 Sonnet 5보다 30% 이상 빠르다는 것입니다. 비용 차트에는 “약 10분의 1”, “약 5분의 1”, “약 15분의 1”, “약 9분의 1” 같은 작업당 비용 비교도 실려 있습니다. 모두 개발사 테스트 환경 안에서 나온 결과입니다. 실제 청구 금액은 여전히 effort, 캐시 적중, 도구 호출 횟수, 배치 사용 여부에 따라 달라집니다.

공식 가격으로 직접 계산해 볼 수 있는 예시 세 가지입니다. 각각 해당 유형의 입력 토큰 10만 개에 출력 토큰 5,000개를 더한 형태입니다.

| 요청 | 계산 | 금액 |
| --- | --- | --- |
| 캐시되지 않은 입력 10만, 출력 5,000 | 0.1 × $2 + 0.005 × $10 | $0.25 |
| 캐시 읽기 10만, 출력 5,000 | 0.1 × $0.20 + 0.005 × $10 | $0.07 |
| 5분 캐시 쓰기 10만, 출력 5,000 | 0.1 × $2.50 + 0.005 × $10 | $0.30 |

세 번째 행은 1시간 가격인 $4가 아니라 5분 쓰기 가격을 사용했습니다. 1시간 쓰기라면 0.1 × $4 + 0.005 × $10 = $0.45입니다.

## 발표 페이지 벤치마크를 읽는 법

아래 표는 2026년 10월 2일 기준으로 발표 페이지에 실린 표 그대로입니다. 대시는 발표 페이지 자체의 빈칸입니다. Terminal-Bench 4.0과 CursorBench 4.0의 비용 차트는 GPT-5.6 Sol을 사용했는데, OpenAI가 GPT-6 Sol의 이 두 항목 점수를 공개하지 않았기 때문입니다. 이 글은 차트의 GPT-5.6 Sol 점수를 GPT-6 Sol 열에 채워 넣지 않습니다.

| 벤치마크 | Sonnet 5.5 | Sonnet 5 | Opus 5.5 | GPT-6 Sol |
| --- | --- | --- | --- | --- |
| Terminal-Bench 4.0 | 70.6% | 10.3% | 66.4% | — |
| FrontierCode v1.1(Main) | 46.2%(max), 52.1%(xhigh) | 42.4% | 54.4% | 49.3% |
| CursorBench 4.0 | 55.5% | 34.1% | 57.8% | — |
| GDPval-AA v2.1 | 1844 | 1449 | 1846 | 1487 |
| AA-Briefcase v1.1 | 1811 | 1359 | 1822 | 1483 |
| Humanity's Last Exam, 도구 사용 | 64.5% | 54.9% | 67.7% | — |
| OSWorld 2.1, partial | 80.1% | 57.0% | 81.8% | — |
| Chartography, 도구 미사용 | 61.6% | 15.6% | 64.4% | 53.6% |

이 Chartography 행은 도구를 쓰지 않은 점수입니다. Opus 5.5 발표 페이지의 Chartography는 도구를 쓴 별도의 측정이고, 그 행에서 Opus 5.5는 89.0%입니다. 여기 있는 64.4%와 같은 측정으로 나란히 놓으면 안 됩니다.

각주는 점수와 함께 읽어야 합니다. Opus 5.5의 Terminal-Bench 4.0 점수는 xhigh 기준이며, 발표 페이지는 이를 그 모델의 최고 점수라고 부릅니다. FrontierCode에서는 Sonnet 5.5의 max 점수가 xhigh보다 낮습니다. 발표 페이지의 설명은 이렇습니다. max에서는 코드 리뷰를 더 자주 실행했고, 리뷰가 여러 서브에이전트로 나뉜 뒤 시간 초과가 발생하거나 작업 범위를 벗어난 수정이 나온 사례가 있었으며, 이 평가는 범위를 벗어난 수정에 감점을 줍니다.

GDPval-AA와 AA-Briefcase는 Artificial Analysis가 출시 전 배포 환경에서 실행했습니다. 그 배포 환경에는 구조화된 출력을 약화시킬 수 있는 버그가 있었습니다. 발표 페이지는 이 버그가 나중에 수정되었고, 영향이 있었다면 Sonnet 5.5를 과소평가하는 방향이라고 말합니다. GPT-6 Sol 열의 GDPval-AA, AA-Briefcase, Chartography에는 또 다른 주석이 붙어 있습니다. OpenAI가 이미지 이해를 해치던 버그를 수정했으며, 이 외부 점수에는 당시 아직 그 수정이 반영되지 않았을 수 있다는 것입니다.

같은 페이지의 비용 차트는 또 다른 방식으로 읽어야 합니다. Medium effort는 Claude 앱의 기본값입니다. 여러 벤치마크에서 Low 또는 Medium의 Sonnet 5.5가 약 10분의 1의 작업당 비용으로 Sonnet 5의 최고 점수를 넘습니다. High effort는 Claude Platform의 기본값입니다. 발표 페이지에 따르면 FrontierCode에서 High는 같은 설정의 Sonnet 5보다 약 10점 높고 작업당 비용은 약 15분의 1이며, GPT-6 Sol의 최고 점수와 비슷한 수준을 약 5분의 1의 비용으로 냅니다. CursorBench에서는 Low가 10분의 1이 안 되는 비용으로 Sonnet 5의 최고 점수를 넘습니다. AA-Briefcase에서는 Medium이 약 9분의 1의 비용으로 Sonnet 5의 최고 점수를 넘습니다.

표에 실린 55.5%와 1844는 발표 페이지가 찍어 둔 점수입니다. 비용 문장은 또 다른 테스트 환경에서 나왔습니다. 발표 페이지는 Anthropic 내부 사용과 외부 테스트에서 복잡하고 범위가 열려 있으며 지속적인 판단이 필요한 작업은 여전히 Opus 5.5가 더 강하다고도 적습니다. 고객 인용문은 선별된 추천사이며 이 표에 속하지 않습니다. 발표 페이지는 이 모델이 스크린샷만 보고 Pokémon Red를 클리어한 첫 Sonnet이라고도 적지만, 이는 제품 소개의 일부이지 위 표의 한 행이 아닙니다.

## Sonnet 5에서 옮겨 오기

업데이트 안내는 Sonnet 5에서 돌던 코드가 400을 반환하게 만드는 변경 다섯 가지를 나열합니다. 이와 별개로 요청은 여전히 성공하지만 응답 형태가 바뀌는 경우도 있습니다.

```text
model: claude-sonnet-5-5
max_tokens: 1024
thinking: {"type": "adaptive"}
output_config.effort: medium
# 400: thinking 유형이 disabled
# 400: thinking 유형이 enabled이고 budget_tokens 포함
# 400: thinking 유형이 between_tools이고 effort가 xhigh 또는 max
# 400: tool_choice가 any 또는 tool
# 400: temperature, top_p, top_k가 기본값이 아님
# 400, Claude API와 Google Cloud 한정: 도구 유형 computer_20251124
# 400: 어드바이저 도구가 Opus 4.8, Opus 4.7, Sonnet 5를 어드바이저로 사용
```

사전 사고를 끌 때는 `between_tools`를 보내고 effort는 `high` 이하로 유지하세요. `between_tools`에는 `display`, `budget_tokens`, `block_binding`을 함께 넣을 수 없습니다. `tool_choice`는 계속 `auto` 또는 `none`을 사용하세요. 스키마에 맞는 도구 인수가 필요하면 엄격한 도구 호출을 켜거나 구조화된 출력을 사용하고, 언제 도구를 호출할지 프롬프트에 명시하세요.

Claude API와 Google Cloud에서 컴퓨터 사용 도구는 `computer_toolset_20260801`로 바뀝니다. 업데이트 안내에 따르면 Amazon Bedrock은 여전히 기존 `computer_20251124`를 받습니다.

어드바이저 도구는 Mythos 5.1, Fable 5.1, Mythos 5, Fable 5, Opus 5.5, Opus 5, 또는 Sonnet 5.5 자신을 받습니다. Opus 4.8, Opus 4.7, Sonnet 5는 Sonnet 5의 어드바이저는 될 수 있지만 Sonnet 5.5의 어드바이저는 될 수 없습니다. 어드바이저가 반환하는 내용은 암호화되어 있어 클라이언트가 본문을 읽을 수 없습니다.

2026년 8월 31일 00:00 UTC 이후에 생성된 계정에는 Claude API, Amazon Bedrock, Google Cloud에서 400이 하나 더 있습니다. Sonnet 5.5의 사고 블록을 재전송할 때 시스템 프롬프트, 도구 목록, 또는 그 이전 메시지가 바뀌어 있으면 요청이 실패합니다. 대화는 추가 전용으로 유지하세요. 지시를 바꿔야 한다면 대화 중간에 시스템 메시지를 넣으세요.

effort를 생략하면 API는 `high`로 실행됩니다. 같은 단어라도 Sonnet 5와 사고량이 일치하지 않습니다. 업데이트 안내는 기존 설정을 그대로 옮기지 말고 effort 스윕을 새로 하라고 요구합니다. 범위가 분명한 도구 루프는 `medium`에서 시작하고, 더 길거나 어려운 작업은 `high`로 올립니다. 지연 시간에 민감한 대화는 `medium` 또는 `low`에서 시작합니다. Claude 앱과 Claude Code의 기본값은 이미 `medium`이고, Claude Platform의 기본값은 `high`입니다.

도구 호출 사이에 한두 문장을 넘는 진행 상황 텍스트는 사고 블록 안으로 돌아옵니다. display 기본값이 `omitted`이면 이 블록의 텍스트는 비어 있어서, 요청 자체는 성공하지만 UI는 도구 호출 사이에 조용해집니다. `between_tools`를 사용하면 이 텍스트가 사고 블록 안의 요약으로 돌아오고, 재전송할 때 모델은 전체 메모를 봅니다.

사고 블록에는 그 블록을 만든 모델이 기록됩니다. 업데이트 안내에 따르면 Sonnet 5.5는 Sonnet 5, Opus 4.8, Haiku 4.5 및 그 이전 모델의 사고 블록을 읽을 수 있고, Opus 5, Opus 5.5, Fable, Mythos의 사고 블록은 읽지 않습니다. Claude API와 Google Cloud에서는 Opus 5.5가 Sonnet 5.5의 사고 블록을 읽을 수 있고, 다른 현행 모델은 읽을 수 없습니다. 대상 모델이 읽을 수 없는 블록은 모델이 보기 전에 버려집니다. 요청은 여전히 성공하며, 버려진 블록은 과금되지 않습니다.

거절된 요청은 HTTP 200으로 반환되며 `stop_reason`은 `"refusal"`입니다. 발표 페이지에 따르면 이 모델의 사이버 보안 역량은 Opus 5에 가까워서, 같은 종류의 사이버 보안 보호 장치를 갖춘 첫 Sonnet이 되었습니다. 위험도가 더 높은 사이버 보안 작업은 Sonnet 5로 폴백됩니다. 생물학 보호 장치는 Sonnet 5와 같습니다. 일반적인 소프트웨어 개발과 대부분의 생명과학 작업은 이 두 가지 좁은 보호 장치의 대상이 아닙니다. 발표 페이지는 Sonnet 5.5를 데이터 무보존(zero data retention)으로 제공할 수 있다고도 적습니다.

## 트래픽을 옮기기 전에 확인할 것

1. `claude-sonnet-5-5`를 고정하세요. 완료된 결과의 모델 이름도 확인하세요. 사이버 보안 보호 장치가 폴백되면 응답한 모델이 Sonnet 5일 수 있습니다.
2. 민감한 정보가 없는 같은 세트를 `low`, `medium`, `high`, `xhigh`, `max`에서 각각 재실행하세요. 성공률, 지연 시간, 입력, 캐시 읽기, 캐시 쓰기, 출력, 비용을 기록하세요.
3. effort는 `output_config.effort`에 넣으세요. 이 모델의 사고 수준을 수동 `budget_tokens`로 설정하지 마세요.
4. `disabled`, 강제 도구 선택, 샘플링 매개변수, `computer_20251124`를 보내던 클라이언트는 트래픽을 늘리기 전에 먼저 수정하세요. Bedrock의 기존 컴퓨터 사용 도구는 예외입니다.
5. 사고 블록을 재전송하는 대화는 추가 전용으로 유지하세요.
6. HTTP 200 거절과 전송 실패는 따로 집계하세요.
7. 짧은 프롬프트 하나와 캐시에 적중해야 하는 프롬프트 하나로 청구 금액을 확인하세요. 5분 쓰기, 1시간 쓰기, 50% 배치 할인은 서로 다른 가격표입니다.
8. 복잡하고 범위가 열려 있으며 지속적인 판단이 필요한 작업은 계속 `claude-opus-5-5`를 사용하세요. Sonnet 5 모델 페이지는 `claude-sonnet-5`를 여전히 사용 가능으로 표시합니다. OpenAI 쪽 가격 구간은 [GPT-6.1 Sol](../gpt-6-1-sol-review-pricing/)을 참고하세요.

모델을 고른 뒤 각 중계 서비스가 이 ID를 제공하는지, 그리고 해당 시점의 가용성과 가격은 목록에 게시된 기록을 기준으로 삼으세요. 이 글은 중계 서비스를 비교하지 않습니다.
