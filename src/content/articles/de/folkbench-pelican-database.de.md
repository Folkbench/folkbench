---
slug: folkbench-pelican-database
translationKey: folkbench-pelican-database
locale: de
kind: article
title: "Open-Source-Release der Folkbench Pelican Database: Eine der größten und umfassendsten models.dev-ausgerichteten Pelikan-Datenbanken"
description: "Folkbench veröffentlicht die Pelican Database als Open Source: 507 kanonische Modelle von 68 Anbietern aus 3.875 Quellen, 454 echte SVGs, 507 standardisierte PNGs, models.dev-Abgleich und täglicher automatischer Sync für Modell-Authentizitätsprüfungen."
category: Tests
tags: [pelican-benchmark, open-database, model-authenticity, models.dev]
authorId: cang-lin
modelIds: [gpt-6-2-astra, claude-fable-5-2, gemini-4-neon, deepseek-v4-pro]
benchmarkSlugs: []
relatedSlugs: [how-to-score-a-cycling-pelican, how-folkbench-detects-model-degradation, did-the-model-get-dumber]
publishedAt: '2026-11-22'
updatedAt: '2026-11-22'
sources:
  - id: folkbench-pelican-db
    label: Open-Source-Repository Folkbench/pelican-database
    url: https://github.com/Folkbench/pelican-database
    checkedAt: '2026-11-22'
    claimScope: official
  - id: simon-pelican-tag
    label: Simon Willison, Tag-Archiv pelican-riding-a-bicycle
    url: https://simonwillison.net/tags/pelican-riding-a-bicycle/
    checkedAt: '2026-11-22'
    claimScope: official
  - id: simon-pelican-repo
    label: Ursprüngliches Experiment-Repository simonw/pelican-bicycle
    url: https://github.com/simonw/pelican-bicycle
    checkedAt: '2026-11-22'
    claimScope: official
  - id: unclek-pelicanmap
    label: Täglich aktualisiertes mehrsprachiges Archiv UncleK/pelicanmap
    url: https://github.com/UncleK/pelicanmap
    checkedAt: '2026-11-22'
    claimScope: observed
  - id: models-dev
    label: Öffentliche Modell-ID- und Metadaten-API von models.dev
    url: https://models.dev/api.json
    checkedAt: '2026-11-22'
    claimScope: official
  - id: folkbench-arena
    label: Folkbench Integrity Monitor
    url: https://folkbench.com/de/arena
    checkedAt: '2026-11-22'
    claimScope: observed
---

> Wenn ein Pelikan auf dem Fahrrad nicht mehr nur ein flüchtiger Screenshot in sozialen Medien ist, sondern als standardisierte, durchsuchbare und täglich aktualisierte Referenzdatenbank für 507 Modelle vorliegt, wird aus einem viralen Test eine belastbare Engineering-Grundlage zur Überprüfung der Modell-Authentizität.

