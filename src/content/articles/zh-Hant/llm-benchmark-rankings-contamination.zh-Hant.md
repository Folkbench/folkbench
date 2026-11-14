---
slug: llm-benchmark-rankings-contamination
translationKey: llm-benchmark-rankings-contamination
locale: "zh-Hant"
kind: article
title: "模型排名可靠嗎？從資料污染到可複核的基準"
description: "從 LiveBench、LiveCodeBench、HELM 與評測統計研究，檢視資料污染、預算、評分和不確定性，建立可複核的模型比較。"
category: "評測方法"
tags: [基準, 推理, 可靠性]
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
    label: White 等，LiveBench，2025 修訂版
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

一份排行榜可以精確記錄一次考試，卻仍不足以回答「哪個模型適合我的工作」。分數取決於題目、模型版本、提示、工具、推論預算與評分器。脫離這些條件，即使名次精確到小數點後，也可能導向過度延伸的結論。

本文依據截至 2026-11-14 核對的文獻，分析評測方法並提出實驗建議。Folkbench 本輪未呼叫模型或重跑基準；文中的數值範例用來說明方法，不是實測成績。目標是建立可複核的證據鏈：測量什麼、如何出題、怎樣評分，以及結果支持哪些結論。

## 先定義能力，再選擇題庫

「智力」涵蓋太廣，無法只用一道題或平均分解釋。專業知識問答、陌生規則歸納、程式執行與長程規劃，需要不同任務和驗收標準。要求特定輸出格式會同時考查指令遵循；要求看圖解題，則加入視覺辨識。

[Measuring what Matters](https://arxiv.org/abs/2511.04703v1) 審查了 445 個基準，從「構念效度」討論觀察到的分數是否支持目標能力的解釋。[BetterBench](https://arxiv.org/abs/2411.12990v1) 提供評估基準品質的架構。頂尖會議與機構聲望可以協助篩選文獻，不能取代對題目與評分器的檢查。

可操作的問題可以是：「不提供外部搜尋工具時，模型能否根據給定材料解決多步驟問題？」這比「模型是否聰明」容易驗證，也比較容易區分知識不足、證據遺漏與推理錯誤。

## 資料污染不只是看過原題

最直接的污染是測試題和答案進入訓練資料。相似題、解題教學與公開評測紀錄，也可能協助模型作答。研究者反覆根據公開榜單調整方法，還可能逐漸對這份試卷過度擬合，即使沒有直接把原題納入訓練。

因此，舊題高分不自動代表記憶作弊，新題低分也不能單獨證明污染。兩組題目的難度、題型和領域可能不同。研究應盡量控制這些條件，並交代無法觀察的訓練資料範圍。無法核對閉源模型的完整訓練集時，應記錄「未知」，而非「確認無污染」。

[LiveBench 修訂版](https://arxiv.org/abs/2406.19314v2) 使用持續更新的任務與可自動核對的答案，標題採用 Contamination-Limited。[LiveCodeBench](https://arxiv.org/abs/2403.07974v2) 持續收集程式競賽新題並保留發表時間。這些設計降低特定污染風險，但新題公開後，仍可能進入後續訓練或調校流程。

動態題庫也帶來時間可比性的問題。不同月份若使用不同題目，分數變化會同時反映模型與試卷的變化。可靠紀錄應保留資料版本，在共同題集上比較，或分開報告固定參考集與新增題集；固定參考集逐漸曝光的風險仍需說明。

## 把相同條件寫成明確協定

同一模型名稱可能對應不同快照、服務端點與推理設定。比較前應登記實際 API ID、可取得的版本資訊、測試日期、系統提示、取樣設定、輸出上限、工具及重試規則。未公開的路由與內部運算預算不能用猜測補齊。

可以分別呈現統一協定下的模型比較，以及各系統在明確預算內的最佳設定。前者便於判斷差異來源，後者貼近採購決策；兩種結果應分開命名。相同 token 上限也不代表相同運算量，因為斷詞器與內部推理機制可能不同。

[HELM](https://arxiv.org/abs/2211.09110v2) 在統一情境和條件下，同時觀察準確性、校準、穩健性與效率。依此思路，報告應同時列出品質、費用、延遲和失敗情況；成本必須包含失敗嘗試與工具呼叫，不能只計算最後成功的一次。

## 評分器本身也可能出錯

有標準答案時，優先採用可核對的規則，但也要檢查答案本身。程式測試可能遺漏需求，或只接受某一種實作；字串比對可能錯誤拒絕語意正確的回答。評分器版本、答案擷取與例外處理規則都應固定。

開放式任務需要更複雜的評審。[Judging LLM-as-a-Judge](https://arxiv.org/abs/2306.05685v4) 分析了位置、篇幅和自我偏好等偏誤。可採匿名答案、交換呈現順序、明確評分規準，並由人工複核爭議樣本。模型裁判與人類偏好的一致程度，不能直接當作事實正確率。

另外應分別記錄答錯、格式失敗、拒答、逾時與服務錯誤，並在執行前決定如何計入主分數。只對成功回應計算準確率，卻隱藏大量逾時，會讓讀者高估整體服務的可靠性。

## 小分差需要配對分析

假設同一批 200 道題，模型 A 答對 160 道，B 答對 156 道。這是教學算例：兩者相差 2 個百分點，但總數本身無法說明差異是否穩定，還需要知道各自答對哪些題目，以及題目是否獨立。

[Adding Error Bars to Evals](https://arxiv.org/abs/2411.00640v1) 討論配對比較、相關題目與實驗規劃。同一題集應分析逐題分數差；同一模板產生的變體應以模板分組，不能把大量相似題目當成等量獨立觀察。重複生成能估計取樣波動，不能彌補領域涵蓋不足。

可報告差異的 95% 信賴區間，並說明計算方法和抽樣單位。區間包含零時，不宜宣稱已證明某模型領先；這也不代表已證明兩者能力相等。同時比較許多模型或子項時，還需控制反覆尋找顯著結果的風險。

## 可複核的結果卡應包含什麼

| 項目 | 應保留的證據 | 缺少時的影響 |
| --- | --- | --- |
| 能力定義 | 目標任務、使用情境、排除範圍 | 不宜延伸為通用能力 |
| 資料身分 | 版本、題目時間、來源、分組 | 無法確認試卷是否相同 |
| 執行協定 | 模型版本、提示、工具、預算、次數 | 模型與系統設定影響混雜 |
| 評分協定 | 參考答案、評分器版本、複核規則 | 難以排除評分錯誤 |
| 不確定性 | 樣本量、配對差異、區間、重複執行 | 小差距可能被過度解讀 |
| 成本與失敗 | 總費用、耗時、失敗類型、涵蓋率 | 成功分數可能掩蓋不可用性 |

這是本文建議的編輯與實驗紀錄格式，不是替現有榜單補發認證。含敏感資料的原始紀錄應保留在受控環境；公開的是足以複核結論的去識別化證據與協定。

## 排名的用途是縮小選擇範圍

可信基準能協助找出候選模型與能力缺口。最後仍要回到實際任務分布：哪些失敗無法接受、費用與延遲是否符合需求，以及版本更新是否改變結果。

Folkbench 的編輯建議是先呈現各能力維度，再討論綜合分。若採用權重，就公開設定並檢查合理調整是否改變名次。證據不足時保留並列或「暫時無法區分」，比沒有依據的精確排名更有幫助。

接著可閱讀[數學推理穩健性](/zh-Hant/blog/mathematical-reasoning-robustness/)與[長上下文有效理解](/zh-Hant/blog/long-context-effective-understanding/)，了解具體應用。
