"use client";

import ProductCheckoutForm from "@/components/product/checkout/ProductCheckoutForm";
import ProductCheckoutOrderSummary from "@/components/product/checkout/ProductCheckoutOrderSummary";
import ProductCheckoutReview from "@/components/product/checkout/ProductCheckoutReview";
import {
  ProductCheckoutLoadError,
  ProductCheckoutLoading,
} from "@/components/product/checkout/ProductCheckoutStatus";
import ProductCheckoutSuccess from "@/components/product/checkout/ProductCheckoutSuccess";
import { useCustomerProductCheckout } from "@/hooks/product/useCustomerProductCheckout";

interface CustomerProductCheckoutProps {
  sku: string;
  requestedQuantity: number;
}

export default function CustomerProductCheckout({
  sku,
  requestedQuantity,
}: CustomerProductCheckoutProps) {
  const {
    checkout,
    isLoading,
    isSubmitting,
    loadError,
    submitError,
    step,
    receiverName,
    setReceiverName,
    phoneNumber,
    setPhoneNumber,
    shippingAddress,
    setShippingAddress,
    claimBonus,
    setClaimBonus,
    purchaseResult,
    loadCheckout,
    reviewOrder,
    backToForm,
    purchase,
  } = useCustomerProductCheckout({
    sku,
    requestedQuantity,
  });

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
    <div
      className="
        grid gap-8
        lg:grid-cols-[minmax(0,1fr)_390px]
        lg:items-start
      "
    >
      <section className="rounded-3xl border border-line-trace bg-canvas-pure p-6 sm:p-8">
        {step === "form" ? (
          <ProductCheckoutForm
            checkout={checkout}
            receiverName={receiverName}
            onReceiverNameChange={setReceiverName}
            phoneNumber={phoneNumber}
            onPhoneNumberChange={setPhoneNumber}
            shippingAddress={shippingAddress}
            onShippingAddressChange={setShippingAddress}
            claimBonus={claimBonus}
            onClaimBonusChange={setClaimBonus}
            errorMessage={submitError}
            onReview={reviewOrder}
          />
        ) : (
          <ProductCheckoutReview
            checkout={checkout}
            receiverName={receiverName}
            phoneNumber={phoneNumber}
            shippingAddress={shippingAddress}
            claimBonus={claimBonus}
            isSubmitting={isSubmitting}
            errorMessage={submitError}
            onBack={backToForm}
            onConfirm={() => {
              void purchase();
            }}
          />
        )}
      </section>

      <ProductCheckoutOrderSummary
        checkout={checkout}
        claimBonus={claimBonus}
      />
    </div>
  );
}
