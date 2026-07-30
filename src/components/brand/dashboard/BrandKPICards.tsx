import type { ReactElement } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatWeightKg } from "@/lib/formatter";
import type { BrandDashboardStats } from "@/services/brand-fashion/dashboardService";

export interface BrandKPICardsProps {
  stats: BrandDashboardStats | null;
  showSkeleton: boolean;
}

/**
 * BrandKPICards renders the top 4 KPI summary metric cards for the Brand dashboard.
 */
export function BrandKPICards({ stats, showSkeleton }: BrandKPICardsProps): ReactElement {
  const totalWaste = stats?.totalDistributedWaste ?? 0;
  const carbonSaved = stats?.carbonSavedKg ?? 0;
  const totalProducts = stats?.totalProductsCount ?? 0;
  const totalOrders = stats?.totalOrdersCount ?? 0;

  return (
    <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <article className="flex min-h-[190px] flex-col justify-between rounded-2xl border border-brand-black/15 bg-gradient-to-br from-brand-forest to-[#315F35] p-6 text-white">
        <p className="text-[11px] font-medium uppercase tracking-wider text-white/60">
          Limbah Terselamatkan
        </p>
        <div className="mt-6">
          <div className="font-display text-4xl font-medium leading-none tracking-tight text-brand-lime sm:text-5xl">
            {showSkeleton ? (
              <Skeleton className="h-10 w-28 bg-white/20" />
            ) : (
              formatWeightKg(totalWaste)
            )}
          </div>
          <p className="mt-2 text-xs text-white/50">
            Total seluruh limbah yang dibeli dari awal
          </p>
        </div>
      </article>

      <article className="flex min-h-[190px] flex-col justify-between rounded-2xl border border-brand-black/15 bg-gradient-to-br from-brand-forest to-[#315F35] p-6 text-brand-black transition">
        <p className="text-[11px] font-medium uppercase tracking-wider text-white/60">
          Emisi CO2 Terhindar
        </p>
        <div className="mt-6">
          <div className="font-display text-4xl font-medium leading-none tracking-tight text-brand-lime sm:text-5xl">
            {showSkeleton ? (
              <Skeleton className="h-10 w-28 bg-white/20" />
            ) : (
              formatWeightKg(carbonSaved)
            )}
          </div>
          <p className="mt-2 text-xs text-white/50">
            Kontribusi penyelamatan lingkungan
          </p>
        </div>
      </article>

      <article className="flex min-h-[190px] flex-col justify-between rounded-2xl border border-brand-black/15 bg-canvas-pure p-6 text-brand-black transition">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-moss">
          Total
        </p>
        <div className="mt-6">
          <div className="font-display text-4xl font-medium leading-none tracking-tight text-brand-black sm:text-5xl">
            {showSkeleton ? (
              <Skeleton className="h-10 w-24" />
            ) : (
              `${totalProducts} Item`
            )}
          </div>
          <p className="mt-2 text-xs text-muted-moss">
            Total produk kamu saat ini
          </p>
        </div>
      </article>

      <article className="flex min-h-[190px] flex-col justify-between rounded-2xl border border-brand-black/15 bg-canvas-pure p-6 text-brand-black transition">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-moss">
          Pesanan Masuk
        </p>
        <div className="mt-6">
          <div className="font-display text-4xl font-medium leading-none tracking-tight text-brand-black sm:text-5xl">
            {showSkeleton ? (
              <Skeleton className="h-10 w-24" />
            ) : (
              `${totalOrders} Pesanan`
            )}
          </div>
          <p className="mt-2 text-xs text-muted-moss">
            Pesanan produk dari pembeli
          </p>
        </div>
      </article>
    </section>
  );
}
