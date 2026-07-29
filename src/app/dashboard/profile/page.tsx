import { UserRound } from "lucide-react";
import CustomerProfileSection from "@/components/dashboard/CustomerProfileSection";

export default function CustomerProfilePage() {
  return (
    <div className="mx-auto w-full max-w-[1320px] px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div>
        <div className="flex items-center gap-3 text-brand-emerald">
          <UserRound className="size-4" strokeWidth={2} />
          <span className="text-xs font-bold uppercase tracking-tight">
            Dashboard Customer
          </span>
        </div>

        <h1 className="mt-4 font-display text-5xl font-medium leading-none tracking-[-0.05em] text-brand-black sm:text-6xl">
          Profil Saya
        </h1>

        <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-moss">
          Kelola informasi diri, alamat pengiriman utama, kontak, serta saldo coin MURI Anda.
        </p>
      </div>

      <CustomerProfileSection />
    </div>
  );
}