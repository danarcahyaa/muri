import { NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAX_IMAGES = 8;
const MAX_TOTAL_UPLOAD_BYTES = 4 * 1024 * 1024;
const MAX_INPUT_PIXELS = 40_000_000;
const MAX_PROMPT_CHARACTERS = 900;
const CANVAS_SIZE = 1024;
const COLLAGE_PADDING = 24;
const COLLAGE_GAP = 16;

const EDIT_MODEL = process.env.POLLINATIONS_EDIT_MODEL?.trim() || "kontext";
const GENERATION_MODEL =
  process.env.POLLINATIONS_GENERATION_MODEL?.trim() || "zimage";

/**
 * 0 disables the application-level timeout. Pollinations image requests may
 * legitimately take longer than three minutes, especially for image editing.
 * The hosting platform may still enforce its own route duration limit.
 */
const POLLINATIONS_TIMEOUT_MS = (() => {
  const value = Number(process.env.POLLINATIONS_TIMEOUT_MS ?? "0");
  return Number.isFinite(value) && value > 0 ? value : 0;
})();

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const DEFAULT_DIRECTION =
  "Create premium upcycled patchwork fashion designs with sustainable circular apparel, zero-waste cutting techniques, and editorial studio presentation.";

type SourceMode = "upload" | "purchased";

type PollinationsImageResponse = {
  data?: Array<{
    url?: string;
    b64_json?: string;
  }>;
  error?: unknown;
};

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

function normalizeString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function getSourceMode(value: FormDataEntryValue | null): SourceMode {
  return value === "purchased" ? "purchased" : "upload";
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

  // Pollinations removed artificial time limits from image generation. Avoid
  // aborting a healthy request unless an explicit timeout is configured.
  if (timeoutMs <= 0) {
    try {
      const response = await fetch(url, init);
      console.info("[patchwork/generate] Pollinations response received", {
        status: response.status,
        elapsedMs: Date.now() - startedAt,
      });
      return response;
    } catch {
      throw new RouteError(502, "Gagal menghubungi layanan Pollinations AI.");
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
    });
    console.info("[patchwork/generate] Pollinations response received", {
      status: response.status,
      elapsedMs: Date.now() - startedAt,
    });
    return response;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "AbortError" || error.name === "TimeoutError")
    ) {
      throw new RouteError(
        504,
        `Pollinations belum selesai setelah ${Math.round(timeoutMs / 1_000)} detik. Naikkan POLLINATIONS_TIMEOUT_MS atau set ke 0 untuk menonaktifkan timeout aplikasi.`,
      );
    }

    throw new RouteError(502, "Gagal menghubungi layanan Pollinations AI.");
  } finally {
    clearTimeout(timeoutId);
  }
}

