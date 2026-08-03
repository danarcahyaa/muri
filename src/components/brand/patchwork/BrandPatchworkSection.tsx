"use client";

import { Sparkles } from "lucide-react";

import { TooltipProvider } from "@/components/ui/Tooltip";
import { useBrandPatchwork } from "@/hooks/brand/useBrandPatchwork";
import { PatchworkSourceCard } from "./PatchworkSourceCard";
import { PatchworkBriefCard } from "./PatchworkBriefCard";
import { PatchworkResultPanel } from "./PatchworkResultPanel";

export default function BrandPatchworkSection() {
  const patchwork = useBrandPatchwork();

  return (
    <TooltipProvider delay={200}>
      <section className="mt-8 font-body">
        <div className="rounded-2xl border border-brand-black/15 bg-canvas-pure p-6 sm:p-8">
          <div className="flex flex-col gap-3 border-b border-line-trace pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-brand-black">
                Patchwork Execution Advisor
              </h2>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-moss">
                Sistem membantu memilih produk yang paling cocok, teknik
                patchwork, kebutuhan mesin, pola potong, risiko produksi, dan
                urutan eksekusi.
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-brand-lime/30 px-3 py-1 text-xs font-bold text-brand-forest sm:self-auto">
              <Sparkles className="size-3.5" />
              <span>1 rekomendasi terarah per generate</span>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-6">
              <PatchworkSourceCard
                fileInputRef={patchwork.fileInputRef}
                sourceMode={patchwork.sourceMode}
                switchMode={patchwork.switchMode}
                materials={patchwork.materials}
                isLoadingMaterials={patchwork.isLoadingMaterials}
                selectedMaterialId={patchwork.selectedMaterialId}
                selectMaterial={patchwork.selectMaterial}
                files={patchwork.files}
                previews={patchwork.previews}
                totalBytes={patchwork.totalBytes}
                dragActive={patchwork.dragActive}
                setDragActive={patchwork.setDragActive}
                handleFileChange={patchwork.handleFileChange}
                handleDrop={patchwork.handleDrop}
                clearImages={patchwork.clearImages}
              />

              <PatchworkBriefCard
                fabricType={patchwork.fabricType}
                setFabricType={patchwork.setFabricType}
                pieceFormat={patchwork.pieceFormat}
                setPieceFormat={patchwork.setPieceFormat}
                materialCondition={patchwork.materialCondition}
                setMaterialCondition={patchwork.setMaterialCondition}
                targetProduct={patchwork.targetProduct}
                setTargetProduct={patchwork.setTargetProduct}
                productionLevel={patchwork.productionLevel}
                setProductionLevel={patchwork.setProductionLevel}
                visualDirection={patchwork.visualDirection}
                setVisualDirection={patchwork.setVisualDirection}
                customNote={patchwork.customNote}
                setCustomNote={patchwork.setCustomNote}
                customNoteError={patchwork.customNoteError}
                briefConfirmed={patchwork.briefConfirmed}
                setBriefConfirmed={patchwork.setBriefConfirmed}
                invalidateBrief={patchwork.invalidateBrief}
                status={patchwork.status}
                sourceReady={patchwork.sourceReady}
                canGenerate={patchwork.canGenerate}
                errorMsg={patchwork.errorMsg}
                handleGenerate={patchwork.handleGenerate}
              />
            </div>

            <PatchworkResultPanel
              status={patchwork.status}
              activeTab={patchwork.activeTab}
              setActiveTab={patchwork.setActiveTab}
              savedPattern={patchwork.savedPattern}
              aiImageUrl={patchwork.aiImageUrl}
              executionPlan={patchwork.executionPlan}
              isSaving={patchwork.isSaving}
              handleSave={patchwork.handleSave}
              resetResult={patchwork.resetResult}
              setBriefConfirmed={patchwork.setBriefConfirmed}
            />
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
}