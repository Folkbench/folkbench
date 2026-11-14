---
slug: mathematical-reasoning-robustness
translationKey: mathematical-reasoning-robustness
locale: "fr"
kind: article
title: "Le raisonnement résiste-t-il à d’autres nombres ? Évaluer la robustesse mathématique"
description: "GSM-Symbolic et ses limites : variantes contrôlées, statistiques appariées et conditions avec calculatrice pour étudier les capacités mathématiques."
category: "Méthodes d’évaluation"
tags: [mathématiques, raisonnement, benchmarks]
authorId: iris-wu
modelIds: []
benchmarkSlugs: []
relatedSlugs: [llm-benchmark-rankings-contamination, long-context-effective-understanding]
publishedAt: '2026-11-14'
updatedAt: '2026-11-14'
sources:
  - id: gsm-symbolic
    label: Mirzadeh et al., GSM-Symbolic，révision de 2025
    url: https://arxiv.org/abs/2410.05229v2
    checkedAt: '2026-11-14'
    claimScope: official
  - id: irrelevant-context
    label: Shi et al., Large Language Models Can Be Easily Distracted by Irrelevant Context，2023
    url: https://proceedings.mlr.press/v202/shi23a.html
    checkedAt: '2026-11-14'
    claimScope: official
  - id: causal-robustness
    label: Stolfo et al., A Causal Framework to Quantify the Robustness of Mathematical Reasoning with Language Models，2023
    url: https://aclanthology.org/2023.acl-long.32/
    checkedAt: '2026-11-14'
    claimScope: official
  - id: frontiermath
    label: Glazer et al., FrontierMath，révision de 2025
    url: https://arxiv.org/abs/2411.04872v7
    checkedAt: '2026-11-14'
    claimScope: official
  - id: error-bars
    label: Miller, Adding Error Bars to Evals，2024
    url: https://arxiv.org/abs/2411.00640v1
    checkedAt: '2026-11-14'
    claimScope: official
  - id: construct-validity
    label: Bean et al., Measuring what Matters，2025
    url: https://arxiv.org/abs/2511.04703v1
    checkedAt: '2026-11-14'
    claimScope: official
---

Une bonne réponse montre qu’une sortie correspondait au résultat attendu. Si changer les noms, ajuster les nombres ou ajouter une phrase sans incidence déstabilise les performances, il faut localiser l’échec. L’évaluation mathématique exige des conditions contrôlées et un diagnostic, autant que des problèmes difficiles.

Sources vérifiées le 2026-11-14. Cet article présente des méthodes et des expériences proposées. Folkbench n’a exécuté aucun modèle ; les questions et chiffres illustratifs ne sont pas des scores mesurés.

## Plusieurs composantes de la capacité mathématique

Résoudre un problème verbal suppose d’identifier quantités et unités, comprendre les relations, construire une expression, calculer puis respecter le format demandé. Toute erreur peut produire le même zéro. L’exactitude finale mesure la livraison, pas à elle seule le mécanisme de l’échec.

Une expression correcte suivie d’une erreur de multiplication diffère d’une mauvaise relation donnant accidentellement le bon nombre. Examinez expressions et réponses observables, sans confondre explication fluide et trace complète du calcul interne. Avec des outils, contrôlez les appels et l’utilisation des résultats.

## Ce que contrôle GSM-Symbolic

