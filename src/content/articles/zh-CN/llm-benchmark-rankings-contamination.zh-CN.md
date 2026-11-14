---
slug: llm-benchmark-rankings-contamination
translationKey: llm-benchmark-rankings-contamination
locale: zh-CN
kind: article
title: "模型排名可靠吗？从数据污染到可复核的 Benchmark"
description: "从 LiveBench、LiveCodeBench、HELM 与评测统计论文出发，解释榜单分数的证据边界，并给出涵盖数据污染、预算、评分和不确定性的比较方法。"
category: 评测方法
tags: [基准, 推理, 可靠性]
authorId: iris-wu
modelIds: []
benchmarkSlugs: []
relatedSlugs: [mathematical-reasoning-robustness, long-context-effective-understanding]
publishedAt: '2026-11-14'
updatedAt: '2026-11-14'
sources:
  - id: construct-validity
    label: Bean 等，Measuring what Matters，2025
    url: https://arxiv.org/abs/2511.04703v1
    checkedAt: '2026-11-14'
    claimScope: official
  - id: betterbench
    label: Reuel 等，BetterBench，2024
    url: https://arxiv.org/abs/2411.12990v1
    checkedAt: '2026-11-14'
    claimScope: official
  - id: livebench
    label: White 等，LiveBench，2025 修订版
    url: https://arxiv.org/abs/2406.19314v2
    checkedAt: '2026-11-14'
    claimScope: official
  - id: livecodebench
    label: Jain 等，LiveCodeBench，2024
    url: https://arxiv.org/abs/2403.07974v2
    checkedAt: '2026-11-14'
    claimScope: official
  - id: helm
    label: Liang 等，Holistic Evaluation of Language Models
    url: https://arxiv.org/abs/2211.09110v2
    checkedAt: '2026-11-14'
    claimScope: official
  - id: error-bars
    label: Miller，Adding Error Bars to Evals，2024
    url: https://arxiv.org/abs/2411.00640v1
    checkedAt: '2026-11-14'
    claimScope: official
  - id: judge
    label: Zheng 等，Judging LLM-as-a-Judge，2023
    url: https://arxiv.org/abs/2306.05685v4
    checkedAt: '2026-11-14'
    claimScope: official
---

一张榜单可以很准确地记录一次考试，却仍不足以回答“哪个模型更适合我的任务”。分数取决于题目、模型版本、提示、工具、推理预算和评分器。脱离这些条件，精确到小数点后的排名也可能给出过强的结论。

本文是截至 2026-11-14 的文献分析与评测设计建议。Folkbench 本轮没有调用模型或重跑基准；文中的示例用于解释方法，不是实测成绩。目标是建立一条可复核的证据链：测量什么、如何出题、怎样评分，以及结果允许我们说到哪一步。

## 先定义能力，再选择题库

“智力”太宽，无法仅靠一道题或一个平均分解释。专业知识问答、陌生规则归纳、代码执行和长期规划，需要不同的任务与验收标准。让模型输出指定格式还会同时考查指令遵循；要求它看图解题，则加入了视觉识别。

