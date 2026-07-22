import type { QueryData } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabaseClient";
import { translateSupabaseError } from "@/lib/supabaseError";
import type { BaseResponse } from "@/types/common";
import type {
  BrandWorkshopItem,
  BrandWorkshopFilterOptions,
} from "@/types/brandWorkshop";

/** Payload for creating a new workshop entry. */
export interface CreateWorkshopPayload {
  title: string;
  speakerName: string;
  speakerRole: string;
  location: string;
  description: string;
  pointCost: number;
  heldAt: string; // ISO 8601 datetime string
  detail: string;
  quota: number;
  /** Public URL of the uploaded banner image, or null if not uploaded yet */
  bannerUrl: string | null;
}

/** Payload for updating an existing workshop entry. */
export interface UpdateWorkshopPayload extends CreateWorkshopPayload {
  isPublished: boolean;
}

const BRAND_WORKSHOP_SELECT = `
  id,
  brand_id,
  title,
  description,
  detail,
  speaker_name,
  speaker_role,
  location,
  banner_url,
  point_cost,
  quota,
  held_at,
  is_published,
  created_at,
  updated_at,

  workshop_registrations (
    status
  )
` as const;

const brandWorkshopQuery = supabase
  .from("workshops")
  .select(BRAND_WORKSHOP_SELECT);

type BrandWorkshopRow = QueryData<typeof brandWorkshopQuery>[number];

/**
 * Fetches all workshop entries belonging to a specific brand,
 * with optional filtering for publication status and search queries.
 *
 * @param brandId Auth User ID of the brand
 * @param options Optional filter settings for publication status and search text
 * @returns BaseResponse wrapping an array of BrandWorkshopItem
 */
export async function getBrandWorkshops(
  brandId: string,
  options?: BrandWorkshopFilterOptions
): Promise<BaseResponse<BrandWorkshopItem[]>> {
  try {
    let query = supabase
      .from("workshops")
      .select(BRAND_WORKSHOP_SELECT)
      .eq("brand_id", brandId);

    // Apply publication status filter
    if (options?.statusFilter === "published") {
      query = query.eq("is_published", true);
    } else if (options?.statusFilter === "draft") {
      query = query.or("is_published.eq.false,is_published.is.null");
    }

    // Apply search query filter across title, speaker_name, and location
    if (options?.searchQuery?.trim()) {
      const q = options.searchQuery.trim();
      query = query.or(
        `title.ilike.%${q}%,speaker_name.ilike.%${q}%,location.ilike.%${q}%`
      );
    }

    // Order by created_at descending
    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      return {
        success: false,
        error: translateSupabaseError(error),
      };
    }

    const workshops = (data ?? []).map(mapBrandWorkshopItem);

    return {
      success: true,
      data: workshops,
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

function mapBrandWorkshopItem(row: BrandWorkshopRow): BrandWorkshopItem {
  const registrations = row.workshop_registrations ?? [];

  const registeredCount = registrations.filter(
    (reg) => reg.status === "registered" || reg.status === "attended"
  ).length;

  const quota = toNumber(row.quota);
  const remainingSlots = Math.max(quota - registeredCount, 0);

  return {
    id: row.id,
    brandId: row.brand_id,

    title: row.title,
    description: row.description,
    detail: row.detail,

    speakerName: row.speaker_name,
    speakerRole: row.speaker_role,

    location: row.location,
    bannerUrl: row.banner_url,

    heldAt: row.held_at,
    quota,
    registeredCount,
    remainingSlots,

    pointCost: toNumber(row.point_cost),
    isPublished: Boolean(row.is_published),

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toNumber(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Creates a new workshop entry for the given brand.
 *
 * @param brandId Auth User ID of the brand
 * @param payload Workshop data to insert
 * @returns BaseResponse wrapping the created BrandWorkshopItem
 */
export async function createWorkshop(
  brandId: string,
  payload: CreateWorkshopPayload
): Promise<BaseResponse<BrandWorkshopItem>> {
  try {
    const { data: inserted, error: insertError } = await supabase
      .from("workshops")
      .insert({
        brand_id: brandId,
        title: payload.title,
        speaker_name: payload.speakerName,
        speaker_role: payload.speakerRole,
        location: payload.location,
        description: payload.description,
        point_cost: payload.pointCost,
        held_at: payload.heldAt,
        detail: payload.detail,
        quota: payload.quota,
        banner_url: payload.bannerUrl ?? null,
        is_published: false,
      })
      .select(BRAND_WORKSHOP_SELECT)
      .single();

    if (insertError) {
      return {
        success: false,
        error: translateSupabaseError(insertError),
      };
    }

    return {
      success: true,
      data: mapBrandWorkshopItem(inserted as BrandWorkshopRow),
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

/**
 * Uploads a workshop banner image to Supabase storage.
 * Stores under "workshops/{brandId}/banner/" in the "Muri" bucket.
 *
 * @param brandId Auth User ID of the brand
 * @param file Image File to upload
 * @returns Public URL of the uploaded image
 */
export async function uploadWorkshopBanner(
  brandId: string,
  file: File
): Promise<string> {
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
  // Path must start with brandId to satisfy storage RLS policy (same pattern as wasteMediaService)
  const filePath = `${brandId}/workshops/banner/${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 9)}_${sanitizedName}`;

  const { error } = await supabase.storage
    .from("Muri")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Gagal mengunggah banner: ${error.message}`);
  }

  const { data } = supabase.storage.from("Muri").getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Updates an existing workshop entry.
 *
 * @param workshopId ID of the workshop to update
 * @param payload Workshop data to update
 * @returns BaseResponse wrapping the updated BrandWorkshopItem
 */
export async function updateWorkshop(
  workshopId: string,
  payload: UpdateWorkshopPayload
): Promise<BaseResponse<BrandWorkshopItem>> {
  try {
    const { data: updated, error: updateError } = await supabase
      .from("workshops")
      .update({
        title: payload.title,
        speaker_name: payload.speakerName,
        speaker_role: payload.speakerRole,
        location: payload.location,
        description: payload.description,
        point_cost: payload.pointCost,
        held_at: payload.heldAt,
        detail: payload.detail,
        quota: payload.quota,
        banner_url: payload.bannerUrl,
        is_published: payload.isPublished,
        updated_at: new Date().toISOString(),
      })
      .eq("id", workshopId)
      .select(BRAND_WORKSHOP_SELECT)
      .single();

    if (updateError) {
      return {
        success: false,
        error: translateSupabaseError(updateError),
      };
    }

    return {
      success: true,
      data: mapBrandWorkshopItem(updated as BrandWorkshopRow),
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

/**
 * Deletes a workshop entry by ID.
 *
 * @param workshopId ID of the workshop to delete
 * @returns BaseResponse with success status
 */
export async function deleteWorkshop(
  workshopId: string
): Promise<BaseResponse<boolean>> {
  try {
    const { error: deleteError } = await supabase
      .from("workshops")
      .delete()
      .eq("id", workshopId);

    if (deleteError) {
      return {
        success: false,
        error: translateSupabaseError(deleteError),
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
