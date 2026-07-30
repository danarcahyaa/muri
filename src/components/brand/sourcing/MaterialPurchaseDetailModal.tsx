"use client";

import {
  CreditCard,
  ExternalLink,
  Factory,
  MapPin,
  Package,
  Truck,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { OrderProgressBar } from "@/components/ui/OrderProgressBar";
import { formatIdr } from "@/lib/productDetail";
import type { MaterialOrder, MaterialOrderStatus } from "@/types/materialOrder";

interface MaterialPurchaseDetailModalProps {
  order: MaterialOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function MaterialPurchaseDetailModal({
  order,
  isOpen,
  onClose,
}: MaterialPurchaseDetailModalProps) {
  if (!isOpen || !order) return null;

  const statusMeta = getMaterialStatusMeta(order.status);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in-0 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-line-trace bg-canvas-pure cursor-default"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-line-trace px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-brand-lime/40 text-brand-forest">
              <CreditCard className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-bold text-brand-black">
                  {order.orderCode}
                </span>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide ${statusMeta.className}`}
                >
                  {statusMeta.label}
                </span>
              </div>
              <p className="text-xs text-muted-moss">
                Pembelian dibuat pada {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="flex size-8 items-center justify-center rounded-full bg-canvas-warm text-brand-black transition hover:bg-line-trace cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="space-y-6 overflow-y-auto p-6 sm:p-8">
          {/* Order Progress Step Bar */}
          <OrderProgressBar status={order.status} />

          {/* Material Batch Info */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-brand-black">
              <Package className="size-4 text-brand-emerald" />
              <span>Detail Batch Material Limbah</span>
            </div>

            <div className="mt-3 space-y-3 rounded-lg border border-line-trace bg-canvas-warm/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-brand-black">{order.batchTitle}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-moss">
                    <Factory className="size-3 shrink-0" />
                    Provider: {order.providerName}
                  </p>
                </div>
                <span className="rounded-full bg-brand-lime/40 px-3 py-1 text-[10px] font-bold text-brand-forest">
                  {order.weightKg} kg
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address & Resi */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-brand-black">
              <MapPin className="size-4 text-brand-emerald" />
              <span>Informasi Pengiriman & Kurir</span>
            </div>

            <div className="mt-3 space-y-2.5 rounded-lg border border-line-trace bg-canvas-warm/50 p-4">
              <DetailFact icon={User} label="Penerima Material" value="Tim Sourcing Fashion" />
              <DetailFact icon={MapPin} label="Alamat Gudang Brand" value="Workshop / Studio MURI Brand" />
              {order.trackingNumber && (
                <DetailFact icon={Truck} label="Nomor Resi / Kurir Logistik" value={order.trackingNumber} />
              )}
            </div>
          </div>

          {/* Payment & Pricing Breakdown */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-brand-black">
              <CreditCard className="size-4 text-brand-emerald" />
              <span>Rincian Pembayaran Material</span>
            </div>

            <div className="mt-3 space-y-2 rounded-lg border border-line-trace bg-canvas-warm/50 p-4">
              <DetailRow label="Harga per Kg" value={`${formatIdr(order.pricePerKg)} / kg`} />
              <DetailRow label="Total Berat Material" value={`${order.weightKg} kg`} />
              {order.paymentProofUrl && (
                <div className="flex items-center justify-between py-1 text-xs">
                  <span className="text-muted-moss">Bukti Transfer QRIS</span>
                  <a
                    href={order.paymentProofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-brand-forest hover:underline"
                  >
                    Lihat Bukti Foto
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              )}
              <div className="border-t border-line-trace pt-2">
                <DetailRow label="Total Pembayaran" value={formatIdr(order.totalPriceIdr)} bold />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between border-t border-line-trace bg-canvas-warm/55 px-6 py-4 sm:px-8">
          <p className="text-[10px] text-muted-moss">
            ID: <span className="font-mono text-brand-black">{order.id}</span>
          </p>

          <Button variant="outline" size="md" onClick={onClose}>
            Tutup
          </Button>
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
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-xs">
      <span className="text-muted-moss">{label}</span>
      <span className={bold ? "font-display text-sm font-bold text-brand-black" : "font-medium text-brand-black"}>
        {value}
      </span>
    </div>
  );
}

function getMaterialStatusMeta(status: MaterialOrderStatus) {
  switch (status) {
    case "completed":
      return { label: "Selesai", className: "bg-brand-lime/50 text-brand-forest" };
    case "shipped":
      return { label: "Dikirim", className: "bg-blue-50 text-blue-700 border border-blue-200" };
    case "processing":
      return { label: "Diproses", className: "bg-amber-50 text-amber-800 border border-amber-200" };
    case "paid_waiting_verification":
      return { label: "Menunggu Verifikasi", className: "bg-purple-50 text-purple-700 border border-purple-200" };
    case "cancelled":
      return { label: "Dibatalkan", className: "bg-red-50 text-red-700" };
    case "pending_payment":
    default:
      return { label: "Menunggu Pembayaran", className: "bg-brand-emerald/10 text-brand-emerald" };
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
  }).format(date);
}
