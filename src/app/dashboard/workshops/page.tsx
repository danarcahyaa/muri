import Link from "next/link";
import {
  ArrowRight,
  Leaf,
} from "lucide-react";

import CustomerWorkshopHistorySection from "@/components/dashboard/CustomerWorkshopHistorySection";

export default function CustomerWorkshopsPage() {
  return (
    <div className="mx-auto w-full max-w-[1320px] px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mb-8 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-4 flex items-center gap-3 text-brand-emerald">
            <Leaf
              className="size-4"
              strokeWidth={2}
            />

            <span className="text-xs font-bold uppercase tracking-tight">
              Dashboard Customer
            </span>
          </div>

          <h1 className="font-display text-5xl font-medium leading-none tracking-[-0.04em] text-brand-black sm:text-6xl">
            Workshop Saya
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-moss">
            Pantau workshop mendatang, status
            pendaftaran, serta seluruh riwayat
            workshop Anda.
          </p>
        </div>

        <Link
          href="/edukasi"
          className="
            group inline-flex w-fit
            items-center justify-center
            gap-2 rounded-md
            bg-brand-black px-6 py-4
            text-xs font-bold text-white
            transition
            hover:-translate-y-0.5
            hover:bg-brand-forest
          "
        >
          Cari Workshop

          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <CustomerWorkshopHistorySection />
    </div>
  );
}