import { useAuth } from "@/contexts/AuthContext";

interface PortalUser {
  role?: string;
}

export function useAdminStatus() {
  const { user } = useAuth();
  
  // Check if user has admin role from portal authentication
  const portalUser = user as PortalUser | null;
  const isAdmin = portalUser?.role === "admin" || portalUser?.role === "super_admin";

  return { isAdmin, isLoading: false };
}
