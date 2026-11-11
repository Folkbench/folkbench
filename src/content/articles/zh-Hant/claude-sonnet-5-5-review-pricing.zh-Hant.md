---
slug: claude-sonnet-5-5-review-pricing
translationKey: claude-sonnet-5-5-review-pricing
locale: zh-Hant
kind: article
title: Claude Sonnet 5.5 的規格、標價與發布頁基準
description: "整理 Claude Sonnet 5.5 的官方規格、與 Sonnet 5 相同的標價，以及發布頁列出的基準測試，並另外列出遷移時會回傳 400 的請求。這些數字並非 Folkbench 實測。"
category: 模型
tags: [價格, 基準測試, api]
authorId: iris-wu
modelIds: [claude-sonnet-5-5, claude-sonnet-5, claude-opus-5-5, gpt-6-sol]
benchmarkSlugs: []
relatedSlugs: [claude-opus-5-5-review-pricing, gpt-6-1-sol-review-pricing]
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: sonnet-55-announcement
    label: Anthropic，Claude Sonnet 5.5 發布頁
    url: https://www.anthropic.com/claude-sonnet-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-55-overview
    label: Claude Platform，Sonnet 5.5 模型頁
    url: https://platform.claude.com/docs/en/models/sonnet-5-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-55-whats-new
    label: Claude Platform，Sonnet 5.5 更新說明
    url: https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-55-migration
    label: Claude Platform，遷移至 Sonnet 5.5
    url: https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-5-overview
    label: Claude Platform，Sonnet 5 模型頁
    url: https://platform.claude.com/docs/en/models/sonnet-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
---

> 下文的規格、標價和分數都取自 Anthropic 的公開頁面，核對日期為 2026 年 10 月 2 日。Folkbench 沒有重跑這些基準測試。模型供應商所說的「最多便宜 30%」「快 30% 以上」，描述的是他們自己的測試環境。

Claude Sonnet 5.5 於 2026 年 9 月 28 日發布，是 Claude 5.5 系列的第二款模型。Claude API 的模型 ID 是 `claude-sonnet-5-5`。Anthropic 把它擺在 [Opus 5.5](../claude-opus-5-5-review-pricing/) 旁邊：範圍明確的日常任務、修 bug，以及文件、簡報和試算表，交給這一款；複雜、開放、需要持續判斷的工作，發布頁仍寫明 Opus 5.5 比較強。官方標價與 Sonnet 5 相同：每百萬輸入 Token $2，每百萬輸出 Token $10，快取讀取 $0.20。

兩份發布頁都寫到 Haiku 5.5 會在接下來幾週推出。本文不替尚未出現在價格表上的 ID 標價。

## 已公開的規格

| 項目 | Claude Sonnet 5.5 |
| --- | --- |
| Claude API 模型 ID | `claude-sonnet-5-5` |
| 發布日期 | 2026 年 9 月 28 日 |
| 上下文／同步最大輸出 | 1M / 128K tokens |
| 輸入到輸出 | 文字和圖片到文字 |
| 思考 | 自適應，預設開啟 |
| Claude API 的預設 effort | `high` |
| Claude 應用程式與 Claude Code 的預設 effort | `medium` |
| effort 可選值 | `low`、`medium`、`high`、`xhigh`、`max` |
| 模型頁上的延遲等級 | Fast。這是與目前 Claude 產品線相比的結果，不是 tokens/秒 |
| 可靠知識截止 | 2026 年 6 月 |
| 可快取提示的最短長度 | 512 tokens |
| 分詞器 | 與 Sonnet 5 相同，同一段文字的 Token 數相同 |

Sonnet 5 的模型頁仍將它標為 legacy、可用，輸入和輸出同樣是 $2 / $10，可靠知識截止為 2026 年 1 月。退役承諾是不早於 2027 年 6 月 30 日。Sonnet 5.5 的更新說明建議遷移到 5.5。

