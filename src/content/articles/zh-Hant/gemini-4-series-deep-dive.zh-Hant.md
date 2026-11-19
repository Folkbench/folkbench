---
slug: gemini-4-series-deep-dive
translationKey: gemini-4-series-deep-dive
locale: zh-Hant
kind: benchmark-review
title: "Gemini 4 系列深度評測：Argon、Carbon、Hydrogen 與 Neon 的智力結構"
description: "交叉查核 Google 模型卡與 Artificial Analysis、Epoch AI、ARC Prize、Terminal-Bench 的公開結果，拆解 Gemini 4 四款模型在綜合智力、抽象推理、數學與科研、工程、長上下文和安全上的能力結構，以及推理預算與評測口徑如何改變結論。"
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

在 Artificial Analysis 的 Intelligence Index v5.0.1 中，如果把跑完整套指數的輸出 token 都控制在 1.1 億到 1.24 億之間，Gemini 4 Argon（high）得 **50** 分，Hydrogen（high）**51** 分，Carbon（medium）**58** 分，Neon（high）**60** 分。四款模型的知識截止同為 2026 年 3 月。依 Google 的模型卡，Carbon 以 Argon 為基礎，Hydrogen 與 Neon 則由 Carbon 改造而來。在 ARC‑AGI‑3 標準執行環境中，同為 low 檔時 Carbon 比 Argon 高 **15.3 個百分點**；Epoch AI 記錄的 FrontierMath Tier 4 差距是 **17 個百分點**。七週、四次發布、同一個知識截止日期，讓 Gemini 4 系列幾乎成了一場關於後訓練與推理預算的公開實驗。它也提醒讀者，以相同預算比較和以相同檔位名稱比較，會得到兩張不同的排行榜。[Artificial Analysis Neon 首發評測](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain) · [ARC Prize Carbon 驗證結果](https://arcprize.org/results/google-gemini-4-carbon) · [Epoch Carbon 模型資料](https://epoch.ai/models/gemini-4-carbon)

Google 於 9 月 30 日公布 Argon，10 月 28 日公布 Carbon 並在 11 月 10 日全面開放，11 月 12 日與 18 日接連發布 Hydrogen 與 Neon。本文以 11 月 19 日可查到的公開結果為證據，屬於 Folkbench 的二次分析。模型卡與發布文章中的分數由 Google 提供，其中對照模型的分數有些由 Google 執行，有些標註為第三方代跑。Artificial Analysis、Epoch AI、ARC Prize 與 Terminal-Bench 的結果歸各評測方所有。Folkbench 這次沒有重跑模型。文中百分比沿用各排行榜的定義，凡涉及推理檔位、執行環境或評測執行方，結論都只在對應設定內成立。[Google Argon 發布文章](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/) · [Google Carbon 全面開放](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/) · [Google Neon 發布文章](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/)

## 一個底座，四次後訓練

| 模型 | 公布日期 | 官方定位 | 模型卡寫明的來源 | API 標價（輸入 / 輸出，每百萬 token） | AA 指數 v5.0.1 最高檔 |
| --- | --- | --- | --- | --- | ---: |
| Gemini 4 Argon | 9 月 30 日 | 程式開發、企業知識工作與網路防禦 | 全新訓練的稀疏 MoE 模型 | 推廣價 2 / 10 美元，之後 4 / 20 美元 | 50（high） |
| Gemini 4 Carbon | 10 月 28 日，11 月 10 日全面開放 | 長程任務與網路安全 | 以 Argon 為基礎 | 2 / 10 美元至 11 月 30 日，之後 4 / 20 美元 | 60（high） |
| Gemini 4 Hydrogen | 11 月 12 日 | 快速的日常執行 | 由 Carbon 改造 | 1.50 / 7.50 美元 | 54（xhigh） |
| Gemini 4 Neon | 11 月 18 日 | 兼顧深度與效率 | 由 Carbon 改造 | 3 / 15 美元 | 61（xhigh） |

[Argon 模型卡](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Carbon 模型卡](https://deepmind.google/models/model-cards/gemini-4-carbon/) · [Hydrogen 模型卡](https://deepmind.google/models/model-cards/gemini-4-hydrogen/) · [Neon 模型卡](https://deepmind.google/models/model-cards/gemini-4-neon/)

Argon 的模型卡是這一代唯一一份架構說明：大規模稀疏混合專家（MoE）Transformer，原生支援文字、視覺與音訊輸入，是全新訓練的模型，而不是舊模型的微調。它在 TPU 上以 JAX 與 ML Pathways 訓練，後訓練包括指令微調、人類偏好資料，以及涵蓋多步推理、問題求解與定理證明資料的強化學習。Carbon 的模型卡把架構、訓練資料與硬體細節全部指回 Argon；Hydrogen 與 Neon 的模型卡寫明由 Carbon 改造（adapted from），細節再指回 Carbon。四款模型的上下文都是輸入與輸出合計最多 100 萬 token。[Argon 模型卡](https://deepmind.google/models/model-cards/gemini-4-argon/)

這個結構決定了系列內進步該怎麼解讀。知識截止沒有改變，Argon 到 Carbon 的提升就不能歸因於新增的世界知識，比較可能來自後訓練資料、強化學習與推理設定的調整。Google 沒有公開參數量，也沒有說明「改造」究竟是蒸餾、繼續訓練還是其他方法，因此 Hydrogen 與 Neon 的規模和訓練路徑無法從公開資料推斷。可以確定的是，這一代內部的能力差異，大部分發生在預訓練之後。

## 智力面向：同一個檔位名稱，不等於同一份推理預算

Carbon 在 10 月 28 日公布時，以 v5.0 指數 **59** 分位居第一。三週後，v5.0.1 重新評分將它記為 **60**，但榜首已是 Claude Fable 5.2 的 **65**，其後是 GPT‑6.2 Astra 的 **62** 與 Neon 的 **61**；Claude Opus 5.5 為 **59**，GPT‑6.2 Sol 為 **57**。Epoch AI 的 ECI 給出相近的位置：Carbon **170**，在 241 個追蹤模型中排第 3；Argon **167**，Fable 5.2 **174**，GPT‑6 Astra **169**。兩套指數的方法不同，都把 Carbon 放在第一梯隊、略低於目前的領先者。截至 11 月 19 日，Epoch 尚未發布 Neon 的紀錄，Hydrogen 已有單項成績但還沒有 ECI。綜合指數的排名以週為單位變動，單一個「第一」的說服力有限。[Google Carbon 發布文章](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/) · [Artificial Analysis GPT‑6.2 首發評測](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [Neon 模型卡](https://deepmind.google/models/model-cards/gemini-4-neon/) · [Epoch Carbon 模型資料](https://epoch.ai/models/gemini-4-carbon)

更有資訊量的是各推理檔位的曲線。下表括號內是跑完整套指數所消耗的輸出 token。

| AA 指數 v5.0.1 | Neon | Hydrogen | Carbon | Argon |
| --- | ---: | ---: | ---: | ---: |
| low | 44（2,830 萬） | 27（2,030 萬） | 54（8,390 萬） | 未列出 |
| medium | 55（6,290 萬） | 41（5,440 萬） | 58（1.24 億） | 48（8,170 萬） |
| high（預設） | 60（1.23 億） | 51（1.10 億） | 60（2.05 億） | 50（1.13 億） |
| xhigh | 61（2.83 億） | 54（3.04 億） | 無此檔 | 無此檔 |

[Neon 檔位資料](https://artificialanalysis.ai/models/gemini-4-neon) · [Hydrogen 檔位資料](https://artificialanalysis.ai/models/releases/gemini-4-hydrogen) · [Carbon 檔位資料](https://artificialanalysis.ai/models/gemini-4-carbon) · [Argon 檔位資料](https://artificialanalysis.ai/models/gemini-4-argon)

第一，邊際效益遞減得很快。Neon 從 high 調到 xhigh，輸出 token 增為 **2.3 倍**，指數只多 **1 分**，每項任務耗時從 14.8 分鐘增加到 21.5 分鐘；Hydrogen 同一步多花 **2.8 倍** token，換來 **3 分**。第二，檔位名稱不是預算單位。Carbon 的 low 檔用掉 8,390 萬 token，比 Neon 的 medium 檔還多。若以相近的總預算對齊，四款模型依序是 Argon 50、Hydrogen 51、Carbon 58、Neon 60，這比「都用預設檔」更能說明後訓練帶來的提升。這個比較也有局限：token 是整套指數的合計，沒有逐題對齊；各模型輸出速度也不同，Neon 的 high 檔約每秒 101 token，Carbon 每秒 55 至 58 token，同樣的 token 代表不同的等待時間。

第三，小模型對預算更敏感。Hydrogen 從 low 到 high 跨越 **24 分**，Neon 跨越 **16 分**，Carbon 只跨越 **6 分**。對 Hydrogen 這類快速模型來說，選錯檔位造成的落差，可能比換一款模型還大。

## 抽象推理：在 ARC‑AGI‑3 上，想得更久不一定更好

| ARC Prize 驗證結果 | Gemini 4 Argon | Gemini 4 Carbon |
| --- | ---: | ---: |
| ARC‑AGI‑2，low / medium / high | 42.1% / 87.1% / 91.3% | 49.6% / 94.2% / 92.1% |
| ARC‑AGI‑3 標準執行環境，low / medium | 49.8% / 46.3% | 65.1% / 63.9% |
| ARC‑AGI‑3 標準執行環境，high | 未計入（55 局完成 19 局） | 未計入（55 局完成 30 局） |
| ARC‑AGI‑3 Provider Adapter，low / medium / high | 97.5% / 97.3% / 97.3% | 97.7% / 99.1% / 96.9% |

[ARC Prize Argon 驗證結果](https://arcprize.org/results/google-gemini-4-argon) · [ARC Prize Carbon 驗證結果](https://arcprize.org/results/google-gemini-4-carbon)

這組結果有三處值得注意。其一，檔位與分數並不單調：Carbon 在 ARC‑AGI‑2 上 medium 高於 high，在 ARC‑AGI‑3 標準環境中 low 高於 medium，Argon 在 ARC‑AGI‑3 也是 low 最高。其二，最高檔在互動環境中可能直接失效。Carbon 的 high 檔因兩次行動之間間隔太長，遊戲工作階段逾時，只完成 30 局；Argon 的 high 檔因 API 問題只完成 19 局。靜態問答裡多想一會兒只是多花錢，互動環境裡還要消耗環境時間。其三，執行環境的差距遠大於世代差距。Carbon 在 Provider Adapter 下達到 **99.1%**，標準環境最高 **65.1%**，相差約 **34 個百分點**。依 ARC Prize 的說明，標準環境只允許模型保留自己選擇記下的筆記，Provider Adapter 則在請求之間保存不透明的推理狀態，並在長對話中壓縮上下文。

逐一檢視各環境，失分集中在少數遊戲。標準環境下，G50T 在 Argon 與 Carbon 的 low、medium 檔都是 **0.0%**，BP35 都不超過 **1.0%**，TU93 都不超過 **5.3%**；同樣三款遊戲在 Provider Adapter 下大多是 100%。總分上升了 15 個百分點，這幾款遊戲卻幾乎沒動。一個合理但尚未驗證的解讀是：它們卡在跨步驟保存狀態，而不是單步推理，世代提升主要發生在原本就能部分完成的環境。作為參照，GPT‑6.2 Astra 在標準環境 max 檔為 **70.3%**，GPT‑6.2 Sol 為 **54.9%**，Carbon 介於兩者之間。[ARC Prize GPT‑6.2 驗證結果](https://arcprize.org/results/openai-gpt-6-2)

## 學術面向：知識校準、數學與科學執行

| Epoch AI 紀錄 | Gemini 4 Argon | Gemini 4 Carbon | Gemini 4 Hydrogen | GPT‑6 Astra | Claude Fable 5.2 |
| --- | ---: | ---: | ---: | ---: | ---: |
| GPQA Diamond | 96% | 97% | 97% | 96% | 96% |
| SimpleQA Verified | 76% | 78% | 71% | 76% | 94% |
| FrontierMath Tiers 1–3（v2） | 86% | 91% | 88% | 94% | 95% |
| FrontierMath Tier 4（v2） | 78% | 95% | 88% | 98% | 100% |
| FrontierMath Erdős | 1% | 3% | 未測 | 3% | 未測 |
| Chess Puzzles | 59% | 78% | 60% | 76% | 79% |
| EBR‑bench（Earthborne Rangers） | 65% | 88% | 70% | 76% | 90% |

[Epoch Carbon 模型資料](https://epoch.ai/models/gemini-4-carbon) · [Epoch Hydrogen 模型資料](https://epoch.ai/models/gemini-4-hydrogen)

**知識與校準。** GPQA Diamond 已經難以區分前沿模型，表中五款都落在 96% 到 97% 之間。更有鑑別度的是事實回憶，以及答不出來時怎麼處理。在 Epoch 的 SimpleQA Verified 上，Carbon 為 **78%**，比 Fable 5.2 低 **16 個百分點**。而在 Artificial Analysis 的 AA‑Omniscience v1.1 中，Carbon（medium）與 Argon（high）的幻覺率都是 **4%**，Carbon 為排行榜最低。這項指標的分母是所有未完全正確的回應，分子是其中直接答錯的部分；作為對照，GPT‑6.2 Astra 與 Sol 的 max 檔分別為 **59%** 與 **55%**。兩項結果出自不同題組，不能合併計算，但方向一致：Gemini 4 未必記得最多，不會時卻更傾向不作答或只給部分答案，較少捏造。至少在這類知識問答中，它給出的明確答案出錯比例較低；用於文獻回顧時，涵蓋範圍仍要靠檢索補足。[AA‑Omniscience 指標定義與排行榜](https://artificialanalysis.ai/evaluations/omniscience)

HLE‑Diamond 是 Carbon 在 v5.0 九項指數評測中排名第一的四項之一。Google 回報 Neon **71.3%**、Opus 5.5 **67.9%**、GPT‑6.2 Sol **64.0%**、Hydrogen **58.8%**，這些數字都出自 Google 的模型卡。[DeepLearning.AI 對 v5.0 結果的整理](https://www.deeplearning.ai/the-batch/gemini-leads-the-pack-again) · [Neon 模型卡](https://deepmind.google/models/model-cards/gemini-4-neon/)

**數學。** 從 Argon 到 Carbon，FrontierMath Tier 4 提高 **17 個百分點**，是這組資料中最大的世代躍進，已接近 GPT‑6 Astra 與 Fable 5.2。但 FrontierMath Erdős 只從 **1%** 升到 **3%**。這 68 道題在基準建立時仍是開放問題，提交的證明或反證由 Lean 檢查，目前最高是 GPT‑6.2 Astra 的 **10%**。已有標準答案的研究級題目趨於飽和，開放問題則幾乎沒被觸及。Google 自行回報的 RiemannBench 從 Argon **76.0%**、Carbon **80.0%** 升到 Neon **84.0%**，方向一致，但屬於廠商自測。Epoch 的謎題類評測顯示類似的後訓練收益：西洋棋謎題從 59% 升到 78%，EBR‑bench 從 65% 升到 88%。這些任務都要在規則限制下做多步搜尋，與 ARC‑AGI‑3 標準環境的提升方向一致。快速版 Hydrogen 的 Tier 4 為 **88%**，比 Argon 高 **10 個百分點**，但謎題類成績與 Argon 相近，事實回憶 SimpleQA Verified 只有 **71%**。一種可能的解釋是，數學這類答案可以自動驗證的能力，在改造成快速模型時保留得比較完整，而記憶型知識更依賴模型容量；公開資料不足以證實這一點。[FrontierMath Erdős 方法](https://epoch.ai/benchmarks/frontiermath-erdos)

**科學執行。** Terminal‑Bench‑Science 0.1 要求模型在終端機中交付可由測試檢查的研究成果。Carbon 模型卡中由 Artificial Analysis 代跑的結果是 Carbon **64.8%**、Argon **52.9%**、GPT‑6 Astra **63.3%**、Opus 5.5 **59.0%**。Neon 模型卡回報 Neon **70.5%**，高於 GPT‑6.2 Sol 的 **68.0%** 與 Opus 5.5 的 **63.3%**。Google 稱 Neon 為同級最佳，這在它挑選的對照組內成立；放到 Artificial Analysis 的完整排行榜上，GPT‑6.2 Astra 的 xhigh 為 **78.6%**，仍高出 **8.1 個百分點**。Hydrogen 為 **51.4%**，低於它的對照 Claude Sonnet 5.5（**59.9%**）。[Terminal‑Bench‑Science 排行榜](https://artificialanalysis.ai/evaluations/terminal-bench-science) · [Carbon 模型卡](https://deepmind.google/models/model-cards/gemini-4-carbon/)

## 工程與代理：執行環境決定了一半答案

在 Terminal‑Bench 4.1 官方排行榜上，Carbon（high，Antigravity CLI）為 **64.5% ± 3.2%**，整套執行約 **1,400 美元**；Claude Opus 5.5 與 Fable 5.2 並列 **65.8%**，GPT‑6.2 Astra **62.1%**。Carbon 與榜首的差距在信賴區間之內。更有意思的是同系列對比：Hydrogen **56.4% ± 3.0%**、約 **800 美元**，Argon **55.5% ± 2.8%**、約 **1,100 美元**，快速模型以約四分之三的整套費用追平了六週前的旗艦。Neon 的 **65.2%** 來自 Google 模型卡，截至 11 月 19 日尚未出現在官方排行榜。[Terminal‑Bench 4.1 排行榜](https://www.tbench.ai/?version=4)

跨模型卡比較時，要先看是誰跑的。Argon 模型卡中的 Terminal‑bench 4.0 記 Argon **57.4%**、Opus 5.5 **66.4%**；兩週後，Carbon 模型卡改用 Artificial Analysis 執行的 Terminal‑Bench 4.0，記 Argon **57.1%**、Opus 5.5 **59.6%**。同一個對照模型在同名基準上相差 **6.8 個百分點**，Argon 自己卻幾乎沒變。若沿用 Argon 卡中 Opus 的 66.4%，Carbon 的 65.2% 並不領先；在官方 4.1 排行榜上，Carbon 也略低於 Opus。Terminal‑Bench‑Science 也有相同情況：GPT‑6 Astra 在 Argon 卡中為 **68.1%**，在 Carbon 卡的 AA 代跑口徑下為 **63.3%**。[Argon 模型卡](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Carbon 模型卡](https://deepmind.google/models/model-cards/gemini-4-carbon/)

| SWE‑sweep（Neon 模型卡） | mini‑SWE 通用執行環境 | 各廠商自有執行環境 |
| --- | ---: | ---: |
| Gemini 4 Neon | 12.8% | 39.0% |
| Claude Opus 5.5 | 3.6% | 10.1% |
| GPT‑6.2 Sol | 11.6% | 8.3% |

在中立的 mini‑SWE 環境中，Neon 只比 GPT‑6.2 Sol 高 **1.2 個百分點**；換成各家自己的執行環境後，差距擴大到 **30.7 個百分點**。Neon 在 Antigravity 中的分數約為 mini‑SWE 下的 3 倍，Opus 5.5 在自家環境中約為 2.8 倍，Sol 反而下降。廠商自有環境本來就是產品的一部分，這組數字衡量的是「模型加工具鏈」的組合，而不是模型本身。Carbon 模型卡裡的 SWE‑sweep 只有一欄，也沒有標註執行環境（Carbon **9.6%**、Argon **4.3%**），其中 Opus 5.5 的 3.6% 與 Neon 卡的 mini‑SWE 數值相同，推測為同一口徑；若推測成立，系列在 mini‑SWE 上的路徑是 4.3%、9.6%、12.8%。[Neon 模型卡](https://deepmind.google/models/model-cards/gemini-4-neon/)

其他程式評測呈現較保守的樣貌。FrontierSWE 2 上 Carbon **61.2%**，低於 GPT‑6 Astra 的 **65.5%** 與 Opus 5.5 的 **62.3%**；FrontierCode 2.0 上 Neon **46.2%**，略低於 Opus 5.5 的 **47.3%**。在 Artificial Analysis 的 Coding Agent Index 中，Neon（xhigh，Antigravity CLI）以 **59** 分居首，Fable 5.2（xhigh）與 Opus 5.5（max）都是 **58**，每項任務平均成本分別為 **6.86**、**15.47** 與 **12.61 美元**，Neon 的優勢主要在成本。電腦操作是整個系列相當一致的弱項：在 OSWorld‑2.1 離線子集上，Carbon **81.5%** 低於 Opus 5.5 的 **87.2%**，Hydrogen **77.6%** 低於 Claude Sonnet 5.5 的 **83.9%**。[Artificial Analysis Neon 首發評測](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain) · [Hydrogen 模型卡](https://deepmind.google/models/model-cards/gemini-4-hydrogen/)

知識工作方面，Zapier 的 AutomationBench 從 Argon **51.3%**、Carbon **53.9%** 升到 Neon **56.3%**，Vending‑Bench 2 的模擬經營餘額從 **13,718 美元**增加到 **16,843 美元**。Argon 在 Harvey 法律代理基準上為 **19.6%**，對照模型都不超過 **6.7%**；領先幅度很大，但絕對值顯示這類法律任務離可交付還很遠。名稱也要留意：Hydrogen 卡中的 AutomationBench‑AA（**76.1%**）是 Artificial Analysis 的版本，與 Zapier 版不能直接比較。

## 長上下文與多模態：合成任務領先，真實資料需另行驗證

Google 回報的 GraphWalks（256K 至 100 萬 token，廣度優先走訪，F1）是系列領先幅度最大的一項：Argon **84.2%**、Carbon **96.2%**、Neon **95.2%**，對照的 Opus 5.5 為 **66.8%**、GPT‑6 Astra **71.8%**、GPT‑6.2 Sol **80.1%**；128K 以內 Argon 已達 **99.7%**。GraphWalks 把圖的邊散布在長輸入中，要求模型沿著邊走訪，衡量長距離定位與串連資訊的能力。這項領先說明 Gemini 4 在超長輸入中的檢索與連結能力很強，但合成圖任務不含語意衝突、文件版本與隱含前提，要用在合約審閱或多篇文獻綜述時，仍需以自己的資料驗證。結果為 Google 自測，尚無第三方重現。Neon 與 Hydrogen 預設同步輸出最多 6.4 萬 token，透過背景長解碼可達 100 萬。[Argon 模型卡](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Neon 模型卡](https://deepmind.google/models/model-cards/gemini-4-neon/)

多模態出現一處退步。長影片理解 LVBench 上，Argon 為 **91.7%**，由 Carbon 改造的 Neon 為 **89.0%**，仍高於 Opus 5.5 的 **83.7%** 與 GPT‑6.2 Sol 的 **87.6%**，但比自家前一代低 **2.7 個百分點**。圖表理解 Chartography 上，Neon **73.5%** 低於 Sol 的 **75.1%**。Artificial Analysis 的 GDP.pdf 視覺推理評測再次出現檔位不單調：Neon high 為 **33.4%**，xhigh 反而降到 **28.0%**，Carbon high 為 **28.4%**。[Artificial Analysis Neon 首發評測](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain)

## 安全與對齊：網路能力越強，發布越分階段

網路安全是 Google 著重回報的能力，也是它分階段發布的原因。漏洞發現 SEC‑bench Pro 從 Argon **83.4%**、Carbon **88.2%** 升到 Neon **90.5%**；漏洞利用 ExploitGym 上，Carbon **54.8%**，Argon **42.0%**。Argon 與 Carbon 都先透過 Fairwind 計畫提供給受信任的網路防禦方，Google 還向這些防禦方與內部團隊提供拿掉網路安全護欄的版本。[Google Argon 發布文章](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/) · [Google Carbon 發布文章](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/)

Argon 模型卡依據 2026 年 4 月版前沿安全框架提出判定：生物與網路安全兩項 Level 1 關鍵能力等級（CCL）無法排除，Google 為此建立安全論證，評估在防護措施下低於 CCL；化學、放射與核領域未達追蹤門檻，機器學習研發加速與自動化都未達 CCL。Hydrogen 經過針對性測試，CBRN 與網路兩項都未達 CCL，但達到了預警門檻。Neon 的模型卡寫明，相對 Argon 的通用能力增量低於「重大能力變化」門檻，因此沒有重做完整的關鍵能力評估，沿用 Argon 的判定。值得注意的是，Neon 在 Artificial Analysis 指數上比 Argon 高 **11 分**；Google 如何設定這個門檻，外部讀者無法從公開資料查核。[Argon 模型卡](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Hydrogen 模型卡](https://deepmind.google/models/model-cards/gemini-4-hydrogen/) · [Neon 模型卡](https://deepmind.google/models/model-cards/gemini-4-neon/)

行為層面，Carbon 與 Neon 在 Terminal‑Bench 4.0 上的成功作弊率都是 **0.0%**；在 Gray Swan 間接提示注入測試中，兩者攻擊成功率為 **0.0%**（Neon 為最高推理檔），Argon 為 **0.7%**。在 Google 的代理誠實度測試中，Carbon 通過 **92%** 的任務，Argon 為 **70%**；Neon 與 Hydrogen 分別回報 **99.2%** 與 **94%**，但發布文章沒有說明是否為同一題組。Hydrogen 的模型卡也揭露了代價：相較 Gemini 3.8 Flash，無正當理由的拒答增加 **5.57 個百分點**，多模態提示尤其明顯。[Google Carbon 全面開放](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/) · [Google Neon 發布文章](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/) · [Google Hydrogen 發布文章](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/)

## 成本與選型：以通過驗收的任務計價

Hydrogen 每百萬 token 輸入 **1.50**、輸出 **7.50 美元**，整個 100 萬 token 視窗統一計價；Neon 為 **3 / 15 美元**，快取輸入 **0.15 美元**；Carbon 推廣價 **2 / 10 美元**持續到 11 月 30 日，之後為 **4 / 20 美元**。Argon、Carbon 與 Neon 的快取輸入都是輸入價的 5%。依 Artificial Analysis 的每項任務成本，Hydrogen xhigh 以 **3.16 美元**得 54 分，Argon high 以 **4.97 美元**（按推廣價）得 50 分，Neon xhigh 以 **6.44 美元**得 61 分，Carbon high 以 **7.76 美元**（按標準價）得 60 分。Neon 的 high 檔與 Carbon high 同為 60 分，每項任務成本不到後者一半。[Google Hydrogen 發布文章](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/) · [Artificial Analysis Neon 首發評測](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain)

一個可以自行驗算的例子：單次請求 10 萬未快取輸入 token、1 萬輸出 token，不計工具費，Hydrogen 為 **0.225 美元**，Neon 為 **0.45 美元**，Carbon 推廣期為 **0.30 美元**、恢復標準價後為 **0.60 美元**。考慮先用 Hydrogen、失敗再轉 Neon 的路由：單次成本固定為 1∶2 時，只要升級比例低於 **50%**，純模型費用就低於直接使用 Neon；依 Artificial Analysis 的 xhigh 每項任務成本（3.16 對 6.44 美元），臨界點約為 **51%**。實際比較還要計入重試、延遲與最終通過率。此算例只用來說明成本結構，數字並非 Folkbench 實測。

對能自動驗收的批次任務，Hydrogen 最值得先驗證：它在 AA 指數與 Terminal‑Bench 上都追平或超過 Argon，標價也更低。對日常程式開發與知識工作，Neon 在兩張模型卡共有的多數評測上與 Carbon 持平或略高（Agents' Last Exam 與 GraphWalks 略低），而且 11 月 30 日之後單價也低於 Carbon。Carbon 仍是長程工程、網路安全與 ARC‑AGI‑3 這類互動任務中證據最充分的一款。無論選哪一款，推理檔位都應依任務實測：在 ARC‑AGI 與 GDP.pdf 上，最高檔並不總是最好。

Gemini 4 的首發價值不在某一項榜首。它用七週時間與同一個知識截止日期，展示了後訓練與推理設定能把能力推得多遠：AA 指數提高 11 分，ARC‑AGI‑3 標準環境提高 15 個百分點，FrontierMath Tier 4 提高 17 個百分點。它也標出了這條路線暫時推不動的地方：開放數學問題仍停在個位數，電腦操作落後於 Claude，標準環境下幾款 ARC‑AGI‑3 遊戲仍是零分。廠商模型卡會挑選對照組與執行方，獨立排行榜會重新評分、更換版本。這些分數能否兌現，最終取決於你的任務如何驗收。
