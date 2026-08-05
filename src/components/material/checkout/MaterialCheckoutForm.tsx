"use client";

import {
  ArrowRight,
  Check,
  Phone,
  QrCode,
  Scale,
  ShieldCheck,
  User,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { LocationPicker, type AddressJSONB } from "@/components/shared/LocationPicker";
import { formatIdr } from "@/lib/productDetail";
import type { MaterialDetailItem } from "@/types/material";
import type { MaterialPaymentMethod } from "@/types/materialOrder";

export interface MaterialCheckoutFieldErrors {
  weightKg?: string;
  receiverName?: string;
  phoneNumber?: string;
  shippingAddress?: string;
  general?: string;
}

interface MaterialCheckoutFormProps {
  material: MaterialDetailItem;
  weightKg: number;
  receiverName: string;
  phoneNumber: string;
  shippingAddress: string;
  paymentMethod: MaterialPaymentMethod;
  fieldErrors: MaterialCheckoutFieldErrors;
  onWeightChange: (value: number) => void;
  onReceiverNameChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  onShippingAddressChange: (value: string) => void;
  onPaymentMethodChange: (value: MaterialPaymentMethod) => void;
  onReview: () => void;
}

export default function MaterialCheckoutForm({
  material,
  weightKg,
  receiverName,
  phoneNumber,
  shippingAddress,
  paymentMethod,
  fieldErrors,
  onWeightChange,
  onReceiverNameChange,
  onPhoneNumberChange,
  onShippingAddressChange,
  onPaymentMethodChange,
  onReview,
}: MaterialCheckoutFormProps) {
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
  const totalPriceIdr = weightKg * material.pricePerKg;

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
        Tentukan volume material, lengkapi data pengiriman, lalu periksa kembali
        pesanan sebelum dikonfirmasi.
      </p>

      <FieldGroup className="mt-8">
        <Field>
          <FieldLabel htmlFor="material-weight">
            Volume Pembelian <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="material-weight"
            type="number"
            min={material.minimumOrderKg}
            max={material.availableWeightKg}
            step={1}
            required
            value={weightKg}
            aria-invalid={Boolean(fieldErrors.weightKg) || undefined}
            onChange={(event) => onWeightChange(Number(event.target.value))}
            endIcon={<Scale strokeWidth={1.7} />}
          />
          <FieldDescription>
            Minimum {material.minimumOrderKg} kg · tersedia{" "}
            {material.availableWeightKg} kg.
          </FieldDescription>
          <FieldError>{fieldErrors.weightKg}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="material-receiver-name">
            Nama Penerima / Tim Sourcing{" "}
            <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="material-receiver-name"
            type="text"
            required
            minLength={2}
            maxLength={120}
            value={receiverName}
            aria-invalid={Boolean(fieldErrors.receiverName) || undefined}
            onChange={(event) => onReceiverNameChange(event.target.value)}
            placeholder="Nama penerima atau tim sourcing"
            endIcon={<User strokeWidth={1.7} />}
          />
          <FieldError>{fieldErrors.receiverName}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="material-phone-number">
            Nomor Telepon <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="material-phone-number"
            type="tel"
            required
            maxLength={30}
            value={phoneNumber}
            aria-invalid={Boolean(fieldErrors.phoneNumber) || undefined}
            onChange={(event) => onPhoneNumberChange(event.target.value)}
            placeholder="Contoh: 081234567890"
            endIcon={<Phone strokeWidth={1.7} />}
          />
          <FieldDescription>
            Digunakan untuk koordinasi pengiriman material.
          </FieldDescription>
          <FieldError>{fieldErrors.phoneNumber}</FieldError>
        </Field>

        <div className="pt-2">
          <LocationPicker
            value={locationValue}
            onChange={handleLocationChange}
            label="Cari Tujuan Pengiriman"
            detailLabel="Detail Alamat Lengkap & Catatan Gudang / Workshop"
            placeholder="Ketik wilayah/kota (misal: Denpasar Timur)..."
            detailPlaceholder="Jl. Sukajadi No. 120, Gudang Studio Brand, Kontak Security (0812345678)..."
            required
          />
          {fieldErrors.shippingAddress && (
            <p className="mt-1 text-xs font-medium text-destructive">
              {fieldErrors.shippingAddress}
            </p>
          )}
        </div>
      </FieldGroup>

      <div className="mt-9">
        <p className="text-xs font-bold text-brand-black">Metode Pembayaran</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            fullWidth
            aria-pressed={paymentMethod === "qris"}
            onClick={() => onPaymentMethodChange("qris")}
            className="relative h-auto min-h-40 flex-col items-start justify-start whitespace-normal rounded-xl border-brand-forest bg-brand-lime/20 p-5 text-left hover:bg-brand-lime/25"
          >
            <span className="absolute right-4 top-4 flex size-5 items-center justify-center rounded-full bg-brand-forest text-white">
              <Check className="size-3" />
            </span>

            <QrCode className="size-5 text-brand-emerald" />
            <span className="mt-4 block text-sm font-bold text-brand-black">
              QRIS
            </span>
            <span className="mt-2 block text-[10px] font-normal leading-4 text-muted-moss">
              Bayar melalui aplikasi bank atau dompet digital setelah pesanan
              dibuat.
            </span>
            <span className="mt-auto pt-5 text-xs font-bold text-brand-forest">
              {formatIdr(totalPriceIdr)}
            </span>
          </Button>
        </div>
      </div>

      {fieldErrors.general && (
        <Alert variant="destructive" className="mt-6">
          <AlertDescription>{fieldErrors.general}</AlertDescription>
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
