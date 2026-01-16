import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// School data from login response
interface LoginSchool {
  school_id: string;
  school_name: string;
  school_logo: string | null;
  role: string;
  designation: string;
}

// Full school data after selection
interface SelectedSchool {
  school_id: string;
  internal_name: string;
  university: string;
  school_name: string;
  short_name: string;
  school_type: string;
  about: string;
  city: string;
  state: string;
  country: string;
  school_logo: string | null;
  school_banner: string | null;
  primary_color: string;
  secondary_color: string;
  currency: string;
  social_media: {
    instagram: string;
    twitter: string;
    youtube: string;
    linkedin: string;
  };
}

// Permissions structure
export interface Permissions {
  engagement: {
    enabled: boolean;
    subModules: {
      inPersonEvents: boolean;
      virtualEvents: boolean;
      bsf: boolean;
      campusTours: boolean;
      masterclasses: boolean;
      meetups: boolean;
    };
  };
  scholarshipPortal: {
    enabled: boolean;
    subModules: {
      applicantPools: boolean;
    };
  };
  orgProfile: {
    enabled: boolean;
    isPremium?: boolean;
    subModules: {
      generalInfo: boolean;
      academicPrograms: boolean;
      accessLeads: boolean;
    };
  };
  admissions: {
    enabled: boolean;
    subModules: {
      applicationPipeline: boolean;
      laeAssignments: boolean;
    };
  };
  teamManagement: {
    enabled: boolean;
  };
  icr: {
    enabled: boolean;
    subModules?: {
      viewAnalytics: boolean;
      addReport: boolean;
    };
  };
}

// User data from login response
interface LoginUser {
  client_id: string;
  client_name: string;
  email: string;
}

// Full user data after school selection
interface SelectedUser {
  client_id: string;
  client_name: string;
  email: string;
  role: string;
  designation: string;
  business_regions: string | null;
}

interface PortalUser {
  id: string;
  email: string;
  full_name?: string;
  user_metadata?: {
    full_name?: string;
  };
  client_id?: string;
  role?: string;
  designation?: string;
}

