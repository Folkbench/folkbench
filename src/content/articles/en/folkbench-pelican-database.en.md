---
slug: folkbench-pelican-database
translationKey: folkbench-pelican-database
locale: en
kind: article
title: "Open-Sourcing Folkbench Pelican Database: One of the Largest, Most Comprehensive models.dev-Aligned Pelican Datasets"
description: "Folkbench open-sources Pelican Database: 507 canonical models across 68 providers deduplicated from 3,875 multi-source records, with 454 raw SVGs, 507 standardized PNG renders, models.dev alignment, and daily automated GitHub Actions sync powering model authenticity detection."
category: Evaluation
tags: [pelican-benchmark, open-database, model-authenticity, models.dev]
authorId: cang-lin
modelIds: [gpt-6-2-astra, claude-fable-5-2, gemini-4-neon, deepseek-v4-pro]
benchmarkSlugs: []
relatedSlugs: [how-to-score-a-cycling-pelican, how-folkbench-detects-model-degradation, did-the-model-get-dumber]
publishedAt: '2026-11-22'
updatedAt: '2026-11-22'
sources:
  - id: folkbench-pelican-db
    label: Folkbench/pelican-database Open-Source Repository
    url: https://github.com/Folkbench/pelican-database
    checkedAt: '2026-11-22'
    claimScope: official
  - id: simon-pelican-tag
    label: Simon Willison, pelican-riding-a-bicycle tag archive
    url: https://simonwillison.net/tags/pelican-riding-a-bicycle/
    checkedAt: '2026-11-22'
    claimScope: official
  - id: simon-pelican-repo
    label: simonw/pelican-bicycle original experiment repository
    url: https://github.com/simonw/pelican-bicycle
    checkedAt: '2026-11-22'
    claimScope: official
  - id: unclek-pelicanmap
    label: UncleK/pelicanmap daily multilingual pelican archive
    url: https://github.com/UncleK/pelicanmap
    checkedAt: '2026-11-22'
    claimScope: observed
  - id: models-dev
    label: models.dev public model ID and metadata API
    url: https://models.dev/api.json
    checkedAt: '2026-11-22'
    claimScope: official
  - id: folkbench-arena
    label: Folkbench Integrity Monitor
    url: https://folkbench.com/en/arena
    checkedAt: '2026-11-22'
    claimScope: observed
---

> When a drawing of a pelican riding a bicycle stops being a passing social-media screenshot and becomes a standardized, searchable, daily-synced reference archive covering 507 models, a viral LLM meme turns into real engineering infrastructure for verifying model authenticity.

