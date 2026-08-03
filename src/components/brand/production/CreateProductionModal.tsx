"use client";

import { useState, type ReactElement } from "react";
import { AlertCircle, Layers, Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { formatWeightKg } from "@/lib/formatter";
import type { AvailableWasteMaterialItem } from "@/services/brand-fashion/circularProductionService";

interface SelectedAllocationState {
  wastePurchaseId: string;
  allocatedWeightKg: number;
}

interface CreateProductionModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  availableWasteList: AvailableWasteMaterialItem[];
  onClose: () => void;
  onSubmit: (data: {
    productionName: string;
    targetQuantity: number;
    allocations: { wastePurchaseId: string; allocatedWeightKg: number }[];
  }) => Promise<boolean>;
}

export function CreateProductionModal({
  isOpen,
  isSubmitting,
  availableWasteList,
  onClose,
  onSubmit,
}: CreateProductionModalProps): ReactElement | null {
  const [productionName, setProductionName] = useState<string>("");
  const [targetQuantity, setTargetQuantity] = useState<string>("10");

  const [allocations, setAllocations] = useState<SelectedAllocationState[]>([
    { wastePurchaseId: "", allocatedWeightKg: 1 },
  ]);

  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddAllocationRow = (): void => {
    // Find first material ID that has not been selected yet (Duplicate Protection)
    const selectedIds = new Set(
      allocations.map((a) => a.wastePurchaseId).filter(Boolean)
    );
    const nextAvailable = availableWasteList.find(
      (m) => !selectedIds.has(m.id)
    );

    if (!nextAvailable) return;

    setAllocations((prev) => [
      ...prev,
      {
        wastePurchaseId: nextAvailable.id,
        allocatedWeightKg: Math.min(1, nextAvailable.availableWeightKg),
      },
    ]);
  };

  const handleRemoveAllocationRow = (index: number): void => {
    if (allocations.length <= 1) return;
    setAllocations((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSelectMaterial = (index: number, selectedId: string): void => {
    const targetMat = availableWasteList.find((m) => m.id === selectedId);
    const maxStock = targetMat ? targetMat.availableWeightKg : 1;

    setAllocations((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              wastePurchaseId: selectedId,
              allocatedWeightKg: Math.min(item.allocatedWeightKg || 1, maxStock),
            }
          : item
      )
    );
  };

  const handleWeightChange = (index: number, weightVal: number): void => {
    setAllocations((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, allocatedWeightKg: weightVal } : item
      )
    );
  };

  const totalAllocatedWeight = allocations.reduce((sum, item) => {
    const val = Number(item.allocatedWeightKg);
    return sum + (isNaN(val) || val < 0 ? 0 : val);
  }, 0);

  const handleSubmitForm = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setFormError(null);

    const name = productionName.trim();
    if (!name) {
      setFormError("Nama produksi wajib diisi.");
      return;
    }

    const qty = parseInt(targetQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setFormError("Jumlah produksi harus berupa angka positif (> 0 pcs).");
      return;
    }

    // Filter valid allocations
    const validAllocations = allocations.filter(
      (a) => a.wastePurchaseId && a.allocatedWeightKg > 0
    );

    if (validAllocations.length === 0) {
      setFormError("Pilih setidaknya satu material limbah dengan berat > 0 Kg.");
      return;
    }

    // Validate stock per material
    for (const alloc of validAllocations) {
      const mat = availableWasteList.find((m) => m.id === alloc.wastePurchaseId);
      if (!mat) {
        setFormError("Material limbah terpilih tidak valid.");
        return;
      }
      if (alloc.allocatedWeightKg > mat.availableWeightKg) {
        setFormError(
          `Alokasi berat untuk ${mat.fabricName} (${alloc.allocatedWeightKg} Kg) melebihi stok yang tersedia (${mat.availableWeightKg} Kg).`
        );
        return;
      }
    }

    const success = await onSubmit({
      productionName: name,
      targetQuantity: qty,
      allocations: validAllocations,
    });

    if (success) {
      setProductionName("");
      setTargetQuantity("10");
      setAllocations([{ wastePurchaseId: "", allocatedWeightKg: 1 }]);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in-0 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-brand-black/15 bg-canvas-pure cursor-default"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-brand-black/15 bg-canvas-warm/40 px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-brand-lime text-brand-black font-bold">
              <Layers className="size-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-brand-black">
                Buat Produksi Produk Baru
              </h3>
              <p className="text-xs text-muted-moss">
                Alokasikan stok material limbah sirkular untuk membuat batch produksi baju.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            aria-label="Tutup modal"
            className="flex size-8 items-center justify-center rounded-full bg-canvas-warm text-brand-black transition hover:bg-brand-black/10 cursor-pointer disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmitForm} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 space-y-5 overflow-y-auto p-6 sm:p-8">
            {formError && (
              <div className="flex items-start gap-2.5 rounded-xl border border-error-rust/30 bg-error-rust/10 p-3.5 text-xs text-error-rust">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {/* Field 1: Nama Produksi */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-black mb-1.5">
                Nama Produksi <span className="text-error-rust">*</span>
              </label>
              <Input
                type="text"
                value={productionName}
                onChange={(e) => setProductionName(e.target.value)}
                placeholder="Contoh: Upcycled Denim Jacket - Batch 1"
                className="rounded-md text-xs"
                required
              />
            </div>

            {/* Field 2: Target Jumlah Produksi (pcs) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-black mb-1.5">
                Target Jumlah Produksi (Pcs / Unit) <span className="text-error-rust">*</span>
              </label>
              <Input
                type="number"
                min={1}
                value={targetQuantity}
                onChange={(e) => setTargetQuantity(e.target.value)}
                placeholder="10"
                className="rounded-md text-xs"
                required
              />
            </div>

            {/* Field 3: Multi-Select Material Limbah + Alokasi Berat */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-black">
                  Alokasi Material Limbah Terbeli <span className="text-error-rust">*</span>
                </label>
                <span className="text-[11px] text-muted-moss">
                  Tersedia: {availableWasteList.length} Material
                </span>
              </div>

              {availableWasteList.length === 0 ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
                  Belum ada material limbah terbeli dengan sisa stok {">"} 0 Kg. Silakan beli material limbah pada menu Sourcing terlebih dahulu.
                </div>
              ) : (
                <div className="space-y-3">
                  {allocations.map((alloc, idx) => {
                    const selectedMat = availableWasteList.find(
                      (m) => m.id === alloc.wastePurchaseId
                    );

                    // Duplicate Protection: Filter out materials already selected in other rows
                    const selectedOtherIds = new Set(
                      allocations
                        .filter((_, i) => i !== idx)
                        .map((a) => a.wastePurchaseId)
                        .filter(Boolean)
                    );

                    const isExceeding =
                      selectedMat && alloc.allocatedWeightKg > selectedMat.availableWeightKg;

                    const selectedLabel = selectedMat
                      ? `${selectedMat.fabricName} (${selectedMat.purchaseId}) - Stok: ${selectedMat.availableWeightKg} Kg`
                      : undefined;

                    return (
                      <div
                        key={idx}
                        className="flex flex-col gap-2 sm:flex-row sm:items-center rounded-xl border border-brand-black/15 bg-canvas-warm/40 p-3.5"
                      >
                        {/* UI Component Select Material Dropdown */}
                        <div className="flex-1">
                          <Select
                            value={alloc.wastePurchaseId}
                            onValueChange={(val) => val && handleSelectMaterial(idx, String(val))}
                          >
                            <SelectTrigger size="sm" className="w-full bg-canvas-pure">
                              <SelectValue placeholder="-- Pilih Material Limbah --">
                                {selectedLabel}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent side="bottom">
                              {availableWasteList.map((m) => {
                                const isSelectedInOther = selectedOtherIds.has(m.id);
                                return (
                                  <SelectItem
                                    key={m.id}
                                    value={m.id}
                                    disabled={isSelectedInOther}
                                  >
                                    {m.fabricName} ({m.purchaseId}) - Stok: {m.availableWeightKg} Kg
                                    {isSelectedInOther ? " (Sudah dipilih)" : ""}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Input Berat Alokasi (Kg) */}
                        <div className="w-full sm:w-32">
                          <div className="relative">
                            <input
                              type="number"
                              step="0.1"
                              min={0.1}
                              max={selectedMat ? selectedMat.availableWeightKg : 9999}
                              value={alloc.allocatedWeightKg}
                              onChange={(e) =>
                                handleWeightChange(idx, parseFloat(e.target.value) || 0)
                              }
                              className={`h-10 w-full rounded-md border px-3 pr-8 text-xs font-semibold text-brand-black focus:outline-none ${
                                isExceeding
                                  ? "border-error-rust bg-error-rust/5 text-error-rust"
                                  : "border-brand-black/15 bg-canvas-pure focus:border-brand-emerald"
                              }`}
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-muted-moss">
                              Kg
                            </span>
                          </div>
                        </div>

                        {/* Remove Row Button */}
                        {allocations.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveAllocationRow(idx)}
                            className="flex size-9 shrink-0 items-center justify-center rounded-md border border-error-rust/30 text-error-rust hover:bg-error-rust hover:text-white transition cursor-pointer self-end sm:self-auto"
                            title="Hapus Alokasi"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {/* Add Allocation Button */}
                  {allocations.length < availableWasteList.length && (
                    <button
                      type="button"
                      onClick={handleAddAllocationRow}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-forest hover:underline cursor-pointer"
                    >
                      <Plus className="size-4" />
                      <span>+ Tambah Material Limbah Lainnya</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Total Weight Summary */}
            <div className="rounded-xl border border-brand-black/15 bg-canvas-warm/60 p-4 flex items-center justify-between text-xs">
              <span className="font-medium text-muted-moss">Total Alokasi Berat Limbah:</span>
              <span className="font-display font-bold text-base text-brand-forest">
                {formatWeightKg(totalAllocatedWeight)}
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="shrink-0 flex items-center justify-end gap-3 border-t border-brand-black/15 bg-canvas-warm/40 px-6 py-4 sm:px-8">
            <Button
              variant="outline"
              size="md"
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
            >
              Batal
            </Button>
            <Button
              loading={isSubmitting}
              variant="default"
              size="md"
              type="submit"
              disabled={isSubmitting || availableWasteList.length === 0}
              className="bg-brand-forest text-white hover:bg-brand-forest/90"
            >
              {isSubmitting ? "Menyimpan Produksi..." : "Mulai Produksi"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
