import type { AddressJSONB } from "@/components/shared/LocationPicker";

/**
 * Converts a raw address string into an AddressJSONB object for LocationPicker.
 */
export function stringToAddressJSONB(raw: string | null | undefined): AddressJSONB {
  if (!raw) {
    return {
      formatted_address: "",
      latitude: 0,
      longitude: 0,
      address_detail: "",
    };
  }

  if (raw.includes(" — ")) {
    const parts = raw.split(" — ");
    return {
      formatted_address: parts[0].trim(),
      latitude: 0,
      longitude: 0,
      address_detail: parts.slice(1).join(" — "),
    };
  }

  if (raw.includes(" - ")) {
    const parts = raw.split(" - ");
    return {
      formatted_address: parts[0].trim(),
      latitude: 0,
      longitude: 0,
      address_detail: parts.slice(1).join(" - "),
    };
  }

  return {
    formatted_address: "",
    latitude: 0,
    longitude: 0,
    address_detail: raw,
  };
}

/**
 * Converts an AddressJSONB object into a single formatted address string.
 */
export function addressJSONBToString(loc: AddressJSONB | null | undefined): string {
  if (!loc) return "";
  const formatted = loc.formatted_address ? loc.formatted_address.trim() : "";
  const detail = loc.address_detail ?? "";

  if (formatted) {
    return detail ? `${formatted} — ${detail}` : `${formatted} — `;
  }

  return detail;
}
