"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  QrCode,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import {
  expireCustomerQrisOrder,
  getCustomerQrisPaymentErrorMessage,
  getMyOrderById,
} from "@/services/customer";
import CustomerQrisProofForm from "@/components/dashboard/CustomerQrisProofForm";
import type {
  CustomerOrder,
  CustomerOrderPaymentStatus,
} from "@/types/customerOrder";

import { QrisPanel } from "./qris/QrisPanel";
import {
  PaymentInformation,
  getPaymentCountdown,
  getPaymentStatusMeta,
  formatOrderCode,
} from "./qris/PaymentInformation";

interface CustomerQrisPaymentProps {
  orderId: string;
}

export default function CustomerQrisPayment({
  orderId,
}: CustomerQrisPaymentProps) {
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpiring, setIsExpiring] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const expiryRequestRef = useRef(false);
  const qrisImageUrl = process.env.NEXT_PUBLIC_QRIS_IMAGE_URL?.trim() ?? "";

  const loadOrder = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await getMyOrderById(orderId);

      if (!result.success || !result.data) {
        setOrder(null);
        setErrorMessage(getCustomerQrisPaymentErrorMessage(result.error));
        return;
      }

      if (result.data.payment?.method !== "qris") {
        setOrder(null);
        setErrorMessage("Pesanan ini tidak menggunakan pembayaran QRIS.");
        return;
      }

      setOrder(result.data);
    } catch (error) {
      console.error("[CustomerQrisPayment] Load error:", error);
      setOrder(null);
      setErrorMessage("Halaman pembayaran belum dapat dimuat.");
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    if (
      order?.payment?.status !== "waiting_payment" ||
      !order.payment.expiresAt
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [order?.payment?.expiresAt, order?.payment?.status]);

  const countdown = useMemo(() => {
    return getPaymentCountdown(order?.payment?.expiresAt ?? null, currentTime);
  }, [currentTime, order?.payment?.expiresAt]);

  const expireOrder = useCallback(async () => {
    if (expiryRequestRef.current) return;
    expiryRequestRef.current = true;
    setIsExpiring(true);
    setActionMessage(null);

    try {
      const result = await expireCustomerQrisOrder(orderId);
      if (!result.success) {
        const errorText = String(result.error ?? "").toUpperCase();
        if (!errorText.includes("PAYMENT_NOT_EXPIRED")) {
          setActionMessage(getCustomerQrisPaymentErrorMessage(result.error));
        }
      }
      await loadOrder();
    } finally {
      setIsExpiring(false);
      window.setTimeout(() => {
        expiryRequestRef.current = false;
      }, 3000);
    }
  }, [loadOrder, orderId]);

  useEffect(() => {
    if (order?.payment?.status !== "waiting_payment" || !countdown.isExpired) {
      return;
    }

    void expireOrder();
  }, [countdown.isExpired, expireOrder, order?.payment?.status]);

  async function copyAmount() {
    const amount = order?.payment?.amountIdr;
    if (amount === undefined) return;

    try {
      await navigator.clipboard.writeText(String(amount));
      setActionMessage("Nominal pembayaran berhasil disalin.");
    } catch {
      setActionMessage("Nominal belum dapat disalin.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center rounded-3xl border border-brand-black/15 bg-canvas-pure">
        <div className="text-center">
          <LoaderCircle className="mx-auto size-8 animate-spin text-brand-emerald" />
          <p className="mt-4 text-xs text-muted-moss">Menyiapkan pembayaran QRIS...</p>
        </div>
      </div>
    );
  }

  if (errorMessage || !order || !order.payment) {
    return (
      <section className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-brand-black/15 bg-canvas-pure px-6 py-12 text-center">
        <RefreshCw className="size-9 text-muted-moss/50" />
        <h1 className="mt-5 font-display text-3xl font-medium text-brand-black">
          Pembayaran Tidak Tersedia
        </h1>
        <p className="mt-3 text-xs text-muted-moss">{errorMessage ?? "Pembayaran tidak ditemukan."}</p>
        <button
          type="button"
          onClick={() => { void loadOrder(); }}
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-brand-forest px-5 py-3 text-xs font-bold text-white"
        >
          <RefreshCw className="size-4" />
          Coba Lagi
        </button>
      </section>
    );
  }

  const payment = order.payment;

  return (
    <div>
      <Link
        href={`/dashboard/orders/${order.id}`}
        className="inline-flex items-center gap-2 text-xs font-bold text-muted-moss transition hover:text-brand-forest"
      >
        <ArrowLeft className="size-4" />
        Kembali ke Detail Pesanan
      </Link>

      <section className="mt-7 overflow-hidden rounded-3xl border border-brand-black/15 bg-canvas-pure">
        <header className="border-b border-line-trace px-6 py-7 sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3 text-brand-emerald">
                <QrCode className="size-4" />
                <p className="text-xs font-bold uppercase">Pembayaran QRIS</p>
              </div>
              <h1 className="mt-4 font-display text-4xl font-medium tracking-[-0.045em] text-brand-black sm:text-5xl">
                {formatOrderCode(order.id)}
              </h1>
              <p className="mt-4 text-sm leading-6 text-muted-moss">
                Scan QRIS dan bayarkan nominal yang tercantum.
              </p>
            </div>
            <PaymentStatusBadge status={payment.status} />
          </div>
        </header>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_390px]">
          <main className="border-b border-line-trace p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <QrisPanel
              imageUrl={qrisImageUrl}
              amount={payment.amountIdr}
              paymentStatus={payment.status}
            />
          </main>

          <aside className="p-6 sm:p-8">
            <PaymentInformation
              order={order}
              countdown={countdown}
              isExpiring={isExpiring}
              onCopyAmount={() => { void copyAmount(); }}
            />

            {actionMessage && (
              <div
                role="status"
                className="mt-5 rounded-xl border border-brand-black/15 bg-canvas-warm px-4 py-3 text-xs leading-5 text-brand-black"
              >
                {actionMessage}
              </div>
            )}

            <PaymentAction
              orderId={order.id}
              paymentStatus={payment.status}
              hasQrisImage={Boolean(qrisImageUrl)}
              onSubmitted={async () => { await loadOrder(); }}
              onMessage={setActionMessage}
            />
          </aside>
        </div>
      </section>
    </div>
  );
}

