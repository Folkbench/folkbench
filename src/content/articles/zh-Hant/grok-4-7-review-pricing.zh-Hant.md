---
slug: grok-4-7-review-pricing
translationKey: grok-4-7-review-pricing
locale: zh-Hant
kind: article
title: Grok 4.7 的規格、長上下文標價與發布頁基準測試
description: "整理 Grok 4.7 的模型名稱、500K 上下文、200K 以下與以上的官方網站標價，以及發布頁列出的基準測試。這些數字來自 xAI 的公開頁面，不是 Folkbench 實測。"
category: 模型
tags: [價格, 基準測試, api]
authorId: iris-wu
modelIds: [grok-4-7, grok-4-6]
benchmarkSlugs: []
relatedSlugs: [gpt-6-1-sol-review-pricing, claude-opus-5-5-review-pricing, claude-sonnet-5-5-review-pricing]
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: grok-47-announcement
    label: xAI，Grok 4.7 發布頁
    url: https://x.ai/news/grok-4-7
    checkedAt: '2026-10-02'
    claimScope: official
  - id: grok-47-guide
    label: xAI 文件，Grok 4.7
    url: https://docs.x.ai/developers/grok-4-7
    checkedAt: '2026-10-02'
    claimScope: official
  - id: grok-47-model
    label: xAI 文件，Grok 4.7 模型頁
    url: https://docs.x.ai/developers/models/grok-4.7
    checkedAt: '2026-10-02'
    claimScope: official
  - id: xai-pricing
    label: xAI API 價格表
    url: https://docs.x.ai/developers/pricing
    checkedAt: '2026-10-02'
    claimScope: official
---

> 下文的規格與價格來自 xAI 的文件和價格表，基準測試來自 2026 年 9 月 21 日的發布頁，核對日期為 2026 年 10 月 2 日。Folkbench 沒有重跑這些評測。發布頁上的競品價格和分數，是該頁印出的數字，並非同一天重新核對 OpenAI 或 Anthropic 價格表的結果。

