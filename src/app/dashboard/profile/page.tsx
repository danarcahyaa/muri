import { UserRound } from "lucide-react";

import DashboardSectionPlaceholder from "@/components/dashboard/DashboardSectionPlaceholder";

export default function CustomerProfilePage() {
  return (
    <DashboardSectionPlaceholder
      icon={UserRound}
      eyebrow="Dashboard Customer"
      title="Profil"
      description="Kelola nama, nomor telepon, alamat pengiriman, dan informasi akun customer Anda."
    />
  );
}