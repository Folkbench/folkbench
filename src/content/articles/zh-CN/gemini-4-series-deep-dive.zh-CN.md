---
slug: gemini-4-series-deep-dive
translationKey: gemini-4-series-deep-dive
locale: zh-CN
kind: benchmark-review
title: "Gemini 4 系列深度测评：Argon、Carbon、Hydrogen 与 Neon 的智力结构"
description: "交叉核对 Google 模型卡与 Artificial Analysis、Epoch AI、ARC Prize、Terminal-Bench 的公开结果，拆解 Gemini 4 四款模型在综合智力、抽象推理、数学与科研、工程、长上下文和安全上的能力结构，以及推理预算与评测口径如何改变结论。"
category: 模型
tags: [benchmarks, reasoning, research, long-context]
authorId: iris-wu
modelIds: [gemini-4-neon, gemini-4-carbon, gemini-4-hydrogen, gemini-4-argon]
benchmarkSlugs: []
relatedSlugs: [gpt-6-2-astra-sol-deep-dive, mathematical-reasoning-robustness, long-context-effective-understanding]
publishedAt: '2026-11-19'
updatedAt: '2026-11-19'
sources:
  - id: google-neon
    label: Google · Introducing Gemini 4 Neon
    url: https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: google-carbon
    label: Google · Gemini 4 Carbon announcement
    url: https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: google-argon
    label: Google · Gemini 4 Argon announcement
    url: https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: google-hydrogen
    label: Google · Introducing Gemini 4 Hydrogen
    url: https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: card-neon
    label: Google DeepMind · Gemini 4 Neon model card
    url: https://deepmind.google/models/model-cards/gemini-4-neon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: card-carbon
    label: Google DeepMind · Gemini 4 Carbon model card
    url: https://deepmind.google/models/model-cards/gemini-4-carbon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: card-argon
    label: Google DeepMind · Gemini 4 Argon model card
    url: https://deepmind.google/models/model-cards/gemini-4-argon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: aa-neon
    label: Artificial Analysis · Gemini 4 Neon launch evaluation
    url: https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain
    checkedAt: '2026-11-19'
    claimScope: observed
  - id: epoch-carbon
    label: Epoch AI · Gemini 4 Carbon results
    url: https://epoch.ai/models/gemini-4-carbon
    checkedAt: '2026-11-19'
    claimScope: observed
  - id: arc-carbon
    label: ARC Prize · Verified Gemini 4 Carbon results
    url: https://arcprize.org/results/google-gemini-4-carbon
    checkedAt: '2026-11-19'
    claimScope: observed
  - id: arc-argon
    label: ARC Prize · Verified Gemini 4 Argon results
    url: https://arcprize.org/results/google-gemini-4-argon
    checkedAt: '2026-11-19'
    claimScope: observed
  - id: terminal-bench
    label: Terminal-Bench · 4.1 leaderboard
    url: https://www.tbench.ai/?version=4
    checkedAt: '2026-11-19'
    claimScope: observed
---

