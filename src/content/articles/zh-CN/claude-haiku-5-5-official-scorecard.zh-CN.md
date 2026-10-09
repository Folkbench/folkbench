---
slug: claude-haiku-5-5-official-scorecard
translationKey: claude-haiku-5-5-official-scorecard
locale: zh-CN
kind: article
title: Haiku 5.5 到底有多强？官方成绩单里，最值得看的不是第一名
description: "Claude Haiku 5.5 的官方跑分已经出来了。和 Haiku 4.5、GPT-6 Luna、Sonnet 5.5 放在一起，值得看的不是每一项名次，而是小模型的能力边界被推进到了哪里。数字来自 Anthropic 发布页，不是 Folkbench 实测。"
category: 模型
tags: [基准, 定价, 模型]
authorId: iris-wu
modelIds: [claude-haiku-5-5, claude-haiku-4-5, claude-sonnet-5-5, claude-opus-5-5]
benchmarkSlugs: []
relatedSlugs: [claude-sonnet-5-5-review-pricing, claude-opus-5-5-review-pricing, gpt-6-1-sol-review-pricing]
publishedAt: '2026-10-09'
updatedAt: '2026-10-09'
sources:
  - id: haiku-55-announcement
    label: Anthropic，Introducing Claude Haiku 5.5
    url: https://www.anthropic.com/claude-haiku-5-5
    checkedAt: '2026-10-09'
    claimScope: official
  - id: claude-models-overview
    label: Claude Platform Docs，Models overview
    url: https://platform.claude.com/docs/en/models/overview
    checkedAt: '2026-10-09'
    claimScope: official
---

# Haiku 5.5 到底有多强？官方成绩单里，最值得看的不是第一名

> Claude Haiku 5.5 的官方跑分已经出来了。把它和 Haiku 4.5、GPT-6 Luna、Sonnet 5.5 放在一起看，真正值得讨论的问题不是它有没有赢下每一项，而是它把“小模型”的能力边界推进到了哪里。

Anthropic 官方发布的模型是 **Claude Haiku 5.5**。模型 ID 为 `claude-haiku-5-5`，发布时间是 2026 年 10 月 7 日。

Anthropic 对 Haiku 5.5 的定位很直接：它是目前最快、最便宜、能力最强的小模型，面向高并发、低延迟和成本敏感的任务。官方给出的典型场景包括分类、信息抽取、摘要、上下文压缩、数据库查询、浏览器操作，以及作为 Sonnet 5.5 或 Opus 5.5 的子代理。

这篇文章只使用 Anthropic 官方公布的 benchmark、价格和产品信息，不把官方成绩单包装成独立实验。我们要做的是把这些数字放回任务类型、价格和模型定位中，看看 Haiku 5.5 到底强在哪里，又有哪些地方仍然不能交给它。

## 先看结论：Haiku 5.5 已经跨过了“小模型只能做简单活”的分界线

把官方数据放在一起，Haiku 5.5 的轮廓相当清楚：

- 相比 Haiku 4.5，它在 Anthropic 公布的每一项主要 benchmark 上都有大幅提升；
- 在官方同时报告的项目中，它超过了 GPT-6 Luna；
- 它在知识工作、电脑操作和部分推理任务上已经接近 Sonnet 5.5；
- 在复杂 Agent 编程上，它仍然明显落后于 Sonnet 5.5；
- 它最有竞争力的地方，是速度、价格和足够高的任务完成能力叠加在一起。

因此，Haiku 5.5 更适合被理解为一个能力大幅增强的执行层，而不是一个全面取代 Sonnet 5.5 的模型。

## 官方 benchmark 横向对比

Anthropic 在 Haiku 5.5 的发布页上公布了以下数据。表中的 GPT-6 Luna 和 Sonnet 5.5 数值也来自 Anthropic 的同一张对照表。

| 测试项目 | Haiku 5.5 | Haiku 4.5 | GPT-6 Luna | Sonnet 5.5 |
|---|---:|---:|---:|---:|
| GDPval-AA v2.1：知识工作 | 1620 | 735 | 1437 | 1840 |
| AA-Briefcase v1.1：知识工作 | 1578 | 614 | 1336 | 1824 |
| OSWorld 2.1：电脑操作 | 72.4% | 15.7% | 48.9% | 83.9% |
| Humanity's Last Exam：无工具 | 45.9% | 10.2% | — | 56.9% |
| Humanity's Last Exam：使用工具 | 57.4% | 18.7% | — | 64.5% |
| Terminal-Bench 4.0：Agent 编程 | 39.2% | 0.0% | 16.4% | 70.6% |
| FrontierCode 1.1：Agent 编程 | 46.4% | — | 42.4% | 52.1% |
| Chartography：视觉推理 | 46.4% | 6.4% | 29.1% | 61.6% |

