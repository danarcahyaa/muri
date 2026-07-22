import type { QueryData } from "@supabase/supabase-js";

import { WorkshopRegistrationStatus } from "@/enums/enum";
import { supabase } from "@/lib/supabaseClient";
import { translateSupabaseError } from "@/lib/supabaseError";
import type { BaseResponse } from "@/types/common";
import type {
  CustomerWorkshopHistoryItem,
  CustomerWorkshopRegistration,
  RegisterWorkshopResult,
  WorkshopRegistrationErrorCode,
} from "@/types/customerWorkshop";
import type { Database } from "@/types/database";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const REGISTRATION_SELECT = `
  id,
  workshop_id,
  points_redeemed,
  status,
  created_at,
  updated_at,
  attended_at,
  cancelled_at
` as const;

const REGISTRATION_HISTORY_SELECT = `
  id,
  workshop_id,
  points_redeemed,
  status,
  created_at,
  updated_at,
  attended_at,
  cancelled_at,

  workshops (
    id,
    title,
    speaker_name,
    speaker_role,
    location,
    held_at,
    banner_url
  )
` as const;

const registrationTypeQuery = supabase
  .from("workshop_registrations")
  .select(REGISTRATION_SELECT);

type RegistrationQueryRow = QueryData<typeof registrationTypeQuery>[number];

const registrationHistoryTypeQuery = supabase
  .from("workshop_registrations")
  .select(REGISTRATION_HISTORY_SELECT);

type RegistrationHistoryQueryRow = QueryData<
  typeof registrationHistoryTypeQuery
>[number];

type RegisterWorkshopRpcReturns =
  Database["public"]["Functions"]["register_customer_workshop"]["Returns"];

type RegisterWorkshopRpcRow = RegisterWorkshopRpcReturns[number];

const REGISTRATION_ERROR_CODES: readonly WorkshopRegistrationErrorCode[] = [
  "UNAUTHENTICATED",
  "INVALID_WORKSHOP_ID",
  "WORKSHOP_NOT_FOUND",
  "WORKSHOP_ALREADY_STARTED",
  "WORKSHOP_FULL",
  "ALREADY_REGISTERED",
  "INSUFFICIENT_POINTS",
  "USER_PROFILE_NOT_FOUND",
  "REGISTRATION_FAILED",
];

/**
 * Mendaftarkan customer yang sedang login ke workshop.
 *
 * Pengecekan kuota, pemotongan poin, pembuatan registrasi,
 * dan pencatatan ledger dilakukan atomik di PostgreSQL.
 */
