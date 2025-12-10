import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ROIChart, ChannelPerformanceChart } from "@/components/dashboard/ROIChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import {
  TrendingUp,
  Users,
  FileText,
  GraduationCap,
  Target,
  Building2,
  CheckCircle2,
  DollarSign,
} from "lucide-react";

export default function Dashboard() {
  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-display font-bold mb-2">
          Welcome back, <span className="text-gradient">John</span>
        </h1>
        <p className="text-muted-foreground">
          Here's your holistic ROI overview and recent activities for Harvard Business School.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Leads Generated"
          value="2,847"
          change={12.5}
          changeLabel="vs last month"
          icon={Target}
          iconColor="accent"
          delay={100}
        />
        <StatsCard
          title="Active Applications"
          value="428"
          change={8.2}
          changeLabel="vs last month"
          icon={FileText}
          iconColor="primary"
          delay={200}
        />
        <StatsCard
          title="Scholarship Applicants"
          value="156"
          change={-2.3}
          changeLabel="vs last month"
          icon={GraduationCap}
          iconColor="success"
          delay={300}
        />
        <StatsCard
          title="ROI Multiplier"
          value="5.4x"
          change={18.7}
          changeLabel="vs last quarter"
          icon={TrendingUp}
          iconColor="info"
          delay={400}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Virtual Events"
          value="24"
          icon={Users}
          iconColor="info"
          delay={200}
        />
        <StatsCard
          title="School Partners"
          value="110+"
          icon={Building2}
          iconColor="warning"
          delay={250}
        />
        <StatsCard
          title="Admits This Year"
          value="892"
          change={24.5}
          changeLabel="vs last year"
          icon={CheckCircle2}
          iconColor="success"
          delay={300}
        />
        <StatsCard
          title="Revenue Impact"
          value="$2.4M"
          change={32.1}
          changeLabel="attributed"
          icon={DollarSign}
          iconColor="accent"
          delay={350}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <ROIChart />
        <ChannelPerformanceChart />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentActivity />
        <UpcomingEvents />
        <QuickActions />
      </div>
    </DashboardLayout>
  );
}
