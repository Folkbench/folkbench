---
slug: gpt-6-2-astra-sol-deep-dive
translationKey: gpt-6-2-astra-sol-deep-dive
locale: en
kind: benchmark-review
title: "GPT-6.2 Astra and Sol in depth: Reasoning, software engineering, and research"
description: "A source-checked assessment of GPT-6.2 across abstract reasoning, coding agents, academic research, and cost, based on public launch benchmarks."
category: Models
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

GPT-6.2 Astra and Claude Fable 5.2 both scored **174** on the Epoch Capabilities Index at launch. On open-ended jobs drawn from Epoch AI’s own work, Astra averaged **65%** and Fable 5.2 averaged **82%**. In two software engineering evaluations, meanwhile, GPT-6.2 Sol came close to Astra, with the terminal suite costing about one fifth as much to run. Taken together, the results reveal three distinct capabilities: solving hard problems with a prescribed target, delivering work that can be checked, and deciding what evidence is worth pursuing in the first place. [Epoch model results](https://epoch.ai/models/gpt-6-2-astra) · [Epoch workplace evaluation](https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work) · [Terminal-Bench 4.0](https://www.tbench.ai/?version=4)

OpenAI released Astra and Sol on November 17, 2026. This Folkbench review analyzes public results available on November 18. The evaluators produced the measurements, and OpenAI supplied the specifications, prices, and its own comparative claims. Folkbench did not rerun the models. Scores refer to the listed model, reasoning effort, and execution setup. [OpenAI release](https://openai.com/index/introducing-gpt-6-2-astra-sol/)

## What the headline numbers measure

| Evaluation and setting | GPT-6.2 Astra | GPT-6.2 Sol | Capability sampled |
| --- | ---: | ---: | --- |
| Artificial Analysis Intelligence Index v5.0.1, max | 62 | 57 | Composite over nine evaluations |
| ARC-AGI-2, max | 95.8% | 85.8% | Rule induction from grid examples |
| ARC-AGI-3, standard harness, max | 70.3% | 54.9% | Learning through interaction |
| Terminal-Bench 4.0, Codex, max | 62.1% ± 2.3% | 61.5% ± 2.8% | Multistep terminal work |
| Epoch Automation Reports, Codex | 65% | Unevaluated | Quality against internal workplace standards |

[Artificial Analysis release evaluation](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [ARC Prize results](https://arcprize.org/results/openai-gpt-6-2) · [Terminal-Bench leaderboard](https://www.tbench.ai/?version=4) · [Epoch Automation Reports](https://epoch.ai/benchmarks/epoch-automation-reports)

## Intelligence, transfer, and the effect of state

Astra’s **62** on the Artificial Analysis index is **5 points** above the earlier GPT-6 Astra and below Fable 5.2’s **65**. Sol’s **57** matches the earlier Astra on that index at around **15%** of its weighted model cost per task. Epoch’s 174 comes from a different scale. Its Bayesian item-response model estimates capability alongside benchmark difficulty and how strongly each benchmark differentiates systems. An index can summarize relative performance over the tasks it samples. To predict performance on a particular job, look at its closest task family and how the evaluator elicited the result. [Artificial Analysis release evaluation](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [Epoch ECI methodology](https://epoch.ai/data/eci-documentation/methodology)

On ARC-AGI-2, Astra leads Sol by **10.0 percentage points** at max effort. The lead grows to **15.4 points** in the standard ARC-AGI-3 harness, where progress depends on acting and interpreting feedback over several turns. In ARC Prize’s public demo, the standard harness carries forward notes the model chooses to keep. The Provider Adapter also preserves opaque reasoning state and uses compaction on long interactions. In that setup at max, Astra reaches **99.8%** and Sol **98.2%**. Astra’s **100.0%** at xhigh in the adapter corresponds to **56.5%** at xhigh in the standard harness. The result belongs to a configured system. How earlier trials, rejected hypotheses, and action feedback survive across turns can change both absolute performance and the gap between the models. [ARC Prize verified scores and harness notes](https://arcprize.org/results/openai-gpt-6-2)

## Software delivery and professional judgment

With Codex at max on Terminal-Bench 4.0, the models’ point estimates differ by **0.6 percentage points**, and the published uncertainty intervals overlap substantially. The leaderboard lists about **$1,400** for the Astra suite run and **$300** for Sol. Task-paired results and repeated runs would help estimate a dependable performance gap. The visible difference is the cost of the suite runs, which should be distinguished from the cost of any individual job. [Terminal-Bench 4.0](https://www.tbench.ai/?version=4)

Cognition’s FrontierCode 2.0 uses **132 maintainer-authored tasks** and asks whether the patch would be mergeable. Correctness, testing, scope, and repository standards all contribute, and a blocking criterion can zero the score. OpenAI reports a gap within **0.5 percentage points** between Astra and Sol at max, at about a fifth of the cost for Sol. In Artificial Analysis’s separate Coding Agent Index with Codex at max, Astra is flat with its predecessor and Sol drops **3 points** from GPT-6.1 Sol. Its SWE-Atlas-QnA-AA component falls **14 points**, with more omissions of key repository facts. Patch delivery and repository explanation reward different skills. [Cognition methodology](https://cognition.com/frontiercode) · [OpenAI release comparison](https://openai.com/index/introducing-gpt-6-2-astra-sol/) · [Artificial Analysis coding results](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol)

OpenAI also reports Astra leading Fable 5.2 by **5.5 points** on Agents’ Last Exam at **5%** of Fable’s listed cost. The comparison excludes nine Fable tasks that used a fallback model. Epoch’s human-reviewed projects reverse the order by **17 percentage points**, even as Astra improves over the previous Astra’s **56%**. Epoch used a small task suite, one run per model per task, and different agent setups across systems. As evidence about report writing or research delegation, the rubric matters as much as coverage. Did it reward audience fit, sound choices about evidence, and improvements after review? [OpenAI release comparison](https://openai.com/index/introducing-gpt-6-2-astra-sol/) · [Epoch methods and limitations](https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work)

## Academic ability has four layers

**Answering hard disciplinary questions.** In Artificial Analysis’s launch comparison, Astra trails only Fable 5.2 on HLE-Diamond and on the hard subset of CritPt v2 physics problems. Both provide a set question and a target that can be graded. AA-Omniscience adds a measure of what happens when the model fails to answer fully correctly. At max, the reported hallucination rate is **59%** for Astra and **55%** for Sol. The denominator is incorrect, partial, and unattempted responses, and the numerator is incorrect responses. This conditional measure describes a tendency to guess under uncertainty. A citation audit would require checking the literature claims and citations themselves. [Artificial Analysis launch evaluation](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [AA-Omniscience definition](https://artificialanalysis.ai/evaluations/omniscience)

**Producing proofs.** Epoch displays **100%** for Astra on FrontierMath Tier 4 v2, compared with **98%** for the earlier Astra at the displayed precision. On FrontierMath Erdős it lists **10%** and **3%**, respectively. That benchmark started with 68 open problems and verifies submitted Lean proofs or disproofs. As the tiered benchmark approaches saturation, the open-problem set still separates models. A verified proof establishes a result for the formal statement. Scientific credit also depends on whether the formalization captures the intended problem and whether the result adds to the literature. [Epoch Astra results](https://epoch.ai/models/gpt-6-2-astra) · [FrontierMath Erdős](https://epoch.ai/benchmarks/frontiermath-erdos)

**Running the research workflow.** Artificial Analysis reports **78.6%** at xhigh and **78.1%** at max for Astra on Terminal-Bench-Science 0.1. The 70 expert-reviewed tasks ask for outputs that can be tested in a terminal. This is evidence for handling research tools and producing verifiable artifacts. The two point estimates also illustrate why the best reasoning budget depends on the task and execution setup. [Terminal-Bench-Science 0.1](https://artificialanalysis.ai/evaluations/terminal-bench-science)

**Designing the research.** Epoch asked models to invent chess variants with genuinely unfamiliar rules so that a study could test out-of-distribution generalization. Astra mostly relabeled pieces while preserving the underlying rules. The proposed design could therefore reward familiarity with chess even when the research question required something else. Epoch also observed limited iteration after first attempts. OpenAI’s system card places Astra at its High threshold for AI self-improvement and Sol below that threshold. The rating is evidence about work in a specified AI research environment. Through independent open-ended studies, researchers can evaluate whether the model also devises controls and revises hypotheses on its own. [Epoch qualitative findings](https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work) · [OpenAI system card](https://deploymentsafety.openai.com/gpt-6-2-astra-sol)

## Cost per accepted result

Both APIs list a **1,050,000-token** window, **922,000** maximum input, and **128,000** maximum output. With standard short-context pricing in dollars per million tokens, Astra charges **8 / 0.40 / 40** for uncached input, cache reads, and output, respectively. Sol charges **2 / 0.10 / 10**. Over **272K** input tokens, the input and cache rates double and output is billed at **1.5×** for the full request. The advertised context window is a capacity limit. Reliable use of evidence across that window calls for tests that require finding exact passages, resolving conflicting statements, and citing the text. [Astra API specifications](https://developers.openai.com/api/docs/models/gpt-6.2-astra) · [Sol API specifications](https://developers.openai.com/api/docs/models/gpt-6.2-sol)

A short-context call with 100,000 uncached input tokens and 10,000 billed output tokens, before cache-write and tool costs, comes to **$1.20** on Astra and **$0.30** on Sol. At a fixed 1:4 per-attempt cost, a Sol-first strategy with one Astra retry costs less in model fees than Astra-first if fewer than **75%** of tasks escalate. That arithmetic assumes an identical fixed cost for each Astra attempt. Actual selection should compare final acceptance rates, latency, and human review costs as well. Sol is a strong first candidate where assertions or acceptance tests can detect failure. Astra has stronger evidence for unfamiliar rule discovery and difficult formal and scientific tasks. In open-ended research, source verification and experimental validity remain part of acceptance for either model. [OpenAI API rates](https://developers.openai.com/api/docs/models/compare)
