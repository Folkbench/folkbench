---
slug: claude-opus-5-5-review-pricing
translationKey: claude-opus-5-5-review-pricing
locale: fr
kind: article
title: "Claude Opus 5.5 : caractéristiques, prix catalogue et benchmarks publiés"
description: "Caractéristiques officielles, prix catalogue et tableau de benchmarks publié pour Claude Opus 5.5, ainsi que les requêtes qui renvoient une erreur 400 lors de la migration. Ces chiffres proviennent des pages du fournisseur, pas d’une mesure de Folkbench."
category: Modèles
tags: [prix, benchmarks, api]
authorId: iris-wu
modelIds: [claude-opus-5-5, claude-opus-5, claude-fable-5-1, claude-sonnet-5-5, gpt-6-astra, gpt-5-6-sol]
benchmarkSlugs: []
relatedSlugs: [claude-sonnet-5-5-review-pricing, gpt-6-1-sol-review-pricing]
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: opus-55-announcement
    label: Anthropic, annonce de Claude Opus 5.5
    url: https://www.anthropic.com/claude-opus-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: opus-55-overview
    label: Claude Platform, page du modèle Opus 5.5
    url: https://platform.claude.com/docs/en/models/opus-5-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
  - id: opus-55-whats-new
    label: Claude Platform, nouveautés d’Opus 5.5
    url: https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-5-overview
    label: Claude Platform, page du modèle Sonnet 5
    url: https://platform.claude.com/docs/en/models/sonnet-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
---

> Les caractéristiques, prix catalogue et scores ci-dessous sont repris d’Anthropic ou des pages publiques qu’elle cite. Ils ont été vérifiés le 2 octobre 2026. Folkbench n’a pas relancé ces benchmarks. Les phrases du type « environ 40 % de moins » et « environ un cinquième du coût » décrivent le dispositif de test du fournisseur lui-même.

Claude Opus 5.5 a été annoncé le 22 septembre 2026. C’est le premier modèle de la famille Claude 5.5. Son ID dans l’API Claude est `claude-opus-5-5`. La page du modèle indique une fenêtre de contexte de 1 M de tokens, une sortie maximale de 128 000 tokens, une réflexion adaptative toujours active, un effort par défaut `medium`, et un prix catalogue de 4 $ par million de tokens d’entrée et de 20 $ par million de tokens de sortie. Les pages publiques n’indiquent ni le nombre de paramètres ni la puissance de calcul utilisée pour l’entraînement.

Trois vérifications sur ces mêmes pages suffisent à le situer. Le prix catalogue est inférieur à celui d’Opus 5, et très inférieur à celui de Fable 5.1, à 10 $ / 50 $. Sur les lignes de programmation et de travail intellectuel publiées dans l’annonce, Opus 5.5 devance Fable 5.1 et Opus 5, et il devance GPT-6 Astra sur la plupart de ces lignes. Deux lignes vont dans l’autre sens : l’estimation ponctuelle d’Astra est en tête sur Terminal-Bench-Science 0.1 et sur l’AutomationBench de Zapier. Pour le travail quotidien bien délimité, lisez [Claude Sonnet 5.5](../claude-sonnet-5-5-review-pricing/). Pour les paliers de prix d’OpenAI en contexte long, lisez [GPT-6.1 Sol](../gpt-6-1-sol-review-pricing/).

## Caractéristiques publiées

| Élément | Claude Opus 5.5 |
| --- | --- |
| ID du modèle dans l’API Claude | `claude-opus-5-5` |
| Date d’annonce | 22 septembre 2026 |
| Fenêtre de contexte | 1 M de tokens |
| Sortie maximale | 128 000 tokens |
| Sortie maximale de l’API Batch | 300 000 tokens, en-tête bêta `output-300k-2026-03-24` |
| Entrée vers sortie | Texte et images vers texte |
| Réflexion | Adaptative, toujours active |
| Effort par défaut | `medium` |
| Valeurs d’effort | `low`, `medium`, `high`, `xhigh`, `max` |
| Niveau de latence sur la page du modèle | Modéré |
| Date limite fiable des connaissances | Juin 2026 |
| Prompt minimal pouvant être mis en cache | 512 tokens |
| Nombre de paramètres | Absent de la page publique du modèle |

