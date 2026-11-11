---
slug: claude-sonnet-5-5-review-pricing
translationKey: claude-sonnet-5-5-review-pricing
locale: ja
kind: article
title: Claude Sonnet 5.5 の仕様、公式価格、発表ページのベンチマーク
description: "Claude Sonnet 5.5 の公式仕様、Sonnet 5 と同じ公式価格、発表ページに掲載されたベンチマークをまとめました。移行時に 400 を返すリクエストも個別に挙げています。これらの数値は Folkbench の実測ではありません。"
category: モデル
tags: [料金, ベンチマーク, api]
authorId: iris-wu
modelIds: [claude-sonnet-5-5, claude-sonnet-5, claude-opus-5-5, gpt-6-sol]
benchmarkSlugs: []
relatedSlugs: [claude-opus-5-5-review-pricing, gpt-6-1-sol-review-pricing]
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: sonnet-55-announcement
    label: Anthropic、Claude Sonnet 5.5 発表ページ
    url: https://www.anthropic.com/claude-sonnet-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-55-overview
    label: Claude Platform、Sonnet 5.5 モデルページ
    url: https://platform.claude.com/docs/en/models/sonnet-5-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-55-whats-new
    label: Claude Platform、Sonnet 5.5 の新機能
    url: https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-55-migration
    label: Claude Platform、Sonnet 5.5 への移行
    url: https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-5-overview
    label: Claude Platform、Sonnet 5 モデルページ
    url: https://platform.claude.com/docs/en/models/sonnet-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
---

> 以下の仕様、公式価格、スコアは Anthropic の公開ページから転記したもので、確認日は 2026 年 10 月 2 日です。Folkbench はこれらのベンチマークを再実行していません。「最大 30% 安い」「30% 以上高速」といった開発元の記述は、開発元自身のテスト環境での結果です。

Claude Sonnet 5.5 は 2026 年 9 月 28 日に発表された、Claude 5.5 ファミリーの 2 番目のモデルです。Claude API のモデル ID は `claude-sonnet-5-5` です。Anthropic はこのモデルを [Opus 5.5](../claude-opus-5-5-review-pricing/) と並べて位置づけています。範囲の明確な日常タスク、バグ修正、ドキュメント・スライド・スプレッドシートにはこちらを使い、複雑で自由度が高く、継続的な判断を要する作業については、発表ページ自身が引き続き Opus 5.5 のほうが強いと書いています。公式価格は Sonnet 5 と同じで、100 万入力トークンあたり $2、100 万出力トークンあたり $10、キャッシュ読み取りは $0.20 です。

Haiku 5.5 は、どちらの発表ページでも今後数週間のうちに登場すると書かれています。本記事では、まだ価格表に載っていない ID の価格は扱いません。

## 公開済みの仕様

| 項目 | Claude Sonnet 5.5 |
| --- | --- |
| Claude API モデル ID | `claude-sonnet-5-5` |
| 発表日 | 2026 年 9 月 28 日 |
| コンテキスト / 同期最大出力 | 1M / 128K トークン |
| 入力と出力 | テキストと画像を入力し、テキストを出力 |
| 思考 | アダプティブ、デフォルトで有効 |
| Claude API のデフォルト effort | `high` |
| Claude アプリと Claude Code のデフォルト effort | `medium` |
| effort の値 | `low`、`medium`、`high`、`xhigh`、`max` |
| モデルページのレイテンシ区分 | Fast。現行の Claude ラインナップ内での比較であり、トークン/秒の計測値ではありません |
| 信頼できる知識のカットオフ | 2026 年 6 月 |
| キャッシュ可能なプロンプトの最小長 | 512 トークン |
| トークナイザー | Sonnet 5 と同じ。同じテキストならトークン数も同じです |

Sonnet 5 のモデルページでは、同モデルは引き続き legacy かつ利用可能と表示されており、入力と出力も $2 / $10、信頼できる知識のカットオフは 2026 年 1 月です。提供終了については、2027 年 6 月 30 日より前には終了しないと約束しています。Sonnet 5.5 の新機能ページは、5.5 への移行を推奨しています。

事前思考をオフにする最低設定は `thinking: {"type": "between_tools"}` で、`low`、`medium`、`high` でのみ受け付けられます。`xhigh` と `max` ではアダプティブ思考に戻す必要があります。移行ガイドには、`temperature`、`top_p`、`top_k` をデフォルト以外の値にすると 400 が返ると明記されています。

