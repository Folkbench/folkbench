---
slug: claude-haiku-5-5-official-scorecard
translationKey: claude-haiku-5-5-official-scorecard
locale: en
kind: article
title: "How Strong Is Haiku 5.5, Really? On the Official Scorecard, First Place Is Not the Part Worth Reading"
description: "Claude Haiku 5.5’s official scores are out. Set beside Haiku 4.5, GPT-6 Luna, and Sonnet 5.5, the useful question is not whether it won every cell, but how far it moved the boundary of a small model. These figures come from Anthropic’s announcement, not a Folkbench measurement."
category: Models
tags: [benchmarks, pricing, models]
authorId: iris-wu
modelIds: [claude-haiku-5-5, claude-haiku-4-5, claude-sonnet-5-5, claude-opus-5-5]
benchmarkSlugs: []
relatedSlugs: [claude-sonnet-5-5-review-pricing, claude-opus-5-5-review-pricing, gpt-6-1-sol-review-pricing]
publishedAt: '2026-10-09'
updatedAt: '2026-10-09'
sources:
  - id: haiku-55-announcement
    label: Anthropic, Introducing Claude Haiku 5.5
    url: https://www.anthropic.com/claude-haiku-5-5
    checkedAt: '2026-10-09'
    claimScope: official
  - id: claude-models-overview
    label: Claude Platform Docs, Models overview
    url: https://platform.claude.com/docs/en/models/overview
    checkedAt: '2026-10-09'
    claimScope: official
---

# How Strong Is Haiku 5.5, Really? On the Official Scorecard, First Place Is Not the Part Worth Reading

> Claude Haiku 5.5’s official scores are out. Set them beside Haiku 4.5, GPT-6 Luna, and Sonnet 5.5, and the question worth discussing is not whether it won every item. It is how far Haiku 5.5 pushed the boundary of what a small model can do.

One name needs correcting first. The model Anthropic released is **Claude Haiku 5.5**, not “Claude Hiya 5.5”. The model ID is `claude-haiku-5-5`. It was released on 7 October 2026.

Anthropic’s placement is direct. Haiku 5.5 is its fastest, cheapest, and most capable small model, aimed at high-volume, low-latency, cost-sensitive work. The typical uses it names are classification, information extraction, summarization, context compaction, database queries, browser use, and serving as a subagent for Sonnet 5.5 or Opus 5.5.

This article uses only the benchmarks, prices, and product statements Anthropic published. It does not repackage that scorecard as an independent experiment. The job here is to put the numbers back into task type, price, and model role, and to see where Haiku 5.5 is actually strong, and which work still should not be handed to it.

## The short version: Haiku 5.5 has crossed the line where a small model only does simple work

Put the official numbers together and the shape of Haiku 5.5 is clear:

- Against Haiku 4.5, it is sharply higher on every major benchmark Anthropic published;
- On the items reported side by side, it is ahead of GPT-6 Luna;
- On knowledge work, computer use, and some reasoning tasks, it is already close to Sonnet 5.5;
- On complex agentic coding, it is still clearly behind Sonnet 5.5;
- Where it is most competitive is the combination of speed, price, and a task-completion rate that is now high enough.

Haiku 5.5 is better read as an execution layer whose capability jumped, not as a model that replaces Sonnet 5.5 across the board.

## The official benchmark comparison

Anthropic published the following numbers on the Haiku 5.5 announcement. The GPT-6 Luna and Sonnet 5.5 cells come from the same comparison table.

| Benchmark | Haiku 5.5 | Haiku 4.5 | GPT-6 Luna | Sonnet 5.5 |
|---|---:|---:|---:|---:|
| GDPval-AA v2.1: knowledge work | 1620 | 735 | 1437 | 1840 |
| AA-Briefcase v1.1: knowledge work | 1578 | 614 | 1336 | 1824 |
| OSWorld 2.1: computer use | 72.4% | 15.7% | 48.9% | 83.9% |
| Humanity's Last Exam: no tools | 45.9% | 10.2% | — | 56.9% |
| Humanity's Last Exam: with tools | 57.4% | 18.7% | — | 64.5% |
| Terminal-Bench 4.0: agentic coding | 39.2% | 0.0% | 16.4% | 70.6% |
| FrontierCode 1.1: agentic coding | 46.4% | — | 42.4% | 52.1% |
| Chartography: visual reasoning | 46.4% | 6.4% | 29.1% | 61.6% |

