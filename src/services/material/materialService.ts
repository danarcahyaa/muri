import type { QueryData } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabaseClient";
import { translateSupabaseError } from "@/lib/supabaseError";
import type { BaseResponse } from "@/types/common";
import type {
  MaterialCatalogItem,
  MaterialCatalogMedia,
  MaterialDetailItem,
} from "@/types/material";

const MATERIAL_BATCH_SELECT = `
  id,
  batch_code,
  waste_id,
  initial_weight_kg,
  origin_city,
  created_at,

  waste_posts!inner (
    id,
    custom_fabric_name,
    minimum_order_kg,
    price_per_kg,
    details_and_conditions,
    status,

    fabric_categories!inner (
      id,
      name
    ),

    waste_providers!inner (
      id,
      company_name
    ),

    waste_post_media (
      id,
      media_url,
      media_type,
      created_at
    )
  )
` as const;

/**
 * Query khusus untuk mengambil inferred TypeScript type
 * dari nested Supabase query.
 *
 * Query ini tidak dijalankan.
 */
const materialBatchTypeQuery = supabase
  .from("waste_batches")
  .select(MATERIAL_BATCH_SELECT);

type MaterialBatchQueryResult = QueryData<
  typeof materialBatchTypeQuery
>;

type MaterialBatchQueryRow =
  MaterialBatchQueryResult[number];

/**
 * Mengambil seluruh batch material yang:
 * - waste post berstatus active
 * - stok batch masih tersedia
 */
export async function getActiveMaterialBatches(): Promise<
  BaseResponse<MaterialCatalogItem[]>
