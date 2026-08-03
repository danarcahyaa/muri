import { type ReactElement } from "react";
import { Package, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { MediaGalleryViewer } from "@/components/ui/MediaGalleryViewer";
import { formatWeightKg, formatIndonesianDate } from "@/lib/formatter";
import type { WasteBatchItem } from "@/types/wasteProvider";
import type { MediaGalleryItem } from "@/types/common";

interface DetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch: WasteBatchItem | null;
}

export function WasteBatchDetailDialog({
  open,
  onOpenChange,
  batch,
}: DetailDialogProps): ReactElement {
  if (!batch) return <></>;

  const mediaItems: MediaGalleryItem[] = batch.media_urls_snapshot.map((m) => ({
    url: m.url,
    type: m.type as "image" | "video",
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg bg-canvas-pure border border-line-trace rounded-xl w-full max-h-[90vh] flex flex-col overflow-hidden p-0 font-body">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-line-trace px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-brand-lime/40 text-brand-forest">
              <Package className="size-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-brand-black">
                Detail Jejak Limbah
              </h3>
              <p className="text-xs text-muted-moss">
                Riwayat pencatatan batch kain
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
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-muted-moss shrink-0">Batch Code</span>
              <span className="font-mono font-semibold text-right">{batch.batch_code}</span>
            </div>

            <div className="flex justify-between items-start">
              <span className="text-muted-moss shrink-0">Nama Kain</span>
              <span className="font-semibold text-right max-w-[200px] break-words">
                {batch.fabric_name_snapshot || "-"}
              </span>
            </div>

            <div className="flex justify-between items-start">
              <span className="text-muted-moss shrink-0">Jenis / Kategori</span>
              <span className="font-medium text-right">
                {batch.fabric_category_snapshot || "-"}
              </span>
            </div>

            <div className="flex justify-between items-start">
              <span className="text-muted-moss shrink-0">Berat Original</span>
              <span className="font-medium text-right">
                {formatWeightKg(batch.initial_weight_kg)}
              </span>
            </div>

            <div className="flex justify-between items-start">
              <span className="text-muted-moss shrink-0">Asal</span>
              <span className="font-medium text-right">
                {batch.origin_city || "-"}
              </span>
            </div>

            <div className="flex justify-between items-start">
              <span className="text-muted-moss shrink-0">Tanggal Dibuat</span>
              <span className="font-medium text-right">
                {batch.created_at ? formatIndonesianDate(batch.created_at) : "-"}
              </span>
            </div>

            {mediaItems.length > 0 && (
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-moss shrink-0">Media Lampiran</span>
                <MediaGalleryViewer media={mediaItems} />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-end border-t border-line-trace bg-canvas-warm/55 px-6 py-4 sm:px-8">
          <Button variant="outline" size="md" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

