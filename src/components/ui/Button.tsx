import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  `
    group/button inline-flex shrink-0 items-center justify-center
    box-border rounded-sm border border-transparent
    bg-clip-padding whitespace-nowrap
    font-body text-xs font-bold
    outline-none select-none
    cursor-pointer

    transition-[background-color,border-color,color,box-shadow]
    duration-300

    focus-visible:ring-2

    active:not-aria-[haspopup]:translate-y-px

    disabled:pointer-events-none
    disabled:cursor-not-allowed
    disabled:opacity-50

    aria-invalid:border-destructive
    aria-invalid:ring-2
    aria-invalid:ring-destructive/20

    [&_svg]:pointer-events-none
    [&_svg]:shrink-0
    [&_svg:not([class*='size-'])]:size-4
  `,
  {
    variants: {
      variant: {
        /*
         * Default button mengikuti tombol utama
         * pada halaman login.
         */
        default: `
          bg-brand-black
          text-canvas-pure
          shadow-none

          hover:bg-brand-forest

          focus-visible:border-brand-emerald
          focus-visible:ring-brand-emerald/20
        `,

        /*
         * Outline mengikuti tombol Google
         * pada halaman login.
         */
        outline: `
          border-line-trace
          bg-transparent
          text-brand-black
          shadow-none

          hover:border-brand-emerald
          hover:bg-canvas-warm

          focus-visible:border-brand-emerald
          focus-visible:ring-brand-emerald/10
        `,

        secondary: `
          bg-secondary
          text-secondary-foreground

          hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]

          focus-visible:border-ring
          focus-visible:ring-ring/30
        `,

        ghost: `
          bg-transparent
          text-brand-black

          hover:bg-canvas-warm
          hover:text-brand-forest

          focus-visible:border-brand-emerald
          focus-visible:ring-brand-emerald/10
        `,

        destructive: `
          bg-destructive
          text-white

          hover:bg-destructive/80

          focus-visible:border-destructive/40
          focus-visible:ring-destructive/20
        `,

        "outline-destructive": `
          border-destructive/40
          bg-transparent
          text-destructive

          hover:bg-destructive/10
          hover:border-destructive

          focus-visible:border-destructive
          focus-visible:ring-destructive/20
        `,

        link: `
          h-auto border-0 bg-transparent p-0
          text-brand-emerald underline-offset-4

          hover:text-brand-forest
          hover:underline

          focus-visible:ring-brand-emerald/20
        `,

        "solid-black": `
          bg-brand-black
          text-canvas-pure
          shadow-none

          hover:bg-brand-forest

          focus-visible:border-brand-emerald
          focus-visible:ring-brand-emerald/20
        `,

        "outline-black": `
          border-brand-black
          bg-transparent
          text-brand-black

          hover:bg-brand-black/10

          focus-visible:border-brand-black
          focus-visible:ring-brand-black/20
        `,
        "solid-white": `
          border-line-trace
          bg-canvas-pure
          text-brand-black
          shadow-none

          hover:bg-canvas-warm

          focus-visible:border-brand-emerald
          focus-visible:ring-brand-emerald/20
        `,
        "outline-white": `
          border-canvas-pure
          bg-transparent
          text-canvas-pure

          hover:bg-canvas-pure/15

          focus-visible:border-canvas-pure
          focus-visible:ring-canvas-pure/20
        `,

        "solid-lime": `
          bg-brand-lime
          text-brand-black

          hover:bg-brand-lime/90

          focus-visible:border-brand-lime
          focus-visible:ring-brand-lime/30
        `,

        /*
         * Alias agar pemakaian lama tidak rusak.
         */
        "auth-primary": `
          bg-brand-black
          text-canvas-pure
          shadow-none

          hover:bg-brand-forest

          focus-visible:border-brand-emerald
          focus-visible:ring-brand-emerald/20
        `,

        "auth-outline": `
          border-line-trace
          bg-transparent
          text-brand-black
          shadow-none

          hover:border-brand-emerald
          hover:bg-canvas-warm

          focus-visible:border-brand-emerald
          focus-visible:ring-brand-emerald/10
        `,
      },

      size: {
        default: "h-12 gap-2 px-5",
        xs: "h-7 gap-1 px-2.5 text-[11px]",
        sm: "h-9 gap-1.5 px-4 text-xs",
        md: "h-12 gap-2 px-5 text-xs",
        lg: "h-14 gap-2.5 px-8 text-sm",

        auth: "h-12 gap-2 px-5 text-xs",

        icon: "size-12",
        "icon-xs": "size-7",
        "icon-sm": "size-9",
        "icon-md": "size-12",
        "icon-lg": "size-14",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends ButtonPrimitive.Props, VariantProps<typeof buttonVariants> {
  loading?: boolean;
  fullWidth?: boolean;
}

function Button({
  className,
  variant = "default",
  size = "default",
  loading = false,
  fullWidth = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const currentSize = size ?? "default";

  const isIconButton =
    typeof currentSize === "string" && currentSize.startsWith("icon");

  return (
    <ButtonPrimitive
      data-slot="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        buttonVariants({
          variant,
          size: currentSize,
        }),
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading && <Spinner />}

      {(!loading || !isIconButton) && children}
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants };
