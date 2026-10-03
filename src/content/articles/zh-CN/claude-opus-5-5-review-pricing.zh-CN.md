---
slug: claude-opus-5-5-review-pricing
translationKey: claude-opus-5-5-review-pricing
locale: zh-CN
kind: article
title: Claude Opus 5.5 的规格、标价与发布页基准
description: "整理 Claude Opus 5.5 的官网规格、标价和发布页基准表，并列出迁移时会直接返回 400 的请求。数字来自厂商公开页面，不是 Folkbench 实测。"
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
    label: Anthropic，Claude Opus 5.5 发布页
    url: https://www.anthropic.com/claude-opus-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: opus-55-overview
    label: Claude Platform，Opus 5.5 模型页
    url: https://platform.claude.com/docs/en/models/opus-5-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
  - id: opus-55-whats-new
    label: Claude Platform，Opus 5.5 更新说明
    url: https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-5-overview
    label: Claude Platform，Sonnet 5 模型页
    url: https://platform.claude.com/docs/en/models/sonnet-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
---

> 下文的规格、标价和分数都抄自 Anthropic 或其所引的公开页面，核对日期是 2026 年 10 月 2 日。Folkbench 没有重跑这些基准。厂商关于“大约低 40%”“大约五分之一成本”的句子，描述的是他们自己的测试装置。

Claude Opus 5.5 于 2026 年 9 月 22 日发布，是 Claude 5.5 系列的第一款。Claude API 的模型 ID 是 `claude-opus-5-5`。模型页写明：上下文 1M tokens，最大输出 128K tokens，自适应思考始终开启，默认 effort 为 `medium`，标价是每百万输入 token $4、每百万输出 token $20。公开页面没有给出参数量，也没有给出训练算力。

同一天可以核对的位置主要有三处。标价低于 Opus 5，也远低于 Fable 5.1 的 $10 / $50。发布页印出的编程和知识工作行上，Opus 5.5 领先 Fable 5.1 和 Opus 5，并在其中多数行上领先 GPT-6 Astra。有两行方向相反：Astra 的点估计领先 Terminal-Bench-Science 0.1 和 Zapier 的 AutomationBench。日常、范围清楚的任务可以对照 [Claude Sonnet 5.5](../claude-sonnet-5-5-review-pricing/)。OpenAI 这一侧的长上下文分档见 [GPT-6.1 Sol](../gpt-6-1-sol-review-pricing/)。

## 已经公开的规格

| 项目 | Claude Opus 5.5 |
| --- | --- |
| Claude API 模型 ID | `claude-opus-5-5` |
| 发布日期 | 2026 年 9 月 22 日 |
| 上下文窗口 | 1M tokens |
| 最大输出 | 128K tokens |
| 批量 API 最大输出 | 300K tokens，beta 头 `output-300k-2026-03-24` |
| 输入到输出 | 文本和图片到文本 |
| 思考 | 自适应，始终开启 |
| 默认 effort | `medium` |
| effort 取值 | `low`、`medium`、`high`、`xhigh`、`max` |
| 模型页上的延迟档 | 中等 |
| 可靠知识截止 | 2026 年 6 月 |
| 可缓存提示的最短长度 | 512 tokens |
| 参数量 | 公开模型页未提供 |

“可靠知识截止”是模型既有知识最充分所及的日期。它和上下文窗口是两件事。请求里附上的文件仍然在这次上下文中。

Fast mode 是同一模型 ID 上的速度开关。更新说明把它标成仅 Claude API 可用的研究预览：请求使用 `speed: "fast"`，并带上 beta 头 `fast-mode-2026-02-01`。发布页给出的价格是每百万 token $8 / $40，输出速度最高约 2.5 倍，并写明 Claude Code 和 Claude Platform 可以用。更新说明写明 Amazon Bedrock、Claude Platform on AWS、Google Cloud 和 Microsoft Foundry 没有这个 fast mode。

手工指定思考预算会被拒绝。思考深度只用 effort 控制。

