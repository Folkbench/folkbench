---
slug: gpt-6-2-astra-sol-deep-dive
translationKey: gpt-6-2-astra-sol-deep-dive
locale: ja
kind: benchmark-review
title: "GPT-6.2 AstraとSolを徹底評価する 推論・ソフトウェア開発・学術研究"
description: "公開ベンチマークからGPT-6.2の抽象推論、開発エージェント、学術研究への適性、費用対効果を検証する。"
category: モデル
tags: [benchmarks, reasoning, coding, research]
authorId: iris-wu
modelIds: [gpt-6-2-astra, gpt-6-2-sol, gpt-6-astra, gpt-6-1-sol]
benchmarkSlugs: []
relatedSlugs: [gpt-6-1-sol-review-pricing, mathematical-reasoning-robustness, llm-benchmark-rankings-contamination]
publishedAt: '2026-11-18'
updatedAt: '2026-11-18'
sources:
  - id: openai-launch
    label: OpenAI · GPT-6.2 Astra and Sol
    url: https://openai.com/index/introducing-gpt-6-2-astra-sol/
    checkedAt: '2026-11-18'
    claimScope: official
  - id: aa-release
    label: Artificial Analysis · GPT-6.2 launch evaluation
    url: https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: epoch-astra
    label: Epoch AI · GPT-6.2 Astra results
    url: https://epoch.ai/models/gpt-6-2-astra
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: arc-prize
    label: ARC Prize · Verified GPT-6.2 results
    url: https://arcprize.org/results/openai-gpt-6-2
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: cognition
    label: Cognition · FrontierCode 2.0
    url: https://cognition.com/frontiercode
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: terminal-bench
    label: Terminal-Bench · 4.0 leaderboard
    url: https://www.tbench.ai/?version=4
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: epoch-work
    label: Epoch AI · Open-ended work evaluation
    url: https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: epoch-erdos
    label: Epoch AI · FrontierMath Erdős
    url: https://epoch.ai/benchmarks/frontiermath-erdos
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: aa-science
    label: Artificial Analysis · Terminal-Bench-Science 0.1
    url: https://artificialanalysis.ai/evaluations/terminal-bench-science
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: aa-omniscience
    label: Artificial Analysis · AA-Omniscience v1.1
    url: https://artificialanalysis.ai/evaluations/omniscience
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: openai-specs
    label: OpenAI API · Model specifications and pricing
    url: https://developers.openai.com/api/docs/models/compare
    checkedAt: '2026-11-18'
    claimScope: official
  - id: system-card
    label: OpenAI · GPT-6.2 system card
    url: https://deploymentsafety.openai.com/gpt-6-2-astra-sol
    checkedAt: '2026-11-18'
    claimScope: official
---

