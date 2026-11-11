---
slug: gpt-6-1-sol-review-pricing
translationKey: gpt-6-1-sol-review-pricing
locale: id
kind: article
title: Spesifikasi GPT-6.1 Sol, harga konteks panjang, dan perbandingan yang dipublikasikan
description: "Spesifikasi resmi, harga katalog di bawah dan di atas 272 ribu token input, serta selisih dan biaya per tugas yang dicantumkan untuk GPT-6.1 Sol. Angka-angka ini berasal dari halaman publik OpenAI, bukan hasil pengukuran Folkbench."
category: Model
tags: [harga, benchmark, api]
authorId: iris-wu
modelIds: [gpt-6-1-sol, gpt-6-sol, gpt-6-astra, gpt-6-luna]
benchmarkSlugs: []
relatedSlugs: [claude-opus-5-5-review-pricing, claude-sonnet-5-5-review-pricing]
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: gpt-61-announcement
    label: OpenAI, pengumuman GPT-6.1 Sol
    url: https://openai.com/index/introducing-gpt-6-1-sol/
    checkedAt: '2026-10-02'
    claimScope: official
  - id: gpt-61-model
    label: OpenAI API, halaman model GPT-6.1 Sol
    url: https://developers.openai.com/api/docs/models/gpt-6.1-sol
    checkedAt: '2026-10-02'
    claimScope: official
  - id: openai-pricing
    label: Daftar harga OpenAI API
    url: https://developers.openai.com/api/docs/pricing
    checkedAt: '2026-10-02'
    claimScope: official
  - id: gpt-61-system-card
    label: OpenAI, adendum kartu sistem GPT-6.1 Sol
    url: https://deploymentsafety.openai.com/gpt-6-1-sol
    checkedAt: '2026-10-02'
    claimScope: official
---

> Spesifikasi dan harga di bawah ini berasal dari halaman model dan tabel harga OpenAI. Perbandingannya berasal dari halaman pengumuman. Semuanya dicek pada 2 Oktober 2026. Pengumuman itu mencantumkan selisih dan biaya, bukan tabel skor absolut yang bisa disalin begitu saja. Folkbench tidak menjalankan ulang evaluasi ini. Klaim “sekitar seperlima biaya” dari penyedia model menggambarkan perangkat uji mereka sendiri.

OpenAI menyebut GPT-6.1 Sol sebagai peningkatan dari `gpt-6-sol`. ID model API-nya `gpt-6.1-sol`. Menurut pengumuman, model ini mendekati `gpt-6-astra` dalam coding kompleks, penggunaan komputer, dan pekerjaan profesional, dengan harga input dan output standar seperlima dari Astra. Pembacaan cache dihargai $0,10 per 1 juta token, yaitu 5% dari input standar dan separuh harga pembacaan cache `gpt-6-sol`. Untuk riset ilmiah tersulit, pengumuman itu tetap merekomendasikan Astra. `gpt-6-sol` masih tercantum di tabel harga.

Pengumuman GPT-6 Sol dan Luna merujuk ke model ini dalam pembaruan bertanggal 29 September 2026. Artikel ini tidak menganggap tanggal pada kartu berita lain di footer sebagai tanggal pengumuman GPT-6.1 Sol.

Untuk harga resmi dan tabel benchmark Claude, baca [Opus 5.5](../claude-opus-5-5-review-pricing/) dan [Sonnet 5.5](../claude-sonnet-5-5-review-pricing/).

## Spesifikasi yang sudah dipublikasikan

| Item | GPT-6.1 Sol |
| --- | --- |
| ID model | `gpt-6.1-sol` |
| Jendela konteks | 1.050.000 token |
| Input maksimum | 922.000 token |
| Output maksimum | 128.000 token |
| Input ke output | Teks dan gambar ke teks |
| Batas pengetahuan | 30 April 2026 |
| `reasoning.effort` | `low`, `medium` (default), `high`, `xhigh`, `max` |
| Effort yang tidak diterima | `none`, `minimal` |
| Pemanggilan tool | Responses API |
| Chat Completions | Didukung, tanpa tool |
| Endpoint yang tercantum didukung | Chat Completions, Responses, Batch |
| Tidak didukung menurut halaman model | Realtime, Assistants, fine-tuning, embeddings, pembuatan gambar, video, suara |
| Residensi data | AS dan UE. Mode Fast tidak tersedia bersama residensi data UE |

Input maksimum 922.000 cocok dengan jendela konteks 1.050.000 dikurangi output maksimum 128.000: 1.050.000 − 128.000 = 922.000. Halaman model menyebut token penalaran didukung, tetapi bagian yang dikutip di sini tidak mencantumkan rumus penagihan tersendiri untuk token tersebut. Susun anggaran berdasarkan input, cache, dan output di catatan penggunaan.

## Harga resmi

### Konteks pendek dan konteks panjang

