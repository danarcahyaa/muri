import { Leaf } from "lucide-react";
import BrandPatchworkSection from "@/components/brand/patchwork/BrandPatchworkSection";

export default function BrandPatchworkPage() {
  return (
    <div className="mx-auto w-full max-w-[1320px] px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3 text-brand-emerald">
          <Leaf className="size-4" strokeWidth={2} />
          <span className="text-xs font-bold uppercase tracking-tight">
            Brand Innovation
          </span>
        </div>
        <h1 className="font-display text-5xl font-medium leading-none tracking-[-0.04em] text-brand-black sm:text-6xl">
          Patchwork AI
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-moss">
          Manfaatkan fitur kecerdasan buatan MURI untuk memproses limbah kain sisa menjadi rekomendasi pola patchwork dan desain busana sirkular modern.
        </p>
      </div>

      <BrandPatchworkSection />
    </div>
  );
}
