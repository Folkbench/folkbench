---
slug: folkbench-pelican-database
translationKey: folkbench-pelican-database
locale: zh-Hant
kind: article
title: "開源 Folkbench Pelican Database：涵蓋 507 款模型、對齊 models.dev 的全球最大最完善鵜鶘資料庫之一"
description: "Folkbench 正式開源 Pelican Database：從 3,875 筆多源紀錄清洗建構 507 款規範模型、68 家提供商、454 份原始 SVG 原始碼與 507 張統一 PNG 渲染圖，全面對齊 models.dev 並每日自動增量同步，用於驅動 Folkbench 模型真實性檢測。"
category: 評測
tags: [鵜鶘基準, 開源資料庫, 模型真實性, models.dev]
authorId: cang-lin
modelIds: [gpt-6-2-astra, claude-fable-5-2, gemini-4-neon, deepseek-v4-pro]
benchmarkSlugs: []
relatedSlugs: [how-to-score-a-cycling-pelican, how-folkbench-detects-model-degradation, did-the-model-get-dumber]
publishedAt: '2026-11-22'
updatedAt: '2026-11-22'
sources:
  - id: folkbench-pelican-db
    label: Folkbench/pelican-database 開源儲存庫
    url: https://github.com/Folkbench/pelican-database
    checkedAt: '2026-11-22'
    claimScope: official
  - id: simon-pelican-tag
    label: Simon Willison，pelican-riding-a-bicycle 標籤全量歸檔
    url: https://simonwillison.net/tags/pelican-riding-a-bicycle/
    checkedAt: '2026-11-22'
    claimScope: official
  - id: simon-pelican-repo
    label: simonw/pelican-bicycle 原始實驗儲存庫
    url: https://github.com/simonw/pelican-bicycle
    checkedAt: '2026-11-22'
    claimScope: official
  - id: unclek-pelicanmap
    label: UncleK/pelicanmap 每日更新的多語言鵜鶘歸檔
    url: https://github.com/UncleK/pelicanmap
    checkedAt: '2026-11-22'
    claimScope: observed
  - id: models-dev
    label: models.dev 公開模型 ID 與中繼資料 API
    url: https://models.dev/api.json
    checkedAt: '2026-11-22'
    claimScope: official
  - id: folkbench-arena
    label: Folkbench 降智監控（Integrity Monitor）
    url: https://folkbench.com/zh-Hant/arena
    checkedAt: '2026-11-22'
    claimScope: observed
---

> 當一張「騎自行車的鵜鶘」不再只是社群媒體上的隨手截圖，而是被標準化為 507 款模型可檢索、可校驗、每日自動更新的參考基線，它就從一則產業趣聞，變成了檢驗大模型真實身分的工程基礎設施。

