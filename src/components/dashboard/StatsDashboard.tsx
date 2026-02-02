import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
  ArrowRight,
  Sparkles,
  Users,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ModuleItem {
  title: string;
  icon: React.ElementType;
  description: string;
  permissionKey?: string;
  parentKey?: string;
  href: string;
  locked?: boolean;
  size: "large" | "medium" | "small";
  accent: string;
  stat?: { value: string; label: string };
}

export function StatsDashboard() {
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

  const modules: ModuleItem[] = [
    {
      title: "Business School Festivals",
      icon: Calendar,
      description: "In-person events across major cities",
      parentKey: "engagement",
      href: "/events/in-person/bsf",
      locked: !isSubModuleEnabled("engagement", "bsf"),
      size: "large",
      accent: "from-blue-500 to-blue-600",
      stat: { value: "12", label: "Events" },
    },
    {
      title: "Virtual Masterclass",
      icon: Video,
      description: "Online sessions & webinars",
      parentKey: "engagement",
      href: "/events/virtual/masterclass",
      locked: !isSubModuleEnabled("engagement", "masterclasses"),
      size: "medium",
      accent: "from-violet-500 to-violet-600",
      stat: { value: "8", label: "Sessions" },
    },
    {
      title: "Lead Analytics",
      icon: BarChart3,
      description: "Track lead engagement",
      permissionKey: "leadAndApplicationEngagement",
      href: "/lead-analytics",
      size: "medium",
      accent: "from-amber-500 to-amber-600",
      stat: { value: "1.2K", label: "Leads" },
    },
    {
      title: "School Profile",
      icon: Building2,
      description: "Manage your digital presence",
      permissionKey: "orgProfile",
      href: "/school-profile/edit",
      size: "small",
      accent: "from-slate-500 to-slate-600",
    },
    {
      title: "Campus Tours",
      icon: Users,
      description: "Guided campus visits",
      parentKey: "engagement",
      href: "/events/in-person/campus-tours",
      locked: !isSubModuleEnabled("engagement", "campusTours"),
      size: "small",
      accent: "from-indigo-500 to-indigo-600",
    },
    {
      title: "Profile Evaluation",
      icon: Sparkles,
      description: "1:1 virtual meetings",
      parentKey: "engagement",
      href: "/events/virtual/meetups",
      locked: !isSubModuleEnabled("engagement", "meetups"),
      size: "small",
      accent: "from-pink-500 to-pink-600",
    },
    {
      title: "Scholarship Program",
      icon: GraduationCap,
      description: "Manage applicant pool",
      permissionKey: "scholarshipPortal",
      href: "/scholarships/applications",
      locked: !isSubModuleEnabled("scholarshipPortal", "applicantPools"),
      size: "large",
      accent: "from-emerald-500 to-emerald-600",
      stat: { value: "156", label: "Applicants" },
    },
    {
      title: "ICR Reports",
      icon: Globe,
      description: "Regional engagement",
      permissionKey: "icr",
      href: "/in-country-reports",
      size: "medium",
      accent: "from-teal-500 to-teal-600",
    },
    {
      title: "AI Visa Tutor",
      icon: Plane,
      description: "License management",
      permissionKey: "visaPrep",
      href: "/visa-prep",
      size: "medium",
      accent: "from-rose-500 to-rose-600",
    },
  ];

  const isModuleVisible = (item: ModuleItem): boolean => {
    if (item.permissionKey === "orgProfile") return true;
    if (item.permissionKey) return isModuleEnabled(item.permissionKey);
    if (item.parentKey) return isModuleEnabled(item.parentKey);
    return true;
  };

  const visibleModules = modules.filter(isModuleVisible);

  const getCardClasses = (size: string) => {
    switch (size) {
      case "large":
        return "md:col-span-2 md:row-span-2";
      case "medium":
        return "md:col-span-1 md:row-span-2";
      default:
        return "md:col-span-1 md:row-span-1";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[minmax(120px,auto)] gap-3 md:gap-4 animate-fade-in">
      {visibleModules.map((module) => (
        <div
          key={module.title}
          className={cn(
            "group relative rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/30 cursor-pointer",
            getCardClasses(module.size),
            module.locked && "opacity-60 cursor-not-allowed"
          )}
          onClick={() => !module.locked && navigate(module.href)}
        >
          {/* Gradient accent bar */}
          <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r", module.accent)} />
          
          <div className="relative h-full p-4 md:p-5 flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className={cn(
                "p-2.5 md:p-3 rounded-xl bg-gradient-to-br text-white shadow-lg",
                module.accent
              )}>
                <module.icon className={cn(
                  module.size === "large" ? "h-6 w-6" : "h-5 w-5"
                )} />
              </div>
              {module.locked && <Lock className="h-4 w-4 text-muted-foreground" />}
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className={cn(
                "font-display font-semibold text-foreground mb-1",
                module.size === "large" ? "text-lg md:text-xl" : "text-sm md:text-base"
              )}>
                {module.title}
              </h3>
              <p className={cn(
                "text-muted-foreground",
                module.size === "large" ? "text-sm" : "text-xs",
                module.size === "small" && "line-clamp-1"
              )}>
                {module.description}
              </p>
            </div>

            {/* Stat (for large/medium cards) */}
            {module.stat && module.size !== "small" && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-end gap-2">
                  <span className={cn(
                    "font-display font-bold text-foreground",
                    module.size === "large" ? "text-3xl md:text-4xl" : "text-2xl"
                  )}>
                    {module.stat.value}
                  </span>
                  <span className="text-xs text-muted-foreground mb-1">{module.stat.label}</span>
                  <TrendingUp className="h-4 w-4 text-emerald-500 ml-auto mb-1" />
                </div>
              </div>
            )}

            {/* Hover arrow */}
            {!module.locked && (
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="h-5 w-5 text-primary" />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
