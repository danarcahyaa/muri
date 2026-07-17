"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/Button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-canvas-pure text-brand-black", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-xs font-semibold text-brand-black",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-moss/60 rounded-md w-8 font-normal text-[10px] uppercase",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-xs focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-canvas-warm/50 [&:has([aria-selected].day-outside)]:bg-canvas-warm/30 [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:bg-canvas-warm/50 [&:has(>.day-range-start)]:bg-canvas-warm/50 [&:has(>.day-range-start)]:rounded-l-md [&:has(>.day-range-end)]:rounded-r-md"
            : ""
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_start: "day-range-start !bg-brand-emerald !text-canvas-pure hover:!bg-brand-emerald hover:!text-canvas-pure focus:!bg-brand-emerald focus:!text-canvas-pure font-semibold",
        day_range_end: "day-range-end !bg-brand-emerald !text-canvas-pure hover:!bg-brand-emerald hover:!text-canvas-pure focus:!bg-brand-emerald focus:!text-canvas-pure font-semibold",
        day_selected: "!bg-brand-emerald !text-canvas-pure hover:!bg-brand-emerald hover:!text-canvas-pure focus:!bg-brand-emerald focus:!text-canvas-pure",
        day_today: "bg-canvas-warm text-brand-white",
        day_outside: "day-outside text-muted-moss/40 aria-selected:bg-canvas-warm/30 aria-selected:text-muted-moss/40",
        day_disabled: "text-muted-moss/30 opacity-50",
        day_range_middle: "aria-selected:!bg-brand-emerald/20 aria-selected:!text-brand-black",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
