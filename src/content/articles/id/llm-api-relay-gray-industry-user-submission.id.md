---
slug: llm-api-relay-gray-industry-user-submission
translationKey: llm-api-relay-gray-industry-user-submission
locale: id
kind: article
title: "“Hantu bisnis abu-abu” di relay model AI: para pendiri yang hancur karena API seharga 10%"
description: "Kasus-kasus anonim tentang penggantian model diam-diam, jebakan penagihan, pemotongan konteks, dan risiko data di balik relay yang sangat murah."
category: Kiriman pembaca
tags: [kiriman-pembaca, risiko, harga]
authorId: qing-lin
contributor: "@rain落在鱼儿下"
modelIds: []
benchmarkSlugs: []
relatedSlugs: [ai-api-relay-stability-guide, ai-api-relay-software-engineering-evaluation-guide]
publishedAt: '2026-09-17'
updatedAt: '2026-09-17'
sources: []
---

> Kiriman pembaca dari @rain落在鱼儿下. Isi tulisan ini adalah pandangan pribadi penulis.

Di tengah gelombang startup model AI saat ini, hampir setiap tim yang berusaha menghemat sampai ke receh terakhir pernah diam-diam mendengar tentang “relay API”. Di grup Telegram, setiap hari ada yang mengunggah “10% dari harga resmi”, “isi 1.000 dapat bonus 1.000”, dan “konkurensi tinggi, tanpa kontrol risiko”. Siapa yang tidak tergoda?

Namun, mana ada durian runtuh di dunia ini? Dalam rantai abu-abu yang bergerak diam-diam di bawah ekosistem model AI, banyak tim mengira mereka sudah menemukan jalan pintas untuk menyalip lawan, padahal yang mereka injak adalah lubang yang sudah disiapkan dengan rapi.

## 1. Sore yang cerah dan penukaran diam-diam

Sore itu cerah di sebuah maker space di Nanshan, Shenzhen. Zhang Chi (nama samaran) memegang segelas es Americano sambil menatap layar dan menyusun rencana besar. Jika timnya menjuarai kompetisi maker se-Tiongkok Selatan, mereka akan mendapat subsidi tunai 500 ribu dan pembebasan pajak penuh selama tiga tahun di kawasan itu. Cukup, pikirnya, bagi tim kecil beranggotakan lima orang untuk bertahan melewati tahap prototipe yang paling berat.

Agar demo produknya lebih cepat dan lebih murah, Zhang Chi memutuskan memakai sebuah relay yang sedang ramai dibicarakan di kalangannya. Produk mereka adalah **meja kerja kolaboratif eksplorasi data berbasis AI (AI Data Workbench)** untuk analis data perusahaan, dengan andalan pemahaman data multimodal dan reasoning adaptif atas logika bisnis yang rumit. Logikanya solid, tinggal menunggu bersinar di ajang kompetisi.

“Awalnya memang enak sekali dipakai, sampai menjelang kompetisi kami mencoba membuat dasbor lintas departemen dan laporan atribusi secara otomatis penuh,” kata Zhang Chi sambil tersenyum getir. Tanpa tanda apa pun, sistem tiba-tiba melempar kesalahan parsing format yang fatal. Selama tiga hari penuh, dua engineer backend inti bekerja sampai mata merah: memeriksa prompt, mencari kebocoran memori, dan menyusun ulang struktur data berkali-kali. Biaya jam kerjanya saja sudah lebih dari 10 ribu yuan.

Pada malam ketiga, Zhang Chi tidak tahan lagi. Ia melewati konsol relay, memasang alat penangkap paket, lalu membandingkan header respons HTTP byte demi byte.

Begitu datanya terbongkar, kantor mendadak sunyi, hanya tersisa dengung kipas komputer. Kecepatan token yang dikembalikan dan pola jitter stream semuanya menunjuk ke model open source lain yang lebih murah. “Benar-benar keterlaluan!” Zhang Chi menggebrak meja. Router relay itu sederhana sekaligus licik: begitu prompt sedikit lebih panjang, permintaan dialihkan tanpa pemberitahuan ke model murahan. Daya komputasi yang mereka hemat dari uang makan ternyata habis untuk membayar “uang sekolah” ke jebakan downgrade milik calo akun.

## 2. Sulap akuntansi di tagihan

Jika penggantian model adalah panah dari tempat gelap, maka rasio tagihan adalah penipuan yang terang-terangan di atas sempoa.

Seorang arsitek senior, yang di industri biasa dipanggil Zhou Ge, hanya bisa menggeleng saat membicarakan pola ini. Menurutnya, calo akun zaman sekarang sudah bukan lagi orang-orang yang sekadar menjual akun. Mereka sangat cerdik dan membawa serta cara hitung aktuaria derivatif keuangan.

Di sebuah kota tingkat dua di selatan, tidak jauh dari Shenzhen, pengembang independen Lin Feng (nama samaran) jatuh tersungkur karena hal ini. Ia mengelola **meja kerja AI untuk pembuatan konten pemasaran secara menyeluruh**. Pengeluaran API-nya beberapa ratus dolar sebulan, dan itu terasa sangat berat. Ketika melihat sebuah relay menggelar promo “isi 1.000 dapat bonus 1.000”, ia langsung tergiur dan saat itu juga mentransfer 2.000 yuan.

