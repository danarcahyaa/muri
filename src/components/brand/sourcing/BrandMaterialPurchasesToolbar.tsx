"use client";

import type { ReactElement } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";

export type PurchaseFilterTab = "all" | "pending" | "processing" | "shipped" | "completed";

interface BrandMaterialPurchasesToolbarProps {
  searchInput: string;
  onSearchChange: (val: string) => void;
  activeTab: PurchaseFilterTab;
  onTabChange: (status: PurchaseFilterTab) => void;
}

export function BrandMaterialPurchasesToolbar({
  searchInput,
  onSearchChange,
  activeTab,
  onTabChange,
}: BrandMaterialPurchasesToolbarProps): ReactElement {
  return (
    <div className="mt-6 space-y-4">
      {/* Search Input (Debounced, Specific to Waste Name) */}
      <div className="w-full sm:w-80">
        <Input
          type="text"
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari spesifik nama limbah kain..."
          className="rounded-sm text-xs"
          endIcon={<Search className="size-4 text-muted-moss/60" strokeWidth={1.7} />}
        />
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-line-trace/40">
        <FilterTabButton
          label="Semua Status"
          active={activeTab === "all"}
          onClick={() => onTabChange("all")}
        />
        <FilterTabButton
          label="Menunggu Konfirmasi"
          active={activeTab === "pending"}
          onClick={() => onTabChange("pending")}
        />
        <FilterTabButton
          label="Diproses"
          active={activeTab === "processing"}
          onClick={() => onTabChange("processing")}
        />
        <FilterTabButton
          label="Dikirim"
          active={activeTab === "shipped"}
          onClick={() => onTabChange("shipped")}
        />
        <FilterTabButton
          label="Selesai"
          active={activeTab === "completed"}
          onClick={() => onTabChange("completed")}
        />
      </div>
    </div>
  );
}

function FilterTabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-sm px-3.5 py-1.5 text-xs font-bold transition cursor-pointer
        ${
          active
            ? "bg-brand-forest text-canvas-pure"
            : "border border-brand-black/15 bg-canvas-pure text-brand-black hover:border-brand-forest hover:bg-canvas-warm"
        }
      `}
    >
      {label}
    </button>
  );
}
