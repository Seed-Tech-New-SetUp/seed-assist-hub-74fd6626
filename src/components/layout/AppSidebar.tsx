import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Building2,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  Settings,
  MapPin,
  BarChart3,
  Video,
  FileText,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuth } from "@/contexts/AuthContext";

interface NavSubItem {
  title: string;
  href: string;
}

interface NavItem {
  title: string;
  href?: string;
  icon: React.ElementType;
  badge?: number;
  children?: {
    title: string;
    items: NavSubItem[];
  }[];
}

const navigation: NavItem[] = [
  { 
    title: "Dashboard", 
    href: "/dashboard", 
    icon: LayoutDashboard 
  },
  {
    title: "Events",
    icon: Calendar,
    children: [
      {
        title: "In Person",
        items: [
          { title: "Reports", href: "/events/in-person/reports" },
          { title: "Upcoming Events", href: "/events/in-person/upcoming" },
        ],
      },
      {
        title: "Virtual",
        items: [
          { title: "Masterclass Reports", href: "/events/virtual/masterclass" },
          { title: "MeetUps Reports", href: "/events/virtual/meetups" },
        ],
      },
    ],
  },
  {
    title: "Scholarships",
    icon: GraduationCap,
    children: [
      {
        title: "",
        items: [
          { title: "Applications", href: "/scholarships/applications" },
        ],
      },
    ],
  },
  { 
    title: "Analytics", 
    href: "/analytics", 
    icon: BarChart3 
  },
  {
    title: "School Profile",
    icon: Building2,
    children: [
      {
        title: "",
        items: [
          { title: "Edit Information", href: "/school-profile/edit" },
        ],
      },
    ],
  },
  {
    title: "User Management",
    href: "/user-management",
    icon: Users,
  },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(["Events", "Scholarships", "School Profile"]);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const toggleSection = (title: string) => {
    setOpenSections(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const isPathActive = (href: string) => location.pathname === href;
  const isChildActive = (item: NavItem) => {
    if (item.children) {
      return item.children.some(group =>
        group.items.some(subItem => location.pathname.startsWith(subItem.href))
      );
    }
    return false;
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-200 ease-out",
        collapsed ? "w-16" : "w-64"
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
        <nav className="p-2 space-y-1">
          {navigation.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = openSections.includes(item.title);
            const isActive = item.href ? isPathActive(item.href) : isChildActive(item);

            if (hasChildren) {
              return (
                <Collapsible
                  key={item.title}
                  open={!collapsed && isOpen}
                  onOpenChange={() => toggleSection(item.title)}
                >
                  <CollapsibleTrigger asChild>
                    <button
                      className={cn(
                        "flex items-center gap-2.5 w-full px-2.5 py-2 rounded-md text-[13px] font-medium transition-colors group",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent",
                        collapsed && "justify-center px-0"
                      )}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left truncate">{item.title}</span>
                          <ChevronDown
                            className={cn(
                              "h-3.5 w-3.5 transition-transform",
                              isOpen && "rotate-180"
                            )}
                          />
                        </>
                      )}
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-0.5">
                    {item.children?.map((group, groupIndex) => (
                      <div key={groupIndex} className="ml-4 pl-2 border-l border-sidebar-border/50 space-y-0.5 mt-1">
                        {group.title && (
                          <span className="block px-2 py-1 text-[10px] font-medium text-sidebar-foreground/50 uppercase tracking-wider">
                            {group.title}
                          </span>
                        )}
                        {group.items.map((subItem) => {
                          const subActive = isPathActive(subItem.href);
                          return (
                            <NavLink
                              key={subItem.href}
                              to={subItem.href}
                              className={cn(
                                "flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] transition-colors",
                                subActive
                                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                                  : "text-sidebar-foreground/80 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
                              )}
                            >
                              <span className="truncate">{subItem.title}</span>
                            </NavLink>
                          );
                        })}
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              );
            }

            return (
              <NavLink
                key={item.href}
                to={item.href!}
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
            onClick={handleLogout}
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
