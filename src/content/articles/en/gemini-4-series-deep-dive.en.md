---
slug: gemini-4-series-deep-dive
translationKey: gemini-4-series-deep-dive
locale: en
kind: benchmark-review
title: "The Gemini 4 series in depth: How Argon, Carbon, Hydrogen, and Neon think"
description: "A source-checked analysis of Google's model cards against Artificial Analysis, Epoch AI, ARC Prize, and Terminal-Bench results, covering general intelligence, abstract reasoning, mathematics and science, engineering, long context, and safety, and showing how reasoning budget and evaluation setup change the conclusions."
category: Models
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

On the Artificial Analysis Intelligence Index v5.0.1, hold the output tokens spent on the full index between 110 and 124 million and the Gemini 4 models line up like this: Argon (high) **50**, Hydrogen (high) **51**, Carbon (medium) **58**, Neon (high) **60**. All four share a March 2026 knowledge cutoff. According to Google's model cards, Carbon is based on Argon, and Hydrogen and Neon are adapted from Carbon. In the ARC‑AGI‑3 standard harness, Carbon beats Argon by **15.3 percentage points** at the same low setting; on FrontierMath Tier 4, Epoch AI records a **17‑point** gap. Seven weeks, four releases, one knowledge cutoff: the Gemini 4 series is close to a public experiment in post-training and reasoning budget. It is also a reminder that ranking models at equal budget and ranking them at equal setting names produce two different leaderboards. [Artificial Analysis Neon launch evaluation](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain) · [ARC Prize verified Carbon results](https://arcprize.org/results/google-gemini-4-carbon) · [Epoch Carbon model data](https://epoch.ai/models/gemini-4-carbon)

Google announced Argon on September 30 and Carbon on October 28, opening Carbon to everyone on November 10, then released Hydrogen on November 12 and Neon on November 18. This article uses public results available on November 19 and is a secondary analysis by Folkbench. Model-card and launch-post scores are reported by Google; some comparison-model scores in those tables were run by Google and some are labeled as third-party runs. Results from Artificial Analysis, Epoch AI, ARC Prize, and Terminal-Bench belong to those evaluators. Folkbench did not rerun any model for this piece. Percentages follow each leaderboard's definitions, and any conclusion that depends on reasoning level, harness, or who ran the evaluation holds only in that setting. [Google Argon announcement](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/) · [Google: Carbon now available](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/) · [Google Neon announcement](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/)

## One base, four rounds of post-training

| Model | Announced | Official positioning | Origin stated in model card | API price (input / output per 1M tokens) | Best AA Index v5.0.1 |
| --- | --- | --- | --- | --- | ---: |
| Gemini 4 Argon | Sep 30 | Coding, enterprise knowledge work, cyber defense | Newly trained sparse MoE model | $2 / $10 introductory, then $4 / $20 | 50 (high) |
| Gemini 4 Carbon | Oct 28, generally available Nov 10 | Long-horizon tasks and cybersecurity | Based on Argon | $2 / $10 until Nov 30, then $4 / $20 | 60 (high) |
| Gemini 4 Hydrogen | Nov 12 | Fast everyday execution | Adapted from Carbon | $1.50 / $7.50 | 54 (xhigh) |
| Gemini 4 Neon | Nov 18 | Balance of depth and efficiency | Adapted from Carbon | $3 / $15 | 61 (xhigh) |

