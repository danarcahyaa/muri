export type MaterialLocation =
  | "Denpasar"
  | "Gianyar"
  | "Badung";

export interface MaterialItem {
  slug: string;
  title: string;
  description: string;
  provider: string;
  location: MaterialLocation;
  image: string;
  volumeKg: number;
  pricePerKg: number;
  batchId: string;
}

export const materials: MaterialItem[] = [
  {
    slug: "kain-perca-beragam-corak",
    title: "Kain Perca Beragam Corak",
    description:
      "Kain menghadirkan sistem berbasis poin terintegrasi untuk memberika.",
    provider: "Bu Gede",
    location: "Gianyar",
    image: "/materials/kain-perca.png",
    volumeKg: 21,
    pricePerKg: 16000,
    batchId: "BATCH-4869",
  },
  {
    slug: "kain-cotton-knit-motif-garis",
    title: "Kain Cotton Knit Motif Garis",
    description:
      "Kain menghadirkan sistem berbasis poin terintegrasi untuk memberika.",
    provider: "Pak Gede",
    location: "Denpasar",
    image: "/materials/cotton-knit.png",
    volumeKg: 64,
    pricePerKg: 128000,
    batchId: "BATCH-00001",
  },
];