今天，我們正式開源 **[Folkbench/pelican-database](https://github.com/Folkbench/pelican-database)** —— 這是目前全球規模最大、結構化最完善的「鵜鶘騎單車（Pelican Riding a Bicycle）」大模型 SVG/PNG 參考資料庫之一。

過去兩年裡，從 2024 年 10 月 Simon Willison 提出那句著名的測試提示詞 *"Generate an SVG of a pelican riding a bicycle"* 開始，全球開發者與研究社群累計測試了數百款閉源旗艦與開源權重模型。但這些極其珍貴的視覺證據長期散落在個人部落格、X 貼文、GitHub Gist、靜態 HTML 對比網格與各類社群展示站中：命名混亂、同一模型存在數十種非規範別名，且大量紀錄只保留壓縮截圖而缺少原始 SVG 程式碼。

`Folkbench/pelican-database` 將全網分散的樣本系統性地採集、清洗、歸屬糾偏、補全原始碼並統一渲染，最終沉澱為一套開箱即用、對齊 **[models.dev](https://models.dev)** 命名規範、並由 GitHub Actions 每日自動增量維護的開放資料庫，用於驅動 [Folkbench](https://folkbench.com/zh-Hant) 的模型真實性檢測與視覺基線比對。

---

## 一、核心數據：為何它是全球最大最完善的鵜鶘資料庫之一

截至首次公開發布快照（2026-11-22），`Folkbench/pelican-database` 的實測指標如下：

| 核心維度 | 實測統計 | 說明 |
| --- | --- | --- |
| **匯聚候選樣本總量** | **3,875 筆** | 融合 UncleK/pelicanmap 社群歸檔 + Simon Willison 161 篇標籤文章、靜態對比網格與直鏈 SVG |
| **規範化後唯一模型數** | **507 款** | 將 **799 種**碎片化原始名稱歸併為唯一 `provider/model_id` |
| **涵蓋模型提供商** | **68 家** | 涵蓋全球主流閉源實驗室、開源權重團隊與前沿實驗平台 |
| **原始 `.svg` 原始碼完整率** | **454 款（89.5%）** | 經 XML/標籤校驗的可解析原始 SVG，不再只是二手截圖 |
| **統一 `.png` 視覺基線** | **507 款（100%）** | 全部由無頭瀏覽器統一渲染（1024px 寬白底）或標準化轉碼，0 缺失 |
| **精確命中活躍 `models.dev`** | **378 款（74.6%）** | 其中 190 款精確匹配第一方原生 Provider；其餘 129 款歷史下線模型同樣按規範對齊 |
| **含 Simon Willison 實測紀錄** | **177 款** | 標註 `tested_by_simon`，在原貼僅發截圖時自動升級補齊真實 `.svg` |
| **時間跨度** | **2024-10-25 至 2026-11-21** | 完整記錄逾兩年兩代以上大模型空間推理與 SVG 編碼能力的躍遷 |

![Folkbench Pelican Database 中 2024 基線與 2026 前沿模型的真實 SVG 演進對比：左側至右側依序為 OpenAI、Anthropic 與 Google 的代表樣本。](/blog/figures/folkbench-pelican-database/evolution-grid.png)

*圖 1：直接自 `Folkbench/pelican-database` 調取的 6 份原始 `.svg` 渲染對比。上排為 2024 年 10 月首批測試的 `openai/gpt-4o`、`anthropic/claude-3-5-sonnet-20241022` 與 `google/gemini-1.5-pro-001`；下排為 2026 年 11 月的 `openai/gpt-6.2-astra`、`anthropic/claude-fable-5-2` 與 `google/gemini-4-neon`。*

---

## 二、五大工程設計：從社群畫廊到生產級參考庫

![圖 2 架構圖：Folkbench Pelican Database 的多源採集、models.dev 對齊、無頭瀏覽器 SHA-256 增量渲染與每日 GitHub Actions 同步管線。](/blog/figures/folkbench-pelican-database/pipeline-architecture-zh.svg)

*圖 2：`Folkbench/pelican-database` 自動化建構與每日增量同步架構。*

1. **多源交叉補全，將截圖還原為真實 SVG**：結合 [UncleK/pelicanmap](https://github.com/UncleK/pelicanmap)[^unclek-pelicanmap] 每日歸檔與 [Simon Willison 全量 161 篇標籤文章](https://simonwillison.net/tags/pelican-riding-a-bicycle/)[^simon-pelican-tag]，直接解碼 `static.simonwillison.net` 靜態 HTML 對比表中的 180 份 base64 SVG 與直鏈 `.svg`，依循 **「真實 `.svg` > Simon Willison 原測 > 標準 classic 提示詞 > 預設/高推理檔位」** 確定性去重，並過濾非鵜鶘衍生題與多模型拼圖。
2. **全面對齊 `models.dev` 與原生廠商歸屬糾偏**：依據 [`models.dev/api.json`](https://models.dev/api.json)[^models-dev] 統一 799 種別名為 `provider/model_id`（涵蓋 OpenAI 72 款、Google 64 款、Alibaba/Qwen 63 款、Anthropic 30 款、Meta 21 款、Mistral 21 款、DeepSeek 19 款、Z.AI/GLM 19 款、xAI 16 款等 68 家廠商），避免第三方轉售路由造成同模型分裂，並完整保留 `model_aliases` 反查表。
3. **無頭瀏覽器統一渲染與完整性校驗**：透過跨平台 Chromium/Edge CDP 在隔離 `<img>` 沙箱中統一輸出 1024px 白底高清 PNG，逐一驗證檔頭與像素尺寸，達成 507/507 零錯誤。
4. **JSON + SQLite 雙格式即插即用**：同步提供 `models/<provider>/<model_id>.{svg,png}`、`catalog.json` 與規範化 `pelicans.sqlite`（含 `providers`、`models`、`model_aliases`、`model_sources` 四表與檢視表）。
5. **GitHub Actions 每日自動增量同步**：`scripts/sync.py` 搭配 `.github/workflows/auto-sync.yml` 每日 `09:00 UTC` 自動拉取上游更新，並以 SHA-256 雜湊比對僅增量重繪新增或升級樣本。

---

## 三、驅動 Folkbench 的模型真實性檢測

延續[《如何給一隻騎車的鵜鶘打分？》](/zh-Hant/blog/how-to-score-a-cycling-pelican/)與[《發布 Folkbench 降智檢測》](/zh-Hant/blog/how-folkbench-detects-model-degradation/)所探討的中轉站隱蔽退化問題（靜默替換小模型、壓低推理預算、裁剪上下文），`Folkbench/pelican-database` 作為**公開、可複核的跨代際視覺基線庫**，與[降智監控（Integrity Monitor）](https://folkbench.com/zh-Hant/arena)[^folkbench-arena] 中的動態時事探針、模型指紋與獨立官方直連基線相互配合，讓模型真實性核驗具備直觀且可公開對照的視覺座標系。

---

## 四、快速上手

```bash
git clone --depth 1 https://github.com/Folkbench/pelican-database.git
cd pelican-database
```

```sql
SELECT model_id, models_dev_id, svg_path, png_path, date
FROM models
WHERE tested_by_simon = 1 AND has_svg = 1
ORDER BY provider, model_id;
```

---

## 五、開源授權與致謝（Credits & Acknowledgements）

誠摯感謝 **[Simon Willison](https://simonwillison.net/)**[^simon-pelican-tag][^simon-pelican-repo]、**[UncleK / Pelican Map](https://github.com/UncleK/pelicanmap)**[^unclek-pelicanmap]、**[models.dev](https://models.dev)**[^models-dev]，以及 **Tihu**、**Pelican Zoo**、**Museum of Models**、**Pelicans.wtf**、**Pelican Benchmark** 與所有社群測試者。腳本、資料庫 Schema 與原創文件採用 **MIT License**，收錄的第三方模型作品與上游中繼資料歸原作者與原來源所有（詳見 `NOTICE.md`）。歡迎前往 **[github.com/Folkbench/pelican-database](https://github.com/Folkbench/pelican-database)**[^folkbench-pelican-db] 探索與貢獻。
