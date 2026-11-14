---
slug: mathematical-reasoning-robustness
translationKey: mathematical-reasoning-robustness
locale: en
kind: article
title: "Does the reasoning survive different numbers? Evaluating mathematical robustness"
description: "A careful reading of GSM-Symbolic, with controlled problem variants, paired statistics, calculator conditions, and the boundaries of mathematical capability claims."
category: "Evaluation methods"
tags: [mathematics, reasoning, benchmarks]
authorId: iris-wu
modelIds: []
benchmarkSlugs: []
relatedSlugs: [llm-benchmark-rankings-contamination, long-context-effective-understanding]
publishedAt: '2026-11-14'
updatedAt: '2026-11-14'
sources:
  - id: gsm-symbolic
    label: Mirzadeh et al., GSM-Symbolic，2025 revision
    url: https://arxiv.org/abs/2410.05229v2
    checkedAt: '2026-11-14'
    claimScope: official
  - id: irrelevant-context
    label: Shi et al., Large Language Models Can Be Easily Distracted by Irrelevant Context，2023
    url: https://proceedings.mlr.press/v202/shi23a.html
    checkedAt: '2026-11-14'
    claimScope: official
  - id: causal-robustness
    label: Stolfo et al., A Causal Framework to Quantify the Robustness of Mathematical Reasoning with Language Models，2023
    url: https://aclanthology.org/2023.acl-long.32/
    checkedAt: '2026-11-14'
    claimScope: official
  - id: frontiermath
    label: Glazer et al., FrontierMath，2025 revision
    url: https://arxiv.org/abs/2411.04872v7
    checkedAt: '2026-11-14'
    claimScope: official
  - id: error-bars
    label: Miller, Adding Error Bars to Evals，2024
    url: https://arxiv.org/abs/2411.00640v1
    checkedAt: '2026-11-14'
    claimScope: official
  - id: construct-validity
    label: Bean et al., Measuring what Matters，2025
    url: https://arxiv.org/abs/2511.04703v1
    checkedAt: '2026-11-14'
    claimScope: official
---

A correct answer establishes that one response matched the expected result. If changing names, adjusting numbers, or adding an irrelevant sentence makes performance unstable, the next question is where the failure occurs. Mathematical evaluation benefits from controlled conditions and diagnostic comparisons, as well as harder problems.

Sources were checked on 2026-11-14. This article discusses research methods and proposed evaluation designs. Folkbench did not run models for it. The questions and numerical examples below are explicitly illustrative, not model scores.

## Mathematical ability contains several components

Solving a word problem usually requires identifying quantities and units, understanding relationships, constructing an expression, calculating, and delivering the answer in the required form. Any failure can produce the same zero score. Final-answer accuracy measures the delivered result, but does not independently explain the mechanism of failure.

A correct expression followed by a multiplication error differs from an incorrect relationship that happens to yield the right number. Inspect observable expressions and answers, without assuming fluent reasoning text fully records the model's internal computation. When tools are available, examine whether the calls are valid and their results are used correctly.

## GSM-Symbolic makes related problems controllable

