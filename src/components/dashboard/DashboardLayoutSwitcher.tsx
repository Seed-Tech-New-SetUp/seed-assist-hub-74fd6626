import { LayoutGrid, BarChart3, List, Columns3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type DashboardLayoutType = "pillars" | "stats" | "tiles" | "compact";

interface DashboardLayoutSwitcherProps {
  currentLayout: DashboardLayoutType;
  onLayoutChange: (layout: DashboardLayoutType) => void;
}

const layouts: { type: DashboardLayoutType; icon: React.ElementType; label: string }[] = [
  { type: "pillars", icon: Columns3, label: "Pillars View" },
  { type: "stats", icon: BarChart3, label: "Stats & Metrics" },
  { type: "tiles", icon: LayoutGrid, label: "Feature Tiles" },
  { type: "compact", icon: List, label: "Compact List" },
];

export function DashboardLayoutSwitcher({ currentLayout, onLayoutChange }: DashboardLayoutSwitcherProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
      {layouts.map(({ type, icon: Icon, label }) => (
        <Tooltip key={type}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0 transition-all",
                currentLayout === type
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => onLayoutChange(type)}
            >
              <Icon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
