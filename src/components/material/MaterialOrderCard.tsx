"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Leaf, Minus, Plus, ShieldAlert } from "lucide-react";

import { useMaterialOrder } from "@/hooks/material/useMaterialOrder";
import { useAuth } from "@/components/auth/AuthProvider";

interface MaterialOrderCardProps {
  slug: string;
  pricePerKg: number;
  availableKg: number;
  minimumOrderKg: number;
  orderStepKg: number;
}

function formatIdr(value: number): string {
  return `IDR ${new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(value)}`;
}

export default function MaterialOrderCard({
  slug,
  pricePerKg,
  availableKg,
  minimumOrderKg,
  orderStepKg,
}: MaterialOrderCardProps) {
  const { accountType } = useAuth();
  const isNonBrand = accountType !== "brand";

  const {
    quantity,
    normalizedQuantity,
    total,
    canOrder,
    canDecrease,
    canIncrease,
    handleQuantityInput,
    updateQuantity,
    commitQuantity,
  } = useMaterialOrder({
    slug,
    pricePerKg,
    availableKg,
    minimumOrderKg,
    orderStepKg,
  });

  if (isNonBrand) {
    return (
      <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-7 text-center font-body">
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-tight">
          <ShieldAlert className="size-4 text-amber-600" />
          <span>Sourcing Material Sirkular</span>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-amber-900/80">
          Katalog material sisa kain ini disediakan khusus untuk produsen &amp; Brand Fashion sirkular. Akun {accountType === "waste_provider" ? "Waste Provider" : "Konsumen"} Anda tidak dapat membeli material mentah.
        </p>
        <Link
          href="/brand/register"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-brand-forest px-5 py-3.5 text-xs font-bold text-white transition hover:bg-brand-black"
        >
          Daftar / Masuk Akun Brand
        </Link>
      </aside>
    );
  }

  return (
    <aside className="rounded-2xl border border-brand-black/15 bg-canvas-pure p-6 sm:p-7">
      <div className="flex items-center gap-3 text-brand-emerald">
        <Leaf className="size-4" strokeWidth={2} />
        <h2 className="text-xs font-bold uppercase tracking-tight">
          Ringkasan Pesanan
        </h2>
      </div>

      <div className="mt-7 rounded-xl bg-canvas-warm p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] text-muted-moss">Volume</p>
            <p className="mt-1 text-xs font-bold text-brand-black">
              {normalizedQuantity} kg
            </p>
          </div>

          <div className="flex items-center rounded-lg border border-brand-black/15 bg-canvas-pure p-1">
            <button
              type="button"
              aria-label="Kurangi volume"
              onClick={() => updateQuantity(quantity - orderStepKg)}
              disabled={!canDecrease}
              className="flex size-9 items-center justify-center rounded-md text-brand-forest transition hover:bg-canvas-warm disabled:cursor-not-allowed disabled:opacity-35"
            >
              <Minus className="size-4" />
            </button>

            <input
              type="number"
              min={minimumOrderKg}
              max={availableKg}
              step={orderStepKg}
              value={quantity}
              disabled={!canOrder}
              onChange={(event) => handleQuantityInput(event.target.value)}
              onBlur={commitQuantity}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.currentTarget.blur();
                }
              }}
              aria-label="Volume material dalam kilogram"
              className="h-9 w-16 border-x border-line-trace bg-transparent text-center text-xs font-bold text-brand-black outline-none disabled:cursor-not-allowed disabled:opacity-50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />

            <button
              type="button"
              aria-label="Tambah volume"
              onClick={() => updateQuantity(quantity + orderStepKg)}
              disabled={!canIncrease}
              className="flex size-9 items-center justify-center rounded-md text-brand-forest transition hover:bg-canvas-warm disabled:cursor-not-allowed disabled:opacity-35"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-brand-lime p-6 text-brand-forest">
        <p className="text-[10px] uppercase tracking-wide opacity-65">
          Total Harga Penawaran
        </p>

        <p className="mt-8 font-display text-[clamp(2.5rem,4vw,4rem)] font-medium leading-none tracking-[-0.055em]">
          {formatIdr(total)}
        </p>

        <p className="mt-4 text-[10px] opacity-65">
          Belum termasuk pengiriman dan biaya layanan.
        </p>
      </div>

      {canOrder ? (
        <Link
          href={`/material/${encodeURIComponent(slug)}/checkout?quantity=${normalizedQuantity}`}
          className="group mt-6 flex w-full items-center justify-center gap-3 rounded-sm bg-brand-forest px-6 py-4 text-xs font-bold text-canvas-pure transition duration-300 hover:bg-brand-black"
        >
          Beli &amp; Ajukan Pembelian Material
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="mt-6 flex w-full cursor-not-allowed items-center justify-center rounded-sm bg-muted-moss/25 px-6 py-4 text-xs font-bold text-muted-moss"
        >
          Stok Tidak Memenuhi Minimum
        </button>
      )}

      <p className="mt-4 text-center text-[10px] leading-relaxed text-muted-moss">
        Minimum pemesanan {minimumOrderKg} kg dengan kelipatan {orderStepKg} kg.
      </p>
    </aside>
  );
}
