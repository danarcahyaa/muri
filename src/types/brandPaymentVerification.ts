import type { Database } from "@/types/database";

export type BrandPaymentVerificationDecision =
  Database["public"]["Enums"]["payment_verification_decision"];

export interface VerifyBrandQrisPaymentInput {
  orderId: string;
  decision: BrandPaymentVerificationDecision;
  note?: string;
}

export interface VerifyBrandQrisPaymentResult {
  orderId: string;
  orderStatus: Database["public"]["Enums"]["order_status"];
  paymentStatus: Database["public"]["Enums"]["order_payment_status"];
  verifiedAt: string | null;
  verifiedBy: string | null;
  stockReleasedAt: string | null;
  isExisting: boolean;
}

export interface BrandPaymentProofSignedUrl {
  proofPath: string;
  signedUrl: string;
  expiresIn: number;
}

export interface BrandQrisVerificationItemProduct {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  priceIdr: number;
  coinsRedeemed: number;
  isBonus: boolean;
}

export interface BrandQrisVerificationQueueItem {
  orderId: string;
  orderStatus: Database["public"]["Enums"]["order_status"];
  receiverName: string;
  phoneNumber: string | null;
  shippingAddress: string;
  totalPriceIdr: number;
  totalCoinsRedeemed: number;
  pointsEarned: number;
  orderCreatedAt: string | null;
  paymentId: string;
  paymentStatus: Database["public"]["Enums"]["order_payment_status"];
  amountIdr: number;
  proofPath: string | null;
  submittedAt: string | null;
  expiresAt: string | null;
  verifiedAt: string | null;
  verificationNote: string | null;
  items: BrandQrisVerificationItemProduct[];
}
