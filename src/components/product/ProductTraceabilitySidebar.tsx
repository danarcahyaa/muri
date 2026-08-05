"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import {
  Check,
  CheckCircle2,
  Droplets,
  Factory,
  Leaf,
  MapPin,
  Package,
  QrCode,
  ScanLine,
  Scissors,
  ShieldCheck,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/Card";
import { Separator } from "@/components/ui/Separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/Sheet";
import { formatDecimal } from "@/lib/productDetail";

interface ProductTraceabilitySidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  meta: string;
  summary: string;
  detail: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
}

export default function ProductTraceabilitySidebar({
  open,
  onOpenChange,
  sku,
  productionId,
  qrCodeUrl,
  brandName,
  carbonSavedKg,
  waterSavedLiter,
}: ProductTraceabilitySidebarProps) {
  const [activeStep, setActiveStep] = useState(3);

  const carbonSavedText = `${formatDecimal(carbonSavedKg)} kg CO₂e`;
  const waterSavedText = `${formatDecimal(waterSavedLiter, 0)} liter`;
  const evidenceCode = productionId.slice(0, 8) || "MURI";

  const steps: TraceabilityStep[] = [
    {
      number: 1,
      label: "Asal Limbah",
      title: "PT Tekstil Jaya Limbah",
      meta: "Bandung, Jawa Barat",
      summary: "Bahan baku dan batch asal telah dicatat pada paspor digital.",
      detail:
        "Bahan baku denim dan cotton deadstock diperoleh dari sisa potongan pabrik yang telah melalui verifikasi berat dan kualitas fisik oleh MURI.",
      icon: Package,
    },
    {
      number: 2,
      label: "Pengolahan Brand",
      title: brandName,
      meta: "Studio crafting sirkular",
      summary: "Tahap produksi terhubung dengan identitas produksi produk.",
      detail: `${brandName} mengolah material dengan proses pemotongan yang tercatat sehingga alur produksi dapat ditelusuri kembali.`,
      icon: Scissors,
    },
    {
      number: 3,
      label: "Dampak Verified",
      title: "Dampak sirkular terukur",
      meta: "Audit MURI selesai",
      summary: `${carbonSavedText} karbon dan ${waterSavedText} air dihemat.`,
      detail:
        "Data dampak lingkungan tersimpan sebagai hasil akhir perjalanan bahan baku dan verifikasi anti-greenwashing produk.",
      icon: ShieldCheck,
    },
  ];

  const selectedStep =
    steps.find((step) => step.number === activeStep) ?? steps[2];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-l border-line-trace bg-canvas-pure p-0 sm:max-w-md"
      >
        {/* Header */}
        <SheetHeader className="shrink-0 border-b border-line-trace px-6 py-5 pr-14">
          <div className="flex items-center gap-2 text-brand-emerald">
            <ScanLine className="size-4" strokeWidth={2} />
            <p className="text-[10px] font-bold uppercase tracking-wider">
              Traceability
            </p>
          </div>

          <SheetTitle className="mt-1 font-display text-xl font-bold tracking-tight text-brand-black">
            Paspor Sirkular Produk
          </SheetTitle>

          <SheetDescription className="mt-1 text-xs leading-relaxed text-muted-moss">
            Perjalanan bahan baku, proses produksi, serta dampak lingkungan yang
            terhubung dengan bukti digital MURI.
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {/* Protocol Banner */}
          <Card className="border-brand-forest/20 bg-brand-forest/[0.04]">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-lime text-brand-forest">
                    <ShieldCheck className="size-4" />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-brand-black">
                      MURI Circular Protocol
                    </p>
                    <p className="mt-0.5 text-[10px] leading-4 text-muted-moss">
                      Paspor material terverifikasi tiga lapis untuk transparansi.
                    </p>
                  </div>
                </div>

                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-lime/70 px-2.5 py-1 text-[9px] font-bold text-brand-forest">
                  <CheckCircle2 className="size-3" />
                  Aktif
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Identity Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <IdentityCard icon={QrCode} label="SKU Produk" value={sku} />
            <IdentityCard
              icon={Factory}
              label="ID Produksi"
              value={productionId}
              mono
            />
          </div>

          {/* QR Code Section */}
          <Card variant="warm">
            <CardContent className="flex items-center gap-3.5 p-4">
              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line-trace bg-canvas-pure">
                {qrCodeUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrCodeUrl}
                    alt={`QR traceability ${sku}`}
                    className="size-14 object-contain"
                  />
                ) : (
                  <QrCode
                    className="size-7 text-muted-moss/45"
                    strokeWidth={1.4}
                  />
                )}
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold text-brand-black">
                  QR Produk Terverifikasi
                </p>
                <p className="mt-0.5 text-[10px] leading-4 text-muted-moss">
                  Pindai QR untuk membuka bukti digital perjalanan produk.
                </p>
              </div>
            </CardContent>
          </Card>

          <Separator className="bg-line-trace" />

          {/* Progress Timeline Section */}
          <section aria-labelledby="traceability-progress-title">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-moss">
                  Status Verifikasi
                </p>
                <h3
                  id="traceability-progress-title"
                  className="mt-0.5 text-xs font-bold text-brand-black"
                >
                  Seluruh tahapan telah selesai
                </h3>
              </div>

              <span className="inline-flex shrink-0 items-center rounded-full bg-brand-lime/55 px-2.5 py-1 text-[9px] font-bold text-brand-forest">
                3/3 Tahap
              </span>
            </div>

            <div className="mt-4 space-y-3" role="list" aria-label="Tahapan traceability">
              {steps.map((step, index) => {
                const isSelected = activeStep === step.number;
                const isLast = index === steps.length - 1;

                return (
                  <div
                    key={step.number}
                    role="listitem"
                    className="relative pb-2 last:pb-0"
                  >
                    {!isLast && (
                      <span
                        aria-hidden="true"
                        className="absolute bottom-[-8px] left-4 top-8 w-px -translate-x-1/2 bg-brand-forest/30"
                      />
                    )}

                    <button
                      type="button"
                      aria-pressed={isSelected}
                      aria-current={isSelected ? "step" : undefined}
                      onClick={() => setActiveStep(step.number)}
                      className="group relative grid w-full grid-cols-[32px_minmax(0,1fr)] gap-3 text-left outline-none"
                    >
                      <span
                        className={`
                          relative z-10 flex size-8 items-center justify-center
                          rounded-full border transition duration-200
                          ${
                            isSelected
                              ? "border-brand-forest bg-brand-forest text-white ring-2 ring-brand-lime/40"
                              : "border-brand-forest bg-brand-forest text-white"
                          }
                        `}
                      >
                        <Check className="size-3.5 stroke-[3]" />
                      </span>

                      <span
                        className={`
                          min-w-0 rounded-xl border p-3.5 transition duration-200
                          ${
                            isSelected
                              ? "border-brand-forest bg-canvas-warm"
                              : "border-line-trace bg-canvas-pure group-hover:border-brand-forest/35"
                          }
                        `}
                      >
                        <span className="flex items-start justify-between gap-2">
                          <span className="min-w-0">
                            <span className="block text-[10px] font-bold uppercase tracking-wide text-brand-emerald">
                              {step.label}
                            </span>

                            <span className="mt-0.5 block truncate text-xs font-bold text-brand-black">
                              {step.title}
                            </span>
                          </span>

                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-lime/55 px-2 py-0.5 text-[8px] font-bold text-brand-forest">
                            <CheckCircle2 className="size-2.5" />
                            Verified
                          </span>
                        </span>

                        <span className="mt-1 flex items-center gap-1 text-[10px] text-muted-moss">
                          {step.number === 1 && (
                            <MapPin className="size-3 shrink-0" />
                          )}
                          <span className="truncate">{step.meta}</span>
                        </span>

                        <span className="mt-1.5 block text-[10px] leading-relaxed text-muted-moss">
                          {step.summary}
                        </span>
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Selected Step Detail Card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-brand-emerald">
                    Rincian Tahap
                  </p>
                  <p className="mt-0.5 text-xs font-bold text-brand-black">
                    {selectedStep.label}
                  </p>
                </div>

                <span className="shrink-0 font-mono text-[9px] font-bold text-brand-forest">
                  #{evidenceCode}
                </span>
              </div>

              <p className="mt-2 text-[10px] leading-relaxed text-muted-moss">
                {selectedStep.detail}
              </p>

              {activeStep === 3 && (
                <div className="mt-3.5 grid grid-cols-2 gap-2">
                  <ImpactItem
                    icon={Leaf}
                    label="Karbon Dihemat"
                    value={carbonSavedText}
                  />
                  <ImpactItem
                    icon={Droplets}
                    label="Air Dihemat"
                    value={waterSavedText}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function IdentityCard({
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
    <Card>
      <CardContent className="flex items-center gap-2.5 p-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-lime/65 text-brand-forest">
          <Icon className="size-3.5" strokeWidth={1.8} />
        </div>

        <div className="min-w-0">
          <p className="text-[8px] uppercase tracking-wide text-muted-moss">
            {label}
          </p>
          <p
            className={`mt-0.5 truncate text-[10px] font-bold text-brand-black ${
              mono ? "font-mono" : ""
            }`}
            title={value}
          >
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ImpactItem({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-brand-lime/20 p-3">
      <div className="flex items-center gap-1.5 text-brand-emerald">
        <Icon className="size-3.5" strokeWidth={1.8} />
        <p className="text-[8px] font-bold uppercase tracking-wide">{label}</p>
      </div>
      <p className="mt-1 text-xs font-bold text-brand-black">{value}</p>
    </div>
  );
}
