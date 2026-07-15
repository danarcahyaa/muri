import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  `
    w-full min-w-0 box-border
    rounded-sm border
    font-body
    outline-none

    transition-[background-color,border-color,color,box-shadow]
    duration-200

    file:inline-flex
    file:h-6
    file:border-0
    file:bg-transparent
    file:text-xs
    file:font-medium
    file:text-brand-black

    disabled:pointer-events-none
    disabled:cursor-not-allowed
    disabled:opacity-50

    aria-invalid:border-destructive
    aria-invalid:ring-2
    aria-invalid:ring-destructive/20
  `,
  {
    variants: {
      variant: {
        /*
         * Default input mengikuti style halaman login.
         */
        default: `
          border-line-trace
          bg-transparent
          text-brand-black
          shadow-none

          placeholder:font-normal
          placeholder:tracking-normal
          placeholder:text-muted-moss/60

          focus-visible:border-brand-emerald
          focus-visible:ring-2
          focus-visible:ring-brand-emerald/10

          aria-invalid:focus-visible:border-destructive
          aria-invalid:focus-visible:ring-destructive/20

          disabled:bg-canvas-warm
        `,

        filled: `
          border-transparent
          bg-canvas-warm
          text-brand-black

          placeholder:text-muted-moss/60

          focus-visible:border-brand-emerald
          focus-visible:bg-transparent
          focus-visible:ring-2
          focus-visible:ring-brand-emerald/10

          aria-invalid:focus-visible:border-destructive
          aria-invalid:focus-visible:ring-destructive/20
        `,

        /*
         * Alias agar kode auth lama tetap berjalan.
         */
        auth: `
          border-line-trace
          bg-transparent
          text-brand-black
          shadow-none

          placeholder:font-normal
          placeholder:tracking-normal
          placeholder:text-muted-moss/60

          focus-visible:border-brand-emerald
          focus-visible:ring-2
          focus-visible:ring-brand-emerald/10

          aria-invalid:focus-visible:border-destructive
          aria-invalid:focus-visible:ring-destructive/20

          disabled:bg-canvas-warm
        `,
      },

      size: {
        default: "h-12 px-5 text-xs",
        xs: "h-8 px-3 text-xs",
        sm: "h-10 px-4 text-xs",
        md: "h-12 px-5 text-xs",
        lg: "h-14 px-5 text-sm",
        auth: "h-12 px-5 text-xs",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const iconLayout = {
  default: {
    startPosition: "left-4",
    endPosition: "right-4",
    startPadding: "pl-11",
    endPadding: "pr-11",
  },
  xs: {
    startPosition: "left-3",
    endPosition: "right-3",
    startPadding: "pl-9",
    endPadding: "pr-9",
  },
  sm: {
    startPosition: "left-3.5",
    endPosition: "right-3.5",
    startPadding: "pl-10",
    endPadding: "pr-10",
  },
  md: {
    startPosition: "left-4",
    endPosition: "right-4",
    startPadding: "pl-11",
    endPadding: "pr-11",
  },
  lg: {
    startPosition: "left-4",
    endPosition: "right-4",
    startPadding: "pl-11",
    endPadding: "pr-11",
  },
  auth: {
    startPosition: "left-4",
    endPosition: "right-4",
    startPadding: "pl-11",
    endPadding: "pr-11",
  },
} as const;

type InputPrimitiveProps = React.ComponentProps<typeof InputPrimitive>;

export interface InputProps
  extends Omit<InputPrimitiveProps, "size">,
    VariantProps<typeof inputVariants> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  wrapperClassName?: string;
}

function Input({
  className,
  wrapperClassName,
  type,
  variant = "default",
  size = "default",
  startIcon,
  endIcon,
  ...props
}: InputProps) {
  const currentSize = size ?? "default";
  const layout = iconLayout[currentSize];

  return (
    <div
      data-slot="input-wrapper"
      className={cn(
        "relative flex w-full items-center",
        wrapperClassName,
      )}
    >
      {startIcon && (
        <span
          aria-hidden="true"
          data-slot="input-start-icon"
          className={cn(
            `
              pointer-events-none absolute
              flex items-center justify-center
              text-muted-moss/60

              [&_svg]:size-4
              [&_svg]:shrink-0
            `,
            layout.startPosition,
          )}
        >
          {startIcon}
        </span>
      )}

      <InputPrimitive
        type={type}
        data-slot="input"
        className={cn(
          inputVariants({
            variant,
            size: currentSize,
          }),
          startIcon && layout.startPadding,
          endIcon && layout.endPadding,
          className,
        )}
        {...props}
      />

      {endIcon && (
        <span
          aria-hidden="true"
          data-slot="input-end-icon"
          className={cn(
            `
              pointer-events-none absolute
              flex items-center justify-center
              text-muted-moss/60

              [&_svg]:size-4
              [&_svg]:shrink-0
            `,
            layout.endPosition,
          )}
        >
          {endIcon}
        </span>
      )}
    </div>
  );
}

export { Input, inputVariants };