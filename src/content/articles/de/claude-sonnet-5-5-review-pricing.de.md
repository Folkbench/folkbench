---
slug: claude-sonnet-5-5-review-pricing
translationKey: claude-sonnet-5-5-review-pricing
locale: de
kind: article
title: "Claude Sonnet 5.5: Spezifikationen, Listenpreise und veröffentlichte Benchmarks"
description: "Offizielle Spezifikationen, der Listenpreis von Sonnet 5 und die veröffentlichte Benchmark-Tabelle zu Claude Sonnet 5.5, dazu die Anfragen, die bei der Migration 400 zurückgeben. Diese Zahlen sind keine Messung von Folkbench."
category: Modelle
tags: [preise, benchmarks, api]
authorId: iris-wu
modelIds: [claude-sonnet-5-5, claude-sonnet-5, claude-opus-5-5, gpt-6-sol]
benchmarkSlugs: []
relatedSlugs: [claude-opus-5-5-review-pricing, gpt-6-1-sol-review-pricing]
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: sonnet-55-announcement
    label: Anthropic, Ankündigung von Claude Sonnet 5.5
    url: https://www.anthropic.com/claude-sonnet-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-55-overview
    label: Claude Platform, Modellseite zu Sonnet 5.5
    url: https://platform.claude.com/docs/en/models/sonnet-5-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-55-whats-new
    label: Claude Platform, Neuerungen in Sonnet 5.5
    url: https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-55-migration
    label: Claude Platform, Migration auf Sonnet 5.5
    url: https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-5-overview
    label: Claude Platform, Modellseite zu Sonnet 5
    url: https://platform.claude.com/docs/en/models/sonnet-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
---

> Spezifikationen, Listenpreise und Werte in diesem Artikel stammen von den öffentlichen Seiten von Anthropic, geprüft am 2. Oktober 2026. Folkbench hat diese Benchmarks nicht selbst wiederholt. Aussagen wie „bis zu 30 % günstiger“ und „mehr als 30 % schneller“ beschreiben den eigenen Testaufbau des Anbieters.

Claude Sonnet 5.5 wurde am 28. September 2026 angekündigt. Es ist das zweite Modell der Claude-5.5-Familie. Die Modell-ID in der Claude API lautet `claude-sonnet-5-5`. Anthropic stellt es neben [Opus 5.5](../claude-opus-5-5-review-pricing/): Klar umrissene Alltagsaufgaben, Bugfixes sowie Dokumente, Präsentationen und Tabellen sind Sache dieses Modells; komplexe, offene Arbeit, die anhaltendes Urteilsvermögen verlangt, bleibt laut der Ankündigung selbst eine Stärke von Opus 5.5. Der Listenpreis entspricht dem von Sonnet 5: 2 USD pro 1 Mio. Eingabe-Token, 10 USD pro 1 Mio. Ausgabe-Token und 0,20 USD pro 1 Mio. Token für das Lesen aus dem Cache.

Beide Ankündigungen schreiben, dass Haiku 5.5 in den kommenden Wochen folgt. Dieser Artikel nennt keinen Preis für eine ID, die noch in keiner Preistabelle steht.

## Veröffentlichte Spezifikationen

| Punkt | Claude Sonnet 5.5 |
| --- | --- |
| Modell-ID in der Claude API | `claude-sonnet-5-5` |
| Angekündigt am | 28. September 2026 |
| Kontext / maximale synchrone Ausgabe | 1 Mio. / 128.000 Token |
| Eingabe zu Ausgabe | Text und Bilder zu Text |
| Denken | Adaptiv, standardmäßig aktiv |
| Standard-Effort in der Claude API | `high` |
| Standard-Effort in den Claude-Apps und Claude Code | `medium` |
| Effort-Werte | `low`, `medium`, `high`, `xhigh`, `max` |
| Latenzklasse auf der Modellseite | Fast. Das ist ein Vergleich innerhalb der aktuellen Claude-Modellreihe, keine Messung in Token pro Sekunde |
| Verlässlicher Wissensstand | Juni 2026 |
| Kürzester cachebarer Prompt | 512 Token |
| Tokenizer | Derselbe wie bei Sonnet 5; derselbe Text ergibt dieselbe Tokenzahl |

