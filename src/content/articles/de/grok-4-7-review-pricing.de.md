---
slug: grok-4-7-review-pricing
translationKey: grok-4-7-review-pricing
locale: de
kind: article
title: "Grok 4.7: Spezifikationen, Preise für langen Kontext und veröffentlichte Benchmarks"
description: "Offizieller Modellname, 500.000 Token Kontext, Listenpreise unter und über 200.000 Prompt-Token sowie die für Grok 4.7 veröffentlichte Benchmark-Tabelle. Die Zahlen stammen von den öffentlichen Seiten von xAI, nicht aus einer Folkbench-Messung."
category: Modelle
tags: [preise, benchmarks, api]
authorId: iris-wu
modelIds: [grok-4-7, grok-4-6]
benchmarkSlugs: []
relatedSlugs: [gpt-6-1-sol-review-pricing, claude-opus-5-5-review-pricing, claude-sonnet-5-5-review-pricing]
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: grok-47-announcement
    label: xAI, Ankündigung von Grok 4.7
    url: https://x.ai/news/grok-4-7
    checkedAt: '2026-10-02'
    claimScope: official
  - id: grok-47-guide
    label: xAI-Dokumentation, Grok 4.7
    url: https://docs.x.ai/developers/grok-4-7
    checkedAt: '2026-10-02'
    claimScope: official
  - id: grok-47-model
    label: xAI-Dokumentation, Modellseite von Grok 4.7
    url: https://docs.x.ai/developers/models/grok-4.7
    checkedAt: '2026-10-02'
    claimScope: official
  - id: xai-pricing
    label: xAI API, Preise
    url: https://docs.x.ai/developers/pricing
    checkedAt: '2026-10-02'
    claimScope: official
---

> Die Spezifikationen und Preise unten stammen aus der Dokumentation und der Preistabelle von xAI, die Benchmarks aus der Ankündigung vom 21. September 2026. Geprüft wurde am 2. Oktober 2026. Folkbench hat diese Tests nicht wiederholt. Die Preise und Werte der Konkurrenz in der Ankündigung sind die Zahlen, die diese Seite nennt – keine Nachprüfung der Preistabellen von OpenAI oder Anthropic am selben Tag.

