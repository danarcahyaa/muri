import { supabase } from "@/lib/supabaseClient";
import type { BaseResponse } from "@/types/common";
import type { Database } from "@/types/database";
import type {
  AdvanceBrandOrderFulfillmentInput,
  AdvanceBrandOrderFulfillmentResult,
  BrandFulfillmentOrder,
  BrandFulfillmentOrderItem,
  CancelAndRefundBrandOrderInput,
  CancelAndRefundBrandOrderResult,
  CompleteBrandOrderResult,
} from "@/types/brandOrderFulfillment";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type BrandFulfillmentQueueRpc =
  Database["public"]["Functions"]["get_brand_fulfillment_orders"];
type BrandFulfillmentQueueRpcRow = BrandFulfillmentQueueRpc["Returns"][number];

type AdvanceBrandFulfillmentRpc =
  Database["public"]["Functions"]["advance_brand_order_fulfillment"];
type AdvanceBrandFulfillmentRpcArgs = AdvanceBrandFulfillmentRpc["Args"];
type AdvanceBrandFulfillmentRpcRow = AdvanceBrandFulfillmentRpc["Returns"][number];

type CompleteBrandOrderRpc =
  Database["public"]["Functions"]["complete_brand_order"];
type CompleteBrandOrderRpcRow = CompleteBrandOrderRpc["Returns"][number];

type CancelBrandOrderRpc =
  Database["public"]["Functions"]["cancel_and_refund_brand_order"];
type CancelBrandOrderRpcRow = CancelBrandOrderRpc["Returns"][number];

export async function getBrandFulfillmentOrders(
  limit = 100,
): Promise<BaseResponse<BrandFulfillmentOrder[]>> {
  try {
    const normalizedLimit = Math.floor(limit);

    if (
      !Number.isInteger(normalizedLimit) ||
      normalizedLimit < 1 ||
      normalizedLimit > 200
    ) {
      return {
        success: false,
        error: "INVALID_FULFILLMENT_LIMIT",
      };
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "UNAUTHENTICATED",
      };
    }

    const { data, error } = await supabase.rpc(
      "get_brand_fulfillment_orders",
      {
        p_limit: normalizedLimit,
      },
    );

    if (error) {
      console.error("[getBrandFulfillmentOrders] RPC error:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });

      return {
        success: false,
        error: mapBrandFulfillmentErrorCode(error),
      };
    }

    return {
      success: true,
      data: (data ?? []).map(mapBrandFulfillmentOrder),
    };
  } catch (error) {
    console.error("[getBrandFulfillmentOrders] Unexpected error:", error);

    return {
      success: false,
      error: mapBrandFulfillmentErrorCode(error),
    };
  }
}

export async function advanceBrandOrderFulfillment(
  input: AdvanceBrandOrderFulfillmentInput,
): Promise<BaseResponse<AdvanceBrandOrderFulfillmentResult>> {
  try {
    const normalizedOrderId = input.orderId.trim();
    const normalizedTrackingNumber = input.trackingNumber?.trim() || null;
    const normalizedShippingNote = input.shippingNote?.trim() || null;

    if (!UUID_PATTERN.test(normalizedOrderId)) {
      return {
        success: false,
        error: "INVALID_ORDER_ID",
      };
    }

    if (
      input.action !== "start_processing" &&
      input.action !== "mark_shipped"
    ) {
      return {
        success: false,
        error: "INVALID_FULFILLMENT_ACTION",
      };
    }

    if (normalizedTrackingNumber && normalizedTrackingNumber.length > 120) {
      return {
        success: false,
        error: "TRACKING_NUMBER_TOO_LONG",
      };
    }

    if (normalizedShippingNote && normalizedShippingNote.length > 1000) {
      return {
        success: false,
        error: "SHIPPING_NOTE_TOO_LONG",
      };
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "UNAUTHENTICATED",
      };
    }

    const rpcArgs: AdvanceBrandFulfillmentRpcArgs = {
      p_order_id: normalizedOrderId,
      p_action: input.action,
    };

    if (normalizedTrackingNumber) {
      rpcArgs.p_tracking_number = normalizedTrackingNumber;
    }

    if (normalizedShippingNote) {
      rpcArgs.p_shipping_note = normalizedShippingNote;
    }

    const { data, error } = await supabase.rpc(
      "advance_brand_order_fulfillment",
      rpcArgs,
    );

    if (error) {
      console.error("[advanceBrandOrderFulfillment] RPC error:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });

      return {
        success: false,
        error: mapBrandFulfillmentErrorCode(error),
      };
    }

    const result: AdvanceBrandFulfillmentRpcRow | undefined = data?.[0];

    if (!result) {
      return {
        success: false,
        error: "FULFILLMENT_UPDATE_FAILED",
      };
    }

    return {
      success: true,
      data: {
        orderId: result.order_id,
        orderStatus: result.order_status,
        processingAt: result.processing_at,
        shippedAt: result.shipped_at,
        processingBy: result.processing_by,
        shippedBy: result.shipped_by,
        trackingNumber: normalizeOptionalText(result.tracking_number),
        shippingNote: normalizeOptionalText(result.shipping_note),
        updatedAt: result.updated_at,
        isExisting: result.is_existing,
      },
    };
  } catch (error) {
    console.error("[advanceBrandOrderFulfillment] Unexpected error:", error);

    return {
      success: false,
      error: mapBrandFulfillmentErrorCode(error),
    };
  }
}

