/**
 * Helper utilities for standard formatting across the MURI workspace.
 * Uses camelCase naming convention as per Muri workspace guidelines.
 */

/**
 * Formats a numeric value into Indonesian Rupiah (IDR).
 * If the value is 1 million or above, formats it as millions (e.g., "Rp 15.6 Jt").
 * Otherwise, formats it with standard Indonesian locale numbering.
 * 
 * @param value The currency numeric value in IDR
 * @returns Formatted currency string
 */
export function formatCurrencyIDR(value: number): string {
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(1)} Jt`;
  }
  return `Rp ${value.toLocaleString("id-ID")}`;
}

/**
 * Formats a weight value with the "Kg" suffix.
 * Uses standard Indonesian locale grouping.
 * 
 * @param value The weight in Kilograms
 * @returns Formatted weight string (e.g. "2.400 Kg")
 */
export function formatWeightKg(value: number): string {
  return `${value.toLocaleString("id-ID")} kg`;
}

/**
 * Formats an ISO date string or Date object into Indonesian date format (e.g., "14 Jul 2026").
 * 
 * @param dateStr ISO date string, Date object, or null
 * @returns Formatted date string or "-" if invalid
 */
export function formatIndonesianDate(dateStr: string | null | Date): string {
  if (!dateStr) return "-";
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  
  // Check if date is valid
  if (isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Formats a number with dot thousand separators (e.g. 1500000 -> "1.500.000").
 */
export function formatThousand(val: number | string): string {
  if (!val && val !== 0) return "";
  const numStr = val.toString().replace(/\D/g, "");
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Parses a dot-separated thousand string back to a raw number (e.g. "1.500.000" -> 1500000).
 */
export function parseThousand(val: string): number {
  const numStr = val.replace(/\./g, "");
  return parseInt(numStr) || 0;
}