xAI hat Grok 4.7 am 21. September 2026 angekündigt. Der Modellname in der API lautet `grok-4.7`. Die Dokumentation beschreibt es als Frontier-Modell für Coding, agentische Aufgaben und Wissensarbeit. Im Text der Ankündigung heißt es, das Modell laufe zum selben Preis und mit derselben Geschwindigkeit wie [Grok 4.6](https://x.ai/news/grok-4-6). Die Überschrift derselben Seite spricht dagegen von etwa doppelter Geschwindigkeit zu etwa dem halben Preis vergleichbarer Modelle. Beide Sätze stehen in der Ankündigung. Dieser Artikel macht aus der Überschrift keine weitere Preistabelle.

Drei öffentliche Seiten lassen sich miteinander abgleichen. Die Übersichtstabelle der Dokumentation nennt ein Kontextfenster von 500.000 Token, einen Wissensstand von Mai 2026 und für kurzen Kontext Preise von 2 USD für die Eingabe und 6 USD für die Ausgabe. Die Preistabelle wechselt zu den Sätzen für langen Kontext, sobald ein Prompt 200.000 Token erreicht, und diese Sätze gelten dann für die gesamte Anfrage. Die Benchmark-Tabelle der Ankündigung stellt `grok-4.7` neben Grok 4.6, GPT-5.6 Sol und Fable 5.1. Die Stufen für langen Kontext bei OpenAI finden Sie unter [GPT-6.1 Sol](https://folkbench.com/de/blog/gpt-6-1-sol-review-pricing), die für Claude unter [Opus 5.5](https://folkbench.com/de/blog/claude-opus-5-5-review-pricing) und [Sonnet 5.5](https://folkbench.com/de/blog/claude-sonnet-5-5-review-pricing).

## Veröffentlichte Spezifikationen

| Punkt | Grok 4.7 |
| --- | --- |
| Modellname | `grok-4.7` |
| Ankündigungsdatum | 21. September 2026 |
| Kontextfenster | 500.000 Token |
| Wissensstand | Mai 2026 |
| Eingabe zu Ausgabe | Text und Bild zu Text |
| Ausgabelimit in der Übersichtstabelle | Angegeben als kein Limit für die Textausgabe, ohne eigene Höchstzahl an Ausgabe-Token |
| Reasoning | `low`, `medium`, `high` (Standard), `xhigh` |
| APIs | Responses, Chat Completions |
| In der Dokumentation genannte Tools | Function Calling, Websuche, X-Suche, Codeausführung |
| Batch API auf der Modellseite | Nicht unterstützt |

Die Modellseite setzt den Standardaufwand auf `high`. Die Dokumentation empfiehlt `prompt_cache_key` in der Responses API und den Header `x-grok-conv-id` bei Chat Completions. Ohne diesen Schlüssel landet eine Unterhaltung laut Seite oft auf einem Server, der noch nichts im Cache hat, und die Eingabe wird zum Preis ohne Cache abgerechnet. Responses liefern außerdem `reasoning.encrypted_content` zurück, auch wenn die Anfrage es nicht in `include` aufführt. Bei Unterhaltungen über mehrere Runden sollten diese Reasoning-Einträge unverändert im nächsten `input` zurückgeschickt werden. Laut Dokumentation ändert sich bei Chat Completions in diesem Punkt nichts.

Die Dokumentation nennt die xAI API, den US-Regionalendpunkt `https://us.api.x.ai/v1`, Grok Build, Cursor sowie die Gateways OpenRouter, Vercel und Cloudflare. Grok Build nutzt dieses Modell als Standard. Der US-Endpunkt nennt derzeit `grok-4.7` und `grok-4.6`. Ob ein Relay diese ID anbietet, ergibt sich aus dem veröffentlichten Eintrag im Katalog, nicht aus einer Aussage in diesem Artikel.

## Offizielle Preise

### Kurzer und langer Kontext

Die Preise sind in USD pro 1 Mio. Token angegeben und stammen aus der API-Preistabelle, gelesen am 2. Oktober 2026. Laut Tabelle liegt die Schwelle für langen Kontext bei einem Prompt von 200.000 Token. Sobald eine Anfrage sie erreicht, gilt für jedes Token dieser Anfrage der Satz für langen Kontext. `grok-4.7` und `grok-4.6` haben in dieser Tabelle dieselben sechs Werte.

| Pro 1 Mio. Token | 4.7 kurz | 4.7 lang | 4.6 kurz | 4.6 lang |
| --- | --- | --- | --- | --- |
| Eingabe | 2 USD | 4 USD | 2 USD | 4 USD |
| Cache-Lesen | 0,50 USD | 1 USD | 0,50 USD | 1 USD |
| Ausgabe | 6 USD | 12 USD | 6 USD | 12 USD |

Ein Prompt unter 200.000 Token läuft über die kurze Stufe. Ab der Anfrage, die 200.000 Token erreicht, werden auch die früheren Token zum Satz der langen Stufe berechnet. Die lange Stufe kostet das Doppelte der kurzen: 2 USD × 2 = 4 USD, Cache 0,50 USD × 2 = 1 USD und Ausgabe 6 USD × 2 = 12 USD. Cache-Lesen kostet ein Viertel des Eingabepreises derselben Stufe: 2 USD × 0,25 = 0,50 USD und 4 USD × 0,25 = 1 USD.

Drei Beispiele, nur mit der Standardstufe: Die ersten beiden bleiben in der kurzen Stufe. Das dritte hat 280.000 Eingabe-Token, also läuft die gesamte Anfrage über die lange Stufe. Die Cache-Zeile setzt voraus, dass das Nutzungsprotokoll diese Eingabe als Cache-Treffer zählt.

| Anfrage | Rechnung | Betrag |
| --- | --- | --- |
| 100.000 Eingabe ohne Cache, 5.000 Ausgabe | 0,1 × 2 USD + 0,005 × 6 USD | 0,23 USD |
| 100.000 Cache-Lesen, 5.000 Ausgabe | 0,1 × 0,50 USD + 0,005 × 6 USD | 0,08 USD |
| 280.000 Eingabe ohne Cache, 10.000 Ausgabe | 0,28 × 4 USD + 0,01 × 12 USD | 1,24 USD |

Würde man diese 280.000 Token zum kurzen Satz berechnen, ergäbe das 0,28 × 2 USD + 0,01 × 6 USD = 0,62 USD. Das ist nicht der Preis dieser Stufe. Fast, der US-Regionalaufschlag und Tool-Aufrufe sind in diesen drei Zeilen nicht eingerechnet.

### Weitere Multiplikatoren in der Preistabelle

Der US-Regionalendpunkt `https://us.api.x.ai/v1` hält die Inferenz in den USA und rechnet Token zum 1,1-Fachen der globalen Sätze ab, also mit 10 % Aufschlag. Die Preistabelle nennt für `grok-4.7` diese Werte: unter 200.000 Token Eingabe 2,20 USD, Cache-Lesen 0,55 USD, Ausgabe 6,60 USD; über 200.000 Token Eingabe 4,40 USD, Cache-Lesen 1,10 USD, Ausgabe 13,20 USD. Der Faktor 1,1 gilt für Eingabe, Ausgabe und Cache-Lesen, auch in der langen Stufe. Der Cache-Rabatt wird zuerst angewendet.

Grok 4.7 Fast ist dasselbe Modell auf schnellerer Infrastruktur. Laut Dokumentation kosten Standardanfragen das 2-Fache und Anfragen mit langem Kontext das 1,5-Fache. Fast ist nur in Cursor und Grok Build verfügbar und wird über den dortigen Tarif abgerechnet. Es steht nicht in der öffentlichen xAI API zur Verfügung, und die kostenlose Stufe von Grok Build enthält es nicht. Die Preistabelle nennt für Fast unter 200.000 Token Eingabe 4 USD, Cache 1 USD und Ausgabe 12 USD, über 200.000 Token Eingabe 6 USD, Cache 1,50 USD und Ausgabe 18 USD. Die Werte 4 USD / 1 USD / 12 USD sind das Doppelte der kurzen Stufe. Die Werte 6 USD / 1,50 USD / 18 USD sind das 1,5-Fache der langen Stufe. Die Ankündigung spricht zusätzlich von einer schnellen Variante mit doppelter Ausgabegeschwindigkeit zum doppelten Preis. Die Stufe mit dem Faktor 1,5 nennt sie nicht. Maßgeblich für die Abrechnung ist die Tabelle in der Dokumentation.

Laut Modellseite wird die Batch API nicht unterstützt. `grok-4.7` steht nicht auf der Liste der Batch-Rabatte in der Preistabelle. Die dort genannten Modelle erhalten 20 % Batch-Rabatt. Die Preisseite beschreibt außerdem Priority Processing für Textanfragen: Ein bestätigter `service_tier` mit dem Wert `priority` wird zum 2-Fachen abgerechnet, nachdem der Cache-Rabatt angewendet wurde. Die Modellseite von Grok 4.7 hat keine eigene Priority-Zeile. Ob eine Anfrage diesen Multiplikator genutzt hat, zeigt der `service_tier` in der Antwort.

Die Dokumentation bepreist serverseitige Tools gesondert. Die Websuche kostet 5 USD pro 1.000 Aufrufe. Die X-Suche wird pro abgerufenem Element abgerechnet: 5 USD pro 1.000 Beiträge und 10 USD pro 1.000 Profile. Die Codeausführung kostet 5 USD pro 1.000 Aufrufe. Diese Gebühren kommen zu den Token-Preisen hinzu. Die Modellseite nennt 150 Anfragen pro Sekunde und 50.000.000 Token pro Minute, als Region ist `us-east-1` angegeben. Der Leitfaden schreibt außerdem, dass die aktuellen Rate Limits und Preise eines Teams auf dieser Modellseite stehen. Diese beiden Werte sind also keine Zusage für jedes Konto.

## So lesen Sie die Benchmarks der Ankündigung

Die Ankündigung enthält eine Vergleichstabelle. Sie ist keine Folkbench-Messung. Die Spalten sind Grok 4.7 xHigh, Grok 4.6 High, GPT-5.6 Sol Max und Fable 5.1 Max. Die beiden Preiszeilen sind die Listenpreise für Eingabe und Ausgabe, die diese Seite nennt. Der DeepSWE-Wert für `grok-4.7` liegt bei 71,0 %, und laut Sternchen wurde dafür high verwendet, nicht das im Spaltenkopf genannte xHigh.

| Punkt | Grok 4.7 | Grok 4.6 | GPT-5.6 Sol | Fable 5.1 |
| --- | --- | --- | --- | --- |
| Eingabe / 1 Mio. | 2 USD | 2 USD | 4 USD | 10 USD |
| Ausgabe / 1 Mio. | 6 USD | 6 USD | 20 USD | 50 USD |
| CursorBench 4.0 | 46,3 % | 40,4 % | 41,7 % | 51,8 % |
| DeepSWE v1.1 | 71,0 % (high) | 65,2 % | 72,7 % | 70,0 % |
| EEBench | 64,0 % | 53,0 % | 39,4 % | 56,4 % |
| AA Briefcase v1.1 | 1.657 | 1.546 | 1.487 | 1.678 |
| Terminal-Bench 4.0 | 37,6 % | 20,3 % | 37,3 % | 57,9 % |
| Harvey Legal Agent Benchmark | 19,6 % | 15,8 % | 2,5 % | 6,7 % |
| HealthBench Professional | 56,7 % | 48,5 % | 60,5 % | 62,1 % |

Laut Ankündigung liegt Grok 4.7 außerdem sowohl bei GDPval als auch bei AA Briefcase vor Grok 4.6 und auf Augenhöhe mit anderen Frontier-Modellen. Zum GDPval-Diagramm nennt der Text keine absoluten Werte, daher ergänzt dieser Artikel keine. Der Wert für AA Briefcase ist die 1.657 aus der Tabelle oben.

Der Sicherheitsabschnitt nennt zwei Zahlen. Beim Biosicherheits-Benchmark von LatchBio liegt der Wert bei 62,4 %. Bei HackerBench v0.3 wurden 3,3 % der riskanten Dual-Use-Prompts durchgelassen. Laut Seite wird legitime Sicherheitsarbeit selten blockiert, eine Ablehnungsquote für legitime Anfragen nennt sie aber nicht. Ausgewählte Partner aus der Cybersicherheit können einen Red-Team-Zugang beantragen, der nur auf Einladung vergeben wird. Diese Zahlen beschreiben die Tests der Ankündigung. Sie sind keine Fehlerrate für normalen Traffic.

## Prüfungen vor dem Umleiten von Traffic

1. Legen Sie `grok-4.7` fest. Der Modellname im fertigen Ergebnis muss diese ID sein. Die Katalogseite verwendet `grok-4-7`.
2. Der Standardaufwand ist `high`. Setzen Sie `low`, `medium`, `high` oder `xhigh` ausdrücklich, wenn Sie die Stufen vergleichen.
3. Senden Sie bei Unterhaltungen über mehrere Runden `prompt_cache_key` mit, bei Chat Completions `x-grok-conv-id`. Geben Sie das verschlüsselte Reasoning aus Responses unverändert zurück.
4. Berechnen Sie Prompts unter 200.000 Token und Prompts, die 200.000 Token erreichen, getrennt. Für Letztere gilt der Satz der langen Stufe für die gesamte Anfrage.
5. Der US-Regionalendpunkt rechnet zum 1,1-Fachen ab. Fast ist nicht in der öffentlichen API verfügbar. Rechnen Sie die Faktoren 2 und 1,5 nicht in eine normale API-Rechnung ein.
6. Laut Modellseite wird die Batch API nicht unterstützt. Tool-Aufrufe kommen mit den Preisen pro 1.000 Aufrufe aus der Dokumentation hinzu.
7. Die Konkurrenzspalten der Ankündigungstabelle übernehmen die Preise und Werte, die diese Seite nennt. Die 71,0 % bei DeepSWE gelten für high, nicht für xHigh.
8. Ob ein Relay diese ID anbietet und welche Verfügbarkeit und welchen tatsächlich berechneten Preis es zu dem Zeitpunkt hat, ergibt sich aus dem veröffentlichten Katalog. Die Tabellen hier sind Listenpreise von xAI, nicht der Preis eines Relays nach dem Gruppenmultiplikator.
