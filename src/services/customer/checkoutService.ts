import { supabase } from "@/lib/supabaseClient";
import { translateSupabaseError } from "@/lib/supabaseError";
import { getProductBySku } from "@/services/product";
import type { BaseResponse } from "@/types/common";
import type {
  CheckoutPreparationErrorCode,
  CustomerCheckoutBonus,
  CustomerCheckoutData,
} from "@/types/customerCheckout";
import { ProductDetailItem } from "@/types/product";

interface GetCustomerCheckoutDataInput {
  sku: string;
  quantity: number;
}

/**
 * Mengambil data terbaru yang dibutuhkan
 * sebelum form checkout ditampilkan.
 *
 * Ini hanya persiapan tampilan. Harga, stok,
 * bonus, dan coin tetap divalidasi ulang oleh
 * RPC purchase_customer_product.
 */
export async function getCustomerCheckoutData(
  input: GetCustomerCheckoutDataInput,
): Promise<BaseResponse<CustomerCheckoutData>> {
  try {
    const normalizedSku = input.sku.trim();
    const quantity = Number(input.quantity);

    const validationError = validateCheckoutRequest(normalizedSku, quantity);

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

    const [productResult, profileResponse] = await Promise.all([
      getProductBySku(normalizedSku),

      supabase
        .from("users")
        .select(
          `
            full_name,
            phone_number,
            shipping_address,
            total_points
          `,
        )
        .eq("id", user.id)
        .maybeSingle(),
    ]);

    if (!productResult.success) {
      return {
        success: false,
        error: "CHECKOUT_LOAD_FAILED",
      };
    }

    const product = productResult.data;

    if (!product) {
      return {
        success: false,
        error: "PRODUCT_NOT_FOUND",
      };
    }

    if (product.status !== "published") {
      return {
        success: false,
        error: "PRODUCT_NOT_AVAILABLE",
      };
    }

    if (product.stock < quantity) {
      return {
        success: false,
        error: "INSUFFICIENT_STOCK",
      };
    }

    if (profileResponse.error) {
      return {
        success: false,
        error: translateSupabaseError(profileResponse.error),
      };
    }

    const profile = profileResponse.data;

    if (!profile) {
      return {
        success: false,
        error: "USER_PROFILE_NOT_FOUND",
      };
    }

    const totalPoints = toNonNegativeNumber(profile.total_points);

    const bonus = buildCheckoutBonus({
      quantity,
      totalPoints,
      product,
    });

    return {
      success: true,
      data: {
        quantity,

        totalPriceIdr: product.priceIdr * quantity,

        profile: {
          fullName: profile.full_name.trim(),

          phoneNumber: normalizeOptionalText(profile.phone_number),

          shippingAddress: normalizeOptionalText(profile.shipping_address),

          totalPoints,
        },

        product: {
          id: product.id,
          slug: product.slug,
          name: product.name,

          priceIdr: toNonNegativeNumber(product.priceIdr),

          stock: toNonNegativeInteger(product.stock),

          brandName: product.brand.name,
          categoryName: product.categoryName,
        },

        bonus,
      },
    };
  } catch (error) {
    console.error("[getCustomerCheckoutData] Unexpected error:", error);

    return {
      success: false,
      error: "CHECKOUT_LOAD_FAILED",
    };
  }
}

export function getCheckoutPreparationErrorMessage(error: unknown): string {
  const code = mapCheckoutPreparationErrorCode(error);

  switch (code) {
    case "UNAUTHENTICATED":
      return "Silakan masuk untuk melanjutkan checkout.";

    case "INVALID_PRODUCT_SKU":
      return "Produk yang dipilih tidak valid.";

    case "INVALID_QUANTITY":
      return "Jumlah produk minimal satu.";

    case "QUANTITY_LIMIT_EXCEEDED":
      return "Jumlah pembelian maksimal 100 produk dalam satu transaksi.";

    case "PRODUCT_NOT_FOUND":
      return "Produk tidak ditemukan.";

    case "PRODUCT_NOT_AVAILABLE":
      return "Produk sudah tidak tersedia untuk dibeli.";

    case "INSUFFICIENT_STOCK":
      return "Stok produk tidak mencukupi untuk jumlah yang dipilih.";

    case "USER_PROFILE_NOT_FOUND":
      return "Profil customer belum tersedia.";

    case "CHECKOUT_LOAD_FAILED":
    default:
      return "Data checkout belum dapat dimuat. Silakan coba kembali.";
  }
}

function buildCheckoutBonus({
  quantity,
  totalPoints,
  product,
}: {
  quantity: number;
  totalPoints: number;
  product: ProductDetailItem;
}): CustomerCheckoutBonus | null {
  const bonusProduct = product.bonusProduct;

  if (!bonusProduct) {
    return null;
  }

  const quantityPerProduct = toNonNegativeInteger(product.bonusProductQty);

  const coinCostPerProduct = toNonNegativeInteger(product.bonusCoinCost);

  const totalQuantity = quantityPerProduct * quantity;

  const totalCoinCost = coinCostPerProduct * quantity;

  const availableStock = toNonNegativeInteger(bonusProduct.stock);

  const hasEnoughStock = availableStock >= totalQuantity;

  const hasEnoughPoints = totalPoints >= totalCoinCost;

  return {
    productId: bonusProduct.id,
    productName: bonusProduct.name,

    quantityPerProduct,
    totalQuantity,

    coinCostPerProduct,
    totalCoinCost,

    availableStock,

    hasEnoughStock,
    hasEnoughPoints,

    canClaim: hasEnoughStock && hasEnoughPoints && totalQuantity > 0,
  };
}

function validateCheckoutRequest(
  sku: string,
  quantity: number,
): CheckoutPreparationErrorCode | null {
  if (!sku) {
    return "INVALID_PRODUCT_SKU";
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    return "INVALID_QUANTITY";
  }

  if (quantity > 100) {
    return "QUANTITY_LIMIT_EXCEEDED";
  }

  return null;
}

function mapCheckoutPreparationErrorCode(
  error: unknown,
): CheckoutPreparationErrorCode {
  const errorText = extractErrorText(error).toUpperCase();

  const knownCodes: CheckoutPreparationErrorCode[] = [
    "QUANTITY_LIMIT_EXCEEDED",
    "USER_PROFILE_NOT_FOUND",
    "PRODUCT_NOT_AVAILABLE",
    "INSUFFICIENT_STOCK",
    "INVALID_PRODUCT_SKU",
    "INVALID_QUANTITY",
    "PRODUCT_NOT_FOUND",
    "UNAUTHENTICATED",
    "CHECKOUT_LOAD_FAILED",
  ];

  return (
    knownCodes.find((code) => errorText.includes(code)) ??
    "CHECKOUT_LOAD_FAILED"
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

    return [record.message, record.details, record.hint, record.code]
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

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, parsed);
}

function toNonNegativeInteger(value: unknown): number {
  return Math.floor(toNonNegativeNumber(value));
}
