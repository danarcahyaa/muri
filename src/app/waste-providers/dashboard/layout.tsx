import type { ReactNode } from "react";

import RequireWasteProviderAuth from "@/components/auth/RequireWasteProviderAuth";
import { WasteProviderSidebar } from "@/components/waste-providers/Sidebar";

type WasteProviderDashboardLayoutProps = {
  children: ReactNode;
};

export default function WasteProviderDashboardLayout({
  children,
}: WasteProviderDashboardLayoutProps) {
  return (
    <RequireWasteProviderAuth>
      <div className="min-h-screen bg-canvas-warm text-brand-black">
        <div className="lg:flex">
          <WasteProviderSidebar />
          <main className="min-w-0 flex-1">
            {children}
          </main>
        </div>
      </div>
    </RequireWasteProviderAuth>
  );
}

