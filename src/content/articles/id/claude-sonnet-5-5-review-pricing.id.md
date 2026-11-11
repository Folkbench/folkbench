---
slug: claude-sonnet-5-5-review-pricing
translationKey: claude-sonnet-5-5-review-pricing
locale: id
kind: article
title: "Claude Sonnet 5.5: spesifikasi, harga katalog, dan benchmark yang dipublikasikan"
description: "Spesifikasi resmi, harga katalog yang sama dengan Sonnet 5, dan tabel benchmark yang dipublikasikan untuk Claude Sonnet 5.5, ditambah permintaan yang mengembalikan 400 saat migrasi. Angka-angka ini bukan hasil pengukuran Folkbench."
category: Model
tags: [harga, benchmark, api]
authorId: iris-wu
modelIds: [claude-sonnet-5-5, claude-sonnet-5, claude-opus-5-5, gpt-6-sol]
benchmarkSlugs: []
relatedSlugs: [claude-opus-5-5-review-pricing, gpt-6-1-sol-review-pricing]
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: sonnet-55-announcement
    label: Anthropic, pengumuman Claude Sonnet 5.5
    url: https://www.anthropic.com/claude-sonnet-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-55-overview
    label: Claude Platform, halaman model Sonnet 5.5
    url: https://platform.claude.com/docs/en/models/sonnet-5-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-55-whats-new
    label: Claude Platform, yang baru di Sonnet 5.5
    url: https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-55-migration
    label: Claude Platform, migrasi ke Sonnet 5.5
    url: https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-5-overview
    label: Claude Platform, halaman model Sonnet 5
    url: https://platform.claude.com/docs/en/models/sonnet-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
---

> Spesifikasi, harga katalog, dan skor di bawah ini disalin dari halaman publik Anthropic dan dicek pada 2 Oktober 2026. Folkbench tidak menjalankan ulang benchmark ini. Kalimat seperti “hingga 30% lebih murah” dan “lebih dari 30% lebih cepat” menggambarkan perangkat uji milik penyedia model itu sendiri.

Claude Sonnet 5.5 diumumkan pada 28 September 2026 sebagai model kedua dalam keluarga Claude 5.5. ID modelnya di Claude API adalah `claude-sonnet-5-5`. Anthropic menempatkannya di samping [Opus 5.5](../claude-opus-5-5-review-pricing/): tugas harian yang cakupannya jelas, perbaikan bug, serta dokumen, slide, dan spreadsheet memakai model ini, sedangkan untuk pekerjaan kompleks dan terbuka yang menuntut penilaian berkelanjutan, pengumuman itu sendiri masih menyebut Opus 5.5 lebih kuat. Harga katalognya sama dengan Sonnet 5: $2 per 1 juta token input, $10 per 1 juta token output, dan $0,20 per 1 juta token untuk pembacaan cache.

Kedua pengumuman menyebut Haiku 5.5 akan menyusul dalam beberapa minggu ke depan. Artikel ini tidak memberi harga untuk ID yang belum muncul di tabel harga.

## Spesifikasi yang sudah dipublikasikan

| Item | Claude Sonnet 5.5 |
| --- | --- |
| ID model Claude API | `claude-sonnet-5-5` |
| Tanggal pengumuman | 28 September 2026 |
| Konteks / output maksimum sinkron | 1 juta / 128 ribu token |
| Input ke output | Teks dan gambar ke teks |
| Pemikiran | Adaptif, aktif secara default |
| Effort default di Claude API | `high` |
| Effort default di aplikasi Claude dan Claude Code | `medium` |
| Nilai effort | `low`, `medium`, `high`, `xhigh`, `max` |
| Kelas latensi di halaman model | Fast. Ini perbandingan di dalam jajaran Claude saat ini, bukan pengukuran token per detik |
| Batas pengetahuan andal | Juni 2026 |
| Prompt minimum yang dapat di-cache | 512 token |
| Tokenizer | Sama dengan Sonnet 5, sehingga teks yang sama menghasilkan jumlah token yang sama |

Halaman model Sonnet 5 masih menandai model itu sebagai legacy dan tersedia, masih mencantumkan $2 / $10 untuk input dan output, serta batas pengetahuan andal Januari 2026. Komitmen penghentiannya tidak lebih awal dari 30 Juni 2027. Halaman pembaruan Sonnet 5.5 menyarankan beralih ke 5.5.

Pengaturan terendah yang mematikan pemikiran di awal adalah `thinking: {"type": "between_tools"}`, dan pengaturan ini hanya diterima pada `low`, `medium`, dan `high`. `xhigh` dan `max` harus kembali ke pemikiran adaptif. Panduan migrasi menyebut bahwa `temperature`, `top_p`, atau `top_k` dengan nilai non-default akan mengembalikan 400.

