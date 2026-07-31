"use client";

import { Factory, Leaf, ShieldCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/Card";
import { Separator } from "@/components/ui/Separator";
import { formatIdr } from "@/lib/productDetail";
import type { MaterialDetailItem } from "@/types/material";
import type { MaterialPaymentMethod } from "@/types/materialOrder";

interface MaterialCheckoutOrderSummaryProps {
  material: MaterialDetailItem;
  weightKg: number;
  paymentMethod: MaterialPaymentMethod;
}

export default function MaterialCheckoutOrderSummary({
  material,
  weightKg,
  paymentMethod,
}: MaterialCheckoutOrderSummaryProps) {
  const totalPriceIdr = weightKg * material.pricePerKg;

  return (
    <Card className="self-start rounded-2xl lg:sticky lg:top-24">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 text-brand-emerald">
          <Leaf className="size-4" />
          <h2 className="text-xs font-bold uppercase">Ringkasan Pesanan</h2>
        </div>

        <Card variant="warm" className="mt-7 p-5">
          <p className="text-sm font-bold text-brand-black">{material.title}</p>

          <p className="mt-2 flex items-center gap-2 text-xs text-muted-moss">
            <Factory className="size-3.5" />
            {material.providerName} · {material.categoryName}
          </p>

          <Separator className="my-4 bg-line-trace" />

          <SummaryRow label="Kode batch" value={material.batchCode} />
          <SummaryRow label="Volume" value={`${weightKg} kg`} />
          <SummaryRow
            label="Harga per kg"
            value={formatIdr(material.pricePerKg)}
          />
          <SummaryRow label="Metode" value={paymentMethod.toUpperCase()} />
        </Card>

        <div className="mt-5 rounded-xl bg-brand-lime p-6 text-brand-forest">
          <p className="text-[10px] uppercase opacity-70">Total Pembayaran</p>
          <p className="mt-7 font-display text-4xl font-medium tracking-[-0.05em]">
            {formatIdr(totalPriceIdr)}
          </p>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-xl bg-canvas-warm p-4 text-[10px] leading-4 text-muted-moss">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-emerald" />
          <span>
            Volume dan ketersediaan material diperiksa kembali saat pesanan
            dikonfirmasi.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-xs text-muted-moss">{label}</span>
      <span className="max-w-[60%] text-right text-xs font-bold text-brand-black">
        {value}
      </span>
    </div>
  );
}
