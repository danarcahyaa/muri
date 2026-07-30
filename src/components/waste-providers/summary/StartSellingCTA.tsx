import type { ReactElement } from "react";
import Link from "next/link";
import { ArrowRight, Leaf, Plus, Sprout } from "lucide-react";

export function StartSellingCTA(): ReactElement {
  return (
    <section className="mt-8 overflow-hidden rounded-xl border border-brand-black/15 bg-gradient-to-br from-brand-forest to-brand-black p-8 text-white sm:p-10 shadow-sm relative">
      {/* Decorative subtle background pattern */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#C8F169_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none hidden md:block" />

      <div className="relative z-10 max-w-2xl">
        {/* <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-brand-lime/10 text-brand-lime"> */}
        <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-brand-lime/10 text-brand-lime">
          <Sprout strokeWidth={1.5} />
        </div>

        <h2 className="font-display text-3xl font-medium tracking-tight text-white sm:text-4xl">
          Mulai Salurkan Sisa Kain Produksi Anda
        </h2>

        <p className="mt-4 text-sm leading-relaxed text-white/70">
          Ubah sisa perca garmen menjadi nilai ekonomi baru dan kurangi jejak karbon industri. Daftarkan material sisa kain produksi Anda agar terhubung secara instan dengan berbagai brand fesyen berkelanjutan dalam ekosistem sirkular MURI.
        </p>

        <div className="mt-8">
          <Link
            href="/waste-providers/dashboard/waste"
            className="group inline-flex items-center justify-center gap-2 rounded-sm bg-brand-lime px-6 py-4 text-xs font-bold text-brand-black transition hover:-translate-y-0.5 hover:bg-brand-lime/90"
          >
            Mulai Jual Limbah
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
