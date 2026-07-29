"use client";

import { type ReactElement } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Search, ChevronDown, Check, Plus } from "lucide-react";
import type { WorkshopPublishStatusFilter } from "@/types/brandWorkshop";
import { WORKSHOP_STATUS_OPTIONS } from "@/constants/constants";

interface WorkshopToolbarProps {
  localSearch: string;
  setLocalSearch: (q: string) => void;
  statusFilter: WorkshopPublishStatusFilter;
  setStatusFilter: (status: WorkshopPublishStatusFilter) => void;
  onSearchExecute: () => void;
  onCreateClick: () => void;
}

export function WorkshopToolbar({
  localSearch,
  setLocalSearch,
  statusFilter,
  setStatusFilter,
  onSearchExecute,
  onCreateClick,
}: WorkshopToolbarProps): ReactElement {
  const currentStatusLabel =
    WORKSHOP_STATUS_OPTIONS.find((opt) => opt.value === statusFilter)?.label ?? "Semua Status";

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearchExecute();
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full font-body">
      {/* Left: filters + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center min-w-0 flex-1">
        {/* Dropdown: Status Filter */}
        <div className="shrink-0 w-full sm:w-48">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="flex w-full items-center justify-between gap-1.5 rounded-sm border border-line-trace bg-canvas-pure py-2 pr-4 pl-4 text-xs h-12 transition-colors outline-none select-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 text-brand-black cursor-pointer">
                  <div className="flex-1 text-left min-w-0 pr-1 truncate">
                    {currentStatusLabel}
                  </div>
                  <ChevronDown className="size-3.5 text-muted-moss shrink-0" />
                </button>
              }
            />
            <DropdownMenuContent align="start" className="w-48 bg-canvas-pure border-line-trace font-body shadow-sm">
              {WORKSHOP_STATUS_OPTIONS.map((option) => {
                const isSelected = statusFilter === option.value;
                return (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setStatusFilter(option.value)}
                    className="flex items-center justify-between cursor-pointer py-2 px-3 text-xs hover:bg-canvas-warm/50 rounded-xs"
                  >
                    <span className={isSelected ? "font-semibold text-brand-forest" : "text-brand-black"}>
                      {option.label}
                    </span>
                    {isSelected && <Check className="size-3.5 text-brand-forest" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Search Input and Button */}
        <div className="flex items-center gap-1.5 w-full">
          <Input
            type="text"
            placeholder="Cari judul workshop atau pembicara..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-canvas-pure"
            size="default"
          />
          <Button
            variant="solid-white"
            size="icon"
            onClick={onSearchExecute}
            title="Cari workshop"
            aria-label="Cari workshop"
          >
            <Search className="size-4 text-muted-moss" />
          </Button>
        </div>
      </div>

      {/* Right: create button */}
      <Button
        variant={"solid-black"}
        onClick={onCreateClick}
      >
        <Plus className="size-3.5" />
        Buat
      </Button>
    </div>
  );
}
