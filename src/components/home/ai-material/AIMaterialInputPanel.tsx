import { ArrowRight, Leaf, Loader2 } from "lucide-react";
import type { ChangeEvent } from "react";

import MaterialPreviewCard from "./MaterialPreviewCard";
import PurchasedMaterialList from "./PurchasedMaterialList";
import UploadMaterialPanel from "./UploadMaterialPanel";

import type {
  AiStatus,
  PurchasedMaterial,
  SourceMode,
} from "@/data/aiMaterial";

type AIMaterialInputPanelProps = {
  inputId: string;
  sourceMode: SourceMode;
  status: AiStatus;
  selectedFileName: string;
  uploadedPreviewUrl: string | null;
  selectedPurchasedId: string;
  selectedPurchasedMaterial: PurchasedMaterial;
  materials: PurchasedMaterial[];
  buttonDisabled: boolean;
  onModeChange: (mode: SourceMode) => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onPurchasedSelect: (materialId: string) => void;
  onGenerate: () => void;
};

export default function AIMaterialInputPanel({
  inputId,
  sourceMode,
  status,
  selectedFileName,
  uploadedPreviewUrl,
  selectedPurchasedId,
  selectedPurchasedMaterial,
  materials,
  buttonDisabled,
  onModeChange,
  onFileChange,
  onPurchasedSelect,
  onGenerate,
}: AIMaterialInputPanelProps) {
  const isProcessing = status === "processing";

  return (
    <div className="flex min-w-0 flex-col p-6 sm:p-8 xl:p-8 2xl:p-10">
      <div className="flex items-center gap-3 text-brand-emerald">
        <Leaf className="size-4" strokeWidth={2} />

        <span className="text-sm font-bold uppercase">
          Input Cepat
        </span>
      </div>

      <h3 className="mt-3 font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
        Pola apa yang ingin Anda buat?
      </h3>

      <div className="mt-8 flex flex-wrap gap-3">
        <ModeButton
          active={sourceMode === "upload"}
          onClick={() => onModeChange("upload")}
        >
          Upload Sendiri
        </ModeButton>

        <ModeButton
          active={sourceMode === "purchased"}
          onClick={() => onModeChange("purchased")}
        >
          Limbah yang Dibeli
        </ModeButton>
      </div>

      <div className="mt-8">
        {sourceMode === "upload" ? (
          <div className="grid min-w-0 items-stretch gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <UploadMaterialPanel
              inputId={inputId}
              selectedFileName={selectedFileName}
              onFileChange={onFileChange}
            />

            <MaterialPreviewCard
              previewSrc={uploadedPreviewUrl}
              previewAlt="Preview material yang diunggah"
              badgeLabel="Material Preview"
              scanning={isProcessing}
              imageFit="cover"
              emptyTitle="Preview material akan muncul di sini."
            />
          </div>
        ) : (
          <div className="grid min-w-0 items-stretch gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <PurchasedMaterialList
              materials={materials}
              selectedId={selectedPurchasedId}
              onSelect={onPurchasedSelect}
            />

            <MaterialPreviewCard
              previewSrc={selectedPurchasedMaterial.image}
              previewAlt={selectedPurchasedMaterial.alt}
              badgeLabel={selectedPurchasedMaterial.batchId}
              scanning={isProcessing}
              imageFit="contain"
              emptyTitle="Pilih material yang ingin dipindai."
            />
          </div>
        )}
      </div>

      <div className="mt-8">
        <button
          type="button"
          onClick={onGenerate}
          disabled={buttonDisabled}
          className="group inline-flex items-center justify-center gap-2 rounded-md bg-brand-black px-6 py-4 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-brand-emerald disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isProcessing ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Memproses Pola...
            </>
          ) : (
            <>
              Hasilkan Pola Baru

              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

type ModeButtonProps = {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
};

function ModeButton({
  active,
  children,
  onClick,
}: ModeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-full px-6 py-4 text-xs font-bold transition ${
        active
          ? "bg-brand-black text-white"
          : "border border-line-trace bg-canvas-pure text-brand-black hover:bg-canvas-warm"
      }`}
    >
      {children}
    </button>
  );
}