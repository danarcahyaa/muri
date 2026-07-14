import { ArrowRight, Leaf, Loader2, Upload } from "lucide-react";

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
          Output Kilat
        </span>
      </div>

      <h3 className="mt-3 font-display text-3xl font-normal leading-tight tracking-tight sm:text-4xl">
        Rekomendasi akan muncul di sini.
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
          Memindai Material dan Menyusun Opsi Pola...
        </h4>

        <p className="mt-2 text-xs leading-relaxed text-white/50">
          AI Muri sedang membaca tekstur, warna, dan kemungkinan pola yang
          paling efisien untuk material Anda.
        </p>

        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="h-3 w-28 animate-pulse rounded-full bg-white/10" />

              <div className="mt-4 h-20 animate-pulse rounded-xl bg-white/[0.07]" />
            </div>
          ))}
        </div>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-lime/20 bg-brand-lime/10 px-4 py-2 text-[11px] font-bold uppercase text-brand-lime">
          <Loader2 className="size-3.5 animate-spin" />
          Generate sedang berlangsung
        </div>
      </div>
    </div>
  );
}

function AIDoneState() {
  return (
    <div className="mt-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="rounded-2xl border border-white/15 bg-white/5 p-5 sm:p-6">
        <h4 className="font-display text-2xl font-medium tracking-tight">
          Hasil Kreasi AI Pola Baju Anda.
        </h4>

        <p className="mt-2 text-xs leading-relaxed text-white/50">
          Visualisasi instan desain fashion masa depan dari material daur ulang
          Anda. Pilih pola terbaik dan mulai produksi tanpa sisa.
        </p>

        <div className="mt-6 grid gap-3 2xl:grid-cols-3">
          {mockRecommendations.map((item, index) => (
            <RecommendationCard
              key={item.title}
              item={item}
              animationDelay={index * 120}
            />
          ))}
        </div>

        <button
          type="button"
          className="group mt-8 inline-flex items-center justify-center gap-2 rounded-md bg-brand-lime px-6 py-4 text-xs font-bold text-brand-black transition hover:-translate-y-0.5 hover:bg-white"
        >
          Telusuri

          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}

type RecommendationCardProps = {
  item: AiRecommendation;
  animationDelay: number;
};

function RecommendationCard({
  item,
  animationDelay,
}: RecommendationCardProps) {
  return (
    <article
      style={{ animationDelay: `${animationDelay}ms` }}
      className="
        grid min-w-0 grid-cols-[88px_minmax(0,1fr)]
        overflow-hidden rounded-xl border border-white/10
        bg-white/[0.04]
        2xl:flex 2xl:flex-col
      "
    >
      <div className="aspect-square bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.03))] p-2.5">
        <div className="flex size-full items-center justify-center rounded-lg border border-dashed border-white/15 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]">
          <div className="h-[55%] w-[42%] rounded-t-full rounded-b-[0.8rem] border border-brand-lime/25 bg-brand-lime/10" />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center p-3">
        <p className="text-[11px] font-bold leading-snug text-white">
          {item.title}
        </p>

        <p className="mt-2 text-[10px] leading-relaxed text-white/50">
          {item.subtitle}
        </p>
      </div>
    </article>
  );
}