"use client";

import {
  CheckCircle2,
  ClipboardList,
  Package,
  Truck,
  XCircle,
  type LucideIcon,
} from "lucide-react";

export type FulfillmentTab =
  | "pending"
  | "processing"
  | "shipped"
  | "complete"
  | "cancelled";

export const TABS: Array<{
  value: FulfillmentTab;
  label: string;
  icon: LucideIcon;
}> = [
  { value: "pending", label: "Menunggu", icon: ClipboardList },
  { value: "processing", label: "Diproses", icon: Package },
  { value: "shipped", label: "Dikirim", icon: Truck },
  { value: "complete", label: "Selesai", icon: CheckCircle2 },
  { value: "cancelled", label: "Dibatalkan", icon: XCircle },
];

interface FulfillmentTabsProps {
  activeTab: FulfillmentTab;
  counts: Record<FulfillmentTab, number>;
  onTabChange: (tab: FulfillmentTab) => void;
}

export function FulfillmentTabs({
  activeTab,
  counts,
  onTabChange,
}: FulfillmentTabsProps) {
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.value;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onTabChange(tab.value)}
            className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
              active
                ? "border-brand-forest bg-brand-forest text-white"
                : "border-line-trace bg-canvas-pure text-brand-black hover:border-brand-emerald"
            }`}
          >
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                active
                  ? "bg-white/10 text-brand-lime"
                  : "bg-canvas-warm text-brand-emerald"
              }`}
            >
              <Icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold">{tab.label}</p>
              <p
                className={`mt-1 text-[10px] ${
                  active ? "text-white/65" : "text-muted-moss"
                }`}
              >
                {counts[tab.value]} pesanan
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
