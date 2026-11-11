---
slug: grok-4-7-review-pricing
translationKey: grok-4-7-review-pricing
locale: fr
kind: article
title: "Grok 4.7 : caractéristiques, prix en contexte long et benchmarks publiés"
description: "Nom officiel du modèle, contexte de 500 000 tokens, prix catalogue sous et au-delà de 200 000 tokens de prompt, et tableau de benchmarks publié pour Grok 4.7. Ces chiffres proviennent des pages publiques de xAI, pas d’une mesure de Folkbench."
category: Modèles
tags: [prix, benchmarks, api]
authorId: iris-wu
modelIds: [grok-4-7, grok-4-6]
benchmarkSlugs: []
relatedSlugs: [gpt-6-1-sol-review-pricing, claude-opus-5-5-review-pricing, claude-sonnet-5-5-review-pricing]
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: grok-47-announcement
    label: xAI, annonce de Grok 4.7
    url: https://x.ai/news/grok-4-7
    checkedAt: '2026-10-02'
    claimScope: official
  - id: grok-47-guide
    label: Documentation xAI, Grok 4.7
    url: https://docs.x.ai/developers/grok-4-7
    checkedAt: '2026-10-02'
    claimScope: official
  - id: grok-47-model
    label: Documentation xAI, page du modèle Grok 4.7
    url: https://docs.x.ai/developers/models/grok-4.7
    checkedAt: '2026-10-02'
    claimScope: official
  - id: xai-pricing
    label: Grille tarifaire de l’API xAI
    url: https://docs.x.ai/developers/pricing
    checkedAt: '2026-10-02'
    claimScope: official
---

> Les caractéristiques et les prix ci-dessous proviennent de la documentation et de la grille tarifaire de xAI. Les benchmarks proviennent de l’annonce du 21 septembre 2026. L’ensemble a été vérifié le 2 octobre 2026. Folkbench n’a pas relancé ces évaluations. Les prix et les scores des concurrents qui figurent dans l’annonce sont les chiffres imprimés sur cette page, pas une nouvelle vérification, le même jour, des grilles tarifaires d’OpenAI ou d’Anthropic.

