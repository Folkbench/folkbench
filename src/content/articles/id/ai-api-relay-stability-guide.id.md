---
slug: ai-api-relay-stability-guide
translationKey: ai-api-relay-stability-guide
locale: id
kind: article
title: "Jangan lagi tertipu klaim ketersediaan 99%: jebakan relay API AI yang kami alami dan cara kami menguji stabilitas"
description: "Berangkat dari respons 200 palsu, stream yang terputus, dan macet di malam hari, artikel ini menjelaskan metrik stabilitas dan pengujian yang benar-benar menentukan pengalaman di produksi."
category: Keandalan
tags: [stabilitas, ketersediaan, SSE]
authorId: mira-zhou
modelIds: []
benchmarkSlugs: []
relatedSlugs: [ai-api-relay-software-engineering-evaluation-guide, ai-chinese-writing-models-api-relay-user-submission, llm-api-relay-gray-industry-user-submission]
publishedAt: '2026-09-17'
updatedAt: '2026-09-17'
sources:
  - id: google-sre-golden-signals
    label: Buku Google SRE, bab Monitoring Distributed Systems
    url: https://sre.google/sre-book/monitoring-distributed-systems/
    checkedAt: '2026-10-02'
    claimScope: official
  - id: otel-docs
    label: Dokumentasi OpenTelemetry
    url: https://opentelemetry.io/docs/
    checkedAt: '2026-10-02'
    claimScope: official
  - id: whatwg-sse
    label: Standar HTML, Server-sent events
    url: https://html.spec.whatwg.org/multipage/server-sent-events.html
    checkedAt: '2026-10-02'
    claimScope: official
  - id: wilson-score
    label: Interval skor Wilson
    url: https://en.wikipedia.org/wiki/Binomial_proportion_confidence_interval
    checkedAt: '2026-10-02'
    claimScope: editorial
---

> **Pengantar.** Dalam perjalanan menuju produksi, relay API adalah tahap yang tidak bisa dilewati kebanyakan pengembang. Situsnya mungkin menjanjikan “99,9% cepat dan stabil” dan “kanal khusus berkonkurensi tinggi”. Begitu terhubung, Anda baru sadar kenyataannya jauh lebih rumit daripada slogannya. Inilah catatan bagaimana tim kami beralih dari membeli berdasarkan firasat ke menjalankan pengecekan otomatis, beserta kerangka uji yang kami pakai sebelum membayar atau mengintegrasikan relay.

## 1. Kegagalan yang memaksa kami menyusun metode

Sistem multimetrik di bawah ini tidak lahir dari kecerdikan. Kami membayarnya dengan uang, insiden produksi, dan keluhan pengguna.

### 1. 200 OK palsu dan pemotongan diam-diam

Pengecekan otomatis awal kami sederhana. Sebuah skrip Python mengirim POST ke relay setiap 5 menit. HTTP `200` yang disertai sedikit teks dianggap sehat.

Agen produksi baru berjalan kurang dari dua hari ketika tim dukungan kebanjiran keluhan. Pengguna melaporkan model berhenti di tengah kalimat, dan logika hasilnya terputus-putus.

Isi log lebih parah daripada tiketnya. Beberapa relay tetap mengembalikan `200 OK` saat pool akun hulu habis (rate limit 429 atau kegagalan autentikasi 401), saat gateway kehabisan waktu (504), atau saat sebuah node mogok. Di tengah stream SSE, relay itu diam-diam menyisipkan `data: [DONE]` dan menutup giliran, atau menaruh `{"error": "rate limit exceeded"}` di dalam JSON lalu menyajikannya sebagai jawaban model. Monitor yang hanya melihat kode status benar-benar tertipu oleh 200 palsu itu.

### 2. Macet di malam hari, dan token pertama yang tak kunjung datang

Setelah itu, kami menambahkan probe yang berjalan sepanjang hari. Pada siang hari, rata-rata waktu respons bertahan di sekitar 2 detik dan dasbor tampak baik-baik saja. Pada jam sibuk malam, timeout dan jumlah pengguna yang menyerah terus naik.

