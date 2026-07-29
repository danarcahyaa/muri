"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/Calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover"

export interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onRangeChange: (start: string, end: string) => void;
  className?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onRangeChange,
  className,
}: DateRangePickerProps) {
  const from = React.useMemo(() => (startDate ? new Date(startDate) : undefined), [startDate])
  const to = React.useMemo(() => (endDate ? new Date(endDate) : undefined), [endDate])

  const date: DateRange | undefined = React.useMemo(() => {
    return { from, to }
  }, [from, to])

  const handleSelect = (range: DateRange | undefined) => {
    const startStr = range?.from ? format(range.from, "yyyy-MM-dd") : ""
    const endStr = range?.to ? format(range.to, "yyyy-MM-dd") : ""
    onRangeChange(startStr, endStr)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <button
            id="date"
            className={cn(
              `
                flex items-center text-left justify-start box-border
                rounded-sm border border-line-trace
                bg-canvas-pure px-4 h-12 text-xs font-semibold
                transition-colors duration-200
                text-brand-black w-full sm:w-[260px]
                hover:cursor-pointer
                focus:border-brand-emerald
                focus:ring-2
                focus:ring-brand-emerald/10
                outline-none
              `
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-muted-moss shrink-0" />
            {date?.from ? (
              date.to ? (
                <span className="truncate">
                  {format(date.from, "dd LLL yyyy")} - {format(date.to, "dd LLL yyyy")}
                </span>
              ) : (
                <span>{format(date.from, "dd LLL yyyy")}</span>
              )
            ) : (
              <span className="text-muted-moss/60 font-normal">Pilih rentang tanggal</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2 bg-canvas-pure rounded-md" align="start">
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
