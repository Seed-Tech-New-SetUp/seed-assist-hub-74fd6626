import { useState, useEffect, useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Building2,
  GraduationCap,
  ChevronDown,
  LogOut,
  MapPin,
  Video,
  FileText,
  Lock,
  Globe,
  BarChart3,
  Plane,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuth, Permissions } from "@/contexts/AuthContext";
import seedAssistLogoWhite from "@/assets/seed-assist-logo-white.png";
import { SchoolSwitcher } from "./SchoolSwitcher";

interface NavSubItem {
  title: string;
  href: string;
  permissionKey?: string;
  alwaysShow?: boolean;
}

interface NavSubGroup {
  title: string;
  icon?: React.ElementType;
  items: NavSubItem[];
  permissionKey?: string;
}

interface NavItem {
  title: string;
  href?: string;
  icon: React.ElementType;
  badge?: number;
  children?: NavSubGroup[];
  permissionKey?: string;
}

interface MobileSidebarProps {
  onClose: () => void;
}

const baseNavigation: NavItem[] = [
  { 
    title: "Dashboard", 
    href: "/dashboard", 
    icon: LayoutDashboard 
  },
  {
    title: "Engagement",
    icon: Calendar,
    permissionKey: "engagement",
    children: [
      {
        title: "In-Person Events",
        icon: MapPin,
        permissionKey: "inPersonEvents",
        items: [
          { title: "Business School Festivals", href: "/events/in-person/bsf", permissionKey: "bsf" },
          { title: "Campus Tours", href: "/events/in-person/campus-tours", permissionKey: "campusTours" },
        ],
      },
      {
        title: "Virtual Events",
        icon: Video,
        permissionKey: "virtualEvents",
        items: [
          { title: "Masterclass", href: "/events/virtual/masterclass", permissionKey: "masterclasses" },
          { title: "1:1 Profile Evaluation", href: "/events/virtual/meetups", permissionKey: "meetups", alwaysShow: true },
        ],
      },
    ],
  },
  {
    title: "Scholarship Program",
    icon: GraduationCap,
    permissionKey: "scholarshipPortal",
    children: [
      {
        title: "",
        items: [
          { title: "Applicant Pool", href: "/scholarships/applications", permissionKey: "applicantPools" },
        ],
      },
    ],
  },
  {
    title: "School Profile",
    icon: Building2,
    permissionKey: "orgProfile",
    children: [
      {
        title: "",
        items: [
          { title: "School Details", href: "/school-profile/edit" },
          { title: "Academic Programs", href: "/school-profile/programs" },
          { title: "Access Leads", href: "/profile-leads", permissionKey: "accessLeads", alwaysShow: true },
        ],
      },
    ],
  },
  {
    title: "Admissions",
    icon: FileText,
    permissionKey: "admissions",
    children: [
      {
        title: "",
        items: [
          { title: "Application Pipeline", href: "/university-applications/all", permissionKey: "applicationPipeline" },
        ],
      },
    ],
  },
  {
    title: "In-Country Representation",
    href: "/in-country-reports",
    icon: Globe,
    permissionKey: "icr",
  },
  {
    title: "Lead And Application Engagement",
    href: "/lead-analytics",
    icon: BarChart3,
    permissionKey: "leadAndApplicationEngagement",
  },
  {
    title: "AI Visa Tutor",
    href: "/visa-prep",
    icon: Plane,
    permissionKey: "visaPrep",
  },
];

