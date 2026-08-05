"use client";

import * as React from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Calendar } from "@/components/ui/Calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";

interface DatePickerInputProps {
  /** Selected date value (Date object or undefined) */
  value: Date | undefined;
  /** Called when the user picks a date */
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  /** Disable dates before this date */
  fromDate?: Date;
  className?: string;
}

/**
 * A shadcn-style date picker input that combines a popover trigger button
 * with the Calendar component. Uses Indonesian locale for display formatting.
 */
export function DatePickerInput({
  value,
  onChange,
  placeholder = "Pilih tanggal",
  fromDate,
  className,
}: DatePickerInputProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal text-xs h-12 border-brand-black/20 bg-transparent hover:bg-canvas-warm/30 rounded-sm",
            !value && "text-muted-moss/60",
            className
          )}
        >
          <CalendarIcon className="mr-2 size-3.5 text-muted-moss shrink-0" />
          {value
            ? format(value, "dd MMMM yyyy", { locale: localeId })
            : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          fromDate={fromDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
