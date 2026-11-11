---
slug: claude-opus-5-5-review-pricing
translationKey: claude-opus-5-5-review-pricing
locale: de
kind: article
title: "Claude Opus 5.5: technische Daten, Listenpreise und veröffentlichte Benchmarks"
description: "Offizielle technische Daten, Listenpreise und die veröffentlichte Benchmark-Tabelle von Claude Opus 5.5 sowie die Anfragen, die bei der Migration mit 400 abgelehnt werden. Die Zahlen stammen von den Seiten des Anbieters, nicht aus einer Folkbench-Messung."
category: Modelle
tags: [preise, benchmarks, api]
authorId: iris-wu
modelIds: [claude-opus-5-5, claude-opus-5, claude-fable-5-1, claude-sonnet-5-5, gpt-6-astra, gpt-5-6-sol]
benchmarkSlugs: []
relatedSlugs: [claude-sonnet-5-5-review-pricing, gpt-6-1-sol-review-pricing]
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: opus-55-announcement
    label: Anthropic, Ankündigung von Claude Opus 5.5
    url: https://www.anthropic.com/claude-opus-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: opus-55-overview
    label: Claude Platform, Modellseite zu Opus 5.5
    url: https://platform.claude.com/docs/en/models/opus-5-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
  - id: opus-55-whats-new
    label: Claude Platform, Neuerungen in Opus 5.5
    url: https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-5-overview
    label: Claude Platform, Modellseite zu Sonnet 5
    url: https://platform.claude.com/docs/en/models/sonnet-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
---

> Die technischen Daten, Listenpreise und Werte unten sind von Anthropic oder von den öffentlichen Seiten übernommen, die Anthropic zitiert. Geprüft wurden sie am 2. Oktober 2026. Folkbench hat diese Benchmarks nicht selbst wiederholt. Aussagen wie „etwa 40 % weniger“ und „etwa ein Fünftel der Kosten“ beschreiben den eigenen Testaufbau des Anbieters.

Claude Opus 5.5 wurde am 22. September 2026 angekündigt. Es ist das erste Modell der Claude-5.5-Familie. Die Modell-ID in der Claude API lautet `claude-opus-5-5`. Die Modellseite nennt ein Kontextfenster von 1 Mio. Token, maximal 128.000 Ausgabe-Token, adaptives Denken, das immer aktiv bleibt, einen Standard-Effort von `medium` und einen Listenpreis von 4 USD pro Million Eingabe-Token und 20 USD pro Million Ausgabe-Token. Eine Parameterzahl oder Angaben zur Rechenleistung im Training nennen die öffentlichen Seiten nicht.

Drei Abgleiche auf denselben Seiten genügen für die Einordnung. Der Listenpreis liegt unter Opus 5 und deutlich unter Fable 5.1 mit 10 / 50 USD. In den Zeilen zu Coding und Wissensarbeit, die in der Ankündigung abgedruckt sind, liegt Opus 5.5 vor Fable 5.1 und Opus 5, und in den meisten dieser Zeilen auch vor GPT-6 Astra. Zwei Zeilen zeigen in die andere Richtung: Bei Terminal-Bench-Science 0.1 und bei Zapiers AutomationBench liegt Astra nach Punktschätzung vorn. Für klar abgegrenzte Alltagsarbeit lesen Sie [Claude Sonnet 5.5](../claude-sonnet-5-5-review-pricing/). Zu den Preisstufen für langen Kontext bei OpenAI lesen Sie [GPT-6.1 Sol](../gpt-6-1-sol-review-pricing/).

## Veröffentlichte technische Daten

| Merkmal | Claude Opus 5.5 |
| --- | --- |
| Modell-ID in der Claude API | `claude-opus-5-5` |
| Ankündigungsdatum | 22. September 2026 |
| Kontextfenster | 1 Mio. Token |
| Max. Ausgabe | 128.000 Token |
| Max. Ausgabe in der Batch API | 300.000 Token, Beta-Header `output-300k-2026-03-24` |
| Eingabe zu Ausgabe | Text und Bilder zu Text |
| Denken | Adaptiv, immer aktiv |
| Standard-Effort | `medium` |
| Effort-Werte | `low`, `medium`, `high`, `xhigh`, `max` |
| Latenzklasse auf der Modellseite | Mittel |
| Verlässlicher Wissensstand | Juni 2026 |
| Kürzester cachebarer Prompt | 512 Token |
| Parameterzahl | Nicht auf der öffentlichen Modellseite |

