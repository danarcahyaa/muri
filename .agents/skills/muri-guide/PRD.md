# PRODUCT REQUIREMENT DOCUMENT (PRD)
## MURI - Platform Solusi Sirkular Tekstil Berbasis

---

## 1. Pendahuluan

### 1.1 Latar Belakang
Industri fashion menghasilkan limbah tekstil yang masif, mulai dari sisa potongan kain (*deadstock*), kegagalan produksi garment, hingga pakaian bekas layak pakai. Di sisi lain, tren keberlanjutan (*sustainability*) mendorong brand fashion untuk menggunakan material ramah lingkungan dan sirkular. Namun, rantai pasok material daur ulang saat ini sangat tidak efisien, kurang transparan, dan sulit diverifikasi.

### 1.2 Visi & Misi
*   **Visi**: Menjadi ekosistem sirkular tekstil terdepan di Indonesia yang mengeliminasi limbah tekstil melalui teknologi AI dan transparansi rantai pasok.
*   **Misi**:
    1.  Mendigitalisasi pencatatan dan distribusi limbah tekstil secara presisi.
    2.  Menyediakan bahan baku sirkular terverifikasi bagi brand fashion lokal dan internasional.
    3.  Mengedukasi masyarakat mengenai keberlanjutan (*sustainability*) melalui program pelatihan terstruktur.
    4.  Membuka akses pasar bagi produk-produk fashion hasil *upcycling*.

### 1.3 Tujuan Dokumen
Dokumen ini dibuat untuk mendefinisikan persyaratan produk (*product requirements*), alur pengguna (*user flows*), serta spesifikasi teknis platform MURI sebagai acuan bagi tim pengembang (*engineering*), desain (*product design*), dan manajemen produk (*product management*).

---

## 2. Arsitektur Pengguna & Peran (User Personas & Roles)

MURI memiliki 4 aktor utama di dalam ekosistemnya:

| Peran | Deskripsi | Tujuan Utama dalam Aplikasi |
| :--- | :--- | :--- |
| **01. Penyedia Limbah** *(Waste Providers)* | Garment, pabrik tekstil, penjahit rumahan, atau pengumpul limbah kain. | Menjual sisa kain produksi/limbah tekstil untuk mendapatkan nilai ekonomi tambahan daripada membuangnya. |
| **02. Brand Fashion** *(Demand)* | Perusahaan fashion, desainer, atau produsen barang jadi yang fokus pada sirkularitas. | Membeli material sisa produksi/kain daur ulang terverifikasi untuk diproduksi kembali. |
| **03. Konsumen Akhir** *(Retail Customer)* | Pengguna ritel/masyarakat umum. | Membeli produk upcycled jadi, belajar tentang sirkularitas, dan memesan slot workshop edukatif. |

---

## 3. Kebutuhan Fungsional (Functional Requirements)

### 3.1 Registrasi & Autentikasi Multi-Role
Sistem harus memfasilitasi pembuatan akun berdasarkan tipe pengguna dengan tingkat verifikasi yang disesuaikan.
*   **Customer Auth**: Pendaftaran instan melalui Email/Password atau Google Auth.
*   **Brand & Waste Provider Auth**: Pendaftaran khusus dengan formulir identitas usaha tambahan. Memerlukan verifikasi admin (MURI) sebelum bisa melakukan aktivitas jual/beli di marketplace.

### 3.2 Katalog & Marketplace Material Sirkular
Modul B2B bagi Brand Fashion untuk mencari dan membeli bahan sisa kain berkualitas.
*   **Filter & Pencarian**: Berdasarkan jenis kain (Denim, Katun, Polyester, Campuran), warna, berat/kuantitas, dan lokasi (misal: Badung, Denpasar, Gianyar).
*   **Detail Material**: Informasi kuantitas, harga per Kg, asal-usul (provensi limbah), dan skor jejak karbon/dampak lingkungan (CO₂ terverifikasi, penghematan air).

### 3.3 Dashboard Transparansi & Dampak Lingkungan (Traceability System)
Dashboard interaktif bagi *Waste Providers* dan *Brands* untuk memantau nilai aksi keberlanjutan mereka.
*   **Metrik Ringkasan (Summary Metrics)**:
    *   *Emisi Dicegah*: Estimasi CO₂e terverifikasi (Kg).
    *   *Air yang Dihemat*: Volume air yang dihemat dibandingkan memproduksi baru (L).
