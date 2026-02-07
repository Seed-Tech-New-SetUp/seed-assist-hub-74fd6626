import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useSchool } from "@/contexts/SchoolContext";
import { TilesDashboard } from "@/components/dashboard/TilesDashboard";
import { decodeUTF8 } from "@/lib/utils/decode-utf8";

export default function Dashboard() {
  const { user, selectedSchool } = useAuth();
  const { currentSchool } = useSchool();

  const displayName = (user as any)?.full_name || (user as any)?.user_metadata?.full_name || "User";
  const designation = decodeUTF8(currentSchool?.designation || (user as any)?.designation || "");
  const universityName = decodeUTF8(selectedSchool?.university || "");
  const schoolName = decodeUTF8(selectedSchool?.school_name || currentSchool?.name || "");

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

      {/* Revamp Banner */}
      <div className="mb-6 md:mb-8 animate-fade-in rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 md:p-6">
        <div className="flex items-center gap-3 mb-1.5">
          <span className="inline-flex items-center rounded-full bg-primary/15 px-3 py-0.5 text-xs font-semibold text-primary tracking-wide uppercase">New</span>
          <h2 className="text-base md:text-lg font-display font-bold text-foreground">Introducing SEED Assist 2.0</h2>
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl">
          The next generation of international recruitment — reimagined, rebuilt, and more powerful than ever.
        </p>
      </div>

      {/* Dashboard Content */}
      <TilesDashboard />
    </DashboardLayout>
  );
}
