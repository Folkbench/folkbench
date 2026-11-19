---
slug: gemini-4-series-deep-dive
translationKey: gemini-4-series-deep-dive
locale: id
kind: benchmark-review
title: "Seri Gemini 4 secara mendalam: cara berpikir Argon, Carbon, Hydrogen, dan Neon"
description: "Kami mencocokkan kartu model Google dengan hasil Artificial Analysis, Epoch AI, ARC Prize, dan Terminal-Bench untuk menganalisis empat model Gemini 4 dari sisi kecerdasan umum, penalaran abstrak, matematika dan sains, rekayasa perangkat lunak, konteks panjang, serta keamanan, sekaligus menunjukkan bagaimana anggaran penalaran dan kondisi evaluasi mengubah kesimpulan."
category: Model
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

Pada Intelligence Index v5.0.1 dari Artificial Analysis, jika token output untuk menjalankan seluruh indeks dibatasi di kisaran 110 hingga 124 juta, model Gemini 4 berurutan seperti ini: Argon (high) **50**, Hydrogen (high) **51**, Carbon (medium) **58**, dan Neon (high) **60**. Keempatnya memiliki batas pengetahuan yang sama, yaitu Maret 2026. Menurut kartu model Google, Carbon dibangun dari Argon, sedangkan Hydrogen dan Neon diadaptasi dari Carbon. Di lingkungan standar ARC‑AGI‑3, Carbon unggul **15,3 poin persentase** atas Argon pada pengaturan low yang sama; di FrontierMath Tier 4, Epoch AI mencatat selisih **17 poin**. Tujuh minggu, empat rilis, satu batas pengetahuan: seri Gemini 4 nyaris menjadi eksperimen terbuka tentang pascapelatihan dan anggaran penalaran. Seri ini juga mengingatkan bahwa membandingkan dengan anggaran yang sama dan membandingkan dengan nama pengaturan yang sama menghasilkan dua peringkat berbeda. [Evaluasi peluncuran Neon oleh Artificial Analysis](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain) · [Hasil terverifikasi Carbon dari ARC Prize](https://arcprize.org/results/google-gemini-4-carbon) · [Data Carbon di Epoch](https://epoch.ai/models/gemini-4-carbon)

Google mengumumkan Argon pada 30 September dan Carbon pada 28 Oktober; Carbon tersedia untuk umum pada 10 November, lalu Hydrogen dirilis pada 12 November dan Neon pada 18 November. Artikel ini memakai hasil publik yang tersedia per 19 November dan merupakan analisis sekunder Folkbench. Skor di kartu model dan pengumuman dilaporkan oleh Google; dalam tabel tersebut, sebagian skor model pembanding dijalankan oleh Google dan sebagian lain ditandai sebagai hasil pihak ketiga. Hasil Artificial Analysis, Epoch AI, ARC Prize, dan Terminal-Bench menjadi milik masing-masing evaluator. Folkbench tidak menjalankan ulang model apa pun untuk artikel ini. Persentase mengikuti definisi tiap papan peringkat, dan setiap kesimpulan yang bergantung pada tingkat penalaran, lingkungan eksekusi, atau pihak yang menjalankan evaluasi hanya berlaku dalam kondisi tersebut. [Pengumuman Argon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/) · [Google: Carbon kini tersedia](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/) · [Pengumuman Neon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/)

## Satu fondasi, empat putaran pascapelatihan

| Model | Diumumkan | Posisi resmi | Asal menurut kartu model | Harga API (input / output per 1 juta token) | AA Index v5.0.1 terbaik |
| --- | --- | --- | --- | --- | ---: |
| Gemini 4 Argon | 30 Sep | Pemrograman, kerja pengetahuan perusahaan, pertahanan siber | Model MoE jarang yang dilatih baru | US$2 / 10 harga perkenalan, lalu US$4 / 20 | 50 (high) |
| Gemini 4 Carbon | 28 Okt, tersedia umum 10 Nov | Tugas jangka panjang dan keamanan siber | Berbasis Argon | US$2 / 10 hingga 30 Nov, lalu US$4 / 20 | 60 (high) |
| Gemini 4 Hydrogen | 12 Nov | Eksekusi harian yang cepat | Diadaptasi dari Carbon | US$1,50 / 7,50 | 54 (xhigh) |
| Gemini 4 Neon | 18 Nov | Keseimbangan kedalaman dan efisiensi | Diadaptasi dari Carbon | US$3 / 15 | 61 (xhigh) |

[Kartu model Argon](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Kartu model Carbon](https://deepmind.google/models/model-cards/gemini-4-carbon/) · [Kartu model Hydrogen](https://deepmind.google/models/model-cards/gemini-4-hydrogen/) · [Kartu model Neon](https://deepmind.google/models/model-cards/gemini-4-neon/)

Kartu model Argon memuat satu-satunya penjelasan arsitektur pada generasi ini: Transformer mixture-of-experts (MoE) jarang berskala besar, dengan input teks, visual, dan audio secara native, dilatih sebagai model baru dan bukan hasil fine-tuning model lama. Model ini dilatih di TPU dengan JAX dan ML Pathways, dan pascapelatihannya mencakup instruction tuning, data preferensi manusia, serta reinforcement learning dengan data penalaran bertahap, pemecahan masalah, dan pembuktian teorema. Kartu Carbon merujuk ke Argon untuk arsitektur, data, dan perangkat keras. Kartu Hydrogen dan Neon menyebut keduanya diadaptasi dari Carbon (adapted from) dan merujuk kembali ke Carbon. Keempatnya mendukung konteks hingga 1 juta token untuk input dan output digabung. [Kartu model Argon](https://deepmind.google/models/model-cards/gemini-4-argon/)

Struktur ini menentukan cara membaca kemajuan di dalam keluarga model. Karena batas pengetahuan tidak berubah, peningkatan dari Argon ke Carbon tidak mungkin berasal dari pengetahuan dunia yang baru; lebih masuk akal jika berasal dari perubahan data pascapelatihan, reinforcement learning, dan konfigurasi inferensi. Google tidak membuka jumlah parameter dan tidak menjelaskan apakah "adaptasi" berarti distilasi, pelatihan lanjutan, atau metode lain, sehingga ukuran dan jalur pelatihan Hydrogen serta Neon tidak bisa disimpulkan dari materi publik. Yang jelas, sebagian besar perbedaan kemampuan di dalam generasi ini muncul setelah prapelatihan.

## Kecerdasan: nama pengaturan yang sama bukan anggaran penalaran yang sama

Saat diumumkan pada 28 Oktober, Carbon memimpin indeks v5.0 dengan **59**. Tiga minggu kemudian, penilaian ulang v5.0.1 memberinya **60**, tetapi posisi teratas kini dipegang Claude Fable 5.2 dengan **65**, disusul GPT‑6.2 Astra dengan **62** dan Neon dengan **61**; Claude Opus 5.5 mendapat **59** dan GPT‑6.2 Sol **57**. ECI dari Epoch AI menempatkan Carbon di posisi serupa: **170**, peringkat ketiga dari 241 model yang dipantau, dibanding Argon **167**, Fable 5.2 **174**, dan GPT‑6 Astra **169**. Kedua indeks memakai metode berbeda, tetapi sama-sama menaruh Carbon di kelompok teratas, sedikit di bawah pemimpin saat ini. Per 19 November, Epoch belum menerbitkan data Neon, sedangkan Hydrogen sudah punya hasil per tolok ukur tetapi belum punya ECI. Peringkat gabungan bergeser dari minggu ke minggu, jadi satu "peringkat pertama" tidak terlalu berbobot. [Pengumuman Carbon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/) · [Evaluasi peluncuran GPT‑6.2 oleh Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [Kartu model Neon](https://deepmind.google/models/model-cards/gemini-4-neon/) · [Data Carbon di Epoch](https://epoch.ai/models/gemini-4-carbon)

Kurva per tingkat penalaran lebih informatif. Angka dalam kurung adalah token output untuk menjalankan seluruh indeks.

| AA Index v5.0.1 | Neon | Hydrogen | Carbon | Argon |
| --- | ---: | ---: | ---: | ---: |
| low | 44 (28,3 jt) | 27 (20,3 jt) | 54 (83,9 jt) | tidak dicantumkan |
| medium | 55 (62,9 jt) | 41 (54,4 jt) | 58 (124 jt) | 48 (81,7 jt) |
| high (bawaan) | 60 (123 jt) | 51 (110 jt) | 60 (205 jt) | 50 (113 jt) |
| xhigh | 61 (283 jt) | 54 (304 jt) | tidak tersedia | tidak tersedia |

[Neon per tingkat](https://artificialanalysis.ai/models/gemini-4-neon) · [Hydrogen per tingkat](https://artificialanalysis.ai/models/releases/gemini-4-hydrogen) · [Carbon per tingkat](https://artificialanalysis.ai/models/gemini-4-carbon) · [Argon per tingkat](https://artificialanalysis.ai/models/gemini-4-argon)

Pertama, imbal hasil cepat menurun. Menaikkan Neon dari high ke xhigh melipatgandakan token output **2,3 kali** demi **satu** poin tambahan, dan waktu per tugas naik dari 14,8 menjadi 21,5 menit; langkah yang sama membuat Hydrogen memakai **2,8 kali** token untuk **tiga** poin. Kedua, nama pengaturan bukan satuan anggaran. Pengaturan low pada Carbon memakai 83,9 juta token, lebih banyak daripada medium pada Neon. Dengan total anggaran yang mirip, urutannya Argon 50, Hydrogen 51, Carbon 58, Neon 60, dan ini lebih menjelaskan dampak pascapelatihan dibanding membandingkan semua model di pengaturan bawaan. Perbandingan ini punya batasan: token adalah total untuk seluruh indeks, bukan dicocokkan per tugas, dan kecepatan output berbeda. Neon di high menghasilkan sekitar 101 token per detik, sedangkan Carbon 55 hingga 58, sehingga jumlah token yang sama berarti waktu tunggu yang berbeda.

Ketiga, model yang lebih kecil lebih peka terhadap anggaran. Dari low ke high, Hydrogen menempuh **24 poin**, Neon **16**, dan Carbon hanya **6**. Untuk model cepat seperti Hydrogen, salah memilih tingkat bisa merugikan lebih besar daripada berganti model.

## Penalaran abstrak: di ARC‑AGI‑3, berpikir lebih lama tidak selalu lebih baik

| Hasil terverifikasi ARC Prize | Gemini 4 Argon | Gemini 4 Carbon |
| --- | ---: | ---: |
| ARC‑AGI‑2, low / medium / high | 42,1% / 87,1% / 91,3% | 49,6% / 94,2% / 92,1% |
| ARC‑AGI‑3 lingkungan standar, low / medium | 49,8% / 46,3% | 65,1% / 63,9% |
| ARC‑AGI‑3 lingkungan standar, high | tidak dinilai (19 dari 55 permainan selesai) | tidak dinilai (30 dari 55 permainan selesai) |
| ARC‑AGI‑3 Provider Adapter, low / medium / high | 97,5% / 97,3% / 97,3% | 97,7% / 99,1% / 96,9% |

[Hasil terverifikasi Argon dari ARC Prize](https://arcprize.org/results/google-gemini-4-argon) · [Hasil terverifikasi Carbon dari ARC Prize](https://arcprize.org/results/google-gemini-4-carbon)

Ada tiga hal yang menonjol. Pertama, skor tidak naik secara monoton seiring tingkat penalaran: di ARC‑AGI‑2, Carbon lebih baik di medium daripada high; di lingkungan standar ARC‑AGI‑3, lebih baik di low daripada medium, dan skor terbaik Argon di ARC‑AGI‑3 juga di low. Kedua, pengaturan tertinggi bisa gagal total di lingkungan interaktif. Di high, jeda antaraksi Carbon terlalu panjang sehingga sesi permainan kedaluwarsa dan hanya 30 permainan yang selesai; Argon di high hanya menyelesaikan 19 karena masalah API. Dalam tanya jawab statis, berpikir lebih lama hanya menambah biaya; di lingkungan interaktif, itu juga menghabiskan waktu lingkungan. Ketiga, selisih antar-lingkungan eksekusi jauh lebih besar daripada selisih antargenerasi. Carbon mencapai **99,1%** dengan Provider Adapter dan paling tinggi **65,1%** di lingkungan standar, selisih sekitar **34 poin**. Menurut ARC Prize, lingkungan standar hanya membiarkan model membawa catatan yang ia pilih untuk disimpan, sedangkan Provider Adapter menyimpan status penalaran yang tidak transparan di antara permintaan dan memadatkan percakapan panjang.

Jika dilihat per permainan, kehilangan skor terpusat di beberapa permainan saja. Di lingkungan standar, G50T bernilai **0,0%** bagi Argon maupun Carbon di low dan medium, BP35 tidak lebih dari **1,0%**, dan TU93 tidak lebih dari **5,3%**; dengan Provider Adapter, ketiga permainan itu umumnya 100%. Skor total naik 15 poin, tetapi permainan-permainan ini nyaris tidak bergerak. Satu tafsiran yang masuk akal tetapi belum terverifikasi: permainan tersebut tersendat pada penyimpanan status antarlangkah, bukan pada penalaran satu langkah, dan kenaikan antargenerasi terutama terjadi di lingkungan yang sebelumnya sudah bisa diselesaikan sebagian. Sebagai pembanding, GPT‑6.2 Astra meraih **70,3%** di lingkungan standar pada max dan GPT‑6.2 Sol **54,9%**; Carbon berada di antaranya. [Hasil terverifikasi GPT‑6.2 dari ARC Prize](https://arcprize.org/results/openai-gpt-6-2)

## Kemampuan akademik: kalibrasi pengetahuan, matematika, dan eksekusi ilmiah

| Hasil Epoch AI | Gemini 4 Argon | Gemini 4 Carbon | Gemini 4 Hydrogen | GPT‑6 Astra | Claude Fable 5.2 |
| --- | ---: | ---: | ---: | ---: | ---: |
| GPQA Diamond | 96% | 97% | 97% | 96% | 96% |
| SimpleQA Verified | 76% | 78% | 71% | 76% | 94% |
| FrontierMath Tiers 1–3 (v2) | 86% | 91% | 88% | 94% | 95% |
| FrontierMath Tier 4 (v2) | 78% | 95% | 88% | 98% | 100% |
| FrontierMath Erdős | 1% | 3% | belum diuji | 3% | belum diuji |
| Chess Puzzles | 59% | 78% | 60% | 76% | 79% |
| EBR‑bench (Earthborne Rangers) | 65% | 88% | 70% | 76% | 90% |

[Data Carbon di Epoch](https://epoch.ai/models/gemini-4-carbon) · [Data Hydrogen di Epoch](https://epoch.ai/models/gemini-4-hydrogen)

**Pengetahuan dan kalibrasi.** GPQA Diamond tidak lagi membedakan model terdepan: kelima model di tabel berada di antara 96% dan 97%. Yang lebih membedakan adalah daya ingat faktual dan apa yang dilakukan model ketika tidak tahu. Di SimpleQA Verified milik Epoch, Carbon meraih **78%**, **16 poin** di bawah Fable 5.2. Sebaliknya, di AA‑Omniscience v1.1 milik Artificial Analysis, Carbon (medium) dan Argon (high) sama-sama memiliki tingkat halusinasi **4%**, dan Carbon terendah di papan peringkat. Penyebut metrik ini adalah semua jawaban yang tidak sepenuhnya benar, dan pembilangnya adalah jawaban yang jelas salah; sebagai pembanding, GPT‑6.2 Astra dan Sol pada max berada di **59%** dan **55%**. Kedua hasil berasal dari kumpulan soal berbeda sehingga tidak bisa digabungkan, tetapi arahnya sama: Gemini 4 belum tentu mengingat paling banyak, tetapi ketika tidak tahu, ia cenderung tidak menjawab atau hanya memberi jawaban parsial alih-alih mengarang. Setidaknya untuk soal pengetahuan semacam ini, jawaban tegasnya lebih jarang salah; untuk tinjauan pustaka, cakupan tetap harus dilengkapi dengan pencarian. [Definisi dan papan peringkat AA‑Omniscience](https://artificialanalysis.ai/evaluations/omniscience)

HLE‑Diamond adalah salah satu dari empat evaluasi indeks v5.0 tempat Carbon menempati peringkat pertama. Google melaporkan Neon **71,3%**, Opus 5.5 **67,9%**, GPT‑6.2 Sol **64,0%**, dan Hydrogen **58,8%**; semua angka ini berasal dari kartu model Google. [Ringkasan DeepLearning.AI tentang hasil v5.0](https://www.deeplearning.ai/the-batch/gemini-leads-the-pack-again) · [Kartu model Neon](https://deepmind.google/models/model-cards/gemini-4-neon/)

**Matematika.** Dari Argon ke Carbon, FrontierMath Tier 4 naik **17 poin**, lompatan antargenerasi terbesar dalam data ini, sehingga Carbon mendekati GPT‑6 Astra dan Fable 5.2. Namun FrontierMath Erdős hanya naik dari **1%** ke **3%**. Ke-68 soalnya masih terbuka ketika tolok ukur ini dibuat, dan bukti atau sanggahan yang dikirim diperiksa dengan Lean; hasil terbaik saat ini adalah **10%** milik GPT‑6.2 Astra. Soal tingkat riset yang jawabannya sudah diketahui mulai jenuh, sementara soal terbuka nyaris belum tersentuh. RiemannBench yang dilaporkan sendiri oleh Google naik dari Argon **76,0%** dan Carbon **80,0%** ke Neon **84,0%**, searah tetapi diukur oleh vendor sendiri. Evaluasi teka-teki Epoch menunjukkan kenaikan pascapelatihan yang serupa: soal catur naik dari 59% ke 78% dan EBR‑bench dari 65% ke 88%. Keduanya menuntut pencarian bertahap di bawah aturan, sejalan dengan kenaikan di lingkungan standar ARC‑AGI‑3. Hydrogen yang cepat meraih **88%** di Tier 4, **10 poin** di atas Argon, tetapi skor teka-tekinya mirip Argon dan daya ingatnya di SimpleQA Verified hanya **71%**. Salah satu penjelasan yang mungkin: kemampuan dengan jawaban yang bisa diperiksa otomatis, seperti matematika, lebih terjaga saat model diadaptasi menjadi model cepat, sedangkan pengetahuan hafalan lebih bergantung pada kapasitas model; materi publik belum cukup untuk memastikannya. [Metodologi FrontierMath Erdős](https://epoch.ai/benchmarks/frontiermath-erdos)

**Eksekusi ilmiah.** Terminal‑Bench‑Science 0.1 meminta model menyerahkan hasil riset di terminal yang dapat diperiksa dengan pengujian. Di kartu model Carbon, dengan pengujian oleh Artificial Analysis, Carbon meraih **64,8%**, Argon **52,9%**, GPT‑6 Astra **63,3%**, dan Opus 5.5 **59,0%**. Kartu model Neon melaporkan Neon **70,5%**, di atas GPT‑6.2 Sol (**68,0%**) dan Opus 5.5 (**63,3%**). Google menyebut Neon terbaik di kelasnya, dan itu benar dalam kelompok pembanding yang dipilihnya; di papan peringkat lengkap Artificial Analysis, GPT‑6.2 Astra pada xhigh meraih **78,6%**, masih **8,1 poin** lebih tinggi. Hydrogen meraih **51,4%**, di bawah pembandingnya, Claude Sonnet 5.5 (**59,9%**). [Papan peringkat Terminal‑Bench‑Science](https://artificialanalysis.ai/evaluations/terminal-bench-science) · [Kartu model Carbon](https://deepmind.google/models/model-cards/gemini-4-carbon/)

## Rekayasa dan agen: lingkungan eksekusi menentukan separuh jawaban

Di papan peringkat resmi Terminal‑Bench 4.1, Carbon (high, Antigravity CLI) meraih **64,5% ± 3,2%** dengan biaya sekitar **US$1.400** per putaran penuh; Claude Opus 5.5 dan Fable 5.2 seri di **65,8%**, dan GPT‑6.2 Astra **62,1%**. Selisih Carbon dengan posisi teratas masih dalam selang kepercayaan. Perbandingan internal lebih menarik: Hydrogen meraih **56,4% ± 3,0%** dengan sekitar **US$800**, dan Argon **55,5% ± 2,8%** dengan sekitar **US$1.100**, sehingga model cepat ini menyamai model unggulan enam minggu sebelumnya dengan sekitar tiga perempat biaya. Angka **65,2%** milik Neon berasal dari kartu model Google dan per 19 November belum muncul di papan peringkat resmi. [Papan peringkat Terminal‑Bench 4.1](https://www.tbench.ai/?version=4)

Saat membandingkan antarkartu model, periksa dulu siapa yang menjalankan evaluasi. Baris Terminal‑bench 4.0 di kartu Argon memberi Argon **57,4%** dan Opus 5.5 **66,4%**; dua minggu kemudian, kartu Carbon beralih ke Terminal‑Bench 4.0 yang dijalankan Artificial Analysis dan memberi Argon **57,1%** serta Opus 5.5 **59,6%**. Model pembanding yang sama berselisih **6,8 poin** pada tolok ukur dengan nama yang sama, sementara skor Argon sendiri nyaris tidak berubah. Jika memakai angka Opus 66,4% dari kartu Argon, skor Carbon 65,2% tidak memimpin, dan di papan peringkat resmi 4.1 Carbon juga sedikit di bawah Opus. Terminal‑Bench‑Science menunjukkan pola yang sama: GPT‑6 Astra mendapat **68,1%** di kartu Argon dan **63,3%** menurut angka AA di kartu Carbon. [Kartu model Argon](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Kartu model Carbon](https://deepmind.google/models/model-cards/gemini-4-carbon/)

| SWE‑sweep (kartu model Neon) | Lingkungan netral mini‑SWE | Lingkungan milik tiap vendor |
| --- | ---: | ---: |
| Gemini 4 Neon | 12,8% | 39,0% |
| Claude Opus 5.5 | 3,6% | 10,1% |
| GPT‑6.2 Sol | 11,6% | 8,3% |

Di lingkungan netral mini‑SWE, Neon hanya unggul **1,2 poin** atas GPT‑6.2 Sol; di lingkungan milik tiap vendor, selisihnya melebar menjadi **30,7 poin**. Di Antigravity, skor Neon sekitar tiga kali skornya di mini‑SWE, Opus 5.5 naik sekitar 2,8 kali di lingkungannya sendiri, dan Sol justru turun. Lingkungan vendor adalah bagian dari produk, sehingga angka ini mengukur model beserta rangkaian alatnya, bukan model saja. Baris SWE‑sweep di kartu Carbon hanya punya satu kolom tanpa keterangan lingkungan (Carbon **9,6%**, Argon **4,3%**). Angka 3,6% untuk Opus 5.5 di sana sama dengan nilai mini‑SWE di kartu Neon, yang mengisyaratkan konfigurasi yang sama; jika benar, seri ini bergerak 4,3%, 9,6%, lalu 12,8% di mini‑SWE. [Kartu model Neon](https://deepmind.google/models/model-cards/gemini-4-neon/)

Evaluasi pemrograman lain memberi gambaran yang lebih moderat. Di FrontierSWE 2, Carbon meraih **61,2%**, di bawah GPT‑6 Astra (**65,5%**) dan Opus 5.5 (**62,3%**); di FrontierCode 2.0, Neon meraih **46,2%**, sedikit di bawah Opus 5.5 (**47,3%**). Di Coding Agent Index milik Artificial Analysis, Neon (xhigh, Antigravity CLI) memimpin dengan **59**, sementara Fable 5.2 (xhigh) dan Opus 5.5 (max) sama-sama **58**, dengan biaya rata-rata per tugas **US$6,86**, **US$15,47**, dan **US$12,61**; keunggulan Neon terutama ada pada biaya. Pengoperasian komputer adalah kelemahan yang konsisten di seluruh seri: di subset luring OSWorld‑2.1, Carbon dengan **81,5%** tertinggal dari Opus 5.5 (**87,2%**), dan Hydrogen dengan **77,6%** tertinggal dari Claude Sonnet 5.5 (**83,9%**). [Evaluasi peluncuran Neon oleh Artificial Analysis](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain) · [Kartu model Hydrogen](https://deepmind.google/models/model-cards/gemini-4-hydrogen/)

Untuk kerja pengetahuan, AutomationBench dari Zapier naik dari Argon **51,3%** dan Carbon **53,9%** ke Neon **56,3%**, dan saldo bisnis simulasi di Vending‑Bench 2 bertambah dari **US$13.718** menjadi **US$16.843**. Argon meraih **19,6%** di tolok ukur agen hukum Harvey, sementara tidak ada model pembanding yang melebihi **6,7%**; keunggulannya besar, tetapi tingkat absolutnya menunjukkan tugas hukum seperti ini masih jauh dari siap diserahkan. Perhatikan juga namanya: AutomationBench‑AA di kartu Hydrogen (**76,1%**) adalah versi Artificial Analysis dan tidak bisa dibandingkan langsung dengan versi Zapier.

## Konteks panjang dan multimodal: unggul di tugas sintetis, materi nyata perlu diuji sendiri

GraphWalks (256K hingga 1 juta token, penelusuran melebar, F1), menurut laporan Google, adalah bidang dengan keunggulan terbesar seri ini: Argon **84,2%**, Carbon **96,2%**, dan Neon **95,2%**, dibanding Opus 5.5 **66,8%**, GPT‑6 Astra **71,8%**, dan GPT‑6.2 Sol **80,1%**; hingga 128K, Argon sudah mencapai **99,7%**. GraphWalks menyebar sisi-sisi graf di sepanjang input yang panjang lalu meminta model menelusurinya, sehingga mengukur kemampuan menemukan dan merangkai informasi yang berjauhan. Keunggulan ini menunjukkan kemampuan pencarian dan penautan yang sangat kuat pada input yang sangat panjang, tetapi tugas graf sintetis tidak mengandung konflik makna, versi dokumen, atau premis tersirat; untuk meninjau kontrak atau merangkum banyak makalah, ujilah dengan materi sendiri. Hasil ini diukur sendiri oleh Google dan belum direproduksi pihak independen. Secara bawaan, Neon dan Hydrogen menghasilkan hingga 64K token secara sinkron, dan hingga 1 juta melalui dekode panjang di latar belakang. [Kartu model Argon](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Kartu model Neon](https://deepmind.google/models/model-cards/gemini-4-neon/)

Pada multimodal ada satu kemunduran. Di LVBench untuk pemahaman video panjang, Argon meraih **91,7%** dan Neon, yang diadaptasi dari Carbon, **89,0%**: masih di atas Opus 5.5 (**83,7%**) dan GPT‑6.2 Sol (**87,6%**), tetapi **2,7 poin** di bawah pendahulunya sendiri. Di Chartography, Neon dengan **73,5%** tertinggal dari Sol (**75,1%**). Evaluasi penalaran visual GDP.pdf milik Artificial Analysis kembali tidak monoton terhadap tingkat penalaran: Neon meraih **33,4%** di high tetapi turun ke **28,0%** di xhigh, sedangkan Carbon di high meraih **28,4%**. [Evaluasi peluncuran Neon oleh Artificial Analysis](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain)

## Keamanan dan penyelarasan: makin kuat kemampuan siber, makin bertahap rilisnya

Keamanan siber adalah kemampuan yang paling ditonjolkan Google sekaligus alasan rilis bertahapnya. Di SEC‑bench Pro untuk menemukan kerentanan, skor naik dari Argon **83,4%** dan Carbon **88,2%** ke Neon **90,5%**; di ExploitGym untuk eksploitasi, Carbon meraih **54,8%** dibanding Argon **42,0%**. Argon dan Carbon sama-sama lebih dulu diberikan kepada pembela siber tepercaya melalui program Fairwind, dan Google juga menyediakan versi tanpa pembatas keamanan siber bagi para pembela tersebut dan tim internalnya. [Pengumuman Argon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/) · [Pengumuman Carbon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/)

Kartu model Argon memuat penetapan berdasarkan Frontier Safety Framework versi April 2026: Critical Capability Level (CCL) level 1 untuk biologi dan keamanan siber tidak dapat dikesampingkan, sehingga Google menyusun argumen keselamatan dan menilai model berada di bawah CCL dengan pengamanan; ranah kimia, radiologi, dan nuklir tidak mencapai ambang pemantauan, dan baik percepatan maupun otomatisasi riset dan pengembangan machine learning tidak mencapai CCL. Setelah pengujian terarah, Hydrogen tidak mencapai CCL untuk CBRN maupun siber, tetapi mencapai ambang peringatan di keduanya. Kartu model Neon menyebut peningkatan kemampuan umumnya dibanding Argon berada di bawah ambang "perubahan kemampuan material", sehingga evaluasi kemampuan kritis secara lengkap tidak diulang dan penetapan Argon tetap berlaku. Patut dicatat, Neon unggul **11 poin** atas Argon di indeks Artificial Analysis; cara Google menetapkan ambang itu tidak dapat diperiksa dari materi publik. [Kartu model Argon](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Kartu model Hydrogen](https://deepmind.google/models/model-cards/gemini-4-hydrogen/) · [Kartu model Neon](https://deepmind.google/models/model-cards/gemini-4-neon/)

Dari sisi perilaku, Carbon dan Neon mencatat tingkat kecurangan berhasil **0,0%** di Terminal‑Bench 4.0 dan tingkat keberhasilan serangan **0,0%** pada uji injeksi prompt tidak langsung dari Gray Swan (Neon pada tingkat penalaran tertingginya), dibanding Argon **0,7%**. Pada evaluasi kejujuran agen milik Google, Carbon lolos **92%** tugas dan Argon **70%**; Neon dan Hydrogen melaporkan **99,2%** dan **94%**, tetapi pengumumannya tidak menyebut apakah kumpulan tugasnya sama. Kartu model Hydrogen juga mengungkap harga yang dibayar: dibanding Gemini 3.8 Flash, penolakan tanpa alasan yang sah naik **5,57 poin**, terutama pada prompt multimodal. [Google: Carbon kini tersedia](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/) · [Pengumuman Neon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/) · [Pengumuman Hydrogen](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/)

## Biaya dan pemilihan: hitung harga per tugas yang lolos penerimaan

Hydrogen berharga **US$1,50** per juta token input dan **US$7,50** per juta token output, dengan tarif sama di seluruh jendela 1 juta token; Neon **US$3 / 15**, dengan input cache **US$0,15**; harga perkenalan Carbon **US$2 / 10** berlaku hingga 30 November, lalu menjadi **US$4 / 20**. Input cache untuk Argon, Carbon, dan Neon dihargai 5% dari harga input. Berdasarkan biaya per tugas dari Artificial Analysis, Hydrogen di xhigh meraih 54 dengan **US$3,16**, Argon di high 50 dengan **US$4,97** (harga perkenalan), Neon di xhigh 61 dengan **US$6,44**, dan Carbon di high 60 dengan **US$7,76** (harga standar). Neon di high menyamai 60 poin Carbon di high dengan biaya per tugas kurang dari separuhnya. [Pengumuman Hydrogen](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/) · [Evaluasi peluncuran Neon oleh Artificial Analysis](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain)

Contoh yang bisa dihitung ulang: satu permintaan dengan 100.000 token input tanpa cache dan 10.000 token output, tanpa biaya alat, menelan **US$0,225** di Hydrogen, **US$0,45** di Neon, dan **US$0,30** di Carbon selama masa perkenalan atau **US$0,60** dengan harga standar. Sekarang bayangkan perutean yang lebih dulu memakai Hydrogen lalu meneruskan kegagalan ke Neon. Dengan rasio biaya per panggilan tetap 1:2, biaya model murni tetap lebih rendah daripada langsung memakai Neon selama kurang dari **50%** tugas dinaikkan; dengan biaya per tugas xhigh dari Artificial Analysis (US$3,16 berbanding 6,44), titik impasnya sekitar **51%**. Perbandingan nyata juga harus memasukkan percobaan ulang, latensi, dan tingkat kelulusan akhir. Contoh ini hanya menggambarkan struktur biaya; angkanya bukan hasil pengukuran Folkbench.

Untuk tugas batch dengan penerimaan otomatis, Hydrogen layak diuji lebih dulu: ia menyamai atau melampaui Argon baik di indeks AA maupun Terminal‑Bench dengan harga lebih rendah. Untuk pemrograman dan kerja pengetahuan sehari-hari, Neon menyamai atau sedikit melampaui Carbon di sebagian besar evaluasi yang sama-sama tercantum di kedua kartu model (sedikit lebih rendah di Agents' Last Exam dan GraphWalks), dan setelah 30 November harga satuannya juga lebih murah daripada Carbon. Carbon tetap menjadi model dengan bukti terkuat untuk rekayasa jangka panjang, keamanan siber, dan tugas interaktif seperti ARC‑AGI‑3. Apa pun pilihannya, ukur tingkat penalaran dengan tugas Anda sendiri: di ARC‑AGI dan GDP.pdf, tingkat tertinggi tidak selalu yang terbaik.

Nilai Gemini 4 saat peluncuran bukan terletak pada satu peringkat pertama. Dalam tujuh minggu dan dengan satu batas pengetahuan, seri ini menunjukkan seberapa jauh pascapelatihan dan konfigurasi inferensi dapat mendorong kemampuan: 11 poin di indeks AA, 15 poin di lingkungan standar ARC‑AGI‑3, dan 17 poin di FrontierMath Tier 4. Seri ini juga menandai bagian yang belum tergerak oleh pendekatan ini: soal matematika terbuka masih di bawah 10%, pengoperasian komputer tertinggal dari Claude, dan beberapa permainan ARC‑AGI‑3 di lingkungan standar masih bernilai nol. Kartu model vendor memilih pembanding dan pelaksana uji, sementara papan peringkat independen menilai ulang dan berganti versi. Apakah skor-skor ini membuahkan hasil pada akhirnya bergantung pada cara tugas Anda sendiri diterima.
