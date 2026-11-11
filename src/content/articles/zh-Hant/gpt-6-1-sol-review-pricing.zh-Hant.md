---
slug: gpt-6-1-sol-review-pricing
translationKey: gpt-6-1-sol-review-pricing
locale: zh-Hant
kind: article
title: GPT-6.1 Sol 的規格、長上下文標價與發布頁比較
description: "整理 GPT-6.1 Sol 模型頁的規格、272K 以下與以上的官方網站標價，以及發布頁寫明的差值與單一任務成本。這些數字來自 OpenAI 的公開頁面，不是 Folkbench 實測。"
category: 模型
tags: [價格, 基準測試, api]
authorId: iris-wu
modelIds: [gpt-6-1-sol, gpt-6-sol, gpt-6-astra, gpt-6-luna]
benchmarkSlugs: []
relatedSlugs: [claude-opus-5-5-review-pricing, claude-sonnet-5-5-review-pricing]
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: gpt-61-announcement
    label: OpenAI，GPT-6.1 Sol 發布頁
    url: https://openai.com/index/introducing-gpt-6-1-sol/
    checkedAt: '2026-10-02'
    claimScope: official
  - id: gpt-61-model
    label: OpenAI API，GPT-6.1 Sol 模型頁
    url: https://developers.openai.com/api/docs/models/gpt-6.1-sol
    checkedAt: '2026-10-02'
    claimScope: official
  - id: openai-pricing
    label: OpenAI API 價格表
    url: https://developers.openai.com/api/docs/pricing
    checkedAt: '2026-10-02'
    claimScope: official
  - id: gpt-61-system-card
    label: OpenAI，GPT-6.1 Sol 系統卡附錄
    url: https://deploymentsafety.openai.com/gpt-6-1-sol
    checkedAt: '2026-10-02'
    claimScope: official
---

> 下文的規格與價格來自 OpenAI 的模型頁和價格表，比較的說法來自發布頁，核對日期為 2026 年 10 月 2 日。發布頁列出的是差值和成本，不是一張可以直接抄錄絕對分數的表。Folkbench 沒有重跑這些評測。「大約五分之一成本」描述的是模型供應商自己的測試環境。

OpenAI 將 GPT-6.1 Sol 定位為 `gpt-6-sol` 的升級版，API 模型 ID 是 `gpt-6.1-sol`。發布頁的說法是：在複雜的程式開發、電腦操作和專業工作上接近 `gpt-6-astra`，標準輸入與輸出的標價則是 Astra 的五分之一。快取讀取為每百萬 Token $0.10，是標準輸入的 5%，也是 `gpt-6-sol` 快取讀取價格的一半。至於最困難的科學研究，發布頁仍建議使用 Astra。`gpt-6-sol` 也繼續留在價格表上。

GPT-6 Sol 與 Luna 的發布頁在 2026 年 9 月 29 日的更新中指向這個模型。本文不會把頁尾其他新聞卡片上的日期當成 GPT-6.1 Sol 本身的發布日。

Claude 這一側的標價和基準測試表，請參考 [Opus 5.5](../claude-opus-5-5-review-pricing/) 與 [Sonnet 5.5](../claude-sonnet-5-5-review-pricing/)。

## 已公開的規格

| 項目 | GPT-6.1 Sol |
| --- | --- |
| 模型 ID | `gpt-6.1-sol` |
| 上下文視窗 | 1,050,000 Token |
| 最大輸入 | 922,000 Token |
| 最大輸出 | 128,000 Token |
| 輸入到輸出 | 文字與圖片到文字 |
| 知識截止 | 2026 年 4 月 30 日 |
| `reasoning.effort` | `low`、`medium`（預設）、`high`、`xhigh`、`max` |
| 不接受的 effort | `none`、`minimal` |
| 工具呼叫 | Responses API |
| Chat Completions | 支援，但不含工具 |
| 列為支援的端點 | Chat Completions、Responses、Batch |
| 模型頁寫明不支援 | Realtime、Assistants、微調、Embeddings、圖片生成、影片、語音 |
| 資料駐留 | 支援美國與歐盟。Fast 模式不能搭配歐盟資料駐留使用 |

最大輸入 922,000 與上下文 1,050,000、最大輸出 128,000 對得起來：1,050,000 − 128,000 = 922,000。模型頁寫明支援推理 Token，但本文引用的段落並未另外列出推理 Token 的計費公式。編列預算時，請以用量記錄中的輸入、快取和輸出為準。

