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
  fabric_category_snapshot,
  fabric_name_snapshot,
  media_urls_snapshot,

  waste_posts!inner (
    id,
    fabric_category_id,
    minimum_order_kg,
    price_per_kg,
    details_and_conditions,
    status,

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
 * Query ini hanya dipakai agar QueryData dapat mengambil tipe
 * hasil nested select langsung dari generated Supabase types.
 */
const materialBatchTypeQuery = supabase
  .from("waste_batches")
  .select(MATERIAL_BATCH_SELECT);

type MaterialBatchQueryResult = QueryData<typeof materialBatchTypeQuery>;

type MaterialBatchQueryRow = MaterialBatchQueryResult[number];

interface RawMediaRow {
  id: string;
  media_url: string;
  media_type: string;
  created_at: string | null;
}

/**
 * Mengambil seluruh batch material publik.
 *
 * Catatan stok:
 * schema baru tidak memiliki current_available_weight_kg.
 * Untuk sementara availableWeightKg menggunakan initial_weight_kg.
 * Lihat README untuk rekomendasi penyimpanan stok aktual.
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
      .filter((material): material is MaterialCatalogItem => material !== null);

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

  const provider = wastePost.waste_providers;

  if (!provider) {
    return null;
  }

  const fabricNameSnapshot = normalizeRequiredText(
    row.fabric_name_snapshot,
    "Material tanpa nama",
  );

  const fabricCategorySnapshot = normalizeRequiredText(
    row.fabric_category_snapshot,
    "Tanpa kategori",
  );

  const media = normalizeMaterialMedia(
    row.media_urls_snapshot,
    wastePost.waste_post_media ?? [],
    row.id,
  );

  const initialWeightKg = toNumber(row.initial_weight_kg);

  return {
    batchId: row.id,
    batchCode: row.batch_code,
    wastePostId: wastePost.id,

    /**
     * Nama, kategori, dan media menggunakan snapshot batch.
     * Dengan begitu tampilan batch tidak berubah jika waste post
     * atau media sumber diedit setelah batch dibuat.
     */
    title: fabricNameSnapshot,
    description: wastePost.details_and_conditions,

    categoryId: wastePost.fabric_category_id,
    categoryName: fabricCategorySnapshot,

    fabricNameSnapshot,
    fabricCategorySnapshot,

    providerId: provider.id,
    providerName: provider.company_name,

    originCity: row.origin_city,

    initialWeightKg,

    // Temporary fallback karena schema baru tidak menyimpan stok berjalan.
    availableWeightKg: initialWeightKg,

    minimumOrderKg: toNumber(wastePost.minimum_order_kg),

    pricePerKg: toNumber(wastePost.price_per_kg),

    status: String(wastePost.status),

    media,
    imageUrl: getPrimaryImageUrl(media),

    createdAt: row.created_at,
  };
}

