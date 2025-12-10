import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface InsightCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  gradient?: "primary" | "accent" | "success" | "warm";
  size?: "default" | "large";
  delay?: number;
  className?: string;
}

const gradientClasses = {
  primary: "gradient-primary",
  accent: "gradient-accent",
  success: "gradient-success",
  warm: "gradient-warm",
};

export function InsightCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  gradient = "primary",
  size = "default",
  delay = 0,
  className,
}: InsightCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-5 transition-all duration-300",
        "hover:shadow-large hover:border-border hover:-translate-y-0.5",
        "animate-fade-in-up opacity-0",
        className
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
    >
      {/* Background gradient orb */}
      <div
        className={cn(
          "absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-10 transition-all duration-500",
          "group-hover:opacity-20 group-hover:scale-110",
          gradientClasses[gradient]
        )}
      />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              "flex items-center justify-center w-11 h-11 rounded-xl text-white",
              gradientClasses[gradient]
            )}
          >
            <Icon className="h-5 w-5" />
          </div>

          {change !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full",
                isPositive && "bg-success/10 text-success",
                isNegative && "bg-destructive/10 text-destructive",
                !isPositive && !isNegative && "bg-muted text-muted-foreground"
              )}
            >
              <TrendIcon className="h-3 w-3" />
              {Math.abs(change)}%
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p
            className={cn(
              "font-display font-bold tracking-tight",
              size === "large" ? "text-4xl" : "text-2xl"
            )}
          >
            {value}
          </p>
          {changeLabel && (
            <p className="text-xs text-muted-foreground">{changeLabel}</p>
          )}
        </div>
      </div>
    </div>
  );
}