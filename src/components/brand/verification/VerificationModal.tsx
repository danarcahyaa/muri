/* eslint-disable @next/next/no-img-element */

"use client";

import { CheckCircle2, LoaderCircle, ShieldCheck, X, XCircle } from "lucide-react";
import { formatIdr } from "@/lib/productDetail";
import type { BrandQrisVerificationQueueItem } from "@/types/brandPaymentVerification";
import { formatOrderCode } from "./VerificationQueueCard";

interface VerificationModalProps {
  order: BrandQrisVerificationQueueItem;
  signedProofUrl: string | null;
  verificationNote: string;
  reviewConfirmed: boolean;
  isProofLoading: boolean;
  isVerifying: boolean;
  errorMessage: string | null;
  onNoteChange: (value: string) => void;
  onReviewConfirmedChange: (value: boolean) => void;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export function VerificationModal({
  order,
  signedProofUrl,
  verificationNote,
  reviewConfirmed,
  isProofLoading,
  isVerifying,
  errorMessage,
  onNoteChange,
  onReviewConfirmedChange,
  onClose,
  onApprove,
  onReject,
}: VerificationModalProps) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-xs animate-in fade-in-0"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-full w-full max-w-5xl overflow-y-auto rounded-2xl border border-line-trace bg-canvas-pure shadow-none"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-5 border-b border-line-trace bg-canvas-pure px-6 py-6 sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase text-brand-emerald">
              Verifikasi QRIS
            </p>
            <h2 className="mt-2 font-display text-3xl font-medium text-brand-black">
              {formatOrderCode(order.orderId)}
            </h2>
          </div>

          <button
            type="button"
            disabled={isVerifying}
            onClick={onClose}
            aria-label="Tutup dialog"
            className="flex size-9 items-center justify-center rounded-full bg-canvas-warm text-brand-black transition hover:bg-line-trace"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_380px]">
          <main className="border-b border-line-trace p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <p className="text-xs font-bold uppercase text-brand-black">
              Bukti Pembayaran
            </p>

            {isProofLoading ? (
              <div className="mt-5 flex min-h-96 items-center justify-center rounded-xl bg-canvas-warm">
                <LoaderCircle className="size-8 animate-spin text-brand-emerald" />
              </div>
            ) : signedProofUrl ? (
              <div className="mt-5 rounded-xl border border-line-trace bg-white p-4">
                <img
                  src={signedProofUrl}
                  alt="Bukti pembayaran QRIS customer"
                  className="mx-auto max-h-[650px] w-full object-contain"
                />
              </div>
            ) : (
              <div className="mt-5 flex min-h-80 items-center justify-center rounded-xl bg-red-50 px-6 text-center">
                <p className="text-xs text-red-700">
                  Bukti pembayaran belum dapat ditampilkan.
                </p>
              </div>
            )}
          </main>

          <aside className="p-6 sm:p-8">
            <div className="rounded-xl bg-brand-lime p-5 text-brand-forest">
              <p className="text-[9px] font-bold uppercase opacity-65">
                Nominal yang harus cocok
              </p>
              <p className="mt-4 font-display text-3xl font-medium">
                {formatIdr(order.amountIdr)}
              </p>
            </div>

            <div className="mt-6">
              <p className="text-[10px] font-bold uppercase text-muted-moss">
                Customer
              </p>
              <p className="mt-2 text-sm font-bold text-brand-black">
                {order.receiverName}
              </p>
              <p className="mt-1 text-xs text-muted-moss">
                {order.phoneNumber || "Nomor telepon tidak tersedia"}
              </p>
            </div>

            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-line-trace p-4">
              <input
                type="checkbox"
                checked={reviewConfirmed}
                disabled={isVerifying}
                onChange={(event) => {
                  onReviewConfirmedChange(event.target.checked);
                }}
                className="mt-0.5 size-4 rounded-sm accent-brand-forest"
              />
              <span className="text-xs leading-5 text-brand-black">
                Saya sudah memeriksa nama, nominal, dan bukti pembayaran.
              </span>
            </label>

            <div className="mt-6">
              <label
                htmlFor="verification-note"
                className="text-xs font-bold text-brand-black"
              >
                Catatan Verifikasi
              </label>

              <textarea
                id="verification-note"
                value={verificationNote}
                disabled={isVerifying}
                maxLength={1000}
                rows={4}
                placeholder="Opsional untuk persetujuan, wajib untuk penolakan."
                onChange={(event) => {
                  onNoteChange(event.target.value);
                }}
                className="mt-3 w-full resize-none rounded-sm border border-line-trace bg-transparent px-4 py-3 font-body text-xs text-brand-black outline-none focus-visible:border-brand-emerald"
              />

              <p className="mt-2 text-right text-[9px] text-muted-moss">
                {verificationNote.length}/1000
              </p>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700"
              >
                {errorMessage}
              </div>
            )}

            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <button
                type="button"
                disabled={isVerifying || !signedProofUrl || !reviewConfirmed}
                onClick={onApprove}
                className="flex items-center justify-center gap-2 rounded-sm bg-brand-forest px-5 py-4 text-xs font-bold text-white transition hover:bg-brand-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isVerifying ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                Terima Pembayaran
              </button>

              <button
                type="button"
                disabled={isVerifying || verificationNote.trim().length < 5}
                onClick={onReject}
                className="flex items-center justify-center gap-2 rounded-sm border border-red-200 bg-red-50 px-5 py-4 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <XCircle className="size-4" />
                Tolak Pembayaran
              </button>
            </div>

            <div className="mt-5 flex gap-3 rounded-xl bg-canvas-warm p-4">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-emerald" />
              <p className="text-[10px] leading-5 text-muted-moss">
                Persetujuan membuat pembayaran berstatus paid. Penolakan
                mengembalikan seluruh stok pesanan.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
