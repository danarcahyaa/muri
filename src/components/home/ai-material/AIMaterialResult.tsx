import Link from "next/link";
import { ArrowRight, CheckCircle2, Cpu, Leaf, Loader2, Scissors, Sparkles, Upload } from "lucide-react";

import {
  mockRecommendations,
  type AiStatus,
  type AiRecommendation,
} from "@/data/aiMaterial";

type AIMaterialResultProps = {
  status: AiStatus;
};

export default function AIMaterialResult({
  status,
}: AIMaterialResultProps) {
  return (
    <div className="flex min-h-full min-w-0 flex-col bg-brand-forest p-6 text-white sm:p-8 xl:p-8 2xl:p-10">
      <div className="flex items-center gap-3 text-brand-lime">
        <Leaf className="size-4" strokeWidth={2} />

        <span className="text-sm font-bold uppercase">
          Output AI Patchwork
        </span>
      </div>

      <h3 className="mt-3 font-display text-3xl font-normal leading-tight tracking-tight sm:text-4xl">
        Rekomendasi Pola Sirkular
      </h3>

      {status === "idle" && <AIEmptyState />}
      {status === "processing" && <AIProcessingState />}
      {status === "done" && <AIDoneState />}
    </div>
  );
}

function AIEmptyState() {
  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <div className="max-w-md text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-white/15 bg-white/5 text-brand-lime">
          <Upload className="size-7" strokeWidth={1.7} />
        </div>

        <h4 className="mt-6 font-display text-xl font-medium">
          Belum ada rekomendasi
        </h4>

        <p className="mt-3 text-xs leading-relaxed text-white/50">
          Pilih atau unggah material di panel sebelah kiri, lalu klik tombol
          Hasilkan Pola Baru.
        </p>
      </div>
    </div>
  );
}

