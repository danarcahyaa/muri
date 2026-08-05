import type { ReactElement } from "react";
import { DollarSign, Clock, CheckCheck, Leaf, Weight } from "lucide-react";

import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrencyIDR, formatWeightKg } from "@/lib/formatter";
import { DashboardStatsData } from "@/types/wasteProvider";

interface SummaryStatsProps {
  stats: DashboardStatsData | null;
  isLoading?: boolean;
}

export function WasteSummaryStats({
  stats,
  isLoading = false,
}: SummaryStatsProps): ReactElement {
  const showSkeleton = isLoading || !stats;

  return (
    <div className="mt-10 space-y-6">
      {/* Top Summary — 2 besar card: Limbah Tersalurkan + Berat Kain */}
      <div className="overflow-hidden rounded-2xl border border-brand-black/15 bg-canvas-pure">
        <div className="grid lg:grid-cols-2">
          {/* Limbah Tersalurkan */}
          <div className="flex min-h-[220px] flex-col border-b border-brand-black/15 bg-gradient-to-br from-brand-forest to-[#315F35] p-7 text-white sm:p-9 lg:border-b-0 lg:border-r lg:border-r-white/15">
            <div className="flex items-start justify-between gap-4">
              <p className="text-[11px] font-medium uppercase tracking-wider text-white/60">
                Limbah Tersalurkan
              </p>
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-brand-lime">
                <Leaf className="size-4" strokeWidth={1.8} />
              </div>
            </div>

            <div className="mt-auto pt-8">
              <div className="font-display text-4xl font-medium leading-none tracking-tight text-brand-lime">
                {showSkeleton ? (
                  <Skeleton className="h-10 w-32 bg-white/20" />
                ) : (
                  formatWeightKg(stats.totalDistributedWaste)
                )}
              </div>
              <p className="mt-3 text-xs text-white/50">
                Total sisa kain produksi yang berhasil disalurkan.
              </p>
            </div>
          </div>

          {/* Berat Kain */}
          <div className="flex min-h-[220px] flex-col border-b border-brand-black/15 bg-canvas-pure p-7 text-brand-black last:border-b-0 sm:p-9 lg:border-b-0">
            <div className="flex items-start justify-between gap-4">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-moss">
                Berat Kain
              </p>
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-lime/35 text-brand-forest">
                <Weight className="size-4" strokeWidth={1.8} />
              </div>
            </div>

            <div className="mt-auto pt-8">
              <div className="font-display text-4xl font-medium leading-none tracking-tight text-brand-black">
                {showSkeleton ? (
                  <Skeleton className="h-10 w-32" />
                ) : (
                  formatWeightKg(stats.currentFabricWeight)
                )}
              </div>
              <p className="mt-3 text-xs text-muted-moss">
                Total berat sisa kain produksi yang Anda miliki saat ini.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Metrics Grid — 3 card kecil */}
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {/* Total Pendapatan */}
        <article className="flex min-h-40 flex-col rounded-2xl border border-brand-black/15 bg-canvas-pure p-6">
          <div className="flex items-start justify-between gap-4">
            <p className="text-[11px] font-medium uppercase text-muted-moss">
              Total Pendapatan
            </p>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-lime/35 text-brand-forest">
              <DollarSign className="size-4" strokeWidth={1.8} />
            </div>
          </div>
          <div className="mt-auto pt-8">
            <div className="font-display text-3xl font-medium tracking-tight text-brand-black">
              {showSkeleton ? (
                <Skeleton className="h-8 w-36" />
              ) : (
                formatCurrencyIDR(stats.totalIncome)
              )}
            </div>
            <p className="mt-3 text-xs text-muted-moss">
              dari awal penjualan
            </p>
          </div>
        </article>

        {/* Menunggu */}
        <article className="flex min-h-40 flex-col rounded-2xl border border-brand-black/15 bg-canvas-pure p-6">
          <div className="flex items-start justify-between gap-4">
            <p className="text-[11px] font-medium uppercase text-muted-moss">
              Menunggu
            </p>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-lime/35 text-brand-forest">
              <Clock className="size-4" strokeWidth={1.8} />
            </div>
          </div>
          <div className="mt-auto pt-8">
            <div className="font-display text-3xl font-medium tracking-tight text-brand-black">
              {showSkeleton ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                `${stats.pendingOrdersCount}`
              )}
            </div>
            <p className="mt-3 text-xs text-muted-moss">
              pesanan belum dikonfirmasi
            </p>
          </div>
        </article>

        {/* Terjual */}
        <article className="flex min-h-40 flex-col rounded-2xl border border-brand-black/15 bg-canvas-pure p-6">
          <div className="flex items-start justify-between gap-4">
            <p className="text-[11px] font-medium uppercase text-muted-moss">
              Terjual
            </p>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-lime/35 text-brand-forest">
              <CheckCheck className="size-4" strokeWidth={1.8} />
            </div>
          </div>
          <div className="mt-auto pt-8">
            <div className="font-display text-3xl font-medium tracking-tight text-brand-black">
              {showSkeleton ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                `${stats.totalTransaction}`
              )}
            </div>
            <p className="mt-3 text-xs text-muted-moss">
              transaksi dari awal
            </p>
          </div>
        </article>
      </section>
    </div>
  );
}
