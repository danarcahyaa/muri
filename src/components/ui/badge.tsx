import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase transition-colors font-body",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-brand-emerald text-white shadow-xs hover:bg-brand-emerald/90",
        secondary:
          "bg-canvas-warm text-brand-black border-line-trace/60 hover:bg-canvas-warm/80",
        destructive:
          "border-error-rust/10 bg-error-rust/15 text-error-rust hover:bg-error-rust/20",
        outline: "text-brand-black border-line-trace bg-transparent",
        success:
          "bg-[#D2E7D6] text-brand-forest border-[#D2E7D6]",
        warning:
          "bg-[#FFE8CC] text-[#B05B00] border-[#FFE8CC]",
        neutral:
          "bg-canvas-warm text-muted-moss border-line-trace/60",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