![Official comparison: scores for Haiku 5.5, Haiku 4.5, GPT-6 Luna, and Sonnet 5.5 on eight benchmarks. The upper rows use a 0 to 2,000 scale. The lower rows use 0% to 100%.](/blog/figures/claude-haiku-5-5-official-scorecard/scores.svg)

These numbers do not compress cleanly into “Haiku 5.5 ranks second”. The benchmarks measure different abilities. Knowledge work cares about the quality of what gets delivered. OSWorld cares about whether the model can operate a real computer. Terminal-Bench cares about whether it can finish multi-step professional work in a command line. Humanity’s Last Exam leans toward hard knowledge and reasoning.

A wide spread across tasks is itself part of the result.

## Change one: Haiku 5.5 left the previous generation behind

Look only at Haiku 4.5 and Haiku 5.5, and the size of the upgrade is obvious.

GDPval-AA v2.1 moves from 735 to 1620, about 2.2 times the previous generation. AA-Briefcase moves from 614 to 1578, about 2.6 times. OSWorld moves from 15.7% to 72.4%. Terminal-Bench moves from 0.0% to 39.2%.

![Official scores for Haiku 4.5 and Haiku 5.5. In each row, the bars are scaled so that Haiku 5.5 fills the row.](/blog/figures/claude-haiku-5-5-official-scorecard/generation.svg)

This is not a “the wording got prettier” change. OSWorld and Terminal-Bench both involve long chains of action. The model has to understand the task, call tools, handle feedback, and keep going after a mistake in the middle. The gain on those tests says Haiku 5.5 is no longer only a model for short classification and summaries.

OSWorld is the sharpest example. There is a clear break between Haiku 4.5 at 15.7% and Haiku 5.5 at 72.4%. Even after allowing for the benchmark setup, the offline subset, and Anthropic’s test conditions, the result still says computer use changed by a full generation.

A gain on one item does not mean every production task improved by the same amount. A benchmark measures a particular set of tasks. A real product also depends on context length, how tools are defined, error recovery, network latency, and the quality of the business data.

## Change two: it has entered GPT-6 Luna’s range

On the items Anthropic published, Haiku 5.5 scores higher than GPT-6 Luna:

- GDPval-AA: 1620 against 1437;
- AA-Briefcase: 1578 against 1336;
- OSWorld: 72.4% against 48.9%;
- Terminal-Bench: 39.2% against 16.4%;
- Chartography: 46.4% against 29.1%.

That set is enough for a careful claim. Haiku 5.5 has entered the range where the mainstream high-value models compete.

Two limits have to stay attached to it.

First, the numbers come from Anthropic’s announcement. Companies do not run a benchmark, configure a model, attach tools, or compute a statistic in the same way. The table is a good way to see where the maker places the product. It is not a fully independent, fully symmetric third-party ranking.

Second, “higher than GPT-6 Luna” does not mean “better than GPT-6 Luna on every task”. The official table supports a comparison of the published items. It does not support carrying the result over to tasks that were not tested.

A fair way to say it is:

> On the comparison items Anthropic published, Haiku 5.5 posted higher scores than GPT-6 Luna. A real choice still has to weigh the task, the price, the speed, and how the model is called.

## Change three: it is close to Sonnet, and the model tiers are still there

The gap between Haiku 5.5 and Sonnet 5.5 carries information of its own.

On GDPval-AA v2.1, Haiku 5.5 scores 1620 and Sonnet 5.5 scores 1840. On AA-Briefcase the two scores are 1578 and 1824. On OSWorld, Haiku 5.5 is 72.4% and Sonnet 5.5 is 83.9%. On Humanity’s Last Exam without tools the scores are 45.9% and 56.9%. With tools they are 57.4% and 64.5%.

![Official scores for Haiku 5.5 and Sonnet 5.5. In each row, the bars are scaled so that Sonnet 5.5 fills the row. The widest gap is Terminal-Bench 4.0.](/blog/figures/claude-haiku-5-5-official-scorecard/sonnet.svg)

