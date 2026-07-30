"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Coins,
  LoaderCircle,
  MapPin,
  Package,
  Phone,
  QrCode,
  ShoppingBag,
  Truck,
  User,
  X,
} from "lucide-react";
import CustomerOrderPaymentCard from "@/components/dashboard/CustomerOrderPaymentCard";
import {
  confirmCustomerOrderDelivery,
  getCustomerOrderLifecycle,
} from "@/services/customer";
import type { CustomerOrder, CustomerOrderStatus } from "@/types/customerOrder";
import type { CustomerOrderLifecycle } from "@/types/customerOrderLifecycle";

interface CustomerOrderDetailModalProps {
  order: CustomerOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated?: () => void;
}

export default function CustomerOrderDetailModal({
  order,
  isOpen,
  onClose,
  onOrderUpdated,
}: CustomerOrderDetailModalProps) {
  const [lifecycle, setLifecycle] = useState<CustomerOrderLifecycle | null>(null);
  const [isConfirmingDelivery, setIsConfirmingDelivery] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadLifecycle = useCallback(async () => {
    if (!order) return;
    try {
      const res = await getCustomerOrderLifecycle(order.id);
      if (res.success && res.data) {
        setLifecycle(res.data);
      }
    } catch {
      // Non-critical, fallback to order prop data
    }
  }, [order]);

  useEffect(() => {
    if (isOpen && order) {
      void loadLifecycle();
      setSuccessMessage(null);
      setErrorMessage(null);
    }
  }, [isOpen, order, loadLifecycle]);

  if (!isOpen || !order) {
    return null;
  }

  const currentStatus = lifecycle?.orderStatus ?? order.status;
  const statusMeta = getOrderStatusMeta(currentStatus as CustomerOrderStatus);
  const totalItemQuantity = order.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const paymentTotal =
    order.payment?.method === "coin"
      ? `${formatNumber(order.payment.amountCoin)} coin`
      : formatCurrency(order.payment?.amountIdr ?? order.totalPriceIdr);

  const isShipped = currentStatus === "shipped";

  async function handleConfirmDelivery() {
    if (!order || isConfirmingDelivery) return;

    setIsConfirmingDelivery(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await confirmCustomerOrderDelivery(order.id);

      if (!res.success) {
        setErrorMessage(res.error ?? "Gagal mengonfirmasi penerimaan pesanan.");
        return;
      }

      setSuccessMessage("Pesanan berhasil dikonfirmasi selesai! Bonus coin telah dikreditkan.");
      if (onOrderUpdated) {
        onOrderUpdated();
      }

      setTimeout(() => {
        void loadLifecycle();
      }, 1000);
    } catch {
      setErrorMessage("Terjadi kesalahan saat mengonfirmasi penerimaan pesanan.");
    } finally {
      setIsConfirmingDelivery(false);
    }
  }

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
          {/* Feedback Banners */}
          {successMessage && (
            <div className="flex items-center gap-2 rounded-xl border border-brand-lime bg-brand-lime/20 px-4 py-3 text-xs font-medium text-brand-forest">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              {errorMessage}
            </div>
          )}

          {/* Shipped Status Action Alert */}
          {isShipped && !successMessage && (
            <div className="flex flex-col gap-3 rounded-xl border border-brand-emerald/30 bg-brand-emerald/10 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5 text-brand-forest">
                <Truck className="size-5 shrink-0 text-brand-emerald" />
                <div>
                  <p className="text-xs font-bold">Pesanan Dalam Pengiriman</p>
                  <p className="text-[11px] text-muted-moss">
                    Apakah paket produk sudah Anda terima dengan baik?
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isConfirmingDelivery}
                onClick={() => void handleConfirmDelivery()}
                className="inline-flex items-center justify-center gap-1.5 rounded-sm bg-brand-forest px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-black disabled:opacity-50"
              >
                {isConfirmingDelivery ? (
                  <>
                    <LoaderCircle className="size-3.5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-3.5" />
                    Konfirmasi Diterima
                  </>
                )}
              </button>
            </div>
          )}

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

          {/* Shipping & Tracking Information */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-brand-black">
              <MapPin className="size-4 text-brand-emerald" />
              <span>Informasi Pengiriman & Resi</span>
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
              {lifecycle?.trackingNumber && (
                <DetailFact
                  icon={Truck}
                  label="Nomor Resi / Kurir"
                  value={lifecycle.trackingNumber}
                />
              )}
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
                className="inline-flex items-center gap-1.5 rounded-sm bg-brand-forest px-4 py-2.5 text-xs font-bold text-white transition hover:bg-brand-black"
              >
                <QrCode className="size-3.5" />
                Bayar QRIS Sekarang
              </Link>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-sm border border-line-trace bg-canvas-pure px-4 py-2.5 text-xs font-bold text-brand-black transition hover:border-brand-forest"
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
    case "shipped":
      return {
        label: "Dikirim",
        className: "bg-blue-50 text-blue-700 border border-blue-200",
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