export async function registerWorkshop(
  workshopId: string,
): Promise<BaseResponse<RegisterWorkshopResult>> {
  try {
    const normalizedWorkshopId = workshopId.trim();

    if (!normalizedWorkshopId || !UUID_PATTERN.test(normalizedWorkshopId)) {
      return {
        success: false,
        error: "INVALID_WORKSHOP_ID",
      };
    }

    const { data, error } = await supabase.rpc("register_customer_workshop", {
      p_workshop_id: normalizedWorkshopId,
    });

    if (error) {
      return {
        success: false,
        error: mapWorkshopRegistrationError(error),
      };
    }

    const row: RegisterWorkshopRpcRow | undefined = data?.[0];

    if (!row) {
      return {
        success: false,
        error: "REGISTRATION_FAILED",
      };
    }

    const status = parseRegistrationStatus(row.registration_status);

    if (!status) {
      return {
        success: false,
        error: "REGISTRATION_FAILED",
      };
    }

    return {
      success: true,
      data: {
        registrationId: row.registration_id,
        workshopId: row.workshop_id,

        status,

        pointsSpent: toNonNegativeInteger(row.points_spent),
        remainingPoints: toNonNegativeInteger(row.remaining_points),

        registeredAt: row.registered_at,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

/**
 * Mengambil registrasi aktif customer untuk satu workshop.
 *
 * Karena ada partial unique index, maksimal hanya ada satu
 * registrasi aktif untuk user dan workshop yang sama.
 */
export async function getMyActiveWorkshopRegistration(
  workshopId: string,
): Promise<BaseResponse<CustomerWorkshopRegistration | null>> {
  try {
    const normalizedWorkshopId = workshopId.trim();

    if (!normalizedWorkshopId || !UUID_PATTERN.test(normalizedWorkshopId)) {
      return {
        success: true,
        data: null,
      };
    }

    const { data, error } = await supabase
      .from("workshop_registrations")
      .select(REGISTRATION_SELECT)
      .eq("workshop_id", normalizedWorkshopId)
      .in("status", [
        WorkshopRegistrationStatus.REGISTERED,
        WorkshopRegistrationStatus.ATTENDED,
      ])
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

    const registration = mapRegistration(data);

    if (!registration) {
      return {
        success: false,
        error: "Status registrasi workshop tidak valid.",
      };
    }

    return {
      success: true,
      data: registration,
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

/**
 * Mengambil seluruh riwayat registrasi milik customer.
 *
 * RLS memastikan data customer lain tidak ikut terbaca.
 */
export async function getMyWorkshopRegistrations(): Promise<
  BaseResponse<CustomerWorkshopRegistration[]>
> {
  try {
    const { data, error } = await supabase
      .from("workshop_registrations")
      .select(REGISTRATION_SELECT)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      return {
        success: false,
        error: translateSupabaseError(error),
      };
    }

    const registrations = (data ?? [])
      .map(mapRegistration)
      .filter(
        (registration): registration is CustomerWorkshopRegistration =>
          registration !== null,
      );

    return {
      success: true,
      data: registrations,
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

/**
 * Mengambil riwayat workshop customer beserta
 * informasi workshop yang diperlukan dashboard.
 *
 * RLS pada workshop_registrations memastikan
 * customer hanya membaca registrasinya sendiri.
 */
export async function getMyWorkshopHistory(): Promise<
  BaseResponse<CustomerWorkshopHistoryItem[]>
> {
  try {
    const { data, error } = await supabase
      .from("workshop_registrations")
      .select(REGISTRATION_HISTORY_SELECT)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      return {
        success: false,
        error: translateSupabaseError(error),
      };
    }

    const history = (data ?? [])
      .map(mapWorkshopHistoryItem)
      .filter((item): item is CustomerWorkshopHistoryItem => item !== null);

    return {
      success: true,
      data: history,
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

/**
 * Mengubah error code database menjadi pesan untuk customer.
 */
export function getWorkshopRegistrationErrorMessage(error: unknown): string {
  switch (error) {
    case "UNAUTHENTICATED":
      return "Silakan masuk terlebih dahulu untuk mendaftar workshop.";

    case "INVALID_WORKSHOP_ID":
      return "Workshop yang dipilih tidak valid.";

    case "WORKSHOP_NOT_FOUND":
      return "Workshop tidak ditemukan atau belum dipublikasikan.";

    case "WORKSHOP_ALREADY_STARTED":
      return "Pendaftaran ditutup karena workshop sudah dimulai.";

    case "WORKSHOP_FULL":
      return "Kuota workshop sudah penuh.";

    case "ALREADY_REGISTERED":
      return "Anda sudah terdaftar pada workshop ini.";

    case "INSUFFICIENT_POINTS":
      return "Poin Anda belum cukup untuk mengikuti workshop ini.";

    case "USER_PROFILE_NOT_FOUND":
      return "Profil customer belum tersedia. Silakan masuk kembali.";

    default:
      return "Pendaftaran workshop gagal. Silakan coba kembali.";
  }
}

function mapRegistration(
  row: RegistrationQueryRow,
): CustomerWorkshopRegistration | null {
  const status = parseRegistrationStatus(row.status);

  if (!status) {
    return null;
  }

  return {
    id: row.id,
    workshopId: row.workshop_id,

    status,

    pointsSpent: toNonNegativeInteger(row.points_redeemed),

    createdAt: row.created_at,
    updatedAt: row.updated_at,

    attendedAt: row.attended_at,
    cancelledAt: row.cancelled_at,
  };
}

function mapWorkshopHistoryItem(
  row: RegistrationHistoryQueryRow,
): CustomerWorkshopHistoryItem | null {
  const registration = mapRegistration(row);

  if (!registration) {
    return null;
  }

  const workshop = unwrapRelation(row.workshops);

  return {
    ...registration,

    workshop: workshop
      ? {
          id: workshop.id,

          title: workshop.title,

          speakerName: workshop.speaker_name,
          speakerRole: workshop.speaker_role,

          location: workshop.location,
          heldAt: workshop.held_at,

          bannerUrl: workshop.banner_url,
        }
      : null,
  };
}

function parseRegistrationStatus(
  value: unknown,
): WorkshopRegistrationStatus | null {
  switch (value) {
    case WorkshopRegistrationStatus.REGISTERED:
      return WorkshopRegistrationStatus.REGISTERED;

    case WorkshopRegistrationStatus.ATTENDED:
      return WorkshopRegistrationStatus.ATTENDED;

    case WorkshopRegistrationStatus.CANCELLED:
      return WorkshopRegistrationStatus.CANCELLED;

    default:
      return null;
  }
}

function mapWorkshopRegistrationError(error: {
  code?: string;
  message: string;
}): string {
  /*
   * Defense tambahan bila unique index menangkap
   * request pendaftaran yang terjadi bersamaan.
   */
  if (error.code === "23505") {
    return "ALREADY_REGISTERED";
  }

  const knownCode = REGISTRATION_ERROR_CODES.find((code) =>
    error.message.includes(code),
  );

  if (knownCode) {
    return knownCode;
  }

  return translateSupabaseError(error);
}

function toNonNegativeInteger(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, Math.floor(parsed));
}

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}
