"use client";

import {
  ArrowRight,
  Check,
  Coins,
  Phone,
  QrCode,
  ShieldCheck,
  User,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { LocationPicker, type AddressJSONB } from "@/components/shared/LocationPicker";
import { formatCoin, formatIdr } from "@/lib/productDetail";
import { addressJSONBToString, stringToAddressJSONB } from "@/lib/addressUtils";
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
  const locationValue: AddressJSONB = {
    formatted_address: shippingAddress.includes(" — ")
      ? shippingAddress.split(" — ")[0]
      : "",
    latitude: 0,
    longitude: 0,
    address_detail: shippingAddress.includes(" — ")
      ? shippingAddress.split(" — ")[1]
      : shippingAddress,
  };

  const handleLocationChange = (data: AddressJSONB) => {
    const full = data.formatted_address
      ? `${data.formatted_address} — ${data.address_detail}`
      : data.address_detail;
    onShippingAddressChange(full);
  };
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
        Isi data pengiriman dan pilih metode pembayaran sebelum melakukan
        review.
      </p>

      <FieldGroup className="mt-8">
        <Field>
          <FieldLabel htmlFor="receiver-name">
            Nama Penerima <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="receiver-name"
            type="text"
            required
            minLength={2}
            maxLength={120}
            value={receiverName}
            onChange={(event) => onReceiverNameChange(event.target.value)}
            placeholder="Nama lengkap penerima"
            endIcon={<User strokeWidth={1.7} />}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="phone-number">Nomor Telepon</FieldLabel>
          <Input
            id="phone-number"
            type="tel"
            maxLength={30}
            value={phoneNumber}
            onChange={(event) => onPhoneNumberChange(event.target.value)}
            placeholder="Contoh: 081234567890"
            endIcon={<Phone strokeWidth={1.7} />}
          />
          <FieldDescription>
            Opsional, tetapi disarankan untuk koordinasi pengiriman.
          </FieldDescription>
        </Field>

        <div className="pt-2">
          <LocationPicker
            value={stringToAddressJSONB(shippingAddress)}
            onChange={(newLocation) => {
              onShippingAddressChange(addressJSONBToString(newLocation));
            }}
            label="Cari Tujuan Pengiriman"
            detailLabel="Detail Alamat Lengkap & Catatan Pengiriman"
            placeholder="Ketik wilayah/kota (misal: Denpasar Barat, Bali)..."
            detailPlaceholder="Jl. Imam Bonjol No. 45, Samping Apotek, Kontak Penerima (08123456789)..."
            required={true}
          />
        </div>
      </FieldGroup>

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
              amount="Coin"
              onSelect={onPaymentMethodChange}
            />
          )}
        </div>
      </div>

      {errorMessage && (
        <Alert variant="destructive" className="mt-6">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Button
        type="button"
        fullWidth
        size="lg"
        onClick={onReview}
        className="mt-8"
      >
        Lanjut ke Review
        <ArrowRight className="transition-transform group-hover/button:translate-x-1" />
      </Button>
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
    <Button
      type="button"
      variant="outline"
      size="lg"
      fullWidth
      disabled={disabled}
      aria-pressed={selected}
      onClick={() => onSelect(method)}
      className={`
        relative h-auto min-h-40 flex-col items-start justify-start
        whitespace-normal rounded-xl p-5 text-left
        ${
          selected
            ? "border-brand-forest bg-brand-lime/20 hover:bg-brand-lime/25"
            : "bg-canvas-pure"
        }
      `}
    >
      {selected && (
        <span className="absolute right-4 top-4 flex size-5 items-center justify-center rounded-full bg-brand-forest text-white">
          <Check className="size-3" />
        </span>
      )}

      <Icon className="size-5 text-brand-emerald" />
      <span className="mt-4 block text-sm font-bold text-brand-black">
        {title}
      </span>
      <span className="mt-2 block text-[10px] font-normal leading-4 text-muted-moss">
        {description}
      </span>
      <span className="mt-auto pt-5 text-xs font-bold text-brand-forest">
        {amount}
      </span>
    </Button>
  );
}
