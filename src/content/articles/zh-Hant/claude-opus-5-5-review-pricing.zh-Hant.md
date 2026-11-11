---
slug: claude-opus-5-5-review-pricing
translationKey: claude-opus-5-5-review-pricing
locale: zh-Hant
kind: article
title: Claude Opus 5.5 的規格、標價與發布頁基準
description: "整理 Claude Opus 5.5 的官方規格、標價和發布頁基準表，並列出遷移時會直接回傳 400 的請求。數字來自模型供應商的公開頁面，不是 Folkbench 實測。"
category: 模型
tags: [價格, 基準測試, api]
authorId: iris-wu
modelIds: [claude-opus-5-5, claude-opus-5, claude-fable-5-1, claude-sonnet-5-5, gpt-6-astra, gpt-5-6-sol]
benchmarkSlugs: []
relatedSlugs: [claude-sonnet-5-5-review-pricing, gpt-6-1-sol-review-pricing]
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: opus-55-announcement
    label: Anthropic，Claude Opus 5.5 發布頁
    url: https://www.anthropic.com/claude-opus-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: opus-55-overview
    label: Claude Platform，Opus 5.5 模型頁
    url: https://platform.claude.com/docs/en/models/opus-5-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
  - id: opus-55-whats-new
    label: Claude Platform，Opus 5.5 更新說明
    url: https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-5-overview
    label: Claude Platform，Sonnet 5 模型頁
    url: https://platform.claude.com/docs/en/models/sonnet-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
---

> 下文的規格、標價和分數都取自 Anthropic 或其引用的公開頁面，核對日期是 2026 年 10 月 2 日。Folkbench 沒有重跑這些基準測試。模型供應商所說的「大約低 40%」「大約五分之一的成本」，描述的是他們自己的測試環境。

Claude Opus 5.5 於 2026 年 9 月 22 日發布，是 Claude 5.5 系列的第一款模型。Claude API 的模型 ID 是 `claude-opus-5-5`。模型頁寫明：上下文 1M Token，最大輸出 128K Token，自適應思考始終開啟，預設 effort 為 `medium`，標價是每百萬輸入 Token $4、每百萬輸出 Token $20。公開頁面沒有提供參數量，也沒有提供訓練運算量。

同一天可以核對的重點主要有三個。標價低於 Opus 5，也遠低於 Fable 5.1 的 $10 / $50。在發布頁列出的程式開發和知識工作各列中，Opus 5.5 領先 Fable 5.1 和 Opus 5，並在其中多數列領先 GPT-6 Astra。有兩列方向相反：在 Terminal-Bench-Science 0.1 和 Zapier 的 AutomationBench 上，Astra 的點估計領先。範圍明確的日常任務，可以對照 [Claude Sonnet 5.5](../claude-sonnet-5-5-review-pricing/)。OpenAI 這一側的長上下文價格分級，請見 [GPT-6.1 Sol](../gpt-6-1-sol-review-pricing/)。

## 已公開的規格

| 項目 | Claude Opus 5.5 |
| --- | --- |
| Claude API 模型 ID | `claude-opus-5-5` |
| 發布日期 | 2026 年 9 月 22 日 |
| 上下文視窗 | 1M Token |
| 最大輸出 | 128K Token |
| 批次 API 最大輸出 | 300K Token，beta 標頭 `output-300k-2026-03-24` |
| 輸入到輸出 | 文字和圖片到文字 |
| 思考 | 自適應，始終開啟 |
| 預設 effort | `medium` |
| effort 可選值 | `low`、`medium`、`high`、`xhigh`、`max` |
| 模型頁上的延遲等級 | 中等 |
| 可靠知識截止 | 2026 年 6 月 |
| 可快取提示的最短長度 | 512 Token |
| 參數量 | 公開模型頁未提供 |

「可靠知識截止」是模型既有知識最完整所涵蓋到的日期。它和上下文視窗是兩回事。請求中附上的檔案，仍然在這次請求的上下文裡。

Fast mode 是同一個模型 ID 上的速度開關。更新說明把它標為僅限 Claude API 的研究預覽版：請求要使用 `speed: "fast"`，並帶上 beta 標頭 `fast-mode-2026-02-01`。發布頁給出的價格是每百萬 Token $8 / $40，輸出速度最高約為 2.5 倍，並寫明 Claude Code 和 Claude Platform 可以使用。更新說明寫明，Amazon Bedrock、Claude Platform on AWS、Google Cloud 和 Microsoft Foundry 都沒有提供這個 fast mode。

