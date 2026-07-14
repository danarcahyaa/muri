import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";

const summaryMetrics = [
  {
    label: "Emisi Dicegah",
    value: "426 Kg",
    description: "estimasi CO₂e terverifikasi",
    featured: true,
  },
  {
    label: "Air yang Dihemat",
    value: "12.450 L",
    description: "dibandingkan memproduksi baru",
  },
  {
    label: "Nilai Ekonomi Tercipta",
    value: "Rp 85 Jt",
    description: "keuntungan yang didistribusikan",
  },
];

const offerMetrics = [
  {
    label: "Total Harga Penawaran",
    value: "IDR 500.000",
    unit: "/Kg",
  },
  {
    label: "Material Terjual",
    value: "1.250 Kg",
    unit: "bulan ini",
  },
  {
    label: "Permintaan Aktif",
    value: "24",
    unit: "permintaan",
  },
  {
    label: "Mitra Terhubung",
    value: "18",
    unit: "mitra aktif",
  },
];

const salesData = [
  {
    id: "TRX-001",
    material: "Kain Denim",
    location: "Badung",
    status: "Terverifikasi",
  },
  {
    id: "TRX-002",
    material: "Katun Sisa",
    location: "Denpasar",
    status: "Diproses",
  },
  {
    id: "TRX-003",
    material: "Polyester",
    location: "Gianyar",
    status: "Terverifikasi",
  },
  {
    id: "TRX-004",
    material: "Kain Campuran",
    location: "Badung",
    status: "Menunggu",
  },
  {
    id: "TRX-005",
    material: "Denim Bekas",
    location: "Denpasar",
    status: "Terverifikasi",
  },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-[1320px] px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
      <DashboardHeading />

      <section className="mt-10 overflow-hidden rounded-3xl border border-line-trace bg-canvas-pure">
        <div className="grid lg:grid-cols-3">
          {summaryMetrics.map((metric) => (
            <SummaryMetric
              key={metric.label}
              label={metric.label}
              value={metric.value}
              description={metric.description}
              featured={metric.featured}
            />
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {offerMetrics.map((metric) => (
          <article
            key={metric.label}
            className="flex min-h-40 flex-col rounded-2xl border border-line-trace bg-canvas-pure p-6"
          >
            <p className="text-[11px] font-medium uppercase text-muted-moss">
              {metric.label}
            </p>

            <div className="mt-auto pt-8">
              <p className="font-display text-2xl font-medium tracking-tight text-brand-black">
                {metric.value}
              </p>

              <p className="mt-3 text-xs text-muted-moss">
                {metric.unit}
              </p>
            </div>
          </article>
        ))}
      </section>

      <SalesTable />
    </div>
  );
}

function DashboardHeading() {
  return (
    <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-4 flex items-center gap-3 text-brand-emerald">
          <Leaf className="size-4" strokeWidth={2} />

          <span className="text-xs font-bold uppercase tracking-tight">
            Upcycled Marketplace
          </span>
        </div>

        <h1 className="font-display text-5xl font-medium leading-none tracking-[-0.05em] text-brand-black sm:text-6xl">
          Nilai Aksi Anda
        </h1>

        <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-moss">
          Pantau aktivitas material, nilai ekonomi, dan dampak lingkungan Anda
          dalam satu dashboard.
        </p>
      </div>

      <Link
        href="/dashboard/ai-material"
        className="group inline-flex w-fit items-center justify-center gap-2 rounded-md bg-brand-black px-6 py-4 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-brand-forest"
      >
        Mulai Aktivitas

        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}

type SummaryMetricProps = {
  label: string;
  value: string;
  description: string;
  featured?: boolean;
};

function SummaryMetric({
  label,
  value,
  description,
  featured = false,
}: SummaryMetricProps) {
  return (
    <article
      className={`flex min-h-[230px] flex-col border-b border-line-trace p-7 last:border-b-0 sm:p-9 lg:border-b-0 lg:border-r lg:last:border-r-0 ${
        featured
          ? "bg-gradient-to-r from-brand-forest to-[#315F35] text-white"
          : "bg-canvas-pure text-brand-black"
      }`}
    >
      <p
        className={`text-xs font-medium uppercase ${
          featured ? "text-white/55" : "text-brand-black/70"
        }`}
      >
        {label}
      </p>

      <div className="mt-auto pt-10">
        <p
          className={`font-display text-5xl font-normal leading-none tracking-tighter sm:text-6xl ${
            featured ? "text-brand-lime" : "text-brand-black"
          }`}
        >
          {value}
        </p>

        <p
          className={`mt-5 text-sm ${
            featured ? "text-white/50" : "text-muted-moss"
          }`}
        >
          {description}
        </p>
      </div>
    </article>
  );
}

function SalesTable() {
  return (
    <section className="mt-6 overflow-hidden rounded-3xl border border-line-trace bg-canvas-pure">
      <div className="flex flex-col gap-5 border-b border-line-trace px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <h2 className="font-display text-2xl font-medium tracking-tight text-brand-black">
            Data Penjualan
          </h2>

          <p className="mt-2 text-xs text-muted-moss">
            Aktivitas material terbaru yang tercatat di akun Anda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md px-3 py-2 text-[11px] font-medium text-muted-moss transition hover:bg-canvas-warm"
          >
            Denpasar
          </button>

          <button
            type="button"
            className="rounded-md px-3 py-2 text-[11px] font-medium text-muted-moss transition hover:bg-canvas-warm"
          >
            Gianyar
          </button>

          <button
            type="button"
            className="rounded-md bg-brand-forest px-3 py-2 text-[11px] font-medium text-white"
          >
            Badung
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="border-b border-line-trace text-left">
              <th className="px-8 py-4 text-[11px] font-medium uppercase text-muted-moss">
                Transaksi
              </th>

              <th className="px-8 py-4 text-[11px] font-medium uppercase text-muted-moss">
                Material
              </th>

              <th className="px-8 py-4 text-[11px] font-medium uppercase text-muted-moss">
                Lokasi
              </th>

              <th className="px-8 py-4 text-right text-[11px] font-medium uppercase text-muted-moss">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {salesData.map((sale) => (
              <tr
                key={sale.id}
                className="border-b border-line-trace last:border-b-0 transition-colors hover:bg-canvas-warm/50"
              >
                <td className="px-8 py-5 font-display text-sm font-medium text-brand-black">
                  {sale.id}
                </td>

                <td className="px-8 py-5 text-sm text-muted-moss">
                  {sale.material}
                </td>

                <td className="px-8 py-5 text-sm text-muted-moss">
                  {sale.location}
                </td>

                <td className="px-8 py-5 text-right">
                  <StatusBadge status={sale.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusClass =
    status === "Terverifikasi"
      ? "bg-brand-lime/50 text-brand-forest"
      : status === "Diproses"
        ? "bg-brand-emerald/10 text-brand-emerald"
        : "bg-canvas-warm text-muted-moss";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-2 text-[10px] font-bold uppercase ${statusClass}`}
    >
      {status}
    </span>
  );
}