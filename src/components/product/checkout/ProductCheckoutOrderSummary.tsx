"use client";

import { Gift, ShieldCheck, ShoppingBag } from "lucide-react";

import { Card, CardContent } from "@/components/ui/Card";
import { Separator } from "@/components/ui/Separator";
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
  const effectivePaymentMethod =
    paymentMethod ?? checkout.availablePaymentMethods[0] ?? "qris";

  const totalPayment = formatIdr(checkout.totalPriceIdr ?? 0);

  return (
    <Card className="self-start rounded-2xl lg:sticky lg:top-24">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 text-brand-emerald">
          <ShoppingBag className="size-4" />
          <h2 className="text-xs font-bold uppercase">Ringkasan Pesanan</h2>
        </div>

        <Card variant="warm" className="mt-7 p-5">
          <p className="text-sm font-bold text-brand-black">
            {checkout.product.name}
          </p>

          <p className="mt-2 text-xs text-muted-moss">
            {checkout.product.brandName} · {checkout.product.categoryName}
          </p>

          <Separator className="my-4 bg-line-trace" />

          <SummaryRow label="Jumlah" value={String(checkout.quantity)} />
          <SummaryRow
            label="Metode"
            value={effectivePaymentMethod === "coin" ? "Coin" : "QRIS"}
          />
        </Card>

        <div className="mt-5 rounded-xl bg-brand-lime p-6 text-brand-forest">
          <p className="text-[10px] uppercase opacity-70">Total Pembayaran</p>

          <p className="mt-7 font-display text-4xl font-medium tracking-[-0.05em]">
            {totalPayment}
          </p>
        </div>



        {checkout.reward && <CheckoutRewardCard checkout={checkout} />}

        <div className="mt-5 flex items-start gap-3 rounded-xl bg-canvas-warm p-4 text-[10px] leading-4 text-muted-moss">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-emerald" />
          <span>Data checkout diperiksa kembali saat transaksi dikonfirmasi.</span>
        </div>
      </CardContent>
    </Card>
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
    <div className="flex items-center justify-between gap-4 py-1.5">
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
}: {
  checkout: CustomerCheckoutPreview;
}) {
  const reward = checkout.reward;
  if (!reward) return null;

  const hasProductBonus = Boolean(reward.productBonus);
  const hasCoinReward = reward.totalCoinReward > 0;

  return (
    <Card className="mt-5 border-brand-lime bg-brand-lime/15 p-5">
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
    </Card>
  );
}
