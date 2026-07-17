"use client";

import * as React from "react";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface RegionSelectProps {
  label: string;
  placeholder: string;
  /** Currently selected value */
  value: string;
  /** Flat list of option strings to display */
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
  searchPlaceholder?: string;
}

/**
 * Searchable dropdown used for Region (Province / Regency) selection.
 * Closes when the user clicks outside via a ref + document event listener.
 */
export function RegionSelect({
  label,
  placeholder,
  value,
  options,
  onChange,
  disabled = false,
  searchPlaceholder = "Cari...",
}: RegionSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options.filter((option) =>
    option.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div className="space-y-2 animate-fade-in" ref={containerRef}>
      <label className="text-xs font-bold text-brand-black">{label}</label>

      <div className="relative">
        {/* Trigger button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between rounded-sm border border-line-trace bg-transparent font-body text-brand-black shadow-none h-12 px-5 text-xs text-left outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 disabled:bg-canvas-warm disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className={value ? "text-brand-black" : "text-muted-moss/60 font-normal"}>
            {value || placeholder}
          </span>
          <ChevronDown className="size-4 text-muted-moss" />
        </button>

        {/* Dropdown panel */}
        {isOpen && (
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-sm border border-line-trace bg-canvas-pure p-1 shadow-md">
            {/* Search input */}
            <div className="p-1 border-b border-line-trace mb-1">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-sm border border-line-trace bg-transparent outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald text-brand-black"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Options list */}
            <div className="max-h-40 overflow-y-auto">
              {filtered.length > 0 ? (
                filtered.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className="flex w-full cursor-default items-center rounded-sm py-2 px-3 text-xs hover:bg-canvas-warm/50 text-left text-brand-black"
                  >
                    {option}
                  </button>
                ))
              ) : (
                <div className="py-2 px-3 text-xs text-muted-moss text-center">
                  Tidak ditemukan
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