async function parseProviderResponse(
  response: Response,
): Promise<{ data: PollinationsImageResponse | null; raw: string }> {
  const raw = await response.text();

  if (!raw) {
    return { data: null, raw: "" };
  }

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
        "Saldo atau budget Pollen tidak mencukupi. Periksa key dan saldo di dashboard Pollinations.",
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
      } catch {
        throw new RouteError(
          400,
          `File "${file.name || `image-${index + 1}`}" rusak atau tidak didukung.`,
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

function buildGenerationPrompt({
  userDirection,
  materialText,
  imageCount,
}: {
  userDirection: string;
  materialText: string;
  imageCount: number;
}): string {
  const referenceSection =
    imageCount > 0
      ? `
REFERENCE PRIORITY — MOST IMPORTANT:
- The uploaded reference board contains ${imageCount} real fabric image(s), separated by neutral beige gutters.
- Preserve recognizable motif geometry, color palette, pattern scale, weave, surface texture, and material character.
- Keep every reference fabric visually identifiable in the final products.
- Do not invent unrelated prints, colors, or decorative motifs.
- Reference fidelity is more important than artistic creativity.
`.trim()
      : `
MATERIAL INTERPRETATION:
- No fabric photograph is available for this purchased batch.
- Interpret the material strictly from the supplied material title and provider context.
- Use a believable textile surface appropriate to that material description.
`.trim();

  return `
Create one premium square fashion catalogue image for a circular-fashion brand.

MATERIAL CONTEXT:
${materialText}

${referenceSection}

COMBINATION AND CONSTRUCTION RULES:
- Create an intentional upcycled patchwork composition.
- Use realistic textile drape, seams, folds, stitching, panel joins, and material thickness.
- Apply credible zero-waste cutting logic.

OUTPUT:
- Show exactly 3 coordinated products: one hero garment, one oversized shirt, and one tote bag or accessory.
- Use a clean warm studio background with refined editorial lighting.
- Premium commercial styling, realistic proportions, no mannequin distortion.
- No text, logos, watermarks, extra products, or messy background.

USER DIRECTION:
${userDirection}
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

  if (!response.ok) {
    throwPollinationsError(response, data, raw);
  }

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

  if (!response.ok) {
    throwPollinationsError(response, data, raw);
  }

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

    const promptEntry = normalizeString(incomingForm.get("prompt"));
    const materialTitle = normalizeString(incomingForm.get("materialTitle"));
    const providerName =
      normalizeString(incomingForm.get("providerName")) || "Waste Provider";

    const userDirection = promptEntry
      ? promptEntry.slice(0, MAX_PROMPT_CHARACTERS)
      : DEFAULT_DIRECTION;

    const materialText = materialTitle
      ? `${materialTitle}, supplied by ${providerName}`
      : "upcycled textile waste supplied through the MURI circular ecosystem";

    const finalPrompt = buildGenerationPrompt({
      userDirection,
      materialText,
      imageCount: images.length,
    });

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

    const patternSpecs = getPatternSpecsForFabric(materialTitle);

    return NextResponse.json(
      {
        success: true,
        output,
        type: sourceMode === "upload" ? "fashion_edit" : "fashion_generation",
        model: sourceMode === "upload" ? EDIT_MODEL : GENERATION_MODEL,
        imageCount: images.length,
        patternSpecs,
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
        error: status >= 500 ? "Gagal generate fashion mockup." : message,
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

function getPatternSpecsForFabric(materialTitle: string) {
  const title = (materialTitle || "").toLowerCase();

  if (
    title.includes("denim") ||
    title.includes("jean") ||
    title.includes("jeans")
  ) {
    return {
      productName: "Upcycled Patchwork Denim Jacket & Tote Set",
      patternTechnique: "Grid Block Patchwork Zero-Waste",
      needleSpec: "Jarum Heavy-Duty Denim #16 (100/16)",
      threadSpec: "Benang Poliester Tahan Tarik 30s",
      materialEfficiency: "95% Zero-Waste",
      carbonSaved: "3.6 kg CO₂e",
      waterSaved: "850 Liter",
      cuttingPieces: [
        {
          name: "Panel Badan Utama (Depan & Belakang)",
          qty: "2 Pcs",
          size: "48 cm × 68 cm",
          note: "Potongan simetris ikuti serat denim utama",
        },
        {
          name: "Panel Lengan Patchwork Multi-Tone",
          qty: "2 Pcs",
          size: "22 cm × 58 cm",
          note: "Kombinasi 3 variasi perca denim",
        },
        {
          name: "Kantong Depan & Ornamen Kerah",
          qty: "4 Pcs",
          size: "16 cm × 16 cm",
          note: "Potongan persegi zero-waste",
        },
        {
          name: "Strap & Trim Aksesori Tote Bag",
          qty: "2 Pcs",
          size: "8 cm × 90 cm",
          note: "Sisa lipatan pinggir kain",
        },
      ],
      assemblySteps: [
        "Sortir potongan kain sisa denim berdasarkan warna dan gramasi (14oz).",
        "Potong kain mengikuti dimensi pola dengan toleransi jahitan 1,5 cm.",
        "Gabungkan perca kecil menjadi lembaran panel badan dengan jahitan ganda.",
        "Pasang kantong depan lalu sambungkan bagian bahu dan lengan.",
        "Lakukan obras tepi dan finishing kancing logam sirkular.",
      ],
    };
  }

  if (
    title.includes("linen") ||
    title.includes("katun") ||
    title.includes("cotton")
  ) {
    return {
      productName: "Circular Linen Patchwork Oversized Shirt",
      patternTechnique: "Vertical Strip Patchwork",
      needleSpec: "Jarum Standard Ballpoint #11 (75/11)",
      threadSpec: "Benang Katun Organik 40s",
      materialEfficiency: "93% Zero-Waste",
      carbonSaved: "2.8 kg CO₂e",
      waterSaved: "620 Liter",
      cuttingPieces: [
        {
          name: "Panel Badan Utama (Depan & Belakang)",
          qty: "2 Pcs",
          size: "54 cm × 72 cm",
          note: "Potongan serat lurus kain linen",
        },
        {
          name: "Panel Lengan Longgar",
          qty: "2 Pcs",
          size: "24 cm × 52 cm",
          note: "Potongan melintang",
        },
        {
          name: "Kerah Shirt & Manset Lengan",
          qty: "2 Pcs",
          size: "12 cm × 42 cm",
          note: "Lapisan kain perca halus",
        },
      ],
      assemblySteps: [
        "Ratakan dan setrika sisa kain linen atau katun.",
        "Potong kain sesuai spesifikasi ukuran pola.",
        "Jahit strip perca menggunakan jahitan Perancis.",
        "Gabungkan panel depan dan belakang lalu pasang kerah kemeja.",
      ],
    };
  }

  return {
    productName: "Upcycled Circular Patchwork Apparel",
    patternTechnique: "Geometric Modular Patchwork",
    needleSpec: "Jarum Universal #14 (90/14)",
    threadSpec: "Benang Poliester All-Purpose 40s",
    materialEfficiency: "92% Zero-Waste",
    carbonSaved: "3.1 kg CO₂e",
    waterSaved: "500 Liter",
    cuttingPieces: [
      {
        name: "Panel Depan Utama",
        qty: "2 Pcs",
        size: "45 cm × 65 cm",
        note: "Potongan simetris",
      },
      {
        name: "Panel Belakang & Lengan",
        qty: "2 Pcs",
        size: "20 cm × 55 cm",
        note: "Kombinasi perca",
      },
      {
        name: "Trim & Pockets",
        qty: "4 Pcs",
        size: "15 cm × 15 cm",
        note: "Patchwork persegi",
      },
    ],
    assemblySteps: [
      "Persiapkan dan ukur sisa kain yang akan di-upcycle.",
      "Ikuti potongan spesifikasi ukuran pada tabel.",
      "Jahit sambungan antar potongan kain dengan rapi.",
      "Lakukan finishing dan pemeriksaan kualitas akhir.",
    ],
  };
}