"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Leaf, Minus, Plus } from "lucide-react";

interface MaterialOrderCardProps {
  slug: string;
  pricePerKg: number;
  availableKg: number;
  minimumOrderKg: number;
  orderStepKg: number;
}

function formatIdr(value: number) {
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
  const [quantity, setQuantity] = React.useState(minimumOrderKg);

  const clampQuantity = React.useCallback(
    (value: number) => {
      if (!Number.isFinite(value)) return minimumOrderKg;

      const clamped = Math.min(
        availableKg,
        Math.max(minimumOrderKg, value),
      );

      const steps = Math.round(
        (clamped - minimumOrderKg) / orderStepKg,
      );

      return Math.min(
        availableKg,
        minimumOrderKg + steps * orderStepKg,
      );
    },
    [availableKg, minimumOrderKg, orderStepKg],
  );

  const updateQuantity = (value: number) => {
    setQuantity(clampQuantity(value));
  };

  const total = quantity * pricePerKg;
  const redirectTarget = `/material/${slug}?quantity=${quantity}`;

  return (
    <aside
      className="
        rounded-2xl border border-line-trace
        bg-canvas-pure p-6
        lg:sticky lg:top-24
        sm:p-7
      "
    >
      <div className="flex items-center gap-3 text-brand-emerald">
        <Leaf className="size-4" strokeWidth={2} />

        <h2 className="text-xs font-bold uppercase tracking-tight">
          Ringkasan Pesanan
        </h2>
      </div>

      <div className="mt-7 space-y-3">
        <div className="rounded-xl bg-canvas-warm p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] text-muted-moss">Volume</p>
              <p className="mt-1 text-xs font-bold text-brand-black">
                {quantity} kg
              </p>
            </div>

            <div className="flex items-center rounded-lg border border-line-trace bg-canvas-pure p-1">
              <button
                type="button"
                aria-label="Kurangi volume"
                onClick={() => updateQuantity(quantity - orderStepKg)}
                disabled={quantity <= minimumOrderKg}
                className="
                  flex size-9 items-center justify-center rounded-md
                  text-brand-forest transition
                  hover:bg-canvas-warm
                  disabled:cursor-not-allowed disabled:opacity-35
                "
              >
                <Minus className="size-4" />
              </button>

              <input
                type="number"
                min={minimumOrderKg}
                max={availableKg}
                step={orderStepKg}
                value={quantity}
                onChange={(event) => {
                  const nextValue = Number(event.target.value);

                  if (Number.isFinite(nextValue)) {
                    setQuantity(nextValue);
                  }
                }}
                onBlur={() => updateQuantity(quantity)}
                aria-label="Volume material dalam kilogram"
                className="
                  h-9 w-16 border-x border-line-trace
                  bg-transparent text-center text-xs font-bold
                  text-brand-black outline-none
                  [appearance:textfield]
                  [&::-webkit-inner-spin-button]:appearance-none
                  [&::-webkit-outer-spin-button]:appearance-none
                "
              />

              <button
                type="button"
                aria-label="Tambah volume"
                onClick={() => updateQuantity(quantity + orderStepKg)}
                disabled={quantity >= availableKg}
                className="
                  flex size-9 items-center justify-center rounded-md
                  text-brand-forest transition
                  hover:bg-canvas-warm
                  disabled:cursor-not-allowed disabled:opacity-35
                "
              >
                <Plus className="size-4" />
              </button>
            </div>
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

      <Link
        href={`/auth/login?redirect=${encodeURIComponent(redirectTarget)}`}
        className="
          group mt-6 flex w-full items-center
          justify-center gap-3 rounded-sm
          bg-brand-forest px-6 py-4
          text-xs font-bold text-canvas-pure
          transition duration-300
          hover:bg-brand-black
        "
      >
        Detail &amp; Ajukan Penawaran
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </Link>

      <p className="mt-4 text-center text-[10px] leading-relaxed text-muted-moss">
        Minimum pemesanan {minimumOrderKg} kg dengan kelipatan {orderStepKg} kg.
      </p>
    </aside>
  );
}

interface SummaryRowProps {
  label: string;
  value: string;
}

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="rounded-xl bg-canvas-warm p-4">
      <p className="text-[10px] text-muted-moss">{label}</p>
      <p className="mt-1 text-xs font-bold text-brand-black">{value}</p>
    </div>
  );
}