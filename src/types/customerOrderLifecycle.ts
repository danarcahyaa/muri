import type { Database } from "@/types/database";

export interface CustomerOrderLifecyclePayment {
  method: Database["public"]["Enums"]["order_payment_method"];
  status: Database["public"]["Enums"]["order_payment_status"];
  paidAt: string | null;
  submittedAt: string | null;
  expiresAt: string | null;
  refundedAt: string | null;
}

export interface CustomerOrderLifecycle {
  orderId: string;
  orderStatus: Database["public"]["Enums"]["order_status"];
  createdAt: string | null;
  processingAt: string | null;
  shippedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  trackingNumber: string | null;
  shippingNote: string | null;
  pointsEarned: number;
  pointsAwardedAt: string | null;
  impactCarbonSavedKg: number;
  impactWaterSavedLiters: number;
  impactMaterialSavedGrams: number;
  impactsAwardedAt: string | null;
  payment: CustomerOrderLifecyclePayment | null;
}

export interface CancelCustomerUnpaidQrisOrderResult {
  orderId: string;
  orderStatus: Database["public"]["Enums"]["order_status"];
  paymentStatus: Database["public"]["Enums"]["order_payment_status"];
  cancelledAt: string | null;
  cancellationReason: string | null;
  stockReleasedAt: string | null;
  isExisting: boolean;
}
