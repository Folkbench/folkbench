---
slug: ai-chinese-writing-models-api-relay-user-submission
translationKey: ai-chinese-writing-models-api-relay-user-submission
locale: id
kind: article
title: "Dari gaya terjemahan ke rasa bahasa ibu: tiga tahun menulis bahasa Tionghoa dengan AI dan relay API"
description: "Catatan tiga tahun seorang penulis berbahasa Tionghoa dalam memakai model AI, serta pengalamannya membawa model-model itu ke alur menulis sehari-hari melalui relay API."
category: Kiriman pembaca
tags: [kiriman-pembaca, menulis-bahasa-tionghoa, model]
authorId: qing-lin
contributor: "@延毕信，行必吃果"
modelIds: []
benchmarkSlugs: []
relatedSlugs: [ai-api-relay-stability-guide, ai-api-relay-software-engineering-evaluation-guide]
publishedAt: '2026-09-17'
updatedAt: '2026-09-17'
sources: []
---

> **Kiriman pembaca dari @延毕信，行必吃果. Isi tulisan ini adalah pandangan kontributor sendiri.**

Jika kode adalah model yang cermat tentang dunia objektif, menulis dalam bahasa Tionghoa adalah ilmu tentang napas dan kehangatan.

Saya duduk di sebuah apartemen di pesisir timur Amerika Serikat, larut malam. Sesekali terdengar kendaraan lewat di luar. Aksara mengalir di layar. Kadang saya terlempar kembali ke masa kuliah S1 di Fudan, ketika saya mengasah prosa dan catatan bacaan kata demi kata di sebuah kafe kecil di kampus Handan Road. Lalu saya menyeberangi samudra untuk kuliah pascasarjana dan dilatih oleh bahasa Inggris akademik: thesis statement, topic sentence, rantai logika yang rapat dan sedikit dingin.

Kehidupan ganda itu membuat saya peka terhadap kalimat. Tulisan bahasa Inggris menuntut kejelasan dan ketepatan, dengan rantai logika terpampang di atas meja. Tulisan bahasa Tionghoa, terutama esai liris dan nonfiksi, hidup dari irama dan dari hal-hal yang tidak diucapkan.

Sejak musim semi 2023, ketika semua orang memakai ChatGPT untuk menulis laporan ringkasan, hingga akhir musim gugur 2026, saya sudah bekerja dengan AI selama tiga tahun penuh. Model-model itu bergerak dari gaya terjemahan yang kental, penuh “pertama, kedua, kesimpulannya”, menjadi sesuatu yang mampu menangkap baris puitis.

Saya tidak akan menerbitkan tabel skor. Inilah percikan yang dimunculkan berbagai model dalam tulisan saya yang sesungguhnya pada 2026, dan bagaimana rasanya memasukkan model-model itu ke alur menulis sehari-hari melalui relay API.

## 1. Tiga tahun rasa bahasa Tionghoa, dari gaya terjemahan ke suara bahasa ibu

Siapa pun yang mulai di era GPT-3.5 pasti tahu betapa menyiksanya “bahasa Tionghoa ala AI”.

Di Fudan, saya pernah meminta GPT-3.5 memoles esai pendek tentang sastra Shanghai tahun 1990-an. Ia memaksa tulisan itu masuk ke templat esai bahasa Inggris, memotong adegan yang halus menjadi argumen tiga bagian yang kaku, dan memenuhinya dengan frasa klise. Rasanya seperti bahasa Tionghoa yang diterjemahkan lewat tata bahasa Inggris yang kaku, dengan suasana bahasanya dibuang.

Pada 2026, dengan GPT-6 dan Claude Fable, tembok itu sering kali runtuh. Model-model itu tidak lagi seperti penerjemah, melainkan seperti seseorang di seberang meja yang berdebat soal pilihan kata.

## 2. Benturan dari tulisan sungguhan

Saya jarang membuat soal ujian. Saya melempar prompt yang sama ke berbagai model sambil menulis, lalu menyimpan kalimat yang paling mengena.

### 1. Claude Fable, dan perasaan yang sulit diucapkan

Seorang teman di jurusan sastra Tionghoa dulu bilang, dalam prosa terbaik, kata kerjalah yang menentukan seluruh tulisan. Cara Fable membaca pergerakan emosi kadang terasa nyaris terlalu dekat. Ia sudah membuang kebiasaan AI memberi nomor 1, 2, 3.

