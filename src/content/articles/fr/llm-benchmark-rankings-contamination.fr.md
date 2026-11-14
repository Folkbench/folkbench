---
slug: llm-benchmark-rankings-contamination
translationKey: llm-benchmark-rankings-contamination
locale: "fr"
kind: article
title: "Peut-on faire confiance aux classements de modèles ? Contamination et preuves"
description: "Examiner contamination, budgets, notation et incertitude avec LiveBench, LiveCodeBench, HELM et les méthodes statistiques d’évaluation."
category: "Méthodes d’évaluation"
tags: [benchmarks, raisonnement, fiabilité]
authorId: iris-wu
modelIds: []
benchmarkSlugs: []
relatedSlugs: [mathematical-reasoning-robustness, long-context-effective-understanding]
publishedAt: '2026-11-14'
updatedAt: '2026-11-14'
sources:
  - id: construct-validity
    label: Bean et al., Measuring what Matters，2025
    url: https://arxiv.org/abs/2511.04703v1
    checkedAt: '2026-11-14'
    claimScope: official
  - id: betterbench
    label: Reuel et al., BetterBench，2024
    url: https://arxiv.org/abs/2411.12990v1
    checkedAt: '2026-11-14'
    claimScope: official
  - id: livebench
    label: White et al., LiveBench，révision de 2025
    url: https://arxiv.org/abs/2406.19314v2
    checkedAt: '2026-11-14'
    claimScope: official
  - id: livecodebench
    label: Jain et al., LiveCodeBench，2024
    url: https://arxiv.org/abs/2403.07974v2
    checkedAt: '2026-11-14'
    claimScope: official
  - id: helm
    label: Liang et al., Holistic Evaluation of Language Models
    url: https://arxiv.org/abs/2211.09110v2
    checkedAt: '2026-11-14'
    claimScope: official
  - id: error-bars
    label: Miller, Adding Error Bars to Evals，2024
    url: https://arxiv.org/abs/2411.00640v1
    checkedAt: '2026-11-14'
    claimScope: official
  - id: judge
    label: Zheng et al., Judging LLM-as-a-Judge，2023
    url: https://arxiv.org/abs/2306.05685v4
    checkedAt: '2026-11-14'
    claimScope: official
---

Un classement peut décrire fidèlement un examen sans répondre à la question du modèle adapté à votre travail. Le score dépend des questions, de la version, des consignes, des outils, du budget d’inférence et de l’évaluateur. Sans ces conditions, plusieurs décimales peuvent donner une impression de précision injustifiée.

Cet article analyse la littérature et propose des pratiques à partir de sources vérifiées le 2026-11-14. Folkbench n’a interrogé aucun modèle ni réexécuté de benchmark pour cette publication. Les exemples numériques expliquent les méthodes ; ce ne sont pas des mesures. L’objectif est une chaîne de preuves vérifiable : objet de la mesure, construction des tâches, notation et portée des conclusions.

## Définir la capacité avant de choisir les questions

L’intelligence est trop vaste pour se résumer à une question ou une moyenne. Connaissances spécialisées, induction de règles inédites, code exécutable et planification prolongée exigent des tâches différentes. Un format obligatoire teste aussi le respect des consignes ; une question visuelle ajoute la perception.