// Helper function to filter navigation based on permissions
const filterNavigation = (navigation: NavItem[], permissions: Permissions | null): NavItem[] => {
  if (!permissions) return navigation;

  return navigation
    .filter((item) => {
      if (!item.permissionKey) return true;
      if (item.permissionKey === "orgProfile") return true;
      const permModule = permissions[item.permissionKey as keyof Permissions];
      if (!permModule || (typeof permModule === 'object' && 'enabled' in permModule && !permModule.enabled)) {
        return false;
      }
      return true;
    })
    .map((item) => {
      if (!item.children) return item;

      const permModule = permissions[item.permissionKey as keyof Permissions];
      const subModules = permModule && typeof permModule === 'object' && 'subModules' in permModule 
        ? permModule.subModules 
        : null;

      const filteredChildren = item.children
        .filter((group) => {
          if (group.permissionKey && subModules) {
            return subModules[group.permissionKey as keyof typeof subModules] !== false;
          }
          return true;
        })
        .map((group) => {
          const filteredItems = group.items.filter((subItem) => {
            if (subItem.alwaysShow) return true;
            if (subItem.permissionKey && subModules) {
              return subModules[subItem.permissionKey as keyof typeof subModules] !== false;
            }
            return true;
          });

          return { ...group, items: filteredItems };
        })
        .filter((group) => group.items.length > 0);

      return { ...item, children: filteredChildren };
    })
    .filter((item) => !item.children || item.children.length > 0);
};

