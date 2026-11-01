<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/brand/folkbench-logo-only-inverse.svg">
  <img src="public/brand/folkbench-logo-only.svg" width="80" height="80" alt="Folkbench">
</picture>

# Folkbench

### APIプロバイダー選びは、感覚ではなくデータで。

AI API 回線リアルタイム実測ベンチマーク · 開発者向けローカルエンドポイント切替クライアント

[![Version](https://img.shields.io/badge/version-0.1.0--beta.1-blue.svg)](https://github.com/Folkbench/folkbench/releases)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE.md)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows-lightgrey.svg)](https://github.com/Folkbench/folkbench/releases)
[![Built with Tauri](https://img.shields.io/badge/built%20with-Tauri%20%2B%20Rust-orange.svg)](https://tauri.app/)
[![Telegram](https://img.shields.io/badge/Telegram-Group-2BA2E0?logo=telegram&logoColor=white)](https://t.me/+C_E8eL1ZevM4MTY9)
[![QQ](https://img.shields.io/badge/QQ-Group-12B7F5?logo=tencentqq&logoColor=white)](https://qm.qq.com/q/71NzSTrPVK)

[🌐 実測ベンチマーク](https://folkbench.com/rankings/board?utm_source=github&utm_campaign=folkbench-blog) · [⚡ Switch クライアント](#2-回线切替folkbench-switch-クライアント) · [📦 ダウンロード](#3-ダウンロードインストール) · [🔥 人気モデル](#人気モデル) · [💬 コミュニティ (TG)](https://t.me/+C_E8eL1ZevM4MTY9) · [💬 QQ グループ](https://qm.qq.com/q/71NzSTrPVK) · [简体中文](README.md) · [English](README.en.md) · [Español](README.es.md)

</div>

---

日頃から各種 AI コーディングツールを使う際、重要なポイントは実質2つに集約されます：**「信頼できる回線（エンドポイント）を選ぶこと」**、そして**「その回線を各ツールに正しく設定すること」**です。

Folkbench は、この2つのステップを1つのスムーズな開発ワークフローに統合します：

- 🌐 **[1. 回線を選ぶ](#1-回線を選ぶweb-実測ベンチマーク)**：複数リージョンのプローブが稼働率、P95レイテンシ、Token単価を 24時間 リアルタイムで継続計測。スペック偽装や不安定なサービスを客観的データで見極めます。
- ⚡ **[2. 回線を使う](#2-回線切替folkbench-switch-クライアント)**：オープンソースのデスクトップクライアントが Base URL と API Key を一元管理。Claude Code や Codex などの設定を手作業で書き換えることなく、ワンクリックでエンドポイントを切り替えます。

---

## 一部プロバイダーの詳細紹介と割引情報

### [Modelflare](https://folkbench.com/go/modelflare?source=readme_ja)

米国の Havenbyte LLC が運営。GPT、Claude、Gemini、Grok などの主要モデルと標準互換プロトコルに対応し、40種以上の画像・動画生成モデルもカバー。単一の API Key で複数モデルのフォールバック制御や予備グループの設定が可能で、リクエストログから遅延や実消費コストを確認できます。

キャッシュ補償制度も特徴で、対象の OpenAI プールでキャッシュヒット率保証（65%〜85%）を下回った場合に補填が行われます。初回チャージ特典として、単発 US$20 のチャージで倍率 0.015 の GPT 特恵グループが解放されます。解放後の GPT-5.6-Sol は 100 万トークンあたりおよそ入力 ¥0.51 / 出力 ¥3.01 で、利用上限はありません。単発 US$50 のチャージで倍率 0.03 の Claude 特恵グループが解放されます。

### [CheapAI](https://folkbench.com/go/cheapai?source=readme_ja)

圧倒的な低価格を重視したサービス。リアルタイムの回線状況に応じて倍率を自動調整する「動的倍率プール」を備え、リソースに余裕がある時間帯はさらに安価に利用可能です。

コストを最優先するユーザー向けの割引プールから、安定性重視の Pro プール、公式 Key プールまで幅広い選択肢を提供しています。

### [IKunCode](https://folkbench.com/go/ikuncode?source=readme_ja)

Claude Code、Codex、Gemini CLI などのコーディング支援ツールの導入サポートが充実。メール、QQ、Telegram などの窓口を公開しており、導入初心者に親切なサポート体制を整えています。

### [FluxLane（智流）](https://folkbench.com/go/fluxlane?source=readme_ja)

国内外の多様なモデルを網羅し、OpenAI SDK と完全互換。ルーティング、利用量、コスト、遅延を一元管理でき、企業や教育機関向けの請求書・契約書対応が強みです。

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
- **セキュリティ上の注意**：GitHub Issues への投稿やログのスクリーンショットを共有する際は、ご自身的 API Key が映り込まないようマスキングをお願いします。

---

## 🤝 フィードバックとコミュニティ

- **コミュニティ**：[Telegram グループ](https://t.me/+C_E8eL1ZevM4MTY9) または [QQ グループ「folkbench 用户群」](https://qm.qq.com/q/71NzSTrPVK)（グループ番号 203286875）に参加して、AI 開発環境の活用法や最新の回線状況を共有できます。
- **課題・改善提案**：バグの報告や対応ツールの追加要望は [GitHub Issues](https://github.com/Folkbench/folkbench/issues) までお気軽にお寄せください。
- **セキュリティ**：脆弱性のご報告は [SECURITY.md](SECURITY.md) をご参照の上、個別にご連絡ください。
- **オープンソースライセンス**：Folkbench Switch クライアントは [Apache-2.0](LICENSE.md) ライセンスの下で公開されています。
