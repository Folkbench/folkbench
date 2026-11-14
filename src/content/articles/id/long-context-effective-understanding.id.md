---
slug: long-context-effective-understanding
translationKey: long-context-effective-understanding
locale: "id"
kind: article
title: "Seberapa panjang konteks yang berguna? Dari pencarian ke penalaran lintas dokumen"
description: "Lost in the Middle, RULER, dan LongBench v2 membedakan kapasitas serta pemahaman menurut panjang, posisi bukti, tugas, dan biaya."
category: "Metode evaluasi"
tags: [konteks, penalaran, benchmark]
authorId: iris-wu
modelIds: []
benchmarkSlugs: []
relatedSlugs: [llm-benchmark-rankings-contamination, mathematical-reasoning-robustness]
publishedAt: '2026-11-14'
updatedAt: '2026-11-14'
sources:
  - id: lost-middle
    label: Liu dkk., Lost in the Middle，2023
    url: https://arxiv.org/abs/2307.03172v3
    checkedAt: '2026-11-14'
    claimScope: official
  - id: ruler
    label: Hsieh dkk., RULER，2024
    url: https://arxiv.org/abs/2404.06654v3
    checkedAt: '2026-11-14'
    claimScope: official
  - id: longbench-v2
    label: Bai dkk., LongBench v2，revisi 2025
    url: https://arxiv.org/abs/2412.15204v2
    checkedAt: '2026-11-14'
    claimScope: official
  - id: error-bars
    label: Miller, Adding Error Bars to Evals，2024
    url: https://arxiv.org/abs/2411.00640v1
    checkedAt: '2026-11-14'
    claimScope: official
  - id: helm
    label: Liang dkk., Holistic Evaluation of Language Models
    url: https://arxiv.org/abs/2211.09110v2
    checkedAt: '2026-11-14'
    claimScope: official
---

Jendela konteks panjang pertama-tama menjawab apakah permintaan muat. Yang sering dibutuhkan adalah menemukan informasi, menyelesaikan konflik, dan menghubungkan bukti berjauhan. Menerima lebih banyak token tidak menjamin pekerjaan itu berhasil.

Artikel ini mengusulkan evaluasi berdasarkan sumber yang diperiksa pada 2026-11-14. Folkbench tidak memanggil model atau mengukur panjang efektif layanan. Rancangan, ambang, dan contoh berikut adalah usulan editorial.

## Kapasitas, pengambilan informasi, dan pemahaman

Kapasitas adalah anggaran masukan serta keluaran yang diizinkan. Pengambilan informasi menemukan fakta; integrasi membandingkan, menelusuri, menggabungkan, atau menyimpulkan dari beberapa fakta. Ketiganya berkaitan tetapi tidak setara.

Menemukan nomor pesanan yang tertulis langsung menunjukkan pengambilan informasi berhasil. Menentukan tagihan akhir dari pesanan awal, perubahan, dan pengembalian dana juga membutuhkan kronologi, aturan, serta hubungan. Semua berkas bisa muat sementara hanya sebagian memengaruhi jawaban.

Bedakan jawaban yang tidak ada dalam materi dari jawaban yang gagal ditemukan. Mengenali bukti tidak cukup mencegah pengisian fakta hilang dengan pengetahuan umum yang tampak masuk akal.

## Tiga sudut pandang yang saling melengkapi

