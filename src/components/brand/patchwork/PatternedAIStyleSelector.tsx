"use client";

import { Sparkles } from "lucide-react";

export interface PatternStyleOption {
  id: string;
  label: string;
  promptPrefix: string;
}

export const PATTERN_STYLES: PatternStyleOption[] = [
  {
    id: "seamless-patchwork",
    label: "Fabric Patchwork",
    promptPrefix: "Flat 2D textile fabric patchwork pattern with organic upcycled sewn cloth pieces",
  },
  {
    id: "geometric-boro",
    label: "Boro & Sashiko",
    promptPrefix: "Japanese Boro fabric patchwork pattern with fine white Sashiko stitches and textile grid",
  },
  {
    id: "denim-grid",
    label: "Raw Denim Grid",
    promptPrefix: "Indigo denim square grid fabric patchwork pattern with washed contrast seams",
  },
  {
    id: "minimalist-tonal",
    label: "Minimalist Tonal",
    promptPrefix: "Minimalist colour-block fabric patchwork pattern with subtle linen cloth texture",
  },
  {
    id: "botanical-upcycle",
    label: "Botanical Eco-Print",
    promptPrefix: "Botanical eco-print fabric patchwork pattern featuring leaf motifs and natural dye cloth textures",
  },
  {
    id: "vintage-textile",
    label: "Vintage Heritage",
    promptPrefix: "Vintage heritage textile fabric patchwork pattern with woven cloth textures",
  },
];

interface PatternedAIStyleSelectorProps {
  onSelectStyle: (promptText: string) => void;
  selectedStyleId?: string;
}

export function PatternedAIStyleSelector({
  onSelectStyle,
  selectedStyleId,
}: PatternedAIStyleSelectorProps) {
  return (
    <div className="space-y-2 font-body">
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-brand-black uppercase tracking-wider">
        <Sparkles className="size-3 text-brand-emerald" />
        <span>Prompt Siap Digunakan:</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {PATTERN_STYLES.map((style) => {
          const isSelected = selectedStyleId === style.id;
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onSelectStyle(style.promptPrefix)}
              className={`
                inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer
                ${
                  isSelected
                    ? "border border-brand-forest bg-brand-forest text-white shadow-2xs"
                    : "border border-brand-black/15 bg-canvas-warm/70 text-brand-black hover:border-brand-forest hover:bg-brand-lime/25"
                }
              `}
            >
              {style.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
