"use client";

import { type ReactElement } from "react";
import RichTextContent from "@/components/ui/RichTextContent";
import { FileText } from "lucide-react";

interface WasteRichDescriptionProps {
  detailsAndConditions: string | null | undefined;
}

export function WasteRichDescription({
  detailsAndConditions,
}: WasteRichDescriptionProps): ReactElement {
  return (
    <div className="space-y-3 rounded-xl bg-canvas-pure p-5 border border-brand-black/15">
      <div className="flex items-center gap-2 pb-3 border-b border-line-trace/40">
        <FileText className="size-4 text-brand-forest" />
        <h2 className="font-display font-bold text-base text-brand-black">
          Deskripsi & Spesifikasi Limbah
        </h2>
      </div>

      {detailsAndConditions && detailsAndConditions.trim() ? (
        <RichTextContent
          html={detailsAndConditions}
          className="text-sm text-brand-black/90 leading-relaxed"
        />
      ) : (
        <p className="text-sm text-muted-moss italic">
          Penyuplai tidak mencantumkan deskripsi tambahan untuk material ini.
        </p>
      )}
    </div>
  );
}