[Lost in the Middle](https://arxiv.org/abs/2307.03172v3) mengkaji posisi informasi dalam tanya jawab banyak dokumen serta pencarian kunci-nilai. Bukti hanya di awal atau akhir mungkin tidak mewakili keseluruhan masukan. Ini temuan historis pada model tertentu, bukan bukti bahwa semua model baru bermasalah sama.

[RULER](https://arxiv.org/abs/2404.06654v3) menambahkan penelusuran bertahap dan agregasi dengan panjang serta kompleksitas terkendali. Ia membantu diagnosis, tetapi tugas sintetis tidak mencakup semua pekerjaan dokumen nyata.

[LongBench v2](https://arxiv.org/abs/2412.15204v2) memuat 503 soal pilihan ganda dalam enam kategori: satu dokumen, banyak dokumen, pembelajaran dalam konteks panjang, riwayat percakapan, repositori kode, dan data terstruktur. Rentang yang dilaporkan adalah 8k sampai 2M **kata**, bukan token. Pilihan ganda memudahkan penilaian, tetapi tidak sama dengan membuat laporan lengkap yang dapat digunakan.

Ketiga studi memberi rancangan yang saling melengkapi, bukan alasan menggabungkan skor dari tahun dan protokol berbeda menjadi peringkat baru.

## Matriks panjang, posisi, dan tugas

Pilih pekerjaan terlebih dahulu, lalu rentang panjang. Tiap rentang mencakup bukti di awal, tengah, akhir, dan tersebar. Pemindahan harus menjaga makna serta rujukan tanpa mengaburkan urutan waktu.

| Tugas | Pengamatan | Variabel kendali |
| --- | --- | --- |
| Satu fakta | Menemukan yang benar | Posisi, pengalih serupa |
| Beberapa fakta | Menemukan semuanya | Jumlah sasaran, duplikasi |
| Penelusuran bertahap | Menghubungkan relasi dengan benar | Tahap, jarak |
| Agregasi | Statistik lengkap | Skala, aturan hitung dan deduplikasi |
| Penilaian lintas dokumen | Bukti dan versi benar | Konflik, waktu, prioritas sumber |
| Bukti tidak tersedia | Mengakui tidak dapat ditentukan | Kesulitan setara dengan soal yang dapat dijawab |

Saat memperpanjang masukan, pertahankan tugas inti dan tambahkan materi terkendali untuk mengamati gangguan. Dokumen panjang alami juga dapat memiliki lebih banyak fakta terkait. Sertakan tugas nyata terpisah, jangan menyamakan tambahan pengisi dengan seluruh kemampuan memahami konteks.

## Materi sama lebih adil daripada label token sama

Tokenizer memecah dokumen yang sama secara berbeda. Utamakan materi identik dan laporkan kata atau karakter beserta token tiap model. Eksperimen lain dapat mengendalikan token untuk mencari batas kapasitas, dengan penjelasan bahwa masukan tidak lagi identik.

Sisakan ruang untuk instruksi sistem dan keluaran. Catat format, pemrosesan tabel dan gambar, pemotongan serta lokasinya. Masukan melebihi kapasitas harus ditandai tidak didukung atau diperlakukan sesuai aturan kegagalan. Menghapus teks diam-diam bukan menguji dokumen penuh.

Jika hanya subset yang diterima semua model yang dibandingkan, laporkan jumlah serta jenis pengecualian. Penghapusan soal sulit dapat menguntungkan jendela pendek secara semu.

## Pisahkan konteks langsung dan sistem dengan pencarian

Sistem dengan pencarian memilih potongan sebelum model, sedangkan konteks panjang langsung memberi materi lebih lengkap. Keduanya berguna tetapi merupakan objek berbeda. Pemotongan, indeks, peringkat pencarian, dan jumlah potongan memengaruhi hasil.

Laporkan keberhasilan ujung ke ujung dan cakupan bukti pada tahap pencarian. Jika fakta benar tidak pernah mencapai model, kegagalan bukan sepenuhnya penalaran. Jika bukti lengkap, analisis integrasi dan pembentukan jawaban.

Kondisi diagnostik dengan potongan relevan yang diverifikasi manusia dapat menunjukkan hambatan pencarian. Itu bukan kinerja produksi normal dan tidak boleh dicampur dengan skor alur lengkap pesaing. Tujuannya menjelaskan perbedaan, bukan menaikkan skor utama.

## Panjang efektif bergantung pada tugas dan ambang

Ini bukan sifat fisik yang tetap. Model dapat menemukan satu fakta dalam masukan sangat panjang tetapi gagal menyelesaikan klausul bertentangan pada materi pendek. Kebutuhan akurasi juga berbeda menurut penggunaan.

Tetapkan ambang mutu sebelumnya, lalu tampilkan hasil dan ketidakpastian per rentang. Jika mengumumkan satu batas, jelaskan tugas, anggaran, dan ambang, serta periksa rentang lebih pendek. Rentang terpanjang yang telah lolos tidak membuktikan semua masukan lebih panjang pasti gagal.

Soal dari dokumen sama berbagi struktur. Tangani ketergantungan pada tingkat dokumen atau kelompok. Mengikuti [analisis galat evaluasi](https://arxiv.org/abs/2411.00640v1), selisih berpasangan dan interval 95% lebih informatif daripada satu rata-rata. Tandai sampel kecil, bukan membuat kurva halus yang menyiratkan kepastian.

## Laporkan kegagalan dan biaya

Kegagalan yang terlihat mencakup masukan tidak lengkap, bukti terlewat, fakta serupa tertukar, versi usang, hubungan antarpotongan salah, dan jawaban karangan ketika bukti tidak ada. Mencatat salah saja kehilangan diagnosis. Kategori ini menggambarkan perilaku, bukan mekanisme internal yang terbukti.

Pendekatan banyak metrik [HELM](https://arxiv.org/abs/2211.09110v2) juga berlaku. Catat akurasi, waktu pemrosesan dan jawaban lengkap, total biaya, percobaan ulang, serta cache. Bedakan cache dingin dan hangat. Jendela lebih besar yang sangat meningkatkan biaya tidak cocok untuk setiap pekerjaan.

Hasil harus memetakan batas kemampuan: tugas dan panjang yang stabil, posisi rawan terlewat, biaya, serta respons pada bukti tidak cukup. Ini membantu penataan masukan dan pemilihan pengaturan, bukan sekadar membandingkan angka promosi terbesar. Persyaratan umum ada pada [keandalan peringkat model](/id/blog/llm-benchmark-rankings-contamination/).
