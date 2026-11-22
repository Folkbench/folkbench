---
slug: folkbench-pelican-database
translationKey: folkbench-pelican-database
locale: id
kind: article
title: "Merilis Open-Source Folkbench Pelican Database: Salah Satu Basis Data Pelikan Terbesar dan Terlengkap Selaras models.dev"
description: "Folkbench merilis Pelican Database secara terbuka: 507 model kanonis dari 68 penyedia yang dikurasi dari 3.875 catatan multi-sumber, 454 SVG asli, 507 PNG terstandar, selaras models.dev dan sinkronisasi harian otomatis."
category: Evaluasi
tags: [pelican-benchmark, open-database, model-authenticity, models.dev]
authorId: cang-lin
modelIds: [gpt-6-2-astra, claude-fable-5-2, gemini-4-neon, deepseek-v4-pro]
benchmarkSlugs: []
relatedSlugs: [how-to-score-a-cycling-pelican, how-folkbench-detects-model-degradation, did-the-model-get-dumber]
publishedAt: '2026-11-22'
updatedAt: '2026-11-22'
sources:
  - id: folkbench-pelican-db
    label: Repositori open-source Folkbench/pelican-database
    url: https://github.com/Folkbench/pelican-database
    checkedAt: '2026-11-22'
    claimScope: official
  - id: simon-pelican-tag
    label: Simon Willison, arsip tag pelican-riding-a-bicycle
    url: https://simonwillison.net/tags/pelican-riding-a-bicycle/
    checkedAt: '2026-11-22'
    claimScope: official
  - id: simon-pelican-repo
    label: Repositori eksperimen asli simonw/pelican-bicycle
    url: https://github.com/simonw/pelican-bicycle
    checkedAt: '2026-11-22'
    claimScope: official
  - id: unclek-pelicanmap
    label: Arsip pelikan multibahasa harian UncleK/pelicanmap
    url: https://github.com/UncleK/pelicanmap
    checkedAt: '2026-11-22'
    claimScope: observed
  - id: models-dev
    label: API publik ID model dan metadata models.dev
    url: https://models.dev/api.json
    checkedAt: '2026-11-22'
    claimScope: official
  - id: folkbench-arena
    label: Folkbench Integrity Monitor
    url: https://folkbench.com/id/arena
    checkedAt: '2026-11-22'
    claimScope: observed
---

> Ketika gambar pelikan mengendarai sepeda tidak lagi sekadar tangkapan layar media sosial, melainkan menjadi arsip referensi terstandar yang dapat dicari dan diperbarui setiap hari untuk 507 model, uji viral itu berubah menjadi infrastruktur rekayasa nyata untuk memverifikasi keaslian LLM.