Saya ingin satu kalimat tentang perbedaan hujan deras di Amerika Utara dan hujan plum (meiyu) di Jiangnan. Saya mengirim prompt seadanya: tuliskan satu kalimat yang penuh suasana, bandingkan hujan yang menghantam rumah di Amerika Utara dengan hujan plum Jiangnan yang tenang dan meresap.

- **GPT-6:** “北美的暴雨如倾盆而下，强烈地冲击着美式木屋的屋顶，展现出一种粗犷的气势；与此形成鲜明对比的是，江南的梅雨则是细密而绵长地洒落在小巷中，体现出一种含蓄的南方美感。” Jika dialihkan ke bahasa Indonesia, kalimat itu berbentuk kontras ala buku pelajaran: hujan tercurah deras, menghantam atap dengan kuat, menampilkan kekuatan yang kasar; hujan Jiangnan, sebagai kontras yang mencolok, turun halus dan panjang di gang sempit dan mewujudkan keindahan selatan yang tertahan.
- **Claude Fable:** “北美的雨是砸在美式木质窗框上的沉响，闷而空洞；江南的雨则是落入青砖缝隙里，连绵地往骨头深处渗。” Hujan Amerika Utara adalah hantaman yang berat dan hampa pada bingkai jendela kayu. Hujan Jiangnan jatuh ke celah bata kelabu dan terus merembes hingga ke tulang.

GPT-6 masih memakai kosakata esai eksposisi. Kata kerja Fable punya bunyi dan sentuhan. Saat saya ingin menulis prosa, nonfiksi, atau adegan batin yang halus, Fable adalah pilihan pertama.

### 2. GPT-6, dan struktur yang besar serta ketat

Fable kuat di tulisan liris dan lemah saat tulisannya memanjang: ia mulai buyar. Ketika pekerjaan membutuhkan kerangka yang kokoh dan simpanan referensi yang besar, GPT-6 tampil.

Saya pernah punya tumpukan catatan berantakan untuk esai panjang berbahasa Tionghoa tentang teori seni: Foucault tentang wacana kekuasaan, pasangan “rasa dan hiasan” (qing dan cai) dalam *Wenxin Diaolong* karya Liu Xie, dan potongan catatan tentang budaya meme internet. Saya meminta satu paragraf pembuka esai akademik yang mendalam.

- **Fable** membuka dengan nada liris, kira-kira tentang tatapan Foucault yang menembus kabut sejarah dan Liu Xie yang menghela napas seribu tahun sebelumnya. Indah, tetapi ketiga gagasan itu hanya ditempel begitu saja. Tulisan itu tidak bisa dikirim sebagai pembuka esai akademik.
- **GPT-6** menulis: “话语权力的生产机制不仅存在于现代制度的微观缝隙中（福柯语），同样折射于古典修辞学对‘情’与‘采’的辩证建构。当我们将这一视域延伸至当代的互联网梗文化时，会发现……” Produksi kekuasaan wacana bersemayam di celah-celah kecil institusi modern, meminjam istilah Foucault, dan juga terpantul dalam pasangan klasik rasa dan hiasan. Perluas cara pandang itu ke budaya meme masa kini, dan Anda akan menemukan…

GPT-6 menulis seperti profesor senior: kerangka yang kokoh, kalimat yang rapi, kiasan yang saling mengunci. Kurang liar, tetapi jauh lebih stabil untuk kerangka tulisan, ulasan teoretis, atau tulisan penjelas yang padat.

### 3. Model buatan Tiongkok, dan garis sosial yang tak terucap

Ada satu hal yang masih luput dari model-model Silicon Valley: subteks dalam bahasa Tionghoa, dan tata krama yang menyertainya.

Saya ingin menulis dialog di sebuah gang kota kecil di selatan. Seorang tetangga memuji anak sebelah, padahal sebenarnya sedang memamerkan bahwa anaknya sendiri mendapat nilai lebih tinggi.

- **GPT-6 dan Fable:** “张阿姨说：‘你的儿子真的很棒，考试得了高分，我真为你感到高兴。不过我的孩子这次也运气不错，拿到了第一名呢。’” Tante Zhang bilang anak laki-laki itu hebat, nilai ujiannya tinggi, ia sungguh ikut senang, dan anaknya sendiri kebetulan beruntung meraih juara pertama. Bunyinya seperti naskah terjemahan.
- **DeepSeek / Zhipu:** “张阿姨把择好的菜往盆里一扔，笑眯眯地说：‘哟，你家小明这次又考前三啦？真是不容易！不像我们家那个，天天就知道死读书，这次瞎猫打死耗子考了个第一，我都说他没啥好高兴的……’” Ia melempar sayuran yang sudah dipetiki ke dalam baskom dan tersenyum: Xiao Ming masuk tiga besar lagi, pasti berat sekali perjuangannya; tidak seperti anaknya sendiri, yang cuma tahu belajar mati-matian, dapat juara pertama karena kebetulan, dan tidak ada yang perlu dibanggakan…

Lirikan mata, maksud yang tak diucapkan, dan idiom setempat adalah wilayah tempat model buatan Tiongkok yang disetel untuk pasar lokal tampil sangat tepat.

## 3. Dari tab web ke relay: cara saya membangun alur menulis

Saat kuliah pascasarjana di Amerika Serikat, saya membayar langganan resmi agar bisa memakai beberapa model. Temuan yang menyakitkan: antarmuka web resmi dibuat untuk mengobrol, bukan untuk menulis.

Kursor yang melompat-lompat seperti mesin ketik memutus alur pikiran. Model-modelnya juga tinggal di tab yang berbeda. Saya butuh GPT-6 untuk kerangka dan Claude Fable untuk prosanya. Berpindah-pindah tab menghabiskan flow state yang susah payah terbangun.

Itulah sebabnya saya mulai memakai relay API. Dua catatan dari sisi penulis:

### 1. Intinya editor lokal, bukan diskon

Orang membicarakan relay dalam hitungan sepersepuluh sen. Untuk menulis, nilainya adalah satu kunci bisa menjangkau model-model yang saya inginkan di dalam editor Markdown lokal yang sudah saya pakai, seperti Obsidian.

Saya tidak membuka browser. Saya memilih satu paragraf dan memakai pintasan:

- `Cmd+1` memanggil GPT-6 melalui relay dan menyusun kerangka serta alur argumen di bawah paragraf.
- Setelah draf pertama selesai, `Cmd+2` pada bagian liris memanggil Claude Fable di tempat untuk menghilangkan rasa AI.
- `Cmd+3` menggantinya dengan model buatan Tiongkok saat dialog perlu terdengar lokal.

Satu kunci API dari relay adalah palet warna bagi editor saya.

### 2. Kegagalan relay yang khas untuk menulis

Kode dan prosa tidak dirugikan oleh bug relay yang sama.

- **Kompresi konteks tersembunyi.** Beberapa relay diam-diam memangkas konteks yang Anda kirim. Tugas coding mungkin masih selamat. Prosa bahasa Tionghoa tidak. Nadanya ada di kalimat-kalimat sebelumnya. Begitu kalimat itu dipotong, Fable kembali ke gaya terjemahan. Saya menguji dengan esai lebih dari seribu aksara. Jika model tidak bisa menjaga nada sebelumnya, relay itu langsung dicoret.
- **Temperature sebagai pengatur suara.** Antarmuka web biasanya tidak mengizinkan Anda mengaturnya. Di API, parameter ini penting.
  - Prosa liris: Claude Fable dengan `Temperature` sekitar `0.8`. Kosakatanya terbuka, termasuk kata-kata jarang yang tetap pas.
  - Argumen dan kerangka: GPT-6 dengan `Temperature` `0.2`. Rantai logikanya tetap dingin dan stabil.

## Catatan terakhir

Menengok kembali dari 2026, AI tidak membunuh tulisan seperti yang dulu dikhawatirkan orang.

Di bawah lampu meja di Amerika Utara, saya masih memilih, dari banyak paragraf yang dihasilkan, satu kalimat bahasa Tionghoa yang paling cocok dengan suasana hati saat itu. GPT-6 memberi struktur. Claude Fable memberi empati. Relay adalah pelayan tak kasatmata yang diam-diam menempatkan para penasihat itu di ujung pena saya.

Memahami watak mereka juga merupakan cara untuk melihat kembali bagaimana saya memperlakukan bahasa Tionghoa. Orang yang menentukan di mana kalimat itu berlabuh tetaplah dia yang duduk di depan layar, yang merindukan hujan plum Jiangnan dan desir angin di sekitar Menara Guanghua.