## 官网标价

单位是美元 / 每百万 tokens。Opus 5.5 的 5 分钟缓存写入、1 小时缓存写入和批量价来自更新说明。Opus 5 的缓存写入是发布页对比表里的单一 “cache writes” 数字，该表没有把 5 分钟和 1 小时拆开。Fable 5.1、Sonnet 5.5 和 Haiku 4.5 的输入、输出价来自模型页对比行。Sonnet 5 仍标为 legacy，模型页上的输入、输出价与 Sonnet 5.5 相同。破折号表示本文没有从一份一手价格行里取这一格。

| 每 1M tokens | Opus 5.5 | Opus 5 | Fable 5.1 | Sonnet 5.5 | Haiku 4.5 |
| --- | --- | --- | --- | --- | --- |
| 输入 | $4 | $5 | $10 | $2 | $1 |
| 输出 | $20 | $25 | $50 | $10 | $5 |
| 缓存读取 | $0.20 | $0.50 | — | $0.20 | — |
| 缓存写入 | 5 分钟 $5；1 小时 $8 | $6.25 | — | 5 分钟 $2.50；1 小时 $4 | — |
| 批量输入 / 输出 | $2 / $10 | — | — | 标价的 50% | — |
| Fast mode 输入 / 输出 | $8 / $40 | — | — | — | — |

相对 Opus 5，新鲜输入和输出的标价降了 20%，从 $5 / $25 到 $4 / $20。发布页把缓存读取写成从 $0.50 降到 $0.20，并说这占了 Agent 和编程账单的大头。Anthropic 另有一条工作负载说法：默认设置下，典型任务的花费大约比 Opus 5 低 40%，因为模型用掉的 token 也更少。这 40% 描述的是他们自己的测试装置。真实账单仍取决于 effort、缓存命中、工具轮次，以及有没有走批量或 fast mode。

批量处理是新标价的一半。Fast mode 是新标价的两倍，而且更新说明把它限制在 Claude API。

三个按官网标价可以手算的例子。形状是 10 万个相应类别的输入 token，加 5,000 个输出 token。缓存行假定用量记录真的把这些 token 计成读取。

| 请求 | 计算 | 金额 |
| --- | --- | --- |
| 10 万未缓存输入，5,000 输出 | 0.1 × $4 + 0.005 × $20 | $0.50 |
| 10 万缓存读取，5,000 输出 | 0.1 × $0.20 + 0.005 × $20 | $0.12 |
| 10 万 5 分钟缓存写入，5,000 输出 | 0.1 × $5 + 0.005 × $20 | $0.60 |

1 小时缓存写入要改用 $8，不能用上面的 $5。中转站或云平台的成交价不在这张表里。

## 和 Opus 5、Fable 5.1 相比，请求哪里变了

| 行为 | Opus 5.5 | Opus 5 | Fable 5.1 |
| --- | --- | --- | --- |
| API ID | `claude-opus-5-5` | `claude-opus-5` | `claude-fable-5-1` |
| 上下文 / 最大输出 | 1M / 128K | 1M / 128K | 1M / 128K |
| 思考 | 始终开启。`disabled` 和手工预算返回 400 | 默认开启。effort 为 `high` 或更低时接受 `disabled` | 模型页写明始终开启 |
| 省略 effort 时的默认值 | `medium` | `high` | `high` |
| 可靠知识截止 | 2026 年 6 月 | 发布页对比未在本文另引 | 2026 年 6 月 |
| 标价输入 / 输出 | $4 / $20 | $5 / $25 | $10 / $50 |
| 缓存读取 | $0.20 | $0.50 | — |

更新说明把四处会让“原来跑在 Opus 5 上的代码”失败的变更写在一起。前三处同样适用于 Fable 5.1。只替换模型字符串仍会撞上它们。