關閉預先思考的最低設定是 `thinking: {"type": "between_tools"}`，只在 `low`、`medium` 和 `high` 下接受。`xhigh` 和 `max` 必須改回自適應思考。遷移指南寫明，`temperature`、`top_p` 或 `top_k` 設為非預設值時會回傳 400。

## 官方標價

單位是美元／每百萬 tokens。Sonnet 5.5 這一欄取自模型頁。Opus 5.5 的輸入、輸出和快取讀取取自同一份發布頁的比較表。更新說明寫明，Sonnet 5.5 的價格與 Sonnet 5 相同，包含提示快取和批次處理。批次折扣是輸入和輸出的 50%。

| 每 1M tokens | Sonnet 5.5 | 發布頁上的 Opus 5.5 |
| --- | --- | --- |
| 輸入 | $2 | $4 |
| 輸出 | $10 | $20 |
| 快取讀取 | $0.20 | $0.20 |
| 快取寫入 | 5 分鐘 $2.50；1 小時 $4 | 發布頁只列一個 $5，更新說明另外拆成 5 分鐘 $5 和 1 小時 $8 |
| 批次輸入／輸出 | 標價的 50% | 這張發布頁比較表沒有列出 |

和 Opus 5.5 相比，這一款的輸入和輸出價格是一半。快取讀取兩款都是 $0.20。發布頁把 Opus 5.5 的快取寫入只列成一個 $5，沒有拆開 5 分鐘和 1 小時。Sonnet 5.5 的模型頁則把兩檔分開列出。

Anthropic 另外有兩項工作負載說法：同樣的工作通常更省 Token，多數任務最多便宜 30%；輸出生成速度比 Sonnet 5 快 30% 以上。成本圖上還有「約十分之一」「約五分之一」「約十五分之一」「約九分之一」的單一任務成本比較。這些都是他們測試環境裡的結果。實際帳單仍取決於 effort、快取命中、工具輪次，以及是否使用批次處理。

以下三個例子可以依官方標價自行計算。每一例都是 10 萬個對應類別的輸入 Token，加上 5,000 個輸出 Token。

| 請求 | 計算 | 金額 |
| --- | --- | --- |
| 10 萬未快取輸入，5,000 輸出 | 0.1 × $2 + 0.005 × $10 | $0.25 |
| 10 萬快取讀取，5,000 輸出 | 0.1 × $0.20 + 0.005 × $10 | $0.07 |
| 10 萬 5 分鐘快取寫入，5,000 輸出 | 0.1 × $2.50 + 0.005 × $10 | $0.30 |

第三列用的是 5 分鐘寫入價，不是 1 小時的 $4。1 小時寫入是 0.1 × $4 + 0.005 × $10 = $0.45。

## 發布頁上的基準測試該怎麼看

下表就是 2026 年 10 月 2 日發布頁上列出的那一張。破折號代表發布頁本身留白的欄位。Terminal-Bench 4.0 和 CursorBench 4.0 的成本圖改用 GPT-5.6 Sol，因為 OpenAI 沒有公開 GPT-6 Sol 這兩項的分數。本文不會把圖上的 GPT-5.6 Sol 填進 GPT-6 Sol 這一欄。

| 基準 | Sonnet 5.5 | Sonnet 5 | Opus 5.5 | GPT-6 Sol |
| --- | --- | --- | --- | --- |
| Terminal-Bench 4.0 | 70.6% | 10.3% | 66.4% | — |
| FrontierCode v1.1（Main） | 46.2%（max）；52.1%（xhigh） | 42.4% | 54.4% | 49.3% |
| CursorBench 4.0 | 55.5% | 34.1% | 57.8% | — |
| GDPval-AA v2.1 | 1844 | 1449 | 1846 | 1487 |
| AA-Briefcase v1.1 | 1811 | 1359 | 1822 | 1483 |
| Humanity's Last Exam，使用工具 | 64.5% | 54.9% | 67.7% | — |
| OSWorld 2.1，partial | 80.1% | 57.0% | 81.8% | — |
| Chartography，不使用工具 | 61.6% | 15.6% | 64.4% | 53.6% |

