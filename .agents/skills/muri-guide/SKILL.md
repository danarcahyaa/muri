---
name: "MuriGuide"
description: "Panduan arsitektur dan gaya penulisan kode untuk proyek website MURI"
---

# Panduan Pembuatan Komponen & Halaman MURI

Gunakan skill ini untuk menyusun komponen UI, logika halaman, atau fungsi pembantu baru dalam proyek MURI. 

Kode halaman yang dibuat harus bersifat modular dan reusable. Oleh sebab itu selalu letakkan komponen-komponen yang bersifat reusable pada folder yang terpisah. Selain itu, kode untuk halaman harus tidak lebih dari 250 baris agar mudah dibaca.

Untuk mengubah style UI dari MURI, selalu ikuti style guide yang ada pada file `.agents/skills/muri-guide/STYLEGUIDE.md`. Ubahlah jika memang ada instruksi eksplisit untuk melakukannya, namun jangan mengubah style UI dari MURI tanpa ada instruksi eksplisit.

## 1. Komponen UI (PascalCase)
* Letakkan di `src/components/ui/` jika merupakan komponen dasar shadcn.
* Letakkan di `src/components/` jika merupakan komponen fungsional gabungan.
* Gunakan type safe props dan import `cn` dari `@/lib/utils` untuk merge Tailwind class.
* Pada saat pembuatan halaman, dan jika terdapat element yang seharusnya reusable maka buatlah komponen tersendiri dan letakkan di `src/components`.

## 2. Integrasi Supabase
* Selalu impor client `supabase` dari `@/lib/supabaseClient` untuk melakukan pemanggilan data.
* Tangani error secara eksplisit dan tunjukkan pesan state loading/error pada komponen.
* Letakkan di `src/services` untuk logika bisnis dan pemanggilan data.

## 3. Penggunaan Interface dan Type
* Jika terdapat sebuah props pada suatu komponen, maka definisikan interface untuk props tersebut dan letakkan di folder komponen yang sama dengan komponen yang menggunakannya.

## 4. Panduan Gaya Penulisan
* Selalu gunakan bahasa Inggris dalam penulisan kode (termasuk komentar), terkecuali pada string yang langsung berhubungan dengan pengguna akhir (misal: error message yang akan ditampilkan ke pengguna).
* Selalu menggunakan komentar untuk menjelaskan suatu kode yang kompleks. Komentar diharuskan menggunakan bahasa Inggris dan bersifat padat agar mudah dibaca.
*Selalu menggunakan type assertion yang eksplisit saat melakukan konversi type, contohnya: `as string`, `as number`, `as boolean`, `as string[]`, `as Record<string, any>`, dll. Hindari penggunaan type assertion yang implisit.