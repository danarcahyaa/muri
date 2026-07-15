import type { ReactNode } from "react";

import RequireWasteProviderAuth from "@/components/auth/RequireWasteProviderAuth";
import { WasteProviderSidebar } from "@/components/waste-providers/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

type WasteProviderDashboardLayoutProps = {
  children: ReactNode;
};

export default function WasteProviderDashboardLayout({
  children,
}: WasteProviderDashboardLayoutProps) {
  return (
    <RequireWasteProviderAuth>
      <SidebarProvider>
        <div className="min-h-screen bg-[#F1F3EE] text-brand-black w-full flex flex-col">
          <div className="flex flex-1">
            <WasteProviderSidebar />

            <main className="min-w-0 flex-1">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </RequireWasteProviderAuth>
  );
}
