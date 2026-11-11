---
slug: ai-api-relay-stability-guide
translationKey: ai-api-relay-stability-guide
locale: de
kind: article
title: "Lassen Sie sich nicht von 99 % Verfügbarkeit täuschen: die Fallen bei KI-API-Relays, in die wir getappt sind, und wie wir Stabilität testen"
description: "Ausgehend von Schein-200ern, abgebrochenen Streams und nächtlichem Stocken zeigt dieser Artikel, wie wir die Stabilitätskennzahlen und Tests definieren, die im Produktivbetrieb wirklich zählen."
category: Zuverlässigkeit
tags: [stabilität, verfügbarkeit, SSE]
authorId: mira-zhou
modelIds: []
benchmarkSlugs: []
relatedSlugs: [ai-api-relay-software-engineering-evaluation-guide, ai-chinese-writing-models-api-relay-user-submission, llm-api-relay-gray-industry-user-submission]
publishedAt: '2026-09-17'
updatedAt: '2026-09-17'
sources:
  - id: google-sre-golden-signals
    label: Google SRE Book, Monitoring Distributed Systems
    url: https://sre.google/sre-book/monitoring-distributed-systems/
    checkedAt: '2026-10-02'
    claimScope: official
  - id: otel-docs
    label: OpenTelemetry-Dokumentation
    url: https://opentelemetry.io/docs/
    checkedAt: '2026-10-02'
    claimScope: official
  - id: whatwg-sse
    label: HTML Standard, Server-sent events
    url: https://html.spec.whatwg.org/multipage/server-sent-events.html
    checkedAt: '2026-10-02'
    claimScope: official
  - id: wilson-score
    label: Wilson-Score-Intervall
    url: https://en.wikipedia.org/wiki/Binomial_proportion_confidence_interval
    checkedAt: '2026-10-02'
    claimScope: editorial
---

> **Vorspann.** Auf dem Weg in die Produktion kommen die meisten Entwickler an einem API-Relay nicht vorbei. Die Website verspricht vielleicht „99,9 % schnell und stabil“ und einen „exklusiven Kanal für hohe Parallelität“. Sobald Sie sich anbinden, merken Sie, dass die Sache deutlich undurchsichtiger ist, als der Slogan verspricht. Hier steht, wie unser Team vom Kauf aus dem Bauch heraus zu automatisierten Prüfungen kam, und mit welchem Testgerüst wir arbeiten, bevor wir bezahlen oder integrieren.

## 1. Die Pannen, die uns zur Methode gezwungen haben

Das mehrdimensionale Kennzahlensystem unten ist nicht aus besonderer Klugheit entstanden. Bezahlt haben wir es mit Geld, Produktionsvorfällen und Beschwerden von Nutzern.

### 1. Schein-200 OK und stilles Abschneiden

Die ersten automatisierten Prüfungen waren simpel. Ein Python-Skript schickte alle 5 Minuten einen POST an das Relay. Ein HTTP-`200` mit etwas Text galt als gesund.

Der produktive Agent lief noch keine zwei Tage, als beim Support die Hölle los war. Nutzer meldeten, das Modell höre mitten im Satz auf und die erzeugte Logik sei kaputt.

Die Logs waren schlimmer als die Tickets. Manche Relays lieferten weiterhin `200 OK`, wenn der Upstream-Pool erschöpft war (ein 429-Rate-Limit oder ein 401-Authentifizierungsfehler), wenn das Gateway in einen Timeout lief (504) oder wenn ein Knoten abstürzte. Mitten in einem SSE-Stream schoben sie still ein `data: [DONE]` ein und beendeten die Antwort, oder sie setzten `{"error": "rate limit exceeded"}` in das JSON und gaben es als Antwort des Modells aus. Ein Monitor, der nur auf den Statuscode schaute, fiel auf diese Schein-200 komplett herein.

### 2. Das nächtliche Stocken und ein erstes Token, das nicht kam

Danach führten wir Messungen rund um die Uhr ein. Tagsüber lag die durchschnittliche Antwortzeit bei etwa 2 Sekunden, und das Dashboard sah gut aus. Zur nächtlichen Spitzenzeit stiegen Timeouts und Abbrüche durch Nutzer.

Die meisten dieser Relays waren kein direkter offizieller Kanal. Sie mischten US-Kontenpools und Proxys in mehreren Regionen. Begannen die nordamerikanischen Arbeitszeiten oder die nächtliche Spitze in China, brach der Pfad unter der Parallelität zusammen. Im schlimmsten Fall war die gesamte Antwort zwar nach etwa 4 Sekunden fertig, aber das erste Token (TTFT) brauchte volle 12 Sekunden. Die Nutzer starrten auf ein leeres Feld und gingen.

