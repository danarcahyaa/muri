"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
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
  Sparkles,
} from "lucide-react";

import DetailCard from "@/components/ui/detail/DetailCard";
import DetailInfoItem from "@/components/ui/detail/DetailInfoItem";
import { buildTraceabilityHref } from "@/lib/productDetail";

interface ProductTraceabilityCardProps {
  sku: string;
  productionId: string;
  qrCodeUrl: string | null;
}

export default function ProductTraceabilityCard({
  sku,
  productionId,
  qrCodeUrl,
}: ProductTraceabilityCardProps) {
  const [activeStep, setActiveStep] = useState<number>(1);

  return (
    <DetailCard
      eyebrow="Traceability"
      title="Perjalanan Bahan Baku & Verifikasi Anti-Greenwashing"
      icon={ScanLine}
    >
      {/* Anti-Greenwashing Verification Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-brand-forest/20 bg-brand-forest/5 p-4.5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-lime text-brand-forest">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-brand-black">
              MURI Circular Verified Protocol
            </p>
            <p className="mt-0.5 text-[11px] text-muted-moss">
              Paspor material digital terverifikasi 3 lapis untuk menjamin transparansi &amp; mencegah klaim palsu (anti-greenwashing).
            </p>
          </div>
        </div>

        <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-brand-lime/60 px-3 py-1 text-[10px] font-bold text-brand-forest">
          <CheckCircle2 className="size-3" /> Verifikasi Aktif
        </span>
      </div>

      {/* Top Details & QR Section */}
      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_180px]">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <DetailInfoItem
            icon={QrCode}
            label="SKU Produk"
            value={sku}
          />

          <DetailInfoItem
            icon={Factory}
            label="ID Produksi"
            value={productionId}
          />
        </div>

        <div className="flex min-h-44 flex-col items-center justify-center rounded-xl border border-line-trace bg-canvas-warm/50 p-5">
          {qrCodeUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrCodeUrl}
              alt={`QR traceability ${sku}`}
              className="size-28 object-contain"
            />
          ) : (
            <div className="text-center text-muted-moss/55">
              <QrCode
                className="mx-auto size-9"
                strokeWidth={1.4}
              />
              <p className="mt-2 text-[10px] leading-relaxed">
                QR produk terverifikasi MURI
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Visual Connected Timeline Stepper */}
      <div className="mt-6 space-y-5 rounded-xl border border-line-trace bg-canvas-warm/30 p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-black flex items-center gap-2">
            <Sparkles className="size-4 text-brand-emerald" />
            Alur Penelusuran Bahan Baku (Timeline Roadmap)
          </p>
          <span className="text-[10px] font-medium text-muted-moss">Klik setiap tahap untuk rincian</span>
        </div>

        {/* Step Nodes Grid with Refined Clean Spacing */}
        <div className="relative grid gap-5 lg:grid-cols-3">
          {/* Step Node 1 */}
          <div
            onClick={() => setActiveStep(1)}
            className={`relative flex flex-col justify-between rounded-xl border p-5 transition cursor-pointer ${
              activeStep === 1
                ? "border-brand-forest bg-canvas-pure shadow-xs"
                : "border-line-trace bg-canvas-pure/90 hover:border-brand-forest/40 hover:bg-canvas-pure"
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-line-trace/40">
                <span className="flex size-7 items-center justify-center rounded-full bg-brand-lime text-xs font-bold text-brand-forest">
                  1
                </span>
                <span className="text-[10px] font-bold text-brand-forest bg-brand-lime/40 px-2.5 py-1 rounded-full">
                  Asal Limbah
                </span>
              </div>

              <div className="py-3.5 space-y-2">
                <h4 className="text-xs font-bold text-brand-black flex items-center gap-1.5 leading-snug">
                  <Package className="size-3.5 text-brand-emerald shrink-0" />
                  PT Tekstil Jaya Limbah
                </h4>
                <p className="text-[11px] text-muted-moss flex items-center gap-1">
                  <MapPin className="size-3 shrink-0" /> Bandung, Jawa Barat
                </p>
                <p className="text-[11px] text-brand-black pt-1 leading-relaxed">
                  50 kg Kain Denim &amp; Cotton Deadstock 14oz
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-line-trace/40 flex items-center justify-between text-[10px] text-muted-moss">
              <span>Batch #MAT-884F2A1C</span>
              <span className="font-bold text-brand-forest">100% Sisa Pabrik</span>
            </div>
          </div>

          {/* Step Node 2 */}
          <div
            onClick={() => setActiveStep(2)}
            className={`relative flex flex-col justify-between rounded-xl border p-5 transition cursor-pointer ${
              activeStep === 2
                ? "border-brand-forest bg-canvas-pure shadow-xs"
                : "border-line-trace bg-canvas-pure/90 hover:border-brand-forest/40 hover:bg-canvas-pure"
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-line-trace/40">
                <span className="flex size-7 items-center justify-center rounded-full bg-brand-lime text-xs font-bold text-brand-forest">
                  2
                </span>
                <span className="text-[10px] font-bold text-brand-forest bg-brand-lime/40 px-2.5 py-1 rounded-full">
                  Pengolahan Brand
                </span>
              </div>

              <div className="py-3.5 space-y-2">
                <h4 className="text-xs font-bold text-brand-black flex items-center gap-1.5 leading-snug">
                  <Scissors className="size-3.5 text-brand-emerald shrink-0" />
                  Memuai Sustainable
                </h4>
                <p className="text-[11px] text-muted-moss">
                  Studio Crafting Sirkular
                </p>
                <p className="text-[11px] text-brand-black pt-1 leading-relaxed">
                  Teknik Patchwork AI &amp; Zero-Waste Cutting
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-line-trace/40 flex items-center justify-between text-[10px] text-muted-moss">
              <span>Efisiensi Bahan</span>
              <span className="font-bold text-brand-forest">94% Zero-Waste</span>
            </div>
          </div>

          {/* Step Node 3 */}
          <div
            onClick={() => setActiveStep(3)}
            className={`relative flex flex-col justify-between rounded-xl border p-5 transition cursor-pointer ${
              activeStep === 3
                ? "border-brand-forest bg-canvas-pure shadow-xs"
                : "border-line-trace bg-canvas-pure/90 hover:border-brand-forest/40 hover:bg-canvas-pure"
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-line-trace/40">
                <span className="flex size-7 items-center justify-center rounded-full bg-brand-forest text-xs font-bold text-white">
                  3
                </span>
                <span className="text-[10px] font-bold text-brand-forest bg-brand-lime/40 px-2.5 py-1 rounded-full">
                  Dampak Verified
                </span>
              </div>

              <div className="py-3.5 space-y-2">
                <h4 className="text-xs font-bold text-brand-black flex items-center gap-1.5 leading-snug">
                  <ShieldCheck className="size-3.5 text-brand-forest shrink-0" />
                  Dampak Sirkular Terukur
                </h4>
                <p className="text-[11px] font-semibold text-brand-black flex items-center gap-1.5">
                  <Leaf className="size-3.5 text-brand-emerald shrink-0" /> 1.8 kg CO₂e Karbon Dihemat
                </p>
                <p className="text-[11px] font-semibold text-brand-black flex items-center gap-1.5">
                  <Droplets className="size-3.5 text-blue-600 shrink-0" /> 450 Liter Air Bersih Dihemat
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-line-trace/40 flex items-center justify-between text-[10px] text-muted-moss">
              <span>Status Audit</span>
              <span className="font-bold text-brand-forest">100% Terverifikasi</span>
            </div>
          </div>
        </div>

        {/* Selected Step Verification Details Drawer */}
        <div className="rounded-xl border border-line-trace bg-canvas-pure p-4.5 text-xs space-y-2">
          <div className="flex items-center justify-between font-bold text-brand-black">
            <span>
              {activeStep === 1
                ? "Verifikasi Dokumen Asal Limbah Pabrik"
                : activeStep === 2
                  ? "Audit Proses Produksi & Pemotongan Zero-Waste"
                  : "Sertifikat Hasil Audit Dampak Emisi MURI"}
            </span>
            <span className="text-brand-forest font-mono text-[11px]">
              ID Bukti Digital: #{productionId.slice(0, 8)}
            </span>
          </div>

          <p className="text-muted-moss text-[11px] leading-relaxed">
            {activeStep === 1
              ? "Bahan baku denim dan cotton deadstock diperoleh langsung dari sisa potongan pabrik PT Tekstil Jaya Limbah yang sudah melalui verifikasi berat dan kualitas fisik oleh tim MURI."
              : activeStep === 2
                ? "Brand Memuai Sustainable mengolah potongan sisa bahan menggunakan algoritma pola patchwork AI untuk memastikan minimal 94% bahan kain dimanfaatkan tanpa terbuang ke TPA."
                : "Perhitungan penghematan 1.8 kg CO₂e dan 450 liter air diverifikasi menggunakan metodologi Life Cycle Assessment (LCA) terstandarisasi MURI."}
          </p>
        </div>
      </div>

      <Link
        href={buildTraceabilityHref(productionId)}
        className="group mt-6 inline-flex items-center gap-3 text-xs font-bold text-brand-emerald transition-colors hover:text-brand-forest"
      >
        Lihat sertifikat digital &amp; paspor sirkular lengkap
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </DetailCard>
  );
}
