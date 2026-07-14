export type TraceTimelineItem = {
  number: string;
  date: string;
  place: string;
  description: string;
};

export type TraceImpact = {
  target: number;
  suffix: string;
  label: string;
};

export type TraceabilityRecord = {
  batchId: string;
  product: {
    name: string;
    image: string;
    alt: string;
  };
  resultTitle: string;
  resultDescription: string;
  timeline: TraceTimelineItem[];
  impacts: TraceImpact[];
};

export const traceabilityRecords: Record<string, TraceabilityRecord> = {
  "PRD-4356": {
    batchId: "PRD-4356",

    product: {
      name: "Kemeja Casual Upcycled Denim",
      image: "/product.png",
      alt: "Kemeja kasual upcycled denim",
    },

    resultTitle: "Perjalanan Kain Denim Bekas Menjadi Nilai Guna.",

    resultDescription:
      "Hasil kalkulasi konversi material sirkular yang sah dan akurat secara kuantitatif.",

    timeline: [
      {
        number: "01",
        date: "05 Juli 2026",
        place: "Pabrik",
        description:
          "Danar Fashion mendaftarkan sisa kain perca dari gudang Legian, Bali. Berat awal material: 84 kg.",
      },
      {
        number: "02",
        date: "09 Juli 2026",
        place: "Rekber (Verifikasi)",
        description:
          "Muri memvalidasi kualitas dan mengategorikan material. Batch ID resmi diterbitkan ke dalam sistem.",
      },
      {
        number: "03",
        date: "05 Agustus 2026",
        place: "Konsumen (Brand)",
        description:
          "Material diadopsi oleh Brand X dan diproses menjadi produk baru dengan efisiensi bahan hingga 92%.",
      },
    ],

    impacts: [
      {
        target: 426,
        suffix: " Kg",
        label: "Emisi Dicegah",
      },
      {
        target: 12450,
        suffix: " L",
        label: "Air yang Dihemat",
      },
    ],
  },

  "PRD-7812": {
    batchId: "PRD-7812",

    product: {
      name: "Tas Tote Upcycled Cotton",
      image: "/product-tote.png",
      alt: "Tas tote berbahan katun daur ulang",
    },

    resultTitle: "Perjalanan Sisa Katun Menjadi Tas Upcycled.",

    resultDescription:
      "Rekam jejak konversi sisa produksi katun menjadi produk bernilai guna.",

    timeline: [
      {
        number: "01",
        date: "12 Juli 2026",
        place: "Pabrik",
        description: "Sisa produksi katun didaftarkan dengan berat awal 52 kg.",
      },
      {
        number: "02",
        date: "14 Juli 2026",
        place: "Muri",
        description:
          "Material diverifikasi dan dikategorikan sebagai katun layak pakai ulang.",
      },
      {
        number: "03",
        date: "02 Agustus 2026",
        place: "Brand",
        description: "Material diolah menjadi koleksi tas tote upcycled.",
      },
    ],

    impacts: [
      {
        target: 318,
        suffix: " Kg",
        label: "Emisi Dicegah",
      },
      {
        target: 8200,
        suffix: " L",
        label: "Air yang Dihemat",
      },
    ],
  },
};

export function normalizeBatchId(value: string) {
  return value.trim().replace(/^#/, "").toUpperCase();
}

export function findTraceabilityRecord(value: string) {
  const normalizedBatch = normalizeBatchId(value);

  return traceabilityRecords[normalizedBatch] ?? null;
}
