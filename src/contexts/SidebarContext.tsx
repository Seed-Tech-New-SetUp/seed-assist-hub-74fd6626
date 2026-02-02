import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const MOBILE_BREAKPOINT = 768;

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  isMobile: boolean;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  toggleMobileOpen: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (isMobile) {
      setMobileOpen(false);
    }
  }, [isMobile]);

  const toggleCollapsed = () => setCollapsed(prev => !prev);
  const toggleMobileOpen = () => setMobileOpen(prev => !prev);

  return (
    <SidebarContext.Provider value={{ 
      collapsed, 
      setCollapsed, 
      toggleCollapsed, 
      isMobile, 
      mobileOpen, 
      setMobileOpen, 
      toggleMobileOpen 
    }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarState() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarState must be used within a SidebarProvider");
  }
  return context;
}