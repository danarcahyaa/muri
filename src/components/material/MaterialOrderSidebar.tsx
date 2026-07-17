import MaterialOrderCard from "@/components/material/MaterialOrderCard";

interface MaterialOrderSidebarProps {
  slug: string;
  pricePerKg: number;
  availableKg: number;
  minimumOrderKg: number;
}

export default function MaterialOrderSidebar({
  slug,
  pricePerKg,
  availableKg,
  minimumOrderKg,
}: MaterialOrderSidebarProps) {
  return (
    <div className="min-w-0 self-start lg:sticky lg:top-24">
      <MaterialOrderCard
        slug={slug}
        pricePerKg={pricePerKg}
        availableKg={availableKg}
        minimumOrderKg={minimumOrderKg}
        orderStepKg={1}
      />
    </div>
  );
}
