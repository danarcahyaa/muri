import { supabase } from "@/lib/supabaseClient";
import type { BaseResponse } from "@/types/common";
import type { Database } from "@/types/database";
import type {
  CancelCustomerUnpaidQrisOrderResult,
  CustomerOrderLifecycle,
} from "@/types/customerOrderLifecycle";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const CUSTOMER_ORDER_LIFECYCLE_SELECT = `
  id,
  order_status,
  created_at,
  processing_at,
  shipped_at,
  completed_at,
  cancelled_at,
  cancellation_reason,
  tracking_number,
  shipping_note,
  points_earned,
  points_awarded_at,
  impact_carbon_saved_kg,
  impact_water_saved_liters,
  impact_material_saved_grams,
  impacts_awarded_at,
  order_payments (
    payment_method,
    payment_status,
    paid_at,
    submitted_at,
    expires_at,
    refunded_at
  )
` as const;

type CustomerLifecycleQueryRow =
  Database["public"]["Tables"]["orders"]["Row"] & {
    order_payments:
      | {
          payment_method: Database["public"]["Enums"]["order_payment_method"];
          payment_status: Database["public"]["Enums"]["order_payment_status"];
          paid_at: string | null;
          submitted_at: string | null;
          expires_at: string | null;
          refunded_at: string | null;
        }
      | Array<{
          payment_method: Database["public"]["Enums"]["order_payment_method"];
          payment_status: Database["public"]["Enums"]["order_payment_status"];
          paid_at: string | null;
          submitted_at: string | null;
          expires_at: string | null;
          refunded_at: string | null;
        }>
      | null;
  };

type CancelCustomerOrderRpc =
  Database["public"]["Functions"]["cancel_customer_unpaid_qris_order"];
type CancelCustomerOrderRpcArgs = CancelCustomerOrderRpc["Args"];
type CancelCustomerOrderRpcRow = CancelCustomerOrderRpc["Returns"][number];

export async function getCustomerOrderLifecycle(
  orderId: string,
): Promise<BaseResponse<CustomerOrderLifecycle>> {
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

    const { data, error } = await supabase
      .from("orders")
      .select(CUSTOMER_ORDER_LIFECYCLE_SELECT)
      .eq("id", normalizedOrderId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("[getCustomerOrderLifecycle] Query error:", error);
      return {
        success: false,
        error: "ORDER_LIFECYCLE_LOAD_FAILED",
      };
    }

    if (!data) {
      return {
        success: false,
        error: "ORDER_NOT_FOUND",
      };
    }

    return {
      success: true,
      data: mapCustomerOrderLifecycle(data as unknown as CustomerLifecycleQueryRow),
    };
  } catch (error) {
    console.error("[getCustomerOrderLifecycle] Unexpected error:", error);
    return {
      success: false,
      error: "ORDER_LIFECYCLE_LOAD_FAILED",
    };
  }
}

