"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
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
} from "lucide-react";
import { Button } from "@/components/ui/Button";
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

export default function BrandPatchworkSection() {
  const [sourceMode, setSourceMode] = useState<SourceMode>("purchased");
  const [status, setStatus] = useState<AiStatus>("idle");
  const [materials, setMaterials] = useState<MaterialOrder[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("");
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null);
  const [patternSpecs, setPatternSpecs] = useState<PatternSpecs | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"image" | "specs">("image");

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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (uploadedPreviewUrl) {
      URL.revokeObjectURL(uploadedPreviewUrl);
    }

    const nextUrl = URL.createObjectURL(file);
    setUploadedPreviewUrl(nextUrl);
    setSelectedFileName(file.name);
    setStatus("idle");
    setAiImageUrl(null);
    setPatternSpecs(null);
    setErrorMsg(null);
  }

  async function handleGenerate() {
    if (status === "processing") return;
    setStatus("processing");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/patchwork/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialTitle:
            sourceMode === "purchased" && selectedMaterial
              ? selectedMaterial.batchTitle
              : selectedFileName || "Denim and Cotton Waste Fabric",
          providerName:
            sourceMode === "purchased" && selectedMaterial
              ? selectedMaterial.providerName
              : "MURI Recrafting Studio",
        }),
      });

      const data = await res.json();

      if (data.success && data.output) {
        if (data.patternSpecs) {
          setPatternSpecs(data.patternSpecs);
        }

        // Preload Pollinations AI image
        const img = new window.Image();
        img.src = data.output;
        img.onload = () => {
          setAiImageUrl(data.output);
          setStatus("done");
        };
        img.onerror = () => {
          setAiImageUrl(data.output);
          setStatus("done");
        };
      } else {
        setErrorMsg("Gagal memproses AI. Silakan coba lagi.");
        setStatus("idle");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan.");
      setStatus("idle");
    }
  }

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
              Transformasi limbah kain sisa menjadi rincian pola potongan, dimensi (cm), dan instruksi perakitan via Pollinations AI.
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start rounded-full bg-brand-lime/30 px-3 py-1 text-xs font-bold text-brand-forest sm:self-auto">
            <Sparkles className="size-3.5 text-brand-forest" />
            <span>Pollinations AI Active</span>
          </div>
        </div>

        {/* Generator Main Grid */}
        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          {/* Left Column: Input Panel Card */}
          <div className="lg:col-span-6 rounded-xl border border-line-trace bg-canvas-warm/40 p-5 sm:p-6 space-y-5">
            {/* Mode Switcher */}
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-black">
                1. Pilih Sumber Material Limbah
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSourceMode("purchased");
                    setStatus("idle");
                    setAiImageUrl(null);
                    setPatternSpecs(null);
                    setErrorMsg(null);
                  }}
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
                  onClick={() => {
                    setSourceMode("upload");
                    setStatus("idle");
                    setAiImageUrl(null);
                    setPatternSpecs(null);
                    setErrorMsg(null);
                  }}
                  className={`inline-flex items-center gap-2 rounded-sm px-4 py-2 text-xs font-bold transition ${
                    sourceMode === "upload"
                      ? "bg-brand-forest text-white"
                      : "border border-line-trace bg-canvas-pure text-brand-black hover:border-brand-forest"
                  }`}
                >
                  <Upload className="size-3.5" />
                  <span>Unggah Foto Kain</span>
                </button>
              </div>
            </div>

            {/* Input Option Content */}
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
                  <div className="space-y-2 max-h-56 overflow-y-auto muri-scrollbar pr-1">
                    {materials.map((item) => {
                      const selected = selectedMaterialId === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedMaterialId(item.id);
                            setStatus("idle");
                            setAiImageUrl(null);
                            setPatternSpecs(null);
                            setErrorMsg(null);
                          }}
                          className={`flex items-center justify-between rounded-lg border p-3.5 transition cursor-pointer ${
                            selected
                              ? "border-brand-forest bg-canvas-pure shadow-xs"
                              : "border-line-trace bg-canvas-pure hover:border-brand-forest"
                          }`}
                        >
                          <div className="min-w-0 pr-3">
                            <p className="text-xs font-bold text-brand-black truncate">
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
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-black">
                  2. Unggah Foto Tekstur Limbah Kain
                </p>

                <label className="flex min-h-[130px] flex-col items-center justify-center rounded-lg border border-dashed border-line-trace bg-canvas-pure p-6 text-center transition hover:border-brand-forest cursor-pointer">
                  <FileImage className="size-7 text-muted-moss" />
                  <p className="mt-2 text-xs font-bold text-brand-black">
                    {selectedFileName || "Klik untuk pilih foto sisa kain"}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-moss">
                    Format JPG, PNG, atau WEBP hingga 10MB
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {errorMsg && (
              <p className="text-xs font-bold text-red-600">{errorMsg}</p>
            )}

            {/* Action Button */}
            <Button
              variant="default"
              size="md"
              fullWidth
              disabled={status === "processing"}
              onClick={() => void handleGenerate()}
            >
              {status === "processing" ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  Pollinations AI Generasi Pola...
                </>
              ) : (
                <>
                  <Sparkles className="size-4 text-brand-lime" />
                  Hasilkan Desain & Spesifikasi Pola
                </>
              )}
            </Button>
          </div>

          {/* Right Column: AI Result Preview Card */}
          <div className="lg:col-span-6 rounded-xl border border-line-trace bg-canvas-pure p-5 sm:p-6 flex flex-col justify-between">
            <div>
              {/* Header Tab Bar */}
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
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-brand-forest bg-brand-lime/50 px-2.5 py-1 rounded-full uppercase">
                    <CheckCircle2 className="size-3" /> Live Pattern Ready
                  </span>
                )}
              </div>

              {status === "idle" && (
                <div className="flex min-h-[280px] flex-col items-center justify-center text-center py-8">
                  <Scissors className="size-8 text-muted-moss/40" />
                  <p className="mt-3 text-xs font-bold text-brand-black">
                    Belum Ada Hasil Generasi Pola
                  </p>
                  <p className="mt-1 max-w-xs text-[11px] text-muted-moss">
                    Pilih material sisa atau unggah foto kain di sebelah kiri lalu klik Hasilkan Desain.
                  </p>
                </div>
              )}

              {status === "processing" && (
                <div className="flex min-h-[280px] flex-col items-center justify-center text-center py-8">
                  <RefreshCw className="size-8 animate-spin text-brand-forest" />
                  <p className="mt-3 font-display text-base font-bold text-brand-black">
                    AI Menghitung Dimensi & Potongan Pola...
                  </p>
                  <p className="mt-1 text-xs text-muted-moss">
                    Menghasilkan spesifikasi potongan (cm) dan panduan perakitan zero-waste.
                  </p>
                </div>
              )}

              {status === "done" && activeTab === "image" && aiImageUrl && (
                <div className="mt-4 space-y-4 animate-in fade-in-0">
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-line-trace bg-canvas-warm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={aiImageUrl}
                      alt="Hasil Pattern AI"
                      className="size-full object-cover"
                    />
                  </div>

                  <div className="rounded-lg border border-line-trace bg-canvas-warm/40 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-black">
                        {patternSpecs?.productName || "Upcycled Fashion Design"}
                      </span>
                      <span className="text-xs font-bold text-brand-forest">
                        {patternSpecs?.materialEfficiency || "95% Zero-Waste"}
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
                  </div>
                </div>
              )}

              {status === "done" && activeTab === "specs" && patternSpecs && (
                <div className="mt-4 space-y-4 animate-in fade-in-0 max-h-[380px] overflow-y-auto muri-scrollbar pr-1">
                  <div className="rounded-lg border border-line-trace bg-canvas-warm/40 p-3.5 space-y-1">
                    <p className="text-xs font-bold text-brand-black">
                      {patternSpecs.productName}
                    </p>
                    <p className="text-[11px] text-muted-moss">
                      {patternSpecs.needleSpec} • {patternSpecs.threadSpec}
                    </p>
                  </div>

                  {/* Cutting Pieces Table */}
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-black flex items-center gap-1.5">
                      <Ruler className="size-3.5 text-brand-emerald" />
                      Rincian Dimensi Potongan Pola (cm)
                    </p>

                    <div className="space-y-2">
                      {patternSpecs.cuttingPieces.map((piece, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-line-trace bg-canvas-pure p-3 text-xs flex items-center justify-between"
                        >
                          <div>
                            <p className="font-bold text-brand-black">{piece.name}</p>
                            <p className="mt-0.5 text-[10px] text-muted-moss">{piece.note}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-brand-forest">{piece.size}</span>
                            <p className="text-[10px] font-bold text-brand-black">{piece.qty}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Assembly Guide */}
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-black flex items-center gap-1.5">
                      <Layers className="size-3.5 text-brand-emerald" />
                      Tahapan Perakitan Zero-Waste
                    </p>

                    <ol className="space-y-1.5 list-decimal list-inside text-xs leading-relaxed text-brand-black">
                      {patternSpecs.assemblySteps.map((step, idx) => (
                        <li key={idx} className="bg-canvas-warm/30 p-2 rounded border border-line-trace/60">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </div>

            {status === "done" && (
              <div className="mt-6 border-t border-line-trace pt-4 flex justify-end">
                <Button
                  variant="solid-lime"
                  size="md"
                  onClick={() => {
                    setStatus("idle");
                    setAiImageUrl(null);
                    setPatternSpecs(null);
                  }}
                >
                  Simpan ke Draft Katalog
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
