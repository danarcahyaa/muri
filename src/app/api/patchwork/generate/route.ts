import { NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAX_IMAGES = 4;
const MAX_TOTAL_UPLOAD_BYTES = 4 * 1024 * 1024;
const MAX_INPUT_PIXELS = 40_000_000;
const MAX_CUSTOM_NOTE_CHARACTERS = 240;
const MIN_REFERENCE_SIDE = 240;
const CANVAS_SIZE = 1024;
const COLLAGE_PADDING = 24;
const COLLAGE_GAP = 16;

const EDIT_MODEL = process.env.POLLINATIONS_EDIT_MODEL?.trim() || "kontext";
const GENERATION_MODEL =
  process.env.POLLINATIONS_GENERATION_MODEL?.trim() || "zimage";

/**
 * Hard cap for a Pollinations request. A value of 0 disables the app-level
 * timeout, but keeping a finite limit prevents a request from hanging forever.
 */
const POLLINATIONS_TIMEOUT_MS = (() => {
  const value = Number(
    process.env.POLLINATIONS_IMAGE_TIMEOUT_MS ??
      process.env.POLLINATIONS_TIMEOUT_MS ??
      "180000",
  );
  return Number.isFinite(value) && value >= 0 ? value : 180_000;
})();

const MAX_REQUESTS_PER_HOUR = (() => {
  const value = Number(process.env.PATCHWORK_MAX_REQUESTS_PER_HOUR ?? "6");
  return Number.isFinite(value) && value >= 0 ? Math.floor(value) : 6;
})();

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const FABRIC_TYPES = [
  "auto",
  "denim",
  "cotton-linen",
  "knit",
  "synthetic",
  "mixed",
] as const;

const PIECE_FORMATS = [
  "large-panels",
  "medium-pieces",
  "small-scraps",
  "strips",
] as const;

const MATERIAL_CONDITIONS = ["clean", "mixed", "damaged"] as const;

const TARGET_PRODUCTS = [
  "auto",
  "jacket",
  "shirt",
  "bag",
  "accessory",
  "home",
] as const;

const PRODUCTION_LEVELS = ["basic", "standard", "advanced"] as const;
const VISUAL_DIRECTIONS = [
  "commercial",
  "minimal",
  "graphic",
  "heritage",
] as const;

const OFF_CONTEXT_PATTERNS: RegExp[] = [
  /https?:\/\//i,
  /\b(?:www\.|\.com\b|\.net\b|\.org\b)/i,
  /\b(?:ignore|abaikan)\b.{0,30}\b(?:instruction|instruksi|prompt|aturan)\b/i,
  /\b(?:system prompt|developer message|jailbreak|prompt injection)\b/i,
  /\b(?:buatkan|tuliskan|generate|write)\b.{0,25}\b(?:kode|code|script|artikel|cerita|email|website|aplikasi)\b/i,
  /\b(?:politik|crypto|kripto|resep masakan|game cheat|password|malware)\b/i,
];

type SourceMode = "upload" | "purchased";
type FabricType = (typeof FABRIC_TYPES)[number];
type PieceFormat = (typeof PIECE_FORMATS)[number];
type MaterialCondition = (typeof MATERIAL_CONDITIONS)[number];
type TargetProduct = (typeof TARGET_PRODUCTS)[number];
type ProductionLevel = (typeof PRODUCTION_LEVELS)[number];
type VisualDirection = (typeof VISUAL_DIRECTIONS)[number];
type ResolvedFabricType = Exclude<FabricType, "auto">;
type ResolvedProduct = Exclude<TargetProduct, "auto">;

interface DesignBrief {
  fabricType: FabricType;
  pieceFormat: PieceFormat;
  materialCondition: MaterialCondition;
  targetProduct: TargetProduct;
  productionLevel: ProductionLevel;
  visualDirection: VisualDirection;
  customNote: string;
}

interface CuttingPiece {
  name: string;
  qty: string;
  size: string;
  note: string;
}

interface VisualPanelGuide {
  title: string;
  description: string;
}

interface ExecutionPlan {
  recommendationTitle: string;
  productName: string;
  productCategory: string;
  fitReason: string;
  patternTechnique: string;
  difficulty: string;
  productionLevel: string;
  visualDirection: string;
  materialUsage: string;
  wasteTarget: string;
  needleSpec: string;
  threadSpec: string;
  stabilizerSpec: string;
  seamAllowance: string;
  estimatedYield: string;
  cuttingPieces: CuttingPiece[];
  assemblySteps: string[];
  riskNotes: string[];
  qualityChecks: string[];
  alternativeProducts: string[];
  visualPanelGuide: VisualPanelGuide[];
  impactDisclaimer: string;
}

type PollinationsImageResponse = {
  data?: Array<{
    url?: string;
    b64_json?: string;
  }>;
  error?: unknown;
};

type RateBucket = {
  count: number;
  resetAt: number;
};

const globalRateLimit = globalThis as typeof globalThis & {
  __muriPatchworkRateLimit?: Map<string, RateBucket>;
};

const rateLimitStore =
  globalRateLimit.__muriPatchworkRateLimit ?? new Map<string, RateBucket>();

globalRateLimit.__muriPatchworkRateLimit = rateLimitStore;

class RouteError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "RouteError";
    this.status = status;
  }
}