## Harga resmi

Harga dalam dolar AS per 1 juta token. Kolom Sonnet 5.5 berasal dari halaman model. Input, output, dan pembacaan cache Opus 5.5 berasal dari tabel perbandingan di pengumuman yang sama. Halaman pembaruan menyebut Sonnet 5.5 mempertahankan harga Sonnet 5, termasuk prompt caching dan batch. Diskon batch adalah 50% untuk input dan output.

| Per 1 jt token | Sonnet 5.5 | Opus 5.5 di pengumuman |
| --- | --- | --- |
| Input | $2 | $4 |
| Output | $10 | $20 |
| Pembacaan cache | $0,20 | $0,20 |
| Penulisan cache | 5 menit $2,50; 1 jam $4 | Dicetak sebagai satu angka $5 di pengumuman; halaman pembaruan memisahkan Opus 5.5 menjadi 5 menit $5 dan 1 jam $8 |
| Input / output batch | 50% dari harga katalog | Tidak ada di tabel perbandingan pengumuman itu |

Input dan output Sonnet 5.5 separuh dari Opus 5.5. Pembacaan cache keduanya $0,20. Pengumuman mencetak penulisan cache Opus 5.5 sebagai satu angka $5 tanpa memisahkan tingkat 5 menit dan 1 jam. Halaman model Sonnet 5.5 memisahkan kedua tingkatnya sendiri.

Anthropic juga menyampaikan dua klaim beban kerja: pekerjaan yang sama biasanya memakai lebih sedikit token, dan sebagian besar tugas hingga 30% lebih murah; pembuatan output lebih dari 30% lebih cepat daripada Sonnet 5. Grafik biaya menambahkan perbandingan biaya per tugas di kisaran sepersepuluh, seperlima, seperlima belas, dan sepersembilan. Semua itu hasil di dalam perangkat uji mereka. Tagihan nyata tetap bergantung pada effort, cache hit, putaran tool, dan apakah panggilan memakai batch.

Berikut tiga contoh yang bisa dihitung ulang dari harga katalog. Setiap bentuk permintaan terdiri atas 100.000 token input dari kelas yang disebut, ditambah 5.000 token output.

| Permintaan | Perhitungan | Jumlah |
| --- | --- | --- |
| 100 rb input tanpa cache, 5.000 output | 0,1 × $2 + 0,005 × $10 | $0,25 |
| 100 rb pembacaan cache, 5.000 output | 0,1 × $0,20 + 0,005 × $10 | $0,07 |
| 100 rb penulisan cache 5 menit, 5.000 output | 0,1 × $2,50 + 0,005 × $10 | $0,30 |

Baris ketiga memakai harga penulisan 5 menit, bukan harga 1 jam sebesar $4. Penulisan 1 jam menjadi 0,1 × $4 + 0,005 × $10 = $0,45.

## Cara membaca benchmark di pengumuman

Tabel di bawah adalah tabel yang dicetak di pengumuman saat dicek pada 2 Oktober 2026. Tanda pisah berarti sel kosong di halaman itu sendiri. Grafik biaya Terminal-Bench 4.0 dan CursorBench 4.0 memakai GPT-5.6 Sol karena OpenAI tidak memublikasikan kedua skor itu untuk GPT-6 Sol. Artikel ini tidak mengisi kolom GPT-6 Sol dengan titik GPT-5.6 Sol dari grafik tersebut.

| Benchmark | Sonnet 5.5 | Sonnet 5 | Opus 5.5 | GPT-6 Sol |
| --- | --- | --- | --- | --- |
| Terminal-Bench 4.0 | 70,6% | 10,3% | 66,4% | — |
| FrontierCode v1.1 (Main) | 46,2% (max); 52,1% (xhigh) | 42,4% | 54,4% | 49,3% |
| CursorBench 4.0 | 55,5% | 34,1% | 57,8% | — |
| GDPval-AA v2.1 | 1844 | 1449 | 1846 | 1487 |
| AA-Briefcase v1.1 | 1811 | 1359 | 1822 | 1483 |
| Humanity's Last Exam, dengan tool | 64,5% | 54,9% | 67,7% | — |
| OSWorld 2.1, partial | 80,1% | 57,0% | 81,8% | — |
| Chartography, tanpa tool | 61,6% | 15,6% | 64,4% | 53,6% |

Baris Chartography ini adalah skor tanpa tool. Baris Chartography di pengumuman Opus 5.5 adalah pengukuran dengan tool, dan di sana Opus 5.5 meraih 89,0%. Kedua sel itu bukan berasal dari run yang sama dan tidak bisa disandingkan sebagai satu pengukuran.

