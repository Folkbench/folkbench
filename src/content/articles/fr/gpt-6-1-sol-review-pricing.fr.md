---
slug: gpt-6-1-sol-review-pricing
translationKey: gpt-6-1-sol-review-pricing
locale: fr
kind: article
title: "GPT-6.1 Sol : caractéristiques, prix en contexte long et comparaisons publiées"
description: "Caractéristiques officielles, prix catalogue sous et au-delà de 272 000 tokens d’entrée, écarts et coûts par tâche publiés pour GPT-6.1 Sol. Ces chiffres proviennent des pages publiques d’OpenAI, pas d’une mesure de Folkbench."
category: Modèles
tags: [prix, benchmarks, api]
authorId: iris-wu
modelIds: [gpt-6-1-sol, gpt-6-sol, gpt-6-astra, gpt-6-luna]
benchmarkSlugs: []
relatedSlugs: [claude-opus-5-5-review-pricing, claude-sonnet-5-5-review-pricing]
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: gpt-61-announcement
    label: OpenAI, annonce de GPT-6.1 Sol
    url: https://openai.com/index/introducing-gpt-6-1-sol/
    checkedAt: '2026-10-02'
    claimScope: official
  - id: gpt-61-model
    label: OpenAI API, page du modèle GPT-6.1 Sol
    url: https://developers.openai.com/api/docs/models/gpt-6.1-sol
    checkedAt: '2026-10-02'
    claimScope: official
  - id: openai-pricing
    label: Grille tarifaire de l’API OpenAI
    url: https://developers.openai.com/api/docs/pricing
    checkedAt: '2026-10-02'
    claimScope: official
  - id: gpt-61-system-card
    label: OpenAI, addendum à la fiche système de GPT-6.1 Sol
    url: https://deploymentsafety.openai.com/gpt-6-1-sol
    checkedAt: '2026-10-02'
    claimScope: official
---

> Les caractéristiques et les prix ci-dessous proviennent de la page du modèle et de la grille tarifaire d’OpenAI. Les comparaisons proviennent de l’annonce. L’ensemble a été vérifié le 2 octobre 2026. L’annonce donne des écarts et des coûts, pas un tableau de scores absolus que l’on pourrait recopier. Folkbench n’a pas relancé ces évaluations. « Environ un cinquième du coût » décrit le dispositif de test du fournisseur lui-même.

OpenAI présente GPT-6.1 Sol comme une mise à niveau de `gpt-6-sol`. L’ID du modèle dans l’API est `gpt-6.1-sol`. Selon l’annonce, il se rapproche de `gpt-6-astra` en programmation complexe, en utilisation de l’ordinateur et en travail professionnel, pour un cinquième des prix standard d’entrée et de sortie d’Astra. L’entrée en cache coûte 0,10 $ par million de tokens, soit 5 % de l’entrée standard et la moitié du prix de l’entrée en cache de `gpt-6-sol`. Pour la recherche scientifique la plus difficile, l’annonce recommande toujours Astra. `gpt-6-sol` reste dans la grille tarifaire.

L’annonce de GPT-6 Sol et Luna renvoie vers ce modèle dans une mise à jour datée du 29 septembre 2026. Cet article ne prend pas la date d’une autre carte d’actualité du pied de page pour la date d’annonce de GPT-6.1 Sol.

Pour les prix catalogue et les tableaux de benchmarks de Claude, lisez [Opus 5.5](../claude-opus-5-5-review-pricing/) et [Sonnet 5.5](../claude-sonnet-5-5-review-pricing/).

## Caractéristiques publiées

