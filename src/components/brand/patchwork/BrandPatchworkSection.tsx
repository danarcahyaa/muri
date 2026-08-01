"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import {
  ArrowRight,
  CheckCircle2,
  Factory,
  FileImage,
  Layers,
  Leaf,
  Package,
  RefreshCw,
  Ruler,
  Scissors,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { formatWeightKg } from "@/lib/formatter";
import { getBrandMaterialOrders } from "@/services/material";
import type { MaterialOrder } from "@/types/materialOrder";

type SourceMode = "upload" | "purchased";
type AiStatus = "idle" | "processing" | "done";

interface CuttingPiece {
  name: string;
  qty: string;
  size: string;
  note: string;
}

interface PatternSpecs {
  productName: string;
  patternTechnique: string;
  needleSpec: string;
  threadSpec: string;
  materialEfficiency: string;
  carbonSaved: string;
  waterSaved: string;
  cuttingPieces: CuttingPiece[];
  assemblySteps: string[];
}

interface ApiResponse {
  success?: boolean;
  output?: string;
  error?: string;
  detail?: string;
  imageCount?: number;
  patternSpecs?: PatternSpecs;
}

const MAX_IMAGES = 8;
const MAX_TOTAL_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const DEFAULT_PROMPT =
  "Pertahankan motif, warna, skala pola, dan tekstur kain yang diunggah. Buat katalog fashion patchwork premium dengan satu hero outfit, satu kemeja, dan satu aksesori yang saling cocok.";

function formatMegabytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function BrandPatchworkSection() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef<string[]>([]);

  const [sourceMode, setSourceMode] = useState<SourceMode>("purchased");
  const [status, setStatus] = useState<AiStatus>("idle");
  const [materials, setMaterials] = useState<MaterialOrder[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("");

  // Upload mode state
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null);
  const [patternSpecs, setPatternSpecs] = useState<PatternSpecs | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"image" | "specs">("image");
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const loadMaterials = useCallback(async () => {
    const res = await getBrandMaterialOrders();
    if (res.success && res.data && res.data.length > 0) {
      setMaterials(res.data);
      setSelectedMaterialId(res.data[0].id);
    }
  }, []);

  useEffect(() => {
    void loadMaterials();
  }, [loadMaterials]);

  const selectedMaterial = useMemo(() => {
    return materials.find((m) => m.id === selectedMaterialId) ?? materials[0];
  }, [materials, selectedMaterialId]);

  const totalBytes = useMemo(
    () => files.reduce((total, file) => total + file.size, 0),
    [files],
  );

  function resetResult() {
    setStatus("idle");
    setAiImageUrl(null);
    setPatternSpecs(null);
    setErrorMsg(null);
  }

  function replaceFiles(selected: File[]) {
    if (selected.length === 0) return;

    if (selected.length > MAX_IMAGES) {
      setErrorMsg(`Maksimal ${MAX_IMAGES} gambar dalam satu proses.`);
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
    resetResult();
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    replaceFiles(Array.from(e.target.files ?? []));
  }

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragActive(false);
    replaceFiles(Array.from(e.dataTransfer.files ?? []));
  }

  function clearImages() {
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrlsRef.current = [];
    setFiles([]);
    setPreviews([]);
    resetResult();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function switchMode(mode: SourceMode) {
    setSourceMode(mode);
    resetResult();
  }

  async function handleGenerate() {
    if (status === "processing") return;

    setStatus("processing");
    setErrorMsg(null);
    setAiImageUrl(null);
    setPatternSpecs(null);

    try {
      const formData = new FormData();
      formData.append("sourceMode", sourceMode);
      formData.append("prompt", prompt.trim());

      if (sourceMode === "upload") {
        if (files.length === 0) {
          setErrorMsg("Silakan upload minimal 1 gambar kain terlebih dahulu.");
          setStatus("idle");
          return;
        }

        files.forEach((file) => formData.append("images", file));
        formData.append("materialTitle", "Upcycled Textile Waste");
        formData.append("providerName", "MURI Recrafting Studio");
      } else {
        if (!selectedMaterial) {
          setErrorMsg("Pilih material yang sudah dibeli terlebih dahulu.");
          setStatus("idle");
          return;
        }

        formData.append("materialTitle", selectedMaterial.batchTitle);
        formData.append("providerName", selectedMaterial.providerName);
      }

      const response = await fetch("/api/patchwork/generate", {
        method: "POST",
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

      if (!data?.success || !data.output) {
        setErrorMsg(data?.error ?? "Pollinations tidak mengembalikan gambar.");
        setStatus("idle");
        return;
      }

      setPatternSpecs(data.patternSpecs ?? null);
      setAiImageUrl(data.output);
      setActiveTab("image");
      setStatus("done");
    } catch (error) {
      setErrorMsg(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan jaringan. Silakan coba lagi.",
      );
      setStatus("idle");
    }
  }

  const canGenerate =
    status !== "processing" &&
    (sourceMode === "purchased" ? !!selectedMaterial : files.length > 0);

  return (
    <section className="mt-8 font-body">
      <div className="rounded-2xl border border-brand-black/15 bg-canvas-pure p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col gap-2 border-b border-line-trace pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-brand-black">
              Generator Patchwork & Spesifikasi Pola AI
            </h2>
            <p className="mt-1 text-xs text-muted-moss">
              Upload foto sisa kain nyata → AI menghasilkan mockup fashion
              patchwork + spesifikasi potongan via Pollinations AI.
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start rounded-full bg-brand-lime/30 px-3 py-1 text-xs font-bold text-brand-forest sm:self-auto">
            <Sparkles className="size-3.5 text-brand-forest" />
            <span>Pollinations AI ({sourceMode === "upload" ? "kontext" : "zimage"})</span>
          </div>
        </div>

        {/* Generator Main Grid */}
        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          {/* ── Left Column: Input Panel ── */}
          <div className="space-y-5 rounded-xl border border-line-trace bg-canvas-warm/40 p-5 sm:p-6 lg:col-span-6">
            {/* Mode Switcher */}
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-black">
                1. Pilih Sumber Material Limbah
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => switchMode("purchased")}
                  className={`inline-flex items-center gap-2 rounded-sm px-4 py-2 text-xs font-bold transition ${
                    sourceMode === "purchased"
                      ? "bg-brand-forest text-white"
                      : "border border-line-trace bg-canvas-pure text-brand-black hover:border-brand-forest"
                  }`}
                >
                  <Package className="size-3.5" />
                  <span>Batch Terbeli (Supabase)</span>
                </button>

                <button
                  type="button"
                  onClick={() => switchMode("upload")}
                  className={`inline-flex items-center gap-2 rounded-sm px-4 py-2 text-xs font-bold transition ${
                    sourceMode === "upload"
                      ? "bg-brand-forest text-white"
                      : "border border-line-trace bg-canvas-pure text-brand-black hover:border-brand-forest"
                  }`}
                >
                  <Upload className="size-3.5" />
                  <span>Unggah Foto Kain (1–8 foto)</span>
                </button>
              </div>
            </div>

            {/* ── Purchased Mode ── */}
            {sourceMode === "purchased" ? (
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-black">
                  2. Pilih Material dari Sourcing Brand
                </p>

                {materials.length === 0 ? (
                  <div className="rounded-lg border border-line-trace bg-canvas-pure p-4 text-xs text-muted-moss">
                    Belum ada data transaksi material.
                  </div>
                ) : (
                  <div className="muri-scrollbar max-h-56 space-y-2 overflow-y-auto pr-1">
                    {materials.map((item) => {
                      const selected = selectedMaterialId === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedMaterialId(item.id);
                            resetResult();
                          }}
                          className={`flex cursor-pointer items-center justify-between rounded-lg border p-3.5 transition ${
                            selected
                              ? "border-brand-forest bg-canvas-pure shadow-xs"
                              : "border-line-trace bg-canvas-pure hover:border-brand-forest"
                          }`}
                        >
                          <div className="min-w-0 pr-3">
                            <p className="truncate text-xs font-bold text-brand-black">
                              {item.batchTitle}
                            </p>
                            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-moss">
                              <Factory className="size-3 shrink-0" />
                              {item.providerName} • {formatWeightKg(item.weightKg)}
                            </p>
                          </div>

                          <span className="shrink-0 rounded-full bg-brand-lime/40 px-2.5 py-0.5 text-[9px] font-bold text-brand-forest">
                            {item.orderCode}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* ── Upload Mode ── */
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-black">
                  2. Unggah Foto Tekstur Limbah Kain (1–8 gambar)
                </p>

                <label
                  htmlFor="fabric-upload"
                  onDragEnter={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  className={`flex min-h-[130px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center transition ${
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
                      : "Tarik & lepas atau klik untuk pilih foto kain"}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-moss">
                    1–8 file · JPG, PNG, WebP, AVIF · total maks. 4 MB
                  </p>
                </label>

                {/* Preview grid */}
                {previews.length > 0 && (
                  <div className="mt-3">
                    <div className="grid grid-cols-4 gap-2">
                      {previews.slice(0, 8).map((src, index) => (
                        <div
                          key={src}
                          className="relative aspect-square overflow-hidden rounded-md border border-line-trace bg-canvas-warm"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={src}
                            alt={`Kain ${index + 1}`}
                            className="size-full object-cover"
                          />
                          <span className="absolute left-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-forest text-[8px] font-bold text-white">
                            {index + 1}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={clearImages}
                      className="mt-2 flex items-center gap-1 text-[10px] font-bold text-muted-moss hover:text-red-500"
                    >
                      <X className="size-3" />
                      Hapus semua gambar
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Prompt Textarea */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="patchwork-prompt"
                  className="text-xs font-bold uppercase tracking-wide text-brand-black"
                >
                  3. Arahan Desain (Opsional)
                </label>
                <span className="text-[10px] text-muted-moss">
                  {prompt.length}/900
                </span>
              </div>
              <Textarea
                id="patchwork-prompt"
                maxLength={900}
                rows={3}
                size="sm"
                className="resize-none bg-canvas-pure text-xs leading-relaxed"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
              />
            </div>

            {errorMsg && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600">
                {errorMsg}
              </p>
            )}

            {/* Action Button */}
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
                  Pollinations AI sedang memproses...
                </>
              ) : (
                <>
                  <Sparkles className="size-4 text-brand-lime" />
                  Hasilkan Desain & Spesifikasi Pola
                </>
              )}
            </Button>

            {status === "processing" && (
              <p className="text-center text-[10px] text-muted-moss">
                Proses dapat memerlukan beberapa menit. Jangan tutup halaman ini.
              </p>
            )}
          </div>

          {/* ── Right Column: AI Result Preview ── */}
          <div className="flex flex-col justify-between rounded-xl border border-line-trace bg-canvas-pure p-5 sm:p-6 lg:col-span-6">
            <div>
              {/* Tab Bar */}
              <div className="flex items-center justify-between border-b border-line-trace pb-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("image")}
                    className={`rounded-sm px-3 py-1 text-xs font-bold transition ${
                      activeTab === "image"
                        ? "bg-brand-forest text-white"
                        : "bg-canvas-warm text-brand-black hover:bg-line-trace"
                    }`}
                  >
                    Visual Look
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("specs")}
                    className={`rounded-sm px-3 py-1 text-xs font-bold transition ${
                      activeTab === "specs"
                        ? "bg-brand-forest text-white"
                        : "bg-canvas-warm text-brand-black hover:bg-line-trace"
                    }`}
                  >
                    Spesifikasi Pola (cm)
                  </button>
                </div>

                {status === "done" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-lime/50 px-2.5 py-1 text-[9px] font-bold uppercase text-brand-forest">
                    <CheckCircle2 className="size-3" /> Live Pattern Ready
                  </span>
                )}
              </div>

              {/* Idle State */}
              {status === "idle" && (
                <div className="flex min-h-[280px] flex-col items-center justify-center py-8 text-center">
                  <Scissors className="size-8 text-muted-moss/40" />
                  <p className="mt-3 text-xs font-bold text-brand-black">
                    Belum Ada Hasil Generasi Pola
                  </p>
                  <p className="mt-1 max-w-xs text-[11px] text-muted-moss">
                    {sourceMode === "upload"
                      ? "Upload foto kain di sebelah kiri lalu klik Hasilkan Desain."
                      : "Pilih material batch di sebelah kiri lalu klik Hasilkan Desain."}
                  </p>
                </div>
              )}

              {/* Processing State */}
              {status === "processing" && (
                <div className="flex min-h-[280px] flex-col items-center justify-center py-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-lime/30">
                    <RefreshCw className="size-7 animate-spin text-brand-forest" />
                  </div>
                  <p className="mt-4 font-display text-base font-bold text-brand-black">
                    AI Sedang Membuat Mockup Fashion...
                  </p>
                  <p className="mt-1 text-xs text-muted-moss">
                    Menganalisis tekstur kain & merancang komposisi fashion patchwork.
                  </p>
                </div>
              )}

              {/* Done: Image Tab */}
              {status === "done" && activeTab === "image" && aiImageUrl && (
                <div className="mt-4 animate-in fade-in-0 space-y-4">
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-line-trace bg-canvas-warm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={aiImageUrl}
                      alt="Hasil Mockup Fashion Patchwork AI"
                      className="size-full object-cover"
                    />
                  </div>

                  <div className="space-y-2 rounded-lg border border-line-trace bg-canvas-warm/40 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-black">
                        {patternSpecs?.productName ?? "Upcycled Fashion Design"}
                      </span>
                      <span className="text-xs font-bold text-brand-forest">
                        {patternSpecs?.materialEfficiency ?? "92% Zero-Waste"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-moss">Teknik Potongan</span>
                      <span className="font-bold text-brand-black">
                        {patternSpecs?.patternTechnique}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-moss">Instruksi Jarum</span>
                      <span className="font-bold text-brand-black">
                        {patternSpecs?.needleSpec}
                      </span>
                    </div>
                    <div className="mt-1 flex gap-4 border-t border-line-trace pt-2 text-xs">
                      <div className="flex items-center gap-1 text-brand-forest">
                        <Leaf className="size-3" />
                        <span className="font-bold">
                          {patternSpecs?.carbonSaved ?? "3.1 kg CO₂e"} disimpan
                        </span>
                      </div>
                      <div className="text-muted-moss">
                        💧 {patternSpecs?.waterSaved ?? "500 L"} air
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Done: Specs Tab */}
              {status === "done" && activeTab === "specs" && patternSpecs && (
                <div className="muri-scrollbar mt-4 max-h-[380px] animate-in fade-in-0 space-y-4 overflow-y-auto pr-1">
                  <div className="space-y-1 rounded-lg border border-line-trace bg-canvas-warm/40 p-3.5">
                    <p className="text-xs font-bold text-brand-black">
                      {patternSpecs.productName}
                    </p>
                    <p className="text-[11px] text-muted-moss">
                      {patternSpecs.needleSpec} • {patternSpecs.threadSpec}
                    </p>
                  </div>

                  {/* Cutting Pieces Table */}
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-black">
                      <Ruler className="size-3.5 text-brand-emerald" />
                      Rincian Dimensi Potongan Pola (cm)
                    </p>

                    <div className="space-y-2">
                      {patternSpecs.cuttingPieces.map((piece, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-lg border border-line-trace bg-canvas-pure p-3 text-xs"
                        >
                          <div>
                            <p className="font-bold text-brand-black">
                              {piece.name}
                            </p>
                            <p className="mt-0.5 text-[10px] text-muted-moss">
                              {piece.note}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-brand-forest">
                              {piece.size}
                            </span>
                            <p className="text-[10px] font-bold text-brand-black">
                              {piece.qty}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Assembly Guide */}
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-black">
                      <Layers className="size-3.5 text-brand-emerald" />
                      Tahapan Perakitan Zero-Waste
                    </p>

                    <ol className="list-inside list-decimal space-y-1.5 text-xs leading-relaxed text-brand-black">
                      {patternSpecs.assemblySteps.map((step, idx) => (
                        <li
                          key={idx}
                          className="rounded border border-line-trace/60 bg-canvas-warm/30 p-2"
                        >
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </div>

            {/* Footer CTA */}
            {status === "done" && (
              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line-trace pt-4">
                {aiImageUrl && (
                  <a
                    href={aiImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-sm border border-line-trace bg-canvas-warm px-4 py-2 text-xs font-bold text-brand-black hover:border-brand-forest"
                  >
                    Buka / Download
                  </a>
                )}

                <Button
                  variant="solid-lime"
                  size="md"
                  onClick={() => resetResult()}
                >
                  Generate Baru
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