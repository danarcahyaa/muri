"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Factory,
  FileImage,
  Gauge,
  Layers,
  Lightbulb,
  Package,
  RefreshCw,
  Ruler,
  Scissors,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  Wrench,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { formatWeightKg } from "@/lib/formatter";
import { supabase } from "@/lib/supabaseClient";
import { getBrandMaterialOrders } from "@/services/material";
import type { MaterialOrder } from "@/types/materialOrder";

type SourceMode = "upload" | "purchased";
type AiStatus = "idle" | "processing" | "done";
type FabricType =
  | "auto"
  | "denim"
  | "cotton-linen"
  | "knit"
  | "synthetic"
  | "mixed";
type PieceFormat =
  | "large-panels"
  | "medium-pieces"
  | "small-scraps"
  | "strips";
type MaterialCondition = "clean" | "mixed" | "damaged";
type TargetProduct =
  | "auto"
  | "jacket"
  | "shirt"
  | "bag"
  | "accessory"
  | "home";
type ProductionLevel = "basic" | "standard" | "advanced";
type VisualDirection = "commercial" | "minimal" | "graphic" | "heritage";

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

interface SavedPattern {
  id: string;
  brandId: string;
  generatedDesignUrl: string;
  createdAt: string | null;
}

interface ApiResponse {
  success?: boolean;
  output?: string;
  error?: string;
  detail?: string;
  imageCount?: number;
  executionPlan?: ExecutionPlan;
  promptText?: string;
  savedPattern?: SavedPattern;
}

interface SaveApiResponse {
  success?: boolean;
  error?: string;
  detail?: string;
  savedPattern?: SavedPattern;
}

const MAX_IMAGES = 4;
const MAX_TOTAL_BYTES = 4 * 1024 * 1024;
const MAX_CUSTOM_NOTE = 240;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const FABRIC_OPTIONS: Array<{ value: FabricType; label: string }> = [
  { value: "auto", label: "Deteksi otomatis dari material" },
  { value: "denim", label: "Denim / jeans" },
  { value: "cotton-linen", label: "Katun / linen / canvas" },
  { value: "knit", label: "Knit / jersey / stretch" },
  { value: "synthetic", label: "Sintetis / polyester / nylon" },
  { value: "mixed", label: "Campuran / belum pasti" },
];

const PIECE_OPTIONS: Array<{ value: PieceFormat; label: string }> = [
  { value: "large-panels", label: "Panel besar, lebih dari ±40 cm" },
  { value: "medium-pieces", label: "Potongan sedang, ±15–40 cm" },
  { value: "small-scraps", label: "Perca kecil, kurang dari ±15 cm" },
  { value: "strips", label: "Strip memanjang" },
];

const CONDITION_OPTIONS: Array<{
  value: MaterialCondition;
  label: string;
}> = [
  { value: "clean", label: "Bersih dan relatif seragam" },
  { value: "mixed", label: "Campuran ketebalan / kondisi" },
  { value: "damaged", label: "Ada noda, lubang, atau area rapuh" },
];

const TARGET_OPTIONS: Array<{ value: TargetProduct; label: string }> = [
  { value: "auto", label: "Biarkan sistem merekomendasikan" },
  { value: "jacket", label: "Jaket / overshirt" },
  { value: "shirt", label: "Kemeja / blouse" },
  { value: "bag", label: "Tas / tote" },
  { value: "accessory", label: "Aksesori kecil" },
  { value: "home", label: "Home textile" },
];

const PRODUCTION_OPTIONS: Array<{
  value: ProductionLevel;
  label: string;
}> = [
  { value: "basic", label: "Dasar — mesin jahit standar" },
  { value: "standard", label: "Menengah — workshop brand" },
  { value: "advanced", label: "Lanjut — tim sample / tailor ahli" },
];

