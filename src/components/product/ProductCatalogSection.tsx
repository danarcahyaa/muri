import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Leaf,
} from "lucide-react";

import {
  circularProducts,
  type CircularProduct,
} from "@/data/products";

export default function ProductCatalogSection() {
  return (
    <section className="bg-canvas-pure">
      <div
        className="
          mx-auto w-[min(1320px,calc(100%_-_48px))]
          py-[clamp(80px,9vw,130px)]
        "
      >
        {/* Header */}
        <div className="flex items-end justify-between gap-8">
          <div className="flex items-center gap-3 text-brand-emerald">
            <Leaf
              className="size-4"
              strokeWidth={2}
            />

            <span className="text-sm font-bold uppercase tracking-tight">
              Jelajahi Produk Sirkular
            </span>
          </div>

          <p className="shrink-0 text-sm text-muted-moss">
            {circularProducts.length} Produk
          </p>
        </div>

        {/* Products */}
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {circularProducts.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface ProductCardProps {
  product: CircularProduct;
}

function ProductCard({
  product,
}: ProductCardProps) {
  const productHref = `/produk/${product.slug}`;

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
      {/* Image */}
      <Link
        href={productHref}
        className="
          relative block aspect-[16/9]
          overflow-hidden rounded-lg
          bg-canvas-warm
        "
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="
            (max-width: 768px) 100vw,
            (max-width: 1024px) 50vw,
            33vw
          "
          className="
            object-cover transition duration-500
            group-hover:scale-[1.025]
          "
        />
      </Link>

      {/* Brand and badge */}
      <div
        className="
          mt-6 flex items-center justify-between
          gap-4 text-[11px] font-bold
          text-brand-emerald
        "
      >
        <span className="truncate">
          {product.brand}
        </span>

        <span className="shrink-0">
          {product.badge}
        </span>
      </div>

      {/* Product information */}
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
          {product.description}
        </p>
      </div>

      {/* Footer */}
      <div
        className="
          mt-7 flex items-center justify-between gap-5
          border-t border-line-trace pt-5
        "
      >
        <p className="font-display text-2xl font-bold tracking-tight text-brand-black">
          {formatCompactRupiah(product.price)}
        </p>

        <Link
          href={productHref}
          className="
            group/action inline-flex items-center gap-3
            text-xs font-bold text-brand-emerald
            transition-colors
            hover:text-brand-forest
          "
        >
          <span>Beli Sekarang</span>

          <ArrowRight
            className="
              size-4 transition-transform duration-300
              group-hover/action:translate-x-1
            "
          />
        </Link>
      </div>
    </article>
  );
}

function formatCompactRupiah(value: number) {
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

  return `IDR ${value}`;
}