import * as React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/AlertDialog";
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
}: ConfirmPurchaseDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-canvas-pure border border-line-trace font-body max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display font-bold text-brand-black text-base">
            Konfirmasi Pesanan
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-moss">
            Apakah Anda yakin ingin mengonfirmasi pesanan ini? Tindakan ini akan mengubah status transaksi menjadi selesai dan tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            variant="solid-black"
            size="sm"
            onClick={onConfirm}
          >
            Konfirmasi
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