function PaymentAction({
  orderId,
  paymentStatus,
  hasQrisImage,
  onSubmitted,
  onMessage,
}: {
  orderId: string;
  paymentStatus: CustomerOrderPaymentStatus;
  hasQrisImage: boolean;
  onSubmitted: () => Promise<void> | void;
  onMessage: (message: string | null) => void;
}) {
  if (paymentStatus === "waiting_payment") {
    if (!hasQrisImage) {
      return (
        <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
          <QrCode className="mx-auto size-7 text-amber-700" />
          <p className="mt-3 text-sm font-bold text-amber-900">QRIS Belum Tersedia</p>
          <p className="mt-2 text-xs leading-5 text-amber-800">
            Bukti pembayaran baru dapat dikirim setelah QRIS merchant dikonfigurasi.
          </p>
        </div>
      );
    }
    return (
      <CustomerQrisProofForm
        orderId={orderId}
        onMessage={onMessage}
        onSubmitted={async () => { await onSubmitted(); }}
      />
    );
  }

  if (paymentStatus === "waiting_verification") {
    return (
      <div className="mt-7 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-center">
        <ShieldCheck className="mx-auto size-7 text-blue-700" />
        <p className="mt-3 text-sm font-bold text-blue-900">Menunggu Verifikasi</p>
        <p className="mt-2 text-xs leading-5 text-blue-800">
          Bukti pembayaran telah dikirim dan sedang diperiksa.
        </p>
      </div>
    );
  }

  if (paymentStatus === "paid") {
    return (
      <div className="mt-7 rounded-2xl border border-brand-lime bg-brand-lime/15 p-5 text-center">
        <CheckCircle2 className="mx-auto size-7 text-brand-forest" />
        <p className="mt-3 text-sm font-bold text-brand-forest">Pembayaran Berhasil</p>
      </div>
    );
  }

  if (paymentStatus === "expired") {
    return (
      <div className="mt-7 rounded-2xl border border-neutral-200 bg-neutral-100 p-5 text-center">
        <Clock3 className="mx-auto size-7 text-neutral-600" />
        <p className="mt-3 text-sm font-bold text-neutral-800">Pembayaran Kedaluwarsa</p>
        <p className="mt-2 text-xs leading-5 text-neutral-600">Stok pesanan telah dikembalikan.</p>
      </div>
    );
  }

  return (
    <div className="mt-7 rounded-2xl border border-red-200 bg-red-50 p-5 text-center">
      <XCircle className="size-7 mx-auto text-red-700" />
      <p className="mt-3 text-sm font-bold text-red-900">Pembayaran Tidak Aktif</p>
    </div>
  );
}

function PaymentStatusBadge({ status }: { status: CustomerOrderPaymentStatus }) {
  const meta = getPaymentStatusMeta(status);
  return (
    <span
      className={`inline-flex self-start rounded-full px-3 py-2 text-[9px] font-bold uppercase tracking-wide ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}
