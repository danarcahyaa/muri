import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface TableActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive";
  "aria-label": string;
}

export const TableActionButton = forwardRef<
  HTMLButtonElement,
  TableActionButtonProps
>(function TableActionButton(
  {
    variant = "default",
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
        "inline-flex size-8 cursor-pointer items-center justify-center rounded-sm border transition-colors",

        variant === "default" && [
          "border-line-trace bg-canvas-pure text-muted-moss",
          "hover:bg-canvas-warm hover:text-brand-black",
          "disabled:cursor-not-allowed disabled:opacity-40",
          "disabled:hover:bg-canvas-pure disabled:hover:text-muted-moss",
        ],

        variant === "destructive" && [
          "border-destructive/40 bg-canvas-pure text-destructive",
          "hover:border-destructive hover:bg-destructive/10",
          "disabled:cursor-not-allowed disabled:opacity-40",
        ],

        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});
