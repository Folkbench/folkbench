---
slug: claude-sonnet-5-5-review-pricing
translationKey: claude-sonnet-5-5-review-pricing
locale: zh-CN
kind: article
title: Claude Sonnet 5.5 的规格、标价与发布页基准
description: "整理 Claude Sonnet 5.5 的官网规格、与 Sonnet 5 相同的标价，以及发布页印出的基准。迁移时会返回 400 的请求单独列出。这些数字不是 Folkbench 实测。"
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
    label: Anthropic，Claude Sonnet 5.5 发布页
    url: https://www.anthropic.com/claude-sonnet-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-55-overview
    label: Claude Platform，Sonnet 5.5 模型页
    url: https://platform.claude.com/docs/en/models/sonnet-5-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-55-whats-new
    label: Claude Platform，Sonnet 5.5 更新说明
    url: https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-55-migration
    label: Claude Platform，迁到 Sonnet 5.5
    url: https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-5-overview
    label: Claude Platform，Sonnet 5 模型页
    url: https://platform.claude.com/docs/en/models/sonnet-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
---

> 下文的规格、标价和分数都抄自 Anthropic 的公开页面，核对日期是 2026 年 10 月 2 日。Folkbench 没有重跑这些基准。厂商关于“最多便宜 30%”“快 30% 以上”的句子，描述的是他们自己的测试装置。

Claude Sonnet 5.5 于 2026 年 9 月 28 日发布，是 Claude 5.5 系列的第二款。Claude API 的模型 ID 是 `claude-sonnet-5-5`。Anthropic 把它放在 [Opus 5.5](../claude-opus-5-5-review-pricing/) 旁边：范围清楚的日常任务、修 bug，以及文档、幻灯片和表格，用这一款；复杂、开放、需要持续判断的工作，发布页仍写成 Opus 5.5 更强。官网标价与 Sonnet 5 相同，每百万输入 token $2，每百万输出 token $10，缓存读取 $0.20。

Haiku 5.5 在两份发布页上都写成随后几周推出。本文不给一个尚未出现在价格表里的 ID 写价格。

## 已经公开的规格

| 项目 | Claude Sonnet 5.5 |
| --- | --- |
| Claude API 模型 ID | `claude-sonnet-5-5` |
| 发布日期 | 2026 年 9 月 28 日 |
| 上下文 / 同步最大输出 | 1M / 128K tokens |
| 输入到输出 | 文本和图片到文本 |
| 思考 | 自适应，默认开启 |
| Claude API 的默认 effort | `high` |
| Claude 应用与 Claude Code 的默认 effort | `medium` |
| effort 取值 | `low`、`medium`、`high`、`xhigh`、`max` |
| 模型页上的延迟档 | Fast。这是相对当前 Claude 产品线的比较，不是 tokens/秒 |
| 可靠知识截止 | 2026 年 6 月 |
| 可缓存提示的最短长度 | 512 tokens |
| 分词器 | 与 Sonnet 5 相同，同一段文本的 token 数相同 |

Sonnet 5 的模型页仍把它标为 legacy、可用，输入和输出也是 $2 / $10，可靠知识截止是 2026 年 1 月。退役承诺写的是不早于 2027 年 6 月 30 日。Sonnet 5.5 的更新说明建议迁到 5.5。

关闭预先思考的最低档是 `thinking: {"type": "between_tools"}`，只在 `low`、`medium` 和 `high` 上接受。`xhigh` 和 `max` 要改回自适应思考。迁移指南写明，`temperature`、`top_p` 或 `top_k` 设成非默认值会返回 400。

## 官网标价

单位是美元 / 每百万 tokens。Sonnet 5.5 这一列来自模型页。Opus 5.5 的输入、输出和缓存读取来自同一发布页的对比表。更新说明写明，Sonnet 5.5 的价格与 Sonnet 5 相同，包含提示缓存和批量。批量折扣是输入和输出的 50%。

| 每 1M tokens | Sonnet 5.5 | 发布页上的 Opus 5.5 |
| --- | --- | --- |
| 输入 | $2 | $4 |
| 输出 | $10 | $20 |
| 缓存读取 | $0.20 | $0.20 |
| 缓存写入 | 5 分钟 $2.50；1 小时 $4 | 发布页印成一个 $5，更新说明另拆成 5 分钟 $5 和 1 小时 $8 |
| 批量输入 / 输出 | 标价的 50% | 这张发布页对比表没有给出 |

相对 Opus 5.5 的输入和输出，这张卡是一半。缓存读取两款都是 $0.20。发布页把 Opus 5.5 的缓存写入印成一个 $5，没有拆开 5 分钟和 1 小时。Sonnet 5.5 的模型页把两档分开。

