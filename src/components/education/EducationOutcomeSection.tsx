import { Leaf } from "lucide-react";

const outcomes = [
  {
    number: "01",
    title: "Belajar Teori",
    description:
      "Memahami jenis material, siklus sirkular, dan kalkulasi jejak karbon.",
  },
  {
    number: "02",
    title: "Praktik Mandiri",
    description:
      "Mentransformasikan bahan mentah menjadi prototipe produk fashion nyata.",
  },
  {
    number: "03",
    title: "Sertifikasi & Komunitas",
    description:
      "Masuk ke dalam jaringan pengrajin Muri untuk menyalurkan hasil karya.",
  },
];

export default function EducationOutcomeSection() {
  return (
    <section className="bg-brand-forest text-canvas-pure">
      <div
        className="
          mx-auto grid w-[min(1320px,calc(100%_-_48px))]
          gap-16 py-[clamp(80px,9vw,130px)]
          lg:grid-cols-[1.25fr_0.85fr]
          lg:items-center
          lg:gap-24
        "
      >
        {/* Left content */}
        <div>
          <div className="mb-5 flex items-center gap-3 text-brand-lime">
            <Leaf className="size-4" strokeWidth={2} />

            <span className="text-sm font-bold uppercase tracking-tight">
              Output Kegiatan
            </span>
          </div>

          <h2
            className="
              max-w-3xl font-display
              text-[clamp(3.25rem,5.4vw,5.2rem)]
              font-normal leading-[0.98]
              tracking-[-0.055em]
            "
          >
            Dampak Nyata yang Kita Ciptakan Bersama.
          </h2>

          <p className="mt-10 max-w-xl text-base leading-relaxed text-white/55 sm:text-sm 2xl:text-base">
            Melalui edukasi, kita melahirkan kreator baru yang mampu menekan
            angka limbah tekstil di Indonesia secara masif.
          </p>
        </div>

        {/* Outcome list */}
        <div className="border-t border-canvas-pure/15">
          {outcomes.map((outcome) => (
            <article
              key={outcome.number}
              className="
                grid grid-cols-[48px_1fr] gap-5
                border-b border-canvas-pure/15
                py-10 sm:grid-cols-[56px_1fr]
              "
            >
              <span className="pt-1 text-base font-bold text-brand-lime">
                {outcome.number}
              </span>

              <div>
                <h3 className="font-display text-sm font-semibold text-canvas-pure sm:text-base">
                  {outcome.title}
                </h3>

                <p className="mt-2 max-w-md text-xs leading-relaxed text-canvas-pure/50">
                  {outcome.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
