import { supabase } from "@/lib/supabaseClient";
import type { BaseResponse } from "@/types/common";
import type { Database } from "@/types/database";

const PAYMENT_PROOF_BUCKET =
  "payment-proofs";

const MAX_PROOF_FILE_SIZE =
  5 * 1024 * 1024;

const ALLOWED_PROOF_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

type SubmitQrisPaymentRpc =
  Database["public"]["Functions"]["submit_customer_qris_payment"];

type SubmitQrisPaymentRpcRow =
  SubmitQrisPaymentRpc["Returns"][number];

type ExpireCustomerQrisOrderRpc =
  Database["public"]["Functions"]["expire_customer_qris_order"];

type ExpireCustomerQrisOrderRpcRow =
  ExpireCustomerQrisOrderRpc["Returns"][number];

export interface CustomerQrisPaymentActionResult {
  orderId: string;

  orderStatus:
    Database["public"]["Enums"]["order_status"];

  paymentStatus:
    Database["public"]["Enums"]["order_payment_status"];
}

export interface CustomerQrisExpiryResult {
  orderId: string;

  orderStatus:
    Database["public"]["Enums"]["order_status"];

  paymentStatus:
    Database["public"]["Enums"]["order_payment_status"];

  stockReleasedAt: string | null;
  expiredAt: string | null;
  wasAlreadyReleased: boolean;
}

