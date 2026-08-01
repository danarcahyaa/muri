"use client";

import type { ComponentType } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Gift,
  LoaderCircle,
  MapPin,
  Package,
  ShoppingBag,
  UserRound,
} from "lucide-react";

import { CheckoutErrorMessage } from "@/components/product/ProductCheckoutForm";
import type { CustomerCheckoutData } from "@/types/customerCheckout";

interface ProductCheckoutReviewProps {
  checkout: CustomerCheckoutData;
  receiverName: string;
  phoneNumber: string;
  shippingAddress: string;
  claimBonus: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
  onBack: () => void;
  onConfirm: () => void;
}

export default function ProductCheckoutReview({
  checkout,
  receiverName,
  phoneNumber,
  shippingAddress,
  claimBonus,
  isSubmitting,
  errorMessage,
  onBack,
  onConfirm,
}: ProductCheckoutReviewProps) {
  return (
    <>
      <div className="flex items-center gap-3 text-brand-emerald">
        <CheckCircle2 className="size-4" strokeWidth={2} />

        <p className="text-xs font-bold uppercase">Konfirmasi Pesanan</p>
      </div>

      <h1 className="mt-5 font-display text-4xl font-medium tracking-[-0.045em] text-brand-black sm:text-5xl">
        Periksa Kembali
      </h1>

      <p className="mt-4 text-sm leading-6 text-muted-moss">
        Pembelian akan langsung membuat pesanan dan mengurangi stok produk.
      </p>

      <div className="mt-8 space-y-4">
        <ReviewFact
          icon={UserRound}
          label="Penerima"
          value={receiverName}
        />

        <ReviewFact
          icon={MapPin}
          label="Pengiriman"
          value={`${phoneNumber || "Tanpa nomor telepon"} — ${shippingAddress}`}
        />

        <ReviewFact
          icon={Package}
          label="Produk"
          value={`${checkout.quantity}× ${checkout.product.name}`}
        />

        {claimBonus && checkout.bonus && (
          <ReviewFact
            icon={Gift}
            label="Bonus"
            value={`${checkout.bonus.totalQuantity}× ${checkout.bonus.productName} menggunakan ${checkout.bonus.totalCoinCost} coin`}
          />
        )}
      </div>

      {errorMessage && <CheckoutErrorMessage message={errorMessage} />}

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onBack}
          className="
            flex items-center justify-center gap-2
            rounded-md border border-brand-black/15
            px-6 py-4 text-xs font-bold
            text-brand-black transition
            hover:border-brand-forest
            disabled:cursor-not-allowed disabled:opacity-50
          "
        >
          <ArrowLeft className="size-4" />
          Ubah Data
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={onConfirm}
          className="
            flex items-center justify-center gap-2
            rounded-md bg-brand-forest
            px-6 py-4 text-xs font-bold
            text-white transition hover:bg-brand-black
            disabled:cursor-not-allowed disabled:opacity-60
          "
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              Memproses...
            </>
          ) : (
            <>
              Konfirmasi Beli
              <ShoppingBag className="size-4" />
            </>
          )}
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
  icon: ComponentType<{ className?: string }>;
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
