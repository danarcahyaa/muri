import { supabase } from "@/lib/supabaseClient";

export type AccountType = "customer" | "brand" | "waste_provider";

export type AccountProfile = {
  type: AccountType;
  name: string;
  dashboardHref: string;
  totalPoints: number;
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

function formatQueryError(tableName: string, error: QueryError): string {
  return [
    `[${tableName}] ${error.message}`,
    error.code ? `code: ${error.code}` : null,
    error.details ? `details: ${error.details}` : null,
    error.hint ? `hint: ${error.hint}` : null,
  ]
    .filter(Boolean)
    .join(" | ");
}

async function queryProfiles(userId: string) {
  return Promise.all([
    supabase
      .from("users")
      .select("full_name, total_points")
      .eq("id", userId)
      .maybeSingle(),

    supabase.from("brands").select("brand_name").eq("id", userId).maybeSingle(),

    supabase
      .from("waste_providers")
      .select("company_name")
      .eq("id", userId)
      .maybeSingle(),
  ]);
}

export async function resolveAccountProfile(
  userId: string,
): Promise<AccountProfile | null> {
  let results = await queryProfiles(userId);

  const hasJwtError = results.some(
    (result) => result.error?.code === "PGRST303",
  );

  /*
   * Token bisa rusak, lama, atau gagal divalidasi.
   * Refresh satu kali lalu ulangi query.
   */
  if (hasJwtError) {
    const { error: refreshError } = await supabase.auth.refreshSession();

    if (refreshError) {
      await supabase.auth.signOut({ scope: "local" });

      throw new Error(`Session tidak valid: ${refreshError.message}`);
    }

    results = await queryProfiles(userId);
  }

  const [customerResult, brandResult, wasteProviderResult] = results;

  const queryErrors = [
    customerResult.error
      ? formatQueryError("users", customerResult.error)
      : null,

    brandResult.error ? formatQueryError("brands", brandResult.error) : null,

    wasteProviderResult.error
      ? formatQueryError("waste_providers", wasteProviderResult.error)
      : null,
  ].filter((error): error is string => Boolean(error));

  if (queryErrors.length > 0) {
    throw new Error(queryErrors.join("\n"));
  }

  if (brandResult.data && wasteProviderResult.data) {
    throw new Error(
      "Data akun tidak valid: user ditemukan di tabel brands dan waste_providers.",
    );
  }

  if (brandResult.data) {
    return {
      type: "brand",
      name: brandResult.data.brand_name || "Brand",
      dashboardHref: dashboardByType.brand,
      totalPoints: customerResult.data?.total_points ?? 0,
    };
  }

  if (wasteProviderResult.data) {
    return {
      type: "waste_provider",
      name: wasteProviderResult.data.company_name || "Penyedia Limbah",
      dashboardHref: dashboardByType.waste_provider,
      totalPoints: customerResult.data?.total_points ?? 0,
    };
  }

  if (customerResult.data) {
    return {
      type: "customer",
      name: customerResult.data.full_name || "Pengguna",
      dashboardHref: dashboardByType.customer,
      totalPoints: customerResult.data.total_points ?? 0,
    };
  }

  return null;
}