手動指定思考預算會被拒絕。思考深度只能用 effort 控制。

## 官方標價

單位是美元／每百萬 Token。Opus 5.5 的 5 分鐘快取寫入、1 小時快取寫入和批次價格取自更新說明。Opus 5 的快取寫入是發布頁比較表中單一的「cache writes」數字，該表沒有把 5 分鐘和 1 小時分開。Fable 5.1、Sonnet 5.5 和 Haiku 4.5 的輸入、輸出價格取自模型頁的比較列。Sonnet 5 仍標為 legacy，模型頁上的輸入、輸出價格與 Sonnet 5.5 相同。破折號表示本文沒有從一手價格列取得這一格。

| 每 1M Token | Opus 5.5 | Opus 5 | Fable 5.1 | Sonnet 5.5 | Haiku 4.5 |
| --- | --- | --- | --- | --- | --- |
| 輸入 | $4 | $5 | $10 | $2 | $1 |
| 輸出 | $20 | $25 | $50 | $10 | $5 |
| 快取讀取 | $0.20 | $0.50 | — | $0.20 | — |
| 快取寫入 | 5 分鐘 $5；1 小時 $8 | $6.25 | — | 5 分鐘 $2.50；1 小時 $4 | — |
| 批次輸入／輸出 | $2 / $10 | — | — | 標價的 50% | — |
| Fast mode 輸入／輸出 | $8 / $40 | — | — | — | — |

相較 Opus 5，未快取輸入和輸出的標價降了 20%，從 $5 / $25 降到 $4 / $20。發布頁寫明快取讀取從 $0.50 降到 $0.20，並表示這部分佔了 Agent 與程式開發帳單的大宗。Anthropic 還有另一項工作負載說法：在預設設定下，典型任務的花費大約比 Opus 5 低 40%，因為模型用掉的 Token 也比較少。這 40% 描述的是他們自己的測試環境。實際帳單仍取決於 effort、快取命中、工具輪次，以及有沒有使用批次或 fast mode。

批次處理是新標價的一半。Fast mode 是新標價的兩倍，而且更新說明把它限定在 Claude API。

以下三個例子可以依官方標價自行計算。每一例都是 10 萬個對應類別的輸入 Token，加上 5,000 個輸出 Token。快取那一列假定用量記錄確實把這些 Token 計為讀取。

| 請求 | 計算 | 金額 |
| --- | --- | --- |
| 10 萬未快取輸入，5,000 輸出 | 0.1 × $4 + 0.005 × $20 | $0.50 |
| 10 萬快取讀取，5,000 輸出 | 0.1 × $0.20 + 0.005 × $20 | $0.12 |
| 10 萬 5 分鐘快取寫入，5,000 輸出 | 0.1 × $5 + 0.005 × $20 | $0.60 |

1 小時快取寫入要改用 $8，不能用上面的 $5。中轉站或雲端平台的成交價不在這張表裡。

## 和 Opus 5、Fable 5.1 相比，請求哪裡變了

| 行為 | Opus 5.5 | Opus 5 | Fable 5.1 |
| --- | --- | --- | --- |
| API ID | `claude-opus-5-5` | `claude-opus-5` | `claude-fable-5-1` |
| 上下文／最大輸出 | 1M / 128K | 1M / 128K | 1M / 128K |
| 思考 | 始終開啟。`disabled` 和手動預算會回傳 400 | 預設開啟。effort 為 `high` 或更低時接受 `disabled` | 模型頁寫明始終開啟 |
| 省略 effort 時的預設值 | `medium` | `high` | `high` |
| 可靠知識截止 | 2026 年 6 月 | 本文未另行引用發布頁比較 | 2026 年 6 月 |
| 標價輸入／輸出 | $4 / $20 | $5 / $25 | $10 / $50 |
| 快取讀取 | $0.20 | $0.50 | — |

更新說明把四項會讓「原本在 Opus 5 上執行的程式碼」失敗的變更列在一起。前三項同樣適用於 Fable 5.1。只替換模型字串，仍然會碰上這些問題。

