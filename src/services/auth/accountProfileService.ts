import { supabase } from "@/lib/supabaseClient";

export type AccountType =
  | "customer"
  | "brand"
  | "waste_provider";

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

export async function resolveAccountProfile(
  userId: string,
): Promise<AccountProfile | null> {
  const [
    customerResult,
    brandResult,
    wasteProviderResult,
  ] = await Promise.all([
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

  const queryError =
    customerResult.error ??
    brandResult.error ??
    wasteProviderResult.error;

  if (queryError) {
    throw queryError;
  }

  const matches: AccountProfile[] = [];

  if (customerResult.data) {
    matches.push({
      type: "customer",
      name:
        customerResult.data.full_name ||
        "Pengguna",
      dashboardHref: dashboardByType.customer,
    });
  }

  if (brandResult.data) {
    matches.push({
      type: "brand",
      name:
        brandResult.data.brand_name ||
        "Brand",
      dashboardHref: dashboardByType.brand,
    });
  }

  if (wasteProviderResult.data) {
    matches.push({
      type: "waste_provider",
      name:
        wasteProviderResult.data.company_name ||
        "Penyedia Limbah",
      dashboardHref:
        dashboardByType.waste_provider,
    });
  }

  if (matches.length > 1) {
    throw new Error(
      "Data akun tidak valid: pengguna ditemukan di lebih dari satu tabel profil.",
    );
  }

  return matches[0] ?? null;
}