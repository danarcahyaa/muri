"use client";

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Gauge,
  Layers,
  Lightbulb,
  RefreshCw,
  Ruler,
  Scissors,
  ShieldCheck,
  Sparkles,
  Target,
  Wrench,
} from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { FactCard, MiniFact, OutcomeCard, PlanSection } from "./PatchworkShared";
import type { UseBrandPatchworkReturn } from "@/hooks/brand/useBrandPatchwork";

type PatchworkResultPanelProps = Pick<
  UseBrandPatchworkReturn,
  | "status"
  | "activeTab"
  | "setActiveTab"
  | "savedPattern"
  | "aiImageUrl"
  | "executionPlan"
  | "isSaving"
  | "handleSave"
  | "resetResult"
  | "setBriefConfirmed"
>;

export function PatchworkResultPanel({
  status,
  activeTab,
  setActiveTab,
  savedPattern,
  aiImageUrl,
  executionPlan,
  isSaving,
  handleSave,
  resetResult,
  setBriefConfirmed,
}: PatchworkResultPanelProps) {
  return (
    <div className="flex flex-col rounded-xl border border-line-trace bg-canvas-pure p-5 sm:p-6 lg:col-span-6">
      <div className="flex flex-col gap-3 border-b border-line-trace pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={activeTab === "image" ? "solid-black" : "ghost"}
            size="xs"
            onClick={() => setActiveTab("image")}
          >
            Visual Concept
          </Button>
          <Button
            type="button"
            variant={activeTab === "plan" ? "solid-black" : "ghost"}
            size="xs"
            onClick={() => setActiveTab("plan")}
          >
            Execution Plan
          </Button>
        </div>

        {status === "done" && savedPattern && (
          <Tooltip>
            <TooltipTrigger>
              <Badge
                variant="success"
                className="inline-flex items-center gap-1 rounded-full normal-case tracking-normal"
              >
                <CheckCircle2 className="size-3" /> Tersimpan di Database
              </Badge>
            </TooltipTrigger>
            <TooltipContent>Pattern ID: {savedPattern.id}</TooltipContent>
          </Tooltip>
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

            <Card variant="warm">
              <CardContent className="p-4">
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
                        Generate tidak mengunggah apa pun ke Supabase. Gambar
                        hasil dan referensi material baru diunggah setelah
                        tombol ini ditekan.
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
                          <RefreshCw className="mr-2 size-4 animate-spin" />
                          Menyimpan Hasil...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 size-4" />
                          Simpan Hasil ke Database
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-brand-lime bg-brand-lime/10">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-brand-forest" />
                  <div>
                    <p className="text-xs font-bold text-brand-forest">
                      Visual difokuskan pada bentuk dan eksekusi
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-moss">
                      Gambar hanya berisi produk, model, sudut alternatif, dan
                      detail patch. Tidak ada judul, label, angka, atau
                      layout presentasi; detail teknis tetap ada di Execution
                      Plan.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {executionPlan.visualPanelGuide.map((panel, index) => (
                    <Card key={panel.title} className="p-3">
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
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card variant="warm">
              <CardContent className="p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-brand-emerald">
                      {executionPlan.recommendationTitle}
                    </p>
                    <p className="mt-1 text-sm font-bold text-brand-black">
                      {executionPlan.productName}
                    </p>
                  </div>
                  <Badge
                    variant="success"
                    className="self-start rounded-full normal-case tracking-normal"
                  >
                    {executionPlan.wasteTarget}
                  </Badge>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-muted-moss">
                  {executionPlan.fitReason}
                </p>

                <div className="mt-4 grid gap-2 border-t border-line-trace pt-3 sm:grid-cols-2">
                  <MiniFact label="Teknik" value={executionPlan.patternTechnique} />
                  <MiniFact label="Kesulitan" value={executionPlan.difficulty} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      {status === "done" && activeTab === "plan" && executionPlan && (
        <div className="muri-scrollbar mt-4 max-h-[720px] space-y-5 overflow-y-auto pr-1 animate-in fade-in-0">
          <Card className="border-brand-lime bg-brand-lime/10">
            <CardContent className="p-4">
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
            </CardContent>
          </Card>

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
                <Card
                  key={`${piece.name}-${piece.qty}`}
                  className="grid gap-2 p-3 text-xs sm:grid-cols-[1fr_auto]"
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
                </Card>
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

          <Card variant="warm">
            <CardContent className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-wide text-brand-emerald">
                Alternatif Produk
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {executionPlan.alternativeProducts.map((product) => (
                  <Badge
                    key={product}
                    variant="outline"
                    className="rounded-full normal-case tracking-normal"
                  >
                    {product}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

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
  );
}