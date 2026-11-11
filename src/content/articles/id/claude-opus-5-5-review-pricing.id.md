---
slug: claude-opus-5-5-review-pricing
translationKey: claude-opus-5-5-review-pricing
locale: id
kind: article
title: Spesifikasi, harga katalog, dan benchmark resmi Claude Opus 5.5
description: "Spesifikasi resmi, harga katalog, dan tabel benchmark yang dipublikasikan untuk Claude Opus 5.5, ditambah daftar permintaan yang mengembalikan 400 saat migrasi. Angka-angka ini berasal dari halaman penyedia model, bukan pengukuran Folkbench."
category: Model
tags: [harga, benchmark, api]
authorId: iris-wu
modelIds: [claude-opus-5-5, claude-opus-5, claude-fable-5-1, claude-sonnet-5-5, gpt-6-astra, gpt-5-6-sol]
benchmarkSlugs: []
relatedSlugs: [claude-sonnet-5-5-review-pricing, gpt-6-1-sol-review-pricing]
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: opus-55-announcement
    label: Anthropic, pengumuman Claude Opus 5.5
    url: https://www.anthropic.com/claude-opus-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: opus-55-overview
    label: Claude Platform, halaman model Opus 5.5
    url: https://platform.claude.com/docs/en/models/opus-5-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
  - id: opus-55-whats-new
    label: Claude Platform, yang baru di Opus 5.5
    url: https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-5-overview
    label: Claude Platform, halaman model Sonnet 5
    url: https://platform.claude.com/docs/en/models/sonnet-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
---

> Spesifikasi, harga katalog, dan skor di bawah ini disalin dari Anthropic atau dari halaman publik yang dikutipnya, dan diperiksa pada 2 Oktober 2026. Folkbench tidak menjalankan ulang benchmark ini. Kalimat seperti “sekitar 40% lebih rendah” dan “sekitar seperlima biaya” menggambarkan lingkungan pengujian milik penyedia model sendiri.

Claude Opus 5.5 diumumkan pada 22 September 2026 dan merupakan model pertama dalam keluarga Claude 5.5. ID model di Claude API adalah `claude-opus-5-5`. Halaman model mencantumkan jendela konteks 1 juta token, output maksimum 128 ribu token, pemikiran adaptif yang selalu aktif, effort default `medium`, serta harga katalog $4 per 1 juta token input dan $20 per 1 juta token output. Halaman publik tidak menyebutkan jumlah parameter maupun angka komputasi pelatihan.

Tiga pengecekan dari halaman yang sama sudah cukup untuk menempatkannya. Harga katalognya di bawah Opus 5, dan jauh di bawah Fable 5.1 yang berharga $10 / $50. Pada baris coding dan pekerjaan berbasis pengetahuan yang dicetak di pengumuman, Opus 5.5 unggul atas Fable 5.1 dan Opus 5, serta unggul atas GPT-6 Astra di sebagian besar baris tersebut. Dua baris menunjukkan arah sebaliknya: estimasi titik Astra unggul di Terminal-Bench-Science 0.1 dan AutomationBench milik Zapier. Untuk pekerjaan sehari-hari yang cakupannya jelas, baca [Claude Sonnet 5.5](../claude-sonnet-5-5-review-pricing/). Untuk tingkatan harga konteks panjang dari OpenAI, baca [GPT-6.1 Sol](../gpt-6-1-sol-review-pricing/).

## Spesifikasi yang dipublikasikan

| Item | Claude Opus 5.5 |
| --- | --- |
| ID model Claude API | `claude-opus-5-5` |
| Tanggal pengumuman | 22 September 2026 |
| Jendela konteks | 1 juta token |
| Output maksimum | 128 ribu token |
| Output maksimum API Batch | 300 ribu token, header beta `output-300k-2026-03-24` |
| Input ke output | Teks dan gambar ke teks |
| Pemikiran | Adaptif, selalu aktif |
| Effort default | `medium` |
| Nilai effort | `low`, `medium`, `high`, `xhigh`, `max` |
| Kategori latensi di halaman model | Sedang |
| Batas pengetahuan andal | Juni 2026 |
| Prompt minimum yang dapat di-cache | 512 token |
| Jumlah parameter | Tidak ada di halaman model publik |

