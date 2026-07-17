import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import MaterialDetailContent from "@/components/material/MaterialDetailContent";
import MaterialHero from "@/components/material/MaterialHeroDetail";
import MaterialOrderSidebar from "@/components/material/MaterialOrderSidebar";
import { sanitizeRichTextAsPlainHtml } from "@/lib/richText";
import { getMaterialBatchByCode } from "@/services/material";

interface MaterialDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Stok dan harga dapat berubah, sehingga halaman selalu dirender dinamis.
 */
export const dynamic = "force-dynamic";

/**
 * Mencegah query yang sama dijalankan dua kali dalam satu request,
 * yaitu saat generateMetadata dan saat page dirender.
 */
const getMaterial = cache((batchCode: string) =>
  getMaterialBatchByCode(batchCode),
);

export async function generateMetadata({
  params,
}: MaterialDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getMaterial(slug);

  if (!result.success || !result.data) {
    return {
      title: "Material Tidak Ditemukan | Muri",
    };
  }

  const description = sanitizeRichTextAsPlainHtml(
    result.data.descriptionHtml,
  ).slice(0, 160);

  return {
    title: `${result.data.title} | Material Sirkular Muri`,
    description:
      description ||
      `Detail batch material ${result.data.batchCode} dari ${result.data.providerName}.`,
  };
}

export default async function MaterialDetailPage({
  params,
}: MaterialDetailPageProps) {
  const { slug } = await params;
  const result = await getMaterial(slug);

  if (!result.success) {
    throw new Error(
      typeof result.error === "string"
        ? result.error
        : "Gagal mengambil detail material.",
    );
  }

  if (!result.data) {
    notFound();
  }

  const material = result.data;

  return (
    <div className="min-h-screen overflow-x-clip bg-canvas-pure text-brand-black">
      <Header />

      <main className="pt-16">
        <MaterialHero
          title={material.title}
          categoryName={material.categoryName}
          providerName={material.providerName}
        />

        <section className="bg-canvas-warm">
          <div
            className="
              mx-auto grid
              w-[min(1320px,calc(100%_-_48px))]
              gap-9 py-[clamp(64px,8vw,110px)]
              lg:grid-cols-[minmax(0,1fr)_390px]
              lg:items-start
            "
          >
            <MaterialDetailContent material={material} />

            <MaterialOrderSidebar
              slug={material.batchCode}
              pricePerKg={material.pricePerKg}
              availableKg={material.availableWeightKg}
              minimumOrderKg={material.minimumOrderKg}
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
