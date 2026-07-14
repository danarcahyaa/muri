export type AiStatus = "idle" | "processing" | "done";

export type SourceMode = "upload" | "purchased";

export type PurchasedMaterial = {
  id: string;
  name: string;
  batchId: string;
  description: string;
  image: string;
  alt: string;
};

export type AiRecommendation = {
  title: string;
  subtitle: string;
};

export const purchasedMaterials: PurchasedMaterial[] = [
  {
    id: "material-4356",
    name: "Upcycled Denim",
    batchId: "BATCH-4356",
    description: "Material denim bekas terverifikasi",
    image: "/product.png",
    alt: "Produk upcycled denim",
  },
  {
    id: "material-7281",
    name: "Denim Light Wash",
    batchId: "BATCH-7281",
    description: "Material denim light wash siap diproses",
    image: "/product.png",
    alt: "Material denim light wash",
  },
  {
    id: "material-9024",
    name: "Denim Mixed Panel",
    batchId: "BATCH-9024",
    description: "Campuran panel denim sisa produksi",
    image: "/product.png",
    alt: "Material panel denim",
  },
];

export const mockRecommendations: AiRecommendation[] = [
  {
    title: "Jaket Boxy Upcycled",
    subtitle: "Potongan modern minimal",
  },
  {
    title: "Overshirt Panel Utility",
    subtitle: "Komposisi panel lebih tegas",
  },
  {
    title: "Tas Tote Modular",
    subtitle: "Memaksimalkan efisiensi pola",
  },
];