GPT-6.2 AstraとClaude Fable 5.2は、Epoch AIの総合能力指数でともに **174点**だった。同じ機関の実務から選んだ自由度の高い作業では、Astraが平均 **65%**、Fable 5.2が **82%** だった。一方、GPT-6.2 Solは二つのソフトウェア工学評価でAstraに近く、端末ベンチマーク一式の実行費用は約5分の1だった。難問を解く力、検証できる成果物を作る力、何を調べるべきか判断する力には、それぞれ別の証拠が必要になる。[Epochモデルデータ](https://epoch.ai/models/gpt-6-2-astra) · [Epoch実務評価](https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work) · [Terminal-Bench 4.0](https://www.tbench.ai/?version=4)

OpenAIは2026年11月17日に両モデルを公開した。この記事は11月18日時点の公開結果を分析する。測定値は各評価機関、仕様や料金、メーカー公表の比較はOpenAIによる。Folkbenchによる再測定は行っていない。[OpenAI発表](https://openai.com/index/introducing-gpt-6-2-astra-sol/)

| 評価と条件 | GPT-6.2 Astra | GPT-6.2 Sol |
| --- | ---: | ---: |
| Artificial Analysis Intelligence Index v5.0.1、max | 62 | 57 |
| ARC-AGI-2、max | 95.8% | 85.8% |
| ARC-AGI-3、標準環境、max | 70.3% | 54.9% |
| Terminal-Bench 4.0、Codex、max | 62.1% ± 2.3% | 61.5% ± 2.8% |
| Epoch Automation Reports、Codex | 65% | 未評価 |

[Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [ARC Prize](https://arcprize.org/results/openai-gpt-6-2) · [Terminal-Bench](https://www.tbench.ai/?version=4) · [Epoch Automation Reports](https://epoch.ai/benchmarks/epoch-automation-reports)

## 抽象推論と状態保持

Artificial Analysisの指数でAstraは **62点**。旧Astraより **5点**高く、Fable 5.2の **65点**には届かなかった。Solの **57点**は旧Astraに並び、この指数の加重タスク当たりモデル費用は旧Astraの約 **15%** だった。Epochはベイズ的な項目反応理論を使い、ベンチマークの難易度や識別力を考慮した別の尺度を推定する。用途に近い性能を知るには、指数の下にある課題と実行条件を確認したい。[Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [Epochの指数算出方法](https://epoch.ai/data/eci-documentation/methodology)

グリッドの例から規則を推定するARC-AGI-2で、maxのAstraはSolを **10.0ポイント**上回る。行動結果から学ぶARC-AGI-3の標準環境では差が **15.4ポイント**になる。公開デモの標準環境はモデルが選んだメモを引き継ぐ。Provider Adapterは外部から見えない推論状態も保持し、長いやり取りを圧縮する。適応環境のmaxではAstraが **99.8%**、Solが **98.2%**。Astraはxhighで **100.0%** に達する一方、同じxhighの標準環境は **56.5%** だった。過去の試行や棄却した仮説を次の行動に引き継ぐ方法は、絶対点にもモデル間の差にも影響する。[ARC Prizeの確認済み結果と環境](https://arcprize.org/results/openai-gpt-6-2)

## ソフトウェア工学と実務

Terminal-Bench 4.0のCodex・maxでは点推定の差が **0.6ポイント**で、公表された区間は大きく重なる。評価一式の費用はAstra約 **1,400ドル**、Sol約 **300ドル**だった。FrontierCode 2.0はメンテナーが作成した **132課題**で、正しさ、テスト、変更範囲などからマージできるかを評価する。OpenAIによればmaxでの差は **0.5ポイント**以内で、Solの費用は約5分の1。別のCoding Agent IndexではAstraは前世代と同点、SolはGPT-6.1 Solより **3点**低い。リポジトリの質問に答えるSWE-Atlas-QnA-AAは **14点**下がり、重要な事実の省略が増えた。修正を仕上げる力と既存コードを漏れなく説明する力は別に評価したい。[Terminal-Bench](https://www.tbench.ai/?version=4) · [Cognition](https://cognition.com/frontiercode) · [OpenAI](https://openai.com/index/introducing-gpt-6-2-astra-sol/) · [Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol)

OpenAIはAgents’ Last ExamでAstraがFable 5.2を **5.5点**上回り、費用はFableの **5%** と報告した。Fableが代替モデルを使った9課題は比較から除外されている。Epochの人手評価では順位が逆転し、差は **17ポイント**。ただしAstraは旧Astraの **56%** を上回る。Epochの標本は小さく、各モデルは各課題を1回実行し、エージェント環境も異なる。文書作成を任せる場合は、証拠選択や読者への適応、初稿の見直しが採点対象かを確認する必要がある。[OpenAI](https://openai.com/index/introducing-gpt-6-2-astra-sol/) · [Epochの方法と限界](https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work)

## 学術知識、証明、実験設計

Astraは公開時点のHLE-DiamondとCritPt v2の物理難問サブセットで、いずれもFable 5.2に次いだ。AA-Omniscienceのmaxでのハルシネーション率はAstra **59%**、Sol **55%**。誤答数を、誤答・部分正答・未回答の合計で割った値だ。完全な正答を出せないときに誤って言い切る傾向を示す。文献調査では引用元を個別に確かめる必要がある。[Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [AA-Omniscienceの定義](https://artificialanalysis.ai/evaluations/omniscience)

Epochの表示精度で、FrontierMath Tier 4 v2はAstraが **100%**、旧Astraが **98%**。FrontierMath Erdősでは **10%** と **3%** だった。後者は作成時に未解決だった68問を含み、Leanで証明や反証を検証する。形式命題の妥当性を確認できても、元の問いとの対応や貢献の新規性には専門的判断が必要になる。[Epochの結果](https://epoch.ai/models/gpt-6-2-astra) · [FrontierMath Erdős](https://epoch.ai/benchmarks/frontiermath-erdos)

Terminal-Bench-Science 0.1は検証可能な研究成果物を求める70課題。Astraはxhighで **78.6%**、maxで **78.1%** だった。一方、Epochの実験設計課題では、Astraは未知のルールを持つチェスを設計する代わりに駒のラベルを主に変更した。等価なルールでは既知のチェス知識と未知の規則への汎化を切り分けにくい。Epochは初回の設計を十分に見直さない傾向も観察した。OpenAIのシステムカードでは、AI自己改善能力がAstraはHighの閾値に達し、Solは下回る。これは特定のAI研究環境での評価だ。[Terminal-Bench-Science](https://artificialanalysis.ai/evaluations/terminal-bench-science) · [Epochの事例](https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work) · [OpenAIシステムカード](https://deploymentsafety.openai.com/gpt-6-2-astra-sol)

## 合格した成果物1件当たりの費用

両APIは **105万トークン**のコンテキスト、最大 **92.2万**の入力と **12.8万**の出力に対応する。短い標準リクエストの非キャッシュ入力、キャッシュ読み取り、出力は100万トークン当たりAstra **8 / 0.40 / 40ドル**、Sol **2 / 0.10 / 10ドル**。入力が **272K** を超えると、リクエスト全体の入力とキャッシュ単価が2倍、出力が **1.5倍**になる。非キャッシュ入力10万と課金対象出力1万では、ツールとキャッシュ書き込みを除きAstra **1.20ドル**、Sol **0.30ドル**。費用比が一定の1:4で、Solの失敗時にAstraを1回使うなら、移行率が **75%** 未満でモデル費用を抑えられる。最終合格率、待機時間、目視確認の工数も比較したい。検証しやすい作業にはSolが候補になり、形式推論や未知の規則探索にはAstraを支持する結果が多い。自由度の高い研究はどちらでも、引用と実験設計を確認して初めて受け入れられる。[Astra API](https://developers.openai.com/api/docs/models/gpt-6.2-astra) · [Sol API](https://developers.openai.com/api/docs/models/gpt-6.2-sol)
