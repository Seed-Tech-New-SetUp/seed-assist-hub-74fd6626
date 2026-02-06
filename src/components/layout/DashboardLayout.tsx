import { useNavigate, useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { GlobalSearch } from "./GlobalSearch";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { LogOut, ChevronDown, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSchool } from "@/contexts/SchoolContext";
import { useSidebarState } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";
import { MobileSidebar } from "./MobileSidebar";
import { useEffect } from "react";
import { decodeUTF8 } from "@/lib/utils/decode-utf8";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth();
  const { schools, currentSchool } = useSchool();
  const { collapsed, isMobile, mobileOpen, setMobileOpen } = useSidebarState();
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, setMobileOpen]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const getInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.slice(0, 2).toUpperCase() || "U";
  };

  const getDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  };

  const getDesignation = () => {
    return decodeUTF8(currentSchool?.designation || "");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      {!isMobile && <AppSidebar />}
      
      {/* Mobile Sidebar Sheet */}
      {isMobile && (
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0 w-[280px] bg-sidebar border-sidebar-border">
            <MobileSidebar onClose={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      )}
      
      <div className={cn(
        "transition-all duration-200",
        isMobile ? "pl-0" : (collapsed ? "pl-16" : "pl-72")
      )}>
        <header className="sticky top-0 z-30 h-14 md:h-16 bg-card/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between h-full px-4 md:px-6">
            {/* Mobile Menu Button */}
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}

            {/* Global Search Bar */}
            <div className="flex-1 flex justify-center max-w-2xl mx-4">
              <GlobalSearch />
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2 h-9 md:h-10">
                    <Avatar className="h-7 w-7 md:h-8 md:w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-sm font-medium">{getDisplayName()}</span>
                      <span className="text-[10px] text-muted-foreground leading-none">
                        {user?.email}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-popover">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
                      {getDesignation() && (
                        <p className="text-xs text-muted-foreground capitalize">{getDesignation()}</p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6 min-h-[calc(100vh-3.5rem)] md:min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}