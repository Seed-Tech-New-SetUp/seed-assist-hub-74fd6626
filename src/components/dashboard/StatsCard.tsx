import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: "primary" | "accent" | "success" | "warning" | "info";
  delay?: number;
}

const iconColorClasses = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
};

export function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = "primary",
  delay = 0,
}: StatsCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <Card 
      variant="stats" 
      className="animate-fade-in-up opacity-0"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold font-display tracking-tight">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  "flex items-center gap-0.5 text-sm font-medium",
                  isPositive && "text-success",
                  isNegative && "text-destructive",
                  !isPositive && !isNegative && "text-muted-foreground"
                )}>
                  {isPositive && <TrendingUp className="h-3.5 w-3.5" />}
                  {isNegative && <TrendingDown className="h-3.5 w-3.5" />}
                  {isPositive && "+"}
                  {change}%
                </span>
                {changeLabel && (
                  <span className="text-xs text-muted-foreground">{changeLabel}</span>
                )}
              </div>
            )}
          </div>
          <div className={cn(
            "h-12 w-12 rounded-xl flex items-center justify-center",
            iconColorClasses[iconColor]
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
