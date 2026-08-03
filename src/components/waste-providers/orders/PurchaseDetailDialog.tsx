import { useState } from "react";
import { CreditCard, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { WastePurchaseItem } from "@/types/wasteProvider";
import { formatWeightKg, formatIndonesianDate, formatCurrencyIDR } from "@/lib/formatter";
import { OrderStatus as PurchaseStatus } from "@/enums/enums";
import { StatusBadge, BadgeVariant } from "@/components/ui/StatusBadge";
import { MediaGalleryViewer } from "@/components/ui/MediaGalleryViewer";
import { Button } from "@/components/ui/Button";
import { ConfirmPurchaseDialog } from "./ConfirmPurchaseDialog";
import { RejectPurchaseDialog } from "./RejectPurchaseDialog";

interface PurchaseDetailDialogProps {
  purchase: WastePurchaseItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmPurchase: (purchaseId: string) => Promise<void>;
  onRejectPurchase: (purchaseId: string) => Promise<void>;
}

export function PurchaseDetailDialog({
  purchase,
  open,
  onOpenChange,
  onConfirmPurchase,
  onRejectPurchase,
}: PurchaseDetailDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState(false);
  const [pendingReject, setPendingReject] = useState(false);

  if (!purchase) return null;

  const handleConfirmAction = async () => {
    try {
      setIsProcessing(true);
      await onConfirmPurchase(purchase.id);
      onOpenChange(false);
    } finally {
      setIsProcessing(false);
      setPendingConfirm(false);
    }
  };

  const handleRejectAction = async () => {
    try {
      setIsProcessing(true);
      await onRejectPurchase(purchase.id);
      onOpenChange(false);
    } finally {
      setIsProcessing(false);
      setPendingReject(false);
    }
  };

  const getBadgeProps = () => {
    switch (purchase.purchase_status) {
      case PurchaseStatus.PENDING:
        return { variant: "warning" as BadgeVariant, label: "Menunggu Konfirmasi" };
      case PurchaseStatus.COMPLETE:
        return { variant: "success" as BadgeVariant, label: "Selesai" };
      case PurchaseStatus.CANCELLED:
        return { variant: "danger" as BadgeVariant, label: "Dibatalkan" };
      case PurchaseStatus.REJECTED:
        return { variant: "danger" as BadgeVariant, label: "Ditolak" };
      default:
        return { variant: "neutral" as BadgeVariant, label: purchase.purchase_status || "Unknown" };
    }
  };

  const badgeProps = getBadgeProps();

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md sm:max-w-xl bg-canvas-pure border border-line-trace rounded-xl w-full max-h-[90vh] flex flex-col overflow-hidden p-0 font-body">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-line-trace px-6 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-brand-lime/40 text-brand-forest">
                <CreditCard className="size-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-brand-black">
                  Detail Transaksi Pesanan
                </h3>
                <p className="text-xs text-muted-moss">
                  Informasi pesanan dari brand pembeli
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Tutup modal"
              className="flex size-8 items-center justify-center rounded-full bg-canvas-warm text-brand-black transition hover:bg-line-trace cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto space-y-4 p-6 sm:p-8 font-body text-xs text-brand-black">
            {/* Status Badge */}
            <div className="flex justify-between items-center pb-2 border-b border-line-trace/40">
              <span className="text-muted-moss">Status Pesanan</span>
              <StatusBadge variant={badgeProps.variant}>
                {badgeProps.label}
              </StatusBadge>
            </div>

            {/* Details Grid */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-muted-moss shrink-0">Nama Pembeli (Brand)</span>
                <span className="font-semibold text-right max-w-[200px] break-words">{purchase.brands?.brand_name || "-"}</span>
              </div>

              <div className="flex justify-between items-start">
                <span className="text-muted-moss shrink-0">Nama Kain</span>
                <span className="font-medium text-right max-w-[200px] break-words">{purchase.fabric_name_snapshot || "-"}</span>
              </div>

              <div className="flex justify-between items-start">
                <span className="text-muted-moss shrink-0">Jenis / Kategori</span>
                <span className="font-medium text-right">{purchase.category_name_snapshot || "-"}</span>
              </div>

              {/* Media Lampiran */}
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-moss shrink-0">Media Lampiran</span>
                <MediaGalleryViewer media={purchase.media_urls_snapshot} />
              </div>

              <div className="flex justify-between items-start">
                <span className="text-muted-moss shrink-0">Tanggal Transaksi</span>
                <span className="font-medium">{formatIndonesianDate(purchase.created_at)}</span>
              </div>
            </div>

            {/* Pricing Grid */}
            <div className="bg-canvas-warm/50 rounded-lg border border-line-trace p-4 space-y-2 mt-4">
              <div className="flex justify-between">
                <span className="text-muted-moss">Harga per Kg</span>
                <span className="font-medium">{formatCurrencyIDR(purchase.original_price_per_kg)}/kg</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-moss">Berat Dibeli</span>
                <span className="font-medium">{formatWeightKg(purchase.weight_bought_kg)}</span>
              </div>

              <div className="border-t border-line-trace my-1 pt-2 flex justify-between">
                <span className="font-bold text-muted-moss">Total Pembayaran</span>
                <span className="font-bold text-sm text-brand-forest">{formatCurrencyIDR(purchase.final_price_idr)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 flex items-center justify-between border-t border-line-trace bg-canvas-warm/55 px-6 py-4 sm:px-8">
            <Button variant="outline" size="md" onClick={() => onOpenChange(false)}>
              Tutup
            </Button>
            {purchase.purchase_status === PurchaseStatus.PENDING && (
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setPendingReject(true)}
                  disabled={isProcessing}
                  variant="outline-destructive"
                  size="md"
                >
                  Tolak Pesanan
                </Button>
                <Button
                  onClick={() => setPendingConfirm(true)}
                  disabled={isProcessing}
                  variant="default"
                  size="md"
                >
                  Konfirmasi Pesanan
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Dialog Konfirmasi Tingkat Dua */}
      <ConfirmPurchaseDialog 
        open={pendingConfirm} 
        onOpenChange={setPendingConfirm}
        onConfirm={handleConfirmAction}
      />

      <RejectPurchaseDialog 
        open={pendingReject} 
        onOpenChange={setPendingReject}
        onConfirm={handleRejectAction}
      />
    </>
  );
}
