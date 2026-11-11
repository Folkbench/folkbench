---
slug: claude-sonnet-5-5-review-pricing
translationKey: claude-sonnet-5-5-review-pricing
locale: fr
kind: article
title: "Claude Sonnet 5.5 : caractéristiques, prix catalogue et benchmarks publiés"
description: "Caractéristiques officielles, prix catalogue identique à Sonnet 5 et tableau de benchmarks publié pour Claude Sonnet 5.5, avec les requêtes qui renvoient une erreur 400 lors de la migration. Ces chiffres ne sont pas une mesure de Folkbench."
category: Modèles
tags: [prix, benchmarks, api]
authorId: iris-wu
modelIds: [claude-sonnet-5-5, claude-sonnet-5, claude-opus-5-5, gpt-6-sol]
benchmarkSlugs: []
relatedSlugs: [claude-opus-5-5-review-pricing, gpt-6-1-sol-review-pricing]
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: sonnet-55-announcement
    label: Anthropic, annonce de Claude Sonnet 5.5
    url: https://www.anthropic.com/claude-sonnet-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-55-overview
    label: Claude Platform, page du modèle Sonnet 5.5
    url: https://platform.claude.com/docs/en/models/sonnet-5-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-55-whats-new
    label: Claude Platform, nouveautés de Sonnet 5.5
    url: https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-55-migration
    label: Claude Platform, migrer vers Sonnet 5.5
    url: https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-5-overview
    label: Claude Platform, page du modèle Sonnet 5
    url: https://platform.claude.com/docs/en/models/sonnet-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
---

> Les caractéristiques, prix catalogue et scores ci-dessous sont repris des pages publiques d’Anthropic, vérifiées le 2 octobre 2026. Folkbench n’a pas relancé ces benchmarks. Les phrases du type « jusqu’à 30 % moins cher » et « plus de 30 % plus rapide » décrivent le dispositif de test du fournisseur lui-même.

Claude Sonnet 5.5 a été annoncé le 28 septembre 2026. C’est le deuxième modèle de la famille Claude 5.5. Son ID dans l’API Claude est `claude-sonnet-5-5`. Anthropic le place à côté d’[Opus 5.5](../claude-opus-5-5-review-pricing/) : les tâches courantes bien délimitées, les corrections de bugs, ainsi que les documents, présentations et feuilles de calcul relèvent de ce modèle ; pour le travail complexe et ouvert qui exige un jugement soutenu, l’annonce elle-même juge Opus 5.5 plus fort. Le prix catalogue est celui de Sonnet 5 : 2 $ par million de tokens d’entrée, 10 $ par million de tokens de sortie et 0,20 $ par million de tokens pour les lectures en cache.

Les deux annonces indiquent que Haiku 5.5 suivra dans les prochaines semaines. Cet article ne donne pas de prix pour un ID qui ne figure encore dans aucune grille tarifaire.

## Caractéristiques publiées

| Élément | Claude Sonnet 5.5 |
| --- | --- |
| ID du modèle dans l’API Claude | `claude-sonnet-5-5` |
| Date d’annonce | 28 septembre 2026 |
| Contexte / sortie synchrone maximale | 1 M / 128 000 tokens |
| Entrée vers sortie | Texte et images vers texte |
| Réflexion | Adaptative, activée par défaut |
| Effort par défaut dans l’API Claude | `high` |
| Effort par défaut dans les applis Claude et Claude Code | `medium` |
| Valeurs d’effort | `low`, `medium`, `high`, `xhigh`, `max` |
| Classe de latence sur la page du modèle | Fast. Il s’agit d’une comparaison au sein de la gamme Claude actuelle, pas d’une mesure en tokens par seconde |
| Date limite fiable des connaissances | Juin 2026 |
| Prompt minimal pouvant être mis en cache | 512 tokens |
| Tokenizer | Le même que Sonnet 5 : un même texte donne le même nombre de tokens |

La page du modèle Sonnet 5 le présente toujours comme legacy et disponible, affiche toujours 2 $ / 10 $ en entrée et en sortie, et indique une date limite fiable des connaissances de janvier 2026. Anthropic s’engage à ne pas le retirer avant le 30 juin 2027. La page des nouveautés de Sonnet 5.5 recommande de passer à 5.5.

Le réglage le plus bas, celui qui désactive la réflexion préalable, est `thinking: {"type": "between_tools"}`. Il n’est accepté qu’avec `low`, `medium` et `high`. Avec `xhigh` et `max`, on revient à la réflexion adaptative. Le guide de migration précise qu’une valeur non par défaut de `temperature`, `top_p` ou `top_k` renvoie une erreur 400.

