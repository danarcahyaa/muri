"use client";

import { QrCode } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Separator } from "@/components/ui/Separator";
import { formatIdr } from "@/lib/productDetail";
import type { MaterialDetailItem } from "@/types/material";
import type { MaterialPaymentMethod } from "@/types/materialOrder";

interface MaterialCheckoutConfirmationDialogProps {
  open: boolean;
  material: MaterialDetailItem;
  weightKg: number;
  receiverName: string;
  shippingAddress: string;
  paymentMethod: MaterialPaymentMethod;
  confirmationAccepted: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
  onConfirmationChange: (value: boolean) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export default function MaterialCheckoutConfirmationDialog({
  open,
  material,
  weightKg,
  receiverName,
  shippingAddress,
  paymentMethod,
  confirmationAccepted,
  isSubmitting,
  errorMessage,
  onConfirmationChange,
  onClose,
  onConfirm,
}: MaterialCheckoutConfirmationDialogProps) {
  const totalPriceIdr = weightKg * material.pricePerKg;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isSubmitting) onClose();
      }}
    >
      <DialogContent
        showCloseButton={!isSubmitting}
        className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-xl"
      >
        <DialogHeader>
          <p className="text-xs font-bold uppercase text-brand-emerald">
            Konfirmasi Transaksi
          </p>
          <DialogTitle className="font-display text-3xl font-medium leading-tight tracking-[-0.04em] text-brand-black">
            Buat Pesanan Ini?
          </DialogTitle>
          <DialogDescription>
            Periksa ringkasan terakhir dan berikan persetujuan sebelum pesanan
            material dibuat.
          </DialogDescription>
        </DialogHeader>

        <Card variant="warm" className="mt-2 p-5">
          <ConfirmationRow
            label="Material"
            value={`${material.title} · ${material.batchCode}`}
          />
          <Separator className="bg-line-trace" />
          <ConfirmationRow label="Volume" value={`${weightKg} kg`} />
          <Separator className="bg-line-trace" />
          <ConfirmationRow label="Penerima" value={receiverName} />
          <Separator className="bg-line-trace" />
          <ConfirmationRow label="Alamat" value={shippingAddress} />
          <Separator className="bg-line-trace" />
          <ConfirmationRow
            label="Metode"
            value={paymentMethod.toUpperCase()}
          />
          <Separator className="bg-line-trace" />
          <ConfirmationRow label="Total" value={formatIdr(totalPriceIdr)} />
        </Card>

        <Alert className="border-amber-200 bg-amber-50 text-amber-800">
          <AlertDescription>
            Pesanan akan dibuat dengan status menunggu pembayaran. Lanjutkan
            proses pembayaran dari dashboard pembelian material.
          </AlertDescription>
        </Alert>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line-trace bg-canvas-warm/40 p-4">
          <Checkbox
            checked={confirmationAccepted}
            disabled={isSubmitting}
            onCheckedChange={(checked) => {
              onConfirmationChange(checked === true);
            }}
            className="mt-0.5"
          />

          <span className="text-xs leading-5 text-brand-black">
            Saya sudah memeriksa material, volume, alamat, metode pembayaran,
            dan total transaksi. Saya menyetujui pembuatan pesanan ini.
          </span>
        </label>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onClose}
          >
            Kembali
          </Button>

          <Button
            type="button"
            loading={isSubmitting}
            disabled={!confirmationAccepted}
            onClick={onConfirm}
          >
            Buat Pesanan QRIS
            <QrCode />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ConfirmationRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-5 py-3 first:pt-0 last:pb-0">
      <span className="text-xs text-muted-moss">{label}</span>
      <span className="max-w-[65%] text-right text-xs font-bold text-brand-black">
        {value}
      </span>
    </div>
  );
}
