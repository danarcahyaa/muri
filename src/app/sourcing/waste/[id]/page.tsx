import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { WasteDetailContainer } from "@/components/sourcing/WasteDetailContainer";
import { WasteNotFound } from "@/components/sourcing/WasteNotFound";
import { getWastePostById } from "@/services/sourcing.service";
import { sanitizeRichTextAsPlainHtml } from "@/lib/richText";

interface WasteDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = "force-dynamic";

const fetchWasteDetail = cache((id: string) => getWastePostById(id));

export async function generateMetadata({
  params,
}: WasteDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await fetchWasteDetail(id);

  if (!result.success || !result.data) {
    return {
      title: "Material Limbah Tidak Ditemukan | Sourcing MURI",
      description: "Detail material limbah yang Anda cari tidak tersedia di katalog MURI.",
    };
  }

  const material = result.data;
  const plainDescription = sanitizeRichTextAsPlainHtml(
    material.detailsAndConditions
  ).slice(0, 160);

  return {
    title: `${material.customFabricName} (${material.categoryName}) | Sourcing Limbah MURI`,
    description:
      plainDescription ||
      `Beli sisa material ${material.customFabricName} dari ${material.providerName} (${material.providerLocation}). Tersedia ${material.weightKg} kg dengan harga ${material.pricePerKg}/kg.`,
  };
}

export default async function WasteDetailPage({ params }: WasteDetailPageProps) {
  const { id } = await params;
  const result = await fetchWasteDetail(id);

  if (!result.success) {
    return (
      <div className="min-h-screen flex flex-col bg-canvas-warm text-brand-black">
        <Header />
        <main className="flex-1 pt-20">
          <WasteNotFound />
        </main>
        <Footer />
      </div>
    );
  }

  if (!result.data) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-canvas-warm text-brand-black">
      <Header />
      <main className="flex-1 pt-20 sm:pt-24 pb-16">
        <WasteDetailContainer material={result.data} />
      </main>
      <Footer />
    </div>
  );
}
