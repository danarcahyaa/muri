import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "warning" | "success" | "danger" | "neutral" | "info";

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant: BadgeVariant;
  children: React.ReactNode;
}

export function StatusBadge({ variant, children, className, ...props }: StatusBadgeProps) {
  const variantStyles = {
    warning: "bg-[#FFE8CC] text-[#B05B00] border-[#FFE8CC]",
    success: "bg-[#D2E7D6] text-brand-forest border-[#D2E7D6]",
    danger: "bg-error-rust/15 text-error-rust border-error-rust/10",
    neutral: "bg-canvas-warm text-muted-moss border-line-trace/60",
    info: "bg-brand-forest/15 text-brand-forest border-brand-forest/20",
  };

  return (
    <span
      className={cn(
        "inline-block rounded border px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
