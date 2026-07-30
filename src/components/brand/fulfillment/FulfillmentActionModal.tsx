"use client";

import type { ReactNode } from "react";
import { LoaderCircle, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { formatCoin, formatIdr } from "@/lib/productDetail";
import type { BrandFulfillmentOrder } from "@/types/brandOrderFulfillment";
import {
  FulfillmentUiAction,
  getActionLabel,
  PrimaryActionIcon,
  formatOrderCode,
} from "./FulfillmentOrderCard";

interface FulfillmentActionModalProps {
  order: BrandFulfillmentOrder;
  action: FulfillmentUiAction;
  trackingNumber: string;
  shippingNote: string;
  cancellationReason: string;
  confirmed: boolean;
  isUpdating: boolean;
  errorMessage: string | null;
  onTrackingNumberChange: (value: string) => void;
  onShippingNoteChange: (value: string) => void;
  onCancellationReasonChange: (value: string) => void;
  onConfirmedChange: (value: boolean) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function FulfillmentActionModal({
  order,
  action,
  trackingNumber,
  shippingNote,
  cancellationReason,
  confirmed,
  isUpdating,
  errorMessage,
  onTrackingNumberChange,
  onShippingNoteChange,
  onCancellationReasonChange,
  onConfirmedChange,
  onClose,
  onSubmit,
}: FulfillmentActionModalProps) {
  const isShipping = action === "mark_shipped";
  const isComplete = action === "complete_order";
  const isCancel = action === "cancel_refund";

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-xs animate-in fade-in-0"
    >
      <section
        onClick={(e) => e.stopPropagation()}
        className="max-h-full w-full max-w-xl overflow-y-auto rounded-2xl border border-line-trace bg-canvas-pure shadow-none"
      >
        <header className="flex items-start justify-between gap-5 border-b border-line-trace px-6 py-6 sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase text-brand-emerald">
              {getActionLabel(action)}
            </p>
            <h2 className="mt-2 font-display text-3xl font-medium text-brand-black">
              {formatOrderCode(order.orderId)}
            </h2>
          </div>
          <button
            type="button"
            disabled={isUpdating}
            onClick={onClose}
            aria-label="Tutup dialog"
            className="flex size-9 items-center justify-center rounded-full bg-canvas-warm text-brand-black transition hover:bg-line-trace"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="p-6 sm:p-8">
          <div className="rounded-xl border border-line-trace bg-canvas-warm/40 p-5">
            <SummaryRow label="Penerima" value={order.receiverName} />
            <SummaryRow
              label="Pembayaran"
              value={
                order.paymentMethod === "coin"
                  ? formatCoin(order.amountCoin)
                  : formatIdr(order.amountIdr)
              }
            />
            {isComplete && (
              <SummaryRow
                label="Bonus Coin"
                value={`+ ${formatCoin(order.pointsEarned)}`}
              />
            )}
          </div>

          {isShipping && (
            <Field label="Nomor Resi" count={`${trackingNumber.length}/120`}>
              <div className="mt-3">
                <Input
                  value={trackingNumber}
                  maxLength={120}
                  disabled={isUpdating}
                  onChange={(event) => onTrackingNumberChange(event.target.value)}
                  placeholder="Masukkan nomor resi pengiriman"
                />
              </div>
            </Field>
          )}

          {!isComplete && !isCancel && (
            <Field label="Catatan" count={`${shippingNote.length}/1000`}>
              <textarea
                value={shippingNote}
                maxLength={1000}
                rows={4}
                disabled={isUpdating}
                onChange={(event) => onShippingNoteChange(event.target.value)}
                placeholder="Catatan opsional untuk pengiriman"
                className="mt-3 w-full resize-none rounded-sm border border-line-trace bg-transparent px-4 py-3 font-body text-xs text-brand-black outline-none focus-visible:border-brand-emerald"
              />
            </Field>
          )}

          {isCancel && (
            <>
              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
                Untuk pembayaran QRIS yang sudah paid, lakukan pengembalian dana
                kepada customer terlebih dahulu. Aksi ini kemudian menandai
                pembayaran sebagai refunded dan mengembalikan stok. Pembayaran
                coin dikembalikan otomatis.
              </div>
              <Field
                label="Alasan pembatalan / refund"
                count={`${cancellationReason.length}/1000`}
              >
                <textarea
                  value={cancellationReason}
                  maxLength={1000}
                  rows={4}
                  disabled={isUpdating}
                  onChange={(event) =>
                    onCancellationReasonChange(event.target.value)
                  }
                  placeholder="Masukkan alasan pembatalan"
                  className="mt-3 w-full resize-none rounded-sm border border-red-200 bg-transparent px-4 py-3 font-body text-xs text-brand-black outline-none focus-visible:border-red-500"
                />
              </Field>
            </>
          )}

          <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-line-trace bg-canvas-warm/20 p-4">
            <input
              type="checkbox"
              checked={confirmed}
              disabled={isUpdating}
              onChange={(event) => onConfirmedChange(event.target.checked)}
              className="mt-0.5 size-4 rounded-sm accent-brand-forest"
            />
            <span className="text-xs leading-5 text-brand-black">
              {getConfirmationText(action)}
            </span>
          </label>

          {errorMessage && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">
              {errorMessage}
            </div>
          )}

          <button
            type="button"
            disabled={isUpdating || !confirmed}
            onClick={onSubmit}
            className={`mt-7 flex w-full items-center justify-center gap-3 rounded-sm px-6 py-4 text-xs font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
              isCancel ? "bg-red-700 hover:bg-red-800" : "bg-brand-forest hover:bg-brand-black"
            }`}
          >
            {isUpdating ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <PrimaryActionIcon action={action} />
            )}
            {isUpdating ? "Menyimpan..." : getActionLabel(action)}
          </button>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  count,
  children,
}: {
  label: string;
  count: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-4">
        <label className="text-xs font-bold text-brand-black">{label}</label>
        <span className="text-[9px] text-muted-moss">{count}</span>
      </div>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-line-trace py-3 first:pt-0 last:border-b-0 last:pb-0">
      <span className="text-xs text-muted-moss">{label}</span>
      <span className="text-right text-xs font-bold text-brand-black">
        {value}
      </span>
    </div>
  );
}

function getConfirmationText(action: FulfillmentUiAction): string {
  switch (action) {
    case "start_processing":
      return "Saya mengonfirmasi bahwa pesanan ini siap untuk diproses.";
    case "mark_shipped":
      return "Saya mengonfirmasi bahwa paket pesanan sudah diserahkan ke kurir.";
    case "complete_order":
      return "Saya mengonfirmasi pesanan telah diterima dan diselesaikan.";
    case "cancel_refund":
      return "Saya mengonfirmasi bahwa dana sudah di-refund (bila ada) dan pesanan dibatalkan.";
  }
}