```text
model: claude-opus-5-5
thinking: {"type": "adaptive"}
tool_choice: {"type": "auto"}
output_config.effort: medium
# 400：thinking 類型為 disabled，或為 enabled 且帶有 budget_tokens
# 400：tool_choice 為 any，或 tool_choice 為 tool
# 400，僅限 Claude API 與 Google Cloud：工具類型 computer_20251124
```

省略 `thinking`，或送出 `adaptive`，兩者等效。`tool_choice` 的 `auto` 和 `none` 仍然有效，Token 計數端點也一樣。若要取得符合 schema 的 JSON，更新說明建議使用嚴格工具呼叫或結構化輸出，並在提示詞中寫明何時呼叫工具。

在 Claude API 和 Google Cloud 上，請用 `computer_toolset_20260801` 取代 `computer_20251124`，並移除舊的電腦操作 beta 標頭。更新說明寫明，Amazon Bedrock 上的 Opus 5.5 仍接受 `computer_20251124`。已經使用新工具集的瀏覽器操作整合，不需要為這一項修改程式碼。

第四種 400 和思考區塊綁定有關。2026 年 8 月 31 日 00:00 UTC 當下及之後建立的帳號，在 Claude API 和雲端平台上，如果系統提示詞、工具清單或更早的訊息在 Opus 5.5 思考區塊產生之後被改過，重播這個區塊就會回傳 400。文件建議的做法是只附加不修改的歷史。指令必須調整時，請在對話中途插入系統訊息。較早建立的帳號要明確啟用同一套檢查才會生效。

即使請求成功，行為仍然改變的地方也有三處。省略 effort 現在會以 `medium` 執行，同樣的省略在 Opus 5 上是以 `high` 執行。在同一級 effort 下，Opus 5.5 每一輪的思考量往往比 Opus 5 多，在 `xhigh` 和 `max` 上尤其明顯。從舊設定照抄過來的 effort 值是一個新的成本點，`max_tokens` 也要替思考區塊預留空間。

工具呼叫之間寫下的文字會回到思考區塊裡。display 為預設的 `omitted` 時，這些區塊的文字是空的。過去會把這段文字以串流方式顯示的介面會安靜下來，但請求本身仍然成功。需要這些進度訊息時，要另外設定 display，並依區塊的 `type` 選取，不要依位置猜測。

生物分類器和資安分類器會一起運作。把模型推向「把推理過程抄進可見回答」的提示，可能會以 `reasoning_extraction` 被拒絕。更新說明也提到，即使還沒加上視覺工具，模型讀圖表和螢幕截圖就已經更準確，因此過去用來彌補讀圖能力偏弱的提示詞，值得單獨重播一次。

被拒絕的請求會以 HTTP 200 回傳，`stop_reason` 為 `"refusal"`。這不是傳輸失敗。是否計費取決於拒答類別，而且仍然會佔用速率限制。

## 發布頁上的基準測試該怎麼看

下表就是 2026 年 10 月 2 日發布頁上列出的那一張。除非註腳另有說明，Opus 5.5 使用自適應思考，effort 為 max。Terminal-Bench 4.0 就是那個註腳：Opus 5.5 用 `xhigh`，GPT-6 Astra 用 `high`，各自取該模型公布的最高分。Astra 和 GPT-5.6 Sol 的數字依 OpenAI 的報告引用。正式環境的防護機制處於開啟狀態。防護介入時，資安任務由 Opus 4.8 完成，生物和前沿 LLM 開發任務由 Opus 5 完成。Anthropic 表示這會拉低 Opus 5.5 的分數。

| 基準 | Opus 5.5 | Fable 5.1 | Opus 5 | GPT-6 Astra | GPT-5.6 Sol |
| --- | --- | --- | --- | --- | --- |
| Terminal-Bench 4.0 | 66.4% | 55.8% | 52.3% | 57.9% | 37.3% |
| FrontierCode v1.1（Main） | 54.4% | 50.3% | 48.0% | 53.3% | 47.5% |
| CursorBench 4.0 | 57.8% | 51.8% | 46.6% | — | 41.7% |
| GDPval-AA v2.1 | 1846 | 1735 | 1708 | 1542 | 1588 |
| AutomationBench | 40.0% | 31.4% | 26.9% | 41.4% | 28.8% |
| Humanity's Last Exam，使用工具 | 67.7% | 65.6% | 63.6% | 57.2% | — |
| Terminal-Bench-Science 0.1 | 58.7% | 52.6% | 29.0% | 64.6% | 22.4% |
| OSWorld 2.1，partial | 81.8% | 80.7% | 74.0% | — | — |
| Chartography，使用工具 | 89.0% | 88.4% | 83.4% | — | — |

