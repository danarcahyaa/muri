"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Coins,
  QrCode,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { formatCoin, formatIdr } from "@/lib/productDetail";
import type {
  CustomerOrderPayment,
  CustomerOrderPaymentStatus,
} from "@/types/customerOrder";

interface CustomerOrderPaymentCardProps {
  payment: CustomerOrderPayment | null;
}

export default function CustomerOrderPaymentCard({
  payment,
}: CustomerOrderPaymentCardProps) {
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    if (
      payment?.method !== "qris" ||
      payment.status !== "waiting_payment" ||
      !payment.expiresAt
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [payment?.expiresAt, payment?.method, payment?.status]);

  const remainingTime = useMemo(() => {
    if (!payment?.expiresAt || payment.status !== "waiting_payment") {
      return null;
    }

    return getRemainingTime(payment.expiresAt, currentTime);
  }, [currentTime, payment?.expiresAt, payment?.status]);

  if (!payment) {
    return (
      <div className="mt-7 rounded-xl border border-line-trace bg-canvas-warm p-5">
        <p className="text-[10px] font-bold uppercase text-muted-moss">
          Pembayaran
        </p>

        <p className="mt-3 text-xs text-muted-moss">
          Data pembayaran belum tersedia untuk pesanan ini.
        </p>
      </div>
    );
  }

  const status = getPaymentStatusMeta(payment.status);

  const PaymentIcon = payment.method === "coin" ? Coins : QrCode;

  return (
    <div className="mt-7 rounded-xl border border-line-trace bg-canvas-warm p-5">
      <div className="flex items-start justify-between gap-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-canvas-pure text-brand-emerald">
            <PaymentIcon className="size-4" strokeWidth={1.8} />
          </div>

          <div>
            <p className="text-[9px] font-medium uppercase tracking-wide text-muted-moss">
              Metode Pembayaran
            </p>

            <p className="mt-1 text-xs font-bold text-brand-black">
              {payment.method === "coin" ? "Coin" : "QRIS"}
            </p>
          </div>
        </div>

        <span
          className={`
            rounded-full px-3 py-2
            text-[9px] font-bold
            uppercase tracking-wide
            ${status.className}
          `}
        >
          {status.label}
        </span>
      </div>

      <div className="mt-5 border-t border-line-trace pt-5">
        <PaymentRow
          label="Jumlah Pembayaran"
          value={
            payment.method === "coin"
              ? formatCoin(payment.amountCoin)
              : formatIdr(payment.amountIdr)
          }
        />

        {remainingTime && (
          <PaymentRow
            label="Sisa Waktu"
            value={
              remainingTime.isExpired ? "Waktu habis" : remainingTime.label
            }
            warning={remainingTime.isUrgent}
          />
        )}

        {payment.paidAt && (
          <PaymentRow label="Dibayar" value={formatDateTime(payment.paidAt)} />
        )}

        {payment.submittedAt && (
          <PaymentRow
            label="Bukti Dikirim"
            value={formatDateTime(payment.submittedAt)}
          />
        )}

        {payment.proofUrl && (
          <PaymentRow label="File Bukti" value="Tersimpan" />
        )}

        {payment.expiredAt && (
          <PaymentRow
            label="Kedaluwarsa"
            value={formatDateTime(payment.expiredAt)}
          />
        )}
      </div>
    </div>
  );
}

function PaymentRow({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-[10px] text-muted-moss">{label}</span>

      <span
        className={
          warning
            ? "text-[10px] font-bold text-red-700"
            : "text-[10px] font-bold text-brand-black"
        }
      >
        {value}
      </span>
    </div>
  );
}

function getPaymentStatusMeta(status: CustomerOrderPaymentStatus) {
  switch (status) {
    case "waiting_payment":
      return {
        label: "Menunggu Pembayaran",
        className: "bg-amber-100 text-amber-800",
        icon: Clock3,
      };

    case "waiting_verification":
      return {
        label: "Menunggu Verifikasi",
        className: "bg-blue-100 text-blue-800",
        icon: ShieldCheck,
      };

    case "paid":
      return {
        label: "Sudah Dibayar",
        className: "bg-brand-lime/50 text-brand-forest",
        icon: CheckCircle2,
      };

    case "expired":
      return {
        label: "Kedaluwarsa",
        className: "bg-neutral-200 text-neutral-700",
        icon: Clock3,
      };

    case "failed":
      return {
        label: "Pembayaran Gagal",
        className: "bg-red-100 text-red-700",
        icon: XCircle,
      };

    case "refunded":
      return {
        label: "Dikembalikan",
        className: "bg-purple-100 text-purple-800",
        icon: RefreshCw,
      };

    default:
      return {
        label: status,
        className: "bg-neutral-100 text-neutral-700",
        icon: Clock3,
      };
  }
}

function getRemainingTime(
  expiresAt: string,
  currentTime: number,
): {
  label: string;
  isExpired: boolean;
  isUrgent: boolean;
} {
  const expiresAtTime = new Date(expiresAt).getTime();

  if (Number.isNaN(expiresAtTime)) {
    return {
      label: "Tidak tersedia",
      isExpired: false,
      isUrgent: false,
    };
  }

  const difference = expiresAtTime - currentTime;

  if (difference <= 0) {
    return {
      label: "Waktu habis",
      isExpired: true,
      isUrgent: true,
    };
  }

  const totalSeconds = Math.floor(difference / 1000);

  const minutes = Math.floor(totalSeconds / 60);

  const seconds = totalSeconds % 60;

  return {
    label: `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`,

    isExpired: false,
    isUrgent: difference <= 5 * 60 * 1000,
  };
}

function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Tidak tersedia";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
