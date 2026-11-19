---
slug: gemini-4-series-deep-dive
translationKey: gemini-4-series-deep-dive
locale: de
kind: benchmark-review
title: "Die Gemini-4-Serie im Detail: Wie Argon, Carbon, Hydrogen und Neon denken"
description: "Wir gleichen Googles Modellkarten mit den Ergebnissen von Artificial Analysis, Epoch AI, ARC Prize und Terminal-Bench ab und analysieren die vier Gemini-4-Modelle in allgemeiner Intelligenz, abstraktem Schließen, Mathematik und Wissenschaft, Softwareentwicklung, langem Kontext und Sicherheit. Dabei zeigt sich, wie Reasoning-Budget und Evaluationsbedingungen die Schlussfolgerungen verändern."
category: Modelle
tags: [benchmarks, reasoning, research, long-context]
authorId: iris-wu
modelIds: [gemini-4-neon, gemini-4-carbon, gemini-4-hydrogen, gemini-4-argon]
benchmarkSlugs: []
relatedSlugs: [gpt-6-2-astra-sol-deep-dive, mathematical-reasoning-robustness, long-context-effective-understanding]
publishedAt: '2026-11-19'
updatedAt: '2026-11-19'
sources:
  - id: google-neon
    label: Google · Introducing Gemini 4 Neon
    url: https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: google-carbon
    label: Google · Gemini 4 Carbon announcement
    url: https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: google-argon
    label: Google · Gemini 4 Argon announcement
    url: https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: google-hydrogen
    label: Google · Introducing Gemini 4 Hydrogen
    url: https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: card-neon
    label: Google DeepMind · Gemini 4 Neon model card
    url: https://deepmind.google/models/model-cards/gemini-4-neon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: card-carbon
    label: Google DeepMind · Gemini 4 Carbon model card
    url: https://deepmind.google/models/model-cards/gemini-4-carbon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: card-argon
    label: Google DeepMind · Gemini 4 Argon model card
    url: https://deepmind.google/models/model-cards/gemini-4-argon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: aa-neon
    label: Artificial Analysis · Gemini 4 Neon launch evaluation
    url: https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain
    checkedAt: '2026-11-19'
    claimScope: observed
  - id: epoch-carbon
    label: Epoch AI · Gemini 4 Carbon results
    url: https://epoch.ai/models/gemini-4-carbon
    checkedAt: '2026-11-19'
    claimScope: observed
  - id: arc-carbon
    label: ARC Prize · Verified Gemini 4 Carbon results
    url: https://arcprize.org/results/google-gemini-4-carbon
    checkedAt: '2026-11-19'
    claimScope: observed
  - id: arc-argon
    label: ARC Prize · Verified Gemini 4 Argon results
    url: https://arcprize.org/results/google-gemini-4-argon
    checkedAt: '2026-11-19'
    claimScope: observed
  - id: terminal-bench
    label: Terminal-Bench · 4.1 leaderboard
    url: https://www.tbench.ai/?version=4
    checkedAt: '2026-11-19'
    claimScope: observed
---

