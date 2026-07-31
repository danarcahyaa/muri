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
        className="flex max-h-[calc(100dvh-2rem)] w-[calc(100%-1rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        {/* Fixed header */}
        <DialogHeader className="shrink-0 border-b border-line-trace px-5 py-5 pr-14 sm:px-6 sm:py-6 sm:pr-16">
          <p className="text-[10px] font-bold uppercase tracking-wider text-brand-emerald sm:text-xs">
            Konfirmasi Transaksi
          </p>

          <DialogTitle className="font-display text-2xl font-medium leading-tight tracking-[-0.04em] text-brand-black sm:text-3xl">
            Buat Pesanan Ini?
          </DialogTitle>

          <DialogDescription className="max-w-lg text-xs leading-5 text-muted-moss sm:text-sm sm:leading-6">
            Periksa ringkasan terakhir dan berikan persetujuan sebelum pesanan
            material dibuat.
          </DialogDescription>
        </DialogHeader>

        {/* Only this body is scrollable */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6 sm:py-6">
          <div className="space-y-4 sm:space-y-5">
            <Card variant="warm" className="p-4 sm:p-5">
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

              <span className="min-w-0 text-xs leading-5 text-brand-black">
                Saya sudah memeriksa material, volume, alamat, metode pembayaran,
                dan total transaksi. Saya menyetujui pembuatan pesanan ini.
              </span>
            </label>

            {errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Fixed footer */}
        <DialogFooter className="mx-0 mb-0 shrink-0 rounded-none border-t border-line-trace bg-canvas-warm/55 px-5 py-4 sm:px-6">
          <div className="grid w-full min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
            <Button
              type="button"
              variant="outline"
              size="md"
              fullWidth
              disabled={isSubmitting}
              onClick={onClose}
            >
              Kembali
            </Button>

            <Button
              type="button"
              size="md"
              fullWidth
              loading={isSubmitting}
              disabled={isSubmitting || !confirmationAccepted}
              onClick={onConfirm}
              className="min-w-0"
            >
              <span className="min-w-0 truncate">Buat Pesanan QRIS</span>
              <QrCode className="shrink-0" />
            </Button>
          </div>
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
    <div className="grid gap-1.5 py-3 first:pt-0 last:pb-0 sm:grid-cols-[minmax(90px,0.4fr)_minmax(0,1fr)] sm:items-start sm:gap-5">
      <span className="text-xs text-muted-moss">{label}</span>
      <span className="min-w-0 break-words text-xs font-bold text-brand-black sm:text-right">
        {value}
      </span>
    </div>
  );
}