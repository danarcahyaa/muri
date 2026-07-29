"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Gift,
  LoaderCircle,
  Minus,
  Plus,
  ShoppingBag,
} from "lucide-react";

import { useProductOrder } from "@/hooks/product/useProductOrder";
import { formatCoin, formatIdr } from "@/lib/productDetail";
import type {
  ProductBonusSummary,
  ProductPaymentOption,
} from "@/types/product";

interface ProductOrderCardProps {
  slug: string;
  productName: string;
  paymentOption: ProductPaymentOption;
  priceIdr: number;
  priceCoin: number | null;
  stock: number;
  bonusProduct: ProductBonusSummary | null;
  bonusProductQty: number;
  bonusCoinCost: number;
}

export default function ProductOrderCard({
  slug,
  productName,
  paymentOption,
  priceIdr,
  priceCoin,
  stock,
  bonusProduct,
  bonusProductQty,
  bonusCoinCost,
}: ProductOrderCardProps) {
  const {
    user,
    isAuthLoading,
    quantity,
    isSoldOut,
    availableStock,
    acceptsIdr,
    acceptsCoin,
    totalPriceIdr,
    totalPriceCoin,
    totalBonusQty,
    checkoutHref,
    decreaseQuantity,
    increaseQuantity,
  } = useProductOrder({
    slug,
    paymentOption,
    priceIdr,
    priceCoin,
    stock,
    bonusProduct,
    bonusProductQty,
  });

  /*
   * Checkout lama ditahan sampai frontend
   * menggunakan create_customer_checkout_order.
   */

  const totalBonusCoinReward = Math.max(0, bonusCoinCost) * quantity;

  const hasProductBonus = Boolean(bonusProduct) && totalBonusQty > 0;

  const hasCoinReward = totalBonusCoinReward > 0;
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

          <p className="sh``rink-0 text-[10px] text-muted-moss">
            Stok {availableStock}
          </p>
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

          <span
            className="flex h-10 min-w-12 items-center justify-center border-x border-line-trace px-3 text-xs font-bold text-brand-black"
            aria-live="polite"
          >
            {quantity}
          </span>

          <button
            type="button"
            onClick={increaseQuantity}
            disabled={isSoldOut || quantity >= availableStock}
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

        <div className="mt-7 space-y-5">
          {acceptsIdr && (
            <div>
              <p className="text-[9px] font-bold uppercase opacity-60">
                Pembayaran IDR
              </p>

              <p className="mt-2 font-display text-[clamp(2.4rem,4vw,3.6rem)] font-medium leading-none tracking-[-0.055em]">
                {formatIdr(totalPriceIdr)}
              </p>
            </div>
          )}

          {acceptsCoin && totalPriceCoin !== null && (
            <div
              className={
                acceptsIdr ? "border-t border-brand-forest/15 pt-5" : ""
              }
            >
              <p className="text-[9px] font-bold uppercase opacity-60">
                Pembayaran Coin
              </p>

              <p className="mt-2 font-display text-[clamp(2.4rem,4vw,3.6rem)] font-medium leading-none tracking-[-0.055em]">
                {formatCoin(totalPriceCoin)}
              </p>
            </div>
          )}
        </div>

        <p className="mt-5 text-[11px] opacity-70">Untuk {quantity} produk</p>
      </div>

      {(hasProductBonus || hasCoinReward) && (
        <div className="mt-5 rounded-xl border border-brand-lime bg-brand-lime/15 p-5">
          <div className="flex gap-3">
            <Gift className="mt-0.5 size-4 shrink-0 text-brand-emerald" />

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-brand-emerald">
                Bonus Pembelian
              </p>

              <div className="mt-3 space-y-2">
                {hasProductBonus && bonusProduct && (
                  <p className="text-xs font-bold leading-5 text-brand-black">
                    {totalBonusQty}× {bonusProduct.name}
                  </p>
                )}

                {hasCoinReward && (
                  <p className="text-xs font-bold leading-5 text-brand-black">
                    + {formatCoin(totalBonusCoinReward)}
                  </p>
                )}
              </div>

              <p className="mt-3 text-[10px] leading-relaxed text-muted-moss">
                Produk bonus otomatis ditambahkan ke pesanan. Bonus coin akan
                masuk setelah pesanan selesai.
              </p>
            </div>
          </div>
        </div>
      )}

      {isSoldOut ? (
        <DisabledCheckoutButton>Stok Habis</DisabledCheckoutButton>
      ) : (
        <Link
          href={checkoutHref}
          aria-disabled={isAuthLoading}
          onClick={(event) => {
            if (isAuthLoading) {
              event.preventDefault();
            }
          }}
          className="group mt-7 flex w-full items-center justify-center gap-3 rounded-sm bg-brand-forest px-6 py-4 text-xs font-bold text-canvas-pure transition duration-300 hover:bg-brand-black"
        >
          {isAuthLoading ? (
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
          ? "Pilih QRIS atau coin pada halaman checkout."
          : "Masuk atau buat akun untuk melanjutkan pembelian."}
      </p>
    </div>
  );
}

function DisabledCheckoutButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="button"
      disabled
      className="mt-7 flex w-full cursor-not-allowed items-center justify-center rounded-sm bg-muted-moss/25 px-6 py-4 text-xs font-bold text-muted-moss"
    >
      {children}
    </button>
  );
}
