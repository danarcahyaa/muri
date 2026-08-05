import type { QueryData } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabaseClient";
import { translateSupabaseError } from "@/lib/supabaseError";
import type { BaseResponse } from "@/types/common";
import type { Database } from "@/types/database";
import type { WorkshopCatalogItem } from "@/types/workshop";

const WORKSHOP_CATALOG_SELECT = `
  id,
  brand_id,
  title,
  speaker_name,
  speaker_role,
  location,
  description,
  banner_url,
  point_cost,
  quota,
  held_at,
  created_at,
  updated_at
` as const;

const workshopCatalogTypeQuery = supabase
  .from("workshops")
  .select(WORKSHOP_CATALOG_SELECT);

type WorkshopCatalogQueryRow = QueryData<
  typeof workshopCatalogTypeQuery
>[number];

type WorkshopAvailabilityRpcReturns =
  Database["public"]["Functions"]["get_workshop_availability"]["Returns"];

type WorkshopAvailabilityRpcRow = WorkshopAvailabilityRpcReturns[number];
interface WorkshopAvailability {
  workshopId: string;
  registeredCount: number;
  remainingSlots: number;
  isFull: boolean;
}

function createFallbackAvailability(
  row: WorkshopCatalogQueryRow,
): WorkshopAvailability {
  const quota = toNonNegativeInteger(row.quota);
  return {
    workshopId: row.id,
    registeredCount: 0,
    remainingSlots: quota,
    isFull: quota === 0,
  };
}

/**
 * Mengambil seluruh workshop published beserta
 * aggregate kuota yang aman.
 */
export async function getWorkshops(): Promise<
  BaseResponse<WorkshopCatalogItem[]>
> {
  try {
    const [workshopResponse, availabilityResponse] = await Promise.all([
      supabase
        .from("workshops")
        .select(WORKSHOP_CATALOG_SELECT)
        .order("held_at", {
          ascending: true,
        }),

      Promise.resolve(supabase.rpc("get_workshop_availability")).catch(
        (err: unknown) => ({
          data: null,
          error: err as any,
        }),
      ),
    ]);

    if (workshopResponse.error) {
      return {
        success: false,
        error: translateSupabaseError(workshopResponse.error),
      };
    }

    if (availabilityResponse.error) {
      console.warn(
        "[getWorkshops] Availability RPC error, fallback to quota:",
        availabilityResponse.error,
      );
    }

    const availabilityMap = availabilityResponse.error
      ? new Map<string, WorkshopAvailability>()
      : createAvailabilityMap(availabilityResponse.data ?? []);

    const workshops: WorkshopCatalogItem[] = [];

    for (const row of workshopResponse.data ?? []) {
      const availability =
        availabilityMap.get(row.id) ?? createFallbackAvailability(row);

      workshops.push(mapWorkshopCatalogItem(row, availability));
    }

    return {
      success: true,
      data: workshops,
    };
  } catch (error) {
    console.error("[getWorkshops] Raw error:", error);

    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Mengambil satu workshop published berdasarkan UUID.
 */
export async function getWorkshopById(
  workshopId: string,
): Promise<BaseResponse<WorkshopCatalogItem | null>> {
  try {
    const normalizedWorkshopId = workshopId.trim();

    if (!normalizedWorkshopId || !UUID_PATTERN.test(normalizedWorkshopId)) {
      return {
        success: true,
        data: null,
      };
    }

    const [workshopResponse, availabilityResponse] = await Promise.all([
      supabase
        .from("workshops")
        .select(WORKSHOP_CATALOG_SELECT)
        .eq("id", normalizedWorkshopId)
        .maybeSingle(),

      Promise.resolve(
        supabase.rpc("get_workshop_availability", {
          p_workshop_id: normalizedWorkshopId,
        }),
      ).catch((err: unknown) => ({
        data: null,
        error: err as any,
      })),
    ]);

    if (workshopResponse.error) {
      return {
        success: false,
        error: translateSupabaseError(workshopResponse.error),
      };
    }

    if (!workshopResponse.data) {
      return {
        success: true,
        data: null,
      };
    }

    if (availabilityResponse.error) {
      console.warn(
        "[getWorkshopById] Availability RPC error, fallback to quota:",
        availabilityResponse.error,
      );
    }

    const availabilityRow = availabilityResponse.data?.[0];
    const availability = availabilityRow
      ? mapWorkshopAvailability(availabilityRow)
      : createFallbackAvailability(workshopResponse.data);

    return {
      success: true,
      data: mapWorkshopCatalogItem(
        workshopResponse.data,
        availability,
      ),
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
  availability: WorkshopAvailability,
): WorkshopCatalogItem {
  return {
    id: row.id,
    brandId: row.brand_id,

    title: row.title,
    descriptionHtml: row.description,

    speakerName: row.speaker_name,
    speakerRole: row.speaker_role,

    location: row.location,
    mapsUrl: null,
    bannerUrl: (row as Record<string, unknown>).banner_url
      ? String((row as Record<string, unknown>).banner_url)
      : null,

    pointCost: toNonNegativeInteger(row.point_cost),
    quota: toNonNegativeInteger(row.quota),

    registeredCount: availability.registeredCount,
    remainingSlots: availability.remainingSlots,
    isFull: availability.isFull,

    heldAt: row.held_at,

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function createAvailabilityMap(
  rows: WorkshopAvailabilityRpcRow[],
): Map<string, WorkshopAvailability> {
  return new Map(
    rows.map((row) => {
      const availability = mapWorkshopAvailability(row);

      return [availability.workshopId, availability];
    }),
  );
}

function mapWorkshopAvailability(
  row: WorkshopAvailabilityRpcRow,
): WorkshopAvailability {
  return {
    workshopId: row.workshop_id,

    registeredCount: toNonNegativeInteger(row.registered_count),

    remainingSlots: toNonNegativeInteger(row.remaining_slots),

    isFull: row.is_full,
  };
}

function toNonNegativeInteger(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, Math.floor(parsed));
}