Those gaps say Haiku 5.5 can already handle a real share of knowledge work and computer use. As the work gets more complex, Sonnet 5.5 still holds a steady advantage.

Terminal-Bench is the gap worth watching. Haiku 5.5 is 39.2%. Sonnet 5.5 is 70.6%. The benchmark asks a model to finish complex, multi-step professional tasks in a command-line environment, which is close to long-running agentic coding. Haiku 5.5 is far above Haiku 4.5 here, and still a long way from Sonnet 5.5.

That gives model choice a clear boundary:

- For local, repeated, checkable work, Haiku 5.5 is attractive;
- For work that needs long-range planning, edits across files, and repeated recovery from errors, Sonnet 5.5 still fits better;
- A close score on some benchmarks is not a reason to treat the two as price variants of the same model.

## After the price cut, the figure to watch is the cost per task

Price is the other focus of this release.

For a request of up to 100K tokens, Haiku 5.5 charges $0.10 per million input tokens and $0.50 per million output tokens. Above 100K tokens, those prices become $0.50 and $2.50. Anthropic says the average cost of running Haiku 5.5 is about 75% lower than Haiku 4.5.

| Request size | Input price | Output price | Cache read |
|---|---:|---:|---:|
| Up to 100K tokens | $0.10 / MTok | $0.50 / MTok | $0.01 / MTok |
| Over 100K tokens | $0.50 / MTok | $2.50 / MTok | $0.05 / MTok |

![Haiku 5.5’s two price tiers. Up to 100K tokens, input is $0.10, output is $0.50, and cache reads are $0.01. Above that, the prices are $0.50, $2.50, and $0.05, all per million tokens.](/blog/figures/claude-haiku-5-5-official-scorecard/price-en.svg)

On the face of it, input inside 100K falls from Haiku 4.5’s $1 to $0.10, and output falls from $5 to $0.50, a 90% cut in the listed unit price. Anthropic also says Haiku 5.5 uses a newer tokenizer, so the same task can consume slightly more tokens. The drop in average running cost is about 75%, not a flat 90%.

A real product still has to ask three further questions:

1. How often does Haiku 5.5 finish the task on the first call?
2. How many retries does a failure take?
3. Does the result still need Sonnet or Opus to review it and repair it?

The more useful measure is:

```text
Cost per successful task
= total spend to finish the work ÷ number of tasks finished successfully
```

Suppose one Haiku 5.5 call costs a tenth of a Sonnet call, but the task needs two retries, or 20% of requests are eventually escalated to Sonnet. The saving is then smaller than the gap on the price card.

The other way around: if a task can be checked automatically, and a failure can be retried cheaply, Haiku 5.5 can have a very strong economic advantage.

## Past 100K tokens, the price boundary changes the product architecture

On the Haiku 5.5 price card, 100K tokens is a real dividing line.

For short and medium requests, the low price shows up easily. Code repositories, long conversations, company knowledge bases, and large document sets will often approach or pass 100K tokens. Stuffing all of that into one request is not automatically the best design.

A more reasonable architecture usually does five things:

- Use Haiku 5.5 first to classify documents and filter for relevance;
- Compress the raw material into a structured summary;
- Send only the passages that bear on the current question to a larger model;
- Cache repeated context;
- Store a multi-turn conversation as state that can be retrieved, instead of resending the whole thread every time.

This is also where Haiku 5.5 sits closest to an agent architecture. It is a cheap model for answers, and it can be the base layer for context compaction, for sorting retrieval results, and for carrying out subtasks.

## An effort setting makes a static leaderboard less useful

Haiku 5.5 is the first Haiku model with an adjustable effort setting. For the same model, a system can spend more or less on reasoning according to how much the task matters, and choose among quality, latency, and cost.

That changes how a benchmark should be read. A single score says how the model behaved in one configuration. A cost–quality curve says how it behaves under different budgets.

Simpler tasks can sit at a lower effort:

- Classification;
- Format conversion;
- Extraction of fixed fields;
- Rewriting a short text.

Tasks in the middle can take a higher effort:

- Summarizing a long document;
- Pulling information together across paragraphs;
- Multi-step work in a browser;
- Tasks that have to judge first and call a tool second.

