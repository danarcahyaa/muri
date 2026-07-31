"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";

import MaterialCheckoutConfirmationDialog from "@/components/material/checkout/MaterialCheckoutConfirmationDialog";
import MaterialCheckoutForm, {
  type MaterialCheckoutFieldErrors,
} from "@/components/material/checkout/MaterialCheckoutForm";
import MaterialCheckoutOrderSummary from "@/components/material/checkout/MaterialCheckoutOrderSummary";
import MaterialCheckoutReview from "@/components/material/checkout/MaterialCheckoutReview";
import {
  MaterialCheckoutLoading,
  MaterialCheckoutLoadError,
} from "@/components/material/checkout/MaterialCheckoutStatus";
import MaterialCheckoutSuccess from "@/components/material/checkout/MaterialCheckoutSuccess";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { BackLink } from "@/components/ui/BackLink";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { createMaterialOrder, getMaterialBatchByCode } from "@/services/material";
import { supabase } from "@/lib/supabaseClient";
import type { MaterialDetailItem } from "@/types/material";
import type { MaterialOrder, MaterialPaymentMethod } from "@/types/materialOrder";

interface BrandMaterialCheckoutProps {
  batchCode: string;
  requestedWeightKg: number;
}

type CheckoutStep = "form" | "review" | "success";

