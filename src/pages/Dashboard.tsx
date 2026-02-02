import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSchool } from "@/contexts/SchoolContext";
import {
  Calendar,
  Video,
  GraduationCap,
  Building2,
  FileText,
  Globe,
  BarChart3,
  Lock,
  Plane,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ModuleButton {
  label: string;
  href: string;
  locked?: boolean;
}

interface ModuleCard {
  title: string;
  icon: React.ElementType;
  buttons: ModuleButton[];
  permissionKey?: string;
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

  // Define module cards - names match sidebar exactly
  const moduleCards: ModuleCard[] = [
    {
      title: "In-Person Events",
      icon: Calendar,
      permissionKey: "engagement",
      buttons: [
        {
          label: "Business School Festivals",
          href: "/events/in-person/bsf",
          locked: !isSubModuleEnabled("engagement", "bsf"),
        },
        {
          label: "Campus Tours",
          href: "/events/in-person/campus-tours",
          locked: !isSubModuleEnabled("engagement", "campusTours"),
        },
      ],
    },
    {
      title: "Virtual Events",
      icon: Video,
      permissionKey: "engagement",
      buttons: [
        {
          label: "Masterclass",
          href: "/events/virtual/masterclass",
          locked: !isSubModuleEnabled("engagement", "masterclasses"),
        },
        {
          label: "1:1 Profile Evaluation",
          href: "/events/virtual/meetups",
          locked: !isSubModuleEnabled("engagement", "meetups"),
        },
      ],
    },
    {
      title: "Scholarship Program",
      icon: GraduationCap,
      permissionKey: "scholarshipPortal",
      buttons: [
        {
          label: "Applicant Pool",
          href: "/scholarships/applications",
          locked: !isSubModuleEnabled("scholarshipPortal", "applicantPools"),
        },
        // { label: "Insights", href: "/scholarships/analytics" }, // Hidden for now
      ],
    },
    {
      title: "Organisation Profile",
      icon: Building2,
      permissionKey: "orgProfile",
      buttons: [
        {
          label: "Organisation Details",
          href: "/school-profile/edit",
        },
        {
          label: "Academic Programs",
          href: "/school-profile/programs",
        },
        {
          label: "Access Leads",
          href: "/profile-leads",
          locked: !isSubModuleEnabled("orgProfile", "accessLeads"),
        },
      ],
    },
    {
      title: "Admissions",
      icon: FileText,
      permissionKey: "admissions",
      buttons: [
        {
          label: "Application Pipeline",
          href: "/university-applications/all",
          locked: !isSubModuleEnabled("admissions", "applicationPipeline"),
        },
      ],
    },
    {
      title: "In-Country Representation",
      icon: Globe,
      permissionKey: "icr",
      buttons: [
        {
          label: "View Analytics",
          href: "/in-country-reports",
        },
      ],
    },
    {
      title: "Lead And Application Engagement",
      icon: BarChart3,
      permissionKey: "leadAndApplicationEngagement",
      buttons: [
        {
          label: "View Analytics",
          href: "/lead-analytics",
        },
      ],
    },
    {
      title: "AI Visa Tutor",
      icon: Plane,
      permissionKey: "visaPrep",
      buttons: [
        {
          label: "View Licenses",
          href: "/visa-prep",
        },
      ],
    },
  ];

  // Filter cards based on permissions
  const visibleCards = moduleCards.filter((card) => {
    if (!card.permissionKey) return true;
    // Organisation Profile is always visible
    if (card.permissionKey === "orgProfile") return true;
    return isModuleEnabled(card.permissionKey);
  });

  const handleNavigate = (href: string, locked?: boolean) => {
    if (!locked) {
      navigate(href);
    }
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl lg:text-3xl font-semibold text-[#1a365d] dark:text-foreground">
          Welcome, {displayName}
        </h1>
        <p className="text-muted-foreground mt-1">
          {[designation, universityName, schoolName].filter(Boolean).join(" | ")}
        </p>
        <div className="mt-4 border-b border-border" />
      </div>

      {/* Module Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {visibleCards.map((card) => (
          <Card
            key={card.title}
            className="border-border shadow-sm hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                <card.icon className="h-5 w-5 text-muted-foreground" />
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-3">
                {card.buttons.map((btn) => (
                  <Button
                    key={btn.label}
                    onClick={() => handleNavigate(btn.href, btn.locked)}
                    disabled={btn.locked}
                    className={cn(
                      "flex-1 min-w-[140px] h-10 text-sm font-medium transition-all",
                      btn.locked
                        ? "bg-muted text-muted-foreground cursor-not-allowed border border-border"
                        : "bg-[#e07830] hover:bg-[#c96828] text-white"
                    )}
                    variant={btn.locked ? "outline" : "default"}
                  >
                    {btn.label}
                    {btn.locked && <Lock className="ml-2 h-3.5 w-3.5" />}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