Harga dalam dolar AS per 1 juta token. Kedua tarif berasal dari tabel harga API yang dicek pada 2 Oktober 2026. Tabel itu menyebut konteks pendek adalah input hingga 272 ribu token, dan konteks panjang adalah input di atas 272 ribu token. Halaman model menyebut bahwa di atas 272 ribu, input dan cache dihargai 2× dan output 1,5×, untuk seluruh permintaan.

| Per 1 jt token | 6.1 pendek | 6.1 panjang | Sol pendek | Sol panjang | Astra pendek | Astra panjang |
| --- | --- | --- | --- | --- | --- | --- |
| Input | $2 | $4 | $2 | $4 | $10 | $20 |
| Pembacaan cache | $0,10 | $0,20 | $0,20 | $0,40 | $1 | $2 |
| Penulisan cache | $2,50 | $5 | $2,50 | $5 | $12,50 | $25 |
| Output | $10 | $15 | $10 | $15 | $50 | $75 |

Input hingga 272 ribu token memakai tarif pendek. Begitu sebuah permintaan melewati 272 ribu, token sebelumnya juga dihitung ulang dengan tarif panjang. Bukan hanya token kelebihannya yang berubah harga. Pembacaan cache 6.1 separuh dari Sol. Input dan output standar seperlima dari Astra. Pembacaan cache tidak seperlima dari Astra: pembacaan cache Astra pada konteks pendek $1, sedangkan 6.1 $0,10.

Penulisan cache bernilai 1,25× input tanpa cache, jadi tarif pendek $2 × 1,25 = $2,50 dan tarif panjang $4 × 1,25 = $5. Output tarif panjang 1,5× tarif pendek, $10 × 1,5 = $15.

### Pengali lain di tabel harga

Halaman model mencantumkan tiga pengali resmi lainnya. Mode Fast 2× harga standar. Batch dan Flex 50% lebih murah dari standar. Pemrosesan regional, bila tersedia, menambah 10%. Di tabel harga pada hari yang sama, Batch, Flex, dan Fast masing-masing punya baris sendiri, dan angkanya sesuai dengan pengali tersebut. Misalnya, mode Fast untuk 6.1 pada konteks pendek adalah input $4, pembacaan cache $0,20, penulisan cache $5, dan output $20.

Pengumuman itu juga menyebut Ultrafast akan hadir di Codex dalam beberapa hari berikutnya, dengan kecepatan pembuatan token hingga 8× kecepatan standar. Tabel harga model unggulan yang dibaca pada 2 Oktober 2026 tidak memiliki baris model Ultrafast tersendiri. Apakah suatu pengali resmi sudah masuk ke tagihan tertentu, pastikan lewat catatan penggunaan.

Berikut tiga contoh yang bisa dihitung ulang dengan tarif standar. Dua baris pertama tetap di tarif pendek. Baris ketiga berisi 280 ribu token input, sehingga seluruh permintaan memakai tarif panjang. Baris cache mengasumsikan catatan penggunaan menghitung token input tersebut sebagai cache hit.

| Permintaan | Perhitungan | Jumlah |
| --- | --- | --- |
| 100 rb input tanpa cache, 5.000 output | 0,1 × $2 + 0,005 × $10 | $0,25 |
| 100 rb pembacaan cache, 5.000 output | 0,1 × $0,10 + 0,005 × $10 | $0,06 |
| 280 rb input tanpa cache, 10.000 output | 0,28 × $4 + 0,01 × $15 | $1,27 |

Jika 280 ribu token itu dihitung dengan tarif pendek, hasilnya 0,28 × $2 + 0,01 × $10 = $0,66. Itu bukan harga tarif ini. Fast, Batch, Flex, dan tambahan biaya regional belum dikalikan ke dalam tiga baris ini.

## Cara membaca perbandingan di pengumuman

Pengumuman mencantumkan selisih dan biaya, bukan tabel skor absolut. Baris di bawah hanya memuat perbandingan yang dinyatakan di halaman itu. Kalimat tentang biaya menggambarkan perangkat uji OpenAI.

| Evaluasi | Yang dinyatakan pengumuman | Kondisi |
| --- | --- | --- |
| DeepSWE v1.1 | Setara Astra; 6,4 poin persentase di atas skor terbaik Sol | Reasoning effort lebih rendah, dengan biaya sekitar seperlima |
| GDP.pdf | Di atas Opus 5.5 dengan fallback; mendekati Astra | Pengaturan reasoning yang diuji; kurang dari separuh biaya Opus, sekitar seperlima biaya Astra |
| AutomationBench | 2,2 poin persentase di atas Opus 5.5; 4,8 poin persentase di atas Sol pada pengaturan yang sama | medium; sekitar sepertiga biaya Opus |
| Set offline OSWorld 2.0 | 7 poin persentase di atas Sol; selisih maksimal 2,1 poin persentase dari Astra | max; partial reward, v2026.08.08; kurang dari separuh biaya Sol, sekitar sepertujuh biaya Astra |
| Terminal-Bench Science 0.1 | Lebih dari dua kali skor Sol; Astra tetap meraih skor tertinggi di antara model yang diuji, 68,1% | max; rata-rata 6.1 $5,47 per tugas, Opus 5.5 $23,21, Astra $23,80 |
| Faktualitas | Porsi jawaban dengan setidaknya satu kesalahan fakta turun dari 11,4% menjadi 7,7% | low; selisih maksimal 1,9 poin persentase dari Astra |

