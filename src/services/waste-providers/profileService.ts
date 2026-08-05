import { supabase } from "@/lib/supabaseClient";
import { translateSupabaseError } from "@/lib/supabaseError";
import type { BaseResponse } from "@/types/common";
import type { AddressJSONB } from "@/components/shared/LocationPicker";
import type { Json } from "@/types/database";

export interface WasteProviderProfileData {
  id: string;
  companyName: string;
  email: string;
  activeNumber: string;
  address: AddressJSONB | null;
  addressString: string;
  totalDistributedWaste: number;
  totalIncome: number;
  totalTransaction: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface UpdateWasteProviderProfileInput {
  companyName: string;
  activeNumber: string;
  address: AddressJSONB;
}

export async function getWasteProviderProfile(): Promise<
  BaseResponse<WasteProviderProfileData>
> {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return {
        success: false,
        error: "Akun belum terautentikasi.",
      };
    }

    const userId = authData.user.id;
    const email = authData.user.email ?? "";

    const { data, error } = await supabase
      .from("waste_providers")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      return {
        success: false,
        error: translateSupabaseError(error),
      };
    }

    let parsedAddress: AddressJSONB | null = null;
    let addressString = "";

    if (data.address) {
      if (typeof data.address === "object" && data.address !== null) {
        const rawObj = data.address as Record<string, unknown>;
        parsedAddress = {
          formatted_address: String(rawObj.formatted_address || ""),
          latitude: Number(rawObj.latitude || 0),
          longitude: Number(rawObj.longitude || 0),
          address_detail: String(rawObj.address_detail || rawObj.detail || ""),
        };
        addressString = parsedAddress.formatted_address
          ? `${parsedAddress.formatted_address} — ${parsedAddress.address_detail}`
          : parsedAddress.address_detail;
      } else if (typeof data.address === "string") {
        addressString = data.address;
        parsedAddress = {
          formatted_address: "",
          latitude: 0,
          longitude: 0,
          address_detail: data.address,
        };
      }
    }

    return {
      success: true,
      data: {
        id: data.id,
        companyName: data.company_name,
        email,
        activeNumber: data.active_number,
        address: parsedAddress,
        addressString,
        totalDistributedWaste: Number(data.total_distributed_waste || 0),
        totalIncome: Number(data.total_income || 0),
        totalTransaction: Number(data.total_transaction || 0),
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

export async function updateWasteProviderProfile(
  input: UpdateWasteProviderProfileInput,
): Promise<BaseResponse<WasteProviderProfileData>> {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return {
        success: false,
        error: "Akun belum terautentikasi.",
      };
    }

    const userId = authData.user.id;
    const email = authData.user.email ?? "";

    const normalizedCompanyName = input.companyName.trim();
    const normalizedActiveNumber = input.activeNumber.trim();

    const { data, error } = await supabase
      .from("waste_providers")
      .update({
        company_name: normalizedCompanyName,
        active_number: normalizedActiveNumber,
        address: input.address as unknown as Json,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select("*")
      .single();

    if (error) {
      return {
        success: false,
        error: translateSupabaseError(error),
      };
    }

    let parsedAddress: AddressJSONB | null = null;
    let addressString = "";

    if (data.address) {
      if (typeof data.address === "object" && data.address !== null) {
        const rawObj = data.address as Record<string, unknown>;
        parsedAddress = {
          formatted_address: String(rawObj.formatted_address || ""),
          latitude: Number(rawObj.latitude || 0),
          longitude: Number(rawObj.longitude || 0),
          address_detail: String(rawObj.address_detail || rawObj.detail || ""),
        };
        addressString = parsedAddress.formatted_address
          ? `${parsedAddress.formatted_address} — ${parsedAddress.address_detail}`
          : parsedAddress.address_detail;
      }
    }

    return {
      success: true,
      data: {
        id: data.id,
        companyName: data.company_name,
        email,
        activeNumber: data.active_number,
        address: parsedAddress,
        addressString,
        totalDistributedWaste: Number(data.total_distributed_waste || 0),
        totalIncome: Number(data.total_income || 0),
        totalTransaction: Number(data.total_transaction || 0),
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}
