import type { ReactElement } from "react";
import { Sprout, Leaf, Droplets } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import type { BrandDashboardStats } from "@/services/brand-fashion/dashboardService";

export interface EarthImpactMetricsProps {
  stats: BrandDashboardStats | null;
  showSkeleton: boolean;
}

/**
 * EarthImpactMetrics displays the side-by-side environmental impact metrics (Carbon Offset & Water Saved).
 */
export function EarthImpactMetrics({ stats, showSkeleton }: EarthImpactMetricsProps): ReactElement {
  const carbonSaved = stats?.carbonSavedKg ?? 0;
  const waterSaved = stats?.waterSavedLiters ?? 0;

  return (
    <section className="lg:col-span-2 rounded-2xl border border-brand-black/15 bg-canvas-pure p-6 sm:p-8 space-y-6">
      <div>
        <h2 className="font-display text-lg font-bold text-brand-black flex items-center gap-2">
          <Sprout className="size-5 text-brand-emerald" />
          Metrik Penyelamatan Bumi
        </h2>
        <p className="text-xs text-muted-moss mt-1">
          Dua angka konversi dampak penyelamatan bumi dari penggunaan material daur ulang Anda.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 pt-2">
        {/* Carbon Offset */}
        <div className="rounded-xl bg-canvas-warm/50 border border-brand-black/15 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-emerald">Carbon Offset</p>
              <div className="p-1.5 rounded-full bg-brand-lime">
                <Leaf className="size-3" />
              </div>
            </div>
            <p className="font-display text-3xl font-medium tracking-tight text-brand-black mt-3 sm:text-4xl">
              {showSkeleton ? <Skeleton className="h-7 w-24" /> : `${carbonSaved.toFixed(1)} Kg`}
            </p>
          </div>
          <p className="text-[10px] text-muted-moss mt-3">Mengurangi emisi karbon gas rumah kaca global.</p>
        </div>

        {/* Water Saved */}
        <div className="rounded-xl bg-canvas-warm/50 border border-brand-black/15 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-emerald">Water Saved</p>
              <div className="p-1.5 rounded-full bg-brand-lime">
                <Droplets className="size-3" />
              </div>
            </div>
            <p className="font-display text-3xl font-medium tracking-tight text-brand-black mt-3 sm:text-4xl">
              {showSkeleton ? <Skeleton className="h-7 w-24" /> : `${waterSaved.toLocaleString("id-ID")} Liter`}
            </p>
          </div>
          <p className="text-[10px] text-muted-moss mt-3">Menghemat konsumsi air bersih industri pakaian.</p>
        </div>
      </div>
    </section>
  );
}