function AIProcessingState() {
  return (
    <div className="mt-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="rounded-2xl border border-white/15 bg-white/5 p-5 sm:p-6">
        <h4 className="font-display text-2xl font-medium tracking-tight">
          Memindai Tekstur & Menyusun Blueprint...
        </h4>

        <p className="mt-2 text-xs leading-relaxed text-white/50">
          MURI AI Engine sedang membaca warna, ketebalan kain, dan kalkulasi efisiensi pola pemotongan tanpa sisa.
        </p>

        <div className="mt-6 space-y-3">
          {[
            "Menganalisis kerapatan serat material...",
            "Menghitung efisiensi pemotongan & layout...",
            "Menyusun blueprint pola patchwork sirkular...",
          ].map((text, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex size-7 items-center justify-center rounded-full bg-brand-lime/20 text-brand-lime">
                <Loader2 className="size-4 animate-spin" />
              </div>
              <p className="text-xs font-medium text-white/80">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-lime/20 bg-brand-lime/10 px-4 py-2 text-[11px] font-bold uppercase text-brand-lime">
          <Sparkles className="size-3.5 animate-pulse" />
          Generasi Pola AI Berlangsung
        </div>
      </div>
    </div>
  );
}

function AIDoneState() {
  return (
    <div className="mt-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="rounded-2xl border border-white/15 bg-white/5 p-5 sm:p-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-brand-lime mb-2">
            <CheckCircle2 className="size-4" />
            <span className="text-xs font-bold uppercase">Pola Seamless AI Dihasilkan</span>
          </div>
          <h4 className="font-display text-2xl font-medium tracking-tight">
            Pola Patchwork Kain Seamless
          </h4>

          <p className="mt-2 text-xs leading-relaxed text-white/50">
            Hasil generasi pola tekstur kain sirkular tanpa sambungan (seamless) yang siap diterapkan pada mockup busana & produksi.
          </p>
        </div>

        {/* List of Patterns */}
        <div className="grid gap-4 sm:grid-cols-3">
          {mockRecommendations.map((item, index) => (
            <RecommendationCard
              key={item.title}
              item={item}
              animationDelay={index * 120}
              index={index}
            />
          ))}
        </div>

        {/* CTA to Brand Dashboard */}
        <div className="pt-2">
          <Link
            href="/brand/dashboard/patchwork"
            className="group inline-flex items-center justify-center gap-2.5 rounded-md bg-brand-lime px-6 py-3.5 text-xs font-bold text-brand-black transition hover:-translate-y-0.5 hover:bg-white"
          >
            Buka Studio Pola & Mockup 2D di Dashboard Brand
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}

type RecommendationCardProps = {
  item: AiRecommendation;
  animationDelay: number;
  index: number;
};

function RecommendationCard({
  item,
  animationDelay,
  index,
}: RecommendationCardProps) {
  return (
    <article
      style={{ animationDelay: `${animationDelay}ms` }}
      className="
        flex flex-col justify-between overflow-hidden rounded-xl
        border border-white/15 bg-white/[0.04] transition hover:border-brand-lime/50
      "
    >
      {/* SVG Pattern Texture Preview */}
      <div className="relative aspect-square w-full overflow-hidden bg-white/5 p-2">
        <div className="size-full overflow-hidden rounded-lg border border-white/10">
          <PatternSvgPreview index={index} />
        </div>
        <div className="absolute top-4 left-4">
          <span className="rounded-md bg-brand-black/80 px-2 py-0.5 text-[9px] font-bold text-brand-lime backdrop-blur-xs">
            {item.badge}
          </span>
        </div>
      </div>

      {/* Pattern Meta */}
      <div className="p-3.5 space-y-2">
        <p className="text-xs font-bold leading-snug text-white line-clamp-2">
          {item.title}
        </p>

        <p className="text-[10px] leading-relaxed text-white/50 line-clamp-2">
          {item.subtitle}
        </p>

        <div className="pt-1 flex items-center gap-2 text-[9px] font-bold text-brand-lime">
          <span className="rounded bg-brand-lime/20 px-1.5 py-0.5">Mockup 2D Ready</span>
        </div>
      </div>
    </article>
  );
}

function PatternSvgPreview({ index }: { index: number }) {
  if (index === 0) {
    // Vintage Heritage Textile Patchwork (Checker / Quilt)
    return (
      <svg className="size-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#1b3824" />
        <rect x="0" y="0" width="50" height="50" fill="#2d5236" />
        <rect x="50" y="50" width="50" height="50" fill="#386341" />
        <path d="M0 25H100M0 75H100M25 0V100M75 0V100" stroke="#a3e635" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
        <rect x="25" y="25" width="50" height="50" fill="#25472e" rx="4" />
        <path d="M25 25L75 75M75 25L25 75" stroke="#a3e635" strokeWidth="0.8" opacity="0.5" />
      </svg>
    );
  }

  if (index === 1) {
    // Japanese Boro & Sashiko (Denim Patch & Stitches)
    return (
      <svg className="size-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#1e3a5f" />
        <rect x="5" y="5" width="40" height="42" fill="#2b4c7e" rx="2" />
        <rect x="50" y="10" width="45" height="35" fill="#172b47" rx="2" />
        <rect x="8" y="52" width="84" height="40" fill="#23426d" rx="2" />
        <path d="M0 15H100M0 30H100M0 45H100M0 60H100M0 75H100M0 90H100" stroke="#ffffff" strokeWidth="1" strokeDasharray="3 3" opacity="0.75" />
        <path d="M15 0V100M30 0V100M45 0V100M60 0V100M75 0V100M90 0V100" stroke="#ffffff" strokeWidth="1" strokeDasharray="3 3" opacity="0.75" />
      </svg>
    );
  }

  // Geometric Herringbone Patchwork
  return (
    <svg className="size-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#193322" />
      <path d="M0 0L50 50L0 100" fill="#2d593b" />
      <path d="M50 0L100 50L50 100" fill="#3a6e4a" />
      <path d="M0 0L100 100M100 0L0 100" stroke="#a3e635" strokeWidth="0.8" opacity="0.6" />
      <circle cx="50" cy="50" r="15" fill="#a3e635" fillOpacity="0.25" stroke="#a3e635" strokeWidth="1" />
    </svg>
  );
}