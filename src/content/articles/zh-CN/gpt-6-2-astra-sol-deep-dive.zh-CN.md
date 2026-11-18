---
slug: gpt-6-2-astra-sol-deep-dive
translationKey: gpt-6-2-astra-sol-deep-dive
locale: zh-CN
kind: benchmark-review
title: "GPT-6.2 Astra 与 Sol 深度测评：推理、工程与科研能力"
description: "交叉核对 ARC Prize、Epoch AI、Artificial Analysis 和 Cognition 的首发证据，拆解 GPT-6.2 的抽象推理、软件交付、学术研究和成本边界。"
category: 模型
tags: [benchmarks, reasoning, coding, research]
authorId: iris-wu
modelIds: [gpt-6-2-astra, gpt-6-2-sol, gpt-6-astra, gpt-6-1-sol]
benchmarkSlugs: []
relatedSlugs: [gpt-6-1-sol-review-pricing, mathematical-reasoning-robustness, llm-benchmark-rankings-contamination]
publishedAt: '2026-11-18'
updatedAt: '2026-11-18'
sources:
  - id: openai-launch
    label: OpenAI · GPT-6.2 Astra and Sol
    url: https://openai.com/index/introducing-gpt-6-2-astra-sol/
    checkedAt: '2026-11-18'
    claimScope: official
  - id: aa-release
    label: Artificial Analysis · GPT-6.2 launch evaluation
    url: https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: epoch-astra
    label: Epoch AI · GPT-6.2 Astra results
    url: https://epoch.ai/models/gpt-6-2-astra
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: arc-prize
    label: ARC Prize · Verified GPT-6.2 results
    url: https://arcprize.org/results/openai-gpt-6-2
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: cognition
    label: Cognition · FrontierCode 2.0
    url: https://cognition.com/frontiercode
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: terminal-bench
    label: Terminal-Bench · 4.0 leaderboard
    url: https://www.tbench.ai/?version=4
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: epoch-work
    label: Epoch AI · Open-ended work evaluation
    url: https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: epoch-erdos
    label: Epoch AI · FrontierMath Erdős
    url: https://epoch.ai/benchmarks/frontiermath-erdos
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: aa-science
    label: Artificial Analysis · Terminal-Bench-Science 0.1
    url: https://artificialanalysis.ai/evaluations/terminal-bench-science
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: aa-omniscience
    label: Artificial Analysis · AA-Omniscience v1.1
    url: https://artificialanalysis.ai/evaluations/omniscience
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: openai-specs
    label: OpenAI API · Model specifications and pricing
    url: https://developers.openai.com/api/docs/models/compare
    checkedAt: '2026-11-18'
    claimScope: official
  - id: system-card
    label: OpenAI · GPT-6.2 system card
    url: https://deploymentsafety.openai.com/gpt-6-2-astra-sol
    checkedAt: '2026-11-18'
    claimScope: official
---