const MATERIAL_DETAIL_SELECT = `
  id,
  batch_code,
  waste_id,
  initial_weight_kg,
  origin_city,
  created_at,
  fabric_category_snapshot,
  fabric_name_snapshot,
  media_urls_snapshot,

  waste_posts!inner (
    id,
    provider_id,
    fabric_category_id,
    weight_kg,
    minimum_order_kg,
    price_per_kg,
    details_and_conditions,
    created_at,
    updated_at,
    status,

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

type MaterialDetailQueryRow = QueryData<typeof materialDetailTypeQuery>[number];

/**
 * Mengambil satu material berdasarkan batch_code.
 *
 * Query lama memakai current_available_weight_kg, tetapi kolom tersebut
 * tidak ada pada schema baru. Karena itu filter sementara memakai
 * initial_weight_kg.
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
      .gt("initial_weight_kg", 0)
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

    return {
      success: true,
      data: mapMaterialDetail(data),
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

  const provider = wastePost.waste_providers;

  if (!provider) {
    return null;
  }

  const fabricNameSnapshot = normalizeRequiredText(
    row.fabric_name_snapshot,
    "Material tanpa nama",
  );

  const fabricCategorySnapshot = normalizeRequiredText(
    row.fabric_category_snapshot,
    "Tanpa kategori",
  );

  const media = normalizeMaterialMedia(
    row.media_urls_snapshot,
    wastePost.waste_post_media ?? [],
    row.id,
  );

  const initialWeightKg = toNumber(row.initial_weight_kg);

  return {
    batchId: row.id,
    batchCode: row.batch_code,
    wastePostId: wastePost.id,

    title: fabricNameSnapshot,
    descriptionHtml: wastePost.details_and_conditions,

    categoryId: wastePost.fabric_category_id,
    categoryName: fabricCategorySnapshot,

    fabricNameSnapshot,
    fabricCategorySnapshot,

    providerId: provider.id,
    providerName: provider.company_name,
    providerCreatedAt: provider.created_at,

    originCity: row.origin_city,

    postWeightKg: toNumber(wastePost.weight_kg),

    initialWeightKg,

    // Temporary fallback karena schema baru tidak menyimpan stok berjalan.
    availableWeightKg: initialWeightKg,

    minimumOrderKg: toNumber(wastePost.minimum_order_kg),

    pricePerKg: toNumber(wastePost.price_per_kg),

    status: String(wastePost.status),

    media,
    primaryImageUrl: getPrimaryImageUrl(media),

    batchCreatedAt: row.created_at,
    postCreatedAt: wastePost.created_at,
    postUpdatedAt: wastePost.updated_at,
  };
}

/**
 * media_urls_snapshot adalah jsonb. Fungsi ini mendukung format:
 *
 * 1. ["https://.../image.jpg"]
 * 2. [{ "url": "...", "type": "image" }]
 * 3. [{ "media_url": "...", "media_type": "image" }]
 * 4. JSON string yang berisi salah satu format di atas
 *
 * Jika snapshot kosong atau tidak valid, media live dari waste_post_media
 * dipakai sebagai fallback untuk data lama.
 */
function normalizeMaterialMedia(
  snapshot: unknown,
  fallbackRows: RawMediaRow[],
  batchId: string,
): MaterialCatalogMedia[] {
  const snapshotMedia = deduplicateMedia(parseSnapshotMedia(snapshot, batchId));

  if (snapshotMedia.length > 0) {
    return snapshotMedia;
  }

  return normalizeLiveMedia(fallbackRows);
}

function parseSnapshotMedia(
  value: unknown,
  idPrefix: string,
): MaterialCatalogMedia[] {
  if (value == null) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      parseSnapshotItem(item, `${idPrefix}-snapshot-${index}`),
    );
  }

  if (typeof value === "string") {
    const normalized = value.trim();

    if (!normalized) {
      return [];
    }

    if (normalized.startsWith("[") || normalized.startsWith("{")) {
      try {
        return parseSnapshotMedia(JSON.parse(normalized), idPrefix);
      } catch {
        // Bukan JSON string; perlakukan sebagai URL biasa.
      }
    }

    return [
      {
        id: `${idPrefix}-snapshot-0`,
        url: normalized,
        type: inferMediaType(normalized),
        createdAt: null,
      },
    ];
  }

  if (typeof value === "object") {
    const objectValue = value as Record<string, unknown>;

    const nestedMedia =
      objectValue.media_urls ??
      objectValue.mediaUrls ??
      objectValue.urls ??
      objectValue.media;

    if (nestedMedia !== undefined) {
      return parseSnapshotMedia(nestedMedia, idPrefix);
    }

    return parseSnapshotItem(objectValue, `${idPrefix}-snapshot-0`);
  }

  return [];
}

function parseSnapshotItem(
  value: unknown,
  fallbackId: string,
): MaterialCatalogMedia[] {
  if (typeof value === "string") {
    const url = value.trim();

    if (!url) {
      return [];
    }

    return [
      {
        id: fallbackId,
        url,
        type: inferMediaType(url),
        createdAt: null,
      },
    ];
  }

  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    return [];
  }

  const item = value as Record<string, unknown>;

  const url = firstNonEmptyString(item.url, item.media_url, item.src);

  if (!url) {
    return [];
  }

  const type =
    firstNonEmptyString(item.type, item.media_type, item.mime_type) ??
    inferMediaType(url);

  return [
    {
      id: firstNonEmptyString(item.id) ?? fallbackId,
      url,
      type,
      createdAt: firstNonEmptyString(item.createdAt, item.created_at) ?? null,
    },
  ];
}

function normalizeLiveMedia(rows: RawMediaRow[]): MaterialCatalogMedia[] {
  return [...rows]
    .sort((first, second) => {
      const firstDate = first.created_at ?? "9999-12-31";

      const secondDate = second.created_at ?? "9999-12-31";

      const dateComparison = firstDate.localeCompare(secondDate);

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

function deduplicateMedia(
  media: MaterialCatalogMedia[],
): MaterialCatalogMedia[] {
  const urls = new Set<string>();

  return media.filter((item) => {
    const normalizedUrl = item.url.trim();

    if (!normalizedUrl || urls.has(normalizedUrl)) {
      return false;
    }

    urls.add(normalizedUrl);
    return true;
  });
}

function getPrimaryImageUrl(media: MaterialCatalogMedia[]): string | null {
  return media.find((item) => isImageMedia(item.type, item.url))?.url ?? null;
}

function isImageMedia(type: string, url: string): boolean {
  const normalizedType = type.trim().toLowerCase();

  if (
    normalizedType === "image" ||
    normalizedType === "photo" ||
    normalizedType === "picture" ||
    normalizedType.startsWith("image/")
  ) {
    return true;
  }

  if (normalizedType === "video" || normalizedType.startsWith("video/")) {
    return false;
  }

  return inferMediaType(url) === "image";
}

function inferMediaType(url: string): string {
  return /\.(mp4|webm|mov|m4v)(?:$|[?#])/i.test(url) ? "video" : "image";
}

function firstNonEmptyString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value !== "string") {
      continue;
    }

    const normalized = value.trim();

    if (normalized) {
      return normalized;
    }
  }

  return null;
}

function normalizeRequiredText(value: unknown, fallback: string): string {
  return firstNonEmptyString(value) ?? fallback;
}

function toNumber(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}
