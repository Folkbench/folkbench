---
slug: gpt-6-2-astra-sol-deep-dive
translationKey: gpt-6-2-astra-sol-deep-dive
locale: zh-Hant
kind: benchmark-review
title: "GPT-6.2 Astra 與 Sol 深度評測：推理、軟體工程與研究能力"
description: "交叉查核 ARC Prize、Epoch AI、Artificial Analysis 與 Cognition 的首發資料，分析 GPT-6.2 的抽象推理、軟體交付、學術研究與成本。"
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

GPT‑6.2 Astra 與 Claude Fable 5.2 在 Epoch AI 的綜合能力指數同為 **174 分**。到了同一機構從實際工作挑出的開放式任務，Astra 平均拿到 **65%**，Fable 5.2 則是 **82%**。另一方面，GPT‑6.2 Sol 在兩項軟體工程評測接近 Astra，終端機套件的執行費用約為 Astra 的五分之一。高難度解題、交出可驗收的成果，以及自行決定要追查哪些證據，對模型提出了三種不同要求。[Epoch 模型資料](https://epoch.ai/models/gpt-6-2-astra) · [Epoch 開放式工作評測](https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work) · [Terminal-Bench 4.0](https://www.tbench.ai/?version=4)

OpenAI 於 2026 年 11 月 17 日發布兩款模型。本文分析截至 11 月 18 日的公開成績。規格、價格和廠商比較來自 OpenAI，其他結果由各評測機構產生。Folkbench 這次未重新執行評測。所有數字皆依其推理等級、版本與執行環境解讀。[OpenAI 發布公告](https://openai.com/index/introducing-gpt-6-2-astra-sol/)

## 基準成績

| 評測與設定 | GPT‑6.2 Astra | GPT‑6.2 Sol |
| --- | ---: | ---: |
| Artificial Analysis Intelligence Index v5.0.1，max | 62 | 57 |
| ARC‑AGI‑2，max | 95.8% | 85.8% |
| ARC‑AGI‑3 標準環境，max | 70.3% | 54.9% |
| Terminal-Bench 4.0，Codex，max | 62.1% ± 2.3% | 61.5% ± 2.8% |
| Epoch Automation Reports，Codex | 65% | 未評測 |

[Artificial Analysis 首發評測](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [ARC Prize 成績](https://arcprize.org/results/openai-gpt-6-2) · [Terminal-Bench 排行榜](https://www.tbench.ai/?version=4) · [Epoch 任務明細](https://epoch.ai/benchmarks/epoch-automation-reports)

## 智能與抽象遷移

Artificial Analysis 的 Astra 綜合分 **62** 高於上一代 **5 分**，低於 Fable 5.2 的 **65**。Sol 的 **57** 與上一代 Astra 相同，該指數採用的任務組合中，每項任務的平均模型成本約為舊 Astra 的 **15%**。Epoch 用項目反應理論與貝葉斯模型處理難度和區辨力，因而得出另一把量尺。綜合分數能概述測得的能力，實際選型仍需檢視任務類型和執行設定。[Artificial Analysis 首發報告](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [Epoch 指數方法](https://epoch.ai/data/eci-documentation/methodology)

ARC‑AGI‑2 要求從網格範例歸納規則，Astra 在 max 領先 Sol **10.0 個百分點**。ARC‑AGI‑3 要在互動環境中根據回饋調整動作，標準環境下差距為 **15.4 個百分點**。ARC Prize 的標準公開展示容許模型保留自行選擇的筆記。Provider Adapter 還會保存不透明的推理狀態並壓縮長對話。在該設定的 max 下，Astra 為 **99.8%**、Sol 為 **98.2%**。Astra 在適配環境的 xhigh 得 **100.0%**，同檔標準環境是 **56.5%**。保留試錯資訊的方式會同時改變成績與模型間差距。把系統接到自家工具時，應保留執行環境這個比較條件。[ARC Prize 評測與執行環境](https://arcprize.org/results/openai-gpt-6-2)

## 軟體工程與專業交付

Terminal-Bench 4.0 中兩款模型的點估計只差 **0.6 個百分點**，公佈的區間大幅重疊。整套執行成本約 **1,400 美元**與 **300 美元**，比成績差距更容易解讀。Cognition 的 FrontierCode 2.0 由維護者編寫 **132 項**任務，依正確性、測試、改動範圍與程式庫規範判斷能否合併。OpenAI 報告兩款在 max 的差距在 **0.5 個百分點**之內，Sol 約花五分之一的成本。Artificial Analysis 的 Coding Agent Index 卻顯示 Astra 與前代持平，Sol 比 6.1 Sol 低 **3 分**，其中程式庫問答項目低 **14 分**，報告指出它更常遺漏關鍵事實。可驗收的修補與準確說明程式庫，驗收對象不同。[Terminal-Bench 排行榜](https://www.tbench.ai/?version=4) · [Cognition 評分方法](https://cognition.com/frontiercode) · [OpenAI 發布公告](https://openai.com/index/introducing-gpt-6-2-astra-sol/) · [Artificial Analysis 程式設計評測](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol)

OpenAI 公告稱 Astra 在 Agents’ Last Exam 勝過 Fable 5.2 **5.5 分**，成本為對方的 **5%**，比較排除 Fable 使用備援模型的 9 題。Epoch 改用實際工作與人工評分後，順序反轉 **17 個百分點**，但 Astra 仍高於舊 Astra 的 **56%**。Epoch 樣本小，每款模型在每題只跑一次，各系統的代理工具也不同。對報告與圖表交付而言，是否理解讀者、挑選適當證據與修改初稿，往往需要另外驗收。[OpenAI 發布公告](https://openai.com/index/introducing-gpt-6-2-astra-sol/) · [Epoch 開放式工作評測](https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work)

## 學術能力的四個層次

**學科問答。** Astra 在 HLE-Diamond 與 CritPt v2 物理難題子集都只落後 Fable 5.2。AA-Omniscience 則顯示 Astra 與 Sol 的 max 幻覺率為 **59%** 與 **55%**。分母是未完全正確的回應，包括錯誤、部分正確與未作答，分子是錯誤回應。這項指標說明模型在答案不確定時猜錯的傾向。文獻整理仍應逐條驗證來源。[Artificial Analysis 首發評測](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [AA-Omniscience 定義](https://artificialanalysis.ai/evaluations/omniscience)

**形式證明。** Epoch 的 FrontierMath Tier 4 v2 顯示 Astra **100%**，舊 Astra **98%**，採榜單顯示精度。FrontierMath Erdős 為 **10%** 與 **3%**。後者由建立基準時仍未解的 68 題組成，交付物須通過 Lean 證明或反證檢查。形式驗證確立給定命題的結果，學術貢獻還要求形式化忠於原始問題，並交代假設與新穎性。[Epoch 數學成績](https://epoch.ai/models/gpt-6-2-astra) · [FrontierMath Erdős](https://epoch.ai/benchmarks/frontiermath-erdos)

**研究執行與設計。** Terminal-Bench-Science 0.1 的 70 題都要求在終端機交付可驗證成果，Astra 在 xhigh 得 **78.6%**，max 得 **78.1%**。Epoch 要模型設計真正改變規則的西洋棋變體時，Astra 主要替棋子改名，行棋規則仍等價。執行指定實驗的能力可以與實驗設計失敗同時存在。Epoch 也發現模型常沿用首輪方案。OpenAI 系統卡將 Astra 的 AI 自我改進能力列為 High，Sol 未達該門檻。這項分級衡量的是特定 AI 研發環境中的能力。[Terminal-Bench-Science](https://artificialanalysis.ai/evaluations/terminal-bench-science) · [Epoch 研究設計案例](https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work) · [OpenAI 系統卡](https://deploymentsafety.openai.com/gpt-6-2-astra-sol)

## 按通過驗收的任務計價

兩款 API 都有 **105 萬 token** 上下文，最大輸入 **92.2 萬**、輸出 **12.8 萬**。標準短上下文每百萬 token 的未快取輸入、快取讀取和輸出分別是 Astra **8 / 0.40 / 40 美元**、Sol **2 / 0.10 / 10 美元**。輸入超過 **272K** 時，整次要求的輸入和快取費率翻倍，輸出為 **1.5 倍**。以 10 萬未快取輸入及 1 萬計費輸出為例，先不計工具與快取寫入，Astra 為 **1.20 美元**，Sol 為 **0.30 美元**。固定成本為 1∶4 時，先用 Sol，失敗後再用一次 Astra，升級比例低於 **75%** 才比直接用 Astra 便宜。實際決策還需比較最終通過率、延遲及人工複核。Sol 的證據最適合有明確驗收的批次工作，Astra 在高難形式推導和陌生規則探索更具優勢，開放式研究則需驗證引文、可重現結果及實驗能否區分不同假設。[Astra API 規格](https://developers.openai.com/api/docs/models/gpt-6.2-astra) · [Sol API 規格](https://developers.openai.com/api/docs/models/gpt-6.2-sol)