Der verlässliche Wissensstand ist das Datum, bis zu dem das eingebaute Wissen des Modells als am stärksten beschrieben wird. Er ist nicht dasselbe wie das Kontextfenster. Dateien, die einer Anfrage beigefügt sind, liegen trotzdem im Kontext dieser Anfrage.

Fast Mode ist ein Tempo-Schalter auf derselben Modell-ID. Die Neuerungsseite bezeichnet ihn als Research Preview, die nur in der Claude API verfügbar ist. Eine Anfrage setzt `speed: "fast"` und sendet den Beta-Header `fast-mode-2026-02-01`. Die Ankündigung nennt einen Preis von 8 / 40 USD pro Million Token und eine bis zu etwa 2,5-fache Ausgabegeschwindigkeit. Laut Ankündigung können Claude Code und die Claude Platform ihn nutzen. Laut Neuerungsseite bieten Amazon Bedrock, Claude Platform on AWS, Google Cloud und Microsoft Foundry diesen Fast Mode nicht an.

Ein manuell gesetztes Denkbudget wird abgelehnt. Die Denktiefe wird über Effort gesteuert.

## Listenpreise

Preise in US-Dollar pro Million Token. Die Preise für 5-Minuten-Cache-Schreiben, 1-Stunden-Cache-Schreiben und Batch bei Opus 5.5 stammen von der Neuerungsseite. Das Cache-Schreiben von Opus 5 ist die einzelne Zelle „cache writes“ im Vergleich der Ankündigung, der nicht zwischen 5-Minuten- und 1-Stunden-Stufe unterscheidet. Eingabe- und Ausgabepreise für Fable 5.1, Sonnet 5.5 und Haiku 4.5 stammen aus dem Vergleich auf der Modellseite. Sonnet 5 ist weiterhin als Legacy markiert, und seine Modellseite nennt dieselben Eingabe- und Ausgabepreise wie Sonnet 5.5. Ein Gedankenstrich bedeutet, dass dieser Artikel die Zelle nicht aus einer primären Preiszeile übernommen hat.

| Pro 1 Mio. Token | Opus 5.5 | Opus 5 | Fable 5.1 | Sonnet 5.5 | Haiku 4.5 |
| --- | --- | --- | --- | --- | --- |
| Eingabe | 4 USD | 5 USD | 10 USD | 2 USD | 1 USD |
| Ausgabe | 20 USD | 25 USD | 50 USD | 10 USD | 5 USD |
| Cache-Lesen | 0,20 USD | 0,50 USD | — | 0,20 USD | — |
| Cache-Schreiben | 5 Minuten 5 USD; 1 Stunde 8 USD | 6,25 USD | — | 5 Minuten 2,50 USD; 1 Stunde 4 USD | — |
| Batch-Eingabe / -Ausgabe | 2 USD / 10 USD | — | — | 50 % des Listenpreises | — |
| Fast-Mode-Eingabe / -Ausgabe | 8 USD / 40 USD | — | — | — | — |

Eingabe ohne Cache und Ausgabe kosten 20 % weniger als bei Opus 5: statt 5 / 25 USD nun 4 / 20 USD. Laut Ankündigung sinkt Cache-Lesen von 0,50 USD auf 0,20 USD, und diese Lesezugriffe machen den Großteil der Rechnung bei Agent- und Coding-Arbeit aus. Anthropic macht außerdem eine Aussage zur Arbeitslast: Bei Standardeinstellungen kostet eine typische Aufgabe etwa 40 % weniger als mit Opus 5, weil das Modell auch weniger Token verbraucht. Diese 40 % beschreiben den eigenen Testaufbau von Anthropic. Eine echte Rechnung hängt weiterhin von Effort, Cache-Treffern, Tool-Runden und davon ab, ob der Aufruf über Batch oder Fast Mode läuft.

Batch-Verarbeitung kostet die Hälfte des neuen Listenpreises. Fast Mode kostet das Doppelte des neuen Listenpreises, und die Neuerungsseite beschränkt ihn auf die Claude API.

Drei Beispiele, die sich aus dem Listenpreis nachrechnen lassen. Jede Anfrage besteht aus 100.000 Eingabe-Token der jeweiligen Art plus 5.000 Ausgabe-Token. Die Cache-Zeile setzt voraus, dass der Nutzungsdatensatz diese Token tatsächlich als Lesezugriffe zählt.

