"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { BackLink } from "@/components/ui/BackLink";
import { Card, CardContent } from "@/components/ui/Card";
import {
  createCustomerCheckoutOrder,
  getCustomerCheckoutPreview,
  getSecureCheckoutErrorMessage,
} from "@/services/customer";
import type {
  CreateCustomerCheckoutOrderResult,
  CustomerCheckoutPaymentMethod,
  CustomerCheckoutPreview,
} from "@/types/customerCheckout";

import { ProductCheckoutConfirmationModal } from "./checkout/ProductCheckoutConfirmationModal";
import ProductCheckoutForm from "./checkout/ProductCheckoutForm";
import ProductCheckoutOrderSummary from "./checkout/ProductCheckoutOrderSummary";
import ProductCheckoutReview from "./checkout/ProductCheckoutReview";
import {
  ProductCheckoutLoading,
  ProductCheckoutLoadError,
} from "./checkout/ProductCheckoutStatus";
import ProductCheckoutSuccess from "./checkout/ProductCheckoutSuccess";

interface CustomerProductCheckoutProps {
  sku: string;
  requestedQuantity: number;
}

type CheckoutStep = "form" | "review" | "success";

export default function CustomerProductCheckout({
  sku,
  requestedQuantity,
}: CustomerProductCheckoutProps) {
  const router = useRouter();
  const checkoutTokenRef = useRef<string | null>(null);

  const [checkout, setCheckout] = useState<CustomerCheckoutPreview | null>(null);
  const [step, setStep] = useState<CheckoutStep>("form");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<CustomerCheckoutPaymentMethod | null>(null);
  const [receiverName, setReceiverName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [confirmationAccepted, setConfirmationAccepted] = useState(false);
  const [purchaseResult, setPurchaseResult] =
    useState<CreateCustomerCheckoutOrderResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const checkoutPath = `/produk/${encodeURIComponent(
    sku,
  )}/checkout?quantity=${requestedQuantity}`;

  const loadCheckout = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    setFormError(null);

    const result = await getCustomerCheckoutPreview({
      sku,
      quantity: requestedQuantity,
    });

    if (!result.success || !result.data) {
      const errorCode = String(result.error ?? "");

      if (errorCode.includes("UNAUTHENTICATED")) {
        router.replace(
          `/auth/login?redirect=${encodeURIComponent(checkoutPath)}`,
        );
        return;
      }

      setLoadError(getSecureCheckoutErrorMessage(result.error));
      setIsLoading(false);
      return;
    }

    const data = result.data;

    setCheckout(data);
    setReceiverName(data.profile.fullName);
    setPhoneNumber(data.profile.phoneNumber ?? "");
    setShippingAddress(data.profile.shippingAddress ?? "");
    setSelectedPaymentMethod(data.availablePaymentMethods[0] ?? null);
    setStep("form");
    setIsLoading(false);
  }, [checkoutPath, requestedQuantity, router, sku]);

  useEffect(() => {
    void loadCheckout();
  }, [loadCheckout]);

  function handleReview() {
    setFormError(null);

    const normalizedName = receiverName.trim();
    const normalizedPhone = phoneNumber.trim();
    const normalizedAddress = shippingAddress.trim();

    if (normalizedName.length < 2) {
      setFormError("Nama penerima minimal 2 karakter.");
      return;
    }

    if (normalizedName.length > 120) {
      setFormError("Nama penerima terlalu panjang.");
      return;
    }

    if (normalizedPhone.length > 30) {
      setFormError("Nomor telepon terlalu panjang.");
      return;
    }

    if (normalizedAddress.length < 10) {
      setFormError("Alamat pengiriman minimal 10 karakter.");
      return;
    }

    if (normalizedAddress.length > 1000) {
      setFormError("Alamat pengiriman terlalu panjang.");
      return;
    }

    if (!selectedPaymentMethod) {
      setFormError("Pilih metode pembayaran.");
      return;
    }

    if (selectedPaymentMethod === "coin" && !checkout?.hasEnoughCoinBalance) {
      setFormError("Saldo coin Anda tidak mencukupi.");
      return;
    }

    if (
      checkout?.reward?.productBonus &&
      !checkout.reward.productBonus.hasEnoughStock
    ) {
      setFormError("Stok produk bonus tidak mencukupi.");
      return;
    }

    setReceiverName(normalizedName);
    setPhoneNumber(normalizedPhone);
    setShippingAddress(normalizedAddress);
    setStep("review");
  }

  function openFinalConfirmation() {
    setFormError(null);
    setConfirmationAccepted(false);
    setIsConfirmationOpen(true);
  }

  function closeFinalConfirmation() {
    if (isSubmitting) return;

    setIsConfirmationOpen(false);
    setFormError(null);
  }

  async function handlePurchase() {
    if (!checkout || !selectedPaymentMethod || isSubmitting) return;

    if (!confirmationAccepted) {
      setFormError("Centang persetujuan transaksi sebelum melanjutkan.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const checkoutToken =
        checkoutTokenRef.current ?? globalThis.crypto.randomUUID();
      checkoutTokenRef.current = checkoutToken;

      const result = await createCustomerCheckoutOrder({
        productId: checkout.product.id,
        quantity: checkout.quantity,
        receiverName,
        phoneNumber,
        shippingAddress,
        paymentMethod: selectedPaymentMethod,
        checkoutToken,
        confirmationAccepted: true,
      });

      if (!result.success || !result.data) {
        setFormError(getSecureCheckoutErrorMessage(result.error));
        return;
      }

      setPurchaseResult(result.data);
      setIsConfirmationOpen(false);
      setStep("success");
      router.refresh();
    } catch (error) {
      console.error("[CustomerProductCheckout] Purchase error:", error);
      setFormError("Checkout belum dapat diproses. Silakan coba kembali.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <ProductCheckoutLoading />;
  }

  if (loadError || !checkout) {
    return (
      <ProductCheckoutLoadError
        message={loadError ?? "Data checkout tidak tersedia."}
        onRetry={loadCheckout}
      />
    );
  }

  if (step === "success" && purchaseResult) {
    return <ProductCheckoutSuccess result={purchaseResult} />;
  }

  return (
    <div className="space-y-6">
      <BackLink
        href={`/produk/${checkout.product.slug}`}
        label="Kembali ke Detail Produk"
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
        <Card className="rounded-2xl">
          <CardContent className="p-6 sm:p-8">
            {step === "form" ? (
              <ProductCheckoutForm
                checkout={checkout}
                receiverName={receiverName}
                onReceiverNameChange={setReceiverName}
                phoneNumber={phoneNumber}
                onPhoneNumberChange={setPhoneNumber}
                shippingAddress={shippingAddress}
                onShippingAddressChange={setShippingAddress}
                selectedPaymentMethod={selectedPaymentMethod}
                onPaymentMethodChange={setSelectedPaymentMethod}
                errorMessage={formError}
                onReview={handleReview}
              />
            ) : (
              <ProductCheckoutReview
                checkout={checkout}
                receiverName={receiverName}
                phoneNumber={phoneNumber}
                shippingAddress={shippingAddress}
                paymentMethod={selectedPaymentMethod}
                errorMessage={formError}
                onBack={() => {
                  setFormError(null);
                  setStep("form");
                }}
                onConfirm={openFinalConfirmation}
              />
            )}
          </CardContent>
        </Card>

        <ProductCheckoutOrderSummary
          checkout={checkout}
          paymentMethod={selectedPaymentMethod}
        />
      </div>

      <ProductCheckoutConfirmationModal
        open={isConfirmationOpen}
        checkout={checkout}
        receiverName={receiverName}
        shippingAddress={shippingAddress}
        paymentMethod={selectedPaymentMethod}
        confirmationAccepted={confirmationAccepted}
        isSubmitting={isSubmitting}
        errorMessage={formError}
        onConfirmationChange={setConfirmationAccepted}
        onClose={closeFinalConfirmation}
        onConfirm={() => {
          void handlePurchase();
        }}
      />
    </div>
  );
}
