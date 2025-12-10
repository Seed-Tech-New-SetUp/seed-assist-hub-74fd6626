import { cn } from "@/lib/utils";

interface MetricRingProps {
  value: number;
  max?: number;
  label: string;
  sublabel?: string;
  size?: "sm" | "md" | "lg";
  gradient?: "primary" | "accent" | "success" | "warning";
  className?: string;
}

const gradientIds = {
  primary: "gradient-primary",
  accent: "gradient-accent",
  success: "gradient-success",
  warning: "gradient-warning",
};

const gradientColors = {
  primary: { start: "hsl(225, 73%, 57%)", end: "hsl(280, 73%, 60%)" },
  accent: { start: "hsl(280, 73%, 60%)", end: "hsl(320, 73%, 55%)" },
  success: { start: "hsl(152, 69%, 46%)", end: "hsl(170, 69%, 46%)" },
  warning: { start: "hsl(38, 92%, 50%)", end: "hsl(20, 92%, 55%)" },
};

const sizes = {
  sm: { size: 80, stroke: 6, fontSize: "text-lg" },
  md: { size: 120, stroke: 8, fontSize: "text-2xl" },
  lg: { size: 160, stroke: 10, fontSize: "text-3xl" },
};

export function MetricRing({
  value,
  max = 100,
  label,
  sublabel,
  size = "md",
  gradient = "primary",
  className,
}: MetricRingProps) {
  const { size: dimensions, stroke, fontSize } = sizes[size];
  const radius = (dimensions - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((value / max) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;

  const colors = gradientColors[gradient];
  const id = `${gradientIds[gradient]}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="relative" style={{ width: dimensions, height: dimensions }}>
        <svg className="transform -rotate-90" width={dimensions} height={dimensions}>
          <defs>
            <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.start} />
              <stop offset="100%" stopColor={colors.end} />
            </linearGradient>
          </defs>
          
          {/* Background circle */}
          <circle
            cx={dimensions / 2}
            cy={dimensions / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-muted/50"
          />
          
          {/* Progress circle */}
          <circle
            cx={dimensions / 2}
            cy={dimensions / 2}
            r={radius}
            fill="none"
            stroke={`url(#${id})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-display font-bold", fontSize)}>
            {value}
          </span>
          {sublabel && (
            <span className="text-xs text-muted-foreground">{sublabel}</span>
          )}
        </div>
      </div>
      
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
}