Diese beiden Vorfälle setzten die Regel neu: Ein Ping oder zwei beiläufige Anfragen sind kein Test für ein KI-Protokoll oder einen Stream.

## 2. Drei Versionen des Testsystems

### 1.0 Blindtests und Bauchgefühl

- **Was wir taten:** ein paar Prompts in einer Web-Oberfläche senden oder ein Skript für 10 Anfragen schreiben und Tempo und Antwortqualität nach Augenmaß beurteilen.
- **Grenze:** Die Stichprobe ist winzig und verrauscht. Hohe Parallelität oder ein seltener Verbindungsabbruch zeigen sich erst in der Produktion.

### 2.0 Parallelität und HTTP-Statuscodes

- **Was wir taten:** Postman und Locust unter Parallelität laufen lassen und die Verteilung der Statuscodes, die durchschnittliche Latenz und die Erfolgsrate beobachten.
- **Grenze:** Damit sieht man nur das äußere Gateway. Ein abgebrochener Stream, ein gefälschter Fehler und ein Stocken zwischen den Token bleiben unentdeckt.

### 3.0 Ein Stream-Zustandsautomat, entlehnt aus anderen Branchen

Als unsere eigenen Kennzahlen nicht weiterkamen, sprachen wir mit Zhou Ge, der im Hochfrequenzhandel und im CDN-Betrieb arbeitet.

Seine Antwort war direkt: Ein KI-API-Relay ist kein gewöhnlicher Web-Endpunkt. Es ist ein Zwischenknoten im Netz, eine Middlebox mit langen Verbindungen und hoher Parallelität.

Er verglich KI-SSE-Streams in Topologie und Empfindlichkeit gegenüber Paketverlust mit Echtzeit-Audio und -Video (WebRTC/RTMP) und mit Marktdaten-Feeds. Die üblichen Messpunkte für Web-Anfragen sind dafür das falsche Modell. Brauchbare Vergleiche sind die Tick-to-Trade-Latenz im Hochfrequenzhandel und die Zeit bis zum ersten Frame bei einem CDN.

Dieses Gespräch ersetzte den alten Monitor. Wir richteten Messknoten in mehreren Regionen ein und trennten Verbindungsaufbau, TLS-Handshake, Eintreffen des ersten Tokens, Token-Durchsatz und das Parsen der SSE-Pakete voneinander. Danach glätteten wir die Messreihen. Das ist der automatisierte Standard, den wir heute nutzen.

## 3. Die drei Dimensionen, die über das Erlebnis im Produktivbetrieb entscheiden

```text
                          ┌── TTFT (Zeit bis zum ersten Token) -> wie lange der Nutzer wartet
               ┌── Latenz ┼── TPS (Generierungstempo) -> wie flüssig die Schreibmaschine läuft
               │          └── P95/P99-Latenz -> schlechtester Fall und Spitzenlast
               │
Testmetriken ──┼── Zuverlässigkeit ┬── Parse-Erfolg -> Schein-200er und ungültige Payloads aussortieren
               │                   └── Retry-to-Success -> Fehlertoleranz mit exponentiellem Backoff
               │
               └── Stream-Qualität ┬── Stream-Abbruch -> die Antwort bricht mittendrin ab
                                   └── Token-Jitter -> die Ausgabe stockt
```

### 1. Latenz: Warten und Generieren trennen

- **TTFT (Zeit bis zum ersten Token):** Millisekunden von der HTTP-Anfrage bis zum ersten SSE-Paket. Das ist der „erste Frame“. Unsere Grenze für die Produktion: TTFT < 1,5 Sekunden.
- **TPS (Token pro Sekunde):** das Generierungstempo nach dem ersten Token, erzeugte Token / Dauer. Ein niedriger TPS-Wert lässt den Schreibmaschinen-Effekt stottern.
- **P95-/P99-Latenz:** Ignorieren Sie den schmeichelhaften Durchschnitt. Das 95. und das 99. Perzentil zeigen die Spitzenlast, den langen Kontext und den überlasteten Kanal.

### 2. Zuverlässigkeit: durch den Scheinerfolg hindurchsehen

- **Parse-Erfolg:** Ein `200` reicht nicht. Ein offizielles SDK muss die Nutzdaten parsen können, das JSON muss vollständig sein, und ein vom Relay eingeschleuster Fehler darf nicht in die Antwort gemischt sein.
- **Retry-to-Success:** Simulieren Sie exponentielles Backoff wie in der Produktion und prüfen Sie, ob sich ein 429 oder ein 5xx innerhalb von 3 Wiederholungen über einen Ausweichkanal erholt.

### 3. Stream-Qualität: den stillen Ausfall erwischen

