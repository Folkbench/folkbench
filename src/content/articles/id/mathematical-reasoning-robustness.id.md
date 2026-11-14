---
slug: mathematical-reasoning-robustness
translationKey: mathematical-reasoning-robustness
locale: "id"
kind: article
title: "Apakah penalaran bertahan ketika angka berubah? Mengukur ketahanan matematika"
description: "Membaca GSM-Symbolic secara cermat melalui variasi terkendali, statistik berpasangan, kondisi kalkulator, dan batas kesimpulan kemampuan."
category: "Metode evaluasi"
tags: [matematika, penalaran, benchmark]
authorId: iris-wu
modelIds: []
benchmarkSlugs: []
relatedSlugs: [llm-benchmark-rankings-contamination, long-context-effective-understanding]
publishedAt: '2026-11-14'
updatedAt: '2026-11-14'
sources:
  - id: gsm-symbolic
    label: Mirzadeh dkk., GSM-Symbolic，revisi 2025
    url: https://arxiv.org/abs/2410.05229v2
    checkedAt: '2026-11-14'
    claimScope: official
  - id: irrelevant-context
    label: Shi dkk., Large Language Models Can Be Easily Distracted by Irrelevant Context，2023
    url: https://proceedings.mlr.press/v202/shi23a.html
    checkedAt: '2026-11-14'
    claimScope: official
  - id: causal-robustness
    label: Stolfo dkk., A Causal Framework to Quantify the Robustness of Mathematical Reasoning with Language Models，2023
    url: https://aclanthology.org/2023.acl-long.32/
    checkedAt: '2026-11-14'
    claimScope: official
  - id: frontiermath
    label: Glazer dkk., FrontierMath，revisi 2025
    url: https://arxiv.org/abs/2411.04872v7
    checkedAt: '2026-11-14'
    claimScope: official
  - id: error-bars
    label: Miller, Adding Error Bars to Evals，2024
    url: https://arxiv.org/abs/2411.00640v1
    checkedAt: '2026-11-14'
    claimScope: official
  - id: construct-validity
    label: Bean dkk., Measuring what Matters，2025
    url: https://arxiv.org/abs/2511.04703v1
    checkedAt: '2026-11-14'
    claimScope: official
---

Jawaban benar menunjukkan bahwa satu keluaran sesuai dengan hasil yang diharapkan. Jika nama, angka, atau kalimat yang tidak relevan membuat kinerja tidak stabil, kita perlu menemukan letak kesalahannya. Evaluasi matematika memerlukan kondisi terkendali dan diagnosis, bukan hanya soal lebih sulit.

Sumber diperiksa pada 2026-11-14. Artikel ini menjelaskan metode dan rancangan eksperimen. Folkbench tidak menjalankan model; soal serta angka berikut bersifat ilustratif, bukan skor pengukuran.

## Kemampuan matematika terdiri dari beberapa tahap

Soal cerita menuntut pengenalan jumlah dan satuan, pemahaman hubungan, penyusunan ekspresi, perhitungan, serta format jawaban. Kesalahan di tahap mana pun bisa mendapat nilai nol yang sama. Akurasi akhir mengukur hasil, tetapi tidak menjelaskan mekanisme kegagalan secara mandiri.

Ekspresi benar dengan perkalian salah berbeda dari hubungan keliru yang kebetulan menghasilkan angka benar. Periksa ekspresi dan jawaban yang terlihat, tanpa menganggap penjelasan lancar sebagai rekaman lengkap komputasi internal. Jika ada alat, periksa panggilan dan penggunaan hasilnya.

## Apa yang dikendalikan GSM-Symbolic

