import { supabase } from "@/lib/supabaseClient";
import type { BaseResponse } from "@/types/common";
import type {
  CreateMaterialOrderInput,
  MaterialOrder,
  MaterialOrderStatus,
  UpdateMaterialOrderInput,
} from "@/types/materialOrder";
import { getMaterialBatchByCode } from "./materialService";

const STORAGE_KEY = "muri_brand_material_orders_v1";

export function getStoredMaterialOrders(): MaterialOrder[] {
  if (typeof window === "undefined") return getInitialMockOrders();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialMockOrders();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw) as MaterialOrder[];
  } catch {
    return getInitialMockOrders();
  }
}

function saveStoredMaterialOrders(orders: MaterialOrder[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch (error) {
    console.error("Failed to save material orders to localStorage:", error);
  }
}

function getInitialMockOrders(): MaterialOrder[] {
  return [
    {
      id: "mat-ord-001",
      orderCode: "MAT-884F2A1C",
      batchCode: "BATCH-DENIM-001",
      batchTitle: "Sisa Kain Katun Denim Premium 14oz",
      providerName: "PT Tekstil Jaya Limbah",
      brandName: "Memuai Sustainable Fashion",
      buyerUserId: "brand-user-demo",
      weightKg: 50,
      pricePerKg: 25000,
      totalPriceIdr: 1250000,
      receiverName: "Brand Memuai Sourcing Team",
      phoneNumber: "081234567890",
      shippingAddress: "Jl. Industri Kreatif No. 12, Bandung Jawa Barat 40123",
      paymentMethod: "qris",
      status: "processing",
      paymentProofUrl: "https://images.unsplash.com/photo-1556742049-0a670f4a4591?w=800",
      trackingNumber: "JNE-MAT-9921441",
      shippingNote: "Paket material dikemas karung terpal waterproof.",
      cancellationReason: null,
      createdAt: "2026-07-28T09:30:00Z",
      updatedAt: "2026-07-29T11:00:00Z",
    },
    {
      id: "mat-ord-002",
      orderCode: "MAT-19C4E0B2",
      batchCode: "BATCH-LINEN-002",
      batchTitle: "Limbah Perca Linen Organik Natural",
      providerName: "CV Sirkular Kain Nusantara",
      brandName: "Memuai Sustainable Fashion",
      buyerUserId: "brand-user-demo",
      weightKg: 30,
      pricePerKg: 35000,
      totalPriceIdr: 1050000,
      receiverName: "Brand Memuai Sourcing Team",
      phoneNumber: "081234567890",
      shippingAddress: "Jl. Industri Kreatif No. 12, Bandung Jawa Barat 40123",
      paymentMethod: "qris",
      status: "completed",
      paymentProofUrl: "https://images.unsplash.com/photo-1556742049-0a670f4a4591?w=800",
      trackingNumber: "SICEPAT-8819203",
      shippingNote: "Sudah diterima di gudang Bandung.",
      cancellationReason: null,
      createdAt: "2026-07-20T14:15:00Z",
      updatedAt: "2026-07-22T16:00:00Z",
    },
  ];
}

export async function createMaterialOrder(
  input: CreateMaterialOrderInput,
): Promise<BaseResponse<MaterialOrder>> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const batchRes = await getMaterialBatchByCode(input.batchCode);
    if (!batchRes.success || !batchRes.data) {
      return {
        success: false,
        error: "MATERIAL_BATCH_NOT_FOUND",
      };
    }

    const batch = batchRes.data;
    const weightKg = Math.max(batch.minimumOrderKg, input.weightKg);

    if (weightKg > batch.availableWeightKg) {
      return {
        success: false,
        error: "INSUFFICIENT_MATERIAL_STOCK",
      };
    }

    const totalPriceIdr = weightKg * batch.pricePerKg;
    const randomHex = Math.random().toString(16).substring(2, 10).toUpperCase();
    const orderCode = `MAT-${randomHex}`;
    const orderId = `mat-ord-${Date.now()}`;

    const newOrder: MaterialOrder = {
      id: orderId,
      orderCode,
      batchCode: batch.batchCode,
      batchTitle: batch.title,
      providerName: batch.providerName,
      brandName: user?.user_metadata?.full_name || "Brand Account",
      buyerUserId: user?.id || "brand-user-guest",
      weightKg,
      pricePerKg: batch.pricePerKg,
      totalPriceIdr,
      receiverName: input.receiverName.trim(),
      phoneNumber: input.phoneNumber.trim(),
      shippingAddress: input.shippingAddress.trim(),
      paymentMethod: input.paymentMethod || "qris",
      status: "pending_payment",
      paymentProofUrl: null,
      trackingNumber: null,
      shippingNote: null,
      cancellationReason: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const currentOrders = getStoredMaterialOrders();
    const updatedOrders = [newOrder, ...currentOrders];
    saveStoredMaterialOrders(updatedOrders);

    return {
      success: true,
      data: newOrder,
    };
  } catch (error) {
    console.error("[createMaterialOrder] Error:", error);
    return {
      success: false,
      error: "FAILED_TO_CREATE_MATERIAL_ORDER",
    };
  }
}

