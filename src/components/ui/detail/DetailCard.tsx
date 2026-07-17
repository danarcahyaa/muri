import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface DetailCardProps {
  eyebrow: string;
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
}

export default function DetailCard({
  eyebrow,
  title,
  icon: Icon,
  children,
  className = "",
}: DetailCardProps) {
  return (
    <section
      className={`rounded-2xl border border-line-trace bg-canvas-pure p-6 sm:p-8 ${className}`}
    >
      <div className="flex items-center gap-3 text-brand-emerald">
        <Icon className="size-4" strokeWidth={2} />

        <p className="text-[11px] font-bold uppercase tracking-tight">
          {eyebrow}
        </p>
      </div>

      <h2 className="mt-4 font-display text-3xl font-medium tracking-[-0.04em] text-brand-black sm:text-4xl">
        {title}
      </h2>

      <div className="mt-7">{children}</div>
    </section>
  );
}