export async function completeBrandOrder(
  orderId: string,
): Promise<BaseResponse<CompleteBrandOrderResult>> {
  try {
    const normalizedOrderId = orderId.trim();

    if (!UUID_PATTERN.test(normalizedOrderId)) {
      return {
        success: false,
        error: "INVALID_ORDER_ID",
      };
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "UNAUTHENTICATED",
      };
    }

    const { data, error } = await supabase.rpc("complete_brand_order", {
      p_order_id: normalizedOrderId,
    });

    if (error) {
      console.error("[completeBrandOrder] RPC error:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });

      return {
        success: false,
        error: mapBrandFulfillmentErrorCode(error),
      };
    }

    const result: CompleteBrandOrderRpcRow | undefined = data?.[0];

    if (!result) {
      return {
        success: false,
        error: "ORDER_COMPLETION_FAILED",
      };
    }

    return {
      success: true,
      data: {
        orderId: result.order_id,
        orderStatus: result.order_status,
        completedAt: result.completed_at,
        completedBy: result.completed_by,
        pointsEarned: toNonNegativeInteger(result.points_earned),
        pointsAwardedAt: result.points_awarded_at,
        customerTotalPoints: toNonNegativeInteger(result.customer_total_points),
        impactCarbonSavedKg: toNonNegativeNumber(
          result.impact_carbon_saved_kg,
        ),
        impactWaterSavedLiters: toNonNegativeNumber(
          result.impact_water_saved_liters,
        ),
        impactMaterialSavedGrams: toNonNegativeNumber(
          result.impact_material_saved_grams,
        ),
        impactsAwardedAt: result.impacts_awarded_at,
        isExisting: result.is_existing,
      },
    };
  } catch (error) {
    console.error("[completeBrandOrder] Unexpected error:", error);

    return {
      success: false,
      error: mapBrandFulfillmentErrorCode(error),
    };
  }
}

export async function cancelAndRefundBrandOrder(
  input: CancelAndRefundBrandOrderInput,
): Promise<BaseResponse<CancelAndRefundBrandOrderResult>> {
  try {
    const normalizedOrderId = input.orderId.trim();
    const normalizedReason = input.reason.trim();

    if (!UUID_PATTERN.test(normalizedOrderId)) {
      return {
        success: false,
        error: "INVALID_ORDER_ID",
      };
    }

    if (normalizedReason.length < 5) {
      return {
        success: false,
        error: "CANCELLATION_REASON_REQUIRED",
      };
    }

    if (normalizedReason.length > 1000) {
      return {
        success: false,
        error: "CANCELLATION_REASON_TOO_LONG",
      };
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "UNAUTHENTICATED",
      };
    }

    const { data, error } = await supabase.rpc(
      "cancel_and_refund_brand_order",
      {
        p_order_id: normalizedOrderId,
        p_reason: normalizedReason,
      },
    );

    if (error) {
      console.error("[cancelAndRefundBrandOrder] RPC error:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });

      return {
        success: false,
        error: mapBrandFulfillmentErrorCode(error),
      };
    }

    const result: CancelBrandOrderRpcRow | undefined = data?.[0];

    if (!result) {
      return {
        success: false,
        error: "ORDER_CANCELLATION_FAILED",
      };
    }

    return {
      success: true,
      data: {
        orderId: result.order_id,
        orderStatus: result.order_status,
        paymentStatus: result.payment_status,
        cancelledAt: result.cancelled_at,
        cancellationReason: normalizeOptionalText(result.cancellation_reason),
        stockReleasedAt: result.stock_released_at,
        coinRefundedAt: result.coin_refunded_at,
        coinsRefunded: toNonNegativeInteger(result.coins_refunded),
        customerTotalPoints: toNonNegativeInteger(result.customer_total_points),
        isExisting: result.is_existing,
      },
    };
  } catch (error) {
    console.error("[cancelAndRefundBrandOrder] Unexpected error:", error);

    return {
      success: false,
      error: mapBrandFulfillmentErrorCode(error),
    };
  }
}

