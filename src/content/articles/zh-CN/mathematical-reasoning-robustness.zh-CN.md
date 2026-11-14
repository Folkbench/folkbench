---
slug: mathematical-reasoning-robustness
translationKey: mathematical-reasoning-robustness
locale: zh-CN
kind: article
title: "换个数字，推理还成立吗？GSM-Symbolic 与数学能力评测"
description: "区分数学答题、算术执行与推理稳健性，解读 GSM-Symbolic 的证据边界，并设计可核验的题目变体、配对统计和工具使用对照。"
category: 评测方法
tags: [数学, 推理, 基准]
authorId: iris-wu
modelIds: []
benchmarkSlugs: []
relatedSlugs: [llm-benchmark-rankings-contamination, long-context-effective-understanding]
publishedAt: '2026-11-14'
updatedAt: '2026-11-14'
sources:
  - id: gsm-symbolic
    label: Mirzadeh 等，GSM-Symbolic，2025 修订版
    url: https://arxiv.org/abs/2410.05229v2
    checkedAt: '2026-11-14'
    claimScope: official
  - id: irrelevant-context
    label: Shi 等，Large Language Models Can Be Easily Distracted by Irrelevant Context，2023
    url: https://proceedings.mlr.press/v202/shi23a.html
    checkedAt: '2026-11-14'
    claimScope: official
  - id: causal-robustness
    label: Stolfo 等，A Causal Framework to Quantify the Robustness of Mathematical Reasoning with Language Models，2023
    url: https://aclanthology.org/2023.acl-long.32/
    checkedAt: '2026-11-14'
    claimScope: official
  - id: frontiermath
    label: Glazer 等，FrontierMath，2025 修订版
    url: https://arxiv.org/abs/2411.04872v7
    checkedAt: '2026-11-14'
    claimScope: official
  - id: error-bars
    label: Miller，Adding Error Bars to Evals，2024
    url: https://arxiv.org/abs/2411.00640v1
    checkedAt: '2026-11-14'
    claimScope: official
  - id: construct-validity
    label: Bean 等，Measuring what Matters，2025
    url: https://arxiv.org/abs/2511.04703v1
    checkedAt: '2026-11-14'
    claimScope: official
---

一道题答对，只证明那次回答符合答案。若把名字换掉、数字稍作调整，或者加入一句不影响求解的信息，结果就不稳定，我们需要进一步解释模型究竟在哪一步失败。数学评测的价值不只在题目越来越难，也在于能够控制条件、定位差异。

本文核对资料截至 2026-11-14，讨论论文方法与可执行的评测设计。Folkbench 本轮未运行模型；下文的题目和数值均为明确标注的教学示例，不是模型成绩。

## 数学能力不是一个不可拆分的分数

解决文字题通常包含识别数量与单位、理解关系、建立表达式、执行计算和按要求给出答案。任何一步出错都可能得到相同的零分。因此，最终答案准确率适合衡量交付结果，却不足以独立解释错误机制。

例如，模型建立了正确表达式但算错乘法，与使用了错误关系却偶然得到正确数字，是不同情况。分析时可以检查可观察的表达式和答案，但不能把流畅的推理文字当成模型内部计算过程的完整记录。涉及工具时，还要观察调用是否正确以及工具结果有没有被正确使用。

## GSM-Symbolic 让“同类题”成为可控变量

