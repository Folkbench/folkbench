---
slug: claude-sonnet-5-5-review-pricing
translationKey: claude-sonnet-5-5-review-pricing
locale: en
kind: article
title: Claude Sonnet 5.5 specs, list prices, and published benchmarks
description: "Official specs, the Sonnet 5 list price, and the published benchmark table for Claude Sonnet 5.5, plus the requests that return 400 on migration. These figures are not a Folkbench measurement."
category: models
tags: [pricing, benchmarks, api]
authorId: iris-wu
modelIds: [claude-sonnet-5-5, claude-sonnet-5, claude-opus-5-5, gpt-6-sol]
benchmarkSlugs: []
relatedSlugs: [claude-opus-5-5-review-pricing, gpt-6-1-sol-review-pricing]
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: sonnet-55-announcement
    label: Anthropic, Claude Sonnet 5.5 announcement
    url: https://www.anthropic.com/claude-sonnet-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-55-overview
    label: Claude Platform, Sonnet 5.5 model page
    url: https://platform.claude.com/docs/en/models/sonnet-5-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-55-whats-new
    label: Claude Platform, what is new in Sonnet 5.5
    url: https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-55-migration
    label: Claude Platform, migrating to Sonnet 5.5
    url: https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-5-overview
    label: Claude Platform, Sonnet 5 model page
    url: https://platform.claude.com/docs/en/models/sonnet-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
---

> Specs, list prices, and scores below are copied from Anthropic’s public pages. They were checked on 2 October 2026. Folkbench did not rerun these benchmarks. Sentences such as “up to 30% less” and “more than 30% faster” describe the vendor’s own test rig.

Claude Sonnet 5.5 was announced on 28 September 2026. It is the second model in the Claude 5.5 family. The Claude API model ID is `claude-sonnet-5-5`. Anthropic places it next to [Opus 5.5](../claude-opus-5-5-review-pricing/): well-scoped everyday tasks, bug fixes, and documents, slides, and spreadsheets use this card; complex, open-ended work that needs sustained judgment remains, on the announcement’s own wording, stronger on Opus 5.5. The list price matches Sonnet 5: $2 per million input tokens, $10 per million output tokens, and $0.20 per million tokens for cache reads.

Both announcements say Haiku 5.5 follows in the coming weeks. This article does not price an ID that is not yet on a price table.

## Published specifications

| Item | Claude Sonnet 5.5 |
| --- | --- |
| Claude API model ID | `claude-sonnet-5-5` |
| Announcement date | 28 September 2026 |
| Context / synchronous max output | 1M / 128K tokens |
| Input to output | Text and images to text |
| Thinking | Adaptive, on by default |
| Default effort on the Claude API | `high` |
| Default effort in the Claude apps and Claude Code | `medium` |
| Effort values | `low`, `medium`, `high`, `xhigh`, `max` |
| Latency band on the model page | Fast. That is a comparison inside the current Claude lineup, not a tokens-per-second measurement |
| Reliable knowledge cutoff | June 2026 |
| Minimum cacheable prompt | 512 tokens |
| Tokenizer | The same as Sonnet 5, so the same text has the same token count |

The Sonnet 5 model page still marks that model legacy and available, still lists $2 / $10 for input and output, and lists a reliable knowledge cutoff of January 2026. Its retirement commitment is not sooner than 30 June 2027. The Sonnet 5.5 what’s-new page recommends moving to 5.5.

The lowest setting that turns off up-front thinking is `thinking: {"type": "between_tools"}`. It is accepted only at `low`, `medium`, and `high`. `xhigh` and `max` go back to adaptive thinking. The migration guide says a non-default `temperature`, `top_p`, or `top_k` returns 400.

## List prices

Prices are US dollars per million tokens. The Sonnet 5.5 column comes from the model page. Opus 5.5 input, output, and cache reads come from the comparison table on the same announcement. The what’s-new page says Sonnet 5.5 keeps Sonnet 5’s prices, including prompt caching and batch. The batch discount is 50% on input and output.

| Per 1M tokens | Sonnet 5.5 | Opus 5.5 on the announcement |
| --- | --- | --- |
| Input | $2 | $4 |
| Output | $10 | $20 |
| Cache read | $0.20 | $0.20 |
| Cache write | 5-minute $2.50; 1-hour $4 | Printed as one $5 on the announcement; the what’s-new page splits Opus 5.5 into 5-minute $5 and 1-hour $8 |
| Batch input / output | 50% of list price | Not on that announcement comparison |

Input and output are half of Opus 5.5. Cache reads are $0.20 on both. The announcement prints Opus 5.5’s cache write as one $5 and does not split the 5-minute and 1-hour tiers. The Sonnet 5.5 model page splits its own two tiers.

