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

export function formatProductStatus(
  status: string,
): string {
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
        .replace(/\b\w/g, (character) =>
          character.toUpperCase(),
        );
  }
}

export function decodeProductSlug(
  value: string,
): string {
  try {
    return decodeURIComponent(value).trim();
  } catch {
    return value.trim();
  }
}

export function buildTraceabilityHref(
  productionId: string,
): string {
  return `/traceability?production=${encodeURIComponent(
    productionId,
  )}`;
}