export function getBrandFulfillmentErrorMessage(error: unknown): string {
  const code = mapBrandFulfillmentErrorCode(error);

  switch (code) {
    case "UNAUTHENTICATED":
      return "Sesi Anda telah berakhir. Silakan masuk kembali.";
    case "INVALID_ORDER_ID":
      return "ID pesanan tidak valid.";
    case "ORDER_NOT_FOUND":
      return "Pesanan tidak ditemukan atau bukan milik brand Anda.";
    case "PAYMENT_RECORD_NOT_FOUND":
      return "Data pembayaran pesanan tidak ditemukan.";
    case "PAYMENT_NOT_PAID":
      return "Pesanan belum memiliki pembayaran yang berhasil.";
    case "ORDER_STOCK_ALREADY_RELEASED":
      return "Stok pesanan sudah dikembalikan sehingga pesanan tidak dapat diproses.";
    case "ORDER_NOT_FULFILLABLE":
      return "Pesanan ini sudah tidak dapat diproses.";
    case "INVALID_FULFILLMENT_TRANSITION":
      return "Perubahan status fulfillment tidak diizinkan.";
    case "INVALID_FULFILLMENT_ACTION":
      return "Aksi fulfillment tidak valid.";
    case "TRACKING_NUMBER_TOO_LONG":
      return "Nomor resi maksimal 120 karakter.";
    case "SHIPPING_NOTE_TOO_LONG":
      return "Catatan pengiriman maksimal 1.000 karakter.";
    case "INVALID_FULFILLMENT_LIMIT":
      return "Jumlah daftar pesanan tidak valid.";
    case "ORDER_NOT_COMPLETABLE":
      return "Pesanan harus berstatus dikirim sebelum dapat diselesaikan.";
    case "ORDER_REWARD_STATE_INVALID":
      return "Status bonus coin pesanan tidak konsisten.";
    case "CUSTOMER_PROFILE_NOT_FOUND":
      return "Profil customer tidak ditemukan.";
    case "ORDER_COMPLETION_FAILED":
      return "Pesanan belum dapat diselesaikan.";
    case "ORDER_NOT_CANCELLABLE":
      return "Pesanan yang sudah dikirim, selesai, atau ditolak tidak dapat dibatalkan dari halaman ini.";
    case "ORDER_COMPLETION_STATE_INVALID":
      return "Pesanan sudah memiliki data penyelesaian dan tidak aman untuk dibatalkan.";
    case "CANCELLATION_REASON_REQUIRED":
      return "Alasan pembatalan minimal 5 karakter.";
    case "CANCELLATION_REASON_TOO_LONG":
      return "Alasan pembatalan maksimal 1.000 karakter.";
    case "MULTI_BRAND_ORDER_UNSUPPORTED":
      return "Pesanan multi-brand belum didukung oleh fulfillment saat ini.";
    case "ORDER_MAIN_PRODUCT_NOT_FOUND":
      return "Produk utama pesanan tidak ditemukan.";
    case "ORDER_ITEMS_NOT_FOUND":
      return "Item pesanan tidak ditemukan.";
    case "ORDER_CANCELLATION_FAILED":
      return "Pesanan belum dapat dibatalkan atau direfund.";
    case "FULFILLMENT_UPDATE_FAILED":
      return "Status pesanan belum dapat diperbarui.";
    default:
      return "Fulfillment pesanan belum dapat diproses.";
  }
}

