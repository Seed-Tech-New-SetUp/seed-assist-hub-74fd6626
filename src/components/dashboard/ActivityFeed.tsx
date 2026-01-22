import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  FileText, 
  UserPlus, 
  GraduationCap, 
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const activities = [
  {
    id: 1,
    type: "event",
    title: "Virtual MBA Fair completed",
    description: "312 attendees, 124 leads generated",
    time: "2 hours ago",
    icon: Calendar,
    iconBg: "bg-primary/10 text-primary",
  },
  {
    id: 2,
    type: "application",
    title: "New scholarship application",
    description: "Sarah Chen applied for Excellence Award",
    time: "4 hours ago",
    icon: FileText,
    iconBg: "bg-info/10 text-info",
  },
  {
    id: 3,
    type: "lead",
    title: "45 new leads from Europe",
    description: "From MBA Virtual Fair - Europe campaign",
    time: "5 hours ago",
    icon: UserPlus,
    iconBg: "bg-success/10 text-success",
  },
  {
    id: 4,
    type: "admission",
    title: "3 new admits confirmed",
    description: "Harvard Business School - MBA program",
    time: "Yesterday",
    icon: GraduationCap,
    iconBg: "bg-primary/10 text-primary",
  },
  {
    id: 5,
    type: "insight",
    title: "ROI milestone reached",
    description: "5x return on marketing investment",
    time: "Yesterday",
    icon: TrendingUp,
    iconBg: "bg-warning/10 text-warning",
  },
];

export function ActivityFeed() {
  return (
    <Card className="overflow-hidden border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates across all channels</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="text-primary">
            View all
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-0">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className={cn(
                "flex items-start gap-4 py-4 animate-fade-in opacity-0",
                index !== activities.length - 1 && "border-b border-border"
              )}
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
            >
              <div className={cn("p-2 rounded-lg", activity.iconBg)}>
                <activity.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{activity.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

const upcomingEvents = [
  {
    id: 1,
    name: "MBA Virtual Fair - Europe",
    date: "Dec 15",
    time: "2:00 PM",
    registrations: 245,
    status: "upcoming",
  },
  {
    id: 2,
    name: "Executive MBA Webinar",
    date: "Dec 18",
    time: "11:00 AM",
    registrations: 89,
    status: "upcoming",
  },
  {
    id: 3,
    name: "Asia Pacific Showcase",
    date: "Dec 20",
    time: "9:00 AM",
    registrations: 156,
    status: "draft",
  },
];

export function UpcomingEventsList() {
  return (
    <Card className="overflow-hidden border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Scheduled for next 7 days</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {upcomingEvents.map((event, index) => (
            <div
              key={event.id}
              className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors animate-fade-in opacity-0"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
            >
              <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
                <span className="text-xs font-medium">{event.date.split(" ")[0]}</span>
                <span className="text-lg font-semibold">{event.date.split(" ")[1]}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{event.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{event.time}</span>
                </div>
              </div>
              
              <Badge
                variant="outline"
                className={cn(
                  event.status === "upcoming" 
                    ? "bg-success/10 text-success border-success/20" 
                    : "bg-muted text-muted-foreground"
                )}
              >
                {event.status === "upcoming" ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Ready
                  </>
                ) : (
                  "Draft"
                )}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
