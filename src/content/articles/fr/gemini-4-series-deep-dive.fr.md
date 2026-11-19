---
slug: gemini-4-series-deep-dive
translationKey: gemini-4-series-deep-dive
locale: fr
kind: benchmark-review
title: "La série Gemini 4 en profondeur : comment raisonnent Argon, Carbon, Hydrogen et Neon"
description: "Nous confrontons les fiches de modèle de Google aux résultats d'Artificial Analysis, Epoch AI, ARC Prize et Terminal-Bench pour analyser les quatre modèles Gemini 4 en intelligence générale, raisonnement abstrait, mathématiques et sciences, ingénierie, contexte long et sécurité, et montrer comment le budget de raisonnement et les conditions d'évaluation modifient les conclusions."
category: Modèles
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

Sur l'Intelligence Index v5.0.1 d'Artificial Analysis, si l'on limite les tokens de sortie consommés par l'indice complet à 110 à 124 millions, les modèles Gemini 4 se classent ainsi : Argon (high) **50**, Hydrogen (high) **51**, Carbon (medium) **58**, Neon (high) **60**. Les quatre partagent une date de coupure des connaissances en mars 2026. D'après les fiches de modèle de Google, Carbon repose sur Argon, et Hydrogen et Neon sont des adaptations de Carbon. Dans l'environnement standard d'ARC‑AGI‑3, Carbon devance Argon de **15,3 points de pourcentage** au même réglage low ; sur FrontierMath Tier 4, Epoch AI relève un écart de **17 points**. Sept semaines, quatre sorties, une seule date de coupure : la série Gemini 4 ressemble à une expérience publique sur le post-entraînement et le budget de raisonnement. Elle rappelle aussi que comparer à budget égal et comparer à nom de réglage égal produit deux classements différents. [Évaluation de lancement de Neon par Artificial Analysis](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain) · [Résultats vérifiés de Carbon par ARC Prize](https://arcprize.org/results/google-gemini-4-carbon) · [Données Epoch sur Carbon](https://epoch.ai/models/gemini-4-carbon)