[Argon model card](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Carbon model card](https://deepmind.google/models/model-cards/gemini-4-carbon/) · [Hydrogen model card](https://deepmind.google/models/model-cards/gemini-4-hydrogen/) · [Neon model card](https://deepmind.google/models/model-cards/gemini-4-neon/)

The Argon model card holds the generation's only architecture description: a large sparse mixture-of-experts (MoE) Transformer with native text, vision, and audio input, trained as a new model rather than fine-tuned from an earlier one. It was trained on TPUs with JAX and ML Pathways, and post-training included instruction tuning, human preference data, and reinforcement learning on multi-step reasoning, problem-solving, and theorem-proving data. The Carbon card refers all architecture, data, and hardware details back to Argon. The Hydrogen and Neon cards say both are adapted from Carbon and refer back to Carbon in turn. All four support up to 1 million tokens of combined input and output. [Argon model card](https://deepmind.google/models/model-cards/gemini-4-argon/)

This structure shapes how the in-family gains should be read. With no change in knowledge cutoff, the jump from Argon to Carbon cannot come from new world knowledge; it more plausibly comes from changes in post-training data, reinforcement learning, and inference configuration. Google has not disclosed parameter counts, nor whether "adapted" means distillation, continued training, or something else, so the size and training path of Hydrogen and Neon cannot be inferred from public material. What is clear is that most of the capability differences inside this generation arise after pre-training.

## Intelligence: the same setting name is not the same reasoning budget

When Carbon was announced on October 28, it ranked first on Index v5.0 with **59**. Three weeks later, the v5.0.1 regrade puts it at **60**, but the top spot now belongs to Claude Fable 5.2 at **65**, followed by GPT‑6.2 Astra at **62** and Neon at **61**; Claude Opus 5.5 is at **59** and GPT‑6.2 Sol at **57**. Epoch AI's ECI places Carbon similarly: **170**, third of 241 tracked models, against Argon's **167**, Fable 5.2's **174**, and GPT‑6 Astra's **169**. The two indices use different methods, yet both put Carbon in the top tier and slightly behind the current leaders. As of November 19, Epoch has published no Neon record, and Hydrogen has individual results but no ECI yet. Composite rankings shift week to week, so a single "number one" carries limited weight. [Google Carbon announcement](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/) · [Artificial Analysis GPT‑6.2 launch evaluation](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [Neon model card](https://deepmind.google/models/model-cards/gemini-4-neon/) · [Epoch Carbon model data](https://epoch.ai/models/gemini-4-carbon)

The curve across reasoning levels is more informative. Figures in parentheses are output tokens used to run the full index.

| AA Index v5.0.1 | Neon | Hydrogen | Carbon | Argon |
| --- | ---: | ---: | ---: | ---: |
| low | 44 (28.3M) | 27 (20.3M) | 54 (83.9M) | not listed |
| medium | 55 (62.9M) | 41 (54.4M) | 58 (124M) | 48 (81.7M) |
| high (default) | 60 (123M) | 51 (110M) | 60 (205M) | 50 (113M) |
| xhigh | 61 (283M) | 54 (304M) | not offered | not offered |

[Neon by level](https://artificialanalysis.ai/models/gemini-4-neon) · [Hydrogen by level](https://artificialanalysis.ai/models/releases/gemini-4-hydrogen) · [Carbon by level](https://artificialanalysis.ai/models/gemini-4-carbon) · [Argon by level](https://artificialanalysis.ai/models/gemini-4-argon)

First, returns diminish quickly. Moving Neon from high to xhigh multiplies output tokens by **2.3** for **one** more point, and time per task rises from 14.8 to 21.5 minutes; the same step costs Hydrogen **2.8 times** the tokens for **three** points. Second, setting names are not budget units. Carbon's low setting spends 83.9 million tokens, more than Neon's medium. Aligned at a similar total budget, the order is Argon 50, Hydrogen 51, Carbon 58, Neon 60, which says more about post-training gains than comparing everyone at the default. This comparison has limits: token counts are totals across the index rather than matched per task, and output speeds differ. Neon at high produces about 101 tokens per second and Carbon 55 to 58, so the same token count means different waiting times.

Third, the smaller model is more budget-sensitive. Hydrogen spans **24 points** from low to high, Neon **16**, and Carbon only **6**. For a fast model like Hydrogen, picking the wrong level can cost more than switching models.

## Abstract reasoning: on ARC‑AGI‑3, thinking longer is not always better

| ARC Prize verified results | Gemini 4 Argon | Gemini 4 Carbon |
| --- | ---: | ---: |
| ARC‑AGI‑2, low / medium / high | 42.1% / 87.1% / 91.3% | 49.6% / 94.2% / 92.1% |
| ARC‑AGI‑3 standard harness, low / medium | 49.8% / 46.3% | 65.1% / 63.9% |
| ARC‑AGI‑3 standard harness, high | not scored (19 of 55 games completed) | not scored (30 of 55 games completed) |
| ARC‑AGI‑3 Provider Adapter, low / medium / high | 97.5% / 97.3% / 97.3% | 97.7% / 99.1% / 96.9% |

[ARC Prize verified Argon results](https://arcprize.org/results/google-gemini-4-argon) · [ARC Prize verified Carbon results](https://arcprize.org/results/google-gemini-4-carbon)

Three things stand out. First, scores do not rise monotonically with reasoning level: Carbon scores higher at medium than at high on ARC‑AGI‑2, higher at low than at medium in the ARC‑AGI‑3 standard harness, and Argon's best ARC‑AGI‑3 score is also at low. Second, the top setting can fail outright in an interactive environment. At high, Carbon's long gaps between actions caused game sessions to expire, and it completed only 30 games; Argon at high completed only 19 because of API issues. In static question answering, thinking longer only costs money; in an interactive environment it also costs environment time. Third, the harness gap dwarfs the generational gap. Carbon reaches **99.1%** with the Provider Adapter and at most **65.1%** in the standard harness, a difference of about **34 points**. According to ARC Prize, the standard harness lets the model carry forward only the notes it chooses to keep, while the Provider Adapter preserves opaque reasoning state between requests and compacts long conversations.

Game by game, the losses are concentrated. In the standard harness, G50T scores **0.0%** for both Argon and Carbon at low and medium, BP35 stays at or below **1.0%**, and TU93 at or below **5.3%**; with the Provider Adapter the same three games are mostly at 100%. The overall score rose 15 points, but these games barely moved. One plausible but unverified reading is that they hinge on keeping state across steps rather than on single-step reasoning, and the generational gain came mainly from environments that were already partly solvable. For reference, GPT‑6.2 Astra scores **70.3%** in the standard harness at max and GPT‑6.2 Sol **54.9%**, with Carbon in between. [ARC Prize verified GPT‑6.2 results](https://arcprize.org/results/openai-gpt-6-2)

## Academic ability: knowledge calibration, mathematics, and scientific execution

| Epoch AI results | Gemini 4 Argon | Gemini 4 Carbon | Gemini 4 Hydrogen | GPT‑6 Astra | Claude Fable 5.2 |
| --- | ---: | ---: | ---: | ---: | ---: |
| GPQA Diamond | 96% | 97% | 97% | 96% | 96% |
| SimpleQA Verified | 76% | 78% | 71% | 76% | 94% |
| FrontierMath Tiers 1–3 (v2) | 86% | 91% | 88% | 94% | 95% |
| FrontierMath Tier 4 (v2) | 78% | 95% | 88% | 98% | 100% |
| FrontierMath Erdős | 1% | 3% | not tested | 3% | not tested |
| Chess Puzzles | 59% | 78% | 60% | 76% | 79% |
| EBR‑bench (Earthborne Rangers) | 65% | 88% | 70% | 76% | 90% |

[Epoch Carbon model data](https://epoch.ai/models/gemini-4-carbon) · [Epoch Hydrogen model data](https://epoch.ai/models/gemini-4-hydrogen)

**Knowledge and calibration.** GPQA Diamond no longer separates frontier models; all five in the table sit between 96% and 97%. Factual recall, and what a model does when it does not know, separate them more. On Epoch's SimpleQA Verified, Carbon scores **78%**, **16 points** below Fable 5.2. Yet on Artificial Analysis's AA‑Omniscience v1.1, Carbon (medium) and Argon (high) both have a hallucination rate of **4%**, with Carbon the lowest on the board. The denominator of that metric is every response that is not fully correct, and the numerator is the share that is outright wrong; for comparison, GPT‑6.2 Astra and Sol at max are at **59%** and **55%**. The two results come from different question sets and cannot be combined, but they point the same way: Gemini 4 does not necessarily remember the most, yet when it does not know, it tends to abstain or give a partial answer rather than make something up. At least on this kind of knowledge question, its definite answers are wrong less often; for literature reviews, coverage still has to come from retrieval. [AA‑Omniscience definitions and leaderboard](https://artificialanalysis.ai/evaluations/omniscience)

HLE‑Diamond was one of the four Index v5.0 evaluations on which Carbon ranked first. Google reports Neon at **71.3%**, Opus 5.5 at **67.9%**, GPT‑6.2 Sol at **64.0%**, and Hydrogen at **58.8%**; those last figures all come from Google's model cards. [DeepLearning.AI summary of the v5.0 results](https://www.deeplearning.ai/the-batch/gemini-leads-the-pack-again) · [Neon model card](https://deepmind.google/models/model-cards/gemini-4-neon/)

**Mathematics.** From Argon to Carbon, FrontierMath Tier 4 rises **17 points**, the largest generational jump in this data, bringing Carbon close to GPT‑6 Astra and Fable 5.2. FrontierMath Erdős, however, only moves from **1%** to **3%**. Its 68 problems were open when the benchmark was built, and submitted proofs or disproofs are checked in Lean; the current best is GPT‑6.2 Astra at **10%**. Research-level problems with known answers are saturating while open problems remain almost untouched. Google's self-reported RiemannBench rises from Argon's **76.0%** and Carbon's **80.0%** to Neon's **84.0%**, consistent in direction but measured by the vendor. Epoch's puzzle evaluations show similar post-training gains: chess puzzles go from 59% to 78% and EBR‑bench from 65% to 88%. These tasks require multi-step search under rules, matching the direction of the ARC‑AGI‑3 standard-harness gain. The fast Hydrogen scores **88%** on Tier 4, **10 points** above Argon, yet its puzzle scores are close to Argon's and its SimpleQA Verified recall is only **71%**. One possible explanation is that abilities with automatically checkable answers, such as mathematics, survive adaptation into a fast model more fully, while memorized knowledge depends more on model capacity; public material is not enough to confirm this. [FrontierMath Erdős methodology](https://epoch.ai/benchmarks/frontiermath-erdos)

**Scientific execution.** Terminal‑Bench‑Science 0.1 asks a model to deliver research artifacts in a terminal that tests can check. In the Carbon model card, with runs by Artificial Analysis, Carbon scores **64.8%**, Argon **52.9%**, GPT‑6 Astra **63.3%**, and Opus 5.5 **59.0%**. The Neon card reports Neon at **70.5%**, above GPT‑6.2 Sol's **68.0%** and Opus 5.5's **63.3%**. Google calls Neon best in class, which holds within the comparison set it chose; on the full Artificial Analysis leaderboard, GPT‑6.2 Astra at xhigh scores **78.6%**, still **8.1 points** higher. Hydrogen scores **51.4%**, below its comparison model Claude Sonnet 5.5 at **59.9%**. [Terminal‑Bench‑Science leaderboard](https://artificialanalysis.ai/evaluations/terminal-bench-science) · [Carbon model card](https://deepmind.google/models/model-cards/gemini-4-carbon/)

## Engineering and agents: the harness decides half the answer

On the official Terminal‑Bench 4.1 leaderboard, Carbon (high, Antigravity CLI) scores **64.5% ± 3.2%** for about **$1,400** per full run; Claude Opus 5.5 and Fable 5.2 tie at **65.8%**, and GPT‑6.2 Astra scores **62.1%**. Carbon's gap to the top is within the confidence interval. The in-family comparison is more interesting: Hydrogen scores **56.4% ± 3.0%** for about **$800**, and Argon **55.5% ± 2.8%** for about **$1,100**, so the fast model matches the flagship of six weeks earlier at roughly three quarters of the run cost. Neon's **65.2%** comes from Google's model card and had not appeared on the official leaderboard as of November 19. [Terminal‑Bench 4.1 leaderboard](https://www.tbench.ai/?version=4)

When comparing across model cards, check who ran the evaluation first. The Argon card's Terminal‑bench 4.0 row lists Argon at **57.4%** and Opus 5.5 at **66.4%**; two weeks later, the Carbon card switches to Terminal‑Bench 4.0 run by Artificial Analysis and lists Argon at **57.1%** and Opus 5.5 at **59.6%**. The same comparison model differs by **6.8 points** on a benchmark with the same name, while Argon's own score barely changes. Using the Argon card's 66.4% for Opus, Carbon's 65.2% would not lead, and on the official 4.1 leaderboard Carbon is also slightly behind Opus. Terminal‑Bench‑Science shows the same pattern: GPT‑6 Astra is **68.1%** in the Argon card and **63.3%** under the AA-run figures in the Carbon card. [Argon model card](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Carbon model card](https://deepmind.google/models/model-cards/gemini-4-carbon/)

| SWE‑sweep (Neon model card) | mini‑SWE neutral harness | Each vendor's own harness |
| --- | ---: | ---: |
| Gemini 4 Neon | 12.8% | 39.0% |
| Claude Opus 5.5 | 3.6% | 10.1% |
| GPT‑6.2 Sol | 11.6% | 8.3% |

In the neutral mini‑SWE harness, Neon leads GPT‑6.2 Sol by only **1.2 points**; in each vendor's own harness, the gap widens to **30.7 points**. Neon's Antigravity score is about three times its mini‑SWE score, Opus 5.5 gains about 2.8 times in its own harness, and Sol actually drops. A vendor's harness is part of the product, so these numbers measure model plus toolchain rather than the model alone. The Carbon card's SWE‑sweep row has a single column with no harness label (Carbon **9.6%**, Argon **4.3%**). Its Opus 5.5 figure of 3.6% matches the Neon card's mini‑SWE value, which suggests the same setup; if so, the series runs 4.3%, 9.6%, 12.8% on mini‑SWE. [Neon model card](https://deepmind.google/models/model-cards/gemini-4-neon/)

Other coding evaluations paint a more restrained picture. On FrontierSWE 2, Carbon's **61.2%** trails GPT‑6 Astra's **65.5%** and Opus 5.5's **62.3%**; on FrontierCode 2.0, Neon's **46.2%** is just below Opus 5.5's **47.3%**. On the Artificial Analysis Coding Agent Index, Neon (xhigh, Antigravity CLI) leads with **59**, while Fable 5.2 (xhigh) and Opus 5.5 (max) both score **58**, at average costs per task of **$6.86**, **$15.47**, and **$12.61**; Neon's advantage is mostly cost. Computer use is a consistent weak spot across the series: on the OSWorld‑2.1 offline subset, Carbon's **81.5%** trails Opus 5.5's **87.2%**, and Hydrogen's **77.6%** trails Claude Sonnet 5.5's **83.9%**. [Artificial Analysis Neon launch evaluation](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain) · [Hydrogen model card](https://deepmind.google/models/model-cards/gemini-4-hydrogen/)

In knowledge work, Zapier's AutomationBench rises from Argon's **51.3%** and Carbon's **53.9%** to Neon's **56.3%**, and the simulated business balance in Vending‑Bench 2 grows from **$13,718** to **$16,843**. Argon scores **19.6%** on Harvey's Legal Agent Benchmark while no comparison model exceeds **6.7%**; the lead is large, but the absolute level shows these legal tasks are still far from deliverable. Watch the names, too: the AutomationBench‑AA figure in the Hydrogen card (**76.1%**) is the Artificial Analysis version and is not comparable with Zapier's.

## Long context and multimodality: synthetic leads, real material needs its own test

GraphWalks (256K to 1M tokens, breadth-first search, F1), as reported by Google, is where the series leads by the widest margin: Argon **84.2%**, Carbon **96.2%**, Neon **95.2%**, against Opus 5.5 at **66.8%**, GPT‑6 Astra at **71.8%**, and GPT‑6.2 Sol at **80.1%**; up to 128K, Argon already reaches **99.7%**. GraphWalks scatters graph edges across a long input and asks the model to traverse them, measuring long-range lookup and chaining. The lead shows strong retrieval and linking over very long inputs, but a synthetic graph task has no semantic conflicts, document versions, or hidden premises, so contract review or multi-paper synthesis still needs testing on your own material. These are Google's own results, not yet reproduced by a third party. Neon and Hydrogen output up to 64K tokens synchronously by default, and up to 1 million through background long decoding. [Argon model card](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Neon model card](https://deepmind.google/models/model-cards/gemini-4-neon/)

Multimodality shows one regression. On LVBench for long-video understanding, Argon scores **91.7%** and Neon, adapted from Carbon, **89.0%**: still above Opus 5.5's **83.7%** and GPT‑6.2 Sol's **87.6%**, but **2.7 points** below its own predecessor. On Chartography, Neon's **73.5%** trails Sol's **75.1%**. Artificial Analysis's GDP.pdf visual-reasoning evaluation is again non-monotonic in reasoning level: Neon scores **33.4%** at high but drops to **28.0%** at xhigh, while Carbon at high scores **28.4%**. [Artificial Analysis Neon launch evaluation](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain)

## Safety and alignment: stronger cyber capability, more staged releases

Cybersecurity is the capability Google emphasizes most, and the reason for its staged releases. On SEC‑bench Pro for vulnerability discovery, scores rise from Argon's **83.4%** and Carbon's **88.2%** to Neon's **90.5%**; on ExploitGym for exploitation, Carbon scores **54.8%** against Argon's **42.0%**. Argon and Carbon both went first to trusted cyber defenders through the Fairwind Program, and Google also gives those defenders and its internal teams versions without cyber guardrails. [Google Argon announcement](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/) · [Google Carbon announcement](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/)

The Argon model card gives determinations under the April 2026 Frontier Safety Framework: the Level 1 Critical Capability Levels (CCLs) for biology and cybersecurity cannot be ruled out, so Google built safety cases and assessed the model as below the CCL with safeguards; chemical, radiological, and nuclear domains did not reach the tracked threshold, and neither ML R&D acceleration nor automation reached its CCL. After targeted testing, Hydrogen reached neither the CBRN nor the cyber CCL but did reach the alert thresholds for both. The Neon model card says its general capability gain over Argon fell below the "material capability change" threshold, so no full critical capability evaluation was rerun and Argon's determinations carry over. Notably, Neon scores **11 points** above Argon on the Artificial Analysis index; how Google sets that threshold cannot be checked from public material. [Argon model card](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Hydrogen model card](https://deepmind.google/models/model-cards/gemini-4-hydrogen/) · [Neon model card](https://deepmind.google/models/model-cards/gemini-4-neon/)

On behavior, Carbon and Neon both show a **0.0%** successful-cheating rate on Terminal‑Bench 4.0, and a **0.0%** attack success rate on Gray Swan's indirect prompt injection test (Neon at its highest reasoning level), against **0.7%** for Argon. On Google's agentic honesty evaluation, Carbon passes **92%** of tasks and Argon **70%**; Neon and Hydrogen report **99.2%** and **94%**, though the posts do not say whether the task sets are the same. The Hydrogen card also discloses a cost: compared with Gemini 3.8 Flash, unjustified refusals rise **5.57 points**, most visibly on multimodal prompts. [Google: Carbon now available](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/) · [Google Neon announcement](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/) · [Google Hydrogen announcement](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/)

## Cost and selection: price the tasks that pass acceptance

Hydrogen costs **$1.50** per million input tokens and **$7.50** per million output tokens, flat across the full 1M window; Neon costs **$3 / $15** with cached input at **$0.15**; Carbon's introductory **$2 / $10** runs until November 30, then becomes **$4 / $20**. Cached input for Argon, Carbon, and Neon is 5% of the input price. By Artificial Analysis's cost per task, Hydrogen at xhigh scores 54 for **$3.16**, Argon at high 50 for **$4.97** (at introductory pricing), Neon at xhigh 61 for **$6.44**, and Carbon at high 60 for **$7.76** (at standard pricing). Neon at high matches Carbon at high with 60 points at less than half the cost per task. [Google Hydrogen announcement](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/) · [Artificial Analysis Neon launch evaluation](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain)

A worked example you can recompute: one request with 100,000 uncached input tokens and 10,000 output tokens, excluding tool fees, costs **$0.225** on Hydrogen, **$0.45** on Neon, and **$0.30** on Carbon during the introductory period or **$0.60** at standard pricing. Now consider routing to Hydrogen first and escalating failures to Neon. With a fixed 1:2 cost per call, pure model spend stays below using Neon directly as long as fewer than **50%** of tasks escalate; using Artificial Analysis's xhigh cost per task ($3.16 vs $6.44), the break-even is about **51%**. A real comparison must also include retries, latency, and final pass rate. This example illustrates cost structure only; the figures are not Folkbench measurements.

For batch tasks with automatic acceptance checks, Hydrogen is the first model to test: it matches or beats Argon on both the AA index and Terminal‑Bench at a lower price. For everyday coding and knowledge work, Neon matches or slightly exceeds Carbon on most evaluations shared by the two model cards (it is slightly lower on Agents' Last Exam and GraphWalks), and after November 30 its unit price is also below Carbon's. Carbon still has the strongest evidence for long-horizon engineering, cybersecurity, and interactive tasks such as ARC‑AGI‑3. Whichever you choose, test reasoning levels on your own tasks: on ARC‑AGI and GDP.pdf, the top setting is not always the best.

The value of Gemini 4 at launch is not any single first place. In seven weeks, on one knowledge cutoff, it shows how far post-training and inference configuration can push capability: 11 points on the AA index, 15 points in the ARC‑AGI‑3 standard harness, and 17 points on FrontierMath Tier 4. It also marks where this approach has not yet moved: open mathematical problems remain in single digits, computer use trails Claude, and several ARC‑AGI‑3 games in the standard harness are still at zero. Vendor model cards choose their comparison sets and who runs the evaluations, and independent leaderboards regrade and change versions. Whether these scores pay off depends, in the end, on how your own tasks are accepted.
