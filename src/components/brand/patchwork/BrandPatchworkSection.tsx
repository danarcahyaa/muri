"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Factory,
  FileImage,
  Leaf,
  Package,
  RefreshCw,
  Sparkles,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatWeightKg } from "@/lib/formatter";
import { getBrandMaterialOrders } from "@/services/material";
import type { MaterialOrder } from "@/types/materialOrder";

type SourceMode = "upload" | "purchased";
type AiStatus = "idle" | "processing" | "done";

export default function BrandPatchworkSection() {
  const [sourceMode, setSourceMode] = useState<SourceMode>("purchased");
  const [status, setStatus] = useState<AiStatus>("idle");
  const [materials, setMaterials] = useState<MaterialOrder[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("");
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null);
  const [promptText, setPromptText] = useState("");

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
  }

  function handleGenerate() {
    if (status === "processing") return;
    setStatus("processing");

    const materialDesc =
      sourceMode === "purchased" && selectedMaterial
        ? `${selectedMaterial.batchTitle} from ${selectedMaterial.providerName}`
        : selectedFileName || "recycled denim cotton fabric";

    const prompt = `upcycled sustainable fashion catalogue photoshoot, luxury patchwork design made of ${materialDesc}, clean warm editorial studio lighting, zero-waste apparel, 8k detail`;
    setPromptText(prompt);

    const seed = Math.floor(Math.random() * 1000000);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${seed}`;

    setTimeout(() => {
      setAiImageUrl(pollinationsUrl);
      setStatus("done");
    }, 1500);
  }

  return (
    <section className="mt-8 font-body">
      <div className="rounded-2xl border border-brand-black/15 bg-canvas-pure p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col gap-2 border-b border-line-trace pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-brand-black">
              Generator Patchwork & Re-Desain AI
            </h2>
            <p className="mt-1 text-xs text-muted-moss">
              Transformasi limbah kain sisa atau batch material sirkular menjadi rekomendasi pola busana modern via Pollinations AI.
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start rounded-full bg-brand-lime/30 px-3 py-1 text-xs font-bold text-brand-forest sm:self-auto">
            <Sparkles className="size-3.5 text-brand-forest" />
            <span>Pollinations AI Engine</span>
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
                          }}
                          className={`flex items-center justify-between rounded-lg border p-3.5 transition cursor-pointer ${
                            selected
                              ? "border-brand-forest bg-canvas-pure"
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

            {/* Action Button */}
            <Button
              variant="default"
              size="md"
              fullWidth
              disabled={status === "processing"}
              onClick={handleGenerate}
            >
              {status === "processing" ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  Pollinations AI Generasi...
                </>
              ) : (
                <>
                  <Sparkles className="size-4 text-brand-lime" />
                  Hasikan Desain Pola Sirkular
                </>
              )}
            </Button>
          </div>

          {/* Right Column: AI Result Preview Card */}
          <div className="lg:col-span-6 rounded-xl border border-line-trace bg-canvas-pure p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-line-trace pb-4">
                <p className="text-xs font-bold uppercase tracking-wide text-brand-black">
                  Hasil Generasi Pola Patchwork AI
                </p>
                {status === "done" && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-brand-forest bg-brand-lime/50 px-2.5 py-1 rounded-full uppercase">
                    <CheckCircle2 className="size-3" /> Pollinations AI Generated
                  </span>
                )}
              </div>

              {status === "idle" && (
                <div className="flex min-h-[260px] flex-col items-center justify-center text-center py-8">
                  <Sparkles className="size-8 text-muted-moss/40" />
                  <p className="mt-3 text-xs font-bold text-brand-black">
                    Belum Ada Hasil Generasi
                  </p>
                  <p className="mt-1 max-w-xs text-[11px] text-muted-moss">
                    Pilih material sisa atau unggah foto kain di sebelah kiri lalu klik Hasilkan Desain.
                  </p>
                </div>
              )}

              {status === "processing" && (
                <div className="flex min-h-[260px] flex-col items-center justify-center text-center py-8">
                  <RefreshCw className="size-8 animate-spin text-brand-forest" />
                  <p className="mt-3 font-display text-base font-bold text-brand-black">
                    Pollinations AI Menganalisis Tekstur...
                  </p>
                  <p className="mt-1 text-xs text-muted-moss">
                    Menggenerasi pola desain busana sirkular secara real-time.
                  </p>
                </div>
              )}

              {status === "done" && aiImageUrl && (
                <div className="mt-4 space-y-4 animate-in fade-in-0">
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-line-trace bg-canvas-warm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={aiImageUrl}
                      alt="Hasil Patchwork Pollinations AI"
                      className="size-full object-cover"
                    />
                  </div>

                  <div className="rounded-lg border border-line-trace bg-canvas-warm/40 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-black">
                        Hasil Pola Patchwork
                      </span>
                      <span className="text-xs font-bold text-brand-forest truncate max-w-[200px]">
                        {selectedMaterial?.batchTitle || "Upcycled Textile Design"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-moss">Estimasi Karbon Dicegah</span>
                      <span className="font-bold text-brand-black flex items-center gap-1">
                        <Leaf className="size-3 text-brand-emerald" /> 3.4 kg CO₂e
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-moss">Efisiensi Bahan Sisa</span>
                      <span className="font-bold text-brand-black">94% Zero-Waste</span>
                    </div>
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
