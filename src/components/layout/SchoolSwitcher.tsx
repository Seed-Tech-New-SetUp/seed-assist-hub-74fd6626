import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSchool } from "@/contexts/SchoolContext";
import { useAuth } from "@/contexts/AuthContext";
import { decodeUTF8 } from "@/lib/utils/decode-utf8";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Building2, ChevronDown, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function SchoolSwitcher() {
  const { schools, currentSchool, setCurrentSchool } = useSchool();
  const { selectedSchool } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [switchingSchoolId, setSwitchingSchoolId] = useState<string | null>(null);

  // Get full school name from selectedSchool (has university info) - decode HTML entities
  // Only show dash if both university and school_name exist
  const getFullSchoolName = () => {
    if (selectedSchool?.university && selectedSchool?.school_name) {
      return `${selectedSchool.university} - ${selectedSchool.school_name}`;
    }
    return selectedSchool?.university || selectedSchool?.school_name || currentSchool?.name || "";
  };
  const fullSchoolName = decodeUTF8(getFullSchoolName());
  
  const schoolCountry = decodeUTF8(selectedSchool?.country || "");
  const schoolLogo = selectedSchool?.school_logo 
    ? `https://admin.seedglobaleducation.com/assets/img/school_logos/${selectedSchool.school_logo}`
    : currentSchool?.logo_url;
  const designation = decodeUTF8(currentSchool?.designation || "");

  const handleSchoolChange = async (school: typeof schools[0]) => {
    if (currentSchool?.id === school.id) {
      setOpen(false);
      return;
    }
    
    try {
      setSwitchingSchoolId(school.id);
      await setCurrentSchool(school);
      setOpen(false);
      navigate("/dashboard");
    } catch (error) {
      console.error('Failed to switch school:', error);
      toast.error('Failed to switch school. Please try again.');
    } finally {
      setSwitchingSchoolId(null);
    }
  };

  // Show card if we have school data from either context
  // On reload, selectedSchool (from AuthContext/cookies) may be available before 
  // currentSchool (from SchoolContext) is populated
  const hasSchoolData = currentSchool || selectedSchool;
  
  // If no school data at all, don't render anything
  if (!hasSchoolData) {
    return null;
  }
  
  // Single school or still loading schools list - show card without dropdown
  if (schools.length <= 1) {
    return (
      <div className="mx-2 md:mx-3 my-2 p-2.5 bg-card rounded-lg shadow-sm border border-border">
        <div className="flex items-center gap-3">
          {schoolLogo && (
            <img
              src={schoolLogo}
              alt={fullSchoolName}
              className="h-9 w-9 object-contain flex-shrink-0"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-foreground leading-snug line-clamp-2">
              {fullSchoolName}
            </p>
            {schoolCountry && (
              <p className="text-[10px] text-primary font-medium mt-0.5">{schoolCountry}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Multi-school - show dropdown
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "mx-2 md:mx-3 my-2 p-2.5 bg-card rounded-lg shadow-sm border border-border w-[calc(100%-1rem)] md:w-[calc(100%-1.5rem)] text-left",
            "hover:shadow-md hover:border-primary/30 transition-all cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-primary/20"
          )}
        >
          <div className="flex items-center gap-3">
            {schoolLogo && (
              <img
                src={schoolLogo}
                alt={fullSchoolName}
                className="h-9 w-9 object-contain flex-shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground leading-snug line-clamp-2">
                {fullSchoolName}
              </p>
              {schoolCountry && (
                <p className="text-[10px] text-primary font-medium mt-0.5">{schoolCountry}</p>
              )}
            </div>
            <ChevronDown className={cn(
              "h-4 w-4 text-muted-foreground transition-transform flex-shrink-0",
              open && "rotate-180"
            )} />
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        side="right"
        sideOffset={8}
        className="w-72 max-h-80 overflow-y-auto bg-popover border border-border shadow-lg z-50"
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-3">
          Switch School
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {schools.map((school) => (
          <DropdownMenuItem
            key={school.id}
            onClick={() => handleSchoolChange(school)}
            className={cn(
              "cursor-pointer py-3 px-3",
              "focus:bg-secondary focus:text-secondary-foreground",
              "hover:bg-secondary hover:text-secondary-foreground",
              switchingSchoolId === school.id && "opacity-75"
            )}
            disabled={switchingSchoolId !== null}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="h-10 w-10 rounded-lg bg-muted border border-border flex items-center justify-center flex-shrink-0">
                {school.logo_url ? (
                  <img
                    src={school.logo_url}
                    alt={school.name}
                    className="h-7 w-7 object-contain"
                  />
                ) : (
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-snug">
                  {decodeUTF8(school.name)}
                </p>
                {school.designation && (
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                    {decodeUTF8(school.designation)}
                  </p>
                )}
              </div>
              {switchingSchoolId === school.id ? (
                <Loader2 className="h-4 w-4 text-primary animate-spin flex-shrink-0" />
              ) : currentSchool.id === school.id ? (
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
              ) : null}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}