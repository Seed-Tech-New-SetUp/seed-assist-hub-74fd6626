import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AdvancedROIChart } from "@/components/dashboard/AdvancedROIChart";
import {
  Users,
  TrendingUp,
  Award,
  FileCheck,
  Target,
  Globe,
  GraduationCap,
  BarChart3,
} from "lucide-react";

// Mock analytics data - TODO: Replace with API call
const analyticsData = {
  totalApplications: 1245,
  applicationsTrend: 12.5,
  shortlistedCount: 342,
  shortlistedTrend: 8.3,
  winnersCount: 48,
  winnersTrend: 15.2,
  conversionRate: "3.9%",
  topNationalities: [
    { country: "India", count: 320, percentage: 25.7 },
    { country: "China", count: 185, percentage: 14.9 },
    { country: "Nigeria", count: 142, percentage: 11.4 },
    { country: "USA", count: 98, percentage: 7.9 },
    { country: "Brazil", count: 87, percentage: 7.0 },
  ],
  applicationsByProgram: [
    { program: "MBA", count: 456 },
    { program: "MS Data Science", count: 312 },
    { program: "MS Computer Science", count: 198 },
    { program: "MA International Relations", count: 145 },
    { program: "MS Finance", count: 134 },
  ],
  monthlyTrends: [
    { month: "Jan", applications: 85, shortlisted: 22 },
    { month: "Feb", applications: 120, shortlisted: 35 },
    { month: "Mar", applications: 180, shortlisted: 52 },
    { month: "Apr", applications: 210, shortlisted: 68 },
    { month: "May", applications: 165, shortlisted: 45 },
    { month: "Jun", applications: 145, shortlisted: 38 },
  ],
};

const statsCards = [
  {
    title: "Total Applications",
    value: analyticsData.totalApplications.toLocaleString(),
    trend: analyticsData.applicationsTrend,
    icon: FileCheck,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Shortlisted",
    value: analyticsData.shortlistedCount.toLocaleString(),
    trend: analyticsData.shortlistedTrend,
    icon: Target,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    title: "Winners",
    value: analyticsData.winnersCount.toLocaleString(),
    trend: analyticsData.winnersTrend,
    icon: Award,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    title: "Conversion Rate",
    value: analyticsData.conversionRate,
    icon: TrendingUp,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
];

export default function ScholarshipAnalytics() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Scholarship Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track application trends, conversions, and demographic insights
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold">{stat.value}</p>
                      {stat.trend && (
                        <span className="text-xs text-green-600 font-medium">+{stat.trend}%</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Applications Trend Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Application Trends
              </CardTitle>
              <CardDescription>Monthly applications and shortlist numbers</CardDescription>
            </CardHeader>
            <CardContent>
              <AdvancedROIChart />
            </CardContent>
          </Card>

          {/* Top Nationalities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Top Nationalities
              </CardTitle>
              <CardDescription>Applications by country of origin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topNationalities.map((item, i) => (
                  <div key={item.country} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-muted-foreground w-5">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{item.country}</span>
                        <span className="text-sm text-muted-foreground">{item.count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Applications by Program */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Applications by Program
              </CardTitle>
              <CardDescription>Most popular programs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.applicationsByProgram.map((item, i) => (
                  <div key={item.program} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-muted-foreground w-5">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{item.program}</span>
                        <span className="text-sm text-muted-foreground">{item.count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${(item.count / 456) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
