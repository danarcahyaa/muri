export function formatWeight(
  value: number,
): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatMaterialStatus(
  status: string,
): string {
  switch (status) {
    case "active":
      return "Tersedia";

    case "inactive":
      return "Tidak Aktif";

    case "sold_out":
      return "Habis";

    default:
      return status;
  }
}
