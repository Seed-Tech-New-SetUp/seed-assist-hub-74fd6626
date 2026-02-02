import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import {
  Calendar,
  Video,
  GraduationCap,
  Building2,
  Globe,
  BarChart3,
  Lock,
  Plane,
  ChevronRight,
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
  permissionKey?: string;
  parentKey?: string;
  buttons: ModuleButton[];
}

interface CategorySection {
  title: string;
  icon: React.ElementType;
  color: string;
  modules: ModuleItem[];
}

export function CompactDashboard() {
  const navigate = useNavigate();
  const { permissions } = useAuth();

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

  const categories: CategorySection[] = [
    {
      title: "Attract",
      icon: Magnet,
      color: "text-blue-500",
      modules: [
        {
          title: "Business School Festivals",
          icon: Calendar,
          parentKey: "engagement",
          buttons: [{ label: "Reports", href: "/events/in-person/bsf", locked: !isSubModuleEnabled("engagement", "bsf") }],
        },
        {
          title: "Campus Tours",
          icon: Building2,
          parentKey: "engagement",
          buttons: [{ label: "Tours", href: "/events/in-person/campus-tours", locked: !isSubModuleEnabled("engagement", "campusTours") }],
        },
        {
          title: "Virtual Masterclass",
          icon: Video,
          parentKey: "engagement",
          buttons: [{ label: "Sessions", href: "/events/virtual/masterclass", locked: !isSubModuleEnabled("engagement", "masterclasses") }],
        },
        {
          title: "Profile Evaluation",
          icon: Video,
          parentKey: "engagement",
          buttons: [{ label: "Meetups", href: "/events/virtual/meetups", locked: !isSubModuleEnabled("engagement", "meetups") }],
        },
        {
          title: "School Profile",
          icon: Building2,
          permissionKey: "orgProfile",
          buttons: [
            { label: "Details", href: "/school-profile/edit" },
            { label: "Programs", href: "/school-profile/programs" },
            { label: "Leads", href: "/profile-leads", locked: !isSubModuleEnabled("orgProfile", "accessLeads") },
          ],
        },
      ],
    },
    {
      title: "Nurture",
      icon: Heart,
      color: "text-amber-500",
      modules: [
        {
          title: "In-Country Representation",
          icon: Globe,
          permissionKey: "icr",
          buttons: [{ label: "Analytics", href: "/in-country-reports" }],
        },
        {
          title: "Lead & Application Engagement",
          icon: BarChart3,
          permissionKey: "leadAndApplicationEngagement",
          buttons: [{ label: "Analytics", href: "/lead-analytics" }],
        },
      ],
    },
    {
      title: "Convert",
      icon: Target,
      color: "text-emerald-500",
      modules: [
        {
          title: "Scholarship Program",
          icon: GraduationCap,
          permissionKey: "scholarshipPortal",
          buttons: [{ label: "Applicants", href: "/scholarships/applications", locked: !isSubModuleEnabled("scholarshipPortal", "applicantPools") }],
        },
        {
          title: "AI Visa Tutor",
          icon: Plane,
          permissionKey: "visaPrep",
          buttons: [{ label: "Licenses", href: "/visa-prep" }],
        },
      ],
    },
  ];

  const isModuleVisible = (item: ModuleItem): boolean => {
    if (item.permissionKey === "orgProfile") return true;
    if (item.permissionKey) return isModuleEnabled(item.permissionKey);
    if (item.parentKey) return isModuleEnabled(item.parentKey);
    return true;
  };

  const visibleCategories = categories
    .map((cat) => ({
      ...cat,
      modules: cat.modules.filter(isModuleVisible),
    }))
    .filter((cat) => cat.modules.length > 0);

  return (
    <div className="space-y-4 animate-fade-in">
      {visibleCategories.map((category) => (
        <Card key={category.title}>
          <CardHeader className="py-3 px-4 md:px-6">
            <CardTitle className="text-sm font-display flex items-center gap-2">
              <category.icon className={cn("h-4 w-4", category.color)} />
              {category.title}
              <Badge variant="secondary" className="ml-auto text-[10px]">
                {category.modules.length} modules
              </Badge>
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {category.modules.map((module) => (
                <div
                  key={module.title}
                  className="flex items-center gap-3 px-4 md:px-6 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-muted">
                    <module.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="flex-1 text-sm font-medium truncate">{module.title}</span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {module.buttons.map((btn) => (
                      <Button
                        key={btn.label}
                        onClick={() => !btn.locked && navigate(btn.href)}
                        disabled={btn.locked}
                        size="sm"
                        variant={btn.locked ? "ghost" : "outline"}
                        className={cn(
                          "h-7 text-xs px-2.5",
                          btn.locked && "text-muted-foreground"
                        )}
                      >
                        {btn.label}
                        {btn.locked ? (
                          <Lock className="ml-1 h-3 w-3" />
                        ) : (
                          <ChevronRight className="ml-0.5 h-3 w-3" />
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
