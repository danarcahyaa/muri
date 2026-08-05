"use client";

import Link from "next/link";
import { ArrowRight, Leaf, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";

import { useCart } from "@/hooks/customer/useCart";

export interface CartSummaryCardProps {
  onCheckoutClick?: () => void;
}

export function CartSummaryCard({ onCheckoutClick }: CartSummaryCardProps) {
  const { items, itemCount, totalPriceIdr, clearCart, isUpdating } = useCart();

  const handleClear = () => {
    if (isUpdating || itemCount === 0) return;
    if (confirm("Apakah Anda yakin ingin mengosongkan keranjang belanja?")) {
      void clearCart();
    }
  };

  const isSingleItemCart = items.length === 1;
  const checkoutHref = isSingleItemCart
    ? `/produk/${encodeURIComponent(items[0].product.slug)}/checkout?quantity=${items[0].quantity}`
    : items.length > 0
    ? `/produk/${encodeURIComponent(items[0].product.slug)}/checkout?quantity=${items[0].quantity}`
    : "/produk";

  return (
    <div className="flex flex-col rounded-2xl border border-brand-black/15 bg-canvas-pure p-6">
      <div className="flex items-center justify-between border-b border-line-trace pb-4">
        <div className="flex items-center gap-2 text-brand-emerald">
          <ShoppingBag className="size-5" strokeWidth={2} />
          <h2 className="font-display text-base font-bold text-brand-black">
            Ringkasan Belanja
          </h2>
        </div>

        {itemCount > 0 && (
          <button
            type="button"
            onClick={handleClear}
            disabled={isUpdating}
            className="flex items-center gap-1 text-xs font-semibold text-muted-moss transition hover:text-red-600 disabled:opacity-40"
          >
            <Trash2 className="size-3.5" />
            <span>Kosongkan</span>
          </button>
        )}
      </div>

      <div className="mt-5 space-y-3 text-xs text-brand-black">
        <div className="flex justify-between">
          <span className="text-muted-moss">Jenis Produk</span>
          <span className="font-bold">{items.length} produk</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-moss">Total Unit Barang</span>
          <span className="font-bold">{itemCount} unit</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-moss">Estimasi Hemat Emisi</span>
          <span className="flex items-center gap-1 font-semibold text-brand-emerald">
            <Leaf className="size-3.5" /> Eco Sourcing
          </span>
        </div>
      </div>

      {/* Total Section */}
      <div className="mt-6 rounded-xl bg-brand-lime p-5 text-brand-forest">
        <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">
          Total Pembayaran
        </p>

        <p className="mt-2 font-display text-3xl font-bold tracking-tight">
          {formatRupiah(totalPriceIdr)}
        </p>
      </div>

      {/* Action Button */}
      {itemCount > 0 ? (
        <div className="mt-6 flex flex-col gap-2">
          <Link
            href={checkoutHref}
            onClick={onCheckoutClick}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-forest px-6 py-4 text-xs font-bold text-canvas-pure transition duration-300 hover:bg-brand-black"
          >
            <span>{isSingleItemCart ? "Lanjut ke Checkout" : "Checkout Produk Pertama"}</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>

          {!isSingleItemCart && (
            <p className="text-center text-[11px] leading-relaxed text-muted-moss">
              Atau klik tombol <b>Checkout</b> pada masing-masing produk di daftar untuk transaksi spesifik.
            </p>
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled
          className="mt-6 w-full rounded-xl bg-muted-moss/20 py-4 text-xs font-bold text-muted-moss cursor-not-allowed"
        >
          Keranjang Kosong
        </button>
      )}

      {/* Sustainability Guarantee */}
      <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-brand-emerald/15 bg-brand-emerald/5 p-3 text-[11px] leading-relaxed text-brand-forest">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-emerald" />
        <p>
          Setiap pembelian produk MURI mendukung pengurangan limbah tekstil dan industri fashion sirkular Indonesia.
        </p>
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
