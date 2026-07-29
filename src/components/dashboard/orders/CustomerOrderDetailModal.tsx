"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Coins,
  MapPin,
  Package,
  Phone,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import CustomerOrderPaymentCard from "@/components/dashboard/CustomerOrderPaymentCard";
import type { CustomerOrder, CustomerOrderStatus } from "@/types/customerOrder";

interface CustomerOrderDetailModalProps {
  order: CustomerOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomerOrderDetailModal({
  order,
  isOpen,
  onClose,
}: CustomerOrderDetailModalProps) {
  if (!isOpen || !order) {
    return null;
  }

  const statusMeta = getOrderStatusMeta(order.status);
  const totalItemQuantity = order.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const paymentTotal =
    order.payment?.method === "coin"
      ? `${formatNumber(order.payment.amountCoin)} coin`
      : formatCurrency(order.payment?.amountIdr ?? order.totalPriceIdr);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in-0">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-line-trace bg-canvas-pure">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line-trace px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-brand-lime/40 text-brand-forest">
              <ShoppingBag className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-bold text-brand-black">
                  {formatOrderCode(order.id)}
                </span>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide ${statusMeta.className}`}
                >
                  {statusMeta.label}
                </span>
              </div>
              <p className="text-xs text-muted-moss">
                Dibuat pada {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="flex size-9 items-center justify-center rounded-full bg-canvas-warm text-brand-black transition hover:bg-line-trace"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-6 overflow-y-auto p-6 sm:p-8">
          {/* Order Items */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-brand-black">
              <Package className="size-4 text-brand-emerald" />
              <span>Rincian Produk ({totalItemQuantity} item)</span>
            </div>

            {order.items.length === 0 ? (
              <div className="mt-3 rounded-xl bg-canvas-warm px-4 py-6 text-center text-xs text-muted-moss">
                Detail produk tidak tersedia.
              </div>
            ) : (
              <div className="mt-3 divide-y divide-line-trace rounded-xl border border-line-trace bg-canvas-warm/30 p-4">
                {order.items.map((item) => {
                  const itemAmount = getOrderItemAmount({ order, item });
                  const itemDescription = getOrderItemDescription({ order, item });

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-brand-black">
                            {item.productName}
                          </p>
                          {item.isBonusClaimed && (
                            <span className="rounded-full bg-brand-lime/50 px-2 py-0.5 text-[8px] font-bold uppercase text-brand-forest">
                              Bonus
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[10px] text-muted-moss">
                          {itemDescription}
                        </p>
                      </div>

                      <p className="shrink-0 text-xs font-bold text-brand-black">
                        {itemAmount}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Shipping Information */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-brand-black">
              <MapPin className="size-4 text-brand-emerald" />
              <span>Informasi Pengiriman</span>
            </div>

            <div className="mt-3 space-y-2.5 rounded-xl border border-line-trace bg-canvas-warm/30 p-4">
              <DetailFact icon={User} label="Penerima" value={order.receiverName} />
              <DetailFact
                icon={Phone}
                label="Nomor Telepon"
                value={order.phoneNumber || "Belum tersedia"}
              />
              <DetailFact
                icon={MapPin}
                label="Alamat Lengkap"
                value={order.shippingAddress}
              />
            </div>
          </div>

          {/* Payment & Points Summary */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-brand-black">
              <Coins className="size-4 text-brand-emerald" />
              <span>Ringkasan Pembayaran & Coin</span>
            </div>

            <div className="mt-3 space-y-2 rounded-xl border border-line-trace bg-canvas-warm/30 p-4">
              <DetailRow
                label="Metode Pembayaran"
                value={order.payment?.method === "coin" ? "Coin" : "QRIS"}
              />
              <DetailRow
                label="Coin Digunakan"
                value={`${formatNumber(order.totalCoinsRedeemed)} coin`}
              />
              <DetailRow
                label="Bonus Coin"
                value={`+${formatNumber(order.pointsEarned)} coin`}
                highlight
              />
              <div className="border-t border-line-trace pt-2">
                <DetailRow
                  label="Total Pembayaran"
                  value={paymentTotal}
                  bold
                />
              </div>
            </div>
          </div>

          {/* Payment Status Card */}
          {order.payment && (
            <div>
              <CustomerOrderPaymentCard payment={order.payment} />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-line-trace bg-canvas-warm px-6 py-4 sm:px-8">
          <p className="text-[10px] text-muted-moss">
            ID: <span className="font-mono text-brand-black">{order.id}</span>
          </p>

          <div className="flex items-center gap-3">
            {order.payment?.status === "waiting_payment" && (
              <Link
                href={`/dashboard/orders/${order.id}/payment`}
                className="inline-flex items-center gap-1.5 rounded-md bg-brand-forest px-4 py-2.5 text-xs font-bold text-white transition hover:bg-brand-black"
              >
                <QrCode className="size-3.5" />
                Bayar QRIS Sekarang
              </Link>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-line-trace bg-canvas-pure px-4 py-2.5 text-xs font-bold text-brand-black transition hover:border-brand-forest"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailFact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-moss" />
      <div className="min-w-0">
        <p className="text-[9px] font-bold uppercase text-muted-moss">{label}</p>
        <p className="text-xs text-brand-black">{value}</p>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  bold = false,
  highlight = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-xs">
      <span className="text-muted-moss">{label}</span>
      <span
        className={
          bold
            ? "font-display text-sm font-bold text-brand-black"
            : highlight
              ? "font-bold text-brand-forest"
              : "font-medium text-brand-black"
        }
      >
        {value}
      </span>
    </div>
  );
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

function formatOrderCode(orderId: string): string {
  const shortId = orderId.replaceAll("-", "").slice(0, 8).toUpperCase();
  return `ORD-${shortId}`;
}

function formatDate(value: string | null): string {
  if (!value) return "Tanggal tidak tersedia";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tanggal tidak tersedia";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(value);
}

function getOrderItemAmount({
  order,
  item,
}: {
  order: CustomerOrder;
  item: CustomerOrder["items"][number];
}): string {
  if (item.isBonusClaimed) return "Bonus";
  if (order.payment?.method === "coin") {
    return `${formatNumber(item.coinsRedeemed)} coin`;
  }
  return formatCurrency(item.priceIdr * item.quantity);
}

function getOrderItemDescription({
  order,
  item,
}: {
  order: CustomerOrder;
  item: CustomerOrder["items"][number];
}): string {
  if (item.isBonusClaimed) return `${item.quantity} produk bonus otomatis`;
  if (order.payment?.method === "coin") {
    return `${item.quantity} produk · pembayaran coin`;
  }
  return `${item.quantity} × ${formatCurrency(item.priceIdr)}`;
}
