---
slug: ai-api-relay-software-engineering-evaluation-guide
translationKey: ai-api-relay-software-engineering-evaluation-guide
locale: de
kind: article
title: "So testen Sie ein KI-Relay für die Softwareentwicklung"
description: "Prüfungen für Codegenerierung, Agent-Toolchains, langen Kontext und Cache-Protokolle, wenn ein Relay Teil eines Softwareentwicklungs-Workflows ist."
category: Softwareentwicklung
tags: [softwareentwicklung, agents, codegenerierung]
authorId: noah-park
modelIds: []
benchmarkSlugs: []
relatedSlugs: [ai-api-relay-stability-guide, ai-chinese-writing-models-api-relay-user-submission, llm-api-relay-gray-industry-user-submission]
publishedAt: '2026-09-17'
updatedAt: '2026-09-17'
sources: []
---

> **Beitrag der Redaktion**

Betrachtet man ein KI-Relay (API-Gateway / Aggregator) aus Sicht der Softwaretechnik, ist es ein Proxy auf der Anwendungsschicht (L7) mit einem Zustandsautomaten-Parser und einem Kontext-Scheduler.

Die Anforderungen haben sich grundlegend verändert, seit auf die einzeilige Vervollständigung in der IDE Terminal-Agents wie Claude Code CLI und OpenAI Codex CLI sowie Specification-Driven Development gefolgt sind. Lassen wir allgemeine Gateway-Kennzahlen wie Netzwerkstabilität und Lasttests mit hoher Parallelität beiseite. Für die Codegenerierung lautet die Frage: Zerstört der Proxy die Syntax, unterbricht er den Zustandsautomaten des Agents, verwirft er Abhängigkeiten im langen Kontext oder entfernt er das Optimierungsprotokoll, das der Coding-Client gesendet hat?

Vier technische Dimensionen decken diese Frage ab.

## 1. Syntax- und Escape-Integrität

Generierter Code reagiert empfindlich auf Zeichen und Formatierung. Er ist kein gewöhnlicher Fließtext. Er enthält Einrückungen, Zeilenumbrüche, Escape-Sequenzen und eingebettetes JSON oder XML.

### 1. Verlustfreies Escaping

- **Warum es bricht:** Ein SSE-Code-Chunk enthält `\n`, `\t`, `\"`, ein Regex-`\\d` oder einen JSON-String. Löst das Relay beim Zusammensetzen der Chunks Escapes auf oder kodiert es um, kann ein mehrbytiges UTF-8-Zeichen zerschnitten werden, und der Client erhält Code, der sich nicht parsen lässt.
- **So testen Sie:** Fordern Sie Code mit extremen Escapes an: einen komplexen regulären Ausdruck, Python mit verschachtelten JSON-Strings und C++ mit Zeigern und Makros.
- **Abnahmekriterium:** Schreiben Sie den Stream des Relays in eine Datei und parsen Sie ihn mit einem lokalen Linter (`eslint`, `flake8`) oder einem AST-Parser (Babel oder Tree-sitter). Die AST-Parse-Erfolgsrate muss 100 % betragen.

### 2. Leerraum und Einrückung

- **Warum es bricht:** Python und YAML nutzen Einrückung für den Gültigkeitsbereich. `\n` statt `\r\n` verändert einen Git-Diff.
- **So testen Sie:** Senden Sie ein Refactoring tief verschachtelter Logik, etwa einer Python-Funktion innerhalb von 8 Schleifenebenen.
- **Abnahmekriterium:** Leerzeichen und Tabs in der Relay-Ausgabe müssen auf Byte-Ebene zu 100 % mit der Upstream-Ausgabe übereinstimmen. Das Relay darf Leerraum weder „verschönern“ noch komprimieren.

## 2. Tool-Aufrufe und strukturierte Ausgabe

Ein Coding-Agent gibt nicht nur Markdown aus. Er ruft Tools wie `read_file`, `edit_file` und `run_terminal_command` auf.

### 1. Treue zum JSON-Schema

- **Warum es bricht:** Eine lokale Änderung ist strukturiertes JSON mit Feldern wie `path`, `old_str` und `new_str`. Zerstört das Relay diese Serialisierung oder verwirft es ein verschachteltes Feld, scheitert der Agent beim Parsen und stürzt ab.
- **So testen Sie:** Lassen Sie eine Agent-Aufgabe laufen, die mehrere Dateien gemeinsam ändert, zum Beispiel ein Interface-Refactoring über 5 TypeScript-Dateien, und zeichnen Sie den weitergeleiteten Body des Tool-Aufrufs auf.
- **Abnahmekriterium:** Das weitergeleitete Tool-Aufruf-Objekt muss mit dem der offiziellen Upstream-API übereinstimmen. Kein fehlendes Feld, keine Typänderung wie String zu Number und kein vorzeitig abgeschnittenes JSON.

### 2. Zustand über mehrere Runden

