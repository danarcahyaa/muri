import type { ReactElement } from "react";
import { Leaf } from "lucide-react";

export interface BrandDashboardHeaderProps {
  fullName: string | null;
}

/**
 * BrandDashboardHeader renders the top greeting section and sustainability status badge.
 */
export function BrandDashboardHeader({ fullName }: BrandDashboardHeaderProps): ReactElement {
  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center gap-3 text-brand-emerald">
        <Leaf className="size-4" strokeWidth={2} />
        <span className="text-xs font-bold uppercase tracking-tight">
          Dashboard Brand
        </span>
      </div>
      <h1 className="font-display text-5xl font-medium leading-none tracking-[-0.04em] text-brand-black sm:text-6xl">
        Halo, {fullName || "Brand Partner"}
      </h1>
      <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-moss">
        Selamat datang kembali di workspace sirkular Anda. Pantau penggunaan limbah kain perca, audit produk daur ulang, dan kelola pasokan material sirkular Anda di sini.
      </p>
    </div>
  );
}
