"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Gift,
  LoaderCircle,
  Minus,
  Plus,
  ShoppingBag,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { formatIdr } from "@/lib/product-detail";
import type { ProductBonusSummary } from "@/types/product";

interface ProductOrderCardProps {
  slug: string;
  productName: string;
  priceIdr: number;
  stock: number;
  bonusProduct: ProductBonusSummary | null;
  bonusProductQty: number;
  bonusCoinCost: number;
}

export default function ProductOrderCard({
  slug,
  productName,
  priceIdr,
  stock,
  bonusProduct,
  bonusProductQty,
  bonusCoinCost,
}: ProductOrderCardProps) {
  const [quantity, setQuantity] = React.useState(stock > 0 ? 1 : 0);
  const { user, isLoading } = useAuth();
  const isSoldOut = stock <= 0;
  const totalPrice = priceIdr * quantity;
  const totalBonusQty =
    bonusProduct && bonusProductQty > 0 ? quantity * bonusProductQty : 0;

  const checkoutPath = `/produk/${encodeURIComponent(
    slug,
  )}/checkout?quantity=${quantity}`;

  const checkoutHref = user
    ? checkoutPath
    : `/auth/login?redirect=${encodeURIComponent(checkoutPath)}`;

  function decreaseQuantity() {
    setQuantity((current) => Math.max(1, current - 1));
  }

  function increaseQuantity() {
    setQuantity((current) => Math.min(stock, current + 1));
  }

  return (
    <div className="rounded-2xl border border-line-trace bg-canvas-pure p-6 sm:p-7">
      <div className="flex items-center gap-3 text-brand-emerald">
        <ShoppingBag className="size-4" strokeWidth={2} />

        <h2 className="text-xs font-bold uppercase tracking-tight">
          Ringkasan Pesanan
        </h2>
      </div>

      <div className="mt-7 rounded-xl bg-canvas-warm p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-moss">
              Atur Jumlah
            </p>
            <p className="mt-1 line-clamp-1 text-xs font-bold text-brand-black">
              {productName}
            </p>
          </div>

          <p className="shrink-0 text-[10px] text-muted-moss">Stok {stock}</p>
        </div>

        <div className="mt-5 inline-flex items-center overflow-hidden rounded-lg border border-line-trace bg-canvas-pure">
          <button
            type="button"
            onClick={decreaseQuantity}
            disabled={isSoldOut || quantity <= 1}
            aria-label="Kurangi jumlah"
            className="flex size-10 items-center justify-center text-brand-black transition hover:bg-canvas-warm disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Minus className="size-3.5" />
          </button>

          <span className="flex h-10 min-w-12 items-center justify-center border-x border-line-trace px-3 text-xs font-bold text-brand-black">
            {quantity}
          </span>

          <button
            type="button"
            onClick={increaseQuantity}
            disabled={isSoldOut || quantity >= stock}
            aria-label="Tambah jumlah"
            className="flex size-10 items-center justify-center text-brand-black transition hover:bg-canvas-warm disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-brand-lime p-6 text-brand-forest">
        <p className="text-[10px] uppercase tracking-wide opacity-70">
          Total Harga
        </p>

        <p className="mt-8 font-display text-[clamp(2.7rem,4vw,4rem)] font-medium leading-none tracking-[-0.055em]">
          {formatIdr(totalPrice)}
        </p>

        <p className="mt-5 text-[11px] opacity-70">Untuk {quantity} produk</p>
      </div>

      {bonusProduct && totalBonusQty > 0 && (
        <div className="mt-5 rounded-xl border border-brand-lime bg-brand-lime/15 p-5">
          <div className="flex gap-3">
            <Gift className="mt-0.5 size-4 shrink-0 text-brand-emerald" />

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-brand-emerald">
                Bonus Produk
              </p>

              <p className="mt-2 text-xs font-bold leading-5 text-brand-black">
                {totalBonusQty}× {bonusProduct.name}
              </p>

              {bonusCoinCost > 0 && (
                <p className="mt-2 text-[10px] leading-relaxed text-muted-moss">
                  Membutuhkan {bonusCoinCost} koin untuk setiap paket bonus.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {isSoldOut ? (
        <button
          type="button"
          disabled
          className="mt-7 flex w-full cursor-not-allowed items-center justify-center rounded-sm bg-muted-moss/25 px-6 py-4 text-xs font-bold text-muted-moss"
        >
          Stok Habis
        </button>
      ) : (
        <Link
          aria-disabled={isLoading}
          onClick={(event) => {
            if (isLoading) {
              event.preventDefault();
            }
          }}
          href={checkoutHref}
          className="group mt-7 flex w-full items-center justify-center gap-3 rounded-sm bg-brand-forest px-6 py-4 text-xs font-bold text-canvas-pure transition duration-300 hover:bg-brand-black"
        >
          {isLoading ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              Memeriksa Akun...
            </>
          ) : (
            <>
              Beli Sekarang
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Link>
      )}

      <p className="mt-4 text-center text-[10px] leading-relaxed text-muted-moss">
        {user
          ? "Anda akan diarahkan ke halaman checkout."
          : "Masuk atau buat akun untuk melanjutkan pembelian."}
      </p>
    </div>
  );
}
