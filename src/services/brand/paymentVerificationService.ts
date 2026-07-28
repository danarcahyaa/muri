import { supabase } from "@/lib/supabaseClient";
import type { BaseResponse } from "@/types/common";
import type { Database } from "@/types/database";
import type {
  BrandPaymentProofSignedUrl,
  BrandQrisVerificationItemProduct,
  BrandQrisVerificationQueueItem,
  VerifyBrandQrisPaymentInput,
  VerifyBrandQrisPaymentResult,
} from "@/types/brandPaymentVerification";

const PAYMENT_PROOF_BUCKET = "payment-proofs";

const DEFAULT_SIGNED_URL_EXPIRY = 5 * 60;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type VerifyBrandQrisPaymentRpc =
  Database["public"]["Functions"]["verify_brand_qris_payment"];

type VerifyBrandQrisPaymentRpcArgs =
  VerifyBrandQrisPaymentRpc["Args"];

type VerifyBrandQrisPaymentRpcRow =
  VerifyBrandQrisPaymentRpc["Returns"][number];

type BrandQrisQueueRpc =
  Database["public"]["Functions"]["get_brand_qris_verification_queue"];

type BrandQrisQueueRpcRow = BrandQrisQueueRpc["Returns"][number];

/**
 * Menghasilkan signed URL sementara untuk
 * melihat bukti pembayaran private.
 *
 * Storage RLS memastikan hanya customer pemilik
 * atau brand pemilik order yang dapat membukanya.
 */
