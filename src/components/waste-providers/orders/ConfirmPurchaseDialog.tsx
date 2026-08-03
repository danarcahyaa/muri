import { useState, type ReactElement } from "react";
import { CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PickupAddressForm } from "./PickupAddressForm";
import type { PickupAddress } from "@/types/wasteProvider";
import { toast } from "sonner";

interface ConfirmPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialAddress?: PickupAddress | null;
  onConfirm: (pickupAddress: PickupAddress) => void;
  loading?: boolean;
}

export function ConfirmPurchaseDialog({
  open,
  onOpenChange,
  initialAddress,
  onConfirm,
  loading = false,
}: ConfirmPurchaseDialogProps): ReactElement | null {
  const [pickupAddress, setPickupAddress] = useState<PickupAddress>(
    initialAddress || {
      formatted_address: "",
      latitude: 0,
      longitude: 0,
      address_detail: "",
    }
  );

  if (!open) return null;

  const handleConfirmAction = () => {
    if (!pickupAddress.formatted_address.trim()) {
      toast.error("Silakan tentukan Lokasi Penjemputan Limbah terlebih dahulu!");
      return;
    }

    if (!pickupAddress.address_detail.trim()) {
      toast.error("Silakan lengkapi Detail Alamat Penjemputan (jalan/nomor gudang/kontak PJ)!");
      return;
    }

    onConfirm(pickupAddress);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onOpenChange(false);
        }
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in-0 duration-200 ease-out cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-xl flex-col max-h-[90vh] overflow-hidden rounded-xl border border-line-trace bg-canvas-pure cursor-default shadow-xl animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-200 ease-out font-body"
      >
        {/* Modal Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-line-trace px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-brand-lime/40 text-brand-forest">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-brand-black">
                Konfirmasi Pesanan Limbah
              </h3>
              <p className="text-xs text-muted-moss">
                Tentukan Alamat Penjemputan sebelum mengonfirmasi pesanan (Status: Diproses)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            aria-label="Tutup modal"
            className="flex size-8 items-center justify-center rounded-full bg-canvas-warm text-brand-black transition hover:bg-line-trace cursor-pointer border border-line-trace/40 disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Body: Pickup Address Selection Form */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-4 font-body text-xs text-brand-black">
          <div className="bg-canvas-warm/30 rounded-lg border border-line-trace p-4 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-line-trace/50 text-brand-black">
              <CheckCircle2 className="size-4 text-brand-forest shrink-0" />
              <div>
                <h4 className="font-display font-semibold text-xs text-brand-black">
                  Penentuan Alamat Penjemputan Limbah
                </h4>
                <p className="text-[11px] text-muted-moss">
                  Wajib ditentukan sebelum mengonfirmasi pesanan ini.
                </p>
              </div>
            </div>

            <PickupAddressForm
              value={pickupAddress}
              onChange={setPickupAddress}
              disabled={loading}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-line-trace bg-canvas-warm/55 px-6 py-4 sm:px-8 shrink-0">
          <Button
            size="md"
            variant="outline"
            type="button"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            size="md"
            variant="default"
            type="button"
            loading={loading}
            onClick={handleConfirmAction}
          >
            {loading ? "Mengonfirmasi..." : "Konfirmasi Pesanan"}
          </Button>
        </div>
      </div>
    </div>
  );
}


