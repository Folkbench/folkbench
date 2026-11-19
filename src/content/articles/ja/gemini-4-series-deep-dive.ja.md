---
slug: gemini-4-series-deep-dive
translationKey: gemini-4-series-deep-dive
locale: ja
kind: benchmark-review
title: "Gemini 4シリーズを徹底評価する Argon・Carbon・Hydrogen・Neonの知能の構造"
description: "GoogleのモデルカードとArtificial Analysis、Epoch AI、ARC Prize、Terminal-Benchの公開結果を照合し、Gemini 4の4モデルを総合知能、抽象推論、数学と科学、エンジニアリング、長文脈、安全性の観点から分析する。推論予算と評価条件が結論をどう変えるかも検証する。"
category: モデル
tags: [benchmarks, reasoning, research, long-context]
authorId: iris-wu
modelIds: [gemini-4-neon, gemini-4-carbon, gemini-4-hydrogen, gemini-4-argon]
benchmarkSlugs: []
relatedSlugs: [gpt-6-2-astra-sol-deep-dive, mathematical-reasoning-robustness, long-context-effective-understanding]
publishedAt: '2026-11-19'
updatedAt: '2026-11-19'
sources:
  - id: google-neon
    label: Google · Introducing Gemini 4 Neon
    url: https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: google-carbon
    label: Google · Gemini 4 Carbon announcement
    url: https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: google-argon
    label: Google · Gemini 4 Argon announcement
    url: https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: google-hydrogen
    label: Google · Introducing Gemini 4 Hydrogen
    url: https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: card-neon
    label: Google DeepMind · Gemini 4 Neon model card
    url: https://deepmind.google/models/model-cards/gemini-4-neon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: card-carbon
    label: Google DeepMind · Gemini 4 Carbon model card
    url: https://deepmind.google/models/model-cards/gemini-4-carbon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: card-argon
    label: Google DeepMind · Gemini 4 Argon model card
    url: https://deepmind.google/models/model-cards/gemini-4-argon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: aa-neon
    label: Artificial Analysis · Gemini 4 Neon launch evaluation
    url: https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain
    checkedAt: '2026-11-19'
    claimScope: observed
  - id: epoch-carbon
    label: Epoch AI · Gemini 4 Carbon results
    url: https://epoch.ai/models/gemini-4-carbon
    checkedAt: '2026-11-19'
    claimScope: observed
  - id: arc-carbon
    label: ARC Prize · Verified Gemini 4 Carbon results
    url: https://arcprize.org/results/google-gemini-4-carbon
    checkedAt: '2026-11-19'
    claimScope: observed
  - id: arc-argon
    label: ARC Prize · Verified Gemini 4 Argon results
    url: https://arcprize.org/results/google-gemini-4-argon
    checkedAt: '2026-11-19'
    claimScope: observed
  - id: terminal-bench
    label: Terminal-Bench · 4.1 leaderboard
    url: https://www.tbench.ai/?version=4
    checkedAt: '2026-11-19'
    claimScope: observed
---

