---
slug: folkbench-pelican-database
translationKey: folkbench-pelican-database
locale: ja
kind: article
title: "Folkbench Pelican Database をオープンソース公開：models.dev 準拠・507 モデルを網羅する世界最大級のペリカンデータベース"
description: "Folkbench は Pelican Database を公開しました。3,875 件の複数ソース標本から 507 の正規モデル・68 プロバイダー・454 件のオリジナル SVG と 507 枚の標準 PNG を整備し、models.dev 準拠と毎日の自動差分同期でモデル真正性検証を支えます。"
category: 評価
tags: [ペリカンベンチマーク, オープンデータベース, モデル真正性, models.dev]
authorId: cang-lin
modelIds: [gpt-6-2-astra, claude-fable-5-2, gemini-4-neon, deepseek-v4-pro]
benchmarkSlugs: []
relatedSlugs: [how-to-score-a-cycling-pelican, how-folkbench-detects-model-degradation, did-the-model-get-dumber]
publishedAt: '2026-11-22'
updatedAt: '2026-11-22'
sources:
  - id: folkbench-pelican-db
    label: Folkbench/pelican-database オープンソースリポジトリ
    url: https://github.com/Folkbench/pelican-database
    checkedAt: '2026-11-22'
    claimScope: official
  - id: simon-pelican-tag
    label: Simon Willison, pelican-riding-a-bicycle タグアーカイブ
    url: https://simonwillison.net/tags/pelican-riding-a-bicycle/
    checkedAt: '2026-11-22'
    claimScope: official
  - id: simon-pelican-repo
    label: simonw/pelican-bicycle オリジナル実験リポジトリ
    url: https://github.com/simonw/pelican-bicycle
    checkedAt: '2026-11-22'
    claimScope: official
  - id: unclek-pelicanmap
    label: UncleK/pelicanmap 日次更新多言語ペリカンアーカイブ
    url: https://github.com/UncleK/pelicanmap
    checkedAt: '2026-11-22'
    claimScope: observed
  - id: models-dev
    label: models.dev 公開モデル ID・メタデータ API
    url: https://models.dev/api.json
    checkedAt: '2026-11-22'
    claimScope: official
  - id: folkbench-arena
    label: Folkbench 劣化監視（Integrity Monitor）
    url: https://folkbench.com/ja/arena
    checkedAt: '2026-11-22'
    claimScope: observed
---

> 「自転車に乗るペリカン」の SVG が単なる SNS のスクリーンショットを超え、507 モデルを網羅し毎日自動更新される標準参照ベースラインへと整備されたとき、それはモデルの真正性を検証するための実用的なエンジニアリング基盤になります。

