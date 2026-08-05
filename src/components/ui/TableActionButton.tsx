import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export interface TableActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "destructive" | "ghost" | "primary";
  size?: "icon" | "sm" | "xs";
  "aria-label"?: string;
}

export const TableActionButton = forwardRef<
  HTMLButtonElement,
  TableActionButtonProps
>(function TableActionButton(
  {
    variant = "default",
    size = "icon",
    className,
    children,
    disabled,
    type = "button",
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-emerald/20 disabled:cursor-not-allowed disabled:opacity-40",

        size === "icon" && "size-8 rounded-md text-xs",
        size === "xs" && "h-7 px-2.5 rounded-md text-[11px]",
        size === "sm" && "h-8 px-3 rounded-md text-xs",

        variant === "default" && [
          "border border-brand-black/20 bg-canvas-pure text-brand-black shadow-none",
          "hover:bg-canvas-warm hover:border-brand-black/30",
        ],
        variant === "outline" && [
          "border border-brand-black/20 bg-transparent text-brand-black shadow-none",
          "hover:bg-canvas-warm hover:border-brand-black/30",
        ],
        variant === "primary" && [
          "bg-brand-forest text-white border border-brand-forest shadow-none",
          "hover:bg-brand-black",
        ],
        variant === "destructive" && [
          "border border-error-rust/30 bg-canvas-pure text-error-rust shadow-none",
          "hover:border-error-rust hover:bg-error-rust/10",
        ],
        variant === "ghost" && [
          "bg-transparent text-muted-moss hover:bg-canvas-warm hover:text-brand-black",
        ],

        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});
