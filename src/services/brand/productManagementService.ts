import { supabase } from "@/lib/supabaseClient";
import { translateSupabaseError } from "@/lib/supabaseError";
import type { BaseResponse } from "@/types/common";

export interface BrandProductItem {
  id: string;
  sku: string;
  name: string;
  categoryId: number;
  categoryName: string;
  priceIdr: number;
  priceCoin: number | null;
  stock: number;
  status: "published" | "draft" | string;
  description: string | null;
  createdAt: string | null;
}

export interface SaveBrandProductInput {
  productId?: string;
  name: string;
  sku: string;
  categoryId: number;
  priceIdr: number;
  priceCoin?: number | null;
  stock: number;
  description?: string;
  status: "published" | "draft";
}

/**
 * Mengambil seluruh produk milik brand.
 */
export async function getMyBrandProducts(): Promise<
  BaseResponse<BrandProductItem[]>
> {
  try {
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
      .from("products")
      .select(`
        id,
        sku,
        product_name,
        product_category_id,
        price_idr,
        price_coin,
        stock,
        status,
        description,
        created_at,
        product_categories (
          id,
          category_name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return {
        success: false,
        error: translateSupabaseError(error),
      };
    }

    const items: BrandProductItem[] = (data ?? []).map((row) => {
      const cat = Array.isArray(row.product_categories)
        ? row.product_categories[0]
        : row.product_categories;

      return {
        id: row.id,
        sku: row.sku,
        name: row.product_name,
        categoryId: row.product_category_id,
        categoryName: cat?.category_name ?? "Lainnya",
        priceIdr: Number(row.price_idr ?? 0),
        priceCoin: row.price_coin ? Number(row.price_coin) : null,
        stock: Number(row.stock ?? 0),
        status: row.status,
        description: row.description ?? null,
        createdAt: row.created_at ?? null,
      };
    });

    return {
      success: true,
      data: items,
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

/**
 * Membuat atau memperbarui produk brand.
 */
export async function saveBrandProduct(
  input: SaveBrandProductInput,
): Promise<BaseResponse<BrandProductItem>> {
  try {
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

    // Get brand id
    const { data: brandData, error: brandError } = await supabase
      .from("brands")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (brandError || !brandData) {
      return {
        success: false,
        error: "Data brand tidak ditemukan.",
      };
    }

    if (input.productId) {
      const { data, error } = await supabase
        .from("products")
        .update({
          product_name: input.name.trim(),
          sku: input.sku.trim().toUpperCase(),
          product_category_id: input.categoryId,
          price_idr: Math.max(0, input.priceIdr),
          price_coin: input.priceCoin && input.priceCoin > 0 ? input.priceCoin : null,
          stock: Math.max(0, input.stock),
          description: input.description?.trim() || null,
          status: input.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", input.productId)
        .select()
        .single();

      if (error || !data) {
        return {
          success: false,
          error: translateSupabaseError(error),
        };
      }

      return {
        success: true,
        data: {
          id: data.id,
          sku: data.sku,
          name: data.product_name,
          categoryId: data.product_category_id,
          categoryName: "Produk Brand",
          priceIdr: Number(data.price_idr),
          priceCoin: data.price_coin ? Number(data.price_coin) : null,
          stock: Number(data.stock),
          status: data.status,
          description: data.description,
          createdAt: data.created_at ?? null,
        },
      };
    } else {
      const { data, error } = await supabase
        .from("products")
        .insert({
          brand_id: brandData.id,
          product_name: input.name.trim(),
          sku: input.sku.trim().toUpperCase(),
          product_category_id: input.categoryId,
          price_idr: Math.max(0, input.priceIdr),
          price_coin: input.priceCoin && input.priceCoin > 0 ? input.priceCoin : null,
          stock: Math.max(0, input.stock),
          description: input.description?.trim() || null,
          detail: "",
          production_id: "",
          status: input.status,
          payment_option: "idr_or_coin",
        })
        .select()
        .single();

      if (error || !data) {
        return {
          success: false,
          error: translateSupabaseError(error),
        };
      }

      return {
        success: true,
        data: {
          id: data.id,
          sku: data.sku,
          name: data.product_name,
          categoryId: data.product_category_id,
          categoryName: "Produk Brand",
          priceIdr: Number(data.price_idr),
          priceCoin: data.price_coin ? Number(data.price_coin) : null,
          stock: Number(data.stock),
          status: data.status,
          description: data.description,
          createdAt: data.created_at ?? null,
        },
      };
    }
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

/**
 * Mengubah status produk publik (published vs draft).
 */
export async function toggleBrandProductStatus(
  productId: string,
  newStatus: "published" | "draft",
): Promise<BaseResponse<boolean>> {
  try {
    const { error } = await supabase
      .from("products")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", productId);

    if (error) {
      return {
        success: false,
        error: translateSupabaseError(error),
      };
    }

    return {
      success: true,
      data: true,
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}
