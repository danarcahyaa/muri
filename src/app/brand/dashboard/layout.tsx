import type { ReactNode } from "react";

import RequireBrandAuth from "@/components/auth/RequireBrandAuth";
import { BrandSidebar } from "@/components/brand/BrandSidebar";

type BrandDashboardLayoutProps = {
  children: ReactNode;
};

export default function BrandDashboardLayout({
  children,
}: BrandDashboardLayoutProps) {
  return (
    <RequireBrandAuth>
      <div className="min-h-screen bg-canvas-warm text-brand-black">
        <div className="lg:flex">
          <BrandSidebar />
          <main className="min-w-0 flex-1">
            {children}
          </main>
        </div>
      </div>
    </RequireBrandAuth>
  );
}