La date limite fiable des connaissances est la date jusqu’à laquelle les connaissances intégrées du modèle sont décrites comme les plus solides. Ce n’est pas la fenêtre de contexte. Les fichiers joints à une requête font toujours partie du contexte de cette requête.

Le mode rapide (fast mode) est un réglage de vitesse sur le même ID de modèle. La page des nouveautés le présente comme une préversion de recherche disponible uniquement dans l’API Claude. Une requête définit `speed: "fast"` et envoie l’en-tête bêta `fast-mode-2026-02-01`. L’annonce le facture 8 $ / 40 $ par million de tokens et évoque une vitesse de sortie jusqu’à environ 2,5 fois supérieure. Elle précise que Claude Code et la Claude Platform peuvent l’utiliser. La page des nouveautés indique qu’Amazon Bedrock, Claude Platform on AWS, Google Cloud et Microsoft Foundry ne proposent pas ce mode rapide.

Un budget de réflexion fixé manuellement est refusé. C’est l’effort qui contrôle la profondeur de la réflexion.

## Prix catalogue

Les prix sont en dollars américains par million de tokens. Les prix d’écriture dans le cache à 5 minutes et à 1 heure et les prix batch d’Opus 5.5 viennent de la page des nouveautés. Pour Opus 5, l’écriture dans le cache correspond à la seule cellule « cache writes » du comparatif de l’annonce, qui ne distingue pas les paliers à 5 minutes et à 1 heure. Les prix d’entrée et de sortie de Fable 5.1, Sonnet 5.5 et Haiku 4.5 viennent du comparatif de la page du modèle. Sonnet 5 est toujours marqué comme ancien modèle (legacy), et sa page indique les mêmes prix d’entrée et de sortie que Sonnet 5.5. Un tiret signifie que cet article n’a pas repris cette cellule d’une ligne de prix de première main.

| Pour 1 M de tokens | Opus 5.5 | Opus 5 | Fable 5.1 | Sonnet 5.5 | Haiku 4.5 |
| --- | --- | --- | --- | --- | --- |
| Entrée | 4 $ | 5 $ | 10 $ | 2 $ | 1 $ |
| Sortie | 20 $ | 25 $ | 50 $ | 10 $ | 5 $ |
| Lecture en cache | 0,20 $ | 0,50 $ | — | 0,20 $ | — |
| Écriture dans le cache | 5 min : 5 $ ; 1 h : 8 $ | 6,25 $ | — | 5 min : 2,50 $ ; 1 h : 4 $ | — |
| Batch, entrée / sortie | 2 $ / 10 $ | — | — | 50 % du prix catalogue | — |
| Mode rapide, entrée / sortie | 8 $ / 40 $ | — | — | — | — |

L’entrée hors cache et la sortie baissent de 20 % par rapport à Opus 5, de 5 $ / 25 $ à 4 $ / 20 $. L’annonce indique que la lecture en cache passe de 0,50 $ à 0,20 $, et précise que ces lectures représentent l’essentiel de la facture pour les agents et la programmation. Anthropic avance aussi une affirmation sur la charge de travail : avec les réglages par défaut, une tâche typique coûte environ 40 % de moins qu’avec Opus 5, car le modèle consomme aussi moins de tokens. Ces 40 % décrivent leur propre dispositif de test. Une facture réelle dépend toujours de l’effort, des succès de cache, du nombre de tours d’outils, et du recours ou non au batch ou au mode rapide.

Le traitement par lots coûte la moitié du nouveau prix catalogue. Le mode rapide en coûte le double, et la page des nouveautés le limite à l’API Claude.

Voici trois exemples recalculables à partir du prix catalogue. Chaque cas comprend 100 000 tokens d’entrée de la catégorie indiquée et 5 000 tokens de sortie. La ligne du cache suppose que le relevé d’utilisation compte bien ces tokens comme des lectures.

