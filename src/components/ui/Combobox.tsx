"use client";

import * as React from "react";
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

export type ComboboxOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export interface ComboboxProps {
  id?: string;
  name?: string;
  value: string;
  options: ComboboxOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  invalid?: boolean;
  clearable?: boolean;
  className?: string;
  popupClassName?: string;
}

function Combobox({
  id,
  name,
  value,
  options,
  onValueChange,
  placeholder = "Pilih opsi",
  searchPlaceholder = "Cari...",
  emptyText = "Tidak ditemukan",
  disabled = false,
  invalid = false,
  clearable = false,
  className,
  popupClassName,
}: ComboboxProps) {
  const selectedOption = React.useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  return (
    <ComboboxPrimitive.Root
      name={name}
      items={options}
      value={selectedOption}
      disabled={disabled}
      itemToStringLabel={(option) => option.label}
      itemToStringValue={(option) => option.value}
      isItemEqualToValue={(option, selected) =>
        option.value === selected.value
      }
      onValueChange={(nextValue) => {
        onValueChange(nextValue?.value ?? "");
      }}
    >
      <ComboboxPrimitive.Trigger
        id={id}
        aria-invalid={invalid || undefined}
        className={cn(
          `
            group/combobox flex h-12 w-full items-center justify-between gap-3
            rounded-sm border border-brand-black/15 bg-transparent px-5
            text-left font-body text-xs text-brand-black shadow-none outline-none

            transition-[background-color,border-color,color,box-shadow]
            duration-200

            hover:border-brand-emerald/60

            focus-visible:border-brand-emerald
            focus-visible:ring-2
            focus-visible:ring-brand-emerald/10

            disabled:cursor-not-allowed
            disabled:bg-canvas-warm
            disabled:opacity-50

            aria-invalid:border-destructive
            aria-invalid:ring-2
            aria-invalid:ring-destructive/20
          `,
          className,
        )}
      >
        <ComboboxPrimitive.Value placeholder={placeholder}>
          {(currentValue: ComboboxOption | null) => (
            <span
              className={cn(
                "min-w-0 flex-1 truncate",
                !currentValue && "font-normal text-muted-moss/60",
              )}
            >
              {currentValue?.label ?? placeholder}
            </span>
          )}
        </ComboboxPrimitive.Value>

        <ComboboxPrimitive.Icon className="shrink-0 text-muted-moss transition-transform duration-200 group-data-[popup-open]/combobox:rotate-180">
          <ChevronsUpDown className="size-4" />
        </ComboboxPrimitive.Icon>
      </ComboboxPrimitive.Trigger>

      <ComboboxPrimitive.Portal>
        <ComboboxPrimitive.Positioner
          align="start"
          sideOffset={4}
          className="z-[70]"
        >
          <ComboboxPrimitive.Popup
            aria-label={placeholder}
            className={cn(
              `
                w-[var(--anchor-width)] min-w-56 overflow-hidden
                rounded-sm border border-brand-black/15 bg-canvas-pure
                text-brand-black shadow-md outline-none

                data-open:animate-in
                data-open:fade-in-0
                data-open:zoom-in-95

                data-closed:animate-out
                data-closed:fade-out-0
                data-closed:zoom-out-95
              `,
              popupClassName,
            )}
          >
            <div className="border-b border-line-trace p-2">
              <div className="relative flex items-center">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 size-4 text-muted-moss/70"
                />

                <ComboboxPrimitive.Input
                  placeholder={searchPlaceholder}
                  className="h-10 w-full rounded-sm border border-brand-black/15 bg-transparent pl-9 pr-9 font-body text-xs text-brand-black outline-none placeholder:text-muted-moss/60 focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10"
                />

                {clearable ? (
                  <ComboboxPrimitive.Clear
                    aria-label="Hapus pilihan"
                    className="absolute right-2 flex size-7 items-center justify-center rounded-sm text-muted-moss transition-colors hover:bg-canvas-warm hover:text-brand-black"
                  >
                    <X className="size-3.5" />
                  </ComboboxPrimitive.Clear>
                ) : null}
              </div>
            </div>

            <ComboboxPrimitive.Empty className="px-3 py-6 text-center text-xs text-muted-moss">
              {emptyText}
            </ComboboxPrimitive.Empty>

            <ComboboxPrimitive.List className="max-h-56 overflow-y-auto p-1">
              {(option: ComboboxOption) => (
                <ComboboxPrimitive.Item
                  key={option.value}
                  value={option}
                  disabled={option.disabled}
                  className="group/item relative flex cursor-default items-center gap-2 rounded-sm px-3 py-2.5 text-xs outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:bg-canvas-warm data-[selected]:font-semibold data-[selected]:text-brand-forest"
                >
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>

                  <ComboboxPrimitive.ItemIndicator className="shrink-0 text-brand-emerald">
                    <Check className="size-4" />
                  </ComboboxPrimitive.ItemIndicator>
                </ComboboxPrimitive.Item>
              )}
            </ComboboxPrimitive.List>
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
    </ComboboxPrimitive.Root>
  );
}

export { Combobox };