Anthropic 还有两条工作负载说法：同样的工作通常更省 token，多数任务最多便宜 30%；输出生成比 Sonnet 5 快 30% 以上。成本图上还有“大约十分之一”“大约五分之一”“大约十五分之一”“大约九分之一”的单任务成本比较。这些都是他们测试装置里的结果。真实账单仍取决于 effort、缓存命中、工具轮次和有没有走批量。

三个按官网标价可以手算的例子。形状是 10 万个相应类别的输入 token，加 5,000 个输出 token。

| 请求 | 计算 | 金额 |
| --- | --- | --- |
| 10 万未缓存输入，5,000 输出 | 0.1 × $2 + 0.005 × $10 | $0.25 |
| 10 万缓存读取，5,000 输出 | 0.1 × $0.20 + 0.005 × $10 | $0.07 |
| 10 万 5 分钟缓存写入，5,000 输出 | 0.1 × $2.50 + 0.005 × $10 | $0.30 |

第三行用的是 5 分钟写入价，不是 1 小时的 $4。1 小时写入是 0.1 × $4 + 0.005 × $10 = $0.45。

## 发布页上的基准应该怎么读

下表就是 2026 年 10 月 2 日发布页印出的那一张。破折号是发布页自己的空格。Terminal-Bench 4.0 和 CursorBench 4.0 的成本图改用了 GPT-5.6 Sol，因为 OpenAI 没有公开 GPT-6 Sol 的这两项。本文不把图上的 GPT-5.6 Sol 填进 GPT-6 Sol 这一列。

| 基准 | Sonnet 5.5 | Sonnet 5 | Opus 5.5 | GPT-6 Sol |
| --- | --- | --- | --- | --- |
| Terminal-Bench 4.0 | 70.6% | 10.3% | 66.4% | — |
| FrontierCode v1.1（Main） | 46.2%（max）；52.1%（xhigh） | 42.4% | 54.4% | 49.3% |
| CursorBench 4.0 | 55.5% | 34.1% | 57.8% | — |
| GDPval-AA v2.1 | 1844 | 1449 | 1846 | 1487 |
| AA-Briefcase v1.1 | 1811 | 1359 | 1822 | 1483 |
| Humanity's Last Exam，使用工具 | 64.5% | 54.9% | 67.7% | — |
| OSWorld 2.1，partial | 80.1% | 57.0% | 81.8% | — |
| Chartography，不使用工具 | 61.6% | 15.6% | 64.4% | 53.6% |

这一行 Chartography 是无工具分数。Opus 5.5 发布页上的 Chartography 是使用工具的另一行，Opus 5.5 在那里是 89.0%，不能和这里的 64.4% 并排当成同一次测量。

脚注要和分数放在一起看。Opus 5.5 的 Terminal-Bench 4.0 是 xhigh，发布页称这是该模型的最高分。FrontierCode 上，Sonnet 5.5 的 max 低于 xhigh。发布页的解释是：max 更常运行代码审查，审查被拆到多个子代理之后，出现过超时，也出现过超出任务范围的修改，而这项评测会惩罚超范围改动。

GDPval-AA 和 AA-Briefcase 由 Artificial Analysis 跑在一个预发布部署上。该部署有一个可能压低结构化输出的缺陷。发布页说这个缺陷后来已修复，若有影响，方向是低估 Sonnet 5.5。GPT-6 Sol 列上的 GDPval-AA、AA-Briefcase 和 Chartography 还带另一条说明：OpenAI 修复过一个损害图像理解的缺陷，这些外部分数当时未必已经更新。

同一页的成本图用的是另一种读法。Medium effort 是 Claude 应用里的默认值。在若干基准上，Low 或 Medium 的 Sonnet 5.5 以大约十分之一的单任务成本超过 Sonnet 5 的最好成绩。High effort 是 Claude Platform 的默认值。发布页写，FrontierCode 在 High 上比同一档的 Sonnet 5 高大约 10 分，单任务成本大约是十五分之一，并与 GPT-6 Sol 的最好成绩相当，成本大约是五分之一。CursorBench 在 Low 上超过 Sonnet 5 的最好成绩，成本不到十分之一。AA-Briefcase 在 Medium 上超过 Sonnet 5 的最好成绩，成本大约是九分之一。

表里的 55.5% 和 1844 是发布页印出的点。成本句是另一套装置。发布页同时写明，在他们自己的使用和外部测试里，复杂、开放、需要持续判断的工作仍是 Opus 5.5 更强。客户引语是挑选过的证词，不属于这张表。发布页还写到，它是第一款只看截图就通过 Pokémon Red 的 Sonnet。那是产品叙述，不是上表的一行。

## 从 Sonnet 5 迁过来

更新说明列出五处会让原来跑在 Sonnet 5 上的代码返回 400 的变更。另有请求仍然成功、响应形状变了的情况。

