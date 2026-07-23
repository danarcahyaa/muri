import { Leaf } from "lucide-react";

export default function MaterialHero() {
  return (
    <section className="overflow-hidden bg-brand-forest text-canvas-pure">
      <div
        className="
          mx-auto grid w-[min(1320px,calc(100%_-_48px))]
          gap-16 py-[clamp(80px,9vw,130px)]
          lg:grid-cols-[1.35fr_0.8fr]
          lg:items-center
          lg:gap-24
        "
      >
        <div>
          <div className="mb-5 flex items-center gap-3 text-brand-lime">
            <Leaf className="size-4" strokeWidth={2} />

            <span className="text-sm font-bold uppercase tracking-tight">
              Katalog Material Sirkular
            </span>
          </div>

          <h1
            className="
              max-w-4xl font-display
              text-[clamp(3.25rem,5.4vw,5.2rem)]
              font-normal leading-[0.98]
              tracking-[-0.055em]
            "
          >
            Temukan Material Sisa Produksi Berkualitas Tinggi.
          </h1>

          <p className="mt-10 max-w-3xl text-sm leading-relaxed text-white/55 2xl:text-base">
            Katalog material sirkular terverifikasi untuk kebutuhan produksi
            Anda. Hemat biaya bahan baku, kurangi limbah industri, dan dukung
            masa depan fashion sirkular.
          </p>
        </div>

        <aside
          className="
            rounded-2xl border border-canvas-pure/20
            bg-canvas-pure/[0.04] p-7
            sm:p-8
          "
        >
          <p className="text-xs font-bold uppercase tracking-tight text-brand-lime">
            Menyerap &amp; Mengolah
          </p>

          <div className="flex min-h-48 items-center justify-center py-8">
            <HangerIcon className="h-28 w-36 text-brand-lime" />
          </div>

          <div>
            <h2 className="max-w-sm font-display text-4xl font-medium leading-tight tracking-[-0.045em]">
              Koleksi Terkurasi untuk Brand.
            </h2>

            <p className="mt-3 max-w-sm text-xs leading-relaxed text-canvas-pure/55">
              Akses langsung ke bahan baku sekunder bersertifikat untuk
              mendukung lini fashion sirkular Anda.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

interface HangerIconProps {
  className?: string;
}

function HangerIcon({ className }: HangerIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 180 140"
      fill="none"
      className={className}
    >
      <path
        d="M68 38C68 22.5 77 14 90 14C103 14 112 22.5 112 36C112 47 105 52 95 59"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />

      <path
        d="M91 58L26 111C22.8 113.6 24.6 119 28.8 119H151.2C155.4 119 157.2 113.6 154 111L91 58Z"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinejoin="round"
      />
    </svg>
  );
}
