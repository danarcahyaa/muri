import { Suspense } from "react";
import type { Metadata } from "next";
import { Settings2 } from "lucide-react";

import PurchasedInventorySection from "@/components/brand/sourcing/PurchasedInventorySection";
import { TableSkeleton } from "@/components/ui/TableSkeleton";

export const metadata: Metadata = {
  title: "Kelola Material Limbah Terbeli | Brand Dashboard MURI",
  description:
    "Daftar dan pengolahan stok material limbah kain sirkular yang telah berhasil dibeli oleh Brand Fashion.",
};

export default function PurchasedInventoryManagePage() {
  return (
    <div className="mx-auto w-full max-w-[1320px] px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
      {/* Page Header - Identical to Pembelian (Purchases) page style */}
      <div>
        <div className="flex items-center gap-2.5 text-brand-emerald">
          <Settings2 className="size-4" strokeWidth={2} />
          <span className="text-xs font-bold uppercase tracking-tight">
            Brand Sourcing
          </span>
        </div>
        <h1 className="mt-4 font-display text-5xl font-medium leading-none tracking-[-0.05em] text-brand-black sm:text-6xl">
          Kelola Inventory Limbah
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-moss">
          Kelola stok material limbah kain sirkular yang telah berhasil dibeli, pantau penggunaan stok kain pada baju, dan hapus material yang sudah habis terpakai.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="mt-8 rounded-2xl border border-brand-black/15 bg-canvas-pure p-6 sm:p-8">
            <TableSkeleton columnsCount={6} rowsCount={5} />
          </div>
        }
      >
        <PurchasedInventorySection />
      </Suspense>
    </div>
  );
}
