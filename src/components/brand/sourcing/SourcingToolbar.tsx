"use client";

import { type ReactElement, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { Search, SlidersHorizontal, RotateCcw, Check } from "lucide-react";
import type { SourcingFilterInput } from "@/types/sourcing";
import { Badge } from "@/components/ui/Badge";
import { formatCurrencyIDR, formatThousand, parseThousand } from "@/lib/formatter";

interface SourcingToolbarProps {
  localSearch: string;
  setLocalSearch: (q: string) => void;
  filters: SourcingFilterInput;
  setFilters: React.Dispatch<React.SetStateAction<SourcingFilterInput>>;
  onSearchExecute: () => void;
}

const FABRIC_CATEGORY_OPTIONS = [
  "Katun",
  "Denim",
  "Poliester Daur Ulang",
  "Batik/Tenun",
  "Rayon",
  "Linen",
];

export function SourcingToolbar({
  localSearch,
  setLocalSearch,
  filters,
  setFilters,
  onSearchExecute,
}: SourcingToolbarProps): ReactElement {
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Local state for popover inputs before applying
  const [minPriceInput, setMinPriceInput] = useState<string>(
    filters.minPrice !== undefined ? formatThousand(filters.minPrice) : ""
  );
  const [maxPriceInput, setMaxPriceInput] = useState<string>(
    filters.maxPrice !== undefined ? formatThousand(filters.maxPrice) : ""
  );
  const [minOrderInput, setMinOrderInput] = useState<string>(
    filters.minOrderKg !== undefined ? String(filters.minOrderKg) : ""
  );
  const [selectedCats, setSelectedCats] = useState<string[]>(
    filters.categoryNames || []
  );

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinPriceInput(formatThousand(e.target.value));
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxPriceInput(formatThousand(e.target.value));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearchExecute();
    }
  };

  const handleCategoryToggle = (cat: string) => {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleApplyFilter = () => {
    const parsedMin = parseThousand(minPriceInput);
    const parsedMax = parseThousand(maxPriceInput);

    setFilters((prev) => ({
      ...prev,
      minPrice: minPriceInput ? parsedMin : undefined,
      maxPrice: maxPriceInput ? parsedMax : undefined,
      minOrderKg: minOrderInput ? Number(minOrderInput) : undefined,
      categoryNames: selectedCats,
    }));
    setPopoverOpen(false);
  };

  const handleResetFilter = () => {
    setMinPriceInput("");
    setMaxPriceInput("");
    setMinOrderInput("");
    setSelectedCats([]);
    setFilters((prev) => ({
      ...prev,
      minPrice: undefined,
      maxPrice: undefined,
      minOrderKg: undefined,
      categoryNames: [],
    }));
    setPopoverOpen(false);
  };

  // Count active filters
  const activeCount =
    (filters.minPrice !== undefined ? 1 : 0) +
    (filters.maxPrice !== undefined ? 1 : 0) +
    (filters.minOrderKg !== undefined ? 1 : 0) +
    (filters.categoryNames?.length || 0);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full font-body">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Filter Popover Button */}
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="default"
              className="h-12 bg-canvas-pure hover:bg-canvas-pure/80 hover:border-line-trace  border-line-trace text-brand-black flex items-center gap-2 shrink-0 px-4 text-xs font-semibold"
            >
              <SlidersHorizontal className="size-4 text-muted-moss" />
              <span>Filter</span>
              {activeCount > 0 && (
                <Badge variant="secondary" className="size-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                  {activeCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80 bg-canvas-pure border-line-trace p-4 space-y-4 shadow-md font-body">
            <div className="flex items-center justify-between border-b border-line-trace/60 pb-2">
              <h4 className="font-display text-sm font-bold text-brand-black">
                Filter Limbah Kain
              </h4>
              <button
                type="button"
                onClick={handleResetFilter}
                className="text-[11px] text-muted-moss hover:text-error-rust flex items-center gap-1 font-medium"
              >
                <RotateCcw className="size-3" />
                Reset
              </button>
            </div>

            {/* 1. Filter Harga */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-brand-black/80">
                Rentang Harga (IDR / kg)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-muted-moss">Lebih Dari (&gt;)</span>
                  <Input
                    type="text"
                    placeholder="Min Rp"
                    value={minPriceInput}
                    onChange={handleMinPriceChange}
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-muted-moss">Kurang Dari (&lt;)</span>
                  <Input
                    type="text"
                    placeholder="Maks Rp"
                    value={maxPriceInput}
                    onChange={handleMaxPriceChange}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* 2. Filter Minimal Beli */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-black/80">
                Batas Minimal Beli (Maks. kg)
              </label>
              <Input
                type="number"
                min={0}
                placeholder="Contoh: 10"
                value={minOrderInput}
                onChange={(e) => setMinOrderInput(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            {/* Filter Jenis Kain */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-brand-black/80">
                Jenis Kain
              </label>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {FABRIC_CATEGORY_OPTIONS.map((cat) => {
                  const isChecked = selectedCats.includes(cat);
                  return (
                    <label
                      key={cat}
                      className="flex items-center gap-2 text-xs text-brand-black cursor-pointer hover:text-brand-forest select-none"
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => handleCategoryToggle(cat)}
                      />
                      <span className="truncate">{cat}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Apply Button */}
            <div className="pt-2 border-t border-line-trace/60">
              <Button
                variant="solid-black"
                size={"sm"}
                className="w-full"
                onClick={handleApplyFilter}
              >
                Terapkan Filter
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Search Input & Button */}
        <div className="flex items-center gap-1.5 w-full min-w-0">
          <Input
            type="text"
            placeholder="Cari nama kain, jenis material, atau provider..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-canvas-pure flex-1"
            size="default"
          />
          <Button
            variant="solid-white"
            size="icon"
            onClick={onSearchExecute}
            title="Cari material"
            aria-label="Cari material"
            className="shrink-0"
          >
            <Search className="size-4 text-muted-moss" />
          </Button>
        </div>
      </div>
    </div>
  );
}
