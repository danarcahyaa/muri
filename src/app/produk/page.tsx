import type { Metadata } from "next";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductHero from "@/components/product/ProductHero";
import ProductCatalogSection from "@/components/product/ProductCatalogSection";

export const metadata: Metadata = {
  title: "Produk Fashion Sirkular | Muri",
  description:
    "Temukan produk fashion upcycled dan ramah lingkungan hasil kreasi ekosistem sirkular Muri.",
};

export default function ProductsPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-canvas-pure text-brand-black">
      <Header />

      <main className="pt-16">
        <ProductHero />
        <ProductCatalogSection />
      </main>

      <Footer />
    </div>
  );
}