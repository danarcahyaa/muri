import { type ReactElement, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TableActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive";
  "aria-label": string;
}

export function TableActionButton({
  variant = "default",
  className,
  children,
  disabled,
  ...props
}: TableActionButtonProps): ReactElement {
  return (
    <button
      disabled={disabled}
      className={cn(
        "inline-flex size-8 cursor-pointer items-center justify-center rounded-sm border transition-colors",
        variant === "default" && [
          "border-line-trace bg-canvas-pure text-muted-moss",
          "hover:bg-canvas-warm hover:text-brand-black",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-canvas-pure disabled:hover:text-muted-moss",
        ],
        variant === "destructive" && [
          "border-destructive/40 bg-canvas-pure text-destructive",
          "hover:bg-destructive/10 hover:border-destructive",
          "disabled:opacity-40 disabled:cursor-not-allowed",
        ],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
