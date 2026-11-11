---
slug: api-relay-reliability-checks
translationKey: api-relay-reliability-checks
locale: fr
kind: article
title: Contrôles de fiabilité d’un relais d’API
description: "Une procédure de recette reproductible pour un relais : figer d’abord la requête, puis examiner le temps jusqu’au premier octet, la fin du flux, les classes d’erreurs et les limites des relances."
category: Fiabilité
tags: [api, streaming, opérations]
authorId: mira-zhou
modelIds: []
benchmarkSlugs: []
relatedSlugs: []
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: http-semantics
    label: RFC 9110, sémantique HTTP
    url: https://www.rfc-editor.org/rfc/rfc9110
    checkedAt: '2026-10-02'
    claimScope: official
  - id: server-sent-events
    label: MDN, événements envoyés par le serveur (SSE)
    url: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
    checkedAt: '2026-10-02'
    claimScope: official
---

> Ceci est un modèle opérationnel réutilisable, et non une mesure réalisée par Folkbench sur un relais donné. Seul un instantané publié, accompagné de l’exécution (run), de la date, de l’échantillon et des limites, constitue une mesure Folkbench.

## Objectif

Avant d’intégrer un relais d’API en production, vérifiez le chemin de requête minimal et classez les échecs en quatre catégories : client, protocole, amont ou serveur. Un autre ingénieur doit pouvoir refaire la vérification avec la même requête.

## Avant de commencer

Préparez un échantillon de requête fixe qui ne contient aucune donnée réelle d’utilisateur. Notez l’ID du modèle, le corps de la requête, le mode de réponse (en flux ou non), le délai d’expiration, le budget de relances et l’heure du test. Conservez les identifiants de test dans un gestionnaire de secrets local ou dans une variable d’environnement temporaire ; ne les écrivez jamais dans les journaux, des captures d’écran, le dépôt ou une page publique.

## Étape 1 : figer la requête et le périmètre d’observation

Commencez par la requête la plus simple et vérifiez le code de statut HTTP, les en-têtes et le corps de la réponse au regard de la documentation du fournisseur. Consignez un ID de requête, l’ID du modèle, le code de statut et la durée totale dans la fiche de test. Ne collez jamais un en-tête Authorization complet ni une réponse brute dans un ticket.

Si l’API prend en charge les réponses en flux, lancez séparément une requête en flux. Notez le délai jusqu’au premier fragment de données utile, si les fragments continuent d’arriver, si un événement de fin apparaît, et si le client obtient un résultat explicite à la fermeture de la connexion. SSE est un flux d’événements : analysez-le selon les frontières d’événements, plutôt que de deviner les tokens d’après le découpage des paquets réseau.

## Étape 2 : classer les échecs

Avec des entrées fixes, vérifiez chaque cas :

1. **Erreur client :** un modèle invalide, un paramètre manquant ou une limite de requête dépassée doit produire un résultat 4xx qui permet de localiser le problème.
2. **Erreur d’authentification :** un identifiant expiré ou sans les droits nécessaires doit être refusé clairement, sans divulguer d’autres identifiants ni d’adresses internes.
3. **Erreur en amont :** les délais dépassés, les limitations de débit et les indisponibilités temporaires de l’amont doivent permettre de distinguer ce qui peut être relancé de ce qui ne peut pas l’être.
4. **Échec du flux :** une connexion interrompue, un événement de fin manquant ou un événement JSON partiel doivent emprunter un chemin d’échec, et non être traités comme un texte complet.

Pour chaque échec, conservez au minimum le code de statut, la classe d’erreur, l’heure d’observation côté client et un bref résumé expurgé. Les réponses brutes, les traces et les captures d’écran sont des preuves de processus : conservez-les dans le circuit de stockage objet privé du projet, hors des articles publics et des classements.

## Étape 3 : fixer les limites des relances

Ne relancez automatiquement que les requêtes dotées d’une sémantique d’idempotence explicite ou qui peuvent être répétées sans risque. Fixez un budget total de relances et reliez les ID de la première et de la dernière requête. Ne relancez pas aveuglément les échecs d’authentification, les paramètres invalides ou les refus de modération.

Une grille de recette lisible peut comporter :

| Vérification | Condition de réussite | Action en cas d’échec |
| --- | --- | --- |
| Code de statut | Conforme au contrat documenté | Enregistrer un résumé expurgé et le classer |
| Premier octet | Des données utiles arrivent dans le délai convenu | Examiner le réseau, le routage et l’amont |
| Fin du flux | Un événement de fin valide ou une réponse complète arrive | Signaler une anomalie de connexion |
| Classe d’erreur | 4xx, 5xx et délais dépassés restent distinguables | Ne jamais traiter une erreur comme une sortie du modèle |
| Relance | Le nombre et la durée totale restent traçables | Arrêter une fois le budget épuisé |

## Critères de réussite et nettoyage

Rédigez les critères de réussite avant le test, par exemple : « la requête fixe renvoie un résultat complet lors de trois tentatives indépendantes, le flux comporte un événement de fin explicite et les échecs d’authentification ne sont jamais relancés ». Ne modifiez pas les critères après avoir vu le résultat.

Après le test, révoquez les identifiants temporaires, supprimez les réponses brutes locales et conservez une trace qui ne contient que des résumés, des horodatages et des versions. Pour publier un résultat sur Folkbench, rattachez-le d’abord à une exécution réelle (run/attempt), à un manifeste de preuves et à un instantané de publication ; cet article ne remplace pas ces éléments.