## Prix catalogue

Les prix sont en dollars américains par million de tokens. La colonne Sonnet 5.5 provient de la page du modèle. L’entrée, la sortie et les lectures en cache d’Opus 5.5 proviennent du tableau comparatif de la même annonce. La page des nouveautés indique que Sonnet 5.5 conserve les prix de Sonnet 5, y compris pour la mise en cache des prompts et le batch. La remise batch est de 50 % sur l’entrée et la sortie.

| Par million de tokens | Sonnet 5.5 | Opus 5.5 selon l’annonce |
| --- | --- | --- |
| Entrée | 2 $ | 4 $ |
| Sortie | 10 $ | 20 $ |
| Lecture en cache | 0,20 $ | 0,20 $ |
| Écriture dans le cache | 5 minutes : 2,50 $ ; 1 heure : 4 $ | Un seul prix de 5 $ sur l’annonce ; la page des nouveautés sépare pour Opus 5.5 le palier de 5 minutes (5 $) et celui d’une heure (8 $) |
| Entrée / sortie en batch | 50 % du prix catalogue | Absent du comparatif de l’annonce |

L’entrée et la sortie coûtent moitié moins que sur Opus 5.5. La lecture en cache est à 0,20 $ sur les deux. L’annonce affiche un seul prix de 5 $ pour l’écriture dans le cache d’Opus 5.5, sans distinguer les paliers de 5 minutes et d’une heure. La page du modèle Sonnet 5.5 sépare ses deux paliers.

Anthropic avance aussi deux affirmations sur la charge de travail : le même travail consomme généralement moins de tokens, et la plupart des tâches coûtent jusqu’à 30 % de moins ; la génération de la sortie est plus de 30 % plus rapide que sur Sonnet 5. Les graphiques de coût ajoutent des comparaisons par tâche d’environ un dixième, un cinquième, un quinzième et un neuvième. Ce sont des résultats obtenus sur leur dispositif de test. Une facture réelle dépend toujours de l’effort, des succès de cache, du nombre de tours d’outils et du passage ou non par le batch.

Trois exemples que l’on peut recalculer à partir du prix catalogue. Chaque requête comprend 100 000 tokens d’entrée de la catégorie indiquée et 5 000 tokens de sortie.

| Requête | Calcul | Montant |
| --- | --- | --- |
| 100 000 en entrée hors cache, 5 000 en sortie | 0,1 × 2 $ + 0,005 × 10 $ | 0,25 $ |
| 100 000 en lecture de cache, 5 000 en sortie | 0,1 × 0,20 $ + 0,005 × 10 $ | 0,07 $ |
| 100 000 en écriture de cache à 5 minutes, 5 000 en sortie | 0,1 × 2,50 $ + 0,005 × 10 $ | 0,30 $ |

La troisième ligne utilise le prix d’écriture à 5 minutes, et non le prix à 1 heure de 4 $. Une écriture à 1 heure revient à 0,1 × 4 $ + 0,005 × 10 $ = 0,45 $.

## Comment lire les benchmarks de l’annonce

Le tableau ci-dessous est celui que l’annonce affichait lors de la vérification du 2 octobre 2026. Un tiret correspond à une case vide sur cette page. Les graphiques de coût de Terminal-Bench 4.0 et CursorBench 4.0 utilisent GPT-5.6 Sol, car OpenAI n’a pas publié ces deux scores pour GPT-6 Sol. Cet article ne remplit pas la colonne GPT-6 Sol avec les points de GPT-5.6 Sol tirés des graphiques.

| Benchmark | Sonnet 5.5 | Sonnet 5 | Opus 5.5 | GPT-6 Sol |
| --- | --- | --- | --- | --- |
| Terminal-Bench 4.0 | 70,6 % | 10,3 % | 66,4 % | — |
| FrontierCode v1.1 (Main) | 46,2 % (max) ; 52,1 % (xhigh) | 42,4 % | 54,4 % | 49,3 % |
| CursorBench 4.0 | 55,5 % | 34,1 % | 57,8 % | — |
| GDPval-AA v2.1 | 1844 | 1449 | 1846 | 1487 |
| AA-Briefcase v1.1 | 1811 | 1359 | 1822 | 1483 |
| Humanity's Last Exam, avec outils | 64,5 % | 54,9 % | 67,7 % | — |
| OSWorld 2.1, partial | 80,1 % | 57,0 % | 81,8 % | — |
| Chartography, sans outils | 61,6 % | 15,6 % | 64,4 % | 53,6 % |

