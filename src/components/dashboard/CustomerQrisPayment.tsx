/* eslint-disable @next/next/no-img-element */

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Copy,
  LoaderCircle,
  QrCode,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { formatIdr } from "@/lib/product-detail";
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
    if (expiryRequestRef.current) {
      return;
    }

    expiryRequestRef.current = true;

    setIsExpiring(true);
    setActionMessage(null);

    try {
      const result = await expireCustomerQrisOrder(orderId);

      if (!result.success) {
        const errorText = String(result.error ?? "").toUpperCase();

        /*
         * Jam device customer mungkin sedikit
         * lebih cepat daripada waktu database.
         * Dalam kasus itu, coba lagi beberapa
         * detik kemudian.
         */
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

    if (amount === undefined) {
      return;
    }

    try {
      await navigator.clipboard.writeText(String(amount));

      setActionMessage("Nominal pembayaran berhasil disalin.");
    } catch {
      setActionMessage("Nominal belum dapat disalin.");
    }
  }

  if (isLoading) {
    return <PaymentLoading />;
  }

  if (errorMessage || !order || !order.payment) {
    return (
      <PaymentError
        message={errorMessage ?? "Pembayaran tidak ditemukan."}
        onRetry={loadOrder}
      />
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

      <section className="mt-7 overflow-hidden rounded-3xl border border-line-trace bg-canvas-pure">
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
              onCopyAmount={() => {
                void copyAmount();
              }}
            />

            {actionMessage && (
              <div
                role="status"
                className="mt-5 rounded-xl border border-line-trace bg-canvas-warm px-4 py-3 text-xs leading-5 text-brand-black"
              >
                {actionMessage}
              </div>
            )}

            <PaymentAction
              orderId={order.id}
              paymentStatus={payment.status}
              hasQrisImage={Boolean(qrisImageUrl)}
              onSubmitted={async () => {
                await loadOrder();
              }}
              onMessage={setActionMessage}
            />
          </aside>
        </div>
      </section>
    </div>
  );
}

function QrisPanel({
  imageUrl,
  amount,
  paymentStatus,
}: {
  imageUrl: string;
  amount: number;
  paymentStatus: CustomerOrderPaymentStatus;
}) {
  const canShowQris = paymentStatus === "waiting_payment" && Boolean(imageUrl);

  return (
    <section>
      <h2 className="font-display text-2xl font-medium text-brand-black">
        Scan QRIS
      </h2>

      <p className="mt-2 text-xs leading-5 text-muted-moss">
        Gunakan aplikasi bank atau dompet digital yang mendukung QRIS.
      </p>

      {canShowQris ? (
        <div className="mt-7 mx-auto max-w-md rounded-3xl border border-line-trace bg-white p-5">
          <img
            src={imageUrl}
            alt="Kode pembayaran QRIS"
            className="mx-auto aspect-square w-full object-contain"
          />

          <div className="mt-5 rounded-2xl bg-canvas-warm p-5 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-moss">
              Masukkan Nominal
            </p>

            <p className="mt-3 font-display text-3xl font-medium tracking-[-0.04em] text-brand-black">
              {formatIdr(amount)}
            </p>
          </div>
        </div>
      ) : paymentStatus === "waiting_payment" ? (
        <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <QrCode className="mx-auto size-10 text-amber-700" />

          <p className="mt-4 text-sm font-bold text-amber-900">
            QRIS belum dikonfigurasi
          </p>

          <p className="mt-2 text-xs leading-5 text-amber-800">
            Tambahkan NEXT_PUBLIC_QRIS_IMAGE_URL pada .env.local.
          </p>
        </div>
      ) : (
        <PaymentStatePanel status={paymentStatus} />
      )}
    </section>
  );
}

function PaymentInformation({
  order,
  countdown,
  isExpiring,
  onCopyAmount,
}: {
  order: CustomerOrder;
  countdown: PaymentCountdown;
  isExpiring: boolean;
  onCopyAmount: () => void;
}) {
  const payment = order.payment;

  if (!payment) {
    return null;
  }

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

function PaymentAction({
  orderId,
  paymentStatus,
  hasQrisImage,
  onSubmitted,
  onMessage,
}: {
  orderId: string;

  paymentStatus:
    CustomerOrderPaymentStatus;

  hasQrisImage: boolean;

  onSubmitted: () =>
    Promise<void> | void;

  onMessage: (
    message: string | null,
  ) => void;
}) {
  if (
    paymentStatus ===
    "waiting_payment"
  ) {
    if (!hasQrisImage) {
      return (
        <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
          <QrCode className="mx-auto size-7 text-amber-700" />

          <p className="mt-3 text-sm font-bold text-amber-900">
            QRIS Belum Tersedia
          </p>

          <p className="mt-2 text-xs leading-5 text-amber-800">
            Bukti pembayaran baru
            dapat dikirim setelah QRIS
            merchant dikonfigurasi.
          </p>
        </div>
      );
    }

    return (
      <CustomerQrisProofForm
        orderId={orderId}
        onMessage={onMessage}
        onSubmitted={async () => {
          await onSubmitted();
        }}
      />
    );
  }

  if (
    paymentStatus ===
    "waiting_verification"
  ) {
    return (
      <div className="mt-7 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-center">
        <ShieldCheck className="mx-auto size-7 text-blue-700" />

        <p className="mt-3 text-sm font-bold text-blue-900">
          Menunggu Verifikasi
        </p>

        <p className="mt-2 text-xs leading-5 text-blue-800">
          Bukti pembayaran telah
          dikirim dan sedang diperiksa.
        </p>
      </div>
    );
  }

  if (
    paymentStatus === "paid"
  ) {
    return (
      <div className="mt-7 rounded-2xl border border-brand-lime bg-brand-lime/15 p-5 text-center">
        <CheckCircle2 className="mx-auto size-7 text-brand-forest" />

        <p className="mt-3 text-sm font-bold text-brand-forest">
          Pembayaran Berhasil
        </p>
      </div>
    );
  }

  if (
    paymentStatus === "expired"
  ) {
    return (
      <div className="mt-7 rounded-2xl border border-neutral-200 bg-neutral-100 p-5 text-center">
        <Clock3 className="mx-auto size-7 text-neutral-600" />

        <p className="mt-3 text-sm font-bold text-neutral-800">
          Pembayaran Kedaluwarsa
        </p>

        <p className="mt-2 text-xs leading-5 text-neutral-600">
          Stok pesanan telah
          dikembalikan.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-7 rounded-2xl border border-red-200 bg-red-50 p-5 text-center">
      <XCircle className="mx-auto size-7 text-red-700" />

      <p className="mt-3 text-sm font-bold text-red-900">
        Pembayaran Tidak Aktif
      </p>
    </div>
  );
}
function PaymentStatePanel({ status }: { status: CustomerOrderPaymentStatus }) {
  return (
    <div className="mt-7 rounded-2xl bg-canvas-warm p-8 text-center">
      {status === "waiting_verification" ? (
        <ShieldCheck className="mx-auto size-10 text-blue-700" />
      ) : status === "paid" ? (
        <CheckCircle2 className="mx-auto size-10 text-brand-forest" />
      ) : (
        <Clock3 className="mx-auto size-10 text-muted-moss" />
      )}

      <p className="mt-4 text-sm font-bold text-brand-black">
        {getPaymentStatusLabel(status)}
      </p>
    </div>
  );
}

function PaymentStatusBadge({
  status,
}: {
  status: CustomerOrderPaymentStatus;
}) {
  const meta = getPaymentStatusMeta(status);

  return (
    <span
      className={`
        inline-flex self-start
        rounded-full px-3 py-2
        text-[9px] font-bold
        uppercase tracking-wide
        ${meta.className}
      `}
    >
      {meta.label}
    </span>
  );
}

function InformationRow({
  label,
  value,
  action = null,
}: {
  label: string;
  value: string;
  action?: React.ReactNode;
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

function PaymentLoading() {
  return (
    <div className="flex min-h-[520px] items-center justify-center rounded-3xl border border-line-trace bg-canvas-pure">
      <div className="text-center">
        <LoaderCircle className="mx-auto size-8 animate-spin text-brand-emerald" />

        <p className="mt-4 text-xs text-muted-moss">
          Menyiapkan pembayaran QRIS...
        </p>
      </div>
    </div>
  );
}

function PaymentError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => Promise<void>;
}) {
  return (
    <section className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-line-trace bg-canvas-pure px-6 py-12 text-center">
      <RefreshCw className="size-9 text-muted-moss/50" />

      <h1 className="mt-5 font-display text-3xl font-medium text-brand-black">
        Pembayaran Tidak Tersedia
      </h1>

      <p className="mt-3 text-xs text-muted-moss">{message}</p>

      <button
        type="button"
        onClick={() => {
          void onRetry();
        }}
        className="mt-6 inline-flex items-center gap-2 rounded-md bg-brand-forest px-5 py-3 text-xs font-bold text-white"
      >
        <RefreshCw className="size-4" />
        Coba Lagi
      </button>
    </section>
  );
}

interface PaymentCountdown {
  label: string;
  isExpired: boolean;
  isUrgent: boolean;
}

function getPaymentCountdown(
  expiresAt: string | null,
  currentTime: number,
): PaymentCountdown {
  if (!expiresAt) {
    return {
      label: "--:--",
      isExpired: false,
      isUrgent: false,
    };
  }

  const expiryTime = new Date(expiresAt).getTime();

  if (Number.isNaN(expiryTime)) {
    return {
      label: "--:--",
      isExpired: false,
      isUrgent: false,
    };
  }

  const difference = expiryTime - currentTime;

  if (difference <= 0) {
    return {
      label: "00:00",
      isExpired: true,
      isUrgent: true,
    };
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

function getPaymentStatusMeta(status: CustomerOrderPaymentStatus) {
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

function getPaymentStatusLabel(status: CustomerOrderPaymentStatus): string {
  return getPaymentStatusMeta(status).label;
}

function formatOrderCode(orderId: string): string {
  const shortId = orderId.replaceAll("-", "").slice(0, 8).toUpperCase();

  return `ORD-${shortId}`;
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
