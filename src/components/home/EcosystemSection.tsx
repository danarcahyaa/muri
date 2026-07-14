import { Factory, FolderInput, Gem, Leaf, LucideIcon } from "lucide-react";

export default function EcosystemSection() {
  return (
    <section
      id="ekosistem"
      className="relative overflow-hidden bg-canvas-warm text-brand-black"
    >
      <div className="mx-auto w-[min(1320px,calc(100%_-_48px))] py-[clamp(78px,9vw,135px)]">
        {" "}
        <div className="grid gap-10 lg:grid-cols-5 lg:items-end lg:gap-12">
          <div className="lg:col-span-3">
            <div className="mb-5 flex items-center gap-3 text-brand-emerald">
              <Leaf className="size-4" strokeWidth={2} />
              <span className="text-sm font-bold uppercase">
                Kolaborasi Multisektor
              </span>
            </div>

            <h2 className="font-display text-5xl font-normal leading-none md:leading-18 tracking-tighter sm:text-6xl lg:text-7xl">
              <span className="block">Nikmati Ekosistem</span>
              <span className="block">Sirkular Muri.</span>
            </h2>
          </div>

          <div className="lg:col-span-2">
            <p className="max-w-xl text-sm leading-relaxed text-muted-moss sm:text-sm 2xl:text-base">
              Kami menghubungkan produsen limbah, aggregator, dan brand fashion
              dalam satu rantai pasok digital untuk menciptakan nilai ekonomi
              baru yang saling menguntungkan.
            </p>
          </div>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <EcosystemCard
            number="01"
            category="Produsen Limbah"
            title={
              <>
                Memilah dan
                <br />
                Menyetorkan.
              </>
            }
            description="Pilah sisa kain produksi Anda, daftarkan ke sistem, dan dapatkan poin serta insentif menarik."
            icon={Factory}
            featured
          />

          <EcosystemCard
            number="02"
            category="Aggregator"
            title={
              <>
                Mengumpulkan dan
                <br />
                Menyalurkan.
              </>
            }
            description="Muri memvalidasi, mengategorikan, dan mendistribusikan material secara efisien ke industri kreatif."
            icon={FolderInput}
          />

          <EcosystemCard
            number="03"
            category="Brand Demand"
            title={
              <>
                Menyerap dan
                <br />
                Mengolah.
              </>
            }
            description="Brand fashion mendapatkan akses bahan baku daur ulang berkualitas tinggi yang terverifikasi."
            icon={Gem}
            className="md:col-span-2 lg:col-span-1"
          />
        </div>
      </div>
    </section>
  );
}

type EcosystemCardProps = {
  number: string;
  category: string;
  title: React.ReactNode;
  description: string;
  icon: LucideIcon;
  featured?: boolean;
  className?: string;
};

function EcosystemCard({
  number,
  category,
  title,
  description,
  icon: Icon,
  featured = false,
  className = "",
}: EcosystemCardProps) {
  const cardStyle = featured
    ? `
      border-brand-forest
      bg-brand-forest
      text-white
      hover:border-line-trace
      hover:bg-canvas-pure
      hover:text-brand-black
    `
    : `
      border-line-trace
      bg-canvas-pure
      text-brand-black
      hover:border-brand-forest
      hover:bg-brand-forest
      hover:text-white
    `;

  const labelStyle = featured
    ? "text-brand-lime group-hover:text-brand-emerald"
    : "text-brand-emerald group-hover:text-brand-lime";

  const iconStyle = featured
    ? "text-brand-lime group-hover:text-brand-forest"
    : "text-brand-forest group-hover:text-brand-lime";

  const descriptionStyle = featured
    ? "text-brand-lime/80 group-hover:text-muted-moss"
    : "text-muted-moss group-hover:text-brand-lime/80";

  return (
    <article
      className={`group flex min-h-96 flex-col rounded-2xl border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-2xl sm:p-8 ${cardStyle} ${className}`}
    >
      <p
        className={`text-xs font-bold uppercase transition-colors duration-300 ${labelStyle}`}
      >
        {number} · {category}
      </p>

      <div className="flex flex-1 items-center justify-center py-10">
        <Icon
          className={`size-28 transition duration-300 group-hover:scale-105 ${iconStyle}`}
          strokeWidth={1.5}
        />
      </div>

      <div className="mt-auto">
        <h3 className="font-display text-3xl font-medium leading-tight tracking-tight lg:text-2xl xl:text-3xl 2xl:text-4xl">
          {title}
        </h3>

        <p
          className={`mt-4 text-xs leading-relaxed transition-colors duration-300 ${descriptionStyle}`}
        >
          {description}
        </p>
      </div>
    </article>
  );
}
