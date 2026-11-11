---
slug: grok-4-7-review-pricing
translationKey: grok-4-7-review-pricing
locale: id
kind: article
title: Spesifikasi Grok 4.7, harga konteks panjang, dan benchmark yang dipublikasikan
description: "Nama model resmi, konteks 500 ribu token, harga katalog di bawah dan di atas 200 ribu token prompt, serta tabel benchmark yang dicantumkan untuk Grok 4.7. Angka-angka ini berasal dari halaman publik xAI, bukan hasil pengukuran Folkbench."
category: Model
tags: [harga, benchmark, api]
authorId: iris-wu
modelIds: [grok-4-7, grok-4-6]
benchmarkSlugs: []
relatedSlugs: [gpt-6-1-sol-review-pricing, claude-opus-5-5-review-pricing, claude-sonnet-5-5-review-pricing]
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: grok-47-announcement
    label: xAI, pengumuman Grok 4.7
    url: https://x.ai/news/grok-4-7
    checkedAt: '2026-10-02'
    claimScope: official
  - id: grok-47-guide
    label: Dokumentasi xAI, Grok 4.7
    url: https://docs.x.ai/developers/grok-4-7
    checkedAt: '2026-10-02'
    claimScope: official
  - id: grok-47-model
    label: Dokumentasi xAI, halaman model Grok 4.7
    url: https://docs.x.ai/developers/models/grok-4.7
    checkedAt: '2026-10-02'
    claimScope: official
  - id: xai-pricing
    label: Daftar harga xAI API
    url: https://docs.x.ai/developers/pricing
    checkedAt: '2026-10-02'
    claimScope: official
---

> Spesifikasi dan harga di bawah ini berasal dari dokumentasi dan tabel harga xAI. Benchmark-nya berasal dari pengumuman 21 September 2026. Semuanya dicek pada 2 Oktober 2026. Folkbench tidak menjalankan ulang evaluasi ini. Harga dan skor pesaing di pengumuman adalah angka yang dicetak halaman itu, bukan hasil pengecekan ulang tabel harga OpenAI atau Anthropic pada hari yang sama.

