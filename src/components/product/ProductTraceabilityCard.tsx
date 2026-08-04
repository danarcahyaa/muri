"use client";

import { useState } from "react";
import Link from "next/link";
import type { ComponentType } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Droplets,
  Factory,
  Leaf,
  PackageCheck,
  QrCode,
  ScanLine,
  Scissors,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Separator } from "@/components/ui/Separator";
import { buildTraceabilityHref, formatDecimal } from "@/lib/productDetail";

interface ProductTraceabilityCardProps {
  sku: string;
  productionId: string;
  qrCodeUrl: string | null;
  brandName: string;
  carbonSavedKg: number;
  waterSavedLiter: number;
}

interface TraceabilityStep {
  number: number;
  label: string;
  title: string;
  summary: string;
  detail: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
}

export default function ProductTraceabilityCard({
  sku,
  productionId,
  qrCodeUrl,
  brandName,
  carbonSavedKg,
  waterSavedLiter,
}: ProductTraceabilityCardProps) {
  const [activeStep, setActiveStep] = useState(3);

  const carbonSavedText = `${formatDecimal(carbonSavedKg)} kg CO₂e`;
  const waterSavedText = `${formatDecimal(waterSavedLiter, 0)} liter`;
  const evidenceCode = productionId.slice(0, 8) || "MURI";

  const steps: TraceabilityStep[] = [
    {
      number: 1,
      label: "Asal Bahan",
      title: "Sumber material tercatat",
      summary: "Dokumen asal bahan baku telah ditautkan ke paspor digital MURI.",
      detail:
        "Identitas sumber dan batch bahan baku tersimpan sebagai bagian dari bukti traceability produk.",
      icon: PackageCheck,
    },
    {
      number: 2,
      label: "Pengolahan",
      title: brandName,
      summary: "Proses pengolahan brand tercatat pada ID produksi produk.",
      detail: `Tahap produksi oleh ${brandName} terhubung dengan identitas produksi sehingga alurnya dapat ditelusuri kembali.`,
      icon: Scissors,
    },
    {
      number: 3,
      label: "Dampak Verified",
      title: "Dampak sirkular terukur",
      summary: `${carbonSavedText} karbon dan ${waterSavedText} air dihemat.`,
      detail:
        "Data dampak lingkungan tercatat sebagai hasil akhir perjalanan bahan baku dan verifikasi produk.",
      icon: ShieldCheck,
    },
  ];

  const selectedStep =
    steps.find((step) => step.number === activeStep) ?? steps[2];

  return (
    <Card className="overflow-hidden rounded-2xl">
      <CardContent className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-brand-emerald">
              <ScanLine className="size-4" strokeWidth={2} />
              <p className="text-[10px] font-bold uppercase tracking-wider">
                Traceability
              </p>
            </div>

            <h2 className="mt-3 font-display text-2xl font-medium tracking-[-0.04em] text-brand-black">
              Paspor Sirkular
            </h2>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-lime/70 px-3 py-1.5 text-[10px] font-bold text-brand-forest">
            <CheckCircle2 className="size-3" />
            Aktif
          </span>
        </div>

        <div className="mt-5 rounded-xl border border-brand-forest/15 bg-brand-forest/[0.04] p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-lime text-brand-forest">
              <ShieldCheck className="size-4.5" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold text-brand-black">
                MURI Circular Verified Protocol
              </p>
              <p className="mt-1 text-[10px] leading-4 text-muted-moss">
                Paspor digital 3 tahap untuk transparansi bahan baku dan
                verifikasi anti-greenwashing.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          <IdentityRow icon={QrCode} label="SKU Produk" value={sku} />
          <IdentityRow
            icon={Factory}
            label="ID Produksi"
            value={productionId}
            mono
          />
        </div>

        <div className="mt-4 flex items-center gap-4 rounded-xl bg-canvas-warm/70 p-4">
          <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line-trace bg-canvas-pure">
            {qrCodeUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrCodeUrl}
                alt={`QR traceability ${sku}`}
                className="size-13 object-contain"
              />
            ) : (
              <QrCode className="size-7 text-muted-moss/45" strokeWidth={1.4} />
            )}
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold text-brand-black">
              QR Produk Terverifikasi
            </p>
            <p className="mt-1 text-[10px] leading-4 text-muted-moss">
              Gunakan QR untuk membuka paspor sirkular dan bukti digital produk.
            </p>
          </div>
        </div>

        <Separator className="my-6 bg-line-trace" />

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-moss">
              Status Verifikasi
            </p>
            <p className="mt-1 text-sm font-bold text-brand-black">
              Seluruh tahap selesai
            </p>
          </div>

          <span className="text-[10px] font-bold text-brand-forest">
            3 dari 3 tahap
          </span>
        </div>

        <div className="relative mt-5">
          <div className="absolute bottom-5 left-4 top-4 w-px bg-line-trace" />
          <div className="absolute bottom-5 left-4 top-4 w-px bg-brand-forest" />

          <div className="space-y-1">
            {steps.map((step) => {
              const Icon = step.icon;
              const isSelected = activeStep === step.number;
              const isFinalStep = step.number === steps.length;

              return (
                <button
                  key={step.number}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setActiveStep(step.number)}
                  className={`
                    group relative grid w-full grid-cols-[32px_minmax(0,1fr)]
                    gap-3 rounded-xl px-0 py-3 text-left transition
                    ${isSelected ? "bg-canvas-warm/75 pr-3" : "hover:bg-canvas-warm/45 hover:pr-3"}
                  `}
                >
                  <span
                    className={`
                      relative z-10 flex size-8 items-center justify-center
                      rounded-full transition
                      ${
                        isFinalStep
                          ? "bg-brand-lime text-brand-forest"
                          : "bg-brand-forest text-white"
                      }
                      ${isSelected ? "ring-4 ring-brand-lime/35" : ""}
                    `}
                  >
                    {isFinalStep ? (
                      <Icon className="size-4" strokeWidth={2.2} />
                    ) : (
                      <Check className="size-4 stroke-[3]" />
                    )}
                  </span>

                  <span className="min-w-0 pt-0.5">
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-brand-emerald">
                        {step.label}
                      </span>
                      <span className="text-[9px] font-bold text-brand-forest">
                        Terverifikasi
                      </span>
                    </span>

                    <span className="mt-1 block text-xs font-bold text-brand-black">
                      {step.title}
                    </span>

                    <span className="mt-1 block text-[10px] leading-4 text-muted-moss">
                      {step.summary}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-line-trace bg-canvas-warm/45 p-4">
          <div className="flex items-start justify-between gap-4">
            <p className="text-xs font-bold text-brand-black">
              {selectedStep.label}
            </p>
            <span className="shrink-0 font-mono text-[9px] font-bold text-brand-forest">
              #{evidenceCode}
            </span>
          </div>

          <p className="mt-2 text-[10px] leading-4 text-muted-moss">
            {selectedStep.detail}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function IdentityRow({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-canvas-warm/55 px-4 py-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-lime/65 text-brand-forest">
        <Icon className="size-4" strokeWidth={1.8} />
      </div>

      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-wide text-muted-moss">
          {label}
        </p>
        <p
          className={`mt-1 truncate text-[11px] font-bold text-brand-black ${
            mono ? "font-mono" : ""
          }`}
          title={value}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