| Anfrage | Rechnung | Betrag |
| --- | --- | --- |
| 100.000 Eingabe ohne Cache, 5.000 Ausgabe | 0,1 × 4 USD + 0,005 × 20 USD | 0,50 USD |
| 100.000 Cache-Lesen, 5.000 Ausgabe | 0,1 × 0,20 USD + 0,005 × 20 USD | 0,12 USD |
| 100.000 5-Minuten-Cache-Schreiben, 5.000 Ausgabe | 0,1 × 5 USD + 0,005 × 20 USD | 0,60 USD |

Ein 1-Stunden-Cache-Schreiben rechnet mit 8 USD statt mit den 5 USD oben. Der Preis eines Relays oder eines Cloud-Marktplatzes ist nicht Teil dieser Tabelle.

## Was sich gegenüber Opus 5 und Fable 5.1 ändert

| Verhalten | Opus 5.5 | Opus 5 | Fable 5.1 |
| --- | --- | --- | --- |
| API-ID | `claude-opus-5-5` | `claude-opus-5` | `claude-fable-5-1` |
| Kontext / max. Ausgabe | 1 Mio. / 128.000 | 1 Mio. / 128.000 | 1 Mio. / 128.000 |
| Denken | Immer aktiv. `disabled` und ein manuelles Budget liefern 400 | Standardmäßig aktiv. `disabled` wird bei Effort `high` oder niedriger akzeptiert | Laut Modellseite immer aktiv |
| Standard ohne Effort-Angabe | `medium` | `high` | `high` |
| Verlässlicher Wissensstand | Juni 2026 | Hier nicht gesondert zitiert | Juni 2026 |
| Listenpreis Eingabe / Ausgabe | 4 USD / 20 USD | 5 USD / 25 USD | 10 USD / 50 USD |
| Cache-Lesen | 0,20 USD | 0,50 USD | — |

Die Neuerungsseite fasst vier Änderungen zusammen, an denen für Opus 5 geschriebener Code scheitert. Die ersten drei gelten auch für Fable 5.1. Wer nur den Modellnamen austauscht, stößt trotzdem auf sie.

```text
model: claude-opus-5-5
thinking: {"type": "adaptive"}
tool_choice: {"type": "auto"}
output_config.effort: medium
# 400: thinking-Typ disabled oder enabled mit budget_tokens
# 400: tool_choice any oder tool_choice tool
# 400, nur Claude API und Google Cloud: Tool-Typ computer_20251124
```

Lassen Sie `thinking` weg oder senden Sie `adaptive`. Beides ist gleichwertig. Die `tool_choice`-Werte `auto` und `none` funktionieren weiterhin, auch am Endpunkt für die Token-Zählung. Für schemakonformes JSON verweist die Neuerungsseite auf Strict Tool Use oder Structured Outputs und darauf, im Prompt anzugeben, wann ein Tool zum Einsatz kommt.

Ersetzen Sie in der Claude API und in Google Cloud `computer_20251124` durch `computer_toolset_20260801` und entfernen Sie den alten Beta-Header für Computer Use. Laut Neuerungsseite akzeptiert Opus 5.5 auf Amazon Bedrock weiterhin `computer_20251124`. Eine Integration, die bereits das neuere Toolset nutzt, braucht wegen dieser Änderung keinen neuen Code.

Der vierte 400-Fehler betrifft die Bindung von Denkblöcken. Bei Konten, die am oder nach dem 31. August 2026 um 00:00 Uhr UTC erstellt wurden, liefert das erneute Mitsenden eines Opus-5.5-Denkblocks in der Claude API und auf Cloud-Plattformen einen 400-Fehler, wenn der System-Prompt, die Tool-Liste oder eine frühere Nachricht nach der Erzeugung dieses Blocks geändert wurde. Der dokumentierte Ansatz ist ein Verlauf, an den nur angehängt wird. Wenn sich Anweisungen ändern müssen, verwenden Sie eine Systemnachricht mitten im Gespräch. Ältere Konten aktivieren dieselbe Prüfung ausdrücklich per Opt-in.

Drei Verhaltensweisen ändern sich, auch wenn die Anfrage erfolgreich ist. Ohne Effort-Angabe läuft das Modell jetzt mit `medium`. Dieselbe Auslassung lief bei Opus 5 mit `high`. Bei gleichem Effort denkt Opus 5.5 pro Runde tendenziell mehr als Opus 5, am stärksten bei `xhigh` und `max`. Ein Effort-Wert, der aus einer alten Konfiguration übernommen wird, ist ein neuer Kostenpunkt, und `max_tokens` muss Platz für Denkblöcke lassen.