Baca catatan kaki bersama skornya. Sel Terminal-Bench 4.0 milik Opus 5.5 memakai xhigh, yang oleh pengumuman disebut sebagai skor tertinggi model itu. Di FrontierCode, Sonnet 5.5 pada max justru berada di bawah xhigh. Penjelasan pengumuman: max lebih sering menjalankan tahap tinjauan kode yang dibagi ke beberapa subagen, dan pada kasus yang diperiksa Cognition, hal itu berujung pada timeout atau suntingan di luar cakupan tugas. Evaluasi ini memberi penalti untuk suntingan di luar cakupan.

Artificial Analysis menjalankan GDPval-AA dan AA-Briefcase pada deployment pra-rilis. Deployment itu memiliki bug yang dapat melemahkan output terstruktur. Pengumuman menyebut bug tersebut kemudian diperbaiki, dan jika ada dampaknya, arahnya adalah membuat skor Sonnet 5.5 lebih rendah dari semestinya. Sel GPT-6 Sol untuk GDPval-AA, AA-Briefcase, dan Chartography membawa catatan kedua: OpenAI pernah memperbaiki bug yang mengganggu pemahaman gambar, dan skor eksternal itu mungkin belum mencerminkan model yang lebih baru.

Grafik biaya di halaman yang sama adalah cara baca yang lain. Effort Medium adalah default di aplikasi Claude. Pada beberapa benchmark, Sonnet 5.5 pada Low atau Medium mengalahkan skor terbaik Sonnet 5 dengan sekitar sepersepuluh biaya per tugas. Effort High adalah default di Claude Platform. Pengumuman menyebut FrontierCode pada High sekitar 10 poin di atas Sonnet 5 pada pengaturan yang sama, dengan sekitar seperlima belas biaya per tugas, dan menyamai skor terbaik GPT-6 Sol dengan sekitar seperlima biayanya. CursorBench pada Low mengalahkan skor terbaik Sonnet 5 dengan kurang dari sepersepuluh biaya. AA-Briefcase pada Medium mengalahkan skor terbaik Sonnet 5 dengan sekitar sepersembilan biaya.

Angka 55,5% dan 1844 yang dicetak adalah titik di tabel. Kalimat tentang biaya berasal dari perangkat uji yang lain. Pengumuman juga menyebut bahwa, dalam pemakaian Anthropic sendiri maupun dalam pengujian eksternal, Opus 5.5 tetap lebih kuat untuk pekerjaan kompleks dan terbuka yang menuntut penilaian berkelanjutan. Kutipan pelanggan adalah testimoni pilihan dan bukan bagian dari tabel. Pengumuman juga menyebut ini Sonnet pertama yang berhasil menamatkan Pokémon Red hanya dari tangkapan layar. Itu narasi produk, bukan baris di tabel.

## Beralih dari Sonnet 5

Halaman pembaruan mencantumkan lima perubahan yang membuat kode yang ditulis untuk Sonnet 5 mengembalikan 400. Permintaan lain tetap berhasil, tetapi bentuk responsnya berubah.

```text
model: claude-sonnet-5-5
max_tokens: 1024
thinking: {"type": "adaptive"}
output_config.effort: medium
# 400: tipe thinking disabled
# 400: tipe thinking enabled dengan budget_tokens
# 400: tipe thinking between_tools pada effort xhigh atau max
# 400: tool_choice any, atau tool_choice tool
# 400: temperature, top_p, atau top_k dengan nilai non-default
# 400, hanya Claude API dan Google Cloud: tipe tool computer_20251124
# 400: tool penasihat yang memakai Opus 4.8, Opus 4.7, atau Sonnet 5 sebagai penasihat
```

Untuk mematikan pemikiran di awal, kirim `between_tools` dan pertahankan effort pada `high` atau lebih rendah. `between_tools` tidak boleh sekaligus membawa `display`, `budget_tokens`, atau `block_binding`. Pertahankan `tool_choice` pada `auto` atau `none`. Agar argumen tool sesuai schema, aktifkan strict tool use atau gunakan output terstruktur, dan tuliskan di prompt kapan suatu tool perlu dipakai.

Penggunaan komputer di Claude API dan Google Cloud beralih ke `computer_toolset_20260801`. Halaman pembaruan menyebut Amazon Bedrock masih menerima `computer_20251124`.

Tool penasihat (advisor tool) menerima Mythos 5.1, Fable 5.1, Mythos 5, Fable 5, Opus 5.5, Opus 5, atau Sonnet 5.5 itu sendiri. Opus 4.8, Opus 4.7, dan Sonnet 5 dapat menjadi penasihat bagi eksekutor Sonnet 5, tetapi tidak bagi eksekutor Sonnet 5.5. Konten dari penasihat dikembalikan dalam bentuk terenkripsi, sehingga klien tidak dapat membaca teksnya.