function mapBrandFulfillmentOrder(
  row: BrandFulfillmentQueueRpcRow,
): BrandFulfillmentOrder {
  return {
    orderId: row.order_id,
    orderStatus: row.order_status,
    receiverName: row.receiver_name,
    phoneNumber: normalizeOptionalText(row.phone_number),
    shippingAddress: row.shipping_address,
    totalPriceIdr: toNonNegativeNumber(row.total_price_idr),
    totalCoinsRedeemed: toNonNegativeInteger(row.total_coins_redeemed),
    pointsEarned: toNonNegativeInteger(row.points_earned),
    orderCreatedAt: row.order_created_at,
    processingAt: row.processing_at,
    shippedAt: row.shipped_at,
    completedAt: row.completed_at,
    cancelledAt: row.cancelled_at,
    cancellationReason: normalizeOptionalText(row.cancellation_reason),
    pointsAwardedAt: row.points_awarded_at,
    trackingNumber: normalizeOptionalText(row.tracking_number),
    shippingNote: normalizeOptionalText(row.shipping_note),
    impactCarbonSavedKg: toNonNegativeNumber(row.impact_carbon_saved_kg),
    impactWaterSavedLiters: toNonNegativeNumber(
      row.impact_water_saved_liters,
    ),
    impactMaterialSavedGrams: toNonNegativeNumber(
      row.impact_material_saved_grams,
    ),
    impactsAwardedAt: row.impacts_awarded_at,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    amountIdr: toNonNegativeNumber(row.amount_idr),
    amountCoin: toNonNegativeInteger(row.amount_coin),
    paidAt: row.paid_at,
    refundedAt: row.refunded_at,
    items: mapBrandFulfillmentItems(row.items),
  };
}

function mapBrandFulfillmentItems(
  value: BrandFulfillmentQueueRpcRow["items"],
): BrandFulfillmentOrderItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      return [];
    }

    const record = item as Record<string, unknown>;
    const id = normalizeRequiredText(record.id);
    const productId = normalizeRequiredText(record.product_id);
    const productName = normalizeRequiredText(record.product_name);

    if (!id || !productId || !productName) {
      return [];
    }

    return [
      {
        id,
        productId,
        productName,
        quantity: toNonNegativeInteger(record.quantity),
        priceIdr: toNonNegativeNumber(record.price_idr),
        coinsRedeemed: toNonNegativeInteger(record.coins_redeemed),
        isBonus: record.is_bonus === true,
      },
    ];
  });
}

function mapBrandFulfillmentErrorCode(error: unknown): string {
  const text = extractErrorText(error).toUpperCase();

  const codes = [
    "INVALID_FULFILLMENT_TRANSITION",
    "INVALID_FULFILLMENT_ACTION",
    "INVALID_FULFILLMENT_LIMIT",
    "ORDER_STOCK_ALREADY_RELEASED",
    "ORDER_COMPLETION_STATE_INVALID",
    "ORDER_REWARD_STATE_INVALID",
    "CUSTOMER_PROFILE_NOT_FOUND",
    "ORDER_COMPLETION_FAILED",
    "ORDER_CANCELLATION_FAILED",
    "ORDER_NOT_COMPLETABLE",
    "ORDER_NOT_CANCELLABLE",
    "CANCELLATION_REASON_REQUIRED",
    "CANCELLATION_REASON_TOO_LONG",
    "MULTI_BRAND_ORDER_UNSUPPORTED",
    "ORDER_MAIN_PRODUCT_NOT_FOUND",
    "ORDER_ITEMS_NOT_FOUND",
    "TRACKING_NUMBER_TOO_LONG",
    "SHIPPING_NOTE_TOO_LONG",
    "PAYMENT_RECORD_NOT_FOUND",
    "FULFILLMENT_UPDATE_FAILED",
    "ORDER_NOT_FULFILLABLE",
    "PAYMENT_NOT_PAID",
    "INVALID_ORDER_ID",
    "ORDER_NOT_FOUND",
    "UNAUTHENTICATED",
  ] as const;

  return (
    codes.find((code) => text.includes(code)) ?? "FULFILLMENT_UPDATE_FAILED"
  );
}

function extractErrorText(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const record = error as Record<string, unknown>;

    return [record.code, record.message, record.details, record.hint]
      .filter((value): value is string => typeof value === "string")
      .join(" ");
  }

  return "";
}

function normalizeRequiredText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeOptionalText(
  value: string | null | undefined,
): string | null {
  const normalized = value?.trim();
  return normalized || null;
}

function toNonNegativeNumber(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, parsed);
}

function toNonNegativeInteger(value: unknown): number {
  return Math.floor(toNonNegativeNumber(value));
}
