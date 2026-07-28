"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Coins,
  Gift,
  LoaderCircle,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  ShoppingBag,
  UserRound,
  QrCode,
} from "lucide-react";

import CustomerOrderPaymentCard from "@/components/dashboard/CustomerOrderPaymentCard";
import { formatCoin, formatIdr } from "@/lib/product-detail";
import { getMyOrderById } from "@/services/customer";
import type { CustomerOrder, CustomerOrderStatus } from "@/types/customerOrder";

interface CustomerOrderDetailProps {
  orderId: string;
}

export default function CustomerOrderDetail({
  orderId,
}: CustomerOrderDetailProps) {
  const [order, setOrder] = useState<CustomerOrder | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await getMyOrderById(orderId);

      if (!result.success || !result.data) {
        setOrder(null);

        setErrorMessage(getOrderErrorMessage(result.error));

        return;
      }

      setOrder(result.data);
    } catch (error) {
      console.error("[CustomerOrderDetail] Failed to load order:", error);

      setOrder(null);

      setErrorMessage("Detail pesanan belum dapat dimuat.");
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  if (isLoading) {
    return <OrderDetailLoading />;
  }

  if (errorMessage || !order) {
    return (
      <OrderDetailError
        message={errorMessage ?? "Pesanan tidak ditemukan."}
        onRetry={loadOrder}
      />
    );
  }

  return <OrderDetailContent order={order} />;
}

function OrderDetailContent({ order }: { order: CustomerOrder }) {
  const status = getOrderStatusMeta(order.status);

  const paymentTotal =
    order.payment?.method === "coin"
      ? formatCoin(order.payment.amountCoin)
      : formatIdr(order.payment?.amountIdr ?? order.totalPriceIdr);

  const mainItems = order.items.filter((item) => !item.isBonusClaimed);

  const bonusItems = order.items.filter((item) => item.isBonusClaimed);

  const totalQuantity = order.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <div>
      <Link
        href="/dashboard/orders"
        className="inline-flex items-center gap-2 text-xs font-bold text-muted-moss transition hover:text-brand-forest"
      >
        <ArrowLeft className="size-4" />
        Kembali ke Pesanan
      </Link>

      <section className="mt-7 overflow-hidden rounded-3xl border border-line-trace bg-canvas-pure">
        <header className="border-b border-line-trace px-6 py-7 sm:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-brand-emerald">
                  Detail Pesanan
                </p>

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

              <h1 className="mt-4 font-display text-4xl font-medium tracking-[-0.045em] text-brand-black sm:text-5xl">
                {formatOrderCode(order.id)}
              </h1>

              <div className="mt-4 flex items-center gap-2 text-xs text-muted-moss">
                <CalendarDays className="size-4" strokeWidth={1.8} />

                <span>Dibuat {formatDateTime(order.createdAt)}</span>
              </div>
            </div>

            <div className="rounded-2xl bg-brand-lime p-5 text-brand-forest sm:min-w-64">
              <p className="text-[9px] font-bold uppercase tracking-wide opacity-65">
                Total Pembayaran
              </p>

              <p className="mt-4 font-display text-3xl font-medium tracking-[-0.045em]">
                {paymentTotal}
              </p>

              <p className="mt-2 text-[10px] opacity-70">
                {totalQuantity} item dalam pesanan
              </p>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_360px]">
          <main className="border-b border-line-trace p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <OrderItemsSection
              title="Produk Dibeli"
              description="Produk utama dalam transaksi ini."
              items={mainItems}
              order={order}
            />

            {bonusItems.length > 0 && (
              <div className="mt-9 border-t border-line-trace pt-9">
                <OrderItemsSection
                  title="Produk Bonus"
                  description="Produk bonus otomatis dari pembelian."
                  items={bonusItems}
                  order={order}
                  bonus
                />
              </div>
            )}

            <RewardSection order={order} />
          </main>

          <aside className="p-6 sm:p-8">
            <ShippingSection order={order} />

            <div className="mt-8 border-t border-line-trace pt-8">
              <OrderFinancialSummary order={order} />
            </div>

            <CustomerOrderPaymentCard payment={order.payment} />
            {order.payment?.method === "qris" &&
              order.payment.status === "waiting_payment" && (
                <Link
                  href={`/dashboard/orders/${order.id}/payment`}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-brand-forest px-5 py-3.5 text-xs font-bold text-white transition hover:bg-brand-black"
                >
                  Lanjutkan Pembayaran
                  <QrCode className="size-4" />
                </Link>
              )}
          </aside>
        </div>
      </section>
    </div>
  );
}

