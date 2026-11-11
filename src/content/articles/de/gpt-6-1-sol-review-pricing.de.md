---
slug: gpt-6-1-sol-review-pricing
translationKey: gpt-6-1-sol-review-pricing
locale: de
kind: article
title: "GPT-6.1 Sol: Spezifikationen, Preise für langen Kontext und veröffentlichte Vergleiche"
description: "Offizielle Spezifikationen, Listenpreise unter und über 272.000 Eingabe-Token sowie die für GPT-6.1 Sol angegebenen Abstände und Kosten pro Aufgabe. Die Zahlen stammen von den öffentlichen Seiten von OpenAI, nicht aus einer Folkbench-Messung."
category: Modelle
tags: [preise, benchmarks, api]
authorId: iris-wu
modelIds: [gpt-6-1-sol, gpt-6-sol, gpt-6-astra, gpt-6-luna]
benchmarkSlugs: []
relatedSlugs: [claude-opus-5-5-review-pricing, claude-sonnet-5-5-review-pricing]
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: gpt-61-announcement
    label: OpenAI, Ankündigung von GPT-6.1 Sol
    url: https://openai.com/index/introducing-gpt-6-1-sol/
    checkedAt: '2026-10-02'
    claimScope: official
  - id: gpt-61-model
    label: OpenAI API, Modellseite von GPT-6.1 Sol
    url: https://developers.openai.com/api/docs/models/gpt-6.1-sol
    checkedAt: '2026-10-02'
    claimScope: official
  - id: openai-pricing
    label: OpenAI API, Preise
    url: https://developers.openai.com/api/docs/pricing
    checkedAt: '2026-10-02'
    claimScope: official
  - id: gpt-61-system-card
    label: OpenAI, Nachtrag zur System Card von GPT-6.1 Sol
    url: https://deploymentsafety.openai.com/gpt-6-1-sol
    checkedAt: '2026-10-02'
    claimScope: official
---

> Die Spezifikationen und Preise unten stammen von der Modellseite und aus der Preistabelle von OpenAI, die Vergleiche aus der Ankündigung. Geprüft wurde am 2. Oktober 2026. Die Ankündigung nennt Abstände und Kosten, keine Tabelle absoluter Werte, die man einfach übernehmen könnte. Folkbench hat diese Tests nicht wiederholt. „Etwa ein Fünftel der Kosten“ beschreibt den eigenen Testaufbau des Anbieters.

OpenAI beschreibt GPT-6.1 Sol als Upgrade von `gpt-6-sol`. Die Modell-ID in der API lautet `gpt-6.1-sol`. Laut Ankündigung kommt das Modell bei komplexem Coding, Computerbedienung und professioneller Arbeit nahe an `gpt-6-astra` heran – zu einem Fünftel der Standardpreise von Astra für Eingabe und Ausgabe. Cache-Lesen kostet 0,10 USD pro 1 Mio. Token, also 5 % der Standardeingabe und die Hälfte des Cache-Lese-Preises von `gpt-6-sol`. Für die schwierigste wissenschaftliche Forschung verweist die Ankündigung weiterhin auf Astra. `gpt-6-sol` bleibt in der Preistabelle.

Die Ankündigung von GPT-6 Sol und Luna verweist in einem Update vom 29. September 2026 auf dieses Modell. Dieser Artikel behandelt das Datum einer anderen Newskarte in der Fußzeile nicht als Ankündigungsdatum von GPT-6.1 Sol.

Die Listenpreise und Benchmark-Tabellen für Claude finden Sie unter [Opus 5.5](../claude-opus-5-5-review-pricing/) und [Sonnet 5.5](../claude-sonnet-5-5-review-pricing/).

## Veröffentlichte Spezifikationen

| Punkt | GPT-6.1 Sol |
| --- | --- |
| Modell-ID | `gpt-6.1-sol` |
| Kontextfenster | 1.050.000 Token |
| Maximale Eingabe | 922.000 Token |
| Maximale Ausgabe | 128.000 Token |
| Eingabe zu Ausgabe | Text und Bilder zu Text |
| Wissensstand | 30. April 2026 |
| `reasoning.effort` | `low`, `medium` (Standard), `high`, `xhigh`, `max` |
| Nicht akzeptierte Stufen | `none`, `minimal` |
| Tool-Aufrufe | Responses API |
| Chat Completions | Unterstützt, ohne Tools |
| Als unterstützt gelistete Endpunkte | Chat Completions, Responses, Batch |
| Laut Modellseite nicht unterstützt | Realtime, Assistants, Fine-Tuning, Embeddings, Bildgenerierung, Video, Sprache |
| Datenresidenz | USA und EU. Der Fast-Modus ist mit EU-Datenresidenz nicht verfügbar |

