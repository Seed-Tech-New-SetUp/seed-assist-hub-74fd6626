import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface ProgramBadgesProps {
  programs: string[];
  maxVisible?: number;
}

export function ProgramBadges({ programs, maxVisible = 2 }: ProgramBadgesProps) {
  const [expanded, setExpanded] = useState(false);

  if (programs.length === 0) {
    return <span className="text-muted-foreground text-sm">-</span>;
  }

  const visiblePrograms = expanded ? programs : programs.slice(0, maxVisible);
  const remainingCount = programs.length - maxVisible;
  const showExpandButton = !expanded && remainingCount > 0;

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {visiblePrograms.map((program, idx) => (
        <Badge
          key={idx}
          variant="secondary"
          className="bg-purple-500 text-white text-xs"
        >
          {program}
        </Badge>
      ))}
      {showExpandButton && (
        <Badge
          variant="outline"
          className="cursor-pointer hover:bg-muted text-xs"
          onClick={() => setExpanded(true)}
        >
          +{remainingCount} more
        </Badge>
      )}
      {expanded && remainingCount > 0 && (
        <Badge
          variant="outline"
          className="cursor-pointer hover:bg-muted text-xs"
          onClick={() => setExpanded(false)}
        >
          Show less
        </Badge>
      )}
    </div>
  );
}
