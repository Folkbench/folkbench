---
slug: ai-api-relay-stability-guide
translationKey: ai-api-relay-stability-guide
locale: fr
kind: article
title: "Ne croyez plus aux 99 % de disponibilité affichés : les pièges des relais d’API IA que nous avons subis, et notre façon de tester la stabilité"
description: "Des faux 200 aux flux tronqués en passant par les blocages nocturnes : comment nous définissons les métriques et les tests de stabilité qui déterminent réellement l’expérience en production."
category: Fiabilité
tags: [stabilité, disponibilité, SSE]
authorId: mira-zhou
modelIds: []
benchmarkSlugs: []
relatedSlugs: [ai-api-relay-software-engineering-evaluation-guide, ai-chinese-writing-models-api-relay-user-submission, llm-api-relay-gray-industry-user-submission]
publishedAt: '2026-09-17'
updatedAt: '2026-09-17'
sources:
  - id: google-sre-golden-signals
    label: Livre Google SRE, chapitre Monitoring Distributed Systems
    url: https://sre.google/sre-book/monitoring-distributed-systems/
    checkedAt: '2026-10-02'
    claimScope: official
  - id: otel-docs
    label: Documentation OpenTelemetry
    url: https://opentelemetry.io/docs/
    checkedAt: '2026-10-02'
    claimScope: official
  - id: whatwg-sse
    label: Standard HTML, Server-sent events
    url: https://html.spec.whatwg.org/multipage/server-sent-events.html
    checkedAt: '2026-10-02'
    claimScope: official
  - id: wilson-score
    label: Intervalle de score de Wilson
    url: https://en.wikipedia.org/wiki/Binomial_proportion_confidence_interval
    checkedAt: '2026-10-02'
    claimScope: editorial
---

> **En bref.** Sur la route de la production, le relais d’API est une étape que la plupart des développeurs ne peuvent pas éviter. Le site promet parfois « 99,9 % rapide et stable » et un « canal dédié à haute concurrence ». Une fois connecté, on découvre vite que l’envers du décor est tout autre. Voici comment notre équipe est passée d’achats à l’instinct à des contrôles automatisés, et le cadre de test que nous appliquons avant de payer ou d’intégrer un relais.

## 1. Les pannes qui nous ont imposé la méthode

Le système multicritère qui suit n’est pas né d’un éclair de génie. Nous l’avons payé en argent, en incidents de production et en plaintes d’utilisateurs.

### 1. Faux 200 OK et troncature silencieuse

Nos premiers contrôles automatisés étaient simples. Un script Python envoyait une requête POST au relais toutes les 5 minutes. Un HTTP `200` accompagné d’un peu de texte suffisait pour considérer le service comme sain.

L’agent de production tournait depuis moins de deux jours quand le support a été submergé. Les utilisateurs signalaient que le modèle s’arrêtait au milieu d’une phrase et que la logique du texte généré ne tenait pas debout.

Les journaux étaient pires que les tickets. Certains relais renvoyaient encore `200 OK` alors que le pool en amont était épuisé (limitation de débit 429 ou échec d’authentification 401), que la passerelle avait expiré (504) ou qu’un nœud avait planté. En plein flux SSE, ils inséraient discrètement `data: [DONE]` pour clore le tour, ou glissaient `{"error": "rate limit exceeded"}` dans le JSON en le faisant passer pour la réponse du modèle. Un moniteur qui ne regardait que le code d’état s’est fait entièrement berner par ce faux 200.

### 2. Le blocage nocturne, et un premier token qui n’arrivait pas

Après cela, nous avons ajouté des sondes actives jour et nuit. En journée, le temps de réponse moyen restait autour de 2 secondes, et le tableau de bord avait bonne mine. Au pic nocturne, les expirations et les abandons d’utilisateurs grimpaient.

La plupart de ces relais n’offraient pas de canal officiel direct. Ils mélangeaient des pools de comptes américains et des proxys répartis dans plusieurs régions. Aux heures de bureau nord-américaines ou au pic du soir en Chine, la montée en concurrence saturait le chemin. Dans le pire des cas, la réponse complète se terminait toujours en 4 secondes environ, mais le premier token (TTFT) mettait 12 bonnes secondes à arriver. Les utilisateurs fixaient une zone vide, puis partaient.

