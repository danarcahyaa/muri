import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { WasteDetailContainer } from "@/components/sourcing/WasteDetailContainer";
import { WasteNotFound } from "@/components/sourcing/WasteNotFound";
import { getWastePostById } from "@/services/sourcing.service";
import { sanitizeRichTextAsPlainHtml } from "@/lib/richText";

interface BrandWasteDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = "force-dynamic";

const fetchWasteDetail = cache((id: string) => getWastePostById(id));

export async function generateMetadata({
  params,
}: BrandWasteDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await fetchWasteDetail(id);

  if (!result.success || !result.data) {
    return {
      title: "Material Limbah Tidak Ditemukan | Brand Sourcing MURI",
      description: "Detail material limbah yang Anda cari tidak tersedia di katalog Sourcing MURI.",
    };
  }

  const material = result.data;
  const plainDescription = sanitizeRichTextAsPlainHtml(
    material.detailsAndConditions
  ).slice(0, 160);

  return {
    title: `${material.customFabricName} (${material.categoryName}) | Brand Sourcing MURI`,
    description:
      plainDescription ||
      `Beli sisa material ${material.customFabricName} dari ${material.providerName} (${material.providerLocation}). Tersedia ${material.weightKg} kg dengan harga ${material.pricePerKg}/kg.`,
  };
}

export default async function BrandWasteDetailPage({
  params,
}: BrandWasteDetailPageProps) {
  const { id } = await params;
  const result = await fetchWasteDetail(id);

  if (!result.success) {
    return (
      <div className="p-6">
        <WasteNotFound />
      </div>
    );
  }

  if (!result.data) {
    notFound();
  }

  return (
    <div className="w-full">
      <WasteDetailContainer material={result.data} />
    </div>
  );
}
