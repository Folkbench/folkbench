---
slug: api-relay-reliability-checks
translationKey: api-relay-reliability-checks
locale: de
kind: article
title: Zuverlässigkeitsprüfung für API-Relays
description: "Ein wiederholbarer Abnahmeablauf für Relays: zuerst die Anfrage festlegen, dann Zeit bis zum ersten Byte, Stream-Abschluss, Fehlerklassen und Grenzen für Wiederholungen prüfen."
category: Zuverlässigkeit
tags: [api, streaming, betrieb]
authorId: mira-zhou
modelIds: []
benchmarkSlugs: []
relatedSlugs: []
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: http-semantics
    label: RFC 9110 HTTP Semantics
    url: https://www.rfc-editor.org/rfc/rfc9110
    checkedAt: '2026-10-02'
    claimScope: official
  - id: server-sent-events
    label: MDN, Server-sent events
    url: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
    checkedAt: '2026-10-02'
    claimScope: official
---

> Dies ist eine wiederverwendbare Arbeitsvorlage, keine Folkbench-Messung eines bestimmten Relays. Als Folkbench-Messung gilt nur ein veröffentlichter Snapshot mit Testlauf, Zeitpunkt, Stichprobe und Einschränkungen.

## Ziel

Bevor Sie ein API-Relay in eine produktive Integration aufnehmen, prüfen Sie den kleinstmöglichen Anfragepfad und ordnen Fehler einer von vier Klassen zu: Client, Protokoll, Upstream oder Dienst. Eine andere Person aus dem Team sollte die Prüfung mit derselben Anfrage wiederholen können.

## Vorbereitung

Bereiten Sie eine feste Beispielanfrage vor, die keine echten Nutzerdaten enthält. Notieren Sie Modell-ID, Request-Body, Streaming-Modus, Timeout, Budget für Wiederholungen und Testzeitpunkt. Bewahren Sie Test-Zugangsdaten in einem lokalen Secret-Manager oder einer temporären Umgebungsvariable auf; schreiben Sie sie niemals in Logs, Screenshots, das Repository oder eine öffentliche Seite.

## Schritt 1: Anfrage und Beobachtungsgrenze festlegen

Beginnen Sie mit der kleinstmöglichen Anfrage und prüfen Sie HTTP-Status, Antwort-Header und Body anhand der Dokumentation des Dienstes. Halten Sie Request-ID, Modell-ID, Status und Gesamtdauer in der Testtabelle fest. Fügen Sie keinen vollständigen Authorization-Header und keine Rohantwort in ein Ticket ein.

Wenn der Endpunkt Streaming unterstützt, führen Sie eine separate Streaming-Anfrage aus. Notieren Sie die Zeit bis zum ersten verwertbaren Datenblock, ob weitere Blöcke laufend eintreffen, ob ein Abschlussereignis erscheint und ob der Client beim Schließen der Verbindung ein eindeutiges Ergebnis erhält. SSE ist ein Ereignisstrom: Werten Sie die Ereignisgrenzen aus, statt Token anhand der Grenzen von Netzwerkpaketen zu erraten.

## Schritt 2: Fehler klassifizieren

Prüfen Sie jeden Fall mit festen Eingaben:

1. **Client-Fehler:** Ein ungültiges Modell, ein fehlender Parameter oder ein überschrittenes Anfragelimit sollte ein nachvollziehbares 4xx-Ergebnis liefern.
2. **Authentifizierungsfehler:** Abgelaufene oder unzureichend berechtigte Zugangsdaten sollten eindeutig abgelehnt werden, ohne dass andere Zugangsdaten oder interne Adressen preisgegeben werden.
3. **Upstream-Fehler:** Bei Upstream-Timeouts, Rate Limits und vorübergehenden Ausfällen sollte erkennbar sein, ob sich ein erneuter Versuch lohnt oder nicht.
4. **Streaming-Fehler:** Eine unterbrochene Verbindung, ein fehlendes Abschlussereignis oder ein unvollständiges JSON-Ereignis muss in einen Fehlerpfad führen, statt als fertiger Text behandelt zu werden.

Halten Sie für jeden Fehler mindestens Status, Fehlerklasse, clientseitigen Beobachtungszeitpunkt und eine kurze, geschwärzte Zusammenfassung fest. Rohantworten, Traces und Screenshots sind Prozessnachweise; sie gehören in den privaten Object-Storage-Ablauf des Projekts und nicht in öffentliche Artikel oder Ranglisten.

## Schritt 3: Grenzen für Wiederholungen festlegen

Wiederholen Sie automatisch nur Anfragen mit ausdrücklicher Idempotenz-Semantik oder solche, die sich gefahrlos wiederholen lassen. Legen Sie ein Gesamtbudget für Wiederholungen fest und verknüpfen Sie die IDs der ersten und der letzten Anfrage. Wiederholen Sie Authentifizierungsfehler, ungültige Parameter und Ablehnungen aufgrund von Inhaltsrichtlinien nicht blind.

Eine übersichtliche Abnahmetabelle kann Folgendes enthalten:

| Prüfpunkt | Bestanden, wenn | Maßnahme bei Fehler |
| --- | --- | --- |
| Status | Entspricht den dokumentierten Vorgaben | Geschwärzte Zusammenfassung speichern und zuordnen |
| Erstes Byte | Verwertbare Daten treffen innerhalb des vereinbarten Timeouts ein | Netzwerk, Route und Upstream prüfen |
| Stream-Abschluss | Ein gültiges Abschlussereignis oder eine vollständige Antwort trifft ein | Als Verbindungsfehler markieren |
| Fehlerklasse | 4xx, 5xx und Timeout bleiben unterscheidbar | Fehler nie als Modellausgabe werten |
| Wiederholung | Anzahl und Gesamtdauer bleiben nachvollziehbar | Nach Ausschöpfen des Budgets abbrechen |

## Bestehenskriterien und Aufräumen

Legen Sie die Bestehenskriterien vor dem Test schriftlich fest, zum Beispiel: „Die feste Anfrage liefert in drei unabhängigen Versuchen ein vollständiges Ergebnis, der Stream hat ein eindeutiges Abschlussereignis, und Authentifizierungsfehler werden nie wiederholt.“ Ändern Sie die Kriterien nicht, nachdem Sie das Ergebnis gesehen haben.

Widerrufen Sie nach dem Test die temporären Zugangsdaten, löschen Sie lokale Rohantworten und bewahren Sie nur einen Nachweis mit Zusammenfassungen, Zeitstempeln und Versionen auf. Um ein Ergebnis auf Folkbench zu veröffentlichen, verknüpfen Sie es zuerst mit einem echten Testlauf und Versuch (run/attempt), einem Nachweis-Manifest und einem Veröffentlichungs-Snapshot; dieser Artikel ersetzt diese Fakten nicht.
