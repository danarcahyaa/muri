import type { ReactNode } from "react";

import RequireAuth from "@/components/auth/RequireAuth";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import Header from "@/components/layout/Header";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-[#F1F3EE] text-brand-black">
        <Header />

        <div className="pt-16 lg:flex">
          <DashboardSidebar />

          <main className="min-w-0 flex-1">
            {children}
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}