Hari ini kami merilis secara open-source **[Folkbench/pelican-database](https://github.com/Folkbench/pelican-database)** — salah satu basis data referensi SVG dan PNG **"pelican riding a bicycle"** terbesar dan terlengkap di dunia.

Sejak Oktober 2024 saat Simon Willison mempopulerkan prompt *"Generate an SVG of a pelican riding a bicycle"*, ratusan model frontier dan open-weight telah diuji. Namun hasilnya tersebar di blog, utas X, GitHub Gist, dan galeri dengan penamaan tidak konsisten serta banyak yang hanya berupa tangkapan layar tanpa kode SVG asli.

`Folkbench/pelican-database` menyatukan sumber-sumber tersebut ke dalam dataset bersih yang selaras dengan ID kanonis **[models.dev](https://models.dev)** dan diperbarui otomatis setiap hari melalui GitHub Actions untuk menggerakkan deteksi keaslian model di [Folkbench](https://folkbench.com/id).

---

## 1. Dalam Angka: Mengapa Menjadi Salah Satu Basis Data Pelikan Terlengkap

Pada snapshot publik perdana (2026-11-22), `Folkbench/pelican-database` mencakup:

| Dimensi | Angka Terverifikasi | Detail |
| --- | --- | --- |
| **Total Sampel Kandidat** | **3.875** | Gabungan UncleK/pelicanmap + 161 pos tag, tabel HTML statis, dan SVG langsung Simon Willison |
| **Model Kanonis Unik** | **507** | Dideduplikasi dari **799** nama mentah menjadi kunci `provider/model_id` |
| **Penyedia Tercakup** | **68** | Meliputi lab frontier dan keluarga model open-weight global |
| **Cakupan `.svg` Asli** | **454 (89,5%)** | Kode sumber SVG tervalidasi, bukan sekadar tangkapan layar |
| **Render `.png` Terstandar** | **507 (100%)** | Render seragam 1024px latar putih via peramban headless (0 hilang) |
| **Kecocokan Tepat `models.dev`** | **378 (74,6%)** | Termasuk 190 penyedia pihak pertama; 129 model historis mengikuti skema yang sama |
| **Diuji oleh Simon Willison** | **177** | Ditandai `tested_by_simon` dengan prioritas pemulihan `.svg` asli |
| **Rentang Waktu** | **2024-10-25 hingga 2026-11-21** | Lebih dari dua tahun evolusi penalaran spasial dan pembuatan SVG |

![Evolusi SVG asli antara baseline 2024 dan model frontier 2026 di Folkbench Pelican Database untuk OpenAI, Anthropic, dan Google.](/blog/figures/folkbench-pelican-database/evolution-grid.png)

*Gambar 1: Enam berkas `.svg` asli dirender langsung dari `Folkbench/pelican-database`. Baris atas (Oktober 2024): `openai/gpt-4o`, `anthropic/claude-3-5-sonnet-20241022`, `google/gemini-1.5-pro-001`. Baris bawah (November 2026): `openai/gpt-6.2-astra`, `anthropic/claude-fable-5-2`, `google/gemini-4-neon`.*

---

## 2. Lima Pilar Rekayasa

![Gambar 2: Arsitektur pengumpulan multi-sumber, penyelarasan models.dev, render inkremental SHA-256, dan sinkronisasi harian Folkbench Pelican Database.](/blog/figures/folkbench-pelican-database/pipeline-architecture-en.svg)

1. **Pemulihan SVG Asli Multi-Sumber**: menggabungkan [UncleK/pelicanmap](https://github.com/UncleK/pelicanmap)[^unclek-pelicanmap] dan [161 artikel Simon Willison](https://simonwillison.net/tags/pelican-riding-a-bicycle/)[^simon-pelican-tag], mendekode 180 SVG base64 dari tabel HTML `static.simonwillison.net` dengan seleksi deterministik (**`.svg` asli > uji Simon > prompt classic > effort standar/tinggi**).
2. **Penyelarasan `models.dev` & Atribusi Lab Asli**: menormalkan 799 alias menggunakan [`models.dev/api.json`](https://models.dev/api.json)[^models-dev] ke 68 penyedia (OpenAI 72, Google 64, Alibaba/Qwen 63, Anthropic 30, Meta 21, Mistral 21, DeepSeek 19, Z.AI/GLM 19, xAI 16, dll.) serta menyimpan tabel `model_aliases`.
3. **Render Headless Seragam**: pipeline lintas platform Chromium/Edge CDP merender setiap SVG pada sandbox `<img>` terisolasi selebar 1024px dengan verifikasi header dan dimensi untuk seluruh 507 PNG.
4. **Siap Pakai dalam Berkas, JSON & SQLite**: `models/<provider>/<model_id>.{svg,png}`, `catalog.json`, dan `pelicans.sqlite` (4 tabel + 2 view).
5. **Sinkronisasi Inkremental Harian**: `scripts/sync.py` dan `.github/workflows/auto-sync.yml` berjalan otomatis pukul `09:00 UTC` dengan hash SHA-256 sehingga hanya model baru atau berubah yang dirender ulang.

---

## 3. Menggerakkan Deteksi Keaslian Model di Folkbench

Sebagaimana dibahas pada [Cara Memberi Skor Pelikan Bersepeda](/id/blog/how-to-score-a-cycling-pelican/) dan [Memperkenalkan Deteksi Degradasi Folkbench](/id/blog/how-folkbench-detects-model-degradation/), penggantian model diam-diam atau penurunan effort penalaran di relay API tidak tampak pada pemantauan HTTP 200 biasa. `Folkbench/pelican-database` menyediakan **baseline visual terbuka yang dapat diperiksa ulang**, melengkapi probe dinamis dan baseline API resmi di [Folkbench Integrity Monitor](https://folkbench.com/id/arena)[^folkbench-arena].

---

## 4. Mulai Cepat

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

## 5. Lisensi & Ucapan Terima Kasih (Credits & Acknowledgements)

Terima kasih sebesar-besarnya kepada **[Simon Willison](https://simonwillison.net/)**[^simon-pelican-tag][^simon-pelican-repo], **[UncleK / Pelican Map](https://github.com/UncleK/pelicanmap)**[^unclek-pelicanmap], **[models.dev](https://models.dev)**[^models-dev], serta **Tihu**, **Pelican Zoo**, **Museum of Models**, **Pelicans.wtf**, **Pelican Benchmark**, dan seluruh kontributor komunitas. Skrip, skema, dan dokumentasi berlisensi **MIT License**, sementara hak atas karya SVG/PNG pihak ketiga tetap milik pencipta aslinya (lihat `NOTICE.md`). Repositori: **[github.com/Folkbench/pelican-database](https://github.com/Folkbench/pelican-database)**[^folkbench-pelican-db].
