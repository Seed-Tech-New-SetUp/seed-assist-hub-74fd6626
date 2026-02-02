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
  const fullSchoolName = decodeUTF8(
    selectedSchool?.university 
      ? `${selectedSchool.university} - ${selectedSchool.school_name}` 
      : selectedSchool?.school_name || currentSchool?.name || ""
  );
  
  const schoolCountry = decodeUTF8(selectedSchool?.country || "");
  const schoolLogo = selectedSchool?.school_logo 
    ? `https://admin.seedglobaleducation.com/assets/img/school_logos/${selectedSchool.school_logo}`
    : currentSchool?.logo_url;
  const designation = currentSchool?.designation || "";

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

  // Single school - no dropdown needed
  if (!currentSchool || schools.length <= 1) {
    return currentSchool ? (
      <div className="mx-2 md:mx-3 my-2 md:my-3 p-3 md:p-4 bg-card rounded-lg shadow-sm border border-border">
        {schoolLogo && (
          <div className="flex justify-center mb-2 md:mb-3">
            <img
              src={schoolLogo}
              alt={fullSchoolName}
              className="h-10 md:h-12 object-contain"
            />
          </div>
        )}
        <p className="text-xs md:text-sm font-semibold text-foreground text-center leading-snug">
          {fullSchoolName}
        </p>
        {schoolCountry && (
          <p className="text-[10px] md:text-xs text-primary text-center mt-1 font-medium">{schoolCountry}</p>
        )}
        {designation && (
          <p className="text-[10px] text-muted-foreground text-center mt-1 capitalize">{designation}</p>
        )}
      </div>
    ) : null;
  }

  // Multi-school - show dropdown
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "mx-2 md:mx-3 my-2 md:my-3 p-3 md:p-4 bg-card rounded-lg shadow-sm border border-border w-[calc(100%-1rem)] md:w-[calc(100%-1.5rem)] text-left",
            "hover:shadow-md hover:border-primary/30 transition-all cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-primary/20"
          )}
        >
          {schoolLogo && (
            <div className="flex justify-center mb-3">
              <img
                src={schoolLogo}
                alt={fullSchoolName}
                className="h-12 object-contain"
              />
            </div>
          )}
          <p className="text-sm font-semibold text-foreground text-center leading-snug">
            {fullSchoolName}
          </p>
          {schoolCountry && (
            <p className="text-xs text-primary text-center mt-1 font-medium">{schoolCountry}</p>
          )}
          
          {/* Switch School indicator */}
          <div className="flex items-center justify-center gap-1.5 mt-3 pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground font-medium">Switch School</span>
            <ChevronDown className={cn(
              "h-3.5 w-3.5 text-muted-foreground transition-transform",
              open && "rotate-180"
            )} />
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        side="right"
        sideOffset={8}
        className="w-72 bg-popover border border-border shadow-lg z-50"
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
                    {school.designation}
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