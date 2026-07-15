import type { ReactElement } from "react";
import { DashboardStatsData } from "@/types/wasteProvider";
import { formatCurrencyIDR, formatWeightKg } from "@/lib/formatter";
import { Skeleton } from "@/components/ui/skeleton";

interface SummaryStatsProps {
  stats: DashboardStatsData | null;
  isLoading?: boolean;
}

export function WasteSummaryStats({ stats, isLoading = false }: SummaryStatsProps): ReactElement {
  return (
    <div className="mt-10 space-y-6">
      {/* Summary Metrics */}
      <section className="overflow-hidden rounded-xl border border-line-trace bg-canvas-pure">
        <div className="grid lg:grid-cols-2">
          {/* Limbah Tersalurkan (Featured Card) */}
          <article className="flex min-h-[230px] flex-col border-b border-line-trace p-7 sm:p-9 lg:border-b-0 lg:border-r bg-gradient-to-r from-brand-forest to-[#315F35] text-white">
            <p className="text-xs font-medium uppercase text-white/55">
              Limbah Tersalurkan
            </p>
            <div className="mt-auto pt-10">
              <p className="font-display text-5xl font-normal leading-none tracking-tighter sm:text-6xl text-brand-lime">
                {isLoading || !stats ? (
                  <Skeleton className="h-12 sm:h-14 w-36 bg-white/20" />
                ) : (
                  formatWeightKg(stats.totalDistributedWaste)
                )}
              </p>
              <p className="mt-5 text-sm text-white/50">
                Total sisa kain produksi yang berhasil disalurkan.
              </p>
            </div>
          </article>

          {/* Berat Kain */}
          <article className="flex min-h-[230px] flex-col border-b border-line-trace p-7 sm:p-9 lg:border-b-0 bg-canvas-pure text-brand-black last:border-b-0">
            <p className="text-xs font-medium uppercase text-brand-black/70">
              Berat Kain
            </p>
            <div className="mt-auto pt-10">
              <p className="font-display text-5xl font-normal leading-none tracking-tighter sm:text-6xl text-brand-black">
                {isLoading || !stats ? (
                  <Skeleton className="h-12 sm:h-14 w-36" />
                ) : (
                  formatWeightKg(stats.currentFabricWeight)
                )}
              </p>
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
            <p className="font-display text-3xl font-medium tracking-tight text-brand-black">
              {isLoading || !stats ? (
                <Skeleton className="h-9 w-40" />
              ) : (
                formatCurrencyIDR(stats.totalIncome)
              )}
            </p>
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
            <p className="font-display text-3xl font-medium tracking-tight text-brand-black">
              {isLoading || !stats ? (
                <Skeleton className="h-9 w-28" />
              ) : (
                `${stats.pendingOrdersCount} pesanan`
              )}
            </p>
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
            <p className="font-display text-3xl font-medium tracking-tight text-brand-black">
              {isLoading || !stats ? (
                <Skeleton className="h-9 w-32" />
              ) : (
                `${stats.totalTransaction} transaksi`
              )}
            </p>
            <p className="mt-3 text-xs text-muted-moss">
              Keseluruhan sisa kain terjual dari awal.
            </p>
          </div>
        </article>
      </section>
    </div>
  );
}
