---
slug: folkbench-pelican-database
translationKey: folkbench-pelican-database
locale: fr
kind: article
title: "Ouverture de Folkbench Pelican Database : l'une des plus vastes et complètes bases de données de pélicans alignée sur models.dev"
description: "Folkbench publie Pelican Database en open source : 507 modèles canoniques de 68 fournisseurs issus de 3 875 sources, 454 SVG originaux, 507 PNG standardisés, alignement models.dev et synchronisation quotidienne automatique."
category: Évaluation
tags: [pelican-benchmark, open-database, model-authenticity, models.dev]
authorId: cang-lin
modelIds: [gpt-6-2-astra, claude-fable-5-2, gemini-4-neon, deepseek-v4-pro]
benchmarkSlugs: []
relatedSlugs: [how-to-score-a-cycling-pelican, how-folkbench-detects-model-degradation, did-the-model-get-dumber]
publishedAt: '2026-11-22'
updatedAt: '2026-11-22'
sources:
  - id: folkbench-pelican-db
    label: Dépôt open source Folkbench/pelican-database
    url: https://github.com/Folkbench/pelican-database
    checkedAt: '2026-11-22'
    claimScope: official
  - id: simon-pelican-tag
    label: Simon Willison, archive du tag pelican-riding-a-bicycle
    url: https://simonwillison.net/tags/pelican-riding-a-bicycle/
    checkedAt: '2026-11-22'
    claimScope: official
  - id: simon-pelican-repo
    label: Dépôt original simonw/pelican-bicycle
    url: https://github.com/simonw/pelican-bicycle
    checkedAt: '2026-11-22'
    claimScope: official
  - id: unclek-pelicanmap
    label: Archive multilingue quotidienne UncleK/pelicanmap
    url: https://github.com/UncleK/pelicanmap
    checkedAt: '2026-11-22'
    claimScope: observed
  - id: models-dev
    label: API publique des identifiants et métadonnées models.dev
    url: https://models.dev/api.json
    checkedAt: '2026-11-22'
    claimScope: official
  - id: folkbench-arena
    label: Folkbench Integrity Monitor
    url: https://folkbench.com/fr/arena
    checkedAt: '2026-11-22'
    claimScope: observed
---

> Lorsqu'un pélican à vélo cesse d'être une capture d'écran éphémère pour devenir une base de référence standardisée, interrogeable et mise à jour quotidiennement couvrant 507 modèles, un test viral devient une véritable infrastructure d'ingénierie pour vérifier l'authenticité des LLM.

Nous publions aujourd'hui en open source **[Folkbench/pelican-database](https://github.com/Folkbench/pelican-database)** — l'une des bases de données SVG et PNG **« pelican riding a bicycle »** les plus vastes et complètes au monde.

Depuis octobre 2024 et le célèbre prompt de Simon Willison *"Generate an SVG of a pelican riding a bicycle"*, des centaines de modèles propriétaires et open-weight ont été testés. Mais ces résultats restaient éparpillés entre billets de blog, fils X, Gists GitHub et galeries, avec des noms hétérogènes et souvent uniquement des captures compressées.

