---
slug: gpt-6-1-sol-review-pricing
translationKey: gpt-6-1-sol-review-pricing
locale: zh-CN
kind: article
title: GPT-6.1 Sol 的规格、长上下文标价与发布页比较
description: "整理 GPT-6.1 Sol 的模型页规格、272K 上下的官网标价，以及发布页写明的差值和单任务成本。这些数字来自 OpenAI 公开页面，不是 Folkbench 实测。"
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
    label: OpenAI，GPT-6.1 Sol 发布页
    url: https://openai.com/index/introducing-gpt-6-1-sol/
    checkedAt: '2026-10-02'
    claimScope: official
  - id: gpt-61-model
    label: OpenAI API，GPT-6.1 Sol 模型页
    url: https://developers.openai.com/api/docs/models/gpt-6.1-sol
    checkedAt: '2026-10-02'
    claimScope: official
  - id: openai-pricing
    label: OpenAI API 价格表
    url: https://developers.openai.com/api/docs/pricing
    checkedAt: '2026-10-02'
    claimScope: official
  - id: gpt-61-system-card
    label: OpenAI，GPT-6.1 Sol 系统卡附录
    url: https://deploymentsafety.openai.com/gpt-6-1-sol
    checkedAt: '2026-10-02'
    claimScope: official
---

> 下文的规格和价格来自 OpenAI 的模型页和价格表，比较句来自发布页，核对日期是 2026 年 10 月 2 日。发布页给出的是差值和成本，不是一张可以抄绝对分数的表。Folkbench 没有重跑这些评测。厂商的“大约五分之一成本”描述的是他们自己的测试装置。

OpenAI 把 GPT-6.1 Sol 写成 `gpt-6-sol` 的升级。API 模型 ID 是 `gpt-6.1-sol`。发布页的说法是：在复杂编程、电脑操作和专业工作上接近 `gpt-6-astra`，标准输入和输出标价是 Astra 的五分之一。缓存读取是每百万 token $0.10，是标准输入的 5%，也是 `gpt-6-sol` 缓存读取的一半。最难的科学研究，发布页仍建议用 Astra。`gpt-6-sol` 继续留在价格表里。

GPT-6 Sol 与 Luna 的发布页在 2026 年 9 月 29 日的更新里指向这一模型。本文不把页脚里其他新闻卡片的日期写成 GPT-6.1 Sol 自己的发布日。

Claude 这一侧的标价和基准表见 [Opus 5.5](../claude-opus-5-5-review-pricing/) 与 [Sonnet 5.5](../claude-sonnet-5-5-review-pricing/)。

## 已经公开的规格

| 项目 | GPT-6.1 Sol |
| --- | --- |
| 模型 ID | `gpt-6.1-sol` |
| 上下文窗口 | 1,050,000 tokens |
| 最大输入 | 922,000 tokens |
| 最大输出 | 128,000 tokens |
| 输入到输出 | 文本和图片到文本 |
| 知识截止 | 2026 年 4 月 30 日 |
| `reasoning.effort` | `low`、`medium`（默认）、`high`、`xhigh`、`max` |
| 不接受的 effort | `none`、`minimal` |
| 工具调用 | Responses API |
| Chat Completions | 支持，不带工具 |
| 列出支持的端点 | Chat Completions、Responses、Batch |
| 模型页写明不支持 | Realtime、Assistants、微调、Embeddings、图片生成、视频、语音 |
| 数据驻留 | 支持美国和欧盟。Fast 不能和欧盟数据驻留一起用 |

最大输入 922,000 与上下文 1,050,000、最大输出 128,000 对得上：1,050,000 − 128,000 = 922,000。模型页写明支持推理 token，没有在本文引用的段落里单独写出推理 token 的计费公式。预算时以用量记录里的输入、缓存和输出为准。

## 官网价格

### 短上下文和长上下文