Sampel faktualitas berupa percakapan yang sudah dianonimkan, tempat pengguna pernah menandai kesalahan sebelumnya. Pengumuman menyebut prompt ini sengaja dipilih yang sulit dan tidak mewakili lalu lintas biasa. Angka dolar Terminal-Bench Science adalah biaya rata-rata per tugas yang dipublikasikan OpenAI, bukan harga grup suatu relay. Skor ilmiah tertinggi di antara model yang diuji tetap milik Astra, 68,1%, dan pengumuman menyarankan agar riset ilmiah tersulit tetap memakai Astra.

Halaman yang sama juga mencantumkan tingkat kegagalan dari uji penyelarasan yang sengaja dibuat sulit. Ketika tool pencarian sudah rusak, porsi run dengan effort max yang tidak memberi tahu pengguna adalah 2,1% untuk 6.1, 4,9% untuk Sol, 1,5% untuk Astra, dan 28,7% untuk Luna. Pengumuman menyebut tidak teramati upaya melewati peninjau keamanan otomatis, sama seperti Astra dan Sol. Detailnya ada di adendum kartu sistem GPT-6.1 Sol. Tingkat kegagalan ini bukan tingkat kegagalan pada lalu lintas biasa.

Pengumuman juga menyebut evaluasi dijalankan di lingkungan riset atau melalui API, yang system prompt dan tool-nya bisa berbeda dari ChatGPT produksi. Angka pesaing diambil dari laporan publik.

## Dua jalur permintaan yang harus dipisahkan

Pemanggilan tool memakai Responses. Effort default sudah `medium`. Halaman model menyebut Chat Completions dapat membawa teks tanpa tool.

```text
# Responses
model: gpt-6.1-sol
reasoning.effort: medium

# Chat Completions, tanpa tools
model: gpt-6.1-sol
reasoning_effort: medium

# Tidak diterima menurut halaman model
reasoning.effort: none
reasoning.effort: minimal
tools pada permintaan Chat Completions
```

Saat beralih dari `gpt-6-sol` atau `gpt-6-luna`, yang menerima `none`, bandingkan ulang pada `low`. Jangan biarkan `none` tetap ada di permintaan. Tool, penggunaan komputer, pencarian file, dan pencarian web lewat Responses. Chat Completions hanya menangani permintaan tanpa tool. Tool Responses yang tercantum di halaman model meliputi pencarian web, pencarian file, code interpreter, penggunaan komputer, dan MCP. Input gambar memakai array konten pada pesan pengguna.

Input dan output tarif pendek sama dengan `gpt-6-sol`. Pembacaan cache turun dari $0,20 menjadi $0,10. Output tarif panjang $15 pada keduanya, dan pembacaan cache tarif panjang turun dari $0,40 menjadi $0,20. Saat beralih ke 6.1, kunci nama model pada hasil yang selesai. Jawaban yang mendarat di ID lain tidak dihitung sebagai peralihan ini.

## Hal yang perlu dicek sebelum memindahkan lalu lintas

1. Kunci `gpt-6.1-sol`. Nama model pada hasil yang selesai juga harus ID tersebut.
2. Putar ulang satu set yang tidak berisi data sensitif pada `low`, `medium`, `high`, `xhigh`, dan `max`. `none` dan `minimal` tidak ada di kartu ini.
3. Letakkan tool di Responses. Jangan sertakan tool di permintaan Chat Completions.
4. Hitung harga satu prompt hingga 272 ribu token input dan satu prompt di atas 272 ribu. Yang kedua memakai tarif panjang untuk seluruh permintaan.
5. Susun anggaran dari dua baris standar terlebih dahulu. Fast, Batch, Flex, dan tambahan biaya regional mengikuti jumlah yang benar-benar tercatat di catatan penggunaan.
6. Baca token cache di catatan penggunaan sebelum memakai contoh cache di atas.
7. Residensi data UE tidak bisa digabung dengan mode Fast. Halaman model menyebut residensi AS dan UE didukung, tetapi tidak menggambarkan residensi sebagai parameter yang bisa ditambahkan di sembarang gateway.
8. Tetap gunakan `gpt-6-astra` untuk riset ilmiah tersulit. `gpt-6-sol` masih ada di tabel harga.

Setelah model dipilih, apakah suatu relay menyediakan ID ini, beserta ketersediaan dan harga relay itu yang dipublikasikan, mengacu pada catatan di direktori. Tabel dalam artikel ini adalah harga resmi OpenAI, bukan harga pengguna di suatu relay setelah dikalikan rasio harga grup.