Begrenzt man im Intelligence Index v5.0.1 von Artificial Analysis die Ausgabetokens für den kompletten Index auf 110 bis 124 Millionen, ergibt sich für die Gemini-4-Modelle diese Reihenfolge: Argon (high) **50**, Hydrogen (high) **51**, Carbon (medium) **58**, Neon (high) **60**. Alle vier haben denselben Wissensstand vom März 2026. Laut Googles Modellkarten basiert Carbon auf Argon, Hydrogen und Neon sind aus Carbon abgeleitet. In der Standardumgebung von ARC‑AGI‑3 liegt Carbon bei gleicher Einstellung low **15,3 Prozentpunkte** vor Argon; bei FrontierMath Tier 4 verzeichnet Epoch AI einen Abstand von **17 Punkten**. Sieben Wochen, vier Veröffentlichungen, ein Wissensstichtag: Die Gemini-4-Serie gleicht einem öffentlichen Experiment über Post-Training und Reasoning-Budget. Sie erinnert zugleich daran, dass ein Vergleich bei gleichem Budget und ein Vergleich bei gleichem Einstellungsnamen zwei verschiedene Ranglisten ergeben. [Launch-Evaluation von Neon bei Artificial Analysis](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain) · [Verifizierte Carbon-Ergebnisse von ARC Prize](https://arcprize.org/results/google-gemini-4-carbon) · [Epoch-Daten zu Carbon](https://epoch.ai/models/gemini-4-carbon)

Google kündigte Argon am 30. September und Carbon am 28. Oktober an; Carbon wurde am 10. November allgemein verfügbar, danach folgten Hydrogen am 12. November und Neon am 18. November. Dieser Artikel stützt sich auf die am 19. November verfügbaren öffentlichen Ergebnisse und ist eine Sekundäranalyse von Folkbench. Die Werte in Modellkarten und Ankündigungen stammen von Google; in diesen Tabellen hat Google manche Werte der Vergleichsmodelle selbst ermittelt, andere sind als Läufe Dritter gekennzeichnet. Die Ergebnisse von Artificial Analysis, Epoch AI, ARC Prize und Terminal-Bench gehören den jeweiligen Evaluatoren. Folkbench hat für diesen Artikel kein Modell erneut ausgeführt. Prozentwerte folgen der Definition der jeweiligen Rangliste, und jede Schlussfolgerung, die von Reasoning-Stufe, Ausführungsumgebung oder ausführender Stelle abhängt, gilt nur unter diesen Bedingungen. [Ankündigung von Argon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/) · [Google: Carbon jetzt verfügbar](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/) · [Ankündigung von Neon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/)

## Eine Basis, vier Runden Post-Training

| Modell | Angekündigt | Offizielle Positionierung | Herkunft laut Modellkarte | API-Preis (Eingabe / Ausgabe pro 1 Mio. Tokens) | Bester AA Index v5.0.1 |
| --- | --- | --- | --- | --- | ---: |
| Gemini 4 Argon | 30. Sep. | Programmierung, Wissensarbeit in Unternehmen, Cyberabwehr | Neu trainiertes sparsames MoE-Modell | 2 / 10 $ Einführungspreis, danach 4 / 20 $ | 50 (high) |
| Gemini 4 Carbon | 28. Okt., allgemein verfügbar ab 10. Nov. | Langfristige Aufgaben und Cybersicherheit | Basiert auf Argon | 2 / 10 $ bis 30. Nov., danach 4 / 20 $ | 60 (high) |
| Gemini 4 Hydrogen | 12. Nov. | Schnelle Alltagsaufgaben | Aus Carbon abgeleitet | 1,50 / 7,50 $ | 54 (xhigh) |
| Gemini 4 Neon | 18. Nov. | Balance aus Tiefe und Effizienz | Aus Carbon abgeleitet | 3 / 15 $ | 61 (xhigh) |

[Modellkarte Argon](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Modellkarte Carbon](https://deepmind.google/models/model-cards/gemini-4-carbon/) · [Modellkarte Hydrogen](https://deepmind.google/models/model-cards/gemini-4-hydrogen/) · [Modellkarte Neon](https://deepmind.google/models/model-cards/gemini-4-neon/)

Die Modellkarte von Argon enthält die einzige Architekturbeschreibung dieser Generation: ein großer, sparsamer Mixture-of-Experts-Transformer (MoE) mit nativer Text-, Bild- und Audioeingabe, als neues Modell trainiert und nicht als Feinabstimmung eines älteren. Trainiert wurde auf TPUs mit JAX und ML Pathways; das Post-Training umfasste Instruction-Tuning, menschliche Präferenzdaten und Reinforcement Learning mit Daten zu mehrstufigem Schließen, Problemlösen und Theorembeweisen. Die Modellkarte von Carbon verweist für Architektur, Daten und Hardware auf Argon. Die Karten von Hydrogen und Neon geben an, dass beide aus Carbon abgeleitet sind (adapted from), und verweisen ihrerseits auf Carbon. Alle vier unterstützen bis zu 1 Million Tokens Kontext für Ein- und Ausgabe zusammen. [Modellkarte Argon](https://deepmind.google/models/model-cards/gemini-4-argon/)

Diese Struktur bestimmt, wie die Fortschritte innerhalb der Familie zu lesen sind. Da sich der Wissensstichtag nicht geändert hat, kann der Sprung von Argon zu Carbon nicht aus neuem Weltwissen stammen; plausibler sind Änderungen bei Post-Training-Daten, Reinforcement Learning und Inferenzkonfiguration. Google hat weder Parameterzahlen veröffentlicht noch erklärt, ob „abgeleitet“ Distillation, fortgesetztes Training oder ein anderes Verfahren bedeutet. Größe und Trainingsweg von Hydrogen und Neon lassen sich aus öffentlichem Material daher nicht erschließen. Klar ist: Der Großteil der Fähigkeitsunterschiede innerhalb dieser Generation entsteht nach dem Pre-Training.

## Intelligenz: Gleicher Einstellungsname heißt nicht gleiches Reasoning-Budget

Bei seiner Ankündigung am 28. Oktober führte Carbon den Index v5.0 mit **59** an. Drei Wochen später setzt die Neubewertung v5.0.1 Carbon auf **60**, doch an der Spitze steht nun Claude Fable 5.2 mit **65**, gefolgt von GPT‑6.2 Astra mit **62** und Neon mit **61**; Claude Opus 5.5 kommt auf **59**, GPT‑6.2 Sol auf **57**. Der ECI von Epoch AI ordnet Carbon ähnlich ein: **170**, Platz drei von 241 erfassten Modellen, gegenüber **167** für Argon, **174** für Fable 5.2 und **169** für GPT‑6 Astra. Beide Indizes arbeiten mit unterschiedlichen Methoden, sehen Carbon aber in der Spitzengruppe, knapp hinter den aktuellen Führenden. Stand 19. November hat Epoch noch keine Daten zu Neon veröffentlicht; für Hydrogen gibt es Einzelergebnisse, aber noch keinen ECI. Zusammengesetzte Ranglisten verschieben sich von Woche zu Woche, ein einzelner „erster Platz“ hat daher wenig Gewicht. [Ankündigung von Carbon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/) · [Launch-Evaluation von GPT‑6.2 bei Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [Modellkarte Neon](https://deepmind.google/models/model-cards/gemini-4-neon/) · [Epoch-Daten zu Carbon](https://epoch.ai/models/gemini-4-carbon)

Aussagekräftiger ist die Kurve über die Reasoning-Stufen. In Klammern stehen die Ausgabetokens für den kompletten Index.

| AA Index v5.0.1 | Neon | Hydrogen | Carbon | Argon |
| --- | ---: | ---: | ---: | ---: |
| low | 44 (28,3 Mio.) | 27 (20,3 Mio.) | 54 (83,9 Mio.) | nicht veröffentlicht |
| medium | 55 (62,9 Mio.) | 41 (54,4 Mio.) | 58 (124 Mio.) | 48 (81,7 Mio.) |
| high (Standard) | 60 (123 Mio.) | 51 (110 Mio.) | 60 (205 Mio.) | 50 (113 Mio.) |
| xhigh | 61 (283 Mio.) | 54 (304 Mio.) | nicht angeboten | nicht angeboten |

[Neon nach Stufe](https://artificialanalysis.ai/models/gemini-4-neon) · [Hydrogen nach Stufe](https://artificialanalysis.ai/models/releases/gemini-4-hydrogen) · [Carbon nach Stufe](https://artificialanalysis.ai/models/gemini-4-carbon) · [Argon nach Stufe](https://artificialanalysis.ai/models/gemini-4-argon)

Erstens nimmt der Ertrag schnell ab. Neon von high auf xhigh zu setzen, vervielfacht die Ausgabetokens um den Faktor **2,3** für **einen** zusätzlichen Punkt, und die Zeit pro Aufgabe steigt von 14,8 auf 21,5 Minuten; derselbe Schritt kostet Hydrogen **2,8-mal** so viele Tokens für **drei** Punkte. Zweitens sind Einstellungsnamen keine Budgeteinheiten. Carbons Stufe low verbraucht 83,9 Millionen Tokens, mehr als Neons medium. Bei ähnlichem Gesamtbudget lautet die Reihenfolge Argon 50, Hydrogen 51, Carbon 58, Neon 60, und das sagt mehr über den Effekt des Post-Trainings aus als ein Vergleich aller Modelle in der Standardeinstellung. Der Vergleich hat Grenzen: Die Tokens sind Summen über den gesamten Index und nicht pro Aufgabe abgeglichen, und die Ausgabegeschwindigkeiten unterscheiden sich. Neon erzeugt bei high etwa 101 Tokens pro Sekunde, Carbon 55 bis 58, sodass dieselbe Tokenmenge unterschiedliche Wartezeiten bedeutet.

Drittens reagiert das kleinere Modell empfindlicher auf das Budget. Von low bis high legt Hydrogen **24 Punkte** zurück, Neon **16** und Carbon nur **6**. Bei einem schnellen Modell wie Hydrogen kann die falsche Stufe mehr kosten als ein Modellwechsel.

## Abstraktes Schließen: Bei ARC‑AGI‑3 ist längeres Nachdenken nicht immer besser

| Verifizierte Ergebnisse von ARC Prize | Gemini 4 Argon | Gemini 4 Carbon |
| --- | ---: | ---: |
| ARC‑AGI‑2, low / medium / high | 42,1 % / 87,1 % / 91,3 % | 49,6 % / 94,2 % / 92,1 % |
| ARC‑AGI‑3 Standardumgebung, low / medium | 49,8 % / 46,3 % | 65,1 % / 63,9 % |
| ARC‑AGI‑3 Standardumgebung, high | nicht gewertet (19 von 55 Spielen beendet) | nicht gewertet (30 von 55 Spielen beendet) |
| ARC‑AGI‑3 Provider Adapter, low / medium / high | 97,5 % / 97,3 % / 97,3 % | 97,7 % / 99,1 % / 96,9 % |

[Verifizierte Argon-Ergebnisse von ARC Prize](https://arcprize.org/results/google-gemini-4-argon) · [Verifizierte Carbon-Ergebnisse von ARC Prize](https://arcprize.org/results/google-gemini-4-carbon)

Drei Punkte fallen auf. Erstens steigt der Wert nicht monoton mit der Reasoning-Stufe: Bei ARC‑AGI‑2 schneidet Carbon mit medium besser ab als mit high, in der ARC‑AGI‑3-Standardumgebung mit low besser als mit medium, und auch Argons bestes ARC‑AGI‑3-Ergebnis liegt bei low. Zweitens kann die höchste Stufe in einer interaktiven Umgebung schlicht scheitern. Bei high ließ Carbon zwischen zwei Aktionen so viel Zeit verstreichen, dass Spielsitzungen abliefen; es beendete nur 30 Spiele. Argon schaffte bei high wegen API-Problemen nur 19. Bei statischen Fragen kostet längeres Nachdenken nur Geld, in einer interaktiven Umgebung verbraucht es auch Umgebungszeit. Drittens übertrifft der Abstand zwischen Ausführungsumgebungen den Generationsabstand bei Weitem. Carbon erreicht mit dem Provider Adapter **99,1 %**, in der Standardumgebung höchstens **65,1 %**, ein Unterschied von rund **34 Punkten**. Laut ARC Prize darf das Modell in der Standardumgebung nur die Notizen mitnehmen, die es selbst behalten will, während der Provider Adapter einen opaken Reasoning-Zustand zwischen Anfragen bewahrt und lange Gespräche komprimiert.

Spiel für Spiel betrachtet, konzentrieren sich die Verluste. In der Standardumgebung steht G50T bei Argon wie Carbon auf low und medium bei **0,0 %**, BP35 bleibt bei höchstens **1,0 %** und TU93 bei höchstens **5,3 %**; mit dem Provider Adapter liegen dieselben drei Spiele größtenteils bei 100 %. Der Gesamtwert stieg um 15 Punkte, doch diese Spiele bewegten sich kaum. Eine plausible, aber unbestätigte Deutung: Sie scheitern daran, Zustand über Schritte hinweg zu halten, nicht am Schließen in einem einzelnen Schritt, und der Generationsgewinn entstand vor allem in Umgebungen, die bereits teilweise lösbar waren. Zum Vergleich: GPT‑6.2 Astra erreicht in der Standardumgebung bei max **70,3 %**, GPT‑6.2 Sol **54,9 %**; Carbon liegt dazwischen. [Verifizierte GPT‑6.2-Ergebnisse von ARC Prize](https://arcprize.org/results/openai-gpt-6-2)

## Akademische Fähigkeiten: Wissenskalibrierung, Mathematik und wissenschaftliche Umsetzung

| Ergebnisse von Epoch AI | Gemini 4 Argon | Gemini 4 Carbon | Gemini 4 Hydrogen | GPT‑6 Astra | Claude Fable 5.2 |
| --- | ---: | ---: | ---: | ---: | ---: |
| GPQA Diamond | 96 % | 97 % | 97 % | 96 % | 96 % |
| SimpleQA Verified | 76 % | 78 % | 71 % | 76 % | 94 % |
| FrontierMath Tiers 1–3 (v2) | 86 % | 91 % | 88 % | 94 % | 95 % |
| FrontierMath Tier 4 (v2) | 78 % | 95 % | 88 % | 98 % | 100 % |
| FrontierMath Erdős | 1 % | 3 % | nicht getestet | 3 % | nicht getestet |
| Chess Puzzles | 59 % | 78 % | 60 % | 76 % | 79 % |
| EBR‑bench (Earthborne Rangers) | 65 % | 88 % | 70 % | 76 % | 90 % |

[Epoch-Daten zu Carbon](https://epoch.ai/models/gemini-4-carbon) · [Epoch-Daten zu Hydrogen](https://epoch.ai/models/gemini-4-hydrogen)

**Wissen und Kalibrierung.** GPQA Diamond trennt Spitzenmodelle nicht mehr: Alle fünf in der Tabelle liegen zwischen 96 % und 97 %. Stärker unterscheiden sie sich beim Faktenabruf und darin, was ein Modell tut, wenn es etwas nicht weiß. Bei Epochs SimpleQA Verified erreicht Carbon **78 %**, **16 Punkte** weniger als Fable 5.2. Auf AA‑Omniscience v1.1 von Artificial Analysis hingegen haben Carbon (medium) und Argon (high) beide eine Halluzinationsrate von **4 %**, Carbon ist damit der niedrigste Wert der Rangliste. Der Nenner dieser Kennzahl umfasst alle nicht vollständig richtigen Antworten, der Zähler die eindeutig falschen; zum Vergleich liegen GPT‑6.2 Astra und Sol bei max bei **59 %** und **55 %**. Beide Ergebnisse stammen aus verschiedenen Fragensätzen und lassen sich nicht verrechnen, weisen aber in dieselbe Richtung: Gemini 4 weiß nicht unbedingt am meisten, verzichtet aber bei Unwissen eher auf eine Antwort oder antwortet nur teilweise, statt etwas zu erfinden. Zumindest bei solchen Wissensfragen liegen seine eindeutigen Antworten seltener daneben; für Literaturrecherchen muss die Abdeckung weiterhin über Suche kommen. [Definitionen und Rangliste von AA‑Omniscience](https://artificialanalysis.ai/evaluations/omniscience)

HLE‑Diamond war eine der vier Evaluationen des Index v5.0, in denen Carbon vorne lag. Google meldet **71,3 %** für Neon, **67,9 %** für Opus 5.5, **64,0 %** für GPT‑6.2 Sol und **58,8 %** für Hydrogen; alle diese Werte stammen aus Googles Modellkarten. [Zusammenfassung von DeepLearning.AI zu den v5.0-Ergebnissen](https://www.deeplearning.ai/the-batch/gemini-leads-the-pack-again) · [Modellkarte Neon](https://deepmind.google/models/model-cards/gemini-4-neon/)

**Mathematik.** Von Argon zu Carbon steigt FrontierMath Tier 4 um **17 Punkte**, der größte Generationssprung in diesen Daten, womit Carbon nahe an GPT‑6 Astra und Fable 5.2 heranrückt. FrontierMath Erdős steigt dagegen nur von **1 %** auf **3 %**. Seine 68 Probleme waren bei Erstellung des Benchmarks offen, eingereichte Beweise oder Widerlegungen werden in Lean geprüft; der aktuelle Bestwert liegt bei **10 %** für GPT‑6.2 Astra. Forschungsprobleme mit bekannter Lösung sind nahezu gesättigt, offene Probleme bleiben fast unberührt. Googles selbst gemeldeter RiemannBench steigt von **76,0 %** bei Argon und **80,0 %** bei Carbon auf **84,0 %** bei Neon, in dieselbe Richtung, aber vom Anbieter selbst gemessen. Epochs Rätselbenchmarks zeigen ähnliche Post-Training-Gewinne: Schachaufgaben steigen von 59 % auf 78 %, EBR‑bench von 65 % auf 88 %. Beide verlangen mehrstufige Suche unter Regeln und passen zum Zuwachs in der ARC‑AGI‑3-Standardumgebung. Das schnelle Hydrogen erreicht bei Tier 4 **88 %**, **10 Punkte** mehr als Argon, liegt bei Rätseln aber nah an Argon und kommt bei SimpleQA Verified nur auf **71 %**. Eine mögliche Erklärung: Fähigkeiten mit automatisch prüfbaren Antworten wie Mathematik bleiben beim Ableiten eines schnellen Modells besser erhalten, während auswendig gelerntes Wissen stärker von der Modellkapazität abhängt; öffentliches Material reicht nicht aus, um das zu bestätigen. [Methodik von FrontierMath Erdős](https://epoch.ai/benchmarks/frontiermath-erdos)

**Wissenschaftliche Umsetzung.** Terminal‑Bench‑Science 0.1 verlangt vom Modell, im Terminal Forschungsergebnisse zu liefern, die sich per Test prüfen lassen. In Carbons Modellkarte, mit Läufen von Artificial Analysis, erreicht Carbon **64,8 %**, Argon **52,9 %**, GPT‑6 Astra **63,3 %** und Opus 5.5 **59,0 %**. Neons Modellkarte meldet **70,5 %** für Neon, vor GPT‑6.2 Sol (**68,0 %**) und Opus 5.5 (**63,3 %**). Google bezeichnet Neon als Klassenbesten, was innerhalb der gewählten Vergleichsgruppe stimmt; in der vollständigen Rangliste von Artificial Analysis erreicht GPT‑6.2 Astra bei xhigh **78,6 %**, also noch **8,1 Punkte** mehr. Hydrogen kommt auf **51,4 %**, unter seinem Vergleichsmodell Claude Sonnet 5.5 (**59,9 %**). [Rangliste Terminal‑Bench‑Science](https://artificialanalysis.ai/evaluations/terminal-bench-science) · [Modellkarte Carbon](https://deepmind.google/models/model-cards/gemini-4-carbon/)

## Softwareentwicklung und Agenten: Die Ausführungsumgebung entscheidet die halbe Antwort

In der offiziellen Rangliste von Terminal‑Bench 4.1 erreicht Carbon (high, Antigravity CLI) **64,5 % ± 3,2 %** bei rund **1.400 $** pro vollständigem Lauf; Claude Opus 5.5 und Fable 5.2 liegen gleichauf bei **65,8 %**, GPT‑6.2 Astra bei **62,1 %**. Carbons Abstand zur Spitze liegt innerhalb des Konfidenzintervalls. Aufschlussreicher ist der Vergleich innerhalb der Familie: Hydrogen erreicht **56,4 % ± 3,0 %** für rund **800 $**, Argon **55,5 % ± 2,8 %** für rund **1.100 $**. Das schnelle Modell zieht also für etwa drei Viertel der Kosten mit dem Flaggschiff von vor sechs Wochen gleich. Neons **65,2 %** stammen aus Googles Modellkarte und standen am 19. November noch nicht in der offiziellen Rangliste. [Rangliste Terminal‑Bench 4.1](https://www.tbench.ai/?version=4)

Wer Modellkarten vergleicht, sollte zuerst prüfen, wer die Evaluation ausgeführt hat. Die Zeile Terminal‑bench 4.0 in Argons Karte gibt Argon **57,4 %** und Opus 5.5 **66,4 %**; zwei Wochen später wechselt Carbons Karte zu einem von Artificial Analysis ausgeführten Terminal‑Bench 4.0 und gibt Argon **57,1 %** und Opus 5.5 **59,6 %**. Dasselbe Vergleichsmodell weicht im gleichnamigen Benchmark um **6,8 Punkte** ab, während sich Argons eigener Wert kaum ändert. Mit den 66,4 % für Opus aus Argons Karte läge Carbons 65,2 % nicht vorn, und in der offiziellen 4.1-Rangliste liegt Carbon ebenfalls knapp hinter Opus. Terminal‑Bench‑Science zeigt dasselbe Muster: GPT‑6 Astra steht in Argons Karte bei **68,1 %** und nach den AA-Werten in Carbons Karte bei **63,3 %**. [Modellkarte Argon](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Modellkarte Carbon](https://deepmind.google/models/model-cards/gemini-4-carbon/)

| SWE‑sweep (Modellkarte Neon) | Neutrale mini‑SWE-Umgebung | Eigene Umgebung des jeweiligen Anbieters |
| --- | ---: | ---: |
| Gemini 4 Neon | 12,8 % | 39,0 % |
| Claude Opus 5.5 | 3,6 % | 10,1 % |
| GPT‑6.2 Sol | 11,6 % | 8,3 % |

In der neutralen mini‑SWE-Umgebung liegt Neon nur **1,2 Punkte** vor GPT‑6.2 Sol; in der jeweils eigenen Umgebung der Anbieter wächst der Abstand auf **30,7 Punkte**. In Antigravity erreicht Neon etwa das Dreifache seines mini‑SWE-Werts, Opus 5.5 legt in der eigenen Umgebung etwa um den Faktor 2,8 zu, und Sol fällt sogar ab. Die Umgebung eines Anbieters ist Teil des Produkts; diese Zahlen messen also Modell plus Werkzeugkette, nicht das Modell allein. Die SWE‑sweep-Zeile in Carbons Modellkarte hat nur eine Spalte und keine Angabe zur Umgebung (Carbon **9,6 %**, Argon **4,3 %**). Ihr Wert von 3,6 % für Opus 5.5 stimmt mit dem mini‑SWE-Wert in Neons Karte überein, was auf dieselbe Konfiguration hindeutet; trifft das zu, verläuft die Serie auf mini‑SWE über 4,3 %, 9,6 % und 12,8 %. [Modellkarte Neon](https://deepmind.google/models/model-cards/gemini-4-neon/)

Andere Programmier-Evaluationen zeichnen ein zurückhaltenderes Bild. Bei FrontierSWE 2 liegt Carbon mit **61,2 %** hinter GPT‑6 Astra (**65,5 %**) und Opus 5.5 (**62,3 %**); bei FrontierCode 2.0 liegt Neon mit **46,2 %** knapp unter Opus 5.5 (**47,3 %**). Im Coding Agent Index von Artificial Analysis führt Neon (xhigh, Antigravity CLI) mit **59**, Fable 5.2 (xhigh) und Opus 5.5 (max) erreichen je **58**, bei durchschnittlichen Kosten pro Aufgabe von **6,86 $**, **15,47 $** und **12,61 $**; Neons Vorteil liegt vor allem bei den Kosten. Computerbedienung ist eine durchgängige Schwäche der Serie: Im Offline-Teilsatz von OSWorld‑2.1 liegt Carbon mit **81,5 %** hinter Opus 5.5 (**87,2 %**) und Hydrogen mit **77,6 %** hinter Claude Sonnet 5.5 (**83,9 %**). [Launch-Evaluation von Neon bei Artificial Analysis](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain) · [Modellkarte Hydrogen](https://deepmind.google/models/model-cards/gemini-4-hydrogen/)

Bei der Wissensarbeit steigt Zapiers AutomationBench von **51,3 %** bei Argon und **53,9 %** bei Carbon auf **56,3 %** bei Neon, und der Kontostand des simulierten Geschäfts in Vending‑Bench 2 wächst von **13.718 $** auf **16.843 $**. Argon erreicht im Legal-Agent-Benchmark von Harvey **19,6 %**, während kein Vergleichsmodell über **6,7 %** kommt; der Vorsprung ist groß, doch das absolute Niveau zeigt, dass solche juristischen Aufgaben noch weit von lieferfähigen Ergebnissen entfernt sind. Auch auf Namen ist zu achten: Das AutomationBench‑AA in Hydrogens Karte (**76,1 %**) ist die Version von Artificial Analysis und nicht mit der von Zapier vergleichbar.

## Langer Kontext und Multimodalität: Vorsprung bei synthetischen Aufgaben, echtes Material braucht eigene Tests

GraphWalks (256K bis 1 Mio. Tokens, Breitensuche, F1) ist laut Google der Bereich mit dem größten Vorsprung der Serie: Argon **84,2 %**, Carbon **96,2 %** und Neon **95,2 %**, gegenüber **66,8 %** für Opus 5.5, **71,8 %** für GPT‑6 Astra und **80,1 %** für GPT‑6.2 Sol; bis 128K erreicht Argon bereits **99,7 %**. GraphWalks verteilt die Kanten eines Graphen über eine lange Eingabe und lässt das Modell sie durchlaufen; gemessen wird, wie gut es weit auseinanderliegende Informationen findet und verknüpft. Der Vorsprung spricht für sehr starkes Auffinden und Verknüpfen in sehr langen Eingaben, doch eine synthetische Graphaufgabe enthält keine semantischen Widersprüche, Dokumentversionen oder impliziten Prämissen. Für Vertragsprüfung oder die Synthese mehrerer Fachartikel muss man mit eigenem Material testen. Es handelt sich um Googles eigene Ergebnisse, die noch nicht unabhängig reproduziert wurden. Neon und Hydrogen geben synchron standardmäßig bis zu 64K Tokens aus, über Long Decoding im Hintergrund bis zu 1 Million. [Modellkarte Argon](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Modellkarte Neon](https://deepmind.google/models/model-cards/gemini-4-neon/)

Bei der Multimodalität gibt es einen Rückschritt. Bei LVBench für das Verständnis langer Videos erreicht Argon **91,7 %** und das aus Carbon abgeleitete Neon **89,0 %**: weiterhin vor Opus 5.5 (**83,7 %**) und GPT‑6.2 Sol (**87,6 %**), aber **2,7 Punkte** unter dem eigenen Vorgänger. Bei Chartography liegt Neon mit **73,5 %** hinter Sol (**75,1 %**). Die Visual-Reasoning-Evaluation GDP.pdf von Artificial Analysis verläuft erneut nicht monoton über die Reasoning-Stufen: Neon erreicht bei high **33,4 %**, fällt bei xhigh aber auf **28,0 %**, Carbon bei high liegt bei **28,4 %**. [Launch-Evaluation von Neon bei Artificial Analysis](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain)

## Sicherheit und Alignment: Mehr Cyberfähigkeit, stärker gestaffelte Freigaben

Cybersicherheit ist die Fähigkeit, die Google am stärksten betont, und der Grund für die gestaffelten Freigaben. Bei SEC‑bench Pro für das Aufspüren von Schwachstellen steigen die Werte von **83,4 %** bei Argon und **88,2 %** bei Carbon auf **90,5 %** bei Neon; bei ExploitGym für das Ausnutzen von Schwachstellen erreicht Carbon **54,8 %**, Argon **42,0 %**. Argon und Carbon gingen zuerst über das Fairwind-Programm an vertrauenswürdige Cyberverteidiger, und Google stellt diesen Verteidigern und eigenen internen Teams auch Versionen ohne Cyber-Schutzmechanismen bereit. [Ankündigung von Argon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/) · [Ankündigung von Carbon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/)

Argons Modellkarte enthält Einstufungen nach dem Frontier Safety Framework vom April 2026: Die Critical Capability Levels (CCL) der Stufe 1 für Biologie und Cybersicherheit lassen sich nicht ausschließen; Google hat daher Sicherheitsnachweise erstellt und das Modell mit Schutzmaßnahmen als unterhalb des CCL bewertet. Chemie, Radiologie und Nuklearbereich erreichen die Beobachtungsschwelle nicht, und weder die Beschleunigung noch die Automatisierung von ML-Forschung und -Entwicklung erreicht ihr CCL. Nach gezielten Tests erreicht Hydrogen weder bei CBRN noch bei Cyber das CCL, wohl aber in beiden Bereichen die Warnschwellen. Neons Modellkarte gibt an, dass der allgemeine Fähigkeitszuwachs gegenüber Argon unter der Schwelle für eine „wesentliche Fähigkeitsänderung“ lag; die vollständige Bewertung kritischer Fähigkeiten wurde deshalb nicht wiederholt und Argons Einstufungen gelten weiter. Bemerkenswert ist, dass Neon im Index von Artificial Analysis **11 Punkte** über Argon liegt; wie Google diese Schwelle festlegt, lässt sich anhand öffentlicher Unterlagen nicht überprüfen. [Modellkarte Argon](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Modellkarte Hydrogen](https://deepmind.google/models/model-cards/gemini-4-hydrogen/) · [Modellkarte Neon](https://deepmind.google/models/model-cards/gemini-4-neon/)

Beim Verhalten zeigen Carbon und Neon auf Terminal‑Bench 4.0 eine Rate erfolgreicher Täuschung von **0,0 %** und im Test von Gray Swan zu indirekter Prompt-Injection eine Angriffserfolgsrate von **0,0 %** (Neon auf höchster Reasoning-Stufe), gegenüber **0,7 %** bei Argon. In Googles Ehrlichkeitsevaluation für Agenten besteht Carbon **92 %** der Aufgaben, Argon **70 %**; Neon und Hydrogen melden **99,2 %** und **94 %**, wobei die Ankündigungen offenlassen, ob derselbe Aufgabensatz verwendet wurde. Hydrogens Modellkarte nennt auch einen Preis: Im Vergleich zu Gemini 3.8 Flash steigen unberechtigte Ablehnungen um **5,57 Punkte**, besonders bei multimodalen Prompts. [Google: Carbon jetzt verfügbar](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/) · [Ankündigung von Neon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/) · [Ankündigung von Hydrogen](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/)

## Kosten und Auswahl: Preis pro Aufgabe, die die Abnahme besteht

Hydrogen kostet **1,50 $** pro Million Eingabetokens und **7,50 $** pro Million Ausgabetokens, einheitlich über das gesamte 1-Mio.-Fenster; Neon kostet **3 / 15 $**, gecachte Eingaben **0,15 $**; Carbons Einführungspreis von **2 / 10 $** gilt bis zum 30. November, danach **4 / 20 $**. Gecachte Eingaben kosten bei Argon, Carbon und Neon 5 % des Eingabepreises. Nach den Kosten pro Aufgabe von Artificial Analysis erreicht Hydrogen bei xhigh 54 Punkte für **3,16 $**, Argon bei high 50 für **4,97 $** (zum Einführungspreis), Neon bei xhigh 61 für **6,44 $** und Carbon bei high 60 für **7,76 $** (zum Standardpreis). Neon bei high erreicht dieselben 60 Punkte wie Carbon bei high für weniger als die Hälfte der Kosten pro Aufgabe. [Ankündigung von Hydrogen](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/) · [Launch-Evaluation von Neon bei Artificial Analysis](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain)

Ein nachrechenbares Beispiel: Eine Anfrage mit 100.000 nicht gecachten Eingabetokens und 10.000 Ausgabetokens kostet ohne Tool-Gebühren **0,225 $** mit Hydrogen, **0,45 $** mit Neon und **0,30 $** mit Carbon im Einführungszeitraum bzw. **0,60 $** zum Standardpreis. Angenommen, man leitet Aufgaben zuerst an Hydrogen und eskaliert Fehlschläge an Neon. Bei einem festen Kostenverhältnis pro Aufruf von 1:2 bleiben die reinen Modellkosten unter denen einer direkten Neon-Nutzung, solange weniger als **50 %** der Aufgaben eskaliert werden; mit den xhigh-Kosten pro Aufgabe von Artificial Analysis (3,16 $ gegenüber 6,44 $) liegt die Gewinnschwelle bei etwa **51 %**. Ein realer Vergleich muss außerdem Wiederholungen, Latenz und die endgültige Bestehensquote einbeziehen. Das Beispiel veranschaulicht nur die Kostenstruktur; die Zahlen sind keine Messungen von Folkbench.

Für automatisch abnehmbare Batch-Aufgaben sollte man Hydrogen zuerst testen: Es erreicht oder übertrifft Argon sowohl im AA-Index als auch bei Terminal‑Bench, zu einem niedrigeren Preis. Für alltägliche Programmierung und Wissensarbeit liegt Neon bei den meisten Evaluationen, die beide Modellkarten gemeinsam haben, gleichauf mit Carbon oder knapp darüber (bei Agents' Last Exam und GraphWalks leicht darunter), und ab dem 30. November ist auch sein Stückpreis niedriger. Für langfristige Softwareentwicklung, Cybersicherheit und interaktive Aufgaben wie ARC‑AGI‑3 ist Carbon weiterhin am besten belegt. Gleich welches Modell: Die Reasoning-Stufen sollten an den eigenen Aufgaben gemessen werden. Bei ARC‑AGI und GDP.pdf war die höchste Stufe nicht immer die beste.

Der Wert von Gemini 4 zum Start liegt nicht in einem einzelnen ersten Platz. In sieben Wochen und mit einem einzigen Wissensstichtag zeigt die Serie, wie weit Post-Training und Inferenzkonfiguration die Fähigkeiten treiben können: 11 Punkte im AA-Index, 15 in der ARC‑AGI‑3-Standardumgebung und 17 bei FrontierMath Tier 4. Sie zeigt auch, was sich auf diesem Weg noch nicht bewegt hat: Offene Mathematikprobleme bleiben im einstelligen Bereich, die Computerbedienung liegt hinter Claude, und mehrere ARC‑AGI‑3-Spiele in der Standardumgebung stehen weiterhin bei null. Modellkarten der Anbieter wählen ihre Vergleichsgruppen und die ausführenden Stellen, unabhängige Ranglisten bewerten neu und wechseln Versionen. Ob sich diese Werte auszahlen, hängt am Ende davon ab, wie die eigenen Aufgaben abgenommen werden.