| Requête | Calcul | Montant |
| --- | --- | --- |
| 100 000 en entrée hors cache, 5 000 en sortie | 0,1 × 4 $ + 0,005 × 20 $ | 0,50 $ |
| 100 000 en lecture de cache, 5 000 en sortie | 0,1 × 0,20 $ + 0,005 × 20 $ | 0,12 $ |
| 100 000 en écriture de cache à 5 minutes, 5 000 en sortie | 0,1 × 5 $ + 0,005 × 20 $ | 0,60 $ |

Une écriture dans le cache à 1 heure se calcule avec 8 $, et non avec les 5 $ ci-dessus. Le prix pratiqué par un relais ou une place de marché cloud ne figure pas dans ce tableau.

## Ce qui change par rapport à Opus 5 et Fable 5.1

| Comportement | Opus 5.5 | Opus 5 | Fable 5.1 |
| --- | --- | --- | --- |
| ID d’API | `claude-opus-5-5` | `claude-opus-5` | `claude-fable-5-1` |
| Contexte / sortie max. | 1 M / 128 000 | 1 M / 128 000 | 1 M / 128 000 |
| Réflexion | Toujours active. `disabled` et un budget manuel renvoient 400 | Active par défaut. `disabled` est accepté avec un effort `high` ou inférieur | Toujours active selon la page du modèle |
| Valeur par défaut si l’effort est omis | `medium` | `high` | `high` |
| Date limite fiable des connaissances | Juin 2026 | Non citée séparément ici | Juin 2026 |
| Prix catalogue entrée / sortie | 4 $ / 20 $ | 5 $ / 25 $ | 10 $ / 50 $ |
| Lecture en cache | 0,20 $ | 0,50 $ | — |

La page des nouveautés regroupe quatre changements qui font échouer le code écrit pour Opus 5. Les trois premiers s’appliquent aussi à Fable 5.1. Remplacer seulement le nom du modèle ne suffit pas à les éviter.

```text
model: claude-opus-5-5
thinking: {"type": "adaptive"}
tool_choice: {"type": "auto"}
output_config.effort: medium
# 400 : thinking de type disabled, ou enabled avec budget_tokens
# 400 : tool_choice any, ou tool_choice tool
# 400, API Claude et Google Cloud uniquement : outil de type computer_20251124
```

Omettez `thinking`, ou envoyez `adaptive` : les deux sont équivalents. Les valeurs `auto` et `none` de `tool_choice` fonctionnent toujours, y compris sur l’endpoint de comptage des tokens. Pour obtenir un JSON conforme au schéma, la page des nouveautés renvoie à l’appel d’outils strict ou aux sorties structurées, et recommande d’indiquer dans le prompt quand un outil s’applique.

Dans l’API Claude et sur Google Cloud, remplacez `computer_20251124` par `computer_toolset_20260801` et supprimez l’ancien en-tête bêta d’utilisation de l’ordinateur. La page des nouveautés indique qu’Opus 5.5 sur Amazon Bedrock accepte toujours `computer_20251124`. Une intégration qui utilise déjà le nouvel ensemble d’outils n’a pas à modifier son code pour ce changement.

La quatrième erreur 400 concerne le rattachement des blocs de réflexion. Pour les comptes créés à partir du 31 août 2026 à 0 h 00 UTC, dans l’API Claude et sur les plateformes cloud, rejouer un bloc de réflexion d’Opus 5.5 renvoie 400 si le prompt système, la liste d’outils ou un message antérieur a été modifié après la production de ce bloc. La méthode documentée est un historique en ajout seul. Quand les instructions doivent changer, utilisez un message système en cours de conversation. Les comptes plus anciens doivent activer explicitement cette même vérification.

Trois comportements changent même lorsque la requête aboutit. Omettre l’effort revient désormais à `medium`. La même omission donnait `high` sur Opus 5. À effort égal, Opus 5.5 tend à réfléchir davantage par tour qu’Opus 5, surtout en `xhigh` et `max`. Une valeur d’effort reprise d’une ancienne configuration correspond à un nouveau niveau de coût, et `max_tokens` doit laisser de la place aux blocs de réflexion.