export async function getBrandMaterialOrders(): Promise<
  BaseResponse<MaterialOrder[]>
> {
  try {
    const orders = getStoredMaterialOrders();
    return {
      success: true,
      data: orders,
    };
  } catch (error) {
    console.error("[getBrandMaterialOrders] Error:", error);
    return {
      success: false,
      error: "FAILED_TO_FETCH_MATERIAL_ORDERS",
    };
  }
}

export async function getMaterialOrderById(
  orderId: string,
): Promise<BaseResponse<MaterialOrder>> {
  try {
    const orders = getStoredMaterialOrders();
    const found = orders.find(
      (o) => o.id === orderId || o.orderCode === orderId,
    );

    if (!found) {
      return {
        success: false,
        error: "ORDER_NOT_FOUND",
      };
    }

    return {
      success: true,
      data: found,
    };
  } catch (error) {
    console.error("[getMaterialOrderById] Error:", error);
    return {
      success: false,
      error: "FAILED_TO_FETCH_MATERIAL_ORDER",
    };
  }
}

export async function uploadMaterialPaymentProof(
  orderId: string,
  proofUrl: string,
): Promise<BaseResponse<MaterialOrder>> {
  try {
    const orders = getStoredMaterialOrders();
    const index = orders.findIndex((o) => o.id === orderId);

    if (index === -1) {
      return {
        success: false,
        error: "ORDER_NOT_FOUND",
      };
    }

    const updated: MaterialOrder = {
      ...orders[index],
      paymentProofUrl: proofUrl,
      status: "paid_waiting_verification",
      updatedAt: new Date().toISOString(),
    };

    orders[index] = updated;
    saveStoredMaterialOrders(orders);

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    console.error("[uploadMaterialPaymentProof] Error:", error);
    return {
      success: false,
      error: "FAILED_TO_UPLOAD_PAYMENT_PROOF",
    };
  }
}

export async function updateMaterialOrderStatus(
  input: UpdateMaterialOrderInput,
): Promise<BaseResponse<MaterialOrder>> {
  try {
    const orders = getStoredMaterialOrders();
    const index = orders.findIndex((o) => o.id === input.orderId);

    if (index === -1) {
      return {
        success: false,
        error: "ORDER_NOT_FOUND",
      };
    }

    const updated: MaterialOrder = {
      ...orders[index],
      status: input.status,
      trackingNumber: input.trackingNumber ?? orders[index].trackingNumber,
      shippingNote: input.shippingNote ?? orders[index].shippingNote,
      cancellationReason:
        input.cancellationReason ?? orders[index].cancellationReason,
      updatedAt: new Date().toISOString(),
    };

    orders[index] = updated;
    saveStoredMaterialOrders(orders);

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    console.error("[updateMaterialOrderStatus] Error:", error);
    return {
      success: false,
      error: "FAILED_TO_UPDATE_MATERIAL_ORDER",
    };
  }
}
