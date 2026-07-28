"use client";

import * as React from "react";

import {
  Combobox,
  type ComboboxOption,
} from "@/components/ui/combobox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

export interface RegionSelectProps {
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  description?: string;
  error?: string;
  name?: string;
  className?: string;
}

export function RegionSelect({
  label,
  placeholder,
  value,
  options,
  onChange,
  disabled = false,
  searchPlaceholder = "Cari...",
  emptyText = "Tidak ditemukan",
  description,
  error,
  name,
  className,
}: RegionSelectProps) {
  const id = React.useId();
  const comboboxOptions = React.useMemo<ComboboxOption[]>(
    () => options.map((option) => ({ value: option, label: option })),
    [options],
  );

  return (
    <Field
      data-disabled={disabled || undefined}
      data-invalid={Boolean(error) || undefined}
      className={cn("animate-fade-in", className)}
    >
      <FieldLabel htmlFor={id}>{label}</FieldLabel>

      <Combobox
        id={id}
        name={name}
        value={value}
        options={comboboxOptions}
        onValueChange={onChange}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        emptyText={emptyText}
        disabled={disabled}
        invalid={Boolean(error)}
      />

      {description ? (
        <FieldDescription>{description}</FieldDescription>
      ) : null}

      <FieldError>{error}</FieldError>
    </Field>
  );
}
