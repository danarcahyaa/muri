"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  CalendarCheck2,
  CheckCircle2,
  Coins,
  Droplets,
  Leaf,
  PackageCheck,
  RefreshCw,
  Scale,
  ShoppingBag,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Skeleton } from "@/components/ui/Skeleton";
import {
  getCustomerDashboardSummary,
} from "@/services/customer";
import type {
  CustomerDashboardSummary,
} from "@/types/customerDashboard";

export default function CustomerDashboardSummarySection() {
  const [summary, setSummary] =
    useState<CustomerDashboardSummary | null>(
      null,
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result =
        await getCustomerDashboardSummary();

      if (!result.success || !result.data) {
        setSummary(null);
        setErrorMessage(
          "Ringkasan dashboard belum dapat dimuat.",
        );

        return;
      }

      setSummary(result.data);
    } catch {
      setSummary(null);
      setErrorMessage(
        "Terjadi kesalahan saat memuat ringkasan dashboard.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  if (isLoading) {
    return <DashboardSummarySkeleton />;
  }

  if (errorMessage || !summary) {
    return (
      <DashboardSummaryError
        message={
          errorMessage ??
          "Ringkasan dashboard tidak tersedia."
        }
        onRetry={loadSummary}
      />
    );
  }

  return (
    <>
      <ImpactSummary summary={summary} />
      <ActivitySummary summary={summary} />
    </>
  );
}

function ImpactSummary({
  summary,
}: {
  summary: CustomerDashboardSummary;
}) {
  const metrics: ImpactMetric[] = [
    {
      label: "Emisi Dicegah",
      value: formatWeight(
        summary.carbonSavedKg,
        "kg",
      ),
      description:
        "estimasi karbon yang berhasil dihemat",
      icon: Leaf,
      featured: true,
    },
    {
      label: "Air yang Dihemat",
      value: `${formatNumber(
        summary.waterSavedLiters,
      )} L`,
      description:
        "air yang tidak perlu digunakan untuk produksi baru",
      icon: Droplets,
    },
    {
      label: "Material Diselamatkan",
      value: formatMaterialWeight(
        summary.materialSavedGrams,
      ),
      description:
        "material yang kembali masuk ke siklus penggunaan",
      icon: Scale,
    },
  ];

  return (
    <section className="mt-10 overflow-hidden rounded-2xl border border-brand-black/15 bg-canvas-pure">
      <div className="grid lg:grid-cols-3">
        {metrics.map((metric) => (
          <ImpactMetricCard
            key={metric.label}
            metric={metric}
          />
        ))}
      </div>
    </section>
  );
}

function ActivitySummary({
  summary,
}: {
  summary: CustomerDashboardSummary;
}) {
  const metrics: ActivityMetric[] = [
    {
      label: "Coin Tersedia",
      value: formatNumber(
        summary.totalPoints,
      ),
      unit: "coin",
      icon: Coins,
    },
    {
      label: "Workshop Aktif",
      value: formatNumber(
        summary.activeWorkshopCount,
      ),
      unit: "pendaftaran",
      icon: CalendarCheck2,
    },
    {
      label: "Workshop Selesai",
      value: formatNumber(
        summary.attendedWorkshopCount,
      ),
      unit: "telah diikuti",
      icon: CheckCircle2,
    },
    {
      label: "Total Pesanan",
      value: formatNumber(
        summary.totalOrders,
      ),
      unit: "pesanan",
      icon: ShoppingBag,
    },
  ];

  return (
    <section className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <ActivityMetricCard
          key={metric.label}
          metric={metric}
        />
      ))}
    </section>
  );
}

interface ImpactMetric {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  featured?: boolean;
}