[Measuring what Matters](https://arxiv.org/abs/2511.04703v1), qui examine 445 benchmarks, aborde la validité de construit : le score justifie-t-il l’interprétation visée de la capacité ? [BetterBench](https://arxiv.org/abs/2411.12990v1) fournit un cadre d’évaluation de la qualité des benchmarks. Le prestige d’une conférence ou d’une institution aide à sélectionner les lectures, mais ne remplace pas l’examen des tâches et des évaluateurs.

Demander si un modèle résout des problèmes à plusieurs étapes à partir des documents fournis, sans recherche externe, définit une question vérifiable. Elle permet de distinguer manque de connaissances, preuves négligées et erreurs de raisonnement, plus clairement que la question de son intelligence générale.

## La contamination dépasse la mémorisation de l’énoncé

La contamination directe introduit les questions et réponses du test dans l’entraînement. Exercices voisins, corrigés et traces publiques peuvent également aider. Ajuster régulièrement une méthode au classement crée aussi un risque de surapprentissage de l’examen, même sans entraînement direct sur ses questions.

Un bon score sur d’anciennes questions ne prouve donc pas la mémorisation, et une baisse sur de nouvelles questions ne prouve pas la contamination. Difficulté, format et domaine peuvent différer. Il faut contrôler ces facteurs et préciser quelles données d’entraînement restent invisibles. Pour un modèle fermé dont le corpus complet est inaccessible, le statut honnête est inconnu, pas absence de contamination certifiée.

La [version révisée de LiveBench](https://arxiv.org/abs/2406.19314v2) utilise des tâches renouvelées et des réponses vérifiables ; son titre indique Contamination-Limited. [LiveCodeBench](https://arxiv.org/abs/2403.07974v2) collecte des problèmes récents de concours de programmation avec leur date. Ces méthodes limitent certains risques, mais une question publiée peut rejoindre un entraînement ou un réglage ultérieur.

Un jeu dynamique complique aussi la comparaison dans le temps. Si les questions changent chaque mois, l’évolution du score mêle celle du modèle et celle de l’examen. Conservez les versions et comparez un ensemble commun, ou publiez séparément une référence fixe et de nouvelles questions. L’exposition progressive de la référence reste une limite.

## Formaliser des conditions comparables

Un nom peut désigner plusieurs versions, points d’accès et réglages de raisonnement. Enregistrez l’identifiant API réel, la version disponible, la date, les consignes système, l’échantillonnage, la limite de sortie, les outils et les nouvelles tentatives. N’inventez pas les détails non publiés du routage ou du calcul interne.

Deux vues sont utiles : des modèles sous un protocole commun, et chaque système dans sa meilleure configuration avec un budget déclaré. La première facilite l’attribution des différences ; la seconde éclaire l’achat. Un même plafond de tokens n’implique pas un calcul identique, car segmentation et mécanismes internes varient.

[HELM](https://arxiv.org/abs/2211.09110v2) standardise scénarios et conditions en observant exactitude, calibration, robustesse et efficacité. Dans cet esprit, publiez qualité, coût, latence et échecs. Le coût inclut les tentatives infructueuses et les outils, pas seulement la dernière réponse réussie.

## L’évaluateur peut lui aussi se tromper

Lorsqu’une réponse de référence existe, privilégiez des règles vérifiables, tout en contrôlant la référence. Des tests exécutables peuvent oublier des exigences ou imposer une implémentation ; une comparaison textuelle exacte peut rejeter une bonne réponse. Figez la version du correcteur, l’extraction des réponses et la gestion des exceptions.

Les tâches ouvertes demandent davantage de jugement. [Judging LLM-as-a-Judge](https://arxiv.org/abs/2306.05685v4) étudie les biais de position, de longueur et de préférence pour ses propres réponses. Anonymisation, inversion de l’ordre, grille explicite et examen humain des désaccords améliorent le dispositif. Un accord avec les préférences humaines n’est pas une mesure de vérité factuelle.

Séparez réponses incorrectes, erreurs de format, refus, délais dépassés et erreurs du service. Déterminez avant l’exécution leur effet sur le score principal. Calculer l’exactitude seulement sur les réponses reçues en masquant de nombreux dépassements de délai surestime la fiabilité du service.

## Analyser les petits écarts de façon appariée

Imaginons 200 questions communes : A en réussit 160 et B, 156. Cet exemple est hypothétique. L’écart vaut 2 points de pourcentage, mais les totaux ne disent pas s’il est stable. Il faut connaître les questions réussies par chacun et leur indépendance.

[Adding Error Bars to Evals](https://arxiv.org/abs/2411.00640v1) traite comparaisons appariées, questions corrélées et planification. Sur un test commun, analysez la différence par question. Regroupez les variantes d’un même gabarit au lieu de les compter comme observations indépendantes. Répéter les générations estime leur variabilité, sans compenser une couverture thématique insuffisante.

Indiquez un intervalle de confiance à 95% pour l’écart, avec méthode et unité d’échantillonnage. S’il contient zéro, il n’établit ni supériorité ni équivalence. Les comparaisons nombreuses demandent aussi de contrôler la recherche répétée d’un résultat significatif.

## Une fiche de résultat vérifiable

| Élément | Preuves à conserver | Effet d’une absence |
| --- | --- | --- |
| Capacité | Tâche, usage, exclusions | Généralisation injustifiée |
| Données | Version, dates, provenance, groupes | Examens potentiellement différents |
| Exécution | Modèle, consignes, outils, budget, essais | Effets du modèle et du système mêlés |
| Notation | Références, correcteur, revue | Erreurs de notation difficiles à exclure |
| Incertitude | Effectif, écarts appariés, intervalles, répétitions | Petits écarts exagérés |
| Coût et échecs | Dépense totale, temps, types d’échec, couverture | Réussite masquant l’indisponibilité |

Il s’agit d’un format proposé pour les traces éditoriales et expérimentales, pas d’une certification des classements existants. Gardez les données sensibles dans un environnement contrôlé ; publiez des preuves expurgées et un protocole permettant de vérifier les conclusions.

## Utiliser les classements pour réduire les options

Un benchmark crédible identifie des candidats et des limites. Le choix final dépend de vos tâches : échecs inacceptables, coût et latence admissibles, changement de comportement après mise à jour.

Folkbench recommande de présenter les capacités séparément avant un score composé. Si des poids sont utilisés, publiez-les et testez la stabilité du classement sous des variations raisonnables. Une égalité ou l’impossibilité de départager vaut mieux qu’une précision sans fondement.

Consultez les articles sur [la robustesse du raisonnement mathématique](/fr/blog/mathematical-reasoning-robustness/) et [la compréhension effective des longs contextes](/fr/blog/long-context-effective-understanding/).