## 公式価格

単位は 100 万トークンあたりの米ドルです。Sonnet 5.5 の列はモデルページから取りました。Opus 5.5 の入力・出力・キャッシュ読み取りは、同じ発表ページの比較表から取っています。新機能ページには、Sonnet 5.5 の価格はプロンプトキャッシュとバッチを含めて Sonnet 5 と同じだと書かれています。バッチ割引は入力と出力の 50% です。

| 100 万トークンあたり | Sonnet 5.5 | 発表ページ上の Opus 5.5 |
| --- | --- | --- |
| 入力 | $2 | $4 |
| 出力 | $10 | $20 |
| キャッシュ読み取り | $0.20 | $0.20 |
| キャッシュ書き込み | 5 分 $2.50、1 時間 $4 | 発表ページでは $5 の 1 つだけ。新機能ページでは 5 分 $5 と 1 時間 $8 に分けて記載 |
| バッチ入力 / 出力 | 公式価格の 50% | この発表ページの比較表には記載なし |

入力と出力は Opus 5.5 の半額です。キャッシュ読み取りはどちらも $0.20 です。発表ページは Opus 5.5 のキャッシュ書き込みを $5 の 1 つだけで載せており、5 分と 1 時間を分けていません。Sonnet 5.5 のモデルページは、自身の 2 つの区分を分けて載せています。

Anthropic はワークロードについても 2 つの主張をしています。同じ作業でも通常はトークンが少なく済み、ほとんどのタスクで最大 30% 安くなること、そして出力生成が Sonnet 5 より 30% 以上速いことです。コストのグラフには、「約 10 分の 1」「約 5 分の 1」「約 15 分の 1」「約 9 分の 1」というタスクあたりのコスト比較も載っています。これらはいずれも開発元のテスト環境での結果です。実際の請求額は、effort、キャッシュヒット、ツール呼び出しの往復回数、バッチを使うかどうかによって変わります。

公式価格から手計算できる例を 3 つ挙げます。いずれも、該当する区分の入力トークン 10 万に、出力トークン 5,000 を加えた形です。

| リクエスト | 計算 | 金額 |
| --- | --- | --- |
| キャッシュなし入力 10 万、出力 5,000 | 0.1 × $2 + 0.005 × $10 | $0.25 |
| キャッシュ読み取り 10 万、出力 5,000 | 0.1 × $0.20 + 0.005 × $10 | $0.07 |
| 5 分キャッシュ書き込み 10 万、出力 5,000 | 0.1 × $2.50 + 0.005 × $10 | $0.30 |

3 行目は 5 分の書き込み価格を使っており、1 時間の $4 ではありません。1 時間の書き込みなら 0.1 × $4 + 0.005 × $10 = $0.45 です。

## 発表ページのベンチマークの読み方

下の表は、2026 年 10 月 2 日時点で発表ページに掲載されていたものそのままです。ダッシュは発表ページ自体の空欄です。Terminal-Bench 4.0 と CursorBench 4.0 のコストグラフでは、GPT-5.6 Sol が使われています。OpenAI が GPT-6 Sol のこの 2 項目を公開していないためです。本記事では、グラフ上の GPT-5.6 Sol の値を GPT-6 Sol の列には入れていません。

| ベンチマーク | Sonnet 5.5 | Sonnet 5 | Opus 5.5 | GPT-6 Sol |
| --- | --- | --- | --- | --- |
| Terminal-Bench 4.0 | 70.6% | 10.3% | 66.4% | — |
| FrontierCode v1.1（Main） | 46.2%（max）、52.1%（xhigh） | 42.4% | 54.4% | 49.3% |
| CursorBench 4.0 | 55.5% | 34.1% | 57.8% | — |
| GDPval-AA v2.1 | 1844 | 1449 | 1846 | 1487 |
| AA-Briefcase v1.1 | 1811 | 1359 | 1822 | 1483 |
| Humanity's Last Exam、ツール使用あり | 64.5% | 54.9% | 67.7% | — |
| OSWorld 2.1、partial | 80.1% | 57.0% | 81.8% | — |
| Chartography、ツール使用なし | 61.6% | 15.6% | 64.4% | 53.6% |

この Chartography の行は、ツールなしのスコアです。Opus 5.5 の発表ページにある Chartography はツールありの別の行で、そこでの Opus 5.5 は 89.0% です。ここでの 64.4% と並べて、同じ計測として扱うことはできません。