*   **Tabel Riwayat Aktivitas**: Menampilkan data logistik seperti ID Transaksi, jenis material, lokasi asal/tujuan, dan status verifikasi (*Menunggu*, *Diproses*, *Terverifikasi*).
*   **Sertifikat Dampak (Green Badge)**: Sertifikat digital yang dapat diunduh oleh Brand untuk membuktikan kontribusi lingkungan mereka kepada konsumen.

### 3.4 Katalog Produk Upcycled & Sirkular
Halaman etalase publik yang ditujukan bagi konsumen ritel (B2C).
*   **Katalog Produk**: Menampilkan pakaian, tas, atau aksesori hasil kreasi brand mitra menggunakan bahan sisa daur ulang MURI.
*   **Visual Storytelling**: Setiap produk menampilkan "Silsilah Material" (misal: *"Produk ini menyelamatkan 1.5 Kg sisa Denim dari pabrik garment Badung"*).

### 3.5 Modul Edukasi & Booking Workshop
Pusat edukasi publik mengenai keberlanjutan dan *upcycling*.
*   **Workshop Listing**: Daftar acara pelatihan menjahit, teknik shibori, atau tata kelola limbah mandiri.
*   **Booking System**: Pengguna dapat mendaftar dan membeli tiket workshop secara langsung.

---

## 4. Kebutuhan Non-Fungsional (Non-Functional Requirements)

### 4.1 Kinerja & Aksesibilitas (Performance & Accessibility)
*   **SEO Optimization**: Penerapan tag judul (*Title Tags*) yang deskriptif dan tag deskripsi meta (*Meta Descriptions*) yang ramah SEO pada setiap halaman.
*   **Semantic HTML**: Penggunaan tag HTML5 yang tepat (`<header>`, `<main>`, `<footer>`, `<section>`, `<article>`) dengan struktur heading h1 tunggal per halaman.
*   **Responsivitas**: Tampilan UI harus adaptif dari layar mobile (320px) hingga layar desktop ultra-wide.

### 4.2 Keamanan & Integritas Data
*   **Supabase RLS (Row Level Security)**: Memastikan pengguna hanya dapat mengakses data milik mereka sendiri (misal: riwayat transaksi brand tidak bisa diintip oleh produsen limbah lainnya).
*   **Autentikasi Aman**: Perlindungan token JWT, reset password yang aman, dan penanganan status error Supabase menggunakan utilitas terpusat.

### 4.3 Panduan Gaya Visual & Desain (Visual Style Guidelines)
Desain visual mengikuti aturan yang didefinisikan dalam `.agents/skills/muri-guide/references/STYLEGUIDE.md`:
*   **Palet Warna**:
    *   *Canvas utama*: Warm Off-White (`#F5F3EC`) dengan kartu warna Eco Pure White (`#FBFAF6`).
    *   *Hero/Zona Gelap*: Deep Forest (`#0C382C`) dipadu dengan MURI Deep Ink (`#081D17`).
    *   *Aksen Utama*: Lime Eco-Neon (`#C8F169`) untuk tombol utama, ikon daun, dan penunjuk status aktif.
    *   *Pembatas*: Garis tipis 1px Line Trace (`#C2C9C6`) tanpa bayangan pekat (*no heavy drop shadows*).
*   **Tipografi**:
    *   *Headings & Titles*: Plus Jakarta Sans dengan `tracking-tight` (`-0.03em` hingga `-0.04em`) dan bobot tebal (Bold/Extra Bold).
    *   *Body & Technical Data*: Mona Sans untuk teks deskriptif, label, dan data tabel pelacakan.

---

## 5. Arsitektur Teknis & Stack

*   **Framework Frontend**: Next.js 15 (App Router)
*   **Bahasa Pemrograman**: TypeScript (Strict Mode)
*   **Styling**: Tailwind CSS
*   **Database & Layanan Backend**: Supabase (PostgreSQL, Auth, Storage)
*   **Ikonografi**: Lucide React
*   **Struktur Folder Utama**:
    *   `src/app`: Pengaturan routing dan layout Next.js.
    *   `src/components`: UI dasar dan komponen fungsional terpisah (modular).
    *   `src/hooks`: Custom hooks React untuk logika stateful.
    *   `src/lib`: Inisialisasi client (misal: Supabase client) dan utility functions.
    *   `src/services`: Logika bisnis dan API service (misal: `brand-fashion`, `customer`, `waste-providers`).
    *   `src/types`: Definisi data model dan API response.
