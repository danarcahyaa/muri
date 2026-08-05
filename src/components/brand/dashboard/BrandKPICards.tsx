import type { ReactElement } from "react";
import { Leaf, Wind, Package, ShoppingBag } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatWeightKg } from "@/lib/formatter";
import type { BrandDashboardStats } from "@/services/brand-fashion/dashboardService";

export interface BrandKPICardsProps {
  stats: BrandDashboardStats | null;
  showSkeleton: boolean;
}

/**
 * BrandKPICards renders the top 4 KPI summary metric cards for the Brand dashboard.
 * Style follows the Customer Dashboard ActivityMetricCard pattern for visual consistency.
 */
export function BrandKPICards({ stats, showSkeleton }: BrandKPICardsProps): ReactElement {
  const totalWaste = stats?.totalDistributedWaste ?? 0;
  const carbonSaved = stats?.carbonSavedKg ?? 0;
  const totalProducts = stats?.totalProductsCount ?? 0;
  const totalOrders = stats?.totalOrdersCount ?? 0;

  return (
    <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {/* Limbah Terselamatkan */}
      <article className="flex min-h-40 flex-col rounded-2xl border border-brand-black/15 bg-canvas-pure p-6">
        <div className="flex items-start justify-between gap-4">
          <p className="text-[11px] font-medium uppercase text-muted-moss">
            Limbah Terselamatkan
          </p>
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-lime/35 text-brand-forest">
            <Leaf className="size-4" strokeWidth={1.8} />
          </div>
        </div>
        <div className="mt-auto pt-8">
          <div className="font-display text-3xl font-medium tracking-tight text-brand-black">
            {showSkeleton ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              formatWeightKg(totalWaste)
            )}
          </div>
          <p className="mt-3 text-xs text-muted-moss">
            Total limbah yang dibeli dari awal
          </p>
        </div>
      </article>

      {/* Emisi CO2 Terhindar */}
      <article className="flex min-h-40 flex-col rounded-2xl border border-brand-black/15 bg-canvas-pure p-6">
        <div className="flex items-start justify-between gap-4">
          <p className="text-[11px] font-medium uppercase text-muted-moss">
            Emisi CO2 Terhindar
          </p>
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-lime/35 text-brand-forest">
            <Wind className="size-4" strokeWidth={1.8} />
          </div>
        </div>
        <div className="mt-auto pt-8">
          <div className="font-display text-3xl font-medium tracking-tight text-brand-black">
            {showSkeleton ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              formatWeightKg(carbonSaved)
            )}
          </div>
          <p className="mt-3 text-xs text-muted-moss">
            Kontribusi penyelamatan lingkungan
          </p>
        </div>
      </article>

      {/* Total Produk */}
      <article className="flex min-h-40 flex-col rounded-2xl border border-brand-black/15 bg-canvas-pure p-6">
        <div className="flex items-start justify-between gap-4">
          <p className="text-[11px] font-medium uppercase text-muted-moss">
            Total Produk
          </p>
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-lime/35 text-brand-forest">
            <Package className="size-4" strokeWidth={1.8} />
          </div>
        </div>
        <div className="mt-auto pt-8">
          <div className="font-display text-3xl font-medium tracking-tight text-brand-black">
            {showSkeleton ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              `${totalProducts}`
            )}
          </div>
          <p className="mt-3 text-xs text-muted-moss">
            item produk saat ini
          </p>
        </div>
      </article>

      {/* Pesanan Masuk */}
      <article className="flex min-h-40 flex-col rounded-2xl border border-brand-black/15 bg-canvas-pure p-6">
        <div className="flex items-start justify-between gap-4">
          <p className="text-[11px] font-medium uppercase text-muted-moss">
            Pesanan Masuk
          </p>
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-lime/35 text-brand-forest">
            <ShoppingBag className="size-4" strokeWidth={1.8} />
          </div>
        </div>
        <div className="mt-auto pt-8">
          <div className="font-display text-3xl font-medium tracking-tight text-brand-black">
            {showSkeleton ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              `${totalOrders}`
            )}
          </div>
          <p className="mt-3 text-xs text-muted-moss">
            pesanan produk dari pembeli
          </p>
        </div>
      </article>
    </section>
  );
}
