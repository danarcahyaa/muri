import Link from "next/link";
import {
  Leaf,
  Shirt,
} from "lucide-react";

export default function ProductHero() {
  return (
    <section className="relative overflow-hidden bg-canvas-warm">
      <div
        className="
          mx-auto w-[min(1320px,calc(100%_-_48px))]
          pt-[clamp(32px,4vw,56px)]
          pb-[clamp(80px,9vw,130px)]
        "
      >
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-5 text-xs text-muted-moss"
        >
          <Link
            href="/"
            className="transition-colors hover:text-brand-emerald"
          >
            Beranda
          </Link>

          <span
            aria-hidden="true"
            className="text-muted-moss/50"
          >
            /
          </span>

          <span>Produk</span>
        </nav>

        {/* Hero */}
        <div
          className="
            mt-12 grid gap-14
            lg:mt-14
            lg:grid-cols-[1.45fr_0.8fr]
            lg:items-center
            lg:gap-24
          "
        >
          {/* Left */}
          <div>
            <div className="mb-5 flex items-center gap-3 text-brand-emerald">
              <Leaf
                className="size-4"
                strokeWidth={2}
              />

              <span className="text-sm font-bold uppercase tracking-tight">
                Upcycled Marketplace
              </span>
            </div>

            <h1
              className="
                max-w-4xl font-display
                text-[clamp(3.25rem,5.4vw,5.2rem)]
                font-normal leading-[0.98]
                tracking-[-0.055em]
                text-brand-black
              "
            >
              Dukung Fashion Berkelanjutan.
            </h1>

            <p className="mt-10 max-w-3xl text-sm leading-relaxed text-muted-moss 2xl:text-base">
              Telusuri berbagai produk fashion dan material kain daur ulang
              hasil kreasi ekosistem sirkular Muri yang terverifikasi ramah
              lingkungan.
            </p>
          </div>

          {/* Feature card */}
          <aside
            className="
              rounded-2xl border border-line-trace
              bg-canvas-pure p-7 shadow-sm
              sm:p-8
            "
          >
            <p className="text-xs font-bold uppercase tracking-tight text-brand-emerald">
              Ready to Wear
            </p>

            <div className="flex min-h-48 items-center justify-center py-8">
              <Shirt
                className="size-28 text-brand-black sm:size-32"
                strokeWidth={1.5}
              />
            </div>

            <h2
              className="
                max-w-sm font-display text-4xl
                font-medium leading-tight
                tracking-[-0.045em]
                text-brand-black
              "
            >
              Produk Ramah Bumi.
            </h2>

            <p className="mt-3 max-w-sm text-xs leading-relaxed text-muted-moss">
              Setiap helai pakaian yang Anda beli berkontribusi langsung
              mengurangi limbah di tempat pembuangan akhir.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}