export default function BrandMaterialCheckout({
  batchCode,
  requestedWeightKg,
}: BrandMaterialCheckoutProps) {
  const router = useRouter();

  const [material, setMaterial] = useState<MaterialDetailItem | null>(null);
  const [step, setStep] = useState<CheckoutStep>("form");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCustomer, setIsCustomer] = useState(false);

  const [weightKg, setWeightKg] = useState(requestedWeightKg);
  const [receiverName, setReceiverName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<MaterialPaymentMethod>("qris");

  const [fieldErrors, setFieldErrors] =
    useState<MaterialCheckoutFieldErrors>({});
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [confirmationAccepted, setConfirmationAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<MaterialOrder | null>(null);

  const loadCheckout = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    setFieldErrors({});
    setIsCustomer(false);

    try {
      const { data: authData } = await supabase.auth.getUser();

      if (authData.user) {
        const { data: brandData } = await supabase
          .from("brands")
          .select("*")
          .eq("id", authData.user.id)
          .maybeSingle();

        if (!brandData) {
          setIsCustomer(true);
        } else {
          const defaultName =
            brandData.brand_name ||
            authData.user.user_metadata?.full_name ||
            "";
          const defaultPhone =
            brandData.active_number ||
            authData.user.user_metadata?.phone ||
            "";
          const defaultAddress =
            brandData.warehouse_address || brandData.address || "";

          setReceiverName((current) => current || defaultName);
          setPhoneNumber((current) => current || defaultPhone);
          setShippingAddress((current) => current || defaultAddress);
        }
      }

      const result = await getMaterialBatchByCode(batchCode);

      if (!result.success || !result.data) {
        setLoadError(getMaterialCheckoutErrorMessage(result.error));
        return;
      }

      const data = result.data;
      const normalizedWeight = Math.min(
        data.availableWeightKg,
        Math.max(data.minimumOrderKg, requestedWeightKg),
      );

      setMaterial(data);
      setWeightKg(normalizedWeight);
      setPaymentMethod("qris");
      setStep("form");
    } catch (error) {
      console.error("[BrandMaterialCheckout] Load error:", error);
      setLoadError("Checkout material belum dapat disiapkan.");
    } finally {
      setIsLoading(false);
    }
  }, [batchCode, requestedWeightKg]);

  useEffect(() => {
    void loadCheckout();
  }, [loadCheckout]);

  function clearFieldError(field: keyof MaterialCheckoutFieldErrors) {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleWeightChange(value: number) {
    if (!material) return;

    const nextValue = Number.isFinite(value)
      ? Math.min(
          material.availableWeightKg,
          Math.max(material.minimumOrderKg, value),
        )
      : material.minimumOrderKg;

    setWeightKg(nextValue);
    clearFieldError("weightKg");
  }

  function handleReview() {
    if (!material) return;

    const normalizedName = receiverName.trim();
    const normalizedPhone = phoneNumber.trim();
    const normalizedAddress = shippingAddress.trim();
    const errors: MaterialCheckoutFieldErrors = {};

    if (
      !Number.isFinite(weightKg) ||
      weightKg < material.minimumOrderKg ||
      weightKg > material.availableWeightKg
    ) {
      errors.weightKg = `Volume harus antara ${material.minimumOrderKg}–${material.availableWeightKg} kg.`;
    }

    if (normalizedName.length < 2) {
      errors.receiverName = "Nama penerima minimal 2 karakter.";
    } else if (normalizedName.length > 120) {
      errors.receiverName = "Nama penerima maksimal 120 karakter.";
    }

    if (!normalizedPhone) {
      errors.phoneNumber = "Nomor telepon penerima wajib diisi.";
    } else if (normalizedPhone.length > 30) {
      errors.phoneNumber = "Nomor telepon maksimal 30 karakter.";
    }

    if (normalizedAddress.length < 10) {
      errors.shippingAddress = "Alamat pengiriman minimal 10 karakter.";
    } else if (normalizedAddress.length > 1000) {
      errors.shippingAddress = "Alamat pengiriman maksimal 1000 karakter.";
    }

    if (!paymentMethod) {
      errors.general = "Pilih metode pembayaran.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setReceiverName(normalizedName);
    setPhoneNumber(normalizedPhone);
    setShippingAddress(normalizedAddress);
    setFieldErrors({});
    setStep("review");
  }

  function openFinalConfirmation() {
    setFieldErrors({});
    setConfirmationAccepted(false);
    setIsConfirmationOpen(true);
  }

  function closeFinalConfirmation() {
    if (isSubmitting) return;

    setIsConfirmationOpen(false);
    setFieldErrors((current) => ({ ...current, general: undefined }));
  }

  async function handlePurchase() {
    if (!material || isSubmitting) return;

    if (!confirmationAccepted) {
      setFieldErrors({
        general: "Centang persetujuan transaksi sebelum melanjutkan.",
      });
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});

    try {
      const result = await createMaterialOrder({
        batchCode: material.batchCode,
        weightKg,
        receiverName,
        phoneNumber,
        shippingAddress,
        paymentMethod,
      });

      if (!result.success || !result.data) {
        setFieldErrors({
          general: getMaterialCheckoutErrorMessage(result.error),
        });
        return;
      }

      setOrderResult(result.data);
      setIsConfirmationOpen(false);
      setStep("success");
      router.refresh();
    } catch (error) {
      console.error("[BrandMaterialCheckout] Purchase error:", error);
      setFieldErrors({
        general: "Pesanan material belum dapat dibuat. Silakan coba kembali.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <MaterialCheckoutLoading />;
  }

  if (loadError || !material) {
    return (
      <MaterialCheckoutLoadError
        message={loadError ?? "Data checkout material tidak tersedia."}
        onRetry={loadCheckout}
      />
    );
  }

  if (isCustomer) {
    return (
      <Card className="mx-auto max-w-xl rounded-2xl">
        <CardContent className="p-8 text-center">
          <ShieldAlert className="mx-auto size-10 text-amber-600" />

          <h1 className="mt-4 font-display text-3xl font-medium text-brand-black">
            Khusus Akun Brand Fashion
          </h1>

          <Alert className="mt-5 border-amber-200 bg-amber-50 text-left text-amber-900">
            <AlertTitle>Akses checkout dibatasi</AlertTitle>
            <AlertDescription>
              Pembelian material dari Waste Provider hanya diperuntukkan bagi
              akun Brand Fashion. Akun Customer tetap dapat membeli produk
              sirkular dan mendaftar workshop.
            </AlertDescription>
          </Alert>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button fullWidth render={<Link href="/brand/register" />}>
              Daftar Akun Brand
            </Button>

            <Button
              variant="outline"
              fullWidth
              render={<Link href="/material" />}
            >
              Lihat Katalog Material
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === "success" && orderResult) {
    return <MaterialCheckoutSuccess result={orderResult} />;
  }

  return (
    <div className="space-y-6">
      <BackLink
        href={`/material/${material.batchCode}`}
        label="Kembali ke Detail Material"
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
        <Card className="rounded-2xl">
          <CardContent className="p-6 sm:p-8">
            {step === "form" ? (
              <MaterialCheckoutForm
                material={material}
                weightKg={weightKg}
                receiverName={receiverName}
                phoneNumber={phoneNumber}
                shippingAddress={shippingAddress}
                paymentMethod={paymentMethod}
                fieldErrors={fieldErrors}
                onWeightChange={handleWeightChange}
                onReceiverNameChange={(value) => {
                  setReceiverName(value);
                  clearFieldError("receiverName");
                }}
                onPhoneNumberChange={(value) => {
                  setPhoneNumber(value);
                  clearFieldError("phoneNumber");
                }}
                onShippingAddressChange={(value) => {
                  setShippingAddress(value);
                  clearFieldError("shippingAddress");
                }}
                onPaymentMethodChange={(value) => {
                  setPaymentMethod(value);
                  clearFieldError("general");
                }}
                onReview={handleReview}
              />
            ) : (
              <MaterialCheckoutReview
                material={material}
                weightKg={weightKg}
                receiverName={receiverName}
                phoneNumber={phoneNumber}
                shippingAddress={shippingAddress}
                paymentMethod={paymentMethod}
                errorMessage={fieldErrors.general ?? null}
                onBack={() => {
                  setFieldErrors({});
                  setStep("form");
                }}
                onConfirm={openFinalConfirmation}
              />
            )}
          </CardContent>
        </Card>

        <MaterialCheckoutOrderSummary
          material={material}
          weightKg={weightKg}
          paymentMethod={paymentMethod}
        />
      </div>

      <MaterialCheckoutConfirmationDialog
        open={isConfirmationOpen}
        material={material}
        weightKg={weightKg}
        receiverName={receiverName}
        shippingAddress={shippingAddress}
        paymentMethod={paymentMethod}
        confirmationAccepted={confirmationAccepted}
        isSubmitting={isSubmitting}
        errorMessage={fieldErrors.general ?? null}
        onConfirmationChange={setConfirmationAccepted}
        onClose={closeFinalConfirmation}
        onConfirm={() => {
          void handlePurchase();
        }}
      />
    </div>
  );
}

function getMaterialCheckoutErrorMessage(error: unknown): string {
  const code = String(error ?? "");

  if (code.includes("MATERIAL_BATCH_NOT_FOUND")) {
    return "Batch material tidak ditemukan atau sudah tidak tersedia.";
  }

  if (code.includes("INSUFFICIENT_MATERIAL_STOCK")) {
    return "Stok material tidak mencukupi untuk volume yang dipilih.";
  }

  if (code.includes("FAILED_TO_CREATE_MATERIAL_ORDER")) {
    return "Pesanan material belum dapat dibuat. Silakan coba kembali.";
  }

  return code || "Checkout material belum dapat diproses.";
}
