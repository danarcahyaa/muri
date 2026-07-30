"use client";

import { useState, type ReactElement } from "react";
import { AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { deleteWorkshop } from "@/services/brand-fashion/workshopService";
import type { BrandWorkshopItem } from "@/types/brandWorkshop";

interface WorkshopDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workshop: BrandWorkshopItem | null;
  /** Called after successful deletion to trigger list refresh */
  onDeleted: () => void;
}

export function WorkshopDeleteDialog({
  open,
  onOpenChange,
  workshop,
  onDeleted,
}: WorkshopDeleteDialogProps): ReactElement | null {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (!open || !workshop) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setDeleteError(null);

      const res = await deleteWorkshop(workshop.id);

      if (!res.success) {
        setDeleteError(res.error ?? "Gagal menghapus workshop.");
        setIsDeleting(false);
        return;
      }

      toast.success(`Workshop "${workshop.title}" berhasil dihapus.`);
      setIsDeleting(false);
      onOpenChange(false);
      onDeleted();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Terjadi kesalahan sistem.";
      setDeleteError(msg);
      setIsDeleting(false);
    }
  };

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
            <div className="flex size-10 items-center justify-center rounded-lg bg-red-100 text-red-700">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-brand-black">
                Hapus Workshop
              </h3>
              <p className="text-xs text-muted-moss">
                Tindakan ini tidak dapat dibatalkan
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
            Apakah Anda yakin ingin menghapus workshop{" "}
            <span className="font-bold text-brand-black">
              "{workshop.title}"
            </span>
            ? Semua data pendaftaran dan detail terkait workshop ini akan
            terhapus secara permanen.
          </p>

          {deleteError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
              {deleteError}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-line-trace bg-canvas-warm/55 px-6 py-5 sm:px-8">
          <Button
            size="md"
            variant="outline"
            type="button"
            disabled={isDeleting}
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            size="md"
            variant="destructive"
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? <Spinner /> : "Ya, Hapus"}
          </Button>
        </div>
      </div>
    </div>
  );
}
