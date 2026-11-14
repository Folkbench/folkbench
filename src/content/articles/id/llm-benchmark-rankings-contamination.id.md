---
slug: llm-benchmark-rankings-contamination
translationKey: llm-benchmark-rankings-contamination
locale: "id"
kind: article
title: "Bisakah peringkat model dipercaya? Kontaminasi dan benchmark yang dapat diperiksa"
description: "Menelaah kontaminasi data, anggaran, penilaian, dan ketidakpastian menggunakan LiveBench, LiveCodeBench, HELM, serta statistik evaluasi."
category: "Metode evaluasi"
tags: [benchmark, penalaran, keandalan]
authorId: iris-wu
modelIds: []
benchmarkSlugs: []
relatedSlugs: [mathematical-reasoning-robustness, long-context-effective-understanding]
publishedAt: '2026-11-14'
updatedAt: '2026-11-14'
sources:
  - id: construct-validity
    label: Bean dkk., Measuring what Matters，2025
    url: https://arxiv.org/abs/2511.04703v1
    checkedAt: '2026-11-14'
    claimScope: official
  - id: betterbench
    label: Reuel dkk., BetterBench，2024
    url: https://arxiv.org/abs/2411.12990v1
    checkedAt: '2026-11-14'
    claimScope: official
  - id: livebench
    label: White dkk., LiveBench，revisi 2025
    url: https://arxiv.org/abs/2406.19314v2
    checkedAt: '2026-11-14'
    claimScope: official
  - id: livecodebench
    label: Jain dkk., LiveCodeBench，2024
    url: https://arxiv.org/abs/2403.07974v2
    checkedAt: '2026-11-14'
    claimScope: official
  - id: helm
    label: Liang dkk., Holistic Evaluation of Language Models
    url: https://arxiv.org/abs/2211.09110v2
    checkedAt: '2026-11-14'
    claimScope: official
  - id: error-bars
    label: Miller, Adding Error Bars to Evals，2024
    url: https://arxiv.org/abs/2411.00640v1
    checkedAt: '2026-11-14'
    claimScope: official
  - id: judge
    label: Zheng dkk., Judging LLM-as-a-Judge，2023
    url: https://arxiv.org/abs/2306.05685v4
    checkedAt: '2026-11-14'
    claimScope: official
---

Peringkat dapat mencatat satu ujian secara akurat tanpa menjawab model mana yang cocok untuk pekerjaan Anda. Skor bergantung pada soal, versi model, instruksi, alat, anggaran inferensi, dan penilai. Tanpa kondisi tersebut, beberapa angka desimal dapat memberi kesan kepastian yang berlebihan.

Artikel ini mengulas literatur dan mengusulkan metode berdasarkan sumber yang diperiksa pada 2026-11-14. Folkbench tidak memanggil model atau menjalankan ulang benchmark. Contoh angka menjelaskan metode, bukan hasil pengukuran. Tujuannya adalah rantai bukti yang dapat diperiksa: apa yang diukur, bagaimana soal disusun, bagaimana jawaban dinilai, dan kesimpulan apa yang didukung.

## Tentukan kemampuan sebelum memilih soal

Kecerdasan terlalu luas untuk dijelaskan oleh satu soal atau rata-rata. Pengetahuan khusus, penemuan aturan baru, kode yang dapat dijalankan, dan perencanaan panjang memerlukan tugas berbeda. Format jawaban wajib juga menguji kepatuhan instruksi; soal bergambar menambahkan persepsi.

