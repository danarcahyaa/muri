import type { ProductPaymentOption } from "@/types/product";

export function formatIdr(value: number): string {
  return `IDR ${new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(value)}`;
}

export function formatDecimal(
  value: number,
  maximumFractionDigits = 2,
): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits,
  }).format(value);
}

export function formatProductStatus(status: string): string {
  switch (status) {
    case "active":
      return "Aktif";
    case "published":
      return "Dipublikasikan";
    case "draft":
      return "Draf";
    case "inactive":
      return "Tidak Aktif";
    case "sold_out":
      return "Habis";
    case "archived":
      return "Diarsipkan";
    default:
      return status
        .replaceAll("_", " ")
        .replace(/\b\w/g, (character) => character.toUpperCase());
  }
}

export function decodeProductSlug(value: string): string {
  try {
    return decodeURIComponent(value).trim();
  } catch {
    return value.trim();
  }
}

export function buildTraceabilityHref(productionId: string): string {
  return `/traceability?batch=${encodeURIComponent(productionId)}`;
}

export function generateTraceabilityQrUrl(
  batchOrProductionId: string,
  origin?: string,
): string {
  const normalizedId = batchOrProductionId.trim().replace(/^#/, "");
  const baseUrl =
    origin ||
    (typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "https://muri.id");
  const targetUrl = `${baseUrl}/traceability?batch=${encodeURIComponent(normalizedId)}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(targetUrl)}`;
}

export function formatCoin(value: number): string {
  return `${new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(Math.max(0, value))} coin`;
}

export function formatProductPaymentOption(
  option: ProductPaymentOption,
): string {
  switch (option) {
    case "idr":
      return "Pembayaran IDR";

    case "coin":
      return "Pembayaran Coin";

    case "idr_or_coin":
      return "IDR atau Coin";

    default:
      return option;
  }
}
