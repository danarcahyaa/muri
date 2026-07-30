"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { formatCoin, formatIdr } from "@/lib/productDetail";
import type { CreateCustomerCheckoutOrderResult } from "@/types/customerCheckout";

interface ProductCheckoutSuccessProps {
  result: CreateCustomerCheckoutOrderResult;
}

export default function ProductCheckoutSuccess({
  result,
}: ProductCheckoutSuccessProps) {
  const orderCode = result.orderId
    .replaceAll("-", "")
    .slice(0, 8)
    .toUpperCase();

  const isCoinPayment = result.paymentMethod === "coin";

  return (
    <section className="mx-auto max-w-2xl rounded-3xl border border-brand-black/15 bg-canvas-pure px-6 py-14 text-center sm:px-10">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand-lime text-brand-forest">
        <CheckCircle2 className="size-7" />
      </div>

      <p className="mt-7 text-xs font-bold uppercase text-brand-emerald">
        {isCoinPayment ? "Pembayaran Coin Berhasil" : "Pesanan Berhasil Dibuat"}
      </p>

      <h1 className="mt-4 font-display text-4xl font-medium tracking-[-0.045em] text-brand-black sm:text-5xl">
        ORD-{orderCode}
      </h1>

      <p className="mt-5 text-sm leading-6 text-muted-moss">
        {isCoinPayment
          ? "Coin telah dipotong dan pesanan akan segera diproses."
          : "Pesanan menunggu pembayaran QRIS. Stok telah direservasi sementara."}
      </p>

      <div className="mt-8 rounded-2xl bg-canvas-warm p-6">
        <SummaryRow
          label="Metode pembayaran"
          value={isCoinPayment ? "Coin" : "QRIS"}
        />
        <SummaryRow
          label="Total"
          value={
            isCoinPayment
              ? formatCoin(result.amountCoin)
              : formatIdr(result.amountIdr)
          }
        />
        <SummaryRow
          label="Bonus coin setelah selesai"
          value={formatCoin(result.pointsEarned)}
          strong
        />
      </div>

      {!isCoinPayment && result.expiresAt && (
        <p className="mt-5 text-xs text-amber-700">
          Batas pembayaran: {formatDateTime(result.expiresAt)}
        </p>
      )}

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link
          href="/produk"
          className="flex items-center justify-center rounded-md border border-brand-black/15 px-6 py-4 text-xs font-bold text-brand-black transition hover:border-brand-forest"
        >
          Belanja Lagi
        </Link>

        <Link
          href={
            isCoinPayment
              ? "/dashboard/orders"
              : `/dashboard/orders/${result.orderId}/payment`
          }
          className="flex items-center justify-center gap-2 rounded-md bg-brand-forest px-6 py-4 text-xs font-bold text-white transition hover:bg-brand-black"
        >
          {isCoinPayment ? "Lihat Pesanan" : "Bayar Sekarang"}
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
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

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Tidak tersedia";
  }
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
