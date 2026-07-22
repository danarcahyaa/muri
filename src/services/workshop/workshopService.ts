import type { QueryData } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabaseClient";
import { translateSupabaseError } from "@/lib/supabaseError";
import type { BaseResponse } from "@/types/common";
import type {
  WorkshopCatalogItem,
  WorkshopRegistrationStatus,
} from "@/types/workshop";

const WORKSHOP_CATALOG_SELECT = `
  id,
  brand_id,
  title,
  speaker_name,
  speaker_role,
  location,
  banner_url,
  description,
  point_cost,
  quota,
  held_at,
  created_at,
  updated_at,

  workshop_registrations (
    status
  )
` as const;

/**
 * Digunakan untuk mengambil inferred type
 * dari nested Supabase query.
 */
const workshopCatalogTypeQuery = supabase
  .from("workshops")
  .select(WORKSHOP_CATALOG_SELECT);

type WorkshopCatalogQueryRow = QueryData<
  typeof workshopCatalogTypeQuery
>[number];

/**
 * Mengambil workshop beserta jumlah pendaftaran aktif.
 */
export async function getWorkshops(): Promise<
  BaseResponse<WorkshopCatalogItem[]>
> {
  try {
    const { data, error } = await supabase
      .from("workshops")
      .select(WORKSHOP_CATALOG_SELECT)
      .order("held_at", {
        ascending: true,
      });

    if (error) {
      return {
        success: false,
        error: translateSupabaseError(error),
      };
    }

    const workshops = (data ?? []).map(
      mapWorkshopCatalogItem,
    );

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

function mapWorkshopCatalogItem(
  row: WorkshopCatalogQueryRow,
): WorkshopCatalogItem {
  const registrations =
    row.workshop_registrations ?? [];

  const registeredCount =
    registrations.filter((registration) =>
      isActiveRegistrationStatus(
        registration.status,
      ),
    ).length;

  const quota = toNumber(row.quota);

  const remainingSlots = Math.max(
    quota - registeredCount,
    0,
  );

  return {
    id: row.id,
    brandId: row.brand_id,

    title: row.title,
    descriptionHtml: row.description,

    speakerName: row.speaker_name,
    speakerRole: row.speaker_role,

    location: row.location,
    bannerUrl: row.banner_url,

    pointCost: toNumber(row.point_cost),
    quota,

    registeredCount,
    remainingSlots,
    isFull: remainingSlots <= 0,

    heldAt: row.held_at,

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function isActiveRegistrationStatus(
  status: string,
): status is WorkshopRegistrationStatus {
  return (
    status === "registered" ||
    status === "attended"
  );
}

function toNumber(value: unknown): number {
  const parsed =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Mengambil satu workshop berdasarkan UUID.
 */
export async function getWorkshopById(
  workshopId: string,
): Promise<BaseResponse<WorkshopCatalogItem | null>> {
  try {
    const normalizedWorkshopId = workshopId.trim();

    if (
      !normalizedWorkshopId ||
      !UUID_PATTERN.test(normalizedWorkshopId)
    ) {
      return {
        success: true,
        data: null,
      };
    }

    const { data, error } = await supabase
      .from("workshops")
      .select(WORKSHOP_CATALOG_SELECT)
      .eq("id", normalizedWorkshopId)
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
      data: mapWorkshopCatalogItem(data),
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}