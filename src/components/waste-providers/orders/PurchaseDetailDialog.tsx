import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WastePurchaseItem } from "@/types/wasteProvider";
import { formatWeightKg, formatIndonesianDate, formatCurrencyIDR } from "@/lib/formatter";
import { OrderStatus as PurchaseStatus } from "@/enums/enum";
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
        <DialogContent className="sm:max-w-md bg-canvas-pure border border-line-trace max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold text-brand-black pr-6">
              Detail Transaksi Pesanan
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 font-body text-xs text-brand-black">
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

              {/* Media Lampiran (Menggunakan komponen Gallery Viewer Reusable) */}
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
            <div className="bg-canvas-warm/30 rounded-sm border border-line-trace/60 p-3 space-y-2 mt-4">
              <div className="flex justify-between">
                <span className="text-muted-moss">Harga per Kg</span>
                <span className="font-medium">{formatCurrencyIDR(purchase.original_price_per_kg)}/kg</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-moss">Berat Dibeli</span>
                <span className="font-medium">{formatWeightKg(purchase.weight_bought_kg)}</span>
              </div>

              <div className="border-t border-line-trace/60 my-1 pt-1.5 flex justify-between">
                <span className="font-bold text-muted-moss">Total Pembayaran</span>
                <span className="font-bold text-sm">{formatCurrencyIDR(purchase.final_price_idr)}</span>
              </div>
            </div>

            {purchase.purchase_status === PurchaseStatus.PENDING && (
              <div className="flex gap-2.5 justify-end pt-4 border-t border-line-trace/40 mt-4">
                <Button
                  onClick={() => setPendingReject(true)}
                  disabled={isProcessing}
                  variant="outline-destructive"
                  size="sm"
                >
                  Tolak Pesanan
                </Button>
                <Button
                  onClick={() => setPendingConfirm(true)}
                  disabled={isProcessing}
                  variant="solid-black"
                  size="sm"
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
