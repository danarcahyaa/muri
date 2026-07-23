"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getCheckoutPreparationErrorMessage,
  getCustomerCheckoutData,
  getProductPurchaseErrorMessage,
  purchaseCustomerProduct,
} from "@/services/customer";
import type {
  CustomerCheckoutData,
  PurchaseCustomerProductResult,
} from "@/types/customerCheckout";

export type CheckoutStep = "form" | "review" | "success";

interface UseCustomerProductCheckoutOptions {
  sku: string;
  requestedQuantity: number;
}

export function useCustomerProductCheckout({
  sku,
  requestedQuantity,
}: UseCustomerProductCheckoutOptions) {
  const router = useRouter();

  const [checkout, setCheckout] =
    useState<CustomerCheckoutData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [step, setStep] = useState<CheckoutStep>("form");
  const [receiverName, setReceiverName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [claimBonus, setClaimBonus] = useState(false);
  const [purchaseResult, setPurchaseResult] =
    useState<PurchaseCustomerProductResult | null>(null);

  const checkoutPath = `/produk/${encodeURIComponent(
    sku,
  )}/checkout?quantity=${requestedQuantity}`;

  const loadCheckout = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    setSubmitError(null);

    try {
      const result = await getCustomerCheckoutData({
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

        setCheckout(null);
        setLoadError(
          getCheckoutPreparationErrorMessage(result.error),
        );
        return;
      }

      const data = result.data;

      setCheckout(data);
      setReceiverName(data.profile.fullName);
      setPhoneNumber(data.profile.phoneNumber ?? "");
      setShippingAddress(data.profile.shippingAddress ?? "");
      setClaimBonus(false);
      setPurchaseResult(null);
      setStep("form");
    } catch {
      setCheckout(null);
      setLoadError("Data checkout belum dapat dimuat.");
    } finally {
      setIsLoading(false);
    }
  }, [checkoutPath, requestedQuantity, router, sku]);

  useEffect(() => {
    void loadCheckout();
  }, [loadCheckout]);

  function reviewOrder() {
    setSubmitError(null);

    const validation = validateShippingDetails({
      receiverName,
      phoneNumber,
      shippingAddress,
    });

    if (!validation.success) {
      setSubmitError(validation.message);
      return;
    }

    setReceiverName(validation.receiverName);
    setPhoneNumber(validation.phoneNumber);
    setShippingAddress(validation.shippingAddress);
    setStep("review");
  }

  function backToForm() {
    if (isSubmitting) {
      return;
    }

    setSubmitError(null);
    setStep("form");
  }

  async function purchase() {
    if (!checkout || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await purchaseCustomerProduct({
        productId: checkout.product.id,
        quantity: checkout.quantity,
        receiverName,
        phoneNumber,
        shippingAddress,
        claimBonus:
          claimBonus && Boolean(checkout.bonus?.canClaim),
      });

      if (!result.success || !result.data) {
        setSubmitError(
          getProductPurchaseErrorMessage(result.error),
        );
        return;
      }

      setPurchaseResult(result.data);
      setStep("success");
      router.refresh();
    } catch {
      setSubmitError(
        "Pembelian belum dapat diproses. Silakan coba kembali.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
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
  };
}

type ShippingDetails = {
  receiverName: string;
  phoneNumber: string;
  shippingAddress: string;
};

type ShippingValidationResult =
  | ({ success: true } & ShippingDetails)
  | { success: false; message: string };

function validateShippingDetails({
  receiverName,
  phoneNumber,
  shippingAddress,
}: ShippingDetails): ShippingValidationResult {
  const normalizedName = receiverName.trim();
  const normalizedPhone = phoneNumber.trim();
  const normalizedAddress = shippingAddress.trim();

  if (normalizedName.length < 2) {
    return {
      success: false,
      message: "Nama penerima minimal 2 karakter.",
    };
  }

  if (normalizedName.length > 120) {
    return {
      success: false,
      message: "Nama penerima terlalu panjang.",
    };
  }

  if (normalizedPhone.length > 30) {
    return {
      success: false,
      message: "Nomor telepon terlalu panjang.",
    };
  }

  if (normalizedAddress.length < 10) {
    return {
      success: false,
      message: "Alamat pengiriman minimal 10 karakter.",
    };
  }

  if (normalizedAddress.length > 1000) {
    return {
      success: false,
      message: "Alamat pengiriman terlalu panjang.",
    };
  }

  return {
    success: true,
    receiverName: normalizedName,
    phoneNumber: normalizedPhone,
    shippingAddress: normalizedAddress,
  };
}