```text
model: claude-opus-5-5
thinking: {"type": "adaptive"}
tool_choice: {"type": "auto"}
output_config.effort: medium
# 400：thinking 类型为 disabled，或 enabled 且带 budget_tokens
# 400：tool_choice 为 any，或 tool_choice 为 tool
# 400，限于 Claude API 与 Google Cloud：工具类型 computer_20251124
```

省略 `thinking`，或发送 `adaptive`，两者等价。`tool_choice` 的 `auto` 和 `none` 仍然有效，计数 token 的端点也一样。要得到符合 schema 的 JSON，更新说明指向严格工具调用或结构化输出，并在提示词里写明何时调用工具。

在 Claude API 和 Google Cloud 上，用 `computer_toolset_20260801` 替换 `computer_20251124`，并去掉旧的计算机使用 beta 头。更新说明写明 Amazon Bedrock 上的 Opus 5.5 仍接受 `computer_20251124`。已经使用新工具集的浏览器操作集成，不必为这一处改代码。

第四处 400 与思考块绑定有关。2026 年 8 月 31 日 00:00 UTC 及之后创建的账号，在 Claude API 和云平台上，如果系统提示词、工具列表或更早的消息在 Opus 5.5 思考块产生之后被改过，重放这个块会返回 400。文档给出的做法是只追加的历史。指令必须改时，用对话中途的系统消息。更早的账号要显式打开同一套检查才会生效。

请求可以成功、行为仍然变了的地方也有三处。省略 effort 现在跑在 `medium`，同样的省略在 Opus 5 上跑的是 `high`。同一档 effort 上，Opus 5.5 每一轮往往比 Opus 5 思考得更多，在 `xhigh` 和 `max` 上尤其明显。从旧配置抄过来的 effort 值是一个新的成本点，`max_tokens` 要给思考块留出空间。

工具调用之间写下的文字回到思考块里。默认 display 为 `omitted` 时，这些块的文本是空的。过去会把这段文字流式展示出来的界面会变静，请求本身仍然成功。需要这些进度行时，要另设 display，并按块的 `type` 取值，不要按位置猜。

生物分类器和网络安全分类器一起运行。把模型推向“把推理抄进可见回答”的提示，可能以 `reasoning_extraction` 被拒绝。更新说明还写到，图表和截图在加上视觉工具之前就已经读得更准，因此过去用来弥补读图偏弱的提示词值得单独重放。

被拒绝的请求以 HTTP 200 返回，`stop_reason` 为 `"refusal"`。这不是传输失败。计费是否发生取决于拒答类别，并且仍然占用速率限制。

## 发布页上的基准应该怎么读

下表就是 2026 年 10 月 2 日发布页印出的那一张。除非脚注另有说明，Opus 5.5 使用自适应思考，effort 为 max。Terminal-Bench 4.0 是那个脚注：Opus 5.5 用 `xhigh`，GPT-6 Astra 用 `high`，各自取该模型公布的最高分。Astra 和 GPT-5.6 Sol 的数字按 OpenAI 的报告引用。生产防护是打开的。防护介入时，网络安全任务由 Opus 4.8 完成，生物和前沿 LLM 开发任务由 Opus 5 完成。Anthropic 说这会把 Opus 5.5 的分数拉低。

| 基准 | Opus 5.5 | Fable 5.1 | Opus 5 | GPT-6 Astra | GPT-5.6 Sol |
| --- | --- | --- | --- | --- | --- |
| Terminal-Bench 4.0 | 66.4% | 55.8% | 52.3% | 57.9% | 37.3% |
| FrontierCode v1.1（Main） | 54.4% | 50.3% | 48.0% | 53.3% | 47.5% |
| CursorBench 4.0 | 57.8% | 51.8% | 46.6% | — | 41.7% |
| GDPval-AA v2.1 | 1846 | 1735 | 1708 | 1542 | 1588 |
| AutomationBench | 40.0% | 31.4% | 26.9% | 41.4% | 28.8% |
| Humanity's Last Exam，使用工具 | 67.7% | 65.6% | 63.6% | 57.2% | — |
| Terminal-Bench-Science 0.1 | 58.7% | 52.6% | 29.0% | 64.6% | 22.4% |
| OSWorld 2.1，partial | 81.8% | 80.7% | 74.0% | — | — |
| Chartography，使用工具 | 89.0% | 88.4% | 83.4% | — | — |