function ImpactMetricCard({
  metric,
}: {
  metric: ImpactMetric;
}) {
  const Icon = metric.icon;

  return (
    <article
      className={`
        flex min-h-[230px] flex-col
        border-b border-line-trace
        p-7 last:border-b-0
        sm:p-9
        lg:border-b-0 lg:border-r
        lg:last:border-r-0
        ${
          metric.featured
            ? `
                bg-gradient-to-r
                from-brand-forest
                to-[#315F35]
                text-white
              `
            : "bg-canvas-pure text-brand-black"
        }
      `}
    >
      <div className="flex items-center justify-between gap-4">
        <p
          className={`
            text-xs font-medium uppercase
            ${
              metric.featured
                ? "text-white/55"
                : "text-brand-black/70"
            }
          `}
        >
          {metric.label}
        </p>

        <div
          className={`
            flex size-10 items-center
            justify-center rounded-full
            ${
              metric.featured
                ? "bg-white/10 text-brand-lime"
                : "bg-brand-lime/35 text-brand-forest"
            }
          `}
        >
          <Icon
            className="size-4"
            strokeWidth={1.8}
          />
        </div>
      </div>

      <div className="mt-auto pt-10">
        <p
          className={`
            font-display text-5xl
            font-normal leading-none
            tracking-tighter sm:text-6xl
            ${
              metric.featured
                ? "text-brand-lime"
                : "text-brand-black"
            }
          `}
        >
          {metric.value}
        </p>

        <p
          className={`
            mt-5 text-sm leading-relaxed
            ${
              metric.featured
                ? "text-white/50"
                : "text-muted-moss"
            }
          `}
        >
          {metric.description}
        </p>
      </div>
    </article>
  );
}

interface ActivityMetric {
  label: string;
  value: string;
  unit: string;
  icon: LucideIcon;
}

function ActivityMetricCard({
  metric,
}: {
  metric: ActivityMetric;
}) {
  const Icon = metric.icon;

  return (
    <article className="flex min-h-40 flex-col rounded-2xl border border-brand-black/15 bg-canvas-pure p-6">
      <div className="flex items-start justify-between gap-4">
        <p className="text-[11px] font-medium uppercase text-muted-moss">
          {metric.label}
        </p>

        <div className="flex size-9 items-center justify-center rounded-lg bg-brand-lime/35 text-brand-forest">
          <Icon
            className="size-4"
            strokeWidth={1.8}
          />
        </div>
      </div>

      <div className="mt-auto pt-8">
        <p className="font-display text-3xl font-medium tracking-tight text-brand-black">
          {metric.value}
        </p>

        <p className="mt-3 text-xs text-muted-moss">
          {metric.unit}
        </p>
      </div>
    </article>
  );
}

function DashboardSummarySkeleton() {
  return (
    <>
      <section className="mt-10 overflow-hidden rounded-3xl border border-brand-black/15 bg-canvas-pure">
        <div className="grid lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="flex min-h-[230px] flex-col border-b border-line-trace p-7 last:border-b-0 sm:p-9 lg:border-b-0 lg:border-r lg:last:border-r-0"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="size-10 rounded-full" />
              </div>
              <div className="mt-auto pt-10">
                <Skeleton className="h-12 w-36" />
                <Skeleton className="mt-4 h-4 w-48" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="flex min-h-40 flex-col rounded-2xl border border-brand-black/15 bg-canvas-pure p-6"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="size-9 rounded-lg" />
            </div>
            <div className="mt-auto pt-8">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="mt-2 h-3 w-16" />
            </div>
          </div>
        ))}
      </section>
    </>
  );
}

function DashboardSummaryError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => Promise<void>;
}) {
  return (
    <section className="mt-10 flex min-h-64 flex-col items-center justify-center rounded-3xl border border-brand-black/15 bg-canvas-pure px-6 py-12 text-center">
      <RefreshCw
        className="size-9 text-muted-moss/50"
        strokeWidth={1.5}
      />

      <h2 className="mt-5 font-display text-2xl font-medium text-brand-black">
        Ringkasan gagal dimuat
      </h2>

      <p className="mt-2 max-w-md text-xs leading-5 text-muted-moss">
        {message}
      </p>

      <button
        type="button"
        onClick={() => {
          void onRetry();
        }}
        className="mt-6 inline-flex items-center gap-2 rounded-md bg-brand-forest px-5 py-3 text-xs font-bold text-white transition hover:bg-brand-black"
      >
        <RefreshCw className="size-4" />
        Coba Lagi
      </button>
    </section>
  );
}

function formatNumber(
  value: number,
): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatWeight(
  value: number,
  unit: string,
): string {
  return `${formatNumber(value)} ${unit}`;
}

function formatMaterialWeight(
  grams: number,
): string {
  if (grams >= 1_000_000) {
    return `${formatNumber(
      grams / 1_000_000,
    )} ton`;
  }

  if (grams >= 1_000) {
    return `${formatNumber(
      grams / 1_000,
    )} kg`;
  }

  return `${formatNumber(grams)} g`;
}