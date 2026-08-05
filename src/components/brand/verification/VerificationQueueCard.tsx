"use client";

import {
  CalendarDays,
  FileImage,
  MapPin,
  Package,
  Phone,
  type LucideIcon,
} from "lucide-react";
import { formatIdr } from "@/lib/productDetail";
import type { BrandQrisVerificationQueueItem } from "@/types/brandPaymentVerification";

interface VerificationQueueCardProps {
  order: BrandQrisVerificationQueueItem;
  onOpen: () => void;
}

export function VerificationQueueCard({
  order,
  onOpen,
}: VerificationQueueCardProps) {
  const mainItems = order.items.filter((item) => !item.isBonus);
  const bonusItems = order.items.filter((item) => item.isBonus);

  return (
    <article className="overflow-hidden rounded-2xl border border-brand-black/15 bg-canvas-pure">
      <header className="border-b border-line-trace px-6 py-6 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-display text-xl font-medium text-brand-black">
                {formatOrderCode(order.orderId)}
              </p>
              <span className="rounded-full bg-blue-100 px-3 py-2 text-[9px] font-bold uppercase text-blue-800">
                Menunggu Verifikasi
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-moss">
              <CalendarDays className="size-4" />
              <span>Dikirim {formatDateTime(order.submittedAt ?? "")}</span>
            </div>
          </div>

          <div className="sm:text-right">
            <p className="text-[9px] font-bold uppercase text-muted-moss">
              Nominal QRIS
            </p>
            <p className="mt-2 font-display text-2xl font-medium text-brand-black">
              {formatIdr(order.amountIdr)}
            </p>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_330px]">
        <div className="border-b border-line-trace p-6 sm:p-8 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3">
            <Package className="size-4 text-brand-emerald" />
            <h2 className="text-xs font-bold uppercase text-brand-black">
              Produk Pesanan
            </h2>
          </div>

          <div className="mt-5 divide-y divide-line-trace">
            {mainItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-5 py-4 first:pt-0"
              >
                <div>
                  <p className="text-sm font-medium text-brand-black">
                    {item.productName}
                  </p>
                  <p className="mt-1 text-xs text-muted-moss">
                    {item.quantity} produk
                  </p>
                </div>
                <p className="text-xs font-bold text-brand-black">
                  {formatIdr(item.priceIdr * item.quantity)}
                </p>
              </div>
            ))}

            {bonusItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-5 py-4"
              >
                <div>
                  <p className="text-sm font-medium text-brand-black">
                    {item.productName}
                  </p>
                  <p className="mt-1 text-xs text-muted-moss">
                    {item.quantity} produk bonus
                  </p>
                </div>
                <span className="rounded-full bg-brand-lime/50 px-3 py-1.5 text-[9px] font-bold uppercase text-brand-forest">
                  Bonus
                </span>
              </div>
            ))}
          </div>
        </div>

        <aside className="p-6 sm:p-8">
          <VerificationFact
            icon={Package}
            label="Penerima"
            value={order.receiverName}
          />
          <VerificationFact
            icon={Phone}
            label="Nomor Telepon"
            value={order.phoneNumber || "Belum tersedia"}
          />
          <VerificationFact
            icon={MapPin}
            label="Alamat"
            value={order.shippingAddress}
          />

          <button
            type="button"
            disabled={!order.proofPath}
            onClick={onOpen}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-md bg-brand-forest px-5 py-3.5 text-xs font-bold text-white transition hover:bg-brand-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileImage className="size-4" />
            Periksa Bukti
          </button>
        </aside>
      </div>
    </article>
  );
}

function VerificationFact({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3 last:mb-0">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-canvas-warm text-muted-moss">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-bold uppercase text-muted-moss">{label}</p>
        <p className="mt-1 text-xs font-medium text-brand-black">{value}</p>
      </div>
    </div>
  );
}

export function formatOrderCode(orderId: string): string {
  return `ORD-${orderId.replaceAll("-", "").slice(0, 8).toUpperCase()}`;
}

export function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tidak tersedia";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