本日、私たちは **[Folkbench/pelican-database](https://github.com/Folkbench/pelican-database)** をオープンソース公開します。これは、LLM による「自転車に乗るペリカン（Pelican Riding a Bicycle）」の SVG・PNG 参照データセットとして**世界最大級かつ最も体系的に整備されたデータベースの一つ**です。

2024 年 10 月に Simon Willison が *"Generate an SVG of a pelican riding a bicycle"* というプロンプトを広めて以来、世界中の開発者が数百ものフロンティアおよびオープンウェイトモデルをテストしてきました。しかし、これらの記録はブログ記事、X 投稿、GitHub Gist、比較表、コミュニティギャラリーに分散しており、モデル名の表記揺れやオリジナル SVG 欠損（スクリーンショットのみ）が自動評価への活用を阻んでいました。

`Folkbench/pelican-database` は、これらを体系的に収集・正規化し、**[models.dev](https://models.dev)** の標準 ID（`provider/model_id`）へ統合、GitHub Actions による毎日の自動差分同期を備えたオープンリポジトリとして構築され、[Folkbench](https://folkbench.com/ja) のモデル真正性検証を支えます。

---

## 1. 数字で見る規模と網羅性

初回公開スナップショット（2026-11-22）の検証済み統計は以下の通りです。

| 項目 | 実績値 | 詳細 |
| --- | --- | --- |
| **統合候補標本数** | **3,875 件** | UncleK/pelicanmap + Simon Willison の全 161 記事・静的 HTML 比較表・直接リンク SVG を統合 |
| **正規化後ユニークモデル数** | **507 モデル** | **799 種**の表記揺れ・エイリアスを正規 `provider/model_id` へ集約 |
| **対象プロバイダー数** | **68 社/組織** | 主要商用ラボからオープンウェイト開発チームまで網羅 |
| **オリジナル `.svg` 保有率** | **454 モデル（89.5%）** | XML/タグ検証済みの解析可能な SVG ソースコードを収録 |
| **統一 `.png` レンダリング** | **507 モデル（100%）** | ヘッドレスブラウザで 1024px 白背景に統一レンダリング（欠損 0） |
| **現行 `models.dev` 完全一致** | **378 モデル（74.6%）** | うち 190 モデルが一次プロバイダー一致。過去モデル 129 件も同一命名規則で正規化 |
| **Simon Willison 実測カバー** | **177 モデル** | `tested_by_simon` を付与し、原本 SVG がある場合は優先採用 |
| **収録期間** | **2024-10-25 〜 2026-11-21** | 2 年以上にわたる空間推論と SVG 生成能力の進化を記録 |

![Folkbench Pelican Database における 2024 年ベースラインと 2026 年フロンティアモデルのオリジナル SVG 進化比較（OpenAI、Anthropic、Google）。](/blog/figures/folkbench-pelican-database/evolution-grid.png)

*図 1：`Folkbench/pelican-database` のオリジナル `.svg` から直接レンダリングした 6 標本。上段（2024 年 10 月）は `openai/gpt-4o`、`anthropic/claude-3-5-sonnet-20241022`、`google/gemini-1.5-pro-001`、下段（2026 年 11 月）は `openai/gpt-6.2-astra`、`anthropic/claude-fable-5-2`、`google/gemini-4-neon`。*

---

## 2. 本番評価システム向け 5 つのエンジニアリング設計

![図 2 アーキテクチャ図：Folkbench Pelican Database のマルチソース収集、models.dev 準拠正規化、SHA-256 差分レンダリング、および毎日の自動同期パイプライン。](/blog/figures/folkbench-pelican-database/pipeline-architecture-en.svg)

1. **マルチソース復元でスクリーンショットから SVG 原本を回収**：[UncleK/pelicanmap](https://github.com/UncleK/pelicanmap)[^unclek-pelicanmap] と [Simon Willison の全 161 記事](https://simonwillison.net/tags/pelican-riding-a-bicycle/)[^simon-pelican-tag] を照合し、`static.simonwillison.net` の比較 HTML に埋め込まれた 180 件の base64 SVG と直リンク SVG を復元。**「原本 `.svg` > Simon 実測 > classic プロンプト > 標準/高推論設定」** の決定論的ルールで代表標本を選定しています。
2. **`models.dev` 準拠とネイティブ開発元への正規化**：[`models.dev/api.json`](https://models.dev/api.json)[^models-dev] に基づき、OpenAI（72）、Google（64）、Alibaba/Qwen（63）、Anthropic（30）、Meta（21）、Mistral（21）、DeepSeek（19）、Z.AI/GLM（19）、xAI（16）など 68 プロバイダーへ正確に帰属させ、799 件の元表記を `model_aliases` テーブルに保存しています。
3. **ヘッドレスブラウザ統一レンダリング**：クロスプラットフォームの Chromium/Edge CDP を用い、隔離された `<img>` サンドボックス内で 1024px 白背景 PNG へレンダリングし、全 507 ファイルのヘッダと解像度を検証しています。
4. **ファイル + JSON + SQLite の即時利用**：`models/<provider>/<model_id>.{svg,png}`、`catalog.json`、および 4 テーブル＋2 ビューを備えた `pelicans.sqlite` を同梱。
5. **GitHub Actions による毎日自動差分同期**：`scripts/sync.py` と `.github/workflows/auto-sync.yml` が毎日 `09:00 UTC` に最新データを取り込み、SHA-256 ハッシュ比較により新規・更新モデルのみを高速に再レンダリングします。

---

## 3. Folkbench のモデル真正性検証を支える視覚ベースライン

[「自転車に乗るペリカンをどう採点するか？」](/ja/blog/how-to-score-a-cycling-pelican/)や[「Folkbench 劣化検知の公開」](/ja/blog/how-folkbench-detects-model-degradation/)で論じた通り、サードパーティ API リレーにおける軽量モデルへのすり替えや推論強度の密かな引き下げは、単なる HTTP 200 監視では見抜けません。`Folkbench/pelican-database` は、単一の画像だけで判定を下すのではなく、[Folkbench Integrity Monitor](https://folkbench.com/ja/arena)[^folkbench-arena] の時事プローブ・モデル指紋・独立した公式 API ベースラインを補完する**公開・検証可能な世代横断の視覚参照基盤**として機能します。

---

## 4. クイックスタート

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

## 5. ライセンスと謝辞（Credits & Acknowledgements）

本プロジェクトの実現にあたり、**[Simon Willison](https://simonwillison.net/)**[^simon-pelican-tag][^simon-pelican-repo]、**[UncleK / Pelican Map](https://github.com/UncleK/pelicanmap)**[^unclek-pelicanmap]、**[models.dev](https://models.dev)**[^models-dev]、ならびに **Tihu**、**Pelican Zoo**、**Museum of Models**、**Pelicans.wtf**、**Pelican Benchmark** をはじめとする全てのコミュニティ貢献者に深く感謝申し上げます。スクリプト・スキーマ・ドキュメントは **MIT License**、収録された各モデル生成物および上流メタデータの権利は原著作者・原出典に帰属します（詳細は `NOTICE.md`）。リポジトリはこちら：**[github.com/Folkbench/pelican-database](https://github.com/Folkbench/pelican-database)**[^folkbench-pelican-db]。
