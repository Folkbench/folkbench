<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/brand/folkbench-logo-only-inverse.svg">
  <img src="public/brand/folkbench-logo-only.svg" width="80" height="80" alt="Folkbench">
</picture>

# Folkbench

### APIプロバイダー選びは、感覚ではなくデータで。

AI API 回線リアルタイム実測ベンチマーク · 開発者向けローカルエンドポイント切替クライアント

[![Release](https://img.shields.io/github/v/release/Folkbench/folkbench?label=version)](https://github.com/Folkbench/folkbench/releases)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE.md)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows-lightgrey.svg)](https://github.com/Folkbench/folkbench/releases)
[![Built with Tauri](https://img.shields.io/badge/built%20with-Tauri%20%2B%20Rust-orange.svg)](https://tauri.app/)

[🌐 実測ベンチマーク](https://folkbench.com/rankings/board?utm_source=github&utm_campaign=folkbench-blog) · [⚡ Switch クライアント](#2-回線切替folkbench-switch-クライアント) · [📦 ダウンロード](#3-ダウンロードインストール) · [🔥 人気モデル](#人気モデル) · [🏢 おすすめプロバイダー](#おすすめプロバイダー) · [简体中文](README.md) · [English](README.en.md)

</div>

---

日頃から各種 AI コーディングツールを使う際、重要なポイントは実質2つに集約されます：**「信頼できる回線（エンドポイント）を選ぶこと」**、そして**「その回線を各ツールに正しく設定すること」**です。

Folkbench は、この2つのステップを1つのスムーズな開発ワークフローに統合します：

- 🌐 **[1. 回線を選ぶ](#1-回線を選ぶweb-実測ベンチマーク)**：複数リージョンのプローブが稼働率、P95レイテンシ、Token単価を 24時間 リアルタイムで継続計測。スペック偽装や不安定なサービスを客観的データで見極めます。
- ⚡ **[2. 回線を使う](#2-回線切替folkbench-switch-クライアント)**：オープンソースのデスクトップクライアントが Base URL と API Key を一元管理。Claude Code や Codex などの設定を手作業で書き換えることなく、ワンクリックでエンドポイントを切り替えます。

---

## 1. 回線を選ぶ：Web 実測ベンチマーク

公開プローブによる継続的な自動リクエストを通じて、各リレー・APIプロバイダーのモニタリングデータをありのまま公開しています。ブラックボックスや誇大表記を排除した客観的指標です。

- 📊 **[総合ランキング](https://folkbench.com/rankings/board?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog)**：稼働率、P95 応答時間、Token 単価を総合的に評価。
- 🛡️ **[安定性ランキング](https://folkbench.com/rankings/board?metric=availability&utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog)**：稼働率重視の順位。長時間のタスクや CI/CD 自動化に最適。
- 💰 **[コスパランキング](https://folkbench.com/rankings/board?metric=price&utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog)**：実際の Token 単価順。真の運用コストを比較可能。

### 人気モデル

特定モデルにおける各プロバイダーの実測データを確認したい場合は、個別ランキングを直接参照できます：

| モデル | 実測データリンク |
| :--- | :--- |
| **GPT 6 Sol** | [各プロバイダーの実測データを表示](https://folkbench.com/rankings/gpt-6-sol?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |
| **GPT 6 Astra** | [各プロバイダーの実測データを表示](https://folkbench.com/rankings/gpt-6-astra?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |
| **Claude Fable 5.1** | [各プロバイダーの実測データを表示](https://folkbench.com/rankings/claude-fable-5-1?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |
| **Grok 4.7** | [各プロバイダーの実測データを表示](https://folkbench.com/rankings/grok-4-7?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |
| **DeepSeek V4.1 Flash** | [各プロバイダーの実測データを表示](https://folkbench.com/rankings/deepseek-v4-1-flash?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |

---

## 2. 回線切替：Folkbench Switch クライアント

Switch は Folkbench 公式のオープンソースデスクトップアプリ（Tauri + Rust 製）です。そのコアバリューは、**「複数のリレープロバイダーと公式アカウントの間で Base URL と API Key をワンクリックで切り替え、設定ファイルの手動編集から解放されること」**にあります。

### 🎯 主な機能

- 🔄 **ワンクリックでプロバイダー切替**：複数サービスの Base URL と API Key を保存し、対象ツールへ即座に反映。切り替えや復元もいつでもワンタップ。
- 🛡️ **非破壊切替とセッション保護**：変更前に設定の差分（Diff）をプレビュー。Codex をサードパーティ回線に切り替える際、公式 ChatGPT の OAuth ログインセッションを自動退避し、公式に戻す際に無損失で自動復元します。
- 📈 **ベンチマークデータの統合**：アプリ内で各サイトの最新稼働率や遅延状況を直接確認可能。回線状態を把握した上で安心して切り替えられます。
- 🔒 **ローカル保存とプライバシー**：すべての API Key と設定はローカルディスクにのみ保存され、外部サーバーへ送信されることは一切ありません。完全オフライン動作。
- 📊 **ローカル利用量・コスト試算**：セッションごとの Token 消費量をローカルで集計し、公開参考価格に基づいた利用コストを概算表示。

### 🧰 対応ツール

Switch は各ツールの設定ファイルパスやフォーマット仕様に最適化されており、接続に必要なパラメータのみを更新し、その他のユーザー独自設定は保持します：

| ツール | 設定ファイル / パス | 備考 |
| :--- | :--- | :--- |
| **Claude Code** | `~/.claude/settings.json` | Base URL を自動設定。Bearer トークンと API Key の認証モードを自動判別 |
| **Codex** | `~/.codex/config.toml` | カスタム provider を登録。公式ログイン資格情報を自動退避・復元 |
| **Gemini CLI** | `~/.gemini/.env` & `settings.json` | 環境変数と認証設定を同期反映 |
| **Aider** | `~/.aider.conf.yml` | モデル名および API エンドポイント引数を書き込み |
| **OpenCode** | `~/.config/opencode/` | サービスマッピングおよび認証キーを直接注入 |
| **Kimi CLI** | `~/.kimi-code` / `~/.kimi` | 新旧バージョンのディレクトリ構造を自動判別 |
| **DeepSeek Harness** | `~/.dsh/` | 公式 CLI 環境に準拠して適用 |
| **その他** | MiniMax Code、Qwen Code、Grok Build、Hermes、Pi など | 順次サポート拡大中 |

### 💡 利用フロー

1. **プロバイダーを追加**：サービス名、Base URL、API Key を入力して保存；
2. **対象ツールを選択**：サイドバーで使用中の開発ツール（Claude Code や Codex など）を選択；
3. **設定を適用**：目的の回線を選んで有効化をクリック。即座に設定が反映されます；
4. **復元またはクリア**：公式に戻す、または別の回線に変更したい場合もワンクリックで完了。

---

## 3. ダウンロード・インストール

最新バージョン：**0.1.0-beta.1**

| プラットフォーム | アーキテクチャ | パッケージ | 状態・署名 |
| :--- | :--- | :--- | :--- |
| **macOS** | Apple Silicon（Mシリーズ） | `.dmg` | **Apple 公式コード署名＆公証済み（Notarized）**。ダウンロード後すぐに起動可能 |
| **macOS** | Intel（x64） | `.dmg` | **Apple 公式コード署名＆公証済み（Notarized）**。ダウンロード後すぐに起動可能 |
| **Windows** | x64 | `.exe` | インストーラー / ポータブル版（解凍後すぐ利用可能） |

[GitHub Releases](https://github.com/Folkbench/folkbench/releases) からお使いの環境に合わせたインストーラーをダウンロードしてください。各ファイルには SHA256 ハッシュ値が付属しています。

*※ Windows のコード署名は現在申請手続き中です。初回起動時に SmartScreen の警告が表示された場合は、「詳細情報」→「実行」を選択してください。*

---

## 🔒 プライバシーとセキュリティ

- **完全ローカル管理**：Switch の設定および API Key は、すべてユーザーのローカル環境（ホームディレクトリ配下）にのみ保存されます。外部サーバーへの送信は一切行いません。
- **コード・プロンプトの非収集**：利用量集計機能はローカルのログのみを解析します。ソースコード、プロンプト、会話コンテキストの読み取りやアップロードは一切行われません。
- **セキュリティ上の注意**：GitHub Issues への投稿やログのスクリーンショットを共有する際は、ご自身の API Key が映り込まないようマスキングをお願いします。

---

## おすすめプロバイダー

| プロバイダー | 主な特徴 | リンク |
| :--- | :--- | :--- |
| Modelflare | 順次フォールバック、バックアップグループ設定、リクエスト＆コスト詳細ログ | [公式サイト登録](https://modelflare.dev/sign-up?partner=TDN1QM6KKYX9&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme) |
| CheapAI | 圧倒的な低価格、リアルタイムの動的倍率グループ、割引オプション | [公式サイト登録](https://cheapai.info/sign-up?aff=TkeF&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme) |
| Apiporter | 低価格試用（5元〜）、企業向け請求書対応、専任サポート | [公式サイト登録](https://apiporter.com/sign-up?aff=Pk46&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme) |
| Cloudbridge | グローバル対応、多言語UI、米ドル決済 | [公式サイト登録](https://cbapi.ai/sign-up?ref=XVuJ&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme) |
| IKunCode | コーディングCLIツール向けの丁寧な導入支援、充実したコミュニティ対応 | [公式サイト登録](https://ikunapi.cc/register?aff=SGGQCGPZ2Z32&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme) |
| 境Ai | 幅広いモデル統合、従量課金およびお得なパッケージプラン | [詳細を見る](https://folkbench.com/services/jingai?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |
| 智流 FluxLane | 企業・大学向け調達対応、統一SDKルーティング、契約書・請求書発行 | [詳細を見る](https://folkbench.com/services/fluxlane?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |

一部のリンクには紹介・リファラルパラメータが含まれています。プロバイダーの紹介はベンチマークの実測順位とは無関係であり、価格や規約は各サービスの公式サイトをご確認ください。

<details open>
<summary><strong>7大プロバイダーの詳細紹介と割引情報</strong></summary>

<h3><a href="https://modelflare.dev/sign-up?partner=TDN1QM6KKYX9&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme" target="_blank" rel="noopener noreferrer">Modelflare</a></h3>

米国 Havenbyte LLC により運営。GPT、Claude、Gemini、Grok など主要モデルおよび各種互換プロトコルに対応し、40種類以上の画像・動画生成モデルも利用可能。API Key ごとに順次フォールバックを設定でき、1つの Key で複数モデルを呼び出したり予備グループを組むことが可能です。詳細ログからステータス、レイテンシ、Token、実際の実費が確認できます。

キャッシュ補償も大きな特徴です：OpenAI 系の特定グループにおいて日次 65%、75%、85% のキャッシュヒット率を保証し、要件を満たすリクエストで下回った場合には差額補填が行われます。

現在、初回チャージによる割引グループ解放キャンペーンを実施中。20 ドルのチャージで GPT 特恵グループが解放され、GPT-5.6-Sol を上限なしで割安利用可能です。50 ドルのチャージで Claude 特恵グループが解放されます。

<h3><a href="https://cheapai.info/sign-up?aff=TkeF&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme" target="_blank" rel="noopener noreferrer">CheapAI</a></h3>

その名の通り低価格に特化しており、特恵グループの価格設定が非常にリーズナブルです。リアルタイムのアカウントプール状況に応じて倍率を自動調整する「動的倍率グループ」を提供。リソースに余裕があるときはさらに低価格で、混雑時は倍率を調整し、コストと可用性のバランスを自動で保ちます。

コスパを最優先するユーザー向けの特恵グループのほか、安定性を重視するユーザー向けの Pro / 公式 Key グループも用意されています。

<h3><a href="https://apiporter.com/sign-up?aff=Pk46&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme" target="_blank" rel="noopener noreferrer">Apiporter</a></h3>

企業ユーザーやマルチチャネル統合に適しており、小額試用や正式な請求書発行を重視する場合に最適です。最低チャージ額はわずか 5 元からで、任意の金額での請求書発行に対応。オンラインチャットや企業 WeChat でのサポートも備えています。

複数のチャネルグループが用意されており、価格重視・安定性重視など用途に応じた使い分けが可能。API Key ごとに上限や有効期限を設定できるため、チーム開発での管理にも適しています。

<h3><a href="https://cbapi.ai/sign-up?ref=XVuJ&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme" target="_blank" rel="noopener noreferrer">Cloudbridge</a></h3>

グローバルでの利用を想定した設計で、米ドル決済と多言語に対応。最低チャージ額も低めに設定されています。GPT、Claude、Grok、DeepSeek などを幅広く網羅しており、米ドル建てで決済したいチームにとって扱いやすい選択肢です。

比較的新しいサービスですが、Folkbench でも実測データの蓄積が始まっており、一部の回線では良好な安定性を記録しています。

<h3><a href="https://ikunapi.cc/register?aff=SGGQCGPZ2Z32&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme" target="_blank" rel="noopener noreferrer">IKunCode</a></h3>

Claude Code、Codex、Gemini CLI など各種コーディングアシスタントへの接続サポートが手厚く、メール、QQ グループ、Telegram など問い合わせ窓口が幅広く用意されています。サポートのレスポンスが親切で、初めて環境構築を行う開発者にもおすすめです。

<h3><a href="https://folkbench.com/services/jingai?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog" target="_blank" rel="noopener noreferrer">境Ai</a></h3>

複数モデルの統合アクセスに強みを持ち、GPT、Claude、Grok、Gemini などに対応。従量課金、月額パッケージ、残高チャージなど多様なプランが提供されています。比較的新しいサービスのため、Folkbench のリアルタイム大盤で直近の稼働率や遅延を確認しながらの利用をおすすめします。

<h3><a href="https://folkbench.com/services/fluxlane?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog" target="_blank" rel="noopener noreferrer">智流 FluxLane</a></h3>

国内外の多様なモデルを網羅し、OpenAI SDK との互換性も確保されています。モデルの豊富さに加え、ルーティング、利用量、コスト、遅延などの分析ダッシュボードがプラットフォーム内に統合されています。企業や教育機関向けの調達対応（請求書、契約書、发票）が整っている点も強みです。

</details>

---

## 🤝 フィードバックとライセンス

不具合の報告、対応ツールの要望、機能提案は [GitHub Issues](https://github.com/Folkbench/folkbench/issues) までお気軽にお寄せください。セキュリティ脆弱性については [SECURITY.md](SECURITY.md) をご参照の上、個別にご連絡ください。

- Folkbench Switch クライアントは [Apache-2.0](LICENSE.md) ライセンスの下でオープンソースとして公開されています。