[GSM-Symbolic](https://arxiv.org/abs/2410.05229v2) builds symbolic templates from GSM8K problems and generates multiple instances. Its experimental design uses 100 templates with 50 instances per template, producing 5,000 examples. Changes to numbers and names, condition complexity, and irrelevant information expose different aspects of stability.

The useful idea is to preserve a relationship while varying surface conditions, rather than extrapolating one historical results table to every later model. The study covers particular models and protocols; its scores do not describe all systems in 2026. Separate the authors' explanations of reasoning mechanisms from observed behavior.

Earlier work on [irrelevant context](https://proceedings.mlr.press/v202/shi23a.html) and a [causal framework for mathematical reasoning robustness](https://aclanthology.org/2023.acl-long.32/) provides related research approaches. Together, these studies motivate controlled diagnosis. Susceptibility to distraction alone does not establish that a model lacks reasoning ability on every task.

## What makes a valid problem variant?

The following is an original teaching example, not a benchmark item or a model test. A shop has 6 boxes of pencils, with 8 pencils in each box, and gives away 9 pencils. How many remain? The reference calculation is `6 × 8 − 9 = 39`.

| Variant | Change | Expected check |
| --- | --- | --- |
| Name | Replace the shop with a school, preserving quantities and relationships | The answer remains 39 |
| Numbers | Use 7 boxes, 6 pencils per box, and give away 8 | Recalculate the answer as 34 |
| Wording | Reorder the description with clear references | The answer remains 39 |
| Irrelevant information | Add that the boxes are blue | The answer remains 39 |

Changing numbers requires regenerating the answer, not merely replacing the question text. Avoid arbitrary negative quantities, making an allocation problem no longer divide evenly, or turning simple arithmetic into a large-number calculation. Such changes can alter difficulty or meaning.

Irrelevance particularly needs human review. Adding that two boxes have already been reserved may reasonably make a reader interpret the question as available inventory. The answer is no longer clearly unchanged. Establish that the added information truly does not affect the task before interpreting a decline as weak distractor resistance. Exclude invalid variants before inspecting scores, rather than selecting only questions that make one model fail.

## Organize the evaluation as a stratified experiment

Choose several relationship types and difficulty levels, then generate the same number of variants for each original problem. Change one main factor at a time so differences remain interpretable. Use development questions to tune prompts and parsers; freeze the formal test set and stop selecting prompts against its scores.

Within a comparison, fix the model snapshot, language, prompts, tool access, sampling settings, output budget, and number of attempts. Randomize question order and use an independent context for each question to prevent one variant leaking an answer to another. If the research concerns learning across turns, define a separate protocol rather than mixing it with independent answering.

Sample size should reflect the effect you want to detect and the available budget. Many instances of one template measure stability on that template, not broad coverage of reasoning. Ensure representative relationships and difficulty levels rather than merely multiplying near-duplicates.

## Report accuracy alongside stability

Start with accuracy by variant type and the paired difference between originals and variants. Also consider the share of pairs where both answers are correct, which reveals whether success persists. Do not select only correctly answered originals and then treat the resulting subset as an unconditional comparison. If using that subset, state its denominator and selection rule.

Suppose original accuracy is 80% and variant accuracy is 68%. The decline is **12 percentage points**, or **15% relative**. This hypothetical example explains units; it is not a GSM-Symbolic or Folkbench result. Preserve the distinction between percentages and percentage points in every language.

Variants from one template share structure. Statistical analysis should preserve that dependence. [Adding Error Bars to Evals](https://arxiv.org/abs/2411.00640v1) discusses correlated questions and paired comparisons. One possible approach resamples whole template groups, using the same groups for both models in each resample. Publish the method, 95% intervals, and repeated-generation counts.

## A calculator condition helps diagnosis but changes the system

Two separate experiments can compare answering without external calculation tools and answering with the same calculator interface and call limit. The latter evaluates a model-plus-tool system and deserves its own result.

If tools substantially improve performance, inspect whether previous errors concentrated in arithmetic. Improvement does not prove that all other reasoning is correct: tool access may also change prompts, reasoning paths, and time budgets. Expressions, tool requests, and use of returned results provide more specific evidence.

For proof tasks, numerical answer scoring is especially insufficient. Covering every case and avoiding unproved assumptions requires another verification protocol. A formal checker can validate a derivation within a formal system, but whether the formal statement faithfully expresses the original problem still needs examination.

## Difficulty and robustness are different axes

[FrontierMath](https://arxiv.org/abs/2411.04872v7) uses expert-designed, difficult mathematics problems with automatically verifiable answers. It offers a research direction beyond elementary word problems. FrontierMath explores difficult-task performance; GSM-Symbolic investigates stability under controlled variation. Neither replaces the other.

A model might solve some advanced problems yet fail when a simple task is reworded. Another might be stable but unable to handle greater mathematical complexity. Report difficulty, variant type, and tool conditions separately instead of merging them into a mathematical IQ.

The proposed standard is correct answers, controlled changes to relationships, interpretable errors, appropriate statistical units, and explicit resource budgets. Together they make mathematical evaluation a reviewable comparison rather than a collection of impressive solutions. See [the analysis of leaderboard reliability](/en/blog/llm-benchmark-rankings-contamination/) for the wider reporting requirements.
