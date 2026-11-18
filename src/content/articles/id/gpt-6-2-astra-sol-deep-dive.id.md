---
slug: gpt-6-2-astra-sol-deep-dive
translationKey: gpt-6-2-astra-sol-deep-dive
locale: id
kind: benchmark-review
title: "Ulasan mendalam GPT-6.2 Astra dan Sol: penalaran, rekayasa, dan riset"
description: "Analisis tolok ukur publik GPT-6.2 untuk penalaran abstrak, rekayasa perangkat lunak, riset akademis, dan biaya."
category: Model
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

GPT-6.2 Astra dan Claude Fable 5.2 sama-sama mencatat **174 poin** pada indeks kemampuan Epoch AI. Ketika Epoch menilai tugas terbuka dari pekerjaan timnya sendiri, Astra meraih rata-rata **65%**, sedangkan Fable 5.2 meraih **82%**. Dalam dua evaluasi rekayasa perangkat lunak, GPT-6.2 Sol mendekati Astra. Menjalankan paket evaluasi terminal dengan Sol menelan biaya sekitar seperlimanya. Memecahkan soal sulit, menghasilkan pekerjaan yang dapat diperiksa, dan memutuskan bukti apa yang perlu dicari adalah kemampuan yang berbeda. [Data model Epoch](https://epoch.ai/models/gpt-6-2-astra) · [Evaluasi pekerjaan Epoch](https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work) · [Terminal-Bench 4.0](https://www.tbench.ai/?version=4)

OpenAI meluncurkan kedua model pada 17 November 2026. Folkbench menganalisis hasil publik yang tersedia pada 18 November. Pengukuran berasal dari masing-masing evaluator, sedangkan spesifikasi, harga, dan perbandingan vendor berasal dari OpenAI. Folkbench tidak mengulang pengujiannya. [Pengumuman OpenAI](https://openai.com/index/introducing-gpt-6-2-astra-sol/)

| Evaluasi dan konfigurasi | GPT-6.2 Astra | GPT-6.2 Sol |
| --- | ---: | ---: |
| Artificial Analysis Intelligence Index v5.0.1, max | 62 | 57 |
| ARC-AGI-2, max | 95.8% | 85.8% |
| ARC-AGI-3, lingkungan standar, max | 70.3% | 54.9% |
| Terminal-Bench 4.0, Codex, max | 62.1% ± 2.3% | 61.5% ± 2.8% |
| Epoch Automation Reports, Codex | 65% | Belum dievaluasi |

[Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [ARC Prize](https://arcprize.org/results/openai-gpt-6-2) · [Terminal-Bench](https://www.tbench.ai/?version=4) · [Epoch Automation Reports](https://epoch.ai/benchmarks/epoch-automation-reports)

## Kecerdasan, abstraksi, dan penyimpanan keadaan

Skor Astra di Artificial Analysis, **62**, naik **5 poin** dari Astra sebelumnya dan masih di bawah **65** milik Fable 5.2. Sol menyamai **57** milik Astra lama dengan sekitar **15%** biaya model tertimbang per tugas dalam indeks tersebut. Epoch memakai skala lain, dengan model respons butir Bayesian yang memperhitungkan tingkat kesulitan dan daya pembeda tolok ukur. Penilaian untuk suatu pekerjaan perlu melihat jenis tugas dan cara model dijalankan. [Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [Metode ECI](https://epoch.ai/data/eci-documentation/methodology)

Di ARC-AGI-2, model menyimpulkan aturan dari contoh kisi. Astra unggul **10.0 poin persentase** pada max. Di lingkungan standar ARC-AGI-3, model belajar dari umpan balik atas tindakannya dan selisih naik menjadi **15.4 poin**. Lingkungan standar dalam demo publik meneruskan catatan pilihan model. Provider Adapter juga menyimpan keadaan penalaran yang tidak terlihat dari luar dan memadatkan interaksi panjang. Di konfigurasi itu, Astra dan Sol meraih **99.8%** dan **98.2%** pada max. Astra memperoleh **100.0%** pada xhigh dengan adaptor dan **56.5%** pada xhigh di lingkungan standar. Cara meneruskan hasil percobaan dan hipotesis yang sudah ditolak dapat mengubah nilai maupun selisih antarmodel. [Hasil dan lingkungan ARC Prize](https://arcprize.org/results/openai-gpt-6-2)

## Rekayasa perangkat lunak dan pekerjaan profesional

Di Terminal-Bench 4.0 dengan Codex pada max, selisih estimasi titik ialah **0.6 poin persentase** dan interval yang dipublikasikan banyak bertumpang tindih. Satu paket evaluasi berbiaya sekitar **1.400 dolar AS** pada Astra dan **300 dolar AS** pada Sol. FrontierCode 2.0 berisi **132 tugas** dari pengelola proyek. Penilai memeriksa ketepatan, pengujian, dan lingkup perubahan sebelum perubahan layak digabung. OpenAI melaporkan kedua model berselisih dalam **0.5 poin persentase** pada max, dengan biaya Sol sekitar seperlima. Pada Coding Agent Index dari Artificial Analysis, Astra setara pendahulunya dan Sol turun **3 poin** dari GPT-6.1 Sol. Skor tanya jawab repositori SWE-Atlas-QnA-AA turun **14 poin**, disertai lebih banyak fakta penting yang terlewat. Memperbaiki kode dan menjelaskan repositori perlu dinilai dengan cara berbeda. [Terminal-Bench](https://www.tbench.ai/?version=4) · [Cognition](https://cognition.com/frontiercode) · [OpenAI](https://openai.com/index/introducing-gpt-6-2-astra-sol/) · [Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol)

OpenAI melaporkan Astra mengungguli Fable 5.2 **5.5 poin** di Agents’ Last Exam dengan **5%** dari biaya Fable yang dicantumkan. Sembilan tugas yang memakai model cadangan untuk Fable dikeluarkan. Penilaian manual Epoch membalik urutannya dengan selisih **17 poin persentase**, walaupun Astra mengungguli hasil **56%** dari Astra lama. Sampel Epoch kecil, setiap kombinasi model dan tugas dijalankan satu kali, dan perangkat lunak agen berbeda. Untuk mendelegasikan laporan, periksa apakah penilaian mencakup pemilihan bukti, kebutuhan pembaca, dan mutu hasil revisi. [OpenAI](https://openai.com/index/introducing-gpt-6-2-astra-sol/) · [Metode dan batasan Epoch](https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work)

## Pengetahuan akademis, pembuktian, dan rancangan riset

Dalam perbandingan saat peluncuran, Astra hanya berada di bawah Fable 5.2 pada HLE-Diamond dan bagian fisika sulit CritPt v2. Di AA-Omniscience, tingkat halusinasi pada max ialah **59%** untuk Astra dan **55%** untuk Sol. Pembilangnya jawaban salah, sedangkan penyebutnya jawaban salah, benar sebagian, dan tidak dijawab. Metrik ini membahas kecenderungan menjawab salah saat jawaban penuh tidak berhasil diberikan. Tinjauan pustaka tetap membutuhkan pemeriksaan sumber asli. [Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [Definisi AA-Omniscience](https://artificialanalysis.ai/evaluations/omniscience)

Pada presisi tampilan Epoch, FrontierMath Tier 4 v2 memberi Astra **100%** dan Astra sebelumnya **98%**. Di FrontierMath Erdős hasilnya **10%** dan **3%**. Tolok ukur kedua bermula dari 68 masalah terbuka dan memeriksa bukti atau sangkalan dengan Lean. Pemeriksaan itu menetapkan keabsahan pernyataan formal. Nilai ilmiah juga bergantung pada kesesuaian formalisasi dengan masalah asli serta kebaruan hasil. [Hasil Epoch](https://epoch.ai/models/gpt-6-2-astra) · [FrontierMath Erdős](https://epoch.ai/benchmarks/frontiermath-erdos)

Astra meraih **78.6%** pada xhigh dan **78.1%** pada max di Terminal-Bench-Science 0.1, yang berisi 70 tugas riset dengan keluaran teruji. Saat diminta Epoch merancang varian catur dengan aturan baru, Astra sebagian besar mengganti label bidak dan mempertahankan aturan yang setara. Eksperimen itu sulit membedakan generalisasi dari pengetahuan awal. Epoch juga mendapati sedikit perbaikan setelah percobaan awal. Kartu sistem OpenAI menempatkan Astra di ambang High untuk kemampuan peningkatan AI oleh AI dan Sol di bawahnya. Klasifikasi itu berlaku pada lingkungan riset AI yang diuji. [Terminal-Bench-Science](https://artificialanalysis.ai/evaluations/terminal-bench-science) · [Kasus Epoch](https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work) · [Kartu sistem OpenAI](https://deploymentsafety.openai.com/gpt-6-2-astra-sol)

## Biaya per hasil yang lolos

Kedua API menawarkan konteks **1.050.000 token**, paling banyak **922.000** token masukan dan **128.000** keluaran. Tarif standar konteks pendek per juta token untuk masukan tanpa cache, pembacaan cache, dan keluaran adalah **8 / 0.40 / 40 dolar AS** untuk Astra dan **2 / 0.10 / 10 dolar AS** untuk Sol. Di atas **272K** token masukan, tarif masukan dan cache menjadi dua kali lipat dan tarif keluaran **1.5 kali** untuk seluruh permintaan. Panggilan dengan 100.000 token masukan tanpa cache dan 10.000 token keluaran yang ditagihkan menelan **1.20 dolar AS** pada Astra dan **0.30 dolar AS** pada Sol sebelum biaya alat dan penulisan cache. Dengan rasio biaya tetap 1:4, mulai dari Sol lalu coba sekali dengan Astra lebih murah jika kurang dari **75%** tugas perlu diteruskan. Bandingkan pula tingkat penerimaan akhir, waktu, dan pekerjaan peninjau. Sol layak diprioritaskan untuk tugas yang mudah diperiksa. Astra memiliki dukungan bukti lebih kuat untuk penalaran formal sulit dan penemuan aturan baru. Riset terbuka tetap membutuhkan verifikasi rujukan dan rancangan eksperimen. [API Astra](https://developers.openai.com/api/docs/models/gpt-6.2-astra) · [API Sol](https://developers.openai.com/api/docs/models/gpt-6.2-sol)