[GSM-Symbolic](https://arxiv.org/abs/2410.05229v2) construit des gabarits symboliques à partir de GSM8K puis génère des instances. Son protocole utilise 100 gabarits et 50 instances par gabarit, soit 5 000 exemples. Nombres, noms, complexité des conditions et informations inutiles donnent différents angles sur la stabilité.

L’idée utile consiste à préserver les relations tout en variant les conditions superficielles, pas à extrapoler un tableau historique à tous les modèles futurs. L’étude porte sur des modèles et protocoles particuliers, pas tous les systèmes de 2026. Séparez les interprétations des auteurs sur les mécanismes et leurs observations comportementales.

Les recherches sur [le contexte non pertinent](https://proceedings.mlr.press/v202/shi23a.html) et un [cadre causal de robustesse mathématique](https://aclanthology.org/2023.acl-long.32/) apportent des approches voisines. Elles motivent des diagnostics contrôlés ; la distraction ne prouve pas l’absence de raisonnement dans toute tâche.

## Construire des variantes valides

Voici un exemple pédagogique original, extérieur aux benchmarks et non testé sur des modèles. Un magasin possède 6 boîtes de 8 crayons et en donne 9. Il reste `6 × 8 − 9 = 39` crayons.

| Variante | Modification | Vérification attendue |
| --- | --- | --- |
| Nom | Remplacer le magasin par une école sans changer les relations | Réponse : 39 |
| Nombres | 7 boîtes, 6 crayons chacune, 8 donnés | Recalcul : 34 |
| Formulation | Réordonner le récit avec des références claires | Réponse : 39 |
| Information inutile | Préciser que les boîtes sont bleues | Réponse : 39 |

Changer les nombres impose de recalculer la référence. Évitez les quantités négatives arbitraires, un partage soudain non divisible ou le passage à des calculs sur de très grands nombres : cela peut changer difficulté ou sens.

L’absence de pertinence mérite une vérification humaine. Ajouter que deux boîtes sont réservées peut conduire à interpréter la question comme portant sur le stock disponible ; l’invariance de la réponse n’est plus évidente. Vérifiez que l’information ne participe pas à la solution. Retirez les variantes invalides avant de regarder les scores, sans ne retenir ensuite que celles défavorables à un modèle.

## Organiser une expérience stratifiée

Choisissez plusieurs relations et difficultés, avec autant de variantes par problème. Modifiez un facteur principal à la fois. Utilisez des questions de développement pour régler consignes et analyseurs ; figez le test formel et cessez de sélectionner les consignes selon ses résultats.

Fixez version, langue, instructions, outils, échantillonnage, budget de sortie et tentatives. Randomisez l’ordre et utilisez un contexte indépendant par question pour éviter les fuites entre variantes. L’apprentissage entre tours exige un protocole distinct.

La taille de l’échantillon dépend de l’effet recherché et du budget. De nombreuses instances d’un gabarit mesurent sa stabilité, pas une grande diversité de raisonnements. Assurez une représentation des relations et des difficultés plutôt que de multiplier les quasi-doublons.

## Rapporter exactitude et stabilité

Présentez l’exactitude par variante et l’écart apparié avec l’original. La proportion de paires entièrement correctes renseigne aussi sur la persistance du succès. Ne sélectionnez pas seulement les originaux réussis pour présenter le sous-ensemble comme comparaison générale. Si vous l’utilisez, précisez dénominateur et règle de sélection.

Si l’exactitude originale était de 80% et celle des variantes de 68%, la baisse serait de **12 points de pourcentage**, soit **15% relativement**. Cet exemple d’unités est hypothétique, pas un résultat de GSM-Symbolic ou de Folkbench. Conservez cette distinction dans toutes les langues.

Les variantes partagent une structure. [Adding Error Bars to Evals](https://arxiv.org/abs/2411.00640v1) traite dépendance et appariement. Une possibilité est de rééchantillonner des groupes complets de gabarits, identiques pour les deux modèles à chaque tirage. Publiez méthode, intervalles à 95% et nombre de générations répétées.

## La calculatrice aide au diagnostic, mais change le système

Séparez une expérience sans outil et une autre avec la même interface de calculatrice et le même plafond d’appels. La seconde mesure un système modèle-outil et nécessite son propre résultat.

Si l’outil améliore nettement les performances, vérifiez si les erreurs précédentes étaient arithmétiques. Cela ne prouve pas que tout le reste du raisonnement soit correct : consignes, chemin de résolution et temps peuvent aussi changer. Expressions, requêtes et usage des résultats affinent le diagnostic.

Pour les démonstrations, une réponse numérique est particulièrement insuffisante. Couvrir tous les cas et éviter les hypothèses non démontrées nécessite un autre protocole. Un vérificateur formel valide une dérivation dans un système donné, mais la fidélité de la formalisation au problème original reste à contrôler.

## Difficulté et robustesse sont deux axes

[FrontierMath](https://arxiv.org/abs/2411.04872v7) utilise des problèmes difficiles élaborés par des spécialistes et des réponses automatiquement vérifiables. Il explore les tâches avancées ; GSM-Symbolic étudie la stabilité sous variations contrôlées. Ils ne se remplacent pas.

Un modèle peut résoudre des problèmes avancés et échouer après une reformulation simple. Un autre peut être stable sans gérer davantage de complexité. Présentez séparément difficulté, variantes et outils, plutôt qu’un quotient intellectuel mathématique.

Le standard proposé réunit réponses correctes, changements contrôlés, erreurs interprétables, unités statistiques adaptées et budgets explicites. Il transforme des solutions impressionnantes en comparaison vérifiable. Voir [la fiabilité des classements](/fr/blog/llm-benchmark-rankings-contamination/) pour les exigences générales.