export interface UploadCustomerQrisProofResult {
  path: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function uploadCustomerQrisProof(
  orderId: string,
  file: File,
): Promise<
  BaseResponse<UploadCustomerQrisProofResult>
> {
  try {
    const normalizedOrderId =
      orderId.trim();

    if (
      !UUID_PATTERN.test(
        normalizedOrderId,
      )
    ) {
      return {
        success: false,
        error: "INVALID_ORDER_ID",
      };
    }

    const validationError =
      validateCustomerQrisProofFile(
        file,
      );

    if (validationError) {
      return {
        success: false,
        error: validationError,
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

    const extension =
      getProofFileExtension(
        file.type,
      );

    const objectPath = [
      user.id,
      normalizedOrderId,
      `${globalThis.crypto.randomUUID()}.${extension}`,
    ].join("/");

    const { data, error } =
      await supabase.storage
        .from(PAYMENT_PROOF_BUCKET)
        .upload(
          objectPath,
          file,
          {
            cacheControl: "3600",
            contentType: file.type,
            upsert: false,
          },
        );

    if (error) {
      console.error(
        "[uploadCustomerQrisProof] Storage error:",
        {
          message: error.message,
          name: error.name,
        },
      );

      return {
        success: false,
        error:
          "PROOF_UPLOAD_FAILED",
      };
    }

    return {
      success: true,
      data: {
        path: data.path,
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
      },
    };
  } catch (error) {
    console.error(
      "[uploadCustomerQrisProof] Unexpected error:",
      error,
    );

    return {
      success: false,
      error: "PROOF_UPLOAD_FAILED",
    };
  }
}

export async function removeCustomerQrisProof(
  proofPath: string,
): Promise<BaseResponse<null>> {
  try {
    const normalizedPath =
      proofPath.trim();

    if (!normalizedPath) {
      return {
        success: false,
        error: "INVALID_PROOF_PATH",
      };
    }

    const { error } =
      await supabase.storage
        .from(PAYMENT_PROOF_BUCKET)
        .remove([
          normalizedPath,
        ]);

    if (error) {
      console.error(
        "[removeCustomerQrisProof] Storage error:",
        error,
      );

      return {
        success: false,
        error:
          "PROOF_DELETE_FAILED",
      };
    }

    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error(
      "[removeCustomerQrisProof] Unexpected error:",
      error,
    );

    return {
      success: false,
      error:
        "PROOF_DELETE_FAILED",
    };
  }
}

export async function submitCustomerQrisPayment(
  orderId: string,
  proofPath: string,
): Promise<
  BaseResponse<CustomerQrisPaymentActionResult>
> {
  try {
    const normalizedOrderId =
      orderId.trim();

    const normalizedProofPath =
      proofPath.trim();

    if (
      !UUID_PATTERN.test(
        normalizedOrderId,
      )
    ) {
      return {
        success: false,
        error: "INVALID_ORDER_ID",
      };
    }

    if (!normalizedProofPath) {
      return {
        success: false,
        error: "PROOF_REQUIRED",
      };
    }

    if (
      normalizedProofPath.length >
      512
    ) {
      return {
        success: false,
        error: "PROOF_PATH_TOO_LONG",
      };
    }

    const { data, error } =
      await supabase.rpc(
        "submit_customer_qris_payment",
        {
          p_order_id:
            normalizedOrderId,

          p_proof_url:
            normalizedProofPath,
        },
      );

    if (error) {
      console.error(
        "[submitCustomerQrisPayment] RPC error:",
        {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        },
      );

      return {
        success: false,
        error:
          mapQrisPaymentErrorCode(
            error,
          ),
      };
    }

    const result:
      | SubmitQrisPaymentRpcRow
      | undefined = data?.[0];

    if (!result) {
      return {
        success: false,
        error:
          "QRIS_SUBMISSION_FAILED",
      };
    }

    return {
      success: true,
      data: {
        orderId:
          result.order_id,

        orderStatus:
          result.order_status,

        paymentStatus:
          result.payment_status,
      },
    };
  } catch (error) {
    console.error(
      "[submitCustomerQrisPayment] Unexpected error:",
      error,
    );

    return {
      success: false,
      error:
        mapQrisPaymentErrorCode(
          error,
        ),
    };
  }
}

export async function expireCustomerQrisOrder(
  orderId: string,
): Promise<
  BaseResponse<CustomerQrisExpiryResult>
> {
  try {
    const normalizedOrderId =
      orderId.trim();

    if (
      !UUID_PATTERN.test(
        normalizedOrderId,
      )
    ) {
      return {
        success: false,
        error: "INVALID_ORDER_ID",
      };
    }

    const { data, error } =
      await supabase.rpc(
        "expire_customer_qris_order",
        {
          p_order_id:
            normalizedOrderId,
        },
      );

    if (error) {
      console.error(
        "[expireCustomerQrisOrder] RPC error:",
        {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        },
      );

      return {
        success: false,
        error:
          mapQrisPaymentErrorCode(
            error,
          ),
      };
    }

    const result:
      | ExpireCustomerQrisOrderRpcRow
      | undefined = data?.[0];

    if (!result) {
      return {
        success: false,
        error: "QRIS_EXPIRY_FAILED",
      };
    }

    return {
      success: true,
      data: {
        orderId:
          result.order_id,

        orderStatus:
          result.order_status,

        paymentStatus:
          result.payment_status,

        stockReleasedAt:
          result.stock_released_at,

        expiredAt:
          result.expired_at,

        wasAlreadyReleased:
          result.was_already_released,
      },
    };
  } catch (error) {
    console.error(
      "[expireCustomerQrisOrder] Unexpected error:",
      error,
    );

    return {
      success: false,
      error:
        mapQrisPaymentErrorCode(
          error,
        ),
    };
  }
}

export function validateCustomerQrisProofFile(
  file: File,
): string | null {
  if (!file) {
    return "PROOF_REQUIRED";
  }

  if (
    !ALLOWED_PROOF_TYPES.includes(
      file.type as
        (typeof ALLOWED_PROOF_TYPES)[number],
    )
  ) {
    return "INVALID_PROOF_TYPE";
  }

  if (file.size <= 0) {
    return "INVALID_PROOF_FILE";
  }

  if (
    file.size >
    MAX_PROOF_FILE_SIZE
  ) {
    return "PROOF_FILE_TOO_LARGE";
  }

  return null;
}

export function getCustomerQrisPaymentErrorMessage(
  error: unknown,
): string {
  const code =
    mapQrisPaymentErrorCode(
      error,
    );

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

    case "ORDER_NOT_PAYABLE":
      return "Pesanan ini sudah tidak dapat dibayar.";

    case "PAYMENT_NOT_EXPIRED":
      return "Waktu pembayaran belum berakhir.";

    case "PAYMENT_EXPIRY_NOT_CONFIGURED":
      return "Batas waktu pembayaran belum dikonfigurasi.";

    case "PAYMENT_ALREADY_PAID":
      return "Pembayaran ini sudah diterima.";

    case "PAYMENT_WAITING_VERIFICATION":
      return "Pembayaran sedang menunggu verifikasi.";

    case "PAYMENT_NOT_SUBMITTABLE":
      return "Pembayaran ini tidak dapat dikirim untuk verifikasi.";

    case "PROOF_REQUIRED":
      return "Pilih foto bukti pembayaran terlebih dahulu.";

    case "INVALID_PROOF_TYPE":
      return "Bukti pembayaran harus berupa JPEG, PNG, atau WebP.";

    case "INVALID_PROOF_FILE":
      return "File bukti pembayaran tidak valid.";

    case "PROOF_FILE_TOO_LARGE":
      return "Ukuran bukti pembayaran maksimal 5 MB.";

    case "PROOF_PATH_TOO_LONG":
    case "INVALID_PROOF_PATH":
      return "Lokasi bukti pembayaran tidak valid.";

    case "PROOF_NOT_FOUND":
      return "File bukti pembayaran tidak ditemukan.";

    case "PROOF_UPLOAD_FAILED":
      return "Bukti pembayaran belum dapat diunggah.";

    case "PROOF_DELETE_FAILED":
      return "Bukti pembayaran belum dapat dihapus.";

    case "QRIS_SUBMISSION_FAILED":
      return "Konfirmasi pembayaran belum dapat dikirim.";

    case "QRIS_EXPIRY_FAILED":
      return "Status kedaluwarsa belum dapat diperbarui.";

    default:
      return "Pembayaran QRIS belum dapat diproses.";
  }
}

function getProofFileExtension(
  mimeType: string,
): "jpg" | "png" | "webp" {
  switch (mimeType) {
    case "image/png":
      return "png";

    case "image/webp":
      return "webp";

    case "image/jpeg":
    default:
      return "jpg";
  }
}

function mapQrisPaymentErrorCode(
  error: unknown,
): string {
  const text =
    extractErrorText(
      error,
    ).toUpperCase();

  const codes = [
    "PAYMENT_EXPIRY_NOT_CONFIGURED",
    "PAYMENT_WAITING_VERIFICATION",
    "PAYMENT_RECORD_NOT_FOUND",
    "PAYMENT_ALREADY_PAID",
    "PAYMENT_NOT_SUBMITTABLE",
    "PAYMENT_NOT_EXPIRED",
    "PROOF_FILE_TOO_LARGE",
    "PROOF_UPLOAD_FAILED",
    "PROOF_DELETE_FAILED",
    "INVALID_PROOF_TYPE",
    "INVALID_PROOF_FILE",
    "PROOF_PATH_TOO_LONG",
    "INVALID_PROOF_PATH",
    "PROOF_NOT_FOUND",
    "PROOF_REQUIRED",
    "ORDER_NOT_PAYABLE",
    "INVALID_ORDER_ID",
    "ORDER_NOT_FOUND",
    "ORDER_NOT_QRIS",
    "UNAUTHENTICATED",
    "QRIS_SUBMISSION_FAILED",
    "QRIS_EXPIRY_FAILED",
  ] as const;

  return (
    codes.find((code) =>
      text.includes(code),
    ) ??
    "QRIS_PAYMENT_FAILED"
  );
}

function extractErrorText(
  error: unknown,
): string {
  if (
    typeof error === "string"
  ) {
    return error;
  }

  if (
    error instanceof Error
  ) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null
  ) {
    const record =
      error as Record<
        string,
        unknown
      >;

    return [
      record.code,
      record.message,
      record.details,
      record.hint,
    ]
      .filter(
        (
          value,
        ): value is string =>
          typeof value === "string",
      )
      .join(" ");
  }

  return "";
}