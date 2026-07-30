"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Coins,
  Leaf,
  LoaderCircle,
  Package,
  RefreshCw,
  Truck,
  XCircle,
} from "lucide-react";

import {
  cancelCustomerUnpaidQrisOrder,
  getCustomerOrderLifecycle,
  getCustomerOrderLifecycleErrorMessage,
} from "@/services/customer/orderLifecycleService";
import type { CustomerOrderLifecycle } from "@/types/customerOrderLifecycle";

interface CustomerOrderLifecyclePanelProps {
  orderId: string;
  onChanged?: () => Promise<void> | void;
}

export default function CustomerOrderLifecyclePanel({
  orderId,
  onChanged,
}: CustomerOrderLifecyclePanelProps) {
  const [lifecycle, setLifecycle] = useState<CustomerOrderLifecycle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadLifecycle = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await getCustomerOrderLifecycle(orderId);

      if (!result.success || !result.data) {
        setLifecycle(null);
        setErrorMessage(getCustomerOrderLifecycleErrorMessage(result.error));
        return;
      }

      setLifecycle(result.data);
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void loadLifecycle();
  }, [loadLifecycle]);

  const canCancel =
    lifecycle?.orderStatus === "pending" &&
    lifecycle.payment?.method === "qris" &&
    lifecycle.payment.status === "waiting_payment";

  const steps = useMemo(() => {
    if (!lifecycle) {
      return [];
    }

    return [
      {
        label: "Pesanan dibuat",
        value: lifecycle.createdAt,
        completed: Boolean(lifecycle.createdAt),
        icon: Clock3,
      },
      {
        label: "Pembayaran diterima",
        value: lifecycle.payment?.paidAt ?? null,
        completed: lifecycle.payment?.status === "paid",
        icon: Coins,
      },
      {
        label: "Sedang diproses",
        value: lifecycle.processingAt,
        completed: Boolean(lifecycle.processingAt),
        icon: Package,
      },
      {
        label: "Sudah dikirim",
        value: lifecycle.shippedAt,
        completed: Boolean(lifecycle.shippedAt),
        icon: Truck,
      },
      {
        label: "Selesai",
        value: lifecycle.completedAt,
        completed: lifecycle.orderStatus === "complete",
        icon: CheckCircle2,
      },
    ];
  }, [lifecycle]);

  async function handleCancel() {
    if (!canCancel || isCancelling) {
      return;
    }

    setIsCancelling(true);
    setActionMessage(null);

    try {
      const result = await cancelCustomerUnpaidQrisOrder(
        orderId,
        cancelReason.trim() || undefined,
      );

      if (!result.success || !result.data) {
        setActionMessage(getCustomerOrderLifecycleErrorMessage(result.error));
        return;
      }

      setActionMessage("Pesanan dibatalkan dan stok telah dikembalikan.");
      setShowCancel(false);
      setCancelReason("");
      await loadLifecycle();
      await onChanged?.();
    } finally {
      setIsCancelling(false);
    }
  }

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-brand-black/15 bg-canvas-pure p-8">
        <div className="flex min-h-48 items-center justify-center">
          <LoaderCircle className="size-7 animate-spin text-brand-emerald" />
        </div>
      </section>
    );
  }

  if (errorMessage || !lifecycle) {
    return (
      <section className="rounded-3xl border border-brand-black/15 bg-canvas-pure p-8 text-center">
        <RefreshCw className="mx-auto size-7 text-muted-moss" />
        <p className="mt-4 text-xs text-muted-moss">
          {errorMessage ?? "Status pesanan tidak tersedia."}
        </p>
        <button
          type="button"
          onClick={() => void loadLifecycle()}
          className="mt-5 rounded-md bg-brand-forest px-5 py-3 text-xs font-bold text-white"
        >
          Muat Ulang
        </button>
      </section>
    );
  }

  const isCancelled =
    lifecycle.orderStatus === "cancelled" ||
    lifecycle.orderStatus === "rejected";

  return (
    <section className="rounded-3xl border border-brand-black/15 bg-canvas-pure p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-brand-emerald">
            Perjalanan Pesanan
          </p>
          <h2 className="mt-3 font-display text-3xl font-medium text-brand-black">
            Status dan Pengiriman
          </h2>
        </div>

        {lifecycle.trackingNumber && (
          <div className="rounded-xl bg-canvas-warm px-4 py-3 sm:text-right">
            <p className="text-[9px] font-bold uppercase text-muted-moss">
              Nomor Resi
            </p>
            <p className="mt-1 text-xs font-bold text-brand-black">
              {lifecycle.trackingNumber}
            </p>
          </div>
        )}
      </div>

      {isCancelled ? (
        <div className="mt-7 rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex gap-3">
            <XCircle className="mt-0.5 size-5 shrink-0 text-red-700" />
            <div>
              <p className="text-sm font-bold text-red-900">
                Pesanan tidak dilanjutkan
              </p>
              <p className="mt-2 text-xs leading-5 text-red-700">
                {lifecycle.cancellationReason ??
                  "Pesanan dibatalkan atau pembayaran ditolak."}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-7 space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div key={step.label} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex size-9 items-center justify-center rounded-full ${
                      step.completed
                        ? "bg-brand-forest text-white"
                        : "bg-canvas-warm text-muted-moss"
                    }`}
                  >
                    <Icon className="size-4" />
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`mt-1 h-8 w-px ${
                        step.completed ? "bg-brand-forest/40" : "bg-line-trace"
                      }`}
                    />
                  )}
                </div>

                <div className="pt-1">
                  <p className="text-xs font-bold text-brand-black">
                    {step.label}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-moss">
                    {step.value ? formatDateTime(step.value) : "Belum dilakukan"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {lifecycle.orderStatus === "complete" && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-brand-lime bg-brand-lime/15 p-5">
            <Coins className="size-5 text-brand-forest" />
            <p className="mt-3 text-[9px] font-bold uppercase text-muted-moss">
              Bonus Coin
            </p>
            <p className="mt-2 font-display text-2xl font-medium text-brand-forest">
              + {formatNumber(lifecycle.pointsEarned)} coin
            </p>
          </div>

          <div className="rounded-2xl border border-brand-black/15 bg-canvas-warm p-5">
            <Leaf className="size-5 text-brand-emerald" />
            <p className="mt-3 text-[9px] font-bold uppercase text-muted-moss">
              Dampak Pesanan
            </p>
            <p className="mt-2 text-xs font-bold text-brand-black">
              {formatDecimal(lifecycle.impactCarbonSavedKg)} kg karbon
            </p>
            <p className="mt-1 text-[10px] text-muted-moss">
              {formatDecimal(lifecycle.impactWaterSavedLiters)} liter air
            </p>
          </div>
        </div>
      )}

      {lifecycle.shippingNote && (
        <div className="mt-7 rounded-xl bg-canvas-warm p-4">
          <p className="text-[9px] font-bold uppercase text-muted-moss">
            Catatan Pengiriman
          </p>
          <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-brand-black">
            {lifecycle.shippingNote}
          </p>
        </div>
      )}

      {actionMessage && (
        <div className="mt-5 rounded-xl border border-brand-black/15 bg-canvas-warm px-4 py-3 text-xs text-brand-black">
          {actionMessage}
        </div>
      )}

      {canCancel && !showCancel && (
        <button
          type="button"
          onClick={() => setShowCancel(true)}
          className="mt-7 w-full rounded-md border border-red-200 bg-red-50 px-5 py-3.5 text-xs font-bold text-red-700 transition hover:bg-red-100"
        >
          Batalkan Pesanan Belum Dibayar
        </button>
      )}

      {canCancel && showCancel && (
        <div className="mt-7 rounded-2xl border border-red-200 bg-red-50 p-5">
          <label htmlFor="customer-cancel-reason" className="text-xs font-bold text-red-900">
            Alasan pembatalan
          </label>
          <textarea
            id="customer-cancel-reason"
            value={cancelReason}
            maxLength={1000}
            rows={4}
            disabled={isCancelling}
            onChange={(event) => setCancelReason(event.target.value)}
            placeholder="Opsional"
            className="mt-3 w-full resize-none rounded-xl border border-red-200 bg-white px-4 py-3 text-sm text-brand-black outline-none"
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={isCancelling}
              onClick={() => {
                setShowCancel(false);
                setCancelReason("");
              }}
              className="rounded-md border border-brand-black/15 bg-white px-5 py-3 text-xs font-bold text-brand-black"
            >
              Kembali
            </button>
            <button
              type="button"
              disabled={isCancelling}
              onClick={() => void handleCancel()}
              className="flex items-center justify-center gap-2 rounded-md bg-red-700 px-5 py-3 text-xs font-bold text-white disabled:opacity-50"
            >
              {isCancelling && <LoaderCircle className="size-4 animate-spin" />}
              Konfirmasi Pembatalan
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Waktu tidak tersedia";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDecimal(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(value);
}