Sebagian besar relay itu bukan kanal resmi langsung. Mereka mencampur pool akun AS dan proxy di beberapa region. Begitu jam kerja Amerika Utara atau jam sibuk malam di Tiongkok tiba, lonjakan konkurensi melumpuhkan jalurnya. Pada kasus terburuk, seluruh jawaban tetap selesai dalam sekitar 4 detik, tetapi token pertama (TTFT) butuh 12 detik penuh. Pengguna menatap kotak kosong, lalu pergi.

Dua insiden itu mengubah aturan kami: satu ping, atau dua permintaan iseng, bukanlah pengujian untuk protokol AI atau stream.

## 2. Tiga versi sistem pengujian

### 1.0 Uji buta dan firasat

- **Yang kami lakukan:** mengirim beberapa prompt di antarmuka web, atau menulis skrip sendiri untuk 10 permintaan, lalu menilai kecepatan dan kualitas jawaban dengan mata.
- **Batasan:** sampelnya sangat kecil dan sangat acak. Konkurensi tinggi atau putus koneksi sesekali baru ketahuan di produksi.

### 2.0 Konkurensi dan kode status HTTP

- **Yang kami lakukan:** menjalankan Postman dan Locust dengan konkurensi, lalu memantau sebaran kode status, rata-rata latensi, dan tingkat keberhasilan.
- **Batasan:** cara ini hanya melihat gateway terluar. Stream yang putus, error palsu, dan macet antartoken tidak tertangkap.

### 3.0 Mesin status stream, dipinjam dari bidang lain

Ketika metrik buatan kami sendiri mentok, kami berbincang dengan Zhou Ge, yang bekerja di bidang perdagangan frekuensi tinggi (HFT) dan operasional CDN.

Poinnya lugas: relay API AI bukan endpoint web biasa. Relay adalah perantara jaringan dengan koneksi panjang dan konkurensi tinggi.

Ia membandingkan stream SSE AI, dari sisi topologi dan kepekaan terhadap paket hilang, dengan audio dan video real-time (WebRTC/RTMP) serta feed data pasar. Model titik ukur permintaan web tidak cocok di sini. Analogi yang berguna adalah latensi tick-to-trade di perdagangan frekuensi tinggi dan waktu ke frame pertama di CDN.

Percakapan itu menggantikan monitor lama kami. Kami memasang probe di beberapa region dan memisahkan pembentukan koneksi, TLS handshake, kedatangan token pertama, throughput token, dan parsing paket SSE, lalu menghaluskan deret datanya. Itulah standar otomatis yang kami pakai sekarang.

## 3. Tiga dimensi yang menentukan pengalaman di produksi

```text
                           ┌── TTFT (latensi token pertama) -> berapa lama pengguna menunggu
               ┌── Latensi ┼── TPS (kecepatan output) -> kelancaran efek mesin ketik
               │           └── Latensi P95/P99 -> kasus terburuk dan jam sibuk
               │
Metrik uji ────┼── Keandalan ┬── Parsing berhasil -> buang 200 palsu dan payload tidak valid
               │             └── Retry-to-success -> toleransi gangguan dengan exponential backoff
               │
               └── Kualitas stream ┬── Interupsi stream -> jawaban berhenti di tengah
                                   └── Jitter token -> output tersendat
```

### 1. Latensi: pisahkan menunggu dari menghasilkan

- **TTFT (time to first token):** milidetik dari permintaan HTTP hingga paket SSE pertama. Inilah “frame pertama”, yang langsung menentukan seberapa cemas pengguna saat menunggu. Batas produksi kami adalah TTFT < 1,5 detik.
- **TPS (tokens per second):** kecepatan output setelah token pertama, yaitu jumlah token yang dihasilkan / durasi. TPS yang rendah membuat efek mesin ketik tersendat-sendat.
- **Latensi P95 / P99:** abaikan rata-rata yang menyanjung. Persentil ke-95 dan ke-99 memperlihatkan kondisi jam sibuk, konteks panjang, dan kanal yang padat.

### 2. Keandalan: tembus keberhasilan palsu

- **Parsing berhasil (parse success):** `200` saja tidak cukup. SDK resmi harus bisa mem-parsing payload, JSON harus lengkap, dan error yang disisipkan relay tidak boleh tercampur ke dalam jawaban.
- **Retry-to-success:** simulasikan exponential backoff seperti di produksi, lalu lihat apakah 429 atau 5xx bisa pulih lewat kanal cadangan dalam 3 kali percobaan ulang.