在 Epoch AI 的发布日记录中，GPT‑6.2 Astra 和 Claude Fable 5.2 的综合能力指数同为 **174 分**。在同一家机构从实际工作抽取的开放式任务里，Astra 的平均评分是 **65%**，Fable 5.2 是 **82%**。与此同时，GPT‑6.2 Sol 在两项软件工程评测中接近 Astra，终端基准的整套运行费用约为 Astra 的五分之一。三个结果放在一起，才看得清 6.2 的变化：Astra 把高难度推理的上限推高了，Sol 把部分可验证任务的成本压低了，而独立决定该研究什么、怎样推翻自己的初步结论，仍是另一类能力。[Epoch 模型数据](https://epoch.ai/models/gpt-6-2-astra) · [Epoch 开放式工作评测](https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work) · [Terminal-Bench 4.0 榜单](https://www.tbench.ai/?version=4)

OpenAI 于 2026 年 11 月 17 日发布 Astra 和 Sol。本文以 11 月 18 日可查的公开结果为证据，属于 Folkbench 的二次分析。机构榜单归各评测方，规格和标价归 OpenAI，Folkbench 本轮未重跑模型。文中的百分比沿用各榜单的定义。凡涉及工具权限、推理预算或评测执行环境，结论均限定在对应设置内。[OpenAI 发布公告](https://openai.com/index/introducing-gpt-6-2-astra-sol/)

## 五组数字回答五个不同的问题

| 公开评测与口径 | GPT‑6.2 Astra | GPT‑6.2 Sol | 这项结果衡量什么 |
| --- | ---: | ---: | --- |
| Artificial Analysis Intelligence Index v5.0.1，max | 62 | 57 | 九项评测归纳出的综合表现 |
| ARC‑AGI‑2，max | 95.8% | 85.8% | 从少量示例归纳规则并完成新的网格变换 |
| ARC‑AGI‑3 标准执行环境，max | 70.3% | 54.9% | 从陌生交互环境的反馈中学习并推进任务 |
| Terminal-Bench 4.0，Codex，max | 62.1% ± 2.3% | 61.5% ± 2.8% | 在终端中完成多步骤任务 |
| Epoch Automation Reports，Codex | 65% | 未测 | 开放式工作交付物与机构内部标准的距离 |

[Artificial Analysis 首发评测](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [ARC Prize 成绩](https://arcprize.org/results/openai-gpt-6-2) · [Terminal-Bench 4.0 榜单](https://www.tbench.ai/?version=4) · [Epoch 工作任务明细](https://epoch.ai/benchmarks/epoch-automation-reports)

## 智力维度：综合指数、抽象迁移与记忆方式

Artificial Analysis 的首发综合指数给 Astra **62**，比旧款 GPT‑6 Astra 高 **5 分**，低于 Fable 5.2 的 **65**。Sol 的 **57** 与旧款 Astra 持平，在该指数的任务组合里，平均单任务模型成本约为旧款 Astra 的 **15%**。Epoch 的 174 则来自另一套量尺：它用项目反应理论和贝叶斯模型估计模型能力、基准难度和区分度，并随结果增加更新估计。两套指数分别压缩了不同的任务样本。相同指数支持同一标尺下的总体位置接近，具体实验仍要看题型、预算和评分边界。综合排名对“智力”的解释力，到这一步就需要拆开。[Artificial Analysis 首发评测](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [Epoch ECI 方法](https://epoch.ai/data/eci-documentation/methodology)

ARC‑AGI‑2 是较干净的对照。相同 max 档下，Astra 领先 Sol **10.0 个百分点**。ARC‑AGI‑3 的标准环境需要模型用多轮行动获取反馈，max 下差距扩大到 **15.4 个百分点**。ARC Prize 的公开演示里，标准环境允许维持模型自行选择的笔记。Provider Adapter 还能在请求之间保存不透明的推理状态，并在长会话中压缩上下文。同一 max 档切换执行环境后，Astra 达 **99.8%**，Sol 达 **98.2%**。Astra 在适配环境的 xhigh 档达到 **100.0%**，对应标准环境只有 **56.5%**。因此引用满分时，执行环境和推理档位与数字本身同样重要。[ARC Prize 核验结果与执行环境](https://arcprize.org/results/openai-gpt-6-2)

这组落差对应用设计有直接含义。交互探索需要保留先前试过的规则、排除过的假设和失败动作的反馈。执行环境改变了这些信息传到下一步的方式，连 Astra 与 Sol 的分差也随之改变。若业务是真正的有状态交互，值得比较同一模型在自己工具链中的失败恢复、重复动作和跨轮记忆，而非把适配环境近满分外推到无状态请求。单项榜单也无法把成绩归因到某个训练阶段或模型内部结构。[ARC Prize 核验结果](https://arcprize.org/results/openai-gpt-6-2)

## 工程与专业工作：交付物的验收条件决定优势

Terminal-Bench 4.0 在 Codex、max 下报 Astra **62.1% ± 2.3%**、Sol **61.5% ± 2.8%**，整套运行标示约 **1,400 美元**与 **300 美元**。点估计只差 **0.6 个百分点**，榜单给出的区间也大幅重叠。要论证某一款稳定更强，最好用同一批任务的配对结果和多次运行估计差值。当前证据更直接支持一个成本判断：在这套终端任务中，Sol 用约五分之一的费用达到接近的分数。费用是整套评测的报价，不能直接当作任何项目的单任务成本。[Terminal-Bench 4.0 榜单](https://www.tbench.ai/?version=4)

Cognition 的 FrontierCode 2.0 从另一个角度衡量软件交付。132 项任务由项目维护者编写，评分考虑正确性、测试质量、改动范围和代码库规范，触发阻断条件的结果得零。OpenAI 报告，两款 6.2 在该评测、max 档的差距在 **0.5 个百分点**以内，Sol 约为 Astra 五分之一的成本。Artificial Analysis 的 Coding Agent Index 在 Codex / max 上又给出一条反证：Astra 与上一代 Astra 持平，Sol 比 GPT‑6.1 Sol 低 **3 分**，其中仓库问答 SWE-Atlas-QnA-AA 下滑 **14 分**，报告指向关键事实遗漏。能跑通任务与能解释代码为何这样写，分别需要执行闭环和完整证据提取。[Cognition 榜单与评分方法](https://cognition.com/frontiercode) · [OpenAI 发布公告](https://openai.com/index/introducing-gpt-6-2-astra-sol/) · [Artificial Analysis 编程评测](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol)

专业工作也会随验收设定换位。OpenAI 在发布公告中报告，Astra 在 Agents’ Last Exam 超出 Fable 5.2 **5.5 分**，所列成本为对方的 **5%**，且公告注明 Fable 的榜单结果排除了 9 项使用回退模型的任务。Epoch 用自己的真实工作产物做人工审阅时，Fable 5.2 领先 **17 个百分点**，Astra 的 **65%** 则仍高于旧款 Astra 的 **56%**。Epoch 每个模型在每个任务上只运行一次，样本较小，模型使用的执行环境也不同。这组反向排序表明，委派报告、图表或分析工作时，要关心评分是否覆盖受众判断、证据取舍和修改后质量。[OpenAI 发布公告](https://openai.com/index/introducing-gpt-6-2-astra-sol/) · [Epoch 工作评测与局限](https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work)

## 学术维度：知识、证明、科研执行与研究设计

**学科问答。** Artificial Analysis 报告，Astra 在 HLE-Diamond 上只落后于 Fable 5.2，在 CritPt v2 难题子集的物理推理比较中也处于第二。两项结果覆盖高难知识调用和答案推导，但评测对象仍是给定问题。事实可靠性还需要看模型在答不上来时怎么做。AA-Omniscience v1.1 中 Astra 与 Sol 的 max 幻觉率分别为 **59%** 和 **55%**。分母是所有未完全正确的响应，包括错误、部分正确和未作答，分子是错误响应。这个指标衡量模型在没能给出完全正确答案时直接答错的倾向，不能拿来估计整篇文献综述中有多少引文会出错。[Artificial Analysis 首发评测](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [AA-Omniscience 指标定义](https://artificialanalysis.ai/evaluations/omniscience)

**形式化数学。** Epoch 的同一模型记录给 Astra 的 FrontierMath Tier 4 v2 显示 **100%**，旧款 Astra 显示 **98%**，数值按该页显示精度列出。更有区分度的是 FrontierMath Erdős，Astra **10%**，旧款 Astra **3%**。后者由 68 道在基准建立时仍开放的难题构成，用 Lean 检查提交的证明或反证。已有验收边界的高难任务趋近饱和时，开放问题集仍能提供区分。形式化通过证明了结果符合给定形式命题，研究判断还涉及形式化是否忠实表达原问题、用了哪些前提，以及结果是否具备独立的数学价值。[Epoch 模型成绩](https://epoch.ai/models/gpt-6-2-astra) · [FrontierMath Erdős 方法](https://epoch.ai/benchmarks/frontiermath-erdos)

**科研执行。** 在 Artificial Analysis 的 Terminal-Bench-Science 0.1 上，Astra 的 xhigh 为 **78.6%**，max 为 **78.1%**。这项 70 题基准由学科专家参与设计，让模型在终端交付可用测试检查的产物。它提供了操作工具、处理研究材料和交付可复查结果的证据。两个档位的点估计也提示，采购或路由策略应按任务验证预算曲线。只看最高档，可能错过价格和质量更适合的一档。[Terminal-Bench-Science 0.1 及方法](https://artificialanalysis.ai/evaluations/terminal-bench-science)

**研究设计。** Epoch 要求模型构造真正改变规则的国际象棋变体，以测试样本分布之外的泛化。Astra 的方案主要更换棋子标签，底层移动规则仍等价，实验因而难以排除模型沿用已有知识。Epoch 还观察到多款模型沿用第一次尝试，缺少根据中间结果调整设计的迭代。这是与科研执行分数可以并存的失败：模型有能力完成指定的实验流程，但实验未必能区分竞争假设。OpenAI 系统卡把 Astra 列入其 AI 自我改进能力的 High 档，Sol 低于该档。该评级反映特定 AI 研发环境中的能力证据，通用研究自主性仍需由独立任务验证。[Epoch 开放式工作评测](https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work) · [OpenAI 系统卡](https://deploymentsafety.openai.com/gpt-6-2-astra-sol)

## 成本与选型：按通过验收的任务计价

两款 API 模型均提供 **105 万 token** 上下文窗口，最多输入 **92.2 万**、输出 **12.8 万**，接受文本与图像、输出文本。标准短上下文价格按每百万 token 计，Astra 的输入、缓存读取、输出分别是 **8 / 0.40 / 40 美元**，Sol 是 **2 / 0.10 / 10 美元**。超过 **272K** 输入 token 后，整次调用的输入和缓存费率翻倍，输出费率变为 **1.5 倍**。窗口大小是容量，实际可调用的证据量还取决于模型能否跨距离定位定义、识别冲突和引用原文。[OpenAI Astra 模型规格](https://developers.openai.com/api/docs/models/gpt-6.2-astra) · [OpenAI Sol 模型规格](https://developers.openai.com/api/docs/models/gpt-6.2-sol)

一个可复算的例子：若短上下文请求使用 10 万未缓存输入 token 和 1 万计费输出 token，且未产生缓存写入和工具费，Astra 是 **1.20 美元**，Sol 是 **0.30 美元**。真实任务的成本应把失败重试、回退、工具调用和人工复核都纳入，再除以通过同一验收标准的任务数。考虑 Sol 首轮、失败后转 Astra 时，若两者单次成本固定为 1∶4，纯模型费用少于直接用 Astra 的条件是升级比例低于 **75%**。比较两条路径时还需要报告各自最终通过率与延迟。这个算例用于说明成本结构，数字并非 Folkbench 实测。[OpenAI API 模型费率](https://developers.openai.com/api/docs/models/compare)

对能够自动校验的补丁、数据转换、报告生成和批处理，Sol 是更值得优先验证的候选。对形式化推导、陌生规则探索和科学计算中的高难子任务，Astra 的优势有多项外部结果支持。对开放式研究决策，最终验收应落实到原始引文、可复算结果、能否区分假设的实验设计，以及模型是否主动报告阻塞和缺失证据。GPT‑6.2 的首发价值主要有两项：高难任务多了一个能力上限更高的选择，可验证任务多了一个成本更低的选择。能否把这个优势兑现，取决于实际交付物如何被检查。
