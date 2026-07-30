/* eslint-disable @next/next/no-img-element */

"use client";

import { CheckCircle2, Clock3, QrCode, ShieldCheck } from "lucide-react";
import { formatIdr } from "@/lib/productDetail";
import type { CustomerOrderPaymentStatus } from "@/types/customerOrder";
import { getPaymentStatusLabel } from "./PaymentInformation";

interface QrisPanelProps {
  imageUrl: string;
  amount: number;
  paymentStatus: CustomerOrderPaymentStatus;
}

export function QrisPanel({ imageUrl, amount, paymentStatus }: QrisPanelProps) {
  const canShowQris = paymentStatus === "waiting_payment" && Boolean(imageUrl);

  return (
    <section>
      <h2 className="font-display text-2xl font-medium text-brand-black">
        Scan QRIS
      </h2>

      <p className="mt-2 text-xs leading-5 text-muted-moss">
        Gunakan aplikasi bank atau dompet digital yang mendukung QRIS.
      </p>

      {canShowQris ? (
        <div className="mt-7 mx-auto max-w-md rounded-3xl border border-brand-black/15 bg-white p-5">
          <img
            src={imageUrl}
            alt="Kode pembayaran QRIS"
            className="mx-auto aspect-square w-full object-contain"
          />

          <div className="mt-5 rounded-2xl bg-canvas-warm p-5 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-moss">
              Masukkan Nominal
            </p>
            <p className="mt-3 font-display text-3xl font-medium tracking-[-0.04em] text-brand-black">
              {formatIdr(amount)}
            </p>
          </div>
        </div>
      ) : paymentStatus === "waiting_payment" ? (
        <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <QrCode className="mx-auto size-10 text-amber-700" />
          <p className="mt-4 text-sm font-bold text-amber-900">
            QRIS belum dikonfigurasi
          </p>
          <p className="mt-2 text-xs leading-5 text-amber-800">
            Tambahkan NEXT_PUBLIC_QRIS_IMAGE_URL pada .env.local.
          </p>
        </div>
      ) : (
        <PaymentStatePanel status={paymentStatus} />
      )}
    </section>
  );
}

function PaymentStatePanel({ status }: { status: CustomerOrderPaymentStatus }) {
  return (
    <div className="mt-7 rounded-2xl bg-canvas-warm p-8 text-center">
      {status === "waiting_verification" ? (
        <ShieldCheck className="mx-auto size-10 text-blue-700" />
      ) : status === "paid" ? (
        <CheckCircle2 className="mx-auto size-10 text-brand-forest" />
      ) : (
        <Clock3 className="mx-auto size-10 text-muted-moss" />
      )}

      <p className="mt-4 text-sm font-bold text-brand-black">
        {getPaymentStatusLabel(status)}
      </p>
    </div>
  );
}
