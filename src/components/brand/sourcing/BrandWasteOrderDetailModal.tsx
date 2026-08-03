"use client";

import { useState, type ReactElement } from "react";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/AlertDialog";
import { Button } from "@/components/ui/Button";
import { OrderProgressBar } from "@/components/ui/OrderProgressBar";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  Factory,
  MapPin,
  Navigation,
  Package,
  Phone,
  Truck,
  User,
  X,
} from "lucide-react";
import { formatCurrencyIDR, formatWeightKg } from "@/lib/formatter";
import { toast } from "sonner";
import { cancelWastePurchase, type BrandWastePurchaseItem } from "@/services/sourcing.service";

interface BrandWasteOrderDetailModalProps {
  order: BrandWastePurchaseItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderCancelled?: () => void;
}

export default function BrandWasteOrderDetailModal({
  order,
  isOpen,
  onClose,
  onOrderCancelled,
}: BrandWasteOrderDetailModalProps): ReactElement | null {
  const [isConfirmingCancel, setIsConfirmingCancel] = useState<boolean>(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  if (!isOpen || !order) return null;

  const isPending = order.purchaseStatus === "pending";
  const statusMeta = getStatusMeta(order.purchaseStatus);

  const firstMediaUrl =
    Array.isArray(order.mediaUrlsSnapshot) && order.mediaUrlsSnapshot[0]
      ? typeof order.mediaUrlsSnapshot[0] === "string"
        ? order.mediaUrlsSnapshot[0]
        : order.mediaUrlsSnapshot[0].url
      : null;

  const handleConfirmCancel = async (): Promise<void> => {
    setIsCancelling(true);
    try {
      const res = await cancelWastePurchase(order.id);


      if (res.success) {
        toast.success("Pesanan material berhasil dibatalkan.");
        setIsConfirmingCancel(false);
        onClose();
        onOrderCancelled?.();
      } else {
        toast.error(res.error || "Gagal membatalkan pesanan.");
      }
    } catch {
      toast.error("Terjadi kesalahan saat membatalkan pesanan.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      {/* Outer backdrop overlay matching BrandOrderDetailModal & MaterialPurchaseDetailModal */}
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
                  <span className="font-mono text-base font-bold text-brand-black">
                    {order.purchaseId}
                  </span>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide ${statusMeta.badgeClass}`}
                  >
                    {statusMeta.label}
                  </span>
                </div>
                <p className="text-xs text-muted-moss">
                  Pesanan dibuat pada {formatDate(order.createdAt)}
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

          {/* Body Content (Scrollable) */}
          <div className="space-y-6 overflow-y-auto p-6 sm:p-8">
            {/* Order Progress Step Bar */}
            <OrderProgressBar status={order.purchaseStatus} />

            {/* Material Item Breakdown */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-brand-black">
                <Package className="size-4 text-brand-emerald" />
                <span>Detail Item Material Limbah</span>
              </div>

              <div className="mt-3 space-y-3 rounded-lg border border-line-trace bg-canvas-warm/50 p-4">
                <div className="flex gap-4 items-start">
                  <div className="relative size-16 rounded-md overflow-hidden bg-canvas-pure shrink-0 border border-brand-black/10">
                    {firstMediaUrl ? (
                      <Image
                        src={firstMediaUrl}
                        alt={order.fabricNameSnapshot}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="size-full flex items-center justify-center text-muted-moss">
                        <Package className="size-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="rounded-full bg-brand-lime/40 px-2.5 py-0.5 text-[9px] font-bold uppercase text-brand-forest">
                      {order.categoryNameSnapshot}
                    </span>
                    <h4 className="font-display font-bold text-sm text-brand-black truncate">
                      {order.fabricNameSnapshot}
                    </h4>
                    {order.providerName && (
                      <p className="flex items-center gap-1 text-[11px] text-muted-moss">
                        <Factory className="size-3 shrink-0" />
                        Penyuplai: <span className="font-semibold text-brand-black">{order.providerName}</span>
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-display text-sm font-bold text-brand-forest block">
                      {formatWeightKg(order.weightBoughtKg)}
                    </span>
                    <span className="text-[10px] text-muted-moss block">
                      @{formatCurrencyIDR(order.originalPricePerKg)}/Kg
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lokasi Asal Pengiriman Material (Dari Provider) */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-brand-black">
                <Truck className="size-4 text-brand-emerald" />
                <span>Lokasi Asal Pengiriman Material</span>
              </div>

              <div className="mt-3 space-y-2.5 rounded-lg border border-line-trace bg-canvas-warm/50 p-4">
                {order.pickupAddress ? (
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-muted-moss block text-[11px] mb-0.5">Wilayah Asal Pengiriman</span>
                      <span className="font-semibold text-brand-black">{order.pickupAddress.formatted_address}</span>
                    </div>

                    <div>
                      <span className="text-muted-moss block text-[11px] mb-0.5">Detail Alamat Lengkap & Catatan Gudang Asal</span>
                      <p className="font-medium text-brand-black leading-relaxed bg-canvas-pure/80 p-2 rounded border border-line-trace/60">
                        {order.pickupAddress.address_detail}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs italic text-muted-moss">
                    Lokasi asal pengiriman material sedang dikonfirmasi oleh penyedia limbah.
                  </p>
                )}
              </div>
            </div>

            {/* Recipient & Shipping Information (No word 'Snapshot', Data justify-between) */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-brand-black">
                <MapPin className="size-4 text-brand-emerald" />
                <span>Data Penerima & Alamat Pengiriman</span>
              </div>

              <div className="mt-3 space-y-2.5 rounded-lg border border-line-trace bg-canvas-warm/50 p-4">
                <DetailRow
                  label="Nama Penerima"
                  value={order.recipientSnapshot?.name || "Tidak tersedia"}
                />
                <DetailRow
                  label="Nomor Telepon"
                  value={order.recipientSnapshot?.phone || "Tidak tersedia"}
                />
                <DetailRow
                  label="Alamat Pengiriman"
                  value={order.recipientSnapshot?.address || "Tidak tersedia"}
                />
              </div>
            </div>

            {/* Payment Summary Breakdown (justify-between) */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-brand-black">
                <CreditCard className="size-4 text-brand-emerald" />
                <span>Rincian Pembayaran Material</span>
              </div>

              <div className="mt-3 space-y-2.5 rounded-lg border border-line-trace bg-canvas-warm/50 p-4">
                <DetailRow
                  label="Harga per Kg"
                  value={`${formatCurrencyIDR(order.originalPricePerKg)} / kg`}
                />
                <DetailRow
                  label="Total Kuantitas Material"
                  value={formatWeightKg(order.weightBoughtKg)}
                />
                <div className="border-t border-line-trace pt-2">
                  <DetailRow
                    label="Total Pembayaran"
                    value={formatCurrencyIDR(order.finalPriceIdr)}
                    bold
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions (Aligned side-by-side) */}
          <div className="shrink-0 flex flex-wrap items-center justify-end gap-2.5 border-t border-line-trace bg-canvas-warm/55 px-6 py-4 sm:px-8">
            {isPending && (
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsConfirmingCancel(true)}
                className="border-error-rust/40 text-error-rust hover:bg-error-rust/10 font-bold rounded-sm text-xs cursor-pointer flex items-center gap-1.5"
              >
                <AlertTriangle className="size-3.5" />
                <span>Batalkan Pesanan</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="md"
              onClick={onClose}
              className="rounded-sm font-bold text-xs"
            >
              Tutup
            </Button>
          </div>
        </div>
      </div>

      {/* Alert Dialog Confirmation for Cancellation */}
      <AlertDialog open={isConfirmingCancel} onOpenChange={setIsConfirmingCancel}>
        <AlertDialogContent className="bg-canvas-pure border border-brand-black/15 p-6 rounded-md">
          <AlertDialogHeader>
            <div className="size-12 rounded-full bg-error-rust/10 flex items-center justify-center text-error-rust mb-2">
              <AlertTriangle className="size-6" />
            </div>
            <AlertDialogTitle className="font-display font-bold text-lg text-brand-black">
              Konfirmasi Batalkan Pesanan?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-moss leading-relaxed">
              Apakah Anda yakin ingin membatalkan pesanan material <span className="font-bold text-brand-black">{order.fabricNameSnapshot}</span>? Pesanan yang telah dibatalkan akan langsung dihapus dari daftar pesanan Brand.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel
              onClick={() => setIsConfirmingCancel(false)}
              className="border-brand-black/15 text-brand-black font-semibold text-xs rounded-sm h-10 cursor-pointer"
            >
              Kembali
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              disabled={isCancelling}
              className="bg-error-rust text-white hover:bg-error-rust/90 font-bold text-xs rounded-sm h-10 cursor-pointer"
            >
              {isCancelling ? "Memproses..." : "Ya, Batalkan Pesanan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
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
      <span
        className={
          bold
            ? "font-display text-sm font-bold text-brand-forest"
            : "font-medium text-brand-black text-right"
        }
      >
        {value}
      </span>
    </div>
  );
}

function getStatusMeta(status: string) {
  switch (status) {
    case "completed":
    case "complete":
      return {
        label: "Selesai",
        badgeClass: "bg-brand-lime/50 text-brand-forest",
      };
    case "shipped":
      return {
        label: "Dikirim",
        badgeClass: "bg-blue-50 text-blue-700 border border-blue-200",
      };
    case "processing":
      return {
        label: "Diproses",
        badgeClass: "bg-amber-50 text-amber-800 border border-amber-200",
      };
    case "pending":
    default:
      return {
        label: "Menunggu",
        badgeClass: "bg-brand-emerald/10 text-brand-emerald",
      };
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
