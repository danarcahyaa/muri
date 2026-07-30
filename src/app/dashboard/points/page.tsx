import { Coins } from "lucide-react";
import CustomerPointsSection from "@/components/dashboard/CustomerPointsSection";

export default function CustomerPointsPage() {
  return (
    <div className="mx-auto w-full max-w-[1320px] px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div>
        <div className="flex items-center gap-2 text-brand-emerald">
          <Coins className="size-4" strokeWidth={2} />
          <span className="text-xs font-bold uppercase tracking-tight">
            Dashboard Customer
          </span>
        </div>
        <h1 className="mt-4 font-display text-5xl font-medium leading-none tracking-[-0.04em] text-brand-black sm:text-6xl">
          Poin Saya
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-moss">
          Pantau saldo coin dan riwayat transaksi poin Anda.
        </p>
      </div>

      <CustomerPointsSection />
    </div>
  );
}