Die Modellseite von Sonnet 5 führt dieses Modell weiterhin als Legacy und verfügbar, nennt weiterhin 2 USD / 10 USD für Eingabe und Ausgabe und einen verlässlichen Wissensstand von Januar 2026. Die Zusage zur Abkündigung lautet: nicht vor dem 30. Juni 2027. Die Neuerungsseite zu Sonnet 5.5 empfiehlt den Wechsel auf 5.5.

Die niedrigste Einstellung, die das vorgelagerte Denken abschaltet, ist `thinking: {"type": "between_tools"}`. Sie wird nur bei `low`, `medium` und `high` akzeptiert. Bei `xhigh` und `max` gilt wieder adaptives Denken. Laut Migrationsleitfaden führt ein vom Standard abweichender Wert für `temperature`, `top_p` oder `top_k` zu einem 400.

## Listenpreise

Preise in US-Dollar pro 1 Mio. Token. Die Spalte zu Sonnet 5.5 stammt von der Modellseite. Eingabe, Ausgabe und Cache-Lesen für Opus 5.5 stammen aus der Vergleichstabelle derselben Ankündigung. Laut Neuerungsseite behält Sonnet 5.5 die Preise von Sonnet 5 bei, einschließlich Prompt-Caching und Batch. Der Batch-Rabatt beträgt 50 % auf Eingabe und Ausgabe.

| Pro 1 Mio. Token | Sonnet 5.5 | Opus 5.5 laut Ankündigung |
| --- | --- | --- |
| Eingabe | 2 USD | 4 USD |
| Ausgabe | 10 USD | 20 USD |
| Cache-Lesen | 0,20 USD | 0,20 USD |
| Cache-Schreiben | 5 Minuten 2,50 USD; 1 Stunde 4 USD | In der Ankündigung als ein Wert von 5 USD abgedruckt; die Neuerungsseite teilt Opus 5.5 in 5 Minuten 5 USD und 1 Stunde 8 USD auf |
| Batch-Eingabe / -Ausgabe | 50 % des Listenpreises | Nicht in dieser Vergleichstabelle der Ankündigung |

Eingabe und Ausgabe kosten die Hälfte von Opus 5.5. Cache-Lesen kostet bei beiden 0,20 USD. Die Ankündigung druckt das Cache-Schreiben von Opus 5.5 als einen Wert von 5 USD und trennt die Stufen für 5 Minuten und 1 Stunde nicht. Die Modellseite von Sonnet 5.5 weist ihre beiden Stufen getrennt aus.

Anthropic nennt außerdem zwei Aussagen zur Arbeitslast: Dieselbe Arbeit braucht meist weniger Token, und die meisten Aufgaben kosten bis zu 30 % weniger; die Ausgabe wird mehr als 30 % schneller erzeugt als bei Sonnet 5. Die Kostendiagramme ergänzen Vergleiche pro Aufgabe von etwa einem Zehntel, einem Fünftel, einem Fünfzehntel und einem Neuntel. Das sind Ergebnisse aus dem eigenen Testaufbau. Eine echte Rechnung hängt weiterhin von Effort, Cache-Treffern, Tool-Runden und davon ab, ob der Aufruf über Batch läuft.

Drei Beispiele, die sich aus dem Listenpreis nachrechnen lassen. Jede Anfrage besteht aus 100.000 Eingabe-Token der genannten Art plus 5.000 Ausgabe-Token.

| Anfrage | Rechnung | Betrag |
| --- | --- | --- |
| 100.000 Eingabe ohne Cache, 5.000 Ausgabe | 0,1 × 2 USD + 0,005 × 10 USD | 0,25 USD |
| 100.000 Cache-Lesen, 5.000 Ausgabe | 0,1 × 0,20 USD + 0,005 × 10 USD | 0,07 USD |
| 100.000 Cache-Schreiben (5 Minuten), 5.000 Ausgabe | 0,1 × 2,50 USD + 0,005 × 10 USD | 0,30 USD |

Die dritte Zeile verwendet den Schreibpreis für 5 Minuten, nicht den Preis für 1 Stunde von 4 USD. Ein Schreibvorgang für 1 Stunde kostet 0,1 × 4 USD + 0,005 × 10 USD = 0,45 USD.

