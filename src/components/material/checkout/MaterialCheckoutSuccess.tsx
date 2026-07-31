"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Separator } from "@/components/ui/Separator";
import { formatIdr } from "@/lib/productDetail";
import type { MaterialOrder } from "@/types/materialOrder";

interface MaterialCheckoutSuccessProps {
  result: MaterialOrder;
}

export default function MaterialCheckoutSuccess({
  result,
}: MaterialCheckoutSuccessProps) {
  return (
    <Card className="mx-auto max-w-2xl rounded-2xl text-center">
      <CardContent className="px-6 py-14 sm:px-10">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand-lime text-brand-forest">
          <CheckCircle2 className="size-7" />
        </div>

        <p className="mt-7 text-xs font-bold uppercase text-brand-emerald">
          Pesanan Berhasil Dibuat
        </p>

        <h1 className="mt-4 font-display text-4xl font-medium tracking-[-0.045em] text-brand-black sm:text-5xl">
          {result.orderCode}
        </h1>

        <p className="mt-5 text-sm leading-6 text-muted-moss">
          Pesanan material menunggu pembayaran. Buka dashboard pembelian untuk
          melanjutkan proses dan mengunggah bukti pembayaran.
        </p>

        <Card variant="warm" className="mt-8 p-6 text-left">
          <SummaryRow label="Material" value={result.batchTitle} />
          <Separator className="bg-line-trace" />
          <SummaryRow label="Volume" value={`${result.weightKg} kg`} />
          <Separator className="bg-line-trace" />
          <SummaryRow
            label="Metode pembayaran"
            value={result.paymentMethod.toUpperCase()}
          />
          <Separator className="bg-line-trace" />
          <SummaryRow
            label="Total"
            value={formatIdr(result.totalPriceIdr)}
            strong
          />
        </Card>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Button
            variant="outline"
            fullWidth
            render={<Link href="/material" />}
          >
            Cari Material Lagi
          </Button>

          <Button
            fullWidth
            render={<Link href="/brand/dashboard/sourcing/purchases" />}
          >
            Lihat Pembelian
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
            ? "max-w-[65%] text-right text-xs font-bold text-brand-forest"
            : "max-w-[65%] text-right text-xs font-bold text-brand-black"
        }
      >
        {value}
      </span>
    </div>
  );
}