Anthropic also states two workload claims: the same work usually takes fewer tokens, and most tasks cost up to 30% less; output generation is more than 30% faster than Sonnet 5. The cost charts add per-task comparisons at about one tenth, one fifth, one fifteenth, and one ninth. Those are results inside their test rig. A real bill still depends on effort, cache hits, tool rounds, and whether the call uses batch.

Three examples that can be recomputed from the list price. Each shape is 100,000 input tokens of the named class plus 5,000 output tokens.

| Request | Arithmetic | Amount |
| --- | --- | --- |
| 100k uncached input, 5,000 output | 0.1 × $2 + 0.005 × $10 | $0.25 |
| 100k cache read, 5,000 output | 0.1 × $0.20 + 0.005 × $10 | $0.07 |
| 100k 5-minute cache write, 5,000 output | 0.1 × $2.50 + 0.005 × $10 | $0.30 |

The third row uses the 5-minute write price, not the 1-hour price of $4. A 1-hour write is 0.1 × $4 + 0.005 × $10 = $0.45.

## How to read the announcement benchmarks

The table below is the one printed on the announcement as checked on 2 October 2026. A dash is an empty cell on that page. The Terminal-Bench 4.0 and CursorBench 4.0 cost charts use GPT-5.6 Sol because OpenAI did not publish those two scores for GPT-6 Sol. This article does not fill the GPT-6 Sol column with the GPT-5.6 Sol points from the charts.

| Benchmark | Sonnet 5.5 | Sonnet 5 | Opus 5.5 | GPT-6 Sol |
| --- | --- | --- | --- | --- |
| Terminal-Bench 4.0 | 70.6% | 10.3% | 66.4% | — |
| FrontierCode v1.1 (Main) | 46.2% (max); 52.1% (xhigh) | 42.4% | 54.4% | 49.3% |
| CursorBench 4.0 | 55.5% | 34.1% | 57.8% | — |
| GDPval-AA v2.1 | 1844 | 1449 | 1846 | 1487 |
| AA-Briefcase v1.1 | 1811 | 1359 | 1822 | 1483 |
| Humanity's Last Exam, with tools | 64.5% | 54.9% | 67.7% | — |
| OSWorld 2.1, partial | 80.1% | 57.0% | 81.8% | — |
| Chartography, no tools | 61.6% | 15.6% | 64.4% | 53.6% |

This Chartography row is the no-tools score. The Chartography row on the Opus 5.5 announcement is a with-tools measurement, where Opus 5.5 is 89.0%. Those two cells are not the same run.

Read the footnotes with the scores. Opus 5.5’s Terminal-Bench 4.0 cell is xhigh, which the announcement calls that model’s highest score. On FrontierCode, Sonnet 5.5 at max is below xhigh. The announcement’s explanation is that max more often ran a code-review pass split across subagents, and in cases Cognition examined that led to a timeout or to edits outside the task. The eval penalizes out-of-scope edits.

Artificial Analysis ran GDPval-AA and AA-Briefcase on a pre-release deployment. That deployment had a bug that could weaken structured outputs. The announcement says the bug was later fixed and that any effect would understate Sonnet 5.5. The GPT-6 Sol cells for GDPval-AA, AA-Briefcase, and Chartography carry a second note: OpenAI had fixed a bug that hurt image understanding, and those external scores may not yet reflect the newer model.

The cost charts on the same page are a different reading. Medium effort is the default in the Claude apps. On several benchmarks, Sonnet 5.5 at Low or Medium beats Sonnet 5’s best score at about one tenth of the cost per task. High effort is the default on the Claude Platform. The announcement says FrontierCode at High is about 10 points above Sonnet 5 at the same setting, at about one fifteenth of the cost per task, and matches GPT-6 Sol’s best score at about one fifth of the cost. CursorBench at Low beats Sonnet 5’s best score at less than one tenth of the cost. AA-Briefcase at Medium beats Sonnet 5’s best score at about one ninth of the cost.

The printed 55.5% and 1844 are points on the table. The cost sentences come from another rig. The announcement also says that, in Anthropic’s own use and in external testing, Opus 5.5 remains stronger at complex, open-ended work that needs sustained judgment. Customer quotes are selected testimony and are not part of the table. The announcement also says this is the first Sonnet to finish Pokémon Red from screenshots alone. That is a product narrative, not a row in the table.

## Moving from Sonnet 5

The what’s-new page lists five changes that make code written for Sonnet 5 return 400. Other requests still succeed while the response shape changes.