- **Stream-Abbruch:** der Anteil der Aufrufe, deren TCP-Verbindung vor der vereinbarten Endmarke `data: [DONE]` abreißt oder verstummt.
- **Inter-Token-Jitter:** die Standardabweichung des Abstands zwischen benachbarten SSE-Paketen, entlehnt vom Jitter bei Audio und Video. Hoher Jitter bedeutet, dass der Backend-Pfad instabil ist oder dass mehrere Proxy-Puffer übereinandergestapelt wurden.

## 4. Referenzen, die wir nicht im stillen Kämmerlein erfunden haben

### 1. Die vier goldenen Signale von Google SRE

Das Google-SRE-Buch nennt vier goldene Signale: Latenz, Traffic, Fehler und Auslastung (Saturation). Die Messknoten behandeln das Relay als nicht vertrauenswürdigen externen Dienst, und die Warnungen setzen an diesen vier Signalen an.

### 2. OpenTelemetry und die W3C-Regeln für SSE

Für Streams haben wir uns an den Trace-Punkten von OpenTelemetry für lange Verbindungen und am W3C-Protokoll Server-Sent Events orientiert. Der Messknoten zeichnet TCP-Handshake, TLS-Aushandlung, Header, den ersten Daten-Chunk und das `[DONE]`-Signal auf.

### 3. Das Wilson-Score-Intervall

Ein Relay nach Erfolgen / Versuchen zu ranken, ist unfair. Ein Relay, das 10 von 10 Mal erfolgreich ist (100 %), ist nicht automatisch vertrauenswürdiger als eines, das 9.900 von 10.000 Mal erfolgreich ist (99 %).

Wir verwenden die untere Grenze des Wilson-Score-Intervalls:

```text
Score = (p̂ + z²/(2n) - z × √(p̂(1-p̂)/n + z²/(4n²))) / (1 + z²/n)
```

p̂ ist die beobachtete Erfolgsrate, n die Stichprobengröße und z das Quantil der Normalverteilung für 95 % Konfidenz. Eine kleine Stichprobe oder ein kurzes Testfenster wird abgestraft.

## 5. Wie die Messknoten aufgebaut sind

```text
[Regionale Messknoten (AWS US-West / GCP Ostasien / Europa)]
       │
       ├──> [Geplanter und Burst-Traffic] ──> [Relay-API-Proxy] ──> [Upstream-API / Kontenpool]
       │                                          │
       └──< [SSE-Parser und Zustandsautomat] <────┘
               │
               ├──> [TimescaleDB / Prometheus (Metriken im Mikrosekundenbereich)]
               └──> [Konfidenzintervall-Score und automatische Ursachenzuordnung]
```

### 1. Messknoten in mehr als einer Region

Leichtgewichtige Messknoten laufen in AWS US-West, GCP Ostasien (Hongkong / Tokio) und Europa. Parallele Anfragen aus diesen Regionen unterscheiden einen hängenden Relay-Proxy von einer Schwankung beim Dienst von OpenAI oder Anthropic.

### 2. Ein Socket-Zustandsautomat

- `CONNECTING`: Sendezeitpunkt t0 erfassen.
- `FIRST_BYTE`: Der erste SSE-Chunk kommt an; TTFT = t1 - t0.
- `STREAMING`: Chunk-Abstand, TPS und Jitter.
- `COMPLETED`: Die Nutzdaten sind sauber beendet, `[DONE]` ist vorhanden und das JSON ist gültig.

### 3. Automatische Ursachenzuordnung

- **Gateway ausgefallen:** `502 Bad Gateway` oder `504 Gateway Timeout` bedeutet, dass der eigene Nginx- oder Envoy-Knoten des Relays ausgefallen ist.
- **Kontenpool leer:** `429 Too Many Requests` oder `401 Unauthorized` bedeutet, dass die Parallelitätssteuerung auf der Downstream-Seite versagt hat oder das Guthaben hinter dem Upstream-Schlüssel aufgebraucht ist.
- **Middleware:** `200 OK` mit einem Abbruch mitten im Stream oder einem Parse-Fehler bedeutet, dass die eigene Abrechnungs- oder Prompt-Filter-Middleware des Relays übergelaufen ist.

## 6. Drei Regeln, bevor Sie ein Relay wählen

1. **Vertrauen Sie keinem einzelnen Test.** Messen Sie mindestens 3–7 Tage lang über Tag und Nacht. Achten Sie auf P95-Latenz und Erfolgsrate in der nächtlichen Spitzenzeit von 21:00 bis 01:00 Uhr.
2. **Der Test muss streamen.** Eine Anfrage ohne Streaming verdeckt die Verzögerung bis zum ersten Token, Puffer in der Middleware und einen Stream, der mittendrin abreißt.
3. **Ein viel zu niedriger Preis ist kein Geschenk.** Meist steckt ein geteilter Kontenpool dahinter, ein schlechter Proxy oder ein billiges offenes Modell, das als Opus oder GPT-4o ausgegeben wird.
