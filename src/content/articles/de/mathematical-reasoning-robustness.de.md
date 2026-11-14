---
slug: mathematical-reasoning-robustness
translationKey: mathematical-reasoning-robustness
locale: "de"
kind: article
title: "Hält das Denken anderen Zahlen stand? Mathematische Robustheit prüfen"
description: "GSM-Symbolic sorgfältig einordnen: kontrollierte Varianten, gepaarte Statistik und Rechnerbedingungen für nachvollziehbare Mathematikevaluation."
category: "Evaluationsmethoden"
tags: [Mathematik, Schlussfolgern, Benchmarks]
authorId: iris-wu
modelIds: []
benchmarkSlugs: []
relatedSlugs: [llm-benchmark-rankings-contamination, long-context-effective-understanding]
publishedAt: '2026-11-14'
updatedAt: '2026-11-14'
sources:
  - id: gsm-symbolic
    label: Mirzadeh et al., GSM-Symbolic，überarbeitete Fassung 2025
    url: https://arxiv.org/abs/2410.05229v2
    checkedAt: '2026-11-14'
    claimScope: official
  - id: irrelevant-context
    label: Shi et al., Large Language Models Can Be Easily Distracted by Irrelevant Context，2023
    url: https://proceedings.mlr.press/v202/shi23a.html
    checkedAt: '2026-11-14'
    claimScope: official
  - id: causal-robustness
    label: Stolfo et al., A Causal Framework to Quantify the Robustness of Mathematical Reasoning with Language Models，2023
    url: https://aclanthology.org/2023.acl-long.32/
    checkedAt: '2026-11-14'
    claimScope: official
  - id: frontiermath
    label: Glazer et al., FrontierMath，überarbeitete Fassung 2025
    url: https://arxiv.org/abs/2411.04872v7
    checkedAt: '2026-11-14'
    claimScope: official
  - id: error-bars
    label: Miller, Adding Error Bars to Evals，2024
    url: https://arxiv.org/abs/2411.00640v1
    checkedAt: '2026-11-14'
    claimScope: official
  - id: construct-validity
    label: Bean et al., Measuring what Matters，2025
    url: https://arxiv.org/abs/2511.04703v1
    checkedAt: '2026-11-14'
    claimScope: official
---

Eine richtige Antwort zeigt zunächst nur, dass eine Ausgabe dem erwarteten Ergebnis entsprach. Wird die Leistung durch andere Namen, leicht veränderte Zahlen oder einen irrelevanten Satz instabil, müssen wir den Fehler lokalisieren. Mathematische Evaluation benötigt kontrollierte Bedingungen und diagnostische Vergleiche, nicht nur schwierigere Aufgaben.

Quellenstand: 2026-11-14. Dieser Beitrag behandelt Forschungsmethoden und vorgeschlagene Versuche. Folkbench hat keine Modelle ausgeführt. Die folgenden Aufgaben und Zahlen dienen der Erklärung und sind keine Modellmessungen.

## Mathematische Fähigkeit besteht aus mehreren Schritten

Textaufgaben verlangen das Erkennen von Mengen und Einheiten, das Verstehen von Beziehungen, einen passenden Ausdruck, die Berechnung und das geforderte Ausgabeformat. Jeder Fehler kann denselben Nullpunkt erzeugen. Endergebnisgenauigkeit bewertet die Lieferung, erklärt aber nicht allein die Fehlerursache.

Ein richtiger Ausdruck mit falscher Multiplikation unterscheidet sich von einer falschen Beziehung, die zufällig zur richtigen Zahl führt. Untersuchen Sie beobachtbare Ausdrücke und Antworten, ohne flüssige Erklärungen als vollständige interne Rechenspur zu behandeln. Bei Werkzeugen sind Aufrufe und Ergebnisverwendung mitzubeurteilen.

## Was GSM-Symbolic kontrollierbar macht

