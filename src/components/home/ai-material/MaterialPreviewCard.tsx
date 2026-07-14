import Image from "next/image";
import { PackageSearch } from "lucide-react";

type MaterialPreviewCardProps = {
  previewSrc: string | null;
  previewAlt: string;
  badgeLabel: string;
  scanning: boolean;
  imageFit: "cover" | "contain";
  emptyTitle: string;
};

export default function MaterialPreviewCard({
  previewSrc,
  previewAlt,
  badgeLabel,
  scanning,
  imageFit,
  emptyTitle,
}: MaterialPreviewCardProps) {
  const isBlobImage = previewSrc?.startsWith("blob:") ?? false;

  return (
    <div className="relative h-[320px] min-w-0 overflow-hidden rounded-2xl bg-brand-forest p-4 sm:h-[340px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(200,241,105,0.08),transparent_40%)]" />

      <div className="relative size-full overflow-hidden rounded-md border border-white/10 bg-brand-black/15">
        {previewSrc ? (
          <>
            <Image
              src={previewSrc}
              alt={previewAlt}
              fill
              unoptimized={isBlobImage}
              sizes="(min-width: 1536px) 460px, (min-width: 1280px) 360px, 90vw"
              className={
                imageFit === "contain"
                  ? "bg-canvas-pure object-contain p-3"
                  : "object-cover"
              }
            />

            <div className="pointer-events-none absolute inset-0 bg-brand-black/[0.06]" />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <PackageSearch
              className="size-8 text-brand-lime"
              strokeWidth={1.5}
            />

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              {emptyTitle}
            </p>
          </div>
        )}

        {scanning && previewSrc ? (
          <>
            <div className="pointer-events-none absolute inset-0 bg-brand-lime/[0.04]" />

            <div className="ai-scan-line pointer-events-none absolute inset-x-4 z-20 h-[3px] rounded-full bg-brand-lime shadow-[0_0_22px_rgba(200,241,105,0.95)]" />

            <div className="ai-scan-glow pointer-events-none absolute inset-0 z-10" />
          </>
        ) : null}

        {previewSrc ? (
          <div className="absolute bottom-4 left-4 z-30 rounded-full bg-brand-black/65 px-4 py-2 backdrop-blur-md">
            <p className="text-[10px] font-bold uppercase text-brand-lime">
              {badgeLabel}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}