Baru lima hari kemudian, sistem tiba-tiba memberi peringatan: kuotanya habis. Lin Feng kebingungan, lalu menarik log panggilan selama 120 jam terakhir dan menghitungnya ulang baris demi baris. Barulah triknya terlihat:

- **Rasio diubah diam-diam.** Rasio tagihan untuk model kelas atas seperti `Claude 5 Fable` disetel menjadi 2,8× tanpa sepengetahuan pengguna.
- **Token yang digelembungkan.** Tokenizer diubah sehingga satu paragraf berbahasa Tionghoa yang semestinya 100 token dipotong menjadi 150 fragmen untuk ditagih.

Di atas kertas tertulis diskon 50%. Kenyataannya, biaya satu panggilan hampir 30% lebih mahal daripada langsung memakai API resmi. “Anda kira dapat untung, padahal di belakang layar mereka cukup mengetik beberapa tombol, dan saldo Anda tersedot habis tanpa suara,” kata Zhou Ge.

## 3. Ingatan yang terputus dan tragedi pukul 09.01 hari Senin

Begitu masuk ke lingkungan produksi, daya rusak “harga murah” ini berlipat ganda secara eksponensial.

Setengah tahun kemudian, di babak final sebuah kompetisi startup di Shenzhen, lampu sorot menyinari tengah panggung. Tim rintisan lain sedang memperagakan **meja kerja otomatisasi pengembangan multi-agen (Multi-Agent Workspace)** mereka. Tiga putaran pertama, yang memecah kebutuhan kompleks, berjalan nyaris sempurna. Namun, pada putaran keenam, saat juri bertanya mendalam tentang desain arsitektur, agen itu tiba-tiba menjawab dengan sangat mekanis: “Maaf, dokumen yang Anda unggah tampaknya tidak memuat data tersebut.”

Ruangan langsung riuh, dan para juri mengernyitkan dahi. Setelah semalaman menangkap paket, tim itu akhirnya menemukan dua penyebab:

1. **Konteks dipotong paksa.** Untuk menghemat bandwidth gateway, relay memasang “jendela geser”. Begitu konteks melewati 16 ribu token, bagian paling awal langsung dipotong, sehingga agen berubah menjadi “penderita amnesia”.
2. **Penghematan cache ditahan sendiri.** Di belakang layar, relay menyalakan prompt caching dan menikmati diskon cache resmi yang disebut mencapai 50%–90%, tetapi tetap menagih pengembang dengan harga penuh. Untung dari dua arah.

Hampir pada jam yang sama, sebuah **mesin otomatisasi alur kerja AI Sales Copilot** tingkat perusahaan di kota tingkat dua tadi juga dilanda “bencana 429” pada jam sibuk Senin pagi, pukul 09.01.

Relay itu sama sekali tidak memiliki kunci resmi. Seluruh pool-nya berisi kredensial sesi web curian yang didapat lewat rekayasa balik. Pagi itu, OpenAI menerapkan generasi baru kontrol antibot, dan seluruh pool langsung tumbang. Sistem alur penjualan perusahaan itu lumpuh selama dua jam penuh. Puluhan tenaga penjualan hanya bisa menatap halaman galat, dan potensi kerugian bisnisnya tidak bisa diperkirakan.

## 4. Saat data berakhir di forum dark web

Permainan berbahaya demi “menghemat uang” ini sering berakhir sebagai tragedi yang terasa seperti lelucon gelap.

Seiring kontrol risiko resmi makin ketat, sejumlah relay mulai merugi karena pasokan akun terputus. Seorang pengelola relay meninggalkan satu kalimat ringan di grup Telegram, “kontrolnya terlalu ketat, sampai jumpa, kawan-kawan”, lalu mencabut server, menghapus basis data, dan kabur. Saldo yang belum terpakai di akun para pengguna lenyap seketika.

Namun, itu belum yang paling menyakitkan.

Dua minggu kemudian, sebuah arsip basis data berukuran 50 GB diam-diam dipajang di sebuah forum dark web. Banyak panel relay open source dipasang begitu saja di VPS murahan tanpa perlindungan keamanan apa pun. Setelah pengelolanya kabur, celahnya segera dipindai peretas dan basis datanya disedot. Kode internal perusahaan, prompt berisi logika bisnis, konfigurasi alur multi-agen, bahkan data bisnis yang belum dianonimkan secara mendalam, yang dulu dikirim demi menghemat biaya, kini terpampang telanjang di sudut dark web.

Dalam sebuah forum diskusi teknologi, Zhou Ge pernah merangkumnya dalam satu rumus:

> **Biaya nyata API model AI = biaya token di atas kertas + biaya percobaan ulang akibat downgrade + waktu untuk memadamkan kebakaran operasional + risiko kebocoran data.**

Memang tidak ada makan siang gratis. “Harga murah” apa pun yang jauh di bawah batas bawah pasar pada dasarnya hanya mengubah tagihan yang terlihat menjadi mimpi buruk operasional dan bom keamanan yang tidak bisa diperkirakan tim sebelumnya. Bagi siapa pun yang ingin membangun perusahaan untuk jangka panjang, menjauhi relay abu-abu bukan sekadar soal menghemat sedikit uang. Ini soal tidak menyerahkan kartu truf Anda sendiri kepada orang lain dalam perjalanan menuju masa depan.
