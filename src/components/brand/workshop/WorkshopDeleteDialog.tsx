"use client";

import { useState, type ReactElement } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/spinner";
import { deleteWorkshop } from "@/services/brand-fashion/workshopService";
import type { BrandWorkshopItem } from "@/types/brandWorkshop";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

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
}: WorkshopDeleteDialogProps): ReactElement {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (!workshop) return <></>;

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
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan sistem.";
      setDeleteError(msg);
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-canvas-pure border border-line-trace font-body max-w-md rounded-lg p-5">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-error-rust/10 text-error-rust shrink-0">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <AlertDialogTitle className="font-display font-bold text-brand-black text-lg">
                Hapus Workshop
              </AlertDialogTitle>
              <p className="text-xs text-muted-moss">Tindakan ini tidak dapat dibatalkan</p>
            </div>
          </div>

          <AlertDialogDescription className="text-xs text-brand-black/80 mt-3 leading-relaxed py-2">
            Apakah Anda yakin ingin menghapus workshop{" "}
            <span className="font-bold text-brand-black">"{workshop.title}"</span>?
            Semua data pendaftaran dan detail terkait workshop ini akan terhapus secara permanen.
          </AlertDialogDescription>

          {deleteError && (
            <div className="mt-3 rounded bg-error-rust/10 border border-error-rust/20 p-2.5 text-xs text-error-rust font-medium">
              {deleteError}
            </div>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4 flex gap-2 justify-end">
          <Button
            size={"sm"}
            variant={"outline"}
            type="button"
            disabled={isDeleting}
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            size={"sm"}
            variant={"destructive"}
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? <Spinner /> : "Ya, Hapus"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