Batas pengetahuan andal adalah tanggal hingga saat pengetahuan bawaan model dinyatakan paling kuat. Ini bukan jendela konteks. File yang dilampirkan pada sebuah permintaan tetap berada di dalam konteks permintaan tersebut.

Fast mode adalah sakelar kecepatan pada ID model yang sama. Halaman pembaruan menyebutnya pratinjau riset yang hanya tersedia di Claude API. Permintaan menetapkan `speed: "fast"` dan mengirim header beta `fast-mode-2026-02-01`. Pengumuman menetapkan harganya $8 / $40 per 1 juta token dan menyebut kecepatan output hingga sekitar 2,5×. Pengumuman itu juga menyebut bahwa Claude Code dan Claude Platform dapat menggunakannya. Halaman pembaruan menyatakan bahwa Amazon Bedrock, Claude Platform on AWS, Google Cloud, dan Microsoft Foundry tidak menyediakan fast mode ini.

Anggaran pemikiran yang ditetapkan secara manual akan ditolak. Kedalaman pemikiran dikendalikan lewat effort.

## Harga katalog

Harga dalam dolar AS per 1 juta token. Harga penulisan cache 5 menit, penulisan cache 1 jam, dan batch untuk Opus 5.5 berasal dari halaman pembaruan. Penulisan cache Opus 5 adalah satu sel “cache writes” di tabel perbandingan pengumuman, yang tidak memisahkan tingkat 5 menit dan 1 jam. Harga input dan output untuk Fable 5.1, Sonnet 5.5, dan Haiku 4.5 berasal dari perbandingan di halaman model. Sonnet 5 masih ditandai legacy, dan halaman modelnya mencantumkan harga input dan output yang sama dengan Sonnet 5.5. Tanda pisah berarti artikel ini tidak mengambil sel tersebut dari baris harga sumber primer.

| Per 1 jt token | Opus 5.5 | Opus 5 | Fable 5.1 | Sonnet 5.5 | Haiku 4.5 |
| --- | --- | --- | --- | --- | --- |
| Input | $4 | $5 | $10 | $2 | $1 |
| Output | $20 | $25 | $50 | $10 | $5 |
| Pembacaan cache | $0,20 | $0,50 | — | $0,20 | — |
| Penulisan cache | 5 menit $5; 1 jam $8 | $6,25 | — | 5 menit $2,50; 1 jam $4 | — |
| Input / output batch | $2 / $10 | — | — | 50% dari harga katalog | — |
| Input / output fast mode | $8 / $40 | — | — | — | — |

Harga input baru (tanpa cache) dan output 20% di bawah Opus 5, dari $5 / $25 menjadi $4 / $20. Pengumuman menyebut pembacaan cache turun dari $0,50 menjadi $0,20, dan menyatakan bahwa pembacaan itu merupakan bagian terbesar tagihan untuk pekerjaan agen dan coding. Anthropic juga menyampaikan klaim beban kerja: pada pengaturan default, tugas yang umum menelan biaya sekitar 40% lebih rendah daripada Opus 5 karena model juga memakai lebih sedikit token. Angka 40% itu menggambarkan lingkungan pengujian mereka sendiri. Tagihan nyata tetap bergantung pada effort, cache hit, jumlah putaran alat, dan apakah panggilan memakai batch atau fast mode.

Pemrosesan batch berharga separuh dari harga katalog baru. Fast mode berharga dua kali harga katalog baru, dan halaman pembaruan membatasinya ke Claude API.

Berikut tiga contoh yang bisa dihitung ulang dari harga katalog. Setiap bentuk permintaan terdiri atas 100.000 token input dari kelas yang disebutkan, ditambah 5.000 token output. Baris cache mengasumsikan catatan penggunaan benar-benar menghitung token tersebut sebagai pembacaan.

| Permintaan | Perhitungan | Jumlah |
| --- | --- | --- |
| 100 rb input tanpa cache, 5.000 output | 0,1 × $4 + 0,005 × $20 | $0,50 |
| 100 rb pembacaan cache, 5.000 output | 0,1 × $0,20 + 0,005 × $20 | $0,12 |
| 100 rb penulisan cache 5 menit, 5.000 output | 0,1 × $5 + 0,005 × $20 | $0,60 |