- **Warum es bricht:** Ein schwieriger Bug braucht oft 10–30 Runden: Datei lesen, Änderung versuchen, Tests laufen lassen, Fehler lesen, erneut ändern. Das Relay muss `tool_use` in `role: "assistant"` und `tool_result` in `role: "user"` für die gesamte Kette weiterleiten.
- **So testen Sie:** Führen Sie ein echtes Agent-Debugging mit mehr als 10 Runden durch.
- **Abnahmekriterium:** In Runde N leitet das Relay noch jede Tool-Aufruf-ID und jeden Zustandsknoten aus den vorherigen N−1 Runden weiter. Verlauf und Zustand dürfen weder verloren gehen noch durcheinandergeraten.

## 3. Langer Code-Kontext und Prompt-Caching

Der Kontext einer mittleren oder großen Codebasis umfasst oft 100.000–200.000 Token.

### 1. Weitergabe von Cache-Control

- **Warum es bricht:** Eine Architekturspezifikation und gemeinsamer Basiscode bleiben unverändert. Der Agent markiert sie mit `cache_control`, damit der Modelldienst den KV-Cache wiederverwenden kann. Entfernt das Relay diese Markierung, läuft für eine einzeilige Änderung erneut ein Prefill über Hunderttausende Token.
- **So testen Sie:** Senden Sie wiederholt einen technischen Kontext von 100.000 Token mit `cache_control`.
- **Abnahmekriterium:**
  - Auf der Anfrageseite enthält der Upstream-Body weiterhin `cache_control`.
  - Auf der Antwortseite liefert `usage` den Wert `cache_read_input_tokens` zurück.

### 2. Die Nadel in der Codebasis

- **Warum es bricht:** Ein Relay kürzt den Prompt womöglich per RAG, komprimiert ihn oder tauscht ein kleineres Modell ein, um Kosten zu sparen – und der Blick des Modells auf das Repository schrumpft.
- **So testen Sie:** Verstecken Sie in einem Repository mit 150.000 Token eine Interface-Definition am Anfang in Datei A und die Aufrufstelle am Ende in Datei B, füllen Sie die Mitte mit unzusammenhängendem Code und fragen Sie, wie das Interface zu ändern ist.
- **Abnahmekriterium:** Vergleichen Sie die Änderung des Relays mit einem direkten Aufruf der offiziellen API. Übersieht das Relay wegen des gekürzten Kontexts eine dateiübergreifende Variable oder einen Typ, wurde der Kontext beschädigt.

## 4. Vollständige Ausgabe und Schutz der Anweisungen

Das typische Fehlerbild: ein Modul mit 500 Zeilen, das bei Zeile 300 abbricht.

### 1. Maximale Ausgabelänge

- **Warum es bricht:** Das Refactoring einer einzelnen Datei kann 4.000, 8.000 oder sogar 16.000 Token Code in einer Antwort erfordern. Ein kleiner Proxy-Puffer oder ein kurzer Timeout schneidet die Datei in der Mitte ab.
- **So testen Sie:** Fordern Sie ein langes Modul ohne Füllcode an, etwa einen Parser mit Hunderten von Enums und Konvertierungen.
- **Abnahmekriterium:** Das Relay muss das maximale `max_tokens` des Modells durchreichen können. Der abschließende `finish_reason` muss `"stop"` oder `"length"` sein. Ein vorzeitiges EOF gilt als nicht bestanden.

### 2. Integrität des Systemprompts

- **Warum es bricht:** Ein Coding-Agent legt strenge Regeln im Systemprompt fest, etwa den Strict Mode von TypeScript oder JSDoc für jede Funktion. Manche Relays schleusen einen eigenen globalen Prompt ein oder kürzen den Systemprompt.
- **So testen Sie:** Senden Sie einen Systemprompt mit einer markanten Code-Style-Vorgabe und fordern Sie Code an.
- **Abnahmekriterium:** Der Code hält diese Vorgabe ein, und ein Paketmitschnitt zeigt, dass der Systemprompt um kein einziges Byte verändert wurde.

## Checkliste

| Dimension | Was getestet wird | Abnahmekriterium |
| --- | --- | --- |
| Zeichen und Syntax | Escapes, Einrückung, Zeilenumbrüche | Lokaler AST-/Linter-Parse gelingt, 100 % Übereinstimmung |
| Agent-Toolchain | Form der Tool-Aufrufe und Zustand über mehrere Runden | Keine JSON-Parse-Fehler und eine Tool-Zustandskette über 10+ Runden |
| Kontext und Cache | Weitergabe des Prompt-Caches und echter Kontext | `cache_control` wird nicht entfernt, und eine Codebasis mit 150.000 Token behält dateiübergreifende Abhängigkeiten |
| Vollständige Generierung | Grenze für lange Ausgaben und Schutz des Systemprompts | 8.000+ Token durchgehender Code und ein byte-genau unveränderter Systemprompt |