## So lesen Sie die Benchmarks der Ankündigung

Die folgende Tabelle ist die, die am 2. Oktober 2026 in der Ankündigung abgedruckt war. Ein Gedankenstrich steht für eine leere Zelle auf dieser Seite. Die Kostendiagramme zu Terminal-Bench 4.0 und CursorBench 4.0 verwenden GPT-5.6 Sol, weil OpenAI diese beiden Werte für GPT-6 Sol nicht veröffentlicht hat. Dieser Artikel füllt die Spalte GPT-6 Sol nicht mit den GPT-5.6-Sol-Punkten aus den Diagrammen auf.

| Benchmark | Sonnet 5.5 | Sonnet 5 | Opus 5.5 | GPT-6 Sol |
| --- | --- | --- | --- | --- |
| Terminal-Bench 4.0 | 70,6 % | 10,3 % | 66,4 % | — |
| FrontierCode v1.1 (Main) | 46,2 % (max); 52,1 % (xhigh) | 42,4 % | 54,4 % | 49,3 % |
| CursorBench 4.0 | 55,5 % | 34,1 % | 57,8 % | — |
| GDPval-AA v2.1 | 1844 | 1449 | 1846 | 1487 |
| AA-Briefcase v1.1 | 1811 | 1359 | 1822 | 1483 |
| Humanity's Last Exam, mit Tools | 64,5 % | 54,9 % | 67,7 % | — |
| OSWorld 2.1, partial | 80,1 % | 57,0 % | 81,8 % | — |
| Chartography, ohne Tools | 61,6 % | 15,6 % | 64,4 % | 53,6 % |

Diese Chartography-Zeile ist der Wert ohne Tools. Die Chartography-Zeile in der Ankündigung von Opus 5.5 ist eine Messung mit Tools, bei der Opus 5.5 auf 89,0 % kommt. Diese beiden Zellen stammen nicht aus demselben Lauf.

Lesen Sie die Fußnoten zusammen mit den Werten. Die Terminal-Bench-4.0-Zelle von Opus 5.5 gilt für xhigh, was die Ankündigung als höchsten Wert dieses Modells bezeichnet. Bei FrontierCode liegt Sonnet 5.5 mit max unter xhigh. Die Ankündigung erklärt das so: Mit max lief häufiger ein Code-Review-Durchgang, der auf Subagents verteilt wurde, und in Fällen, die Cognition untersucht hat, führte das zu einem Timeout oder zu Änderungen außerhalb der Aufgabe. Der Benchmark bestraft Änderungen außerhalb des Aufgabenbereichs.

Artificial Analysis hat GDPval-AA und AA-Briefcase auf einem Vorab-Deployment ausgeführt. Dieses Deployment hatte einen Fehler, der strukturierte Ausgaben schwächen konnte. Laut Ankündigung wurde der Fehler später behoben, und eine etwaige Auswirkung würde Sonnet 5.5 unterschätzen. Die GPT-6-Sol-Zellen für GDPval-AA, AA-Briefcase und Chartography tragen einen zweiten Hinweis: OpenAI hatte einen Fehler behoben, der das Bildverständnis beeinträchtigte, und diese externen Werte spiegeln das neuere Modell möglicherweise noch nicht wider.

Die Kostendiagramme auf derselben Seite sind eine andere Lesart. Medium-Effort ist der Standard in den Claude-Apps. Bei mehreren Benchmarks übertrifft Sonnet 5.5 mit Low oder Medium den besten Wert von Sonnet 5 zu etwa einem Zehntel der Kosten pro Aufgabe. High-Effort ist der Standard auf der Claude Platform. Laut Ankündigung liegt FrontierCode mit High etwa 10 Punkte über Sonnet 5 bei derselben Einstellung, zu etwa einem Fünfzehntel der Kosten pro Aufgabe, und erreicht den besten Wert von GPT-6 Sol zu etwa einem Fünftel der Kosten. CursorBench mit Low übertrifft den besten Wert von Sonnet 5 zu weniger als einem Zehntel der Kosten. AA-Briefcase mit Medium übertrifft den besten Wert von Sonnet 5 zu etwa einem Neuntel der Kosten.

