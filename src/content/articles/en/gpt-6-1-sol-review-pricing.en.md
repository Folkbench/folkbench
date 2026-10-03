---
slug: gpt-6-1-sol-review-pricing
translationKey: gpt-6-1-sol-review-pricing
locale: en
kind: article
title: GPT-6.1 Sol specs, long-context prices, and published comparisons
description: "Official specs, list prices below and above 272K input tokens, and the deltas and per-task costs printed for GPT-6.1 Sol. These figures come from OpenAI’s public pages, not a Folkbench measurement."
category: models
tags: [pricing, benchmarks, api]
authorId: iris-wu
modelIds: [gpt-6.1-sol, gpt-6-sol, gpt-6-astra, gpt-6-luna]
benchmarkSlugs: []
relatedSlugs: [claude-opus-5-5-review-pricing, claude-sonnet-5-5-review-pricing]
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: gpt-61-announcement
    label: OpenAI, GPT-6.1 Sol announcement
    url: https://openai.com/index/introducing-gpt-6-1-sol/
    checkedAt: '2026-10-02'
    claimScope: official
  - id: gpt-61-model
    label: OpenAI API, GPT-6.1 Sol model page
    url: https://developers.openai.com/api/docs/models/gpt-6.1-sol
    checkedAt: '2026-10-02'
    claimScope: official
  - id: openai-pricing
    label: OpenAI API pricing
    url: https://developers.openai.com/api/docs/pricing
    checkedAt: '2026-10-02'
    claimScope: official
  - id: gpt-61-system-card
    label: OpenAI, GPT-6.1 Sol system card addendum
    url: https://deploymentsafety.openai.com/gpt-6-1-sol
    checkedAt: '2026-10-02'
    claimScope: official
---

> Specs and prices below come from OpenAI’s model page and pricing table. The comparisons come from the announcement. They were checked on 2 October 2026. The announcement prints deltas and costs, not a table of absolute scores that can be copied out. Folkbench did not rerun these evaluations. “About one fifth of the cost” describes the vendor’s own test rig.

OpenAI describes GPT-6.1 Sol as an upgrade to `gpt-6-sol`. The API model ID is `gpt-6.1-sol`. The announcement says it comes close to `gpt-6-astra` on complex coding, computer use, and professional work, at one fifth of Astra’s standard input and output prices. Cached input is $0.10 per million tokens, 5% of standard input and half of `gpt-6-sol`’s cached-input price. For the hardest scientific research, the announcement still points to Astra. `gpt-6-sol` remains on the price table.

The GPT-6 Sol and Luna announcement points to this model in an update dated 29 September 2026. This article does not treat the date on a different news card in the footer as GPT-6.1 Sol’s own announcement date.

For the Claude list prices and benchmark tables, read [Opus 5.5](../claude-opus-5-5-review-pricing/) and [Sonnet 5.5](../claude-sonnet-5-5-review-pricing/).

## Published specifications

| Item | GPT-6.1 Sol |
| --- | --- |
| Model ID | `gpt-6.1-sol` |
| Context window | 1,050,000 tokens |
| Maximum input | 922,000 tokens |
| Maximum output | 128,000 tokens |
| Input to output | Text and images to text |
| Knowledge cutoff | 30 April 2026 |
| `reasoning.effort` | `low`, `medium` (default), `high`, `xhigh`, `max` |
| Efforts that are not accepted | `none`, `minimal` |
| Tool calling | Responses API |
| Chat Completions | Supported, without tools |
| Endpoints listed as supported | Chat Completions, Responses, Batch |
| Not supported on the model page | Realtime, Assistants, fine-tuning, embeddings, image generation, video, speech |
| Data residency | US and EU. Fast mode is not available with EU data residency |

The 922,000 maximum input matches the 1,050,000 context window minus the 128,000 maximum output: 1,050,000 − 128,000 = 922,000. The model page says reasoning tokens are supported. The passages cited here do not print a separate billing formula for them. Budget from the input, cache, and output on the usage record.

## List prices

### Short context and long context

Prices are US dollars per million tokens. Both tiers come from the API price table checked on 2 October 2026. That table says short context is input at or below 272K tokens, and long context is input above 272K tokens. The model page says that above 272K, input and cache are priced at 2× and output at 1.5×, for the whole request.

| Per 1M tokens | 6.1 short | 6.1 long | Sol short | Sol long | Astra short | Astra long |
| --- | --- | --- | --- | --- | --- | --- |
| Input | $2 | $4 | $2 | $4 | $10 | $20 |
| Cached input | $0.10 | $0.20 | $0.20 | $0.40 | $1 | $2 |
| Cache write | $2.50 | $5 | $2.50 | $5 | $12.50 | $25 |
| Output | $10 | $15 | $10 | $15 | $50 | $75 |

Input at or below 272K uses the short tier. Once a request goes above 272K, the earlier tokens are repriced at the long-tier rate as well. The extra tokens are not the only ones that change price. Cached input on 6.1 is half of Sol. Standard input and output are one fifth of Astra. Cached input is not one fifth of Astra: Astra’s short-context cached input is $1, and 6.1’s is $0.10.

A cache write is 1.25× uncached input, so the short tier is $2 × 1.25 = $2.50 and the long tier is $4 × 1.25 = $5. Long-tier output is 1.5× the short tier, $10 × 1.5 = $15.

### Other multipliers on the price table

