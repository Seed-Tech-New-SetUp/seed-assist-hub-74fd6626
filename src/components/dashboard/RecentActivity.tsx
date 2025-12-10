import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Calendar,
  FileText,
  Users,
  Building2,
  Target,
  GraduationCap,
  ArrowRight,
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: "event" | "lead" | "application" | "scholarship" | "school" | "meetup";
  title: string;
  description: string;
  time: string;
  status?: "new" | "pending" | "completed";
}

const activities: ActivityItem[] = [
  {
    id: "1",
    type: "event",
    title: "Virtual Event Report Submitted",
    description: "MBA Fair 2024 - Chicago Region",
    time: "2 hours ago",
    status: "new",
  },
  {
    id: "2",
    type: "lead",
    title: "24 New Profile Leads",
    description: "From Business School Festival NYC",
    time: "4 hours ago",
    status: "new",
  },
  {
    id: "3",
    type: "application",
    title: "Application Status Updated",
    description: "5 applications moved to 'Under Review'",
    time: "Yesterday",
    status: "pending",
  },
  {
    id: "4",
    type: "scholarship",
    title: "Scholarship Applicant Matched",
    description: "Sarah Chen matched with Excellence Award",
    time: "Yesterday",
    status: "completed",
  },
  {
    id: "5",
    type: "school",
    title: "School Profile Updated",
    description: "Stanford GSB - New program added",
    time: "2 days ago",
    status: "completed",
  },
];

const iconMap = {
  event: Calendar,
  lead: Target,
  application: FileText,
  scholarship: GraduationCap,
  school: Building2,
  meetup: Users,
};

const iconColorMap = {
  event: "bg-info/10 text-info",
  lead: "bg-accent/10 text-accent",
  application: "bg-primary/10 text-primary",
  scholarship: "bg-success/10 text-success",
  school: "bg-warning/10 text-warning",
  meetup: "bg-purple-500/10 text-purple-600",
};

const statusClasses = {
  new: "bg-primary/10 text-primary",
  pending: "bg-warning/10 text-warning",
  completed: "bg-success/10 text-success",
};

export function RecentActivity() {
  return (
    <Card variant="default" className="animate-fade-in-up opacity-0" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
        <Button variant="ghost" size="sm" className="text-xs text-primary h-8">
          View All <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-1">
        {activities.map((activity) => {
          const Icon = iconMap[activity.type];
          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
            >
              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0", iconColorMap[activity.type])}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">{activity.title}</p>
                  {activity.status && (
                    <span className={cn("px-1.5 py-0.5 text-[10px] font-medium rounded capitalize", statusClasses[activity.status])}>
                      {activity.status}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
