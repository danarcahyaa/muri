import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import ProductDetailContent from "@/components/product/ProductDetailContent";
import ProductDetailHero from "@/components/product/ProductDetailHero";
import ProductOrderSidebar from "@/components/product/ProductOrderSidebar";
import { decodeProductSlug } from "@/lib/productDetail";
import { sanitizeRichTextAsPlainHtml } from "@/lib/richText";
import { getProductBySku } from "@/services/product";

interface ProductDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Harga, stok, bonus, dan status produk dapat berubah.
 */
export const dynamic = "force-dynamic";

/**
 * Mencegah query detail yang sama dijalankan dua kali saat metadata dan page
 * dirender dalam request yang sama.
 */
const getProduct = cache((sku: string) => getProductBySku(sku));

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const sku = decodeProductSlug(slug);
  const result = await getProduct(sku);

  if (!result.success || !result.data) {
    return {
      title: "Produk Tidak Ditemukan | Muri",
      description: "Produk yang Anda cari tidak tersedia.",
    };
  }

  const description = result.data.descriptionHtml
    ? sanitizeRichTextAsPlainHtml(result.data.descriptionHtml).slice(0, 160)
    : "";

  return {
    title: `${result.data.name} | Produk Muri`,
    description:
      description ||
      `Produk sirkular ${result.data.name} dari ${result.data.brand.name}.`,
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const sku = decodeProductSlug(slug);
  const result = await getProduct(sku);

  if (!result.success) {
    throw new Error(
      typeof result.error === "string"
        ? result.error
        : "Gagal mengambil detail produk.",
    );
  }

  if (!result.data) {
    notFound();
  }

  const product = result.data;

  return (
    <div className="min-h-screen overflow-x-clip bg-canvas-pure text-brand-black">
      <Header />

      <main className="pt-16">
        <ProductDetailHero
          title={product.name}
          descriptionHtml={product.descriptionHtml}
          brandName={product.brand.name}
          categoryName={product.categoryName}
          paymentOption={product.paymentOption}
          priceIdr={product.priceIdr}
        />

        <section className="bg-canvas-warm/45">
          <div
            className="
              mx-auto grid
              w-[min(1320px,calc(100%_-_48px))]
              gap-9 py-[clamp(64px,8vw,110px)]
              lg:grid-cols-[minmax(0,1fr)_390px]
              lg:items-start
            "
          >
            <ProductDetailContent product={product} />

            <ProductOrderSidebar
              slug={product.slug}
              productName={product.name}
              paymentOption={product.paymentOption}
              priceIdr={product.priceIdr}
              stock={product.stock}
              bonusProduct={product.bonusProduct}
              bonusProductQty={product.bonusProductQty}
              bonusCoinCost={product.bonusCoinCost}
              productionId={product.productionId}
              qrCodeUrl={product.qrCodeUrl}
              brandName={product.brand.name}
              carbonSavedKg={product.carbonSavedKg}
              waterSavedLiter={product.waterSavedLiter}
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