在 Artificial Analysis 的 Intelligence Index v5.0.1 里，如果把跑完整套指数的输出 token 都控制在 1.1 亿到 1.24 亿之间，Gemini 4 Argon（high）得 **50** 分，Hydrogen（high）**51** 分，Carbon（medium）**58** 分，Neon（high）**60** 分。四款模型的知识截止同为 2026 年 3 月。按 Google 的模型卡，Carbon 基于 Argon，Hydrogen 与 Neon 由 Carbon 改造而来。ARC‑AGI‑3 标准执行环境中，Carbon 在同为 low 档时比 Argon 高 **15.3 个百分点**；Epoch AI 记录的 FrontierMath Tier 4 差距是 **17 个百分点**。七周、四次发布、同一个知识截止日期，让 Gemini 4 系列几乎成了一场关于后训练与推理预算的公开实验。它也提醒读者，按相同预算比较和按相同档位名称比较，会得到两张不同的排行榜。[Artificial Analysis Neon 首发评测](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain) · [ARC Prize Carbon 核验结果](https://arcprize.org/results/google-gemini-4-carbon) · [Epoch Carbon 模型数据](https://epoch.ai/models/gemini-4-carbon)

Google 于 9 月 30 日公布 Argon，10 月 28 日公布 Carbon 并在 11 月 10 日全面开放，11 月 12 日和 18 日相继发布 Hydrogen 与 Neon。本文以 11 月 19 日可查的公开结果为证据，属于 Folkbench 的二次分析。模型卡和发布稿中的分数由 Google 报告，其中对照模型的分数有的由 Google 执行，有的标注为第三方代跑。Artificial Analysis、Epoch AI、ARC Prize 与 Terminal-Bench 的结果归各评测方。Folkbench 本轮未重跑模型。文中百分比沿用各榜单的定义，凡涉及推理档位、执行环境或评测执行方，结论都只在对应设置内成立。[Google Argon 发布稿](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/) · [Google Carbon 全面开放](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/) · [Google Neon 发布稿](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/)

## 一个底座，四次后训练

| 模型 | 公布日期 | 官方定位 | 模型卡写明的来源 | API 标价（输入 / 输出，每百万 token） | AA 指数 v5.0.1 最高档 |
| --- | --- | --- | --- | --- | ---: |
| Gemini 4 Argon | 9 月 30 日 | 编程、企业知识工作与网络防御 | 新训练的稀疏 MoE 模型 | 推广价 2 / 10 美元，之后 4 / 20 美元 | 50（high） |
| Gemini 4 Carbon | 10 月 28 日，11 月 10 日全面开放 | 长程任务与网络安全 | 基于 Argon | 2 / 10 美元至 11 月 30 日，之后 4 / 20 美元 | 60（high） |
| Gemini 4 Hydrogen | 11 月 12 日 | 快速的日常执行 | 由 Carbon 改造 | 1.50 / 7.50 美元 | 54（xhigh） |
| Gemini 4 Neon | 11 月 18 日 | 兼顾深度与效率 | 由 Carbon 改造 | 3 / 15 美元 | 61（xhigh） |

[Argon 模型卡](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Carbon 模型卡](https://deepmind.google/models/model-cards/gemini-4-carbon/) · [Hydrogen 模型卡](https://deepmind.google/models/model-cards/gemini-4-hydrogen/) · [Neon 模型卡](https://deepmind.google/models/model-cards/gemini-4-neon/)

Argon 的模型卡给出了这一代唯一一份架构说明：大规模稀疏混合专家（MoE）Transformer，原生支持文本、视觉与音频输入，是新训练的模型，而非旧模型的微调。它在 TPU 上用 JAX 与 ML Pathways 训练，后训练包括指令微调、人类偏好数据，以及覆盖多步推理、问题求解与定理证明数据的强化学习。Carbon 的模型卡把架构、训练数据和硬件细节全部指回 Argon；Hydrogen 与 Neon 的模型卡写明由 Carbon 改造（adapted from），细节再指回 Carbon。四款模型的上下文都是输入与输出合计最多 100 万 token。[Argon 模型卡](https://deepmind.google/models/model-cards/gemini-4-argon/)

这个结构决定了系列内进步的解读方式。知识截止没有变化，Argon 到 Carbon 的提升就不能归因于新增的世界知识，更可能来自后训练数据、强化学习和推理配置的改变。Google 没有公开参数量，也没有说明“改造”具体是蒸馏、继续训练还是其他方法，所以 Hydrogen 与 Neon 的规模和训练路径无法从公开材料推断。能确定的是，这一代内部的能力差异，大部分发生在预训练之后。

## 智力维度：同一档位名称，不等于同一份推理预算

Carbon 在 10 月 28 日公布时，以 v5.0 指数 **59** 分位列第一。三周后，v5.0.1 重新评分把它记为 **60**，但榜首已是 Claude Fable 5.2 的 **65**，其后是 GPT‑6.2 Astra 的 **62** 和 Neon 的 **61**；Claude Opus 5.5 为 **59**，GPT‑6.2 Sol 为 **57**。Epoch AI 的 ECI 给出相近的位置：Carbon **170**，在 241 个跟踪模型中排第 3；Argon **167**，Fable 5.2 **174**，GPT‑6 Astra **169**。两套指数的方法不同，都把 Carbon 放在第一梯队、略低于当前领先者。截至 11 月 19 日，Epoch 尚未发布 Neon 的记录，Hydrogen 已有单项成绩但还没有 ECI。综合指数的排名以周计变化，单个“第一”的说服力有限。[Google Carbon 发布稿](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/) · [Artificial Analysis GPT‑6.2 首发评测](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [Neon 模型卡](https://deepmind.google/models/model-cards/gemini-4-neon/) · [Epoch Carbon 模型数据](https://epoch.ai/models/gemini-4-carbon)

更有信息量的是各推理档位的曲线。下表括号内是跑完整套指数消耗的输出 token。

| AA 指数 v5.0.1 | Neon | Hydrogen | Carbon | Argon |
| --- | ---: | ---: | ---: | ---: |
| low | 44（2,830 万） | 27（2,030 万） | 54（8,390 万） | 未列出 |
| medium | 55（6,290 万） | 41（5,440 万） | 58（1.24 亿） | 48（8,170 万） |
| high（默认） | 60（1.23 亿） | 51（1.10 亿） | 60（2.05 亿） | 50（1.13 亿） |
| xhigh | 61（2.83 亿） | 54（3.04 亿） | 无此档 | 无此档 |

[Neon 档位数据](https://artificialanalysis.ai/models/gemini-4-neon) · [Hydrogen 档位数据](https://artificialanalysis.ai/models/releases/gemini-4-hydrogen) · [Carbon 档位数据](https://artificialanalysis.ai/models/gemini-4-carbon) · [Argon 档位数据](https://artificialanalysis.ai/models/gemini-4-argon)

第一，边际收益递减很快。Neon 从 high 到 xhigh，输出 token 增加到 **2.3 倍**，指数只多 **1 分**，单任务耗时从 14.8 分钟升到 21.5 分钟；Hydrogen 同一步多花 **2.8 倍** token，换来 **3 分**。第二，档位名称不是预算单位。Carbon 的 low 档用掉 8,390 万 token，比 Neon 的 medium 档还多。若按相近的总预算对齐，四款模型依次是 Argon 50、Hydrogen 51、Carbon 58、Neon 60，这比“都用默认档”更能说明后训练带来的提升。这个比较也有局限：token 是整套指数的合计，没有逐题对齐；各模型输出速度不同，Neon high 约每秒 101 token，Carbon 每秒 55 至 58 token，同样的 token 意味着不同的等待时间。

第三，小模型对预算更敏感。Hydrogen 从 low 到 high 跨越 **24 分**，Neon 跨越 **16 分**，Carbon 只跨越 **6 分**。对 Hydrogen 这样的快速模型，选错档位造成的落差，可能比换一款模型还大。

## 抽象推理：在 ARC‑AGI‑3 上，想得更久不一定更好

| ARC Prize 核验结果 | Gemini 4 Argon | Gemini 4 Carbon |
| --- | ---: | ---: |
| ARC‑AGI‑2，low / medium / high | 42.1% / 87.1% / 91.3% | 49.6% / 94.2% / 92.1% |
| ARC‑AGI‑3 标准执行环境，low / medium | 49.8% / 46.3% | 65.1% / 63.9% |
| ARC‑AGI‑3 标准执行环境，high | 未计入（55 局完成 19 局） | 未计入（55 局完成 30 局） |
| ARC‑AGI‑3 Provider Adapter，low / medium / high | 97.5% / 97.3% / 97.3% | 97.7% / 99.1% / 96.9% |

[ARC Prize Argon 核验结果](https://arcprize.org/results/google-gemini-4-argon) · [ARC Prize Carbon 核验结果](https://arcprize.org/results/google-gemini-4-carbon)

这组结果有三处值得注意。其一，档位与分数并不单调：Carbon 在 ARC‑AGI‑2 上 medium 高于 high，在 ARC‑AGI‑3 标准环境中 low 高于 medium，Argon 在 ARC‑AGI‑3 也是 low 最高。其二，最高档在交互环境中会直接失效。Carbon 的 high 档因两次行动之间间隔过长，对局会话过期，只完成了 30 局；Argon 的 high 档因 API 问题只完成 19 局。静态问答里多想一会儿只多花钱，交互环境里还要消耗环境时间。其三，执行环境的差距远大于代际差距。Carbon 在 Provider Adapter 下达到 **99.1%**，标准环境最高 **65.1%**，相差约 **34 个百分点**。按 ARC Prize 的说明，标准环境只允许模型保留自己选择记下的笔记，Provider Adapter 则在请求之间保存不透明的推理状态，并在长对话中压缩上下文。

逐个环境看，失分集中在少数游戏。标准环境下，G50T 在 Argon 与 Carbon 的 low、medium 档都是 **0.0%**，BP35 都不超过 **1.0%**，TU93 都不超过 **5.3%**；同样三款游戏在 Provider Adapter 下大多是 100%。总分升了 15 个百分点，这几款游戏却几乎没动。一个合理但尚未验证的解读是：它们卡在跨步骤保存状态，而非单步推理，代际提升主要发生在原本就能部分完成的环境里。作为参照，GPT‑6.2 Astra 在标准环境 max 档为 **70.3%**，GPT‑6.2 Sol 为 **54.9%**，Carbon 处在两者之间。[ARC Prize GPT‑6.2 核验结果](https://arcprize.org/results/openai-gpt-6-2)

## 学术维度：知识校准、数学与科学执行

| Epoch AI 记录 | Gemini 4 Argon | Gemini 4 Carbon | Gemini 4 Hydrogen | GPT‑6 Astra | Claude Fable 5.2 |
| --- | ---: | ---: | ---: | ---: | ---: |
| GPQA Diamond | 96% | 97% | 97% | 96% | 96% |
| SimpleQA Verified | 76% | 78% | 71% | 76% | 94% |
| FrontierMath Tiers 1–3（v2） | 86% | 91% | 88% | 94% | 95% |
| FrontierMath Tier 4（v2） | 78% | 95% | 88% | 98% | 100% |
| FrontierMath Erdős | 1% | 3% | 未测 | 3% | 未测 |
| Chess Puzzles | 59% | 78% | 60% | 76% | 79% |
| EBR‑bench（Earthborne Rangers） | 65% | 88% | 70% | 76% | 90% |

[Epoch Carbon 模型数据](https://epoch.ai/models/gemini-4-carbon) · [Epoch Hydrogen 模型数据](https://epoch.ai/models/gemini-4-hydrogen)

**知识与校准。** GPQA Diamond 已经难以区分前沿模型，表中五款都在 96% 到 97% 之间。更有区分度的是事实回忆，以及答不上来时怎么做。在 Epoch 的 SimpleQA Verified 上，Carbon 为 **78%**，比 Fable 5.2 低 **16 个百分点**。而在 Artificial Analysis 的 AA‑Omniscience v1.1 中，Carbon（medium）与 Argon（high）的幻觉率都是 **4%**，Carbon 为榜单最低。该指标的分母是所有未完全正确的响应，分子是其中直接答错的部分；作为对照，GPT‑6.2 Astra 与 Sol 的 max 档分别为 **59%** 与 **55%**。两项结果出自不同题集，不能合并计算，但方向一致：Gemini 4 未必记得最多，不会时却更倾向于不作答或只给部分答案，较少编造。至少在这类知识问答中，它给出的明确答案出错比例更低；用于文献综述时，覆盖面仍要靠检索补足。[AA‑Omniscience 指标定义与榜单](https://artificialanalysis.ai/evaluations/omniscience)

HLE‑Diamond 是 Carbon 在 v5.0 九项指数评测中排名第一的四项之一。Google 报告 Neon **71.3%**、Opus 5.5 **67.9%**、GPT‑6.2 Sol **64.0%**，Hydrogen **58.8%**，后两组数字都出自 Google 的模型卡。[DeepLearning.AI 对 v5.0 结果的整理](https://www.deeplearning.ai/the-batch/gemini-leads-the-pack-again) · [Neon 模型卡](https://deepmind.google/models/model-cards/gemini-4-neon/)

**数学。** Argon 到 Carbon 在 FrontierMath Tier 4 上提高 **17 个百分点**，是这组数据里最大的代际跳跃，已接近 GPT‑6 Astra 与 Fable 5.2。但 FrontierMath Erdős 只从 **1%** 升到 **3%**。这 68 道题在基准建立时仍是开放问题，提交的证明或反证由 Lean 检查，目前最高是 GPT‑6.2 Astra 的 **10%**。已有标准答案的研究级题目趋于饱和，开放问题仍几乎未被触及。Google 自报的 RiemannBench 从 Argon **76.0%**、Carbon **80.0%** 升到 Neon **84.0%**，方向一致，但属于厂商自测。Epoch 的谜题类评测显示了类似的后训练收益：国际象棋谜题从 59% 升到 78%，EBR‑bench 从 65% 升到 88%。这些任务都要在规则约束下做多步搜索，与 ARC‑AGI‑3 标准环境的提升方向一致。快速版 Hydrogen 的 Tier 4 为 **88%**，比 Argon 高 **10 个百分点**，但谜题类成绩与 Argon 相近，事实回忆 SimpleQA Verified 只有 **71%**。一种可能的解释是，数学这类答案可以自动校验的能力，在改造为快速模型时保留得更完整，而记忆型知识更依赖模型容量；公开材料不足以证实这一点。[FrontierMath Erdős 方法](https://epoch.ai/benchmarks/frontiermath-erdos)

**科学执行。** Terminal‑Bench‑Science 0.1 要求模型在终端中交付可由测试检查的科研产物。Carbon 模型卡中由 Artificial Analysis 代跑的结果是 Carbon **64.8%**、Argon **52.9%**、GPT‑6 Astra **63.3%**、Opus 5.5 **59.0%**。Neon 模型卡报告 Neon **70.5%**，高于 GPT‑6.2 Sol 的 **68.0%** 与 Opus 5.5 的 **63.3%**。Google 称 Neon 同级最佳，这在它选的对照组内成立；放到 Artificial Analysis 的完整榜单上，GPT‑6.2 Astra 的 xhigh 为 **78.6%**，仍高出 **8.1 个百分点**。Hydrogen 为 **51.4%**，低于它的对照 Claude Sonnet 5.5（**59.9%**）。[Terminal‑Bench‑Science 榜单](https://artificialanalysis.ai/evaluations/terminal-bench-science) · [Carbon 模型卡](https://deepmind.google/models/model-cards/gemini-4-carbon/)

## 工程与智能体：执行环境决定了一半答案

Terminal‑Bench 4.1 官方榜上，Carbon（high，Antigravity CLI）为 **64.5% ± 3.2%**，整套运行约 **1,400 美元**；Claude Opus 5.5 与 Fable 5.2 并列 **65.8%**，GPT‑6.2 Astra **62.1%**。Carbon 与榜首的差距在置信区间之内。更有意思的是同门对比：Hydrogen **56.4% ± 3.0%**、约 **800 美元**，Argon **55.5% ± 2.8%**、约 **1,100 美元**，快速模型用约四分之三的整套费用追平了六周前的旗舰。Neon 的 **65.2%** 来自 Google 模型卡，截至 11 月 19 日尚未出现在官方榜单。[Terminal‑Bench 4.1 榜单](https://www.tbench.ai/?version=4)

跨模型卡比较时，要先看是谁跑的。Argon 模型卡中的 Terminal‑bench 4.0 记 Argon **57.4%**、Opus 5.5 **66.4%**；两周后，Carbon 模型卡改用 Artificial Analysis 执行的 Terminal‑Bench 4.0，记 Argon **57.1%**、Opus 5.5 **59.6%**。同一个对照模型在同名基准上相差 **6.8 个百分点**，Argon 自己却几乎不变。若沿用 Argon 卡中 Opus 的 66.4%，Carbon 的 65.2% 并不领先；官方 4.1 榜单上，Carbon 也略低于 Opus。Terminal‑Bench‑Science 也有同样的情况：GPT‑6 Astra 在 Argon 卡中为 **68.1%**，在 Carbon 卡的 AA 代跑口径下为 **63.3%**。[Argon 模型卡](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Carbon 模型卡](https://deepmind.google/models/model-cards/gemini-4-carbon/)

| SWE‑sweep（Neon 模型卡） | mini‑SWE 通用执行环境 | 各厂商自有执行环境 |
| --- | ---: | ---: |
| Gemini 4 Neon | 12.8% | 39.0% |
| Claude Opus 5.5 | 3.6% | 10.1% |
| GPT‑6.2 Sol | 11.6% | 8.3% |

在中立的 mini‑SWE 环境中，Neon 只比 GPT‑6.2 Sol 高 **1.2 个百分点**；换成各家自己的执行环境后，差距扩大到 **30.7 个百分点**。Neon 在 Antigravity 中的分数约为 mini‑SWE 下的 3 倍，Opus 5.5 在自家环境中约为 2.8 倍，Sol 反而下降。厂商自有环境本就是产品的一部分，这组数字衡量的是“模型加工具链”的组合，而不是模型本身。Carbon 模型卡里的 SWE‑sweep 只有一列且未标注执行环境（Carbon **9.6%**、Argon **4.3%**），其中 Opus 5.5 的 3.6% 与 Neon 卡的 mini‑SWE 数值相同，推测为同一口径；若推测成立，系列在 mini‑SWE 上的路径是 4.3%、9.6%、12.8%。[Neon 模型卡](https://deepmind.google/models/model-cards/gemini-4-neon/)

其他编程评测给出更克制的图景。FrontierSWE 2 上 Carbon **61.2%**，低于 GPT‑6 Astra 的 **65.5%** 与 Opus 5.5 的 **62.3%**；FrontierCode 2.0 上 Neon **46.2%**，略低于 Opus 5.5 的 **47.3%**。Artificial Analysis 的 Coding Agent Index 中，Neon（xhigh，Antigravity CLI）以 **59** 分居首，Fable 5.2（xhigh）与 Opus 5.5（max）均为 **58**，平均单任务成本分别为 **6.86**、**15.47** 和 **12.61 美元**，Neon 的优势主要在成本。电脑操作是整个系列较一致的短板：OSWorld‑2.1 离线子集上，Carbon **81.5%** 低于 Opus 5.5 的 **87.2%**，Hydrogen **77.6%** 低于 Claude Sonnet 5.5 的 **83.9%**。[Artificial Analysis Neon 首发评测](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain) · [Hydrogen 模型卡](https://deepmind.google/models/model-cards/gemini-4-hydrogen/)

知识工作方面，Zapier 的 AutomationBench 从 Argon **51.3%**、Carbon **53.9%** 升到 Neon **56.3%**，Vending‑Bench 2 的模拟经营余额从 **13,718 美元**升到 **16,843 美元**。Argon 在 Harvey 法律智能体基准上为 **19.6%**，对照模型都不超过 **6.7%**；领先幅度很大，但绝对值说明这类法律任务离可交付还远。命名也要留意：Hydrogen 卡中的 AutomationBench‑AA（**76.1%**）是 Artificial Analysis 的版本，与 Zapier 版不能直接比较。

## 长上下文与多模态：合成任务领先，真实材料需另行验证

Google 报告的 GraphWalks（256K 至 100 万 token，广度优先遍历，F1）是系列领先幅度最大的一项：Argon **84.2%**、Carbon **96.2%**、Neon **95.2%**，对照的 Opus 5.5 为 **66.8%**、GPT‑6 Astra **71.8%**、GPT‑6.2 Sol **80.1%**；128K 以内 Argon 已达 **99.7%**。GraphWalks 把图的边散布在长输入中，要求模型沿边遍历，衡量长距离定位与串联信息的能力。这项领先说明 Gemini 4 在超长输入中的检索和链接很强，但合成图任务不含语义冲突、文档版本和隐含前提，迁移到合同审阅或多文献综述时，仍需用自己的材料验证。结果为 Google 自测，暂无第三方复现。Neon 与 Hydrogen 默认同步输出最多 6.4 万 token，经后台长解码可达 100 万。[Argon 模型卡](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Neon 模型卡](https://deepmind.google/models/model-cards/gemini-4-neon/)

多模态出现了一处回退。长视频理解 LVBench 上，Argon 为 **91.7%**，由 Carbon 改造的 Neon 为 **89.0%**，仍高于 Opus 5.5 的 **83.7%** 与 GPT‑6.2 Sol 的 **87.6%**，但比自家前代低 **2.7 个百分点**。图表理解 Chartography 上，Neon **73.5%** 低于 Sol 的 **75.1%**。Artificial Analysis 的 GDP.pdf 视觉推理评测再次出现档位不单调：Neon high 为 **33.4%**，xhigh 反而降到 **28.0%**，Carbon high 为 **28.4%**。[Artificial Analysis Neon 首发评测](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain)

## 安全与对齐：网络能力越强，发布越分阶段

网络安全是 Google 着重报告的能力，也是它分阶段发布的原因。漏洞发现 SEC‑bench Pro 从 Argon **83.4%**、Carbon **88.2%** 升到 Neon **90.5%**；漏洞利用 ExploitGym 上，Carbon **54.8%**，Argon **42.0%**。Argon 与 Carbon 都先通过 Fairwind 计划提供给受信任的网络防御方，Google 还向这些防御方和内部团队提供去掉网络安全护栏的版本。[Google Argon 发布稿](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/) · [Google Carbon 发布稿](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/)

Argon 模型卡依据 2026 年 4 月版前沿安全框架给出判定：生物与网络安全两项 Level 1 关键能力等级（CCL）不能排除，Google 为此建立安全论证，评估为在防护措施下低于 CCL；化学、放射与核领域未达到跟踪阈值，机器学习研发加速与自动化均未达到 CCL。Hydrogen 经过针对性测试，CBRN 与网络两项均未达到 CCL，但达到了预警阈值。Neon 的模型卡写明，相对 Argon 的通用能力增量低于“重大能力变化”阈值，因此没有重做完整的关键能力评估，沿用 Argon 的判定。值得注意的是，Neon 在 Artificial Analysis 指数上比 Argon 高 **11 分**；Google 如何设定这个阈值，外部读者无法从公开材料复核。[Argon 模型卡](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Hydrogen 模型卡](https://deepmind.google/models/model-cards/gemini-4-hydrogen/) · [Neon 模型卡](https://deepmind.google/models/model-cards/gemini-4-neon/)

行为层面，Carbon 与 Neon 在 Terminal‑Bench 4.0 上的成功作弊率均为 **0.0%**；Gray Swan 间接提示注入测试中，两者攻击成功率为 **0.0%**（Neon 为最高推理档），Argon 为 **0.7%**。Google 的智能体诚实性测试中，Carbon 通过 **92%** 的任务，Argon 为 **70%**；Neon 与 Hydrogen 分别报告 **99.2%** 与 **94%**，但发布稿没有说明是否为同一题集。Hydrogen 的模型卡也披露了代价：相较 Gemini 3.8 Flash，无依据拒答上升 **5.57 个百分点**，多模态提示尤为明显。[Google Carbon 全面开放](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/) · [Google Neon 发布稿](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/) · [Google Hydrogen 发布稿](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/)

## 成本与选型：按通过验收的任务计价

Hydrogen 每百万 token 输入 **1.50**、输出 **7.50 美元**，整个 100 万 token 窗口统一计价；Neon 为 **3 / 15 美元**，缓存输入 **0.15 美元**；Carbon 推广价 **2 / 10 美元**持续到 11 月 30 日，之后为 **4 / 20 美元**。Argon、Carbon 与 Neon 的缓存输入都是输入价的 5%。按 Artificial Analysis 的单任务成本，Hydrogen xhigh 以 **3.16 美元**得 54 分，Argon high 以 **4.97 美元**（按推广价）得 50 分，Neon xhigh 以 **6.44 美元**得 61 分，Carbon high 以 **7.76 美元**（按标准价）得 60 分。Neon 的 high 档与 Carbon high 同为 60 分，单任务成本不到后者一半。[Google Hydrogen 发布稿](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/) · [Artificial Analysis Neon 首发评测](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain)

一个可复算的例子：单次请求 10 万未缓存输入 token、1 万输出 token，不计工具费，Hydrogen 为 **0.225 美元**，Neon 为 **0.45 美元**，Carbon 推广期为 **0.30 美元**、恢复标准价后为 **0.60 美元**。考虑 Hydrogen 先跑、失败再转 Neon 的路由：单次成本固定为 1∶2 时，只要升级比例低于 **50%**，纯模型费用就低于直接用 Neon；按 Artificial Analysis 的 xhigh 单任务成本（3.16 对 6.44 美元），临界点约为 **51%**。实际比较还要计入重试、延迟和最终通过率。此算例只用于说明成本结构，数字并非 Folkbench 实测。

对能自动验收的批量任务，Hydrogen 最值得先验证：它在 AA 指数和 Terminal‑Bench 上都追平或超过 Argon，标价更低。对日常编程与知识工作，Neon 在两张模型卡共有的多数评测上与 Carbon 持平或略高（Agents' Last Exam 与 GraphWalks 略低），而且 11 月 30 日之后单价也低于 Carbon。Carbon 仍是长程工程、网络安全和 ARC‑AGI‑3 这类交互任务中证据最充分的一款。无论选哪款，推理档位都应按任务实测：在 ARC‑AGI 和 GDP.pdf 上，最高档并不总是最好。

Gemini 4 的首发价值不在某一项榜首。它用七周时间和同一个知识截止日期，展示了后训练与推理配置能把能力推多远：AA 指数提高 11 分，ARC‑AGI‑3 标准环境提高 15 个百分点，FrontierMath Tier 4 提高 17 个百分点。它也标出了这条路线暂时推不动的地方：开放数学问题仍在个位数，电脑操作落后于 Claude，标准环境下的几款 ARC‑AGI‑3 游戏仍是零分。厂商模型卡会选择对照组和执行方，独立榜单会重新评分、更换版本。这些分数能否兑现，最终取决于你的任务如何验收。
