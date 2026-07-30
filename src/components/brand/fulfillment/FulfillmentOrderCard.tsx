"use client";

import {
  CalendarDays,
  Coins,
  Leaf,
  MapPin,
  PackageCheck,
  Phone,
  PlayCircle,
  RotateCcw,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { formatCoin, formatIdr } from "@/lib/productDetail";
import type {
  BrandFulfillmentOrder,
  BrandOrderFulfillmentAction,
} from "@/types/brandOrderFulfillment";

export type FulfillmentUiAction =
  | BrandOrderFulfillmentAction
  | "complete_order"
  | "cancel_refund";

interface FulfillmentOrderCardProps {
  order: BrandFulfillmentOrder;
  onAction: (order: BrandFulfillmentOrder, action: FulfillmentUiAction) => void;
}

export function FulfillmentOrderCard({
  order,
  onAction,
}: FulfillmentOrderCardProps) {
  const mainItems = order.items.filter((item) => !item.isBonus);
  const bonusItems = order.items.filter((item) => item.isBonus);
  const primaryAction = getPrimaryAction(order);
  const canCancel =
    order.orderStatus === "pending" || order.orderStatus === "processing";
  const paymentTotal =
    order.paymentMethod === "coin"
      ? formatCoin(order.amountCoin)
      : formatIdr(order.amountIdr);

  return (
    <article className="overflow-hidden rounded-3xl border border-brand-black/15 bg-canvas-pure">
      <header className="border-b border-line-trace px-6 py-6 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-display text-xl font-medium text-brand-black">
                {formatOrderCode(order.orderId)}
              </p>
              <StatusBadge status={order.orderStatus} />
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-moss">
              <CalendarDays className="size-4" />
              {formatDateTime(order.orderCreatedAt ?? "")}
            </div>
          </div>

          <div className="sm:text-right">
            <p className="text-[9px] font-bold uppercase text-muted-moss">
              Total Pembayaran
            </p>
            <p className="mt-2 font-display text-2xl font-medium text-brand-black">
              {paymentTotal}
            </p>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_350px]">
        <main className="border-b border-line-trace p-6 sm:p-8 lg:border-b-0 lg:border-r">
          <h2 className="text-xs font-bold uppercase text-brand-black">
            Produk Pesanan
          </h2>

          <div className="mt-5 divide-y divide-line-trace">
            {mainItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-5 py-4 first:pt-0"
              >
                <div>
                  <p className="text-sm font-medium text-brand-black">
                    {item.productName}
                  </p>
                  <p className="mt-1 text-xs text-muted-moss">
                    {item.quantity} produk
                  </p>
                </div>
                <p className="text-xs font-bold text-brand-black">
                  {order.paymentMethod === "coin"
                    ? formatCoin(item.coinsRedeemed)
                    : formatIdr(item.priceIdr * item.quantity)}
                </p>
              </div>
            ))}

            {bonusItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-5 py-4"
              >
                <div>
                  <p className="text-sm font-medium text-brand-black">
                    {item.productName}
                  </p>
                  <p className="mt-1 text-xs text-muted-moss">
                    {item.quantity} produk bonus
                  </p>
                </div>
                <span className="rounded-full bg-brand-lime/50 px-3 py-1.5 text-[9px] font-bold uppercase text-brand-forest">
                  Bonus
                </span>
              </div>
            ))}
          </div>

          <Timeline order={order} />

          {order.orderStatus === "complete" && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-brand-lime bg-brand-lime/15 p-5">
                <Coins className="size-5 text-brand-forest" />
                <p className="mt-3 text-[9px] font-bold uppercase text-muted-moss">
                  Coin Customer
                </p>
                <p className="mt-2 font-display text-2xl font-medium text-brand-forest">
                  + {formatCoin(order.pointsEarned)}
                </p>
              </div>
              <div className="rounded-2xl bg-canvas-warm p-5">
                <Leaf className="size-5 text-brand-emerald" />
                <p className="mt-3 text-[9px] font-bold uppercase text-muted-moss">
                  Dampak
                </p>
                <p className="mt-2 text-xs font-bold text-brand-black">
                  {formatDecimal(order.impactCarbonSavedKg)} kg karbon
                </p>
                <p className="mt-1 text-[10px] text-muted-moss">
                  {formatDecimal(order.impactWaterSavedLiters)} liter air
                </p>
              </div>
            </div>
          )}

          {(order.orderStatus === "cancelled" ||
            order.orderStatus === "rejected") && (
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5">
              <p className="text-xs font-bold text-red-900">Alasan</p>
              <p className="mt-2 text-xs leading-5 text-red-700">
                {order.cancellationReason ??
                  "Pembayaran ditolak atau pesanan dibatalkan."}
              </p>
            </div>
          )}
        </main>

        <aside className="p-6 sm:p-8">
          <h2 className="text-xs font-bold uppercase text-brand-black">
            Pengiriman
          </h2>
          <div className="mt-6 space-y-5">
            <Fact icon={PackageCheck} label="Penerima" value={order.receiverName} />
            <Fact
              icon={Phone}
              label="Telepon"
              value={order.phoneNumber ?? "Belum tersedia"}
            />
            <Fact icon={MapPin} label="Alamat" value={order.shippingAddress} />
            {order.trackingNumber && (
              <Fact icon={Truck} label="Nomor Resi" value={order.trackingNumber} />
            )}
          </div>

          {order.shippingNote && (
            <div className="mt-6 rounded-xl bg-canvas-warm p-4">
              <p className="text-[9px] font-bold uppercase text-muted-moss">
                Catatan
              </p>
              <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-brand-black">
                {order.shippingNote}
              </p>
            </div>
          )}

          {primaryAction && (
            <button
              type="button"
              onClick={() => onAction(order, primaryAction)}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-md bg-brand-forest px-5 py-3.5 text-xs font-bold text-white transition hover:bg-brand-black"
            >
              <PrimaryActionIcon action={primaryAction} />
              {getActionLabel(primaryAction)}
            </button>
          )}

          {canCancel && (
            <button
              type="button"
              onClick={() => onAction(order, "cancel_refund")}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 px-5 py-3.5 text-xs font-bold text-red-700 transition hover:bg-red-100"
            >
              <RotateCcw className="size-4" />
              Batalkan / Refund
            </button>
          )}
        </aside>
      </div>
    </article>
  );
}

