"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Separator } from "@/components/ui/Separator";
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
    <Card className="mx-auto max-w-2xl rounded-2xl text-center">
      <CardContent className="px-6 py-14 sm:px-10">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand-lime text-brand-forest">
          <CheckCircle2 className="size-7" />
        </div>

        <p className="mt-7 text-xs font-bold uppercase text-brand-emerald">
          {isCoinPayment
            ? "Pembayaran Coin Berhasil"
            : "Pesanan Berhasil Dibuat"}
        </p>

        <h1 className="mt-4 font-display text-4xl font-medium tracking-[-0.045em] text-brand-black sm:text-5xl">
          ORD-{orderCode}
        </h1>

        <p className="mt-5 text-sm leading-6 text-muted-moss">
          {isCoinPayment
            ? "Coin telah dipotong dan pesanan akan segera diproses."
            : "Pesanan menunggu pembayaran QRIS. Stok telah direservasi sementara."}
        </p>

        <Card variant="warm" className="mt-8 p-6 text-left">
          <SummaryRow
            label="Metode pembayaran"
            value={isCoinPayment ? "Coin" : "QRIS"}
          />
          <Separator className="bg-line-trace" />
          <SummaryRow
            label="Total"
            value={
              isCoinPayment
                ? formatCoin(result.amountCoin)
                : formatIdr(result.amountIdr)
            }
          />
          <Separator className="bg-line-trace" />
          <SummaryRow
            label="Bonus coin setelah selesai"
            value={formatCoin(result.pointsEarned)}
            strong
          />
        </Card>

        {!isCoinPayment && result.expiresAt && (
          <p className="mt-5 text-xs text-amber-700">
            Batas pembayaran: {formatDateTime(result.expiresAt)}
          </p>
        )}

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Button
            variant="outline"
            fullWidth
            render={<Link href="/produk" />}
          >
            Belanja Lagi
          </Button>

          <Button
            fullWidth
            render={
              <Link
                href={
                  isCoinPayment
                    ? "/dashboard/orders"
                    : `/dashboard/orders/${result.orderId}/payment`
                }
              />
            }
          >
            {isCoinPayment ? "Lihat Pesanan" : "Bayar Sekarang"}
            <ArrowRight />
          </Button>
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
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
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
