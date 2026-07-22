# Panduan Gaya Visual MURI

## Overview

Kehadiran visual web MURI dirancang untuk memadukan ketegasan platform tata kelola limbah perusahaan (*enterprise waste management*) dengan kejernihan antarmuka sebuah gerakan keberlanjutan modern (*modern sustainability movement*). 

Sistem visual ini dibagi menjadi dua zona kontras yang dramatis:
1. **Zona Atas (Hero Section):** Menggunakan kanvas gelap hijau hutan pekat (`#0C382C`) yang dikombinasikan dengan letupan aksen hijau limau neon (`#C8F169`) untuk memberikan kesan teknologi yang canggih, presisi, dan berfokus pada solusi sirkular berbasis AI.
2. **Zona Bawah (Ekosistem & Tracing):** Berpindah ke kanvas hangat *off-white* (`#F5F3EC`) yang bersih dengan tipografi masif untuk mengedepankan transparansi informasi, kemudahan keterbacaan data, dan keterbukaan rantai pasok.

**Key Characteristics:**
- Headline display monumental berbobot *Bold/Extra Bold* menggunakan font Plus Jakarta Sans dengan *line-height* rapat dan *negative tracking* agar tetap ringkas dan kokoh.
- Kontras ekstrem antara heroband gelap pekat dan area konten bawah yang terang beralaskan warna bumi hangat.
- Sudut lengkungan (*border-radius*) komponen kartu yang bervariasi tegas antara 8px (untuk kartu alur mikro) hingga 16px (untuk kartu grid ekosistem).
- Tombol aksi utama berbentuk persegi dengan sudut melengkung halus (*rounded-sm*) berwarna hijau limau neon yang mencolok, dipadukan dengan tombol sekunder berbingkai transparan.
- Komponen visualisasi rantai pasok interaktif menggunakan diagram jalur linier minimalis di atas pola matriks titik-titik (*dot grid matrix*).

## Colors

### Brand & Accent

- **MURI Deep Ink / Black** (`#081D17`): Warna teks dengan kontras tertinggi, latar belakang elemen tergelap, dan warna teks di dalam tombol utama.
- **Deep Forest** (`#0C382C`): Warna utama identitas MURI. Digunakan sebagai latar belakang penuh seksi hero dan komponen bernuansa pekat.
- **MURI Emerald** (`#1C6B52`): Aksen penunjuk sekunder, warna garis penghubung, dan pembatas komponen dalam mode gelap.
- **Lime Eco-Neon** (`#C8F169`): Warna penarik perhatian utama (*hero accent*). Digunakan untuk tombol utama, sub-header kecil dengan ikon daun, ikon diagram, dan penunjuk langkah aktif.

### Surface & Background

- **Warm Off-White Canvas** (`#F5F3EC`): Latar belakang dominan untuk seluruh area konten luar (seksi ekosistem, informasi tracing, dan edukasi).
- **Eco Pure White** (`#FBFAF6`): Warna dasar untuk permukaan kartu terang (seperti Kartu Aggregator dan Kartu Brand Demand) untuk memisahkan kontras dari kanvas utama.
- **Card Dark Background** (`#081D17` / kemiringan opacity `60%`): Permukaan kartu mikro di dalam area hero untuk mensimulasikan modul data sirkular.

### Text & Rules

- **Deep Ink Text** (`#081D17`): Warna default untuk teks isi (*body text*), sub-judul, dan headline pada kanvas terang.
- **Muted Moss** (`#5C6E69`): Teks deskripsi sekunder di dalam seksi hero atau teks penjelas berukuran kecil.
- **Line Trace** (`#C2C9C6`): Garis tipis 1px pembatas komponen form, kartu terang, dan aturan pemisah daftar logistik.

### Semantic

- **Focus Emerald** (`#1C6B52`): Batas fokus keyboard (*ring outline*) pada elemen interaktif form.
- **Error Rust** (`#A62626`): Warna validasi eror untuk kegagalan pelacakan kode QR, stok habis, atau pembatalan konfirmasi.

### Gradient System

MURI melarang penggunaan gradien warna cerah buatan sebagai pengisi UI standar. Bidang warna dan gradien harus dipimpin oleh media asli (*media-led*): visualisasi serat kain resolusi tinggi, gambar pakaian *patchwork* AI, dan transisi gelap dari `#1C6B52` ke `#081D17` pada lingkungan generator. Permukaan UI harus tetap rata (*flat*); simpan kekayaan gradien hanya untuk panel media besar dan latar belakang spanduk gambar pahlawan (*hero image bands*).

## Typography

### Font Family