function Timeline({ order }: { order: BrandFulfillmentOrder }) {
  const steps = [
    { label: "Pembayaran", value: order.paidAt },
    { label: "Diproses", value: order.processingAt },
    { label: "Dikirim", value: order.shippedAt },
    { label: "Selesai", value: order.completedAt },
  ];

  return (
    <div className="mt-8 border-t border-line-trace pt-8">
      <p className="text-xs font-bold uppercase text-brand-black">Timeline</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {steps.map((step) => (
          <div key={step.label} className="rounded-xl bg-canvas-warm p-4">
            <p className="text-[9px] font-bold uppercase text-muted-moss">
              {step.label}
            </p>
            <p className="mt-2 text-[10px] font-medium text-brand-black">
              {step.value ? formatDateTime(step.value) : "Belum"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-canvas-warm text-brand-emerald">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-bold uppercase text-muted-moss">{label}</p>
        <p className="mt-1 text-xs font-medium text-brand-black">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    pending: {
      label: "Menunggu Diproses",
      className: "border-amber-200 bg-amber-50 text-amber-800",
    },
    processing: {
      label: "Sedang Diproses",
      className: "border-blue-200 bg-blue-50 text-blue-800",
    },
    shipped: {
      label: "Dalam Pengiriman",
      className: "border-purple-200 bg-purple-50 text-purple-800",
    },
    complete: {
      label: "Selesai",
      className: "border-brand-lime bg-brand-lime/25 text-brand-forest",
    },
    cancelled: {
      label: "Dibatalkan",
      className: "border-red-200 bg-red-50 text-red-800",
    },
    rejected: {
      label: "Ditolak",
      className: "border-red-200 bg-red-50 text-red-800",
    },
  };

  const current = config[status] ?? {
    label: status,
    className: "border-line-trace bg-canvas-warm text-brand-black",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase ${current.className}`}
    >
      {current.label}
    </span>
  );
}

export function getPrimaryAction(
  order: BrandFulfillmentOrder,
): FulfillmentUiAction | null {
  if (order.orderStatus === "pending") return "start_processing";
  if (order.orderStatus === "processing") return "mark_shipped";
  if (order.orderStatus === "shipped") return "complete_order";
  return null;
}

export function getActionLabel(action: FulfillmentUiAction): string {
  switch (action) {
    case "start_processing":
      return "Mulai Diproses";
    case "mark_shipped":
      return "Tandai Dikirim";
    case "complete_order":
      return "Selesaikan Pesanan";
    case "cancel_refund":
      return "Batalkan & Refund";
  }
}

export function PrimaryActionIcon({ action }: { action: FulfillmentUiAction }) {
  switch (action) {
    case "start_processing":
      return <PlayCircle className="size-4" />;
    case "mark_shipped":
      return <Truck className="size-4" />;
    case "complete_order":
      return <PackageCheck className="size-4" />;
    case "cancel_refund":
      return <RotateCcw className="size-4" />;
  }
}

export function formatOrderCode(orderId: string): string {
  return `ORD-${orderId.replaceAll("-", "").slice(0, 8).toUpperCase()}`;
}

export function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tidak tersedia";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatDecimal(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(value);
}
