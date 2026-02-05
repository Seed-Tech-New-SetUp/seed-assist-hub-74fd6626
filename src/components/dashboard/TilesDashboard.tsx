import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  gradient: string;
  iconBg: string;
  tag?: string;
}

export function TilesDashboard() {
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
      description: "Connect with prospective students at recruitment fairs at major cities across the globe",
      parentKey: "engagement",
      gradient: "from-blue-500/20 via-blue-500/5 to-transparent",
      iconBg: "bg-blue-500 text-white",
      buttons: [
        { label: "View Reports", href: "/events/in-person/bsf", locked: !isSubModuleEnabled("engagement", "bsf") },
      ],
    },
    {
      title: "Campus Tours",
      icon: Building2,
      description: "Connect with prospective students at campus events in top tier institutions globally",
      parentKey: "engagement",
      gradient: "from-indigo-500/20 via-indigo-500/5 to-transparent",
      iconBg: "bg-indigo-500 text-white",
      buttons: [
        { label: "View Tours", href: "/events/in-person/campus-tours", locked: !isSubModuleEnabled("engagement", "campusTours") },
      ],
    },
    {
      title: "Virtual Masterclass",
      icon: Video,
      description: "Engage students globally through interactive online sessions and webinars",
      parentKey: "engagement",
      gradient: "from-violet-500/20 via-violet-500/5 to-transparent",
      iconBg: "bg-violet-500 text-white",
      tag: "Virtual",
      buttons: [
        { label: "View Sessions", href: "/events/virtual/masterclass", locked: !isSubModuleEnabled("engagement", "masterclasses") },
      ],
    },
    {
      title: "Meetups",
      icon: Sparkles,
      description: "Connect with prospective candidates in a focused small group meeting and evaluate for upcoming intakes",
      parentKey: "engagement",
      gradient: "from-pink-500/20 via-pink-500/5 to-transparent",
      iconBg: "bg-pink-500 text-white",
      tag: "Virtual",
      buttons: [
        { label: "View Meetups", href: "/events/virtual/meetups", locked: !isSubModuleEnabled("engagement", "meetups") },
      ],
    },
    {
      title: "School Profile",
      icon: Building2,
      description: "Manage your school's digital presence and academic program listings",
      permissionKey: "orgProfile",
      gradient: "from-slate-500/20 via-slate-500/5 to-transparent",
      iconBg: "bg-slate-600 text-white",
      buttons: [
        { label: "Edit Profile", href: "/school-profile/edit" },
        { label: "Programs", href: "/school-profile/programs" },
      ],
    },
    {
      title: "Lead & Application Engagement",
      icon: BarChart3,
      description: "Track and analyze lead interactions with comprehensive analytics dashboard",
      permissionKey: "leadAndApplicationEngagement",
      gradient: "from-amber-500/20 via-amber-500/5 to-transparent",
      iconBg: "bg-amber-500 text-white",
      tag: "Analytics",
      buttons: [
        { label: "View Analytics", href: "/lead-analytics" },
      ],
    },
    {
      title: "In-Country Representation",
      icon: Globe,
      description: "Monitor regional engagement and performance across different markets",
      permissionKey: "icr",
      gradient: "from-teal-500/20 via-teal-500/5 to-transparent",
      iconBg: "bg-teal-500 text-white",
      tag: "Analytics",
      buttons: [
        { label: "View Reports", href: "/in-country-reports" },
      ],
    },
    {
      title: "Scholarships Fund",
      icon: GraduationCap,
      description: "Manage and evaluate scholarship applications from qualified candidates",
      permissionKey: "scholarshipPortal",
      gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
      iconBg: "bg-emerald-500 text-white",
      tag: "Admissions",
      buttons: [
        { label: "Applicant Pool", href: "/scholarships/applications", locked: !isSubModuleEnabled("scholarshipPortal", "applicantPools") },
      ],
    },
    // TODO: Re-enable AI Visa Tutor when ready
    // {
    //   title: "AI Visa Tutor",
    //   icon: Plane,
    //   description: "AI-powered visa preparation assistance for admitted students",
    //   permissionKey: "visaPrep",
    //   gradient: "from-rose-500/20 via-rose-500/5 to-transparent",
    //   iconBg: "bg-rose-500 text-white",
    //   tag: "AI",
    //   buttons: [
    //     { label: "View Licenses", href: "/visa-prep" },
    //   ],
    // },
  ];

  const isModuleVisible = (item: ModuleItem): boolean => {
    if (item.permissionKey === "orgProfile") return true;
    if (item.permissionKey) return isModuleEnabled(item.permissionKey);
    if (item.parentKey) return isModuleEnabled(item.parentKey);
    return true;
  };

  const visibleModules = modules.filter(isModuleVisible);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 animate-fade-in">
      {visibleModules.map((module) => (
        <div
          key={module.title}
          className={cn(
            "relative group rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30"
          )}
        >
          {/* Gradient Background */}
          <div className={cn("absolute inset-0 bg-gradient-to-br pointer-events-none opacity-60", module.gradient)} />
          
          <div className="relative p-5 md:p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className={cn("p-3 rounded-xl", module.iconBg)}>
                <module.icon className="h-5 w-5" />
              </div>
              {module.tag && (
                <Badge variant="secondary" className="text-[10px] font-medium">
                  {module.tag}
                </Badge>
              )}
            </div>

            {/* Content */}
            <h3 className="text-lg font-display font-semibold text-foreground mb-2">
              {module.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-5 line-clamp-2">
              {module.description}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {module.buttons.map((btn) => (
                <Button
                  key={btn.label}
                  onClick={() => !btn.locked && navigate(btn.href)}
                  disabled={btn.locked}
                  size="sm"
                  className={cn(
                    "h-9 text-xs font-medium transition-all group/btn",
                    btn.locked
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-primary hover:bg-primary/90"
                  )}
                  variant={btn.locked ? "outline" : "default"}
                >
                  {btn.label}
                  {btn.locked ? (
                    <Lock className="ml-1.5 h-3 w-3" />
                  ) : (
                    <ArrowRight className="ml-1.5 h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