interface AuthContextType {
  user: User | PortalUser | null;
  session: Session | null;
  loading: boolean;
  portalToken: string | null;
  tempToken: string | null;
  loginSchools: LoginSchool[];
  selectedSchool: SelectedSchool | null;
  permissions: Permissions | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  selectSchool: (school: LoginSchool) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | PortalUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [portalToken, setPortalToken] = useState<string | null>(null);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [loginSchools, setLoginSchools] = useState<LoginSchool[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<SelectedSchool | null>(null);
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored portal session first
    const storedPortalUser = localStorage.getItem('portal_user');
    const storedPortalToken = localStorage.getItem('portal_token');
    const storedSelectedSchool = localStorage.getItem('portal_selected_school');
    const storedPermissions = localStorage.getItem('portal_permissions');
    const storedLoginSchools = localStorage.getItem('portal_login_schools');
    const storedTempToken = localStorage.getItem('portal_temp_token');
    
    if (storedPortalUser && storedPortalToken) {
      try {
        const parsedUser = JSON.parse(storedPortalUser);
        setUser(parsedUser);
        setPortalToken(storedPortalToken);
        if (storedSelectedSchool) {
          setSelectedSchool(JSON.parse(storedSelectedSchool));
        }
        if (storedPermissions) {
          setPermissions(JSON.parse(storedPermissions));
        }
        if (storedLoginSchools) {
          setLoginSchools(JSON.parse(storedLoginSchools));
        }
        setLoading(false);
        return;
      } catch (e) {
        // Clear corrupted data
        localStorage.removeItem('portal_user');
        localStorage.removeItem('portal_token');
        localStorage.removeItem('portal_selected_school');
        localStorage.removeItem('portal_permissions');
        localStorage.removeItem('portal_login_schools');
        localStorage.removeItem('portal_temp_token');
      }
    }

    // Check for temp token (user logged in but hasn't selected school)
    if (storedTempToken && storedLoginSchools) {
      try {
        const parsedUser = storedPortalUser ? JSON.parse(storedPortalUser) : null;
        if (parsedUser) {
          setUser(parsedUser);
        }
        setTempToken(storedTempToken);
        setLoginSchools(JSON.parse(storedLoginSchools));
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('portal_temp_token');
        localStorage.removeItem('portal_login_schools');
      }
    }

    // Fallback to Supabase auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('portal-auth', {
        body: { email, password },
      });

      if (error) {
        console.error('Portal auth error:', error);
        return { error: new Error(error.message || 'Login failed') };
      }

      if (data.error) {
        return { error: new Error(data.error) };
      }

      if (!data.success || !data.data) {
        return { error: new Error('Invalid response from server') };
      }

      const { user: loginUser, schools, tempToken: token } = data.data;
      
      // Create portal user from login response
      const portalUser: PortalUser = {
        id: loginUser?.client_id || email,
        email: loginUser?.email || email,
        full_name: loginUser?.client_name || email.split('@')[0],
        user_metadata: {
          full_name: loginUser?.client_name || email.split('@')[0],
        },
        client_id: loginUser?.client_id,
      };
      
      // Store temp data for school selection
      localStorage.setItem('portal_user', JSON.stringify(portalUser));
      localStorage.setItem('portal_temp_token', token);
      localStorage.setItem('portal_login_schools', JSON.stringify(schools || []));
      
      setUser(portalUser);
      setTempToken(token);
      setLoginSchools(schools || []);

      return { error: null };
    } catch (err) {
      console.error('Sign in error:', err);
      return { error: err as Error };
    }
  };

  const selectSchool = async (school: LoginSchool) => {
    try {
      const currentUser = user as PortalUser;
      const currentTempToken = tempToken || localStorage.getItem('portal_temp_token');
      
      if (!currentTempToken || !currentUser?.email) {
        return { error: new Error('No temp token available. Please login again.') };
      }

      // Note: We're using fetch directly with query param instead of supabase.functions.invoke

      // Add query param for action
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/portal-auth?action=select-school`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            email: currentUser.email,
            school_id: school.school_id,
            tempToken: currentTempToken,
          }),
        }
      );

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        console.error('School selection failed:', responseData);
        return { error: new Error(responseData.error || 'Failed to select school') };
      }

      const { token, user: selectedUser, school: selectedSchoolData, permissions: userPermissions } = responseData.data;

      // Update user with full data
      const updatedUser: PortalUser = {
        id: selectedUser?.client_id || currentUser.id,
        email: selectedUser?.email || currentUser.email,
        full_name: selectedUser?.client_name || currentUser.full_name,
        user_metadata: {
          full_name: selectedUser?.client_name || currentUser.full_name,
        },
        client_id: selectedUser?.client_id,
        role: selectedUser?.role,
        designation: selectedUser?.designation,
      };

      // Store final session data
      localStorage.setItem('portal_user', JSON.stringify(updatedUser));
      localStorage.setItem('portal_token', token);
      localStorage.setItem('portal_selected_school', JSON.stringify(selectedSchoolData));
      localStorage.setItem('portal_permissions', JSON.stringify(userPermissions));
      localStorage.setItem('seed_current_school', school.school_id);
      
      // Clear temp data
      localStorage.removeItem('portal_temp_token');

      setUser(updatedUser);
      setPortalToken(token);
      setTempToken(null);
      setSelectedSchool(selectedSchoolData);
      setPermissions(userPermissions);

      return { error: null };
    } catch (err) {
      console.error('Select school error:', err);
      return { error: err as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    // For now, signup still uses Supabase or could be extended to portal
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    // Clear all portal session data
    localStorage.removeItem('portal_user');
    localStorage.removeItem('portal_token');
    localStorage.removeItem('portal_temp_token');
    localStorage.removeItem('portal_login_schools');
    localStorage.removeItem('portal_selected_school');
    localStorage.removeItem('portal_permissions');
    localStorage.removeItem('seed_current_school');
    
    setUser(null);
    setPortalToken(null);
    setTempToken(null);
    setLoginSchools([]);
    setSelectedSchool(null);
    setPermissions(null);
    
    // Also sign out from Supabase if there's a session
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      portalToken, 
      tempToken,
      loginSchools,
      selectedSchool,
      permissions,
      signIn, 
      selectSchool,
      signUp, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
