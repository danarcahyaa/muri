"use client";

import { useState, type ReactElement, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/Field";
import { ShieldCheck, CheckCircle2, QrCode, User, Phone } from "lucide-react";
import { formatCurrencyIDR, formatWeightKg } from "@/lib/formatter";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import { createWastePurchase } from "@/services/sourcing.service";
import type { SourcingWastePostDetailItem } from "@/types/sourcing";

interface WasteCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: SourcingWastePostDetailItem;
  quantityKg: number;
}

export function WasteCheckoutModal({
  isOpen,
  onClose,
  material,
  quantityKg,
}: WasteCheckoutModalProps): ReactElement {
  const { user } = useAuth();
  const [receiverName, setReceiverName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [shippingAddress, setShippingAddress] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"rekber" | "qris">("rekber");

  const [errors, setErrors] = useState<{
    receiverName?: string;
    phoneNumber?: string;
    shippingAddress?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const subtotalPrice = quantityKg * material.pricePerKg;
  const adminFee = Math.round(subtotalPrice * 0.015); // 1.5% Rekber MURI protection fee
  const totalPrice = subtotalPrice + adminFee;

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    if (!receiverName.trim()) {
      newErrors.receiverName = "Nama penerima / tim sourcing wajib diisi";
    }
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Nomor telepon wajib diisi";
    } else if (phoneNumber.trim().length < 8) {
      newErrors.phoneNumber = "Nomor telepon tidak valid";
    }
    if (!shippingAddress.trim()) {
      newErrors.shippingAddress = "Alamat pengiriman wajib diisi";
    } else if (shippingAddress.trim().length < 10) {
      newErrors.shippingAddress = "Alamat pengiriman minimal 10 karakter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const brandId = user?.id || "de3b8543-ecac-40ff-8c20-a1cb6b58293c"; // Fallback demo brand ID if not logged in

      const result = await createWastePurchase({
        brandId,
        wastePostId: material.id,
        categoryNameSnapshot: material.categoryName,
        fabricNameSnapshot: material.customFabricName,
        originalPricePerKg: material.pricePerKg,
        finalPriceIdr: totalPrice,
        weightBoughtKg: quantityKg,
        purchaseStatus: "pending",
        mediaUrlsSnapshot: material.mediaList || [],
        recipientSnapshot: {
          name: receiverName.trim(),
          phone: phoneNumber.trim(),
          address: shippingAddress.trim(),
        },
      });

      if (result.success) {
        setIsSuccess(true);
        toast.success("Pesanan material berhasil dibuat!");
      } else {
        toast.error(result.error || "Gagal membuat pesanan material.");
      }
    } catch {
      toast.error("Terjadi kesalahan saat memproses pesanan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = (): void => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleResetAndClose()}>
      <DialogContent className="sm:max-w-lg bg-canvas-pure border border-brand-black/15 max-h-[90vh] overflow-y-auto p-6 rounded-md">
        <DialogHeader>
          <DialogTitle className="font-display font-bold text-xl text-brand-black mt-1">
            {isSuccess ? "Pesanan Berhasil Disimpan" : "Konfirmasi Pembelian Material"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-moss">
            {isSuccess
              ? "Transaksi Anda dilindungi oleh sistem Rekber MURI."
              : `Rincian pesanan ${material.customFabricName} dari ${material.providerName}.`}
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto size-14 rounded-full bg-brand-forest/10 flex items-center justify-center text-brand-forest">
              <CheckCircle2 className="size-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-bold text-lg text-brand-black">
                Permintaan Pembelian Dikirim
              </h3>
              <p className="text-xs text-muted-moss max-w-sm mx-auto">
                Tim MURI dan Penyuplai akan memverifikasi pesanan Anda. Anda dapat memantau status pesanan pada Dashboard Brand.
              </p>
            </div>

            <div className="p-4 rounded-md bg-canvas-warm border border-brand-black/10 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-moss">Material:</span>
                <span className="font-bold text-brand-black">{material.customFabricName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-moss">Kuantitas Pesanan:</span>
                <span className="font-bold text-brand-black">{formatWeightKg(quantityKg)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-moss">Total Pembayaran:</span>
                <span className="font-bold text-brand-forest">{formatCurrencyIDR(totalPrice)}</span>
              </div>
            </div>

            <Button
              type="button"
              fullWidth
              onClick={handleResetAndClose}
              className="bg-brand-black text-canvas-pure hover:bg-brand-forest font-bold rounded-sm h-11"
            >
              Tutup & Kembali ke Katalog
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            {/* Summary Box */}
            <div className="p-4 rounded-md bg-canvas-warm border border-brand-black/15 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-moss">Item Material:</span>
                <span className="font-semibold text-brand-black truncate max-w-[200px]">
                  {material.customFabricName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-moss">Kuantitas:</span>
                <span className="font-semibold text-brand-black">{formatWeightKg(quantityKg)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-moss">Harga per Kg:</span>
                <span className="font-semibold text-brand-black">{formatCurrencyIDR(material.pricePerKg)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-line-trace/60 font-bold text-sm">
                <span className="text-brand-black">Total Estimasi:</span>
                <span className="text-brand-forest">{formatCurrencyIDR(totalPrice)}</span>
              </div>
            </div>

            {/* Inputs */}
            <FieldGroup className="space-y-3">
              <Field>
                <FieldLabel htmlFor="receiverName" className="text-xs font-semibold">
                  Nama Penerima <span className="text-error-rust">*</span>
                </FieldLabel>
                <Input
                  id="receiverName"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  placeholder="Contoh: Budi Santoso (Studio Design)"
                  className="rounded-sm"
                  endIcon={<User className="size-4 text-muted-moss" />}
                />
                {errors.receiverName && <FieldError>{errors.receiverName}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="phoneNumber" className="text-xs font-semibold">
                  Nomor WhatsApp / HP <span className="text-error-rust">*</span>
                </FieldLabel>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="081234567890"
                  className="rounded-sm"
                  endIcon={<Phone className="size-4 text-muted-moss" />}
                />
                {errors.phoneNumber && <FieldError>{errors.phoneNumber}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="shippingAddress" className="text-xs font-semibold">
                  Alamat Gudang <span className="text-error-rust">*</span>
                </FieldLabel>
                <Textarea
                  id="shippingAddress"
                  rows={3}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Alamat lengkap tujuan pengiriman material limbah..."
                  className="rounded-sm"
                />
                {errors.shippingAddress && <FieldError>{errors.shippingAddress}</FieldError>}
              </Field>
            </FieldGroup>

            {/* Submit Action */}
            <div className="pt-2">
              <Button
                type="submit"
                fullWidth
                disabled={isSubmitting}
                className="bg-brand-black text-canvas-pure hover:bg-brand-forest font-bold rounded-sm h-11"
              >
                {isSubmitting ? "Memproses Pesanan..." : `Beli Sekarang (${formatCurrencyIDR(totalPrice)})`}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
