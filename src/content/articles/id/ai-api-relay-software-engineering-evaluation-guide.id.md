---
slug: ai-api-relay-software-engineering-evaluation-guide
translationKey: ai-api-relay-software-engineering-evaluation-guide
locale: id
kind: article
title: "Cara mengevaluasi relay AI untuk rekayasa perangkat lunak"
description: "Pengecekan untuk pembuatan kode, rantai tool agen, konteks panjang, dan perilaku protokol cache saat relay berada di tengah alur kerja rekayasa perangkat lunak."
category: Rekayasa perangkat lunak
tags: [rekayasa-perangkat-lunak, agen, pembuatan-kode]
authorId: noah-park
modelIds: []
benchmarkSlugs: []
relatedSlugs: [ai-api-relay-stability-guide, ai-chinese-writing-models-api-relay-user-submission, llm-api-relay-gray-industry-user-submission]
publishedAt: '2026-09-17'
updatedAt: '2026-09-17'
sources: []
---

> **Penulis: artikel redaksi**

Jika ditempatkan di peta rekayasa perangkat lunak, relay AI (API gateway / agregator) pada dasarnya adalah proxy lapisan aplikasi (L7) dengan parser mesin status dan penjadwal konteks.

Tuntutannya berubah ketika pelengkapan satu baris di IDE beralih ke agen terminal seperti Claude Code CLI dan OpenAI Codex CLI, serta ke paradigma specification-driven development (pengembangan berbasis spesifikasi). Kesampingkan dulu metrik gateway umum seperti stabilitas jaringan dan uji beban konkurensi tinggi. Untuk pembuatan kode, pertanyaannya adalah apakah proxy merusak sintaksis, memutus mesin status agen, membuang dependensi konteks panjang, atau melucuti protokol optimasi yang dikirim klien coding.

Empat dimensi rekayasa berikut menjawab pertanyaan itu.

## 1. Integritas sintaksis dan escape

Kode yang dihasilkan sangat peka terhadap karakter dan format. Kode bukan prosa biasa. Di dalamnya ada indentasi, baris baru, karakter escape, serta JSON atau XML yang tertanam.

### 1. Escape tanpa kehilangan

- **Mengapa bisa rusak:** sebuah chunk kode SSE berisi `\n`, `\t`, `\"`, regex `\\d`, atau string JSON. Jika relay melakukan unescape atau mengubah encoding saat merakit ulang chunk, karakter UTF-8 multibita bisa terpotong dan klien menerima kode yang tidak bisa di-parse.
- **Cara menguji:** minta kode dengan escape ekstrem: ekspresi reguler yang rumit, kode Python yang menyematkan string JSON bersarang, dan C++ dengan pointer serta makro.
- **Ambang lulus:** tulis stream dari relay ke file lalu parse dengan linter lokal (`eslint`, `flake8`) atau parser AST (Babel atau Tree-sitter). Tingkat keberhasilan parsing AST harus 100%.

### 2. Spasi dan indentasi

- **Mengapa bisa rusak:** Python dan YAML memakai indentasi untuk menandai scope. Perbedaan `\n` dan `\r\n` mengubah diff Git.
- **Cara menguji:** kirim permintaan refaktor untuk logika yang sangat bersarang, misalnya fungsi Python di dalam 8 tingkat loop.
- **Ambang lulus:** spasi dan tab pada output relay harus sama persis dengan output hulu di tingkat byte, 100%. Relay tidak boleh “merapikan” atau memadatkan spasi.

## 2. Pemanggilan tool dan output terstruktur

Agen coding tidak hanya mengeluarkan Markdown. Agen juga memanggil tool seperti `read_file`, `edit_file`, dan `run_terminal_command`.

### 1. Kesetiaan JSON schema

- **Mengapa bisa rusak:** suntingan lokal berupa JSON terstruktur dengan field seperti `path`, `old_str`, dan `new_str`. Jika relay merusak serialisasi itu atau membuang field bersarang, agen gagal mem-parse dan mogok.
- **Cara menguji:** jalankan tugas agen yang menyunting beberapa file sekaligus, misalnya refaktor antarmuka di 5 file TypeScript, lalu tangkap body pemanggilan tool yang diteruskan.
- **Ambang lulus:** objek pemanggilan tool yang diteruskan harus sama dengan API resmi hulu. Tidak boleh ada field yang hilang, perubahan tipe seperti string menjadi number, atau JSON yang terpotong lebih awal.