const VISUAL_OPTIONS: Array<{
  value: VisualDirection;
  label: string;
}> = [
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

function formatMegabytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function getOptionLabel<T extends string>(
  options: Array<{ value: T; label: string }>,
  value: T,
): string {
  return options.find((item) => item.value === value)?.label ?? value;
}

function validateCustomNote(value: string): string | null {
  const note = value.trim();

  if (note.length > MAX_CUSTOM_NOTE) {
    return `Maksimal ${MAX_CUSTOM_NOTE} karakter.`;
  }

  if (note && OFF_CONTEXT_PATTERNS.some((pattern) => pattern.test(note))) {
    return "Catatan hanya untuk warna, siluet, posisi patchwork, fungsi produk, dan detail konstruksi.";
  }

  return null;
}

export default function BrandPatchworkSection() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef<string[]>([]);

  const [sourceMode, setSourceMode] = useState<SourceMode>("purchased");
  const [status, setStatus] = useState<AiStatus>("idle");
  const [materials, setMaterials] = useState<MaterialOrder[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState("");

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const [fabricType, setFabricType] = useState<FabricType>("auto");
  const [pieceFormat, setPieceFormat] =
    useState<PieceFormat>("medium-pieces");
  const [materialCondition, setMaterialCondition] =
    useState<MaterialCondition>("clean");
  const [targetProduct, setTargetProduct] =
    useState<TargetProduct>("auto");
  const [productionLevel, setProductionLevel] =
    useState<ProductionLevel>("standard");
  const [visualDirection, setVisualDirection] =
    useState<VisualDirection>("commercial");
  const [customNote, setCustomNote] = useState("");
  const [briefConfirmed, setBriefConfirmed] = useState(false);

  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null);
  const [executionPlan, setExecutionPlan] = useState<ExecutionPlan | null>(null);
  const [savedPattern, setSavedPattern] = useState<SavedPattern | null>(null);
  const [generationPrompt, setGenerationPrompt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"image" | "plan">("image");

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const loadMaterials = useCallback(async () => {
    const response = await getBrandMaterialOrders();

    if (response.success && response.data && response.data.length > 0) {
      setMaterials(response.data);
      setSelectedMaterialId(response.data[0].id);
    }
  }, []);

  useEffect(() => {
    void loadMaterials();
  }, [loadMaterials]);

  const selectedMaterial = useMemo(() => {
    return materials.find((item) => item.id === selectedMaterialId) ?? materials[0];
  }, [materials, selectedMaterialId]);

  const totalBytes = useMemo(
    () => files.reduce((total, file) => total + file.size, 0),
    [files],
  );

  const customNoteError = useMemo(
    () => validateCustomNote(customNote),
    [customNote],
  );

  const sourceReady =
    sourceMode === "purchased" ? Boolean(selectedMaterial) : files.length > 0;

  const canGenerate =
    status !== "processing" &&
    !isSaving &&
    sourceReady &&
    briefConfirmed &&
    !customNoteError;

  const inputSummary = useMemo(
    () => [
      getOptionLabel(FABRIC_OPTIONS, fabricType),
      getOptionLabel(PIECE_OPTIONS, pieceFormat),
      getOptionLabel(TARGET_OPTIONS, targetProduct),
      getOptionLabel(PRODUCTION_OPTIONS, productionLevel),
    ],
    [fabricType, pieceFormat, targetProduct, productionLevel],
  );

  function resetResult() {
    setStatus("idle");
    setAiImageUrl(null);
    setExecutionPlan(null);
    setSavedPattern(null);
    setGenerationPrompt("");
    setIsSaving(false);
    setErrorMsg(null);
  }

  function invalidateBrief() {
    setBriefConfirmed(false);
    resetResult();
  }

  function replaceFiles(selected: File[]) {
    if (selected.length === 0) return;

    if (selected.length > MAX_IMAGES) {
      setErrorMsg(`Maksimal ${MAX_IMAGES} gambar agar referensi tetap fokus.`);
      return;
    }

    const invalidFile = selected.find(
      (file) => !ALLOWED_TYPES.has(file.type.toLowerCase()),
    );

    if (invalidFile) {
      setErrorMsg(
        `Format "${invalidFile.name}" tidak didukung. Gunakan JPG, PNG, WebP, atau AVIF.`,
      );
      return;
    }

    const nextTotalBytes = selected.reduce(
      (total, file) => total + file.size,
      0,
    );

    if (nextTotalBytes > MAX_TOTAL_BYTES) {
      setErrorMsg(
        `Total gambar ${formatMegabytes(nextTotalBytes)}. Maksimal 4 MB.`,
      );
      return;
    }

    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    const nextPreviews = selected.map((file) => URL.createObjectURL(file));
    previewUrlsRef.current = nextPreviews;

    setFiles(selected);
    setPreviews(nextPreviews);
    setBriefConfirmed(false);
    resetResult();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    replaceFiles(Array.from(event.target.files ?? []));
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragActive(false);
    replaceFiles(Array.from(event.dataTransfer.files ?? []));
  }

  function clearImages() {
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrlsRef.current = [];
    setFiles([]);
    setPreviews([]);
    setBriefConfirmed(false);
    resetResult();

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function switchMode(mode: SourceMode) {
    setSourceMode(mode);
    setBriefConfirmed(false);
    resetResult();
  }

  async function handleGenerate() {
    if (!canGenerate) return;

    setStatus("processing");
    setErrorMsg(null);
    setAiImageUrl(null);
    setExecutionPlan(null);
    setSavedPattern(null);
    setGenerationPrompt("");
    setIsSaving(false);

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (sessionError || !accessToken) {
        setErrorMsg("Sesi login brand tidak ditemukan. Silakan login ulang.");
        setStatus("idle");
        return;
      }

      const formData = new FormData();
      formData.append("sourceMode", sourceMode);
      formData.append("fabricType", fabricType);
      formData.append("pieceFormat", pieceFormat);
      formData.append("materialCondition", materialCondition);
      formData.append("targetProduct", targetProduct);
      formData.append("productionLevel", productionLevel);
      formData.append("visualDirection", visualDirection);
      formData.append("customNote", customNote.trim());

      if (sourceMode === "upload") {
        if (files.length === 0) {
          setErrorMsg("Upload minimal 1 foto kain terlebih dahulu.");
          setStatus("idle");
          return;
        }

        files.forEach((file) => formData.append("images", file));
        formData.append("materialTitle", "Uploaded Upcycled Textile Waste");
        formData.append("providerName", "MURI Brand Studio");
      } else {
        if (!selectedMaterial) {
          setErrorMsg("Pilih material yang sudah dibeli terlebih dahulu.");
          setStatus("idle");
          return;
        }

        formData.append("materialTitle", selectedMaterial.batchTitle);
        formData.append("providerName", selectedMaterial.providerName);
        formData.append("materialSourceId", selectedMaterial.id);
      }

      const response = await fetch("/api/patchwork/generate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
        cache: "no-store",
      });

      const rawResponse = await response.text();
      let data: ApiResponse | null = null;

      try {
        data = rawResponse ? (JSON.parse(rawResponse) as ApiResponse) : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        setErrorMsg(
          data?.detail ??
            data?.error ??
            rawResponse.slice(0, 500) ??
            "Terjadi kesalahan saat generate.",
        );
        setStatus("idle");
        return;
      }

      if (
        !data?.success ||
        !data.output ||
        !data.executionPlan ||
        !data.promptText
      ) {
        setErrorMsg(
          "AI tidak mengembalikan gambar atau rekomendasi yang lengkap.",
        );
        setStatus("idle");
        return;
      }

      setAiImageUrl(data.output);
      setExecutionPlan(data.executionPlan);
      setGenerationPrompt(data.promptText);
      setSavedPattern(null);
      setActiveTab("image");
      setStatus("done");
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan. Silakan coba lagi.");
      setStatus("idle");
    }
  }

  async function handleSave() {
    if (
      isSaving ||
      !aiImageUrl ||
      !generationPrompt ||
      !executionPlan ||
      savedPattern
    ) {
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (sessionError || !accessToken) {
        setErrorMsg("Sesi login brand tidak ditemukan. Silakan login ulang.");
        return;
      }

      const saveForm = new FormData();
      saveForm.append("outputUrl", aiImageUrl);
      saveForm.append("promptText", generationPrompt);
      saveForm.append("sourceMode", sourceMode);
      saveForm.append("fabricType", fabricType);
      saveForm.append("pieceFormat", pieceFormat);
      saveForm.append("materialCondition", materialCondition);
      saveForm.append("targetProduct", targetProduct);
      saveForm.append("productionLevel", productionLevel);
      saveForm.append("visualDirection", visualDirection);
      saveForm.append("customNote", customNote.trim());

      if (sourceMode === "upload") {
        files.forEach((file) => saveForm.append("images", file));
        saveForm.append("materialTitle", "Uploaded Upcycled Textile Waste");
        saveForm.append("providerName", "MURI Brand Studio");
      } else if (selectedMaterial) {
        saveForm.append("materialTitle", selectedMaterial.batchTitle);
        saveForm.append("providerName", selectedMaterial.providerName);
        saveForm.append("materialSourceId", selectedMaterial.id);
      }

      const response = await fetch("/api/patchwork/save", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: saveForm,
        cache: "no-store",
      });

      const rawResponse = await response.text();
      let data: SaveApiResponse | null = null;

      try {
        data = rawResponse ? (JSON.parse(rawResponse) as SaveApiResponse) : null;
      } catch {
        data = null;
      }

      if (!response.ok || !data?.success || !data.savedPattern) {
        setErrorMsg(
          data?.detail ??
            data?.error ??
            rawResponse.slice(0, 500) ??
            "Gagal menyimpan hasil AI.",
        );
        return;
      }

      setSavedPattern(data.savedPattern);
      setAiImageUrl(data.savedPattern.generatedDesignUrl);
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan saat menyimpan hasil.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="mt-8 font-body">
      <div className="rounded-2xl border border-brand-black/15 bg-canvas-pure p-6 sm:p-8">
        <div className="flex flex-col gap-3 border-b border-line-trace pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-brand-black">
              Patchwork Execution Advisor
            </h2>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-moss">
              Sistem membantu memilih produk yang paling cocok, teknik patchwork,
              kebutuhan mesin, pola potong, risiko produksi, dan urutan eksekusi.
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start rounded-full bg-brand-lime/30 px-3 py-1 text-xs font-bold text-brand-forest sm:self-auto">
            <Sparkles className="size-3.5" />
            <span>1 rekomendasi terarah per generate</span>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 rounded-xl border border-line-trace bg-canvas-warm/40 p-5 sm:p-6 lg:col-span-6">
            <StepHeader
              number="1"
              title="Pilih sumber material"
              description="Gunakan batch yang sudah dibeli atau unggah foto kain nyata."
            />

            <div className="flex flex-wrap gap-2">
              <ModeButton
                active={sourceMode === "purchased"}
                icon={<Package className="size-3.5" />}
                label="Batch Terbeli"
                onClick={() => switchMode("purchased")}
              />
              <ModeButton
                active={sourceMode === "upload"}
                icon={<Upload className="size-3.5" />}
                label={`Unggah Foto, maks. ${MAX_IMAGES}`}
                onClick={() => switchMode("upload")}
              />
            </div>

            {sourceMode === "purchased" ? (
              <div>
                {materials.length === 0 ? (
                  <div className="rounded-lg border border-line-trace bg-canvas-pure p-4 text-xs text-muted-moss">
                    Belum ada transaksi material yang dapat digunakan.
                  </div>
                ) : (
                  <div className="muri-scrollbar max-h-52 space-y-2 overflow-y-auto pr-1">
                    {materials.map((item) => {
                      const selected = selectedMaterialId === item.id;

                      return (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => {
                            setSelectedMaterialId(item.id);
                            setBriefConfirmed(false);
                            resetResult();
                          }}
                          className={`flex w-full items-center justify-between rounded-lg border p-3.5 text-left transition ${
                            selected
                              ? "border-brand-forest bg-canvas-pure shadow-xs"
                              : "border-line-trace bg-canvas-pure hover:border-brand-forest"
                          }`}
                        >
                          <span className="min-w-0 pr-3">
                            <span className="block truncate text-xs font-bold text-brand-black">
                              {item.batchTitle}
                            </span>
                            <span className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-moss">
                              <Factory className="size-3 shrink-0" />
                              {item.providerName} • {formatWeightKg(item.weightKg)}
                            </span>
                          </span>

                          <span className="shrink-0 rounded-full bg-brand-lime/40 px-2.5 py-0.5 text-[9px] font-bold text-brand-forest">
                            {item.orderCode}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label
                  htmlFor="fabric-upload"
                  onDragEnter={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  className={`flex min-h-[132px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center transition ${
                    dragActive
                      ? "border-brand-forest bg-brand-lime/10"
                      : "border-line-trace bg-canvas-pure hover:border-brand-forest"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    id="fabric-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <FileImage className="size-7 text-muted-moss" />
                  <p className="mt-2 text-xs font-bold text-brand-black">
                    {files.length > 0
                      ? `${files.length} file dipilih · ${formatMegabytes(totalBytes)}`
                      : "Foto kain dari atas, cahaya netral, dan tekstur terlihat jelas"}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-moss">
                    1–4 gambar • minimal 240 px • total maks. 4 MB
                  </p>
                </label>

                {previews.length > 0 && (
                  <div className="mt-3">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {previews.map((src, index) => (
                        <div
                          key={src}
                          className="relative aspect-square overflow-hidden rounded-md border border-line-trace bg-canvas-warm"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={src}
                            alt={`Referensi kain ${index + 1}`}
                            className="size-full object-cover"
                          />
                          <span className="absolute left-1 top-1 flex size-4 items-center justify-center rounded-full bg-brand-forest text-[8px] font-bold text-white">
                            {index + 1}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={clearImages}
                      className="mt-2 flex items-center gap-1 text-[10px] font-bold text-muted-moss hover:text-red-600"
                    >
                      <X className="size-3" /> Hapus semua gambar
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-line-trace pt-5">
              <StepHeader
                number="2"
                title="Profil teknis material"
                description="Data ini menentukan teknik sambungan dan stabilisasi."
              />

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <SelectField
                  label="Jenis kain"
                  value={fabricType}
                  options={FABRIC_OPTIONS}
                  onChange={(value) => {
                    setFabricType(value);
                    invalidateBrief();
                  }}
                />
                <SelectField
                  label="Ukuran dominan potongan"
                  value={pieceFormat}
                  options={PIECE_OPTIONS}
                  onChange={(value) => {
                    setPieceFormat(value);
                    invalidateBrief();
                  }}
                />
                <div className="sm:col-span-2">
                  <SelectField
                    label="Kondisi material"
                    value={materialCondition}
                    options={CONDITION_OPTIONS}
                    onChange={(value) => {
                      setMaterialCondition(value);
                      invalidateBrief();
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-line-trace pt-5">
              <StepHeader
                number="3"
                title="Tujuan eksekusi"
                description="Batasi hasil agar sesuai kemampuan produksi brand."
              />

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <SelectField
                  label="Produk tujuan"
                  value={targetProduct}
                  options={TARGET_OPTIONS}
                  onChange={(value) => {
                    setTargetProduct(value);
                    invalidateBrief();
                  }}
                />
                <SelectField
                  label="Kemampuan produksi"
                  value={productionLevel}
                  options={PRODUCTION_OPTIONS}
                  onChange={(value) => {
                    setProductionLevel(value);
                    invalidateBrief();
                  }}
                />
                <div className="sm:col-span-2">
                  <SelectField
                    label="Arah visual"
                    value={visualDirection}
                    options={VISUAL_OPTIONS}
                    onChange={(value) => {
                      setVisualDirection(value);
                      invalidateBrief();
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-line-trace pt-5">
              <StepHeader
                number="4"
                title="Catatan desain opsional"
                description="Hanya untuk arahan yang benar-benar memengaruhi eksekusi."
              />

              <div className="mt-4">
                <Textarea
                  value={customNote}
                  onChange={(event) => {
                    setCustomNote(event.target.value);
                    invalidateBrief();
                  }}
                  maxLength={MAX_CUSTOM_NOTE}
                  rows={3}
                  placeholder="Contoh: pertahankan warna asli, gunakan panel kontras hanya pada saku dan lengan."
                  aria-invalid={Boolean(customNoteError)}
                />

                <div className="mt-1.5 flex items-start justify-between gap-4">
                  <p
                    className={`text-[10px] ${
                      customNoteError ? "font-bold text-red-600" : "text-muted-moss"
                    }`}
                  >
                    {customNoteError ??
                      "Tidak menerima URL, coding, artikel, pertanyaan umum, atau instruksi di luar desain fashion."}
                  </p>
                  <span className="shrink-0 text-[10px] text-muted-moss">
                    {customNote.length}/{MAX_CUSTOM_NOTE}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-brand-lime bg-brand-lime/15 p-4">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-forest" />
                <div>
                  <p className="text-xs font-bold text-brand-forest">
                    Scope penggunaan AI dibatasi
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-moss">
                    AI hanya menerima profil material, target produk, arah visual,
                    dan catatan konstruksi. Sistem tidak meneruskan permintaan di luar
                    konteks ke Pollinations.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-line-trace bg-canvas-pure p-4">
              <p className="text-[10px] font-bold uppercase tracking-wide text-brand-emerald">
                Ringkasan sebelum menggunakan kredit AI
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {inputSummary.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-canvas-warm px-2.5 py-1 text-[10px] font-bold text-brand-black"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-line-trace bg-canvas-warm/40 p-3">
                <input
                  type="checkbox"
                  checked={briefConfirmed}
                  onChange={(event) => setBriefConfirmed(event.target.checked)}
                  className="mt-0.5 size-4 accent-brand-forest"
                />
                <span className="text-[11px] leading-relaxed text-brand-black">
                  Saya sudah memeriksa profil material dan tujuan produk. Setiap
                  generate membuat satu request AI baru.
                </span>
              </label>
            </div>

            {errorMsg && (
              <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <Button
              variant="default"
              size="md"
              fullWidth
              disabled={!canGenerate}
              onClick={() => void handleGenerate()}
            >
              {status === "processing" ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  Menyusun Rekomendasi Eksekusi...
                </>
              ) : (
                <>
                  <Sparkles className="size-4 text-brand-lime" />
                  Generate 1 Rekomendasi Terarah
                </>
              )}
            </Button>

            {!sourceReady && (
              <p className="text-center text-[10px] text-muted-moss">
                Pilih batch material atau unggah foto sebelum melanjutkan.
              </p>
            )}

            {sourceReady && !briefConfirmed && (
              <p className="text-center text-[10px] text-muted-moss">
                Konfirmasi ringkasan brief untuk mengaktifkan tombol generate.
              </p>
            )}
          </div>

          <div className="flex flex-col rounded-xl border border-line-trace bg-canvas-pure p-5 sm:p-6 lg:col-span-6">
            <div className="flex flex-col gap-3 border-b border-line-trace pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <TabButton
                  active={activeTab === "image"}
                  label="Visual Concept"
                  onClick={() => setActiveTab("image")}
                />
                <TabButton
                  active={activeTab === "plan"}
                  label="Execution Plan"
                  onClick={() => setActiveTab("plan")}
                />
              </div>

              {status === "done" && savedPattern && (
                <span
                  title={`Pattern ID: ${savedPattern.id}`}
                  className="inline-flex self-start items-center gap-1 rounded-full bg-brand-lime/50 px-2.5 py-1 text-[9px] font-bold uppercase text-brand-forest sm:self-auto"
                >
                  <CheckCircle2 className="size-3" /> Tersimpan di Database
                </span>
              )}
            </div>

            {status === "idle" && (
              <div className="flex min-h-[560px] flex-col justify-center py-8">
                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand-lime/25">
                  <Scissors className="size-7 text-brand-forest" />
                </div>
                <h3 className="mt-4 text-center font-display text-lg font-bold text-brand-black">
                  Hasil bukan hanya gambar
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-center text-xs leading-relaxed text-muted-moss">
                  Sistem akan memberikan satu rekomendasi produk utama beserta
                  alasan, teknik patchwork, spesifikasi mesin, potongan, risiko,
                  langkah perakitan, dan pemeriksaan kualitas.
                </p>

                <div className="mx-auto mt-6 grid w-full max-w-md gap-3 sm:grid-cols-2">
                  <OutcomeCard icon={<Target />} title="Produk yang paling cocok" />
                  <OutcomeCard icon={<Wrench />} title="Cara mengeksekusinya" />
                  <OutcomeCard icon={<Gauge />} title="Tingkat kesulitan" />
                  <OutcomeCard icon={<ShieldCheck />} title="Risiko dan QC" />
                </div>
              </div>
            )}

            {status === "processing" && (
              <div className="flex min-h-[560px] flex-col items-center justify-center py-8 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-brand-lime/30">
                  <RefreshCw className="size-7 animate-spin text-brand-forest" />
                </div>
                <p className="mt-4 font-display text-base font-bold text-brand-black">
                  Menilai Material dan Menyusun Eksekusi...
                </p>
                <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-moss">
                  AI membuat empat foto produk dari sudut yang berbeda tanpa
                  tulisan. Hasil baru disimpan setelah Anda menekan tombol Simpan.
                </p>
              </div>
            )}

            {status === "done" &&
              activeTab === "image" &&
              aiImageUrl &&
              executionPlan && (
                <div className="mt-4 space-y-4 animate-in fade-in-0">
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-line-trace bg-canvas-warm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={aiImageUrl}
                      alt={`Visual concept ${executionPlan.productName}`}
                      className="size-full object-cover"
                    />
                  </div>

                  <div className="rounded-lg border border-line-trace bg-canvas-warm/40 p-4">
                    {savedPattern ? (
                      <div className="flex items-center gap-2 text-xs font-bold text-brand-forest">
                        <CheckCircle2 className="size-4" />
                        Hasil sudah disimpan ke database.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-bold text-brand-black">
                            Simpan hasil yang dipilih
                          </p>
                          <p className="mt-1 text-[11px] leading-relaxed text-muted-moss">
                            Generate tidak mengunggah apa pun ke Supabase. Gambar hasil
                            dan referensi material baru diunggah setelah tombol ini ditekan.
                          </p>
                        </div>
                        <Button
                          variant="default"
                          size="md"
                          fullWidth
                          disabled={isSaving}
                          onClick={() => void handleSave()}
                        >
                          {isSaving ? (
                            <>
                              <RefreshCw className="size-4 animate-spin" />
                              Menyimpan Hasil...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="size-4" />
                              Simpan Hasil ke Database
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg border border-brand-lime bg-brand-lime/10 p-4">
                    <div className="flex gap-3">
                      <Sparkles className="mt-0.5 size-4 shrink-0 text-brand-forest" />
                      <div>
                        <p className="text-xs font-bold text-brand-forest">
                          Visual difokuskan pada bentuk dan eksekusi
                        </p>
                        <p className="mt-1 text-[11px] leading-relaxed text-muted-moss">
                          Gambar hanya berisi produk, model, sudut alternatif, dan
                          detail patch. Tidak ada judul, label, angka, atau layout
                          presentasi; detail teknis tetap ada di Execution Plan.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {executionPlan.visualPanelGuide.map((panel, index) => (
                        <div
                          key={panel.title}
                          className="rounded-lg border border-line-trace bg-canvas-pure p-3"
                        >
                          <div className="flex items-center gap-2">
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-forest text-[9px] font-bold text-white">
                              {index + 1}
                            </span>
                            <p className="text-[10px] font-bold uppercase tracking-wide text-brand-black">
                              {panel.title}
                            </p>
                          </div>
                          <p className="mt-2 text-[10px] leading-relaxed text-muted-moss">
                            {panel.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-line-trace bg-canvas-warm/40 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-brand-emerald">
                          {executionPlan.recommendationTitle}
                        </p>
                        <p className="mt-1 text-sm font-bold text-brand-black">
                          {executionPlan.productName}
                        </p>
                      </div>
                      <span className="self-start rounded-full bg-brand-lime/40 px-2.5 py-1 text-[10px] font-bold text-brand-forest">
                        {executionPlan.wasteTarget}
                      </span>
                    </div>

                    <p className="mt-3 text-xs leading-relaxed text-muted-moss">
                      {executionPlan.fitReason}
                    </p>

                    <div className="mt-4 grid gap-2 border-t border-line-trace pt-3 sm:grid-cols-2">
                      <MiniFact label="Teknik" value={executionPlan.patternTechnique} />
                      <MiniFact label="Kesulitan" value={executionPlan.difficulty} />
                    </div>
                  </div>
                </div>
              )}

            {status === "done" && activeTab === "plan" && executionPlan && (
              <div className="muri-scrollbar mt-4 max-h-[720px] space-y-5 overflow-y-auto pr-1 animate-in fade-in-0">
                <section className="rounded-lg border border-brand-lime bg-brand-lime/10 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-brand-emerald">
                    {executionPlan.recommendationTitle}
                  </p>
                  <h3 className="mt-1 font-display text-xl font-bold text-brand-black">
                    {executionPlan.productName}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-moss">
                    {executionPlan.fitReason}
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <FactCard label="Teknik Patchwork" value={executionPlan.patternTechnique} />
                    <FactCard label="Tingkat Eksekusi" value={executionPlan.difficulty} />
                    <FactCard label="Estimasi Yield" value={executionPlan.estimatedYield} />
                    <FactCard label="Target Waste" value={executionPlan.wasteTarget} />
                  </div>
                </section>

                <PlanSection
                  icon={<Lightbulb className="size-4" />}
                  title="Strategi Penggunaan Material"
                >
                  <p className="text-xs leading-relaxed text-brand-black">
                    {executionPlan.materialUsage}
                  </p>
                </PlanSection>

                <PlanSection
                  icon={<Wrench className="size-4" />}
                  title="Setup Mesin dan Konstruksi"
                >
                  <div className="grid gap-2 sm:grid-cols-2">
                    <FactCard label="Jarum" value={executionPlan.needleSpec} />
                    <FactCard label="Benang" value={executionPlan.threadSpec} />
                    <FactCard label="Stabilizer" value={executionPlan.stabilizerSpec} />
                    <FactCard label="Toleransi Jahitan" value={executionPlan.seamAllowance} />
                  </div>
                </PlanSection>

                <PlanSection
                  icon={<Ruler className="size-4" />}
                  title="Rincian Potongan Awal"
                >
                  <div className="space-y-2">
                    {executionPlan.cuttingPieces.map((piece) => (
                      <div
                        key={`${piece.name}-${piece.qty}`}
                        className="grid gap-2 rounded-lg border border-line-trace bg-canvas-pure p-3 text-xs sm:grid-cols-[1fr_auto]"
                      >
                        <div>
                          <p className="font-bold text-brand-black">{piece.name}</p>
                          <p className="mt-0.5 text-[10px] leading-relaxed text-muted-moss">
                            {piece.note}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="font-mono font-bold text-brand-forest">
                            {piece.size}
                          </p>
                          <p className="text-[10px] font-bold text-brand-black">
                            {piece.qty}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </PlanSection>

                <PlanSection
                  icon={<Layers className="size-4" />}
                  title="Urutan Eksekusi"
                >
                  <ol className="space-y-2">
                    {executionPlan.assemblySteps.map((step, index) => (
                      <li
                        key={step}
                        className="flex gap-3 rounded-lg border border-line-trace/70 bg-canvas-warm/30 p-3 text-xs leading-relaxed text-brand-black"
                      >
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-forest text-[9px] font-bold text-white">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </PlanSection>

                <PlanSection
                  icon={<AlertTriangle className="size-4" />}
                  title="Risiko Produksi"
                >
                  <ul className="space-y-2">
                    {executionPlan.riskNotes.map((risk) => (
                      <li
                        key={risk}
                        className="flex gap-2 text-xs leading-relaxed text-brand-black"
                      >
                        <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </PlanSection>

                <PlanSection
                  icon={<ShieldCheck className="size-4" />}
                  title="Quality Control"
                >
                  <ul className="space-y-2">
                    {executionPlan.qualityChecks.map((check) => (
                      <li
                        key={check}
                        className="flex gap-2 text-xs leading-relaxed text-brand-black"
                      >
                        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-brand-emerald" />
                        <span>{check}</span>
                      </li>
                    ))}
                  </ul>
                </PlanSection>

                <section className="rounded-lg border border-line-trace bg-canvas-warm/40 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-brand-emerald">
                    Alternatif Produk
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {executionPlan.alternativeProducts.map((product) => (
                      <span
                        key={product}
                        className="rounded-full border border-line-trace bg-canvas-pure px-2.5 py-1 text-[10px] font-bold text-brand-black"
                      >
                        {product}
                      </span>
                    ))}
                  </div>
                </section>

                <p className="rounded-lg border border-line-trace bg-canvas-warm/30 p-3 text-[10px] leading-relaxed text-muted-moss">
                  {executionPlan.impactDisclaimer}
                </p>
              </div>
            )}

            {status === "done" && (
              <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-line-trace pt-4">
                {savedPattern && (
                  <span className="mr-auto inline-flex items-center gap-1.5 text-[10px] font-semibold text-muted-moss">
                    <CheckCircle2 className="size-3.5 text-brand-emerald" />
                    Pattern {savedPattern.id.slice(0, 8)} tersimpan
                  </span>
                )}
                {aiImageUrl && (
                  <a
                    href={aiImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-sm border border-line-trace bg-canvas-warm px-4 py-2 text-xs font-bold text-brand-black hover:border-brand-forest"
                  >
                    Buka Gambar
                  </a>
                )}

                <Button
                  variant="solid-lime"
                  size="md"
                  onClick={() => {
                    resetResult();
                    setBriefConfirmed(false);
                  }}
                >
                  Buat Brief Baru
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepHeader({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-forest text-[10px] font-bold text-white">
        {number}
      </span>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-brand-black">
          {title}
        </p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted-moss">
          {description}
        </p>
      </div>
    </div>
  );
}

function ModeButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-sm px-4 py-2 text-xs font-bold transition ${
        active
          ? "bg-brand-forest text-white"
          : "border border-line-trace bg-canvas-pure text-brand-black hover:border-brand-forest"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-wide text-muted-moss">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="h-11 w-full rounded-sm border border-line-trace bg-canvas-pure px-3 text-xs font-bold text-brand-black outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-sm px-3 py-1.5 text-xs font-bold transition ${
        active
          ? "bg-brand-forest text-white"
          : "bg-canvas-warm text-brand-black hover:bg-line-trace"
      }`}
    >
      {label}
    </button>
  );
}

function OutcomeCard({
  icon,
  title,
}: {
  icon: ReactElement<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-line-trace bg-canvas-warm/40 p-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-lime/30 text-brand-forest [&>svg]:size-4">
        {icon}
      </span>
      <p className="text-[11px] font-bold text-brand-black">{title}</p>
    </div>
  );
}

function MiniFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-wide text-muted-moss">{label}</p>
      <p className="mt-1 text-[11px] font-bold leading-relaxed text-brand-black">
        {value}
      </p>
    </div>
  );
}

function FactCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line-trace bg-canvas-pure p-3">
      <p className="text-[9px] uppercase tracking-wide text-muted-moss">{label}</p>
      <p className="mt-1 text-[11px] font-bold leading-relaxed text-brand-black">
        {value}
      </p>
    </div>
  );
}

function PlanSection({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-brand-black">
        <span className="text-brand-emerald">{icon}</span>
        {title}
      </p>
      {children}
    </section>
  );
}
