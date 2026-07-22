import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft } from "lucide-react";

interface DashboardSectionPlaceholderProps {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
}

export default function DashboardSectionPlaceholder({
  icon: Icon,
  eyebrow,
  title,
  description,
}: DashboardSectionPlaceholderProps) {
  return (
    <div className="mx-auto w-full max-w-[1320px] px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="rounded-3xl border border-line-trace bg-canvas-pure p-7 sm:p-10">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-lime/50 text-brand-forest">
          <Icon
            className="size-5"
            strokeWidth={1.8}
          />
        </div>

        <p className="mt-7 text-xs font-bold uppercase tracking-wide text-brand-emerald">
          {eyebrow}
        </p>

        <h1 className="mt-3 font-display text-4xl font-medium tracking-[-0.04em] text-brand-black sm:text-5xl">
          {title}
        </h1>

        <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-moss">
          {description}
        </p>

        <div className="mt-10 rounded-2xl border border-dashed border-line-trace bg-canvas-warm/50 px-6 py-12 text-center">
          <p className="text-sm font-medium text-brand-black">
            Bagian ini sedang disiapkan.
          </p>

          <p className="mt-2 text-xs leading-5 text-muted-moss">
            Data nyata akan dihubungkan pada tahap berikutnya.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="mt-8 inline-flex items-center gap-2 text-xs font-bold text-brand-emerald transition-colors hover:text-brand-forest"
        >
          <ArrowLeft className="size-4" />
          Kembali ke Ringkasan
        </Link>
      </div>
    </div>
  );
}