Die maximale Eingabe von 922.000 entspricht dem Kontextfenster von 1.050.000 abzüglich der maximalen Ausgabe von 128.000: 1.050.000 − 128.000 = 922.000. Laut Modellseite werden Reasoning-Token unterstützt. Die hier zitierten Passagen nennen dafür aber keine eigene Abrechnungsformel. Planen Sie das Budget anhand von Eingabe, Cache und Ausgabe im Nutzungsprotokoll.

## Listenpreise

### Kurzer und langer Kontext

Die Preise sind in US-Dollar pro 1 Mio. Token angegeben. Beide Stufen stammen aus der API-Preistabelle, geprüft am 2. Oktober 2026. Laut dieser Tabelle gilt eine Eingabe bis einschließlich 272.000 Token als kurzer Kontext und eine Eingabe über 272.000 Token als langer Kontext. Die Modellseite schreibt, dass oberhalb von 272.000 Token Eingabe und Cache das 2-Fache und die Ausgabe das 1,5-Fache kosten – und zwar für die gesamte Anfrage.

| Pro 1 Mio. Token | 6.1 kurz | 6.1 lang | Sol kurz | Sol lang | Astra kurz | Astra lang |
| --- | --- | --- | --- | --- | --- | --- |
| Eingabe | 2 USD | 4 USD | 2 USD | 4 USD | 10 USD | 20 USD |
| Cache-Lesen | 0,10 USD | 0,20 USD | 0,20 USD | 0,40 USD | 1 USD | 2 USD |
| Cache-Schreiben | 2,50 USD | 5 USD | 2,50 USD | 5 USD | 12,50 USD | 25 USD |
| Ausgabe | 10 USD | 15 USD | 10 USD | 15 USD | 50 USD | 75 USD |

Eingaben bis 272.000 Token laufen über die kurze Stufe. Sobald eine Anfrage 272.000 Token überschreitet, werden auch die vorherigen Token zum Satz der langen Stufe berechnet. Es ändert sich also nicht nur der Preis der zusätzlichen Token. Cache-Lesen kostet bei 6.1 die Hälfte von Sol. Standardeingabe und -ausgabe kosten ein Fünftel von Astra. Cache-Lesen dagegen nicht: Bei Astra kostet es im kurzen Kontext 1 USD, bei 6.1 sind es 0,10 USD.

Ein Cache-Schreibvorgang kostet das 1,25-Fache der Eingabe ohne Cache. In der kurzen Stufe sind das 2 USD × 1,25 = 2,50 USD, in der langen 4 USD × 1,25 = 5 USD. Die Ausgabe der langen Stufe kostet das 1,5-Fache der kurzen: 10 USD × 1,5 = 15 USD.

### Weitere Multiplikatoren in der Preistabelle

Die Modellseite nennt drei weitere offizielle Multiplikatoren. Der Fast-Modus kostet das 2-Fache des Standardpreises. Batch und Flex liegen 50 % darunter. Regionale Verarbeitung kostet, wo sie verfügbar ist, 10 % Aufschlag. In der Preistabelle desselben Tages haben Batch, Flex und Fast jeweils eine eigene Zeile, und die Zahlen passen zu diesen Multiplikatoren. Der Fast-Modus für 6.1 im kurzen Kontext kostet zum Beispiel 4 USD Eingabe, 0,20 USD Cache-Lesen, 5 USD Cache-Schreiben und 20 USD Ausgabe.

Laut Ankündigung sollte Ultrafast in den folgenden Tagen in Codex verfügbar werden, mit einer bis zu 8-mal so schnellen Token-Generierung wie im Standardtempo. Die am 2. Oktober 2026 gelesene Preistabelle der Flaggschiffmodelle hat keine eigene Zeile für ein Ultrafast-Modell. Ob ein offizieller Multiplikator bereits in einer bestimmten Rechnung steckt, zeigt das Nutzungsprotokoll.