`Folkbench/pelican-database` unifie ces sources en un jeu de données aligné sur **[models.dev](https://models.dev)** et synchronisé chaque jour via GitHub Actions pour alimenter la détection d'authenticité des modèles sur [Folkbench](https://folkbench.com/fr).

---

## 1. En chiffres : pourquoi c'est l'une des bases de pélicans les plus complètes

Au premier instantané public (2026-11-22), `Folkbench/pelican-database` réunit :

| Dimension | Chiffre vérifié | Détails |
| --- | --- | --- |
| **Spécimens candidats agrégés** | **3 875** | Fusion d'UncleK/pelicanmap + les 161 articles, grilles HTML statiques et SVG directs de Simon Willison |
| **Modèles canoniques uniques** | **507** | Dédupliqués depuis **799** alias bruts vers des clés `provider/model_id` |
| **Fournisseurs couverts** | **68** | Laboratoires de pointe et familles open-weight du monde entier |
| **Couverture en `.svg` original** | **454 (89,5 %)** | Code source SVG validé et exploitable plutôt que de simples captures |
| **Rendus `.png` standardisés** | **507 (100 %)** | Rendu uniforme 1024px sur fond blanc via navigateur headless (0 manquant) |
| **Correspondance exacte `models.dev`** | **378 (74,6 %)** | Dont 190 fournisseurs natifs ; les 129 modèles historiques suivent le même schéma |
| **Modèles testés par Simon Willison** | **177** | Marqués `tested_by_simon` et enrichis en `.svg` original dès que disponible |
| **Période couverte** | **2024-10-25 au 2026-11-21** | Plus de deux ans d'évolution du raisonnement spatial et de la génération SVG |

![Évolution réelle des SVG entre les modèles 2024 et les modèles frontière 2026 dans Folkbench Pelican Database pour OpenAI, Anthropic et Google.](/blog/figures/folkbench-pelican-database/evolution-grid.png)

*Figure 1 : Six fichiers `.svg` originaux rendus directement depuis `Folkbench/pelican-database`. En haut (octobre 2024) : `openai/gpt-4o`, `anthropic/claude-3-5-sonnet-20241022` et `google/gemini-1.5-pro-001`. En bas (novembre 2026) : `openai/gpt-6.2-astra`, `anthropic/claude-fable-5-2` et `google/gemini-4-neon`.*

---

## 2. Cinq choix d'ingénierie clés

![Figure 2 : Architecture d'ingestion multi-sources, d'alignement models.dev, de rendu incrémental SHA-256 et de synchronisation quotidienne de Folkbench Pelican Database.](/blog/figures/folkbench-pelican-database/pipeline-architecture-en.svg)

1. **Récupération multi-sources des SVG originaux** : croisement d'[UncleK/pelicanmap](https://github.com/UncleK/pelicanmap)[^unclek-pelicanmap] et des [161 billets de Simon Willison](https://simonwillison.net/tags/pelican-riding-a-bicycle/)[^simon-pelican-tag], décodage de 180 SVG base64 intégrés aux grilles HTML `static.simonwillison.net` et sélection déterministe (**`.svg` réel > test de Simon > prompt classic > effort standard/élevé**).
2. **Alignement `models.dev` et attribution au laboratoire natif** : normalisation des 799 alias via [`models.dev/api.json`](https://models.dev/api.json)[^models-dev] sur 68 fournisseurs (OpenAI 72, Google 64, Alibaba/Qwen 63, Anthropic 30, Meta 21, Mistral 21, DeepSeek 19, Z.AI/GLM 19, xAI 16...) avec conservation complète dans `model_aliases`.
3. **Rendu unifié par navigateur headless** : pipeline multiplateforme Chromium/Edge CDP rendant chaque SVG dans un sandbox `<img>` isolé à 1024px sur fond blanc, avec contrôle d'intégrité sur les 507 PNG.
4. **Livraison immédiate JSON + SQLite** : arborescence `models/<provider>/<model_id>.{svg,png}`, index `catalog.json` et base SQLite `pelicans.sqlite` (4 tables, 2 vues).
5. **Synchronisation incrémentale quotidienne** : `scripts/sync.py` et `.github/workflows/auto-sync.yml` s'exécutent chaque jour à `09:00 UTC` avec empreintes SHA-256 pour ne re-rendre que les ajouts ou mises à jour.

---

## 3. Alimenter la détection d'authenticité des modèles sur Folkbench

Comme détaillé dans [Comment noter un pélican à vélo ?](/fr/blog/how-to-score-a-cycling-pelican/) et [Lancement de la détection de dégradation Folkbench](/fr/blog/how-folkbench-detects-model-degradation/), la substitution discrète de modèles ou la réduction du budget de raisonnement échappent aux simples contrôles HTTP 200. `Folkbench/pelican-database` offre une **ligne de base visuelle ouverte et vérifiable** en complément des sondes dynamiques et références officielles de [Folkbench Integrity Monitor](https://folkbench.com/fr/arena)[^folkbench-arena].

---

## 4. Démarrage rapide

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

## 5. Licence et remerciements (Credits & Acknowledgements)

Nos sincères remerciements à **[Simon Willison](https://simonwillison.net/)**[^simon-pelican-tag][^simon-pelican-repo], **[UncleK / Pelican Map](https://github.com/UncleK/pelicanmap)**[^unclek-pelicanmap], **[models.dev](https://models.dev)**[^models-dev], ainsi qu'à **Tihu**, **Pelican Zoo**, **Museum of Models**, **Pelicans.wtf**, **Pelican Benchmark** et l'ensemble des contributeurs. Les scripts, le schéma et la documentation sont sous **MIT License** ; les sorties SVG/PNG archivées conservent les droits de leurs auteurs d'origine (voir `NOTICE.md`). Dépôt : **[github.com/Folkbench/pelican-database](https://github.com/Folkbench/pelican-database)**[^folkbench-pelican-db].
