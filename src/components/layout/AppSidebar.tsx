import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Building2,
  GraduationCap,
  FileText,
  Target,
  Globe,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  Briefcase,
  MapPin,
  Award,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navigation: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Events & Reports",
    items: [
      { title: "Virtual Events", href: "/virtual-events", icon: Calendar, badge: 12 },
      { title: "Meetup Reports", href: "/meetup-reports", icon: Users },
      { title: "Festival Reports", href: "/festival-reports", icon: Briefcase },
      { title: "Campus Tours", href: "/campus-tours", icon: MapPin },
      { title: "In-Country Reports", href: "/in-country-reports", icon: Globe },
    ],
  },
  {
    title: "School Management",
    items: [
      { title: "School Profiles", href: "/school-profiles", icon: Building2 },
      { title: "Profile Leads", href: "/profile-leads", icon: Target, badge: 24 },
      { title: "Lead Generation", href: "/lead-generation", icon: TrendingUp },
    ],
  },
  {
    title: "Scholarships",
    items: [
      { title: "Applicants Data", href: "/scholarship-applicants", icon: GraduationCap },
      { title: "Applicant Profiles", href: "/applicant-profiles", icon: Award },
    ],
  },
  {
    title: "Applications",
    items: [
      { title: "Applications", href: "/applications", icon: FileText, badge: 8 },
      { title: "Admits Tracking", href: "/admits-tracking", icon: UserCheck },
    ],
  },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-200 ease-out",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center justify-between px-3 border-b border-sidebar-border">
        <div className={cn("flex items-center gap-2.5 overflow-hidden", collapsed && "justify-center")}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm flex-shrink-0">
            S
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-display font-semibold text-sm text-sidebar-accent-foreground">SEED Assist</span>
              <span className="text-[10px] text-sidebar-foreground/60 leading-none">Client Portal</span>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent h-7 w-7"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 h-[calc(100vh-7rem)]">
        <nav className="p-2 space-y-4">
          {navigation.map((group, groupIndex) => (
            <div key={group.title} className="space-y-0.5">
              {!collapsed && (
                <h4 className="px-2.5 py-1.5 text-[10px] font-medium text-sidebar-foreground/50 uppercase tracking-wider">
                  {group.title}
                </h4>
              )}
              {group.items.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-colors group relative",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent",
                      collapsed && "justify-center px-0"
                    )}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{item.title}</span>
                        {item.badge && (
                          <span className={cn(
                            "px-1.5 py-0.5 text-[10px] font-semibold rounded-full min-w-[18px] text-center",
                            isActive 
                              ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground" 
                              : "bg-primary/10 text-primary"
                          )}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    {collapsed && item.badge && (
                      <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 flex items-center justify-center text-[9px] font-bold rounded-full bg-primary text-primary-foreground">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-sidebar-border">
        <div className={cn("flex gap-1", collapsed ? "flex-col" : "flex-row")}>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent h-8",
              collapsed ? "w-full justify-center" : "flex-1 justify-start"
            )}
          >
            <Settings className="h-4 w-4" />
            {!collapsed && <span className="ml-2 text-xs">Settings</span>}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-sidebar-foreground/60 hover:text-destructive hover:bg-sidebar-accent h-8",
              collapsed ? "w-full justify-center" : "flex-1 justify-start"
            )}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2 text-xs">Logout</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
}
