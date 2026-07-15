import type { ReactElement } from "react";

export function WasteSummaryHeading(): ReactElement {
  return (
    <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-5xl font-medium leading-none tracking-[-0.05em] text-brand-black sm:text-6xl">
          Ringkasan
        </h1>

        <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-moss">
          Kelola sisa produksi sisa kain Anda, pantau dampak penyelamatan ekologi, dan hubungkan dengan ekosistem daur ulang MURI.
        </p>
      </div>
    </div>
  );
}