Artificial AnalysisのIntelligence Index v5.0.1で、指数全体の実行に使う出力トークンを1.1億〜1.24億にそろえると、Gemini 4 Argon（high）は**50**、Hydrogen（high）は**51**、Carbon（medium）は**58**、Neon（high）は**60**となる。4モデルの知識カットオフはいずれも2026年3月だ。Googleのモデルカードによれば、CarbonはArgonをベースとし、HydrogenとNeonはCarbonを改造したモデルである。ARC‑AGI‑3の標準ハーネスでは、同じlow設定でCarbonがArgonを**15.3ポイント**上回り、Epoch AIが記録したFrontierMath Tier 4の差は**17ポイント**に達する。7週間で4回のリリース、知識カットオフは同じ。Gemini 4シリーズは、事後学習と推論予算をめぐる公開実験に近い。同時に、同じ予算で比べるか、同じ設定名で比べるかで、ランキングが2通りに分かれることも示している。[Artificial Analysis Neon初回評価](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain) · [ARC Prize Carbon検証結果](https://arcprize.org/results/google-gemini-4-carbon) · [Epoch Carbonモデルデータ](https://epoch.ai/models/gemini-4-carbon)

Googleは9月30日にArgonを、10月28日にCarbonを発表し、Carbonは11月10日に一般提供となった。続いて11月12日にHydrogen、18日にNeonを公開した。本稿は11月19日時点で確認できる公開結果を根拠とした、Folkbenchによる二次分析である。モデルカードと発表記事のスコアはGoogleの報告で、比較対象モデルのスコアにはGoogleが実行したものと、第三方による実行と明記されたものがある。Artificial Analysis、Epoch AI、ARC Prize、Terminal-Benchの結果は各評価機関に帰属する。Folkbenchは今回モデルを再実行していない。パーセンテージは各ランキングの定義に従い、推論設定、ハーネス、評価の実行者に依存する結論は、その条件の範囲でのみ成り立つ。[Google Argon発表](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/) · [Google Carbon一般提供](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/) · [Google Neon発表](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/)

## 一つの土台に4回の事後学習

| モデル | 発表日 | 公式の位置づけ | モデルカード記載の由来 | API価格（入力 / 出力、100万トークンあたり） | AA指数v5.0.1の最高設定 |
| --- | --- | --- | --- | --- | ---: |
| Gemini 4 Argon | 9月30日 | コーディング、企業の知識業務、サイバー防御 | 新規学習の疎なMoEモデル | 導入価格2 / 10ドル、その後4 / 20ドル | 50（high） |
| Gemini 4 Carbon | 10月28日、11月10日に一般提供 | 長期タスクとサイバーセキュリティ | Argonがベース | 11月30日まで2 / 10ドル、その後4 / 20ドル | 60（high） |
| Gemini 4 Hydrogen | 11月12日 | 高速な日常業務 | Carbonを改造 | 1.50 / 7.50ドル | 54（xhigh） |
| Gemini 4 Neon | 11月18日 | 深さと効率の両立 | Carbonを改造 | 3 / 15ドル | 61（xhigh） |

[Argonモデルカード](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Carbonモデルカード](https://deepmind.google/models/model-cards/gemini-4-carbon/) · [Hydrogenモデルカード](https://deepmind.google/models/model-cards/gemini-4-hydrogen/) · [Neonモデルカード](https://deepmind.google/models/model-cards/gemini-4-neon/)

この世代で唯一のアーキテクチャ説明はArgonのモデルカードにある。大規模な疎の混合エキスパート（MoE）Transformerで、テキスト、画像、音声の入力をネイティブに扱い、既存モデルの微調整ではなく新たに学習したモデルだという。TPU上でJAXとML Pathwaysを使って学習し、事後学習には指示チューニング、人間の選好データ、そして多段階推論、問題解決、定理証明のデータを含む強化学習が使われた。Carbonのモデルカードはアーキテクチャ、学習データ、ハードウェアの詳細をすべてArgonに委ね、HydrogenとNeonのモデルカードはCarbonから改造（adapted from）したと記し、詳細をCarbonに委ねている。4モデルとも、入力と出力を合わせて最大100万トークンの文脈を扱える。[Argonモデルカード](https://deepmind.google/models/model-cards/gemini-4-argon/)

この構造が、シリーズ内の進歩の読み方を決める。知識カットオフが変わっていない以上、ArgonからCarbonへの向上を新しい世界知識に帰することはできず、事後学習データ、強化学習、推論設定の変更によるものと考えるほうが自然だ。Googleはパラメータ数を公開しておらず、「改造」が蒸留なのか継続学習なのか、別の手法なのかも説明していない。そのためHydrogenとNeonの規模や学習経路は公開情報から推定できない。確かなのは、この世代の能力差の大部分が事前学習の後で生じているという点である。

## 知能：同じ設定名でも推論予算は同じではない

Carbonは10月28日の発表時、v5.0指数で**59**を記録し首位に立った。3週間後のv5.0.1の再採点では**60**となったが、首位はClaude Fable 5.2の**65**に代わり、GPT‑6.2 Astraの**62**、Neonの**61**が続く。Claude Opus 5.5は**59**、GPT‑6.2 Solは**57**である。Epoch AIのECIも近い位置を示す。Carbonは**170**で追跡対象241モデル中3位、Argonは**167**、Fable 5.2は**174**、GPT‑6 Astraは**169**だ。二つの指数は手法が異なるが、どちらもCarbonを第一集団に置き、現在の首位よりわずかに下に位置づけている。11月19日時点でEpochはNeonの記録を公開しておらず、Hydrogenには個別の結果はあるもののECIはまだない。総合指数の順位は週単位で入れ替わるため、一度の「1位」の説得力は限られる。[Google Carbon発表](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/) · [Artificial Analysis GPT‑6.2初回評価](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [Neonモデルカード](https://deepmind.google/models/model-cards/gemini-4-neon/) · [Epoch Carbonモデルデータ](https://epoch.ai/models/gemini-4-carbon)

より多くを語るのは、推論設定ごとの曲線である。括弧内は指数全体の実行に使った出力トークン数だ。

| AA指数v5.0.1 | Neon | Hydrogen | Carbon | Argon |
| --- | ---: | ---: | ---: | ---: |
| low | 44（2,830万） | 27（2,030万） | 54（8,390万） | 掲載なし |
| medium | 55（6,290万） | 41（5,440万） | 58（1.24億） | 48（8,170万） |
| high（既定） | 60（1.23億） | 51（1.10億） | 60（2.05億） | 50（1.13億） |
| xhigh | 61（2.83億） | 54（3.04億） | 設定なし | 設定なし |

[Neonの設定別データ](https://artificialanalysis.ai/models/gemini-4-neon) · [Hydrogenの設定別データ](https://artificialanalysis.ai/models/releases/gemini-4-hydrogen) · [Carbonの設定別データ](https://artificialanalysis.ai/models/gemini-4-carbon) · [Argonの設定別データ](https://artificialanalysis.ai/models/gemini-4-argon)

第一に、収穫逓減が速い。Neonをhighからxhighに上げると出力トークンは**2.3倍**になるが、指数は**1ポイント**しか上がらず、1タスクあたりの所要時間は14.8分から21.5分に延びる。Hydrogenは同じ一段で**2.8倍**のトークンを使い、**3ポイント**を得る。第二に、設定名は予算の単位ではない。Carbonのlow設定は8,390万トークンを使い、Neonのmediumより多い。総予算を近い水準にそろえると、順にArgon 50、Hydrogen 51、Carbon 58、Neon 60となり、全モデルを既定設定で比べるよりも事後学習の効果をよく示す。ただしこの比較にも限界がある。トークン数は指数全体の合計で、問題ごとにそろえたものではない。出力速度も異なり、Neonのhighは毎秒約101トークン、Carbonは毎秒55〜58トークンなので、同じトークン数でも待ち時間は違う。

第三に、小さなモデルほど予算に敏感だ。lowからhighまでの幅は、Hydrogenが**24ポイント**、Neonが**16ポイント**、Carbonはわずか**6ポイント**である。Hydrogenのような高速モデルでは、設定を誤ったときの落差がモデルを替えるよりも大きくなりうる。

## 抽象推論：ARC‑AGI‑3では長く考えるほど良いとは限らない

| ARC Prize検証結果 | Gemini 4 Argon | Gemini 4 Carbon |
| --- | ---: | ---: |
| ARC‑AGI‑2、low / medium / high | 42.1% / 87.1% / 91.3% | 49.6% / 94.2% / 92.1% |
| ARC‑AGI‑3標準ハーネス、low / medium | 49.8% / 46.3% | 65.1% / 63.9% |
| ARC‑AGI‑3標準ハーネス、high | 集計外（55ゲーム中19完了） | 集計外（55ゲーム中30完了） |
| ARC‑AGI‑3 Provider Adapter、low / medium / high | 97.5% / 97.3% / 97.3% | 97.7% / 99.1% / 96.9% |

[ARC Prize Argon検証結果](https://arcprize.org/results/google-gemini-4-argon) · [ARC Prize Carbon検証結果](https://arcprize.org/results/google-gemini-4-carbon)

注目点は三つある。一つ目に、推論設定とスコアは単調な関係にない。CarbonはARC‑AGI‑2でmediumがhighを上回り、ARC‑AGI‑3の標準ハーネスではlowがmediumを上回る。ArgonもARC‑AGI‑3ではlowが最高だ。二つ目に、最高設定は対話的な環境でそのまま破綻しうる。Carbonのhigh設定は行動と行動の間隔が長すぎてゲームセッションが失効し、30ゲームしか完了できなかった。ArgonのhighはAPIの問題で19ゲームしか完了していない。静的な質問応答では長く考えてもコストが増えるだけだが、対話的な環境では環境側の時間も消費する。三つ目に、ハーネスの差は世代間の差をはるかに上回る。CarbonはProvider Adapterで**99.1%**に達する一方、標準ハーネスでは最高**65.1%**で、差はおよそ**34ポイント**だ。ARC Prizeの説明では、標準ハーネスはモデルが自ら残すと決めたメモだけを引き継げるのに対し、Provider Adapterはリクエスト間で不透明な推論状態を保持し、長い会話では文脈を圧縮する。

環境ごとに見ると、失点は一部のゲームに集中している。標準ハーネスでは、G50TはArgonとCarbonのlowとmediumでいずれも**0.0%**、BP35はいずれも**1.0%**以下、TU93はいずれも**5.3%**以下である。同じ3ゲームはProvider Adapterではほぼ100%だ。総合スコアは15ポイント上がったのに、これらのゲームはほとんど動いていない。妥当だが未検証の解釈として、これらは単一ステップの推論ではなくステップをまたぐ状態の保持で行き詰まっており、世代間の向上は、もともと部分的に解けていた環境で主に生じたと考えられる。参考までに、標準ハーネスのmax設定でGPT‑6.2 Astraは**70.3%**、GPT‑6.2 Solは**54.9%**で、Carbonはその中間にある。[ARC Prize GPT‑6.2検証結果](https://arcprize.org/results/openai-gpt-6-2)

## 学術的能力：知識の較正、数学、科学的実行

| Epoch AIの記録 | Gemini 4 Argon | Gemini 4 Carbon | Gemini 4 Hydrogen | GPT‑6 Astra | Claude Fable 5.2 |
| --- | ---: | ---: | ---: | ---: | ---: |
| GPQA Diamond | 96% | 97% | 97% | 96% | 96% |
| SimpleQA Verified | 76% | 78% | 71% | 76% | 94% |
| FrontierMath Tiers 1–3（v2） | 86% | 91% | 88% | 94% | 95% |
| FrontierMath Tier 4（v2） | 78% | 95% | 88% | 98% | 100% |
| FrontierMath Erdős | 1% | 3% | 未測定 | 3% | 未測定 |
| Chess Puzzles | 59% | 78% | 60% | 76% | 79% |
| EBR‑bench（Earthborne Rangers） | 65% | 88% | 70% | 76% | 90% |

[Epoch Carbonモデルデータ](https://epoch.ai/models/gemini-4-carbon) · [Epoch Hydrogenモデルデータ](https://epoch.ai/models/gemini-4-hydrogen)

**知識と較正。** GPQA Diamondはもはやフロンティアモデルを区別できず、表の5モデルはすべて96〜97%に収まる。より差が出るのは事実の想起と、わからないときの振る舞いだ。EpochのSimpleQA VerifiedでCarbonは**78%**で、Fable 5.2より**16ポイント**低い。一方、Artificial AnalysisのAA‑Omniscience v1.1では、Carbon（medium）とArgon（high）のハルシネーション率がともに**4%**で、Carbonはランキングで最も低い。この指標の分母は完全には正解でないすべての回答、分子はそのうち明確に誤った回答である。比較として、GPT‑6.2 AstraとSolのmax設定はそれぞれ**59%**と**55%**だ。二つの結果は別の問題セットに基づくため合算はできないが、方向は一致する。Gemini 4は最も多くを覚えているとは限らないが、わからないときは回答を控えるか部分的な答えにとどめる傾向が強く、作り話は少ない。少なくともこの種の知識問題では、明確に答えた内容の誤り率は低い。文献レビューに使う場合、網羅性は検索で補う必要がある。[AA‑Omniscienceの指標定義とランキング](https://artificialanalysis.ai/evaluations/omniscience)

HLE‑Diamondは、Carbonがv5.0の9評価のうち首位となった4項目の一つである。GoogleはNeonを**71.3%**、Opus 5.5を**67.9%**、GPT‑6.2 Solを**64.0%**、Hydrogenを**58.8%**と報告しており、これらの数値はいずれもGoogleのモデルカードによる。[DeepLearning.AIによるv5.0結果のまとめ](https://www.deeplearning.ai/the-batch/gemini-leads-the-pack-again) · [Neonモデルカード](https://deepmind.google/models/model-cards/gemini-4-neon/)

**数学。** ArgonからCarbonへ、FrontierMath Tier 4は**17ポイント**上がった。このデータで最大の世代間の伸びであり、GPT‑6 AstraとFable 5.2に迫る。ところがFrontierMath Erdősは**1%**から**3%**に上がっただけだ。この68問はベンチマーク作成時点で未解決の問題で、提出された証明または反証はLeanで検査される。現在の最高はGPT‑6.2 Astraの**10%**である。既知の答えがある研究レベルの問題は飽和しつつある一方、未解決問題にはほとんど手がついていない。Googleが自己申告するRiemannBenchは、Argonの**76.0%**、Carbonの**80.0%**からNeonの**84.0%**へと上がり、方向は一致するがベンダー自身の測定である。Epochのパズル系評価も同様の事後学習の効果を示す。チェスのパズルは59%から78%へ、EBR‑benchは65%から88%へ伸びた。いずれもルールの制約下で多段階の探索を要する課題で、ARC‑AGI‑3標準ハーネスでの向上と方向が一致する。高速版のHydrogenはTier 4で**88%**とArgonを**10ポイント**上回るが、パズル系の成績はArgonに近く、SimpleQA Verifiedの想起は**71%**にとどまる。数学のように答えを自動で検証できる能力は高速モデルへの改造でもよく保たれ、記憶型の知識はモデル容量により依存する、という説明が考えられるが、公開情報だけでは裏付けられない。[FrontierMath Erdősの方法論](https://epoch.ai/benchmarks/frontiermath-erdos)

**科学的実行。** Terminal‑Bench‑Science 0.1は、テストで検査できる研究成果物をターミナル上で納品することをモデルに求める。CarbonのモデルカードにあるArtificial Analysisによる実行結果は、Carbon **64.8%**、Argon **52.9%**、GPT‑6 Astra **63.3%**、Opus 5.5 **59.0%**である。NeonのモデルカードはNeonを**70.5%**と報告し、GPT‑6.2 Solの**68.0%**、Opus 5.5の**63.3%**を上回る。GoogleはNeonをクラス最高としており、それは同社が選んだ比較対象の中では成り立つ。しかしArtificial Analysisの全体ランキングでは、GPT‑6.2 Astraのxhighが**78.6%**で、なお**8.1ポイント**高い。Hydrogenは**51.4%**で、比較対象のClaude Sonnet 5.5（**59.9%**）を下回る。[Terminal‑Bench‑Scienceランキング](https://artificialanalysis.ai/evaluations/terminal-bench-science) · [Carbonモデルカード](https://deepmind.google/models/model-cards/gemini-4-carbon/)

## エンジニアリングとエージェント：答えの半分はハーネスが決める

Terminal‑Bench 4.1の公式ランキングでは、Carbon（high、Antigravity CLI）が**64.5% ± 3.2%**で、全体の実行費用は約**1,400ドル**だ。Claude Opus 5.5とFable 5.2は**65.8%**で並び、GPT‑6.2 Astraは**62.1%**である。Carbonと首位の差は信頼区間の範囲内にある。より興味深いのはシリーズ内の比較だ。Hydrogenは**56.4% ± 3.0%**で約**800ドル**、Argonは**55.5% ± 2.8%**で約**1,100ドル**。高速モデルが約4分の3の費用で6週間前のフラッグシップに追いついた。Neonの**65.2%**はGoogleのモデルカードの数値で、11月19日時点では公式ランキングに掲載されていない。[Terminal‑Bench 4.1ランキング](https://www.tbench.ai/?version=4)

モデルカードをまたいで比べるときは、まず誰が実行したかを確認する必要がある。ArgonのモデルカードのTerminal‑bench 4.0はArgonを**57.4%**、Opus 5.5を**66.4%**としている。2週間後のCarbonのモデルカードはArtificial Analysisが実行したTerminal‑Bench 4.0に切り替え、Argonを**57.1%**、Opus 5.5を**59.6%**としている。同名のベンチマークで同じ比較対象が**6.8ポイント**ずれ、Argon自身の値はほとんど変わらない。ArgonのカードにあるOpusの66.4%を使えば、Carbonの65.2%は首位ではなく、公式4.1ランキングでもCarbonはOpusをわずかに下回る。Terminal‑Bench‑Scienceでも同じことが起きており、GPT‑6 AstraはArgonのカードでは**68.1%**、CarbonのカードのAA実行値では**63.3%**である。[Argonモデルカード](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Carbonモデルカード](https://deepmind.google/models/model-cards/gemini-4-carbon/)

| SWE‑sweep（Neonモデルカード） | mini‑SWE中立ハーネス | 各社独自のハーネス |
| --- | ---: | ---: |
| Gemini 4 Neon | 12.8% | 39.0% |
| Claude Opus 5.5 | 3.6% | 10.1% |
| GPT‑6.2 Sol | 11.6% | 8.3% |

中立的なmini‑SWEハーネスでは、NeonのGPT‑6.2 Solに対するリードは**1.2ポイント**にすぎない。各社独自のハーネスに替えると、その差は**30.7ポイント**に広がる。NeonはAntigravityでmini‑SWEの約3倍、Opus 5.5は自社環境で約2.8倍になり、Solはむしろ下がる。ベンダーのハーネスは製品の一部であり、これらの数値はモデル単体ではなく「モデルとツールチェーン」の組み合わせを測っている。CarbonのモデルカードのSWE‑sweepは1列だけで、ハーネスの表記もない（Carbon **9.6%**、Argon **4.3%**）。そのOpus 5.5の3.6%はNeonのカードのmini‑SWEの値と一致するため、同じ条件と推測される。推測が正しければ、シリーズのmini‑SWEでの推移は4.3%、9.6%、12.8%となる。[Neonモデルカード](https://deepmind.google/models/model-cards/gemini-4-neon/)

ほかのコーディング評価は、より控えめな姿を示す。FrontierSWE 2でCarbonは**61.2%**と、GPT‑6 Astraの**65.5%**、Opus 5.5の**62.3%**を下回る。FrontierCode 2.0ではNeonが**46.2%**で、Opus 5.5の**47.3%**にわずかに届かない。Artificial AnalysisのCoding Agent Indexでは、Neon（xhigh、Antigravity CLI）が**59**で首位、Fable 5.2（xhigh）とOpus 5.5（max）はいずれも**58**で、1タスクあたりの平均費用はそれぞれ**6.86**、**15.47**、**12.61ドル**だ。Neonの優位は主にコストにある。コンピューター操作はシリーズ全体に共通する弱点で、OSWorld‑2.1オフラインサブセットではCarbonの**81.5%**がOpus 5.5の**87.2%**を、Hydrogenの**77.6%**がClaude Sonnet 5.5の**83.9%**を下回る。[Artificial Analysis Neon初回評価](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain) · [Hydrogenモデルカード](https://deepmind.google/models/model-cards/gemini-4-hydrogen/)

知識業務では、ZapierのAutomationBenchがArgonの**51.3%**、Carbonの**53.9%**からNeonの**56.3%**へ上がり、Vending‑Bench 2の模擬経営の残高は**13,718ドル**から**16,843ドル**へ増えた。ArgonはHarveyの法務エージェントベンチマークで**19.6%**を記録し、比較対象はいずれも**6.7%**以下だった。差は大きいが、絶対値を見ればこうした法務タスクが実用水準から遠いことがわかる。名称にも注意が要る。HydrogenのカードにあるAutomationBench‑AA（**76.1%**）はArtificial Analysis版で、Zapier版とは直接比較できない。

## 長文脈とマルチモーダル：合成タスクでは優位、実データは別途検証を

Googleが報告するGraphWalks（256K〜100万トークン、幅優先探索、F1）は、シリーズが最も大きくリードする項目だ。Argon **84.2%**、Carbon **96.2%**、Neon **95.2%**に対し、Opus 5.5は**66.8%**、GPT‑6 Astraは**71.8%**、GPT‑6.2 Solは**80.1%**である。128K以内ではArgonがすでに**99.7%**に達している。GraphWalksは長い入力にグラフの辺を散らばらせ、それをたどらせることで、遠く離れた情報の特定と連結の能力を測る。このリードは超長文入力での検索と連結の強さを示すが、合成されたグラフ課題には意味の矛盾、文書の版、暗黙の前提が含まれない。契約書のレビューや複数文献の統合に使うなら、自分の資料で検証する必要がある。結果はGoogleの自己測定で、第三者による再現はまだない。NeonとHydrogenの同期出力は既定で最大6.4万トークン、バックグラウンドの長時間デコードで最大100万トークンまで出せる。[Argonモデルカード](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Neonモデルカード](https://deepmind.google/models/model-cards/gemini-4-neon/)

マルチモーダルでは一か所後退が見られる。長尺動画理解のLVBenchでArgonは**91.7%**、Carbonから改造されたNeonは**89.0%**だ。Opus 5.5の**83.7%**、GPT‑6.2 Solの**87.6%**はなお上回るものの、自社の前世代より**2.7ポイント**低い。図表理解のChartographyでは、Neonの**73.5%**がSolの**75.1%**を下回る。Artificial AnalysisのGDP.pdf視覚推論評価でも推論設定との関係は単調でなく、Neonはhighで**33.4%**、xhighではかえって**28.0%**に下がり、Carbonのhighは**28.4%**である。[Artificial Analysis Neon初回評価](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain)

## 安全性とアライメント：サイバー能力が高まるほど段階的な公開に

サイバーセキュリティはGoogleが最も強調する能力であり、段階的に公開する理由でもある。脆弱性発見のSEC‑bench Proは、Argonの**83.4%**、Carbonの**88.2%**からNeonの**90.5%**へ上がった。エクスプロイトのExploitGymではCarbonが**54.8%**、Argonが**42.0%**だ。ArgonとCarbonはいずれもFairwindプログラムを通じて信頼できるサイバー防御者に先行提供され、Googleはそれらの防御者と社内チームに、サイバー関連のガードレールを外した版も提供している。[Google Argon発表](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/) · [Google Carbon発表](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/)

Argonのモデルカードは、2026年4月版のフロンティア安全フレームワークに基づく判定を示している。生物学とサイバーセキュリティのLevel 1重要能力レベル（CCL）は否定できず、Googleは安全性の論証を構築したうえで、防護策のもとではCCL未満と評価した。化学、放射線、核の領域は追跡閾値に達しておらず、機械学習研究開発の加速と自動化はいずれもCCLに達していない。Hydrogenは対象を絞った試験の結果、CBRNとサイバーのいずれもCCLには達しなかったが、警戒閾値には達した。Neonのモデルカードは、Argonに対する汎用能力の伸びが「重要な能力変化」の閾値を下回ったため、重要能力評価を一式やり直さず、Argonの判定を引き継いだと記している。注目すべきは、Artificial Analysisの指数でNeonがArgonを**11ポイント**上回っていることだ。Googleがこの閾値をどう設定しているかは、公開情報から外部が確認することはできない。[Argonモデルカード](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Hydrogenモデルカード](https://deepmind.google/models/model-cards/gemini-4-hydrogen/) · [Neonモデルカード](https://deepmind.google/models/model-cards/gemini-4-neon/)

挙動の面では、CarbonとNeonはTerminal‑Bench 4.0での不正成功率がいずれも**0.0%**で、Gray Swanの間接プロンプトインジェクション試験の攻撃成功率も**0.0%**だった（Neonは最高推論設定）。Argonは**0.7%**である。Googleのエージェント誠実性評価では、Carbonがタスクの**92%**、Argonが**70%**に合格した。NeonとHydrogenはそれぞれ**99.2%**と**94%**を報告しているが、同じ問題セットかどうかは発表記事に書かれていない。Hydrogenのモデルカードは代償も開示している。Gemini 3.8 Flashと比べ、正当な理由のない拒否が**5.57ポイント**増え、特にマルチモーダルなプロンプトで目立つという。[Google Carbon一般提供](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/) · [Google Neon発表](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/) · [Google Hydrogen発表](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/)

## コストと選定：受け入れ基準を通ったタスクで価格を測る

Hydrogenは100万トークンあたり入力**1.50**ドル、出力**7.50ドル**で、100万トークンの文脈全体で同一料金だ。Neonは**3 / 15ドル**で、キャッシュ入力は**0.15ドル**。Carbonの導入価格**2 / 10ドル**は11月30日までで、その後は**4 / 20ドル**になる。Argon、Carbon、Neonのキャッシュ入力はいずれも入力価格の5%である。Artificial Analysisの1タスクあたりコストでは、Hydrogenのxhighが**3.16ドル**で54、Argonのhighが**4.97ドル**（導入価格ベース）で50、Neonのxhighが**6.44ドル**で61、Carbonのhighが**7.76ドル**（標準価格ベース）で60となる。NeonのhighはCarbonのhighと同じ60で、1タスクあたりのコストは半分未満だ。[Google Hydrogen発表](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/) · [Artificial Analysis Neon初回評価](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain)

検算できる例を挙げる。キャッシュなしの入力10万トークンと出力1万トークンのリクエスト1回は、ツール料金を除くと、Hydrogenで**0.225ドル**、Neonで**0.45ドル**、Carbonは導入期間中**0.30ドル**、標準価格に戻ると**0.60ドル**になる。まずHydrogenで処理し、失敗したらNeonに回すルーティングを考える。1回あたりのコスト比を1対2に固定すると、エスカレーションの割合が**50%**未満であれば、モデル費用だけで見てNeonを直接使うより安い。Artificial Analysisのxhighでの1タスクあたりコスト（3.16ドル対6.44ドル）を使うと、損益分岐点は約**51%**となる。実際の比較では、再試行、遅延、最終的な合格率も含める必要がある。この算例はコスト構造を説明するためのもので、Folkbenchの実測値ではない。

自動で受け入れ判定できるバッチ処理なら、まず検証すべきはHydrogenだ。AA指数でもTerminal‑BenchでもArgonに並ぶか上回り、価格も安い。日常のコーディングや知識業務では、Neonは二つのモデルカードに共通する評価の大半でCarbonと同等かわずかに上回り（Agents' Last ExamとGraphWalksはわずかに下回る）、11月30日以降は単価もCarbonより安くなる。長期のエンジニアリング、サイバーセキュリティ、ARC‑AGI‑3のような対話型タスクでは、Carbonがなお最も裏付けの厚い選択肢だ。どれを選ぶにしても、推論設定は自分のタスクで実測してほしい。ARC‑AGIとGDP.pdfでは、最高設定が常に最良とは限らない。

Gemini 4の初期の価値は、どれか一つの首位にあるのではない。7週間、同じ知識カットオフで、事後学習と推論設定が能力をどこまで押し上げられるかを示した。AA指数で11ポイント、ARC‑AGI‑3標準ハーネスで15ポイント、FrontierMath Tier 4で17ポイントの向上である。同時に、この路線ではまだ動かせていない領域も浮かび上がった。未解決の数学問題は一桁台にとどまり、コンピューター操作はClaudeに遅れ、標準ハーネスのいくつかのARC‑AGI‑3ゲームはいまもゼロのままだ。ベンダーのモデルカードは比較対象と実行者を選び、独立したランキングは再採点と版の更新を重ねる。これらのスコアが実を結ぶかどうかは、最終的にあなたのタスクをどう受け入れ判定するかにかかっている。