這一列 Chartography 是不使用工具的分數。Opus 5.5 發布頁上的 Chartography 是使用工具的另一列，Opus 5.5 在那裡是 89.0%，不能和這裡的 64.4% 並列成同一次測量。

註腳要和分數一起看。Opus 5.5 的 Terminal-Bench 4.0 是 xhigh 的成績，發布頁稱這是該模型的最高分。在 FrontierCode 上，Sonnet 5.5 的 max 低於 xhigh。發布頁的解釋是：max 更常執行程式碼審查，而審查被拆給多個子 Agent 之後，出現過逾時，也出現過超出任務範圍的修改，而這項評測會扣超出範圍的改動。

GDPval-AA 和 AA-Briefcase 是由 Artificial Analysis 在一個預發布部署上跑的。該部署有一個可能拉低結構化輸出表現的缺陷。發布頁說這個缺陷後來已經修正，若有影響，方向是低估 Sonnet 5.5。GPT-6 Sol 欄位上的 GDPval-AA、AA-Briefcase 和 Chartography 還附有另一則說明：OpenAI 修正過一個損害圖像理解的缺陷，這些外部分數當時未必已經更新。

同一頁的成本圖是另一種看法。Medium effort 是 Claude 應用程式的預設值。在幾項基準測試上，Low 或 Medium 的 Sonnet 5.5 以約十分之一的單一任務成本，超過 Sonnet 5 的最佳成績。High effort 是 Claude Platform 的預設值。發布頁寫道，FrontierCode 在 High 下比同一檔的 Sonnet 5 高約 10 分，單一任務成本約為十五分之一，並追平 GPT-6 Sol 的最佳成績，成本約為五分之一。CursorBench 在 Low 下超過 Sonnet 5 的最佳成績，成本不到十分之一。AA-Briefcase 在 Medium 下超過 Sonnet 5 的最佳成績，成本約為九分之一。

表中的 55.5% 和 1844 是發布頁列出的數據點，成本的那些句子則來自另一套測試環境。發布頁同時寫明，在 Anthropic 自己的使用和外部測試中，複雜、開放、需要持續判斷的工作仍是 Opus 5.5 比較強。客戶推薦語是挑選過的證詞，不屬於這張表。發布頁還提到，它是第一款只靠螢幕截圖就破關 Pokémon Red 的 Sonnet。那是產品敘事，不是上表中的一列。

## 從 Sonnet 5 遷移過來

更新說明列出五項變更，會讓原本在 Sonnet 5 上執行的程式碼回傳 400。另外也有請求仍然成功、但回應結構改變的情況。

```text
model: claude-sonnet-5-5
max_tokens: 1024
thinking: {"type": "adaptive"}
output_config.effort: medium
# 400：thinking 類型為 disabled
# 400：thinking 類型為 enabled，且帶有 budget_tokens
# 400：thinking 類型為 between_tools，且 effort 為 xhigh 或 max
# 400：tool_choice 為 any，或 tool_choice 為 tool
# 400：temperature、top_p、top_k 為非預設值
# 400，僅限 Claude API 與 Google Cloud：工具類型 computer_20251124
# 400：顧問工具使用 Opus 4.8、Opus 4.7 或 Sonnet 5 作為顧問
```

要關閉預先思考時，送出 `between_tools`，effort 維持在 `high` 或以下。`between_tools` 不能再同時帶 `display`、`budget_tokens` 或 `block_binding`。`tool_choice` 繼續使用 `auto` 或 `none`。若要取得符合 schema 的工具參數，請開啟嚴格工具呼叫，或改用結構化輸出，並在提示中寫明何時該呼叫工具。

在 Claude API 和 Google Cloud 上，電腦操作改用 `computer_toolset_20260801`。更新說明寫明 Amazon Bedrock 仍接受原本的 `computer_20251124`。