单位是美元 / 每百万 tokens。短档和长档都来自 2026 年 10 月 2 日的 API 价格表。价格表写明：短上下文是输入不超过 272K tokens，长上下文是输入超过 272K tokens。模型页写明，超过 272K 时，输入和缓存按 2 倍、输出按 1.5 倍，而且覆盖整次请求。

| 每 1M tokens | 6.1 短 | 6.1 长 | Sol 短 | Sol 长 | Astra 短 | Astra 长 |
| --- | --- | --- | --- | --- | --- | --- |
| 输入 | $2 | $4 | $2 | $4 | $10 | $20 |
| 缓存读取 | $0.10 | $0.20 | $0.20 | $0.40 | $1 | $2 |
| 缓存写入 | $2.50 | $5 | $2.50 | $5 | $12.50 | $25 |
| 输出 | $10 | $15 | $10 | $15 | $50 | $75 |

不超过 272K 的输入用短档。从超过 272K 的那一次请求起，前面的 token 也改按长档单价计算，不是只对超出的部分加价。6.1 的缓存读取是 Sol 的一半。标准输入和输出是 Astra 的五分之一。缓存读取不是 Astra 的五分之一：Astra 短档缓存读取是 $1，6.1 是 $0.10。

缓存写入是未缓存输入的 1.25 倍，所以短档 $2 × 1.25 = $2.50，长档 $4 × 1.25 = $5。长档输出是短档的 1.5 倍，$10 × 1.5 = $15。

### 价格表里的其他乘数

模型页另写了三档官方乘数：Fast 是标准价格的 2 倍，Batch 和 Flex 比标准价格低 50%，可用的区域处理加 10%。同一天的价格表里，Batch、Flex 和 Fast 各自有一行，数字与这三个乘数一致。例如 6.1 的 Fast 短档是输入 $4、缓存读取 $0.20、缓存写入 $5、输出 $20。

发布页还说，随后几天会在 Codex 里提供 Ultrafast，token 生成最多比标准速度高 8 倍。2026 年 10 月 2 日读到的旗舰价格表没有单独的 Ultrafast 模型行。官方乘数是否已经进某一笔账单，以用量记录为准。

三个按标准档可以手算的例子。前两行落在短档。第三行是 28 万输入 token，整单用长档。缓存行假定用量记录把这些输入计为缓存命中。

| 请求 | 计算 | 金额 |
| --- | --- | --- |
| 10 万未缓存输入，5,000 输出 | 0.1 × $2 + 0.005 × $10 | $0.25 |
| 10 万缓存读取，5,000 输出 | 0.1 × $0.10 + 0.005 × $10 | $0.06 |
| 28 万未缓存输入，10,000 输出 | 0.28 × $4 + 0.01 × $15 | $1.27 |

如果误用短档单价去乘这 28 万 token，会得到 0.28 × $2 + 0.01 × $10 = $0.66，那不是这一档的价格。Fast、Batch、Flex 和区域加价都还没有乘进这三行。

## 发布页上的比较应该怎么读

发布页给出的是差值和成本，不是一张可以抄绝对分数的表。下表只保留页面写明的比较。成本句描述的是 OpenAI 的测试装置。

| 评测 | 发布页写明的比较 | 条件 |
| --- | --- | --- |
| DeepSWE v1.1 | 与 Astra 持平；比 Sol 的最好成绩高 6.4 个百分点 | 更低的 reasoning effort，成本大约是五分之一 |
| GDP.pdf | 高于带 fallback 的 Opus 5.5；接近 Astra | 测过的 reasoning 档；相对 Opus 不到一半成本，相对 Astra 大约五分之一 |
| AutomationBench | 比 Opus 5.5 高 2.2 个百分点；比同一档的 Sol 高 4.8 个百分点 | medium；相对 Opus 大约三分之一成本 |
| OSWorld 2.0 离线集 | 比 Sol 高 7 个百分点；与 Astra 相差 2.1 个百分点以内 | max；partial reward，v2026.08.08；相对 Sol 不到一半成本，相对 Astra 大约七分之一 |
| Terminal-Bench Science 0.1 | 把 Sol 的分数提高到两倍以上；Astra 仍是测过模型里的最高分，68.1% | max；6.1 平均每任务 $5.47，Opus 5.5 为 $23.21，Astra 为 $23.80 |
| 事实性 | 含至少一处事实错误的回答，从 11.4% 降到 7.7% | low；与 Astra 的差距不超过 1.9 个百分点 |

