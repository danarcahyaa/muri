"use client";

import Link from "next/link";
import { ArrowRight, Leaf, ShoppingBag, ShoppingCart, Trash2 } from "lucide-react";

import { CartItemCard } from "@/components/cart/CartItemCard";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/Sheet";
import { useCart } from "@/hooks/customer/useCart";

export function CartDrawer() {
  const {
    isOpen,
    setIsOpen,
    closeCart,
    items,
    itemCount,
    totalPriceIdr,
    isLoading,
    clearCart,
    isUpdating,
  } = useCart();

  const handleClear = () => {
    if (isUpdating || itemCount === 0) return;
    if (confirm("Apakah Anda yakin ingin mengosongkan keranjang belanja?")) {
      void clearCart();
    }
  };

  const isSingleItemCart = items.length === 1;
  const primaryActionHref = isSingleItemCart
    ? `/produk/${encodeURIComponent(items[0].product.slug)}/checkout?quantity=${items[0].quantity}`
    : "/cart";

  const primaryActionText = isSingleItemCart
    ? "Lanjut ke Checkout"
    : "Buka Halaman Keranjang";

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-l border-line-trace bg-canvas-pure p-0 sm:max-w-md"
      >
        {/* Drawer Header */}
        <SheetHeader className="flex flex-row items-center justify-between border-b border-line-trace px-6 py-5">
          <SheetTitle className="flex items-center gap-2.5 font-display text-lg font-bold text-brand-black">
            <ShoppingBag className="size-5 text-brand-emerald" strokeWidth={2} />
            <span>Keranjang Belanja</span>
            {itemCount > 0 && (
              <span className="flex size-6 items-center justify-center rounded-full bg-brand-lime font-display text-xs font-bold text-brand-forest">
                {itemCount}
              </span>
            )}
          </SheetTitle>

          {itemCount > 0 && (
            <button
              type="button"
              onClick={handleClear}
              disabled={isUpdating}
              className="mr-6 flex items-center gap-1 text-xs font-medium text-muted-moss transition hover:text-red-600 disabled:opacity-40"
            >
              <Trash2 className="size-3.5" />
              <span>Kosongkan</span>
            </button>
          )}
        </SheetHeader>

        {/* Scrollable Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="size-7 animate-spin rounded-full border-2 border-brand-emerald border-t-transparent" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-canvas-warm text-muted-moss">
                <ShoppingCart className="size-8 stroke-[1.5]" />
              </div>

              <h4 className="mt-4 font-display text-base font-bold text-brand-black">
                Keranjang Belanja Kosong
              </h4>

              <p className="mt-2 max-w-xs text-xs leading-relaxed text-muted-moss">
                Jelajahi koleksi produk fashion sirkular dan ramah lingkungan dari ekosistem Muri.
              </p>

              <Link
                href="/produk"
                onClick={closeCart}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-forest px-6 py-3 text-xs font-bold text-canvas-pure transition hover:bg-brand-black"
              >
                <span>Jelajahi Produk</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  compact
                  onCheckoutClick={closeCart}
                />
              ))}
            </div>
          )}
        </div>

        {/* Single Streamlined Footer Button */}
        {items.length > 0 && (
          <div className="border-t border-line-trace bg-canvas-warm/30 p-6">
            {/* Sustainability Badge */}
            <div className="mb-4 flex items-center justify-between rounded-xl bg-brand-emerald/10 px-3.5 py-2 text-[11px] font-semibold text-brand-forest">
              <span className="flex items-center gap-1.5">
                <Leaf className="size-3.5 text-brand-emerald" />
                Dukungan Fashion Sirkular
              </span>
              <span className="text-[10px] text-muted-moss">{items.length} jenis produk</span>
            </div>

            {/* Price Total Row */}
            <div className="flex items-end justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-moss font-semibold">Total Pembayaran</span>
                <p className="font-display text-2xl font-bold tracking-tight text-brand-black">
                  {formatRupiah(totalPriceIdr)}
                </p>
              </div>

              <span className="text-xs font-medium text-muted-moss">({itemCount} unit)</span>
            </div>

            {/* Single Primary Action Button */}
            <Link
              href={primaryActionHref}
              onClick={closeCart}
              className="group mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-forest py-3.5 text-xs font-bold text-canvas-pure transition duration-300 hover:bg-brand-black"
            >
              <span>{primaryActionText}</span>
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}