Google a annoncé Argon le 30 septembre et Carbon le 28 octobre ; Carbon est devenu accessible à tous le 10 novembre, puis Hydrogen est sorti le 12 novembre et Neon le 18. Cet article s'appuie sur les résultats publics disponibles au 19 novembre et constitue une analyse secondaire de Folkbench. Les scores des fiches de modèle et des annonces sont communiqués par Google ; dans ces tableaux, certains scores des modèles de comparaison ont été obtenus par Google et d'autres sont indiqués comme exécutés par des tiers. Les résultats d'Artificial Analysis, d'Epoch AI, d'ARC Prize et de Terminal-Bench appartiennent à chaque évaluateur. Folkbench n'a relancé aucun modèle pour cet article. Les pourcentages suivent la définition de chaque classement, et toute conclusion qui dépend du niveau de raisonnement, de l'environnement d'exécution ou de l'exécutant de l'évaluation ne vaut que dans ces conditions. [Annonce d'Argon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/) · [Google : Carbon disponible](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/) · [Annonce de Neon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/)

## Une base, quatre cycles de post-entraînement

| Modèle | Annonce | Positionnement officiel | Origine selon la fiche | Prix API (entrée / sortie par million de tokens) | Meilleur AA Index v5.0.1 |
| --- | --- | --- | --- | --- | ---: |
| Gemini 4 Argon | 30 sept. | Programmation, travail intellectuel en entreprise, cyberdéfense | Modèle MoE clairsemé entraîné à neuf | 2 / 10 $ en lancement, puis 4 / 20 $ | 50 (high) |
| Gemini 4 Carbon | 28 oct., ouvert à tous le 10 nov. | Tâches de long horizon et cybersécurité | Basé sur Argon | 2 / 10 $ jusqu'au 30 nov., puis 4 / 20 $ | 60 (high) |
| Gemini 4 Hydrogen | 12 nov. | Exécution rapide au quotidien | Adapté de Carbon | 1,50 / 7,50 $ | 54 (xhigh) |
| Gemini 4 Neon | 18 nov. | Équilibre entre profondeur et efficacité | Adapté de Carbon | 3 / 15 $ | 61 (xhigh) |

[Fiche d'Argon](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Fiche de Carbon](https://deepmind.google/models/model-cards/gemini-4-carbon/) · [Fiche d'Hydrogen](https://deepmind.google/models/model-cards/gemini-4-hydrogen/) · [Fiche de Neon](https://deepmind.google/models/model-cards/gemini-4-neon/)

La fiche d'Argon contient la seule description d'architecture de cette génération : un Transformer à mélange d'experts (MoE) clairsemé de grande taille, avec entrée native de texte, d'image et d'audio, entraîné comme un nouveau modèle et non comme un ajustement d'un modèle antérieur. Il a été entraîné sur TPU avec JAX et ML Pathways, et le post-entraînement comprend un ajustement par instructions, des données de préférences humaines et de l'apprentissage par renforcement sur des données de raisonnement en plusieurs étapes, de résolution de problèmes et de démonstration de théorèmes. La fiche de Carbon renvoie à Argon pour l'architecture, les données et le matériel. Celles d'Hydrogen et de Neon indiquent que les deux modèles sont adaptés de Carbon (adapted from) et renvoient à leur tour à Carbon. Les quatre acceptent jusqu'à 1 million de tokens de contexte, entrée et sortie comprises. [Fiche d'Argon](https://deepmind.google/models/model-cards/gemini-4-argon/)

Cette structure détermine la façon de lire les progrès au sein de la famille. La date de coupure n'ayant pas changé, le gain d'Argon à Carbon ne peut pas venir de nouvelles connaissances sur le monde ; il provient plus vraisemblablement de changements dans les données de post-entraînement, l'apprentissage par renforcement et la configuration d'inférence. Google n'a pas publié le nombre de paramètres ni précisé si « adapter » signifie distillation, entraînement prolongé ou autre méthode ; la taille et le parcours d'entraînement d'Hydrogen et de Neon ne peuvent donc pas être déduits des documents publics. Ce qui est clair, c'est que l'essentiel des écarts de capacité au sein de cette génération apparaît après le pré-entraînement.

## Intelligence : le même nom de réglage n'est pas le même budget de raisonnement

À son annonce le 28 octobre, Carbon était premier de l'indice v5.0 avec **59**. Trois semaines plus tard, la réévaluation v5.0.1 lui attribue **60**, mais la première place revient désormais à Claude Fable 5.2 avec **65**, suivi de GPT‑6.2 Astra avec **62** et de Neon avec **61** ; Claude Opus 5.5 obtient **59** et GPT‑6.2 Sol **57**. L'ECI d'Epoch AI place Carbon de façon semblable : **170**, troisième sur 241 modèles suivis, contre **167** pour Argon, **174** pour Fable 5.2 et **169** pour GPT‑6 Astra. Les deux indices reposent sur des méthodes différentes, mais tous deux situent Carbon dans le peloton de tête, juste derrière les leaders actuels. Au 19 novembre, Epoch n'a publié aucune donnée sur Neon, et Hydrogen dispose de résultats individuels mais pas encore d'ECI. Les classements composites bougent d'une semaine à l'autre ; une seule « première place » pèse donc peu. [Annonce de Carbon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/) · [Évaluation de lancement de GPT‑6.2 par Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [Fiche de Neon](https://deepmind.google/models/model-cards/gemini-4-neon/) · [Données Epoch sur Carbon](https://epoch.ai/models/gemini-4-carbon)

La courbe par niveau de raisonnement est plus parlante. Entre parenthèses figurent les tokens de sortie consommés pour l'indice complet.

| AA Index v5.0.1 | Neon | Hydrogen | Carbon | Argon |
| --- | ---: | ---: | ---: | ---: |
| low | 44 (28,3 M) | 27 (20,3 M) | 54 (83,9 M) | non publié |
| medium | 55 (62,9 M) | 41 (54,4 M) | 58 (124 M) | 48 (81,7 M) |
| high (par défaut) | 60 (123 M) | 51 (110 M) | 60 (205 M) | 50 (113 M) |
| xhigh | 61 (283 M) | 54 (304 M) | non proposé | non proposé |

[Neon par niveau](https://artificialanalysis.ai/models/gemini-4-neon) · [Hydrogen par niveau](https://artificialanalysis.ai/models/releases/gemini-4-hydrogen) · [Carbon par niveau](https://artificialanalysis.ai/models/gemini-4-carbon) · [Argon par niveau](https://artificialanalysis.ai/models/gemini-4-argon)

Premièrement, les rendements décroissent vite. Passer Neon de high à xhigh multiplie les tokens de sortie par **2,3** pour **un** point de plus, et le temps par tâche passe de 14,8 à 21,5 minutes ; le même pas coûte à Hydrogen **2,8 fois** plus de tokens pour **trois** points. Deuxièmement, les noms de réglage ne sont pas des unités de budget. Le réglage low de Carbon consomme 83,9 millions de tokens, davantage que le medium de Neon. À budget total comparable, l'ordre est Argon 50, Hydrogen 51, Carbon 58, Neon 60, ce qui en dit plus sur l'effet du post-entraînement que de comparer tous les modèles au réglage par défaut. Cette comparaison a ses limites : les tokens sont des totaux sur l'indice, sans appariement par tâche, et les vitesses de sortie diffèrent. Neon en high produit environ 101 tokens par seconde et Carbon entre 55 et 58 ; un même volume de tokens implique donc des attentes différentes.

Troisièmement, le petit modèle est plus sensible au budget. De low à high, Hydrogen parcourt **24 points**, Neon **16** et Carbon seulement **6**. Pour un modèle rapide comme Hydrogen, un mauvais choix de niveau peut coûter plus cher qu'un changement de modèle.

## Raisonnement abstrait : sur ARC‑AGI‑3, réfléchir plus longtemps n'est pas toujours mieux

| Résultats vérifiés ARC Prize | Gemini 4 Argon | Gemini 4 Carbon |
| --- | ---: | ---: |
| ARC‑AGI‑2, low / medium / high | 42,1 % / 87,1 % / 91,3 % | 49,6 % / 94,2 % / 92,1 % |
| ARC‑AGI‑3 environnement standard, low / medium | 49,8 % / 46,3 % | 65,1 % / 63,9 % |
| ARC‑AGI‑3 environnement standard, high | non noté (19 parties sur 55 terminées) | non noté (30 parties sur 55 terminées) |
| ARC‑AGI‑3 Provider Adapter, low / medium / high | 97,5 % / 97,3 % / 97,3 % | 97,7 % / 99,1 % / 96,9 % |

[Résultats vérifiés d'Argon par ARC Prize](https://arcprize.org/results/google-gemini-4-argon) · [Résultats vérifiés de Carbon par ARC Prize](https://arcprize.org/results/google-gemini-4-carbon)

Trois points ressortent. D'abord, le score n'augmente pas de façon monotone avec le niveau de raisonnement : sur ARC‑AGI‑2, Carbon fait mieux en medium qu'en high ; dans l'environnement standard d'ARC‑AGI‑3, mieux en low qu'en medium, et le meilleur score d'Argon sur ARC‑AGI‑3 est lui aussi en low. Ensuite, le réglage le plus élevé peut échouer purement et simplement dans un environnement interactif. En high, Carbon laissait passer tant de temps entre deux actions que les sessions de jeu ont expiré, et il n'a terminé que 30 parties ; Argon en high n'en a terminé que 19 à cause de problèmes d'API. Dans un questionnaire statique, réfléchir plus longtemps ne coûte que de l'argent ; dans un environnement interactif, cela consomme aussi du temps d'environnement. Enfin, l'écart entre environnements d'exécution dépasse de loin l'écart entre générations. Carbon atteint **99,1 %** avec le Provider Adapter et au mieux **65,1 %** dans l'environnement standard, soit environ **34 points** d'écart. Selon ARC Prize, l'environnement standard ne laisse le modèle conserver que les notes qu'il choisit de garder, tandis que le Provider Adapter préserve un état de raisonnement opaque entre les requêtes et compacte les longues conversations.

Jeu par jeu, les pertes sont concentrées. Dans l'environnement standard, G50T affiche **0,0 %** pour Argon comme pour Carbon en low et en medium, BP35 ne dépasse pas **1,0 %** et TU93 pas **5,3 %** ; avec le Provider Adapter, ces trois jeux sont presque tous à 100 %. Le score global a progressé de 15 points, mais ces jeux n'ont quasiment pas bougé. Une lecture plausible mais non vérifiée est qu'ils bloquent sur la conservation d'un état d'une étape à l'autre plutôt que sur le raisonnement en une étape, et que le gain générationnel s'est surtout produit dans des environnements déjà partiellement résolus. Pour référence, GPT‑6.2 Astra obtient **70,3 %** dans l'environnement standard en max et GPT‑6.2 Sol **54,9 %** ; Carbon se situe entre les deux. [Résultats vérifiés de GPT‑6.2 par ARC Prize](https://arcprize.org/results/openai-gpt-6-2)

## Capacités académiques : calibration des connaissances, mathématiques et exécution scientifique

| Résultats Epoch AI | Gemini 4 Argon | Gemini 4 Carbon | Gemini 4 Hydrogen | GPT‑6 Astra | Claude Fable 5.2 |
| --- | ---: | ---: | ---: | ---: | ---: |
| GPQA Diamond | 96 % | 97 % | 97 % | 96 % | 96 % |
| SimpleQA Verified | 76 % | 78 % | 71 % | 76 % | 94 % |
| FrontierMath Tiers 1–3 (v2) | 86 % | 91 % | 88 % | 94 % | 95 % |
| FrontierMath Tier 4 (v2) | 78 % | 95 % | 88 % | 98 % | 100 % |
| FrontierMath Erdős | 1 % | 3 % | non testé | 3 % | non testé |
| Chess Puzzles | 59 % | 78 % | 60 % | 76 % | 79 % |
| EBR‑bench (Earthborne Rangers) | 65 % | 88 % | 70 % | 76 % | 90 % |

[Données Epoch sur Carbon](https://epoch.ai/models/gemini-4-carbon) · [Données Epoch sur Hydrogen](https://epoch.ai/models/gemini-4-hydrogen)

**Connaissances et calibration.** GPQA Diamond ne départage plus les modèles de pointe : les cinq du tableau se situent entre 96 % et 97 %. Ce qui les distingue davantage, c'est le rappel factuel et ce que fait un modèle quand il ne sait pas. Sur SimpleQA Verified d'Epoch, Carbon obtient **78 %**, soit **16 points** de moins que Fable 5.2. En revanche, sur AA‑Omniscience v1.1 d'Artificial Analysis, Carbon (medium) et Argon (high) ont tous deux un taux d'hallucination de **4 %**, Carbon étant le plus bas du classement. Le dénominateur de cette mesure regroupe toutes les réponses qui ne sont pas entièrement correctes, et le numérateur celles qui sont franchement fausses ; à titre de comparaison, GPT‑6.2 Astra et Sol en max sont à **59 %** et **55 %**. Les deux résultats proviennent de jeux de questions différents et ne peuvent pas être combinés, mais ils vont dans le même sens : Gemini 4 ne retient pas forcément le plus d'informations, mais quand il ne sait pas, il tend à s'abstenir ou à donner une réponse partielle plutôt qu'à inventer. Au moins pour ce type de questions de connaissances, ses réponses affirmatives se trompent moins souvent ; pour une revue de littérature, la couverture reste l'affaire de la recherche documentaire. [Définitions et classement AA‑Omniscience](https://artificialanalysis.ai/evaluations/omniscience)

HLE‑Diamond fait partie des quatre évaluations de l'indice v5.0 où Carbon s'est classé premier. Google indique **71,3 %** pour Neon, **67,9 %** pour Opus 5.5, **64,0 %** pour GPT‑6.2 Sol et **58,8 %** pour Hydrogen ; tous ces chiffres proviennent des fiches de Google. [Synthèse de DeepLearning.AI sur les résultats v5.0](https://www.deeplearning.ai/the-batch/gemini-leads-the-pack-again) · [Fiche de Neon](https://deepmind.google/models/model-cards/gemini-4-neon/)

**Mathématiques.** D'Argon à Carbon, FrontierMath Tier 4 gagne **17 points**, le plus grand saut générationnel de ces données, ce qui rapproche Carbon de GPT‑6 Astra et de Fable 5.2. FrontierMath Erdős ne passe en revanche que de **1 %** à **3 %**. Ses 68 problèmes étaient ouverts à la création du benchmark, et les preuves ou réfutations soumises sont vérifiées en Lean ; le meilleur résultat actuel est de **10 %**, obtenu par GPT‑6.2 Astra. Les problèmes de niveau recherche dont la réponse est connue arrivent à saturation, tandis que les problèmes ouverts restent presque intacts. Le RiemannBench publié par Google passe de **76,0 %** pour Argon et **80,0 %** pour Carbon à **84,0 %** pour Neon, dans la même direction, mais mesuré par le fournisseur lui-même. Les évaluations de casse-tête d'Epoch montrent des gains de post-entraînement comparables : les problèmes d'échecs passent de 59 % à 78 % et EBR‑bench de 65 % à 88 %. Ces tâches exigent une recherche en plusieurs étapes sous contraintes de règles, dans le même sens que le gain dans l'environnement standard d'ARC‑AGI‑3. Le rapide Hydrogen obtient **88 %** sur Tier 4, **10 points** de plus qu'Argon, mais reste proche d'Argon sur les casse-tête et n'atteint que **71 %** de rappel sur SimpleQA Verified. Une explication possible est que les capacités dont les réponses se vérifient automatiquement, comme les mathématiques, se conservent mieux quand on adapte un modèle pour le rendre rapide, alors que les connaissances mémorisées dépendent davantage de la capacité du modèle ; les documents publics ne suffisent pas à le confirmer. [Méthodologie de FrontierMath Erdős](https://epoch.ai/benchmarks/frontiermath-erdos)

**Exécution scientifique.** Terminal‑Bench‑Science 0.1 demande au modèle de livrer dans un terminal des productions de recherche vérifiables par des tests. Dans la fiche de Carbon, avec des exécutions d'Artificial Analysis, Carbon obtient **64,8 %**, Argon **52,9 %**, GPT‑6 Astra **63,3 %** et Opus 5.5 **59,0 %**. La fiche de Neon indique **70,5 %** pour Neon, devant GPT‑6.2 Sol (**68,0 %**) et Opus 5.5 (**63,3 %**). Google présente Neon comme le meilleur de sa catégorie, ce qui vaut au sein du groupe de comparaison qu'il a choisi ; dans le classement complet d'Artificial Analysis, GPT‑6.2 Astra en xhigh atteint **78,6 %**, encore **8,1 points** au-dessus. Hydrogen obtient **51,4 %**, sous sa référence Claude Sonnet 5.5 (**59,9 %**). [Classement Terminal‑Bench‑Science](https://artificialanalysis.ai/evaluations/terminal-bench-science) · [Fiche de Carbon](https://deepmind.google/models/model-cards/gemini-4-carbon/)

## Ingénierie et agents : l'environnement d'exécution décide de la moitié de la réponse

Sur le classement officiel de Terminal‑Bench 4.1, Carbon (high, Antigravity CLI) obtient **64,5 % ± 3,2 %** pour environ **1 400 $** par exécution complète ; Claude Opus 5.5 et Fable 5.2 sont à égalité à **65,8 %**, et GPT‑6.2 Astra obtient **62,1 %**. L'écart entre Carbon et la tête du classement reste dans l'intervalle de confiance. La comparaison interne est plus instructive : Hydrogen obtient **56,4 % ± 3,0 %** pour environ **800 $**, et Argon **55,5 % ± 2,8 %** pour environ **1 100 $** ; le modèle rapide rejoint ainsi le modèle phare d'il y a six semaines pour environ trois quarts du coût. Les **65,2 %** de Neon proviennent de la fiche de Google et n'apparaissaient pas encore au classement officiel au 19 novembre. [Classement Terminal‑Bench 4.1](https://www.tbench.ai/?version=4)

Pour comparer des fiches entre elles, il faut d'abord vérifier qui a exécuté l'évaluation. La ligne Terminal‑bench 4.0 de la fiche d'Argon donne **57,4 %** à Argon et **66,4 %** à Opus 5.5 ; deux semaines plus tard, la fiche de Carbon passe à un Terminal‑Bench 4.0 exécuté par Artificial Analysis et donne **57,1 %** à Argon et **59,6 %** à Opus 5.5. Le même modèle de comparaison varie de **6,8 points** sur un benchmark portant le même nom, alors que le score d'Argon ne bouge presque pas. Avec les 66,4 % d'Opus tirés de la fiche d'Argon, les 65,2 % de Carbon ne seraient pas en tête, et sur le classement officiel 4.1 Carbon reste aussi légèrement derrière Opus. Terminal‑Bench‑Science présente le même schéma : GPT‑6 Astra obtient **68,1 %** dans la fiche d'Argon et **63,3 %** selon les chiffres d'AA dans la fiche de Carbon. [Fiche d'Argon](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Fiche de Carbon](https://deepmind.google/models/model-cards/gemini-4-carbon/)

| SWE‑sweep (fiche de Neon) | Environnement neutre mini‑SWE | Environnement propre à chaque fournisseur |
| --- | ---: | ---: |
| Gemini 4 Neon | 12,8 % | 39,0 % |
| Claude Opus 5.5 | 3,6 % | 10,1 % |
| GPT‑6.2 Sol | 11,6 % | 8,3 % |

Dans l'environnement neutre mini‑SWE, Neon ne devance GPT‑6.2 Sol que de **1,2 point** ; dans l'environnement propre à chaque fournisseur, l'écart grimpe à **30,7 points**. Dans Antigravity, Neon obtient environ trois fois son score mini‑SWE ; Opus 5.5 progresse d'environ 2,8 fois dans son propre environnement, et Sol recule même. L'environnement d'un fournisseur fait partie du produit : ces chiffres mesurent le modèle avec sa chaîne d'outils, pas le modèle seul. La ligne SWE‑sweep de la fiche de Carbon ne comporte qu'une colonne, sans indication d'environnement (Carbon **9,6 %**, Argon **4,3 %**). Le 3,6 % qu'elle donne à Opus 5.5 correspond à la valeur mini‑SWE de la fiche de Neon, ce qui suggère la même configuration ; si c'est le cas, la série progresse de 4,3 % à 9,6 % puis 12,8 % sur mini‑SWE. [Fiche de Neon](https://deepmind.google/models/model-cards/gemini-4-neon/)

D'autres évaluations de programmation dressent un tableau plus mesuré. Sur FrontierSWE 2, les **61,2 %** de Carbon restent derrière les **65,5 %** de GPT‑6 Astra et les **62,3 %** d'Opus 5.5 ; sur FrontierCode 2.0, les **46,2 %** de Neon sont juste sous les **47,3 %** d'Opus 5.5. Sur le Coding Agent Index d'Artificial Analysis, Neon (xhigh, Antigravity CLI) est en tête avec **59**, tandis que Fable 5.2 (xhigh) et Opus 5.5 (max) obtiennent **58**, pour des coûts moyens par tâche de **6,86 $**, **15,47 $** et **12,61 $** ; l'avantage de Neon tient surtout au coût. L'utilisation d'un ordinateur est un point faible constant de la série : sur le sous-ensemble hors ligne d'OSWorld‑2.1, les **81,5 %** de Carbon restent derrière les **87,2 %** d'Opus 5.5, et les **77,6 %** d'Hydrogen derrière les **83,9 %** de Claude Sonnet 5.5. [Évaluation de lancement de Neon par Artificial Analysis](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain) · [Fiche d'Hydrogen](https://deepmind.google/models/model-cards/gemini-4-hydrogen/)

Pour le travail intellectuel, l'AutomationBench de Zapier passe de **51,3 %** pour Argon et **53,9 %** pour Carbon à **56,3 %** pour Neon, et le solde de l'entreprise simulée dans Vending‑Bench 2 passe de **13 718 $** à **16 843 $**. Argon obtient **19,6 %** sur le benchmark d'agents juridiques de Harvey, quand aucun modèle de comparaison ne dépasse **6,7 %** ; l'avance est nette, mais le niveau absolu montre que ces tâches juridiques restent loin d'être livrables. Attention aussi aux noms : l'AutomationBench‑AA de la fiche d'Hydrogen (**76,1 %**) est la version d'Artificial Analysis et n'est pas comparable à celle de Zapier.

## Contexte long et multimodalité : avance sur les tâches synthétiques, les vrais documents exigent leur propre test

GraphWalks (de 256 K à 1 million de tokens, parcours en largeur, F1), d'après Google, est le domaine où la série creuse le plus grand écart : Argon **84,2 %**, Carbon **96,2 %** et Neon **95,2 %**, contre **66,8 %** pour Opus 5.5, **71,8 %** pour GPT‑6 Astra et **80,1 %** pour GPT‑6.2 Sol ; jusqu'à 128 K, Argon atteint déjà **99,7 %**. GraphWalks disperse les arêtes d'un graphe dans une longue entrée et demande au modèle de les parcourir, ce qui mesure sa capacité à repérer et à enchaîner des informations éloignées. Cette avance traduit une recherche et une mise en relation très solides sur des entrées très longues, mais une tâche de graphe synthétique ne comporte ni conflits sémantiques, ni versions de documents, ni prémisses implicites ; pour relire des contrats ou synthétiser plusieurs articles, il faut tester sur ses propres documents. Ces résultats sont ceux de Google, sans reproduction indépendante à ce jour. Neon et Hydrogen produisent par défaut jusqu'à 64 K tokens en mode synchrone, et jusqu'à 1 million par décodage long en arrière-plan. [Fiche d'Argon](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Fiche de Neon](https://deepmind.google/models/model-cards/gemini-4-neon/)

La multimodalité montre un recul. Sur LVBench, consacré à la compréhension de longues vidéos, Argon obtient **91,7 %** et Neon, adapté de Carbon, **89,0 %** : toujours au-dessus d'Opus 5.5 (**83,7 %**) et de GPT‑6.2 Sol (**87,6 %**), mais **2,7 points** sous son propre prédécesseur. Sur Chartography, les **73,5 %** de Neon restent derrière les **75,1 %** de Sol. L'évaluation de raisonnement visuel GDP.pdf d'Artificial Analysis est à nouveau non monotone selon le niveau de raisonnement : Neon obtient **33,4 %** en high mais retombe à **28,0 %** en xhigh, tandis que Carbon en high obtient **28,4 %**. [Évaluation de lancement de Neon par Artificial Analysis](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain)

## Sécurité et alignement : plus de capacités cyber, des déploiements plus échelonnés

La cybersécurité est la capacité que Google met le plus en avant, et la raison de ses déploiements échelonnés. Sur SEC‑bench Pro, qui mesure la découverte de vulnérabilités, les scores passent de **83,4 %** pour Argon et **88,2 %** pour Carbon à **90,5 %** pour Neon ; sur ExploitGym, qui mesure l'exploitation, Carbon obtient **54,8 %** contre **42,0 %** pour Argon. Argon et Carbon ont d'abord été confiés à des cyberdéfenseurs de confiance via le programme Fairwind, et Google fournit aussi à ces défenseurs et à ses équipes internes des versions dépourvues des garde-fous cyber. [Annonce d'Argon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/) · [Annonce de Carbon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/)

La fiche d'Argon présente des déterminations selon le Frontier Safety Framework d'avril 2026 : les niveaux de capacité critique (CCL) de niveau 1 en biologie et en cybersécurité ne peuvent pas être exclus ; Google a donc établi des dossiers de sécurité et jugé le modèle sous le CCL avec garde-fous ; les domaines chimique, radiologique et nucléaire n'atteignent pas le seuil de suivi, et ni l'accélération ni l'automatisation de la R&D en apprentissage automatique n'atteignent leur CCL. Après des tests ciblés, Hydrogen n'atteint le CCL ni en CBRN ni en cyber, mais atteint les seuils d'alerte dans les deux domaines. La fiche de Neon indique que son gain de capacité générale par rapport à Argon reste sous le seuil de « changement de capacité significatif » : l'évaluation complète des capacités critiques n'a donc pas été refaite, et les déterminations d'Argon sont reconduites. Il faut noter que Neon devance Argon de **11 points** sur l'indice d'Artificial Analysis ; la façon dont Google fixe ce seuil ne peut pas être vérifiée à partir des documents publics. [Fiche d'Argon](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Fiche d'Hydrogen](https://deepmind.google/models/model-cards/gemini-4-hydrogen/) · [Fiche de Neon](https://deepmind.google/models/model-cards/gemini-4-neon/)

Côté comportement, Carbon et Neon affichent un taux de triche réussie de **0,0 %** sur Terminal‑Bench 4.0 et un taux de réussite des attaques de **0,0 %** au test d'injection indirecte de prompt de Gray Swan (Neon à son niveau de raisonnement le plus élevé), contre **0,7 %** pour Argon. À l'évaluation d'honnêteté des agents de Google, Carbon réussit **92 %** des tâches et Argon **70 %** ; Neon et Hydrogen annoncent **99,2 %** et **94 %**, sans que les annonces précisent s'il s'agit du même jeu de tâches. La fiche d'Hydrogen reconnaît aussi un coût : par rapport à Gemini 3.8 Flash, les refus injustifiés augmentent de **5,57 points**, surtout avec des prompts multimodaux. [Google : Carbon disponible](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/) · [Annonce de Neon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/) · [Annonce d'Hydrogen](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/)

## Coût et choix : chiffrer les tâches qui passent la validation

Hydrogen coûte **1,50 $** par million de tokens en entrée et **7,50 $** par million en sortie, au même tarif sur toute la fenêtre de 1 million ; Neon coûte **3 / 15 $**, avec l'entrée en cache à **0,15 $** ; le tarif de lancement de Carbon, **2 / 10 $**, s'applique jusqu'au 30 novembre, puis passe à **4 / 20 $**. L'entrée en cache d'Argon, de Carbon et de Neon coûte 5 % du prix d'entrée. D'après le coût par tâche d'Artificial Analysis, Hydrogen en xhigh obtient 54 pour **3,16 $**, Argon en high 50 pour **4,97 $** (au tarif de lancement), Neon en xhigh 61 pour **6,44 $** et Carbon en high 60 pour **7,76 $** (au tarif standard). Neon en high égale les 60 points de Carbon en high pour moins de la moitié du coût par tâche. [Annonce d'Hydrogen](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/) · [Évaluation de lancement de Neon par Artificial Analysis](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain)

Un exemple que l'on peut recalculer : une requête de 100 000 tokens d'entrée hors cache et 10 000 tokens de sortie, sans frais d'outils, coûte **0,225 $** avec Hydrogen, **0,45 $** avec Neon et **0,30 $** avec Carbon pendant la période de lancement, ou **0,60 $** au tarif standard. Imaginons maintenant un routage qui confie d'abord la tâche à Hydrogen et transmet les échecs à Neon. Avec un rapport de coût par appel fixé à 1:2, la dépense en modèles reste inférieure à l'usage direct de Neon tant que moins de **50 %** des tâches sont escaladées ; avec le coût par tâche d'Artificial Analysis en xhigh (3,16 $ contre 6,44 $), le point d'équilibre se situe vers **51 %**. Une comparaison réelle doit aussi intégrer les nouvelles tentatives, la latence et le taux de réussite final. Cet exemple sert uniquement à illustrer la structure des coûts ; ces chiffres ne sont pas des mesures de Folkbench.

Pour les traitements par lots validés automatiquement, Hydrogen est le premier modèle à tester : il égale ou dépasse Argon à la fois sur l'indice d'AA et sur Terminal‑Bench, pour un prix inférieur. Pour la programmation et le travail intellectuel au quotidien, Neon égale ou dépasse légèrement Carbon sur la plupart des évaluations communes aux deux fiches (il est un peu en retrait sur Agents' Last Exam et GraphWalks), et à partir du 30 novembre son prix unitaire est aussi inférieur. Carbon reste le modèle le mieux étayé pour l'ingénierie de long horizon, la cybersécurité et les tâches interactives comme ARC‑AGI‑3. Quel que soit le choix, mesurez les niveaux de raisonnement sur vos propres tâches : sur ARC‑AGI et GDP.pdf, le niveau le plus élevé n'a pas toujours été le meilleur.

La valeur de Gemini 4 à son lancement ne tient pas à une première place isolée. En sept semaines et sur une seule date de coupure, la série montre jusqu'où le post-entraînement et la configuration d'inférence peuvent pousser les capacités : 11 points sur l'indice d'AA, 15 dans l'environnement standard d'ARC‑AGI‑3 et 17 sur FrontierMath Tier 4. Elle signale aussi ce que cette voie n'a pas encore fait bouger : les problèmes mathématiques ouverts restent sous les 10 %, l'utilisation d'un ordinateur reste derrière Claude, et plusieurs jeux d'ARC‑AGI‑3 dans l'environnement standard sont toujours à zéro. Les fiches des fournisseurs choisissent leurs points de comparaison et les exécutants des tests, et les classements indépendants réévaluent et changent de version. Que ces scores se traduisent en résultats dépend, au bout du compte, de la manière dont vos propres tâches sont validées.
