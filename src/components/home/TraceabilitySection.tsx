"use client";

import Image from "next/image";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Leaf,
  Loader2,
  PackageSearch,
  PackageX,
  Search,
} from "lucide-react";

import {
  findTraceabilityRecord,
  normalizeBatchId,
  type TraceabilityRecord,
} from "@/data/traceability";
import { fetchTraceabilityRecordFromDb } from "@/services/product/traceabilityService";

type TraceStatus = "idle" | "processing" | "success" | "not-found";

export default function TraceabilitySection() {
  const [batchId, setBatchId] = useState("PRD-4356");
  const [trackedRecord, setTrackedRecord] = useState<TraceabilityRecord | null>(
    null,
  );
  const [previewRecord, setPreviewRecord] = useState<TraceabilityRecord | null>(
    null,
  );

  const [status, setStatus] = useState<TraceStatus>("idle");

  const normalizedBatch = normalizeBatchId(batchId);

  // Fetch preview record dynamically from DB (or fallback)
  useEffect(() => {
    let isCancelled = false;
    async function loadPreview() {
      const record = await fetchTraceabilityRecordFromDb(batchId);
      if (!isCancelled) {
        setPreviewRecord(record);
      }
    }
    void loadPreview();
    return () => {
      isCancelled = true;
    };
  }, [batchId]);

  const hasCompleteBatchFormat = /^BATCH-[A-Z0-9-]{4,}$/.test(normalizedBatch);

  const showProductNotFound = hasCompleteBatchFormat && !previewRecord;

  const processingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  function handleBatchChange(value: string) {
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }

    setBatchId(value);
    setTrackedRecord(null);
    setStatus("idle");
  }

  async function handleTrace() {
    const targetBatch = normalizeBatchId(batchId);

    if (!targetBatch || status === "processing") {
      return;
    }

    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }

    setBatchId(targetBatch);
    setTrackedRecord(null);
    setStatus("processing");

    // Fetch real DB record
    const record = await fetchTraceabilityRecordFromDb(targetBatch);

    processingTimeoutRef.current = setTimeout(() => {
      if (!record) {
        setStatus("not-found");
        return;
      }

      setTrackedRecord(record);
      setStatus("success");
    }, 1200);
  }

  useEffect(() => {
    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <section
      id="traceability"
      className="overflow-hidden bg-canvas-pure text-brand-black"
    >
      <div className="mx-auto w-[min(1320px,calc(100%_-_48px))] py-[clamp(78px,9vw,135px)]">
        <div className="grid gap-10 lg:grid-cols-5 lg:items-end lg:gap-12">
          <div className="lg:col-span-3">
            <div className="mb-5 flex items-center gap-3 text-brand-emerald">
              <Leaf className="size-4" strokeWidth={2} />
              <span className="text-sm font-bold uppercase">
                Transparansi Rantai Pasok
              </span>
            </div>

            <h2 className="font-display text-5xl font-normal leading-none md:leading-18 tracking-tighter sm:text-6xl lg:text-7xl">
              <span className="block">Coba Tracing, Tuk</span>
              <span className="block">Cegah Greenwashing.</span>
            </h2>
          </div>

          <div className="lg:col-span-2">
            <p className="max-w-xl text-base leading-relaxed text-muted-moss sm:text-sm 2xl:text-base">
              Lacak asal-usul setiap helai kain secara real-time. Buktikan
              kepada konsumen bahwa produk Anda benar-benar berdampak positif
              bagi lingkungan.
            </p>
          </div>
        </div>

        <div className="mt-16 overflow-hidden rounded-3xl border border-brand-black/15 bg-canvas-pure lg:grid lg:grid-cols-5">
          <TracingInput
            batchId={batchId}
            status={status}
            previewRecord={previewRecord}
            showProductNotFound={showProductNotFound}
            onBatchChange={handleBatchChange}
            onTrace={handleTrace}
          />

          <TracingResult
            batchId={normalizedBatch}
            status={status}
            record={trackedRecord}
          />
        </div>
      </div>
    </section>
  );
}

type TracingInputProps = {
  batchId: string;
  status: TraceStatus;
  previewRecord: TraceabilityRecord | null;
  showProductNotFound: boolean;
  onBatchChange: (value: string) => void;
  onTrace: () => void;
};

