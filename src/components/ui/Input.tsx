import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "w-full min-w-0 box-border rounded-sm border border-input bg-transparent transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      size: {
        default: "h-10 px-3.5 py-2 text-sm",
        sm: "h-8 px-3 py-1.5 text-xs",
        md: "h-10 px-3.5 py-2 text-sm",
        lg: "h-12 px-4 py-3 text-sm",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
}

function Input({ className, type, size = "default", startIcon, endIcon, ...props }: InputProps) {
  const currentSize = size || "default"
  return (
    <div className="relative flex items-center w-full">
      {startIcon && (
        <div className={cn(
          "absolute text-muted-foreground pointer-events-none flex items-center justify-center [&_svg]:size-4 [&_svg]:shrink-0",
          currentSize === "sm" ? "left-2.5" : currentSize === "lg" ? "left-4" : "left-3"
        )}>
          {startIcon}
        </div>
      )}
      <InputPrimitive
        type={type}
        data-slot="input"
        className={cn(
          inputVariants({ size: currentSize, className }),
          startIcon && (currentSize === "sm" ? "pl-8" : currentSize === "lg" ? "pl-11" : "pl-10"),
          endIcon && (currentSize === "sm" ? "pr-8" : currentSize === "lg" ? "pr-11" : "pr-10")
        )}
        {...props}
      />
      {endIcon && (
        <div className={cn(
          "absolute text-muted-foreground pointer-events-none flex items-center justify-center [&_svg]:size-4 [&_svg]:shrink-0",
          currentSize === "sm" ? "right-2.5" : currentSize === "lg" ? "right-4" : "right-3"
        )}>
          {endIcon}
        </div>
      )}
    </div>
  )
}

export { Input, inputVariants }
