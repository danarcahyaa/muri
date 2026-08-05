"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, Minus, Plus, Shirt, Trash2 } from "lucide-react";

import { useCart } from "@/hooks/customer/useCart";
import type { CartItem } from "@/types/cart";

export interface CartItemCardProps {
  item: CartItem;
  compact?: boolean;
  onCheckoutClick?: () => void;
}

export function CartItemCard({
  item,
  compact = false,
  onCheckoutClick,
}: CartItemCardProps) {
  const { updateQuantity, removeItem, isUpdating } = useCart();

  const productHref = `/produk/${encodeURIComponent(item.product.slug)}`;
  const checkoutItemHref = `/produk/${encodeURIComponent(item.product.slug)}/checkout?quantity=${item.quantity}`;
  const itemTotalIdr = item.quantity * item.product.priceIdr;

  const handleDecrease = () => {
    if (item.quantity <= 1) return;
    void updateQuantity(item.id, item.quantity - 1);
  };

  const handleIncrease = () => {
    if (item.quantity >= item.product.stock) return;
    void updateQuantity(item.id, item.quantity + 1);
  };

  const handleRemove = () => {
    void removeItem(item.id);
  };

  return (
    <div
      className={`
        group relative flex flex-col rounded-2xl border border-brand-black/15
        bg-canvas-pure p-4 transition-colors duration-200
        hover:border-brand-emerald
        ${compact ? "gap-3.5" : "gap-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"}
      `}
    >
      <div className="flex items-start gap-3.5 min-w-0 flex-1">
        {/* Product Image Thumbnail */}
        <Link
          href={productHref}
          className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-canvas-warm/80 transition hover:bg-canvas-warm"
        >
          <Shirt className="size-7 text-brand-forest/75" strokeWidth={1.25} />
        </Link>

        {/* Product Details */}
        <div className="min-w-0 flex-1 pr-6 sm:pr-0">
          <Link
            href={productHref}
            className="block font-display text-sm font-semibold leading-snug text-brand-black transition hover:text-brand-emerald"
          >
            <h3 className="line-clamp-1">{item.product.name}</h3>
          </Link>

          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-moss">
            <span className="flex items-center gap-1 font-medium text-brand-emerald">
              <BadgeCheck className="size-3 shrink-0" />
              <span className="truncate">{item.product.brandName}</span>
            </span>

            <span className="text-brand-black/20">•</span>

            <span className="truncate text-muted-moss">{item.product.categoryName}</span>
          </div>

          <p className="mt-1.5 text-xs font-bold text-brand-black">
            {formatRupiah(item.product.priceIdr)}
            <span className="text-[10px] font-normal text-muted-moss"> / unit</span>
          </p>
        </div>

        {/* Top-Right Delete Button for Compact View */}
        {compact && (
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Hapus produk"
            className="absolute right-3.5 top-3.5 flex size-7 items-center justify-center rounded-lg text-muted-moss/70 transition hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="size-3.5" />
          </button>
        )}
      </div>

      {/* Controls & Checkout Row */}
      <div
        className={`
          flex items-center justify-between gap-3 border-t border-line-trace pt-3
          ${compact ? "w-full" : "sm:w-auto sm:border-t-0 sm:pt-0 sm:gap-5"}
        `}
      >
        {/* Quantity Controls */}
        <div className="inline-flex items-center rounded-xl border border-brand-black/15 bg-canvas-warm/50 p-0.5">
          <button
            type="button"
            onClick={handleDecrease}
            disabled={item.quantity <= 1}
            aria-label="Kurangi kuantitas"
            className="flex size-7 items-center justify-center rounded-lg text-brand-black transition hover:bg-canvas-pure disabled:opacity-30"
          >
            <Minus className="size-3" />
          </button>

          <span className="flex h-7 w-8 items-center justify-center text-xs font-bold text-brand-black">
            {item.quantity}
          </span>

          <button
            type="button"
            onClick={handleIncrease}
            disabled={item.quantity >= item.product.stock}
            aria-label="Tambah kuantitas"
            className="flex size-7 items-center justify-center rounded-lg text-brand-black transition hover:bg-canvas-pure disabled:opacity-30"
          >
            <Plus className="size-3" />
          </button>
        </div>

        {/* Subtotal & Direct Checkout Link */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="block text-[10px] uppercase tracking-wider text-muted-moss">Subtotal</span>
            <p className="font-display text-sm font-bold text-brand-forest">
              {formatRupiah(itemTotalIdr)}
            </p>
          </div>

          <Link
            href={checkoutItemHref}
            onClick={onCheckoutClick}
            className="group/btn inline-flex items-center gap-1 rounded-xl bg-brand-forest px-3 py-2 text-[11px] font-bold text-canvas-pure transition hover:bg-brand-black"
            title="Checkout item ini"
          >
            <span>Checkout</span>
            <ArrowRight className="size-3 transition-transform group-hover/btn:translate-x-0.5" />
          </Link>

          {!compact && (
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Hapus produk"
              className="flex size-8 items-center justify-center rounded-xl border border-brand-black/10 text-muted-moss transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}
