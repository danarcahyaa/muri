"use client";

import { Gift, ShoppingBag } from "lucide-react";
import { formatCoin, formatIdr } from "@/lib/productDetail";
import type {
  CustomerCheckoutPaymentMethod,
  CustomerCheckoutPreview,
} from "@/types/customerCheckout";

interface ProductCheckoutOrderSummaryProps {
  checkout: CustomerCheckoutPreview;
  paymentMethod?: CustomerCheckoutPaymentMethod | null;
}

export default function ProductCheckoutOrderSummary({
  checkout,
  paymentMethod = null,
}: ProductCheckoutOrderSummaryProps) {
  const totalPayment =
    paymentMethod === "coin"
      ? formatCoin(checkout.totalPriceCoin ?? 0)
      : formatIdr(checkout.totalPriceIdr ?? 0);

  return (
    <aside className="self-start rounded-2xl border border-brand-black/15 bg-canvas-pure p-6 lg:sticky lg:top-24">
      <div className="flex items-center gap-3 text-brand-emerald">
        <ShoppingBag className="size-4" />
        <h2 className="text-xs font-bold uppercase">Ringkasan Pesanan</h2>
      </div>

      <div className="mt-7 rounded-xl bg-canvas-warm p-5">
        <p className="text-sm font-bold text-brand-black">
          {checkout.product.name}
        </p>

        <p className="mt-2 text-xs text-muted-moss">
          {checkout.product.brandName} · {checkout.product.categoryName}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-line-trace pt-4 text-xs">
          <span className="text-muted-moss">Jumlah</span>
          <span className="font-bold text-brand-black">
            {checkout.quantity}
          </span>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-brand-lime p-6 text-brand-forest">
        <p className="text-[10px] uppercase opacity-70">Total Pembayaran</p>

        <p className="mt-7 font-display text-4xl font-medium tracking-[-0.05em]">
          {totalPayment}
        </p>
      </div>

      {paymentMethod === "coin" && (
        <div className="mt-5 space-y-3 text-xs">
          <SummaryRow
            label="Saldo coin"
            value={formatCoin(checkout.profile.totalPoints)}
          />
          <SummaryRow
            label="Coin digunakan"
            value={formatCoin(checkout.totalPriceCoin ?? 0)}
          />
          <SummaryRow
            label="Sisa coin"
            value={formatCoin(
              Math.max(
                0,
                checkout.profile.totalPoints - (checkout.totalPriceCoin ?? 0),
              ),
            )}
            strong
          />
        </div>
      )}

      {checkout.reward && (
        <CheckoutRewardCard checkout={checkout} compact />
      )}
    </aside>
  );
}

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line-trace py-3 last:border-b-0">
      <span className="text-xs text-muted-moss">{label}</span>
      <span
        className={
          strong
            ? "text-xs font-bold text-brand-forest"
            : "text-xs font-bold text-brand-black"
        }
      >
        {value}
      </span>
    </div>
  );
}

function CheckoutRewardCard({
  checkout,
  compact = false,
}: {
  checkout: CustomerCheckoutPreview;
  compact?: boolean;
}) {
  const reward = checkout.reward;
  if (!reward) return null;

  const hasProductBonus = Boolean(reward.productBonus);
  const hasCoinReward = reward.totalCoinReward > 0;

  return (
    <div
      className={`
        rounded-2xl border
        border-brand-lime
        bg-brand-lime/15
        ${compact ? "mt-5 p-5" : "mt-8 p-5"}
      `}
    >
      <div className="flex gap-3">
        <Gift className="mt-0.5 size-4 shrink-0 text-brand-emerald" />
        <div>
          <p className="text-[10px] font-bold uppercase text-brand-emerald">
            Bonus Pembelian
          </p>

          <div className="mt-3 space-y-2">
            {hasProductBonus && reward.productBonus && (
              <p className="text-xs font-bold text-brand-black">
                {reward.productBonus.totalQuantity}×{" "}
                {reward.productBonus.productName}
              </p>
            )}
            {hasCoinReward && (
              <p className="text-xs font-bold text-brand-black">
                + {formatCoin(reward.totalCoinReward)}
              </p>
            )}
          </div>

          <p className="mt-3 text-[10px] leading-4 text-muted-moss">
            Produk bonus otomatis masuk pesanan. Bonus coin diberikan setelah
            pesanan selesai.
          </p>
        </div>
      </div>
    </div>
  );
}