Drei Beispiele, die sich mit der Standardstufe nachrechnen lassen: Die ersten beiden Zeilen bleiben in der kurzen Stufe. Die dritte Zeile hat 280.000 Eingabe-Token, also läuft die gesamte Anfrage über die lange Stufe. Die Cache-Zeile setzt voraus, dass das Nutzungsprotokoll diese Eingabe-Token als Cache-Treffer zählt.

| Anfrage | Rechnung | Betrag |
| --- | --- | --- |
| 100.000 Eingabe ohne Cache, 5.000 Ausgabe | 0,1 × 2 USD + 0,005 × 10 USD | 0,25 USD |
| 100.000 Cache-Lesen, 5.000 Ausgabe | 0,1 × 0,10 USD + 0,005 × 10 USD | 0,06 USD |
| 280.000 Eingabe ohne Cache, 10.000 Ausgabe | 0,28 × 4 USD + 0,01 × 15 USD | 1,27 USD |

Würde man diese 280.000 Token zum Satz der kurzen Stufe berechnen, ergäbe das 0,28 × 2 USD + 0,01 × 10 USD = 0,66 USD. Das ist nicht der Preis dieser Stufe. Fast, Batch, Flex und der regionale Aufschlag sind in diesen drei Zeilen nicht eingerechnet.

## So lesen Sie die Vergleiche der Ankündigung

Die Ankündigung nennt Abstände und Kosten, keine Tabelle absoluter Werte. Die Zeilen unten enthalten nur Vergleiche, die die Seite ausdrücklich nennt. Die Kostenangaben beschreiben den Testaufbau von OpenAI.

| Benchmark | Was die Ankündigung angibt | Bedingungen |
| --- | --- | --- |
| DeepSWE v1.1 | Gleichauf mit Astra; 6,4 Prozentpunkte über dem besten Wert von Sol | Niedrigerer Reasoning-Aufwand, etwa ein Fünftel der Kosten |
| GDP.pdf | Über Opus 5.5 mit Fallbacks; nahe an Astra | Getestete Reasoning-Einstellungen; weniger als die Hälfte der Kosten von Opus, etwa ein Fünftel der Kosten von Astra |
| AutomationBench | 2,2 Prozentpunkte über Opus 5.5; 4,8 Prozentpunkte über Sol bei gleicher Einstellung | medium; etwa ein Drittel der Kosten von Opus |
| OSWorld 2.0, Offline-Set | 7 Prozentpunkte über Sol; Abstand zu Astra höchstens 2,1 Prozentpunkte | max; Partial Reward, v2026.08.08; weniger als die Hälfte der Kosten von Sol, etwa ein Siebtel der Kosten von Astra |
| Terminal-Bench Science 0.1 | Mehr als doppelt so hoch wie der Wert von Sol; Astra bleibt mit 68,1 % der höchste Wert unter den getesteten Modellen | max; 6.1 im Schnitt 5,47 USD pro Aufgabe, Opus 5.5 23,21 USD, Astra 23,80 USD |
| Faktentreue | Der Anteil der Antworten mit mindestens einem Faktenfehler sinkt von 11,4 % auf 7,7 % | low; Abstand zu Astra höchstens 1,9 Prozentpunkte |

Die Stichprobe zur Faktentreue besteht aus anonymisierten Unterhaltungen, in denen ein Nutzer zuvor einen Fehler markiert hatte. Laut Ankündigung sind diese Prompts bewusst schwer gewählt und nicht repräsentativ für normalen Traffic. Die Dollarbeträge bei Terminal-Bench Science sind die von OpenAI veröffentlichten durchschnittlichen Kosten pro Aufgabe, nicht der Gruppenpreis eines Relays. Der höchste wissenschaftliche Wert unter den getesteten Modellen bleibt Astra mit 68,1 %, und laut Ankündigung sollte die schwierigste wissenschaftliche Forschung bei Astra bleiben.