Text, der zwischen Tool-Aufrufen geschrieben wird, kommt innerhalb von Denkblöcken zurück. Beim Standard-Anzeigewert `omitted` enthalten diese Blöcke leeren Text. Eine Oberfläche, die diesen Text früher als Fortschritt gestreamt hat, verstummt, obwohl die Anfrage weiterhin erfolgreich ist. Ein Produkt, das die Fortschrittszeilen braucht, setzt einen Anzeigewert und wählt die Blöcke nach `type` aus, nicht nach Position.

Ein Biologie-Klassifikator läuft parallel zum Cybersecurity-Klassifikator. Ein Prompt, der das Modell dazu drängt, sein Reasoning in die sichtbare Antwort zu kopieren, kann als `reasoning_extraction` abgelehnt werden. Die Neuerungsseite sagt außerdem, dass Diagramme und Screenshots schon vor dem Hinzufügen eines Vision-Tools genauer gelesen werden. Prompts, die eine schwächere Bilderkennung ausgleichen sollten, lohnt es sich daher, separat erneut zu testen.

Eine abgelehnte Anfrage liefert HTTP 200 mit `stop_reason` `"refusal"`. Das ist kein Übertragungsfehler. Ob sie abgerechnet wird, hängt von der Ablehnungskategorie ab, und sie zählt weiterhin gegen die Rate Limits.

## Wie man die Benchmarks der Ankündigung liest

Die folgende Tabelle ist diejenige, die in der Ankündigung abgedruckt war, Stand 2. Oktober 2026. Sofern keine Fußnote etwas anderes sagt, nutzt Opus 5.5 adaptives Denken mit maximalem Effort. Terminal-Bench 4.0 ist diese Fußnote: Opus 5.5 läuft mit `xhigh`, GPT-6 Astra mit `high`, und jede Zelle ist der höchste veröffentlichte Wert des jeweiligen Modells. Die Werte für Astra und GPT-5.6 Sol sind aus den Berichten von OpenAI zitiert. Die Schutzmechanismen des Produktivbetriebs waren aktiv. Griffen sie ein, wurden Cybersecurity-Aufgaben von Opus 4.8 und Aufgaben zu Biologie und Frontier-LLM-Entwicklung von Opus 5 erledigt. Laut Anthropic senkt das die Werte von Opus 5.5.

| Benchmark | Opus 5.5 | Fable 5.1 | Opus 5 | GPT-6 Astra | GPT-5.6 Sol |
| --- | --- | --- | --- | --- | --- |
| Terminal-Bench 4.0 | 66,4 % | 55,8 % | 52,3 % | 57,9 % | 37,3 % |
| FrontierCode v1.1 (Main) | 54,4 % | 50,3 % | 48,0 % | 53,3 % | 47,5 % |
| CursorBench 4.0 | 57,8 % | 51,8 % | 46,6 % | — | 41,7 % |
| GDPval-AA v2.1 | 1846 | 1735 | 1708 | 1542 | 1588 |
| AutomationBench | 40,0 % | 31,4 % | 26,9 % | 41,4 % | 28,8 % |
| Humanity's Last Exam, mit Tools | 67,7 % | 65,6 % | 63,6 % | 57,2 % | — |
| Terminal-Bench-Science 0.1 | 58,7 % | 52,6 % | 29,0 % | 64,6 % | 22,4 % |
| OSWorld 2.1, partial | 81,8 % | 80,7 % | 74,0 % | — | — |
| Chartography, mit Tools | 89,0 % | 88,4 % | 83,4 % | — | — |

Lesen Sie die Abstände zusammen mit den veröffentlichten Fehlermargen. Bei Terminal-Bench 4.0 liegt die Marge für Opus 5.5 bei ±2,6 Punkten, für die anderen Claude-Modelle bei ±1,6 bis ±2 Punkten. Der Abstand von 66,4 % zu Astras 57,9 % und zu Fables 55,8 % ist größer als diese Margen. Dieselbe Fußnote sagt, dass die öffentliche Rangliste Opus 5 mit 51,8 % führt und der eigene Aufbau von Anthropic 52,3 % reproduziert – innerhalb des Rauschens.

Bei Terminal-Bench-Science liegt die Marge bei ±3,5 bis ±5 Punkten pro Modell. Astras 64,6 % gegenüber den 58,7 % von Opus 5.5 liegen nahe an der Breite dieser Margen. Nach Punktschätzung liegt Astra vorn. Die öffentliche Rangliste führt Opus 5 mit 30,0 %, der Aufbau von Anthropic reproduziert 29,0 %.

