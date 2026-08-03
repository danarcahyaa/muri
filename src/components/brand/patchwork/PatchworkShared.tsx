"use client";

import type { ReactElement, ReactNode } from "react";
import { Info } from "lucide-react";

import { Card } from "@/components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { getOptionLabel } from "@/constants/patchwork.constants";
import type { SelectOption } from "@/types/patchwork";

export function StepHeader({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-forest text-[10px] font-bold text-white">
        {number}
      </span>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-brand-black">
          {title}
        </p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted-moss">
          {description}
        </p>
      </div>
    </div>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  hint,
}: {
  label: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  hint?: string;
}) {
  const activeLabel = getOptionLabel(options, value);

  return (
    <div>
      <span className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-moss">
        {label}
        {hint && (
          <Tooltip>
            <TooltipTrigger className="inline-flex items-center text-muted-moss/70 hover:text-brand-forest">
              <Info className="size-3" />
            </TooltipTrigger>
            <TooltipContent>{hint}</TooltipContent>
          </Tooltip>
        )}
      </span>
      <Select value={value} onValueChange={(next) => onChange(next as T)}>
        <SelectTrigger size="md">
          <SelectValue>{activeLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function OutcomeCard({
  icon,
  title,
}: {
  icon: ReactElement<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-line-trace bg-canvas-warm/40 p-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-lime/30 text-brand-forest [&>svg]:size-4">
        {icon}
      </span>
      <p className="text-[11px] font-bold text-brand-black">{title}</p>
    </div>
  );
}

export function MiniFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-wide text-muted-moss">
        {label}
      </p>
      <p className="mt-1 text-[11px] font-bold leading-relaxed text-brand-black">
        {value}
      </p>
    </div>
  );
}

export function FactCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-3">
      <p className="text-[9px] uppercase tracking-wide text-muted-moss">
        {label}
      </p>
      <p className="mt-1 text-[11px] font-bold leading-relaxed text-brand-black">
        {value}
      </p>
    </Card>
  );
}

export function PlanSection({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-brand-black">
        <span className="text-brand-emerald">{icon}</span>
        {title}
      </p>
      {children}
    </section>
  );
}