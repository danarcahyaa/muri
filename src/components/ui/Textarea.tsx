import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const textareaVariants = cva(
  `
    w-full min-w-0 box-border
    rounded-sm border
    font-body
    outline-none
    resize-y

    transition-[background-color,border-color,color,box-shadow]
    duration-200

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
         * Default textarea mengikuti style halaman login / input default.
         */
        default: `
          border-brand-black/20
          bg-transparent
          text-brand-black
          shadow-none

          placeholder:font-normal
          placeholder:tracking-normal
          placeholder:text-muted-moss/60

          focus:border-brand-emerald
          focus:ring-2
          focus:ring-brand-emerald/10

          aria-invalid:focus:border-destructive
          aria-invalid:focus:ring-destructive/20

          disabled:bg-canvas-warm
        `,

        filled: `
          border-transparent
          bg-canvas-warm
          text-brand-black

          placeholder:text-muted-moss/60

          focus:border-brand-emerald
          focus:bg-transparent
          focus:ring-2
          focus:ring-brand-emerald/10

          aria-invalid:focus:border-destructive
          aria-invalid:focus:ring-destructive/20
        `,

        /*
         * Alias agar kode auth lama tetap berjalan.
         */
        auth: `
          border-brand-black/20
          bg-transparent
          text-brand-black
          shadow-none

          placeholder:font-normal
          placeholder:tracking-normal
          placeholder:text-muted-moss/60

          focus:border-brand-emerald
          focus:ring-2
          focus:ring-brand-emerald/10

          aria-invalid:focus:border-destructive
          aria-invalid:focus:ring-destructive/20

          disabled:bg-canvas-warm
        `,
      },

      size: {
        default: "min-h-[80px] px-5 py-4 text-xs",
        xs: "min-h-[60px] px-3 py-2 text-xs",
        sm: "min-h-[70px] px-4 py-3 text-xs",
        md: "min-h-[80px] px-5 py-4 text-xs",
        lg: "min-h-[100px] px-5 py-4 text-sm",
        auth: "min-h-[80px] px-5 py-4 text-xs",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface TextareaProps
  extends Omit<React.ComponentProps<"textarea">, "size">,
    VariantProps<typeof textareaVariants> {}

function Textarea({
  className,
  variant = "default",
  size = "default",
  ...props
}: TextareaProps) {
  return (
    <textarea
      className={cn(
        textareaVariants({
          variant,
          size: size ?? "default",
        }),
        className,
      )}
      {...props}
    />
  );
}

export { Textarea, textareaVariants };