スコアは脚注と合わせて読む必要があります。Opus 5.5 の Terminal-Bench 4.0 は xhigh での値で、発表ページはこれを同モデルの最高スコアとしています。FrontierCode では、Sonnet 5.5 の max が xhigh を下回っています。発表ページの説明によると、max ではコードレビューを実行する頻度が高く、レビューが複数のサブエージェントに分割された結果、Cognition が調べたケースでは、タイムアウトやタスク範囲外の変更が起きていました。この評価は範囲外の変更を減点します。

GDPval-AA と AA-Briefcase は、Artificial Analysis がプレリリース版のデプロイ上で実行しました。このデプロイには、構造化出力の性能を下げるおそれのある不具合がありました。発表ページによると、この不具合はその後修正されており、影響があったとしても Sonnet 5.5 を過小評価する方向に働くとのことです。GPT-6 Sol の列の GDPval-AA、AA-Briefcase、Chartography には別の注記もあります。OpenAI は画像理解を損なう不具合を修正しており、これらの外部スコアは当時まだ新しいモデルを反映していなかった可能性がある、というものです。

同じページのコストグラフは、別の読み方をするものです。Medium effort は Claude アプリのデフォルト値です。いくつかのベンチマークでは、Low または Medium の Sonnet 5.5 が、タスクあたり約 10 分の 1 のコストで Sonnet 5 の最高成績を上回っています。High effort は Claude Platform のデフォルト値です。発表ページによると、FrontierCode の High では同じ設定の Sonnet 5 より約 10 ポイント高く、タスクあたりのコストは約 15 分の 1 で、GPT-6 Sol の最高成績にも約 5 分の 1 のコストで並びます。CursorBench では Low で Sonnet 5 の最高成績を 10 分の 1 未満のコストで上回り、AA-Briefcase では Medium で Sonnet 5 の最高成績を約 9 分の 1 のコストで上回っています。

表の 55.5% や 1844 は、発表ページに掲載された点です。コストに関する記述は、別の測定環境によるものです。発表ページは同時に、Anthropic 自身の利用と外部テストでは、複雑で自由度が高く、継続的な判断を要する作業で引き続き Opus 5.5 のほうが強いとも書いています。顧客の推薦コメントは選ばれた証言であり、この表には含まれません。発表ページには、スクリーンショットだけで Pokémon Red をクリアした初の Sonnet だという記述もありますが、これは製品紹介のストーリーであって、上の表の 1 行ではありません。

## Sonnet 5 からの移行

新機能ページには、Sonnet 5 で動いていたコードが 400 を返すようになる変更が 5 つ挙げられています。ほかに、リクエスト自体は成功するものの、レスポンスの形が変わるケースもあります。

```text
model: claude-sonnet-5-5
max_tokens: 1024
thinking: {"type": "adaptive"}
output_config.effort: medium
# 400：thinking の type が disabled
# 400：thinking の type が enabled で、budget_tokens を指定
# 400：thinking の type が between_tools で、effort が xhigh または max
# 400：tool_choice が any、または tool_choice が tool
# 400：temperature、top_p、top_k がデフォルト以外の値
# 400（Claude API と Google Cloud のみ）：ツールの type が computer_20251124
# 400：アドバイザーツールで Opus 4.8、Opus 4.7、Sonnet 5 をアドバイザーに指定
```

事前思考をオフにするには、`between_tools` を送り、effort は `high` 以下に保ちます。`between_tools` には、`display`、`budget_tokens`、`block_binding` を併せて指定できません。`tool_choice` は引き続き `auto` か `none` を使います。スキーマに沿ったツール引数が必要なら、厳格なツール呼び出しをオンにするか構造化出力を使い、どんなときにツールを呼ぶかをプロンプトに明記します。

Claude API と Google Cloud でのコンピューター操作は、`computer_toolset_20260801` に移行します。新機能ページによると、Amazon Bedrock では従来の `computer_20251124` も引き続き受け付けます。

アドバイザーツールは、Mythos 5.1、Fable 5.1、Mythos 5、Fable 5、Opus 5.5、Opus 5、または Sonnet 5.5 自身を受け付けます。Opus 4.8、Opus 4.7、Sonnet 5 は Sonnet 5 のアドバイザーにはなれますが、Sonnet 5.5 のアドバイザーにはなれません。アドバイザーが返す内容は暗号化されており、クライアントは本文を読めません。