Dieselbe Seite nennt außerdem Fehlerraten aus Alignment-Tests, die bewusst schwer angelegt sind. Ist das Suchtool bereits defekt, liegt der Anteil der Durchläufe mit max-Aufwand, die den Nutzer nicht darauf hinweisen, bei 2,1 % für 6.1, 4,9 % für Sol, 1,5 % für Astra und 28,7 % für Luna. Laut Ankündigung wurde kein Versuch beobachtet, einen automatischen Sicherheitsprüfer zu umgehen – genau wie bei Astra und Sol. Details stehen im Nachtrag zur System Card von GPT-6.1 Sol. Diese Fehlerraten sind keine Fehlerraten im normalen Traffic.

Laut Ankündigung liefen die Tests zudem in einer Forschungsumgebung oder über die API; Systemprompt und Tools können sich dort vom produktiven ChatGPT unterscheiden. Die Werte der Konkurrenz stammen aus öffentlichen Berichten.

## Zwei Anfragewege, die getrennt bleiben müssen

Tool-Aufrufe laufen über Responses. Der Standardaufwand ist bereits `medium`. Laut Modellseite kann Chat Completions Text ohne Tools übertragen.

```text
# Responses
model: gpt-6.1-sol
reasoning.effort: medium

# Chat Completions, ohne Tools
model: gpt-6.1-sol
reasoning_effort: medium

# Laut Modellseite nicht akzeptiert
reasoning.effort: none
reasoning.effort: minimal
Tools in einer Chat-Completions-Anfrage
```

Wenn Sie von `gpt-6-sol` oder `gpt-6-luna` wechseln, die `none` akzeptieren, vergleichen Sie erneut mit `low`. Lassen Sie `none` nicht in der Anfrage stehen. Tools, Computerbedienung, Dateisuche und Websuche laufen über Responses. Chat Completions übernimmt Anfragen ohne Tools. Zu den auf der Modellseite genannten Responses-Tools gehören Websuche, Dateisuche, der Code Interpreter, Computerbedienung und MCP. Bildeingaben laufen über ein Content-Array in der Nutzernachricht.

In der kurzen Stufe entsprechen Eingabe- und Ausgabepreis denen von `gpt-6-sol`. Cache-Lesen sinkt von 0,20 USD auf 0,10 USD. Die Ausgabe der langen Stufe kostet bei beiden 15 USD, und Cache-Lesen in der langen Stufe sinkt von 0,40 USD auf 0,20 USD. Legen Sie beim Wechsel auf 6.1 den Modellnamen im fertigen Ergebnis fest. Landet eine Antwort auf einer anderen ID, ist das nicht dieser Wechsel.

## Prüfungen vor dem Umleiten von Traffic

1. Legen Sie `gpt-6.1-sol` fest. Auch der Modellname im fertigen Ergebnis muss diese ID sein.
2. Spielen Sie dasselbe Set ohne sensible Daten mit `low`, `medium`, `high`, `xhigh` und `max` ab. `none` und `minimal` stehen nicht auf dieser Modellkarte.
3. Senden Sie Tools über Responses. Lassen Sie Tools aus der Chat-Completions-Anfrage heraus.
4. Berechnen Sie einen Prompt mit höchstens 272.000 Eingabe-Token und einen mit mehr als 272.000. Für den zweiten gilt der Satz der langen Stufe für die gesamte Anfrage.
5. Planen Sie das Budget zuerst mit den beiden Standardzeilen. Für Fast, Batch, Flex und den regionalen Aufschlag gilt der Betrag, der tatsächlich im Nutzungsprotokoll steht.
6. Lesen Sie die Cache-Token im Nutzungsprotokoll, bevor Sie das Cache-Beispiel oben verwenden.
7. EU-Datenresidenz lässt sich nicht mit dem Fast-Modus kombinieren. Laut Modellseite wird Datenresidenz in den USA und in der EU unterstützt. Sie beschreibt Datenresidenz nicht als Parameter, den man an einem beliebigen Gateway hinzufügen kann.
8. Lassen Sie die schwierigste wissenschaftliche Forschung auf `gpt-6-astra`. `gpt-6-sol` steht weiterhin in der Preistabelle.

Ist das Modell gewählt, ergibt sich aus dem veröffentlichten Eintrag im Verzeichnis, ob ein Relay diese ID anbietet und welche Verfügbarkeit und welchen Preis es hat. Die Tabellen in diesem Artikel sind Listenpreise von OpenAI, nicht der Preis eines Relays nach dem Gruppenmultiplikator.