Ces deux incidents ont fixé la règle : un ping, ou deux requêtes lancées à la légère, ne constituent pas un test d’un protocole d’IA ni d’un flux.

## 2. Trois versions du système de test

### 1.0 Essais à l’aveugle et instinct

- **Ce que nous faisions :** envoyer quelques prompts dans une interface web, ou écrire à la main un script de 10 requêtes, puis juger à l’œil la vitesse et la qualité des réponses.
- **Limite :** l’échantillon est minuscule et bruité. Une forte concurrence ou une déconnexion rare n’apparaît qu’en production.

### 2.0 Concurrence et codes d’état HTTP

- **Ce que nous faisions :** lancer Postman et Locust en charge concurrente, et surveiller la répartition des codes d’état, la latence moyenne et le taux de réussite.
- **Limite :** on ne voit que la passerelle extérieure. On rate un flux coupé, une erreur falsifiée et un blocage entre deux tokens.

### 3.0 Une machine à états pour le flux, empruntée à d’autres domaines

Quand nos propres métriques ont atteint leurs limites, nous en avons parlé avec Zhou Ge, qui travaille dans le trading haute fréquence et l’exploitation de CDN.

Sa remarque a été directe : un relais d’API IA n’est pas un endpoint web ordinaire. C’est un équipement réseau intermédiaire, avec des connexions longues et une forte concurrence.

Il a comparé les flux SSE de l’IA, par leur topologie et leur sensibilité aux pertes, à l’audio et à la vidéo en temps réel (WebRTC/RTMP) et aux flux de données de marché. Les points de mesure classiques des requêtes web ne sont pas le bon modèle. Les analogies utiles sont la latence tick-to-trade du trading haute fréquence et le temps d’affichage de la première image sur un CDN.

Cette conversation a remplacé l’ancien moniteur. Nous avons déployé des sondes dans plusieurs régions et séparé l’établissement de la connexion, la négociation TLS, l’arrivée du premier token, le débit de tokens et l’analyse des paquets SSE, puis lissé les séries. C’est le standard automatisé que nous utilisons aujourd’hui.

## 3. Les trois dimensions qui déterminent l’expérience en production

```text
                              ┌── TTFT (latence du premier token) -> temps d’attente de l’utilisateur
                ┌── Latence ──┼── TPS (vitesse de génération) -> fluidité de l’effet machine à écrire
                │             └── Latence P95/P99 -> le pire cas et le pic
                │
Métriques ──────┼── Fiabilité ┬── Analyse réussie -> écarter les faux 200 et les réponses invalides
                │             └── Retry-to-success -> tolérance aux pannes avec backoff exponentiel
                │
                └── Qualité du flux ┬── Interruption du flux -> la réponse s’arrête à mi-chemin
                                    └── Gigue entre tokens -> la sortie se bloque
```

### 1. Latence : séparer l’attente de la génération

- **TTFT (latence du premier token) :** millisecondes entre la requête HTTP et le premier paquet SSE. C’est la « première image ». Notre seuil en production est un TTFT < 1,5 seconde.
- **TPS (tokens par seconde) :** vitesse de génération après le premier token, soit tokens générés / durée. Un TPS faible fait bégayer l’effet machine à écrire.
- **Latence P95 / P99 :** ignorez la moyenne flatteuse. Les 95ᵉ et 99ᵉ centiles révèlent le pic, le contexte long et le canal saturé.

### 2. Fiabilité : voir au-delà du faux succès

- **Analyse réussie (parse success) :** un `200` ne suffit pas. Un SDK officiel doit pouvoir analyser la charge utile, le JSON doit être complet, et aucune erreur injectée par le relais ne doit se mêler à la réponse.
- **Retry-to-success :** simulez le backoff exponentiel de la production, et vérifiez si un 429 ou un 5xx se rétablit via un canal de secours en 3 nouvelles tentatives au plus.

### 3. Qualité du flux : attraper la panne silencieuse