顧問工具接受 Mythos 5.1、Fable 5.1、Mythos 5、Fable 5、Opus 5.5、Opus 5，或 Sonnet 5.5 本身。Opus 4.8、Opus 4.7 和 Sonnet 5 可以擔任 Sonnet 5 的顧問，但不能擔任 Sonnet 5.5 的顧問。顧問回傳的內容經過加密，用戶端讀不到內文。

2026 年 8 月 31 日 00:00 UTC 當下及之後建立的帳號，在 Claude API、Amazon Bedrock 和 Google Cloud 上還有一種 400：重播 Sonnet 5.5 的思考區塊時，如果系統提示、工具清單或更早的訊息已經改過，請求就會失敗。對話請維持只附加不修改。必須調整指令時，請在對話中途插入系統訊息。

省略 effort 時，API 會以 `high` 執行。同樣的設定名稱，在 Sonnet 5 上對應的思考量並不相同。更新說明要求重新做一次 effort 掃描，不要直接沿用舊設定。範圍明確的工具迴圈可以從 `medium` 開始，任務較長或較難時再調到 `high`。對延遲敏感的對話從 `medium` 或 `low` 開始。Claude 應用程式和 Claude Code 的預設值已經是 `medium`，Claude Platform 的預設值是 `high`。

工具呼叫之間超過一兩句的進度文字，會回到思考區塊裡。display 為預設的 `omitted` 時，這些區塊的文字是空的，介面在工具之間會安靜下來，但請求本身仍然成功。使用 `between_tools` 時，這段文字會以摘要形式出現在思考區塊中，重播時模型看到的是完整的筆記。

思考區塊會記錄產生它的模型。更新說明寫明，Sonnet 5.5 能讀取 Sonnet 5、Opus 4.8、Haiku 4.5 和更早模型的思考區塊，但不讀取 Opus 5、Opus 5.5、Fable 或 Mythos 的思考區塊。在 Claude API 和 Google Cloud 上，Opus 5.5 能讀取 Sonnet 5.5 的思考區塊，其他現行模型都不能。目標模型讀不了的區塊會在模型看到之前被捨棄，請求仍然成功，被捨棄的區塊不計費。

被拒絕的請求會以 HTTP 200 回傳，`stop_reason` 為 `"refusal"`。發布頁寫明，它的資安能力已接近 Opus 5，因此這是第一款搭載同類資安防護的 Sonnet。風險較高的資安任務會退回由 Sonnet 5 處理。生物防護與 Sonnet 5 相同。一般軟體開發和多數生命科學工作不在這兩項範圍很窄的防護之內。發布頁同時寫明，Sonnet 5.5 可以提供零資料保留。

## 切換流量前要核對的事項

1. 固定使用 `claude-sonnet-5-5`，也要核對完成結果中的模型名稱。資安防護退回時，實際作答的模型可能是 Sonnet 5。
2. 用同一組不含敏感資料的測試集，分別在 `low`、`medium`、`high`、`xhigh` 和 `max` 下重播，記錄成功率、延遲、輸入、快取讀取、快取寫入、輸出和費用。
3. effort 放在 `output_config.effort` 裡。不要用手動的 `budget_tokens` 設定這一款的思考深度。
4. 原本會送出 `disabled`、強制工具選擇、取樣參數或 `computer_20251124` 的用戶端，先修改再擴大流量。Bedrock 上的舊版電腦操作工具是例外。
5. 會重播思考區塊的對話，維持只附加不修改。
6. HTTP 200 的拒答和傳輸失敗要分開計算。
7. 用一則短提示和一則應該命中快取的提示核對計費金額。5 分鐘寫入、1 小時寫入和批次五折是不同的價目。
8. 複雜、開放、需要持續判斷的任務繼續使用 `claude-opus-5-5`。`claude-sonnet-5` 的模型頁仍標示為可用。OpenAI 那一邊的價格分級，請見 [GPT-6.1 Sol](../gpt-6-1-sol-review-pricing/)。

選定模型之後，各家中轉站是否提供這個 ID，以及當時的可用性和價格，以目錄中已發布的紀錄為準。本文不比較各家中轉站。
