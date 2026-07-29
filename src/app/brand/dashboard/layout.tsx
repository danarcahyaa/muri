import type { ReactNode } from "react";

import RequireBrandAuth from "@/components/auth/RequireBrandAuth";
import { BrandSidebar } from "@/components/brand/BrandSidebar";
import { SidebarProvider } from "@/components/ui/Sidebar";

type BrandDashboardLayoutProps = {
  children: ReactNode;
};

export default function BrandDashboardLayout({
  children,
}: BrandDashboardLayoutProps) {
  return (
    <RequireBrandAuth>
      <SidebarProvider>
        <div className="min-h-screen bg-canvas-warm text-brand-black w-full flex flex-col">
          <div className="flex flex-1">
            <BrandSidebar />
            <main className="min-w-0 flex-1">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </RequireBrandAuth>
  );
}
