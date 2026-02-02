import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSchool } from "@/contexts/SchoolContext";
import {
  Calendar,
  Video,
  GraduationCap,
  Building2,
  Globe,
  BarChart3,
  Lock,
  Plane,
  Magnet,
  Heart,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ModuleButton {
  label: string;
  href: string;
  locked?: boolean;
}

interface ModuleItem {
  title: string;
  icon: React.ElementType;
  description: string;
  permissionKey?: string;
  parentKey?: string;
  buttons: ModuleButton[];
}

interface PillarSection {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  gradient: string;
  borderColor: string;
  iconBg: string;
  modules: ModuleItem[];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, permissions, selectedSchool } = useAuth();
  const { currentSchool } = useSchool();

  // Get user display info
  const displayName = (user as any)?.full_name || (user as any)?.user_metadata?.full_name || "User";
  const designation = currentSchool?.designation || (user as any)?.designation || "";
  const universityName = selectedSchool?.university || "";
  const schoolName = selectedSchool?.school_name || currentSchool?.name || "";

  // Helper to check permissions
  const isModuleEnabled = (key: string): boolean => {
    if (!permissions) return true;
    const module = permissions[key as keyof typeof permissions];
    if (!module) return true;
    if (typeof module === "object" && "enabled" in module) {
      return module.enabled;
    }
    return true;
  };

  const isSubModuleEnabled = (moduleKey: string, subKey: string): boolean => {
    if (!permissions) return true;
    const module = permissions[moduleKey as keyof typeof permissions];
    if (!module || typeof module !== "object") return true;
    if ("subModules" in module && module.subModules) {
      const subModules = module.subModules as Record<string, boolean>;
      return subModules[subKey] !== false;
    }
    return true;
  };

  const isModuleVisible = (item: ModuleItem): boolean => {
    // School Profile is always visible
    if (item.permissionKey === "orgProfile") return true;
    if (item.permissionKey) {
      return isModuleEnabled(item.permissionKey);
    }
    if (item.parentKey) {
      return isModuleEnabled(item.parentKey);
    }
    return true;
  };

  // Define the three pillars with buttons
  const pillars: PillarSection[] = [
    {
      title: "Attract",
      subtitle: "Build awareness & generate interest",
      icon: Magnet,
      gradient: "from-blue-500/10 via-blue-500/5 to-transparent dark:from-blue-500/20 dark:via-blue-500/10",
      borderColor: "border-blue-500/30 hover:border-blue-500/50",
      iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      modules: [
        {
          title: "In-Person Events",
          icon: Calendar,
          description: "Business School Festivals & Campus Tours",
          parentKey: "engagement",
          buttons: [
            { label: "Business School Festivals", href: "/events/in-person/bsf", locked: !isSubModuleEnabled("engagement", "bsf") },
            { label: "Campus Tours", href: "/events/in-person/campus-tours", locked: !isSubModuleEnabled("engagement", "campusTours") },
          ],
        },
        {
          title: "Virtual Events",
          icon: Video,
          description: "Masterclasses & Profile Evaluations",
          parentKey: "engagement",
          buttons: [
            { label: "Masterclass", href: "/events/virtual/masterclass", locked: !isSubModuleEnabled("engagement", "masterclasses") },
            { label: "1:1 Profile Evaluation", href: "/events/virtual/meetups", locked: !isSubModuleEnabled("engagement", "meetups") },
          ],
        },
        {
          title: "School Profile",
          icon: Building2,
          description: "Manage your school's digital presence",
          permissionKey: "orgProfile",
          buttons: [
            { label: "School Details", href: "/school-profile/edit" },
            { label: "Academic Programs", href: "/school-profile/programs" },
            { label: "Access Leads", href: "/profile-leads", locked: !isSubModuleEnabled("orgProfile", "accessLeads") },
          ],
        },
      ],
    },
    {
      title: "Nurture",
      subtitle: "Engage & build relationships",
      icon: Heart,
      gradient: "from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/20 dark:via-amber-500/10",
      borderColor: "border-amber-500/30 hover:border-amber-500/50",
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      modules: [
        {
          title: "In-Country Representation",
          icon: Globe,
          description: "Regional engagement & analytics",
          permissionKey: "icr",
          buttons: [
            { label: "View Analytics", href: "/in-country-reports" },
          ],
        },
        {
          title: "Lead & Application Engagement",
          icon: BarChart3,
          description: "Track and analyze lead interactions",
          permissionKey: "leadAndApplicationEngagement",
          buttons: [
            { label: "View Analytics", href: "/lead-analytics" },
          ],
        },
      ],
    },
    {
      title: "Convert",
      subtitle: "Transform prospects into students",
      icon: Target,
      gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-500/20 dark:via-emerald-500/10",
      borderColor: "border-emerald-500/30 hover:border-emerald-500/50",
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      modules: [
        {
          title: "Scholarship Program",
          icon: GraduationCap,
          description: "Manage scholarship applicant pool",
          permissionKey: "scholarshipPortal",
          buttons: [
            { label: "Applicant Pool", href: "/scholarships/applications", locked: !isSubModuleEnabled("scholarshipPortal", "applicantPools") },
          ],
        },
        {
          title: "AI Visa Tutor",
          icon: Plane,
          description: "License management & student prep",
          permissionKey: "visaPrep",
          buttons: [
            { label: "View Licenses", href: "/visa-prep" },
          ],
        },
      ],
    },
  ];

  // Filter modules based on permissions
  const getVisibleModules = (modules: ModuleItem[]) => {
    return modules.filter(isModuleVisible);
  };

  const handleNavigate = (href: string, locked?: boolean) => {
    if (!locked) {
      navigate(href);
    }
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-10 animate-fade-in">
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          Welcome back, {displayName}
        </h1>
        <p className="text-muted-foreground mt-1.5 text-base">
          {[designation, universityName, schoolName].filter(Boolean).join(" • ")}
        </p>
      </div>

      {/* Three Pillars Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {pillars.map((pillar) => {
          const visibleModules = getVisibleModules(pillar.modules);
          if (visibleModules.length === 0) return null;

          return (
            <div
              key={pillar.title}
              className={cn(
                "relative rounded-2xl border-2 bg-card overflow-hidden transition-all duration-300",
                pillar.borderColor
              )}
            >
              {/* Gradient Background */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-b pointer-events-none",
                pillar.gradient
              )} />

              {/* Content */}
              <div className="relative p-6 lg:p-8">
                {/* Pillar Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={cn(
                    "flex items-center justify-center w-14 h-14 rounded-xl",
                    pillar.iconBg
                  )}>
                    <pillar.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold text-foreground">
                      {pillar.title}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {pillar.subtitle}
                    </p>
                  </div>
                </div>

                {/* Module Cards */}
                <div className="space-y-5">
                  {visibleModules.map((module) => (
                    <div
                      key={module.title}
                      className="bg-card/80 backdrop-blur-sm rounded-xl border border-border p-4"
                    >
                      {/* Module Header */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                          <module.icon className="w-4.5 h-4.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-foreground">
                            {module.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {module.description}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        {module.buttons.map((btn) => (
                          <Button
                            key={btn.label}
                            onClick={() => handleNavigate(btn.href, btn.locked)}
                            disabled={btn.locked}
                            size="sm"
                            className={cn(
                              "h-8 text-xs font-medium transition-all flex-1 min-w-[120px]",
                              btn.locked
                                ? "bg-muted text-muted-foreground cursor-not-allowed border border-border"
                                : "bg-primary hover:bg-primary/90 text-primary-foreground"
                            )}
                            variant={btn.locked ? "outline" : "default"}
                          >
                            {btn.label}
                            {btn.locked && <Lock className="ml-1.5 h-3 w-3" />}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}