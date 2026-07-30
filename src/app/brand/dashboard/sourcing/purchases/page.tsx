import { CreditCard } from "lucide-react";

import BrandMaterialPurchasesSection from "@/components/brand/sourcing/BrandMaterialPurchasesSection";

export default function BrandMaterialPurchasesPage() {
  return (
    <div className="mx-auto w-full max-w-[1320px] px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2.5 text-brand-emerald">
          <CreditCard className="size-4" strokeWidth={2} />
          <span className="text-xs font-bold uppercase tracking-tight">
            Brand Sourcing
          </span>
        </div>
        <h1 className="mt-4 font-display text-5xl font-medium leading-none tracking-[-0.05em] text-brand-black sm:text-6xl">
          Pembelian Material
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-moss">
          Pantau seluruh riwayat transaksi pembelian limbah kain sirkular dari Waste Provider.
        </p>
      </div>

      <BrandMaterialPurchasesSection />
    </div>
  );
}