Ada satu lagi 400 untuk akun yang dibuat pada atau setelah 31 Agustus 2026 pukul 00.00 UTC, di Claude API, Amazon Bedrock, dan Google Cloud. Memutar ulang blok pemikiran Sonnet 5.5 akan gagal jika system prompt, daftar tool, atau pesan sebelumnya berubah setelah blok itu dihasilkan. Jaga percakapan tetap append-only, yaitu hanya ditambah di bagian akhir. Jika instruksi harus berubah, gunakan pesan sistem di tengah percakapan.

Jika effort tidak diisi, API berjalan pada `high`. Kata yang sama tidak menghasilkan jumlah pemikiran yang sama seperti di Sonnet 5. Halaman pembaruan meminta Anda menguji ulang semua tingkat effort, bukan menyalin pengaturan lama. Loop tool yang cakupannya jelas bisa dimulai dari `medium`, lalu naik ke `high` bila tugasnya lebih panjang atau lebih sulit. Percakapan yang peka latensi dimulai dari `medium` atau `low`. Aplikasi Claude dan Claude Code sudah memakai `medium` sebagai default. Default Claude Platform adalah `high`.

Teks progres yang lebih panjang dari satu atau dua kalimat di antara panggilan tool kini kembali di dalam blok pemikiran. Pada nilai display default `omitted`, teks blok-blok itu kosong, sehingga UI menjadi sunyi di antara tool meskipun permintaannya tetap berhasil. Dengan `between_tools`, teks itu kembali sebagai ringkasan di dalam blok pemikiran, dan saat diputar ulang, model melihat catatan lengkapnya.

Blok pemikiran mencatat model yang menghasilkannya. Halaman pembaruan menyebut Sonnet 5.5 dapat membaca blok pemikiran dari Sonnet 5, Opus 4.8, Haiku 4.5, dan model yang lebih lama, tetapi tidak membaca blok dari Opus 5, Opus 5.5, Fable, atau Mythos. Di Claude API dan Google Cloud, Opus 5.5 dapat membaca blok pemikiran Sonnet 5.5, sedangkan model terkini lainnya tidak. Blok yang tidak dapat dibaca model tujuan dibuang sebelum model melihatnya. Permintaannya tetap berhasil, dan blok yang dibuang tidak ditagih.

Permintaan yang ditolak dikembalikan sebagai HTTP 200 dengan `stop_reason` `"refusal"`. Pengumuman menyebut kemampuan keamanan sibernya sudah mendekati Opus 5, sehingga ini Sonnet pertama yang diluncurkan dengan perlindungan siber sekelas itu. Tugas keamanan siber yang berisiko lebih tinggi dialihkan kembali ke Sonnet 5. Perlindungan biologi sama dengan Sonnet 5. Pengembangan perangkat lunak rutin dan sebagian besar pekerjaan ilmu hayati berada di luar dua perlindungan sempit itu. Pengumuman juga menyebut Sonnet 5.5 dapat ditawarkan dengan retensi data nol (zero data retention).

## Hal yang perlu dicek sebelum memindahkan lalu lintas

1. Kunci `claude-sonnet-5-5`. Cek juga nama model pada hasil yang selesai. Saat perlindungan siber dialihkan, model yang menjawab bisa saja Sonnet 5.
2. Putar ulang satu set yang tidak berisi data sensitif pada `low`, `medium`, `high`, `xhigh`, dan `max`. Catat tingkat keberhasilan, latensi, input, pembacaan cache, penulisan cache, output, dan biaya.
3. Letakkan effort di `output_config.effort`. Jangan mengatur kedalaman pemikiran model ini dengan anggaran `budget_tokens` manual.
4. Ubah klien yang mengirim `disabled`, pilihan tool paksa, parameter sampling, atau `computer_20251124` sebelum menaikkan volume. Tool komputer lama di Bedrock adalah pengecualiannya.
5. Jaga agar percakapan yang memutar ulang blok pemikiran tetap append-only.
6. Hitung penolakan HTTP 200 terpisah dari kegagalan transport.
7. Cek jumlah yang ditagih dengan satu prompt pendek dan satu prompt yang seharusnya mengenai cache. Penulisan 5 menit, penulisan 1 jam, dan diskon batch 50% adalah kartu harga yang berbeda.
8. Tetap gunakan `claude-opus-5-5` untuk pekerjaan kompleks dan terbuka yang menuntut penilaian berkelanjutan. Halaman model Sonnet 5 masih menandai `claude-sonnet-5` sebagai tersedia. Untuk tingkatan harga OpenAI, baca [GPT-6.1 Sol](../gpt-6-1-sol-review-pricing/).

Setelah model dipilih, apakah suatu relay menyediakan ID ini, beserta ketersediaan dan harga relay itu yang dipublikasikan, mengacu pada catatan di direktori. Artikel ini tidak membandingkan relay.