AutomationBench wird von Zapier durchgeführt. Weil dieser Lauf kein Ausweichmodell hatte, zählte ein Eingreifen der Schutzmechanismen als Fehlschlag. Laut Anthropic wäre der praktische Wert höher. Die abgedruckten 40,0 % gegenüber Astras 41,4 % sind ein knappes veröffentlichtes Ergebnis, und nach Punktschätzung liegt Astra vorn. GDPval-AA v2.1 ist ein Elo-Wert über echte berufliche Aufgaben aus 44 Berufen: Opus 5.5 kommt auf 1846, Fable 5.1 auf 1735, Opus 5 auf 1708, Sol auf 1588 und Astra auf 1542.

Die Kostendiagramme auf derselben Seite zeigen ein zweites Wertepaar beim Standard-Effort `medium`: FrontierCode 54,6 % und CursorBench 52,5 %. Die Vergleichstabelle nennt 54,4 % und 57,8 %. Behandeln Sie das als zwei Zahlen bei zwei Effort-Einstellungen. Die Anmerkung zum Diagramm sagt außerdem, dass FrontierCode bei mittlerem Effort Astras Höchstwert von 53,3 % zu etwa einem Fünftel der Kosten pro Aufgabe übertrifft und Terminal-Bench mit Astra zu etwa 40 % der Kosten gleichzieht. Das sind Aussagen zu Kosten pro Aufgabe auf dem eigenen Testaufbau von Anthropic.

Der Satz unter der Tabelle ist der, den man sich merken sollte: Im eigenen Einsatz bei Anthropic ist der Abstand zwischen Opus 5.5 und Fable 5.1 kleiner, als die Werte vermuten lassen, und Benchmark-Abstände auf diesem Niveau sind ein schwächerer Wegweiser für echte Aufgaben. Kundenzitate in der Ankündigung sind ausgewählte Aussagen. Sie können Hinweise geben, was man erneut testen sollte. Teil der Tabelle sind sie nicht.

## Prüfungen vor dem Umstellen des Traffics

1. Pinnen Sie `claude-opus-5-5`. Prüfen Sie auch den Modellnamen im abgeschlossenen Ergebnis. Greifen die Schutzmechanismen ein, kann eine Cybersecurity-Aufgabe von Opus 4.8 und eine Aufgabe zu Biologie oder Frontier-LLM-Entwicklung von Opus 5 erledigt werden. Das angefragte Modell im Log kann trotzdem `claude-opus-5-5` lauten.
2. Spielen Sie einen Satz ohne sensible Daten mit `low`, `medium`, `high`, `xhigh` und `max` erneut ab. Erfassen Sie Erfolg, Laufzeit, Eingabe, Cache-Lesen, Cache-Schreiben, Ausgabe und Kosten.
3. Senden Sie weder `thinking: {"type": "disabled"}` noch ein manuelles Budget mit `budget_tokens`. Setzen Sie Effort explizit. Ohne Angabe läuft das Modell hier mit `medium`, nicht mit `high` wie bei Opus 5.
4. Verwenden Sie für `tool_choice` nur `auto` oder `none`. In der Claude API und in Google Cloud wechselt Computer Use zu `computer_toolset_20260801`.
5. Führen Sie Gespräche, die Denkblöcke erneut mitsenden, nur durch Anhängen fort. Konten, die am oder nach dem 31. August 2026 erstellt wurden, erhalten einen 400-Fehler, wenn sich das Präfix vor einem Opus-5.5-Denkblock ändert.
6. Zählen Sie Ablehnungen mit HTTP 200 getrennt von Übertragungsfehlern.
7. Prüfen Sie den abgerechneten Betrag mit einem kurzen Prompt und einem Prompt, der den Cache treffen sollte. 5-Minuten-Schreiben, 1-Stunden-Schreiben, Batch und Fast Mode sind vier verschiedene Preiskarten.
8. Für klar abgegrenzte Arbeit, die diese Opus-Schleife nicht braucht, bleiben Sie bei der Preiskarte von 2 / 10 USD für [Sonnet 5.5](../claude-sonnet-5-5-review-pricing/). Bei wissenschaftlichen Agent-Aufgaben und den Geschäfts-Workflows von Zapier liegt Astra nach den abgedruckten Punktschätzungen vorn.

Ist das Modell gewählt, kommen die Angaben, ob ein Relay diese ID anbietet, sowie dessen veröffentlichte Verfügbarkeit und Preis aus dem Verzeichniseintrag. Dieser Artikel vergleicht keine Relays und macht aus einem Listenpreis des Anbieters keinen tatsächlich berechneten Preis eines Relays.