function OrderItemsSection({
  title,
  description,
  items,
  order,
  bonus = false,
}: {
  title: string;
  description: string;
  items: CustomerOrder["items"];
  order: CustomerOrder;
  bonus?: boolean;
}) {
  return (
    <section>
      <div className="flex items-start justify-between gap-5">
        <div>
          <h2 className="font-display text-2xl font-medium text-brand-black">
            {title}
          </h2>

          <p className="mt-2 text-xs leading-5 text-muted-moss">
            {description}
          </p>
        </div>

        <div
          className={`
            flex size-11 shrink-0
            items-center justify-center
            rounded-xl
            ${
              bonus
                ? "bg-brand-lime/40 text-brand-forest"
                : "bg-canvas-warm text-brand-emerald"
            }
          `}
        >
          {bonus ? (
            <Gift className="size-5" strokeWidth={1.8} />
          ) : (
            <Package className="size-5" strokeWidth={1.8} />
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-canvas-warm px-5 py-8 text-center">
          <p className="text-xs text-muted-moss">
            Tidak ada produk pada bagian ini.
          </p>
        </div>
      ) : (
        <div className="mt-6 divide-y divide-line-trace rounded-2xl border border-line-trace px-5">
          {items.map((item) => {
            const itemAmount = getOrderItemAmount({
              order,
              item,
            });

            return (
              <div
                key={item.id}
                className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-brand-black">
                      {item.productName}
                    </p>

                    {item.isBonusClaimed && (
                      <span className="rounded-full bg-brand-lime/50 px-2.5 py-1 text-[9px] font-bold uppercase text-brand-forest">
                        Bonus
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-muted-moss">
                    {getOrderItemDescription({
                      order,
                      item,
                    })}
                  </p>
                </div>

                <p className="shrink-0 text-sm font-bold text-brand-black">
                  {itemAmount}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function ShippingSection({ order }: { order: CustomerOrder }) {
  return (
    <section>
      <div className="flex items-center gap-3">
        <ShoppingBag className="size-4 text-brand-emerald" strokeWidth={1.8} />

        <h2 className="text-xs font-bold uppercase text-brand-black">
          Informasi Pengiriman
        </h2>
      </div>

      <div className="mt-6 space-y-5">
        <OrderFact
          icon={UserRound}
          label="Nama Penerima"
          value={order.receiverName}
        />

        <OrderFact
          icon={Phone}
          label="Nomor Telepon"
          value={order.phoneNumber || "Belum tersedia"}
        />

        <OrderFact
          icon={MapPin}
          label="Alamat Pengiriman"
          value={order.shippingAddress}
        />
      </div>
    </section>
  );
}

function OrderFinancialSummary({ order }: { order: CustomerOrder }) {
  return (
    <section>
      <h2 className="text-xs font-bold uppercase text-brand-black">
        Ringkasan Transaksi
      </h2>

      <div className="mt-5">
        <SummaryRow
          label="Metode"
          value={
            order.payment?.method === "coin"
              ? "Coin"
              : order.payment?.method === "qris"
                ? "QRIS"
                : "Tidak tersedia"
          }
        />

        <SummaryRow label="Total IDR" value={formatIdr(order.totalPriceIdr)} />

        <SummaryRow
          label="Coin Digunakan"
          value={formatCoin(order.totalCoinsRedeemed)}
        />

        <SummaryRow
          label="Bonus Coin"
          value={`+ ${formatCoin(order.pointsEarned)}`}
          strong={order.pointsEarned > 0}
        />
      </div>
    </section>
  );
}

function RewardSection({ order }: { order: CustomerOrder }) {
  if (order.pointsEarned <= 0) {
    return null;
  }

  const isCompleted = order.status === "complete";

  const isCancelled =
    order.status === "cancelled" || order.status === "rejected";

  return (
    <section className="mt-9 border-t border-line-trace pt-9">
      <div className="rounded-2xl border border-brand-lime bg-brand-lime/15 p-5">
        <div className="flex gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-lime/50 text-brand-forest">
            {isCompleted ? (
              <CheckCircle2 className="size-5" strokeWidth={1.8} />
            ) : (
              <Coins className="size-5" strokeWidth={1.8} />
            )}
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-brand-emerald">
              Bonus Coin
            </p>

            <p className="mt-2 font-display text-3xl font-medium tracking-[-0.04em] text-brand-forest">
              + {formatCoin(order.pointsEarned)}
            </p>

            <p className="mt-3 text-[10px] leading-5 text-muted-moss">
              {isCompleted
                ? "Pesanan telah selesai. Bonus coin diproses melalui penyelesaian order."
                : isCancelled
                  ? "Bonus coin tidak diberikan karena pesanan dibatalkan."
                  : "Bonus coin akan diberikan setelah pesanan berstatus selesai."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function OrderFact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-canvas-warm text-muted-moss">
        <Icon className="size-4" strokeWidth={1.8} />
      </div>

      <div className="min-w-0">
        <p className="text-[9px] font-medium uppercase tracking-wide text-muted-moss">
          {label}
        </p>

        <p className="mt-1 break-words text-xs font-medium leading-5 text-brand-black">
          {value}
        </p>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line-trace py-3 last:border-b-0">
      <span className="text-xs text-muted-moss">{label}</span>

      <span
        className={
          strong
            ? "text-xs font-bold text-brand-forest"
            : "text-xs font-bold text-brand-black"
        }
      >
        {value}
      </span>
    </div>
  );
}

function OrderDetailLoading() {
  return (
    <div className="flex min-h-[520px] items-center justify-center rounded-3xl border border-line-trace bg-canvas-pure">
      <div className="text-center">
        <LoaderCircle className="mx-auto size-8 animate-spin text-brand-emerald" />

        <p className="mt-4 text-xs text-muted-moss">Memuat detail pesanan...</p>
      </div>
    </div>
  );
}

function OrderDetailError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => Promise<void>;
}) {
  return (
    <section className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-line-trace bg-canvas-pure px-6 py-12 text-center">
      <RefreshCw className="size-9 text-muted-moss/50" strokeWidth={1.5} />

      <h1 className="mt-5 font-display text-3xl font-medium text-brand-black">
        Pesanan tidak tersedia
      </h1>

      <p className="mt-3 max-w-md text-xs leading-5 text-muted-moss">
        {message}
      </p>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-2 rounded-md border border-line-trace px-5 py-3 text-xs font-bold text-brand-black transition hover:border-brand-forest"
        >
          <ArrowLeft className="size-4" />
          Kembali
        </Link>

        <button
          type="button"
          onClick={() => {
            void onRetry();
          }}
          className="inline-flex items-center gap-2 rounded-md bg-brand-forest px-5 py-3 text-xs font-bold text-white transition hover:bg-brand-black"
        >
          <RefreshCw className="size-4" />
          Coba Lagi
        </button>
      </div>
    </section>
  );
}

function getOrderItemAmount({
  order,
  item,
}: {
  order: CustomerOrder;
  item: CustomerOrder["items"][number];
}): string {
  if (item.isBonusClaimed) {
    return "Bonus";
  }

  if (order.payment?.method === "coin") {
    return formatCoin(item.coinsRedeemed);
  }

  return formatIdr(item.priceIdr * item.quantity);
}

function getOrderItemDescription({
  order,
  item,
}: {
  order: CustomerOrder;
  item: CustomerOrder["items"][number];
}): string {
  if (item.isBonusClaimed) {
    return `${item.quantity} produk bonus otomatis`;
  }

  if (order.payment?.method === "coin") {
    return `${item.quantity} produk · pembayaran coin`;
  }

  return `${item.quantity} × ${formatIdr(item.priceIdr)}`;
}

function getOrderStatusMeta(status: CustomerOrderStatus) {
  switch (status) {
    case "complete":
      return {
        label: "Selesai",
        className: "bg-brand-lime/50 text-brand-forest",
      };

    case "cancelled":
      return {
        label: "Dibatalkan",
        className: "bg-red-50 text-red-700",
      };

    case "rejected":
      return {
        label: "Ditolak",
        className: "bg-orange-50 text-orange-700",
      };

    case "pending":
    default:
      return {
        label: "Diproses",
        className: "bg-brand-emerald/10 text-brand-emerald",
      };
  }
}

function getOrderErrorMessage(error: unknown): string {
  const text = String(error ?? "").toUpperCase();

  if (text.includes("UNAUTHENTICATED")) {
    return "Sesi Anda telah berakhir. Silakan masuk kembali.";
  }

  if (text.includes("INVALID_ORDER_ID")) {
    return "ID pesanan tidak valid.";
  }

  if (text.includes("ORDER_NOT_FOUND")) {
    return "Pesanan tidak ditemukan atau bukan milik akun Anda.";
  }

  return "Detail pesanan belum dapat dimuat.";
}

function formatOrderCode(orderId: string): string {
  const shortId = orderId.replaceAll("-", "").slice(0, 8).toUpperCase();

  return `ORD-${shortId}`;
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "Tanggal tidak tersedia";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Tanggal tidak tersedia";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}
