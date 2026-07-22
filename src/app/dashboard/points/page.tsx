import { Coins } from "lucide-react";

import DashboardSectionPlaceholder from "@/components/dashboard/DashboardSectionPlaceholder";

export default function CustomerPointsPage() {
  return (
    <DashboardSectionPlaceholder
      icon={Coins}
      eyebrow="Dashboard Customer"
      title="Poin & Dampak"
      description="Pantau saldo coin, riwayat transaksi poin, serta dampak lingkungan dari aktivitas Anda di Muri."
    />
  );
}