Le texte écrit entre les appels d’outils revient à l’intérieur des blocs de réflexion. Avec la valeur d’affichage par défaut `omitted`, ces blocs ont un texte vide. Une interface qui diffusait ce texte en flux pour montrer la progression devient muette, alors que la requête aboutit. Un produit qui a besoin de ces lignes de progression définit une valeur d’affichage et sélectionne les blocs selon leur `type`, et non selon leur position.

Un classifieur biologique fonctionne en parallèle du classifieur de cybersécurité. Un prompt qui pousse le modèle à recopier son raisonnement dans la réponse visible peut être refusé au titre de `reasoning_extraction`. La page des nouveautés indique aussi que les graphiques et les captures d’écran sont lus plus précisément avant même l’ajout d’un outil de vision : les prompts écrits pour compenser une lecture d’image plus faible méritent donc d’être rejoués séparément.

Une requête refusée renvoie HTTP 200 avec un `stop_reason` égal à `"refusal"`. Ce n’est pas une erreur de transport. Sa facturation dépend de la catégorie de refus, et elle compte toujours dans les limites de débit.

## Comment lire les benchmarks de l’annonce

Le tableau ci-dessous est celui publié dans l’annonce, tel que vérifié le 2 octobre 2026. Sauf mention contraire en note, Opus 5.5 utilise la réflexion adaptative avec l’effort max. Terminal-Bench 4.0 fait l’objet de cette note : Opus 5.5 y est en `xhigh`, GPT-6 Astra en `high`, et chaque cellule correspond au meilleur score publié du modèle. Les chiffres d’Astra et de GPT-5.6 Sol sont repris des rapports d’OpenAI. Les garde-fous de production étaient actifs. Lorsqu’ils intervenaient, les tâches de cybersécurité étaient accomplies par Opus 4.8, et les tâches de biologie et de développement de LLM de pointe par Opus 5. Anthropic indique que cela abaisse les scores d’Opus 5.5.

| Benchmark | Opus 5.5 | Fable 5.1 | Opus 5 | GPT-6 Astra | GPT-5.6 Sol |
| --- | --- | --- | --- | --- | --- |
| Terminal-Bench 4.0 | 66,4 % | 55,8 % | 52,3 % | 57,9 % | 37,3 % |
| FrontierCode v1.1 (Main) | 54,4 % | 50,3 % | 48,0 % | 53,3 % | 47,5 % |
| CursorBench 4.0 | 57,8 % | 51,8 % | 46,6 % | — | 41,7 % |
| GDPval-AA v2.1 | 1846 | 1735 | 1708 | 1542 | 1588 |
| AutomationBench | 40,0 % | 31,4 % | 26,9 % | 41,4 % | 28,8 % |
| Humanity's Last Exam, avec outils | 67,7 % | 65,6 % | 63,6 % | 57,2 % | — |
| Terminal-Bench-Science 0.1 | 58,7 % | 52,6 % | 29,0 % | 64,6 % | 22,4 % |
| OSWorld 2.1, partial | 81,8 % | 80,7 % | 74,0 % | — | — |
| Chartography, avec outils | 89,0 % | 88,4 % | 83,4 % | — | — |

Lisez les écarts à la lumière des marges d’erreur publiées. Sur Terminal-Bench 4.0, Opus 5.5 affiche ±2,6 points et les autres modèles Claude entre ±1,6 et ±2 points. L’écart entre 66,4 % et les 57,9 % d’Astra, comme avec les 55,8 % de Fable, dépasse ces marges. La même note indique que le classement public affiche Opus 5 à 51,8 % et que leur configuration reproduit 52,3 %, ce qui reste dans le bruit.

Sur Terminal-Bench-Science, les marges vont de ±3,5 à ±5 points selon le modèle. L’écart entre les 64,6 % d’Astra et les 58,7 % d’Opus 5.5 est proche de l’amplitude de ces marges. L’estimation ponctuelle place Astra devant. Le classement public affiche Opus 5 à 30,0 %, et leur configuration reproduit 29,0 %.

