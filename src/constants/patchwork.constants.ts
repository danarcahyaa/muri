import type {
  FabricType,
  MaterialCondition,
  PieceFormat,
  ProductionLevel,
  SelectOption,
  TargetProduct,
  VisualDirection,
} from "@/types/patchwork";

export const MAX_IMAGES = 4;
export const MAX_TOTAL_BYTES = 4 * 1024 * 1024;
export const MAX_CUSTOM_NOTE = 1000;

export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export const FABRIC_OPTIONS: SelectOption<FabricType>[] = [
  { value: "auto", label: "Deteksi otomatis dari material" },
  { value: "denim", label: "Denim / jeans" },
  { value: "cotton-linen", label: "Katun / linen / canvas" },
  { value: "knit", label: "Knit / jersey / stretch" },
  { value: "synthetic", label: "Sintetis / polyester / nylon" },
  { value: "mixed", label: "Campuran / belum pasti" },
];

export const PIECE_OPTIONS: SelectOption<PieceFormat>[] = [
  { value: "large-panels", label: "Panel besar, lebih dari ±40 cm" },
  { value: "medium-pieces", label: "Potongan sedang, ±15–40 cm" },
  { value: "small-scraps", label: "Perca kecil, kurang dari ±15 cm" },
  { value: "strips", label: "Strip memanjang" },
];

export const CONDITION_OPTIONS: SelectOption<MaterialCondition>[] = [
  { value: "clean", label: "Bersih dan relatif seragam" },
  { value: "mixed", label: "Campuran ketebalan / kondisi" },
  { value: "damaged", label: "Ada noda, lubang, atau area rapuh" },
];

export const TARGET_OPTIONS: SelectOption<TargetProduct>[] = [
  { value: "auto", label: "Biarkan sistem merekomendasikan" },
  { value: "jacket", label: "Jaket / overshirt" },
  { value: "shirt", label: "Kemeja / blouse" },
  { value: "bag", label: "Tas / tote" },
  { value: "accessory", label: "Aksesori kecil" },
  { value: "home", label: "Home textile" },
];

export const PRODUCTION_OPTIONS: SelectOption<ProductionLevel>[] = [
  { value: "basic", label: "Dasar — mesin jahit standar" },
  { value: "standard", label: "Menengah — workshop brand" },
  { value: "advanced", label: "Lanjut — tim sample / tailor ahli" },
];

export const VISUAL_OPTIONS: SelectOption<VisualDirection>[] = [
  { value: "commercial", label: "Komersial bersih" },
  { value: "minimal", label: "Minimal tonal" },
  { value: "graphic", label: "Kontras grafis" },
  { value: "heritage", label: "Craft / heritage" },
];

const OFF_CONTEXT_PATTERNS: RegExp[] = [
  /https?:\/\//i,
  /\b(?:www\.|\.com\b|\.net\b|\.org\b)/i,
  /\b(?:ignore|abaikan)\b.{0,30}\b(?:instruction|instruksi|prompt|aturan)\b/i,
  /\b(?:system prompt|developer message|jailbreak|prompt injection)\b/i,
  /\b(?:buatkan|tuliskan|generate|write)\b.{0,25}\b(?:kode|code|script|artikel|cerita|email|website|aplikasi)\b/i,
  /\b(?:politik|crypto|kripto|resep masakan|game cheat|password|malware)\b/i,
];

export function formatMegabytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function getOptionLabel<T extends string>(
  options: SelectOption<T>[],
  value: T,
): string {
  return options.find((item) => item.value === value)?.label ?? value;
}

export function validateCustomNote(value: string): string | null {
  const note = value.trim();

  if (note.length > MAX_CUSTOM_NOTE) {
    return `Maksimal ${MAX_CUSTOM_NOTE} karakter.`;
  }

  if (note && OFF_CONTEXT_PATTERNS.some((pattern) => pattern.test(note))) {
    return "Catatan hanya untuk warna, siluet, posisi patchwork, fungsi produk, dan detail konstruksi.";
  }

  return null;
}