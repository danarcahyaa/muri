"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, Shirt, ShoppingCart, Tag } from "lucide-react";

import { useCart } from "@/hooks/customer/useCart";
import type { ProductCatalogItem } from "@/types/product";

interface ProductCardProps {
  product: ProductCatalogItem;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, isUpdating } = useCart();
  const productHref = `/produk/${encodeURIComponent(product.slug)}`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    void addToCart(product.id, 1);
  };

  return (
    <article
      className="
        group flex flex-col overflow-hidden
        rounded-2xl border border-brand-black/15
        bg-canvas-pure p-4
        transition duration-300
        hover:-translate-y-1
        hover:border-brand-emerald
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
        {product.imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={product.imageUrl}
            alt={product.name}
            className="size-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <>
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
          </>
        )}
      </Link>

      <div
        className="
    mt-6 flex items-center
    justify-between gap-4
    text-[11px] font-bold
    text-brand-emerald
  "
      >
        <span
          className="
      flex min-w-0 items-center gap-2
    "
          title={`Brand: ${product.brandName}`}
        >
          <BadgeCheck
            aria-hidden="true"
            className="size-3.5 shrink-0"
            strokeWidth={2}
          />

          <span className="truncate">{product.brandName}</span>
        </span>

        <span
          className="
      flex min-w-0 items-center
      justify-end gap-2
      text-right
    "
          title={`Kategori: ${product.categoryName}`}
        >
          <Tag
            aria-hidden="true"
            className="size-3.5 shrink-0"
            strokeWidth={2}
          />

          <span className="truncate">{product.categoryName}</span>
        </span>
      </div>

      <div className="mt-7 flex-1">
        <Link href={productHref} className="block">
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
          justify-between gap-3
          border-t border-line-trace pt-5
        "
      >
        <p className="font-display text-xl font-bold tracking-tight text-brand-black sm:text-2xl">
          {formatCompactRupiah(product.priceIdr)}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isUpdating}
            title="Tambah ke Keranjang"
            className="
              flex size-9 items-center justify-center
              rounded-xl border border-brand-black/15 bg-canvas-warm
              text-brand-black transition duration-200
              hover:border-brand-emerald hover:bg-brand-emerald hover:text-white
              disabled:opacity-50
            "
          >
            <ShoppingCart className="size-4" />
          </button>

          <Link
            href={productHref}
            className="
              group/action inline-flex
              items-center gap-1.5
              rounded-xl bg-brand-forest px-3.5 py-2
              text-xs font-bold text-canvas-pure
              transition duration-300
              hover:bg-brand-black
            "
          >
            <span>Beli</span>
            <ArrowRight
              className="
                size-3.5 transition-transform
                duration-300
                group-hover/action:translate-x-1
              "
            />
          </Link>
        </div>
      </div>
    </article>
  );
}

function formatCompactRupiah(value: number): string {
  if (value >= 1_000_000) {
    const million = value / 1_000_000;

    return `IDR ${Number.isInteger(million) ? million : million.toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `IDR ${Math.round(value / 1_000)}K`;
  }

  return `IDR ${new Intl.NumberFormat("id-ID").format(value)}`;
}
