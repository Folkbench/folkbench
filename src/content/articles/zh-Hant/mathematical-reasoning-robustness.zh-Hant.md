---
slug: mathematical-reasoning-robustness
translationKey: mathematical-reasoning-robustness
locale: "zh-Hant"
kind: article
title: "換個數字，推理還成立嗎？GSM-Symbolic 與數學能力評測"
description: "區分數學作答、算術執行與推理穩健性，透過受控變體、配對統計與工具對照，理解 GSM-Symbolic 的證據邊界。"
category: "評測方法"
tags: [數學, 推理, 基準]
authorId: iris-wu
modelIds: []
benchmarkSlugs: []
relatedSlugs: [llm-benchmark-rankings-contamination, long-context-effective-understanding]
publishedAt: '2026-11-14'
updatedAt: '2026-11-14'
sources:
  - id: gsm-symbolic
    label: Mirzadeh 等，GSM-Symbolic，2025 修訂版
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
    label: Glazer 等，FrontierMath，2025 修訂版
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

一道題答對，只證明那次回答符合答案。若換個名稱、稍微調整數字，或加入不影響求解的句子，表現就不穩定，下一步應釐清錯誤發生在哪裡。數學評測除了提高難度，也需要可控制的條件與有診斷價值的比較。

資料核對截至 2026-11-14。本文討論研究方法與評測設計，Folkbench 本輪未執行模型。下文題目與數值均為明確標示的教學範例，不是模型成績。

## 數學能力包含不同環節

解文字題通常需要辨認數量與單位、理解關係、建立算式、執行運算，最後依要求輸出答案。任何環節出錯都可能得到同一個零分。因此，最終答案準確率能衡量交付結果，卻無法單獨解釋錯誤機制。

建立正確算式卻算錯乘法，與使用錯誤關係卻碰巧得到正確數字，是不同情況。可以檢查可觀察的算式與答案，但不能把流暢的推理文字當成內部運算的完整紀錄。使用工具時，也要檢查呼叫是否有效、是否正確使用回傳結果。

## GSM-Symbolic 讓同類題的變化可受控制

[GSM-Symbolic](https://arxiv.org/abs/2410.05229v2) 從 GSM8K 題目建立符號模板，再生成多個實例。論文實驗使用 100 個模板，每個生成 50 個實例，共 5,000 個樣本。數字與名稱、條件複雜度和無關資訊的變化，提供不同的穩定性觀察角度。

值得借鑑的是固定關係、改變表面條件的方法，而非把歷史成績表套用到所有後續模型。研究涉及特定模型與協定，不代表 2026 年所有系統；作者對推理機制的解釋，也應與行為觀察分開。

較早的[無關上下文研究](https://proceedings.mlr.press/v202/shi23a.html)和[數學推理穩健性的因果分析架構](https://aclanthology.org/2023.acl-long.32/)提供相關研究路徑。這些工作支持進行受控診斷，但受到干擾不等於證明模型在所有任務都沒有推理能力。

## 什麼樣的題目變體才有效

以下為本文原創教學範例，不屬於任何基準，也未用於模型測試。商店有 6 盒鉛筆，每盒 8 支，送出 9 支後剩下多少？參考算式為 `6 × 8 − 9 = 39`。

| 變體 | 改動 | 預期檢查 |
| --- | --- | --- |
| 名稱 | 商店改成學校，數量與關係不變 | 答案仍為 39 |
| 數值 | 7 盒、每盒 6 支、送出 8 支 | 重新計算為 34 |
| 措辭 | 調整敘述順序並保留清楚指涉 | 答案仍為 39 |
| 無關資訊 | 加入「盒子是藍色的」 | 答案仍為 39 |

數值變化需要重新生成答案，不能只替換題幹。也不應任意引入負數數量、讓分配問題突然無法整除，或把簡單算術變成大數運算；這可能改變難度或語意。

「無關」尤其需要人工核對。加入「其中兩盒已被預訂」後，讀者可能合理地將問題理解為可售庫存，答案不再顯然不變。先確認新增資訊確實不參與求解，才能把下降解釋為抗干擾不足。無效變體應在查看模型成績前剔除，不能事後只挑會讓某模型失誤的題目。

## 將評測設計成分層實驗

先選擇多種關係類型與難度，再為每道原題建立相同數量的變體。一次只改變一項主要因素，讓差異可解釋。開發題用於調整提示與解析器；正式題集凍結後，不再根據其分數挑選提示。

同一輪比較應固定模型快照、語言、提示、工具權限、取樣設定、輸出預算及作答次數。題目隨機排序，每題使用獨立上下文，避免前一個變體透露答案。若研究多輪學習，應另設協定，不能混入獨立作答成績。

樣本量應依想辨別的效果大小與預算決定。大量複製同一模板只能測該模板的穩定性，不代表涵蓋許多推理能力。應確保關係與難度具有代表性，而非只增加近似題目。

## 準確率與穩定性一起報告

基本結果是各類變體的準確率，以及原題與變體的配對差。也可呈現兩者都答對的比例，觀察成功是否持續。不能只挑原題答對的樣本，再把該子集當成無條件的總體比較；若使用條件子集，應說明分母及選取方式。

假設原題準確率為 80%，變體為 68%，下降為 **12 個百分點**，相對下降為 **15%**。這是說明單位的假設算例，不是 GSM-Symbolic 或 Folkbench 的實驗結果。所有語言版本都必須區分百分比與百分點。

同一模板的變體共享結構，統計應保留相關性。[Adding Error Bars to Evals](https://arxiv.org/abs/2411.00640v1) 討論相關題目與配對比較。可採用的方法之一，是按模板成組重抽樣，且兩模型在每次重抽樣使用相同題組；需公開方法、95% 信賴區間與重複生成次數。

## 計算機對照有助診斷，但會改變評測對象

可以分開執行不提供外部計算工具，以及提供相同計算機介面與呼叫上限的實驗。後者評估模型加工具的系統，應獨立列出結果。

工具若明顯改善表現，可進一步檢查原先錯誤是否集中於算術。但改善不證明其餘推理全部正確，因為工具也可能改變提示、推理路徑與時間預算。保留算式、工具請求及回傳結果的使用方式，才能更具體定位問題。

證明題尤其不能只評數值答案。是否涵蓋全部情況、是否引用未證明假設，需要另外的驗證協定。形式化檢查器能核驗形式系統內的推導，但形式化命題是否忠實表達原題，仍需檢查。

## 難度與穩健性是不同軸線

[FrontierMath](https://arxiv.org/abs/2411.04872v7) 使用專家設計的高難數學題與可自動核驗的答案，提供基礎文字題之外的研究方向。它探索高難任務表現，GSM-Symbolic 則檢查受控變化下的穩定性，兩者不能互相取代。

模型可能解出某些高難題，卻因簡單任務換種措辭而失敗；另一個可能穩定，卻無法處理更複雜的數學。應分別呈現難度、變體與工具條件，而不是揉成「數學智商」。

本文建議的標準是答案正確、關係變化受控、錯誤可解釋、統計單位合理，以及資源預算明確。它們讓數學評測成為可複核的能力比較。完整紀錄要求見[模型排名可信度分析](/zh-Hant/blog/llm-benchmark-rankings-contamination/)。
