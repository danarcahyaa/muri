"use client";

import { ArrowRight, Gift, UserRound } from "lucide-react";
import { LocationPicker, type AddressJSONB } from "@/components/shared/LocationPicker";

import type { CustomerCheckoutData } from "@/types/customerCheckout";

interface ProductCheckoutFormProps {
  checkout: CustomerCheckoutData;
  receiverName: string;
  onReceiverNameChange: (value: string) => void;
  phoneNumber: string;
  onPhoneNumberChange: (value: string) => void;
  shippingAddress: string;
  onShippingAddressChange: (value: string) => void;
  claimBonus: boolean;
  onClaimBonusChange: (value: boolean) => void;
  errorMessage: string | null;
  onReview: () => void;
}

export default function ProductCheckoutForm({
  checkout,
  receiverName,
  onReceiverNameChange,
  phoneNumber,
  onPhoneNumberChange,
  shippingAddress,
  onShippingAddressChange,
  claimBonus,
  onClaimBonusChange,
  errorMessage,
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
        <UserRound className="size-4" strokeWidth={2} />

        <p className="text-xs font-bold uppercase">
          Informasi Pengiriman
        </p>
      </div>

      <h1 className="mt-5 font-display text-4xl font-medium tracking-[-0.045em] text-brand-black sm:text-5xl">
        Selesaikan Pesanan
      </h1>

      <p className="mt-4 max-w-xl text-sm leading-6 text-muted-moss">
        Pastikan nama penerima, nomor telepon, dan alamat pengiriman sudah
        benar.
      </p>

      <div className="mt-8 space-y-5">
        <CheckoutField
          id="receiver-name"
          label="Nama Penerima"
          value={receiverName}
          onChange={onReceiverNameChange}
          placeholder="Nama lengkap penerima"
          minLength={2}
          maxLength={120}
          required
        />

        <CheckoutField
          id="phone-number"
          label="Nomor Telepon"
          value={phoneNumber}
          onChange={onPhoneNumberChange}
          placeholder="Contoh: 081234567890"
          maxLength={30}
          type="tel"
        />

        <div className="pt-2">
          <LocationPicker
            value={locationValue}
            onChange={handleLocationChange}
            label="Cari Tujuan Pengiriman"
            detailLabel="Detail Alamat Lengkap & Catatan Pengiriman"
            placeholder="Ketik wilayah/kota (misal: Denpasar Timur)..."
            detailPlaceholder="Jl. Sukajadi No. 120, Kontak Penerima (0812345678)..."
            required
          />
        </div>
      </div>

      {checkout.bonus && (
        <BonusClaimOption
          checkout={checkout}
          claimBonus={claimBonus}
          onChange={onClaimBonusChange}
        />
      )}

      {errorMessage && <CheckoutErrorMessage message={errorMessage} />}

      <button
        type="button"
        onClick={onReview}
        className="
          group mt-8 flex w-full items-center
          justify-center gap-3 rounded-md
          bg-brand-forest px-6 py-4
          text-xs font-bold text-white
          transition hover:bg-brand-black
        "
      >
        Review Pesanan

        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </button>
    </>
  );
}

interface CheckoutFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  minLength?: number;
  maxLength: number;
  type?: "text" | "tel";
  required?: boolean;
}

function CheckoutField({
  id,
  label,
  value,
  onChange,
  placeholder,
  minLength,
  maxLength,
  type = "text",
  required = false,
}: CheckoutFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-bold text-brand-black">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>

      <input
        id={id}
        type={type}
        value={value}
        minLength={minLength}
        maxLength={maxLength}
        required={required}
        aria-required={required || undefined}
        placeholder={placeholder}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        className="
          mt-3 w-full rounded-xl
          border border-brand-black/15
          bg-canvas-pure px-4 py-3
          text-sm text-brand-black
          outline-none transition
          placeholder:text-muted-moss/60
          focus:border-brand-emerald
          focus:ring-2 focus:ring-brand-emerald/10
        "
      />
    </div>
  );
}

function BonusClaimOption({
  checkout,
  claimBonus,
  onChange,
}: {
  checkout: CustomerCheckoutData;
  claimBonus: boolean;
  onChange: (value: boolean) => void;
}) {
  const bonus = checkout.bonus;

  if (!bonus) {
    return null;
  }

  return (
    <div className="mt-8 rounded-2xl border border-brand-lime bg-brand-lime/15 p-5">
      <div className="flex items-start gap-4">
        <Gift className="mt-1 size-5 shrink-0 text-brand-emerald" />

        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase text-brand-emerald">
            Bonus Produk
          </p>

          <p className="mt-2 text-sm font-bold text-brand-black">
            {bonus.totalQuantity}× {bonus.productName}
          </p>

          <p className="mt-2 text-xs leading-5 text-muted-moss">
            Membutuhkan {bonus.totalCoinCost} coin. Saldo Anda{" "}
            {checkout.profile.totalPoints} coin.
          </p>

          {!bonus.hasEnoughStock && (
            <p className="mt-3 text-xs font-medium text-red-700">
              Stok produk bonus tidak mencukupi.
            </p>
          )}

          {bonus.hasEnoughStock && !bonus.hasEnoughPoints && (
            <p className="mt-3 text-xs font-medium text-red-700">
              Coin Anda belum mencukupi.
            </p>
          )}

          <label
            className={`
              mt-5 flex items-center gap-3 rounded-xl
              border px-4 py-3
              ${
                bonus.canClaim
                  ? "cursor-pointer border-line-trace bg-canvas-pure"
                  : "cursor-not-allowed border-line-trace bg-canvas-warm opacity-60"
              }
            `}
          >
            <input
              type="checkbox"
              checked={claimBonus && bonus.canClaim}
              disabled={!bonus.canClaim}
              onChange={(event) => {
                onChange(event.target.checked);
              }}
              className="size-4 accent-brand-forest"
            />

            <span className="text-xs font-bold text-brand-black">
              Klaim bonus dengan coin
            </span>
          </label>
        </div>
      </div>
    </div>
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