```text
model: claude-sonnet-5-5
max_tokens: 1024
thinking: {"type": "adaptive"}
output_config.effort: medium
# 400：thinking 类型为 disabled
# 400：thinking 类型为 enabled，且带 budget_tokens
# 400：thinking 类型为 between_tools，且 effort 为 xhigh 或 max
# 400：tool_choice 为 any，或 tool_choice 为 tool
# 400：temperature、top_p、top_k 为非默认值
# 400，限于 Claude API 与 Google Cloud：工具类型 computer_20251124
# 400：顾问工具使用 Opus 4.8、Opus 4.7 或 Sonnet 5 作为顾问
```

关闭预先思考时，发送 `between_tools`，effort 保持在 `high` 或更低。`between_tools` 不能再带 `display`、`budget_tokens` 或 `block_binding`。`tool_choice` 继续用 `auto` 或 `none`。要得到符合 schema 的工具参数，把严格工具调用打开，或改用结构化输出，并在提示里写明何时调用工具。

计算机操作在 Claude API 和 Google Cloud 上改用 `computer_toolset_20260801`。更新说明写明 Amazon Bedrock 仍接受原来的 `computer_20251124`。

顾问工具接受 Mythos 5.1、Fable 5.1、Mythos 5、Fable 5、Opus 5.5、Opus 5，或 Sonnet 5.5 自己。Opus 4.8、Opus 4.7 和 Sonnet 5 可以给 Sonnet 5 当顾问，不能给 Sonnet 5.5 当顾问。顾问返回的内容是加密的，客户端读不到正文。

2026 年 8 月 31 日 00:00 UTC 及之后创建的账号，在 Claude API、Amazon Bedrock 和 Google Cloud 上还有一处 400：重放 Sonnet 5.5 的思考块时，如果系统提示、工具列表或更早的消息已经改过，请求会失败。对话保持只追加。指令必须改时，用对话中途的系统消息。

省略 effort 时，API 跑在 `high`。同一个词在 Sonnet 5 上的思考量对不上。更新说明要求重新做 effort 扫描，不要把旧配置抄过来。范围清楚的工具循环可以从 `medium` 开始，更长或更难的再升到 `high`。延迟敏感的对话从 `medium` 或 `low` 开始。Claude 应用和 Claude Code 的默认值已经是 `medium`，Claude Platform 的默认值是 `high`。

工具调用之间超过一两句的进度文字，回到思考块里。默认 display 为 `omitted` 时，这些块的文本是空的，界面会在工具之间变静，请求本身仍然成功。使用 `between_tools` 时，这段文字会以思考块里的摘要回来，回放时模型看到的是完整笔记。

思考块记着产生它的模型。更新说明写明，Sonnet 5.5 能读 Sonnet 5、Opus 4.8、Haiku 4.5 和更早模型的思考块，不读 Opus 5、Opus 5.5、Fable 或 Mythos 的思考块。在 Claude API 和 Google Cloud 上，Opus 5.5 能读 Sonnet 5.5 的思考块，其他当前模型不能。目标模型读不了的块会在模型看到之前被丢掉，请求仍然成功，丢掉的块不计费。

被拒绝的请求以 HTTP 200 返回，`stop_reason` 为 `"refusal"`。发布页写明，它的网络安全能力已经接近 Opus 5，因此这是第一款带上同类网络安全防护的 Sonnet。更高风险的网络安全任务会回退到 Sonnet 5。生物防护与 Sonnet 5 相同。常规软件开发和多数生命科学工作不在这两条窄防护里。发布页同时写明，Sonnet 5.5 可以提供零数据保留。

## 切换流量前要核对的事

1. 固定 `claude-sonnet-5-5`。完成结果里的模型名也要核对。网络安全防护回退时，作答的模型可以是 Sonnet 5。
2. 用同一份不含敏感信息的集合，分别在 `low`、`medium`、`high`、`xhigh` 和 `max` 上回放。记录成功率、延迟、输入、缓存读取、缓存写入、输出和费用。
3. effort 放在 `output_config.effort` 里。不要用手工 `budget_tokens` 设置这一款的思考档。
4. 原来发送 `disabled`、强制工具选择、采样参数或 `computer_20251124` 的客户端，先改再放量。Bedrock 上的旧计算机工具是例外。
5. 重放思考块的对话保持只追加。
6. 把 HTTP 200 的拒答和传输失败分开计数。
7. 用一条短提示和一条会命中缓存的提示核对入账金额。5 分钟写入、1 小时写入和批量五折是不同的价格卡。
8. 复杂、开放、需要持续判断的任务继续用 `claude-opus-5-5`。`claude-sonnet-5` 的模型页仍标为可用。OpenAI 一侧的价格分档见 [GPT-6.1 Sol](../gpt-6-1-sol-review-pricing/)。

选好模型之后，各中转站是否提供这个 ID，以及当时的可用性和价格，以目录里已经发布的记录为准。本文不比较站点。
