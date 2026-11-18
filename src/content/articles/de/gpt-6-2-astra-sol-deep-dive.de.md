---
slug: gpt-6-2-astra-sol-deep-dive
translationKey: gpt-6-2-astra-sol-deep-dive
locale: de
kind: benchmark-review
title: "GPT-6.2 Astra und Sol im Detail: Schlussfolgern, Softwareentwicklung und Forschung"
description: "Eine Analyse der öffentlichen Startbenchmarks zu abstraktem Denken, Softwareentwicklung, wissenschaftlicher Arbeit und Kosten."
category: Modelle
tags: [benchmarks, reasoning, coding, research]
authorId: iris-wu
modelIds: [gpt-6-2-astra, gpt-6-2-sol, gpt-6-astra, gpt-6-1-sol]
benchmarkSlugs: []
relatedSlugs: [gpt-6-1-sol-review-pricing, mathematical-reasoning-robustness, llm-benchmark-rankings-contamination]
publishedAt: '2026-11-18'
updatedAt: '2026-11-18'
sources:
  - id: openai-launch
    label: OpenAI · GPT-6.2 Astra and Sol
    url: https://openai.com/index/introducing-gpt-6-2-astra-sol/
    checkedAt: '2026-11-18'
    claimScope: official
  - id: aa-release
    label: Artificial Analysis · GPT-6.2 launch evaluation
    url: https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: epoch-astra
    label: Epoch AI · GPT-6.2 Astra results
    url: https://epoch.ai/models/gpt-6-2-astra
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: arc-prize
    label: ARC Prize · Verified GPT-6.2 results
    url: https://arcprize.org/results/openai-gpt-6-2
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: cognition
    label: Cognition · FrontierCode 2.0
    url: https://cognition.com/frontiercode
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: terminal-bench
    label: Terminal-Bench · 4.0 leaderboard
    url: https://www.tbench.ai/?version=4
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: epoch-work
    label: Epoch AI · Open-ended work evaluation
    url: https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: epoch-erdos
    label: Epoch AI · FrontierMath Erdős
    url: https://epoch.ai/benchmarks/frontiermath-erdos
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: aa-science
    label: Artificial Analysis · Terminal-Bench-Science 0.1
    url: https://artificialanalysis.ai/evaluations/terminal-bench-science
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: aa-omniscience
    label: Artificial Analysis · AA-Omniscience v1.1
    url: https://artificialanalysis.ai/evaluations/omniscience
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: openai-specs
    label: OpenAI API · Model specifications and pricing
    url: https://developers.openai.com/api/docs/models/compare
    checkedAt: '2026-11-18'
    claimScope: official
  - id: system-card
    label: OpenAI · GPT-6.2 system card
    url: https://deploymentsafety.openai.com/gpt-6-2-astra-sol
    checkedAt: '2026-11-18'
    claimScope: official
---

