import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ArrowRight,
  FileText,
  Play,
  CalendarClock,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  date: string;
  venue: string;
  status: "upcoming" | "ongoing" | "completed";
  registrations: number;
  attended: number;
  connections: number;
}

// Mock data
const mockEvents: Event[] = [
  {
    id: "1",
    title: "BSF Mumbai 2025",
    date: "2025-01-15T10:00:00",
    venue: "Jio Convention Centre, Mumbai",
    status: "upcoming",
    registrations: 450,
    attended: 0,
    connections: 0,
  },
  {
    id: "2",
    title: "Campus Tour - Delhi NCR",
    date: "2025-01-10T09:00:00",
    venue: "Multiple Campuses, Delhi",
    status: "ongoing",
    registrations: 120,
    attended: 85,
    connections: 42,
  },
  {
    id: "3",
    title: "BSF Bangalore 2024",
    date: "2024-12-10T10:00:00",
    venue: "Palace Grounds, Bangalore",
    status: "completed",
    registrations: 380,
    attended: 342,
    connections: 156,
  },
  {
    id: "4",
    title: "Campus Tour - Hyderabad",
    date: "2024-11-25T09:00:00",
    venue: "HICC, Hyderabad",
    status: "completed",
    registrations: 95,
    attended: 78,
    connections: 35,
  },
  {
    id: "5",
    title: "BSF Chennai 2024",
    date: "2024-10-15T10:00:00",
    venue: "Chennai Trade Centre",
    status: "completed",
    registrations: 290,
    attended: 265,
    connections: 120,
  },
];

const StatusBadge = ({ status }: { status: Event["status"] }) => {
  const config = {
    upcoming: { label: "Upcoming", variant: "outline" as const, className: "border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950" },
    ongoing: { label: "Live Now", variant: "outline" as const, className: "border-green-500 text-green-600 bg-green-50 dark:bg-green-950 animate-pulse" },
    completed: { label: "Report Published", variant: "secondary" as const, className: "" },
  };

  const { label, variant, className } = config[status];
  return <Badge variant={variant} className={className}>{label}</Badge>;
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function InPersonAllEvents() {
  const navigate = useNavigate();

  const upcomingEvents = mockEvents.filter(e => e.status === "upcoming" || e.status === "ongoing")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const completedEvents = mockEvents.filter(e => e.status === "completed")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const EventCard = ({ event }: { event: Event }) => (
    <div
      className={cn(
        "flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-muted/50 cursor-pointer",
        event.status === "ongoing" && "border-green-500/30 bg-green-50/50 dark:bg-green-950/20"
      )}
      onClick={() => {
        if (event.status === "completed") {
          navigate(`/reports/${event.id}`);
        }
      }}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "p-2.5 rounded-lg",
          event.status === "completed" ? "bg-muted" : "bg-primary/10"
        )}>
          {event.status === "completed" ? (
            <FileText className="h-5 w-5 text-muted-foreground" />
          ) : event.status === "ongoing" ? (
            <Play className="h-5 w-5 text-green-600" />
          ) : (
            <CalendarClock className="h-5 w-5 text-primary" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{event.title}</h4>
            <StatusBadge status={event.status} />
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(event.date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(event.date)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {event.venue}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-6 text-sm">
          <div className="text-center">
            <p className="font-semibold">{event.registrations}</p>
            <p className="text-muted-foreground text-xs">Registered</p>
          </div>
          {event.status !== "upcoming" && (
            <>
              <div className="text-center">
                <p className="font-semibold">{event.attended}</p>
                <p className="text-muted-foreground text-xs">Attended</p>
              </div>
              <div className="text-center">
                <p className="font-semibold">{event.connections}</p>
                <p className="text-muted-foreground text-xs">Connections</p>
              </div>
            </>
          )}
        </div>
        {event.status === "completed" && (
          <Button variant="ghost" size="sm">
            View Report <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">All In-Person Events</h1>
          <p className="text-muted-foreground mt-1">View all your on-campus events, tours, and festivals</p>
        </div>

        {/* Upcoming & Live Events */}
        {upcomingEvents.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Upcoming & Live Events</CardTitle>
                <Badge variant="secondary" className="ml-2">{upcomingEvents.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completed Events with Reports */}
        {completedEvents.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Published Reports</CardTitle>
                <Badge variant="secondary" className="ml-2">{completedEvents.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {completedEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
