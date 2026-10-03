---
slug: claude-opus-5-5-review-pricing
translationKey: claude-opus-5-5-review-pricing
locale: en
kind: article
title: Claude Opus 5.5 specs, list prices, and published benchmarks
description: "Official specs, list prices, and the published benchmark table for Claude Opus 5.5, plus the requests that return 400 on migration. These figures come from vendor pages, not a Folkbench measurement."
category: models
tags: [pricing, benchmarks, api]
authorId: iris-wu
modelIds: [claude-opus-5-5, claude-opus-5, claude-fable-5-1, claude-sonnet-5-5, gpt-6-astra, gpt-5.6-sol]
benchmarkSlugs: []
relatedSlugs: [claude-sonnet-5-5-review-pricing, gpt-6-1-sol-review-pricing]
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: opus-55-announcement
    label: Anthropic, Claude Opus 5.5 announcement
    url: https://www.anthropic.com/claude-opus-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: opus-55-overview
    label: Claude Platform, Opus 5.5 model page
    url: https://platform.claude.com/docs/en/models/opus-5-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
  - id: opus-55-whats-new
    label: Claude Platform, what is new in Opus 5.5
    url: https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-5-overview
    label: Claude Platform, Sonnet 5 model page
    url: https://platform.claude.com/docs/en/models/sonnet-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
---

> Specs, list prices, and scores below are copied from Anthropic or from the public pages it cites. They were checked on 2 October 2026. Folkbench did not rerun these benchmarks. Sentences such as “about 40% less” and “about one fifth of the cost” describe the vendor’s own test rig.

Claude Opus 5.5 was announced on 22 September 2026. It is the first model in the Claude 5.5 family. The Claude API model ID is `claude-opus-5-5`. The model page lists a 1M-token context window, 128K maximum output, adaptive thinking that stays on, a default effort of `medium`, and a list price of $4 per million input tokens and $20 per million output tokens. The public pages do not give a parameter count or a training-compute figure.

Three checks from the same pages are enough to place it. The list price is below Opus 5, and well below Fable 5.1 at $10 / $50. On the coding and knowledge-work rows printed on the announcement, Opus 5.5 leads Fable 5.1 and Opus 5, and it leads GPT-6 Astra on most of those rows. Two rows point the other way: Astra’s point estimate leads Terminal-Bench-Science 0.1 and Zapier’s AutomationBench. For well-scoped everyday work, read [Claude Sonnet 5.5](../claude-sonnet-5-5-review-pricing/). For OpenAI’s long-context price tiers, read [GPT-6.1 Sol](../gpt-6-1-sol-review-pricing/).

## Published specifications

| Item | Claude Opus 5.5 |
| --- | --- |
| Claude API model ID | `claude-opus-5-5` |
| Announcement date | 22 September 2026 |
| Context window | 1M tokens |
| Max output | 128K tokens |
| Batch API max output | 300K tokens, beta header `output-300k-2026-03-24` |
| Input to output | Text and images to text |
| Thinking | Adaptive, always on |
| Default effort | `medium` |
| Effort values | `low`, `medium`, `high`, `xhigh`, `max` |
| Latency band on the model page | Moderate |
| Reliable knowledge cutoff | June 2026 |
| Minimum cacheable prompt | 512 tokens |
| Parameter count | Not on the public model page |

The reliable knowledge cutoff is the date through which the model’s built-in knowledge is described as strongest. It is not the context window. Files attached to a request are still inside that request’s context.

Fast mode is a speed switch on the same model ID. The what’s-new page calls it a research preview available only on the Claude API. A request sets `speed: "fast"` and sends the beta header `fast-mode-2026-02-01`. The announcement prices it at $8 / $40 per million tokens and describes output speed up to about 2.5×. It says Claude Code and the Claude Platform can use it. The what’s-new page says Amazon Bedrock, Claude Platform on AWS, Google Cloud, and Microsoft Foundry do not offer this fast mode.

A hand-set thinking budget is rejected. Effort is the control for thinking depth.

## List prices

Prices are US dollars per million tokens. The 5-minute cache write, 1-hour cache write, and batch prices for Opus 5.5 come from the what’s-new page. Opus 5’s cache write is the single “cache writes” cell on the announcement comparison, which does not split the 5-minute and 1-hour tiers. Input and output prices for Fable 5.1, Sonnet 5.5, and Haiku 4.5 come from the model-page comparison. Sonnet 5 is still marked legacy, and its model page lists the same input and output prices as Sonnet 5.5. A dash means this article did not take that cell from a primary price row.

| Per 1M tokens | Opus 5.5 | Opus 5 | Fable 5.1 | Sonnet 5.5 | Haiku 4.5 |
| --- | --- | --- | --- | --- | --- |
| Input | $4 | $5 | $10 | $2 | $1 |
| Output | $20 | $25 | $50 | $10 | $5 |
| Cache read | $0.20 | $0.50 | — | $0.20 | — |
| Cache write | 5-minute $5; 1-hour $8 | $6.25 | — | 5-minute $2.50; 1-hour $4 | — |
| Batch input / output | $2 / $10 | — | — | 50% of list price | — |
| Fast mode input / output | $8 / $40 | — | — | — | — |

