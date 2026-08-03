import type { ReactElement } from "react";
import { CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ConfirmPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ConfirmPurchaseDialog({
  open,
  onOpenChange,
  onConfirm,
}: ConfirmPurchaseDialogProps): ReactElement | null {
  if (!open) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onOpenChange(false);
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in-0 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-md flex-col overflow-hidden rounded-xl border border-line-trace bg-canvas-pure cursor-default shadow-xl"
      >
        {/* Modal Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-line-trace px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-brand-lime/40 text-brand-forest">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-brand-black">
                Konfirmasi Pesanan
              </h3>
              <p className="text-xs text-muted-moss">
                Verifikasi transaksi material
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

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-4">
          <p className="text-xs leading-relaxed text-brand-black/80">
            Apakah Anda yakin ingin mengonfirmasi pesanan ini? Tindakan ini akan mengubah status transaksi menjadi selesai dan tidak dapat dibatalkan.
          </p>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-line-trace bg-canvas-warm/55 px-6 py-5 sm:px-8">
          <Button
            size="md"
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            size="md"
            variant="default"
            type="button"
            onClick={onConfirm}
          >
            Konfirmasi
          </Button>
        </div>
      </div>
    </div>
  );
}