Penulisan cache 1 jam memakai $8, bukan $5 seperti di atas. Harga di relay atau marketplace cloud tidak termasuk dalam tabel ini.

## Apa yang berubah dari Opus 5 dan Fable 5.1

| Perilaku | Opus 5.5 | Opus 5 | Fable 5.1 |
| --- | --- | --- | --- |
| ID API | `claude-opus-5-5` | `claude-opus-5` | `claude-fable-5-1` |
| Konteks / output maksimum | 1 jt / 128 rb | 1 jt / 128 rb | 1 jt / 128 rb |
| Pemikiran | Selalu aktif. `disabled` dan anggaran manual mengembalikan 400 | Aktif secara default. `disabled` diterima pada effort `high` atau lebih rendah | Halaman model menyebut selalu aktif |
| Default bila effort tidak diisi | `medium` | `high` | `high` |
| Batas pengetahuan andal | Juni 2026 | Tidak dikutip terpisah di sini | Juni 2026 |
| Input / output katalog | $4 / $20 | $5 / $25 | $10 / $50 |
| Pembacaan cache | $0,20 | $0,50 | — |

Halaman pembaruan mengelompokkan empat perubahan yang membuat kode yang ditulis untuk Opus 5 gagal. Tiga yang pertama juga berlaku untuk Fable 5.1. Sekadar mengganti string model tetap akan terbentur perubahan ini.

```text
model: claude-opus-5-5
thinking: {"type": "adaptive"}
tool_choice: {"type": "auto"}
output_config.effort: medium
# 400: tipe thinking disabled, atau enabled dengan budget_tokens
# 400: tool_choice any, atau tool_choice tool
# 400, hanya Claude API dan Google Cloud: tipe alat computer_20251124
```

Hilangkan `thinking`, atau kirim `adaptive`; keduanya setara. Nilai `tool_choice` `auto` dan `none` masih berfungsi, termasuk di endpoint penghitungan token. Untuk JSON yang valid sesuai schema, halaman pembaruan merujuk ke penggunaan alat yang ketat (strict tool use) atau output terstruktur, serta menyebutkan di prompt kapan sebuah alat berlaku.

Di Claude API dan Google Cloud, ganti `computer_20251124` dengan `computer_toolset_20260801` dan hapus header beta computer use yang lama. Halaman pembaruan menyatakan bahwa Opus 5.5 di Amazon Bedrock masih menerima `computer_20251124`. Integrasi yang sudah memakai toolset yang lebih baru tidak perlu mengubah kode untuk perubahan ini.

Penyebab 400 yang keempat berkaitan dengan pengikatan blok pemikiran. Untuk akun yang dibuat pada atau setelah 31 Agustus 2026 pukul 00.00 UTC, di Claude API dan di platform cloud, memutar ulang blok pemikiran Opus 5.5 akan mengembalikan 400 jika prompt sistem, daftar alat, atau pesan sebelumnya diubah setelah blok itu dihasilkan. Pendekatan yang didokumentasikan adalah riwayat yang hanya ditambah (append-only). Jika instruksi harus berubah, gunakan pesan sistem di tengah percakapan. Akun yang lebih lama harus memilih secara eksplisit untuk mengaktifkan pemeriksaan yang sama.

Tiga perilaku berubah meski permintaan berhasil. Jika effort tidak diisi, permintaan kini berjalan pada `medium`, sedangkan di Opus 5 kondisi yang sama berjalan pada `high`. Pada effort yang setara, Opus 5.5 cenderung berpikir lebih banyak per giliran daripada Opus 5, terutama pada `xhigh` dan `max`. Nilai effort yang disalin dari konfigurasi lama adalah titik biaya baru, dan `max_tokens` harus menyisakan ruang untuk blok pemikiran.