2026 年 8 月 31 日 00:00 UTC 以降に作成されたアカウントでは、Claude API、Amazon Bedrock、Google Cloud でもう 1 つ 400 が発生します。Sonnet 5.5 の思考ブロックを再送する際、システムプロンプト、ツール一覧、それ以前のメッセージのいずれかが変更されていると、リクエストは失敗します。会話は追記のみで扱ってください。指示を変える必要がある場合は、会話の途中にシステムメッセージを入れます。

effort を省略すると、API は `high` で動作します。同じ名前の設定でも、Sonnet 5 とは思考量が一致しません。新機能ページは、古い設定をそのまま流用せず、effort のスイープをやり直すよう求めています。範囲の明確なツールループなら `medium` から始め、長いタスクや難しいタスクでは `high` に上げます。レイテンシを重視する対話は `medium` か `low` から始めます。Claude アプリと Claude Code のデフォルトはすでに `medium` で、Claude Platform のデフォルトは `high` です。

ツール呼び出しの合間に出る、1～2 文を超える進捗テキストは、思考ブロックの中に戻ります。display がデフォルトの `omitted` の場合、これらのブロックのテキストは空になるため、ツールの合間に UI が静かになりますが、リクエスト自体は成功しています。`between_tools` を使う場合、このテキストは思考ブロック内の要約として返り、再送時にはモデルが完全なメモを参照します。

思考ブロックには、それを生成したモデルが記録されています。新機能ページによると、Sonnet 5.5 は Sonnet 5、Opus 4.8、Haiku 4.5 およびそれ以前のモデルの思考ブロックを読めますが、Opus 5、Opus 5.5、Fable、Mythos の思考ブロックは読みません。Claude API と Google Cloud では、Opus 5.5 は Sonnet 5.5 の思考ブロックを読めますが、ほかの現行モデルは読めません。対象モデルが読めないブロックはモデルに渡る前に破棄されます。リクエストは成功し、破棄されたブロックは課金されません。

拒否されたリクエストは HTTP 200 で返り、`stop_reason` は `"refusal"` になります。発表ページによると、このモデルのサイバーセキュリティ能力は Opus 5 に近づいており、そのため同種のサイバーセキュリティ保護策を備えた初の Sonnet となりました。より高リスクなサイバーセキュリティタスクは、Sonnet 5 にフォールバックします。生物学分野の保護策は Sonnet 5 と同じです。通常のソフトウェア開発とほとんどのライフサイエンス業務は、これら 2 つの限定的な保護策の対象外です。発表ページには、Sonnet 5.5 はゼロデータ保持で提供できるとも書かれています。

## トラフィックを切り替える前の確認事項

1. `claude-sonnet-5-5` を固定します。完了したレスポンスのモデル名も確認してください。サイバーセキュリティ保護策でフォールバックした場合、回答したモデルが Sonnet 5 のことがあります。
2. 機密情報を含まない同じセットを、`low`、`medium`、`high`、`xhigh`、`max` のそれぞれで再実行します。成功率、レイテンシ、入力、キャッシュ読み取り、キャッシュ書き込み、出力、費用を記録します。
3. effort は `output_config.effort` に指定します。このモデルの思考の深さを、手動の `budget_tokens` で設定しないでください。
4. `disabled`、強制的なツール選択、サンプリングパラメーター、`computer_20251124` を送っているクライアントは、流量を増やす前に修正します。Bedrock 上の旧コンピューター操作ツールは例外です。
5. 思考ブロックを再送する会話は、追記のみで運用します。
6. HTTP 200 の拒否と通信エラーは分けて数えます。
7. 短いプロンプト 1 つと、キャッシュにヒットするはずのプロンプト 1 つで、請求額を確認します。5 分の書き込み、1 時間の書き込み、バッチの 50% 割引は、それぞれ別の価格体系です。
8. 複雑で自由度が高く、継続的な判断を要するタスクは、引き続き `claude-opus-5-5` を使います。`claude-sonnet-5` は、モデルページ上で引き続き利用可能と表示されています。OpenAI 側の価格区分は [GPT-6.1 Sol](../gpt-6-1-sol-review-pricing/) を参照してください。

モデルを選んだあと、各中継サービスがこの ID を提供しているかどうか、またその時点の稼働率と価格は、ディレクトリで公開済みの記録に従ってください。本記事では各サービスを比較していません。
