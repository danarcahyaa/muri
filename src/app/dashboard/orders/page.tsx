import { ShoppingBag } from "lucide-react";

import DashboardSectionPlaceholder from "@/components/dashboard/DashboardSectionPlaceholder";

export default function CustomerOrdersPage() {
  return (
    <DashboardSectionPlaceholder
      icon={ShoppingBag}
      eyebrow="Dashboard Customer"
      title="Pesanan Saya"
      description="Lihat seluruh pesanan produk, status pembayaran, pengiriman, serta rincian produk yang Anda beli."
    />
  );
}