import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  `
    group/button inline-flex shrink-0 items-center justify-center
    box-border rounded-sm border border-transparent
    bg-clip-padding whitespace-nowrap
    text-sm font-medium
    transition-all outline-none select-none
    cursor-pointer

    focus-visible:border-ring
    focus-visible:ring-3
    focus-visible:ring-ring/50

    active:not-aria-[haspopup]:translate-y-px

    disabled:pointer-events-none
    disabled:opacity-50

    aria-invalid:border-destructive
    aria-invalid:ring-3
    aria-invalid:ring-destructive/20

    [&_svg]:pointer-events-none
    [&_svg]:shrink-0
    [&_svg:not([class*='size-'])]:size-4
  `,
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/80",

        outline: `
          border-border bg-background
          hover:bg-muted hover:text-foreground
          aria-expanded:bg-muted
          aria-expanded:text-foreground

          dark:border-input
          dark:bg-input/30
          dark:hover:bg-input/50
        `,

        secondary: `
          bg-secondary text-secondary-foreground
          hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]
          aria-expanded:bg-secondary
          aria-expanded:text-secondary-foreground
        `,

        ghost: `
          hover:bg-muted
          hover:text-foreground
          aria-expanded:bg-muted
          aria-expanded:text-foreground
          dark:hover:bg-muted/50
        `,

        destructive: `
          bg-destructive/10 text-destructive
          hover:bg-destructive/20
          focus-visible:border-destructive/40
          focus-visible:ring-destructive/20

          dark:bg-destructive/20
          dark:hover:bg-destructive/30
          dark:focus-visible:ring-destructive/40
        `,

        link: "text-primary underline-offset-4 hover:underline",

        "solid-black": `
          bg-brand-black
          text-canvas-pure
          hover:bg-brand-black/90
          focus-visible:ring-brand-black/30
        `,

        "outline-black": `
          border-brand-black
          bg-transparent
          text-brand-black
          hover:bg-brand-black/10
          focus-visible:ring-brand-black/30
        `,

        "outline-white": `
          border-canvas-pure
          bg-transparent
          text-canvas-pure
          hover:bg-canvas-pure/15
          focus-visible:ring-canvas-pure/30
        `,

        "solid-lime": `
          bg-brand-lime
          text-brand-black
          hover:bg-brand-lime/90
          focus-visible:ring-brand-lime/30
        `,

        // Tombol utama login/register
        "auth-primary": `
          bg-brand-black
          text-canvas-pure
          shadow-none

          hover:-translate-y-0.5
          hover:bg-brand-forest

          focus-visible:border-brand-emerald
          focus-visible:ring-2
          focus-visible:ring-brand-emerald/20
        `,

        // Tombol Google login/register
        "auth-outline": `
          border-line-trace
          bg-transparent
          text-brand-black
          shadow-none

          hover:-translate-y-0.5
          hover:border-brand-emerald
          hover:bg-canvas-warm

          focus-visible:border-brand-emerald
          focus-visible:ring-2
          focus-visible:ring-brand-emerald/10
        `,
      },

      size: {
        default: "h-10 gap-2 px-5 text-sm font-semibold",
        xs: "h-6 gap-1 px-2 text-xs",
        sm: "h-8 gap-1.5 px-4 text-xs font-semibold",
        md: "h-10 gap-2 px-5 text-sm font-semibold",
        lg: "h-12 gap-2 px-8 text-sm font-semibold",

        // Ukuran tombol login/register
        auth: "h-12 gap-2 px-5 font-body text-xs font-bold",

        icon: "size-10",
        "icon-xs": "size-6",
        "icon-sm": "size-8",
        "icon-md": "size-10",
        "icon-lg": "size-12",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends ButtonPrimitive.Props,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

function Button({
  className,
  variant = "default",
  size = "default",
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const isIconButton =
    typeof size === "string" && size.startsWith("icon");

  return (
    <ButtonPrimitive
      data-slot="button"
      disabled={disabled || loading}
      className={cn(
        buttonVariants({
          variant,
          size,
        }),
        className,
      )}
      {...props}
    >
      {loading ? (
        <>
          <Spinner />
          {!isIconButton && children}
        </>
      ) : (
        children
      )}
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants };