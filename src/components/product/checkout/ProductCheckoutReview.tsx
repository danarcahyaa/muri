"use client";

import type { LucideIcon } from "lucide-react";
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

import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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
              ? "Coin"
              : `QRIS — ${formatIdr(checkout.totalPriceIdr ?? 0)}`
          }
        />
      </div>

      {errorMessage && (
        <Alert variant="destructive" className="mt-6">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Button type="button" variant="outline" fullWidth onClick={onBack}>
          <ArrowLeft />
          Ubah Data
        </Button>

        <Button type="button" fullWidth onClick={onConfirm}>
          Konfirmasi Akhir
          <ShieldCheck />
        </Button>
      </div>
    </>
  );
}

function ReviewFact({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <Card variant="warm" className="p-5">
      <div className="flex items-center gap-2 text-muted-moss">
        <Icon className="size-4" />
        <span className="text-[10px] font-medium uppercase">{label}</span>
      </div>

      <p className="mt-3 text-sm font-medium leading-6 text-brand-black">
        {value}
      </p>
    </Card>
  );
}
