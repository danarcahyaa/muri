"use client";

import { useCallback, useEffect, useState } from "react";
import { LoaderCircle, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

import {
  getBrandPaymentProofSignedUrl,
  getBrandPaymentVerificationErrorMessage,
  getBrandQrisVerificationQueue,
  verifyBrandQrisPayment,
} from "@/services/brand";
import type {
  BrandPaymentVerificationDecision,
  BrandQrisVerificationQueueItem,
} from "@/types/brandPaymentVerification";

import { VerificationQueueCard } from "./verification/VerificationQueueCard";
import { VerificationModal } from "./verification/VerificationModal";

export default function BrandQrisVerificationSection() {
  const [queue, setQueue] = useState<BrandQrisVerificationQueueItem[]>([]);
  const [selectedOrder, setSelectedOrder] =
    useState<BrandQrisVerificationQueueItem | null>(null);
  const [signedProofUrl, setSignedProofUrl] = useState<string | null>(null);
  const [verificationNote, setVerificationNote] = useState("");
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProofLoading, setIsProofLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadQueue = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await getBrandQrisVerificationQueue(50);

      if (!result.success || !result.data) {
        setQueue([]);
        setErrorMessage(
          getBrandPaymentVerificationErrorMessage(result.error),
        );
        return;
      }

      setQueue(result.data);
    } catch (error) {
      console.error("[BrandQrisVerificationSection] Queue error:", error);
      setQueue([]);
      setErrorMessage("Antrean verifikasi belum dapat dimuat.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  useEffect(() => {
    if (!selectedOrder) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedOrder]);

  async function openVerification(order: BrandQrisVerificationQueueItem) {
    setSelectedOrder(order);
    setSignedProofUrl(null);
    setVerificationNote("");
    setReviewConfirmed(false);
    setModalError(null);
    setSuccessMessage(null);

    if (!order.proofPath) {
      setModalError("Path bukti pembayaran tidak tersedia.");
      return;
    }

    setIsProofLoading(true);

    try {
      const result = await getBrandPaymentProofSignedUrl(order.proofPath);

      if (!result.success || !result.data) {
        setModalError(
          getBrandPaymentVerificationErrorMessage(result.error),
        );
        return;
      }

      setSignedProofUrl(result.data.signedUrl);
    } finally {
      setIsProofLoading(false);
    }
  }

  function closeModal() {
    if (isVerifying) return;
    setSelectedOrder(null);
    setSignedProofUrl(null);
    setVerificationNote("");
    setReviewConfirmed(false);
    setModalError(null);
  }

  async function handleDecision(decision: BrandPaymentVerificationDecision) {
    if (!selectedOrder || isVerifying) return;

    setModalError(null);
    const normalizedNote = verificationNote.trim();

    if (decision === "approve" && !reviewConfirmed) {
      setModalError(
        "Centang konfirmasi bahwa bukti dan nominal sudah diperiksa.",
      );
      return;
    }

    if (decision === "reject" && normalizedNote.length < 5) {
      setModalError("Tuliskan alasan penolakan minimal 5 karakter.");
      return;
    }

    setIsVerifying(true);

    try {
      const result = await verifyBrandQrisPayment({
        orderId: selectedOrder.orderId,
        decision,
        note: normalizedNote || undefined,
      });

      if (!result.success || !result.data) {
        setModalError(
          getBrandPaymentVerificationErrorMessage(result.error),
        );
        return;
      }

      setSuccessMessage(
        decision === "approve"
          ? "Pembayaran berhasil disetujui."
          : "Pembayaran ditolak dan stok telah dikembalikan.",
      );

      setSelectedOrder(null);
      setSignedProofUrl(null);

      await loadQueue();
    } catch (error) {
      console.error("[BrandQrisVerificationSection] Verification error:", error);
      setModalError("Keputusan verifikasi belum dapat disimpan.");
    } finally {
      setIsVerifying(false);
    }
  }

  if (isLoading) {
    return (
      <section className="mt-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-2xl border border-line-trace bg-canvas-pure p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-8 w-3/4" />
              <div className="space-y-2 pt-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <Skeleton className="h-10 w-full rounded-sm" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="mt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-brand-emerald">
              Pembayaran QRIS
            </p>
            <h1 className="mt-3 font-display text-4xl font-medium tracking-[-0.045em] text-brand-black sm:text-5xl">
              Verifikasi Pembayaran
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-moss">
              Periksa bukti dan nominal pembayaran customer sebelum menerima pesanan.
            </p>
          </div>

          <button
            type="button"
            onClick={() => { void loadQueue(); }}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-line-trace px-5 py-3 text-xs font-bold text-brand-black transition hover:border-brand-forest"
          >
            <RefreshCw className="size-4" />
            Muat Ulang
          </button>
        </div>

        {successMessage && (
          <div
            role="status"
            className="mt-6 rounded-xl border border-brand-lime bg-brand-lime/15 px-5 py-4 text-xs font-medium text-brand-forest"
          >
            {successMessage}
          </div>
        )}

        {errorMessage ? (
          <div className="mt-8 flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-line-trace bg-canvas-pure p-6 text-center">
            <RefreshCw className="size-8 text-muted-moss/40" />
            <p className="mt-4 text-sm font-medium text-brand-black">{errorMessage}</p>
            <button
              type="button"
              onClick={() => { void loadQueue(); }}
              className="mt-5 rounded-md bg-brand-forest px-5 py-3 text-xs font-bold text-white"
            >
              Coba Lagi
            </button>
          </div>
        ) : queue.length === 0 ? (
          <div className="mt-8 flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-line-trace bg-canvas-pure p-6 text-center">
            <p className="text-sm font-medium text-brand-black">Antrean Kosong</p>
            <p className="mt-2 text-xs text-muted-moss">
              Tidak ada pembayaran QRIS yang membutuhkan verifikasi saat ini.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-5">
            {queue.map((order) => (
              <VerificationQueueCard
                key={order.orderId}
                order={order}
                onOpen={() => { void openVerification(order); }}
              />
            ))}
          </div>
        )}
      </section>

      {selectedOrder && (
        <VerificationModal
          order={selectedOrder}
          signedProofUrl={signedProofUrl}
          verificationNote={verificationNote}
          reviewConfirmed={reviewConfirmed}
          isProofLoading={isProofLoading}
          isVerifying={isVerifying}
          errorMessage={modalError}
          onNoteChange={setVerificationNote}
          onReviewConfirmedChange={setReviewConfirmed}
          onClose={closeModal}
          onApprove={() => { void handleDecision("approve"); }}
          onReject={() => { void handleDecision("reject"); }}
        />
      )}
    </>
  );
}