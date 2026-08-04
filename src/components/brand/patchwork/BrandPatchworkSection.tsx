"use client";

import { Grid, Sparkles } from "lucide-react";

import { TooltipProvider } from "@/components/ui/Tooltip";
import { useBrandPatchwork } from "@/hooks/brand/useBrandPatchwork";
import { PatternedAILeftPanel } from "./PatternedAILeftPanel";
import { PatternedAIPatternsTab } from "./PatternedAIPatternsTab";

export default function BrandPatchworkSection() {
  const patchwork = useBrandPatchwork();

  return (
    <TooltipProvider delay={200}>
      <section className="mt-8 font-body">
        {/* Studio White Container */}
        <div className="rounded-2xl border border-brand-black/15 bg-canvas-pure p-6 sm:p-8 space-y-6">
          {/* Studio Top Header */}
          <div className="flex flex-col gap-3 border-b border-line-trace pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-bold text-brand-black">
                  Patchwork Pattern & Mockup Studio
                </h2>
                
              </div>
              
            </div>
          </div>

          {/* Studio Split Layout (2 Columns) */}
          <div className="grid gap-8 lg:grid-cols-12 items-start">
            {/* Left Column: Patterned.ai Controls */}
            <div className="lg:col-span-5">
              <PatternedAILeftPanel
                fileInputRef={patchwork.fileInputRef}
                files={patchwork.files}
                previews={patchwork.previews}
                totalBytes={patchwork.totalBytes}
                dragActive={patchwork.dragActive}
                setDragActive={patchwork.setDragActive}
                handleFileChange={patchwork.handleFileChange}
                handleDrop={patchwork.handleDrop}
                clearImages={patchwork.clearImages}
                promptText={patchwork.promptText}
                setPromptText={patchwork.setPromptText}
                customNoteError={patchwork.customNoteError}
                status={patchwork.status}
                canGenerate={patchwork.canGenerate}
                errorMsg={patchwork.errorMsg}
                handleGenerate={patchwork.handleGenerate}
              />
            </div>

            {/* Right Column: Galeri Pola Tersimpan & Modal Mockup */}
            <div className="lg:col-span-7 space-y-6">
              {/* Header Title */}
              <div className="flex items-center justify-between border-b border-line-trace pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 rounded-xl bg-brand-forest px-4 py-2 text-xs font-bold text-white shadow-xs">
                    <Grid className="size-4" />
                    <span>Galeri Pola Tersimpan</span>
                    <span className="ml-1 rounded-full bg-brand-lime px-2 py-0.5 text-[10px] text-brand-forest">
                      {patchwork.savedPatterns.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct Pattern Gallery */}
              <PatternedAIPatternsTab
                patterns={patchwork.savedPatterns}
                isLoading={patchwork.isLoadingSavedPatterns}
                activePatternId={patchwork.activeSilhouettePattern?.id ?? null}
                onSelectPattern={patchwork.handleSelectPatternForSilhouette}
                onDeletePattern={patchwork.handleDeletePattern}
                deletingId={patchwork.deletingPatternId}
              />
            </div>
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
}