Die abgedruckten 55,5 % und 1844 sind Punkte in der Tabelle. Die Kostenaussagen stammen aus einem anderen Testaufbau. Die Ankündigung schreibt außerdem, dass Opus 5.5 nach Anthropics eigener Nutzung und nach externen Tests bei komplexer, offener Arbeit mit anhaltendem Urteilsvermögen stärker bleibt. Kundenzitate sind ausgewählte Erfahrungsberichte und gehören nicht zur Tabelle. Die Ankündigung erwähnt zudem, dass dies das erste Sonnet-Modell ist, das Pokémon Rote Edition allein anhand von Screenshots durchgespielt hat. Das ist Produkterzählung, keine Zeile der Tabelle.

## Umstieg von Sonnet 5

Die Neuerungsseite nennt fünf Änderungen, durch die Code, der für Sonnet 5 geschrieben wurde, einen 400 zurückbekommt. Andere Anfragen gelingen weiterhin, während sich die Form der Antwort ändert.

```text
model: claude-sonnet-5-5
max_tokens: 1024
thinking: {"type": "adaptive"}
output_config.effort: medium
# 400: thinking-Typ disabled
# 400: thinking-Typ enabled mit budget_tokens
# 400: thinking-Typ between_tools bei effort xhigh oder max
# 400: tool_choice any oder tool_choice tool
# 400: temperature, top_p oder top_k mit Nicht-Standardwert
# 400, nur Claude API und Google Cloud: Tool-Typ computer_20251124
# 400: Advisor-Tool mit Opus 4.8, Opus 4.7 oder Sonnet 5 als Advisor
```

Um das vorgelagerte Denken abzuschalten, senden Sie `between_tools` und halten Effort bei `high` oder darunter. `between_tools` kann nicht zusätzlich `display`, `budget_tokens` oder `block_binding` enthalten. Lassen Sie `tool_choice` auf `auto` oder `none`. Für schemakonforme Tool-Argumente aktivieren Sie die strikte Tool-Nutzung oder verwenden strukturierte Ausgaben und schreiben im Prompt, wann ein Tool zum Einsatz kommt.

Computer Use wechselt auf der Claude API und Google Cloud zu `computer_toolset_20260801`. Laut Neuerungsseite akzeptiert Amazon Bedrock weiterhin `computer_20251124`.

Das Advisor-Tool akzeptiert Mythos 5.1, Fable 5.1, Mythos 5, Fable 5, Opus 5.5, Opus 5 oder Sonnet 5.5 selbst. Opus 4.8, Opus 4.7 und Sonnet 5 können einen Sonnet-5-Executor beraten. Einen Sonnet-5.5-Executor können sie nicht beraten. Advisor-Inhalte kommen verschlüsselt zurück, und der Client kann den Text nicht lesen.

Für Konten, die am oder nach dem 31. August 2026 um 00:00 UTC angelegt wurden, gibt es auf der Claude API, Amazon Bedrock und Google Cloud einen weiteren 400. Das erneute Senden eines Thinking-Blocks von Sonnet 5.5 schlägt fehl, wenn sich der System-Prompt, die Tool-Liste oder eine frühere Nachricht geändert hat, nachdem der Block erzeugt wurde. Führen Sie die Unterhaltung nur anhängend fort (append-only). Wenn sich Anweisungen ändern müssen, verwenden Sie eine Systemnachricht mitten in der Unterhaltung.

Wird Effort weggelassen, läuft die API mit `high`. Dasselbe Wort bringt nicht dieselbe Menge an Denken wie bei Sonnet 5. Die Neuerungsseite empfiehlt, die Effort-Stufen neu durchzutesten, statt die alte Einstellung zu übernehmen. Eine klar umrissene Tool-Schleife kann bei `medium` beginnen und bei längeren oder schwierigeren Aufgaben auf `high` wechseln. Eine latenzkritische Unterhaltung beginnt bei `medium` oder `low`. Die Claude-Apps und Claude Code verwenden bereits standardmäßig `medium`. Die Claude Platform verwendet standardmäßig `high`.