Cette ligne Chartography correspond au score sans outils. La ligne Chartography de l’annonce d’Opus 5.5 est une mesure avec outils, où Opus 5.5 obtient 89,0 %. Ces deux cases ne proviennent pas de la même exécution.

Lisez les notes de bas de page avec les scores. La case Terminal-Bench 4.0 d’Opus 5.5 correspond à xhigh, que l’annonce présente comme le meilleur score de ce modèle. Sur FrontierCode, Sonnet 5.5 en max fait moins bien qu’en xhigh. L’annonce l’explique ainsi : en max, le modèle lançait plus souvent une passe de revue de code répartie entre plusieurs sous-agents, ce qui, dans les cas examinés par Cognition, a entraîné un timeout ou des modifications hors du périmètre de la tâche. L’évaluation pénalise les modifications hors périmètre.

Artificial Analysis a exécuté GDPval-AA et AA-Briefcase sur un déploiement de préversion. Ce déploiement présentait un bug susceptible de dégrader les sorties structurées. L’annonce précise que le bug a été corrigé depuis et que, s’il a eu un effet, il a sous-estimé Sonnet 5.5. Les cases GPT-6 Sol de GDPval-AA, AA-Briefcase et Chartography portent une seconde note : OpenAI avait corrigé un bug qui nuisait à la compréhension des images, et ces scores externes ne reflètent peut-être pas encore le modèle plus récent.

Les graphiques de coût de la même page relèvent d’une autre lecture. L’effort Medium est la valeur par défaut dans les applis Claude. Sur plusieurs benchmarks, Sonnet 5.5 en Low ou en Medium dépasse le meilleur score de Sonnet 5 pour environ un dixième du coût par tâche. L’effort High est la valeur par défaut sur la Claude Platform. Selon l’annonce, FrontierCode en High dépasse d’environ 10 points Sonnet 5 au même réglage, pour environ un quinzième du coût par tâche, et égale le meilleur score de GPT-6 Sol pour environ un cinquième du coût. CursorBench en Low dépasse le meilleur score de Sonnet 5 pour moins d’un dixième du coût. AA-Briefcase en Medium dépasse le meilleur score de Sonnet 5 pour environ un neuvième du coût.

Les 55,5 % et 1844 affichés sont des points du tableau. Les phrases sur le coût viennent d’un autre dispositif. L’annonce indique aussi que, dans l’usage interne d’Anthropic comme dans les tests externes, Opus 5.5 reste plus fort sur le travail complexe et ouvert qui exige un jugement soutenu. Les citations de clients sont des témoignages sélectionnés et ne font pas partie du tableau. L’annonce affirme encore qu’il s’agit du premier Sonnet à terminer Pokémon Rouge à partir des seules captures d’écran. C’est un récit produit, pas une ligne du tableau.

## Migrer depuis Sonnet 5

La page des nouveautés liste cinq changements qui font renvoyer une erreur 400 au code écrit pour Sonnet 5. D’autres requêtes réussissent toujours, mais la forme de la réponse change.

```text
model: claude-sonnet-5-5
max_tokens: 1024
thinking: {"type": "adaptive"}
output_config.effort: medium
# 400 : thinking de type disabled
# 400 : thinking de type enabled avec budget_tokens
# 400 : thinking de type between_tools avec effort xhigh ou max
# 400 : tool_choice any, ou tool_choice tool
# 400 : temperature, top_p ou top_k à une valeur non par défaut
# 400, Claude API et Google Cloud uniquement : outil de type computer_20251124
# 400 : outil advisor avec Opus 4.8, Opus 4.7 ou Sonnet 5 comme conseiller
```

Pour désactiver la réflexion préalable, envoyez `between_tools` et gardez l’effort à `high` ou en dessous. `between_tools` ne peut pas être combiné avec `display`, `budget_tokens` ou `block_binding`. Laissez `tool_choice` à `auto` ou `none`. Pour obtenir des arguments d’outil conformes au schéma, activez l’utilisation stricte des outils ou passez par les sorties structurées, et indiquez dans le prompt quand un outil s’applique.

Sur l’API Claude et Google Cloud, l’utilisation de l’ordinateur (computer use) passe à `computer_toolset_20260801`. La page des nouveautés précise qu’Amazon Bedrock accepte toujours `computer_20251124`.

L’outil advisor accepte Mythos 5.1, Fable 5.1, Mythos 5, Fable 5, Opus 5.5, Opus 5 ou Sonnet 5.5 lui-même. Opus 4.8, Opus 4.7 et Sonnet 5 peuvent conseiller un exécutant Sonnet 5, mais pas un exécutant Sonnet 5.5. Le contenu du conseiller revient chiffré, et le client ne peut pas en lire le texte.