- **Interruption du flux :** la part des appels dont la connexion TCP tombe, ou devient muette, avant le marqueur convenu `data: [DONE]`.
- **Gigue entre tokens (inter-token jitter) :** l’écart type de l’intervalle entre deux paquets SSE consécutifs, notion empruntée à la gigue en audiovisuel. Une gigue élevée signifie que le chemin côté serveur est instable, ou que plusieurs tampons de proxy ont été empilés.

## 4. Des références que nous n’avons pas inventées en vase clos

### 1. Les quatre signaux d’or du SRE de Google

Le livre SRE de Google définit quatre signaux d’or : la latence, le trafic, les erreurs et la saturation. Les sondes traitent le relais comme un service externe non fiable, et les alertes reposent sur ces quatre signaux.

### 2. OpenTelemetry et les règles SSE du W3C

Pour les flux, nous nous sommes appuyés sur les points de trace d’OpenTelemetry pour les connexions longues et sur le protocole Server-Sent Events du W3C. La sonde enregistre la poignée de main TCP, la négociation TLS, les en-têtes, le premier bloc de données et le signal `[DONE]`.

### 3. L’intervalle de score de Wilson

Classer un relais selon le rapport réussites / tentatives n’est pas équitable. Un relais qui réussit 10 fois sur 10 (100 %) n’est pas automatiquement plus fiable qu’un relais qui réussit 9 900 fois sur 10 000 (99 %).

Nous utilisons la borne inférieure de l’intervalle de score de Wilson :

```text
Score = (p̂ + z²/(2n) - z × √(p̂(1-p̂)/n + z²/(4n²))) / (1 + z²/n)
```

p̂ est le taux de réussite observé, n la taille de l’échantillon et z le quantile de la loi normale pour un niveau de confiance de 95 %. Un petit échantillon, ou une fenêtre de test courte, est pénalisé.

## 5. Comment la sonde est construite

```text
[Sondes régionales (AWS US West / GCP Asie de l’Est / Europe)]
       │
       ├──> [Trafic planifié et en rafale] ──> [Proxy API du relais] ──> [API amont / pool de comptes]
       │                                           │
       └──< [Analyseur SSE et machine à états] <───┘
               │
               ├──> [TimescaleDB / Prometheus (métriques à la microseconde)]
               └──> [Score par intervalle de confiance et attribution automatique]
```

### 1. Des sondes dans plusieurs régions

Des sondes légères tournent dans AWS US West, GCP Asie de l’Est (Hong Kong / Tokyo) et en Europe. Les requêtes concurrentes lancées depuis ces régions permettent de distinguer un proxy de relais bloqué d’une fluctuation du service d’OpenAI ou d’Anthropic.

### 2. Une machine à états au niveau du socket

- `CONNECTING` : enregistrer l’instant d’envoi t0.
- `FIRST_BYTE` : le premier bloc SSE arrive ; TTFT = t1 - t0.
- `STREAMING` : intervalle entre blocs, TPS et gigue.
- `COMPLETED` : la charge utile s’est terminée, `[DONE]` est présent et le JSON est valide.

### 3. Attribution automatique

- **Passerelle en panne :** `502 Bad Gateway` ou `504 Gateway Timeout` signifie que le nœud Nginx ou Envoy du relais lui-même est tombé.
- **Pool de comptes vide :** `429 Too Many Requests` ou `401 Unauthorized` signifie que le contrôle de concurrence en aval a échoué, ou que le solde de la clé en amont est épuisé.
- **Middleware :** un `200 OK` avec une coupure en plein flux ou un échec d’analyse signifie que le middleware de facturation ou de filtrage des prompts du relais a débordé.

## 6. Trois règles avant de choisir un relais

1. **Ne vous fiez pas à un seul test.** Échantillonnez de jour comme de nuit pendant au moins 3 à 7 jours. Surveillez la latence P95 et le taux de réussite au pic nocturne, entre 21 h et 1 h.
2. **Le test doit se faire en flux (streaming).** Une requête sans streaming masque la latence du premier token, la mise en tampon par le middleware et un flux qui meurt en cours de route.
3. **Un prix beaucoup trop bas n’est pas un cadeau.** Il cache généralement un pool de comptes partagé, un proxy de mauvaise qualité, ou un modèle ouvert bon marché présenté comme Opus ou GPT-4o.
