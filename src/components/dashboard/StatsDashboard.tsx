import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import {
  Calendar,
  Video,
  GraduationCap,
  Building2,
  Globe,
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Activity,
  ArrowUpRight,
  Clock,
  Plane,
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
  color: string;
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

  // Stats cards data
  const statsCards = [
    { label: "Total Events", value: "24", change: "+12%", icon: Calendar, color: "text-blue-500" },
    { label: "Leads Generated", value: "1,842", change: "+8%", icon: Users, color: "text-emerald-500" },
    { label: "Conversion Rate", value: "23%", change: "+5%", icon: Target, color: "text-amber-500" },
    { label: "Active Students", value: "156", change: "+18%", icon: GraduationCap, color: "text-purple-500" },
  ];

  // Quick access modules
  const modules: ModuleItem[] = [
    {
      title: "Business School Festivals",
      icon: Calendar,
      description: "In-person events & reports",
      parentKey: "engagement",
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      buttons: [{ label: "View Reports", href: "/events/in-person/bsf", locked: !isSubModuleEnabled("engagement", "bsf") }],
    },
    {
      title: "Virtual Masterclass",
      icon: Video,
      description: "Online sessions & analytics",
      parentKey: "engagement",
      color: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
      buttons: [{ label: "View Sessions", href: "/events/virtual/masterclass", locked: !isSubModuleEnabled("engagement", "masterclasses") }],
    },
    {
      title: "School Profile",
      icon: Building2,
      description: "Manage your presence",
      permissionKey: "orgProfile",
      color: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
      buttons: [{ label: "Edit Profile", href: "/school-profile/edit" }],
    },
    {
      title: "Lead Analytics",
      icon: BarChart3,
      description: "Track & analyze leads",
      permissionKey: "leadAndApplicationEngagement",
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      buttons: [{ label: "View Analytics", href: "/lead-analytics" }],
    },
    {
      title: "ICR Reports",
      icon: Globe,
      description: "Regional engagement",
      permissionKey: "icr",
      color: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
      buttons: [{ label: "View Reports", href: "/in-country-reports" }],
    },
    {
      title: "Scholarship Program",
      icon: GraduationCap,
      description: "Manage applicants",
      permissionKey: "scholarshipPortal",
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      buttons: [{ label: "Applicant Pool", href: "/scholarships/applications", locked: !isSubModuleEnabled("scholarshipPortal", "applicantPools") }],
    },
    {
      title: "AI Visa Tutor",
      icon: Plane,
      description: "License management",
      permissionKey: "visaPrep",
      color: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      buttons: [{ label: "View Licenses", href: "/visa-prep" }],
    },
  ];

  const isModuleVisible = (item: ModuleItem): boolean => {
    if (item.permissionKey === "orgProfile") return true;
    if (item.permissionKey) return isModuleEnabled(item.permissionKey);
    if (item.parentKey) return isModuleEnabled(item.parentKey);
    return true;
  };

  const visibleModules = modules.filter(isModuleVisible);

  // Activity items (mock data)
  const recentActivity = [
    { action: "New registration", detail: "BSF Mumbai 2025", time: "2 hours ago", icon: Users },
    { action: "Report generated", detail: "Q4 Lead Analytics", time: "5 hours ago", icon: BarChart3 },
    { action: "Profile updated", detail: "Academic Programs", time: "1 day ago", icon: Building2 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statsCards.map((stat) => (
          <Card key={stat.label} className="relative overflow-hidden">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xl md:text-3xl font-bold mt-1 font-display">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{stat.change}</span>
                  </div>
                </div>
                <div className={cn("p-2 md:p-3 rounded-xl bg-primary/10", stat.color)}>
                  <stat.icon className="h-4 w-4 md:h-5 md:w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Quick Access Modules */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display">Quick Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {visibleModules.map((module) => (
                  <div
                    key={module.title}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50 hover:bg-muted/50 transition-colors group"
                  >
                    <div className={cn("p-2.5 rounded-lg flex-shrink-0", module.color)}>
                      <module.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{module.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{module.description}</p>
                    </div>
                    {module.buttons[0] && !module.buttons[0].locked && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => navigate(module.buttons[0].href)}
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <div>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.action}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                      <Clock className="h-3 w-3" />
                      {item.time}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-display">Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Event Attendance</span>
                <span className="font-medium">78%</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Lead Conversion</span>
                <span className="font-medium">45%</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Profile Completion</span>
                <span className="font-medium">92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