Il existe un dernier cas de 400 pour les comptes créés le 31 août 2026 à 00 h 00 UTC ou après, sur l’API Claude, Amazon Bedrock et Google Cloud. Le rejeu d’un bloc de réflexion de Sonnet 5.5 échoue si le prompt système, la liste d’outils ou un message antérieur a changé après la production du bloc. Gardez la conversation en ajout seul. Lorsque les instructions doivent changer, utilisez un message système en cours de conversation.

Lorsque l’effort est omis, l’API tourne en `high`. À valeur égale, le niveau d’effort ne produit pas la même quantité de réflexion que sur Sonnet 5. La page des nouveautés recommande de refaire un balayage des niveaux d’effort plutôt que de recopier l’ancien réglage. Une boucle d’outils bien délimitée peut commencer à `medium` et passer à `high` quand la tâche est plus longue ou plus difficile. Une conversation sensible à la latence commence à `medium` ou `low`. Les applis Claude et Claude Code sont déjà à `medium` par défaut. La Claude Platform est à `high` par défaut.

Entre deux appels d’outils, un texte de progression de plus d’une ou deux phrases revient à l’intérieur des blocs de réflexion. Avec la valeur par défaut de display, `omitted`, ces blocs ont un texte vide : l’interface reste muette entre les outils alors que la requête réussit. Avec `between_tools`, ce texte revient sous forme de résumé dans le bloc de réflexion, et un rejeu montre au modèle la note complète.

Un bloc de réflexion enregistre le modèle qui l’a produit. La page des nouveautés indique que Sonnet 5.5 lit les blocs de réflexion de Sonnet 5, Opus 4.8, Haiku 4.5 et des modèles antérieurs, mais pas ceux d’Opus 5, Opus 5.5, Fable ou Mythos. Sur l’API Claude et Google Cloud, Opus 5.5 peut lire les blocs de réflexion de Sonnet 5.5, et aucun autre modèle actuel ne le peut. Un bloc que le modèle cible ne sait pas lire est écarté avant que le modèle ne le voie. La requête réussit quand même, et les blocs écartés ne sont pas facturés.

Une requête refusée renvoie HTTP 200 avec `stop_reason` à `"refusal"`. L’annonce indique que ses capacités en cybersécurité sont proches de celles d’Opus 5 : c’est donc le premier Sonnet lancé avec cette classe de garde-fous cyber. Les tâches de cybersécurité à plus haut risque basculent sur Sonnet 5. Les garde-fous en biologie sont les mêmes que pour Sonnet 5. Le développement logiciel courant et la plupart des travaux en sciences de la vie restent hors du champ de ces deux garde-fous ciblés. L’annonce précise aussi que Sonnet 5.5 peut être proposé sans conservation des données.

## Vérifications avant de basculer le trafic

1. Épinglez `claude-sonnet-5-5`. Vérifiez aussi le nom du modèle dans le résultat final. Quand le garde-fou cyber bascule, le modèle qui répond peut être Sonnet 5.
2. Rejouez un même jeu de requêtes sans données sensibles en `low`, `medium`, `high`, `xhigh` et `max`. Notez le taux de réussite, la latence, l’entrée, les lectures en cache, les écritures dans le cache, la sortie et le coût.
3. Placez l’effort dans `output_config.effort`. Ne réglez pas la profondeur de réflexion de ce modèle avec un budget `budget_tokens` manuel.
4. Modifiez les clients qui envoient `disabled`, un choix d’outil forcé, des paramètres d’échantillonnage ou `computer_20251124` avant d’augmenter le volume. L’ancien outil computer sur Bedrock fait exception.
5. Gardez en ajout seul les conversations qui rejouent des blocs de réflexion.
6. Comptez les refus en HTTP 200 séparément des échecs de transport.
7. Vérifiez le montant facturé avec un prompt court et un prompt censé toucher le cache. L’écriture à 5 minutes, l’écriture à 1 heure et la remise batch de 50 % relèvent de grilles tarifaires différentes.
8. Gardez sur `claude-opus-5-5` le travail complexe et ouvert qui exige un jugement soutenu. La page du modèle Sonnet 5 indique toujours `claude-sonnet-5` comme disponible. Pour les paliers de prix d’OpenAI, lisez [GPT-6.1 Sol](../gpt-6-1-sol-review-pricing/).

Une fois le modèle choisi, savoir si un relais propose cet ID, ainsi que la disponibilité et le prix publiés de ce relais, relève de la fiche publiée dans l’annuaire. Cet article ne compare pas les relais.
