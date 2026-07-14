import { ArrowRight, Leaf } from "lucide-react";

const gridCells = Array.from({ length: 144 });

export default function HeroSection() {
  return (
    <section className="relative isolate min-h-screen overflow-hidden bg-brand-black text-white">
      <HeroBackground />

      <div className="relative z-10 mx-auto grid min-h-[calc(100svh-4rem)] w-[min(1320px,calc(100%_-_48px))] items-center gap-12 py-[clamp(78px,9vw,135px)] lg:grid-cols-5">
        {" "}
        <HeroContent />
        <HeroDiagram />
      </div>
    </section>
  );
}

function HeroBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-brand-emerald/30 via-brand-forest to-brand-black/40" />
      <div className="absolute inset-0 bg-gradient-to-br from-brand-lime/5 via-transparent to-brand-lime/5" />

      <div className="absolute inset-0 opacity-20 blur-3xl">
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          className="size-full"
          fill="none"
        >
          <path
            d="M-220 290C80 160 330 150 610 220C790 265 930 330 1070 275C1180 230 1235 130 1195 30C1160 -55 1185 -130 1320 -130C1480 -130 1570 -40 1660 80"
            stroke="#C8F169"
            strokeWidth="120"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="absolute inset-0 opacity-10">
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          className="size-full"
          fill="none"
        >
          <path
            d="M-220 290C80 160 330 150 610 220C790 265 930 330 1070 275C1180 230 1235 130 1195 30C1160 -55 1185 -130 1320 -130C1480 -130 1570 -40 1660 80"
            stroke="#C8F169"
            strokeWidth="72"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="absolute inset-y-0 left-1/3 w-1/3 bg-gradient-to-r from-transparent via-brand-lime/10 to-transparent blur-3xl" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-brand-black/20" />
    </div>
  );
}

function HeroContent() {
  return (
    <div className="max-w-4xl lg:col-span-3">
      <div className="mb-6 flex items-center gap-3 text-brand-lime">
        <Leaf className="size-4" strokeWidth={2} />
        <span className="text-sm font-semibold uppercase">
          Solusi Sirkular Berbasis AI
        </span>
      </div>

      <h1 className="font-display text-5xl font-normal leading-none md:leading-18 tracking-tighter text-white sm:text-6xl lg:text-7xl xl:text-[5.5rem]/[6rem]">
        <span className="block lg:whitespace-nowrap">Jangan Biarkan</span>
        <span className="block lg:whitespace-nowrap">
          Sisa Produksi <span className="text-brand-lime">Kain</span>
        </span>
        <span className="block lg:whitespace-nowrap">
          Menjadi <span className="text-brand-lime">Sampah.</span>
        </span>
      </h1>

      <p className="mt-6 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
        Muri mengubah tumpukan kain tak terpakai menjadi peluang ekonomi baru
        yang terukur, transparan, dan otomatis demi masa depan fashion yang
        berkelanjutan.
      </p>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <a
          href="#konsumen"
          className="group inline-flex items-center justify-center gap-2 rounded-md bg-brand-lime px-6 py-4 text-xs font-bold text-brand-black transition hover:-translate-y-0.5 hover:bg-brand-lime/90"
        >
          Sebagai Konsumen
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </a>

        <a
          href="#mitra"
          className="group inline-flex items-center justify-center gap-2 rounded-md border border-white px-6 py-4 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
        >
          Sebagai Mitra
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </a>
      </div>
    </div>
  );
}

function HeroDiagram() {
  return (
    <div className="mx-auto w-full max-w-lg lg:col-span-2">
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-brand-black/10">
        <DiagramGrid />

        <svg
          viewBox="0 0 500 500"
          className="pointer-events-none absolute inset-0 z-10 size-full"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M300 120L170 260"
            stroke="currentColor"
            strokeWidth="2"
            className="text-brand-lime"
          />
          <path
            d="M170 340L330 420"
            stroke="currentColor"
            strokeWidth="2"
            className="text-brand-lime"
          />
        </svg>

        <DiagramCard
          number="01"
          category="Supply"
          title="Produsen Limbah"
          className="absolute right-6 top-8 z-20 sm:right-10"
        />

        <DiagramCard
          number="02"
          category="Aggregator"
          title="MURI"
          featured
          className="absolute left-8 top-1/2 z-20 -translate-y-1/2 sm:left-12"
        />

        <DiagramCard
          number="03"
          category="Demand"
          title="Brand Fashion"
          className="absolute bottom-8 right-6 z-20 sm:right-10"
        />
      </div>
    </div>
  );
}

function DiagramGrid() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 grid grid-cols-12 grid-rows-12 opacity-20"
    >
      {gridCells.map((_, index) => (
        <div key={index} className="border-b border-r border-white/30" />
      ))}
    </div>
  );
}

type DiagramCardProps = {
  number: string;
  category: string;
  title: string;
  featured?: boolean;
  className?: string;
};

function DiagramCard({
  number,
  category,
  title,
  featured = false,
  className = "",
}: DiagramCardProps) {
  return (
    <div
      className={`rounded-2xl border border-white/10 p-5 shadow-xl backdrop-blur-md ${
        featured ? "bg-brand-black/20" : "bg-brand-black/20"
      } ${className}`}
    >
      <div className="flex size-8 items-center justify-center rounded-full bg-brand-lime font-display text-md font-medium text-brand-black sm:size-12">
        {number}
      </div>

      <p className="mt-4 text-xs font-medium uppercase text-brand-lime">
        {category}
      </p>

      <p className="mt-1 whitespace-nowrap font-display text-xl tracking-tight text-white sm:text-xl">
        {title}
      </p>
    </div>
  );
}
