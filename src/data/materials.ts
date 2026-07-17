export type MaterialLocation =
  | "Denpasar"
  | "Gianyar"
  | "Badung";

export type MaterialCondition =
  | "Deadstock"
  | "Sisa Gulungan"
  | "Sisa Produksi";

export type MaterialVerificationStatus =
  | "Terverifikasi"
  | "Dalam Peninjauan";

export interface MaterialProvider {
  name: string;
  type: string;
  location: string;
  verified: boolean;
  joinedSince: string;
  description: string;
}

export interface MaterialDocument {
  name: string;
  description: string;
  status: "Terverifikasi" | "Tersedia";
}

export interface MaterialTraceabilityStep {
  title: string;
  date: string;
  location: string;
  description: string;
  status: "Selesai" | "Aktif";
}

export interface MaterialItem {
  slug: string;
  batchId: string;

  title: string;
  category: string;
  condition: MaterialCondition;
  verificationStatus: MaterialVerificationStatus;

  provider: string;
  providerDetails: MaterialProvider;

  location: MaterialLocation;
  origin: string;

  description: string;
  image: string;
  gallery: string[];

  pricePerKg: number;
  volumeKg: number;
  availableKg: number;
  minimumOrderKg: number;
  orderStepKg: number;

  composition: string;
  color: string;
  pattern: string;
  texture: string;
  finish: string;
  weightGsm: number;
  widthCm: number;

  packaging: string;
  fulfillmentTime: string;
  pickupAvailable: boolean;
  deliveryCoverage: string;

  recommendedUses: string[];
  certifications: string[];
  documents: MaterialDocument[];
  storageInstructions: string[];

  lastVerifiedAt: string;
  traceability: MaterialTraceabilityStep[];
}

