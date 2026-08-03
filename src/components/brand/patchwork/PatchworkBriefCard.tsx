"use client";

import { AlertTriangle, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import {
  CONDITION_OPTIONS,
  FABRIC_OPTIONS,
  MAX_CUSTOM_NOTE,
  PIECE_OPTIONS,
  PRODUCTION_OPTIONS,
  TARGET_OPTIONS,
  VISUAL_OPTIONS,
  getOptionLabel,
} from "@/constants/patchwork.constants";
import { SelectField, StepHeader } from "./PatchworkShared";
import type { UseBrandPatchworkReturn } from "@/hooks/brand/useBrandPatchwork";

type PatchworkBriefCardProps = Pick<
  UseBrandPatchworkReturn,
  | "fabricType"
  | "setFabricType"
  | "pieceFormat"
  | "setPieceFormat"
  | "materialCondition"
  | "setMaterialCondition"
  | "targetProduct"
  | "setTargetProduct"
  | "productionLevel"
  | "setProductionLevel"
  | "visualDirection"
  | "setVisualDirection"
  | "customNote"
  | "setCustomNote"
  | "customNoteError"
  | "briefConfirmed"
  | "setBriefConfirmed"
  | "invalidateBrief"
  | "status"
  | "sourceReady"
  | "canGenerate"
  | "errorMsg"
  | "handleGenerate"
>;

export function PatchworkBriefCard({
  fabricType,
  setFabricType,
  pieceFormat,
  setPieceFormat,
  materialCondition,
  setMaterialCondition,
  targetProduct,
  setTargetProduct,
  productionLevel,
  setProductionLevel,
  visualDirection,
  setVisualDirection,
  customNote,
  setCustomNote,
  customNoteError,
  briefConfirmed,
  setBriefConfirmed,
  invalidateBrief,
  status,
  sourceReady,
  canGenerate,
  errorMsg,
  handleGenerate,
}: PatchworkBriefCardProps) {
  const inputSummary = [
    getOptionLabel(FABRIC_OPTIONS, fabricType),
    getOptionLabel(PIECE_OPTIONS, pieceFormat),
    getOptionLabel(TARGET_OPTIONS, targetProduct),
    getOptionLabel(PRODUCTION_OPTIONS, productionLevel),
  ];

  return (
    <>
      <Card>
        <CardContent className="space-y-4 p-5 sm:p-6">
          <StepHeader
            number="2"
            title="Profil teknis material"
            description="Data ini menentukan teknik sambungan dan stabilisasi."
          />

          <div className="grid gap-4 sm:grid-cols-2">
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
                hint="Menentukan bagian mana yang harus dibuang dan risiko produksi yang ditampilkan di execution plan."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-5 sm:p-6">
          <StepHeader
            number="3"
            title="Tujuan eksekusi"
            description="Batasi hasil agar sesuai kemampuan produksi brand."
          />

          <div className="grid gap-4 sm:grid-cols-2">
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
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-5 sm:p-6">
          <StepHeader
            number="4"
            title="Catatan desain opsional"
            description="Hanya untuk arahan yang benar-benar memengaruhi eksekusi."
          />

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

          <div className="flex items-start justify-between gap-4">
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
        </CardContent>
      </Card>

      <Card variant="warm" className="border border-brand-lime bg-brand-lime/15">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-forest" />
            <div>
              <p className="text-xs font-bold text-brand-forest">
                Scope penggunaan AI dibatasi
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-moss">
                AI hanya menerima profil material, target produk, arah visual,
                dan catatan konstruksi. Sistem tidak meneruskan permintaan di
                luar konteks ke Pollinations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-brand-emerald">
            Ringkasan sebelum menggunakan kredit AI
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {inputSummary.map((item) => (
              <Badge
                key={item}
                variant="neutral"
                className="rounded-full normal-case tracking-normal"
              >
                {item}
              </Badge>
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
        </CardContent>
      </Card>

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
            <RefreshCw className="mr-2 size-4 animate-spin" />
            Menyusun Rekomendasi Eksekusi...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 size-4 text-brand-lime" />
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
    </>
  );
}