![官方对照：Haiku 5.5、Haiku 4.5、GPT-6 Luna 和 Sonnet 5.5 在八项基准上的分数。上半部分按 0 到 2,000 画，下半部分按 0% 到 100% 画。](/blog/figures/claude-haiku-5-5-official-scorecard/scores.svg)

这些数字不能简单压缩成“Haiku 5.5 排名第二”。不同 benchmark 测的是完全不同的能力：知识工作关心交付质量，OSWorld 关心模型能否操作真实电脑，Terminal-Bench 关心模型能否在命令行里完成多步骤专业任务，而 Humanity's Last Exam 更偏向高难度知识和推理。

同一个模型在不同任务上表现差异很大，这本身就是评测结果的一部分。

## 第一项变化：Haiku 5.5 把上一代甩开了

如果只看 Haiku 4.5 和 Haiku 5.5，升级幅度非常明显。

GDPval-AA v2.1 从 735 提高到 1620，约为上一代的 2.2 倍；AA-Briefcase 从 614 提高到 1578，约为 2.6 倍。OSWorld 从 15.7% 提高到 72.4%，Terminal-Bench 则从 0.0% 提高到 39.2%。

![Haiku 4.5 与 Haiku 5.5 的官方分数。每一行的条，都按这一行里 Haiku 5.5 的分数拉满。](/blog/figures/claude-haiku-5-5-official-scorecard/generation.svg)

这不是“回答措辞更漂亮”级别的变化。OSWorld 和 Terminal-Bench 都涉及长链条操作，模型需要理解任务、调用工具、处理反馈并在中途犯错后继续执行。Haiku 5.5 在这类测试中的提升，说明它已经不再只是一个适合做短文本分类和摘要的模型。

尤其是 OSWorld。Haiku 4.5 的 15.7% 与 Haiku 5.5 的 72.4% 之间存在明显断层。即使考虑 benchmark 设置、离线子集和官方测试条件，这个结果仍然说明 Haiku 5.5 在电脑操作能力上出现了非常大的代际变化。

不过，单项提升不能直接推导出“所有生产任务都提升了同样幅度”。benchmark 衡量的是特定任务集合，实际产品还会受到上下文长度、工具定义、错误恢复、网络延迟和业务数据质量的影响。

## 第二项变化：它已经进入 GPT-6 Luna 的竞争区间

在 Anthropic 公布的项目里，Haiku 5.5 的表现高于 GPT-6 Luna：

- GDPval-AA：1620 对 1437；
- AA-Briefcase：1578 对 1336；
- OSWorld：72.4% 对 48.9%；
- Terminal-Bench：39.2% 对 16.4%；
- Chartography：46.4% 对 29.1%。

这组数据足以支持一个谨慎的判断：Haiku 5.5 已经进入了主流高性价比模型的竞争区间。

但这里必须保留两个限定。

第一，这些数字来自 Anthropic 的发布页。不同公司对 benchmark 的运行方式、模型配置、工具设置和统计方法可能不同。它们适合用来了解产品方展示的能力位置，不适合直接当成完全独立、完全对称的第三方排名。

第二，“高于 GPT-6 Luna”不等于“所有任务都优于 GPT-6 Luna”。官方表格只支持我们对这些已公布项目做比较，不能把结果外推到没有测试的任务。

合理的表达应该是：

> 在 Anthropic 公布的对照项目中，Haiku 5.5 展现出了高于 GPT-6 Luna 的成绩；实际选型仍然需要结合任务类型、价格、速度和调用方式判断。

## 第三项变化：它距离 Sonnet 很近，但仍然没有抹平模型层级

Haiku 5.5 和 Sonnet 5.5 的差距同样有信息量。

在 GDPval-AA v2.1 上，Haiku 5.5 得分 1620，Sonnet 5.5 得分 1840；在 AA-Briefcase 上，两个分数分别是 1578 和 1824。OSWorld 上，Haiku 5.5 为 72.4%，Sonnet 5.5 为 83.9%。Humanity's Last Exam 的无工具成绩分别为 45.9% 和 56.9%，使用工具后分别为 57.4% 和 64.5%。

![Haiku 5.5 与 Sonnet 5.5 的官方分数。每一行的条，都按这一行里 Sonnet 5.5 的分数拉满。Terminal-Bench 4.0 的差距最大。](/blog/figures/claude-haiku-5-5-official-scorecard/sonnet.svg)