Fresh input and output are 20% below Opus 5, from $5 / $25 to $4 / $20. The announcement describes cache reads as falling from $0.50 to $0.20, and says those reads are most of the bill for agent and coding work. Anthropic also states a workload claim: at default settings, a typical task costs about 40% less than Opus 5 because the model also uses fewer tokens. That 40% describes their own test rig. A real bill still depends on effort, cache hits, tool rounds, and whether the call uses batch or fast mode.

Batch processing is half the new list price. Fast mode is twice the new list price, and the what’s-new page limits it to the Claude API.

Three examples that can be recomputed from the list price. Each shape is 100,000 input tokens of the named class plus 5,000 output tokens. The cache row assumes the usage record actually counts those tokens as reads.

| Request | Arithmetic | Amount |
| --- | --- | --- |
| 100k uncached input, 5,000 output | 0.1 × $4 + 0.005 × $20 | $0.50 |
| 100k cache read, 5,000 output | 0.1 × $0.20 + 0.005 × $20 | $0.12 |
| 100k 5-minute cache write, 5,000 output | 0.1 × $5 + 0.005 × $20 | $0.60 |

A 1-hour cache write uses $8, not the $5 above. A relay or cloud marketplace price is not in this table.

## What changes from Opus 5 and Fable 5.1

| Behavior | Opus 5.5 | Opus 5 | Fable 5.1 |
| --- | --- | --- | --- |
| API ID | `claude-opus-5-5` | `claude-opus-5` | `claude-fable-5-1` |
| Context / max output | 1M / 128K | 1M / 128K | 1M / 128K |
| Thinking | Always on. `disabled` and a manual budget return 400 | On by default. `disabled` is accepted at effort `high` or lower | Model page says always on |
| Default when effort is omitted | `medium` | `high` | `high` |
| Reliable knowledge cutoff | June 2026 | Not separately cited here | June 2026 |
| List input / output | $4 / $20 | $5 / $25 | $10 / $50 |
| Cache read | $0.20 | $0.50 | — |

The what’s-new page groups four changes that make code written for Opus 5 fail. The first three also apply to Fable 5.1. Replacing only the model string still hits them.

```text
model: claude-opus-5-5
thinking: {"type": "adaptive"}
tool_choice: {"type": "auto"}
output_config.effort: medium
# 400: thinking type disabled, or enabled with budget_tokens
# 400: tool_choice any, or tool_choice tool
# 400, Claude API and Google Cloud only: tool type computer_20251124
```

Omit `thinking`, or send `adaptive`. Those are equivalent. `tool_choice` values `auto` and `none` still work, including on the token-counting endpoint. For schema-valid JSON, the what’s-new page points to strict tool use or structured outputs, and to saying in the prompt when a tool applies.

On the Claude API and Google Cloud, replace `computer_20251124` with `computer_toolset_20260801` and drop the old computer-use beta header. The what’s-new page says Opus 5.5 on Amazon Bedrock still accepts `computer_20251124`. An integration that already uses the newer toolset does not need a code change for this break.

The fourth 400 is about thinking-block binding. For accounts created on or after 31 August 2026 at 00:00 UTC, on the Claude API and on cloud platforms, replaying an Opus 5.5 thinking block returns 400 if the system prompt, tool list, or an earlier message changed after that block was produced. The documented approach is append-only history. When instructions must change, use a mid-conversation system message. Older accounts opt into the same check explicitly.

Three behaviors change even when the request succeeds. Omitting effort now runs at `medium`. The same omission ran at `high` on Opus 5. At a matched effort, Opus 5.5 tends to think more per turn than Opus 5, most of all at `xhigh` and `max`. An effort value copied from an old configuration is a new cost point, and `max_tokens` has to leave room for thinking blocks.

Text written between tool calls comes back inside thinking blocks. At the default display value `omitted`, those blocks have empty text. A UI that used to stream that text as progress goes quiet, while the request still succeeds. A product that needs the progress lines sets a display value and selects blocks by `type`, not by position.

A biology classifier runs alongside the cybersecurity classifier. A prompt that pushes the model to copy its reasoning into the visible answer can be refused as `reasoning_extraction`. The what’s-new page also says charts and screenshots are read more accurately before a vision tool is added, so prompts written to compensate for weaker image reading are worth replaying on their own.

A refused request returns HTTP 200 with `stop_reason` `"refusal"`. That is not a transport failure. Whether it is billed depends on the refusal category, and it still counts against rate limits.

## How to read the announcement benchmarks

