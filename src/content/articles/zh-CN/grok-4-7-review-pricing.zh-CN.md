---
slug: grok-4-7-review-pricing
translationKey: grok-4-7-review-pricing
locale: zh-CN
kind: article
title: Grok 4.7 的规格、长上下文标价与发布页基准
description: "整理 Grok 4.7 的模型名、500K 上下文、200K 上下的官网标价，以及发布页印出的基准。这些数字来自 xAI 公开页面，不是 Folkbench 实测。"
category: 模型
tags: [定价, 基准, API]
authorId: iris-wu
modelIds: [grok-4.7, grok-4-7, grok-4.6]
benchmarkSlugs: []
relatedSlugs: [gpt-6-1-sol-review-pricing, claude-opus-5-5-review-pricing, claude-sonnet-5-5-review-pricing]
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: grok-47-announcement
    label: xAI，Grok 4.7 发布页
    url: https://x.ai/news/grok-4-7
    checkedAt: '2026-10-02'
    claimScope: official
  - id: grok-47-guide
    label: xAI 文档，Grok 4.7
    url: https://docs.x.ai/developers/grok-4-7
    checkedAt: '2026-10-02'
    claimScope: official
  - id: grok-47-model
    label: xAI 文档，Grok 4.7 模型页
    url: https://docs.x.ai/developers/models/grok-4.7
    checkedAt: '2026-10-02'
    claimScope: official
  - id: xai-pricing
    label: xAI API 价格表
    url: https://docs.x.ai/developers/pricing
    checkedAt: '2026-10-02'
    claimScope: official
---

> 下文的规格和价格来自 xAI 的文档与价格表，基准来自 2026 年 9 月 21 日的发布页，核对日期是 2026 年 10 月 2 日。Folkbench 没有重跑这些评测。发布页上的竞品价格和分数，是那一页印出来的数字，不是同一天对 OpenAI 或 Anthropic 价格表的复核。