xAI a annoncé Grok 4.7 le 21 septembre 2026. Le nom du modèle dans l’API est `grok-4.7`. La documentation le présente comme un modèle de pointe pour la programmation, les tâches agentiques et le travail intellectuel. Le corps de l’annonce indique qu’il est servi au même prix et à la même vitesse que [Grok 4.6](https://x.ai/news/grok-4-6). Le titre de la même page affirme pourtant qu’il est environ deux fois plus rapide, pour environ la moitié du prix des modèles comparables. Les deux phrases figurent dans l’annonce. Cet article ne transforme pas ce titre en une nouvelle grille tarifaire.

Trois pages publiques peuvent être recoupées. Le tableau récapitulatif de la documentation indique une fenêtre de contexte de 500 000 tokens, une date limite des connaissances en mai 2026 et, en contexte court, des prix de 2 $ en entrée et 6 $ en sortie. La grille tarifaire passe aux tarifs de contexte long dès qu’un prompt atteint 200 000 tokens, et ces tarifs s’appliquent à toute la requête. Le tableau de benchmarks de l’annonce place `grok-4.7` à côté de Grok 4.6, GPT-5.6 Sol et Fable 5.1. Pour les paliers de contexte long d’OpenAI, voir [GPT-6.1 Sol](https://folkbench.com/fr/blog/gpt-6-1-sol-review-pricing). Pour Claude, voir [Opus 5.5](https://folkbench.com/fr/blog/claude-opus-5-5-review-pricing) et [Sonnet 5.5](https://folkbench.com/fr/blog/claude-sonnet-5-5-review-pricing).

## Caractéristiques publiées

| Élément | Grok 4.7 |
| --- | --- |
| Nom du modèle | `grok-4.7` |
| Date d’annonce | 21 septembre 2026 |
| Fenêtre de contexte | 500 000 tokens |
| Date limite des connaissances | Mai 2026 |
| Entrée vers sortie | Texte et image vers texte |
| Limite de sortie dans le tableau récapitulatif | Indiquée comme sans limite de sortie texte, sans nombre maximal de tokens de sortie distinct |
| Raisonnement | `low`, `medium`, `high` (par défaut), `xhigh` |
| API | Responses, Chat Completions |
| Outils cités dans la documentation | Appel de fonctions, recherche web, recherche X, exécution de code |
| Batch API sur la page du modèle | Non prise en charge |

La page du modèle fixe l’effort par défaut à `high`. La documentation recommande `prompt_cache_key` sur la Responses API et l’en-tête `x-grok-conv-id` sur Chat Completions. Sans cette clé, précise la page, une conversation atterrit souvent sur un serveur dont le cache est encore froid, et l’entrée est facturée au prix hors cache. Responses renvoie aussi `reasoning.encrypted_content`, même lorsque la requête ne le liste pas dans `include`. Dans les échanges à plusieurs tours, renvoyez ces éléments de raisonnement tels quels dans le prochain `input`. La documentation indique que rien ne change sur ce point pour Chat Completions.

La documentation cite l’API xAI, l’endpoint régional américain `https://us.api.x.ai/v1`, Grok Build, Cursor, ainsi que les passerelles OpenRouter, Vercel et Cloudflare. C’est le modèle par défaut de Grok Build. L’endpoint américain mentionne pour l’instant `grok-4.7` et `grok-4.6`. La présence de cet ID chez un relais relève de la fiche publiée dans l’annuaire, pas d’une affirmation de cet article.

## Prix officiels

### Contexte court et contexte long

Les prix sont en USD par million de tokens, d’après la grille tarifaire de l’API consultée le 2 octobre 2026. Selon cette grille, le seuil du contexte long est un prompt de 200 000 tokens. Dès qu’une requête l’atteint, tous les tokens de cette requête sont facturés au tarif du contexte long. `grok-4.7` et `grok-4.6` affichent les six mêmes valeurs dans cette grille.

| Par 1 M de tokens | 4.7 court | 4.7 long | 4.6 court | 4.6 long |
| --- | --- | --- | --- | --- |
| Entrée | 2 $ | 4 $ | 2 $ | 4 $ |
| Lecture en cache | 0,50 $ | 1 $ | 0,50 $ | 1 $ |
| Sortie | 6 $ | 12 $ | 6 $ | 12 $ |

Un prompt de moins de 200 000 tokens relève du palier court. À partir de la requête qui atteint 200 000 tokens, les tokens précédents sont eux aussi facturés au tarif du palier long. Le palier long coûte le double du palier court : 2 $ × 2 = 4 $, cache 0,50 $ × 2 = 1 $ et sortie 6 $ × 2 = 12 $. Une lecture en cache coûte un quart du prix d’entrée du même palier : 2 $ × 0,25 = 0,50 $ et 4 $ × 0,25 = 1 $.

Trois exemples au seul tarif standard. Les deux premiers restent en contexte court. Le troisième compte 280 000 tokens d’entrée : toute la requête passe donc au palier long. La ligne avec cache suppose que le relevé d’utilisation compte cette entrée comme un succès de cache.

| Requête | Calcul | Montant |
| --- | --- | --- |
| 100 000 en entrée hors cache, 5 000 en sortie | 0,1 × 2 $ + 0,005 × 6 $ | 0,23 $ |
| 100 000 en lecture en cache, 5 000 en sortie | 0,1 × 0,50 $ + 0,005 × 6 $ | 0,08 $ |
| 280 000 en entrée hors cache, 10 000 en sortie | 0,28 × 4 $ + 0,01 × 12 $ | 1,24 $ |

Facturer ces 280 000 tokens au tarif court donnerait 0,28 × 2 $ + 0,01 × 6 $ = 0,62 $. Ce n’est pas le prix de ce palier. Fast, le supplément régional américain et les appels d’outils ne sont pas inclus dans ces trois lignes.

### Autres multiplicateurs de la grille tarifaire

L’endpoint régional américain `https://us.api.x.ai/v1` garde l’inférence aux États-Unis et facture les tokens à 1,1 fois les tarifs mondiaux, soit un supplément de 10 %. La grille tarifaire publie ces résultats pour `grok-4.7` : sous 200 000 tokens, 2,20 $ en entrée, 0,55 $ en lecture en cache, 6,60 $ en sortie ; au-delà de 200 000 tokens, 4,40 $ en entrée, 1,10 $ en lecture en cache, 13,20 $ en sortie. Le multiplicateur de 1,1 s’applique à l’entrée, à la sortie et aux lectures en cache, palier long compris. La remise sur le cache est appliquée en premier.

Grok 4.7 Fast est le même modèle, servi sur une infrastructure plus rapide. La documentation indique que les requêtes standard coûtent 2 fois plus cher et les requêtes en contexte long 1,5 fois plus cher. Il n’est disponible que dans Cursor et Grok Build, et facturé via la formule souscrite sur ces services. Il n’est pas proposé sur l’API publique de xAI, et l’offre gratuite de Grok Build ne l’inclut pas. La grille tarifaire publie pour Fast 4 $ en entrée, 1 $ en cache et 12 $ en sortie sous 200 000 tokens, puis 6 $ en entrée, 1,50 $ en cache et 18 $ en sortie au-delà de 200 000 tokens. Le trio 4 $ / 1 $ / 12 $ correspond au double du palier court. Le trio 6 $ / 1,50 $ / 18 $ correspond à 1,5 fois le palier long. L’annonce dit aussi qu’une variante rapide offre deux fois la vitesse de sortie pour deux fois le prix. Elle ne mentionne pas ce palier à 1,5 fois. Pour la facture, utilisez le tableau de la documentation.

La page du modèle indique que la Batch API n’est pas prise en charge. `grok-4.7` ne figure pas dans la liste des remises batch de la grille tarifaire. Les modèles qui y sont nommés bénéficient d’une remise batch de 20 %. La page des tarifs décrit aussi le Priority Processing pour les requêtes texte : un `service_tier` confirmé à `priority` est facturé 2 fois, après application de la remise sur le cache. La page du modèle Grok 4.7 ne comporte pas de ligne Priority distincte. Pour savoir si une requête a été facturée avec ce multiplicateur, regardez le `service_tier` de la réponse.

La documentation facture séparément les outils côté serveur. La recherche web coûte 5 $ pour 1 000 appels. La recherche X est facturée par élément récupéré : 5 $ pour 1 000 posts et 10 $ pour 1 000 profils. L’exécution de code coûte 5 $ pour 1 000 appels. Ces frais s’ajoutent au prix des tokens. La page du modèle affiche 150 requêtes par seconde et 50 000 000 tokens par minute, avec la région `us-east-1`. Le guide précise aussi que les limites de débit et les prix en vigueur pour une équipe figurent sur cette page du modèle : ces deux chiffres ne constituent donc pas un engagement valable pour tous les comptes.

## Comment lire les benchmarks de l’annonce

L’annonce publie un tableau comparatif. Ce n’est pas une mesure de Folkbench. Les colonnes sont Grok 4.7 xHigh, Grok 4.6 High, GPT-5.6 Sol Max et Fable 5.1 Max. Les deux lignes de prix reprennent les prix catalogue d’entrée et de sortie imprimés sur cette page. La case DeepSWE de `grok-4.7` indique 71,0 %, et l’astérisque précise que ce score a été obtenu en effort high, et non en xHigh comme l’indique l’en-tête de colonne.

| Élément | Grok 4.7 | Grok 4.6 | GPT-5.6 Sol | Fable 5.1 |
| --- | --- | --- | --- | --- |
| Entrée / 1 M | 2 $ | 2 $ | 4 $ | 10 $ |
| Sortie / 1 M | 6 $ | 6 $ | 20 $ | 50 $ |
| CursorBench 4.0 | 46,3 % | 40,4 % | 41,7 % | 51,8 % |
| DeepSWE v1.1 | 71,0 % (high) | 65,2 % | 72,7 % | 70,0 % |
| EEBench | 64,0 % | 53,0 % | 39,4 % | 56,4 % |
| AA Briefcase v1.1 | 1 657 | 1 546 | 1 487 | 1 678 |
| Terminal-Bench 4.0 | 37,6 % | 20,3 % | 37,3 % | 57,9 % |
| Harvey Legal Agent Benchmark | 19,6 % | 15,8 % | 2,5 % | 6,7 % |
| HealthBench Professional | 56,7 % | 48,5 % | 60,5 % | 62,1 % |

L’annonce affirme aussi que Grok 4.7 devance Grok 4.6 sur GDPval comme sur AA Briefcase, et qu’il se situe au niveau des autres modèles de pointe. Le graphique GDPval ne donne pas de scores absolus dans le texte : cet article n’en ajoute donc aucun. Le score AA Briefcase est le 1 657 du tableau ci-dessus.

La section consacrée à la sécurité publie deux chiffres. Le benchmark de biosécurité de LatchBio est à 62,4 %. Sur HackerBench v0.3, 3,3 % des prompts à double usage jugés risqués ont été laissés passer. La page affirme que le travail de sécurité légitime est rarement bloqué, sans publier de taux de refus pour les requêtes légitimes. Certains partenaires en cybersécurité peuvent demander un accès red team réservé aux invités. Ces chiffres décrivent les tests de l’annonce. Ce ne sont pas des taux d’échec sur le trafic ordinaire.

## Vérifications avant de basculer le trafic

1. Fixez `grok-4.7`. Le nom du modèle dans le résultat final doit correspondre à cet ID. La page de l’annuaire utilise `grok-4-7`.
2. L’effort par défaut est `high`. Indiquez explicitement `low`, `medium`, `high` ou `xhigh` lorsque vous les comparez.
3. Envoyez `prompt_cache_key` dans les échanges à plusieurs tours, ou `x-grok-conv-id` sur Chat Completions. Renvoyez tel quel le raisonnement chiffré retourné par Responses.
4. Calculez séparément le prix des prompts de moins de 200 000 tokens et de ceux qui atteignent ce seuil. Les seconds sont facturés au tarif du palier long pour toute la requête.
5. L’endpoint régional américain facture 1,1 fois le tarif. Fast n’est pas disponible sur l’API publique. N’appliquez pas les multiplicateurs de 2 fois ou de 1,5 fois à une facture d’API ordinaire.
6. La page du modèle indique que la Batch API n’est pas prise en charge. Les appels d’outils s’ajoutent, aux prix par millier d’appels indiqués dans la documentation.
7. Les colonnes des concurrents dans le tableau de l’annonce reprennent les prix et les scores imprimés sur cette page. Les 71,0 % de DeepSWE ont été obtenus en high, pas en xHigh.
8. La présence de cet ID chez un relais, ainsi que sa disponibilité et le prix facturé à ce moment-là, relèvent de l’annuaire publié. Les tableaux de cet article reprennent les prix catalogue de xAI, pas le prix d’un relais après application du multiplicateur de groupe.