export async function getBrandPaymentProofSignedUrl(
  proofPath: string,
  expiresIn: number = DEFAULT_SIGNED_URL_EXPIRY,
): Promise<BaseResponse<BrandPaymentProofSignedUrl>> {
  try {
    const normalizedProofPath = proofPath.trim();

    if (!normalizedProofPath) {
      return {
        success: false,
        error: "INVALID_PROOF_PATH",
      };
    }

    if (normalizedProofPath.length > 512) {
      return {
        success: false,
        error: "PROOF_PATH_TOO_LONG",
      };
    }

    const normalizedExpiry = Math.floor(expiresIn);

    if (
      !Number.isInteger(normalizedExpiry) ||
      normalizedExpiry < 60 ||
      normalizedExpiry > 3600
    ) {
      return {
        success: false,
        error: "INVALID_SIGNED_URL_EXPIRY",
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

    const { data, error } = await supabase.storage
      .from(PAYMENT_PROOF_BUCKET)
      .createSignedUrl(normalizedProofPath, normalizedExpiry);

    if (error) {
      console.error("[getBrandPaymentProofSignedUrl] Storage error:", {
        name: error.name,
        message: error.message,
      });

      return {
        success: false,
        error: mapBrandVerificationErrorCode(error),
      };
    }

    if (!data?.signedUrl) {
      return {
        success: false,
        error: "SIGNED_URL_CREATION_FAILED",
      };
    }

    return {
      success: true,
      data: {
        proofPath: normalizedProofPath,

        signedUrl: data.signedUrl,

        expiresIn: normalizedExpiry,
      },
    };
  } catch (error) {
    console.error("[getBrandPaymentProofSignedUrl] Unexpected error:", error);

    return {
      success: false,
      error: mapBrandVerificationErrorCode(error),
    };
  }
}

/**
 * Mengambil pembayaran QRIS milik brand
 * yang sedang menunggu verifikasi.
 */
export async function getBrandQrisVerificationQueue(
  limit = 50,
): Promise<BaseResponse<BrandQrisVerificationQueueItem[]>> {
  try {
    const normalizedLimit = Math.floor(limit);

    if (
      !Number.isInteger(normalizedLimit) ||
      normalizedLimit < 1 ||
      normalizedLimit > 100
    ) {
      return {
        success: false,
        error: "INVALID_QUEUE_LIMIT",
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
      "get_brand_qris_verification_queue",
      {
        p_limit: normalizedLimit,
      },
    );

    if (error) {
      console.error("[getBrandQrisVerificationQueue] RPC error:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });

      return {
        success: false,
        error: mapBrandVerificationErrorCode(error),
      };
    }

    return {
      success: true,
      data: (data ?? []).map(mapBrandQrisVerificationQueueItem),
    };
  } catch (error) {
    console.error("[getBrandQrisVerificationQueue] Unexpected error:", error);

    return {
      success: false,
      error: mapBrandVerificationErrorCode(error),
    };
  }
}

/**
 * Menyetujui atau menolak bukti pembayaran QRIS.
 *
 * Keputusan final dilakukan oleh RPC atomic.
 */
export async function verifyBrandQrisPayment(
  input: VerifyBrandQrisPaymentInput,
): Promise<BaseResponse<VerifyBrandQrisPaymentResult>> {
  try {
    const normalizedOrderId = input.orderId.trim();

    const normalizedNote = input.note?.trim() || null;

    if (!UUID_PATTERN.test(normalizedOrderId)) {
      return {
        success: false,
        error: "INVALID_ORDER_ID",
      };
    }

    if (input.decision !== "approve" && input.decision !== "reject") {
      return {
        success: false,
        error: "INVALID_VERIFICATION_DECISION",
      };
    }

    if (normalizedNote && normalizedNote.length > 1000) {
      return {
        success: false,
        error: "VERIFICATION_NOTE_TOO_LONG",
      };
    }

    if (
      input.decision === "reject" &&
      (!normalizedNote || normalizedNote.length < 5)
    ) {
      return {
        success: false,
        error: "REJECTION_REASON_REQUIRED",
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

    const rpcArgs: VerifyBrandQrisPaymentRpcArgs = {
      p_order_id: normalizedOrderId,
      p_decision: input.decision,
    };

    if (normalizedNote) {
      rpcArgs.p_note = normalizedNote;
    }

    const { data, error } = await supabase.rpc(
      "verify_brand_qris_payment",
      rpcArgs,
    );

    if (error) {
      console.error("[verifyBrandQrisPayment] RPC error:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });

      return {
        success: false,
        error: mapBrandVerificationErrorCode(error),
      };
    }

    const result: VerifyBrandQrisPaymentRpcRow | undefined = data?.[0];

    if (!result) {
      return {
        success: false,
        error: "PAYMENT_VERIFICATION_FAILED",
      };
    }

    return {
      success: true,
      data: {
        orderId: result.order_id,

        orderStatus: result.order_status,

        paymentStatus: result.payment_status,

        verifiedAt: result.verified_at,

        verifiedBy: result.verified_by,

        stockReleasedAt: result.stock_released_at,

        isExisting: result.is_existing,
      },
    };
  } catch (error) {
    console.error("[verifyBrandQrisPayment] Unexpected error:", error);

    return {
      success: false,
      error: mapBrandVerificationErrorCode(error),
    };
  }
}

export function getBrandPaymentVerificationErrorMessage(
  error: unknown,
): string {
  const code = mapBrandVerificationErrorCode(error);

  switch (code) {
    case "UNAUTHENTICATED":
      return "Sesi Anda telah berakhir. Silakan masuk kembali.";

    case "INVALID_ORDER_ID":
      return "ID pesanan tidak valid.";

    case "ORDER_NOT_FOUND":
      return "Pesanan tidak ditemukan atau bukan milik brand Anda.";

    case "PAYMENT_RECORD_NOT_FOUND":
      return "Data pembayaran tidak ditemukan.";

    case "ORDER_NOT_QRIS":
      return "Pesanan ini tidak menggunakan QRIS.";

    case "PAYMENT_NOT_VERIFIABLE":
      return "Pembayaran ini sudah tidak dapat diverifikasi.";

    case "ORDER_NOT_VERIFIABLE":
      return "Status pesanan sudah tidak dapat diverifikasi.";

    case "ORDER_STOCK_ALREADY_RELEASED":
      return "Stok pesanan sudah dikembalikan sehingga pembayaran tidak dapat diterima.";

    case "PROOF_REQUIRED":
      return "Bukti pembayaran belum tersedia.";

    case "PROOF_NOT_FOUND":
      return "File bukti pembayaran tidak ditemukan di penyimpanan.";

    case "REJECTION_REASON_REQUIRED":
      return "Alasan penolakan minimal 5 karakter.";

    case "VERIFICATION_NOTE_TOO_LONG":
      return "Catatan verifikasi maksimal 1.000 karakter.";

    case "INVALID_VERIFICATION_DECISION":
      return "Keputusan verifikasi tidak valid.";

    case "INVALID_PROOF_PATH":
    case "PROOF_PATH_TOO_LONG":
      return "Lokasi bukti pembayaran tidak valid.";

    case "INVALID_SIGNED_URL_EXPIRY":
      return "Durasi akses bukti pembayaran tidak valid.";

    case "SIGNED_URL_CREATION_FAILED":
      return "Tautan bukti pembayaran belum dapat dibuat.";

    case "PAYMENT_VERIFICATION_FAILED":
      return "Pembayaran belum dapat diverifikasi.";

    case "INVALID_QUEUE_LIMIT":
      return "Jumlah antrean verifikasi tidak valid.";

    case "VERIFICATION_QUEUE_FAILED":
      return "Antrean verifikasi belum dapat dimuat.";

    default:
      return "Verifikasi pembayaran belum dapat diproses.";
  }
}

function mapBrandVerificationErrorCode(error: unknown): string {
  const text = extractErrorText(error).toUpperCase();

  const codes = [
    "ORDER_STOCK_ALREADY_RELEASED",
    "INVALID_VERIFICATION_DECISION",
    "REJECTION_REASON_REQUIRED",
    "VERIFICATION_NOTE_TOO_LONG",
    "INVALID_SIGNED_URL_EXPIRY",
    "SIGNED_URL_CREATION_FAILED",
    "PAYMENT_RECORD_NOT_FOUND",
    "PAYMENT_NOT_VERIFIABLE",
    "ORDER_NOT_VERIFIABLE",
    "PAYMENT_VERIFICATION_FAILED",
    "PROOF_PATH_TOO_LONG",
    "INVALID_PROOF_PATH",
    "PROOF_NOT_FOUND",
    "PROOF_REQUIRED",
    "INVALID_ORDER_ID",
    "ORDER_NOT_FOUND",
    "ORDER_NOT_QRIS",
    "UNAUTHENTICATED",
    "INVALID_QUEUE_LIMIT",
    "VERIFICATION_QUEUE_FAILED",
  ] as const;

  return (
    codes.find((code) => text.includes(code)) ?? "PAYMENT_VERIFICATION_FAILED"
  );
}

function mapBrandQrisVerificationQueueItem(
  row: BrandQrisQueueRpcRow,
): BrandQrisVerificationQueueItem {
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

    paymentId: row.payment_id,

    paymentStatus: row.payment_status,

    amountIdr: toNonNegativeNumber(row.amount_idr),

    proofPath: normalizeOptionalText(row.proof_path),

    submittedAt: row.submitted_at,

    expiresAt: row.expires_at,

    verifiedAt: row.verified_at,

    verificationNote: normalizeOptionalText(row.verification_note),

    items: mapBrandQueueItems(row.items),
  };
}

function mapBrandQueueItems(
  value: Database["public"]["Functions"]["get_brand_qris_verification_queue"]["Returns"][number]["items"],
): BrandQrisVerificationItemProduct[] {
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
