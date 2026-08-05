"use client";

import { useState, useEffect, type ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, Leaf } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSavedMaterials } from "@/hooks/useSavedMaterials";
import type { SourcingWastePostDetailItem } from "@/types/sourcing";
import { WasteImageGallery } from "./WasteImageGallery";
import { WasteMainInfo } from "./WasteMainInfo";
import { WasteRichDescription } from "./WasteRichDescription";
import { WasteCheckoutCard } from "./WasteCheckoutCard";

interface WasteDetailContainerProps {
  material: SourcingWastePostDetailItem;
}

export function WasteDetailContainer({
  material,
}: WasteDetailContainerProps): ReactElement {
  const router = useRouter();
  const { savedPostIds, toggleSave } = useSavedMaterials();
  const [isSaved, setIsSaved] = useState<boolean>(Boolean(material.isSaved));

  // Sync isSaved state with Supabase savedPostIds
  useEffect(() => {
    if (savedPostIds.has(material.id)) {
      setIsSaved(true);
    } else {
      setIsSaved(Boolean(material.isSaved));
    }
  }, [savedPostIds, material.id, material.isSaved]);

  // Reset viewport scroll to top smoothly when material detail mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [material.id]);

  const handleToggleSave = async (): Promise<void> => {
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);

    await toggleSave({
      id: material.id,
      customFabricName: material.customFabricName,
      categoryName: material.categoryName,
      pricePerKg: material.pricePerKg,
      minimumOrderKg: material.minimumOrderKg,
      weightKg: material.weightKg,
      detailsAndConditions: material.detailsAndConditions,
      status: material.status,
      providerName: material.providerName,
      providerLocation: material.providerLocation,
      imageUrl: material.imageUrl,
      createdAt: material.createdAt,
    });
  };

  const handleBack = (): void => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/brand/dashboard/sourcing/search");
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1320px] px-5 py-10 sm:px-6 lg:px-8 lg:py-14 space-y-8 animate-in fade-in duration-300">
      {/* Canonical Brand Dashboard Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3 text-brand-emerald">
          <Leaf className="size-4" strokeWidth={2} />
          <span className="text-xs font-bold uppercase tracking-tight">
            Brand Sourcing
          </span>
        </div>
        <h1 className="font-display text-5xl font-medium leading-none tracking-[-0.04em] text-brand-black sm:text-6xl">
          Detail Material Limbah
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-moss">
          Informasi lengkap spesifikasi material kain perca, estimasi dampak ekologis, dan pemesanan bahan baku sirkular.
        </p>
      </div>

      {/* Top Back Button & Navigation Bar */}
      <div className="flex items-center justify-between gap-4 border-b border-brand-black/10 pb-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleBack}
          className="h-9 px-3.5 text-xs font-semibold border-brand-black/15 bg-canvas-pure hover:bg-canvas-warm text-brand-black rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-none"
        >
          <ArrowLeft className="size-4 text-brand-forest" />
          <span>Kembali ke Pencarian</span>
        </Button>

        {/* Breadcrumb Navigation */}
        <nav className="hidden sm:flex items-center gap-2 text-xs text-muted-moss">
          <Link
            href="/brand/dashboard/sourcing/search"
            className="hover:text-brand-forest transition-colors font-medium"
          >
            Sourcing
          </Link>
          <ChevronRight className="size-3 text-line-trace" />
          <span className="text-brand-black/70 font-semibold">{material.categoryName}</span>
          <ChevronRight className="size-3 text-line-trace" />
          <span className="text-brand-black font-bold truncate max-w-[180px]">
            {material.customFabricName}
          </span>
        </nav>
      </div>

      {/* Responsive Multi-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Main Content Viewport) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          {/* Gallery Component */}
          <WasteImageGallery
            mediaList={material.mediaList}
            customFabricName={material.customFabricName}
            categoryName={material.categoryName}
            fallbackImageUrl={material.imageUrl || undefined}
          />

          {/* Basic & Specifications Information */}
          <WasteMainInfo material={material} />

          {/* HTML Rich Text Description */}
          <WasteRichDescription detailsAndConditions={material.detailsAndConditions} />
        </div>

        {/* Right Column (Sticky Mini-Checkout Panel) */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-20 lg:self-start z-20">
          <WasteCheckoutCard
            material={material}
            isSaved={isSaved}
            onToggleSave={handleToggleSave}
          />
        </div>
      </div>
    </div>
  );
}