function TracingInput({
  batchId,
  status,
  previewRecord,
  showProductNotFound,
  onBatchChange,
  onTrace,
}: TracingInputProps) {
  const isProcessing = status === "processing";

  return (
    <div className="flex flex-col p-6 sm:p-8 lg:col-span-2 lg:p-10">
      <div className="flex items-center gap-3 text-brand-emerald">
        <Leaf className="size-4" strokeWidth={2} />

        <span className="text-sm font-bold uppercase">Input Cepat</span>
      </div>

      <h3 className="mt-3 font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
        Masukkan Batch ID produk Anda.
      </h3>

      <div className="mt-10">
        <label
          htmlFor="batch-id"
          className="text-sm font-bold uppercase text-brand-emerald"
        >
          Batch ID
        </label>

        <div className="mt-2 flex items-center border-b border-brand-black/15 pb-3 transition-colors focus-within:border-brand-emerald">
          <span className="font-display text-3xl text-brand-black">#</span>

          <input
            id="batch-id"
            type="text"
            value={batchId}
            onChange={(event) => onBatchChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onTrace();
              }
            }}
            autoComplete="off"
            disabled={isProcessing}
            className="min-w-0 flex-1 bg-transparent font-display text-3xl text-brand-black outline-none placeholder:text-muted-moss/50 disabled:opacity-50"
            placeholder="PRD-4356"
          />
        </div>
      </div>

      <ProductPreview
        record={previewRecord}
        showNotFound={showProductNotFound}
      />

      <div className="mt-8">
        <button
          type="button"
          onClick={onTrace}
          disabled={!batchId.trim() || isProcessing}
          className="group inline-flex items-center justify-center gap-2 rounded-md bg-brand-black px-6 py-4 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-brand-emerald disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isProcessing ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Melacak Data...
            </>
          ) : (
            <>
              Coba Tracing
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted-moss">
        *Masukkan Batch ID untuk melihat produk dan rekam jejak digital material
        dari hulu ke hilir.
      </p>
    </div>
  );
}

type TracingResultProps = {
  batchId: string;
  status: TraceStatus;
  record: TraceabilityRecord | null;
};

function TracingResult({ batchId, status, record }: TracingResultProps) {
  return (
    <div className="flex min-h-full flex-col bg-brand-forest p-6 text-white sm:p-8 lg:col-span-3 lg:p-10">
      <div className="flex items-center gap-3 text-brand-lime">
        <Leaf className="size-4" strokeWidth={2} />

        <span className="text-sm font-bold uppercase">Output Kilat</span>
      </div>

      <h3 className="mt-3 font-display text-3xl font-normal leading-tight tracking-tight sm:text-4xl">
        Hasil akan muncul di sini.
      </h3>

      {status === "idle" && <TracingEmptyState />}

      {status === "processing" && <TracingProcessingState />}

      {status === "not-found" && <TracingNotFoundState batchId={batchId} />}

      {status === "success" && record && <TracingDoneState record={record} />}
    </div>
  );
}
function TracingEmptyState() {
  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <div className="max-w-md text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-white/15 bg-white/[0.025] text-brand-lime">
          <Search className="size-7" strokeWidth={1.5} />
        </div>

        <h4 className="mt-6 font-display text-xl font-medium">
          Belum ada data tracing
        </h4>

        <p className="mt-3 text-xs leading-relaxed text-white/50">
          Masukkan Batch ID pada panel sebelah kiri, lalu klik tombol Coba
          Tracing untuk melihat perjalanan dan dampak material.
        </p>
      </div>
    </div>
  );
}

const processingSteps = [
  "Menghubungkan ke node verifikasi...",
  "Membaca riwayat batch...",
  "Menghitung dampak lingkungan...",
];