事实性样本是用户曾经标出错误的脱敏对话。发布页写明，这些提示是故意挑难的，不代表普通流量。Terminal-Bench Science 的美元是 OpenAI 公布的单任务平均成本，不是某一家中转站的分组价格。科学任务的最高分仍是 Astra 的 68.1%，发布页建议最难的科学研究继续用 Astra。

同一页的对齐测试也写了一组故意挑难的失败率。搜索工具已经坏掉时，max effort 下没有向用户说明的比例是 6.1 的 2.1%、Sol 的 4.9%、Astra 的 1.5%、Luna 的 28.7%。发布页写明没有观察到绕过自动安全审查的尝试，这一点与 Astra 和 Sol 相同。细节在 GPT-6.1 Sol 的系统卡附录里。这些失败率不是普通流量的故障率。

发布页还写明，评测跑在研究环境或 API 上，和 ChatGPT 生产环境的系统提示与工具可能不同。竞品数字取自公开报告。

## 请求上要分开的两处入口

工具调用用 Responses。默认 effort 已是 `medium`。模型页写明，Chat Completions 可以发不带工具的文本。

```text
# Responses
model: gpt-6.1-sol
reasoning.effort: medium

# Chat Completions，不带 tools
model: gpt-6.1-sol
reasoning_effort: medium

# 模型页写明不接受
reasoning.effort: none
reasoning.effort: minimal
Chat Completions 请求里携带 tools
```

从支持 `none` 的 `gpt-6-sol` 或 `gpt-6-luna` 迁过来时，用 `low` 重新比较，不要把 `none` 留在请求里。工具、计算机操作、文件搜索和网页搜索走 Responses。Chat Completions 只承担没有工具的请求。模型页列出的 Responses 工具包括网页搜索、文件搜索、代码解释器、计算机操作和 MCP。图片输入走用户消息上的内容数组。

短档的输入和输出标价与 `gpt-6-sol` 相同，缓存读取从 $0.20 降到 $0.10。长档的输出两款都是 $15，长档缓存读取从 $0.40 降到 $0.20。换成 6.1 时要固定返回的模型名，完成结果落在别的 ID 上就不算这次切换。

## 切换流量前要核对的事

1. 固定 `gpt-6.1-sol`。完成结果里的模型名也要是这个 ID。
2. 用同一份不含敏感信息的集合，分别在 `low`、`medium`、`high`、`xhigh` 和 `max` 上回放。`none` 和 `minimal` 不在这张卡上。
3. 工具放在 Responses 上。Chat Completions 的请求不带工具。
4. 分别给不超过 272K 和超过 272K 的输入计价。后者整单使用长档单价。
5. 预算先用标准档的两行。Fast、Batch、Flex 和区域加价，以用量记录里实际出现的金额为准。
6. 先看用量记录里的缓存 token，再使用上面的缓存算例。
7. 欧盟数据驻留不能和 Fast 一起用。模型页写明支持美国和欧盟驻留，没有把驻留写成一个可以随意加在任意网关上的参数。
8. 最难的科学研究继续用 `gpt-6-astra`。`gpt-6-sol` 仍在价格表里。

选好模型之后，各中转站是否提供这个 ID，以及当时的可用性和价格，以目录里已经发布的记录为准。本文的表格是 OpenAI 标价，不是某一家中转站乘过倍率之后的用户价。
