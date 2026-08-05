import { Gift, ImageOff, Shirt } from "lucide-react";

interface ProductVisualCardProps {
  title: string;
  brandName: string;
  categoryName: string;
  bonusText: string | null;
  imageUrl?: string | null;
}

export default function ProductVisualCard({
  title,
  brandName,
  categoryName,
  bonusText,
  imageUrl,
}: ProductVisualCardProps) {
  return (
    <article className="rounded-2xl border border-brand-black/15 bg-canvas-pure p-5 sm:p-7">
      <div
        className="
          relative flex aspect-[16/7.2]
          items-center justify-center overflow-hidden
          rounded-xl bg-canvas-warm
        "
      >
        {imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imageUrl}
            alt={`Foto ${title}`}
            className="size-full object-cover"
          />
        ) : (
          <>
            <div
              aria-hidden="true"
              className="absolute -right-16 -top-16 size-64 rounded-full border border-brand-emerald/10"
            />

            <div
              aria-hidden="true"
              className="absolute -bottom-24 -left-20 size-72 rounded-full border border-brand-emerald/10"
            />

            <div className="relative z-10 flex flex-col items-center text-muted-moss/65">
              <Shirt
                className="size-24 text-brand-forest sm:size-28"
                strokeWidth={1.2}
              />

              <div className="mt-5 flex items-center gap-2 text-xs">
                <ImageOff
                  className="size-4"
                  strokeWidth={1.6}
                />
                Foto produk belum tersedia
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-canvas-warm px-4 py-2 text-[10px] font-bold text-brand-emerald">
          {brandName}
        </span>

        <span className="rounded-full bg-canvas-warm px-4 py-2 text-[10px] font-bold text-brand-emerald">
          {categoryName}
        </span>

        {bonusText && (
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-lime/60 px-4 py-2 text-[10px] font-bold text-brand-forest">
            <Gift
              className="size-3.5"
              strokeWidth={1.8}
            />
            {bonusText}
          </span>
        )}
      </div>

      <p className="sr-only">{title}</p>
    </article>
  );
}
