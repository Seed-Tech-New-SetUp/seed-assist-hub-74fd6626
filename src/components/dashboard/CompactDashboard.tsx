import { useNavigate } from "react-router-dom";
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
  ArrowUpRight,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ModuleItem {
  title: string;
  icon: React.ElementType;
  permissionKey?: string;
  parentKey?: string;
  href: string;
  locked?: boolean;
  color: string;
  bgColor: string;
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

  const modules: ModuleItem[] = [
    {
      title: "BSF Reports",
      icon: Calendar,
      parentKey: "engagement",
      href: "/events/in-person/bsf",
      locked: !isSubModuleEnabled("engagement", "bsf"),
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10 group-hover:bg-blue-500/20",
    },
    {
      title: "Campus Tours",
      icon: Users,
      parentKey: "engagement",
      href: "/events/in-person/campus-tours",
      locked: !isSubModuleEnabled("engagement", "campusTours"),
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-500/10 group-hover:bg-indigo-500/20",
    },
    {
      title: "Masterclass",
      icon: Video,
      parentKey: "engagement",
      href: "/events/virtual/masterclass",
      locked: !isSubModuleEnabled("engagement", "masterclasses"),
      color: "text-violet-600 dark:text-violet-400",
      bgColor: "bg-violet-500/10 group-hover:bg-violet-500/20",
    },
    {
      title: "Profile Eval",
      icon: Sparkles,
      parentKey: "engagement",
      href: "/events/virtual/meetups",
      locked: !isSubModuleEnabled("engagement", "meetups"),
      color: "text-pink-600 dark:text-pink-400",
      bgColor: "bg-pink-500/10 group-hover:bg-pink-500/20",
    },
    {
      title: "School Profile",
      icon: Building2,
      permissionKey: "orgProfile",
      href: "/school-profile/edit",
      color: "text-slate-600 dark:text-slate-400",
      bgColor: "bg-slate-500/10 group-hover:bg-slate-500/20",
    },
    {
      title: "Programs",
      icon: GraduationCap,
      permissionKey: "orgProfile",
      href: "/school-profile/programs",
      color: "text-cyan-600 dark:text-cyan-400",
      bgColor: "bg-cyan-500/10 group-hover:bg-cyan-500/20",
    },
    {
      title: "ICR Reports",
      icon: Globe,
      permissionKey: "icr",
      href: "/in-country-reports",
      color: "text-teal-600 dark:text-teal-400",
      bgColor: "bg-teal-500/10 group-hover:bg-teal-500/20",
    },
    {
      title: "Lead Analytics",
      icon: BarChart3,
      permissionKey: "leadAndApplicationEngagement",
      href: "/lead-analytics",
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-500/10 group-hover:bg-amber-500/20",
    },
    {
      title: "Scholarships",
      icon: GraduationCap,
      permissionKey: "scholarshipPortal",
      href: "/scholarships/applications",
      locked: !isSubModuleEnabled("scholarshipPortal", "applicantPools"),
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
    },
    {
      title: "Visa Tutor",
      icon: Plane,
      permissionKey: "visaPrep",
      href: "/visa-prep",
      color: "text-rose-600 dark:text-rose-400",
      bgColor: "bg-rose-500/10 group-hover:bg-rose-500/20",
    },
  ];

  const isModuleVisible = (item: ModuleItem): boolean => {
    if (item.permissionKey === "orgProfile") return true;
    if (item.permissionKey) return isModuleEnabled(item.permissionKey);
    if (item.parentKey) return isModuleEnabled(item.parentKey);
    return true;
  };

  const visibleModules = modules.filter(isModuleVisible);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 animate-fade-in">
      {visibleModules.map((module) => (
        <div
          key={module.title}
          className={cn(
            "group relative aspect-square rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 cursor-pointer",
            module.locked 
              ? "opacity-50 cursor-not-allowed" 
              : "hover:shadow-lg hover:border-primary/30 hover:scale-[1.02]"
          )}
          onClick={() => !module.locked && navigate(module.href)}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            {/* Icon Container */}
            <div className={cn(
              "w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-colors mb-3",
              module.bgColor
            )}>
              <module.icon className={cn("h-7 w-7 md:h-8 md:w-8", module.color)} />
            </div>
            
            {/* Title */}
            <span className={cn(
              "text-sm md:text-base font-semibold text-foreground transition-colors",
              !module.locked && "group-hover:text-primary"
            )}>
              {module.title}
            </span>

            {/* Lock or Arrow */}
            {module.locked ? (
              <Lock className="absolute top-3 right-3 h-4 w-4 text-muted-foreground" />
            ) : (
              <ArrowUpRight className="absolute top-3 right-3 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