## 官方網站價格

### 短上下文與長上下文

單位為美元／每百萬 Token。短上下文與長上下文兩個級距都取自 2026 年 10 月 2 日查閱的 API 價格表。價格表寫明：短上下文是輸入不超過 272K Token，長上下文是輸入超過 272K Token。模型頁寫明，超過 272K 時，輸入和快取以 2 倍計價、輸出以 1.5 倍計價，而且適用於整次請求。

| 每 1M Token | 6.1 短 | 6.1 長 | Sol 短 | Sol 長 | Astra 短 | Astra 長 |
| --- | --- | --- | --- | --- | --- | --- |
| 輸入 | $2 | $4 | $2 | $4 | $10 | $20 |
| 快取讀取 | $0.10 | $0.20 | $0.20 | $0.40 | $1 | $2 |
| 快取寫入 | $2.50 | $5 | $2.50 | $5 | $12.50 | $25 |
| 輸出 | $10 | $15 | $10 | $15 | $50 | $75 |

輸入不超過 272K 時適用短上下文級距。一旦某次請求超過 272K，前面的 Token 也會改以長上下文級距的單價計算，並非只對超出的部分加價。6.1 的快取讀取是 Sol 的一半，標準輸入和輸出則是 Astra 的五分之一。但快取讀取並不是 Astra 的五分之一：Astra 短上下文的快取讀取是 $1，6.1 則是 $0.10。

快取寫入是未快取輸入的 1.25 倍，所以短上下文為 $2 × 1.25 = $2.50，長上下文為 $4 × 1.25 = $5。長上下文的輸出是短上下文的 1.5 倍，$10 × 1.5 = $15。

### 價格表上的其他乘數

模型頁另外列出三種官方乘數：Fast 模式是標準價格的 2 倍，Batch 和 Flex 比標準價格低 50%，有提供區域處理的地方再加 10%。同一天的價格表上，Batch、Flex 和 Fast 各有一列，數字與這三種乘數一致。例如 6.1 的 Fast 短上下文價格為輸入 $4、快取讀取 $0.20、快取寫入 $5、輸出 $20。

發布頁也提到，接下來幾天會在 Codex 推出 Ultrafast，Token 生成速度最高可達標準速度的 8 倍。2026 年 10 月 2 日查閱的旗艦價格表中，沒有獨立的 Ultrafast 模型列。某一筆帳單是否已套用官方乘數，請以用量記錄為準。

以下是三個可以用標準價格自行驗算的例子。前兩列落在短上下文級距。第三列是 28 萬輸入 Token，因此整次請求都適用長上下文級距。快取那一列假設用量記錄將這些輸入計為快取命中。

| 請求 | 計算 | 金額 |
| --- | --- | --- |
| 10 萬未快取輸入，5,000 輸出 | 0.1 × $2 + 0.005 × $10 | $0.25 |
| 10 萬快取讀取，5,000 輸出 | 0.1 × $0.10 + 0.005 × $10 | $0.06 |
| 28 萬未快取輸入，10,000 輸出 | 0.28 × $4 + 0.01 × $15 | $1.27 |

如果誤用短上下文單價去計算這 28 萬 Token，會得到 0.28 × $2 + 0.01 × $10 = $0.66，但那不是這個級距的價格。Fast、Batch、Flex 和區域加價都沒有計入這三列。

## 如何解讀發布頁上的比較

發布頁列出的是差值和成本，不是一張絕對分數表。下表只保留頁面上明確寫出的比較。成本相關的說法描述的是 OpenAI 的測試環境。

| 評測 | 發布頁寫明的比較 | 條件 |
| --- | --- | --- |
| DeepSWE v1.1 | 與 Astra 持平；比 Sol 的最佳成績高 6.4 個百分點 | 較低的 reasoning effort，成本約為五分之一 |
| GDP.pdf | 高於搭配 fallback 的 Opus 5.5；接近 Astra | 已測試的 reasoning 設定；成本不到 Opus 的一半，約為 Astra 的五分之一 |
| AutomationBench | 比 Opus 5.5 高 2.2 個百分點；比同一設定的 Sol 高 4.8 個百分點 | medium；成本約為 Opus 的三分之一 |
| OSWorld 2.0 離線集 | 比 Sol 高 7 個百分點；與 Astra 相差不到 2.1 個百分點 | max；partial reward，v2026.08.08；成本不到 Sol 的一半，約為 Astra 的七分之一 |
| Terminal-Bench Science 0.1 | 分數是 Sol 的兩倍以上；Astra 仍是受測模型中的最高分，為 68.1% | max；6.1 平均每項任務 $5.47，Opus 5.5 為 $23.21，Astra 為 $23.80 |
| 事實性 | 含至少一處事實錯誤的回答比例，從 11.4% 降到 7.7% | low；與 Astra 的差距不超過 1.9 個百分點 |

