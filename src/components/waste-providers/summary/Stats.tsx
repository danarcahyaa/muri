import type { ReactElement } from "react";

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
      {/* Summary Metrics */}
      <section className="overflow-hidden rounded-xl border border-line-trace bg-canvas-pure">
        <div className="grid lg:grid-cols-2">
          {/* Limbah Tersalurkan */}
          <article className="flex min-h-[230px] flex-col border-b border-line-trace bg-gradient-to-r from-brand-forest to-[#315F35] p-7 text-white sm:p-9 lg:border-b-0 lg:border-r">
            <p className="text-xs font-medium uppercase text-white/55">
              Limbah Tersalurkan
            </p>

            <div className="mt-auto pt-10">
              <div className="font-display text-5xl font-normal leading-none tracking-tighter text-brand-lime sm:text-6xl">
                {showSkeleton ? (
                  <Skeleton className="h-12 w-36 bg-white/20 sm:h-14" />
                ) : (
                  formatWeightKg(stats.totalDistributedWaste)
                )}
              </div>

              <p className="mt-5 text-sm text-white/50">
                Total sisa kain produksi yang berhasil disalurkan.
              </p>
            </div>
          </article>

          {/* Berat Kain */}
          <article className="flex min-h-[230px] flex-col border-b border-line-trace bg-canvas-pure p-7 text-brand-black last:border-b-0 sm:p-9 lg:border-b-0">
            <p className="text-xs font-medium uppercase text-brand-black/70">
              Berat Kain
            </p>

            <div className="mt-auto pt-10">
              <div className="font-display text-5xl font-normal leading-none tracking-tighter text-brand-black sm:text-6xl">
                {showSkeleton ? (
                  <Skeleton className="h-12 w-36 sm:h-14" />
                ) : (
                  formatWeightKg(stats.currentFabricWeight)
                )}
              </div>

              <p className="mt-5 text-sm text-muted-moss">
                Total berat sisa kain produksi yang Anda miliki saat ini.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* Stats Metrics Grid */}
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {/* Total Pendapatan */}
        <article className="flex min-h-40 flex-col rounded-lg border border-line-trace bg-canvas-pure p-6">
          <p className="text-[11px] font-medium uppercase text-muted-moss">
            Total Pendapatan
          </p>

          <div className="mt-auto pt-8">
            <div className="font-display text-3xl font-medium tracking-tight text-brand-black">
              {showSkeleton ? (
                <Skeleton className="h-9 w-40" />
              ) : (
                formatCurrencyIDR(stats.totalIncome)
              )}
            </div>

            <p className="mt-3 text-xs text-muted-moss">
              Keseluruhan dari awal penjualan.
            </p>
          </div>
        </article>

        {/* Menunggu */}
        <article className="flex min-h-40 flex-col rounded-lg border border-line-trace bg-canvas-pure p-6">
          <p className="text-[11px] font-medium uppercase text-muted-moss">
            Menunggu
          </p>

          <div className="mt-auto pt-8">
            <div className="font-display text-3xl font-medium tracking-tight text-brand-black">
              {showSkeleton ? (
                <Skeleton className="h-9 w-28" />
              ) : (
                `${stats.pendingOrdersCount} pesanan`
              )}
            </div>

            <p className="mt-3 text-xs text-muted-moss">
              Limbah yang belum dikonfirmasi.
            </p>
          </div>
        </article>

        {/* Terjual */}
        <article className="flex min-h-40 flex-col rounded-lg border border-line-trace bg-canvas-pure p-6">
          <p className="text-[11px] font-medium uppercase text-muted-moss">
            Terjual
          </p>

          <div className="mt-auto pt-8">
            <div className="font-display text-3xl font-medium tracking-tight text-brand-black">
              {showSkeleton ? (
                <Skeleton className="h-9 w-32" />
              ) : (
                `${stats.totalTransaction} transaksi`
              )}
            </div>

            <p className="mt-3 text-xs text-muted-moss">
              Keseluruhan sisa kain terjual dari awal.
            </p>
          </div>
        </article>
      </section>
    </div>
  );
}
