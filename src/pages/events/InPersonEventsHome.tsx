import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  UserCheck, 
  Handshake, 
  Calendar, 
  MapPin, 
  Clock, 
  ArrowRight,
  FileText,
  Play,
  CalendarClock
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

const getNextUpcomingEvent = (events: Event[]) => {
  return events
    .filter(e => e.status === "upcoming")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
};

const useCountdown = (targetDate: string) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
};

const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const { days, hours, minutes, seconds } = useCountdown(targetDate);

  return (
    <div className="flex gap-3">
      {[
        { value: days, label: "Days" },
        { value: hours, label: "Hours" },
        { value: minutes, label: "Mins" },
        { value: seconds, label: "Secs" },
      ].map((item) => (
        <div key={item.label} className="flex flex-col items-center">
          <div className="bg-primary/10 text-primary font-bold text-2xl px-3 py-2 rounded-lg min-w-[60px] text-center">
            {String(item.value).padStart(2, "0")}
          </div>
          <span className="text-xs text-muted-foreground mt-1">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

const StatusBadge = ({ status }: { status: Event["status"] }) => {
  const config = {
    upcoming: { label: "Upcoming", variant: "outline" as const, className: "border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950" },
    ongoing: { label: "Live Now", variant: "outline" as const, className: "border-green-500 text-green-600 bg-green-50 dark:bg-green-950 animate-pulse" },
    completed: { label: "Completed", variant: "secondary" as const, className: "" },
  };

  const { label, variant, className } = config[status];
  return <Badge variant={variant} className={className}>{label}</Badge>;
};

export default function InPersonEventsHome() {
  const navigate = useNavigate();
  const nextEvent = getNextUpcomingEvent(mockEvents);

  const totalStats = mockEvents.reduce(
    (acc, event) => ({
      registrations: acc.registrations + event.registrations,
      attended: acc.attended + event.attended,
      connections: acc.connections + event.connections,
    }),
    { registrations: 0, attended: 0, connections: 0 }
  );

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">In-Person Events</h1>
          <p className="text-muted-foreground mt-1">Manage your on-campus events, tours, and festivals</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Registrations</p>
                  <p className="text-2xl font-bold">{totalStats.registrations.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Attended</p>
                  <p className="text-2xl font-bold">{totalStats.attended.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                  <Handshake className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Connections</p>
                  <p className="text-2xl font-bold">{totalStats.connections.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Upcoming Event with Countdown */}
        {nextEvent && (
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Next Upcoming Event</CardTitle>
                </div>
                <StatusBadge status={nextEvent.status} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{nextEvent.title}</h3>
                  <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {formatDate(nextEvent.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {formatTime(nextEvent.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {nextEvent.venue}
                    </span>
                  </div>
                  <p className="text-sm">
                    <span className="font-medium text-foreground">{nextEvent.registrations}</span>
                    <span className="text-muted-foreground"> registrations so far</span>
                  </p>
                </div>
                <div className="flex flex-col items-start lg:items-end gap-4">
                  <CountdownTimer targetDate={nextEvent.date} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Events List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">All Events</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {mockEvents.map((event) => (
                  <div
                    key={event.id}
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
                          <Calendar className="h-5 w-5 text-primary" />
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
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}