Teks yang ditulis di antara panggilan alat kini dikembalikan di dalam blok pemikiran. Pada nilai display default `omitted`, blok itu berisi teks kosong. UI yang dulu men-stream teks tersebut sebagai penanda kemajuan menjadi senyap, sementara permintaannya tetap berhasil. Produk yang membutuhkan baris kemajuan itu harus menetapkan nilai display dan memilih blok berdasarkan `type`, bukan berdasarkan posisi.

Pengklasifikasi biologi berjalan bersama pengklasifikasi keamanan siber. Prompt yang mendorong model menyalin penalarannya ke jawaban yang terlihat dapat ditolak sebagai `reasoning_extraction`. Halaman pembaruan juga menyebut bahwa grafik dan tangkapan layar dibaca lebih akurat bahkan sebelum alat visi ditambahkan, sehingga prompt yang ditulis untuk menutupi lemahnya kemampuan membaca gambar layak diuji ulang secara tersendiri.

Permintaan yang ditolak mengembalikan HTTP 200 dengan `stop_reason` `"refusal"`. Itu bukan kegagalan transport. Apakah permintaan itu ditagih bergantung pada kategori penolakannya, dan permintaan itu tetap dihitung dalam batas laju.

## Cara membaca benchmark di pengumuman

Tabel di bawah adalah tabel yang dicetak di pengumuman per pengecekan 2 Oktober 2026. Kecuali catatan kaki menyatakan lain, Opus 5.5 memakai pemikiran adaptif pada effort max. Terminal-Bench 4.0 adalah catatan kaki itu: Opus 5.5 pada `xhigh`, GPT-6 Astra pada `high`, dan setiap sel adalah skor tertinggi yang dipublikasikan untuk model tersebut. Angka Astra dan GPT-5.6 Sol dikutip dari laporan OpenAI. Pengaman produksi dalam keadaan aktif. Saat pengaman itu turun tangan, tugas keamanan siber diselesaikan oleh Opus 4.8, sedangkan tugas biologi dan pengembangan LLM frontier diselesaikan oleh Opus 5. Anthropic menyatakan hal ini menurunkan skor Opus 5.5.

| Benchmark | Opus 5.5 | Fable 5.1 | Opus 5 | GPT-6 Astra | GPT-5.6 Sol |
| --- | --- | --- | --- | --- | --- |
| Terminal-Bench 4.0 | 66,4% | 55,8% | 52,3% | 57,9% | 37,3% |
| FrontierCode v1.1 (Main) | 54,4% | 50,3% | 48,0% | 53,3% | 47,5% |
| CursorBench 4.0 | 57,8% | 51,8% | 46,6% | — | 41,7% |
| GDPval-AA v2.1 | 1846 | 1735 | 1708 | 1542 | 1588 |
| AutomationBench | 40,0% | 31,4% | 26,9% | 41,4% | 28,8% |
| Humanity's Last Exam, dengan alat | 67,7% | 65,6% | 63,6% | 57,2% | — |
| Terminal-Bench-Science 0.1 | 58,7% | 52,6% | 29,0% | 64,6% | 22,4% |
| OSWorld 2.1, partial | 81,8% | 80,7% | 74,0% | — | — |
| Chartography, dengan alat | 89,0% | 88,4% | 83,4% | — | — |

Baca selisihnya bersama galat yang dipublikasikan. Di Terminal-Bench 4.0, galat Opus 5.5 adalah ±2,6 poin, sedangkan model Claude lainnya ±1,6 hingga ±2 poin. Selisih dari 66,4% ke 57,9% milik Astra, dan ke 55,8% milik Fable, lebih lebar daripada galat tersebut. Catatan kaki yang sama menyebut bahwa papan peringkat publik mencantumkan Opus 5 di 51,8%, dan setup mereka mereproduksi 52,3%, masih dalam batas derau.

Galat Terminal-Bench-Science adalah ±3,5 hingga ±5 poin per model. Selisih antara 64,6% milik Astra dan 58,7% milik Opus 5.5 mendekati lebar galat tersebut. Estimasi titik menempatkan Astra di depan. Papan peringkat publik mencantumkan Opus 5 di 30,0%, dan setup mereka mereproduksi 29,0%.