xAI mengumumkan Grok 4.7 pada 21 September 2026. Nama model API-nya `grok-4.7`. Dokumentasi menggambarkannya sebagai model terdepan untuk coding, tugas agen, dan pekerjaan berbasis pengetahuan. Isi pengumuman menyebut model ini dilayani dengan harga dan kecepatan yang sama dengan [Grok 4.6](https://x.ai/news/grok-4-6). Judul di halaman yang sama justru menyebut kecepatannya sekitar dua kali lipat, dengan harga sekitar separuh model sekelas. Kedua kalimat itu tercetak di pengumuman. Artikel ini tidak mengubah kalimat judul itu menjadi tabel harga tersendiri.

Ada tiga halaman publik yang bisa dicocokkan satu sama lain. Tabel ringkas di dokumentasi mencantumkan jendela konteks 500.000 token, batas pengetahuan Mei 2026, serta harga konteks pendek $2 untuk input dan $6 untuk output. Tabel harga beralih ke tarif konteks panjang begitu prompt mencapai 200 ribu token, dan tarif itu berlaku untuk seluruh permintaan. Tabel benchmark di pengumuman menyandingkan `grok-4.7` dengan Grok 4.6, GPT-5.6 Sol, dan Fable 5.1. Untuk tarif konteks panjang OpenAI, lihat [GPT-6.1 Sol](https://folkbench.com/id/blog/gpt-6-1-sol-review-pricing). Untuk Claude, lihat [Opus 5.5](https://folkbench.com/id/blog/claude-opus-5-5-review-pricing) dan [Sonnet 5.5](https://folkbench.com/id/blog/claude-sonnet-5-5-review-pricing).

## Spesifikasi yang sudah dipublikasikan

| Item | Grok 4.7 |
| --- | --- |
| Nama model | `grok-4.7` |
| Tanggal pengumuman | 21 September 2026 |
| Jendela konteks | 500.000 token |
| Batas pengetahuan | Mei 2026 |
| Input ke output | Teks dan gambar ke teks |
| Batas output di tabel ringkas | Tertulis tanpa batas output teks, tanpa jumlah token output maksimum tersendiri |
| Penalaran | `low`, `medium`, `high` (default), `xhigh` |
| API | Responses, Chat Completions |
| Tool yang disebut di dokumentasi | Pemanggilan fungsi, pencarian web, pencarian X, eksekusi kode |
| Batch API di halaman model | Tidak didukung |

Halaman model menetapkan effort default `high`. Dokumentasi menyarankan `prompt_cache_key` pada Responses API, dan header `x-grok-conv-id` pada Chat Completions. Menurut halaman tersebut, tanpa kunci itu percakapan sering mendarat di server yang belum memiliki cache, dan input ditagih dengan harga tanpa cache. Responses juga mengembalikan `reasoning.encrypted_content` meskipun permintaan tidak mencantumkannya di `include`. Pemanggilan multi-giliran harus mengirim kembali item reasoning itu tanpa diubah di `input` berikutnya. Dokumentasi menyebut Chat Completions tidak berubah dalam hal ini.

Dokumentasi mencantumkan xAI API, endpoint regional AS `https://us.api.x.ai/v1`, Grok Build, Cursor, serta gateway OpenRouter, Vercel, dan Cloudflare. Model default Grok Build adalah model ini. Endpoint AS saat ini mencantumkan `grok-4.7` dan `grok-4.6`. Apakah suatu relay menyediakan ID ini mengacu pada catatan katalog yang dipublikasikan, bukan klaim dalam artikel ini.

## Harga resmi

### Konteks pendek dan konteks panjang

Harga dalam USD per 1 juta token, dari tabel harga API yang dibaca pada 2 Oktober 2026. Tabel itu menyebut ambang konteks panjang adalah prompt sebesar 200 ribu token. Begitu sebuah permintaan mencapainya, setiap token dalam permintaan itu memakai tarif konteks panjang. `grok-4.7` dan `grok-4.6` memiliki enam sel yang sama di tabel ini.

| Per 1 jt token | 4.7 pendek | 4.7 panjang | 4.6 pendek | 4.6 panjang |
| --- | --- | --- | --- | --- |
| Input | $2 | $4 | $2 | $4 |
| Pembacaan cache | $0,50 | $1 | $0,50 | $1 |
| Output | $6 | $12 | $6 | $12 |

Prompt di bawah 200 ribu token memakai tarif pendek. Mulai dari permintaan yang mencapai 200 ribu, token sebelumnya juga dihitung dengan tarif panjang. Tarif panjang dua kali tarif pendek: $2 × 2 = $4, cache $0,50 × 2 = $1, dan output $6 × 2 = $12. Pembacaan cache seperempat harga input pada tarif yang sama: $2 × 0,25 = $0,50, dan $4 × 0,25 = $1.

Tiga contoh berikut hanya memakai tarif standar. Dua yang pertama tetap di tarif pendek. Yang ketiga berisi 280.000 token input, sehingga seluruh permintaan memakai tarif panjang. Baris cache mengasumsikan catatan penggunaan menghitung input itu sebagai cache hit.

| Permintaan | Perhitungan | Jumlah |
| --- | --- | --- |
| 100.000 input tanpa cache, 5.000 output | 0,1 × $2 + 0,005 × $6 | $0,23 |
| 100.000 pembacaan cache, 5.000 output | 0,1 × $0,50 + 0,005 × $6 | $0,08 |
| 280.000 input tanpa cache, 10.000 output | 0,28 × $4 + 0,01 × $12 | $1,24 |

Jika 280.000 token itu dihitung dengan tarif pendek, hasilnya 0,28 × $2 + 0,01 × $6 = $0,62. Itu bukan harga tarif ini. Fast, tambahan biaya regional AS, dan pemanggilan tool belum dikalikan ke dalam tiga baris ini.

### Pengali lain di tabel harga

Endpoint regional AS `https://us.api.x.ai/v1` menjaga inferensi tetap di Amerika Serikat dan menagih token 1,1 kali tarif global, yaitu tambahan 10%. Tabel harga mencantumkan hasil berikut untuk `grok-4.7`: di bawah 200 ribu, input $2,20, pembacaan cache $0,55, output $6,60; di atas 200 ribu, input $4,40, pembacaan cache $1,10, output $13,20. Pengali 1,1 berlaku untuk input, output, dan pembacaan cache, termasuk tarif panjang. Diskon cache dihitung lebih dulu, baru dikalikan 1,1.

Grok 4.7 Fast adalah model yang sama di infrastruktur yang lebih cepat. Dokumentasi menyebut permintaan standar dikenai 2 kali dan permintaan konteks panjang 1,5 kali. Fast hanya tersedia di Cursor dan Grok Build, dan ditagih melalui paket di sana. Fast tidak ada di xAI API publik, dan tidak termasuk dalam paket gratis Grok Build. Tabel harga mencantumkan tarif Fast: input $4, cache $1, output $12 di bawah 200 ribu, serta input $6, cache $1,50, output $18 di atas 200 ribu. $4 / $1 / $12 adalah dua kali tarif pendek. $6 / $1,50 / $18 adalah 1,5 kali tarif panjang. Pengumuman juga menyebut varian cepat memiliki kecepatan output dua kali lipat dengan harga dua kali lipat, tetapi tidak mencantumkan tarif 1,5 kali ini. Gunakan tabel di dokumentasi untuk tagihan.

Halaman model menyebut Batch API tidak didukung. `grok-4.7` tidak ada dalam daftar diskon batch di tabel harga; model yang tercantum di sana mendapat diskon batch 20%. Halaman harga juga menjelaskan Priority Processing untuk permintaan teks: `service_tier` yang terkonfirmasi `priority` ditagih 2 kali, setelah diskon cache. Halaman model Grok 4.7 tidak memiliki baris Priority tersendiri. Apakah sebuah permintaan memakai pengali itu ditentukan oleh `service_tier` pada respons.

Dokumentasi menetapkan harga terpisah untuk tool sisi server. Pencarian web $5 per 1.000 panggilan. Pencarian X ditagih per item yang diambil: $5 per 1.000 postingan dan $10 per 1.000 profil. Eksekusi kode $5 per 1.000 panggilan. Biaya ini berada di luar harga token. Halaman model mencantumkan 150 permintaan per detik dan 50.000.000 token per menit, dengan region tertulis `us-east-1`. Panduan itu juga menyebut batas laju dan harga terkini untuk suatu tim ada di halaman model tersebut, jadi kedua angka ini bukan janji untuk setiap akun.

## Cara membaca benchmark di pengumuman

Pengumuman mencantumkan tabel perbandingan, bukan hasil pengukuran Folkbench. Kolomnya adalah Grok 4.7 xHigh, Grok 4.6 High, GPT-5.6 Sol Max, dan Fable 5.1 Max. Dua baris harga adalah harga katalog input dan output yang dicetak halaman itu. Sel DeepSWE untuk `grok-4.7` bernilai 71,0%, dan tanda bintangnya menyebut sel itu memakai effort high, bukan xHigh seperti di kepala kolom.

| Item | Grok 4.7 | Grok 4.6 | GPT-5.6 Sol | Fable 5.1 |
| --- | --- | --- | --- | --- |
| Input / 1 jt | $2 | $2 | $4 | $10 |
| Output / 1 jt | $6 | $6 | $20 | $50 |
| CursorBench 4.0 | 46,3% | 40,4% | 41,7% | 51,8% |
| DeepSWE v1.1 | 71,0% (high) | 65,2% | 72,7% | 70,0% |
| EEBench | 64,0% | 53,0% | 39,4% | 56,4% |
| AA Briefcase v1.1 | 1.657 | 1.546 | 1.487 | 1.678 |
| Terminal-Bench 4.0 | 37,6% | 20,3% | 37,3% | 57,9% |
| Harvey Legal Agent Benchmark | 19,6% | 15,8% | 2,5% | 6,7% |
| HealthBench Professional | 56,7% | 48,5% | 60,5% | 62,1% |

Pengumuman juga menyebut Grok 4.7 unggul atas Grok 4.6 di GDPval maupun AA Briefcase, dan setara dengan model terdepan lainnya. Grafik GDPval tidak mencantumkan skor absolut di teks, jadi artikel ini tidak menambahkan angka apa pun. Skor AA Briefcase adalah 1.657 pada tabel di atas.

Bagian keamanan mencantumkan dua angka. Benchmark keamanan hayati LatchBio bernilai 62,4%. Di HackerBench v0.3, 3,3% prompt dwiguna yang berisiko diloloskan. Halaman itu menyebut pekerjaan keamanan yang sah jarang diblokir, tetapi tidak mencantumkan tingkat penolakan untuk permintaan yang sah. Mitra keamanan siber terpilih dapat meminta akses red team khusus undangan. Angka-angka ini menggambarkan pengujian dalam pengumuman, bukan tingkat kegagalan pada lalu lintas biasa.

## Hal yang perlu dicek sebelum memindahkan lalu lintas

1. Kunci `grok-4.7`. Nama model pada hasil yang selesai juga harus ID tersebut. Halaman katalog memakai `grok-4-7`.
2. Effort default adalah `high`. Tetapkan `low`, `medium`, `high`, atau `xhigh` secara eksplisit saat membandingkannya.
3. Kirim `prompt_cache_key` pada pemanggilan multi-giliran, atau `x-grok-conv-id` pada Chat Completions. Kembalikan reasoning terenkripsi dari Responses tanpa diubah.
4. Hitung harga prompt di bawah 200 ribu token dan prompt yang mencapai 200 ribu secara terpisah. Yang kedua memakai tarif panjang untuk seluruh permintaan.
5. Endpoint regional AS menagih 1,1 kali. Fast tidak ada di API publik. Jangan kalikan tarif 2 kali atau 1,5 kali ke tagihan API biasa.
6. Halaman model menyebut Batch API tidak didukung. Pemanggilan tool menambah biaya sesuai harga per 1.000 panggilan di dokumentasi.
7. Kolom pesaing di tabel pengumuman memakai harga dan skor yang dicetak halaman itu. Angka DeepSWE 71,0% memakai high, bukan xHigh.
8. Apakah suatu relay menyediakan ID ini, beserta ketersediaan dan harga yang ditagihkan saat itu, mengacu pada katalog yang dipublikasikan. Tabel di sini adalah harga resmi xAI, bukan harga suatu relay setelah dikalikan rasio harga grup.
