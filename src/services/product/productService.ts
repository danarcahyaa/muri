import type { QueryData } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabaseClient";
import { translateSupabaseError } from "@/lib/supabaseError";
import type { BaseResponse } from "@/types/common";
import type {
  ProductBonusSummary,
  ProductCatalogItem,
  ProductDetailItem,
} from "@/types/product";
import { resolveProductImage } from "@/services/product/traceabilityService";

/**
 * Query katalog dibuat sengaja ringkas.
 * Data detail hanya diambil saat pengguna membuka halaman produk.
 */
const PRODUCT_CATALOG_SELECT = `
  id,
  product_name,
  sku,
  description,
  image_url,
  payment_option,
  price_idr,
  created_at,
  status,

  brands!inner (
    id,
    brand_name
  ),

  product_categories!inner (
    id,
    category_name
  )
` as const;

const productCatalogTypeQuery = supabase
  .from("products")
  .select(PRODUCT_CATALOG_SELECT);

type ProductCatalogQueryRow = QueryData<typeof productCatalogTypeQuery>[number];

/**
 * Mengambil produk yang boleh tampil pada katalog publik.
 *
 * Ganti filter status menjadi nilai publik yang pasti,
 * misalnya .eq("status", "published"), setelah enum final diketahui.
 */
export async function getPublicProducts(): Promise<
  BaseResponse<ProductCatalogItem[]>
> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_CATALOG_SELECT)
      .eq("status", "published")
      .gt("stock", 0)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      return {
        success: false,
        error: translateSupabaseError(error),
      };
    }

    const products = (data ?? [])
      .map(mapProductCatalogItem)
      .filter((product): product is ProductCatalogItem => product !== null);

    return {
      success: true,
      data: products,
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

function mapProductCatalogItem(
  row: ProductCatalogQueryRow,
): ProductCatalogItem | null {
  const brand = unwrapRelation(row.brands);
  const category = unwrapRelation(row.product_categories);

  if (!brand || !category) {
    return null;
  }

  const slug = row.sku.trim();
  const name = row.product_name.trim();

  if (!slug || !name) {
    return null;
  }

  return {
    id: row.id,
    slug,

    name,
    description: normalizeOptionalText(row.description),
    imageUrl: resolveProductImage(
      row.product_name,
      row.sku,
      (row as Record<string, unknown>).image_url
        ? String((row as Record<string, unknown>).image_url)
        : null
    ),

    paymentOption: row.payment_option,

    priceIdr: toNonNegativeNumber(row.price_idr),

    brandId: brand.id,
    brandName: brand.brand_name,

    categoryId: category.id,
    categoryName: category.category_name,

    createdAt: row.created_at,
  };
}

/**
 * Jangan embed products -> products untuk bonus di query ini.
 * Relasi self-reference sering belum terbaca saat schema cache PostgREST stale.
 * Bonus diambil melalui query kedua menggunakan bonus_product_id.
 */
const PRODUCT_DETAIL_SELECT = `
  id,
  brand_id,
  product_category_id,
  production_id,
  bonus_product_id,
  bonus_product_qty,
  bonus_coin_cost,
  product_name,
  sku,
  description,
  image_url,
  payment_option,
  price_idr,
  stock,
  carbon_saved_kg,
  water_saved_liter,
  detail,
  qr_code_url,
  created_at,
  updated_at,
  status,

  brands!inner (
    id,
    brand_name,
    short_story,
    warehouse_address,
    social_media_links,
    created_at,
    updated_at,
    address,
    warehouse_maps_url
  ),

  product_categories!inner (
    id,
    category_name
  )
` as const;

const productDetailTypeQuery = supabase
  .from("products")
  .select(PRODUCT_DETAIL_SELECT);

type ProductDetailQueryRow = QueryData<typeof productDetailTypeQuery>[number];

const BONUS_PRODUCT_SELECT = `
  id,
  product_name,
  sku,
  price_idr,
  stock,
  status
` as const;

const bonusProductTypeQuery = supabase
  .from("products")
  .select(BONUS_PRODUCT_SELECT);

type BonusProductQueryRow = QueryData<typeof bonusProductTypeQuery>[number];

/**
 * Mengambil satu produk publik berdasarkan SKU.
 * SKU dipakai sebagai URL slug karena bersifat unik pada tabel products.
 */
export async function getProductBySku(
  sku: string,
): Promise<BaseResponse<ProductDetailItem | null>> {
  try {
    const normalizedSku = sku.trim();

    if (!normalizedSku) {
      return {
        success: true,
        data: null,
      };
    }

    let { data, error } = await supabase
      .from("products")
      .select(PRODUCT_DETAIL_SELECT)
      .eq("sku", normalizedSku)
      .maybeSingle();

    if (error) {
      console.error("[getProductBySku] Supabase error:", error);
      return {
        success: false,
        error: translateSupabaseError(error),
      };
    }

    if (!data) {
      return {
        success: true,
        data: null,
      };
    }

    const bonusProduct = data.bonus_product_id
      ? await getAvailableBonusProduct(data.bonus_product_id)
      : null;

    return {
      success: true,
      data: mapProductDetail(data, bonusProduct),
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

/**
 * Bonus bersifat opsional. Bila query bonus gagal atau bonus tidak lagi aktif,
 * halaman produk utama tetap dapat dirender tanpa bonus.
 */
async function getAvailableBonusProduct(
  productId: string,
): Promise<ProductBonusSummary | null> {
  const { data, error } = await supabase
    .from("products")
    .select(BONUS_PRODUCT_SELECT)
    .eq("id", productId)
    .eq("status", "published")
    .gt("stock", 0)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error(
        "[getAvailableBonusProduct] Failed to fetch bonus product:",
        error,
      );
    }

    return null;
  }

  return mapBonusProduct(data);
}

function mapProductDetail(
  row: ProductDetailQueryRow,
  bonusProduct: ProductBonusSummary | null,
): ProductDetailItem | null {
  const brand = unwrapRelation(row.brands);
  const category = unwrapRelation(row.product_categories);

  if (!brand || !category) {
    return null;
  }

  const slug = row.sku.trim();
  const name = row.product_name.trim();

  if (!slug || !name) {
    return null;
  }

  return {
    id: row.id,
    slug,

    name,
    descriptionHtml: normalizeOptionalText(row.description),
    detailHtml: row.detail?.trim() || "",
    imageUrl: resolveProductImage(
      row.product_name,
      row.sku,
      (row as Record<string, unknown>).image_url
        ? String((row as Record<string, unknown>).image_url)
        : null
    ),

    paymentOption: row.payment_option,

    priceIdr: toNonNegativeNumber(row.price_idr),

    stock: toNonNegativeInteger(row.stock),

    carbonSavedKg: toNonNegativeNumber(row.carbon_saved_kg),

    waterSavedLiter: toNonNegativeNumber(row.water_saved_liter),

    status: row.status,
    productionId: row.production_id,
    qrCodeUrl: normalizeExternalUrl(row.qr_code_url),

    brand: {
      id: brand.id,
      name: brand.brand_name,
      shortStory: normalizeOptionalText(brand.short_story),
      address: normalizeOptionalText(brand.address),
      warehouseAddress: normalizeOptionalText(brand.warehouse_address),
      warehouseMapsUrl: normalizeExternalUrl(brand.warehouse_maps_url),
      socialMediaLinks: brand.social_media_links ?? null,
      createdAt: brand.created_at,
      updatedAt: brand.updated_at,
    },

    categoryId: category.id,
    categoryName: category.category_name,

    bonusProduct,
    bonusProductQty: bonusProduct
      ? Math.max(1, toNonNegativeInteger(row.bonus_product_qty))
      : 0,
    bonusCoinCost: bonusProduct ? toNonNegativeInteger(row.bonus_coin_cost) : 0,

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapBonusProduct(
  bonus: BonusProductQueryRow,
): ProductBonusSummary | null {
  if (bonus.status === "published" || toNonNegativeInteger(bonus.stock) <= 0) {
    return null;
  }

  const slug = bonus.sku.trim();
  const name = bonus.product_name.trim();

  if (!slug || !name) {
    return null;
  }

  return {
    id: bonus.id,
    slug,
    name,
    priceIdr: toNumber(bonus.price_idr),
    stock: toNonNegativeInteger(bonus.stock),
    status: bonus.status,
  };
}

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function normalizeOptionalText(
  value: string | null | undefined,
): string | null {
  const normalized = value?.trim();

  return normalized || null;
}

function normalizeExternalUrl(value: string | null | undefined): string | null {
  const normalized = value?.trim();

  if (!normalized) {
    return null;
  }

  try {
    const url = new URL(normalized);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function toNumber(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function toNonNegativeInteger(value: unknown): number {
  return Math.max(0, Math.floor(toNumber(value)));
}

function toNonNegativeNumber(value: unknown): number {
  return Math.max(0, toNumber(value));
}