Heute veröffentlichen wir **[Folkbench/pelican-database](https://github.com/Folkbench/pelican-database)** als Open Source – eine der weltweit größten und umfassendsten strukturierten SVG- und PNG-Referenzdatenbanken für den LLM-Benchmark **„Pelican Riding a Bicycle“**.

Seit Simon Willison im Oktober 2024 den Prompt *"Generate an SVG of a pelican riding a bicycle"* bekannt machte, wurden Hunderte Frontier- und Open-Weight-Modelle getestet. Doch diese Ergebnisse waren über Blogs, X-Threads, GitHub Gists und Galerien verstreut – mit inkonsistenten Modellnamen und häufig nur als komprimierte Screenshots ohne echten SVG-Quellcode.

`Folkbench/pelican-database` führt diese Quellen in einem sauberen, an **[models.dev](https://models.dev)** ausgerichteten und per GitHub Actions täglich inkrementell aktualisierten Datensatz zusammen, der die Modell-Authentizitätsprüfung von [Folkbench](https://folkbench.com/de) antreibt.

---

## 1. Zahlen im Überblick: Warum sie zu den größten und vollständigsten Pelikan-Datenbanken zählt

Zum ersten öffentlichen Snapshot (2026-11-22) umfasst `Folkbench/pelican-database`:

| Dimension | Verifizierter Stand | Details |
| --- | --- | --- |
| **Zusammengeführte Kandidaten** | **3.875** | Kombiniert aus UncleK/pelicanmap + allen 161 Beiträgen, HTML-Tabellen und Direkt-SVGs von Simon Willison |
| **Eindeutige kanonische Modelle** | **507** | Dedupliziert aus **799** Rohbezeichnungen in `provider/model_id` |
| **Abgedeckte Anbieter** | **68** | Von Frontier-Labs bis zu Open-Weight-Familien weltweit |
| **Echte `.svg`-Quellcodes** | **454 (89,5 %)** | Validierte, parsbare SVG-Dateien statt bloßer Screenshots |
| **Standardisierte `.png`-Renders** | **507 (100 %)** | Einheitliche 1024px-Renders auf weißem Hintergrund per Headless-Browser (0 Fehler) |
| **Exakte `models.dev`-Treffer** | **378 (74,6 %)** | Davon 190 First-Party-Zuordnungen; 129 ältere Modelle folgen demselben Schema |
| **Von Simon Willison getestet** | **177** | Mit `tested_by_simon` markiert und nach Möglichkeit auf echte `.svg`-Quellen aufgewertet |
| **Zeitraum** | **2024-10-25 bis 2026-11-21** | Über zwei Jahre Entwicklung von räumlichem Denken und SVG-Codegenerierung |

![SVG-Entwicklung von 2024-Baselines zu 2026-Frontier-Modellen in der Folkbench Pelican Database bei OpenAI, Anthropic und Google.](/blog/figures/folkbench-pelican-database/evolution-grid.png)

*Abbildung 1: Sechs Original-`.svg`-Dateien direkt aus `Folkbench/pelican-database`. Obere Reihe (Oktober 2024): `openai/gpt-4o`, `anthropic/claude-3-5-sonnet-20241022`, `google/gemini-1.5-pro-001`. Untere Reihe (November 2026): `openai/gpt-6.2-astra`, `anthropic/claude-fable-5-2`, `google/gemini-4-neon`.*

---

## 2. Fünf Engineering-Prinzipien hinter dem Archiv

![Abbildung 2: Architektur der Multi-Source-Erfassung, models.dev-Normalisierung, SHA-256-Inkrementrendering und täglichen GitHub-Actions-Synchronisierung der Folkbench Pelican Database.](/blog/figures/folkbench-pelican-database/pipeline-architecture-en.svg)

1. **Wiederherstellung echter SVG-Quellen**: Durch den Abgleich von [UncleK/pelicanmap](https://github.com/UncleK/pelicanmap)[^unclek-pelicanmap] mit allen [161 Beiträgen von Simon Willison](https://simonwillison.net/tags/pelican-riding-a-bicycle/)[^simon-pelican-tag] dekodiert unsere Pipeline 180 eingebettete Base64-SVGs aus statischen HTML-Vergleichstabellen sowie direkte `.svg`-Links und wählt deterministisch aus (**echtes `.svg` > Simon-Test > Classic-Prompt > Standard/High-Effort**).
2. **`models.dev`-Standardisierung & Anbieter-Korrektur**: Alle 799 Rohbezeichnungen werden über [`models.dev/api.json`](https://models.dev/api.json)[^models-dev] ihren nativen Entwickler-Labs zugeordnet (u. a. OpenAI 72, Google 64, Alibaba/Qwen 63, Anthropic 30, Meta 21, Mistral 21, DeepSeek 19, Z.AI/GLM 19, xAI 16) und vollständig in `model_aliases` dokumentiert.
3. **Einheitliches Headless-Browser-Rendering**: Ein plattformübergreifender Chromium/Edge-CDP-Renderer erzeugt im isolierten `<img>`-Kontext 1024px-PNGs und prüft Header sowie Dimensionen aller 507 Dateien.
4. **Sofort nutzbare Datenformate**: Verzeichnis `models/<provider>/<model_id>.{svg,png}`, vollständiger `catalog.json`-Index und relationale SQLite-Datenbank `pelicans.sqlite` (4 Tabellen, 2 Views).
5. **Tägliche inkrementelle GitHub-Actions-Synchronisierung**: `scripts/sync.py` und `.github/workflows/auto-sync.yml` laufen täglich um `09:00 UTC` und rendern dank SHA-256-Prüfsummen nur neue oder aktualisierte Modelle neu.

---

## 3. Visuelle Referenzbasis für die Folkbench-Authentizitätsprüfung

Wie in [Wie bewertet man einen Pelikan auf dem Fahrrad?](/de/blog/how-to-score-a-cycling-pelican/) und [Vorstellung der Folkbench-Degradierungserkennung](/de/blog/how-folkbench-detects-model-degradation/) erläutert, bleiben heimliche Modellwechsel oder gedrosselte Reasoning-Budgets in API-Relays bei simplen HTTP-200-Checks unsichtbar. `Folkbench/pelican-database` liefert eine **offene, nachprüfbare visuelle Baseline**, die die dynamischen Sonden, Modell-Fingerprints und offiziellen Referenz-Keys im [Folkbench Integrity Monitor](https://folkbench.com/de/arena)[^folkbench-arena] ergänzt.

---

## 4. Schnellstart

```bash
git clone --depth 1 https://github.com/Folkbench/pelican-database.git
cd pelican-database
```

```sql
SELECT model_id, models_dev_id, svg_path, png_path, date
FROM models
WHERE tested_by_simon = 1 AND has_svg = 1
ORDER BY provider, model_id;
```

---

## 5. Lizenz & Danksagung (Credits & Acknowledgements)

Unser herzlicher Dank gilt **[Simon Willison](https://simonwillison.net/)**[^simon-pelican-tag][^simon-pelican-repo], **[UncleK / Pelican Map](https://github.com/UncleK/pelicanmap)**[^unclek-pelicanmap], **[models.dev](https://models.dev)**[^models-dev] sowie **Tihu**, **Pelican Zoo**, **Museum of Models**, **Pelicans.wtf**, **Pelican Benchmark** und allen Community-Mitwirkenden. Skripte, Schema und Dokumentation stehen unter der **MIT License**; die archivierten SVG/PNG-Ausgaben und Metadaten unterliegen weiterhin den Rechten der ursprünglichen Urheber (siehe `NOTICE.md`). Zum Repository: **[github.com/Folkbench/pelican-database](https://github.com/Folkbench/pelican-database)**[^folkbench-pelican-db].