Fortschrittstext zwischen Tool-Aufrufen, der länger als ein, zwei Sätze ist, kommt innerhalb von Thinking-Blöcken zurück. Beim Standardwert `omitted` für display haben diese Blöcke leeren Text, sodass die Oberfläche zwischen den Tools still wird, während die Anfrage weiterhin gelingt. Mit `between_tools` kommt dieser Text als Zusammenfassung im Thinking-Block zurück, und beim erneuten Senden sieht das Modell die vollständige Notiz.

Ein Thinking-Block hält fest, welches Modell ihn erzeugt hat. Laut Neuerungsseite liest Sonnet 5.5 Thinking-Blöcke von Sonnet 5, Opus 4.8, Haiku 4.5 und älteren Modellen, aber keine Blöcke von Opus 5, Opus 5.5, Fable oder Mythos. Auf der Claude API und Google Cloud kann Opus 5.5 Thinking-Blöcke von Sonnet 5.5 lesen, kein anderes aktuelles Modell kann das. Ein Block, den das Zielmodell nicht lesen kann, wird verworfen, bevor das Modell ihn sieht. Die Anfrage gelingt weiterhin, und verworfene Blöcke werden nicht berechnet.

Eine abgelehnte Anfrage liefert HTTP 200 mit `stop_reason` `"refusal"`. Laut Ankündigung liegen die Fähigkeiten im Bereich Cybersicherheit nahe an Opus 5, deshalb ist dies das erste Sonnet-Modell, das mit dieser Art von Cybersicherheits-Schutzmaßnahme startet. Cybersicherheitsaufgaben mit höherem Risiko fallen auf Sonnet 5 zurück. Die Schutzmaßnahmen im Bereich Biologie entsprechen denen von Sonnet 5. Normale Softwareentwicklung und die meisten Arbeiten in den Lebenswissenschaften fallen nicht unter diese beiden engen Schutzmaßnahmen. Die Ankündigung schreibt außerdem, dass Sonnet 5.5 mit Zero Data Retention angeboten werden kann.

## Prüfungen vor dem Umstellen des Traffics

1. Pinnen Sie `claude-sonnet-5-5`. Prüfen Sie auch den Modellnamen im abgeschlossenen Ergebnis. Wenn die Cybersicherheits-Schutzmaßnahme auf das ältere Modell zurückfällt, kann Sonnet 5 das antwortende Modell sein.
2. Spielen Sie einen Satz ohne sensible Daten bei `low`, `medium`, `high`, `xhigh` und `max` erneut ab. Erfassen Sie Erfolgsrate, Latenz, Eingabe, Cache-Lesen, Cache-Schreiben, Ausgabe und Kosten.
3. Setzen Sie Effort in `output_config.effort`. Legen Sie die Denktiefe dieses Modells nicht mit einem manuellen `budget_tokens`-Budget fest.
4. Passen Sie Clients, die `disabled`, eine erzwungene Tool-Auswahl, Sampling-Parameter oder `computer_20251124` senden, an, bevor Sie das Volumen erhöhen. Das ältere Computer-Tool auf Bedrock ist die Ausnahme.
5. Führen Sie Unterhaltungen, die Thinking-Blöcke erneut senden, nur anhängend fort.
6. Zählen Sie HTTP-200-Ablehnungen getrennt von Transportfehlern.
7. Prüfen Sie den abgerechneten Betrag mit einem kurzen Prompt und einem Prompt, der den Cache treffen sollte. Schreiben für 5 Minuten, Schreiben für 1 Stunde und der Batch-Rabatt von 50 % sind unterschiedliche Preisstufen.
8. Belassen Sie komplexe, offene Arbeit mit anhaltendem Urteilsvermögen auf `claude-opus-5-5`. Die Modellseite von Sonnet 5 führt `claude-sonnet-5` weiterhin als verfügbar. Die Preisstufen auf der OpenAI-Seite finden Sie unter [GPT-6.1 Sol](../gpt-6-1-sol-review-pricing/).

Ob ein Relay diese ID anbietet und welche Verfügbarkeit und welchen Preis es zu diesem Zeitpunkt hat, steht nach der Modellwahl im veröffentlichten Verzeichniseintrag. Dieser Artikel vergleicht keine Relays.
