"use client";

import { useState, type ReactElement } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import {
  Minus,
  Plus,
  ShoppingCart,
  Bookmark,
  ShieldCheck,
  Truck,
  AlertTriangle,
  Scale,
} from "lucide-react";
import { formatCurrencyIDR, formatWeightKg } from "@/lib/formatter";
import type { SourcingWastePostDetailItem } from "@/types/sourcing";
import { WasteCheckoutModal } from "./WasteCheckoutModal";

interface WasteCheckoutCardProps {
  material: SourcingWastePostDetailItem;
  isSaved?: boolean;
  onToggleSave?: (materialId: string) => void;
}

export function WasteCheckoutCard({
  material,
  isSaved = false,
  onToggleSave,
}: WasteCheckoutCardProps): ReactElement {
  const [quantity, setQuantity] = useState<number>(
    Math.max(1, material.minimumOrderKg)
  );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const minOrder = material.minimumOrderKg;
  const maxStock = material.weightKg;

  const isBelowMin = quantity < minOrder;
  const isAboveMax = quantity > maxStock;
  const isInvalidQuantity = isBelowMin || isAboveMax || isNaN(quantity) || quantity <= 0;

  const subtotal = (isNaN(quantity) || quantity < 0 ? 0 : quantity) * material.pricePerKg;

  const handleDecrease = (): void => {
    setQuantity((prev) => Math.max(minOrder, prev - 5));
  };

  const handleIncrease = (): void => {
    setQuantity((prev) => Math.min(maxStock, prev + 5));
  };

  const handleQuantityChange = (val: number): void => {
    setQuantity(val);
  };

  return (
    <>
      <div className="lg:sticky lg:top-20 rounded-2xl bg-canvas-pure p-6 border border-brand-black/15 shadow-none space-y-6 z-20">
        {/* Price & Unit Display */}
        <div className="space-y-1 pb-4 border-b border-line-trace/40">
          <span className="text-xs font-semibold uppercase text-muted-moss tracking-wider">
            Harga Material
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display font-bold text-2xl sm:text-3xl text-brand-forest">
              {formatCurrencyIDR(material.pricePerKg)}
            </span>
            <span className="text-sm font-medium text-muted-moss">/ Kg</span>
          </div>
        </div>

        {/* Stock & Minimum Order Info */}
        <div className="flex justify-between items-center text-xs text-brand-black/80 bg-canvas-warm/60 p-3 rounded-md border border-brand-black/10">
          <div>
            <span className="text-muted-moss block text-[11px]">Total Stok:</span>
            <span className="font-bold text-brand-black">{formatWeightKg(maxStock)}</span>
          </div>
          <div className="text-right">
            <span className="text-muted-moss block text-[11px]">Minimum Order:</span>
            <span className="font-bold text-brand-black">{formatWeightKg(minOrder)}</span>
          </div>
        </div>

        {/* Quantity Input Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-brand-black flex items-center justify-between">
            <span>Jumlah Pembelian (Kg)</span>
            <span className="text-[11px] font-normal text-muted-moss">
              Stok max: {maxStock} Kg
            </span>
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDecrease}
              disabled={quantity <= minOrder}
              className="size-10 rounded-sm border border-brand-black/15 bg-canvas-pure hover:bg-canvas-warm flex items-center justify-center text-brand-black disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Kurangi 5 Kg"
            >
              <Minus className="size-4" />
            </button>

            <div className="relative flex-1">
              <Input
                type="number"
                min={minOrder}
                max={maxStock}
                value={isNaN(quantity) ? "" : quantity}
                onChange={(e) => handleQuantityChange(Number(e.target.value))}
                className="text-center font-bold text-brand-black h-10 border-brand-black/20 focus:border-brand-forest focus:ring-1 focus:ring-brand-forest rounded-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-moss pointer-events-none">
                Kg
              </span>
            </div>

            <button
              type="button"
              onClick={handleIncrease}
              disabled={quantity >= maxStock}
              className="size-10 rounded-sm border border-brand-black/15 bg-canvas-pure hover:bg-canvas-warm flex items-center justify-center text-brand-black disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Tambah 5 Kg"
            >
              <Plus className="size-4" />
            </button>
          </div>

          {/* Validation Warnings */}
          {isBelowMin && (
            <Alert variant="destructive" className="py-2 px-3 text-xs flex items-center gap-2 rounded-sm mt-2">
              <AlertTriangle className="size-4 shrink-0" />
              <AlertDescription>
                Kuantitas kurang dari minimum order ({minOrder} Kg).
              </AlertDescription>
            </Alert>
          )}

          {isAboveMax && (
            <Alert variant="destructive" className="py-2 px-3 text-xs flex items-center gap-2 rounded-sm mt-2">
              <AlertTriangle className="size-4 shrink-0" />
              <AlertDescription>
                Kuantitas melebihi stok yang tersedia ({maxStock} Kg).
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Real-time Subtotal Calculation */}
        <div className="pt-3 border-t border-line-trace/50 space-y-1">
          <div className="flex justify-between items-center text-xs text-muted-moss">
            <span>Subtotal Material:</span>
            <span>{quantity > 0 ? `${quantity} Kg x ${formatCurrencyIDR(material.pricePerKg)}` : "-"}</span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="font-display font-bold text-sm text-brand-black">
              Total Estimasi:
            </span>
            <span className="font-display font-bold text-xl text-brand-forest">
              {formatCurrencyIDR(subtotal)}
            </span>
          </div>
        </div>

        {/* CTA Action Buttons */}
        <div className="space-y-2 pt-2">
          <Button
            type="button"
            fullWidth
            disabled={isInvalidQuantity}
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-black text-canvas-pure hover:bg-brand-forest font-bold h-11 rounded-sm shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <ShoppingCart className="size-4" />
            <span>Pesan Sekarang</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={() => onToggleSave?.(material.id)}
            className="border border-brand-black/15 text-brand-black hover:bg-canvas-warm font-semibold h-10 rounded-sm flex items-center justify-center gap-2 shadow-none"
          >
            <Bookmark className={`size-4 ${isSaved ? "fill-brand-black" : ""}`} />
            <span>{isSaved ? "Tersimpan" : "Simpan Material"}</span>
          </Button>
        </div>

        {/* Trust & Guarantee Badges */}
        <div className="pt-3 border-t border-line-trace/40 space-y-2 text-[11px] text-muted-moss">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-brand-forest shrink-0" />
            <span>Transaksi aman dilindungi Rekber MURI</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="size-4 text-brand-forest shrink-0" />
            <span>Pengiriman langsung dari lokasi penyuplai</span>
          </div>
          <div className="flex items-center gap-2">
            <Scale className="size-4 text-brand-forest shrink-0" />
            <span>Berat & kualitas kain telah diverifikasi</span>
          </div>
        </div>
      </div>

      {/* Checkout Modal Confirmation */}
      <WasteCheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        material={material}
        quantityKg={quantity}
      />
    </>
  );
}