### 3. Kualitas stream: tangkap kegagalan senyap

- **Interupsi stream:** porsi panggilan yang koneksi TCP-nya putus, atau senyap tanpa respons, sebelum penanda `data: [DONE]` yang disepakati.
- **Jitter antartoken:** simpangan baku jeda antara dua paket SSE yang berurutan, dipinjam dari konsep jitter pada transmisi audiovisual. Jitter tinggi berarti jalur backend tidak stabil, atau beberapa lapis buffer proxy telah ditumpuk.

## 4. Referensi yang tidak kami karang sendiri

### 1. Empat sinyal emas Google SRE

Buku Google SRE menyebut empat sinyal emas: latensi, lalu lintas, error, dan saturasi. Probe kami memperlakukan relay sebagai layanan eksternal yang tidak tepercaya, dan peringatan dipasang pada keempat sinyal tersebut.

### 2. OpenTelemetry dan aturan SSE W3C

Untuk stream, kami memakai titik trace koneksi panjang dari OpenTelemetry dan protokol Server-Sent Events W3C. Probe mencatat TCP handshake, negosiasi TLS, header, potongan data pertama, dan sinyal `[DONE]`.

### 3. Interval skor Wilson

Memeringkat relay berdasarkan jumlah keberhasilan / jumlah percobaan itu tidak adil. Relay yang berhasil 10 dari 10 kali (100%) belum tentu lebih tepercaya daripada relay yang berhasil 9.900 dari 10.000 kali (99%).

Kami memakai batas bawah interval skor Wilson:

```text
Score = (p̂ + z²/(2n) - z × √(p̂(1-p̂)/n + z²/(4n²))) / (1 + z²/n)
```

p̂ adalah tingkat keberhasilan yang teramati, n adalah ukuran sampel, dan z adalah kuantil normal untuk tingkat kepercayaan 95%. Sampel kecil, atau jendela uji yang singkat, otomatis mendapat penalti.

## 5. Cara probe dibangun

```text
[Probe regional (AWS US West / GCP Asia Timur / Eropa)]
       │
       ├──> [Lalu lintas terjadwal dan lonjakan] ──> [Proxy API relay] ──> [API hulu / pool akun]
       │                                                    │
       └──< [Parser SSE dan mesin status] <─────────────────┘
               │
               ├──> [TimescaleDB / Prometheus (metrik mikrodetik)]
               └──> [Skor interval kepercayaan dan atribusi otomatis]
```

### 1. Probe di lebih dari satu region

Probe ringan berjalan di AWS US West, GCP Asia Timur (Hong Kong / Tokyo), dan Eropa. Permintaan serentak dari region tersebut membedakan proxy relay yang macet dari fluktuasi layanan OpenAI atau Anthropic.

### 2. Mesin status socket

- `CONNECTING`: catat waktu kirim t0.
- `FIRST_BYTE`: chunk SSE pertama tiba; TTFT = t1 - t0.
- `STREAMING`: jeda antarchunk, TPS, dan jitter.
- `COMPLETED`: payload berakhir dengan benar, `[DONE]` ada, dan JSON valid.

### 3. Atribusi otomatis

- **Gateway tumbang:** `502 Bad Gateway` atau `504 Gateway Timeout` berarti node Nginx atau Envoy milik relay itu sendiri gagal.
- **Pool akun kosong:** `429 Too Many Requests` atau `401 Unauthorized` berarti kontrol konkurensi ke hilir gagal, atau saldo kunci hulu habis.
- **Middleware:** `200 OK` dengan stream yang putus di tengah atau gagal parsing berarti middleware penagihan atau filter prompt milik relay itu sendiri meluap.

## 6. Tiga aturan sebelum Anda memilih relay

1. **Jangan percaya satu kali uji.** Ambil sampel siang dan malam selama setidaknya 3–7 hari. Perhatikan latensi P95 dan tingkat keberhasilan pada jam sibuk malam, pukul 21.00–01.00.
2. **Pengujian harus memakai streaming.** Permintaan non-streaming menyembunyikan keterlambatan token pertama, buffering middleware, dan stream yang mati di tengah jalan.
3. **Harga yang terlalu murah bukan hadiah.** Biasanya itu berarti pool akun bersama, proxy berkualitas rendah, atau model terbuka murah yang disamarkan sebagai Opus atau GPT-4o.
