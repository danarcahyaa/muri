"use client";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Coins,
  MapPin,
  Package,
  Phone,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Truck,
  User,
  X,
  XCircle,
} from "lucide-react";
import { formatCoin, formatIdr } from "@/lib/productDetail";
import type { BrandFulfillmentOrder } from "@/types/brandOrderFulfillment";
import {
  FulfillmentUiAction,
  getActionLabel,
  formatOrderCode,
} from "./FulfillmentOrderCard";

interface BrandOrderDetailModalProps {
  order: BrandFulfillmentOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onAction: (order: BrandFulfillmentOrder, action: FulfillmentUiAction) => void;
}

export function BrandOrderDetailModal({
  order,
  isOpen,
  onClose,
  onAction,
}: BrandOrderDetailModalProps) {
  if (!isOpen || !order) {
    return null;
  }

  const statusMeta = getFulfillmentStatusMeta(order.orderStatus);
  const totalItemQuantity = order.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const paymentTotal =
    order.paymentMethod === "coin"
      ? formatCoin(order.amountCoin)
      : formatIdr(order.amountIdr || order.totalPriceIdr);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in-0"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-line-trace bg-canvas-pure"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line-trace px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-brand-lime/40 text-brand-forest">
              <ShoppingBag className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-bold text-brand-black">
                  {formatOrderCode(order.orderId)}
                </span>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide ${statusMeta.className}`}
                >
                  {statusMeta.label}
                </span>
              </div>
              <p className="text-xs text-muted-moss">
                Pesanan masuk {formatDate(order.orderCreatedAt)}
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
          {/* Customer & Shipping Details */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-brand-black">
              <User className="size-4 text-brand-emerald" />
              <span>Data Penerima & Alamat Pengiriman</span>
            </div>

            <div className="mt-3 space-y-2.5 rounded-xl border border-line-trace bg-canvas-warm/30 p-4">
              <DetailFact icon={User} label="Nama Customer / Penerima" value={order.receiverName} />
              <DetailFact
                icon={Phone}
                label="Nomor Telepon"
                value={order.phoneNumber || "Tidak tersedia"}
              />
              <DetailFact
                icon={MapPin}
                label="Alamat Pengiriman Lengkap"
                value={order.shippingAddress}
              />
              {order.trackingNumber && (
                <DetailFact
                  icon={Truck}
                  label="Nomor Resi / Kurir"
                  value={order.trackingNumber}
                />
              )}
            </div>
          </div>

          {/* Product Items Breakdown */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-brand-black">
              <Package className="size-4 text-brand-emerald" />
              <span>Item Pesanan ({totalItemQuantity} item)</span>
            </div>

            <div className="mt-3 divide-y divide-line-trace rounded-xl border border-line-trace bg-canvas-warm/30 p-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-brand-black">
                        {item.productName}
                      </p>
                      {item.isBonus && (
                        <span className="rounded-full bg-brand-lime/50 px-2 py-0.5 text-[8px] font-bold uppercase text-brand-forest">
                          Bonus
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[10px] text-muted-moss">
                      {item.isBonus
                        ? `${item.quantity} produk bonus`
                        : `${item.quantity} × ${
                            order.paymentMethod === "coin"
                              ? `${formatCoin(item.coinsRedeemed)}`
                              : formatIdr(item.priceIdr)
                          }`}
                    </p>
                  </div>

                  <p className="shrink-0 text-xs font-bold text-brand-black">
                    {item.isBonus
                      ? "Bonus Gratis"
                      : order.paymentMethod === "coin"
                        ? `${formatCoin(item.coinsRedeemed)}`
                        : formatIdr(item.priceIdr * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Status Summary */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-brand-black">
              <Coins className="size-4 text-brand-emerald" />
              <span>Ringkasan Pembayaran Brand</span>
            </div>

            <div className="mt-3 space-y-2 rounded-xl border border-line-trace bg-canvas-warm/30 p-4">
              <DetailRow
                label="Metode Pembayaran"
                value={order.paymentMethod === "coin" ? "Coin" : "QRIS"}
              />
              <DetailRow
                label="Status Pembayaran"
                value={getPaymentStatusLabel(order.paymentStatus)}
                highlight={order.paymentStatus === "paid"}
              />
              {order.pointsEarned > 0 && (
                <DetailRow
                  label="Bonus Coin Customer"
                  value={`+ ${formatCoin(order.pointsEarned)}`}
                  highlight
                />
              )}
              <div className="border-t border-line-trace pt-2">
                <DetailRow
                  label="Total Pembayaran Customer"
                  value={paymentTotal}
                  bold
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-trace bg-canvas-warm px-6 py-4 sm:px-8">
          <p className="text-[10px] text-muted-moss">
            ID: <span className="font-mono text-brand-black">{order.orderId}</span>
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {order.orderStatus === "pending" && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAction(order, "start_processing");
                }}
                className="inline-flex items-center gap-1.5 rounded-sm bg-brand-forest px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-black"
              >
                Mulai Proses Order
              </button>
            )}

            {order.orderStatus === "processing" && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAction(order, "mark_shipped");
                }}
                className="inline-flex items-center gap-1.5 rounded-sm bg-brand-forest px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-black"
              >
                <Truck className="size-3.5" />
                Input Resi & Kirim
              </button>
            )}

            {order.orderStatus === "shipped" && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAction(order, "complete_order");
                }}
                className="inline-flex items-center gap-1.5 rounded-sm bg-brand-forest px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-black"
              >
                <CheckCircle2 className="size-3.5" />
                Selesaikan Pesanan
              </button>
            )}

            {(order.orderStatus === "pending" || order.orderStatus === "processing") && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAction(order, "cancel_refund");
                }}
                className="inline-flex items-center gap-1.5 rounded-sm border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100"
              >
                <XCircle className="size-3.5" />
                Batalkan / Refund
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-sm border border-line-trace bg-canvas-pure px-4 py-2 text-xs font-bold text-brand-black transition hover:border-brand-forest"
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

function getFulfillmentStatusMeta(status: string) {
  switch (status) {
    case "complete":
      return {
        label: "Selesai",
        className: "bg-brand-lime/50 text-brand-forest",
      };
    case "shipped":
      return {
        label: "Dikirim",
        className: "bg-blue-50 text-blue-700 border border-blue-200",
      };
    case "processing":
      return {
        label: "Diproses",
        className: "bg-amber-50 text-amber-800 border border-amber-200",
      };
    case "cancelled":
    case "rejected":
      return {
        label: "Dibatalkan",
        className: "bg-red-50 text-red-700",
      };
    case "pending":
    default:
      return {
        label: "Menunggu",
        className: "bg-brand-emerald/10 text-brand-emerald",
      };
  }
}

function getPaymentStatusLabel(status: string): string {
  switch (status) {
    case "paid":
      return "Sudah Dibayar";
    case "waiting_verification":
      return "Menunggu Verifikasi";
    case "waiting_payment":
      return "Menunggu Pembayaran";
    case "refunded":
      return "Direfund";
    case "failed":
    case "expired":
      return "Gagal / Kadaluarsa";
    default:
      return status;
  }
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
