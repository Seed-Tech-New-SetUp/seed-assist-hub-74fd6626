import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useSchool } from "@/contexts/SchoolContext";
import { TilesDashboard } from "@/components/dashboard/TilesDashboard";

export default function Dashboard() {
  const { user, selectedSchool } = useAuth();
  const { currentSchool } = useSchool();

  const displayName = (user as any)?.full_name || (user as any)?.user_metadata?.full_name || "User";
  const designation = currentSchool?.designation || (user as any)?.designation || "";
  const universityName = selectedSchool?.university || "";
  const schoolName = selectedSchool?.school_name || currentSchool?.name || "";

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6 md:mb-10 animate-fade-in">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-display font-bold text-foreground">
          Welcome back, {displayName}
        </h1>
        <p className="text-muted-foreground mt-1 md:mt-1.5 text-sm md:text-base">
          {[designation, universityName, schoolName].filter(Boolean).join(" • ")}
        </p>
      </div>

      {/* Dashboard Content */}
      <TilesDashboard />
    </DashboardLayout>
  );
}
