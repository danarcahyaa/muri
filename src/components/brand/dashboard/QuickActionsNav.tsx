import type { ReactElement } from "react";
import Link from "next/link";
import { Search, Package, Hammer, ArrowRight } from "lucide-react";

/**
 * QuickActionsNav renders quick access navigation buttons for the Brand dashboard.
 */
export function QuickActionsNav(): ReactElement {
  return (
    <section className="rounded-lg border border-line-trace bg-canvas-pure p-6 space-y-4">
      <h2 className="font-display text-lg font-bold text-brand-black">Aksi Cepat</h2>
      
      <nav aria-label="Menu Aksi Cepat" className="flex flex-col gap-2.5">
        <Link
          href="/brand/dashboard/sourcing/search"
          className="flex items-center justify-between rounded-sm border border-line-trace bg-canvas-pure p-3.5 text-xs font-semibold text-brand-black transition hover:border-brand-emerald hover:bg-canvas-warm/30 group"
        >
          <span className="flex items-center gap-3">
            <Search className="size-4 text-brand-emerald" />
            Cari Bahan Baku Sisa
          </span>
          <ArrowRight className="size-4 text-muted-moss transition group-hover:translate-x-1" />
        </Link>

        <Link
          href="/brand/dashboard/products"
          className="flex items-center justify-between rounded-sm border border-line-trace bg-canvas-pure p-3.5 text-xs font-semibold text-brand-black transition hover:border-brand-emerald hover:bg-canvas-warm/30 group"
        >
          <span className="flex items-center gap-3">
            <Package className="size-4 text-brand-emerald" />
            Kelola Produk
          </span>
          <ArrowRight className="size-4 text-muted-moss transition group-hover:translate-x-1" />
        </Link>

        <Link
          href="/brand/dashboard/workshop"
          className="flex items-center justify-between rounded-sm border border-line-trace bg-canvas-pure p-3.5 text-xs font-semibold text-brand-black transition hover:border-brand-emerald hover:bg-canvas-warm/30 group"
        >
          <span className="flex items-center gap-3">
            <Hammer className="size-4 text-brand-emerald" />
            Pantau Workshop
          </span>
          <ArrowRight className="size-4 text-muted-moss transition group-hover:translate-x-1" />
        </Link>
      </nav>
    </section>
  );
}