xAI 於 2026 年 9 月 21 日發布 Grok 4.7，API 模型名稱是 `grok-4.7`。文件將它定位為面向程式開發、Agent 任務和知識工作的前沿模型。發布頁內文寫明：它與 [Grok 4.6](https://x.ai/news/grok-4-6) 同價、同速。但同一頁的標題又寫著「速度約為兩倍，價格約為同級模型的一半」。這兩句話都印在發布頁上，本文不會把標題這句話再當成另一張價格表。

同一天可以互相核對的地方主要有三處。文件的總覽表列出 500,000 Token 的上下文、2026 年 5 月的知識截止，以及短上下文輸入 $2、輸出 $6 的價格。價格表在提示達到 200K Token 之後改用長上下文價格，而且整次請求都以長上下文計價。發布頁的基準測試表則把 `grok-4.7` 和 Grok 4.6、GPT-5.6 Sol、Fable 5.1 放在一起比較。OpenAI 這一側的長上下文級距請參考 [GPT-6.1 Sol](https://folkbench.com/zh-Hant/blog/gpt-6-1-sol-review-pricing)，Claude 這一側請參考 [Opus 5.5](https://folkbench.com/zh-Hant/blog/claude-opus-5-5-review-pricing) 與 [Sonnet 5.5](https://folkbench.com/zh-Hant/blog/claude-sonnet-5-5-review-pricing)。

## 已公開的規格

| 項目 | Grok 4.7 |
| --- | --- |
| 模型名稱 | `grok-4.7` |
| 發布日期 | 2026 年 9 月 21 日 |
| 上下文視窗 | 500,000 Token |
| 知識截止 | 2026 年 5 月 |
| 輸入到輸出 | 文字與圖片到文字 |
| 文件總覽表的輸出上限 | 寫明沒有文字輸出上限，也沒有另外列出最大輸出 Token 數 |
| `reasoning` | `low`、`medium`、`high`（預設）、`xhigh` |
| API | Responses、Chat Completions |
| 文件列出的工具 | 函式呼叫、網頁搜尋、X 搜尋、程式碼執行 |
| 模型頁上的 Batch API | 不支援 |

模型頁將預設 effort 設為 `high`。文件建議在 Responses 上設定 `prompt_cache_key`；Chat Completions 則使用請求標頭 `x-grok-conv-id`。頁面寫明，少了這個鍵，對話請求常會落在尚未建立快取的伺服器上，輸入就會以未快取價格計算。Responses 也會回傳 `reasoning.encrypted_content`，即使請求沒有把它列在 `include` 中。多輪對話需要把這些 reasoning 項目原封不動地放回下一次的 `input`。文件寫明 Chat Completions 在這一點上沒有變動。

文件列出的使用途徑包括 xAI API、美國區域端點 `https://us.api.x.ai/v1`、Grok Build、Cursor，以及 OpenRouter、Vercel 和 Cloudflare 等閘道。Grok Build 的預設模型就是這一款。美國區域端點目前列出的模型是 `grok-4.7` 和 `grok-4.6`。某一家中轉站是否提供這個 ID，請以目錄中已發布的記錄為準，本文不做此類宣稱。

## 官方網站價格

### 短上下文與長上下文

單位為美元／每百萬 Token，取自 2026 年 10 月 2 日查閱的 API 價格表。價格表寫明：長上下文的門檻是提示達到 200K Token；一旦達到，這次請求中的所有 Token 都以長上下文單價計算，並非只對超出的部分加價。`grok-4.7` 和 `grok-4.6` 在這張表上的六格數字完全相同。

| 每 1M Token | 4.7 短 | 4.7 長 | 4.6 短 | 4.6 長 |
| --- | --- | --- | --- | --- |
| 輸入 | $2 | $4 | $2 | $4 |
| 快取讀取 | $0.50 | $1 | $0.50 | $1 |
| 輸出 | $6 | $12 | $6 | $12 |

不到 200K 的提示適用短上下文級距。從達到 200K 的那一次請求起，前面的 Token 也會改以長上下文單價計算。長上下文是短上下文的 2 倍：$2 × 2 = $4，快取 $0.50 × 2 = $1，輸出 $6 × 2 = $12。快取讀取是同一級距輸入價格的四分之一：$2 × 0.25 = $0.50，$4 × 0.25 = $1。

以下三個例子只用標準價格計算。前兩列落在短上下文級距。第三列是 28 萬輸入 Token，因此整次請求都適用長上下文級距。快取那一列假設用量記錄將這些輸入計為快取命中。

| 請求 | 計算 | 金額 |
| --- | --- | --- |
| 10 萬未快取輸入，5,000 輸出 | 0.1 × $2 + 0.005 × $6 | $0.23 |
| 10 萬快取讀取，5,000 輸出 | 0.1 × $0.50 + 0.005 × $6 | $0.08 |
| 28 萬未快取輸入，10,000 輸出 | 0.28 × $4 + 0.01 × $12 | $1.24 |

如果誤用短上下文單價去計算這 28 萬 Token，會得到 0.28 × $2 + 0.01 × $6 = $0.62，但那不是這個級距的價格。Fast、美國區域加價和工具呼叫都沒有計入這三列。

### 價格表上另外列出的乘數

美國區域端點 `https://us.api.x.ai/v1` 會把推論留在美國境內，Token 以全球價格的 1.1 倍計算，也就是加價 10%。價格表為 `grok-4.7` 列出的結果是：200K 以下輸入 $2.20、快取讀取 $0.55、輸出 $6.60；200K 以上輸入 $4.40、快取讀取 $1.10、輸出 $13.20。1.1 倍適用於輸入、輸出和快取讀取，也包含長上下文級距。計算時先套用快取折扣，再乘以 1.1。

Grok 4.7 Fast 是同一個模型、搭配更快基礎設施的服務。文件寫明：標準請求為 2 倍，長上下文請求為 1.5 倍；只在 Cursor 和 Grok Build 中提供，並由該處的方案計費；不在公開的 xAI API 上，Grok Build 的免費方案也不包含。價格表列出的 Fast 單價為：200K 以下輸入 $4、快取 $1、輸出 $12；200K 以上輸入 $6、快取 $1.50、輸出 $18。$4 / $1 / $12 是短上下文的 2 倍，$6 / $1.50 / $18 則是長上下文的 1.5 倍。發布頁另有一句「輸出速度兩倍、價格兩倍」，但沒有寫出這個 1.5 倍的級距。計費請以文件中的這張表為準。

模型頁寫明不支援 Batch API。價格表的批次折扣名單中沒有 `grok-4.7`，列出享有 20% 批次折扣的是另一組模型。價格表也說明了文字請求的 Priority Processing：回應中確認 `service_tier` 為 `priority` 時，以 2 倍計價，並且先套用快取折扣再相乘。Grok 4.7 的模型頁沒有獨立的 Priority 列。某一筆請求是否套用了這個倍數，請以回應中的 `service_tier` 為準。

文件也為伺服器端工具另外列出呼叫價格。網頁搜尋為每千次呼叫 $5。X 搜尋依取回的項目計價：每千則貼文 $5，每千份使用者資料 $10。程式碼執行為每千次呼叫 $5。這些費用不包含在 Token 價格內。模型頁列出的速率限制是每秒 150 個請求、每分鐘 50,000,000 Token，區域標示為 `us-east-1`。文件同時寫明，各團隊當下的速率限制和即時價格以模型頁為準，所以這兩組數字並不是對所有帳號的承諾。

## 如何解讀發布頁上的基準測試

發布頁列出的是一張比較表，不是 Folkbench 的測量結果。欄位依序是 Grok 4.7 xHigh、Grok 4.6 High、GPT-5.6 Sol Max、Fable 5.1 Max。兩列價格是該頁印出的輸入與輸出標價。DeepSWE 的 `grok-4.7` 那一格是 71.0%，星號註明這一格用的是 high，而不是欄位標題上的 xHigh。

| 項目 | Grok 4.7 | Grok 4.6 | GPT-5.6 Sol | Fable 5.1 |
| --- | --- | --- | --- | --- |
| 輸入／1M | $2 | $2 | $4 | $10 |
| 輸出／1M | $6 | $6 | $20 | $50 |
| CursorBench 4.0 | 46.3% | 40.4% | 41.7% | 51.8% |
| DeepSWE v1.1 | 71.0%（high） | 65.2% | 72.7% | 70.0% |
| EEBench | 64.0% | 53.0% | 39.4% | 56.4% |
| AA Briefcase v1.1 | 1,657 | 1,546 | 1,487 | 1,678 |
| Terminal-Bench 4.0 | 37.6% | 20.3% | 37.3% | 57.9% |
| Harvey Legal Agent Benchmark | 19.6% | 15.8% | 2.5% | 6.7% |
| HealthBench Professional | 56.7% | 48.5% | 60.5% | 62.1% |

發布頁還寫道，Grok 4.7 在 GDPval 和 AA Briefcase 上都優於 Grok 4.6，並與其他前沿模型不相上下。GDPval 那張圖並未在內文中提供可以抄錄的絕對分數，本文也不另外補上數字。AA Briefcase 的分數就是上表中的 1,657。

安全章節列出兩個數字。LatchBio 的生物安全基準測試為 62.4%。在 HackerBench v0.3 上，有風險的兩用提示被放行的比例是 3.3%。頁面表示它很少擋下正當的資安工作，但沒有列出正當請求的拒絕率。受邀的資安合作夥伴可以申請僅限受邀者使用的紅隊能力。這些數字描述的是發布頁的測試，並不是一般流量的故障率。

## 切換流量前要核對的事項

1. 固定使用 `grok-4.7`。完成結果中的模型名稱也必須是這個 ID。目錄頁面使用的是 `grok-4-7`。
2. 預設 effort 是 `high`。要比較不同設定時，請明確寫出 `low`、`medium`、`high` 或 `xhigh`。
3. 多輪請求要帶上 `prompt_cache_key`，或在 Chat Completions 上帶 `x-grok-conv-id`。Responses 回傳的加密 reasoning 要原封不動地送回。
4. 分別為不到 200K 和達到 200K 的提示計價。後者整次請求都適用長上下文單價。
5. 美國區域端點以 1.1 倍計價。Fast 不在公開 API 上，不要把 2 倍和 1.5 倍乘進一般的 API 帳單。
6. 模型頁寫明不支援 Batch API。工具呼叫另依文件中的每千次價格計費。
7. 發布頁基準測試表中的競品欄位，沿用該頁印出的價格和分數。DeepSWE 的 71.0% 是 high，不是 xHigh。
8. 中轉站是否提供這個 ID，以及當時的可用率和成交價，請以目錄中已發布的記錄為準。本文的表格是 xAI 的標價，不是任何一家中轉站套用群組倍率之後的使用者價格。
