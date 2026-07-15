import { supabase } from "@/lib/supabaseClient";

export type AccountType = "customer" | "brand" | "waste_provider";

export type AccountProfile = {
  type: AccountType;
  name: string;
  dashboardHref: string;
};

const dashboardByType: Record<AccountType, string> = {
  customer: "/dashboard",
  brand: "/brand/dashboard",
  waste_provider: "/waste-providers/dashboard",
};

type QueryError = {
  message: string;
  code?: string | null;
  details?: string | null;
  hint?: string | null;
};

function formatQueryError(
  tableName: string,
  error: QueryError,
): string {
  return [
    `[${tableName}] ${error.message}`,
    error.code ? `code: ${error.code}` : null,
    error.details ? `details: ${error.details}` : null,
    error.hint ? `hint: ${error.hint}` : null,
  ]
    .filter(Boolean)
    .join(" | ");
}

export async function resolveAccountProfile(
  userId: string,
): Promise<AccountProfile | null> {
  const [customerResult, brandResult, wasteProviderResult] =
    await Promise.all([
      supabase
        .from("users")
        .select("full_name")
        .eq("id", userId)
        .maybeSingle(),

      supabase
        .from("brands")
        .select("brand_name")
        .eq("id", userId)
        .maybeSingle(),

      supabase
        .from("waste_providers")
        .select("company_name")
        .eq("id", userId)
        .maybeSingle(),
    ]);

  const queryErrors = [
    customerResult.error
      ? formatQueryError("users", customerResult.error)
      : null,

    brandResult.error
      ? formatQueryError("brands", brandResult.error)
      : null,

    wasteProviderResult.error
      ? formatQueryError(
          "waste_providers",
          wasteProviderResult.error,
        )
      : null,
  ].filter((error): error is string => Boolean(error));

  if (queryErrors.length > 0) {
    throw new Error(queryErrors.join("\n"));
  }

  /*
   * Cegah user menjadi brand dan waste provider
   * pada waktu yang sama.
   */
  if (brandResult.data && wasteProviderResult.data) {
    throw new Error(
      "Data akun tidak valid: user ditemukan di tabel brands dan waste_providers.",
    );
  }

  /*
   * Profil khusus diprioritaskan.
   *
   * User brand atau waste provider mungkin juga memiliki
   * data dasar di tabel users.
   */
  if (brandResult.data) {
    return {
      type: "brand",
      name: brandResult.data.brand_name || "Brand",
      dashboardHref: dashboardByType.brand,
    };
  }

  if (wasteProviderResult.data) {
    return {
      type: "waste_provider",
      name:
        wasteProviderResult.data.company_name ||
        "Penyedia Limbah",
      dashboardHref: dashboardByType.waste_provider,
    };
  }

  if (customerResult.data) {
    return {
      type: "customer",
      name: customerResult.data.full_name || "Pengguna",
      dashboardHref: dashboardByType.customer,
    };
  }

  return null;
}