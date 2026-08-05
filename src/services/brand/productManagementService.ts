import { supabase } from "@/lib/supabaseClient";
import { translateSupabaseError } from "@/lib/supabaseError";
import type { BaseResponse } from "@/types/common";
import { resolveProductImage } from "@/services/product/traceabilityService";

export interface BrandProductItem {
  id: string;
  sku: string;
  name: string;
  categoryId: number;
  categoryName: string;
  priceIdr: number;
  stock: number;
  status: "published" | "draft" | string;
  description: string | null;
  productionId?: string | null;
  imageUrl?: string | null;
  createdAt: string | null;
}

export interface SaveBrandProductInput {
  productId?: string;
  name: string;
  sku: string;
  categoryId: number;
  priceIdr: number;
  stock: number;
  description?: string;
  status: "published" | "draft";
  productionId?: string;
  imageUrl?: string;
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
        stock,
        status,
        description,
        production_id,
        image_url,
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
        stock: Number(row.stock ?? 0),
        status: row.status,
        description: row.description ?? null,
        productionId: (row as Record<string, unknown>).production_id
          ? String((row as Record<string, unknown>).production_id)
          : null,
        imageUrl: resolveProductImage(
          row.product_name,
          row.sku,
          (row as Record<string, unknown>).image_url
            ? String((row as Record<string, unknown>).image_url)
            : null
        ),
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

    // Validasi stok produk tidak boleh melebihi target pcs dari batch produksi
    if (input.productionId) {
      const { data: prodData } = await supabase
        .from("brand_productions")
        .select("target_quantity")
        .eq("id", input.productionId)
        .maybeSingle();

      if (
        prodData &&
        prodData.target_quantity !== null &&
        prodData.target_quantity !== undefined
      ) {
        const maxTarget = Number(prodData.target_quantity);
        if (input.stock > maxTarget) {
          return {
            success: false,
            error: `Stok produk (${input.stock} pcs) tidak boleh melebihi pcs produksi (${maxTarget} pcs).`,
          };
        }
      }
    }

    if (input.productId) {
      const { data, error } = await supabase
        .from("products")
        .update({
          product_name: input.name.trim(),
          sku: input.sku.trim().toUpperCase(),
          product_category_id: input.categoryId,
          price_idr: Math.max(0, input.priceIdr),
          stock: Math.max(0, input.stock),
          description: input.description?.trim() || null,
          status: input.status,
          production_id: input.productionId ?? "",
          image_url: input.imageUrl?.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", input.productId)
        .select(`
          id,
          sku,
          product_name,
          product_category_id,
          price_idr,
          stock,
          status,
          description,
          production_id,
          image_url,
          created_at,
          product_categories (
            id,
            category_name
          )
        `)
        .single();

      if (error || !data) {
        return {
          success: false,
          error: translateSupabaseError(error),
        };
      }

      const catUpdate = Array.isArray(data.product_categories)
        ? data.product_categories[0]
        : data.product_categories;

      return {
        success: true,
        data: {
          id: data.id,
          sku: data.sku,
          name: data.product_name,
          categoryId: data.product_category_id,
          categoryName: catUpdate?.category_name ?? "Lainnya",
          priceIdr: Number(data.price_idr),
          stock: Number(data.stock),
          status: data.status,
          description: data.description,
          productionId: (data as Record<string, unknown>).production_id
            ? String((data as Record<string, unknown>).production_id)
            : null,
          imageUrl: (data as Record<string, unknown>).image_url
            ? String((data as Record<string, unknown>).image_url)
            : null,
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
          stock: Math.max(0, input.stock),
          description: input.description?.trim() || null,
          detail: "",
          production_id: input.productionId ?? "",
          status: input.status,
          payment_option: "idr_or_coin",
          image_url: input.imageUrl?.trim() || null,
        })
        .select(`
          id,
          sku,
          product_name,
          product_category_id,
          price_idr,
          stock,
          status,
          description,
          production_id,
          image_url,
          created_at,
          product_categories (
            id,
            category_name
          )
        `)
        .single();

      if (error || !data) {
        return {
          success: false,
          error: translateSupabaseError(error),
        };
      }

      const catInsert = Array.isArray(data.product_categories)
        ? data.product_categories[0]
        : data.product_categories;

      return {
        success: true,
        data: {
          id: data.id,
          sku: data.sku,
          name: data.product_name,
          categoryId: data.product_category_id,
          categoryName: catInsert?.category_name ?? "Lainnya",
          priceIdr: Number(data.price_idr),
          stock: Number(data.stock),
          status: data.status,
          description: data.description,
          productionId: (data as Record<string, unknown>).production_id
            ? String((data as Record<string, unknown>).production_id)
            : null,
          imageUrl: (data as Record<string, unknown>).image_url
            ? String((data as Record<string, unknown>).image_url)
            : null,
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
 * Uploads a product image file to Supabase storage.
 * Stores under "{brandId}/products/{timestamp}_{random}_{sanitizedName}" in the "Muri" bucket.
 */
export async function uploadProductImage(
  file: File,
  brandId?: string
): Promise<string> {
  let activeBrandId = brandId;

  if (!activeBrandId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      throw new Error("Anda harus login sebagai brand untuk mengunggah foto produk.");
    }

    activeBrandId = user.id;
  }

  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
  const filePath = `${activeBrandId}/products/${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 9)}_${sanitizedName}`;

  const { error } = await supabase.storage
    .from("Muri")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Gagal mengunggah foto produk ke storage: ${error.message}`);
  }

  const { data } = supabase.storage.from("Muri").getPublicUrl(filePath);
  return data.publicUrl;
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
