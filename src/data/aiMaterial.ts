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
  badge: string;
  image: string;
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
    title: "Vintage Heritage Textile Patchwork",
    subtitle: "Kombinasi perca katun & motif kain etnik sirkular",
    badge: "Seamless Pattern",
    image: "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Japanese Boro & Sashiko Embroidery",
    subtitle: "Pola jahitan jelujur tradisional Sashiko di atas denim",
    badge: "Boro Aesthetic",
    image: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Geometric Herringbone Patchwork",
    subtitle: "Susunan geometris simetris potongan perca sisa",
    badge: "Zero-Waste Grid",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80",
  },
];