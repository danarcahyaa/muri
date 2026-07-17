import Link from "next/link";
import { Leaf } from "lucide-react";

import RichTextContent from "@/components/ui/RichTextContent";
import { formatIdr } from "@/lib/product-detail";

interface ProductDetailHeroProps {
  title: string;
  descriptionHtml: string | null;
  brandName: string;
  categoryName: string;
  priceIdr: number;
}

export default function ProductDetailHero({
  title,
  descriptionHtml,
  brandName,
  categoryName,
  priceIdr,
}: ProductDetailHeroProps) {
  return (
    <section className="bg-canvas-warm">
      <div
        className="
          mx-auto
          w-[min(1320px,calc(100%_-_48px))]
          pb-[clamp(72px,9vw,120px)]
          pt-[clamp(40px,6vw,80px)]
        "
      >
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-4 text-xs text-muted-moss"
        >
          <Link
            href="/"
            className="transition-colors hover:text-brand-emerald"
          >
            Beranda
          </Link>

          <span aria-hidden="true">/</span>

          <Link
            href="/produk"
            className="transition-colors hover:text-brand-emerald"
          >
            Produk
          </Link>

          <span aria-hidden="true">/</span>

          <span className="line-clamp-1">
            {categoryName}
          </span>
        </nav>

        <div
          className="
            mt-14 grid gap-12
            lg:grid-cols-[minmax(0,1fr)_320px]
            lg:items-center lg:gap-20
          "
        >
          <div>
            <div className="flex items-center gap-3 text-brand-emerald">
              <Leaf
                className="size-4"
                strokeWidth={2}
              />

              <span className="text-sm font-bold uppercase tracking-tight">
                {brandName}
              </span>
            </div>

            <h1
              className="
                mt-5 max-w-5xl font-display
                text-[clamp(3.6rem,7vw,7.2rem)]
                font-normal leading-[0.93]
                tracking-[-0.065em]
                text-brand-black
              "
            >
              {title}
            </h1>

            {descriptionHtml && (
              <RichTextContent
                html={descriptionHtml}
                mode="plain"
                className="mt-8 max-w-3xl text-sm leading-relaxed text-muted-moss sm:text-base"
              />
            )}
          </div>

          <aside className="rounded-2xl border border-line-trace bg-canvas-pure p-7 sm:p-8">
            <p className="text-[10px] uppercase tracking-wide text-muted-moss">
              Harga Produk
            </p>

            <p
              className="
                mt-8 font-display
                text-[clamp(2.8rem,4.2vw,4.2rem)]
                font-medium leading-none
                tracking-[-0.055em]
                text-brand-black
              "
            >
              {formatIdr(priceIdr)}
            </p>

            <p className="mt-5 text-[11px] text-muted-moss">
              /1 produk
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
