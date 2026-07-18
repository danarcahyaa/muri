import { type ReactElement } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
      <DialogContent className="sm:max-w-lg p-6 bg-canvas-pure border border-line-trace max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold text-brand-black pr-6">
            Detail Jejak Limbah
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2 font-body text-md text-brand-black">
          {/* Details Grid */}
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
      </DialogContent>
    </Dialog>
  );
}