GPT-6.2 Astra und Claude Fable 5.2 erreichten bei Epoch AI jeweils **174 Punkte** im Epoch Capabilities Index. Bei offenen Aufgaben aus der Arbeit derselben Organisation kam Astra im Mittel auf **65%**, Fable 5.2 auf **82%**. GPT-6.2 Sol wiederum lag in zwei Softwaretests nahe an Astra. Die Terminal-Aufgaben kosteten mit Sol insgesamt rund ein Fünftel so viel. Diese Ergebnisse betreffen unterschiedliche Fähigkeiten. Ein Modell kann ein schwieriges Problem lösen, ein prüfbares Ergebnis abliefern und trotzdem Mühe haben, selbst die richtige Forschungsfrage zu wählen. [Epoch-Modellprofil](https://epoch.ai/models/gpt-6-2-astra) · [Epoch-Arbeitsaufgaben](https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work) · [Terminal-Bench 4.0](https://www.tbench.ai/?version=4)

OpenAI veröffentlichte beide Modelle am 17. November 2026. Folkbench analysiert die am 18. November öffentlich zugänglichen Ergebnisse. Die Messwerte stammen von den jeweiligen Prüfstellen, die Spezifikationen und Herstellerangaben von OpenAI. Folkbench hat die Modelle für diesen Artikel nicht erneut getestet. [OpenAI-Ankündigung](https://openai.com/index/introducing-gpt-6-2-astra-sol/)

| Evaluation und Konfiguration | GPT-6.2 Astra | GPT-6.2 Sol |
| --- | ---: | ---: |
| Artificial Analysis Intelligence Index v5.0.1, max | 62 | 57 |
| ARC-AGI-2, max | 95.8% | 85.8% |
| ARC-AGI-3, Standardumgebung, max | 70.3% | 54.9% |
| Terminal-Bench 4.0, Codex, max | 62.1% ± 2.3% | 61.5% ± 2.8% |
| Epoch Automation Reports, Codex | 65% | Nicht evaluiert |

[Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [ARC Prize](https://arcprize.org/results/openai-gpt-6-2) · [Terminal-Bench](https://www.tbench.ai/?version=4) · [Epoch Automation Reports](https://epoch.ai/benchmarks/epoch-automation-reports)

## Abstraktion und der Einfluss des Zustands

Die **62** im Index von Artificial Analysis liegen **5 Punkte** über dem früheren Astra und unter Fable 5.2 mit **65**. Sol erreicht den Wert des früheren Astra von **57** bei etwa **15%** der gewichteten Modellkosten pro Aufgabe. Epoch verwendet eine eigene Skala. Ein bayessches Item-Response-Modell schätzt unter anderem Aufgabenschwierigkeit und Trennschärfe. Für konkrete Arbeiten zählt, welche Aufgaben und Ausführungsbedingungen in den zugrunde liegenden Tests vorkommen. [Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [ECI-Methodik](https://epoch.ai/data/eci-documentation/methodology)

In ARC-AGI-2 erkennt das Modell Regeln aus Rasterbeispielen. Bei max liegt Astra **10.0 Prozentpunkte** vor Sol. In der Standardumgebung von ARC-AGI-3, die Lernen aus Aktionsfeedback verlangt, sind es **15.4 Punkte**. In der öffentlichen Demonstration trägt die Standardumgebung vom Modell gewählte Notizen weiter. Der Provider Adapter bewahrt zusätzlich undurchsichtigen Schlussfolgerungszustand über Anfragen hinweg und komprimiert lange Interaktionen. Dort erzielen Astra und Sol bei max **99.8%** und **98.2%**. Astras **100.0%** bei xhigh im Adapter entsprechen **56.5%** in der Standardumgebung derselben Stufe. Die technische Weitergabe früherer Versuche und verworfener Hypothesen beeinflusst also auch den Abstand der Modelle. [Verifizierte ARC-Ergebnisse](https://arcprize.org/results/openai-gpt-6-2)

## Softwareentwicklung und professionelle Arbeit

In Terminal-Bench 4.0 beträgt der Abstand in Codex bei max **0.6 Prozentpunkte**, bei starker Überlappung der publizierten Intervalle. Der Durchlauf der Suite ist mit rund **1.400 US-Dollar** für Astra und **300 US-Dollar** für Sol ausgewiesen. FrontierCode 2.0 prüft mit **132** von Maintainern formulierten Aufgaben, ob Änderungen korrekt, hinreichend getestet und im vorgesehenen Umfang bleiben. OpenAI berichtet einen Abstand innerhalb von **0.5 Prozentpunkten** bei max und für Sol etwa ein Fünftel der Kosten. Im Coding Agent Index von Artificial Analysis hält Astra den Vorgängerwert, während Sol **3 Punkte** gegenüber GPT-6.1 Sol verliert. Die Repository-Fragen in SWE-Atlas-QnA-AA fallen um **14 Punkte**, unter anderem wegen ausgelassener Fakten. Ein brauchbarer Patch und eine vollständige Erklärung des vorhandenen Codes stellen unterschiedliche Anforderungen. [Terminal-Bench](https://www.tbench.ai/?version=4) · [Cognition](https://cognition.com/frontiercode) · [OpenAI](https://openai.com/index/introducing-gpt-6-2-astra-sol/) · [Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol)

OpenAI meldet in Agents’ Last Exam einen Vorsprung von **5.5 Punkten** vor Fable 5.2 bei **5%** der angegebenen Kosten. Neun Aufgaben mit Fables Ausweichmodell sind ausgenommen. Epochs manuelle Bewertung kehrt die Reihenfolge um **17 Prozentpunkte** um. Astra übertrifft dort die **56%** des früheren Astra. Die Stichprobe ist klein, je Modell und Aufgabe gab es einen Lauf, und die Agentenumgebungen unterscheiden sich. Bei der Delegation von Berichten verdienen Zielgruppe, Belegauswahl und Qualität der Überarbeitung eigene Bewertungskriterien. [OpenAI](https://openai.com/index/introducing-gpt-6-2-astra-sol/) · [Epoch-Methodik und Einschränkungen](https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work)

## Was die Wissenschaftstests aussagen

Astra liegt in HLE-Diamond und im schweren Physik-Teil von CritPt v2 in der Startauswertung jeweils hinter Fable 5.2 und vor den übrigen verglichenen Systemen. AA-Omniscience meldet bei max **59%** für Astra und **55%** für Sol als Halluzinationsrate. Im Zähler stehen falsche Antworten, im Nenner falsche, teilweise richtige und ausgelassene Antworten. Das ist eine Aussage über Antworten unter Unsicherheit. Literaturverweise brauchen eine eigene Prüfung. [Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [AA-Omniscience-Definition](https://artificialanalysis.ai/evaluations/omniscience)

Epoch zeigt für FrontierMath Tier 4 v2 **100%** für Astra und **98%** für den Vorgänger, jeweils in der veröffentlichten Genauigkeit. Für FrontierMath Erdős stehen **10%** und **3%**. Die 68 Probleme waren bei Einrichtung des Benchmarks offen. Lean prüft die formalen Beweise oder Widerlegungen. Ob der formale Satz die ursprüngliche Frage getreu erfasst und einen neuen Beitrag liefert, bleibt davon unterscheidbar. [Epoch-Modellergebnisse](https://epoch.ai/models/gpt-6-2-astra) · [FrontierMath Erdős](https://epoch.ai/benchmarks/frontiermath-erdos)

In Terminal-Bench-Science 0.1 mit 70 überprüfbaren Forschungsaufgaben erreicht Astra **78.6%** bei xhigh und **78.1%** bei max. Beim offenen Versuchsdesign in Epochs Test benannte Astra hingegen hauptsächlich Schachfiguren um, statt unbekannte Spielregeln einzuführen. So eignete sich der Entwurf kaum zum beabsichtigten Generalisierungstest. Epoch beobachtete auch seltene Überarbeitung nach dem ersten Versuch. OpenAIs Systemkarte ordnet Astra hinsichtlich KI-Selbstverbesserung in High ein und Sol darunter. Die Einstufung bezieht sich auf eine bestimmte KI-Forschungsumgebung. [Terminal-Bench-Science](https://artificialanalysis.ai/evaluations/terminal-bench-science) · [Epoch-Fallstudie](https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work) · [OpenAI-Systemkarte](https://deploymentsafety.openai.com/gpt-6-2-astra-sol)

## Kosten pro abgenommenem Ergebnis

Beide Modelle haben **1.050.000** Kontexttokens, maximal **922.000** Eingabe- und **128.000** Ausgabetokens. Pro Million Tokens in kurzen Standardanfragen stehen Eingabe, Cache-Lesen und Ausgabe bei Astra bei **8 / 0.40 / 40 US-Dollar**, bei Sol bei **2 / 0.10 / 10 US-Dollar**. Über **272K** Eingabetokens verdoppeln sich Eingabe und Cache, und die Ausgabe kostet **1.5×** für die gesamte Anfrage. Bei 100.000 ungecachten Eingabe- und 10.000 fakturierten Ausgabetokens kostet Astra **1.20 US-Dollar**, Sol **0.30 US-Dollar**, vor Werkzeugen und Cache-Schreibvorgängen. Bei festen Kosten im Verhältnis 1:4 ist ein Sol-Erstversuch mit einem Astra-Nachlauf günstiger, wenn weniger als **75%** eskalieren. Entscheidend sind zusätzlich Abnahmequote, Latenz und Aufwand der Kontrolle. Sol ist für prüfbare Routineaufgaben gut belegt, Astra für schwierige formale Ableitungen und das Erkennen unvertrauter Regeln. Offene Forschung braucht bei beiden einen überprüfbaren Beleg und ein tragfähiges Versuchsdesign. [Astra-API](https://developers.openai.com/api/docs/models/gpt-6.2-astra) · [Sol-API](https://developers.openai.com/api/docs/models/gpt-6.2-sol)