### 2. Status multi-giliran

- **Mengapa bisa rusak:** bug yang sulit sering butuh 10–30 giliran: baca file, coba sunting, jalankan tes, baca error, sunting lagi. Relay harus meneruskan `tool_use` pada `role: "assistant"` dan `tool_result` pada `role: "user"` untuk seluruh rantai.
- **Cara menguji:** jalankan sesi debug agen sungguhan yang lebih dari 10 giliran.
- **Ambang lulus:** pada giliran ke-N, relay tetap meneruskan setiap ID pemanggilan tool dan node status dari N−1 giliran sebelumnya. Riwayat dan status tidak boleh hilang atau kacau.

## 3. Konteks kode panjang dan prompt caching

Konteks codebase berukuran menengah atau besar sering mencapai 100 ribu–200 ribu token.

### 1. Penerusan cache control

- **Mengapa bisa rusak:** spesifikasi arsitektur dan kode dasar bersama bersifat tetap. Agen menandainya dengan `cache_control` agar layanan model bisa memakai ulang KV cache. Jika relay melucuti tanda itu, suntingan satu baris saja akan memicu prefill ratusan ribu token lagi.
- **Cara menguji:** kirim konteks rekayasa 100 ribu token dengan `cache_control`, berulang kali.
- **Ambang lulus:**
  - Pada permintaan, body yang dikirim ke hulu masih berisi `cache_control`.
  - Pada respons, `usage` mengembalikan `cache_read_input_tokens`.

### 2. Jarum di dalam codebase

- **Mengapa bisa rusak:** demi menghemat biaya, relay mungkin memotong prompt dengan RAG, memampatkannya, atau diam-diam menggantinya dengan model yang lebih kecil, sehingga pandangan model terhadap repositori menyempit.
- **Cara menguji:** dalam repositori 150 ribu token, sembunyikan definisi antarmuka di file A di bagian awal dan pemanggilnya di file B di bagian akhir, isi bagian tengah dengan kode yang tidak berkaitan, lalu tanyakan cara mengubah antarmuka itu.
- **Ambang lulus:** bandingkan suntingan dari relay dengan panggilan langsung ke API resmi. Jika konteks yang dipotong relay melewatkan variabel atau tipe lintas file, konteksnya telah rusak.

## 4. Output lengkap dan perlindungan instruksi

Kegagalan yang paling dihindari: modul 500 baris yang berhenti di baris 300.

### 1. Batas output maksimum

- **Mengapa bisa rusak:** refaktor satu file bisa membutuhkan 4 ribu, 8 ribu, bahkan 16 ribu token kode dalam satu respons. Buffer proxy yang kecil atau timeout yang pendek memotong file di tengah jalan.
- **Cara menguji:** minta satu modul panjang tanpa logika berlebih, misalnya parser dengan ratusan enum dan konversi.
- **Ambang lulus:** relay harus mampu membawa `max_tokens` maksimum model. `finish_reason` terakhir harus `"stop"` atau `"length"`. EOF dini berarti gagal.

### 2. Integritas system prompt

- **Mengapa bisa rusak:** agen coding menaruh aturan ketat di system prompt, seperti mode strict TypeScript atau JSDoc di setiap fungsi. Beberapa relay menyuntikkan prompt global mereka sendiri atau memangkas system prompt.
- **Cara menguji:** kirim system prompt dengan batasan gaya kode yang khas, lalu minta kode.
- **Ambang lulus:** kode mematuhi batasan itu, dan tangkapan paket menunjukkan system prompt tidak berubah satu byte pun.

## Lembar periksa

| Dimensi | Yang diuji | Ambang lulus |
| --- | --- | --- |
| Karakter dan sintaksis | Escape, indentasi, baris baru | Parsing AST / linter lokal berhasil, kecocokan 100% |
| Rantai tool agen | Bentuk pemanggilan tool dan status multi-giliran | Nol error parsing JSON, dan rantai status tool 10+ giliran |
| Konteks dan cache | Penerusan prompt cache dan konteks asli | `cache_control` tidak dilucuti, dan codebase 150 ribu token tetap menjaga dependensi lintas file |
| Pembuatan lengkap | Batas output panjang dan perlindungan system prompt | Lebih dari 8 ribu token kode berkelanjutan, dan system prompt utuh hingga tingkat byte |
