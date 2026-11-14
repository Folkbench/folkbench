---
slug: llm-benchmark-rankings-contamination
translationKey: llm-benchmark-rankings-contamination
locale: "de"
kind: article
title: "Wie verlässlich sind Modellrankings? Kontamination und überprüfbare Benchmarks"
description: "LiveBench, LiveCodeBench, HELM und Evaluationsstatistik helfen, Datenkontamination, Budgets, Bewertung und Unsicherheit in Modellvergleichen zu prüfen."
category: "Evaluationsmethoden"
tags: [Benchmarks, Schlussfolgern, Zuverlässigkeit]
authorId: iris-wu
modelIds: []
benchmarkSlugs: []
relatedSlugs: [mathematical-reasoning-robustness, long-context-effective-understanding]
publishedAt: '2026-11-14'
updatedAt: '2026-11-14'
sources:
  - id: construct-validity
    label: Bean et al., Measuring what Matters，2025
    url: https://arxiv.org/abs/2511.04703v1
    checkedAt: '2026-11-14'
    claimScope: official
  - id: betterbench
    label: Reuel et al., BetterBench，2024
    url: https://arxiv.org/abs/2411.12990v1
    checkedAt: '2026-11-14'
    claimScope: official
  - id: livebench
    label: White et al., LiveBench，überarbeitete Fassung 2025
    url: https://arxiv.org/abs/2406.19314v2
    checkedAt: '2026-11-14'
    claimScope: official
  - id: livecodebench
    label: Jain et al., LiveCodeBench，2024
    url: https://arxiv.org/abs/2403.07974v2
    checkedAt: '2026-11-14'
    claimScope: official
  - id: helm
    label: Liang et al., Holistic Evaluation of Language Models
    url: https://arxiv.org/abs/2211.09110v2
    checkedAt: '2026-11-14'
    claimScope: official
  - id: error-bars
    label: Miller, Adding Error Bars to Evals，2024
    url: https://arxiv.org/abs/2411.00640v1
    checkedAt: '2026-11-14'
    claimScope: official
  - id: judge
    label: Zheng et al., Judging LLM-as-a-Judge，2023
    url: https://arxiv.org/abs/2306.05685v4
    checkedAt: '2026-11-14'
    claimScope: official
---

Eine Rangliste kann eine Prüfung präzise dokumentieren und trotzdem nicht beantworten, welches Modell zu Ihrer Arbeit passt. Die Punktzahl hängt von Aufgaben, Modellversion, Anweisungen, Werkzeugen, Inferenzbudget und Bewertung ab. Ohne diese Bedingungen können mehrere Nachkommastellen eine unbegründete Genauigkeit suggerieren.

Dieser Beitrag analysiert Literatur und schlägt Bewertungsverfahren vor. Die Quellen wurden am 2026-11-14 geprüft. Folkbench hat hierfür keine Modelle aufgerufen oder Benchmarks erneut ausgeführt. Zahlenbeispiele erklären Methoden und sind keine Messergebnisse. Ziel ist eine nachvollziehbare Beweiskette: Messgegenstand, Aufgabenkonstruktion, Bewertung und zulässige Schlussfolgerungen.

## Fähigkeit vor Datensatz definieren

Intelligenz ist zu umfassend für eine einzelne Aufgabe oder einen Mittelwert. Fachwissen, das Erschließen unbekannter Regeln, ausführbarer Code und langfristige Planung benötigen unterschiedliche Aufgaben. Ein vorgeschriebenes Antwortformat prüft zusätzlich Anweisungsbefolgung; eine Bildaufgabe ergänzt Wahrnehmung.