> {
  try {
    const { data, error } = await supabase
      .from("waste_batches")
      .select(MATERIAL_BATCH_SELECT)
      .eq("waste_posts.status", "active")
      .gt("initial_weight_kg", 0)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      return {
        success: false,
        error: translateSupabaseError(error),
      };
    }

    const materials = (data ?? [])
      .map(mapMaterialBatch)
      .filter(
        (
          material,
        ): material is MaterialCatalogItem =>
          material !== null,
      );

    return {
      success: true,
      data: materials,
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

function mapMaterialBatch(
  row: MaterialBatchQueryRow,
): MaterialCatalogItem | null {
  const wastePost = row.waste_posts;

  if (!wastePost) {
    return null;
  }

  const category = wastePost.fabric_categories;
  const provider = wastePost.waste_providers;

  if (!category || !provider) {
    return null;
  }

  const media = normalizeMedia(
    wastePost.waste_post_media ?? [],
  );

  const customFabricName =
    wastePost.custom_fabric_name?.trim();

  return {
    batchId: row.id,
    batchCode: row.batch_code,
    wastePostId: wastePost.id,

    title: customFabricName || category.name,
    description: wastePost.details_and_conditions,

    categoryId: category.id,
    categoryName: category.name,

    providerId: provider.id,
    providerName: provider.company_name,

    originCity: row.origin_city,

    initialWeightKg: toNumber(
      row.initial_weight_kg,
    ),

    availableWeightKg: toNumber(
      row.initial_weight_kg,
    ),

    minimumOrderKg: toNumber(
      wastePost.minimum_order_kg,
    ),

    pricePerKg: toNumber(
      wastePost.price_per_kg,
    ),

    status: wastePost.status,

    media,
    imageUrl: media[0]?.url ?? null,

    createdAt: row.created_at,
  };
}

function normalizeMedia(
  mediaRows: MaterialBatchQueryRow["waste_posts"]["waste_post_media"],
): MaterialCatalogMedia[] {
  return [...(mediaRows ?? [])]
    .sort((first, second) => {
      const firstDate =
        first.created_at ?? "9999-12-31";

      const secondDate =
        second.created_at ?? "9999-12-31";

      const dateComparison =
        firstDate.localeCompare(secondDate);

      if (dateComparison !== 0) {
        return dateComparison;
      }

      return first.id.localeCompare(second.id);
    })
    .map((media) => ({
      id: media.id,
      url: media.media_url,
      type: media.media_type,
      createdAt: media.created_at,
    }));
}

function toNumber(value: unknown): number {
  const parsed =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

const MATERIAL_DETAIL_SELECT = `
  id,
  batch_code,
  waste_id,
  initial_weight_kg,
  origin_city,
  created_at,

  waste_posts!inner (
    id,
    provider_id,
    fabric_category_id,
    custom_fabric_name,
    weight_kg,
    minimum_order_kg,
    price_per_kg,
    details_and_conditions,
    created_at,
    updated_at,
    status,

    fabric_categories!inner (
      id,
      name
    ),

    waste_providers!inner (
      id,
      company_name,
      created_at
    ),

    waste_post_media (
      id,
      media_url,
      media_type,
      created_at
    )
  )
` as const;

const materialDetailTypeQuery = supabase
  .from("waste_batches")
  .select(MATERIAL_DETAIL_SELECT);

type MaterialDetailQueryRow = QueryData<
  typeof materialDetailTypeQuery
>[number];

/**
 * Mengambil satu material berdasarkan batch_code.
 *
 * Hanya material aktif dengan stok yang masih tersedia
 * yang dapat dibuka pada katalog publik.
 */
export async function getMaterialBatchByCode(
  batchCode: string,
): Promise<BaseResponse<MaterialDetailItem | null>> {
  try {
    const normalizedBatchCode = batchCode.trim();

    if (!normalizedBatchCode) {
      return {
        success: true,
        data: null,
      };
    }

    const { data, error } = await supabase
      .from("waste_batches")
      .select(MATERIAL_DETAIL_SELECT)
      .eq("batch_code", normalizedBatchCode)
      .eq("waste_posts.status", "active")
      .gt("current_available_weight_kg", 0)
      .maybeSingle();

    if (error) {
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

    const material = mapMaterialDetail(data);

    return {
      success: true,
      data: material,
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

function mapMaterialDetail(
  row: MaterialDetailQueryRow,
): MaterialDetailItem | null {
  const wastePost = row.waste_posts;

  if (!wastePost) {
    return null;
  }

  const category = wastePost.fabric_categories;
  const provider = wastePost.waste_providers;

  if (!category || !provider) {
    return null;
  }

  const media = normalizeDetailMedia(
    wastePost.waste_post_media ?? [],
  );

  const imageMedia = media.filter((item) => {
    const mediaType = String(item.type).toLowerCase();

    return (
      mediaType === "image" ||
      mediaType === "photo" ||
      mediaType === "picture"
    );
  });

  const customFabricName =
    wastePost.custom_fabric_name?.trim();

  return {
    batchId: row.id,
    batchCode: row.batch_code,
    wastePostId: wastePost.id,

    title: customFabricName || category.name,
    descriptionHtml:
      wastePost.details_and_conditions,

    categoryId: category.id,
    categoryName: category.name,

    providerId: provider.id,
    providerName: provider.company_name,
    providerCreatedAt: provider.created_at,

    originCity: row.origin_city,

    postWeightKg: toNumber(
      wastePost.weight_kg,
    ),

    initialWeightKg: toNumber(
      row.initial_weight_kg,
    ),

    availableWeightKg: toNumber(
      row.initial_weight_kg,
    ),

    minimumOrderKg: toNumber(
      wastePost.minimum_order_kg,
    ),

    pricePerKg: toNumber(
      wastePost.price_per_kg,
    ),

    status: wastePost.status,

    media,
    primaryImageUrl:
      imageMedia[0]?.url ?? null,

    batchCreatedAt: row.created_at,
    postCreatedAt: wastePost.created_at,
    postUpdatedAt: wastePost.updated_at,
  };
}

function normalizeDetailMedia(
  rows: Array<{
    id: string;
    media_url: string;
    media_type: MaterialCatalogMedia["type"];
    created_at: string | null;
  }>,
): MaterialCatalogMedia[] {
  return [...rows]
    .sort((first, second) => {
      const firstDate =
        first.created_at ?? "9999-12-31";

      const secondDate =
        second.created_at ?? "9999-12-31";

      const dateComparison =
        firstDate.localeCompare(secondDate);

      if (dateComparison !== 0) {
        return dateComparison;
      }

      return first.id.localeCompare(second.id);
    })
    .map((media) => ({
      id: media.id,
      url: media.media_url,
      type: media.media_type,
      createdAt: media.created_at,
    }));
}