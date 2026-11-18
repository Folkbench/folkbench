---
slug: gpt-6-2-astra-sol-deep-dive
translationKey: gpt-6-2-astra-sol-deep-dive
locale: fr
kind: benchmark-review
title: "GPT-6.2 Astra et Sol à l’épreuve du raisonnement, de l’ingénierie et de la recherche"
description: "Une analyse des résultats publics de GPT-6.2 sur le raisonnement abstrait, le développement logiciel, la recherche et les coûts."
category: Modèles
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

GPT-6.2 Astra et Claude Fable 5.2 affichent tous deux **174 points** dans l’indice de capacités d’Epoch AI. Dans des tâches ouvertes tirées du travail de la même organisation, Astra obtient **65%** en moyenne et Fable 5.2 **82%**. GPT-6.2 Sol s’approche de son aîné dans deux évaluations d’ingénierie logicielle, avec un coût d’exécution de la suite terminal proche du cinquième. Résoudre un problème, livrer un résultat vérifiable et décider quelles preuves chercher mobilisent des aptitudes distinctes. [Profil Epoch](https://epoch.ai/models/gpt-6-2-astra) · [Évaluation du travail](https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work) · [Terminal-Bench 4.0](https://www.tbench.ai/?version=4)

OpenAI a lancé les deux modèles le 17 novembre 2026. Folkbench analyse les résultats publics disponibles le 18 novembre. Les mesures proviennent des organismes d’évaluation. OpenAI fournit les spécifications et ses propres comparaisons. Folkbench n’a pas relancé les essais. [Annonce d’OpenAI](https://openai.com/index/introducing-gpt-6-2-astra-sol/)

| Évaluation et réglage | GPT-6.2 Astra | GPT-6.2 Sol |
| --- | ---: | ---: |
| Artificial Analysis Intelligence Index v5.0.1, max | 62 | 57 |
| ARC-AGI-2, max | 95.8% | 85.8% |
| ARC-AGI-3, environnement standard, max | 70.3% | 54.9% |
| Terminal-Bench 4.0, Codex, max | 62.1% ± 2.3% | 61.5% ± 2.8% |
| Epoch Automation Reports, Codex | 65% | Non évalué |

[Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [ARC Prize](https://arcprize.org/results/openai-gpt-6-2) · [Terminal-Bench](https://www.tbench.ai/?version=4) · [Epoch Automation Reports](https://epoch.ai/benchmarks/epoch-automation-reports)

## Intelligence, abstraction et conservation de l’état

Le **62** d’Astra chez Artificial Analysis dépasse de **5 points** la génération précédente et reste derrière le **65** de Fable 5.2. Sol égale le **57** de l’ancien Astra à environ **15%** du coût modèle pondéré par tâche. L’indice d’Epoch repose sur une autre échelle. Un modèle bayésien de réponse aux items estime notamment la difficulté et le pouvoir discriminant de chaque benchmark. Pour une application donnée, il faut examiner les familles de tâches et leurs conditions d’exécution. [Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [Méthode de l’ECI](https://epoch.ai/data/eci-documentation/methodology)

En ARC-AGI-2, Astra devance Sol de **10.0 points de pourcentage** dans l’induction de règles sur des grilles. L’écart atteint **15.4 points** en ARC-AGI-3 standard, où l’agent apprend du retour de ses actions. Dans la démonstration publique, l’environnement standard transmet les notes choisies par le modèle. Le Provider Adapter conserve également un état de raisonnement opaque et compacte les longues interactions. Avec cet environnement, Astra atteint **99.8%** et Sol **98.2%** en max. Le **100.0%** d’Astra en xhigh avec l’adaptateur correspond à **56.5%** en xhigh dans l’environnement standard. La manière de conserver les hypothèses et les essais antérieurs change les résultats et les écarts. [Résultats et environnements ARC Prize](https://arcprize.org/results/openai-gpt-6-2)

## Ingénierie et travail professionnel

Sur Terminal-Bench 4.0, avec Codex en max, l’écart observé est de **0.6 point de pourcentage**, avec des intervalles largement superposés. Le coût affiché de la suite est d’environ **1 400 dollars** pour Astra et **300 dollars** pour Sol. Les **132 tâches** de FrontierCode 2.0 demandent des modifications qu’un mainteneur pourrait fusionner, avec des critères de correction, de tests et de périmètre. OpenAI rapporte un écart dans la limite de **0.5 point de pourcentage** en max et un coût de Sol proche d’un cinquième. Dans le Coding Agent Index d’Artificial Analysis, Astra conserve le score de la version précédente, tandis que Sol perd **3 points** face à GPT-6.1 Sol. Les questions SWE-Atlas-QnA-AA reculent de **14 points**, avec davantage d’omissions de faits sur les dépôts. Livrer un correctif et expliquer un dépôt en détail demandent des critères différents. [Terminal-Bench](https://www.tbench.ai/?version=4) · [Cognition](https://cognition.com/frontiercode) · [OpenAI](https://openai.com/index/introducing-gpt-6-2-astra-sol/) · [Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol)

OpenAI rapporte une avance d’Astra de **5.5 points** sur Fable 5.2 dans Agents’ Last Exam, à **5%** du coût annoncé pour Fable. Neuf tâches où Fable a utilisé un modèle de secours sont exclues. L’examen humain d’Epoch inverse l’ordre de **17 points de pourcentage**. Astra reste au-dessus des **56%** obtenus par son prédécesseur. L’échantillon est réduit, avec un seul essai par tâche et par modèle et des environnements différents. Pour déléguer un rapport, le choix des preuves, l’adaptation au public et la révision méritent une évaluation propre. [OpenAI](https://openai.com/index/introducing-gpt-6-2-astra-sol/) · [Méthode et limites d’Epoch](https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work)

## Connaissances, preuves et conception de la recherche

Au lancement, Astra se place derrière Fable 5.2 dans HLE-Diamond et le sous-ensemble difficile de physique de CritPt v2, devant les autres systèmes comparés. En max, AA-Omniscience indique un taux d’hallucination de **59%** pour Astra et **55%** pour Sol. Le numérateur est le nombre de réponses incorrectes. Le dénominateur inclut également les réponses partielles et les abstentions. L’indicateur renseigne sur les erreurs quand la réponse est incertaine. Les références d’une revue de littérature doivent être vérifiées directement. [Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [Définition AA-Omniscience](https://artificialanalysis.ai/evaluations/omniscience)

Aux arrondis affichés par Epoch, Astra atteint **100%** sur FrontierMath Tier 4 v2 contre **98%** pour l’ancien Astra. Sur FrontierMath Erdős, les résultats sont de **10%** et **3%**. Le second test part de 68 problèmes qui étaient ouverts à sa création, avec validation des preuves ou réfutations en Lean. La validité porte sur l’énoncé formel. La fidélité au problème d’origine et la nouveauté de l’apport restent à établir. [Résultats d’Epoch](https://epoch.ai/models/gpt-6-2-astra) · [FrontierMath Erdős](https://epoch.ai/benchmarks/frontiermath-erdos)

Dans les 70 tâches vérifiables de Terminal-Bench-Science 0.1, Astra obtient **78.6%** en xhigh et **78.1%** en max. Quand Epoch lui demande de concevoir une variante d’échecs avec des règles inconnues, Astra change surtout les étiquettes des pièces et conserve des règles équivalentes. Le protocole distingue alors mal la généralisation de la connaissance préalable. Epoch constate aussi peu d’itérations après le premier essai. La fiche d’OpenAI place Astra au seuil High de capacité d’auto-amélioration de l’IA et Sol en dessous, dans le cadre de recherche en IA évalué. [Terminal-Bench-Science](https://artificialanalysis.ai/evaluations/terminal-bench-science) · [Cas d’étude d’Epoch](https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work) · [Fiche système OpenAI](https://deploymentsafety.openai.com/gpt-6-2-astra-sol)

## Coût par livrable accepté

Les deux modèles disposent d’une fenêtre de **1 050 000 tokens**, d’un maximum de **922 000** en entrée et **128 000** en sortie. Pour un contexte court standard, les tarifs en dollars par million de tokens d’entrée non mise en cache, de lecture du cache et de sortie sont **8 / 0.40 / 40** pour Astra et **2 / 0.10 / 10** pour Sol. Au-delà de **272K** tokens en entrée, les tarifs d’entrée et de cache doublent, et celui de sortie est multiplié par **1.5** sur toute la requête. Avec 100 000 tokens d’entrée non mise en cache et 10 000 tokens facturés en sortie, les coûts sont de **1.20 dollar** et **0.30 dollar** hors outils et écritures dans le cache. À coûts fixes de 1:4, commencer par Sol et retenter une fois avec Astra coûte moins cher si moins de **75%** des tâches passent à Astra. Il faut aussi intégrer taux d’acceptation, délais et contrôle humain. Sol est bien placé pour les travaux vérifiables, Astra pour la déduction formelle difficile et la découverte de règles. En recherche ouverte, les deux demandent de contrôler les sources et le protocole. [API Astra](https://developers.openai.com/api/docs/models/gpt-6.2-astra) · [API Sol](https://developers.openai.com/api/docs/models/gpt-6.2-sol)
