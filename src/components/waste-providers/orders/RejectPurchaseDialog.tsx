import * as React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/Button";

interface RejectPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function RejectPurchaseDialog({
  open,
  onOpenChange,
  onConfirm,
}: RejectPurchaseDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-canvas-pure border border-line-trace font-body max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display font-bold text-brand-black text-base">
            Tolak Pesanan
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-moss">
            Apakah Anda yakin ingin menolak pesanan ini? Tindakan ini akan mengubah status transaksi menjadi ditolak dan tidak dapat dibatalkan.
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
            variant="destructive"
            size="sm"
            onClick={onConfirm}
          >
            Tolak Pesanan
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