这些差距说明，Haiku 5.5 已经能够处理相当一部分知识工作和电脑操作，但复杂度继续上升时，Sonnet 5.5 仍然拥有稳定优势。

Terminal-Bench 的差距最值得关注：Haiku 5.5 为 39.2%，Sonnet 5.5 为 70.6%。这个项目要求模型在命令行环境中完成复杂、多步骤的专业任务，更接近长程 Agent 编程。Haiku 5.5 在这里的表现已经远高于 Haiku 4.5，但距离 Sonnet 5.5 仍有很大距离。

这给模型选择提供了一个清晰边界：

- 局部、重复、可验证的工作，Haiku 5.5 很有吸引力；
- 需要长期规划、跨文件修改和连续错误恢复的任务，Sonnet 5.5 仍然更适合；
- 不能因为 Haiku 5.5 在某些 benchmark 上接近 Sonnet，就把两者当成同一个模型的不同价格版本。

## 价格下降之后，真正应该看“单位任务成本”

Haiku 5.5 的价格是这次发布的另一个重点。

对于不超过 100K tokens 的请求，Haiku 5.5 的输入价格是每百万 tokens 0.10 美元，输出价格是 0.50 美元。超过 100K tokens 后，价格分别变为 0.50 美元和 2.50 美元。Anthropic 称，Haiku 5.5 的平均运行成本比 Haiku 4.5 低约 75%。

| 请求规模 | 输入价格 | 输出价格 | Cache read |
|---|---:|---:|---:|
| 不超过 100K tokens | $0.10 / MTok | $0.50 / MTok | $0.01 / MTok |
| 超过 100K tokens | $0.50 / MTok | $2.50 / MTok | $0.05 / MTok |

![Haiku 5.5 的两档价格。不超过 100K tokens 时，Input $0.10、Output $0.50、Cache read $0.01；超过之后分别是 $0.50、$2.50 和 $0.05，单位都是每百万 tokens。](/blog/figures/claude-haiku-5-5-official-scorecard/price-zh.svg)

表面上看，100K 以内的输入价格从 Haiku 4.5 的 1 美元降到 0.10 美元，输出价格从 5 美元降到 0.50 美元，名义单价下降了 90%。但 Anthropic 也说明，Haiku 5.5 使用了更新的 tokenizer，同样的任务可能消耗略多的 tokens，因此平均运行成本降幅是约 75%，而不是简单的 90%。

对于实际产品，仍然要进一步考虑三件事：

1. Haiku 5.5 一次完成任务的概率是多少；
2. 失败后需要重试几次；
3. 是否需要调用 Sonnet 或 Opus 进行审查和修复。

更有意义的指标是：

```text
每个成功任务的成本
= 完成任务的总费用 ÷ 成功完成的任务数量
```

假设 Haiku 5.5 的单次调用成本只有 Sonnet 的十分之一，但它在某类任务上需要两次重试，或者 20% 的请求最终要升级到 Sonnet，那么实际节省幅度就会小于价格表里的差距。

反过来，如果一个任务可以自动验证，失败后可以低成本重试，Haiku 5.5 就可能拥有非常强的经济优势。

## 100K tokens 之后，价格边界会影响产品架构

Haiku 5.5 的价格表里，100K tokens 是一个重要分界点。

对于短请求和中等长度请求，Haiku 5.5 的低价很容易体现出来。但对于代码仓库、长对话、企业知识库和大量文档，产品可能会频繁接近或超过 100K tokens。此时，直接把所有内容塞进一次请求，未必是最优方案。

更合理的架构通常包括：

- 先使用 Haiku 5.5 做文档分类和相关性筛选；
- 将原始内容压缩成结构化摘要；
- 只把与当前问题相关的片段交给更大的模型；
- 对重复上下文使用缓存；
- 将多轮对话保存为可检索状态，而不是每次完整重发。

这也是 Haiku 5.5 与 Agent 架构联系最紧密的地方。它不仅是一个便宜的回答模型，也可以成为上下文压缩、检索结果整理和子任务执行的基础层。

## effort 设置让静态排行榜变得不够用了

Haiku 5.5 是 Haiku 系列第一次支持可调 effort 的模型。对于同一模型，系统可以根据任务的重要性调整推理投入，在质量、延迟和成本之间做选择。

这会改变我们阅读 benchmark 的方式。一个固定分数只能告诉我们模型在某个配置下的表现，而一个完整的成本—质量曲线，才能告诉我们模型在不同预算下的行为。

简单任务可能更适合较低 effort：

- 分类；
- 格式转换；
- 固定字段抽取；
- 短文本改写。

中等复杂度的任务可以提高 effort：

