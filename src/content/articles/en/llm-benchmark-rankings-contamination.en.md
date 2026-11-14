---
slug: llm-benchmark-rankings-contamination
translationKey: llm-benchmark-rankings-contamination
locale: en
kind: article
title: "Can you trust model rankings? Contamination and reviewable benchmarks"
description: "How LiveBench, LiveCodeBench, HELM, and evaluation statistics help examine data contamination, budgets, grading, and uncertainty in model comparisons."
category: "Evaluation methods"
tags: [benchmarks, reasoning, reliability]
authorId: iris-wu
modelIds: []
benchmarkSlugs: []
relatedSlugs: [mathematical-reasoning-robustness, long-context-effective-understanding]
publishedAt: '2026-11-14'
updatedAt: '2026-11-14'
sources:
  - id: construct-validity
    label: Bean et al., Measuring what Matters，2025
    url: https://arxiv.org/abs/2511.04703v1
    checkedAt: '2026-11-14'
    claimScope: official
  - id: betterbench
    label: Reuel et al., BetterBench，2024
    url: https://arxiv.org/abs/2411.12990v1
    checkedAt: '2026-11-14'
    claimScope: official
  - id: livebench
    label: White et al., LiveBench，2025 revision
    url: https://arxiv.org/abs/2406.19314v2
    checkedAt: '2026-11-14'
    claimScope: official
  - id: livecodebench
    label: Jain et al., LiveCodeBench，2024
    url: https://arxiv.org/abs/2403.07974v2
    checkedAt: '2026-11-14'
    claimScope: official
  - id: helm
    label: Liang et al., Holistic Evaluation of Language Models
    url: https://arxiv.org/abs/2211.09110v2
    checkedAt: '2026-11-14'
    claimScope: official
  - id: error-bars
    label: Miller, Adding Error Bars to Evals，2024
    url: https://arxiv.org/abs/2411.00640v1
    checkedAt: '2026-11-14'
    claimScope: official
  - id: judge
    label: Zheng et al., Judging LLM-as-a-Judge，2023
    url: https://arxiv.org/abs/2306.05685v4
    checkedAt: '2026-11-14'
    claimScope: official
---

A leaderboard can accurately record one examination and still fail to answer which model fits your work. A score depends on the questions, model version, prompts, tools, inference budget, and grader. Without those conditions, a ranking displayed to several decimal places can support a much weaker conclusion than it appears to.

This article reviews literature and proposes evaluation practices using sources checked on 2026-11-14. Folkbench did not call models or rerun benchmarks for this article. Numerical examples explain methods; they are not measured results. The aim is a reviewable chain of evidence: what is measured, how tasks are constructed, how answers are scored, and which conclusions follow.

## Define the capability before choosing the dataset

Intelligence is too broad to explain through one question or one average. Professional knowledge, unfamiliar rule induction, executable code, and extended planning require different tasks and acceptance criteria. Requiring a particular answer format also tests instruction following; solving a visual problem adds perception.