[GSM-Symbolic](https://arxiv.org/abs/2410.05229v2) membangun templat simbolik dari GSM8K dan menghasilkan beberapa contoh. Rancangannya memakai 100 templat dengan 50 contoh masing-masing, total 5.000 contoh. Nama, angka, kerumitan kondisi, dan informasi tidak relevan memperlihatkan sisi stabilitas berbeda.

Yang berguna adalah mempertahankan hubungan sambil mengubah kondisi permukaan, bukan menerapkan tabel historis pada semua model berikutnya. Studi mencakup model dan protokol tertentu, bukan semua sistem pada 2026. Pisahkan interpretasi mekanisme oleh penulis dari pengamatan perilaku.

Penelitian tentang [konteks tidak relevan](https://proceedings.mlr.press/v202/shi23a.html) dan [kerangka kausal ketahanan matematika](https://aclanthology.org/2023.acl-long.32/) memberi pendekatan terkait. Keduanya mendukung diagnosis terkendali; mudah teralihkan tidak membuktikan ketiadaan penalaran di semua tugas.

## Membuat variasi yang sah

Ini contoh pengajaran orisinal, bukan soal benchmark dan belum diuji pada model. Toko memiliki 6 kotak, masing-masing berisi 8 pensil, lalu membagikan 9 pensil. Sisanya `6 × 8 − 9 = 39`.

| Variasi | Perubahan | Pemeriksaan |
| --- | --- | --- |
| Nama | Toko menjadi sekolah, hubungan tetap | Jawaban tetap 39 |
| Angka | 7 kotak, 6 pensil per kotak, 8 dibagikan | Hitung ulang: 34 |
| Kalimat | Urutkan ulang dengan rujukan jelas | Jawaban tetap 39 |
| Informasi tidak relevan | Tambahkan bahwa kotaknya biru | Jawaban tetap 39 |

Mengubah angka mewajibkan perhitungan ulang acuan. Hindari jumlah negatif sembarang, pembagian yang mendadak tidak habis, atau angka sangat besar untuk operasi semula sederhana. Perubahan itu dapat mengubah makna dan kesulitan.

Ketidakrelevanan terutama membutuhkan pemeriksaan manusia. Menambahkan bahwa dua kotak sudah dipesan bisa mengubah penafsiran menjadi persediaan tersedia; jawaban tidak lagi jelas tetap. Pastikan informasi tambahan tidak ikut menentukan solusi. Singkirkan variasi tidak sah sebelum melihat skor, bukan memilih belakangan soal yang merugikan satu model.

## Rancang eksperimen berstrata

Pilih beberapa hubungan dan tingkat kesulitan, dengan jumlah variasi sama per soal. Ubah satu faktor utama setiap kali. Gunakan soal pengembangan untuk menyesuaikan instruksi dan parser; bekukan tes formal lalu hentikan pemilihan prompt berdasarkan skornya.

Tetapkan versi, bahasa, instruksi, alat, sampling, anggaran keluaran, dan percobaan. Acak urutan dan gunakan konteks independen tiap soal agar variasi tidak membocorkan jawaban. Pembelajaran antarputaran memerlukan protokol terpisah.

Ukuran sampel mengikuti efek yang ingin dideteksi dan anggaran. Banyak contoh satu templat mengukur stabilitas templat itu, bukan keluasan kemampuan. Keterwakilan hubungan dan kesulitan lebih penting daripada banyak soal hampir sama.

## Laporkan akurasi dan stabilitas

Tampilkan akurasi menurut variasi dan selisih berpasangan dari soal asli. Proporsi pasangan dengan kedua jawaban benar juga menunjukkan kesinambungan keberhasilan. Jangan memilih hanya soal asli yang benar lalu menganggapnya perbandingan keseluruhan. Jika memakai subset bersyarat, sebutkan penyebut dan aturan pemilihan.

Jika akurasi asli 80% dan variasi 68%, penurunan adalah **12 poin persentase**, atau **15% secara relatif**. Ini contoh hipotetis satuan, bukan hasil GSM-Symbolic atau Folkbench. Perbedaan ini harus tetap ada dalam seluruh terjemahan.

Variasi satu templat saling berkaitan. [Adding Error Bars to Evals](https://arxiv.org/abs/2411.00640v1) membahas ketergantungan dan perbandingan berpasangan. Salah satu pilihan adalah mengambil sampel ulang per kelompok templat, dengan kelompok sama bagi kedua model pada setiap pengambilan. Publikasikan metode, interval 95%, dan jumlah generasi berulang.

## Kalkulator membantu diagnosis, tetapi mengubah sistem

Pisahkan kondisi tanpa alat hitung dari kondisi dengan antarmuka kalkulator dan batas panggilan yang sama. Kondisi kedua mengukur model beserta alat dan membutuhkan hasil tersendiri.

Jika alat meningkatkan kinerja, periksa apakah kesalahan sebelumnya terkumpul pada aritmetika. Perbaikan tidak membuktikan semua penalaran lain benar: instruksi, jalur penyelesaian, dan waktu juga bisa berubah. Ekspresi, permintaan alat, serta pemanfaatan hasil membantu diagnosis yang spesifik.

Untuk pembuktian, jawaban numerik sangat tidak memadai. Kelengkapan kasus dan asumsi yang belum dibuktikan memerlukan protokol lain. Pemeriksa formal dapat memvalidasi derivasi, tetapi kesetiaan formalisasi terhadap soal asli tetap harus diperiksa.

## Kesulitan dan ketahanan adalah sumbu berbeda

[FrontierMath](https://arxiv.org/abs/2411.04872v7) menggunakan soal sulit buatan ahli dengan jawaban yang dapat diverifikasi otomatis. Ia menyelidiki kemampuan tingkat tinggi; GSM-Symbolic memeriksa stabilitas terhadap perubahan terkendali. Keduanya tidak saling menggantikan.

Model dapat menyelesaikan soal rumit tetapi gagal setelah perubahan kalimat sederhana. Model lain dapat stabil tanpa menguasai matematika yang lebih kompleks. Laporkan tingkat kesulitan, variasi, dan alat secara terpisah, bukan sebagai IQ matematika.

Standar yang diusulkan adalah jawaban benar, perubahan terkendali, kesalahan yang dapat ditafsirkan, unit statistik tepat, dan anggaran jelas. Dengan itu, solusi mengesankan menjadi perbandingan yang dapat diperiksa. Lihat [keandalan peringkat model](/id/blog/llm-benchmark-rankings-contamination/) untuk persyaratan umum.
