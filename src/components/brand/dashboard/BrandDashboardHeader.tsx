import type { ReactElement } from "react";

export interface BrandDashboardHeaderProps {
  fullName: string | null;
}

/**
 * BrandDashboardHeader renders the top greeting section and sustainability status badge.
 */
export function BrandDashboardHeader({ fullName }: BrandDashboardHeaderProps): ReactElement {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="font-display text-4xl font-bold leading-none tracking-[-0.04em] text-brand-black sm:text-5xl">
          Halo, {fullName || "Brand Partner"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-moss max-w-xl">
          Selamat datang kembali di workspace sirkular Anda. Pantau penggunaan limbah kain perca, audit produk daur ulang, dan kelola pasokan material sirkular Anda di sini.
        </p>
      </div>
    </div>
  );
}
