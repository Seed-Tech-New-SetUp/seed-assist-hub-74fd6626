import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useSchool } from "@/contexts/SchoolContext";
import { DashboardLayoutSwitcher, DashboardLayoutType } from "@/components/dashboard/DashboardLayoutSwitcher";
import { PillarsDashboard } from "@/components/dashboard/PillarsDashboard";
import { StatsDashboard } from "@/components/dashboard/StatsDashboard";
import { TilesDashboard } from "@/components/dashboard/TilesDashboard";
import { CompactDashboard } from "@/components/dashboard/CompactDashboard";

const LAYOUT_STORAGE_KEY = "dashboard-layout-preference";

export default function Dashboard() {
  const { user, selectedSchool } = useAuth();
  const { currentSchool } = useSchool();

  // Load saved layout preference or default to "pillars"
  const [currentLayout, setCurrentLayout] = useState<DashboardLayoutType>(() => {
    const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
    return (saved as DashboardLayoutType) || "pillars";
  });

  // Save layout preference when it changes
  useEffect(() => {
    localStorage.setItem(LAYOUT_STORAGE_KEY, currentLayout);
  }, [currentLayout]);

  // Get user display info
  const displayName = (user as any)?.full_name || (user as any)?.user_metadata?.full_name || "User";
  const designation = currentSchool?.designation || (user as any)?.designation || "";
  const universityName = selectedSchool?.university || "";
  const schoolName = selectedSchool?.school_name || currentSchool?.name || "";

  const renderDashboard = () => {
    switch (currentLayout) {
      case "stats":
        return <StatsDashboard />;
      case "tiles":
        return <TilesDashboard />;
      case "compact":
        return <CompactDashboard />;
      case "pillars":
      default:
        return <PillarsDashboard />;
    }
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6 md:mb-10 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-display font-bold text-foreground">
              Welcome back, {displayName}
            </h1>
            <p className="text-muted-foreground mt-1 md:mt-1.5 text-sm md:text-base">
              {[designation, universityName, schoolName].filter(Boolean).join(" • ")}
            </p>
          </div>
          <DashboardLayoutSwitcher
            currentLayout={currentLayout}
            onLayoutChange={setCurrentLayout}
          />
        </div>
      </div>

      {/* Dashboard Content */}
      {renderDashboard()}
    </DashboardLayout>
  );
}