The model page lists three more official multipliers. Fast mode is 2× standard. Batch and Flex are 50% below standard. Regional processing, where it is available, adds 10%. On the same day’s price table, Batch, Flex, and Fast each have a row, and the numbers match those multipliers. Fast mode for 6.1 at short context, for example, is $4 input, $0.20 cached input, $5 cache write, and $20 output.

The announcement also says Ultrafast would arrive in Codex in the following days, with token generation up to 8× the standard speed. The flagship price table read on 2 October 2026 has no separate Ultrafast model row. Whether an official multiplier is already on a given bill is a question for the usage record.

Three examples that can be recomputed on the standard tier. The first two rows stay on the short tier. The third row is 280,000 input tokens, so the whole request uses the long tier. The cache row assumes the usage record counts those input tokens as cache hits.

| Request | Arithmetic | Amount |
| --- | --- | --- |
| 100k uncached input, 5,000 output | 0.1 × $2 + 0.005 × $10 | $0.25 |
| 100k cached input, 5,000 output | 0.1 × $0.10 + 0.005 × $10 | $0.06 |
| 280k uncached input, 10,000 output | 0.28 × $4 + 0.01 × $15 | $1.27 |

Pricing those 280,000 tokens at the short-tier rate would give 0.28 × $2 + 0.01 × $10 = $0.66. That is not this tier. Fast, Batch, Flex, and the regional uplift are not applied in these three rows.

## How to read the announcement comparisons

The announcement prints deltas and costs, not a table of absolute scores. The rows below keep only comparisons the page states. The cost sentences describe OpenAI’s test rig.

| Evaluation | What the announcement states | Conditions |
| --- | --- | --- |
| DeepSWE v1.1 | Matches Astra; 6.4 percentage points above Sol’s best score | Lower reasoning effort, at about one fifth of the cost |
| GDP.pdf | Above Opus 5.5 with fallbacks; close to Astra | Tested reasoning settings; less than half the cost of Opus, about one fifth the cost of Astra |
| AutomationBench | 2.2 percentage points above Opus 5.5; 4.8 percentage points above Sol at the same setting | medium; about one third the cost of Opus |
| OSWorld 2.0 offline set | 7 percentage points above Sol; within 2.1 percentage points of Astra | max; partial reward, v2026.08.08; less than half the cost of Sol, about one seventh the cost of Astra |
| Terminal-Bench Science 0.1 | More than doubles Sol’s score; Astra remains the highest score among the models tested, at 68.1% | max; 6.1 averages $5.47 per task, Opus 5.5 $23.21, Astra $23.80 |
| Factuality | Share of answers with at least one factual error falls from 11.4% to 7.7% | low; within 1.9 percentage points of Astra |

The factuality sample is de-identified conversations where a user had flagged an earlier error. The announcement says these prompts are chosen to be hard and do not represent ordinary traffic. The Terminal-Bench Science dollars are OpenAI’s published average cost per task, not a relay group price. The highest scientific score among the models tested is still Astra at 68.1%, and the announcement says the hardest scientific research should stay on Astra.

The same page also prints failure rates from alignment tests that are built to be hard. When the search tool is already broken, the share of max-effort runs that do not tell the user is 2.1% for 6.1, 4.9% for Sol, 1.5% for Astra, and 28.7% for Luna. The announcement says it observed no attempt to bypass an automated safety reviewer, matching Astra and Sol. The detail is in the GPT-6.1 Sol system card addendum. These failure rates are not failure rates on ordinary traffic.

The announcement also says the evaluations ran in a research environment or through the API, which can differ from production ChatGPT in system prompt and tools. Competitor figures are taken from public reports.

## Two request paths to keep apart

Tool calls use Responses. The default effort is already `medium`. The model page says Chat Completions can carry text without tools.

```text
# Responses
model: gpt-6.1-sol
reasoning.effort: medium

# Chat Completions, without tools
model: gpt-6.1-sol
reasoning_effort: medium

# Not accepted on the model page
reasoning.effort: none
reasoning.effort: minimal
tools on a Chat Completions request
```

When moving from `gpt-6-sol` or `gpt-6-luna`, which accept `none`, compare again at `low`. Do not leave `none` on the request. Tools, computer use, file search, and web search go through Responses. Chat Completions carries requests that have no tools. The Responses tools listed on the model page include web search, file search, the code interpreter, computer use, and MCP. Image input uses a content array on the user message.

Short-tier input and output match `gpt-6-sol`. Cached input falls from $0.20 to $0.10. Long-tier output is $15 on both, and long-tier cached input falls from $0.40 to $0.20. When switching to 6.1, pin the model name on the completed result. A completion that lands on another ID is not this switch.

## Checks before moving traffic

1. Pin `gpt-6.1-sol`. The model name on the completed result has to be that ID as well.
2. Replay one set that contains no sensitive data at `low`, `medium`, `high`, `xhigh`, and `max`. `none` and `minimal` are not on this card.
3. Put tools on Responses. Leave tools off the Chat Completions request.
4. Price one prompt at or below 272K input tokens and one above 272K. The second uses the long-tier rate for the whole request.
5. Budget from the two standard rows first. Fast, Batch, Flex, and the regional uplift are whatever amount the usage record actually shows.
6. Read the cache tokens on the usage record before using the cache example above.
7. EU data residency cannot be combined with Fast mode. The model page says US and EU residency are supported. It does not describe residency as a parameter that can be added on an arbitrary gateway.
8. Keep the hardest scientific research on `gpt-6-astra`. `gpt-6-sol` is still on the price table.

After the model is chosen, whether a relay offers this ID, and that relay’s published availability and price, come from the directory record. The tables in this article are OpenAI list prices, not a station’s price after a group multiplier.
