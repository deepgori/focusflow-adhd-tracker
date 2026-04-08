import { Suspense } from "react";
import { DashboardApp } from "@/components/dashboard-app";

export default function ProductAppPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09111d] text-white p-8">Loading app...</div>}>
      <DashboardApp />
    </Suspense>
  );
}