[Measuring what Matters](https://arxiv.org/abs/2511.04703v1), a review of 445 benchmarks, examines this through construct validity: whether an observed score supports the intended interpretation of a capability. [BetterBench](https://arxiv.org/abs/2411.12990v1) provides a framework for assessing benchmark quality. Publication venue and institutional reputation help identify useful reading, but cannot replace inspecting tasks and graders.

A practical research question might ask whether a model can solve multistep problems from supplied material without external search. That is easier to test than whether it is intelligent, and makes it easier to distinguish missing knowledge, overlooked evidence, and reasoning errors.

## Contamination extends beyond memorizing the exact question

The most direct form puts test questions and answers into training data. Related exercises, solution tutorials, or public evaluation traces may also help on the target task. Repeatedly adjusting methods against a public leaderboard creates another problem: methods can gradually overfit the examination even without directly training on its questions.

Consequently, a high score on old questions does not automatically establish memorization, and a lower score on new questions does not by itself prove contamination. Difficulty, task format, and domain can differ. An investigation should match these conditions where possible and identify the training data it cannot observe. For a closed model whose complete training set is unavailable, the honest status is unknown, rather than verified contamination-free.

The [revised LiveBench paper](https://arxiv.org/abs/2406.19314v2) uses regularly updated tasks and objectively checkable answers; its title says Contamination-Limited. [LiveCodeBench](https://arxiv.org/abs/2403.07974v2) continually collects programming competition problems with publication dates. These designs reduce particular exposure risks. Once a new question becomes public, however, it may enter later training or tuning processes.

Dynamic datasets also complicate comparisons over time. If different months use different questions, a score change mixes model changes with examination changes. Preserve dataset versions and compare on a common question set, or report a fixed reference set and a fresh set separately. The reference set's growing exposure remains a limitation.

## Turn equal conditions into an explicit protocol

One model name can cover different snapshots, service endpoints, and reasoning settings. Record the actual API ID, available version information, test date, system prompt, sampling settings, output limit, tools, and retry policy. Do not invent undisclosed routing details or internal compute budgets.

Two useful views can coexist: models under one shared protocol, and each system's best configuration within a declared budget. The former helps attribute differences; the latter helps purchasing decisions. Label them separately. Equal maximum token counts do not imply equal compute, because tokenizers and internal reasoning mechanisms differ.

[HELM](https://arxiv.org/abs/2211.09110v2) combines standardized scenarios and conditions with accuracy, calibration, robustness, and efficiency. Following that approach, report costs, latency, and failures alongside quality. Include failed attempts and tool calls in the cost definition, rather than counting only the final successful attempt.

## The grader can introduce errors too

Use verifiable scoring rules when reference answers exist, while checking those references. Executable tests can miss requirements or insist on one implementation. Exact string matching can reject a semantically correct answer. Freeze the grader version, answer extraction rules, and exception handling.

Open-ended tasks require more judgment. [Judging LLM-as-a-Judge](https://arxiv.org/abs/2306.05685v4) examines position, verbosity, and self-preference biases. Anonymous answers, swapped presentation order, explicit rubrics, and human review of disputed cases can improve the process. Agreement between a model judge and human preferences is not factual accuracy.

Record incorrect answers, formatting failures, refusals, timeouts, and service errors separately. Decide before running the evaluation how each affects the main score. Accuracy calculated only on successful responses, with many timeouts omitted, overstates the reliability of the service as a whole.

## Small differences need paired analysis

Imagine 200 common questions: model A answers 160 correctly and B answers 156 correctly. This is a hypothetical example. The gap is 2 percentage points, but these totals do not establish how stable it is. We also need to know which questions each model solved and whether the questions are independent.

[Adding Error Bars to Evals](https://arxiv.org/abs/2411.00640v1) discusses paired comparisons, correlated questions, and experiment planning. With a shared test set, analyze the score difference for each question. Group variants derived from one template rather than treating many similar questions as equally many independent observations. Repeated generations estimate sampling variability; they do not repair inadequate domain coverage.

Report a 95% confidence interval for the difference, explaining the calculation and sampling unit. An interval containing zero does not establish superiority, but also does not establish equivalence. When comparing many models or subcategories, address the risk of repeatedly searching for a statistically significant result.

## What a reviewable result card should contain

| Item | Evidence to preserve | Consequence if missing |
| --- | --- | --- |
| Capability definition | Target task, user scenario, exclusions | General capability claims are unsupported |
| Dataset identity | Version, dates, provenance, grouping | The examinations may not be comparable |
| Execution protocol | Model version, prompts, tools, budgets, attempts | Model and system effects remain mixed |
| Scoring protocol | References, grader version, review rules | Scoring mistakes are hard to exclude |
| Uncertainty | Sample size, paired differences, intervals, repeated runs | Small gaps may be overstated |
| Cost and failures | Total spend, time, failure types, coverage | A strong success score may hide unavailability |

This is a proposed editorial and experimental record, not a certification of existing leaderboards. Keep sensitive raw records in a controlled environment; publish redacted evidence and protocols sufficient to examine the conclusions.

## Use rankings to narrow the decision

A credible benchmark can identify candidate models and capability gaps. Selection should still reflect your task distribution: which failures are unacceptable, which latency and costs fit, and whether a model update changes the outcome.

Folkbench's editorial recommendation is to present results by capability before considering a composite score. If weights are used, publish them and examine whether reasonable changes alter the ranking. Ties or an explicit inability to distinguish models are more useful than unsupported precision.

Read the companion articles on [mathematical reasoning robustness](/en/blog/mathematical-reasoning-robustness/) and [effective long-context understanding](/en/blog/long-context-effective-understanding/) for concrete applications of these principles.