[Measuring what Matters](https://arxiv.org/abs/2511.04703v1) untersucht 445 Benchmarks unter dem Gesichtspunkt der Konstruktvalidität: Stützt der beobachtete Wert die beabsichtigte Aussage über eine Fähigkeit? [BetterBench](https://arxiv.org/abs/2411.12990v1) bietet einen Rahmen zur Qualitätsprüfung. Renommierte Institutionen und Konferenzen helfen bei der Literaturauswahl, ersetzen aber keine Prüfung von Aufgaben und Bewertungsverfahren.

Eine überprüfbare Frage wäre, ob ein Modell mehrstufige Probleme anhand bereitgestellter Unterlagen ohne externe Suche lösen kann. So lassen sich fehlendes Wissen, übersehene Belege und Denkfehler besser unterscheiden als mit der allgemeinen Frage nach Intelligenz.

## Kontamination ist mehr als das Auswendiglernen der Testfrage

Direkte Kontamination entsteht, wenn Testfragen und Antworten in Trainingsdaten gelangen. Ähnliche Aufgaben, Lösungserklärungen und öffentliche Evaluationsprotokolle können ebenfalls helfen. Wiederholte Anpassung an eine öffentliche Rangliste kann zudem zur Überanpassung an diese Prüfung führen, auch ohne direktes Training mit ihren Fragen.

Eine hohe Leistung bei alten Aufgaben beweist daher keine Memorierung; eine schlechtere Leistung bei neuen Aufgaben beweist keine Kontamination. Schwierigkeit, Format und Fachgebiet können abweichen. Kontrollieren Sie diese Faktoren und benennen Sie nicht einsehbare Trainingsdaten. Ohne vollständigen Zugang zum Trainingskorpus eines geschlossenen Modells lautet der ehrliche Status unbekannt, nicht nachweislich kontaminationsfrei.

Die [überarbeitete LiveBench-Fassung](https://arxiv.org/abs/2406.19314v2) nutzt regelmäßig erneuerte Aufgaben und überprüfbare Antworten; der Titel lautet Contamination-Limited. [LiveCodeBench](https://arxiv.org/abs/2403.07974v2) sammelt neue Programmierwettbewerbsaufgaben mit Veröffentlichungsdatum. Das senkt bestimmte Risiken. Veröffentlichte Aufgaben können jedoch später in Training oder Optimierung eingehen.

Dynamische Datensätze erschweren auch Zeitvergleiche. Bei monatlich anderen Fragen vermischt eine Scoreänderung Modell- und Prüfungsänderungen. Bewahren Sie Versionen auf und vergleichen Sie eine gemeinsame Aufgabenmenge, oder berichten Sie feste Referenz und neue Aufgaben getrennt. Die zunehmende Bekanntheit der Referenz bleibt eine Einschränkung.

## Gleiche Bedingungen als Protokoll festhalten

Ein Modellname kann verschiedene Versionen, Endpunkte und Denkmodi bezeichnen. Dokumentieren Sie tatsächliche API-ID, verfügbare Versionsangaben, Datum, Systemanweisungen, Sampling, Ausgabelimit, Werkzeuge und Wiederholungsregeln. Erfinden Sie keine nicht veröffentlichten Routingdetails oder internen Rechenbudgets.

Zwei Perspektiven sind sinnvoll: Modelle unter einem gemeinsamen Protokoll und Systeme in ihrer besten Konfiguration innerhalb eines offengelegten Budgets. Erstere erleichtert die Zuordnung von Unterschieden, letztere die Beschaffung. Gleiche Tokenobergrenzen bedeuten wegen unterschiedlicher Tokenisierung und interner Mechanismen nicht denselben Rechenaufwand.

[HELM](https://arxiv.org/abs/2211.09110v2) standardisiert Szenarien und Bedingungen und betrachtet Genauigkeit, Kalibrierung, Robustheit und Effizienz. Berichten Sie entsprechend Qualität, Kosten, Latenz und Ausfälle. Kosten umfassen auch erfolglose Versuche und Werkzeugaufrufe, nicht nur den letzten erfolgreichen Versuch.

## Auch die Bewertung kann Fehler erzeugen

Bei Referenzantworten sind überprüfbare Regeln vorzuziehen, doch die Referenzen selbst müssen stimmen. Ausführbare Tests können Anforderungen übersehen oder eine bestimmte Implementierung verlangen; exakter Textvergleich kann richtige Antworten ablehnen. Fixieren Sie Bewertungssoftware, Antwortauswertung und Ausnahmebehandlung.

Offene Aufgaben benötigen weitere Urteile. [Judging LLM-as-a-Judge](https://arxiv.org/abs/2306.05685v4) untersucht Positions-, Längen- und Eigenpräferenzverzerrungen. Anonymisierte Antworten, vertauschte Reihenfolge, klare Kriterien und menschliche Nachprüfung strittiger Fälle helfen. Übereinstimmung mit menschlichen Vorlieben ist keine faktische Richtigkeit.

Trennen Sie falsche Antworten, Formatfehler, Verweigerungen, Zeitüberschreitungen und Dienstfehler. Legen Sie vorab fest, wie sie den Hauptwert beeinflussen. Wer Genauigkeit nur für erhaltene Antworten berechnet und viele Zeitüberschreitungen verschweigt, überschätzt die Zuverlässigkeit des Dienstes.

## Kleine Unterschiede gepaart analysieren

Angenommen, A löst von 200 gemeinsamen Fragen 160 und B 156. Dieses Beispiel ist hypothetisch. Der Abstand beträgt 2 Prozentpunkte; die Summen zeigen jedoch nicht seine Stabilität. Dafür muss bekannt sein, welche Fragen beide lösen und ob die Aufgaben unabhängig sind.

[Adding Error Bars to Evals](https://arxiv.org/abs/2411.00640v1) behandelt gepaarte Vergleiche, korrelierte Fragen und Versuchsplanung. Analysieren Sie bei gemeinsamen Aufgaben die Differenz pro Frage. Varianten derselben Vorlage gehören in Gruppen und sind nicht jeweils unabhängige Belege. Wiederholte Generierungen schätzen Samplingstreuung, ersetzen aber keine breite Aufgabenabdeckung.

Geben Sie ein 95%-Konfidenzintervall der Differenz samt Methode und Stichprobeneinheit an. Enthält es null, beweist es weder Überlegenheit noch Gleichwertigkeit. Viele Modell- oder Untergruppenvergleiche erfordern außerdem einen Umgang mit der wiederholten Suche nach signifikanten Ergebnissen.

## Eine nachvollziehbare Ergebniskarte

| Bereich | Aufzubewahrende Nachweise | Folge fehlender Angaben |
| --- | --- | --- |
| Fähigkeit | Zielaufgabe, Nutzung, Ausschlüsse | Allgemeine Aussagen nicht gedeckt |
| Daten | Version, Datum, Herkunft, Gruppierung | Möglicherweise andere Prüfungen |
| Ausführung | Modell, Anweisungen, Werkzeuge, Budget, Versuche | Modell- und Systemeffekte vermischt |
| Bewertung | Referenzen, Softwareversion, Nachprüfung | Bewertungsfehler schwer auszuschließen |
| Unsicherheit | Umfang, gepaarte Differenz, Intervalle, Wiederholungen | Kleine Abstände überinterpretiert |
| Kosten und Ausfälle | Gesamtkosten, Zeit, Fehlerarten, Abdeckung | Erfolgswerte verdecken Nichtverfügbarkeit |

Dies ist ein vorgeschlagenes redaktionelles und experimentelles Dokumentationsformat, keine Zertifizierung bestehender Rankings. Sensible Rohdaten bleiben kontrolliert gespeichert; veröffentlicht werden bereinigte Belege und Protokolle, die eine Prüfung der Schlussfolgerungen ermöglichen.

## Rankings zur Eingrenzung nutzen

Ein glaubwürdiger Benchmark zeigt Kandidaten und Schwächen. Entscheidend bleiben Ihre Aufgaben: unvertretbare Fehler, akzeptable Kosten und Latenzen sowie Änderungen nach Modellupdates.

Folkbench empfiehlt Ergebnisse nach Fähigkeiten vor einem Gesamtwert. Werden Gewichte verwendet, veröffentlichen Sie diese und prüfen Sie die Rangstabilität bei plausiblen Änderungen. Gleichstände oder eine ausdrücklich unzureichende Unterscheidbarkeit sind nützlicher als unbegründete Präzision.

Konkrete Anwendungen finden Sie in den Beiträgen zur [Robustheit mathematischen Denkens](/de/blog/mathematical-reasoning-robustness/) und zum [effektiven Verständnis langer Kontexte](/de/blog/long-context-effective-understanding/).
