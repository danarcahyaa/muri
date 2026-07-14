import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  `
    w-full min-w-0 box-border rounded-sm border bg-transparent
    transition-colors outline-none

    file:inline-flex
    file:h-6
    file:border-0
    file:bg-transparent
    file:text-sm
    file:font-medium
    file:text-foreground

    disabled:pointer-events-none
    disabled:cursor-not-allowed
    disabled:opacity-50

    aria-invalid:border-destructive
    aria-invalid:ring-3
    aria-invalid:ring-destructive/20
  `,
  {
    variants: {
      variant: {
        default: `
          border-input
          placeholder:text-muted-foreground

          focus-visible:border-ring
          focus-visible:ring-3
          focus-visible:ring-ring/50

          disabled:bg-input/50

          dark:bg-input/30
          dark:disabled:bg-input/80
          dark:aria-invalid:border-destructive/50
          dark:aria-invalid:ring-destructive/40
        `,

        auth: `
          border-line-trace
          bg-transparent
          font-body
          text-brand-black
          shadow-none

          placeholder:font-normal
          placeholder:tracking-normal
          placeholder:text-muted-moss/60

          focus-visible:border-brand-emerald
          focus-visible:ring-2
          focus-visible:ring-brand-emerald/10

          disabled:bg-canvas-warm
        `,
      },

      size: {
        default: "h-10 px-3.5 text-sm",
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-3.5 text-sm",
        lg: "h-12 px-4 text-sm",

        // Ukuran seperti input pada halaman login/register
        auth: "h-12 px-5 text-xs",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

function Input({
  className,
  type,
  variant = "default",
  size = "default",
  startIcon,
  endIcon,
  ...props
}: InputProps) {
  const currentSize = size ?? "default";

  const iconPosition =
    currentSize === "sm"
      ? "left-2.5"
      : currentSize === "lg" || currentSize === "auth"
        ? "left-4"
        : "left-3";

  const endIconPosition =
    currentSize === "sm"
      ? "right-2.5"
      : currentSize === "lg" || currentSize === "auth"
        ? "right-4"
        : "right-3";

  const startPadding =
    currentSize === "sm"
      ? "pl-8"
      : currentSize === "lg" || currentSize === "auth"
        ? "pl-11"
        : "pl-10";

  const endPadding =
    currentSize === "sm"
      ? "pr-8"
      : currentSize === "lg" || currentSize === "auth"
        ? "pr-11"
        : "pr-10";

  return (
    <div className="relative flex w-full items-center">
      {startIcon && (
        <div
          className={cn(
            `
              pointer-events-none absolute
              flex items-center justify-center
              text-muted-foreground
              [&_svg]:size-4
              [&_svg]:shrink-0
            `,
            iconPosition,
          )}
        >
          {startIcon}
        </div>
      )}

      <InputPrimitive
        type={type}
        data-slot="input"
        className={cn(
          inputVariants({
            variant,
            size: currentSize,
          }),
          startIcon && startPadding,
          endIcon && endPadding,
          className,
        )}
        {...props}
      />

      {endIcon && (
        <div
          className={cn(
            `
              pointer-events-none absolute
              flex items-center justify-center
              text-muted-moss/60
              [&_svg]:size-4
              [&_svg]:shrink-0
            `,
            endIconPosition,
          )}
        >
          {endIcon}
        </div>
      )}
    </div>
  );
}

export { Input, inputVariants };