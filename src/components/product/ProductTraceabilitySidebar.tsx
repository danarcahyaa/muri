"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import Link from "next/link";
import {
  ArrowRight,
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

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Separator } from "@/components/ui/Separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/Sheet";
import { buildTraceabilityHref, formatDecimal } from "@/lib/productDetail";

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
        className="w-full max-w-none gap-0 border-line-trace bg-canvas-pure p-0 sm:max-w-[620px]"
      >
        <SheetHeader className="shrink-0 border-b border-line-trace px-6 py-5 pr-16 sm:px-8 sm:py-6 sm:pr-16">
          <div className="flex items-center gap-2 text-brand-emerald">
            <ScanLine className="size-4" strokeWidth={2} />
            <p className="text-[10px] font-bold uppercase tracking-wider">
              Traceability
            </p>
          </div>

          <SheetTitle className="mt-2 font-display text-2xl font-medium tracking-[-0.04em] text-brand-black sm:text-3xl">
            Paspor Sirkular Produk
          </SheetTitle>

          <SheetDescription className="mt-2 max-w-xl text-xs leading-5 text-muted-moss">
            Perjalanan bahan baku, proses produksi, serta dampak lingkungan yang
            terhubung dengan bukti digital MURI.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
            <Card className="border-brand-forest/20 bg-brand-forest/[0.04]">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-lime text-brand-forest">
                      <ShieldCheck className="size-5" />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-brand-black">
                        MURI Circular Verified Protocol
                      </p>
                      <p className="mt-1 text-[10px] leading-4 text-muted-moss">
                        Paspor material digital terverifikasi tiga lapis untuk
                        transparansi dan pencegahan klaim palsu.
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-lime/70 px-3 py-1.5 text-[10px] font-bold text-brand-forest">
                    <CheckCircle2 className="size-3" />
                    Aktif
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-3 sm:grid-cols-2">
              <IdentityCard icon={QrCode} label="SKU Produk" value={sku} />
              <IdentityCard
                icon={Factory}
                label="ID Produksi"
                value={productionId}
                mono
              />
            </div>

            <Card variant="warm">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line-trace bg-canvas-pure">
                  {qrCodeUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrCodeUrl}
                      alt={`QR traceability ${sku}`}
                      className="size-16 object-contain"
                    />
                  ) : (
                    <QrCode
                      className="size-8 text-muted-moss/45"
                      strokeWidth={1.4}
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold text-brand-black">
                    QR Produk Terverifikasi
                  </p>
                  <p className="mt-1 text-[10px] leading-4 text-muted-moss">
                    Pindai QR untuk membuka identitas produk dan bukti digital
                    yang tersimpan pada sistem MURI.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Separator className="bg-line-trace" />

            <section aria-labelledby="traceability-progress-title">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-moss">
                    Status Verifikasi
                  </p>
                  <h3
                    id="traceability-progress-title"
                    className="mt-1 text-sm font-bold leading-5 text-brand-black"
                  >
                    Seluruh tahapan telah selesai
                  </h3>
                </div>

                <span className="inline-flex w-fit shrink-0 items-center rounded-full bg-brand-lime/55 px-3 py-1.5 text-[10px] font-bold text-brand-forest">
                  3 dari 3 tahap
                </span>
              </div>

              <div className="mt-5" role="list" aria-label="Tahapan traceability produk">
                {steps.map((step, index) => {
                  const isSelected = activeStep === step.number;
                  const isLast = index === steps.length - 1;

                  return (
                    <div
                      key={step.number}
                      role="listitem"
                      className="relative pb-3 last:pb-0 sm:pb-4"
                    >
                      {!isLast && (
                        <span
                          aria-hidden="true"
                          className="absolute bottom-[-12px] left-5 top-10 w-px -translate-x-1/2 bg-brand-forest/35 sm:bottom-[-16px] sm:left-6 sm:top-11"
                        />
                      )}

                      <button
                        type="button"
                        aria-pressed={isSelected}
                        aria-current={isSelected ? "step" : undefined}
                        onClick={() => setActiveStep(step.number)}
                        className="group relative grid w-full min-w-0 grid-cols-[40px_minmax(0,1fr)] gap-3 text-left outline-none sm:grid-cols-[48px_minmax(0,1fr)] sm:gap-4"
                      >
                        <span
                          className={`
                            relative z-10 flex size-10 items-center justify-center
                            rounded-full border transition duration-200
                            sm:size-12
                            ${
                              isSelected
                                ? "border-brand-forest bg-brand-forest text-white ring-4 ring-brand-lime/35"
                                : "border-brand-forest bg-brand-forest text-white group-hover:ring-4 group-hover:ring-brand-forest/10"
                            }
                          `}
                        >
                          <Check className="size-4 stroke-[3] sm:size-5" />
                        </span>

                        <span
                          className={`
                            min-w-0 rounded-xl border px-4 py-4 transition duration-200
                            sm:px-5 sm:py-4.5
                            ${
                              isSelected
                                ? "border-brand-forest bg-canvas-warm shadow-xs"
                                : "border-line-trace bg-canvas-pure group-hover:border-brand-forest/35 group-hover:bg-canvas-warm/45"
                            }
                          `}
                        >
                          <span className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                            <span className="min-w-0">
                              <span className="block text-[10px] font-bold uppercase tracking-wide text-brand-emerald">
                                {step.label}
                              </span>

                              <span className="mt-1.5 block break-words text-sm font-bold leading-5 text-brand-black">
                                {step.title}
                              </span>
                            </span>

                            <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full bg-brand-lime/55 px-2.5 py-1 text-[9px] font-bold text-brand-forest">
                              <CheckCircle2 className="size-3" />
                              Terverifikasi
                            </span>
                          </span>

                          <span className="mt-2 flex min-w-0 items-start gap-1.5 text-[11px] leading-4 text-muted-moss">
                            {step.number === 1 && (
                              <MapPin className="mt-0.5 size-3.5 shrink-0" />
                            )}
                            <span className="min-w-0 break-words">{step.meta}</span>
                          </span>

                          <span className="mt-3 block break-words text-[11px] leading-5 text-muted-moss">
                            {step.summary}
                          </span>
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-brand-emerald">
                      Rincian Tahap
                    </p>
                    <p className="mt-2 text-xs font-bold text-brand-black">
                      {selectedStep.label}
                    </p>
                  </div>

                  <span className="shrink-0 font-mono text-[9px] font-bold text-brand-forest">
                    #{evidenceCode}
                  </span>
                </div>

                <p className="mt-3 text-[10px] leading-5 text-muted-moss">
                  {selectedStep.detail}
                </p>

                {activeStep === 3 && (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
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
        </div>

        <SheetFooter className="shrink-0 border-t border-line-trace bg-canvas-warm/55 px-6 py-5 sm:px-8">
          <Button
            fullWidth
            render={<Link href={buildTraceabilityHref(productionId)} />}
          >
            Lihat Paspor & Sertifikat Lengkap
            <ArrowRight className="size-4" />
          </Button>
        </SheetFooter>
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
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-lime/65 text-brand-forest">
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
    <div className="rounded-xl bg-brand-lime/20 p-4">
      <div className="flex items-center gap-2 text-brand-emerald">
        <Icon className="size-4" strokeWidth={1.8} />
        <p className="text-[9px] font-bold uppercase tracking-wide">{label}</p>
      </div>
      <p className="mt-2 text-xs font-bold text-brand-black">{value}</p>
    </div>
  );
}
