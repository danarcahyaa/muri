"use client";

import { useState, type ReactElement } from "react";
import { Truck, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OrderStatus } from "@/enums/enums";
import { toast } from "sonner";

interface UpdateLogisticsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseId: string;
  currentStatus: string;
  onConfirmUpdate: (purchaseId: string, status: string, trackingNumber?: string) => Promise<void>;
}

export function UpdateLogisticsDialog({
  open,
  onOpenChange,
  purchaseId,
  currentStatus,
  onConfirmUpdate,
}: UpdateLogisticsDialogProps): ReactElement | null {
  const [targetStatus, setTargetStatus] = useState<string>(
    currentStatus === OrderStatus.PROCESSING ? OrderStatus.SHIPPED : OrderStatus.COMPLETE
  );
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onConfirmUpdate(purchaseId, targetStatus, trackingNumber.trim() || undefined);
      onOpenChange(false);
    } catch {
      toast.error("Gagal memperbarui status logistik.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onOpenChange(false);
        }
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in-0 duration-200 ease-out cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-md flex-col overflow-hidden rounded-xl border border-line-trace bg-canvas-pure cursor-default shadow-xl animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-200 ease-out font-body"
      >
        {/* Modal Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-line-trace px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-brand-forest/10 text-brand-forest">
              <Truck className="size-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-brand-black">
                Pembaruan Logistik & Pengiriman
              </h3>
              <p className="text-xs text-muted-moss">
                Perbarui status pengiriman material
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 sm:p-8 space-y-5 text-xs">
            {/* Target Status Selector */}
            <div className="space-y-2">
              <label className="block font-semibold text-brand-black">
                Pilih Status Logistik Baru <span className="text-error-rust">*</span>
              </label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value)}
                className="w-full rounded-md border border-brand-black/15 bg-canvas-pure p-2.5 text-xs text-brand-black focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 outline-none"
              >
                <option value={OrderStatus.SHIPPED}>Dikirim (Shipped)</option>
                <option value={OrderStatus.COMPLETE}>Selesai (Completed)</option>
              </select>
            </div>

            {/* Tracking Number Input */}
            <div className="space-y-2">
              <label className="block font-semibold text-brand-black">
                Nomor Resi / Tracking Logistik (Opsional)
              </label>
              <Input
                type="text"
                placeholder="Misal: JNE-MAT-883910, SICEPAT-99120"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="bg-canvas-pure text-xs"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-line-trace bg-canvas-warm/55 px-6 py-4 sm:px-8">
            <Button
              size="md"
              variant="outline"
              type="button"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              size="md"
              variant="default"
              type="submit"
              loading={isSubmitting}
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Status Logistik"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