| Élément | GPT-6.1 Sol |
| --- | --- |
| ID du modèle | `gpt-6.1-sol` |
| Fenêtre de contexte | 1 050 000 tokens |
| Entrée maximale | 922 000 tokens |
| Sortie maximale | 128 000 tokens |
| Entrée vers sortie | Texte et images vers texte |
| Date limite des connaissances | 30 avril 2026 |
| `reasoning.effort` | `low`, `medium` (par défaut), `high`, `xhigh`, `max` |
| Niveaux d’effort refusés | `none`, `minimal` |
| Appels d’outils | Responses API |
| Chat Completions | Pris en charge, sans outils |
| Endpoints indiqués comme pris en charge | Chat Completions, Responses, Batch |
| Non pris en charge selon la page du modèle | Realtime, Assistants, fine-tuning, embeddings, génération d’images, vidéo, voix |
| Résidence des données | États-Unis et UE. Le mode Fast n’est pas disponible avec la résidence des données dans l’UE |

L’entrée maximale de 922 000 tokens correspond à la fenêtre de contexte de 1 050 000 moins la sortie maximale de 128 000 : 1 050 000 − 128 000 = 922 000. La page du modèle indique que les tokens de raisonnement sont pris en charge. Les passages cités ici ne donnent pas de formule de facturation distincte pour ces tokens. Établissez votre budget à partir de l’entrée, du cache et de la sortie qui figurent dans le relevé d’utilisation.

## Prix catalogue

### Contexte court et contexte long

Les prix sont en dollars américains par million de tokens. Les deux paliers proviennent de la grille tarifaire de l’API consultée le 2 octobre 2026. Selon cette grille, le contexte court correspond à une entrée inférieure ou égale à 272 000 tokens, et le contexte long à une entrée supérieure à 272 000 tokens. La page du modèle précise qu’au-delà de 272 000, l’entrée et le cache sont facturés à 2 × et la sortie à 1,5 ×, sur l’ensemble de la requête.

| Par 1 M de tokens | 6.1 court | 6.1 long | Sol court | Sol long | Astra court | Astra long |
| --- | --- | --- | --- | --- | --- | --- |
| Entrée | 2 $ | 4 $ | 2 $ | 4 $ | 10 $ | 20 $ |
| Entrée en cache | 0,10 $ | 0,20 $ | 0,20 $ | 0,40 $ | 1 $ | 2 $ |
| Écriture dans le cache | 2,50 $ | 5 $ | 2,50 $ | 5 $ | 12,50 $ | 25 $ |
| Sortie | 10 $ | 15 $ | 10 $ | 15 $ | 50 $ | 75 $ |

Une entrée inférieure ou égale à 272 000 tokens relève du palier court. Dès qu’une requête dépasse 272 000, les tokens précédents sont eux aussi facturés au tarif du palier long. Les tokens excédentaires ne sont pas les seuls à changer de prix. L’entrée en cache de 6.1 coûte la moitié de celle de Sol. L’entrée et la sortie standard coûtent un cinquième de celles d’Astra. L’entrée en cache, elle, ne coûte pas un cinquième de celle d’Astra : en contexte court, l’entrée en cache d’Astra est à 1 $, celle de 6.1 à 0,10 $.

Une écriture dans le cache coûte 1,25 × l’entrée hors cache, soit 2 $ × 1,25 = 2,50 $ pour le palier court et 4 $ × 1,25 = 5 $ pour le palier long. La sortie du palier long vaut 1,5 × celle du palier court : 10 $ × 1,5 = 15 $.

### Autres multiplicateurs de la grille tarifaire

La page du modèle mentionne trois autres multiplicateurs officiels. Le mode Fast coûte 2 × le tarif standard. Batch et Flex sont 50 % moins chers que le tarif standard. Le traitement régional, là où il est disponible, ajoute 10 %. Dans la grille tarifaire du même jour, Batch, Flex et Fast ont chacun leur ligne, et les chiffres correspondent à ces multiplicateurs. En mode Fast et en contexte court, 6.1 coûte par exemple 4 $ en entrée, 0,20 $ en entrée en cache, 5 $ en écriture dans le cache et 20 $ en sortie.