[GSM-Symbolic](https://arxiv.org/abs/2410.05229v2) erzeugt symbolische Vorlagen aus GSM8K-Aufgaben und daraus mehrere Instanzen. Das Versuchsdesign verwendet 100 Vorlagen mit jeweils 50 Instanzen, insgesamt 5.000 Beispiele. Namen, Zahlen, Bedingungskomplexität und irrelevante Informationen beleuchten unterschiedliche Stabilitätsaspekte.

Übertragbar ist die Idee, Beziehungen beizubehalten und Oberflächenmerkmale zu variieren. Eine historische Ergebnistabelle gilt dagegen nicht automatisch für spätere Modelle. Untersucht wurden bestimmte Modelle und Protokolle, nicht sämtliche Systeme von 2026. Trennen Sie mechanistische Erklärungen der Autoren von beobachtetem Verhalten.

Frühere Arbeiten über [irrelevanten Kontext](https://proceedings.mlr.press/v202/shi23a.html) und einen [kausalen Rahmen für mathematische Robustheit](https://aclanthology.org/2023.acl-long.32/) liefern verwandte Ansätze. Sie begründen kontrollierte Diagnosen; Ablenkbarkeit beweist nicht das Fehlen jeglichen Denkvermögens.

## Gültige Varianten konstruieren

Das folgende eigene Lehrbeispiel stammt aus keinem Benchmark und wurde nicht mit Modellen getestet. Ein Geschäft hat 6 Schachteln mit jeweils 8 Stiften und verschenkt 9 Stifte. Übrig bleiben `6 × 8 − 9 = 39`.

| Variante | Änderung | Erwartete Prüfung |
| --- | --- | --- |
| Name | Geschäft durch Schule ersetzen, Beziehungen erhalten | Antwort bleibt 39 |
| Zahlen | 7 Schachteln, jeweils 6 Stifte, 8 verschenkt | Neu berechnet: 34 |
| Formulierung | Reihenfolge bei eindeutigen Bezügen ändern | Antwort bleibt 39 |
| Irrelevantes Detail | Blaue Schachteln erwähnen | Antwort bleibt 39 |

Neue Zahlen verlangen eine neue Referenzantwort. Vermeiden Sie willkürlich negative Mengen, plötzlich nicht aufgehende Verteilungen oder den Wechsel zu sehr großen Zahlen. Solche Änderungen können Schwierigkeit und Bedeutung verändern.

Gerade Irrelevanz braucht menschliche Prüfung. Der Zusatz, zwei Schachteln seien reserviert, kann eine sinnvolle Interpretation als verfügbaren Bestand erzeugen. Die Antwort ist dann nicht eindeutig unverändert. Prüfen Sie vorab, ob der Zusatz tatsächlich keine Rolle spielt. Ungültige Varianten werden vor Betrachtung der Scores entfernt, nicht nachträglich passend zu einem gewünschten Modellfehler ausgewählt.

## Einen geschichteten Versuch planen

Wählen Sie verschiedene Beziehungstypen und Schwierigkeitsstufen mit gleicher Variantenanzahl. Ändern Sie jeweils einen Hauptfaktor. Entwicklungsaufgaben dienen zur Anpassung von Anweisungen und Parsern; nach dem Einfrieren des eigentlichen Tests werden Prompts nicht weiter anhand seiner Scores ausgewählt.

Fixieren Sie Modellversion, Sprache, Anweisungen, Werkzeuge, Sampling, Ausgabebudget und Versuche. Randomisieren Sie die Reihenfolge und verwenden Sie unabhängigen Kontext je Frage. So verrät keine Variante die Antwort einer anderen. Lernen über mehrere Gesprächsrunden benötigt ein eigenes Protokoll.

Der Stichprobenumfang richtet sich nach gewünschter Effektauflösung und Budget. Viele Instanzen einer Vorlage messen deren Stabilität, nicht eine breite Vielfalt von Denkfähigkeiten. Repräsentative Beziehungen und Schwierigkeiten sind wichtiger als viele Beinaheduplikate.

## Genauigkeit und Stabilität gemeinsam berichten

Berichten Sie Genauigkeit je Variantentyp und gepaarte Unterschiede zum Original. Der Anteil vollständig richtig beantworteter Paare zeigt zusätzlich, ob Erfolg bestehen bleibt. Nur richtig gelöste Originale auszuwählen und den Teilbestand als allgemeinen Vergleich auszugeben wäre irreführend. Wird diese Teilmenge analysiert, müssen Nenner und Auswahlregel sichtbar sein.

Bei hypothetisch 80% Originalgenauigkeit und 68% Variantengenauigkeit beträgt der Rückgang **12 Prozentpunkte** beziehungsweise **15% relativ**. Dies ist ein Einheitenbeispiel, kein Ergebnis von GSM-Symbolic oder Folkbench. Die Unterscheidung muss in jeder Sprache erhalten bleiben.

Varianten teilen ihre Struktur. [Adding Error Bars to Evals](https://arxiv.org/abs/2411.00640v1) erläutert Abhängigkeiten und gepaarte Vergleiche. Eine Möglichkeit ist das Resampling ganzer Vorlagengruppen, mit denselben Gruppen für beide Modelle in jeder Ziehung. Veröffentlichen Sie Methode, 95%-Intervalle und Wiederholungszahl.

## Ein Rechner hilft bei der Diagnose, verändert aber das System

Trennen Sie einen Versuch ohne externe Rechenhilfe von einem mit identischer Rechnerschnittstelle und Aufrufgrenze. Letzterer misst Modell und Werkzeug gemeinsam und benötigt einen eigenen Ergebniswert.

Verbessert der Rechner die Leistung deutlich, prüfen Sie, ob bisherige Fehler arithmetisch waren. Das beweist nicht, dass alle anderen Denkschritte korrekt sind: Auch Anweisungen, Lösungswege und Zeitbudgets können sich verändern. Ausdrücke, Werkzeuganfragen und Ergebnisverwendung liefern genauere Hinweise.

Bei Beweisen reicht Zahlenbewertung besonders wenig aus. Vollständige Fallabdeckung und der Verzicht auf unbewiesene Annahmen brauchen ein anderes Prüfverfahren. Ein formaler Prüfer kann Ableitungen validieren; ob die Formalisierung das ursprüngliche Problem korrekt ausdrückt, bleibt gesondert zu prüfen.

## Schwierigkeit und Robustheit sind getrennte Achsen

[FrontierMath](https://arxiv.org/abs/2411.04872v7) verwendet anspruchsvolle Expertenaufgaben mit automatisch überprüfbaren Antworten. Es untersucht hohe Schwierigkeit, während GSM-Symbolic Stabilität unter kontrollierten Änderungen untersucht. Keines ersetzt das andere.

Ein Modell kann schwierige Aufgaben lösen und an einer einfachen Umformulierung scheitern. Ein anderes kann stabil sein, ohne größere Komplexität zu bewältigen. Berichten Sie Schwierigkeit, Varianten und Werkzeuge getrennt statt als mathematischen IQ.

Der vorgeschlagene Maßstab umfasst richtige Antworten, kontrollierte Änderungen, interpretierbare Fehler, passende statistische Einheiten und klare Ressourcenbudgets. So werden beeindruckende Lösungen zu überprüfbaren Vergleichen. Allgemeine Anforderungen beschreibt die [Analyse verlässlicher Ranglisten](/de/blog/llm-benchmark-rankings-contamination/).
