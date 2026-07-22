import { CalendarDays } from "lucide-react";

import DashboardSectionPlaceholder from "@/components/dashboard/DashboardSectionPlaceholder";

export default function CustomerWorkshopsPage() {
  return (
    <DashboardSectionPlaceholder
      icon={CalendarDays}
      eyebrow="Dashboard Customer"
      title="Workshop Saya"
      description="Kelola pendaftaran workshop, lihat jadwal mendatang, serta riwayat workshop yang sudah Anda ikuti."
    />
  );
}