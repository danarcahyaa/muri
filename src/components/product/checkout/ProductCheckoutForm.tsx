"use client";

import { ArrowRight, Check, Coins, Phone, QrCode, ShieldCheck, User } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { formatCoin, formatIdr } from "@/lib/productDetail";
import type {
  CustomerCheckoutPaymentMethod,
  CustomerCheckoutPreview,
} from "@/types/customerCheckout";

interface ProductCheckoutFormProps {
  checkout: CustomerCheckoutPreview;
  receiverName: string;
  phoneNumber: string;
  shippingAddress: string;
  selectedPaymentMethod: CustomerCheckoutPaymentMethod | null;
  errorMessage: string | null;
  onReceiverNameChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  onShippingAddressChange: (value: string) => void;
  onPaymentMethodChange: (value: CustomerCheckoutPaymentMethod) => void;
  onReview: () => void;
}

export default function ProductCheckoutForm({
  checkout,
  receiverName,
  phoneNumber,
  shippingAddress,
  selectedPaymentMethod,
  errorMessage,
  onReceiverNameChange,
  onPhoneNumberChange,
  onShippingAddressChange,
  onPaymentMethodChange,
  onReview,
}: ProductCheckoutFormProps) {
  return (
    <>
      <div className="flex items-center gap-3 text-brand-emerald">
        <ShieldCheck className="size-4" />
        <p className="text-xs font-bold uppercase">Secure Checkout</p>
      </div>

      <h1 className="mt-5 font-display text-4xl font-medium tracking-[-0.045em] text-brand-black sm:text-5xl">
        Informasi Pesanan
      </h1>

      <p className="mt-4 max-w-xl text-sm leading-6 text-muted-moss">
        Isi data pengiriman dan pilih metode pembayaran sebelum melakukan review.
      </p>

      <div className="mt-8 space-y-5">
        <div className="space-y-2.5">
          <label htmlFor="receiver-name" className="block mb-2 text-xs font-bold text-brand-black">
            Nama Penerima<span className="text-red-600"> *</span>
          </label>
          <Input
            id="receiver-name"
            type="text"
            required
            maxLength={120}
            value={receiverName}
            onChange={(e) => onReceiverNameChange(e.target.value)}
            placeholder="Nama lengkap penerima"
            endIcon={<User className="size-4 text-muted-moss/60" strokeWidth={1.7} />}
          />
        </div>

        <div className="space-y-2.5">
          <label htmlFor="phone-number" className="block mb-2 text-xs font-bold text-brand-black">
            Nomor Telepon
          </label>
          <Input
            id="phone-number"
            type="tel"
            maxLength={30}
            value={phoneNumber}
            onChange={(e) => onPhoneNumberChange(e.target.value)}
            placeholder="Contoh: 081234567890"
            endIcon={<Phone className="size-4 text-muted-moss/60" strokeWidth={1.7} />}
          />
        </div>

        <div className="space-y-2.5">
          <label
            htmlFor="shipping-address"
            className="block mb-2 text-xs font-bold text-brand-black"
          >
            Alamat Pengiriman<span className="text-red-600"> *</span>
          </label>

          <textarea
            id="shipping-address"
            rows={4}
            maxLength={1000}
            value={shippingAddress}
            placeholder="Masukkan alamat lengkap pengiriman"
            onChange={(event) => {
              onShippingAddressChange(event.target.value);
            }}
            className="
              w-full resize-none
              rounded-sm border
              border-line-trace
              bg-transparent
              px-4 py-3
              font-body text-xs text-brand-black
              shadow-none outline-none transition
              placeholder:text-xs placeholder:text-muted-moss/60
              focus-visible:border-brand-emerald
              focus-visible:ring-2
              focus-visible:ring-brand-emerald/10
            "
          />
        </div>
      </div>

      <div className="mt-9">
        <p className="text-xs font-bold text-brand-black">Metode Pembayaran</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {checkout.availablePaymentMethods.includes("qris") && (
            <PaymentMethodOption
              method="qris"
              selected={selectedPaymentMethod === "qris"}
              title="QRIS"
              description="Bayar menggunakan aplikasi bank atau dompet digital."
              amount={
                checkout.totalPriceIdr !== null
                  ? formatIdr(checkout.totalPriceIdr)
                  : "-"
              }
              onSelect={onPaymentMethodChange}
            />
          )}

          {checkout.availablePaymentMethods.includes("coin") && (
            <PaymentMethodOption
              method="coin"
              selected={selectedPaymentMethod === "coin"}
              disabled={!checkout.hasEnoughCoinBalance}
              title="Coin"
              description={`Saldo tersedia ${formatCoin(
                checkout.profile.totalPoints,
              )}.`}
              amount={
                checkout.totalPriceCoin !== null
                  ? formatCoin(checkout.totalPriceCoin)
                  : "-"
              }
              onSelect={onPaymentMethodChange}
            />
          )}
        </div>
      </div>

      {errorMessage && <CheckoutErrorMessage message={errorMessage} />}

      <button
        type="button"
        onClick={onReview}
        className="
          group mt-8 flex w-full
          items-center justify-center
          gap-3 rounded-sm
          bg-brand-forest
          px-6 py-4
          text-xs font-bold text-white
          transition hover:bg-brand-black
        "
      >
        Lanjut ke Review
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </button>
    </>
  );
}

function PaymentMethodOption({
  method,
  selected,
  disabled = false,
  title,
  description,
  amount,
  onSelect,
}: {
  method: CustomerCheckoutPaymentMethod;
  selected: boolean;
  disabled?: boolean;
  title: string;
  description: string;
  amount: string;
  onSelect: (method: CustomerCheckoutPaymentMethod) => void;
}) {
  const Icon = method === "qris" ? QrCode : Coins;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        onSelect(method);
      }}
      className={`
        relative rounded-xl border
        p-5 text-left transition
        ${
          selected
            ? `
                border-brand-forest
                bg-brand-lime/20
              `
            : `
                border-line-trace
                bg-canvas-pure
                hover:border-brand-emerald
              `
        }
        ${
          disabled
            ? `
                cursor-not-allowed
                opacity-45
              `
            : ""
        }
      `}
    >
      {selected && (
        <span className="absolute right-4 top-4 flex size-5 items-center justify-center rounded-full bg-brand-forest text-white">
          <Check className="size-3" />
        </span>
      )}

      <Icon className="size-5 text-brand-emerald" />
      <p className="mt-5 text-sm font-bold text-brand-black">{title}</p>
      <p className="mt-2 text-[10px] leading-4 text-muted-moss">{description}</p>
      <p className="mt-5 text-xs font-bold text-brand-forest">{amount}</p>
    </button>
  );
}

export function CheckoutErrorMessage({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700"
    >
      {message}
    </div>
  );
}