The table below is the one printed on the announcement as checked on 2 October 2026. Unless a footnote says otherwise, Opus 5.5 uses adaptive thinking at max effort. Terminal-Bench 4.0 is that footnote: Opus 5.5 is at `xhigh`, GPT-6 Astra is at `high`, and each cell is that model’s highest published score. Astra and GPT-5.6 Sol figures are cited from OpenAI’s reports. Production safeguards were on. When they intervened, cybersecurity tasks were completed by Opus 4.8, and biology and frontier-LLM development tasks were completed by Opus 5. Anthropic says this lowers Opus 5.5’s scores.

| Benchmark | Opus 5.5 | Fable 5.1 | Opus 5 | GPT-6 Astra | GPT-5.6 Sol |
| --- | --- | --- | --- | --- | --- |
| Terminal-Bench 4.0 | 66.4% | 55.8% | 52.3% | 57.9% | 37.3% |
| FrontierCode v1.1 (Main) | 54.4% | 50.3% | 48.0% | 53.3% | 47.5% |
| CursorBench 4.0 | 57.8% | 51.8% | 46.6% | — | 41.7% |
| GDPval-AA v2.1 | 1846 | 1735 | 1708 | 1542 | 1588 |
| AutomationBench | 40.0% | 31.4% | 26.9% | 41.4% | 28.8% |
| Humanity's Last Exam, with tools | 67.7% | 65.6% | 63.6% | 57.2% | — |
| Terminal-Bench-Science 0.1 | 58.7% | 52.6% | 29.0% | 64.6% | 22.4% |
| OSWorld 2.1, partial | 81.8% | 80.7% | 74.0% | — | — |
| Chartography, with tools | 89.0% | 88.4% | 83.4% | — | — |

Read the gaps next to the published errors. On Terminal-Bench 4.0, Opus 5.5 is ±2.6 points and the other Claude models are ±1.6 to ±2 points. The gap from 66.4% to Astra’s 57.9%, and to Fable’s 55.8%, is wider than those errors. The same footnote says the public leaderboard lists Opus 5 at 51.8%, and their setup reproduces 52.3%, within noise.

Terminal-Bench-Science is ±3.5 to ±5 points per model. Astra’s 64.6% against Opus 5.5’s 58.7% is close to the width of those errors. The point estimate has Astra ahead. The public leaderboard lists Opus 5 at 30.0%, and their setup reproduces 29.0%.

AutomationBench is run by Zapier. Because that run had no fallback model, a safeguard intervention counted as a failure. Anthropic says the practical score would be higher. The printed 40.0% against Astra’s 41.4% is a close published result, and the point estimate has Astra ahead. GDPval-AA v2.1 is an Elo over real professional tasks in 44 occupations: Opus 5.5 at 1846, Fable 5.1 at 1735, Opus 5 at 1708, Sol at 1588, and Astra at 1542.

The cost charts on the same page print a second pair of scores at the default effort `medium`: FrontierCode 54.6% and CursorBench 52.5%. The comparison table prints 54.4% and 57.8%. Treat them as two numbers at two effort settings. The chart note also says that, at medium effort, FrontierCode beats Astra’s top score of 53.3% at about one fifth of the cost per task, and Terminal-Bench matches Astra at about 40% of the cost. Those are per-task cost claims about Anthropic’s own rig.

The sentence under the table is the one to keep: in Anthropic’s own use, the gap between Opus 5.5 and Fable 5.1 is narrower than the scores suggest, and benchmark margins at this level are a weaker guide to real tasks. Customer quotes on the announcement are selected testimony. They can suggest what to replay. They are not part of the table.

## Checks before moving traffic

1. Pin `claude-opus-5-5`. Also check the model name on the completed result. When safeguards intervene, a cybersecurity task may be completed by Opus 4.8, and a biology or frontier-LLM development task may be completed by Opus 5. The requested model in the log can still read `claude-opus-5-5`.
2. Replay one set that contains no sensitive data at `low`, `medium`, `high`, `xhigh`, and `max`. Record success, wall time, input, cache reads, cache writes, output, and cost.
3. Do not send `thinking: {"type": "disabled"}` or a manual budget with `budget_tokens`. Set effort explicitly. Omitting it runs at `medium` here, not at Opus 5’s `high`.
4. Use only `auto` or `none` for `tool_choice`. On the Claude API and Google Cloud, computer use moves to `computer_toolset_20260801`.
5. Keep conversations that replay thinking blocks append-only. Accounts created on or after 31 August 2026 receive a 400 if the prefix before an Opus 5.5 thinking block changes.
6. Count HTTP 200 refusals separately from transport failures.
7. Check the billed amount with one short prompt and one prompt that should hit the cache. The 5-minute write, the 1-hour write, batch, and fast mode are four different price cards.
8. For well-scoped work that does not need this Opus loop, stay with the $2 / $10 card on [Sonnet 5.5](../claude-sonnet-5-5-review-pricing/). On scientific agent tasks and Zapier’s business workflows, the printed point estimates have Astra ahead.

After the model is chosen, whether a relay offers this ID, and that relay’s published availability and price, come from the directory record. This article does not compare stations, and it does not turn a vendor list price into a station’s charged price.
