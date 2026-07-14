export interface CircularProduct {
  slug: string;
  name: string;
  brand: string;
  badge: string;
  description: string;
  price: number;
  image: string;
}

export const circularProducts: CircularProduct[] = [
  {
    slug: "kemeja-casual-upcycled-denim",
    name: "Kemeja Casual Upcycled Denim",
    brand: "Re-Wear Project",
    badge: "2 Produk Gratis",
    description:
      "Dibuat dari 100% kombinasi kain denim tak terpakai dengan jahitan yang diperkuat.",
    price: 834000,
    image: "/products/upcycled-denim-shirt.png",
  },
  {
    slug: "tote-bag-kanvas-serat-alam",
    name: "Tote Bag Kanvas Serat Alam",
    brand: "EcoStitch Studio",
    badge: "100% Organik",
    description:
      "Tas serbaguna berdaya tampung besar memanfaatkan sisa potongan kain kanvas pabrik.",
    price: 49000,
    image: "/products/natural-canvas-bag.png",
  },
  {
    slug: "blouse-motif-bunga-ramah-lingkungan",
    name: "Blouse Motif Bunga Ramah Lingkungan",
    brand: "Toko Kelontong",
    badge: "100% Organik",
    description:
      "Atasan wanita elegan hasil konversi kain sisa industri yang disterilisasi ulang.",
    price: 599000,
    image: "/products/floral-upcycled-blouse.png",
  },
  {
    slug: "jaket-patchwork-denim",
    name: "Jaket Patchwork Denim",
    brand: "Recrafted Goods",
    badge: "Upcycled",
    description:
      "Jaket edisi terbatas dari perpaduan potongan denim pascaproduksi.",
    price: 725000,
    image: "/products/patchwork-denim-jacket.png",
  },
  {
    slug: "pouch-tekstil-daur-ulang",
    name: "Pouch Tekstil Daur Ulang",
    brand: "Sisa Karya",
    badge: "Limbah Minimum",
    description:
      "Pouch multifungsi yang dibuat dari sisa kain pilihan dengan proses produksi rendah limbah.",
    price: 125000,
    image: "/products/recycled-textile-pouch.png",
  },
  {
    slug: "celana-kargo-upcycled",
    name: "Celana Kargo Upcycled",
    brand: "Loop Fashion",
    badge: "Edisi Terbatas",
    description:
      "Celana kargo kontemporer dari tekstil deadstock yang telah melalui proses kurasi.",
    price: 465000,
    image: "/products/upcycled-cargo-pants.png",
  },
];