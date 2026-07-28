import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const fieldVariants = cva("group/field flex w-full", {
  variants: {
    orientation: {
      vertical: "flex-col gap-2",
      horizontal: "items-start gap-4",
      responsive:
        "flex-col gap-2 @md/field-group:flex-row @md/field-group:items-start @md/field-group:gap-4",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});

interface FieldProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof fieldVariants> {}

function Field({
  className,
  orientation = "vertical",
  ...props
}: FieldProps) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  );
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn("@container/field-group flex w-full flex-col gap-5", className)}
      {...props}
    />
  );
}

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn("flex min-w-0 flex-1 flex-col gap-1.5", className)}
      {...props}
    />
  );
}

function FieldLabel({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="field-label"
      className={cn(
        `
          text-xs font-bold text-brand-black
          group-data-[disabled=true]/field:cursor-not-allowed
          group-data-[disabled=true]/field:opacity-50
        `,
        className,
      )}
      {...props}
    />
  );
}

function FieldDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn("text-[11px] leading-relaxed text-muted-moss", className)}
      {...props}
    />
  );
}

type FieldErrorItem =
  | {
      message?: string;
    }
  | undefined;

interface FieldErrorProps extends React.ComponentProps<"div"> {
  errors?: FieldErrorItem[];
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: FieldErrorProps) {
  const messages = React.useMemo(
    () =>
      errors
        ?.map((error) => error?.message)
        .filter((message): message is string => Boolean(message)) ?? [],
    [errors],
  );

  const content = children ??
    (messages.length === 1 ? (
      messages[0]
    ) : messages.length > 1 ? (
      <ul className="ml-4 list-disc space-y-1">
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    ) : null);

  if (!content) return null;

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn("text-[11px] leading-relaxed text-destructive", className)}
      {...props}
    >
      {content}
    </div>
  );
}

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn("min-w-0 space-y-5 border-0 p-0", className)}
      {...props}
    />
  );
}

function FieldLegend({ className, ...props }: React.ComponentProps<"legend">) {
  return (
    <legend
      data-slot="field-legend"
      className={cn("font-heading text-base font-medium text-brand-black", className)}
      {...props}
    />
  );
}

function FieldSeparator({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      role="separator"
      data-slot="field-separator"
      className={cn("relative flex items-center py-2", className)}
      {...props}
    >
      <span className="h-px flex-1 bg-line-trace" />
      {children ? (
        <span className="px-3 text-[10px] font-medium text-muted-moss">
          {children}
        </span>
      ) : null}
      <span className="h-px flex-1 bg-line-trace" />
    </div>
  );
}

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  fieldVariants,
};