- **Display & Headings**: `Plus Jakarta Sans`, falling back to `Inter`, `ui-sans-serif`, and `system-ui`. (Memberikan karakter modern, bersih, bersahabat, dan menjamin keterbacaan yang sangat tinggi pada judul-judul masif).
- **Body / UI / Technical**: `Mona Sans`, falling back to `Arial`, `ui-sans-serif`, and `system-ui`. (Memberikan sentuhan ekspresif, rapat, dan dinamis untuk data pelacakan, teks isi, dan komponen label).

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|---|---|---:|---:|---:|---:|---|
| Hero Headline | Plus Jakarta Sans | 72px - 96px | 700 | 1.05 | -0.04em | Judul utama seksi hero (e.g., "Jangan Biarkan..."). |
| Section Title | Plus Jakarta Sans | 56px - 64px | 700 | 1.10 | -0.03em | Judul utama untuk seksi ekosistem bawah. |
| Sub-Header | Plus Jakarta Sans | 14px | 600 | 1.20 | 0.05em | Teks kapital kecil di atas judul (e.g., SOLUSI SIRKULAR BERBASIS AI). |
| Card Title | Plus Jakarta Sans | 28px - 32px | 600 | 1.20 | -0.01em | Judul utama di dalam komponen kartu ekosistem. |
| Body Default | Mona Sans | 16px | 400 | 1.50 | 0 | Default teks deskripsi, teks paragraf, dan salinan info. |
| Button Label | Mona Sans | 14px | 600 | 1.00 | 0 | Teks label di dalam tombol. |

### Principles for Plus Jakarta Sans Headings:
- Karena karakter huruf Plus Jakarta Sans cenderung melebar (*wide*) secara natural, pastikan untuk **selalu mengunci nilai *letter-spacing* ke `tracking-tight` (`-0.03em` hingga `-0.04em`)** pada teks berskala besar agar barisan kata tidak terlihat terlalu renggang.
- Gunakan bobot ketebalan **Bold (700)** atau **Extra Bold (800)** pada heroband gelap untuk mempertahankan kekuatan visual platform yang tegas.

## Layout & Components

### **`navigation-bar`**
Batang navigasi atas yang melayang transparan di atas seksi hero atau berlatar `#FBFAF6` di seksi terang. Layout terbagi tiga: Logo MURI di kiri, menu teks minimalis di tengah menggunakan font Mona Sans (`text-[#FBFAF6]` / `text-[#081D17]`), serta tombol aksi "Masuk" (Outline) dan "Mulai Bergabung" (Filled) di ujung kanan.

### **`button-solid-lime`**
Tombol aksi utama dengan sudut melengkung halus (`rounded-sm`) dengan warna latar `#C8F169` dan teks pekat `#081D17`. Dilengkapi dengan teks tebal (*font-semibold* dari Mona Sans) dan ikon panah kecil (`→`) di sisi kanan label teks.

### **`button-outline-black` / `button-outline-white`**
Tombol sekunder dengan sudut melengkung halus (`rounded-sm`) dan latar belakang transparan, dikelilingi oleh garis pembatas tipis 1px (`border-[#FBFAF6]` pada mode gelap atau `border-[#081D17]` pada mode terang). Memiliki teks putih hangat atau pekat dengan ikon panah kecil di kanan.

### **Supply Chain Network Widget (`supply-chain-network-widget`)**
Komponen visualisasi diagram di sisi kanan seksi hero. Menggunakan latar belakang pola titik-titik (*dot grid matrix*) abu-abu transparan. Menghubungkan tiga kartu mikro (`01 Produsen Limbah`, `02 Aggregator MURI`, `03 Brand Fashion`) menggunakan garis diagonal tipis berwarna hijau limau neon `#C8F169` yang merepresentasikan alur material terintegrasi.

### **Ecosystem Card Grid (`ecosystem-card-grid`)**
Komposisi tata letak 3 kolom kartu untuk memetakan alur kerja multi-sektor MURI:
- **Kartu 01 (Produsen Limbah):** Menggunakan warna blok pekat `bg-[#0C382C]` dengan ikon ilustrasi garis tipis pabrik/rumah berwarna neon `#C8F169`. Teks judul `Plus Jakarta Sans` berwarna putih hangat dan deskripsi berwarna hijau lumut redup.
- **Kartu 02 & 03 (Aggregator & Brand):** Menggunakan warna dasar putih bersih `bg-[#FBFAF6]` dengan border tipis 1px `border-[#C2C9C6]`. Teks dan ikon ilustrasi (Folder & Berlian) menggunakan warna hijau gelap `#0C382C`.

### **Floating Action Chat (`floating-action-chat`)**
Tombol melayang melingkar sempurna (`rounded-full`) di sisi kanan layar berwarna dasar `#C8F169` (Lime) dengan ikon chat murni hitam pekat di tengahnya, berfungsi sebagai pusat bantuan atau edukasi interaktif sirkular.

## Do's and Don'ts

### Do
- Gunakan warna hijau hutan pekat `#0C382C` sebagai latar belakang penuh pelindung untuk memberikan aura teknologi premium pada bagian atas halaman.
- Pastikan semua headline utama menggunakan font `Plus Jakarta Sans` dengan ketebalan **Bold (700)** dan dikunci rapat menggunakan modifier `tracking-tight` atau `tracking-tighter` di Tailwind.
- Tampilkan foto lembar perca asli secara jujur berdampingan dengan gambar baju hasil rekayasa kecerdasan buatan.

### Don't
- Jangan pernah mencampur skema warna latar belakang hangat `#F5F3EC` dengan bayangan komponen (*drop shadows*) ; andalkan pembatas garis tipis 1px (`Hairline Border` warna `#C2C9C6`).
- Jangan gunakan warna hijau limau neon `#C8F169` sebagai warna teks tubuh (*body text*); batasi penggunaannya hanya untuk tombol aksi, ikon, dan teks penunjuk sub-header kecil.