[GSM-Symbolic](https://arxiv.org/abs/2410.05229v2) 从 GSM8K 题目构建符号模板，再生成多个实例。论文的实验设计使用 100 个模板，每个模板生成 50 个实例，形成 5,000 个样本。数字和名称变化、条件复杂度以及无关信息，提供了观察稳定性的不同切面。

值得借鉴的是“固定关系、改变表面条件”的方法，而不是从一张历史结果表推断所有后续模型。论文研究的是特定模型与协议；其分数不代表 2026 年所有系统。作者关于推理机制的解释，也需要与行为层面的观察分开。

更早的[无关上下文研究](https://proceedings.mlr.press/v202/shi23a.html)和[数学推理稳健性的因果分析框架](https://aclanthology.org/2023.acl-long.32/)提供了相关研究路径。多个研究可以共同支持开展受控诊断，但不能仅凭模型受到干扰，就宣布它在所有任务上没有推理能力。

## 什么才是有效的题目变体

下面是本文原创的教学示例，不属于任何 Benchmark，也没有用于模型测试。原题为：商店有 6 盒铅笔，每盒 8 支，送出 9 支，还剩多少支？标准答案是 `6 × 8 − 9 = 39`。

| 变体 | 改动 | 预期检查 |
| --- | --- | --- |
| 名称变化 | 商店改为学校，物品与数量关系保持不变 | 答案仍为 39 |
| 数值变化 | 改为 7 盒、每盒 6 支、送出 8 支 | 重新计算为 34 |
| 措辞变化 | 调整叙述顺序，保留清楚的指代 | 答案仍为 39 |
| 无关信息 | 增加“盒子是蓝色的” | 答案仍为 39 |

数值变化需要重新生成答案，而不只是替换题干。也不能任意使用负数量、让分配问题突然不可整除，或把一步算术变成大数计算。这样的改动可能改变难度或任务语义。

“无关”尤其需要人工核查。若增加的是“其中两盒已被预订”，读者可能合理地把问题理解为可售库存，答案就不再显然不变。评测者应先确认信息在当前问题下确实不参与求解，再把下降解释为抗干扰不足。无效变体要在看模型成绩前剔除，不能事后只保留容易让某模型失误的题。

## 把评测设计成分层实验

建议先选择多个关系类型和难度层级，再对每个原题构造同样数量的变体。每次只改变一种主要因素，确保能解释差异。开发题用于调整提示与解析器；正式测试题冻结后，不继续依据其成绩挑选提示。

同一轮比较应固定模型快照、语言、提示、工具权限、采样设置、输出预算和作答次数。随机排列题目，并为每道题使用独立上下文，避免前一个变体泄露答案。若研究多轮学习，则应另立协议，不能混入独立答题成绩。

样本量应由希望辨别的效应大小和预算决定。把一个模板复制成很多实例可以测该模板的稳定性，却不能证明覆盖了很多不同推理能力。与其只增加同一题的数量，更应保证关系类型和难度的代表性。

## 同时报告准确率和稳定性

最基本的结果是各类变体的准确率，以及原题与变体之间的配对差。还可以报告“原题和对应变体都答对”的比例，检查成功是否持续。但不能只挑原题答对的样本后直接拿结果比较总体能力；若使用这个条件子集，应明确分母与选择方式。

假设原题准确率是 80%，变体是 68%，则下降为 **12 个百分点**，相对下降为 **15%**。这是解释单位的假设算例，不是 GSM-Symbolic 或 Folkbench 的实验结果。百分比和百分点应在全部语言版本中保持区分。

同一模板的变体共享结构，统计时应保留这种相关性。[Adding Error Bars to Evals](https://arxiv.org/abs/2411.00640v1) 说明了相关题目与配对比较的问题。一个可采用的做法是按模板进行成组重采样，并让两模型在每次重采样中使用相同题组；具体方法、95% 区间和重复生成次数都应公布。

## 计算器对照能帮助诊断，但会改变测量对象

可以设置两个独立实验：一个不提供外部计算工具，另一个提供相同计算器接口，并限制相同调用次数。后者测量的是模型与工具组成的系统，结果应单列。

如果工具显著改善成绩，可以进一步检查原来的错误是否集中在算术执行。但改善不自动证明剩下的推理全部正确；工具调用可能同时改变提示结构、推理路径和时间预算。记录表达式、工具请求及结果使用方式，才能更具体地定位问题。

对于证明任务，数字答案评分尤其不足。证明是否覆盖全部情况、是否使用未经证明的假设，需要另一套验证协议。形式化检查器能核验给定形式系统中的推导，但形式化本身是否忠实表达题意仍需检查。

## 难度与稳健性是两条轴

[FrontierMath](https://arxiv.org/abs/2411.04872v7) 使用专家设计的高难数学问题与可自动核验的答案，提供了不同于基础文字题的研究方向。它适合探索高难任务表现；GSM-Symbolic 则适合研究受控变化下的稳定性。两者不能相互替代。

一个模型可能能解决某些高难题，却在简单任务的措辞变化中出错；另一个可能很稳健，但无法处理更复杂的数学。报告应同时呈现难度层级、变体类型和工具条件，而不是把所有成绩揉成“数学智商”。

本文建议采用的判断标准是：答案正确、关系变化可控、错误能够解释、统计单位合理、资源预算明确。它们让数学评测从展示精彩答案，走向可复核的能力比较。更完整的记录要求见[模型排名的可信度分析](/blog/llm-benchmark-rankings-contamination/)。
