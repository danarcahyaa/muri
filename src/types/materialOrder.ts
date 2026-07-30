export type MaterialOrderStatus =
  | "pending_payment"
  | "paid_waiting_verification"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";

export type MaterialPaymentMethod = "qris" | "bank_transfer";

export interface MaterialOrder {
  id: string;
  orderCode: string;
  batchCode: string;
  batchTitle: string;
  providerName: string;
  brandName: string;
  buyerUserId: string;
  weightKg: number;
  pricePerKg: number;
  totalPriceIdr: number;
  receiverName: string;
  phoneNumber: string;
  shippingAddress: string;
  paymentMethod: MaterialPaymentMethod;
  status: MaterialOrderStatus;
  paymentProofUrl: string | null;
  trackingNumber: string | null;
  shippingNote: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaterialOrderInput {
  batchCode: string;
  weightKg: number;
  receiverName: string;
  phoneNumber: string;
  shippingAddress: string;
  paymentMethod?: MaterialPaymentMethod;
}

export interface UpdateMaterialOrderInput {
  orderId: string;
  status: MaterialOrderStatus;
  trackingNumber?: string;
  shippingNote?: string;
  cancellationReason?: string;
}