- 长文摘要；
- 跨段落信息整合；
- 浏览器中的多步操作；
- 需要先判断再调用工具的任务。

复杂任务即使提高 effort，也不一定能替代 Sonnet。Terminal-Bench 的差距就是一个提醒：推理预算能改善表现，但它不会自动消除模型在长程规划、错误恢复和复杂工具链上的能力差距。

## 把这些数字翻译成实际的模型路由

综合官方成绩和产品定位，可以先得到一张比较稳妥的路由表：

| 任务类型 | 默认选择 | 原因 |
|---|---|---|
| 分类、路由、标签 | Haiku 5.5 | 调用量大，输出结构清晰，容易验证 |
| 字段抽取、数据整理 | Haiku 5.5 | 任务边界明确，适合高并发处理 |
| 摘要和上下文压缩 | Haiku 5.5 | 价格和速度优势明显 |
| 单步或短流程浏览器操作 | Haiku 5.5 | OSWorld 成绩显示其电脑操作能力已有明显提升 |
| 一般代码解释和小型修复 | Haiku 5.5 或 Sonnet 5.5 | 取决于是否有自动测试和错误代价 |
| 多文件代码修改 | Sonnet 5.5 | Terminal-Bench 仍存在明显差距 |
| 长程 Agent 编程 | Sonnet 5.5 或 Opus 5.5 | 需要持续规划和错误恢复 |
| 最终审核和高风险判断 | Sonnet 5.5 或 Opus 5.5 | 需要更高稳定性和更强推理能力 |

这张表不是“Haiku 5.5 能力边界”的永久定义。它只是把官方 benchmark、价格和产品定位放在一起后得到的第一版使用建议。

真正部署时，还需要用自己的任务集检查：

- 输出是否满足业务标准；
- 失败是否可以自动发现；
- 失败后重试是否划算；
- 更低的延迟是否能改善产品体验；
- 低价是否会被更高的人工检查成本抵消。

## 官方 benchmark 应该怎样读

面对新模型的 benchmark，最容易出现两个误区。

第一个误区是把所有项目压缩成一个总排名。知识工作、电脑操作、开放式推理和 Agent 编程是不同能力，不能用一列总分取代。

第二个误区是把官方成绩直接当成生产环境结论。官方 benchmark 有明确的测试配置，但现实产品还会受到 prompt、工具、上下文、网络、数据和错误恢复机制影响。

更可靠的阅读方式是分三步：

### 先看能力跃迁

Haiku 5.5 相比 Haiku 4.5 是否有稳定提升？从官方表格看，答案是肯定的，尤其体现在 OSWorld、知识工作和 Agent 编程项目上。

### 再看任务边界

它是否已经追平更大的模型？答案是分任务的。它在部分知识工作和电脑操作中已经接近 Sonnet，但在复杂 Agent 编程上仍然有明显差距。

### 最后看单位成本

它是否值得使用，取决于质量、价格、延迟和失败恢复共同形成的结果。单看 benchmark 分数，无法回答产品是否应该切换模型。

## 最终判断：Haiku 5.5 的“强”，体现在可以被大量使用

如果只问 Haiku 5.5 是否超过 Sonnet 5.5，答案很简单：没有。官方数据已经显示，Sonnet 5.5 在知识工作、电脑操作、综合推理和 Agent 编程上仍然占据优势。

如果只问 Haiku 5.5 是否比 Haiku 4.5 更强，答案同样明确：是，而且提升幅度很大。

真正值得讨论的问题是第三个：**它是否已经强到足以承担大量生产系统里的局部工作？**

从官方成绩和价格来看，答案很可能也是肯定的。

Haiku 5.5 的价值在于，它已经可以把一批过去需要中型模型、但又不值得支付中型模型价格的任务，放进一个更快、更便宜的执行层。分类、抽取、摘要、上下文压缩、短流程浏览器操作和 Agent 子任务，都可能成为它的主要舞台。

它不是一张新的“模型排行榜冠军”成绩单，而是一张关于模型分工的成绩单：

- Haiku 4.5 证明了小模型可以便宜地完成简单工作；
- Haiku 5.5 开始证明，小模型也可以承担一部分需要工具和多步操作的工作；
- Sonnet 5.5 仍然负责更复杂的规划、编码和知识工作；
- Opus 5.5 则继续处理长程、高难度和高错误代价的任务。

模型评测的重点，也正在从“谁的分数最高”转向“谁在什么任务上最值得被调用”。

## 参考资料

- [Anthropic：Introducing Claude Haiku 5.5](https://www.anthropic.com/claude-haiku-5-5)
- [Claude Platform Docs：Models overview](https://platform.claude.com/docs/en/models/overview)
