"use client";

import {
  ArrowLeft,
  CheckCircle2,
  Coins,
  MapPin,
  Package,
  QrCode,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { formatCoin, formatIdr } from "@/lib/productDetail";
import type {
  CustomerCheckoutPaymentMethod,
  CustomerCheckoutPreview,
} from "@/types/customerCheckout";

interface ProductCheckoutReviewProps {
  checkout: CustomerCheckoutPreview;
  receiverName: string;
  phoneNumber: string;
  shippingAddress: string;
  paymentMethod: CustomerCheckoutPaymentMethod | null;
  errorMessage: string | null;
  onBack: () => void;
  onConfirm: () => void;
}

export default function ProductCheckoutReview({
  checkout,
  receiverName,
  phoneNumber,
  shippingAddress,
  paymentMethod,
  errorMessage,
  onBack,
  onConfirm,
}: ProductCheckoutReviewProps) {
  return (
    <>
      <div className="flex items-center gap-3 text-brand-emerald">
        <CheckCircle2 className="size-4" />
        <p className="text-xs font-bold uppercase">Review Pesanan</p>
      </div>

      <h1 className="mt-5 font-display text-4xl font-medium tracking-[-0.045em] text-brand-black sm:text-5xl">
        Periksa Kembali
      </h1>

      <p className="mt-4 text-sm leading-6 text-muted-moss">
        Periksa seluruh detail sebelum membuka konfirmasi transaksi akhir.
      </p>

      <div className="mt-8 space-y-4">
        <ReviewFact icon={UserRound} label="Penerima" value={receiverName} />

        <ReviewFact
          icon={MapPin}
          label="Alamat Pengiriman"
          value={`${phoneNumber || "Tanpa nomor telepon"} — ${shippingAddress}`}
        />

        <ReviewFact
          icon={Package}
          label="Produk"
          value={`${checkout.quantity}× ${checkout.product.name}`}
        />

        <ReviewFact
          icon={paymentMethod === "coin" ? Coins : QrCode}
          label="Pembayaran"
          value={
            paymentMethod === "coin"
              ? `Coin — ${formatCoin(checkout.totalPriceCoin ?? 0)}`
              : `QRIS — ${formatIdr(checkout.totalPriceIdr ?? 0)}`
          }
        />
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700"
        >
          {errorMessage}
        </div>
      )}

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onBack}
          className="
            flex items-center
            justify-center gap-2
            rounded-md border
            border-line-trace
            px-6 py-4
            text-xs font-bold
            text-brand-black
            transition
            hover:border-brand-forest
          "
        >
          <ArrowLeft className="size-4" />
          Ubah Data
        </button>

        <button
          type="button"
          onClick={onConfirm}
          className="
            flex items-center
            justify-center gap-2
            rounded-md
            bg-brand-forest
            px-6 py-4
            text-xs font-bold
            text-white transition
            hover:bg-brand-black
          "
        >
          Konfirmasi Akhir
          <ShieldCheck className="size-4" />
        </button>
      </div>
    </>
  );
}

function ReviewFact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-canvas-warm p-5">
      <div className="flex items-center gap-2 text-muted-moss">
        <Icon className="size-4" />
        <span className="text-[10px] font-medium uppercase">{label}</span>
      </div>

      <p className="mt-3 text-sm font-medium leading-6 text-brand-black">
        {value}
      </p>
    </div>
  );
}