AutomationBench est géré par Zapier. Comme cette exécution n’avait pas de modèle de repli, une intervention des garde-fous comptait comme un échec. Anthropic estime que le score en conditions réelles serait plus élevé. Les 40,0 % publiés face aux 41,4 % d’Astra constituent un résultat serré, et l’estimation ponctuelle place Astra devant. GDPval-AA v2.1 est un Elo établi sur des tâches professionnelles réelles dans 44 métiers : Opus 5.5 à 1846, Fable 5.1 à 1735, Opus 5 à 1708, Sol à 1588 et Astra à 1542.

Les graphiques de coût de la même page publient une seconde paire de scores à l’effort par défaut `medium` : FrontierCode 54,6 % et CursorBench 52,5 %. Le tableau comparatif publie 54,4 % et 57,8 %. Considérez-les comme deux chiffres obtenus avec deux réglages d’effort. La note du graphique précise aussi qu’avec un effort medium, FrontierCode dépasse le meilleur score d’Astra (53,3 %) pour environ un cinquième du coût par tâche, et que Terminal-Bench égale Astra pour environ 40 % du coût. Ce sont des affirmations de coût par tâche qui portent sur le propre dispositif de test d’Anthropic.

La phrase sous le tableau est celle à retenir : dans l’usage qu’en fait Anthropic elle-même, l’écart entre Opus 5.5 et Fable 5.1 est plus étroit que ne le suggèrent les scores, et à ce niveau, les écarts de benchmark sont un guide moins fiable pour les tâches réelles. Les citations de clients dans l’annonce sont des témoignages sélectionnés. Elles peuvent suggérer quoi rejouer. Elles ne font pas partie du tableau.

## Vérifications avant de basculer le trafic

1. Fixez `claude-opus-5-5`. Vérifiez aussi le nom du modèle dans le résultat final. Quand les garde-fous interviennent, une tâche de cybersécurité peut être accomplie par Opus 4.8, et une tâche de biologie ou de développement de LLM de pointe par Opus 5. Le modèle demandé dans le journal peut malgré tout indiquer `claude-opus-5-5`.
2. Rejouez un même jeu de tests sans données sensibles en `low`, `medium`, `high`, `xhigh` et `max`. Notez le taux de réussite, le temps écoulé, l’entrée, les lectures en cache, les écritures dans le cache, la sortie et le coût.
3. N’envoyez ni `thinking: {"type": "disabled"}` ni budget manuel avec `budget_tokens`. Définissez l’effort explicitement. S’il est omis, il vaut ici `medium`, et non le `high` d’Opus 5.
4. N’utilisez que `auto` ou `none` pour `tool_choice`. Dans l’API Claude et sur Google Cloud, l’utilisation de l’ordinateur passe à `computer_toolset_20260801`.
5. Gardez en ajout seul les conversations qui rejouent des blocs de réflexion. Les comptes créés à partir du 31 août 2026 reçoivent une erreur 400 si le préfixe qui précède un bloc de réflexion d’Opus 5.5 change.
6. Comptez les refus en HTTP 200 séparément des erreurs de transport.
7. Vérifiez le montant facturé avec un prompt court et un prompt censé toucher le cache. L’écriture à 5 minutes, l’écriture à 1 heure, le batch et le mode rapide relèvent de quatre grilles tarifaires différentes.
8. Pour le travail bien délimité qui n’a pas besoin de cette boucle Opus, restez sur la grille à 2 $ / 10 $ de [Sonnet 5.5](../claude-sonnet-5-5-review-pricing/). Sur les tâches d’agents scientifiques et les workflows métier de Zapier, les estimations ponctuelles publiées placent Astra devant.

Une fois le modèle choisi, la question de savoir si un relais propose cet ID, ainsi que la disponibilité et le prix publiés par ce relais, relèvent de sa fiche dans l’annuaire. Cet article ne compare pas les relais, et il ne transforme pas le prix catalogue d’un fournisseur en prix facturé par un relais.
