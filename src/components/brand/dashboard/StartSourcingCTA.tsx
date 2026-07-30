import type { ReactElement } from "react";
import Link from "next/link";
import { ArrowRight, Search, Sprout } from "lucide-react";

/**
 * StartSourcingCTA renders the empty state hero banner matching the visual style of waste-providers StartSellingCTA.
 */
export function StartSourcingCTA(): ReactElement {
  return (
    <div className="overflow-hidden rounded-2xl border border-brand-black/15 bg-gradient-to-br from-brand-forest to-brand-black p-8 text-white sm:p-10 shadow-sm relative">
      {/* Decorative subtle background pattern */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#C8F169_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none hidden md:block" />

      <div className="relative z-10 max-w-2xl">
        <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-brand-lime/10 text-brand-lime">
          <Sprout strokeWidth={1.5} />
        </div>

        <h3 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Ayo mulai sourcing material
        </h3>

        <p className="mt-3 text-sm leading-relaxed text-white/70">
          Bahan baku kain perca daur ulang yang Anda beli dari pabrik garmen atau aggregator akan tercatat di sini. Mulai eksplorasi katalog limbah kain untuk mendukung produk fesyen sirkular Anda.
        </p>

        <div className="mt-6">
          <Link
            href="/material"
            className="group inline-flex items-center justify-center gap-2 rounded-sm bg-brand-lime px-5 py-3.5 text-xs font-bold text-brand-black transition hover:-translate-y-0.5 hover:bg-brand-lime/90"
          >
            <Search className="size-4" />
            Mulai Cari Material
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
