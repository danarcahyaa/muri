import type { LucideIcon } from "lucide-react";
import { BadgeCheck, PackageCheck, UploadCloud } from "lucide-react";

export type HowItWorksStep = {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export type HowItWorksMetric = {
  target: number;
  label: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
};

export const howItWorksSteps: HowItWorksStep[] = [
  {
    number: "01",
    title: "Pilah dan Pilih",
    description:
      "Produsen mendaftarkan limbah kain secara detail dari lokasi asal.",
    icon: PackageCheck,
  },
  {
    number: "02",
    title: "Upload dan Verifikasi",
    description:
      "Kepemilikan Batch ID berpindah, proses adopsi material dicatat sepenuhnya di sistem.",
    icon: UploadCloud,
  },
  {
    number: "03",
    title: "Transaksi Bersih",
    description:
      "Produk jadi merupakan output resmi Batch ID dengan kalkulasi dampak yang akurat.",
    icon: BadgeCheck,
  },
];

export const howItWorksMetrics: HowItWorksMetric[] = [
  {
    target: 426,
    suffix: " T",
    label: "estimasi CO₂e terverifikasi",
  },
  {
    target: 1040,
    suffix: " L",
    label: "air bersih diselamatkan",
  },
  {
    target: 89,
    suffix: "+ Pcs",
    label: "produk baru tercipta",
  },
];