"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  CalendarDays,
  Coins,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";

import { getMyOrders } from "@/services/customer";
import type {
  CustomerOrder,
  CustomerOrderStatus,
} from "@/types/customerOrder";

export default function CustomerOrdersSection() {
  const [orders, setOrders] = useState<
    CustomerOrder[]
  >([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await getMyOrders();

      if (!result.success) {
        setOrders([]);
        setErrorMessage(
          "Pesanan belum dapat dimuat.",
        );

        return;
      }

      setOrders(result.data ?? []);
    } catch {
      setOrders([]);
      setErrorMessage(
        "Terjadi kesalahan saat memuat pesanan.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  if (isLoading) {
    return <OrdersSkeleton />;
  }

  if (errorMessage) {
    return (
      <OrdersError
        message={errorMessage}
        onRetry={loadOrders}
      />
    );
  }

  if (orders.length === 0) {
    return <EmptyOrders />;
  }

  return (
    <section className="mt-10 space-y-5">
      {orders.map((order) => (
        <CustomerOrderCard
          key={order.id}
          order={order}
        />
      ))}
    </section>
  );
}

function CustomerOrderCard({
  order,
}: {
  order: CustomerOrder;
}) {
  const status = getOrderStatusMeta(
    order.status,
  );

  const totalItemQuantity =
    order.items.reduce(
      (total, item) =>
        total + item.quantity,
      0,
    );

  return (
    <article className="overflow-hidden rounded-3xl border border-line-trace bg-canvas-pure">
      <div
        className="
          flex flex-col gap-5
          border-b border-line-trace
          px-6 py-6
          sm:flex-row sm:items-center
          sm:justify-between sm:px-8
        "
      >
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-display text-xl font-medium tracking-tight text-brand-black">
              {formatOrderCode(order.id)}
            </p>

            <OrderStatusBadge
              label={status.label}
              className={status.className}
            />
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-muted-moss">
            <CalendarDays
              className="size-4"
              strokeWidth={1.8}
            />

            <span>
              {formatDate(order.createdAt)}
            </span>
          </div>
        </div>

        <div className="sm:text-right">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-moss">
            Total Pembayaran
          </p>

          <p className="mt-2 font-display text-2xl font-medium tracking-tight text-brand-black">
            {formatCurrency(
              order.totalPriceIdr,
            )}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="border-b border-line-trace p-6 sm:p-8 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-5">
            <div>
              <h2 className="font-display text-xl font-medium text-brand-black">
                Produk Pesanan
              </h2>

              <p className="mt-2 text-xs text-muted-moss">
                {totalItemQuantity} item dari{" "}
                {order.items.length} produk
              </p>
            </div>

            <div
              className="
                flex size-11 items-center
                justify-center rounded-xl
                bg-brand-lime/40
                text-brand-forest
              "
            >
              <Package
                className="size-5"
                strokeWidth={1.8}
              />
            </div>
          </div>

          {order.items.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-canvas-warm px-5 py-8 text-center">
              <p className="text-xs text-muted-moss">
                Detail produk pada pesanan ini
                tidak tersedia.
              </p>
            </div>
          ) : (
            <div className="mt-6 divide-y divide-line-trace">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="
                    flex flex-col gap-4 py-5
                    first:pt-0 last:pb-0
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-brand-black">
                        {item.productName}
                      </p>

                      {item.isBonusClaimed && (
                        <span
                          className="
                            rounded-full
                            bg-brand-lime/50
                            px-2.5 py-1
                            text-[9px] font-bold
                            uppercase
                            text-brand-forest
                          "
                        >
                          Produk Bonus
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-xs text-muted-moss">
                      {item.quantity} ×{" "}
                      {formatCurrency(
                        item.priceIdr,
                      )}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-bold text-brand-black">
                    {formatCurrency(
                      item.priceIdr *
                        item.quantity,
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8">
          <h2 className="font-display text-xl font-medium text-brand-black">
            Informasi Pengiriman
          </h2>

          <div className="mt-6 space-y-5">
            <OrderFact
              icon={ShoppingBag}
              label="Penerima"
              value={order.receiverName}
            />

            <OrderFact
              icon={Phone}
              label="Nomor Telepon"
              value={
                order.phoneNumber ||
                "Belum tersedia"
              }
            />

            <OrderFact
              icon={MapPin}
              label="Alamat"
              value={
                order.shippingAddress
              }
            />
          </div>

          <div className="mt-7 border-t border-line-trace pt-6">
            <OrderAmountRow
              label="Coin Digunakan"
              value={`${formatNumber(
                order.totalCoinsRedeemed,
              )} coin`}
              icon
            />

            <OrderAmountRow
              label="Poin Diperoleh"
              value={`${formatNumber(
                order.pointsEarned,
              )} poin`}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function OrderFact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ShoppingBag;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="
          mt-0.5 flex size-9 shrink-0
          items-center justify-center
          rounded-lg bg-canvas-warm
          text-muted-moss
        "
      >
        <Icon
          className="size-4"
          strokeWidth={1.8}
        />
      </div>

      <div className="min-w-0">
        <p className="text-[9px] font-medium uppercase tracking-wide text-muted-moss">
          {label}
        </p>

        <p className="mt-1 text-xs font-medium leading-5 text-brand-black">
          {value}
        </p>
      </div>
    </div>
  );
}

function OrderAmountRow({
  label,
  value,
  icon = false,
}: {
  label: string;
  value: string;
  icon?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="flex items-center gap-2 text-xs text-muted-moss">
        {icon && (
          <Coins
            className="size-4 text-brand-emerald"
            strokeWidth={1.8}
          />
        )}

        <span>{label}</span>
      </div>

      <span className="text-xs font-bold text-brand-black">
        {value}
      </span>
    </div>
  );
}

function OrderStatusBadge({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <span
      className={`
        inline-flex rounded-full
        px-3 py-2
        text-[9px] font-bold
        uppercase tracking-wide
        ${className}
      `}
    >
      {label}
    </span>
  );
}

function getOrderStatusMeta(
  status: CustomerOrderStatus,
) {
  switch (status) {
    case "complete":
      return {
        label: "Selesai",
        className:
          "bg-brand-lime/50 text-brand-forest",
      };

    case "cancelled":
      return {
        label: "Dibatalkan",
        className:
          "bg-red-50 text-red-700",
      };

    case "rejected":
      return {
        label: "Ditolak",
        className:
          "bg-orange-50 text-orange-700",
      };

    case "pending":
    default:
      return {
        label: "Diproses",
        className:
          "bg-brand-emerald/10 text-brand-emerald",
      };
  }
}

function OrdersSkeleton() {
  return (
    <section className="mt-10 space-y-5">
      {[0, 1].map((item) => (
        <div
          key={item}
          className="
            min-h-[360px] animate-pulse
            rounded-3xl
            border border-line-trace
            bg-canvas-warm
          "
        />
      ))}
    </section>
  );
}

function OrdersError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => Promise<void>;
}) {
  return (
    <section
      className="
        mt-10 flex min-h-72
        flex-col items-center
        justify-center rounded-3xl
        border border-line-trace
        bg-canvas-pure
        px-6 py-12 text-center
      "
    >
      <RefreshCw
        className="size-9 text-muted-moss/50"
        strokeWidth={1.5}
      />

      <h2 className="mt-5 font-display text-2xl font-medium text-brand-black">
        Pesanan gagal dimuat
      </h2>

      <p className="mt-2 text-xs text-muted-moss">
        {message}
      </p>

      <button
        type="button"
        onClick={() => {
          void onRetry();
        }}
        className="
          mt-6 inline-flex
          items-center gap-2
          rounded-md
          bg-brand-forest
          px-5 py-3
          text-xs font-bold
          text-white
          transition
          hover:bg-brand-black
        "
      >
        <RefreshCw className="size-4" />
        Coba Lagi
      </button>
    </section>
  );
}

function EmptyOrders() {
  return (
    <section
      className="
        mt-10 flex min-h-72
        flex-col items-center
        justify-center rounded-3xl
        border border-line-trace
        bg-canvas-pure
        px-6 py-12 text-center
      "
    >
      <div
        className="
          flex size-14 items-center
          justify-center rounded-2xl
          bg-brand-lime/40
          text-brand-forest
        "
      >
        <ShoppingBag
          className="size-6"
          strokeWidth={1.6}
        />
      </div>

      <h2 className="mt-6 font-display text-2xl font-medium text-brand-black">
        Belum ada pesanan
      </h2>

      <p className="mt-2 max-w-md text-xs leading-5 text-muted-moss">
        Pesanan produk yang Anda buat akan
        muncul dan dapat dipantau melalui
        halaman ini.
      </p>
    </section>
  );
}

function formatOrderCode(
  orderId: string,
): string {
  const shortId = orderId
    .replaceAll("-", "")
    .slice(0, 8)
    .toUpperCase();

  return `ORD-${shortId}`;
}

function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "Tanggal tidak tersedia";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Tanggal tidak tersedia";
  }

  return new Intl.DateTimeFormat(
    "id-ID",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

function formatCurrency(
  value: number,
): string {
  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    },
  ).format(value);
}

function formatNumber(
  value: number,
): string {
  return new Intl.NumberFormat(
    "id-ID",
    {
      maximumFractionDigits: 2,
    },
  ).format(value);
}