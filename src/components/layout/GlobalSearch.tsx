import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import {
  Search,
  LayoutDashboard,
  Calendar,
  Building2,
  Video,
  Sparkles,
  Globe,
  BarChart3,
  GraduationCap,
  Users,
  FileText,
  Settings,
  UserCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface SearchItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  category: string;
  keywords?: string[];
}

const searchItems: SearchItem[] = [
  // Navigation
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Go to main dashboard",
    icon: LayoutDashboard,
    href: "/",
    category: "Navigation",
    keywords: ["home", "main", "overview"],
  },
  // Events
  {
    id: "bsf",
    label: "Business School Festivals",
    description: "View BSF reports and events",
    icon: Calendar,
    href: "/events/in-person/bsf",
    category: "Events",
    keywords: ["bsf", "festival", "in-person", "recruitment"],
  },
  {
    id: "campus-tours",
    label: "Campus Tours",
    description: "View campus tour reports",
    icon: Building2,
    href: "/events/in-person/campus-tours",
    category: "Events",
    keywords: ["campus", "tour", "visit", "on-campus"],
  },
  {
    id: "masterclass",
    label: "Virtual Masterclass",
    description: "View masterclass sessions",
    icon: Video,
    href: "/events/virtual/masterclass",
    category: "Events",
    keywords: ["webinar", "online", "virtual", "session"],
  },
  {
    id: "meetups",
    label: "Meetups",
    description: "View meetup events",
    icon: Sparkles,
    href: "/events/virtual/meetups",
    category: "Events",
    keywords: ["1:1", "profile", "evaluation", "meeting"],
  },
  // Analytics
  {
    id: "lead-analytics",
    label: "Lead & Application Engagement",
    description: "Track lead interactions and analytics",
    icon: BarChart3,
    href: "/lead-analytics",
    category: "Analytics",
    keywords: ["leads", "analytics", "lae", "engagement"],
  },
  {
    id: "icr",
    label: "In-Country Representation",
    description: "Regional performance reports",
    icon: Globe,
    href: "/in-country-reports",
    category: "Analytics",
    keywords: ["icr", "regional", "representative", "country"],
  },
  // Scholarships
  {
    id: "scholarships",
    label: "Scholarships Fund",
    description: "Manage scholarship applications",
    icon: GraduationCap,
    href: "/scholarships/applications",
    category: "Scholarships",
    keywords: ["scholarship", "applicants", "awards", "funding"],
  },
  // School Profile
  {
    id: "school-details",
    label: "School Details",
    description: "Edit school information",
    icon: Building2,
    href: "/school-profile/edit",
    category: "School Profile",
    keywords: ["profile", "school", "edit", "settings"],
  },
  {
    id: "programs",
    label: "Academic Programs",
    description: "Manage program portfolio",
    icon: FileText,
    href: "/school-profile/programs",
    category: "School Profile",
    keywords: ["programs", "courses", "academic", "mba"],
  },
  // Team
  {
    id: "team",
    label: "Team Management",
    description: "Manage team members",
    icon: Users,
    href: "/team",
    category: "Settings",
    keywords: ["users", "team", "invite", "members"],
  },
];

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { permissions } = useAuth();

  // Keyboard shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (href: string) => {
    setOpen(false);
    navigate(href);
  };

  // Group items by category
  const groupedItems = searchItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, SearchItem[]>);

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start rounded-lg bg-muted/50 text-sm text-muted-foreground sm:w-64 md:w-80 hover:bg-muted transition-colors"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline-flex">Search across app...</span>
        <span className="inline-flex sm:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="flex items-center border-b border-border px-4 py-3">
          <Search className="mr-3 h-5 w-5 text-muted-foreground" />
          <CommandInput 
            placeholder="Search pages, features, settings..." 
            className="border-0 focus:ring-0 h-auto py-0"
          />
        </div>
        <CommandList className="max-h-[400px] py-2">
          <CommandEmpty className="py-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <Search className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No results found</p>
            </div>
          </CommandEmpty>
          
          {Object.entries(groupedItems).map(([category, items], index) => (
            <div key={category}>
              {index > 0 && <CommandSeparator className="my-2" />}
              <CommandGroup heading={category}>
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={`${item.label} ${item.keywords?.join(" ") || ""}`}
                    onSelect={() => handleSelect(item.href)}
                    className="cursor-pointer rounded-lg mx-2 px-3 py-2.5 gap-3 data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground group transition-colors"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted group-data-[selected=true]:bg-primary-foreground/10">
                      <item.icon className="h-4 w-4 text-foreground/70 group-data-[selected=true]:text-primary-foreground" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-sm">{item.label}</span>
                      {item.description && (
                        <span className="text-xs text-muted-foreground group-data-[selected=true]:text-primary-foreground/70">
                          {item.description}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </div>
          ))}
        </CommandList>
        <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-xs text-muted-foreground bg-muted/30">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">↵</kbd>
              Select
            </span>
          </div>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">esc</kbd>
            Close
          </span>
        </div>
      </CommandDialog>
    </>
  );
}
