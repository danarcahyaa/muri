export interface WorkshopSpeaker {
  name: string;
  role: string;
  organization: string;
  bio: string;
}

export interface WorkshopAgendaItem {
  time: string;
  title: string;
  description?: string;
}

export interface Workshop {
  slug: string;
  organizer: string;
  category: string;

  title: string;
  shortDescription: string;
  description: string;
  image: string;

  date: string;
  startTime: string;
  endTime: string;
  timezone: string;

  location: string;
  address: string;
  mode: "Tatap Muka" | "Online" | "Hybrid";
  duration: string;
  level: "Pemula" | "Menengah" | "Lanjutan";

  capacity: number;
  remainingSlots: number;
  coinPrice: number;

  speaker: WorkshopSpeaker;
  outcomes: string[];
  agenda: WorkshopAgendaItem[];
  included: string[];
  requirements: string[];
}

export const workshops: Workshop[] = [
  {
    slug: "teknik-upcycling-mengolah-perca",
    organizer: "Bali Bali Bersih",
    category: "Praktik Upcycling",

    title:
      "Teknik Upcycling: Mengolah Perca Menjadi Produk Bernilai",

    shortDescription:
      "Kelas praktis mengolah kain perca menjadi produk siap pakai yang memiliki nilai jual.",

    description:
      "Workshop praktik untuk memahami proses pemilihan, pengolahan, dan pengembangan kain perca menjadi produk fashion baru. Peserta akan belajar langsung melalui demonstrasi dan sesi praktik bersama mentor.",

    image: "/workshops/upcycling-workshop.png",

    date: "2026-07-12",
    startTime: "09.00",
    endTime: "13.00",
    timezone: "WITA",

    location: "Gianyar",
    address:
      "Bali Bali Bersih Creative Space, Gianyar, Bali",

    mode: "Tatap Muka",
    duration: "4 Jam",
    level: "Pemula",

    capacity: 20,
    remainingSlots: 8,
    coinPrice: 72,

    speaker: {
      name: "Ayu Prameswari",
      role: "Upcycling Product Designer",
      organization: "Bali Bali Bersih",

      bio:
        "Desainer produk yang berfokus pada pemanfaatan kembali limbah tekstil menjadi produk fashion dan kerajinan bernilai tinggi.",
    },

    outcomes: [
      "Memahami jenis kain perca yang dapat digunakan kembali.",
      "Menentukan konsep produk berdasarkan karakter material.",
      "Menerapkan teknik dasar pemotongan dan penyambungan kain.",
      "Membuat satu prototipe produk upcycling.",
    ],

    agenda: [
      {
        time: "09.00",
        title: "Pengenalan material tekstil sisa",

        description:
          "Mengenali karakter, kualitas, dan potensi penggunaan kain perca.",
      },
      {
        time: "09.45",
        title: "Pengembangan ide produk",

        description:
          "Menentukan fungsi, bentuk, dan target pengguna produk.",
      },
      {
        time: "10.30",
        title: "Demonstrasi teknik upcycling",

        description:
          "Praktik pemotongan, penyusunan, dan penyambungan material.",
      },
      {
        time: "11.30",
        title: "Pembuatan prototipe",

        description:
          "Peserta membuat prototipe dengan pendampingan mentor.",
      },
      {
        time: "12.45",
        title: "Evaluasi dan penutupan",
      },
    ],

    included: [
      "Material praktik",
      "Penggunaan alat workshop",
      "Modul digital",
      "Sertifikat partisipasi",
      "Konsumsi",
    ],

    requirements: [
      "Tidak membutuhkan pengalaman sebelumnya.",
      "Membawa laptop atau buku catatan.",
      "Hadir 15 menit sebelum workshop dimulai.",
    ],
  },

  {
    slug: "membangun-sustainable-brand",
    organizer: "Bali Bali Bersih",
    category: "Bisnis Berkelanjutan",

    title: "Membangun Sustainable Brand dari Awal",

    shortDescription:
      "Kupas tuntas strategi pemasaran, pricing, positioning, dan sertifikasi produk ramah lingkungan.",

    description:
      "Workshop intensif untuk membantu pelaku usaha dan calon founder membangun brand yang memiliki positioning kuat, model bisnis berkelanjutan, serta komunikasi lingkungan yang dapat dipertanggungjawabkan.",

    image:
      "/workshops/sustainable-brand-workshop.png",

    date: "2026-07-12",
    startTime: "13.00",
    endTime: "17.00",
    timezone: "WITA",

    location: "Gianyar",
    address:
      "Bali Bali Bersih Creative Space, Gianyar, Bali",

    mode: "Tatap Muka",
    duration: "4 Jam",
    level: "Pemula",

    capacity: 20,
    remainingSlots: 5,
    coinPrice: 84,

    speaker: {
      name: "Danar Cahyadi",
      role: "Sustainable Brand Strategist",
      organization: "Pramakara University",

      bio:
        "Praktisi pengembangan produk dan strategi brand yang berfokus pada bisnis berkelanjutan dan ekonomi sirkular.",
    },

    outcomes: [
      "Menentukan positioning sustainable brand.",
      "Menyusun profil target konsumen.",
      "Menghitung harga produk secara realistis.",
      "Membangun komunikasi sustainability yang kredibel.",
      "Menyusun rencana peluncuran brand.",
    ],

    agenda: [
      {
        time: "13.00",
        title: "Fondasi sustainable brand",

        description:
          "Memahami nilai, tujuan, dan masalah yang ingin diselesaikan brand.",
      },
      {
        time: "13.45",
        title: "Target pasar dan positioning",

        description:
          "Menentukan audiens dan diferensiasi brand di pasar.",
      },
      {
        time: "14.45",
        title: "Pricing dan model bisnis",

        description:
          "Menghitung biaya, margin, harga jual, dan nilai produk.",
      },
      {
        time: "15.45",
        title:
          "Sertifikasi dan komunikasi lingkungan",

        description:
          "Menghindari greenwashing dan membangun klaim yang kredibel.",
      },
      {
        time: "16.30",
        title: "Penyusunan action plan",

        description:
          "Peserta menyusun rencana implementasi setelah workshop.",
      },
    ],

    included: [
      "Modul workshop",
      "Template brand canvas",
      "Template perhitungan harga",
      "Sertifikat partisipasi",
      "Konsumsi",
    ],

    requirements: [
      "Terbuka untuk founder, UMKM, mahasiswa, dan profesional.",
      "Membawa laptop atau tablet.",
      "Disarankan sudah memiliki ide produk atau brand.",
    ],
  },
];

export function getWorkshopBySlug(slug: string) {
  return workshops.find(
    (workshop) => workshop.slug === slug,
  );
}

export function formatWorkshopDate(value: string) {
  const [year, month, day] = value
    .split("-")
    .map(Number);

  const date = new Date(
    Date.UTC(year, month - 1, day),
  );

  return new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}