Today, we are open-sourcing **[Folkbench/pelican-database](https://github.com/Folkbench/pelican-database)**—one of the largest and most comprehensive structured **"pelican riding a bicycle"** SVG and PNG reference databases in the world.

Since October 2024, when Simon Willison popularized the prompt *"Generate an SVG of a pelican riding a bicycle,"* developers and researchers across the globe have tested hundreds of frontier and open-weight LLMs. Yet that remarkable visual record remained scattered across blog posts, X threads, GitHub Gists, static comparison tables, and independent galleries: model names were inconsistent, a single checkpoint appeared under dozens of informal aliases, and many entries survived only as compressed screenshots without raw SVG source code.

`Folkbench/pelican-database` turns that fragmented record into a clean, machine-readable dataset aligned to **[models.dev](https://models.dev)** canonical identifiers and automatically kept up to date every day via GitHub Actions—built to power [Folkbench's](https://folkbench.com/en) model authenticity detection and visual baseline comparison.

---

## 1. By the Numbers: Why It Is One of the Largest and Most Complete Pelican Databases

The usefulness of a reference dataset comes down to breadth, source-code fidelity, identifier consistency, and ongoing freshness. As of its initial public snapshot (2026-11-22), `Folkbench/pelican-database` delivers:

| Dimension | Verified Count | Details |
| --- | --- | --- |
| **Aggregated Candidate Specimens** | **3,875** | Merged from UncleK/pelicanmap + all 161 Simon Willison tag posts, static HTML grids, and direct SVGs |
| **Unique Canonical Models** | **507** | Deduplicated from **799** raw model strings into canonical `provider/model_id` entries |
| **Providers Covered** | **68** | Spanning frontier labs, open-weight model families, and research platforms worldwide |
| **Original `.svg` Source Coverage** | **454 (89.5%)** | Validated, parseable raw SVG source code rather than secondhand screenshots |
| **Standardized `.png` Renders** | **507 (100%)** | Uniform 1024px white-background headless browser renders (or normalized PNGs), 0 missing |
| **Exact Live `models.dev` Matches** | **378 (74.6%)** | Including 190 first-party provider matches; all 129 retired/historical models follow the same schema |
| **Simon Willison Tested Models** | **177** | Flagged via `tested_by_simon`; automatically upgraded to raw `.svg` whenever available |
| **Historical Time Span** | **2024-10-25 to 2026-11-21** | Over two years of spatial reasoning and SVG coding evolution in one timeline |

![Real SVG evolution from 2024 baselines to 2026 frontier models inside Folkbench Pelican Database across OpenAI, Anthropic, and Google.](/blog/figures/folkbench-pelican-database/evolution-grid.png)

*Figure 1: Six original `.svg` specimens rendered directly from `Folkbench/pelican-database`. Top row (October 2024): `openai/gpt-4o`, `anthropic/claude-3-5-sonnet-20241022`, and `google/gemini-1.5-pro-001`. Bottom row (November 2026): `openai/gpt-6.2-astra`, `anthropic/claude-fable-5-2`, and `google/gemini-4-neon`. Two years of progress from abstract geometric assembly to coherent character and bicycle mechanics are immediately visible.*

---

## 2. Five Engineering Decisions Behind a Production-Grade Archive

![Figure 2 architecture diagram: Folkbench Pelican Database multi-source intake, models.dev normalization, SHA-256 incremental headless rendering, and daily GitHub Actions sync pipeline.](/blog/figures/folkbench-pelican-database/pipeline-architecture-en.svg)

*Figure 2: End-to-end automated pipeline of `Folkbench/pelican-database`, unifying community archives, direct Simon Willison crawls, and live `models.dev` metadata into a daily-synced reference baseline for Folkbench authenticity detection.*

Several great community galleries already showcase pelican drawings for human browsing. Turning a gallery into a dataset that automated evaluation systems can trust requires solving five concrete engineering problems:

### 1. Multi-Source Recovery: Upgrading Screenshots Back to Raw SVG

Many widely shared model outputs circulated on social media only as screenshots, even when the original author had published raw SVG inside a blog post or static HTML comparison grid. Our pipeline combines the daily community archive from [UncleK/pelicanmap](https://github.com/UncleK/pelicanmap)[^unclek-pelicanmap] with a direct crawl of all 161 posts under [Simon Willison's `pelican-riding-a-bicycle` tag](https://simonwillison.net/tags/pelican-riding-a-bicycle/)[^simon-pelican-tag]:

- Automatically decodes embedded `data:image/svg+xml;base64` cells from Simon Willison's `static.simonwillison.net` comparison tables (**180** lossless raw SVGs recovered);
- Downloads and validates directly linked `.svg` assets (recovering true vector source for `claude-3-7-sonnet`, `deepseek-r1`, `gemini-2.0-pro-exp-02-05`, `phi-4`, `glm-5.2`, and more);
- Applies deterministic representative selection (**raw `.svg` > Simon Willison test > classic prompt > default/high reasoning effort**) while filtering out non-pelican derivatives and multi-model collages.

For the 53 models where no raw `.svg` has ever been publicly released, we keep the record cleanly marked as `has_svg: false` with a standardized `.png` so historical coverage stays intact.

### 2. First-Class `models.dev` Alignment and Native Lab Attribution

Cross-platform evaluation routinely breaks on inconsistent naming: `Qwen/Qwen3.6-27B`, `Qwen3.6-27B (Q4_K_M)`, and `unsloth/Qwen3.6-27B-GGUF:Q4_K_M` all refer to the same underlying model, while resellers and cloud gateways often re-prefix another lab's model under their own namespace.

Our alignment stage normalizes all 799 raw names against [`models.dev/api.json`](https://models.dev/api.json)[^models-dev] with strict **native lab ownership rules**:

- **Canonical `provider/model_id` keys**: `openai/gpt-6.2-astra`, `anthropic/claude-fable-5-2`, `google/gemini-4-neon`, `alibaba/qwen3.6-27b`, `deepseek/deepseek-v4-pro`, `zai/glm-5.2`, `moonshotai/kimi-k3.1-pro`, and more;
- **Deep coverage across 68 providers**: OpenAI (72), Google (64), Alibaba/Qwen (63), Anthropic (30), Meta (21), Mistral (21), DeepSeek (19), Z.AI/GLM (19), xAI (16), Bailing (11), Moonshot AI/Kimi (11), Amazon Bedrock (9), MiniMax (9), Volcengine/Doubao (9), NVIDIA (9), and 53 additional providers;
- **Full alias lookup table**: All **799** raw model aliases are preserved in `model_aliases` and `raw_model_aliases` so downstream pipelines can map informal names back to canonical IDs programmatically.

### 3. Headless Browser Rendering with Integrity Checks

LLM-written SVGs frequently omit `xmlns` or `viewBox`, leave bare ampersands unescaped, or rely on gradients, filters, and `<clipPath>` behaviors that lightweight vector libraries fail to render accurately.

Our cross-platform headless Chromium/Edge CDP renderer sanitizes every SVG, renders it inside an isolated `<img>` sandbox onto a uniform **1024px-wide white canvas** preserving natural aspect ratio, and verifies every output PNG's header, dimensions, and byte size—achieving **507/507 clean renders with zero failures**.

### 4. Ready-to-Query Delivery: Files, JSON, and SQLite

Whether you are building an interactive comparison UI, calibrating a vision judge, or running automated probes, every format is ready out of the box:

- **`models/<provider>/<model_id>.{svg,png}`**: clean, predictable directory hierarchy;
- **`catalog.json`**: complete JSON index with `models.dev` metadata, dimensions, byte sizes, provenance URLs, and alias lists;
- **`pelicans.sqlite`**: normalized SQLite database (`providers`, `models`, `model_aliases`, `model_sources` plus `v_simon_models` and `v_svg_models` views).

### 5. Automated Daily Incremental Sync

Model releases never pause. `Folkbench/pelican-database` ships with `scripts/sync.py` and a daily GitHub Actions workflow (`.github/workflows/auto-sync.yml` at `09:00 UTC`):

- Pulls the latest `models.dev/api.json`, `UncleK/pelicanmap`, and Simon Willison posts automatically;
- Uses **SHA-256 content hashing** to re-render only newly added or upgraded specimens;
- Commits updates to `models/`, `catalog.json`, `pelicans.sqlite`, and bilingual README stats only when substantive model changes occur.

---

## 3. From Fun Benchmark to Verification Baseline: Powering Folkbench Authenticity Detection

In our earlier posts [How Do You Score a Pelican on a Bicycle?](/en/blog/how-to-score-a-cycling-pelican/) and [Introducing Folkbench Degradation Detection](/en/blog/how-folkbench-detects-model-degradation/), we examined three subtle failure modes in third-party AI API relays: **silent substitution with cheaper models, hidden reductions in reasoning effort, and context truncation**.

Basic uptime checks still return HTTP `200`, and asking a model to name itself is trivially spoofed via a system prompt. Generating an SVG of a pelican riding a bicycle is much harder to fake convincingly:

1. **Sharp cross-generation separation**: Comparing a live relay output claimed to be `gpt-6.2-astra` or `claude-fable-5-2` side by side against the canonical baseline in `Folkbench/pelican-database`—and against older or lighter models from the same family—quickly surfaces glaring drops in mechanical structure, spatial alignment, and compositional fidelity.
2. **A visual reference layer alongside continuous probes**: Within Folkbench, `Folkbench/pelican-database` is not meant to replace statistical testing with a single picture. Instead, it serves as an **open, inspectable reference baseline** complementing the dynamic current-events probes, token telemetry, model fingerprints, and independent official API baselines in [Folkbench Integrity Monitor](https://folkbench.com/en/arena)[^folkbench-arena].
3. **Reusable open research infrastructure**: Beyond relay verification, researchers can immediately use the dataset to calibrate vision-language judges (VLM-as-a-Judge), study generational gains in code-to-visual spatial reasoning, or benchmark SVG generation quality.

---

## 4. Quick Start

Clone the repository and query any model in seconds:

```bash
git clone --depth 1 https://github.com/Folkbench/pelican-database.git
cd pelican-database
```

### Query via SQLite

```sql
-- Models tested by Simon Willison with raw SVG source available
SELECT model_id, models_dev_id, svg_path, png_path, date
FROM models
WHERE tested_by_simon = 1 AND has_svg = 1
ORDER BY provider, model_id;

-- Resolve an informal model name to its canonical models.dev ID
SELECT a.raw_model, m.model_id, m.svg_path, m.png_path
FROM model_aliases a
JOIN models m ON m.model_id = a.model_id
WHERE a.raw_model LIKE '%Claude 3.7%';

-- Top 10 providers by model coverage
SELECT provider, model_count, svg_count, simon_tested_count
FROM providers
ORDER BY model_count DESC
LIMIT 10;
```

### Load in Python

```python
import json
from pathlib import Path

catalog = json.loads(Path("catalog.json").read_text(encoding="utf-8"))
by_id = {m["model_id"]: m for m in catalog["models"]}

sample = by_id["google/gemini-4-neon"]
print(sample["svg_path"], sample["png_path"], sample["source_url"])
```

---

## 5. License Boundaries & Credits / Acknowledgements

`Folkbench/pelican-database` exists only because of the creators, archivists, and open-source maintainers who built this ecosystem before us. We extend our sincere thanks to:

- **[Simon Willison](https://simonwillison.net/)**, creator of the *"Generate an SVG of a pelican riding a bicycle"* LLM benchmark, whose [161 tagged posts](https://simonwillison.net/tags/pelican-riding-a-bicycle/)[^simon-pelican-tag] and [simonw/pelican-bicycle](https://github.com/simonw/pelican-bicycle)[^simon-pelican-repo] repository established the foundation.
- **[UncleK / Pelican Map](https://github.com/UncleK/pelicanmap)**, for maintaining an extraordinary daily-updated multilingual pelican archive[^unclek-pelicanmap] with painstaking source URLs, dates, and original media preservation.
- **[models.dev](https://models.dev)**, for providing the open canonical registry of AI providers and model IDs (`api.json`)[^models-dev] that anchors our schema.
- **Community Benchmarks & Testers**, including **Tihu** (`tihu.app`), **Pelican Zoo** (`pelicanzoo.ai`), **Museum of Models** (`museumofmodels.com`), **Pelicans.wtf**, **Pelican Benchmark**, and every researcher and developer sharing tests across X, GitHub, Reddit, and Hugging Face. Every entry retains its original author, date, and source URL.

Pipeline scripts, database schema, and original documentation are licensed under the **MIT License**. Archived third-party SVG/PNG outputs and upstream metadata remain subject to their original authors' rights and upstream licenses, as detailed in the repository's `NOTICE.md`.

Explore the repository at **[github.com/Folkbench/pelican-database](https://github.com/Folkbench/pelican-database)**[^folkbench-pelican-db]—stars, alias refinements, and new model contributions are welcome as we keep building this shared reference archive for the AI community.