export function MobileSidebar({ onClose }: MobileSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, permissions, selectedSchool } = useAuth();

  const navigation = useMemo(() => filterNavigation(baseNavigation, permissions), [permissions]);

  const findActiveSection = () => {
    for (const item of navigation) {
      if (item.children) {
        for (const group of item.children) {
          if (group.items.some(subItem => location.pathname.startsWith(subItem.href))) {
            return { section: item.title, subSection: group.title };
          }
        }
      }
    }
    return { section: "", subSection: "" };
  };

  const { section: activeSection, subSection: activeSubSection } = findActiveSection();

  const [openSections, setOpenSections] = useState<string[]>(activeSection ? [activeSection] : []);
  const [openSubSections, setOpenSubSections] = useState<string[]>(activeSubSection ? [activeSubSection] : []);

  useEffect(() => {
    if (activeSection && !openSections.includes(activeSection)) {
      setOpenSections([activeSection]);
    }
    if (activeSubSection && !openSubSections.includes(activeSubSection)) {
      setOpenSubSections([activeSubSection]);
    }
  }, [location.pathname]);

  const toggleSection = (title: string) => {
    setOpenSections(prev => prev.includes(title) ? [] : [title]);
  };

  const toggleSubSection = (title: string) => {
    setOpenSubSections(prev => prev.includes(title) ? prev.filter(t => t !== title) : [title]);
  };

  const isPathActive = (href: string) => location.pathname === href;
  const isChildActive = (item: NavItem) => {
    if (item.children) {
      return item.children.some(group => group.items.some(subItem => location.pathname.startsWith(subItem.href)));
    }
    return false;
  };

  const isSubGroupActive = (group: NavSubGroup) => {
    return group.items.some(subItem => location.pathname.startsWith(subItem.href));
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const handleNavigate = (href: string) => {
    navigate(href);
    onClose();
  };

  return (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Header */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-sidebar-border">
        <img 
          src={seedAssistLogoWhite} 
          alt="SEED Assist" 
          className="h-8 w-auto object-contain"
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* School Switcher */}
      {selectedSchool && <SchoolSwitcher />}

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="p-3 space-y-1">
          {navigation.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = openSections.includes(item.title);
            const isActive = item.href ? isPathActive(item.href) : isChildActive(item);

            if (hasChildren) {
              return (
                <Collapsible
                  key={item.title}
                  open={isOpen}
                  onOpenChange={() => toggleSection(item.title)}
                >
                  <CollapsibleTrigger asChild>
                    <button
                      className={cn(
                        "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="flex-1 text-left">{item.title}</span>
                      <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 mt-1">
                    {item.children?.map((group, groupIndex) => {
                      if (group.title) {
                        const isSubOpen = openSubSections.includes(group.title);
                        const subActive = isSubGroupActive(group);
                        
                        return (
                          <Collapsible
                            key={groupIndex}
                            open={isSubOpen}
                            onOpenChange={() => toggleSubSection(group.title)}
                          >
                            <div className="ml-5 pl-3 border-l border-sidebar-border/50">
                              <CollapsibleTrigger asChild>
                                <button
                                  className={cn(
                                    "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                                    subActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
                                  )}
                                >
                                  {group.icon && <group.icon className="h-4 w-4" />}
                                  <span className="flex-1 text-left">{group.title}</span>
                                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isSubOpen && "rotate-180")} />
                                </button>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="space-y-1 mt-1">
                                {group.items.map((subItem) => {
                                  const subItemActive = isPathActive(subItem.href);
                                  const permModule = permissions?.[item.permissionKey as keyof Permissions];
                                  const subModules = permModule && typeof permModule === 'object' && 'subModules' in permModule 
                                    ? permModule.subModules 
                                    : null;
                                  const isLocked = subItem.alwaysShow && subItem.permissionKey && subModules && 
                                    subModules[subItem.permissionKey as keyof typeof subModules] === false;
                                  
                                  if (isLocked) {
                                    return (
                                      <div
                                        key={subItem.href}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-sidebar-foreground/40"
                                      >
                                        <span>{subItem.title}</span>
                                        <Lock className="h-3 w-3" />
                                      </div>
                                    );
                                  }
                                  
                                  return (
                                    <button
                                      key={subItem.href}
                                      onClick={() => handleNavigate(subItem.href)}
                                      className={cn(
                                        "flex items-center w-full px-3 py-2 rounded-lg text-xs transition-colors",
                                        subItemActive
                                          ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
                                      )}
                                    >
                                      {subItem.title}
                                    </button>
                                  );
                                })}
                              </CollapsibleContent>
                            </div>
                          </Collapsible>
                        );
                      }

                      return (
                        <div key={groupIndex} className="ml-5 pl-3 border-l border-sidebar-border/50 space-y-1">
                          {group.items.map((subItem) => {
                            const subActive = isPathActive(subItem.href);
                            let isLocked = false;
                            if (subItem.alwaysShow && subItem.permissionKey) {
                              const permModule = item.permissionKey
                                ? permissions?.[item.permissionKey as keyof Permissions]
                                : null;
                              const subModules = permModule && typeof permModule === 'object' && 'subModules' in permModule 
                                ? permModule.subModules 
                                : null;
                              isLocked = subModules && subModules[subItem.permissionKey as keyof typeof subModules] === false;
                            }

                            if (isLocked) {
                              return (
                                <div
                                  key={subItem.href}
                                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-sidebar-foreground/40"
                                >
                                  <span>{subItem.title}</span>
                                  <Lock className="h-3 w-3" />
                                </div>
                              );
                            }

                            return (
                              <button
                                key={subItem.href}
                                onClick={() => handleNavigate(subItem.href)}
                                className={cn(
                                  "flex items-center w-full px-3 py-2 rounded-lg text-xs transition-colors",
                                  subActive
                                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
                                )}
                              >
                                {subItem.title}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              );
            }

            return (
              <button
                key={item.title}
                onClick={() => handleNavigate(item.href!)}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="leading-tight">{item.title}</span>
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        {/* Legal Links */}
        <div className="flex flex-wrap justify-center gap-x-2 gap-y-0.5 px-1">
          <a 
            href="https://www.seedglobaleducation.com/terms-of-use/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] text-sidebar-foreground/50 hover:text-sidebar-foreground/80 transition-colors"
          >
            Terms
          </a>
          <span className="text-[10px] text-sidebar-foreground/30">•</span>
          <a 
            href="https://www.seedglobaleducation.com/privacy-policy/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] text-sidebar-foreground/50 hover:text-sidebar-foreground/80 transition-colors"
          >
            Privacy
          </a>
          <span className="text-[10px] text-sidebar-foreground/30">•</span>
          <a 
            href="https://www.seedglobaleducation.com/cookie-policy/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] text-sidebar-foreground/50 hover:text-sidebar-foreground/80 transition-colors"
          >
            Cookies
          </a>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full text-sidebar-foreground/60 hover:text-destructive hover:bg-sidebar-accent h-10 justify-start"
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span className="text-sm">Logout</span>
        </Button>
      </div>
    </div>
  );
}