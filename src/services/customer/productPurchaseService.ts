import { supabase } from "@/lib/supabaseClient";
import type { BaseResponse } from "@/types/common";
import type { Database } from "@/types/database";
import type {
  ProductPurchaseErrorCode,
  PurchaseCustomerProductInput,
  PurchaseCustomerProductResult,
} from "@/types/customerCheckout";

type PurchaseProductRpcReturns =
  Database["public"]["Functions"]["purchase_customer_product"]["Returns"];

type PurchaseProductRpcRow = PurchaseProductRpcReturns[number];

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Melakukan pembelian Buy Now melalui RPC atomic.
 *
 * Harga, stok, bonus, dan saldo coin akan
 * divalidasi kembali oleh database.
 */
export async function purchaseCustomerProduct(
  input: PurchaseCustomerProductInput,
): Promise<BaseResponse<PurchaseCustomerProductResult>> {
  try {
    const normalizedInput = normalizePurchaseInput(input);

    const validationError = validatePurchaseInput(normalizedInput);

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

    const { data, error } = await supabase.rpc("purchase_customer_product", {
      p_product_id: normalizedInput.productId,

      p_quantity: normalizedInput.quantity,

      p_receiver_name: normalizedInput.receiverName,

      p_phone_number: normalizedInput.phoneNumber,

      p_shipping_address: normalizedInput.shippingAddress,

      p_claim_bonus: normalizedInput.claimBonus,
    });

    if (error) {
      console.error("[purchaseCustomerProduct] RPC error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });

      return {
        success: false,
        error: mapProductPurchaseErrorCode(error),
      };
    }

    const purchase = data?.[0];

    if (!purchase) {
      return {
        success: false,
        error: "PURCHASE_FAILED",
      };
    }

    return {
      success: true,
      data: mapPurchaseResult(purchase),
    };
  } catch (error) {
    console.error(
      "[purchaseCustomerProduct] Unexpected error details:",
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : {
            value: error,
            serialized: safeSerialize(error),
          },
    );

    return {
      success: false,
      error: mapProductPurchaseErrorCode(error),
    };
  }
}

/**
 * Mengubah kode error menjadi pesan yang
 * aman ditampilkan pada customer.
 */
export function getProductPurchaseErrorMessage(error: unknown): string {
  const code = mapProductPurchaseErrorCode(error);

  switch (code) {
    case "UNAUTHENTICATED":
      return "Sesi Anda telah berakhir. Silakan masuk kembali.";

    case "INVALID_PRODUCT_ID":
      return "Produk yang dipilih tidak valid.";

    case "INVALID_QUANTITY":
      return "Jumlah produk minimal satu.";

    case "QUANTITY_LIMIT_EXCEEDED":
      return "Jumlah pembelian maksimal 100 produk dalam satu transaksi.";

    case "INVALID_RECEIVER_NAME":
      return "Nama penerima harus terdiri dari minimal 2 karakter.";

    case "RECEIVER_NAME_TOO_LONG":
      return "Nama penerima terlalu panjang.";

    case "PHONE_NUMBER_TOO_LONG":
      return "Nomor telepon terlalu panjang.";

    case "INVALID_SHIPPING_ADDRESS":
      return "Alamat pengiriman harus terdiri dari minimal 10 karakter.";

    case "SHIPPING_ADDRESS_TOO_LONG":
      return "Alamat pengiriman terlalu panjang.";

    case "PRODUCT_NOT_FOUND":
      return "Produk tidak ditemukan.";

    case "PRODUCT_NOT_AVAILABLE":
      return "Produk sudah tidak tersedia untuk dibeli.";

    case "INSUFFICIENT_STOCK":
      return "Stok produk tidak mencukupi untuk jumlah yang dipilih.";

    case "USER_PROFILE_NOT_FOUND":
      return "Profil customer belum tersedia. Silakan lengkapi akun Anda.";

    case "BONUS_NOT_AVAILABLE":
      return "Bonus untuk produk ini sudah tidak tersedia.";

    case "INVALID_BONUS_CONFIGURATION":
      return "Konfigurasi bonus produk tidak valid.";

    case "BONUS_PRODUCT_NOT_FOUND":
      return "Produk bonus tidak ditemukan.";

    case "INSUFFICIENT_BONUS_STOCK":
      return "Stok produk bonus tidak mencukupi.";

    case "INSUFFICIENT_POINTS":
      return "Coin Anda tidak mencukupi untuk mengklaim bonus.";

    case "PURCHASE_FAILED":
    default:
      return "Pembelian belum dapat diproses. Silakan coba kembali.";
  }
}

function normalizePurchaseInput(
  input: PurchaseCustomerProductInput,
): PurchaseCustomerProductInput {
  return {
    productId: input.productId.trim(),

    quantity: Number(input.quantity),

    receiverName: input.receiverName.trim(),

    phoneNumber: input.phoneNumber.trim(),

    shippingAddress: input.shippingAddress.trim(),

    claimBonus: Boolean(input.claimBonus),
  };
}

function validatePurchaseInput(
  input: PurchaseCustomerProductInput,
): ProductPurchaseErrorCode | null {
  if (!input.productId || !UUID_PATTERN.test(input.productId)) {
    return "INVALID_PRODUCT_ID";
  }

  if (!Number.isInteger(input.quantity) || input.quantity < 1) {
    return "INVALID_QUANTITY";
  }

  if (input.quantity > 100) {
    return "QUANTITY_LIMIT_EXCEEDED";
  }

  if (input.receiverName.length < 2) {
    return "INVALID_RECEIVER_NAME";
  }

  if (input.receiverName.length > 120) {
    return "RECEIVER_NAME_TOO_LONG";
  }

  if (input.phoneNumber.length > 30) {
    return "PHONE_NUMBER_TOO_LONG";
  }

  if (input.shippingAddress.length < 10) {
    return "INVALID_SHIPPING_ADDRESS";
  }

  if (input.shippingAddress.length > 1000) {
    return "SHIPPING_ADDRESS_TOO_LONG";
  }

  return null;
}

function mapPurchaseResult(
  row: PurchaseProductRpcRow,
): PurchaseCustomerProductResult {
  return {
    orderId: row.order_id,

    orderStatus: row.order_status,

    totalPriceIdr: toNonNegativeNumber(row.total_price_idr),

    totalCoinsRedeemed: toNonNegativeNumber(row.total_coins_redeemed),

    remainingPoints: toNonNegativeNumber(row.remaining_points),

    pointsEarned: toNonNegativeNumber(row.points_earned),

    createdAt: row.created_at,
  };
}

function mapProductPurchaseErrorCode(error: unknown): ProductPurchaseErrorCode {
  const errorText = extractErrorText(error).toUpperCase();

  /*
   * Kode yang lebih spesifik diletakkan
   * sebelum kode generik seperti PRODUCT_NOT_FOUND.
   */
  const knownCodes: ProductPurchaseErrorCode[] = [
    "INVALID_BONUS_CONFIGURATION",
    "INSUFFICIENT_BONUS_STOCK",
    "BONUS_PRODUCT_NOT_FOUND",
    "QUANTITY_LIMIT_EXCEEDED",
    "RECEIVER_NAME_TOO_LONG",
    "PHONE_NUMBER_TOO_LONG",
    "SHIPPING_ADDRESS_TOO_LONG",
    "USER_PROFILE_NOT_FOUND",
    "PRODUCT_NOT_AVAILABLE",
    "INSUFFICIENT_STOCK",
    "INSUFFICIENT_POINTS",
    "BONUS_NOT_AVAILABLE",
    "INVALID_RECEIVER_NAME",
    "INVALID_SHIPPING_ADDRESS",
    "INVALID_PRODUCT_ID",
    "INVALID_QUANTITY",
    "PRODUCT_NOT_FOUND",
    "UNAUTHENTICATED",
  ];

  const matchedCode = knownCodes.find((code) => errorText.includes(code));

  return matchedCode ?? "PURCHASE_FAILED";
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

    return [record.message, record.details, record.hint, record.code]
      .filter((value): value is string => typeof value === "string")
      .join(" ");
  }

  return "";
}

function toNonNegativeNumber(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, parsed);
}
function safeSerialize(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