L’annonce indique aussi qu’Ultrafast arriverait dans Codex dans les jours suivants, avec une génération de tokens jusqu’à 8 fois plus rapide que la vitesse standard. La grille tarifaire des modèles phares consultée le 2 octobre 2026 ne contient pas de ligne distincte pour Ultrafast. Pour savoir si un multiplicateur officiel figure déjà sur une facture donnée, reportez-vous au relevé d’utilisation.

Voici trois exemples que l’on peut recalculer au tarif standard. Les deux premières lignes restent sur le palier court. La troisième compte 280 000 tokens d’entrée : toute la requête passe donc au palier long. La ligne avec cache suppose que le relevé d’utilisation compte ces tokens d’entrée comme des succès de cache.

| Requête | Calcul | Montant |
| --- | --- | --- |
| 100 000 en entrée hors cache, 5 000 en sortie | 0,1 × 2 $ + 0,005 × 10 $ | 0,25 $ |
| 100 000 en entrée en cache, 5 000 en sortie | 0,1 × 0,10 $ + 0,005 × 10 $ | 0,06 $ |
| 280 000 en entrée hors cache, 10 000 en sortie | 0,28 × 4 $ + 0,01 × 15 $ | 1,27 $ |

Facturer ces 280 000 tokens au tarif du palier court donnerait 0,28 × 2 $ + 0,01 × 10 $ = 0,66 $. Ce n’est pas le prix de ce palier. Fast, Batch, Flex et le supplément régional ne sont pas appliqués dans ces trois lignes.

## Comment lire les comparaisons de l’annonce

L’annonce donne des écarts et des coûts, pas un tableau de scores absolus. Les lignes ci-dessous ne retiennent que les comparaisons formulées explicitement sur la page. Les phrases sur les coûts décrivent le dispositif de test d’OpenAI.

| Évaluation | Ce qu’affirme l’annonce | Conditions |
| --- | --- | --- |
| DeepSWE v1.1 | À égalité avec Astra ; 6,4 points de pourcentage au-dessus du meilleur score de Sol | Effort de raisonnement plus faible, pour environ un cinquième du coût |
| GDP.pdf | Au-dessus d’Opus 5.5 avec solutions de repli ; proche d’Astra | Réglages de raisonnement testés ; moins de la moitié du coût d’Opus, environ un cinquième de celui d’Astra |
| AutomationBench | 2,2 points de pourcentage au-dessus d’Opus 5.5 ; 4,8 points de pourcentage au-dessus de Sol au même réglage | medium ; environ un tiers du coût d’Opus |
| OSWorld 2.0, ensemble hors ligne | 7 points de pourcentage au-dessus de Sol ; à moins de 2,1 points de pourcentage d’Astra | max ; récompense partielle, v2026.08.08 ; moins de la moitié du coût de Sol, environ un septième de celui d’Astra |
| Terminal-Bench Science 0.1 | Fait plus que doubler le score de Sol ; Astra reste le meilleur score parmi les modèles testés, avec 68,1 % | max ; 6.1 coûte en moyenne 5,47 $ par tâche, Opus 5.5 23,21 $, Astra 23,80 $ |
| Factualité | La part des réponses contenant au moins une erreur factuelle passe de 11,4 % à 7,7 % | low ; à moins de 1,9 point de pourcentage d’Astra |

L’échantillon de factualité se compose de conversations anonymisées dans lesquelles un utilisateur avait signalé une erreur antérieure. Selon l’annonce, ces prompts sont choisis pour être difficiles et ne représentent pas le trafic ordinaire. Les montants en dollars de Terminal-Bench Science sont le coût moyen par tâche publié par OpenAI, pas le prix d’un groupe chez un relais. Le meilleur score scientifique parmi les modèles testés reste celui d’Astra, avec 68,1 %, et l’annonce recommande de garder Astra pour la recherche scientifique la plus difficile.

