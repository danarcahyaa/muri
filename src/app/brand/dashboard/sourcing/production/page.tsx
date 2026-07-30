import { Factory } from "lucide-react";
import BrandProductionSection from "@/components/brand/sourcing/BrandProductionSection";

export default function BrandProductionPage() {
  return (
    <div className="mx-auto w-full max-w-[1320px] px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 text-brand-emerald">
          <Factory className="size-4" strokeWidth={2} />
          <span className="text-xs font-bold uppercase tracking-tight">
            Brand Sourcing
          </span>
        </div>
        <h1 className="mt-4 font-display text-5xl font-medium leading-none tracking-[-0.05em] text-brand-black sm:text-6xl">
          Manajemen Produksi
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-moss">
          Kelola alokasi dan progres tahapan produksi sisa kain limbah yang Anda beli dari Waste Provider.
        </p>
      </div>

      <BrandProductionSection />
    </div>
  );
}
