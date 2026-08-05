import { supabase } from "@/lib/supabaseClient";
import { getProductBySku } from "@/services/product";
import type { BaseResponse } from "@/types/common";
import type { Database } from "@/types/database";
import type {
  CreateCustomerCheckoutOrderInput,
  CreateCustomerCheckoutOrderResult,
  CustomerCheckoutPaymentMethod,
  CustomerCheckoutPreview,
  CustomerCheckoutPreviewReward,
  SecureCheckoutErrorCode,
} from "@/types/customerCheckout";

interface GetCustomerCheckoutPreviewInput {
  sku: string;
  quantity: number;
}

type CheckoutRpcReturns =
  Database["public"]["Functions"]["create_customer_checkout_order"]["Returns"];

type CheckoutRpcRow =
  CheckoutRpcReturns[number];

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Menyiapkan data terbaru untuk checkout.
 *
 * Data ini hanya untuk tampilan dan validasi awal.
 * RPC tetap menjadi sumber kebenaran final.
 */
export async function getCustomerCheckoutPreview(
  input: GetCustomerCheckoutPreviewInput,
): Promise<
  BaseResponse<CustomerCheckoutPreview>
> {
  try {
    const sku = input.sku.trim();
    const quantity = Number(
      input.quantity,
    );

    if (!sku) {
      return {
        success: false,
        error: "PRODUCT_NOT_FOUND",
      };
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return {
        success: false,
        error: "INVALID_QUANTITY",
      };
    }

    if (quantity > 100) {
      return {
        success: false,
        error:
          "QUANTITY_LIMIT_EXCEEDED",
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

    const [
      productResult,
      profileResponse,
    ] = await Promise.all([
      getProductBySku(sku),

      supabase
        .from("users")
        .select(`
          full_name,
          phone_number,
          shipping_address,
          total_points
        `)
        .eq("id", user.id)
        .maybeSingle(),
    ]);

    if (
      !productResult.success ||
      !productResult.data
    ) {
      return {
        success: false,
        error: productResult.success
          ? "PRODUCT_NOT_FOUND"
          : "CHECKOUT_LOAD_FAILED",
      };
    }

    if (profileResponse.error) {
      console.error(
        "[getCustomerCheckoutPreview] Profile error:",
        {
          code:
            profileResponse.error.code,
          message:
            profileResponse.error.message,
          details:
            profileResponse.error.details,
          hint:
            profileResponse.error.hint,
        },
      );

      return {
        success: false,
        error: "CHECKOUT_LOAD_FAILED",
      };
    }

    if (!profileResponse.data) {
      return {
        success: false,
        error:
          "USER_PROFILE_NOT_FOUND",
      };
    }

    const product =
      productResult.data;

    const profile =
      profileResponse.data;

    if (
      product.status !== "published"
    ) {
      return {
        success: false,
        error:
          "PRODUCT_NOT_AVAILABLE",
      };
    }

    if (product.stock < quantity) {
      return {
        success: false,
        error: "INSUFFICIENT_STOCK",
      };
    }

    const totalPoints =
      toNonNegativeInteger(
        profile.total_points,
      );

    const availablePaymentMethods =
      getAvailablePaymentMethods(
        product.paymentOption,
      );

    const totalPriceIdr =
      availablePaymentMethods.includes(
        "qris",
      )
        ? toNonNegativeNumber(
            product.priceIdr,
          ) * quantity
        : null;

    const reward =
      buildCheckoutReward({
        quantity,
        bonusCoinReward:
          product.bonusCoinCost,
        bonusProduct:
          product.bonusProduct,
        bonusProductQuantity:
          product.bonusProductQty,
      });

    return {
      success: true,
      data: {
        quantity,

        profile: {
          fullName:
            profile.full_name.trim(),

          phoneNumber:
            normalizeOptionalText(
              profile.phone_number,
            ),

          shippingAddress:
            normalizeOptionalText(
              profile.shipping_address,
            ),

          totalPoints,
        },

        product: {
          id: product.id,
          slug: product.slug,
          name: product.name,

          paymentOption:
            product.paymentOption,

          priceIdr:
            toNonNegativeNumber(
              product.priceIdr,
            ),

          stock:
            toNonNegativeInteger(
              product.stock,
            ),

          brandName:
            product.brand.name,

          categoryName:
            product.categoryName,
        },

        availablePaymentMethods,

        totalPriceIdr,

        hasEnoughCoinBalance: true,

        reward,
      },
    };
  } catch (error) {
    console.error(
      "[getCustomerCheckoutPreview] Unexpected error:",
      serializeUnknownError(error),
    );

    return {
      success: false,
      error: "CHECKOUT_LOAD_FAILED",
    };
  }
}

/**
 * Membuat order melalui RPC checkout terbaru.
 *
 * Token harus dibuat sekali untuk satu checkout,
 * lalu digunakan kembali ketika request diulang.
 */
export async function createCustomerCheckoutOrder(
  input: CreateCustomerCheckoutOrderInput,
): Promise<
  BaseResponse<CreateCustomerCheckoutOrderResult>
> {
  try {
    const normalized =
      normalizeCheckoutInput(input);

    const validationError =
      validateCheckoutInput(normalized);

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

    const { data, error } =
      await supabase.rpc(
        "create_customer_checkout_order",
        {
          p_product_id:
            normalized.productId,

          p_quantity:
            normalized.quantity,

          p_receiver_name:
            normalized.receiverName,

          p_phone_number:
            normalized.phoneNumber,

          p_shipping_address:
            normalized.shippingAddress,

          p_payment_method:
            normalized.paymentMethod,

          p_checkout_token:
            normalized.checkoutToken,

          p_confirmation_accepted:
            normalized.confirmationAccepted,
        },
      );

    if (error) {
      console.error(
        "[createCustomerCheckoutOrder] RPC error:",
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
          mapSecureCheckoutErrorCode(
            error,
          ),
      };
    }

    const order = data?.[0];

    if (!order) {
      return {
        success: false,
        error: "CHECKOUT_FAILED",
      };
    }

    return {
      success: true,
      data:
        mapCheckoutOrderResult(order),
    };
  } catch (error) {
    console.error(
      "[createCustomerCheckoutOrder] Unexpected error:",
      serializeUnknownError(error),
    );

    return {
      success: false,
      error:
        mapSecureCheckoutErrorCode(
          error,
        ),
    };
  }
}

export function getSecureCheckoutErrorMessage(
  error: unknown,
): string {
  const code =
    mapSecureCheckoutErrorCode(error);

  switch (code) {
    case "UNAUTHENTICATED":
      return "Sesi Anda telah berakhir. Silakan masuk kembali.";

    case "CONFIRMATION_REQUIRED":
      return "Anda harus menyetujui konfirmasi transaksi.";

    case "INVALID_CHECKOUT_TOKEN":
      return "Sesi checkout tidak valid. Silakan muat ulang halaman.";

    case "INVALID_PRODUCT_ID":
    case "PRODUCT_NOT_FOUND":
      return "Produk tidak ditemukan.";

    case "INVALID_PAYMENT_METHOD":
      return "Metode pembayaran tidak valid.";

    case "PAYMENT_METHOD_NOT_ALLOWED":
      return "Metode pembayaran ini tidak tersedia untuk produk tersebut.";

    case "INVALID_QUANTITY":
      return "Jumlah produk minimal satu.";

    case "QUANTITY_LIMIT_EXCEEDED":
      return "Jumlah pembelian maksimal 100 produk.";

    case "INVALID_RECEIVER_NAME":
      return "Nama penerima minimal 2 karakter.";

    case "RECEIVER_NAME_TOO_LONG":
      return "Nama penerima terlalu panjang.";

    case "PHONE_NUMBER_TOO_LONG":
      return "Nomor telepon terlalu panjang.";

    case "INVALID_SHIPPING_ADDRESS":
      return "Alamat pengiriman minimal 10 karakter.";

    case "SHIPPING_ADDRESS_TOO_LONG":
      return "Alamat pengiriman terlalu panjang.";

    case "IDEMPOTENCY_CONFLICT":
      return "Data checkout berubah. Muat ulang halaman sebelum melanjutkan.";

    case "PAYMENT_RECORD_NOT_FOUND":
      return "Catatan pembayaran pesanan tidak ditemukan.";

    case "USER_PROFILE_NOT_FOUND":
      return "Profil customer belum tersedia.";

    case "PRODUCT_CONFIGURATION_CHANGED":
      return "Konfigurasi produk berubah. Silakan muat ulang checkout.";

    case "PRODUCT_NOT_AVAILABLE":
      return "Produk sudah tidak tersedia.";

    case "INSUFFICIENT_STOCK":
      return "Stok produk tidak mencukupi.";

    case "INVALID_BONUS_COIN_REWARD":
      return "Konfigurasi bonus coin tidak valid.";

    case "POINT_REWARD_TOO_LARGE":
      return "Jumlah bonus coin produk tidak valid.";

    case "INVALID_BONUS_CONFIGURATION":
      return "Konfigurasi produk bonus tidak valid.";

    case "BONUS_PRODUCT_NOT_FOUND":
      return "Produk bonus tidak ditemukan.";

    case "BONUS_PRODUCT_NOT_AVAILABLE":
      return "Produk bonus sudah tidak tersedia.";

    case "BONUS_QUANTITY_TOO_LARGE":
      return "Jumlah produk bonus tidak valid.";

    case "INSUFFICIENT_BONUS_STOCK":
      return "Stok produk bonus tidak mencukupi.";

    case "INVALID_PRODUCT_PRICE":
      return "Harga IDR produk tidak valid.";

    case "COIN_AMOUNT_TOO_LARGE":
      return "Jumlah coin transaksi tidak valid.";

    case "INSUFFICIENT_POINTS":
      return "Saldo coin Anda tidak mencukupi.";

    case "CHECKOUT_LOAD_FAILED":
      return "Data checkout belum dapat dimuat.";

    case "CHECKOUT_FAILED":
    default:
      return "Checkout belum dapat diproses. Silakan coba kembali.";
  }
}

function getAvailablePaymentMethods(
  _option:
    Database["public"]["Enums"]["product_payment_option"],
): CustomerCheckoutPaymentMethod[] {
  // MURI Rule: Coin is exclusively reserved for Workshop registrations (if not free).
  // Product purchases must strictly use QRIS (IDR).
  return ["qris"];
}

function buildCheckoutReward({
  quantity,
  bonusCoinReward,
  bonusProduct,
  bonusProductQuantity,
}: {
  quantity: number;
  bonusCoinReward: number;
  bonusProduct: {
    id: string;
    name: string;
    stock: number;
  } | null;
  bonusProductQuantity: number;
}): CustomerCheckoutPreviewReward | null {
  const coinRewardPerProduct =
    toNonNegativeInteger(
      bonusCoinReward,
    );

  const totalCoinReward =
    coinRewardPerProduct * quantity;

  const quantityPerProduct =
    toNonNegativeInteger(
      bonusProductQuantity,
    );

  const totalBonusQuantity =
    quantityPerProduct * quantity;

  const productBonus =
    bonusProduct &&
    totalBonusQuantity > 0
      ? {
          productId:
            bonusProduct.id,

          productName:
            bonusProduct.name,

          quantityPerProduct,
          totalQuantity:
            totalBonusQuantity,

          availableStock:
            toNonNegativeInteger(
              bonusProduct.stock,
            ),

          hasEnoughStock:
            toNonNegativeInteger(
              bonusProduct.stock,
            ) >= totalBonusQuantity,
        }
      : null;

  if (
    !productBonus &&
    totalCoinReward <= 0
  ) {
    return null;
  }

  return {
    productBonus,
    coinRewardPerProduct,
    totalCoinReward,
  };
}

function normalizeCheckoutInput(
  input: CreateCustomerCheckoutOrderInput,
): CreateCustomerCheckoutOrderInput {
  return {
    productId:
      input.productId.trim(),

    quantity:
      Number(input.quantity),

    receiverName:
      input.receiverName.trim(),

    phoneNumber:
      input.phoneNumber.trim(),

    shippingAddress:
      input.shippingAddress.trim(),

    paymentMethod:
      input.paymentMethod,

    checkoutToken:
      input.checkoutToken.trim(),

    confirmationAccepted:
      Boolean(
        input.confirmationAccepted,
      ),
  };
}

function validateCheckoutInput(
  input: CreateCustomerCheckoutOrderInput,
): SecureCheckoutErrorCode | null {
  if (
    !input.productId ||
    !UUID_PATTERN.test(
      input.productId,
    )
  ) {
    return "INVALID_PRODUCT_ID";
  }

  if (
    !input.checkoutToken ||
    !UUID_PATTERN.test(
      input.checkoutToken,
    )
  ) {
    return "INVALID_CHECKOUT_TOKEN";
  }

  if (
    !Number.isInteger(
      input.quantity,
    ) ||
    input.quantity < 1
  ) {
    return "INVALID_QUANTITY";
  }

  if (input.quantity > 100) {
    return "QUANTITY_LIMIT_EXCEEDED";
  }

  if (
    input.receiverName.length < 2
  ) {
    return "INVALID_RECEIVER_NAME";
  }

  if (
    input.receiverName.length > 120
  ) {
    return "RECEIVER_NAME_TOO_LONG";
  }

  if (
    input.phoneNumber.length > 30
  ) {
    return "PHONE_NUMBER_TOO_LONG";
  }

  if (
    input.shippingAddress.length < 10
  ) {
    return "INVALID_SHIPPING_ADDRESS";
  }

  if (
    input.shippingAddress.length > 1000
  ) {
    return "SHIPPING_ADDRESS_TOO_LONG";
  }

  if (input.paymentMethod !== "qris") {
    return "INVALID_PAYMENT_METHOD";
  }

  if (!input.confirmationAccepted) {
    return "CONFIRMATION_REQUIRED";
  }

  return null;
}

function mapCheckoutOrderResult(
  row: CheckoutRpcRow,
): CreateCustomerCheckoutOrderResult {
  return {
    orderId: row.order_id,
    checkoutToken:
      row.checkout_token,

    orderStatus:
      row.order_status,

    paymentMethod:
      row.payment_method,

    paymentStatus:
      row.payment_status,

    amountIdr:
      toNonNegativeNumber(
        row.amount_idr,
      ),

    amountCoin:
      toNonNegativeInteger(
        row.amount_coin,
      ),

    totalCoinsRedeemed:
      toNonNegativeInteger(
        row.total_coins_redeemed,
      ),

    pointsEarned:
      toNonNegativeInteger(
        row.points_earned,
      ),

    remainingPoints:
      toNonNegativeInteger(
        row.remaining_points,
      ),

    expiresAt:
      row.expires_at,

    createdAt:
      row.created_at,

    isExisting:
      row.is_existing,
  };
}

function mapSecureCheckoutErrorCode(
  error: unknown,
): SecureCheckoutErrorCode {
  const text =
    extractErrorText(
      error,
    ).toUpperCase();

  const codes: SecureCheckoutErrorCode[] =
    [
      "PRODUCT_CONFIGURATION_CHANGED",
      "INVALID_BONUS_CONFIGURATION",
      "BONUS_PRODUCT_NOT_AVAILABLE",
      "INSUFFICIENT_BONUS_STOCK",
      "QUANTITY_LIMIT_EXCEEDED",
      "INVALID_SHIPPING_ADDRESS",
      "SHIPPING_ADDRESS_TOO_LONG",
      "INVALID_RECEIVER_NAME",
      "RECEIVER_NAME_TOO_LONG",
      "INVALID_BONUS_COIN_REWARD",
      "PAYMENT_METHOD_NOT_ALLOWED",
      "PAYMENT_RECORD_NOT_FOUND",
      "USER_PROFILE_NOT_FOUND",
      "BONUS_PRODUCT_NOT_FOUND",
      "BONUS_QUANTITY_TOO_LARGE",
      "POINT_REWARD_TOO_LARGE",
      "COIN_AMOUNT_TOO_LARGE",
      "INSUFFICIENT_POINTS",
      "INSUFFICIENT_STOCK",
      "INVALID_CHECKOUT_TOKEN",
      "INVALID_PAYMENT_METHOD",
      "INVALID_PRODUCT_PRICE",
      "INVALID_PRODUCT_ID",
      "INVALID_QUANTITY",
      "PRODUCT_NOT_AVAILABLE",
      "PRODUCT_NOT_FOUND",
      "IDEMPOTENCY_CONFLICT",
      "CONFIRMATION_REQUIRED",
      "UNAUTHENTICATED",
      "CHECKOUT_LOAD_FAILED",
    ];

  return (
    codes.find((code) =>
      text.includes(code),
    ) ?? "CHECKOUT_FAILED"
  );
}

function extractErrorText(
  error: unknown,
): string {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null
  ) {
    const record =
      error as Record<string, unknown>;

    return [
      record.code,
      record.message,
      record.details,
      record.hint,
    ]
      .filter(
        (value): value is string =>
          typeof value === "string",
      )
      .join(" ");
  }

  return "";
}

function serializeUnknownError(
  error: unknown,
) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  try {
    return JSON.parse(
      JSON.stringify(error),
    );
  } catch {
    return String(error);
  }
}

function normalizeOptionalText(
  value: string | null | undefined,
): string | null {
  const normalized =
    value?.trim();

  return normalized || null;
}

function toNonNegativeNumber(
  value: unknown,
): number {
  const parsed =
    typeof value === "number"
      ? value
      : Number(value);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, parsed);
}

function toNonNegativeInteger(
  value: unknown,
): number {
  return Math.floor(
    toNonNegativeNumber(value),
  );
}