export async function cancelCustomerUnpaidQrisOrder(
  orderId: string,
  reason?: string,
): Promise<BaseResponse<CancelCustomerUnpaidQrisOrderResult>> {
  try {
    const normalizedOrderId = orderId.trim();
    const normalizedReason = reason?.trim() || null;

    if (!UUID_PATTERN.test(normalizedOrderId)) {
      return {
        success: false,
        error: "INVALID_ORDER_ID",
      };
    }

    if (normalizedReason && normalizedReason.length > 1000) {
      return {
        success: false,
        error: "CANCELLATION_REASON_TOO_LONG",
      };
    }

    const rpcArgs: CancelCustomerOrderRpcArgs = {
      p_order_id: normalizedOrderId,
    };

    if (normalizedReason) {
      rpcArgs.p_reason = normalizedReason;
    }

    const { data, error } = await supabase.rpc(
      "cancel_customer_unpaid_qris_order",
      rpcArgs,
    );

    if (error) {
      console.error("[cancelCustomerUnpaidQrisOrder] RPC error:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });

      return {
        success: false,
        error: mapCustomerLifecycleErrorCode(error),
      };
    }

    const result: CancelCustomerOrderRpcRow | undefined = data?.[0];

    if (!result) {
      return {
        success: false,
        error: "CUSTOMER_ORDER_CANCELLATION_FAILED",
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
        isExisting: result.is_existing,
      },
    };
  } catch (error) {
    console.error("[cancelCustomerUnpaidQrisOrder] Unexpected error:", error);
    return {
      success: false,
      error: mapCustomerLifecycleErrorCode(error),
    };
  }
}

export function getCustomerOrderLifecycleErrorMessage(error: unknown): string {
  const code = mapCustomerLifecycleErrorCode(error);

  switch (code) {
    case "UNAUTHENTICATED":
      return "Sesi Anda telah berakhir. Silakan masuk kembali.";
    case "INVALID_ORDER_ID":
      return "ID pesanan tidak valid.";
    case "ORDER_NOT_FOUND":
      return "Pesanan tidak ditemukan atau bukan milik akun Anda.";
    case "PAYMENT_RECORD_NOT_FOUND":
      return "Data pembayaran pesanan tidak ditemukan.";
    case "ORDER_NOT_QRIS":
      return "Pesanan ini tidak menggunakan pembayaran QRIS.";
    case "ORDER_NOT_CUSTOMER_CANCELLABLE":
      return "Pesanan hanya dapat dibatalkan selama QRIS masih menunggu pembayaran.";
    case "CANCELLATION_REASON_TOO_LONG":
      return "Alasan pembatalan maksimal 1.000 karakter.";
    case "CUSTOMER_ORDER_CANCELLATION_FAILED":
      return "Pesanan belum dapat dibatalkan.";
    case "ORDER_LIFECYCLE_LOAD_FAILED":
      return "Status perjalanan pesanan belum dapat dimuat.";
    default:
      return "Permintaan pesanan belum dapat diproses.";
  }
}

function mapCustomerOrderLifecycle(
  row: CustomerLifecycleQueryRow,
): CustomerOrderLifecycle {
  const payment = unwrapSingleRelation(row.order_payments);

  return {
    orderId: row.id,
    orderStatus: row.order_status,
    createdAt: row.created_at,
    processingAt: row.processing_at,
    shippedAt: row.shipped_at,
    completedAt: row.completed_at,
    cancelledAt: row.cancelled_at,
    cancellationReason: normalizeOptionalText(row.cancellation_reason),
    trackingNumber: normalizeOptionalText(row.tracking_number),
    shippingNote: normalizeOptionalText(row.shipping_note),
    pointsEarned: toNonNegativeInteger(row.points_earned),
    pointsAwardedAt: row.points_awarded_at,
    impactCarbonSavedKg: toNonNegativeNumber(row.impact_carbon_saved_kg),
    impactWaterSavedLiters: toNonNegativeNumber(
      row.impact_water_saved_liters,
    ),
    impactMaterialSavedGrams: toNonNegativeNumber(
      row.impact_material_saved_grams,
    ),
    impactsAwardedAt: row.impacts_awarded_at,
    payment: payment
      ? {
          method: payment.payment_method,
          status: payment.payment_status,
          paidAt: payment.paid_at,
          submittedAt: payment.submitted_at,
          expiresAt: payment.expires_at,
          refundedAt: payment.refunded_at,
        }
      : null,
  };
}

function unwrapSingleRelation<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function mapCustomerLifecycleErrorCode(error: unknown): string {
  const text = extractErrorText(error).toUpperCase();
  const codes = [
    "ORDER_NOT_CUSTOMER_CANCELLABLE",
    "CUSTOMER_ORDER_CANCELLATION_FAILED",
    "CANCELLATION_REASON_TOO_LONG",
    "PAYMENT_RECORD_NOT_FOUND",
    "ORDER_LIFECYCLE_LOAD_FAILED",
    "INVALID_ORDER_ID",
    "ORDER_NOT_FOUND",
    "ORDER_NOT_QRIS",
    "UNAUTHENTICATED",
  ] as const;

  return (
    codes.find((code) => text.includes(code)) ??
    "CUSTOMER_ORDER_CANCELLATION_FAILED"
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

function normalizeOptionalText(
  value: string | null | undefined,
): string | null {
  const normalized = value?.trim();
  return normalized || null;
}

function toNonNegativeNumber(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function toNonNegativeInteger(value: unknown): number {
  return Math.floor(toNonNegativeNumber(value));
}