xAI 在 2026 年 9 月 21 日发布 Grok 4.7。API 模型名是 `grok-4.7`。文档把它写成面向编程、Agent 任务和知识工作的前沿模型。发布页正文写明：它与 [Grok 4.6](https://x.ai/news/grok-4-6) 同价、同速度。同一页的标题又写着“大约两倍速度，大约同类模型一半的价格”。这两句都印在发布页上，本文不把标题句再算成一张新的价格表。

同一天可以核对的位置主要有三处。文档的一览表给出 500,000 tokens 上下文、2026 年 5 月的知识截止，以及短档输入 $2、输出 $6。价格表在提示达到 200K tokens 之后改用长档，而且整次请求都按长档计。发布页的基准表把 `grok-4.7` 和 Grok 4.6、GPT-5.6 Sol、Fable 5.1 放在一起。OpenAI 这一侧的长上下文分档见 [GPT-6.1 Sol](https://folkbench.com/blog/gpt-6-1-sol-review-pricing)。Claude 这一侧见 [Opus 5.5](https://folkbench.com/blog/claude-opus-5-5-review-pricing) 与 [Sonnet 5.5](https://folkbench.com/blog/claude-sonnet-5-5-review-pricing)。

## 已经公开的规格

| 项目 | Grok 4.7 |
| --- | --- |
| 模型名 | `grok-4.7` |
| 发布日期 | 2026 年 9 月 21 日 |
| 上下文窗口 | 500,000 tokens |
| 知识截止 | 2026 年 5 月 |
| 输入到输出 | 文本和图片到文本 |
| 文档一览表的输出上限 | 写的是没有文本输出上限，没有另给最大输出 token 数 |
| `reasoning` | `low`、`medium`、`high`（默认）、`xhigh` |
| API | Responses、Chat Completions |
| 文档列出的工具 | 函数调用、网页搜索、X 搜索、代码执行 |
| 模型页上的 Batch API | 不支持 |

模型页把默认 effort 写成 `high`。文档建议在 Responses 上设置 `prompt_cache_key`；Chat Completions 用请求头 `x-grok-conv-id`。页面写明，没有这个键时，对话请求常常落在还没有缓存的服务器上，输入会按未缓存价格计算。Responses 还会返回 `reasoning.encrypted_content`，即使请求没有把它列进 `include`。多轮对话要把这些 reasoning 项原样放回下一次的 `input`。文档写明 Chat Completions 这一条没有改。

文档列出的运行位置包括 xAI API、美国区域端点 `https://us.api.x.ai/v1`、Grok Build、Cursor，以及 OpenRouter、Vercel 和 Cloudflare。Grok Build 的默认模型是这一款。美国区域端点目前写出的模型是 `grok-4.7` 和 `grok-4.6`。某一家中转站有没有这个 ID，以目录里已经发布的记录为准。

## 官网价格

### 短上下文和长上下文

单位是美元 / 每百万 tokens。短档和长档都来自 2026 年 10 月 2 日读到的 API 价格表。价格表写明：长上下文的门槛是提示达到 200K tokens；一旦达到，这次请求里的全部 token 都按长档单价计算，不是只对超出的部分加价。`grok-4.7` 和 `grok-4.6` 在这张表上的六格相同。

| 每 1M tokens | 4.7 短 | 4.7 长 | 4.6 短 | 4.6 长 |
| --- | --- | --- | --- | --- |
| 输入 | $2 | $4 | $2 | $4 |
| 缓存读取 | $0.50 | $1 | $0.50 | $1 |
| 输出 | $6 | $12 | $6 | $12 |

不超过 200K 的提示用短档。从达到 200K 的那一次请求起，前面的 token 也改按长档单价计算。长档是短档的 2 倍：$2 × 2 = $4，缓存 $0.50 × 2 = $1，输出 $6 × 2 = $12。缓存读取是同一档输入的四分之一：$2 × 0.25 = $0.50，$4 × 0.25 = $1。

三个按标准档可以手算的例子。前两行落在短档。第三行是 28 万输入 token，整单用长档。缓存行假定用量记录把这些输入计为缓存命中。

| 请求 | 计算 | 金额 |
| --- | --- | --- |
| 10 万未缓存输入，5,000 输出 | 0.1 × $2 + 0.005 × $6 | $0.23 |
| 10 万缓存读取，5,000 输出 | 0.1 × $0.50 + 0.005 × $6 | $0.08 |
| 28 万未缓存输入，10,000 输出 | 0.28 × $4 + 0.01 × $12 | $1.24 |

如果误用短档单价去乘这 28 万 token，会得到 0.28 × $2 + 0.01 × $6 = $0.62，那不是这一档的价格。Fast、美国区域加价和工具调用都还没有乘进这三行。

### 价格表里另写的乘数

美国区域端点 `https://us.api.x.ai/v1` 把推理留在美国，token 按全球价格的 1.1 倍计，也就是加 10%。价格表为 `grok-4.7` 写出的结果是：200K 以下输入 $2.20、缓存读取 $0.55、输出 $6.60；200K 以上输入 $4.40、缓存读取 $1.10、输出 $13.20。1.1 倍作用在输入、输出和缓存读取上，包含长档。缓存折扣先算，再乘 1.1。

Grok 4.7 Fast 是同一模型的更快服务。文档写明：标准请求 2 倍，长上下文请求 1.5 倍；只在 Cursor 和 Grok Build 里提供，并由那边的套餐计费；不在公开 xAI API 上，也不包含在 Grok Build 的免费档里。价格表印出的 Fast 单价是：200K 以下输入 $4、缓存 $1、输出 $12；200K 以上输入 $6、缓存 $1.50、输出 $18。$4 / $1 / $12 是短档的 2 倍。$6 / $1.50 / $18 是长档的 1.5 倍。发布页另有一句“输出速度两倍、价格两倍”，没有写出这档 1.5 倍。计费用文档里的这张表。

模型页写明 Batch API 不支持。价格表的批量折扣名单里没有 `grok-4.7`；写明有 20% 批量折扣的是另一组模型。价格表还描述了文本请求的 Priority Processing：响应里确认 `service_tier` 为 `priority` 时按 2 倍计，缓存折扣先算再乘。Grok 4.7 的模型页没有单独的 Priority 行。一笔请求有没有走到这个倍数，以响应里的 `service_tier` 为准。

文档还为服务端工具另写了调用价。网页搜索是每千次调用 $5。X 搜索按取回的条目计：每千条帖子 $5，每千个用户资料 $10。代码执行是每千次调用 $5。这些费用在 token 之外。模型页印出的速率是每秒 150 个请求、每分钟 50,000,000 tokens，区域写成 `us-east-1`。文档同时写明，团队当时的速率和实时价格以模型页为准，所以这两组数不是对所有账号的承诺。

## 发布页上的基准应该怎么读

发布页给出的是一张对比表，不是 Folkbench 的测量。列是 Grok 4.7 xHigh、Grok 4.6 High、GPT-5.6 Sol Max、Fable 5.1 Max。价格两行是那一页印出的输入和输出标价。DeepSWE 的 `grok-4.7` 格子是 71.0%，星号写明这一格用的是 high，不是列表头的 xHigh。

| 项目 | Grok 4.7 | Grok 4.6 | GPT-5.6 Sol | Fable 5.1 |
| --- | --- | --- | --- | --- |
| 输入 / 1M | $2 | $2 | $4 | $10 |
| 输出 / 1M | $6 | $6 | $20 | $50 |
| CursorBench 4.0 | 46.3% | 40.4% | 41.7% | 51.8% |
| DeepSWE v1.1 | 71.0%（high） | 65.2% | 72.7% | 70.0% |
| EEBench | 64.0% | 53.0% | 39.4% | 56.4% |
| AA Briefcase v1.1 | 1,657 | 1,546 | 1,487 | 1,678 |
| Terminal-Bench 4.0 | 37.6% | 20.3% | 37.3% | 57.9% |
| Harvey Legal Agent Benchmark | 19.6% | 15.8% | 2.5% | 6.7% |
| HealthBench Professional | 56.7% | 48.5% | 60.5% | 62.1% |

发布页还写，Grok 4.7 在 GDPval 和 AA Briefcase 上都高于 Grok 4.6，并与其他前沿模型相当。GDPval 那一张图没有在正文里给出可以抄下来的绝对分数，本文不补数字。AA Briefcase 的分数就是上一张表里的 1,657。

安全一节写了两处数字。LatchBio 的生物安全基准是 62.4%。HackerBench v0.3 上，有风险的两用提示被放行的比例是 3.3%。页面说它很少拦截正当的安全工作，但没有给正当请求的拒绝率。受邀的网络安全合作方可以申请只限邀请的红队能力。这些数字是发布页的测试描述，不是普通流量的故障率。

## 切换流量前要核对的事

1. 固定 `grok-4.7`。完成结果里的模型名也要是这个 ID。目录里的页面使用 `grok-4-7`。
2. 默认 effort 是 `high`。要比较时再显式写出 `low`、`medium`、`high` 或 `xhigh`。
3. 多轮请求带上 `prompt_cache_key`，或在 Chat Completions 上带 `x-grok-conv-id`。Responses 返回的加密 reasoning 原样送回。
4. 分别给不超过 200K 和达到 200K 的提示计价。后者整单使用长档单价。
5. 美国区域端点按 1.1 倍计。Fast 不在公开 API 上，2 倍和 1.5 倍不要乘进普通 API 账单。
6. 模型页写明不支持 Batch API。工具调用按文档里的千次价格另计。
7. 发布页基准表里的竞品列，沿用该页印出的价格和分数。DeepSWE 的 71.0% 是 high，不是 xHigh。
8. 中转站是否提供这个 ID，以及当时的可用性和成交价，以目录里已经发布的记录为准。本文的表格是 xAI 标价，不是某一家中转站乘过倍率之后的用户价。