La même page publie aussi les taux d’échec de tests d’alignement conçus pour être difficiles. Lorsque l’outil de recherche est déjà en panne, la part des exécutions en effort max qui n’en informent pas l’utilisateur est de 2,1 % pour 6.1, 4,9 % pour Sol, 1,5 % pour Astra et 28,7 % pour Luna. L’annonce indique n’avoir observé aucune tentative de contournement d’un système automatisé d’examen de sécurité, comme pour Astra et Sol. Le détail figure dans l’addendum à la fiche système de GPT-6.1 Sol. Ces taux d’échec ne sont pas des taux de panne sur le trafic ordinaire.

L’annonce précise également que les évaluations ont été menées dans un environnement de recherche ou via l’API, dont le prompt système et les outils peuvent différer de ceux de ChatGPT en production. Les chiffres des concurrents sont tirés de rapports publics.

## Deux chemins de requête à ne pas confondre

Les appels d’outils passent par Responses. L’effort par défaut est déjà `medium`. La page du modèle indique que Chat Completions peut transporter du texte sans outils.

```text
# Responses
model: gpt-6.1-sol
reasoning.effort: medium

# Chat Completions, sans outils
model: gpt-6.1-sol
reasoning_effort: medium

# Refusé selon la page du modèle
reasoning.effort: none
reasoning.effort: minimal
tools dans une requête Chat Completions
```

Si vous migrez depuis `gpt-6-sol` ou `gpt-6-luna`, qui acceptent `none`, refaites la comparaison en `low`. Ne laissez pas `none` dans la requête. Les outils, l’utilisation de l’ordinateur, la recherche de fichiers et la recherche web passent par Responses. Chat Completions ne prend que les requêtes sans outils. Parmi les outils Responses listés sur la page du modèle figurent la recherche web, la recherche de fichiers, l’interpréteur de code, l’utilisation de l’ordinateur et MCP. L’entrée d’images passe par un tableau de contenu dans le message utilisateur.

En palier court, l’entrée et la sortie coûtent autant qu’avec `gpt-6-sol`. L’entrée en cache passe de 0,20 $ à 0,10 $. En palier long, la sortie est à 15 $ pour les deux modèles, et l’entrée en cache passe de 0,40 $ à 0,20 $. En passant à 6.1, fixez le nom du modèle et contrôlez celui que renvoie le résultat final. Une réponse servie sous un autre ID ne compte pas comme ce changement.

## Vérifications avant de basculer le trafic

1. Fixez `gpt-6.1-sol`. Le nom du modèle dans le résultat final doit lui aussi correspondre à cet ID.
2. Rejouez un même jeu de données sans informations sensibles en `low`, `medium`, `high`, `xhigh` et `max`. `none` et `minimal` ne figurent pas sur cette fiche.
3. Placez les outils sur Responses. N’envoyez pas d’outils dans la requête Chat Completions.
4. Calculez le prix d’un prompt de 272 000 tokens d’entrée ou moins, puis d’un autre au-delà de ce seuil. Le second est facturé au tarif du palier long pour toute la requête.
5. Établissez d’abord le budget à partir des deux lignes standard. Pour Fast, Batch, Flex et le supplément régional, retenez le montant qui apparaît réellement dans le relevé d’utilisation.
6. Lisez les tokens de cache dans le relevé d’utilisation avant d’utiliser l’exemple de cache ci-dessus.
7. La résidence des données dans l’UE ne peut pas être combinée avec le mode Fast. La page du modèle indique que la résidence aux États-Unis et dans l’UE est prise en charge. Elle ne la présente pas comme un paramètre que l’on pourrait ajouter sur n’importe quelle passerelle.
8. Gardez `gpt-6-astra` pour la recherche scientifique la plus difficile. `gpt-6-sol` figure toujours dans la grille tarifaire.

Une fois le modèle choisi, c’est la fiche de l’annuaire qui indique si un relais propose cet ID, ainsi que la disponibilité et le prix publiés de ce relais. Les tableaux de cet article reprennent les prix catalogue d’OpenAI, pas le prix d’un relais après application du multiplicateur de groupe.
