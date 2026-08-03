import { useState } from "react";
import { CreditCard, MapPin, Navigation, Truck, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/Dialog";
import { WastePurchaseItem, PickupAddress } from "@/types/wasteProvider";
import { formatWeightKg, formatIndonesianDate, formatCurrencyIDR } from "@/lib/formatter";
import { OrderStatus as PurchaseStatus } from "@/enums/enums";
import { StatusBadge, BadgeVariant } from "@/components/ui/StatusBadge";
import { MediaGalleryViewer } from "@/components/ui/MediaGalleryViewer";
import { Button } from "@/components/ui/Button";
import { ConfirmPurchaseDialog } from "./ConfirmPurchaseDialog";
import { RejectPurchaseDialog } from "./RejectPurchaseDialog";
import { UpdateLogisticsDialog } from "./UpdateLogisticsDialog";
import { ShipPurchaseDialog } from "./ShipPurchaseDialog";
import { CompletePurchaseDialog } from "./CompletePurchaseDialog";
import { toast } from "sonner";

interface PurchaseDetailDialogProps {
  purchase: WastePurchaseItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmPurchase: (purchaseId: string, pickupAddress: PickupAddress) => Promise<void>;
  onUpdateLogistics?: (purchaseId: string, status: string, trackingNumber?: string) => Promise<void>;
  onRejectPurchase: (purchaseId: string) => Promise<void>;
}

export function PurchaseDetailDialog({
  purchase,
  open,
  onOpenChange,
  onConfirmPurchase,
  onUpdateLogistics,
  onRejectPurchase,
}: PurchaseDetailDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingReject, setPendingReject] = useState(false);
  const [pendingShip, setPendingShip] = useState(false);
  const [pendingComplete, setPendingComplete] = useState(false);
  const [logisticsDialogOpen, setLogisticsDialogOpen] = useState(false);

  if (!purchase) return null;

  const handleConfirmAction = async (address: PickupAddress) => {
    try {
      setIsProcessing(true);
      await onConfirmPurchase(purchase.id, address);
      setConfirmDialogOpen(false);
      onOpenChange(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShipAction = async () => {
    if (!onUpdateLogistics) return;
    try {
      setIsProcessing(true);
      await onUpdateLogistics(purchase.id, PurchaseStatus.SHIPPED);
      onOpenChange(false);
    } finally {
      setIsProcessing(false);
      setPendingShip(false);
    }
  };

  const handleCompleteAction = async () => {
    if (!onUpdateLogistics) return;
    try {
      setIsProcessing(true);
      await onUpdateLogistics(purchase.id, PurchaseStatus.COMPLETE);
      onOpenChange(false);
    } finally {
      setIsProcessing(false);
      setPendingComplete(false);
    }
  };

  const handleUpdateLogisticsAction = async (purchaseId: string, newStatus: string, trackingNumber?: string) => {
    if (!onUpdateLogistics) return;
    try {
      setIsProcessing(true);
      await onUpdateLogistics(purchaseId, newStatus, trackingNumber);
      onOpenChange(false);
    } finally {
      setIsProcessing(false);
      setLogisticsDialogOpen(false);
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
      case PurchaseStatus.PROCESSING:
        return { variant: "warning" as BadgeVariant, label: "Diproses" };
      case PurchaseStatus.SHIPPED:
        return { variant: "info" as BadgeVariant, label: "Dikirim" };
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

  const recipient = (purchase.recipient_snapshot as Record<string, unknown> | null) || null;
  const receiverName = String(
    recipient?.name || recipient?.receiverName || recipient?.receiver_name || "-"
  );
  const phoneNumber = String(
    recipient?.phone || recipient?.phoneNumber || recipient?.phone_number || "-"
  );
  const regionStr = String(
    recipient?.formatted_address || recipient?.formattedAddress || recipient?.city || recipient?.cityRegency || recipient?.city_regency || "-"
  );
  const fullAddressText = String(
    recipient?.address_detail || recipient?.addressDetail || recipient?.address || recipient?.shippingAddress || recipient?.full_address || "-"
  );
  const notes = String(
    recipient?.notes || recipient?.shippingNote || recipient?.delivery_notes || "-"
  );

  const existingPickupAddress = purchase.pickup_address;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="max-w-md sm:max-w-xl bg-canvas-pure border border-line-trace rounded-xl w-full max-h-[90vh] flex flex-col overflow-hidden p-0 font-body"
        >
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
                  Informasi rincian pesanan & pengiriman material
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Tutup modal"
              className="flex size-8 items-center justify-center rounded-full bg-canvas-warm text-brand-black transition hover:bg-line-trace cursor-pointer border border-line-trace/40"
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

            {/* Tracking Number if available */}
            {purchase.tracking_number && (
              <div className="flex justify-between items-center py-2 px-3 bg-brand-forest/5 border border-brand-forest/20 rounded-md">
                <span className="text-muted-moss font-medium">Nomor Resi / Tracking:</span>
                <span className="font-mono font-bold text-brand-forest text-xs">{purchase.tracking_number}</span>
              </div>
            )}

            {/* Display Saved Pickup Address when order is already confirmed / processing / shipped */}
            {existingPickupAddress && (
              <div className="bg-canvas-warm/30 rounded-lg border border-line-trace p-4 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-line-trace/50 text-brand-black">
                  <Navigation className="size-4 text-brand-forest shrink-0" />
                  <h4 className="font-display font-semibold text-xs text-brand-black">
                    Alamat Penjemputan Limbah
                  </h4>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-muted-moss block text-[11px] mb-0.5">Wilayah Penjemputan</span>
                    <span className="font-semibold text-brand-black">{existingPickupAddress.formatted_address}</span>
                  </div>

                  <div>
                    <span className="text-muted-moss block text-[11px] mb-0.5">Detail Alamat Lengkap & Catatan Gudang</span>
                    <p className="font-medium text-brand-black leading-relaxed bg-canvas-pure/80 p-2 rounded border border-line-trace/60">
                      {existingPickupAddress.address_detail}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Details Grid */}
            <div className="space-y-3 pt-2">
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

            {/* Tujuan Pengiriman / Informasi Penerima */}
            <div className="bg-canvas-warm/30 rounded-lg border border-line-trace p-4 space-y-3 mt-4">
              <div className="flex items-center gap-2 pb-2 border-b border-line-trace/50 text-brand-black">
                <MapPin className="size-4 text-brand-forest shrink-0" />
                <h4 className="font-display font-semibold text-xs text-brand-black">
                  Tujuan Pengiriman
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-moss block text-[11px] mb-0.5">Nama Penerima</span>
                  <span className="font-semibold text-brand-black">{receiverName}</span>
                </div>
                <div>
                  <span className="text-muted-moss block text-[11px] mb-0.5">Nomor Telepon / WhatsApp</span>
                  <span className="font-semibold text-brand-black">{phoneNumber}</span>
                </div>
                <div>
                  <span className="text-muted-moss block text-[11px] mb-0.5">Wilayah</span>
                  <span className="font-semibold text-brand-black">{regionStr}</span>
                </div>
                <div>
                  <span className="text-muted-moss block text-[11px] mb-0.5">Alamat Lengkap</span>
                  <p className="font-medium text-brand-black leading-relaxed">
                    {fullAddressText}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 flex items-center justify-end gap-3 border-t border-line-trace bg-canvas-warm/55 px-6 py-4 sm:px-8">
            {purchase.purchase_status === PurchaseStatus.PENDING && (
              <>
                <Button
                  onClick={() => setPendingReject(true)}
                  disabled={isProcessing}
                  variant="outline-destructive"
                  size="md"
                >
                  Tolak Pesanan
                </Button>
                <Button
                  onClick={() => setConfirmDialogOpen(true)}
                  disabled={isProcessing}
                  variant="default"
                  size="md"
                >
                  {isProcessing ? "Mengonfirmasi..." : "Konfirmasi Pesanan"}
                </Button>
              </>
            )}

            {purchase.purchase_status === PurchaseStatus.PROCESSING && (
              <Button
                onClick={() => setPendingShip(true)}
                disabled={isProcessing}
                variant="default"
                size="md"
                className="flex items-center gap-1.5"
              >
                <Truck className="size-4" />
                Kirim Pesanan
              </Button>
            )}

            {purchase.purchase_status === PurchaseStatus.SHIPPED && (
              <Button
                onClick={() => setPendingComplete(true)}
                disabled={isProcessing}
                variant="default"
                size="md"
                className="flex items-center gap-1.5"
              >
                <Truck className="size-4" />
                Tandai Selesai
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Dialog Terpisah Konfirmasi Pesanan & Penentuan Alamat */}
      <ConfirmPurchaseDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        initialAddress={purchase.pickup_address}
        onConfirm={handleConfirmAction}
        loading={isProcessing}
      />

      {/* Alert Dialog Konfirmasi Kirim Pesanan */}
      <ShipPurchaseDialog
        open={pendingShip}
        onOpenChange={setPendingShip}
        onConfirm={handleShipAction}
        loading={isProcessing}
      />

      {/* Alert Dialog Konfirmasi Tandai Selesai */}
      <CompletePurchaseDialog
        open={pendingComplete}
        onOpenChange={setPendingComplete}
        onConfirm={handleCompleteAction}
        loading={isProcessing}
      />

      {/* Modal Update Logistik Status */}
      <UpdateLogisticsDialog
        open={logisticsDialogOpen}
        onOpenChange={setLogisticsDialogOpen}
        purchaseId={purchase.id}
        currentStatus={purchase.purchase_status}
        onConfirmUpdate={handleUpdateLogisticsAction}
      />

      <RejectPurchaseDialog 
        open={pendingReject} 
        onOpenChange={setPendingReject}
        onConfirm={handleRejectAction}
        loading={isProcessing}
      />
    </>
  );
}
