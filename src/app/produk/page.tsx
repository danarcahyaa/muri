import type { Metadata } from "next";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import ProductCatalogSection from "@/components/product/ProductCatalogSection";
import ProductHero from "@/components/product/ProductHero";
import { getPublicProducts } from "@/services/product";

export const metadata: Metadata = {
  title: "Produk Fashion Sirkular | Muri",
  description:
    "Temukan produk fashion upcycled dan ramah lingkungan hasil kreasi ekosistem sirkular Muri.",
};

/**
 * Stok, harga, dan status produk dapat berubah.
 */
export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const productResponse = await getPublicProducts();
  const hasLoadError = !productResponse.success;
  const products = productResponse.success
    ? (productResponse.data ?? [])
    : [];

  if (!productResponse.success) {
    console.error(
      "[ProductsPage] Failed to fetch products:",
      productResponse.error,
    );
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-canvas-pure text-brand-black">
      <Header />

      <main className="pt-16">
        <ProductHero />

        <ProductCatalogSection
          products={products}
          hasLoadError={hasLoadError}
        />
      </main>

      <Footer />
    </div>
  );
}
