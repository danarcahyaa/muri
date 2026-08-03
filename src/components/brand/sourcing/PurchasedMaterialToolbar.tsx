"use client";

import type { ReactElement } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";

interface PurchasedMaterialToolbarProps {
  searchInput: string;
  onSearchChange: (val: string) => void;
}

export function PurchasedMaterialToolbar({
  searchInput,
  onSearchChange,
}: PurchasedMaterialToolbarProps): ReactElement {
  return (
    <div className="mt-6 space-y-4">
      {/* Search Input (Debounced, Specific to Waste Name) */}
      <div className="w-full sm:w-80">
        <Input
          type="text"
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari nama limbah / material..."
          className="rounded-sm text-xs"
          endIcon={<Search className="size-4 text-muted-moss/60" strokeWidth={1.7} />}
        />
      </div>
    </div>
  );
}
