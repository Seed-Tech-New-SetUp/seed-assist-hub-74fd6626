import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface PortalUser {
  id: string;
  email: string;
  full_name?: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface AuthContextType {
  user: User | PortalUser | null;
  session: Session | null;
  loading: boolean;
  portalToken: string | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | PortalUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [portalToken, setPortalToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored portal session first
    const storedPortalUser = localStorage.getItem('portal_user');
    const storedPortalToken = localStorage.getItem('portal_token');
    
    if (storedPortalUser && storedPortalToken) {
      try {
        const parsedUser = JSON.parse(storedPortalUser);
        setUser(parsedUser);
        setPortalToken(storedPortalToken);
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('portal_user');
        localStorage.removeItem('portal_token');
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

      // Store portal session
      const portalUser: PortalUser = {
        id: data.user?.id || data.member?.id || email,
        email: email,
        full_name: data.user?.name || data.member?.name || email.split('@')[0],
        user_metadata: {
          full_name: data.user?.name || data.member?.name || email.split('@')[0],
        },
      };

      const token = data.token || data.access_token || 'portal_authenticated';
      
      localStorage.setItem('portal_user', JSON.stringify(portalUser));
      localStorage.setItem('portal_token', token);
      
      setUser(portalUser);
      setPortalToken(token);

      return { error: null };
    } catch (err) {
      console.error('Sign in error:', err);
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
    // Clear portal session
    localStorage.removeItem('portal_user');
    localStorage.removeItem('portal_token');
    setUser(null);
    setPortalToken(null);
    
    // Also sign out from Supabase if there's a session
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, portalToken, signIn, signUp, signOut }}>
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
