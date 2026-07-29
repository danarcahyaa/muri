import { ShoppingBag } from "lucide-react";

import { formatIdr } from "@/lib/productDetail";
import type { CustomerCheckoutData } from "@/types/customerCheckout";

interface ProductCheckoutOrderSummaryProps {
  checkout: CustomerCheckoutData;
  claimBonus: boolean;
}

export default function ProductCheckoutOrderSummary({
  checkout,
  claimBonus,
}: ProductCheckoutOrderSummaryProps) {
  const redeemedCoins = claimBonus
    ? (checkout.bonus?.totalCoinCost ?? 0)
    : 0;

  const remainingCoins = Math.max(
    0,
    checkout.profile.totalPoints - redeemedCoins,
  );

  return (
    <aside className="self-start rounded-2xl border border-line-trace bg-canvas-pure p-6 lg:sticky lg:top-24">
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
          {formatIdr(checkout.totalPriceIdr)}
        </p>
      </div>

      <div className="mt-5 space-y-3 text-xs">
        <SummaryRow
          label="Saldo coin"
          value={checkout.profile.totalPoints}
        />
        <SummaryRow label="Coin digunakan" value={redeemedCoins} />

        <div className="flex items-center justify-between gap-4 border-t border-line-trace pt-3">
          <span className="text-muted-moss">Sisa coin</span>

          <span className="font-bold text-brand-forest">
            {remainingCoins}
          </span>
        </div>
      </div>
    </aside>
  );
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-moss">{label}</span>
      <span className="font-bold text-brand-black">{value}</span>
    </div>
  );
}
