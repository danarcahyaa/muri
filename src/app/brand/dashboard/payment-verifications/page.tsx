import { Leaf } from "lucide-react";

import BrandQrisVerificationSection from "@/components/brand/BrandQrisVerificationSection";

export default function BrandPaymentVerificationsPage() {
  return (
    <div className="mx-auto w-full max-w-[1320px] px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
      {/* Page Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3 text-brand-emerald">
          <Leaf className="size-4" strokeWidth={2} />
          <span className="text-xs font-bold uppercase tracking-tight">
            Dashboard Brand
          </span>
        </div>
        <h1 className="font-display text-5xl font-medium leading-none tracking-[-0.04em] text-brand-black sm:text-6xl">
          Verifikasi Pembayaran
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-moss">
          Tinjau dan verifikasi bukti pembayaran QRIS yang dikirimkan oleh customer.
        </p>
      </div>

      <BrandQrisVerificationSection />
    </div>
  );
}
