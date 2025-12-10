import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Globe, TrendingUp, Users, MapPin } from "lucide-react";

const regions = [
  { name: "North America", leads: 1245, growth: 18, color: "bg-primary" },
  { name: "Europe", leads: 987, growth: 24, color: "bg-accent" },
  { name: "Asia Pacific", leads: 756, growth: 32, color: "bg-success" },
  { name: "Middle East", leads: 423, growth: 15, color: "bg-warning" },
  { name: "Latin America", leads: 312, growth: 28, color: "bg-info" },
];

const topCountries = [
  { country: "United States", flag: "🇺🇸", leads: 845, percentage: 25 },
  { country: "United Kingdom", flag: "🇬🇧", leads: 456, percentage: 14 },
  { country: "India", flag: "🇮🇳", leads: 398, percentage: 12 },
  { country: "Germany", flag: "🇩🇪", leads: 287, percentage: 8 },
  { country: "China", flag: "🇨🇳", leads: 245, percentage: 7 },
];

export function GlobalInsights() {
  const totalLeads = regions.reduce((acc, r) => acc + r.leads, 0);
  
  return (
    <Card className="overflow-hidden border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Global Performance
            </CardTitle>
            <CardDescription>Lead distribution by region</CardDescription>
          </div>
          <Badge variant="secondary" className="font-normal">
            {totalLeads.toLocaleString()} total leads
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Region bars */}
        <div className="space-y-4 mb-6">
          {regions.map((region, index) => (
            <div
              key={region.name}
              className="animate-fade-in opacity-0"
              style={{ animationDelay: `${index * 80}ms`, animationFillMode: "forwards" }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium">{region.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{region.leads.toLocaleString()}</span>
                  <Badge variant="outline" className="text-success border-success/20 bg-success/10 text-[10px] px-1.5 py-0">
                    +{region.growth}%
                  </Badge>
                </div>
              </div>
              <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-700 ease-out", region.color)}
                  style={{ 
                    width: `${(region.leads / Math.max(...regions.map(r => r.leads))) * 100}%`,
                    transitionDelay: `${index * 100}ms`
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Top countries */}
        <div className="border-t border-border/50 pt-4">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Top Countries
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {topCountries.slice(0, 4).map((country, index) => (
              <div
                key={country.country}
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 animate-fade-in opacity-0"
                style={{ animationDelay: `${400 + index * 50}ms`, animationFillMode: "forwards" }}
              >
                <span className="text-lg">{country.flag}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{country.country}</p>
                  <p className="text-[10px] text-muted-foreground">{country.leads} leads</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const insights = [
  {
    title: "Peak Engagement",
    description: "Virtual events show 42% higher engagement on Tuesdays",
    icon: TrendingUp,
    color: "text-success",
  },
  {
    title: "Growing Market",
    description: "Asia Pacific region up 32% compared to last quarter",
    icon: Globe,
    color: "text-primary",
  },
  {
    title: "Top Performers",
    description: "Executive MBA attracts highest quality leads",
    icon: Users,
    color: "text-accent",
  },
];

export function AIInsights() {
  return (
    <Card className="overflow-hidden border-border/50 relative">
      <div className="absolute top-0 right-0 w-32 h-32 gradient-primary opacity-5 blur-2xl" />
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
          <div>
            <CardTitle className="text-base">Smart Insights</CardTitle>
            <CardDescription className="text-xs">AI-powered recommendations</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div
              key={insight.title}
              className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors animate-fade-in opacity-0"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
            >
              <insight.icon className={cn("h-5 w-5 mt-0.5", insight.color)} />
              <div>
                <p className="text-sm font-medium">{insight.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{insight.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}