function isUploadedFile(value: unknown): value is File {
  return Boolean(
    value &&
      typeof value !== "string" &&
      typeof (value as File).arrayBuffer === "function" &&
      typeof (value as File).size === "number" &&
      (value as File).size > 0,
  );
}

function normalizeString(value: FormDataEntryValue | null, max = 180): string {
  if (typeof value !== "string") return "";

  return value
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function getSourceMode(value: FormDataEntryValue | null): SourceMode {
  return value === "purchased" ? "purchased" : "upload";
}

function readEnum<T extends readonly string[]>(
  value: FormDataEntryValue | null,
  options: T,
  fallback: T[number],
): T[number] {
  return typeof value === "string" && options.includes(value as T[number])
    ? (value as T[number])
    : fallback;
}

function validateCustomNote(value: FormDataEntryValue | null): string {
  const note = normalizeString(value, MAX_CUSTOM_NOTE_CHARACTERS + 1);

  if (note.length > MAX_CUSTOM_NOTE_CHARACTERS) {
    throw new RouteError(
      422,
      `Catatan desain maksimal ${MAX_CUSTOM_NOTE_CHARACTERS} karakter.`,
    );
  }

  if (note && OFF_CONTEXT_PATTERNS.some((pattern) => pattern.test(note))) {
    throw new RouteError(
      422,
      "Catatan hanya boleh berisi arahan desain fashion, penempatan patchwork, warna, siluet, atau detail konstruksi.",
    );
  }

  return note;
}

function getClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip");
  return ip || "unknown-client";
}

function enforceRateLimit(request: Request): void {
  if (MAX_REQUESTS_PER_HOUR === 0) return;

  const key = getClientKey(request);
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + oneHour });
    return;
  }

  if (current.count >= MAX_REQUESTS_PER_HOUR) {
    throw new RouteError(
      429,
      `Batas ${MAX_REQUESTS_PER_HOUR} generasi per jam tercapai. Periksa kembali brief sebelum mencoba lagi.`,
    );
  }

  current.count += 1;
  rateLimitStore.set(key, current);
}