把差距和他们公布的误差放在一起看。Terminal-Bench 4.0 上，Opus 5.5 为 ±2.6 分，其他 Claude 模型为 ±1.6 到 ±2 分。从 66.4% 到 Astra 的 57.9%、到 Fable 的 55.8%，都宽于这些误差。同一脚注还写到，公开榜上的 Opus 5 是 51.8%，他们的装置复现为 52.3%，落在噪声里。

Terminal-Bench-Science 每个模型是 ±3.5 到 ±5 分。Astra 的 64.6% 对 Opus 5.5 的 58.7%，幅度接近这些误差的宽度，点估计上 Astra 在前。公开榜上的 Opus 5 是 30.0%，他们的装置复现为 29.0%。

AutomationBench 由 Zapier 运行。因为该次运行没有回退模型，防护介入算作失败。Anthropic 说实际分数会更高。印出的 40.0% 对 Astra 的 41.4% 是一个很接近的公布结果，点估计上 Astra 在前。GDPval-AA v2.1 是覆盖 44 个职业的真实专业任务 Elo：Opus 5.5 为 1846，Fable 5.1 为 1735，Opus 5 为 1708，Sol 为 1588，Astra 为 1542。

同一发布页的成本图上还有第二组分数，取的是默认 effort `medium`：FrontierCode 54.6%，CursorBench 52.5%。对比表印的是 54.4% 和 57.8%。把它们当成两种 effort 下的两个数字。图注还说，medium effort 下 FrontierCode 以大约五分之一的单任务成本超过 Astra 的最高分 53.3%，Terminal-Bench 则以大约 40% 的成本打平 Astra。这些是关于 Anthropic 自己测试装置的单任务成本说法。

表下那句话更值得留下：在 Anthropic 自己的使用里，Opus 5.5 和 Fable 5.1 的差距比分数看起来更窄，这个水平上的基准分差对真实任务的指导也更弱。发布页上的客户引语是挑选过的证词。它们可以提示该重放什么，不属于这张表。

## 切换流量前要核对的事

1. 固定 `claude-opus-5-5`。完成结果里的模型名也要核对。防护介入时，网络安全任务可能由 Opus 4.8 完成，生物和前沿 LLM 开发任务可能由 Opus 5 完成。日志里的请求模型仍可能写成 `claude-opus-5-5`。
2. 用同一份不含敏感信息的集合，分别在 `low`、`medium`、`high`、`xhigh` 和 `max` 上回放。记下成功率、墙钟时间、输入、缓存读取、缓存写入、输出和费用。
3. 不要发送 `thinking: {"type": "disabled"}` 或带 `budget_tokens` 的手工预算。effort 要显式设置。省略时这里是 `medium`，不是 Opus 5 的 `high`。
4. `tool_choice` 只用 `auto` 或 `none`。Claude API 和 Google Cloud 上的计算机操作改用 `computer_toolset_20260801`。
5. 重放思考块的对话保持只追加。2026 年 8 月 31 日及之后创建的账号，改了思考块前面的前缀会得到 400。
6. 把 HTTP 200 的拒答和传输失败分开计数。
7. 用一条短提示和一条会命中缓存的提示核对入账金额。5 分钟写入、1 小时写入、批量和 fast mode 是四张不同的价格卡。
8. 范围清楚、不需要这条 Opus 循环的任务，继续看 [Sonnet 5.5](../claude-sonnet-5-5-review-pricing/) 的 $2 / $10。科学 Agent 和 Zapier 业务工作流上，发布页印出的点估计由 Astra 领先。

选好模型之后，各中转站是否提供这个 ID、以及当时的可用性和价格，以目录里已经发布的记录为准。本文不比较站点，也不把厂商标价写成某一家中转站的成交价。