事實性的樣本是使用者曾經標出錯誤的去識別化對話。發布頁寫明，這些提示是刻意挑選的難題，不代表一般流量。Terminal-Bench Science 的美元金額是 OpenAI 公布的單一任務平均成本，不是任何一家中轉站的群組價格。受測模型中科學任務的最高分仍是 Astra 的 68.1%，發布頁也建議最困難的科學研究繼續使用 Astra。

同一頁的對齊測試也列出一組刻意設計得很難的失敗率。在搜尋工具已經故障的情況下，max effort 沒有告知使用者的比例分別是：6.1 為 2.1%、Sol 為 4.9%、Astra 為 1.5%、Luna 為 28.7%。發布頁寫明，並未觀察到任何繞過自動安全審查的嘗試，這點與 Astra 和 Sol 相同。詳細內容在 GPT-6.1 Sol 的系統卡附錄。這些失敗率並不是一般流量的故障率。

發布頁也寫明，評測是在研究環境或透過 API 執行，系統提示和工具可能與 ChatGPT 正式環境不同。競品數字取自公開報告。

## 請求中要分開處理的兩個入口

工具呼叫使用 Responses。預設 effort 已經是 `medium`。模型頁寫明，Chat Completions 可以傳送不含工具的文字。

```text
# Responses
model: gpt-6.1-sol
reasoning.effort: medium

# Chat Completions，不含 tools
model: gpt-6.1-sol
reasoning_effort: medium

# 模型頁寫明不接受
reasoning.effort: none
reasoning.effort: minimal
Chat Completions 請求中帶有 tools
```

從支援 `none` 的 `gpt-6-sol` 或 `gpt-6-luna` 移轉過來時，請改用 `low` 重新比較，不要把 `none` 留在請求中。工具、電腦操作、檔案搜尋和網頁搜尋都走 Responses，Chat Completions 只負責不含工具的請求。模型頁列出的 Responses 工具包括網頁搜尋、檔案搜尋、程式碼解譯器、電腦操作和 MCP。圖片輸入則放在使用者訊息的內容陣列中。

短上下文的輸入與輸出標價和 `gpt-6-sol` 相同，快取讀取則從 $0.20 降到 $0.10。長上下文的輸出兩者都是 $15，長上下文的快取讀取從 $0.40 降到 $0.20。改用 6.1 時，要固定完成結果回傳的模型名稱；如果完成結果落在其他 ID 上，就不算這次切換。

## 切換流量前要核對的事項

1. 固定使用 `gpt-6.1-sol`。完成結果中的模型名稱也必須是這個 ID。
2. 用同一組不含敏感資訊的資料集，分別以 `low`、`medium`、`high`、`xhigh` 和 `max` 重播。`none` 和 `minimal` 不在這張卡上。
3. 工具放在 Responses 上。Chat Completions 的請求不要帶工具。
4. 分別為不超過 272K 和超過 272K 的輸入計價。後者整次請求都適用長上下文單價。
5. 先用兩列標準價格編列預算。Fast、Batch、Flex 和區域加價，以用量記錄上實際出現的金額為準。
6. 先查看用量記錄中的快取 Token，再套用上面的快取算例。
7. 歐盟資料駐留不能與 Fast 模式同時使用。模型頁寫明支援美國與歐盟駐留，但並未把駐留描述成可以隨意加在任何閘道上的參數。
8. 最困難的科學研究繼續使用 `gpt-6-astra`。`gpt-6-sol` 仍在價格表上。

選定模型之後，各家中轉站是否提供這個 ID，以及當時的可用率和價格，請以目錄中已發布的記錄為準。本文的表格是 OpenAI 的標價，不是任何一家中轉站套用群組倍率之後的使用者價格。
