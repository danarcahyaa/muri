import Link from "next/link";
import { ArrowRight, CheckCircle2, Coins } from "lucide-react";

import { formatIdr } from "@/lib/productDetail";
import type { PurchaseCustomerProductResult } from "@/types/customerCheckout";

export default function ProductCheckoutSuccess({
  result,
}: {
  result: PurchaseCustomerProductResult;
}) {
  const orderCode = result.orderId
    .replaceAll("-", "")
    .slice(0, 8)
    .toUpperCase();

  return (
    <section className="mx-auto max-w-2xl rounded-3xl border border-line-trace bg-canvas-pure px-6 py-14 text-center sm:px-10">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand-lime text-brand-forest">
        <CheckCircle2 className="size-7" />
      </div>

      <p className="mt-7 text-xs font-bold uppercase text-brand-emerald">
        Pesanan Berhasil Dibuat
      </p>

      <h1 className="mt-4 font-display text-4xl font-medium tracking-[-0.045em] text-brand-black sm:text-5xl">
        Terima Kasih
      </h1>

      <p className="mt-5 text-sm leading-6 text-muted-moss">
        Pesanan <strong className="text-brand-black">ORD-{orderCode}</strong>{" "}
        berhasil dibuat dengan status menunggu proses.
      </p>

      <div className="mt-8 rounded-2xl bg-canvas-warm p-6">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-muted-moss">Total pembayaran</span>

          <span className="font-bold text-brand-black">
            {formatIdr(result.totalPriceIdr)}
          </span>
        </div>

        {result.totalCoinsRedeemed > 0 && (
          <div className="mt-4 flex items-center justify-between gap-4 border-t border-line-trace pt-4 text-sm">
            <span className="flex items-center gap-2 text-muted-moss">
              <Coins className="size-4" />
              Coin digunakan
            </span>

            <span className="font-bold text-brand-black">
              {result.totalCoinsRedeemed}
            </span>
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link
          href="/produk"
          className="flex items-center justify-center gap-2 rounded-md border border-line-trace px-6 py-4 text-xs font-bold text-brand-black transition hover:border-brand-forest"
        >
          Belanja Lagi
        </Link>

        <Link
          href="/dashboard/orders"
          className="flex items-center justify-center gap-2 rounded-md bg-brand-forest px-6 py-4 text-xs font-bold text-white transition hover:bg-brand-black"
        >
          Lihat Pesanan
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