function TracingProcessingState() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    setStepIndex(0);
    const interval = setInterval(() => {
      setStepIndex((current) =>
        current < processingSteps.length - 1 ? current + 1 : current,
      );
    }, 420);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-16">
      <div className="w-full max-w-sm">
        {/* Scanning bar */}
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div className="absolute inset-y-0 w-1/3 animate-[scan_1.1s_ease-in-out_infinite] rounded-full bg-brand-lime" />
        </div>

        <div className="mt-6 space-y-2 text-center">
          {processingSteps.map((step, index) => (
            <p
              key={step}
              className={`text-xs font-medium uppercase tracking-wide transition-all duration-300 ${
                index === stepIndex
                  ? "text-brand-lime opacity-100"
                  : index < stepIndex
                    ? "text-white/30 opacity-60"
                    : "text-white/10 opacity-0"
              }`}
            >
              {step}
            </p>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(150%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
}

function TracingDoneState({ record }: { record: TraceabilityRecord }) {
  return (
    <div className="mt-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="rounded-2xl border border-white/15 bg-white/[0.025] backdrop-blur-[2px] p-5 sm:p-6">
        <h4 className="font-display text-2xl font-medium tracking-tight">
          {record.resultTitle}
        </h4>

        <p className="mt-2 text-xs leading-relaxed text-white/50">
          {record.resultDescription}
        </p>

        <p className="mt-3 text-xs font-bold uppercase text-brand-lime">
          Batch #{record.batchId}
        </p>

        <div className="mt-6 space-y-3">
          {record.timeline.map((item, index) => (
            <div
              key={item.number}
              style={{ animationDelay: `${index * 180}ms` }}
              className="grid gap-4 rounded-xl border border-white/15 px-4 py-4 sm:grid-cols-[auto_1fr] sm:items-center"
            >
              <div className="font-display text-sm font-bold text-brand-lime">
                {item.number}
              </div>

              <div>
                <p className="text-xs font-semibold text-white">
                  {item.date} – {item.place}
                </p>

                <p className="mt-1 text-xs leading-relaxed text-white/50">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h4 className="font-display text-2xl font-medium tracking-tight">
            Realtime Impact
          </h4>

          <div className="mt-2 grid gap-6 sm:grid-cols-2">
            {record.impacts.map((impact, index) => (
              <ImpactMetric
                key={impact.label}
                target={impact.target}
                suffix={impact.suffix}
                label={impact.label}
                active
                delayMs={index * 200}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

type ImpactMetricProps = {
  target: number;
  suffix?: string;
  label: string;
  active?: boolean;
  delayMs?: number;
};

function ImpactMetric({
  target,
  suffix = "",
  label,
  active = false,
  delayMs = 0,
}: ImpactMetricProps) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;

    let raf: number;
    let start: number | null = null;
    const duration = 900;

    const timeout = setTimeout(() => {
      function tick(timestamp: number) {
        if (start === null) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(eased * target);

        if (progress < 1) {
          raf = requestAnimationFrame(tick);
        }
      }
      raf = requestAnimationFrame(tick);
    }, delayMs);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [active, target, delayMs]);

  const displayVal =
    target < 10 && target % 1 !== 0
      ? value.toFixed(1).replace(".", ",")
      : Math.round(value).toLocaleString("id-ID");

  return (
    <div>
      <p className="font-display text-5xl font-normal leading-none tracking-tight text-brand-lime sm:text-6xl">
        {displayVal}
        {suffix}
      </p>

      <p className="mt-4 text-sm font-medium uppercase text-white/50">
        {label}
      </p>
    </div>
  );
}

type ProductPreviewProps = {
  record: TraceabilityRecord | null;
  showNotFound: boolean;
};

function ProductPreview({ record, showNotFound }: ProductPreviewProps) {
  if (record) {
    return (
      <div className="animate-in fade-in duration-300">
        <div className="mt-6 overflow-hidden rounded-lg bg-canvas-warm">
          <div className="aspect-video overflow-hidden relative">
            <ImageWithFallback
              src={record.product.image}
              alt={record.product.alt}
              fallbackTitle={record.product.name}
              width={800}
              height={500}
              className="size-full object-cover object-center"
            />
          </div>
        </div>

        <h4 className="mt-6 font-display text-3xl font-medium leading-tight tracking-tight">
          {record.product.name}
        </h4>

        <p className="mt-2 text-xs font-bold uppercase text-brand-emerald">
          Batch #{record.batchId}
        </p>
      </div>
    );
  }

  if (showNotFound) {
    return (
      <div className="mt-6 flex min-h-[230px] flex-col items-center justify-center rounded-lg border border-error-rust/20 bg-error-rust/[0.04] p-6 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-error-rust/10 text-error-rust">
          <PackageX className="size-5" strokeWidth={1.7} />
        </div>

        <h4 className="mt-4 font-display text-lg font-medium text-brand-black">
          Produk tidak ditemukan
        </h4>

        <p className="mt-2 max-w-xs text-xs leading-relaxed text-muted-moss">
          Batch ID tersebut belum terhubung dengan produk yang terdaftar di
          sistem Muri.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 flex min-h-[230px] flex-col items-center justify-center rounded-lg border border-dashed border-line-trace bg-canvas-warm/50 p-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-brand-emerald/[0.07] text-brand-emerald">
        <PackageSearch className="size-5" strokeWidth={1.7} />
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted-moss">
        Produk akan muncul ketika Batch ID berhasil dikenali.
      </p>
    </div>
  );
}

function TracingNotFoundState({ batchId }: { batchId: string }) {
  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <div className="max-w-md text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-error-rust/30 bg-error-rust/10 text-[#FF9A92]">
          <PackageX className="size-7" strokeWidth={1.5} />
        </div>

        <h4 className="mt-6 font-display text-xl font-medium">
          Batch tidak ditemukan
        </h4>

        <p className="mt-3 text-xs leading-relaxed text-white/50">
          Batch <span className="font-bold text-brand-lime">#{batchId}</span>{" "}
          belum terdaftar atau belum memiliki produk yang dapat dilacak.
        </p>

        <p className="mt-3 text-xs leading-relaxed text-white/35">
          Periksa kembali penulisan Batch ID dan coba lagi.
        </p>
      </div>
    </div>
  );
}