[Measuring what Matters](https://arxiv.org/abs/2511.04703v1) 对 445 个 Benchmark 的审查，把这种问题放在“构念效度”下讨论：观察到的分数，是否支持关于目标能力的解释。[BetterBench](https://arxiv.org/abs/2411.12990v1) 则提供了审查 Benchmark 质量的框架。顶会发表和机构声望可作为阅读线索，不能代替对任务与评分器的检查。

一个可操作的研究问题应类似于：“在不给外部搜索工具的条件下，模型能否根据提供的材料解决多步问题？”这比“模型是否聪明”更容易验证，也更容易识别失败来自知识不足、证据遗漏还是推理错误。

## 数据污染不只有看过原题

最直接的污染是测试题及答案进入训练数据。相似题、解题教程或公开评测记录，也可能帮助模型在目标题上表现更好。另一个问题是研究者反复依据公开榜单调整方法：即使没有把原题放进训练集，也可能逐渐对这张试卷过拟合。

因此，旧题高分不能自动解释成记忆作弊，新题低分也不能单独证明污染。两组题的难度、题型和领域可能不同。若想估计污染影响，需要尽量匹配这些条件，并明确无法观察的训练数据边界。对于闭源模型，无法核对完整训练集时，应记录“未知”，而不是给出“确认无污染”。

[LiveBench 修订版](https://arxiv.org/abs/2406.19314v2) 使用持续更新的任务和可自动核对的答案；标题采用的是“Contamination-Limited”。[LiveCodeBench](https://arxiv.org/abs/2403.07974v2) 从编程竞赛持续收集新题，并记录时间。这些设计降低特定污染风险，但新题一旦公开，未来仍可能进入训练或调优流程。

动态题库还引入了时间可比性问题。不同月份的分数如果来自不同题目，变化可能同时包含能力变化与试卷变化。可靠的记录应保留每次的数据版本，并在共同题集上重新比较，或分别报告固定参考集与新增题集。后者也需要承认固定参考集逐渐暴露的风险。

## “相同条件”需要写成协议

同一模型名称可能对应不同快照、服务入口和推理设置。比较前应登记实际 API ID、可获得的版本信息、测试时间、系统提示、采样设置、输出上限、工具和重试规则。服务端未公开的路由或计算预算不能靠猜测补齐。

可以同时提供两种视角：统一协议下的模型对比，以及各系统在明确预算内的最佳配置对比。前者便于归因，后者更接近采购决策；两种结果应分别命名。相同最大 token 数也不等于相同算力，因为分词器和内部推理机制可能不同。

[HELM](https://arxiv.org/abs/2211.09110v2) 的价值在于统一场景和条件，同时观察准确性、校准、稳健性与效率。沿用这一思路，报告不应只列一个分数，还应列成本、延迟和失败情况。费用口径要包含失败尝试及工具调用，不能只统计最终成功的那一次。

## 评分器也会成为误差来源

有标准答案时，优先采用可核对的评分规则，但“自动评分”并不意味着答案一定正确。代码测试可能遗漏需求，也可能把某一种实现写死；字符串匹配可能错误拒绝语义正确的答案。评分器的版本、答案提取规则和异常处理方式都应固定。

开放式任务需要更复杂的评审。[Judging LLM-as-a-Judge](https://arxiv.org/abs/2306.05685v4) 分析了位置、篇幅和自我偏好等问题。可以采用匿名答案、交换呈现顺序、明确评分细则，并让人工复核有争议的样本。模型裁判与人工偏好的一致程度，不能直接当作事实正确率。

还应分别记录任务答错、格式失败、拒答、超时和服务错误。如何计入主分数必须在运行前约定。若只对成功返回的请求计算准确率，却隐藏大量超时，读者会高估整个服务的可靠性。

## 小分差需要配对分析

假设同一批 200 道题，模型 A 答对 160 道，B 答对 156 道。这只是一个假设算例：两者相差 2 个百分点，但仅凭总数无法判断差异有多稳定。还需要知道两者分别在哪些题上答对，以及这些题是否独立。

[Adding Error Bars to Evals](https://arxiv.org/abs/2411.00640v1) 讨论了配对比较、相关题目和实验规划。相同题集下，应分析每题的分数差；同一模板生成的多个变体应按模板分组，不能把大量相似题当成等量独立证据。重复生成可以估计采样波动，却不能弥补领域覆盖不足。

报告可以给出差异的 95% 置信区间，并说明计算方法和抽样单位。区间覆盖零时，应避免宣称已证明某模型领先；它同样不等于已经证明两者能力相等。同时比较很多模型或很多子项时，还要控制反复筛选“显著结果”的风险。

## 一张可复核的结果卡应包含什么

| 项目 | 应保留的证据 | 缺失时的影响 |
| --- | --- | --- |
| 能力定义 | 目标任务、用户场景、排除范围 | 不宜外推为通用能力 |
| 数据身份 | 版本、题目时间、来源、分组方式 | 无法确认比较的是同一试卷 |
| 运行协议 | 模型版本、提示、工具、预算、次数 | 无法区分模型与系统配置影响 |
| 评分协议 | 参考答案、评分器版本、人工复核规则 | 难以排除评分错误 |
| 不确定性 | 样本量、配对差异、区间、重复运行 | 小分差可能被过度解读 |
| 成本与失败 | 总费用、耗时、失败类型和覆盖率 | 成功分数可能掩盖不可用性 |

这些项目是本文建议的编辑与实验记录格式，不是给现有榜单补发认证。原始记录若含敏感数据，应在受控环境中保留；公开的是足以复核结论的脱敏证据与协议。

## 排名的价值在于缩小选择范围

可信的 Benchmark 可以帮助发现候选模型和能力短板。最终选择仍应回到自己的任务分布：模型在哪些失败上不可接受，延迟和费用是否符合需求，更新版本后表现是否改变。

Folkbench 的编辑建议是先展示分维度结果，再讨论综合分。若使用权重，就公开权重并观察合理调整后排名是否稳定。证据不足时保留并列或“暂不足以区分”，比制造精确名次更有用。

接下来可以阅读[数学推理稳健性](/blog/mathematical-reasoning-robustness/)与[长上下文有效理解](/blog/long-context-effective-understanding/)，了解如何把这些原则落实到具体能力。