function getErrorText(value: unknown): string {
  if (typeof value === "string") return value.slice(0, 1_000);

  if (value && typeof value === "object") {
    const maybeMessage = (value as { message?: unknown }).message;
    if (typeof maybeMessage === "string") return maybeMessage.slice(0, 1_000);
  }

  try {
    return JSON.stringify(value).slice(0, 1_000);
  } catch {
    return "Unknown provider error";
  }
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = POLLINATIONS_TIMEOUT_MS,
): Promise<Response> {
  const startedAt = Date.now();
  const controller = timeoutMs > 0 ? new AbortController() : null;
  const timeoutId = controller
    ? setTimeout(() => controller.abort(), timeoutMs)
    : null;

  try {
    const response = await fetch(url, {
      ...init,
      ...(controller ? { signal: controller.signal } : {}),
    });

    console.info("[patchwork/generate] Pollinations response received", {
      status: response.status,
      elapsedMs: Date.now() - startedAt,
      requestClient: "node-native-fetch",
    });

    return response;
  } catch (error) {
    const detail = inspectNetworkError(error);
    const elapsedMs = Date.now() - startedAt;

    console.error("[patchwork/generate] Pollinations fetch failed", {
      elapsedMs,
      ...detail,
      bundledUndiciVersion: process.versions.undici ?? "unknown",
      requestClient: "node-native-fetch",
      configuredAbortTimeoutMs: timeoutMs,
    });

    if (
      error instanceof Error &&
      (error.name === "AbortError" || error.name === "TimeoutError")
    ) {
      throw new RouteError(
        504,
        `Pollinations belum memberikan respons setelah ${Math.round(timeoutMs / 1_000)} detik. Silakan coba generate ulang.`,
      );
    }

    if (
      detail.code === "UND_ERR_CONNECT_TIMEOUT" ||
      detail.code === "UND_ERR_HEADERS_TIMEOUT" ||
      detail.code === "UND_ERR_BODY_TIMEOUT" ||
      detail.code === "ETIMEDOUT" ||
      detail.code === "ECONNRESET" ||
      detail.code === "ENETUNREACH"
    ) {
      throw new RouteError(
        502,
        "Koneksi ke Pollinations terputus atau tidak stabil. Silakan generate ulang.",
      );
    }

    throw new RouteError(
      502,
      detail.message
        ? `Gagal menghubungi Pollinations AI: ${detail.message}`
        : "Gagal menghubungi layanan Pollinations AI.",
    );
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

function inspectNetworkError(error: unknown): {
  name?: string;
  message?: string;
  code?: string;
  causeName?: string;
  causeMessage?: string;
} {
  if (!(error instanceof Error)) return {};

  const errorWithCause = error as Error & {
    code?: unknown;
    cause?: unknown;
  };
  const cause = errorWithCause.cause;
  const causeRecord =
    cause && typeof cause === "object"
      ? (cause as { name?: unknown; message?: unknown; code?: unknown })
      : null;

  const ownCode =
    typeof errorWithCause.code === "string"
      ? errorWithCause.code
      : undefined;
  const causeCode =
    typeof causeRecord?.code === "string" ? causeRecord.code : undefined;

  return {
    name: error.name,
    message: error.message,
    code: causeCode ?? ownCode,
    causeName:
      typeof causeRecord?.name === "string" ? causeRecord.name : undefined,
    causeMessage:
      typeof causeRecord?.message === "string"
        ? causeRecord.message
        : undefined,
  };
}

async function parseProviderResponse(
  response: Response,
): Promise<{ data: PollinationsImageResponse | null; raw: string }> {
  const raw = await response.text();

  if (!raw) return { data: null, raw: "" };

  try {
    return {
      data: JSON.parse(raw) as PollinationsImageResponse,
      raw,
    };
  } catch {
    return {
      data: null,
      raw: raw.slice(0, 1_000),
    };
  }
}

function throwPollinationsError(
  response: Response,
  payload: PollinationsImageResponse | null,
  raw: string,
): never {
  const providerMessage = getErrorText(payload?.error ?? payload ?? raw);

  switch (response.status) {
    case 400:
      throw new RouteError(
        400,
        `Permintaan gambar ditolak Pollinations: ${providerMessage}`,
      );
    case 401:
    case 403:
      throw new RouteError(
        401,
        "API key Pollinations tidak valid, tidak aktif, atau tidak memiliki akses ke model yang dipilih.",
      );
    case 402:
      throw new RouteError(
        402,
        "Saldo atau budget Pollen tidak mencukupi. Periksa key dan saldo Pollinations.",
      );
    case 429:
      throw new RouteError(
        429,
        "Terlalu banyak permintaan ke Pollinations. Tunggu sebentar lalu coba lagi.",
      );
    case 502:
    case 503:
    case 504:
      throw new RouteError(
        503,
        "Layanan model gambar sedang tidak tersedia. Silakan coba kembali beberapa saat lagi.",
      );
    default:
      throw new RouteError(
        502,
        `Pollinations gagal memproses gambar: ${providerMessage}`,
      );
  }
}

function extractGeneratedImage(payload: PollinationsImageResponse | null): string {
  const result = payload?.data?.[0];

  if (result?.url) return result.url;

  if (result?.b64_json) {
    return `data:image/png;base64,${result.b64_json}`;
  }

  throw new RouteError(502, "Pollinations tidak mengembalikan gambar.");
}

async function fileToBuffer(file: File): Promise<Buffer> {
  return Buffer.from(await file.arrayBuffer());
}

async function createReferenceCollage(files: File[]): Promise<Buffer> {
  const columns = Math.ceil(Math.sqrt(files.length));
  const rows = Math.ceil(files.length / columns);
  const availableWidth =
    CANVAS_SIZE - COLLAGE_PADDING * 2 - COLLAGE_GAP * (columns - 1);
  const cellSize = Math.floor(availableWidth / columns);
  const totalHeight = rows * cellSize + COLLAGE_GAP * (rows - 1);
  const topOffset = Math.max(
    COLLAGE_PADDING,
    Math.floor((CANVAS_SIZE - totalHeight) / 2),
  );

  const composites: sharp.OverlayOptions[] = await Promise.all(
    files.map(async (file, index) => {
      const sourceBuffer = await fileToBuffer(file);

      try {
        const metadata = await sharp(sourceBuffer, {
          failOn: "error",
          limitInputPixels: MAX_INPUT_PIXELS,
        }).metadata();

        if (
          !metadata.width ||
          !metadata.height ||
          metadata.width < MIN_REFERENCE_SIDE ||
          metadata.height < MIN_REFERENCE_SIDE
        ) {
          throw new RouteError(
            400,
            `Foto "${file.name || `kain-${index + 1}`}" terlalu kecil. Gunakan minimal ${MIN_REFERENCE_SIDE} × ${MIN_REFERENCE_SIDE} px.`,
          );
        }

        const tileBuffer = await sharp(sourceBuffer, {
          failOn: "error",
          limitInputPixels: MAX_INPUT_PIXELS,
        })
          .rotate()
          .resize(cellSize, cellSize, {
            fit: "cover",
            position: "center",
          })
          .flatten({ background: "#F5F3EC" })
          .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
          .toBuffer();

        return {
          input: tileBuffer,
          left:
            COLLAGE_PADDING +
            (index % columns) * (cellSize + COLLAGE_GAP),
          top:
            topOffset +
            Math.floor(index / columns) * (cellSize + COLLAGE_GAP),
        };
      } catch (error) {
        if (error instanceof RouteError) throw error;

        throw new RouteError(
          400,
          `File "${file.name || `kain-${index + 1}`}" rusak atau tidak didukung.`,
        );
      }
    }),
  );

  return sharp({
    create: {
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      channels: 3,
      background: "#F5F3EC",
    },
  })
    .composite(composites)
    .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
    .toBuffer();
}

function inferFabricType(
  requestedType: FabricType,
  materialTitle: string,
): ResolvedFabricType {
  if (requestedType !== "auto") return requestedType;

  const title = materialTitle.toLowerCase();

  if (/denim|jean/.test(title)) return "denim";
  if (/knit|jersey|rib|spandex|lycra/.test(title)) return "knit";
  if (/linen|cotton|katun|canvas|muslin/.test(title)) return "cotton-linen";
  if (/polyester|nylon|satin|taffeta|synthetic/.test(title)) return "synthetic";

  return "mixed";
}

function resolveProduct(
  requestedProduct: TargetProduct,
  fabricType: ResolvedFabricType,
  pieceFormat: PieceFormat,
): ResolvedProduct {
  if (requestedProduct !== "auto") return requestedProduct;

  if (pieceFormat === "small-scraps") return "bag";
  if (pieceFormat === "strips") return "shirt";
  if (fabricType === "denim") return "jacket";
  if (fabricType === "knit") return "accessory";
  if (fabricType === "cotton-linen") return "shirt";

  return "bag";
}

function getTechnique(pieceFormat: PieceFormat): string {
  switch (pieceFormat) {
    case "large-panels":
      return "Panel Blocking / Colour-Block Patchwork";
    case "small-scraps":
      return "Foundation Crazy Patchwork dengan Backing";
    case "strips":
      return "Strip Piecing Patchwork";
    case "medium-pieces":
    default:
      return "Modular Grid Patchwork";
  }
}

function getFabricSetup(fabricType: ResolvedFabricType) {
  switch (fabricType) {
    case "denim":
      return {
        needle: "Jarum denim #16 (100/16)",
        thread: "Benang poliester core-spun 30–40s",
        stabilizer: "Interfacing woven pada kerah, saku, dan bukaan",
      };
    case "cotton-linen":
      return {
        needle: "Jarum universal #12 (80/12)",
        thread: "Benang katun-poliester 40s",
        stabilizer: "Interfacing ringan pada area struktural",
      };
    case "knit":
      return {
        needle: "Jarum stretch / ballpoint #11 (75/11)",
        thread: "Benang poliester elastis",
        stabilizer: "Tricot fusible atau backing ringan agar panel tidak melar",
      };
    case "synthetic":
      return {
        needle: "Jarum Microtex #10 (70/10)",
        thread: "Benang poliester 40s",
        stabilizer: "Backing ringan; lakukan uji panas sebelum pressing",
      };
    case "mixed":
    default:
      return {
        needle: "Jarum universal #14 (90/14)",
        thread: "Benang poliester all-purpose 40s",
        stabilizer: "Backing nonwoven medium untuk menyamakan karakter panel",
      };
  }
}

function getProductMeta(product: ResolvedProduct) {
  switch (product) {
    case "jacket":
      return {
        category: "Outerwear",
        name: "Patchwork Overshirt Jacket",
        alternatives: ["Structured Tote Bag", "Utility Vest"],
        yield: "1 outerwear sample per ±1,8–2,4 kg material tersortir",
      };
    case "shirt":
      return {
        category: "Apparel",
        name: "Oversized Patchwork Shirt",
        alternatives: ["Boxy Blouse", "Lightweight Kimono"],
        yield: "1 shirt sample per ±1,2–1,7 kg material tersortir",
      };
    case "bag":
      return {
        category: "Accessory",
        name: "Structured Patchwork Tote Bag",
        alternatives: ["Laptop Sleeve", "Bucket Bag"],
        yield: "1–2 tote samples per ±0,8–1,2 kg material tersortir",
      };
    case "accessory":
      return {
        category: "Small Goods",
        name: "Patchwork Accessory Capsule",
        alternatives: ["Pouch Set", "Scarf Panel"],
        yield: "3–6 small goods per ±0,5 kg material tersortir",
      };
    case "home":
    default:
      return {
        category: "Home Textile",
        name: "Patchwork Cushion Cover",
        alternatives: ["Table Runner", "Wall Textile Panel"],
        yield: "2 cushion covers per ±0,8–1 kg material tersortir",
      };
  }
}

function buildCuttingPieces(
  product: ResolvedProduct,
  pieceFormat: PieceFormat,
): CuttingPiece[] {
  const patchNote =
    pieceFormat === "small-scraps"
      ? "Bangun panel dari perca di atas backing sebelum dipotong final"
      : pieceFormat === "strips"
        ? "Gabungkan strip menjadi panel stabil sebelum pemotongan final"
        : "Susun motif dan arah serat sebelum pemotongan final";

  switch (product) {
    case "jacket":
      return [
        { name: "Panel badan depan", qty: "2 pcs", size: "32 × 70 cm", note: patchNote },
        { name: "Panel badan belakang", qty: "1 pcs", size: "62 × 72 cm", note: patchNote },
        { name: "Panel lengan", qty: "2 pcs", size: "26 × 60 cm", note: "Samakan berat dan kelenturan kiri-kanan" },
        { name: "Kerah, manset, dan saku", qty: "Set", size: "Sesuai pola dasar", note: "Gunakan bagian kain paling stabil" },
      ];
    case "shirt":
      return [
        { name: "Panel depan", qty: "2 pcs", size: "30 × 72 cm", note: patchNote },
        { name: "Panel belakang", qty: "1 pcs", size: "60 × 74 cm", note: patchNote },
        { name: "Panel lengan", qty: "2 pcs", size: "24 × 56 cm", note: "Hindari sambungan tebal di siku" },
        { name: "Kerah dan placket", qty: "Set", size: "Sesuai pola dasar", note: "Pilih kain stabil dan tipis" },
      ];
    case "bag":
      return [
        { name: "Panel depan-belakang", qty: "2 pcs", size: "42 × 45 cm", note: patchNote },
        { name: "Panel samping dan dasar", qty: "3 pcs", size: "12 × 42 cm", note: "Tambahkan backing struktural" },
        { name: "Handle", qty: "2 pcs", size: "8 × 70 cm", note: "Gunakan strip terpanjang dan terkuat" },
        { name: "Lining dan kantong", qty: "Set", size: "Sesuai panel luar", note: "Gunakan kain lining baru atau deadstock bersih" },
      ];
    case "accessory":
      return [
        { name: "Panel modular kecil", qty: "6–12 pcs", size: "12 × 18 cm", note: patchNote },
        { name: "Backing", qty: "Sesuai jumlah", size: "12 × 18 cm", note: "Menyamakan ketebalan dan bentuk" },
        { name: "Zipper / binding", qty: "Set", size: "Sesuai produk", note: "Pilih komponen paling sederhana untuk produksi kecil" },
      ];
    case "home":
    default:
      return [
        { name: "Panel muka", qty: "2 pcs", size: "47 × 47 cm", note: patchNote },
        { name: "Panel belakang", qty: "4 pcs", size: "30 × 47 cm", note: "Gunakan bukaan envelope sederhana" },
        { name: "Backing opsional", qty: "2 pcs", size: "47 × 47 cm", note: "Diperlukan untuk material tipis atau perca kecil" },
      ];
  }
}

function buildExecutionPlan(
  brief: DesignBrief,
  materialTitle: string,
): ExecutionPlan {
  const fabricType = inferFabricType(brief.fabricType, materialTitle);
  const product = resolveProduct(
    brief.targetProduct,
    fabricType,
    brief.pieceFormat,
  );
  const technique = getTechnique(brief.pieceFormat);
  const setup = getFabricSetup(fabricType);
  const productMeta = getProductMeta(product);

  const conditionRisk =
    brief.materialCondition === "clean"
      ? "Material siap disortir berdasarkan warna, arah serat, dan gramasi."
      : brief.materialCondition === "mixed"
        ? "Pisahkan panel berdasarkan ketebalan dan elastisitas sebelum penyambungan."
        : "Buang area rapuh, berlubang, bernoda permanen, atau serat yang sudah kehilangan kekuatan.";

  const difficultyLabel =
    brief.productionLevel === "basic"
      ? "Dasar — minim sambungan melengkung"
      : brief.productionLevel === "advanced"
        ? "Lanjut — detail panel dan finishing lebih kompleks"
        : "Menengah — cocok untuk workshop produksi brand";

  const materialUsage =
    brief.pieceFormat === "large-panels"
      ? "Utamakan 70% panel besar sebagai struktur, 30% panel aksen."
      : brief.pieceFormat === "small-scraps"
        ? "Bangun lembar patchwork baru dari perca kecil di atas backing sebelum dipotong pola."
        : brief.pieceFormat === "strips"
          ? "Gabungkan strip searah serat menjadi lembar panel, lalu potong pola final."
          : "Kelompokkan modul berdasarkan ukuran dan warna, lalu susun grid sebelum pemotongan pola.";

  const visualLabels: Record<VisualDirection, string> = {
    commercial: "Komersial bersih",
    minimal: "Minimal tonal",
    graphic: "Kontras grafis",
    heritage: "Craft / heritage",
  };

  const fitReason = `${productMeta.name} dipilih karena format material ${brief.pieceFormat.replaceAll("-", " ")} paling efisien dieksekusi dengan ${technique.toLowerCase()}. Struktur produk ini memberi ruang untuk sambungan patchwork tetap terlihat tanpa mengorbankan fungsi utama produk.`;

  const riskNotes = [
    conditionRisk,
    fabricType === "knit"
      ? "Jangan menggabungkan knit dengan woven tanpa stabilizer karena tingkat mulurnya berbeda."
      : "Uji tarik sambungan dan ketebalan bertumpuk sebelum produksi penuh.",
    brief.pieceFormat === "small-scraps"
      ? "Perca sangat kecil meningkatkan waktu kerja; standarkan modul minimum 6 × 6 cm."
      : "Pertahankan arah serat pada panel utama agar produk tidak melintir.",
  ];

  const assemblySteps = [
    "Sortir material berdasarkan jenis, ketebalan, elastisitas, warna, kerusakan, dan arah serat.",
    `Buat satu lembar uji ${technique.toLowerCase()} berukuran minimal 30 × 30 cm.`,
    `Gunakan ${setup.needle.toLowerCase()} dan uji kombinasi dengan ${setup.thread.toLowerCase()}.`,
    "Stabilkan panel, press sambungan, lalu potong mengikuti pola final dengan toleransi jahitan 1,2–1,5 cm.",
    `Rakit ${productMeta.name.toLowerCase()} dari area struktural menuju detail, lalu lakukan fitting atau load test.`,
    "Lakukan finishing, trimming benang, pemeriksaan simetri, kekuatan sambungan, dan dokumentasi penggunaan material.",
  ];

  return {
    recommendationTitle: "Rekomendasi Eksekusi Utama",
    productName: productMeta.name,
    productCategory: productMeta.category,
    fitReason,
    patternTechnique: technique,
    difficulty: difficultyLabel,
    productionLevel: brief.productionLevel,
    visualDirection: visualLabels[brief.visualDirection],
    materialUsage,
    wasteTarget:
      brief.pieceFormat === "small-scraps"
        ? "Target sisa akhir 5–10%"
        : "Target sisa akhir 8–15%",
    needleSpec: setup.needle,
    threadSpec: setup.thread,
    stabilizerSpec: setup.stabilizer,
    seamAllowance: "1,2–1,5 cm; tambah 0,3 cm pada sambungan tebal",
    estimatedYield: productMeta.yield,
    cuttingPieces: buildCuttingPieces(product, brief.pieceFormat),
    assemblySteps,
    riskNotes,
    qualityChecks: [
      "Sambungan tidak terbuka setelah uji tarik manual 10 detik.",
      "Ketebalan panel kiri dan kanan relatif seimbang.",
      "Tidak ada area rapuh pada titik beban, bukaan, handle, siku, atau bahu.",
      "Produk tetap rata setelah pressing dan tidak melintir saat digantung.",
    ],
    alternativeProducts: productMeta.alternatives,
    visualPanelGuide: [
      {
        title: "Material",
        description:
          "Swatch dan close-up tekstur kain asli tanpa tulisan atau label buatan AI.",
      },
      {
        title: "Hero Look",
        description:
          "Satu tampilan utama produk pada model dari arah depan atau tiga-perempat.",
      },
      {
        title: "Alternate Look",
        description:
          "Model yang berbeda dengan sudut belakang, samping, atau pose bergerak; bukan pengulangan hero look.",
      },
      {
        title: "Construction Detail",
        description:
          "Close-up sambungan, saku, lengan, kerah, atau flat lay konstruksi tanpa teks kecil.",
      },
    ],
    impactDisclaimer:
      "Target limbah adalah estimasi proses. Klaim karbon dan penghematan air harus dihitung dari berat material aktual dan metodologi dampak MURI; tidak dibuat otomatis oleh AI.",
  };
}

function buildGenerationPrompt({
  brief,
  executionPlan,
  materialText,
  imageCount,
}: {
  brief: DesignBrief;
  executionPlan: ExecutionPlan;
  materialText: string;
  imageCount: number;
}): string {
  const referenceRule =
    imageCount > 0
      ? `Use the ${imageCount} uploaded textile reference image(s) faithfully. Preserve the real colors, motif, texture, weave, and visible material character.`
      : "Create a believable textile surface from the supplied material description.";

  const note = brief.customNote
    ? `Design constraint: ${brief.customNote}`
    : "";

  return `
Create one square 2x2 fashion contact sheet made only from four edge-to-edge photographs.

Material: ${materialText}.
Product: ${executionPlan.productName}.
Patchwork technique: ${executionPlan.patternTechnique}.
${referenceRule}
${note}

Show the same coherent product design in four clearly different views:
1. clean product flat lay;
2. model wearing it from a front three-quarter angle;
3. side, back, or movement angle with a different pose;
4. macro close-up of patch seams, stitching, pocket, collar, or construction detail.

Critical rules:
- photographs only;
- no title, text, letters, numbers, labels, captions, logo, watermark, signage, poster, diagram, infographic, paper background, swatch card, or presentation layout;
- no repeated pose or repeated camera angle;
- no unrelated garments or accessories;
- keep the patchwork realistically sewable with believable seams, drape, thickness, and stitching;
- warm neutral studio lighting and premium commercial fashion photography.
`.trim();
}

async function generateFromReference({
  prompt,
  collage,
  apiKey,
}: {
  prompt: string;
  collage: Buffer;
  apiKey: string;
}): Promise<string> {
  // Use Node's matching native fetch + FormData implementation.
  const providerForm = new FormData();
  providerForm.append(
    "image",
    new Blob([new Uint8Array(collage)], { type: "image/jpeg" }),
    "patchwork-reference.jpg",
  );
  providerForm.append("prompt", prompt);
  providerForm.append("model", EDIT_MODEL);
  providerForm.append("size", "1024x1024");
  providerForm.append("n", "1");
  providerForm.append("response_format", "url");

  console.info("[patchwork/generate] Pollinations request prepared", {
    transport: "direct-multipart",
    model: EDIT_MODEL,
    promptCharacters: prompt.length,
    collageKilobytes: Math.round(collage.byteLength / 1024),
    timeoutMs: POLLINATIONS_TIMEOUT_MS,
  });

  const response = await fetchWithTimeout(
    "https://gen.pollinations.ai/v1/images/edits",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      body: providerForm,
      cache: "no-store",
    },
  );

  const { data, raw } = await parseProviderResponse(response);

  if (!response.ok) throwPollinationsError(response, data, raw);

  return extractGeneratedImage(data);
}

async function generateFromText({
  prompt,
  apiKey,
}: {
  prompt: string;
  apiKey: string;
}): Promise<string> {
  const response = await fetchWithTimeout(
    "https://gen.pollinations.ai/v1/images/generations",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        model: GENERATION_MODEL,
        prompt,
        size: "1024x1024",
        n: 1,
        response_format: "url",
      }),
      cache: "no-store",
    },
  );

  const { data, raw } = await parseProviderResponse(response);

  if (!response.ok) throwPollinationsError(response, data, raw);

  return extractGeneratedImage(data);
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.POLLINATIONS_API_KEY?.trim();

    if (!apiKey || !apiKey.startsWith("sk_")) {
      throw new RouteError(
        500,
        "POLLINATIONS_API_KEY belum diset atau bukan secret key Pollinations yang valid.",
      );
    }

    const contentType = request.headers.get("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
      throw new RouteError(415, "Content-Type harus multipart/form-data.");
    }

    const incomingForm = await request.formData().catch(() => null);

    if (!incomingForm) {
      throw new RouteError(400, "Form upload tidak valid atau rusak.");
    }

    const sourceMode = getSourceMode(incomingForm.get("sourceMode"));
    const images = incomingForm.getAll("images").filter(isUploadedFile);
    const legacyImage = incomingForm.get("image");

    if (images.length === 0 && isUploadedFile(legacyImage)) {
      images.push(legacyImage);
    }

    if (sourceMode === "upload" && images.length === 0) {
      throw new RouteError(400, "Minimal upload 1 gambar kain.");
    }

    if (images.length > MAX_IMAGES) {
      throw new RouteError(400, `Maksimal upload ${MAX_IMAGES} gambar.`);
    }

    const invalidImage = images.find(
      (image) =>
        !image.type || !ALLOWED_IMAGE_TYPES.has(image.type.toLowerCase()),
    );

    if (invalidImage) {
      throw new RouteError(
        400,
        "Format gambar yang didukung: JPG, PNG, WebP, dan AVIF.",
      );
    }

    const totalUploadBytes = images.reduce(
      (total, image) => total + image.size,
      0,
    );

    if (totalUploadBytes > MAX_TOTAL_UPLOAD_BYTES) {
      throw new RouteError(
        413,
        "Total upload terlalu besar. Gunakan maksimal 4 MB untuk seluruh gambar.",
      );
    }

    const materialTitle = normalizeString(
      incomingForm.get("materialTitle"),
      160,
    );
    const providerName =
      normalizeString(incomingForm.get("providerName"), 120) ||
      "Waste Provider";

    const brief: DesignBrief = {
      fabricType: readEnum(
        incomingForm.get("fabricType"),
        FABRIC_TYPES,
        "auto",
      ),
      pieceFormat: readEnum(
        incomingForm.get("pieceFormat"),
        PIECE_FORMATS,
        "medium-pieces",
      ),
      materialCondition: readEnum(
        incomingForm.get("materialCondition"),
        MATERIAL_CONDITIONS,
        "clean",
      ),
      targetProduct: readEnum(
        incomingForm.get("targetProduct"),
        TARGET_PRODUCTS,
        "auto",
      ),
      productionLevel: readEnum(
        incomingForm.get("productionLevel"),
        PRODUCTION_LEVELS,
        "standard",
      ),
      visualDirection: readEnum(
        incomingForm.get("visualDirection"),
        VISUAL_DIRECTIONS,
        "commercial",
      ),
      customNote: validateCustomNote(incomingForm.get("customNote")),
    };

    const materialText = materialTitle
      ? `${materialTitle}, supplied by ${providerName}`
      : "upcycled textile waste supplied through the MURI circular ecosystem";

    const executionPlan = buildExecutionPlan(brief, materialTitle);
    const finalPrompt = buildGenerationPrompt({
      brief,
      executionPlan,
      materialText,
      imageCount: images.length,
    });

    // Count only validated requests that are about to consume provider credits.
    enforceRateLimit(request);

    const output =
      sourceMode === "upload"
        ? await generateFromReference({
            prompt: finalPrompt,
            collage: await createReferenceCollage(images),
            apiKey,
          })
        : await generateFromText({
            prompt: finalPrompt,
            apiKey,
          });

    return NextResponse.json(
      {
        success: true,
        output,
        type: sourceMode === "upload" ? "fashion_edit" : "fashion_generation",
        model: sourceMode === "upload" ? EDIT_MODEL : GENERATION_MODEL,
        imageCount: images.length,
        designBrief: brief,
        executionPlan,
        promptText: finalPrompt,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch (error) {
    const status = error instanceof RouteError ? error.status : 500;
    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan yang tidak diketahui.";

    console.error("[patchwork/generate] Error:", {
      status,
      message,
      cause: error,
    });

    return NextResponse.json(
      {
        success: false,
        error: status >= 500 ? "Gagal generate rekomendasi patchwork." : message,
        detail:
          status < 500 || process.env.NODE_ENV !== "production"
            ? message
            : undefined,
      },
      {
        status,
        headers: {
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  }
}
