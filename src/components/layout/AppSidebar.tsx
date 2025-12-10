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
  ClipboardList,
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
        "fixed left-0 top-0 z-40 h-screen gradient-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        <div className={cn("flex items-center gap-3 overflow-hidden", collapsed && "justify-center")}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-display font-bold text-lg flex-shrink-0">
            S
          </div>
          {!collapsed && (
            <div className="flex flex-col animate-fade-in">
              <span className="font-display font-semibold text-sidebar-foreground">SEED Assist</span>
              <span className="text-xs text-sidebar-foreground/60">Client Portal</span>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 h-[calc(100vh-8rem)]">
        <nav className="p-3 space-y-6">
          {navigation.map((group, groupIndex) => (
            <div key={group.title} className="space-y-1">
              {!collapsed && (
                <h4 
                  className="px-3 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-2 animate-fade-in"
                  style={{ animationDelay: `${groupIndex * 50}ms` }}
                >
                  {group.title}
                </h4>
              )}
              {group.items.map((item, itemIndex) => {
                const isActive = location.pathname === item.href;
                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft"
                        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                      collapsed && "justify-center px-0"
                    )}
                    style={{ animationDelay: `${(groupIndex * 50) + (itemIndex * 30)}ms` }}
                  >
                    <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "animate-scale-in")} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{item.title}</span>
                        {item.badge && (
                          <span className={cn(
                            "px-2 py-0.5 text-xs font-medium rounded-full",
                            isActive 
                              ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground" 
                              : "bg-accent text-accent-foreground"
                          )}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    {collapsed && item.badge && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center text-[10px] font-bold rounded-full bg-accent text-accent-foreground">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
              {groupIndex < navigation.length - 1 && !collapsed && (
                <Separator className="mt-4 bg-sidebar-border/50" />
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-sidebar-border">
        <div className={cn("flex gap-2", collapsed ? "flex-col" : "flex-row")}>
          <Button
            variant="ghost"
            size={collapsed ? "icon-sm" : "sm"}
            className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent flex-1 justify-start"
          >
            <Settings className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Settings</span>}
          </Button>
          <Button
            variant="ghost"
            size={collapsed ? "icon-sm" : "sm"}
            className="text-sidebar-foreground/70 hover:text-destructive hover:bg-sidebar-accent flex-1 justify-start"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
}