export const materials: MaterialItem[] = [
  {
    slug: "katun-twill-deadstock-olive",
    batchId: "BATCH-KT-4356",

    title: "Katun Twill Deadstock Olive",
    category: "Katun Twill",
    condition: "Deadstock",
    verificationStatus: "Terverifikasi",

    provider: "Bali Bali Bersih",

    providerDetails: {
      name: "Bali Bali Bersih",
      type: "Pengelola dan Penyedia Limbah Tekstil",
      location: "Gianyar, Bali",
      verified: true,
      joinedSince: "2024",

      description:
        "Mitra pengelola material tekstil sisa yang melakukan pemilahan, pencatatan batch, dan pemeriksaan kondisi sebelum material dipasarkan melalui ekosistem Muri.",
    },

    location: "Gianyar",
    origin: "Sisa produksi manufaktur fashion, Gianyar",

    description:
      "Kain katun twill deadstock berwarna olive dengan struktur tenun rapat dan permukaan lembut. Material belum pernah digunakan dalam produksi akhir dan masih dalam kondisi sangat baik.",

    image: "/materials/katun-twill-olive.png",

    gallery: [
      "/materials/katun-twill-olive.png",
      "/materials/katun-twill-olive-detail.png",
    ],

    pricePerKg: 48_000,
    volumeKg: 620,
    availableKg: 480,
    minimumOrderKg: 25,
    orderStepKg: 5,

    composition: "100% Katun",
    color: "Olive",
    pattern: "Polos",
    texture: "Twill diagonal halus",
    finish: "Soft washed",
    weightGsm: 240,
    widthCm: 150,

    packaging: "Roll atau bal terlindungi",
    fulfillmentTime: "2–4 hari kerja",
    pickupAvailable: true,
    deliveryCoverage: "Bali dan seluruh Indonesia",

    recommendedUses: [
      "Jaket ringan",
      "Celana kasual",
      "Overshirt",
      "Tas dan aksesori",
      "Seragam hospitality",
      "Produk homeware",
    ],

    certifications: [
      "Verifikasi kondisi material Muri",
      "Pencatatan batch dan asal material",
      "Dokumentasi pemeriksaan visual",
    ],

    documents: [
      {
        name: "Laporan Pemeriksaan Material",
        description:
          "Hasil pemeriksaan visual, kondisi permukaan, dan kebersihan material.",

        status: "Terverifikasi",
      },
      {
        name: "Dokumen Asal Batch",
        description:
          "Pencatatan penyedia, lokasi asal, dan tanggal penerimaan material.",

        status: "Terverifikasi",
      },
      {
        name: "Foto Dokumentasi Batch",
        description:
          "Dokumentasi material pada saat penerimaan dan proses pemilahan.",

        status: "Tersedia",
      },
    ],

    storageInstructions: [
      "Simpan di tempat kering dan terlindung dari sinar matahari langsung.",
      "Gunakan pelindung roll atau kemasan tertutup.",
      "Hindari kelembapan tinggi selama penyimpanan.",
    ],

    lastVerifiedAt: "2026-07-08",

    traceability: [
      {
        title: "Material Dihasilkan",
        date: "2026-06-28",
        location: "Gianyar",

        description:
          "Material tercatat sebagai kelebihan produksi dari manufaktur fashion lokal.",

        status: "Selesai",
      },
      {
        title: "Pengumpulan Material",
        date: "2026-07-01",
        location: "Gianyar",

        description:
          "Material dikumpulkan dan dipindahkan ke fasilitas pemilahan Bali Bali Bersih.",

        status: "Selesai",
      },
      {
        title: "Pemilahan dan Pemeriksaan",
        date: "2026-07-05",
        location: "Gianyar",

        description:
          "Kondisi fisik, warna, berat, lebar, dan kebersihan material diperiksa.",

        status: "Selesai",
      },
      {
        title: "Verifikasi Muri",
        date: "2026-07-08",
        location: "Platform Muri",

        description:
          "Data batch dan dokumen pendukung diverifikasi sebelum material diterbitkan.",

        status: "Aktif",
      },
    ],
  },

  {
    slug: "denim-indigo-sisa-gulungan",
    batchId: "BATCH-DN-5721",

    title: "Denim Indigo Sisa Gulungan",
    category: "Denim",
    condition: "Sisa Gulungan",
    verificationStatus: "Terverifikasi",

    provider: "Re-Wear Project",

    providerDetails: {
      name: "Re-Wear Project",
      type: "Pengumpul Material Fashion Sirkular",
      location: "Badung, Bali",
      verified: true,
      joinedSince: "2025",

      description:
        "Penyedia material tekstil sisa yang berfokus pada pemulihan denim dan kain konstruksi berat dari proses manufaktur fashion.",
    },

    location: "Badung",
    origin: "Kelebihan roll produksi denim, Badung",

    description:
      "Denim indigo dengan konstruksi kokoh dan variasi warna minimal. Cocok digunakan untuk koleksi kapsul, aksesori, dan produk upcycling.",

    image: "/materials/denim-indigo.png",

    gallery: [
      "/materials/denim-indigo.png",
      "/materials/denim-indigo-detail.png",
    ],

    pricePerKg: 56_000,
    volumeKg: 410,
    availableKg: 335,
    minimumOrderKg: 20,
    orderStepKg: 5,

    composition: "98% Katun, 2% Elastane",
    color: "Indigo",
    pattern: "Polos",
    texture: "Denim diagonal",
    finish: "Raw denim",
    weightGsm: 310,
    widthCm: 145,

    packaging: "Roll berlapis pelindung",
    fulfillmentTime: "2–5 hari kerja",
    pickupAvailable: true,
    deliveryCoverage: "Bali, Jawa, dan kota besar Indonesia",

    recommendedUses: [
      "Jaket denim",
      "Celana",
      "Tas",
      "Apron",
      "Topi",
      "Panel dekoratif",
    ],

    certifications: [
      "Verifikasi kondisi material Muri",
      "Identifikasi komposisi pemasok",
      "Dokumentasi batch",
    ],

    documents: [
      {
        name: "Laporan Kondisi Denim",
        description:
          "Catatan kondisi permukaan, warna, dan variasi antar-roll.",

        status: "Terverifikasi",
      },
      {
        name: "Dokumen Asal Material",
        description:
          "Informasi asal material dan penyedia awal.",

        status: "Terverifikasi",
      },
    ],

    storageInstructions: [
      "Simpan dalam posisi roll.",
      "Hindari kontak langsung dengan lantai.",
      "Jauhkan dari kelembapan dan bahan kimia.",
    ],

    lastVerifiedAt: "2026-07-09",

    traceability: [
      {
        title: "Pencatatan Kelebihan Produksi",
        date: "2026-06-30",
        location: "Badung",

        description:
          "Sisa roll denim dicatat oleh mitra produksi.",

        status: "Selesai",
      },
      {
        title: "Pengumpulan",
        date: "2026-07-03",
        location: "Badung",

        description:
          "Material dikumpulkan oleh Re-Wear Project.",

        status: "Selesai",
      },
      {
        title: "Pemeriksaan Kualitas",
        date: "2026-07-07",
        location: "Badung",

        description:
          "Material diperiksa untuk mendeteksi noda, kerusakan, dan variasi warna.",

        status: "Selesai",
      },
      {
        title: "Publikasi di Muri",
        date: "2026-07-09",
        location: "Platform Muri",

        description:
          "Batch diterbitkan setelah data pemeriksaan dinyatakan lengkap.",

        status: "Aktif",
      },
    ],
  },

  {
    slug: "linen-rayon-natural-deadstock",
    batchId: "BATCH-LR-6194",

    title: "Linen Rayon Natural Deadstock",
    category: "Linen Blend",
    condition: "Deadstock",
    verificationStatus: "Terverifikasi",

    provider: "Circular Textile Hub",

    providerDetails: {
      name: "Circular Textile Hub",
      type: "Penyedia Material Sirkular",
      location: "Denpasar, Bali",
      verified: true,
      joinedSince: "2025",

      description:
        "Mitra penyedia kain deadstock dan kelebihan produksi untuk brand fashion, interior, dan hospitality.",
    },

    location: "Denpasar",
    origin: "Kelebihan produksi tekstil hospitality, Denpasar",

    description:
      "Campuran linen dan rayon berwarna natural dengan karakter ringan, breathable, dan memiliki drape lembut.",

    image: "/materials/linen-rayon-natural.png",

    gallery: [
      "/materials/linen-rayon-natural.png",
      "/materials/linen-rayon-natural-detail.png",
    ],

    pricePerKg: 64_000,
    volumeKg: 290,
    availableKg: 240,
    minimumOrderKg: 15,
    orderStepKg: 5,

    composition: "55% Linen, 45% Rayon",
    color: "Natural Beige",
    pattern: "Polos",
    texture: "Slub alami",
    finish: "Pre-washed",
    weightGsm: 180,
    widthCm: 148,

    packaging: "Roll terlindungi",
    fulfillmentTime: "2–4 hari kerja",
    pickupAvailable: true,
    deliveryCoverage: "Seluruh Indonesia",

    recommendedUses: [
      "Kemeja",
      "Dress",
      "Resort wear",
      "Seragam hospitality",
      "Sarung bantal",
      "Produk lifestyle",
    ],

    certifications: [
      "Verifikasi Muri",
      "Dokumentasi batch",
      "Pemeriksaan visual",
    ],

    documents: [
      {
        name: "Laporan Pemeriksaan",
        description:
          "Informasi kondisi dan karakteristik material.",

        status: "Terverifikasi",
      },
      {
        name: "Dokumen Batch",
        description:
          "Identitas material dan riwayat penyedia.",

        status: "Tersedia",
      },
    ],

    storageInstructions: [
      "Simpan dalam keadaan kering.",
      "Hindari tekanan berlebih pada roll.",
      "Gunakan pelindung dari debu.",
    ],

    lastVerifiedAt: "2026-07-10",

    traceability: [
      {
        title: "Identifikasi Deadstock",
        date: "2026-07-01",
        location: "Denpasar",

        description:
          "Kelebihan material diidentifikasi dan dicatat oleh penyedia.",

        status: "Selesai",
      },
      {
        title: "Pemindahan ke Gudang",
        date: "2026-07-04",
        location: "Denpasar",

        description:
          "Material dipindahkan ke area penyimpanan terkontrol.",

        status: "Selesai",
      },
      {
        title: "Verifikasi",
        date: "2026-07-10",
        location: "Platform Muri",

        description:
          "Kondisi dan data material dikonfirmasi oleh tim Muri.",

        status: "Aktif",
      },
    ],
  },
];

export function getMaterialBySlug(slug: string) {
  return materials.find(
    (material) => material.slug === slug,
  );
}

export function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatMaterialDate(value: string) {
  const [year, month, day] = value
    .split("-")
    .map(Number);

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(
    new Date(Date.UTC(year, month - 1, day)),
  );
}