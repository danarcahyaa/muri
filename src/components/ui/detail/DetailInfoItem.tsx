import type { LucideIcon } from "lucide-react";

interface DetailInfoItemProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

export default function DetailInfoItem({
  icon: Icon,
  label,
  value,
}: DetailInfoItemProps) {
  return (
    <div className="flex gap-4 rounded-xl bg-canvas-warm p-5">
      <div
        className="
          flex size-10 shrink-0 items-center justify-center
          rounded-lg bg-brand-lime/50 text-brand-forest
        "
      >
        <Icon className="size-4" strokeWidth={1.8} />
      </div>

      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-wide text-muted-moss">
          {label}
        </p>

        <p className="mt-1.5 text-xs font-bold leading-5 text-brand-black">
          {value}
        </p>
      </div>
    </div>
  );
}
