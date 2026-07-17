import Link from "next/link";
import { ArrowRight, Shirt } from "lucide-react";

import type { ProductCatalogItem } from "@/types/product";

interface ProductCardProps {
  product: ProductCatalogItem;
}

export default function ProductCard({
  product,
}: ProductCardProps) {
  const productHref = `/produk/${encodeURIComponent(
    product.slug,
  )}`;

  return (
    <article
      className="
        group flex flex-col overflow-hidden
        rounded-2xl border border-line-trace
        bg-canvas-pure p-4
        transition duration-300
        hover:-translate-y-1
        hover:border-brand-emerald
        hover:shadow-2xl
        hover:shadow-brand-black/5
        sm:p-6
      "
    >
      <Link
        href={productHref}
        className="
          relative flex aspect-[16/9]
          items-center justify-center
          overflow-hidden rounded-lg
          bg-canvas-warm
        "
        aria-label={`Lihat ${product.name}`}
      >
        <div
          aria-hidden="true"
          className="
            absolute -right-12 -top-12
            size-40 rounded-full
            border border-brand-emerald/10
          "
        />

        <div
          aria-hidden="true"
          className="
            absolute -bottom-16 -left-10
            size-44 rounded-full
            border border-brand-emerald/10
          "
        />

        <Shirt
          className="
            relative z-10 size-20
            text-brand-forest/75
            transition duration-500
            group-hover:scale-105
          "
          strokeWidth={1.25}
        />
      </Link>

      <div
        className="
          mt-6 flex items-center
          justify-between gap-4
          text-[11px] font-bold
          text-brand-emerald
        "
      >
        <span className="truncate">
          {product.brandName}
        </span>

        <span className="shrink-0">
          {product.categoryName}
        </span>
      </div>

      <div className="mt-7 flex-1">
        <Link
          href={productHref}
          className="block"
        >
          <h2
            className="
              truncate font-display
              text-2xl font-medium
              leading-tight tracking-[-0.035em]
              text-brand-black
              transition-colors
              group-hover:text-brand-emerald
            "
          >
            {product.name}
          </h2>
        </Link>

        <p className="mt-3 line-clamp-2 min-h-10 text-xs leading-relaxed text-muted-moss">
          {product.description ||
            "Produk fashion sirkular dari ekosistem Muri."}
        </p>
      </div>

      <div
        className="
          mt-7 flex items-center
          justify-between gap-5
          border-t border-line-trace pt-5
        "
      >
        <p className="font-display text-2xl font-bold tracking-tight text-brand-black">
          {formatCompactRupiah(
            product.priceIdr,
          )}
        </p>

        <Link
          href={productHref}
          className="
            group/action inline-flex
            items-center gap-3
            text-xs font-bold
            text-brand-emerald
            transition-colors
            hover:text-brand-forest
          "
        >
          <span>Beli Sekarang</span>

          <ArrowRight
            className="
              size-4 transition-transform
              duration-300
              group-hover/action:translate-x-1
            "
          />
        </Link>
      </div>
    </article>
  );
}

function formatCompactRupiah(value: number): string {
  if (value >= 1_000_000) {
    const million = value / 1_000_000;

    return `IDR ${
      Number.isInteger(million)
        ? million
        : million.toFixed(1)
    }M`;
  }

  if (value >= 1_000) {
    return `IDR ${Math.round(value / 1_000)}K`;
  }

  return `IDR ${new Intl.NumberFormat(
    "id-ID",
  ).format(value)}`;
}
