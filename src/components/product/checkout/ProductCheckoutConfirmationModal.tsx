"use client";

import { Coins, LoaderCircle, QrCode, X } from "lucide-react";
import { formatCoin, formatIdr } from "@/lib/productDetail";
import type {
  CustomerCheckoutPaymentMethod,
  CustomerCheckoutPreview,
} from "@/types/customerCheckout";

interface FinalConfirmationModalProps {
  checkout: CustomerCheckoutPreview;
  receiverName: string;
  shippingAddress: string;
  paymentMethod: CustomerCheckoutPaymentMethod | null;
  confirmationAccepted: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
  onConfirmationChange: (value: boolean) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function ProductCheckoutConfirmationModal({
  checkout,
  receiverName,
  shippingAddress,
  paymentMethod,
  confirmationAccepted,
  isSubmitting,
  errorMessage,
  onConfirmationChange,
  onClose,
  onConfirm,
}: FinalConfirmationModalProps) {
  const paymentText =
    paymentMethod === "coin"
      ? formatCoin(checkout.totalPriceCoin ?? 0)
      : formatIdr(checkout.totalPriceIdr ?? 0);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-xs animate-in fade-in-0">
      <div className="max-h-full w-full max-w-xl overflow-y-auto rounded-2xl border border-brand-black/15 bg-canvas-pure p-6 sm:p-8">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase text-brand-emerald">
              Konfirmasi Transaksi
            </p>

            <h2 className="mt-3 font-display text-3xl font-medium tracking-[-0.04em] text-brand-black">
              Buat Pesanan Ini?
            </h2>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            aria-label="Tutup konfirmasi"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-canvas-warm text-brand-black transition hover:bg-line-trace"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-7 rounded-xl border border-brand-black/15 bg-canvas-warm/40 p-5">
          <ConfirmationRow
            label="Produk"
            value={`${checkout.quantity}× ${checkout.product.name}`}
          />
          <ConfirmationRow label="Penerima" value={receiverName} />
          <ConfirmationRow label="Alamat" value={shippingAddress} />
          <ConfirmationRow
            label="Metode"
            value={paymentMethod === "coin" ? "Coin" : "QRIS"}
          />
          <ConfirmationRow label="Total" value={paymentText} last />
        </div>

        {paymentMethod === "qris" && (
          <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
            Pesanan akan dibuat dengan status menunggu pembayaran. Stok akan
            direservasi selama 30 menit.
          </p>
        )}

        {paymentMethod === "coin" && (
          <p className="mt-5 rounded-xl border border-brand-lime bg-brand-lime/15 px-4 py-3 text-xs leading-5 text-brand-forest">
            Coin akan langsung dipotong setelah transaksi dikonfirmasi.
          </p>
        )}

        <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-brand-black/15 bg-canvas-warm/20 p-4">
          <input
            type="checkbox"
            checked={confirmationAccepted}
            disabled={isSubmitting}
            onChange={(event) => {
              onConfirmationChange(event.target.checked);
            }}
            className="mt-0.5 size-4 rounded-sm accent-brand-forest"
          />

          <span className="text-xs leading-5 text-brand-black">
            Saya sudah memeriksa produk, jumlah, alamat, metode pembayaran, dan
            total transaksi. Saya menyetujui pembuatan pesanan ini.
          </span>
        </label>

        {errorMessage && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700"
          >
            {errorMessage}
          </div>
        )}

        <button
          type="button"
          disabled={isSubmitting || !confirmationAccepted}
          onClick={onConfirm}
          className="
            mt-6 flex w-full
            items-center justify-center
            gap-3 rounded-sm
            bg-brand-forest
            px-6 py-4
            text-xs font-bold
            text-white transition
            hover:bg-brand-black
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              Memproses Transaksi...
            </>
          ) : paymentMethod === "coin" ? (
            <>
              Bayar dengan Coin
              <Coins className="size-4" />
            </>
          ) : (
            <>
              Buat Pesanan QRIS
              <QrCode className="size-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function ConfirmationRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`
        flex items-start
        justify-between gap-5 py-3
        ${last ? "" : "border-b border-line-trace"}
      `}
    >
      <span className="text-xs text-muted-moss">{label}</span>
      <span className="max-w-[65%] text-right text-xs font-bold text-brand-black">
        {value}
      </span>
    </div>
  );
}