AutomationBench dijalankan oleh Zapier. Karena pengujian itu tidak memiliki model cadangan, setiap intervensi pengaman dihitung sebagai kegagalan. Anthropic menyatakan skor praktisnya akan lebih tinggi. Angka 40,0% yang dicetak berbanding 41,4% milik Astra adalah hasil publikasi yang berdekatan, dan estimasi titik menempatkan Astra di depan. GDPval-AA v2.1 adalah Elo atas tugas profesional nyata di 44 profesi: Opus 5.5 di 1846, Fable 5.1 di 1735, Opus 5 di 1708, Sol di 1588, dan Astra di 1542.

Grafik biaya di halaman yang sama mencetak pasangan skor kedua pada effort default `medium`: FrontierCode 54,6% dan CursorBench 52,5%. Tabel perbandingan mencetak 54,4% dan 57,8%. Perlakukan keduanya sebagai dua angka pada dua pengaturan effort. Catatan grafik juga menyebut bahwa, pada effort medium, FrontierCode melampaui skor tertinggi Astra sebesar 53,3% dengan sekitar seperlima biaya per tugas, dan Terminal-Bench menyamai Astra dengan sekitar 40% biaya. Itu adalah klaim biaya per tugas tentang lingkungan pengujian Anthropic sendiri.

Kalimat di bawah tabel itulah yang patut diingat: dalam penggunaan internal Anthropic, selisih antara Opus 5.5 dan Fable 5.1 lebih sempit daripada yang ditunjukkan skor, dan margin benchmark di level ini kurang dapat diandalkan sebagai pedoman untuk tugas nyata. Kutipan pelanggan di pengumuman adalah testimoni pilihan. Kutipan itu bisa memberi petunjuk tentang apa yang perlu diuji ulang, tetapi bukan bagian dari tabel.

## Pengecekan sebelum memindahkan trafik

1. Tetapkan model secara eksplisit ke `claude-opus-5-5`. Periksa juga nama model pada hasil yang selesai. Saat pengaman turun tangan, tugas keamanan siber dapat diselesaikan oleh Opus 4.8, dan tugas biologi atau pengembangan LLM frontier dapat diselesaikan oleh Opus 5. Model yang diminta di log tetap bisa tertulis `claude-opus-5-5`.
2. Putar ulang satu set yang tidak berisi data sensitif pada `low`, `medium`, `high`, `xhigh`, dan `max`. Catat keberhasilan, waktu nyata (wall time), input, pembacaan cache, penulisan cache, output, dan biaya.
3. Jangan kirim `thinking: {"type": "disabled"}` atau anggaran manual dengan `budget_tokens`. Tetapkan effort secara eksplisit. Jika tidak diisi, effort di sini berjalan pada `medium`, bukan `high` seperti di Opus 5.
4. Gunakan hanya `auto` atau `none` untuk `tool_choice`. Di Claude API dan Google Cloud, computer use beralih ke `computer_toolset_20260801`.
5. Pertahankan percakapan yang memutar ulang blok pemikiran sebagai append-only. Akun yang dibuat pada atau setelah 31 Agustus 2026 menerima 400 jika prefiks sebelum blok pemikiran Opus 5.5 berubah.
6. Hitung penolakan HTTP 200 secara terpisah dari kegagalan transport.
7. Periksa jumlah yang ditagih dengan satu prompt pendek dan satu prompt yang seharusnya mengenai cache. Penulisan 5 menit, penulisan 1 jam, batch, dan fast mode adalah empat daftar harga yang berbeda.
8. Untuk pekerjaan yang cakupannya jelas dan tidak membutuhkan loop Opus ini, tetaplah pada harga $2 / $10 milik [Sonnet 5.5](../claude-sonnet-5-5-review-pricing/). Pada tugas agen ilmiah dan alur kerja bisnis Zapier, estimasi titik yang dicetak menempatkan Astra di depan.

Setelah model dipilih, apakah sebuah relay menyediakan ID ini, beserta ketersediaan dan harga yang dipublikasikan relay tersebut, mengacu pada catatan di direktori. Artikel ini tidak membandingkan relay, dan tidak menjadikan harga katalog penyedia model sebagai harga yang dikenakan oleh suatu relay.
