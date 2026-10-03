---
slug: grok-4-7-review-pricing
translationKey: grok-4-7-review-pricing
locale: en
kind: article
title: Grok 4.7 specs, long-context prices, and published benchmarks
description: "Official model name, 500K context, list prices below and above 200K prompt tokens, and the benchmark table printed for Grok 4.7. These figures come from xAI’s public pages, not a Folkbench measurement."
category: Models
tags: [pricing, benchmarks, api]
authorId: iris-wu
modelIds: [grok-4.7, grok-4-7, grok-4.6]
benchmarkSlugs: []
relatedSlugs: [gpt-6-1-sol-review-pricing, claude-opus-5-5-review-pricing, claude-sonnet-5-5-review-pricing]
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: grok-47-announcement
    label: xAI, Grok 4.7 announcement
    url: https://x.ai/news/grok-4-7
    checkedAt: '2026-10-02'
    claimScope: official
  - id: grok-47-guide
    label: xAI docs, Grok 4.7
    url: https://docs.x.ai/developers/grok-4-7
    checkedAt: '2026-10-02'
    claimScope: official
  - id: grok-47-model
    label: xAI docs, Grok 4.7 model page
    url: https://docs.x.ai/developers/models/grok-4.7
    checkedAt: '2026-10-02'
    claimScope: official
  - id: xai-pricing
    label: xAI API pricing
    url: https://docs.x.ai/developers/pricing
    checkedAt: '2026-10-02'
    claimScope: official
---

> Specs and prices below come from xAI’s docs and pricing table. The benchmarks come from the 21 September 2026 announcement. They were checked on 2 October 2026. Folkbench did not rerun these evaluations. Competitor prices and scores on the announcement are the figures that page prints, not a same-day recheck of the OpenAI or Anthropic price tables.