[Measuring what Matters](https://arxiv.org/abs/2511.04703v1) meninjau 445 benchmark melalui validitas konstruk: apakah skor mendukung penafsiran kemampuan yang dimaksud? [BetterBench](https://arxiv.org/abs/2411.12990v1) menyediakan kerangka pemeriksaan mutu. Reputasi konferensi atau lembaga membantu memilih bacaan, tetapi tidak menggantikan pemeriksaan tugas dan penilai.

Pertanyaan yang operasional adalah apakah model mampu menyelesaikan masalah bertahap dari materi yang diberikan tanpa pencarian eksternal. Ini lebih mudah diuji dan membedakan kekurangan pengetahuan, bukti terlewat, serta kesalahan penalaran daripada sekadar menanyakan kecerdasan.

## Kontaminasi bukan hanya menghafal soal asli

Kontaminasi langsung terjadi ketika soal dan jawaban pengujian masuk ke data pelatihan. Latihan serupa, panduan solusi, dan catatan evaluasi publik juga dapat membantu. Penyesuaian metode berulang terhadap peringkat publik dapat menyebabkan penyesuaian berlebihan pada ujian tersebut, meski soal tidak dilatih secara langsung.

Karena itu, skor tinggi pada soal lama tidak membuktikan hafalan, dan penurunan pada soal baru tidak membuktikan kontaminasi. Kesulitan, format, dan bidang dapat berbeda. Kendalikan faktor itu serta jelaskan data pelatihan yang tidak terlihat. Jika korpus lengkap model tertutup tidak tersedia, statusnya tidak diketahui, bukan terbukti bebas kontaminasi.

[Revisi LiveBench](https://arxiv.org/abs/2406.19314v2) memakai tugas yang diperbarui dan jawaban yang bisa diperiksa; judulnya menggunakan Contamination-Limited. [LiveCodeBench](https://arxiv.org/abs/2403.07974v2) mengumpulkan soal kompetisi pemrograman baru beserta tanggalnya. Keduanya mengurangi risiko tertentu, tetapi soal yang sudah dipublikasikan dapat masuk ke pelatihan atau penyetelan berikutnya.

Kumpulan dinamis juga menyulitkan perbandingan waktu. Jika ujian berubah setiap bulan, perubahan skor mencampur perubahan model dan soal. Simpan versi dan bandingkan soal yang sama, atau laporkan acuan tetap dan soal baru secara terpisah. Paparan acuan tetap yang terus bertambah tetap merupakan keterbatasan.

## Jadikan kondisi setara sebagai protokol

Satu nama dapat mewakili versi, endpoint, dan pengaturan penalaran berbeda. Catat ID API sebenarnya, informasi versi yang tersedia, tanggal, instruksi sistem, sampling, batas keluaran, alat, dan aturan percobaan ulang. Jangan mengarang perutean atau anggaran komputasi internal yang tidak dipublikasikan.

Pisahkan model dalam protokol bersama dari sistem dengan konfigurasi terbaik dalam anggaran yang dinyatakan. Yang pertama membantu menjelaskan perbedaan, yang kedua membantu pembelian. Batas token sama tidak berarti komputasi sama karena tokenizer dan mekanisme internal berbeda.

[HELM](https://arxiv.org/abs/2211.09110v2) menyeragamkan skenario dan kondisi sambil menilai akurasi, kalibrasi, ketahanan, dan efisiensi. Laporkan mutu, biaya, latensi, dan kegagalan bersama-sama. Biaya mencakup percobaan gagal dan panggilan alat, bukan hanya percobaan terakhir yang berhasil.

## Penilai juga dapat keliru

Jika jawaban acuan tersedia, utamakan aturan yang dapat diverifikasi, tetapi periksa acuannya juga. Pengujian kode bisa melewatkan persyaratan atau memaksakan satu implementasi; kecocokan teks persis dapat menolak jawaban yang benar. Bekukan versi penilai, ekstraksi jawaban, dan penanganan pengecualian.

Tugas terbuka memerlukan pertimbangan tambahan. [Judging LLM-as-a-Judge](https://arxiv.org/abs/2306.05685v4) membahas bias posisi, panjang, dan preferensi pada jawaban sendiri. Anonimisasi, pertukaran urutan, rubrik jelas, dan peninjauan manusia untuk kasus sengketa membantu. Kesepakatan dengan preferensi manusia bukan akurasi faktual.

Pisahkan jawaban salah, kegagalan format, penolakan, batas waktu terlampaui, dan galat layanan. Tetapkan pengaruhnya terhadap skor utama sebelum pengujian. Menghitung akurasi hanya dari respons yang diterima sambil menyembunyikan banyak kegagalan waktu akan melebihkan keandalan layanan.

## Selisih kecil memerlukan analisis berpasangan

Misalkan dari 200 soal yang sama, A menjawab 160 dengan benar dan B 156. Ini contoh hipotetis. Selisihnya 2 poin persentase, tetapi jumlah itu tidak menjelaskan kestabilannya. Kita juga perlu tahu soal mana yang diselesaikan dan apakah soal saling independen.

[Adding Error Bars to Evals](https://arxiv.org/abs/2411.00640v1) membahas perbandingan berpasangan, soal berkorelasi, dan perencanaan. Analisis selisih per soal pada kumpulan bersama. Kelompokkan variasi satu templat, jangan menghitung soal mirip sebagai bukti independen. Generasi berulang memperkirakan variasi sampling, bukan memperbaiki cakupan bidang yang kurang.

Laporkan interval kepercayaan 95% untuk selisih, beserta metode dan unit sampling. Interval yang mencakup nol tidak membuktikan keunggulan maupun kesetaraan. Banyak perbandingan model atau subkategori juga memerlukan pengendalian pencarian hasil signifikan berulang.

## Kartu hasil yang dapat diperiksa

| Unsur | Bukti yang disimpan | Dampak jika tidak ada |
| --- | --- | --- |
| Kemampuan | Tugas, penggunaan, pengecualian | Generalisasi tidak didukung |
| Data | Versi, tanggal, asal, pengelompokan | Ujian mungkin berbeda |
| Pelaksanaan | Model, instruksi, alat, anggaran, percobaan | Efek model dan sistem bercampur |
| Penilaian | Acuan, versi penilai, peninjauan | Kesalahan penilaian sulit disisihkan |
| Ketidakpastian | Sampel, selisih berpasangan, interval, pengulangan | Selisih kecil bisa dibesar-besarkan |
| Biaya dan kegagalan | Total biaya, waktu, jenis galat, cakupan | Keberhasilan dapat menutupi ketidaktersediaan |

Ini usulan format catatan editorial dan eksperimen, bukan sertifikasi peringkat yang ada. Simpan data mentah sensitif dalam lingkungan terkendali; publikasikan bukti yang telah disamarkan dan protokol yang cukup untuk meninjau kesimpulan.

## Gunakan peringkat untuk mempersempit pilihan

Benchmark yang kredibel menemukan kandidat dan kelemahan. Pilihan akhir harus kembali pada tugas Anda: kegagalan yang tidak dapat diterima, biaya dan latensi yang sesuai, serta perubahan setelah pembaruan model.

Folkbench menyarankan hasil per kemampuan sebelum skor gabungan. Jika memakai bobot, publikasikan dan periksa apakah perubahan wajar mengubah urutan. Hasil seri atau pengakuan bahwa bukti belum dapat membedakan model lebih bermanfaat daripada ketepatan semu.

Lihat penerapannya pada [ketahanan penalaran matematika](/id/blog/mathematical-reasoning-robustness/) dan [pemahaman efektif konteks panjang](/id/blog/long-context-effective-understanding/).
