import { Suspense } from "react";
import type { Metadata } from "next";
import BrandSourcingSearchSection from "@/components/brand/sourcing/BrandSourcingSearchSection";

export const metadata: Metadata = {
  title: "Cari Material Limbah | Brand Sourcing MURI",
  description: "Pencarian dan penyaringan material sisa kain daur ulang untuk kebutuhan produksi brand fashion sirkular.",
};

export default function BrandSourcingSearchPage() {
  return (
    <div className="mx-auto w-full max-w-[1320px] px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
      <Suspense fallback={<SourcingSearchLoadingFallback />}>
        <BrandSourcingSearchSection />
      </Suspense>
    </div>
  );
}

function SourcingSearchLoadingFallback() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-64 bg-canvas-warm animate-pulse rounded-md" />
      <div className="h-12 w-full bg-canvas-warm animate-pulse rounded-lg" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-64 bg-canvas-warm animate-pulse rounded-xl" />
        ))}
      </div>
    </div>
  );
}
