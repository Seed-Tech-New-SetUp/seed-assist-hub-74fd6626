import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";

interface School {
  id: string;
  school_id: string;
  name: string;
  logo_url: string | null;
  role: string;
  designation?: string;
}

interface SchoolContextType {
  schools: School[];
  currentSchool: School | null;
  setCurrentSchool: (school: School) => Promise<void>;
  loading: boolean;
  needsSchoolSelection: boolean;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export function SchoolProvider({ children }: { children: ReactNode }) {
  const { user, loginSchools, selectedSchool, tempToken, portalToken, selectSchool } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [currentSchool, setCurrentSchoolState] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsSchoolSelection, setNeedsSchoolSelection] = useState(false);

  useEffect(() => {
    if (user && loginSchools.length > 0) {
      // Transform login schools to our School format
      const transformedSchools: School[] = loginSchools.map((ls) => ({
        id: ls.school_id,
        school_id: ls.school_id,
        name: ls.school_name,
        logo_url: ls.school_logo ? `https://admin.seedglobaleducation.com/assets/img/school_logos/${ls.school_logo}` : null,
        role: ls.role,
        designation: ls.designation,
      }));

      setSchools(transformedSchools);

      // Check if user has already selected a school (has final token)
      if (portalToken && selectedSchool) {
        const current: School = {
          id: selectedSchool.school_id,
          school_id: selectedSchool.school_id,
          name: selectedSchool.school_name,
          logo_url: selectedSchool.school_logo ? `https://admin.seedglobaleducation.com/assets/img/school_logos/${selectedSchool.school_logo}` : null,
          role: 'member',
        };
        
        // Get role from loginSchools
        const matchingSchool = transformedSchools.find(s => s.school_id === selectedSchool.school_id);
        if (matchingSchool) {
          current.role = matchingSchool.role;
          current.designation = matchingSchool.designation;
        }
        
        setCurrentSchoolState(current);
        setNeedsSchoolSelection(false);
        setLoading(false);
      } else if (tempToken) {
        // User logged in but hasn't selected a school yet
        if (transformedSchools.length === 1) {
          // Single school user - auto-select is handled by AuthContext
          // Keep loading true until portalToken is set (auto-select completes)
          // Don't set needsSchoolSelection to prevent redirect to select-school
          setNeedsSchoolSelection(false);
          // Don't set loading to false yet - wait for portalToken
        } else {
          // Multi-school user needs to manually select
          setNeedsSchoolSelection(true);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } else if (user && loginSchools.length === 0 && !portalToken) {
      // User logged in but no schools yet - keep loading if we're waiting for data
      setSchools([]);
      setLoading(false);
      setNeedsSchoolSelection(false);
    } else if (!user) {
      // No user
      setSchools([]);
      setCurrentSchoolState(null);
      setLoading(false);
      setNeedsSchoolSelection(false);
    } else {
      setLoading(false);
    }
  }, [user, loginSchools, selectedSchool, tempToken, portalToken]);

  const setCurrentSchool = async (school: School) => {
    // Find the original login school data
    const loginSchool = loginSchools.find(ls => ls.school_id === school.school_id);
    
    if (loginSchool) {
      // Call the select-school API
      const { error } = await selectSchool(loginSchool);
      
      if (error) {
        console.error('Failed to select school:', error);
        throw error;
      }
    }
    
    setCurrentSchoolState(school);
    setNeedsSchoolSelection(false);
    localStorage.setItem('seed_current_school', school.school_id);
  };

  return (
    <SchoolContext.Provider
      value={{
        schools,
        currentSchool,
        setCurrentSchool,
        loading,
        needsSchoolSelection,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
}

export function useSchool() {
  const context = useContext(SchoolContext);
  if (context === undefined) {
    throw new Error("useSchool must be used within a SchoolProvider");
  }
  return context;
}
