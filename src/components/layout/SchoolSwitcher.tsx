import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSchool } from "@/contexts/SchoolContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Building2, ChevronDown, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function SchoolSwitcher() {
  const { schools, currentSchool, setCurrentSchool } = useSchool();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [switchingSchoolId, setSwitchingSchoolId] = useState<string | null>(null);

  if (!currentSchool || schools.length <= 1) {
    return currentSchool ? (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50">
        <div className="h-7 w-7 rounded bg-primary/10 flex items-center justify-center">
          {currentSchool.logo_url ? (
            <img
              src={currentSchool.logo_url}
              alt={currentSchool.name}
              className="h-5 w-5 object-contain"
            />
          ) : (
            <Building2 className="h-4 w-4 text-primary" />
          )}
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-semibold leading-tight truncate max-w-[160px]">
            {currentSchool.name}
          </p>
          <p className="text-[10px] text-muted-foreground capitalize">
            {currentSchool.role}
          </p>
        </div>
      </div>
    ) : null;
  }

  const handleSchoolChange = async (school: typeof schools[0]) => {
    if (currentSchool.id === school.id) {
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

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-3 py-1.5 h-auto hover:bg-muted/50"
        >
          <div className="h-7 w-7 rounded bg-primary/10 flex items-center justify-center">
            {currentSchool.logo_url ? (
              <img
                src={currentSchool.logo_url}
                alt={currentSchool.name}
                className="h-5 w-5 object-contain"
              />
            ) : (
              <Building2 className="h-4 w-4 text-primary" />
            )}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold leading-tight truncate max-w-[160px]">
              {currentSchool.name}
            </p>
            <p className="text-[10px] text-muted-foreground capitalize">
              {currentSchool.role}
            </p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Switch School
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {schools.map((school) => (
          <DropdownMenuItem
            key={school.id}
            onClick={() => handleSchoolChange(school)}
            className={`cursor-pointer py-2 ${switchingSchoolId === school.id ? 'opacity-75' : ''}`}
            disabled={switchingSchoolId !== null}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="h-8 w-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                {school.logo_url ? (
                  <img
                    src={school.logo_url}
                    alt={school.name}
                    className="h-5 w-5 object-contain"
                  />
                ) : (
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{school.name}</p>
                {school.designation && (
                  <p className="text-xs text-muted-foreground truncate">{school.designation}</p>
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
