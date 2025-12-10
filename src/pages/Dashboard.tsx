import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { MetricRing } from "@/components/dashboard/MetricRing";
import { AdvancedROIChart, ChannelPerformance, ConversionFunnel } from "@/components/dashboard/AdvancedROIChart";
import { ActivityFeed, UpcomingEventsList } from "@/components/dashboard/ActivityFeed";
import { GlobalInsights, AIInsights } from "@/components/dashboard/GlobalInsights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Target,
  FileText,
  GraduationCap,
  TrendingUp,
  Users,
  Building2,
  CheckCircle2,
  DollarSign,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function Dashboard() {
  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">
              Welcome back, <span className="gradient-text">John</span>
            </h1>
            <p className="text-muted-foreground">
              Here's your holistic ROI overview for Harvard Business School
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generate Report
            </Button>
            <Button className="gap-2 gradient-primary text-white border-0">
              View Analytics
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <InsightCard
          title="Total Leads"
          value="2,847"
          change={12.5}
          changeLabel="vs last month"
          icon={Target}
          gradient="primary"
          delay={100}
        />
        <InsightCard
          title="Active Applications"
          value="428"
          change={8.2}
          changeLabel="vs last month"
          icon={FileText}
          gradient="accent"
          delay={150}
        />
        <InsightCard
          title="Scholarship Applicants"
          value="156"
          change={-2.3}
          changeLabel="vs last month"
          icon={GraduationCap}
          gradient="success"
          delay={200}
        />
        <InsightCard
          title="ROI Multiplier"
          value="5.4x"
          change={18.7}
          changeLabel="vs last quarter"
          icon={TrendingUp}
          gradient="warm"
          delay={250}
        />
      </div>

      {/* ROI Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <AdvancedROIChart />
        <ChannelPerformance />
      </div>

      {/* Secondary Stats + Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-border/50 overflow-hidden animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <CardContent className="p-5">
            <div className="flex flex-col items-center">
              <MetricRing value={24} max={30} label="Virtual Events" sublabel="this month" gradient="primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 overflow-hidden animate-fade-in-up" style={{ animationDelay: "350ms" }}>
          <CardContent className="p-5">
            <div className="flex flex-col items-center">
              <MetricRing value={892} max={1000} label="Admits This Year" sublabel="+24.5%" gradient="success" />
            </div>
          </CardContent>
        </Card>
        
        <div className="lg:col-span-2">
          <ConversionFunnel />
        </div>
      </div>

      {/* Activity + Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>
        <GlobalInsights />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <UpcomingEventsList />
        <AIInsights />
      </div>
    </DashboardLayout>
  );
}