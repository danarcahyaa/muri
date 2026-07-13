export type ImpactMetricItem = {
  label: string;
  target: number;
  description: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
};

export const impactMetrics: ImpactMetricItem[] = [
  {
    label: "Emisi Dicegah",
    target: 426,
    suffix: " Kg",
    description: "estimasi CO₂e terverifikasi",
  },
  {
    label: "Air yang Dihemat",
    target: 12450,
    suffix: " L",
    description: "dibandingkan memproduksi baru",
  },
  {
    label: "Kain yang Didaur Ulang",
    target: 1.2,
    decimals: 1,
    suffix: " Ton",
    description: "penyelamatan material dari TPA",
  },
  {
    label: "Nilai Ekonomi Tercipta",
    target: 85,
    prefix: "Rp ",
    suffix: " Jt",
    description: "keuntungan yang didistribusikan",
  },
];
