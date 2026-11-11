---
slug: api-relay-reliability-checks
translationKey: api-relay-reliability-checks
locale: id
kind: article
title: Pemeriksaan keandalan relay API
description: "Alur uji penerimaan relay yang dapat diulang: kunci permintaannya lebih dulu, lalu amati waktu hingga byte pertama, penyelesaian stream, kelas kesalahan, dan batas percobaan ulang."
category: Keandalan
tags: [api, streaming, operasional]
authorId: mira-zhou
modelIds: []
benchmarkSlugs: []
relatedSlugs: []
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: http-semantics
    label: RFC 9110, semantik HTTP
    url: https://www.rfc-editor.org/rfc/rfc9110
    checkedAt: '2026-10-02'
    claimScope: official
  - id: server-sent-events
    label: MDN, server-sent events
    url: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
    checkedAt: '2026-10-02'
    claimScope: official
---

> Ini adalah templat operasional yang dapat dipakai ulang, bukan hasil pengukuran Folkbench terhadap relay mana pun. Fakta evaluasi Folkbench hanya berupa snapshot terbit yang memuat run pengujian, waktu, sampel, dan batasan yang dipublikasikan.

## Tujuan

Sebelum memasukkan relay API ke integrasi produksi, pastikan jalur permintaan paling minimal berfungsi, lalu kelompokkan kegagalan ke dalam empat kelas: klien, protokol, hulu, dan layanan. Engineer lain harus dapat mengulangi pengecekan yang sama dengan permintaan yang sama.

## Sebelum memulai

Siapkan sampel permintaan tetap yang tidak berisi data pengguna sungguhan. Catat ID model, isi permintaan, mode streaming, batas waktu, jumlah percobaan ulang, dan waktu pengujian. Simpan kredensial uji hanya di secret manager lokal atau variabel lingkungan sementara; jangan pernah menuliskannya ke log, tangkapan layar, repositori, atau halaman publik.

## Langkah 1: Kunci permintaan dan batas pengamatan

Mulailah dengan permintaan paling minimal, lalu periksa apakah kode status HTTP, header respons, dan isi respons sesuai dengan dokumentasi penyedia. Catat ID permintaan, ID model, kode status, dan durasi total di lembar pengujian. Jangan menempelkan header Authorization lengkap atau respons mentah ke tiket.

Jika endpoint mendukung streaming, jalankan satu permintaan streaming secara terpisah. Catat waktu hingga potongan data (chunk) pertama yang berguna tiba, apakah potongan berikutnya terus berdatangan, apakah event penyelesaian muncul, dan apakah klien menerima hasil yang jelas saat koneksi ditutup. SSE adalah aliran event; parser harus mengikuti batas event, bukan menebak token dari batas paket jaringan.

## Langkah 2: Klasifikasikan kegagalan

Gunakan input tetap untuk memicu setiap kasus berikut:

1. **Kesalahan klien:** model yang tidak valid, parameter yang hilang, atau batas permintaan yang terlampaui harus menghasilkan respons 4xx yang dapat didiagnosis.
2. **Kesalahan autentikasi:** kredensial yang kedaluwarsa atau tidak memiliki izin harus ditolak dengan jelas, tanpa membocorkan kredensial lain atau alamat internal.
3. **Kesalahan hulu:** timeout hulu, pembatasan laju (rate limit), dan gangguan sementara harus dapat dibedakan antara yang boleh dicoba ulang dan yang tidak.
4. **Kegagalan streaming:** koneksi yang terputus, event penyelesaian yang tidak muncul, atau event JSON yang terpotong harus masuk ke jalur kegagalan, bukan dianggap sebagai teks yang sudah lengkap.

Untuk setiap kegagalan, simpan setidaknya kode status, kelas kesalahan, waktu pengamatan di sisi klien, dan ringkasan singkat yang sudah disamarkan. Respons mentah, trace, dan tangkapan layar adalah bukti proses; simpan sesuai alur penyimpanan objek privat proyek, dan jangan masukkan ke artikel publik atau peringkat.

## Langkah 3: Tetapkan batas percobaan ulang

Coba ulang secara otomatis hanya permintaan yang memiliki semantik idempoten yang jelas atau memang aman diulang. Tetapkan anggaran total untuk percobaan ulang, dan kaitkan ID permintaan pertama dengan yang terakhir. Jangan asal mencoba ulang kegagalan autentikasi, parameter yang tidak valid, atau penolakan karena kebijakan konten.

Tabel uji penerimaan yang mudah dibaca dapat berisi:

| Pengecekan | Syarat lulus | Tindakan jika gagal |
| --- | --- | --- |
| Kode status | Sesuai dengan kontrak dalam dokumentasi | Simpan ringkasan yang disamarkan, lalu klasifikasikan |
| Byte pertama | Data yang berguna tiba dalam batas waktu yang disepakati | Periksa jaringan, rute, dan hulu |
| Penyelesaian stream | Event penyelesaian yang valid atau respons lengkap diterima | Tandai sebagai kegagalan koneksi |
| Kelas kesalahan | 4xx, 5xx, dan timeout tetap dapat dibedakan | Jangan pernah menganggap kesalahan sebagai output model |
| Percobaan ulang | Jumlah dan total waktu dapat ditelusuri | Hentikan setelah anggaran habis |

## Kriteria lulus dan pembersihan

Tuliskan kriteria lulus sebelum pengujian, misalnya: “permintaan tetap mengembalikan hasil lengkap dalam tiga percobaan independen, stream memiliki event penyelesaian yang jelas, dan kegagalan autentikasi tidak pernah dicoba ulang.” Jangan mengubah kriteria setelah melihat hasilnya.

Setelah pengujian, cabut kredensial sementara, hapus respons mentah di komputer lokal, dan simpan catatan uji penerimaan yang hanya berisi ringkasan, waktu, dan versi. Untuk memublikasikan hasil ke Folkbench, kaitkan lebih dulu run/attempt yang nyata, manifest bukti, dan snapshot terbit; artikel ini sendiri tidak menggantikan fakta-fakta tersebut.