xAI announced Grok 4.7 on 21 September 2026. The API model name is `grok-4.7`. The docs describe it as a frontier model for coding, agentic tasks, and knowledge work. The announcement body says it is served at the same price and speed as [Grok 4.6](https://x.ai/news/grok-4-6). The same page’s headline says it is about twice as fast, at about half the price of comparable models. Both sentences are on the announcement. This article does not turn the headline into another price table.

Three public pages can be checked against each other. The docs glance table gives a 500,000-token context window, a May 2026 knowledge cutoff, and short-context prices of $2 input and $6 output. The pricing table switches to long-context rates once a prompt reaches 200K tokens, and those rates cover the whole request. The announcement’s benchmark table places `grok-4.7` next to Grok 4.6, GPT-5.6 Sol, and Fable 5.1. For OpenAI’s long-context tiers, see [GPT-6.1 Sol](https://folkbench.com/en/blog/gpt-6-1-sol-review-pricing). For Claude, see [Opus 5.5](https://folkbench.com/en/blog/claude-opus-5-5-review-pricing) and [Sonnet 5.5](https://folkbench.com/en/blog/claude-sonnet-5-5-review-pricing).

## Published specs

| Item | Grok 4.7 |
| --- | --- |
| Model name | `grok-4.7` |
| Announcement date | 21 September 2026 |
| Context window | 500,000 tokens |
| Knowledge cutoff | May 2026 |
| Input to output | Text and image to text |
| Output limit on the glance table | Printed as no text output limit, with no separate maximum output token count |
| Reasoning | `low`, `medium`, `high` (default), `xhigh` |
| APIs | Responses, Chat Completions |
| Tools named in the docs | Function calling, web search, X search, code execution |
| Batch API on the model page | Not supported |

The model page sets the default effort to `high`. The docs recommend `prompt_cache_key` on the Responses API, and the `x-grok-conv-id` header on Chat Completions. Without that key, the page says a conversation often lands on a cache-cold server and the input is billed at the uncached price. Responses also return `reasoning.encrypted_content` even when the request does not list it in `include`. Multi-turn calls should send those reasoning items back unchanged in the next `input`. The docs say Chat Completions is unchanged on this point.

The docs list the xAI API, the US regional endpoint `https://us.api.x.ai/v1`, Grok Build, Cursor, and the gateways OpenRouter, Vercel, and Cloudflare. Grok Build’s default model is this one. The US endpoint currently names `grok-4.7` and `grok-4.6`. Whether a relay lists this ID is a published catalog record, not a claim in this article.

## Official prices

### Short context and long context

Prices are USD per million tokens, from the API pricing table as read on 2 October 2026. The table says the long-context threshold is a prompt of 200K tokens. Once a request reaches it, every token in that request uses the long-context rate. `grok-4.7` and `grok-4.6` share the same six cells on this table.

| Per 1M tokens | 4.7 short | 4.7 long | 4.6 short | 4.6 long |
| --- | --- | --- | --- | --- |
| Input | $2 | $4 | $2 | $4 |
| Cache read | $0.50 | $1 | $0.50 | $1 |
| Output | $6 | $12 | $6 | $12 |

A prompt under 200K uses the short tier. From the request that reaches 200K, earlier tokens are priced at the long-tier rate too. The long tier is twice the short tier: $2 × 2 = $4, cache $0.50 × 2 = $1, and output $6 × 2 = $12. A cache read is one quarter of the input price in the same tier: $2 × 0.25 = $0.50, and $4 × 0.25 = $1.

Three examples use the standard tier only. The first two stay short. The third is 280,000 input tokens, so the whole request uses the long tier. The cache row assumes the usage record counts that input as a cache hit.

| Request | Calculation | Amount |
| --- | --- | --- |
| 100,000 uncached input, 5,000 output | 0.1 × $2 + 0.005 × $6 | $0.23 |
| 100,000 cache read, 5,000 output | 0.1 × $0.50 + 0.005 × $6 | $0.08 |
| 280,000 uncached input, 10,000 output | 0.28 × $4 + 0.01 × $12 | $1.24 |

Pricing those 280,000 tokens at the short rate would give 0.28 × $2 + 0.01 × $6 = $0.62. That is not this tier. Fast, the US regional premium, and tool invocations are not multiplied into these three rows.

### Other multipliers on the pricing table

The US regional endpoint `https://us.api.x.ai/v1` keeps inference in the United States and bills tokens at 1.1 times the global rates, a 10% premium. The pricing table prints these `grok-4.7` results: below 200K, input $2.20, cache read $0.55, output $6.60; above 200K, input $4.40, cache read $1.10, output $13.20. The 1.1 multiplier applies to input, output, and cache reads, including the long tier. The cache discount is applied first.

Grok 4.7 Fast is the same model on faster infrastructure. The docs say standard requests cost 2 times and long-context requests cost 1.5 times. It is available only in Cursor and Grok Build, billed through the plan there. It is not on the public xAI API, and Grok Build’s free tier does not include it. The pricing table prints Fast rates of input $4, cache $1, output $12 below 200K, and input $6, cache $1.50, output $18 above 200K. $4 / $1 / $12 is twice the short tier. $6 / $1.50 / $18 is 1.5 times the long tier. The announcement also says a fast variant has twice the output speed at twice the price. It does not print this 1.5 times tier. Use the table in the docs for the bill.

The model page says the Batch API is not supported. `grok-4.7` is not on the pricing table’s batch-discount list. The models named there have a 20% batch discount. The pricing page also describes Priority Processing for text requests: a confirmed `service_tier` of `priority` is billed at 2 times, after the cache discount. The Grok 4.7 model page has no separate Priority row. Whether one request used that multiplier is the `service_tier` on the response.

The docs price server-side tools separately. Web search is $5 per 1,000 calls. X search is billed per fetched item: $5 per 1,000 posts and $10 per 1,000 profiles. Code execution is $5 per 1,000 calls. Those charges sit outside token prices. The model page prints 150 requests per second and 50,000,000 tokens per minute, with the region shown as `us-east-1`. The guide also says the live rate limits and prices for a team are on that model page, so these two figures are not a promise for every account.

## How to read the announcement benchmarks

The announcement prints a comparison table. It is not a Folkbench measurement. The columns are Grok 4.7 xHigh, Grok 4.6 High, GPT-5.6 Sol Max, and Fable 5.1 Max. The two price rows are the input and output list prices that page prints. The DeepSWE cell for `grok-4.7` is 71.0%, and the asterisk says that cell used high effort, not the xHigh named in the column header.

| Item | Grok 4.7 | Grok 4.6 | GPT-5.6 Sol | Fable 5.1 |
| --- | --- | --- | --- | --- |
| Input / 1M | $2 | $2 | $4 | $10 |
| Output / 1M | $6 | $6 | $20 | $50 |
| CursorBench 4.0 | 46.3% | 40.4% | 41.7% | 51.8% |
| DeepSWE v1.1 | 71.0% (high) | 65.2% | 72.7% | 70.0% |
| EEBench | 64.0% | 53.0% | 39.4% | 56.4% |
| AA Briefcase v1.1 | 1,657 | 1,546 | 1,487 | 1,678 |
| Terminal-Bench 4.0 | 37.6% | 20.3% | 37.3% | 57.9% |
| Harvey Legal Agent Benchmark | 19.6% | 15.8% | 2.5% | 6.7% |
| HealthBench Professional | 56.7% | 48.5% | 60.5% | 62.1% |

The announcement also says Grok 4.7 is ahead of Grok 4.6 on both GDPval and AA Briefcase, and comparable to other frontier models. The GDPval chart does not print absolute scores in the text, so this article does not fill any in. The AA Briefcase score is the 1,657 in the table above.

The safety section prints two figures. LatchBio’s biosafety benchmark is 62.4%. On HackerBench v0.3, 3.3% of risky dual-use prompts were allowed through. The page says legitimate security work is rarely blocked, and it does not print a refusal rate for legitimate requests. Selected cybersecurity partners can request invite-only red-team access. These figures describe the announcement’s tests. They are not a failure rate for ordinary traffic.

## Checks before moving traffic

1. Pin `grok-4.7`. The model name on the completed result has to be that ID. The catalog page uses `grok-4-7`.
2. The default effort is `high`. Set `low`, `medium`, `high`, or `xhigh` explicitly when comparing them.
3. Send `prompt_cache_key` on multi-turn calls, or `x-grok-conv-id` on Chat Completions. Return encrypted reasoning from Responses unchanged.
4. Price prompts under 200K and prompts that reach 200K separately. The latter uses the long-tier rate for the whole request.
5. The US regional endpoint bills 1.1 times. Fast is not on the public API. Do not multiply the 2 times or 1.5 times rates into an ordinary API bill.
6. The model page says the Batch API is not supported. Tool calls add the per-thousand prices in the docs.
7. Competitor columns in the announcement table keep the prices and scores that page prints. The DeepSWE 71.0% is high, not xHigh.
8. Whether a relay offers this ID, and the availability and charged price at the time, come from the published catalog. The tables here are xAI list prices, not a relay’s price after a group multiplier.