差距要和他們公布的誤差放在一起看。在 Terminal-Bench 4.0 上，Opus 5.5 的誤差為 ±2.6 分，其他 Claude 模型為 ±1.6 到 ±2 分。從 66.4% 到 Astra 的 57.9%、到 Fable 的 55.8%，差距都大於這些誤差。同一個註腳還寫到，公開排行榜上的 Opus 5 是 51.8%，他們的測試環境重現的結果是 52.3%，落在雜訊範圍內。

Terminal-Bench-Science 每個模型的誤差是 ±3.5 到 ±5 分。Astra 的 64.6% 對上 Opus 5.5 的 58.7%，差距與這些誤差的寬度相當，點估計上 Astra 領先。公開排行榜上的 Opus 5 是 30.0%，他們的測試環境重現的結果是 29.0%。

AutomationBench 由 Zapier 執行。由於該次執行沒有備援模型，防護介入一律算作失敗。Anthropic 表示實際分數會更高。列出的 40.0% 對上 Astra 的 41.4%，是非常接近的公布結果，點估計上 Astra 領先。GDPval-AA v2.1 是涵蓋 44 種職業真實專業任務的 Elo 分數：Opus 5.5 為 1846，Fable 5.1 為 1735，Opus 5 為 1708，Sol 為 1588，Astra 為 1542。

同一份發布頁的成本圖上還有第二組分數，採用預設 effort `medium`：FrontierCode 54.6%，CursorBench 52.5%。比較表上列的是 54.4% 和 57.8%。請把它們視為兩種 effort 下的兩個數字。圖說還提到，在 medium effort 下，FrontierCode 以大約五分之一的單一任務成本超過 Astra 的最高分 53.3%，Terminal-Bench 則以大約 40% 的成本追平 Astra。這些都是關於 Anthropic 自家測試環境的單一任務成本說法。

表格下方那句話更值得記下：在 Anthropic 自己的使用經驗裡，Opus 5.5 和 Fable 5.1 的差距比分數看起來更小，到了這個水準，基準分數的差距對真實任務的參考價值也更弱。發布頁上的客戶推薦語是挑選過的證詞，可以提示該重播哪些情境，但不屬於這張表。

## 切換流量前要核對的事項

1. 固定使用 `claude-opus-5-5`，也要核對完成結果中的模型名稱。防護介入時，資安任務可能由 Opus 4.8 完成，生物和前沿 LLM 開發任務可能由 Opus 5 完成。日誌中的請求模型仍可能寫著 `claude-opus-5-5`。
2. 用同一組不含敏感資料的測試集，分別在 `low`、`medium`、`high`、`xhigh` 和 `max` 下重播，記錄成功率、實際耗時、輸入、快取讀取、快取寫入、輸出和費用。
3. 不要送出 `thinking: {"type": "disabled"}` 或帶有 `budget_tokens` 的手動預算。effort 要明確設定。省略時這裡是 `medium`，不是 Opus 5 的 `high`。
4. `tool_choice` 只用 `auto` 或 `none`。Claude API 和 Google Cloud 上的電腦操作改用 `computer_toolset_20260801`。
5. 會重播思考區塊的對話，維持只附加不修改。2026 年 8 月 31 日當天及之後建立的帳號，只要改動思考區塊之前的前綴，就會收到 400。
6. HTTP 200 的拒答和傳輸失敗要分開計算。
7. 用一則短提示和一則應該命中快取的提示核對計費金額。5 分鐘寫入、1 小時寫入、批次和 fast mode 是四種不同的價目。
8. 範圍明確、不需要這套 Opus 迴圈的任務，繼續看 [Sonnet 5.5](../claude-sonnet-5-5-review-pricing/) 的 $2 / $10。在科學 Agent 和 Zapier 業務工作流程上，發布頁列出的點估計由 Astra 領先。

選定模型之後，各家中轉站是否提供這個 ID，以及當時的可用性和價格，以目錄中已發布的記錄為準。本文不比較各家中轉站，也不把模型供應商的標價寫成某一家中轉站的成交價。
