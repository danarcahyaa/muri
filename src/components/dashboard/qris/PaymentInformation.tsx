"use client";

import type { ReactNode } from "react";
import { Clock3, Copy, LoaderCircle } from "lucide-react";
import { formatIdr } from "@/lib/productDetail";
import type { CustomerOrder, CustomerOrderPaymentStatus } from "@/types/customerOrder";

export interface PaymentCountdown {
  label: string;
  isExpired: boolean;
  isUrgent: boolean;
}

interface PaymentInformationProps {
  order: CustomerOrder;
  countdown: PaymentCountdown;
  isExpiring: boolean;
  onCopyAmount: () => void;
}

export function PaymentInformation({
  order,
  countdown,
  isExpiring,
  onCopyAmount,
}: PaymentInformationProps) {
  const payment = order.payment;
  if (!payment) return null;

  return (
    <section>
      <h2 className="text-xs font-bold uppercase text-brand-black">
        Informasi Pembayaran
      </h2>

      <div className="mt-5">
        <InformationRow
          label="Nomor Pesanan"
          value={formatOrderCode(order.id)}
        />
        <InformationRow
          label="Total"
          value={formatIdr(payment.amountIdr)}
          action={
            payment.status === "waiting_payment" ? (
              <button
                type="button"
                onClick={onCopyAmount}
                aria-label="Salin nominal"
                className="ml-2 text-brand-emerald transition hover:text-brand-forest"
              >
                <Copy className="size-3.5" />
              </button>
            ) : null
          }
        />
        <InformationRow
          label="Status"
          value={getPaymentStatusLabel(payment.status)}
        />
        {payment.expiresAt && (
          <InformationRow
            label="Batas Waktu"
            value={formatDateTime(payment.expiresAt)}
          />
        )}
      </div>

      {payment.status === "waiting_payment" && (
        <div
          className={`
            mt-6 rounded-2xl border p-5
            ${
              countdown.isUrgent
                ? "border-red-200 bg-red-50"
                : "border-amber-200 bg-amber-50"
            }
          `}
        >
          <div className="flex items-center gap-2">
            {isExpiring ? (
              <LoaderCircle className="size-4 animate-spin text-amber-700" />
            ) : (
              <Clock3
                className={
                  countdown.isUrgent
                    ? "size-4 text-red-700"
                    : "size-4 text-amber-700"
                }
              />
            )}

            <p
              className={
                countdown.isUrgent
                  ? "text-[10px] font-bold uppercase text-red-700"
                  : "text-[10px] font-bold uppercase text-amber-700"
              }
            >
              Sisa Waktu
            </p>
          </div>

          <p
            className={
              countdown.isUrgent
                ? "mt-4 font-display text-4xl font-medium text-red-800"
                : "mt-4 font-display text-4xl font-medium text-amber-900"
            }
          >
            {countdown.label}
          </p>

          <p
            className={
              countdown.isUrgent
                ? "mt-2 text-[10px] leading-4 text-red-700"
                : "mt-2 text-[10px] leading-4 text-amber-800"
            }
          >
            Stok produk hanya direservasi sampai waktu pembayaran berakhir.
          </p>
        </div>
      )}
    </section>
  );
}

function InformationRow({
  label,
  value,
  action = null,
}: {
  label: string;
  value: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line-trace py-3 last:border-b-0">
      <span className="text-xs text-muted-moss">{label}</span>
      <div className="flex items-center">
        <span className="text-right text-xs font-bold text-brand-black">
          {value}
        </span>
        {action}
      </div>
    </div>
  );
}

export function getPaymentCountdown(
  expiresAt: string | null,
  currentTime: number,
): PaymentCountdown {
  if (!expiresAt) {
    return { label: "--:--", isExpired: false, isUrgent: false };
  }

  const expiryTime = new Date(expiresAt).getTime();
  if (Number.isNaN(expiryTime)) {
    return { label: "--:--", isExpired: false, isUrgent: false };
  }

  const difference = expiryTime - currentTime;
  if (difference <= 0) {
    return { label: "00:00", isExpired: true, isUrgent: true };
  }

  const totalSeconds = Math.floor(difference / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const label =
    hours > 0
      ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
          2,
          "0",
        )}:${String(seconds).padStart(2, "0")}`
      : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
          2,
          "0",
        )}`;

  return {
    label,
    isExpired: false,
    isUrgent: difference <= 5 * 60 * 1000,
  };
}

export function getPaymentStatusMeta(status: CustomerOrderPaymentStatus) {
  switch (status) {
    case "waiting_payment":
      return {
        label: "Menunggu Pembayaran",
        className: "bg-amber-100 text-amber-800",
      };
    case "waiting_verification":
      return {
        label: "Menunggu Verifikasi",
        className: "bg-blue-100 text-blue-800",
      };
    case "paid":
      return {
        label: "Sudah Dibayar",
        className: "bg-brand-lime/50 text-brand-forest",
      };
    case "expired":
      return {
        label: "Kedaluwarsa",
        className: "bg-neutral-200 text-neutral-700",
      };
    case "failed":
      return {
        label: "Gagal",
        className: "bg-red-100 text-red-700",
      };
    case "refunded":
      return {
        label: "Dikembalikan",
        className: "bg-purple-100 text-purple-800",
      };
  }
}

export function getPaymentStatusLabel(status: CustomerOrderPaymentStatus): string {
  return getPaymentStatusMeta(status).label;
}

export function formatOrderCode(orderId: string): string {
  const shortId = orderId.replaceAll("-", "").slice(0, 8).toUpperCase();
  return `ORD-${shortId}`;
}

export function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tidak tersedia";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
