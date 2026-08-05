import type { ReactElement } from "react";
import { Leaf } from "lucide-react";

export function WasteSummaryHeading(): ReactElement {
  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center gap-3 text-brand-emerald">
        <Leaf className="size-4" strokeWidth={2} />
        <span className="text-xs font-bold uppercase tracking-tight">
          Dashboard Waste Provider
        </span>
      </div>

      <h1 className="font-display text-5xl font-medium leading-none tracking-[-0.04em] text-brand-black sm:text-6xl">
        Ringkasan
      </h1>

      <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-moss">
        Kelola sisa produksi sisa kain Anda, pantau dampak penyelamatan ekologi, dan hubungkan dengan ekosistem daur ulang MURI.
      </p>
    </div>
  );
}
