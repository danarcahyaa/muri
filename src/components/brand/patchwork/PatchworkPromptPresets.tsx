"use client";

import { Sparkles } from "lucide-react";

export interface PromptPreset {
  id: string;
  label: string;
  promptText: string;
}

export const PRESET_PROMPTS: PromptPreset[] = [
  {
    id: "traditional-geometric",
    label: "Traditional Geometric",
    promptText:
      "Geometric herringbone & chevron patchwork pattern with contrasting upcycled denim and raw cotton textures",
  },
  {
    id: "asymmetrical-grid",
    label: "Modern Asymmetrical Grid",
    promptText:
      "Modern asymmetrical grid layout combining earth-tone fabric scraps, clean seam lines, and subtle stitch accents",
  },
  {
    id: "zero-waste-mosaic",
    label: "Zero-Waste Mosaic",
    promptText:
      "Zero-waste mosaic patchwork with intricate organic scrap placement, vibrant indigo and natural linen tones",
  },
  {
    id: "denim-gradient",
    label: "Denim Gradient Blend",
    promptText:
      "Gradient tonal patchwork transition from dark raw denim to washed vintage indigo panels",
  },
  {
    id: "boro-sashiko",
    label: "Japanese Boro & Sashiko",
    promptText:
      "Traditional Japanese Boro aesthetic with visible white Sashiko embroidery stitches and layered indigo patches",
  },
  {
    id: "minimalist-block",
    label: "Minimalist Colour-Block",
    promptText:
      "Minimalist oversized colour-blocking patchwork using neutral olive, cream, and deep forest green panels",
  },
];

interface PatchworkPromptPresetsProps {
  onSelectPreset: (promptText: string) => void;
  activePrompt?: string;
}

export function PatchworkPromptPresets({
  onSelectPreset,
  activePrompt,
}: PatchworkPromptPresetsProps) {
  return (
    <div className="space-y-2 font-body">
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-moss">
        <Sparkles className="size-3 text-brand-emerald" />
        <span>Template Prompt Siap Pakai:</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESET_PROMPTS.map((preset) => {
          const isActive = activePrompt?.trim() === preset.promptText;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset.promptText)}
              className={`
                inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold transition cursor-pointer
                ${
                  isActive
                    ? "border border-brand-forest bg-brand-lime/60 text-brand-black shadow-xs"
                    : "border border-brand-black/15 bg-canvas-warm/70 text-brand-black hover:border-brand-forest hover:bg-brand-lime/25"
                }
              `}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