```text
model: claude-sonnet-5-5
max_tokens: 1024
thinking: {"type": "adaptive"}
output_config.effort: medium
# 400: thinking type disabled
# 400: thinking type enabled with budget_tokens
# 400: thinking type between_tools at effort xhigh or max
# 400: tool_choice any, or tool_choice tool
# 400: non-default temperature, top_p, or top_k
# 400, Claude API and Google Cloud only: tool type computer_20251124
# 400: advisor tool using Opus 4.8, Opus 4.7, or Sonnet 5 as the advisor
```

To turn off up-front thinking, send `between_tools` and keep effort at `high` or below. `between_tools` cannot also carry `display`, `budget_tokens`, or `block_binding`. Keep `tool_choice` at `auto` or `none`. For schema-valid tool arguments, turn on strict tool use or use structured outputs, and say in the prompt when a tool applies.

Computer use on the Claude API and Google Cloud moves to `computer_toolset_20260801`. The what’s-new page says Amazon Bedrock still accepts `computer_20251124`.

The advisor tool accepts Mythos 5.1, Fable 5.1, Mythos 5, Fable 5, Opus 5.5, Opus 5, or Sonnet 5.5 itself. Opus 4.8, Opus 4.7, and Sonnet 5 can advise a Sonnet 5 executor. They cannot advise a Sonnet 5.5 executor. Advisor content comes back encrypted, and the client cannot read the text.

There is one more 400 for accounts created on or after 31 August 2026 at 00:00 UTC, on the Claude API, Amazon Bedrock, and Google Cloud. Replaying a Sonnet 5.5 thinking block fails if the system prompt, the tool list, or an earlier message changed after the block was produced. Keep the conversation append-only. When instructions must change, use a mid-conversation system message.

When effort is omitted, the API runs at `high`. The same word does not buy the same amount of thinking as on Sonnet 5. The what’s-new page says to run a fresh effort sweep instead of copying the old setting. A well-scoped tool loop can start at `medium` and move to `high` when the task is longer or harder. A latency-sensitive conversation starts at `medium` or `low`. The Claude apps and Claude Code already default to `medium`. The Claude Platform defaults to `high`.

Progress text longer than a sentence or two between tool calls comes back inside thinking blocks. At the default display value `omitted`, those blocks have empty text, so the UI goes quiet between tools while the request still succeeds. With `between_tools`, that text returns as a summary in the thinking block, and a replay shows the model the full note.

A thinking block records the model that produced it. The what’s-new page says Sonnet 5.5 reads thinking blocks from Sonnet 5, Opus 4.8, Haiku 4.5, and earlier models, and does not read blocks from Opus 5, Opus 5.5, Fable, or Mythos. On the Claude API and Google Cloud, Opus 5.5 can read Sonnet 5.5 thinking blocks, and no other current model can. A block the target model cannot read is dropped before the model sees it. The request still succeeds, and dropped blocks are not billed.

A refused request returns HTTP 200 with `stop_reason` `"refusal"`. The announcement says cybersecurity capability is close to Opus 5, so this is the first Sonnet launched with that class of cyber safeguard. Higher-risk cybersecurity tasks fall back to Sonnet 5. Biology safeguards match Sonnet 5. Routine software development and most life-sciences work sit outside those two narrow safeguards. The announcement also says Sonnet 5.5 can be offered with zero data retention.

## Checks before moving traffic

1. Pin `claude-sonnet-5-5`. Also check the model name on the completed result. When the cyber safeguard falls back, the answering model can be Sonnet 5.
2. Replay one set that contains no sensitive data at `low`, `medium`, `high`, `xhigh`, and `max`. Record success, latency, input, cache reads, cache writes, output, and cost.
3. Put effort in `output_config.effort`. Do not set this model’s thinking depth with a manual `budget_tokens` budget.
4. Change clients that send `disabled`, forced tool choice, sampling parameters, or `computer_20251124` before raising volume. The older computer tool on Bedrock is the exception.
5. Keep conversations that replay thinking blocks append-only.
6. Count HTTP 200 refusals separately from transport failures.
7. Check the billed amount with one short prompt and one prompt that should hit the cache. The 5-minute write, the 1-hour write, and the 50% batch discount are different price cards.
8. Keep complex, open-ended work that needs sustained judgment on `claude-opus-5-5`. The Sonnet 5 model page still marks `claude-sonnet-5` available. For OpenAI’s price tiers, read [GPT-6.1 Sol](../gpt-6-1-sol-review-pricing/).

After the model is chosen, whether a relay offers this ID, and that relay’s published availability and price, come from the directory record. This article does not compare stations.