Raising effort on a hard task does not automatically replace Sonnet. The Terminal-Bench gap is the reminder. A larger reasoning budget can improve the result. It does not erase a gap in long-range planning, error recovery, and complicated tool chains.

## Turn the numbers into a practical routing table

Taken together, the official scores and the product placement support a cautious first routing table:

| Task | Default choice | Why |
|---|---|---|
| Classification, routing, labels | Haiku 5.5 | High volume, a clear output shape, and easy to check |
| Field extraction and data cleanup | Haiku 5.5 | The task boundary is explicit, and the work suits high concurrency |
| Summaries and context compaction | Haiku 5.5 | The price and speed advantage is large |
| Single-step or short browser flows | Haiku 5.5 | The OSWorld score shows a clear gain in computer use |
| Ordinary code explanation and small fixes | Haiku 5.5 or Sonnet 5.5 | Depends on automatic tests and on the cost of a mistake |
| Edits across many files | Sonnet 5.5 | Terminal-Bench still shows a clear gap |
| Long-running agentic coding | Sonnet 5.5 or Opus 5.5 | Needs sustained planning and error recovery |
| Final review and high-stakes judgment | Sonnet 5.5 or Opus 5.5 | Needs more stability and stronger reasoning |

This table is not a permanent definition of “where Haiku 5.5 stops”. It is a first set of suggestions from putting the official benchmarks, the price, and the product role in one place.

A real deployment still has to check the work on its own tasks:

- Does the output meet the business standard?
- Can a failure be detected automatically?
- Is a retry worth the money after a failure?
- Does the lower latency actually improve the product?
- Does the low price get eaten by a higher cost of human review?

## How to read an official benchmark

Two mistakes are easy to make with a new model’s benchmarks.

The first is folding every item into one overall rank. Knowledge work, computer use, open-ended reasoning, and agentic coding are different abilities. One total cannot stand in for them.

The second is treating an official score as a conclusion about production. An official benchmark has a stated test configuration. A real product is also affected by the prompt, the tools, the context, the network, the data, and the mechanism that recovers from errors.

A more reliable reading has three steps.

### Start with the jump in capability

Did Haiku 5.5 improve steadily on Haiku 4.5? On the official table, yes. The change shows up especially on OSWorld, on knowledge work, and on the agentic-coding items.

### Then look at the task boundary

Has it caught the larger model? That depends on the task. On some knowledge work and on computer use it is already close to Sonnet. On complex agentic coding the gap is still clear.

### Finish with unit cost

Whether it is worth using depends on quality, price, latency, and recovery from failure together. A benchmark score alone cannot say whether a product should switch models.

## The final judgment: Haiku 5.5 is strong because it can be used in volume

If the only question is whether Haiku 5.5 beats Sonnet 5.5, the answer is simple. It does not. The official data already shows Sonnet 5.5 still ahead on knowledge work, computer use, general reasoning, and agentic coding.

If the only question is whether Haiku 5.5 is stronger than Haiku 4.5, the answer is equally plain. It is, and the gain is large.

The question worth discussing is the third one. **Is it already strong enough to take on a large amount of local work inside production systems?**

On the official scores and the price, the likely answer is yes.

The value of Haiku 5.5 is that a batch of tasks which used to need a mid-size model, and which were not worth a mid-size model’s price, can now sit in a faster and cheaper execution layer. Classification, extraction, summaries, context compaction, short browser flows, and agent subtasks can all become its main stage.

This is not a new “champion of the model leaderboard” scorecard. It is a scorecard about how the work is divided:

- Haiku 4.5 showed that a small model can do simple work cheaply;
- Haiku 5.5 begins to show that a small model can also take on some work that needs tools and more than one step;
- Sonnet 5.5 still handles the more complex planning, coding, and knowledge work;
- Opus 5.5 still handles the long-running, high-difficulty tasks where a mistake is expensive.

The point of model evaluation is also moving, from “who has the highest score” to “who is most worth calling for which task”.

## Sources

- [Anthropic: Introducing Claude Haiku 5.5](https://www.anthropic.com/claude-haiku-5-5)
- [Claude Platform Docs: Models overview](https://platform.claude.com/docs/en/models/overview)
