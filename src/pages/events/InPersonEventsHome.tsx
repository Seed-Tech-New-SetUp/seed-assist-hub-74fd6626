import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  UserCheck, 
  Handshake, 
  Calendar, 
  MapPin, 
  Clock, 
  ArrowRight,
  FileText,
  CalendarClock,
  Globe,
  Building2
} from "lucide-react";

// Mock data for stats
const totalStats = {
  registrations: 1335,
  attended: 770,
  connections: 353,
  citiesCovered: 12,
  countriesCovered: 3,
};

// Latest published report
const latestReport = {
  id: "3",
  title: "BSF Bangalore 2024",
  date: "2024-12-10T10:00:00",
  venue: "Palace Grounds, Bangalore",
  registrations: 380,
  attended: 342,
  connections: 156,
};

// Next upcoming event
const nextUpcomingEvent = {
  id: "1",
  title: "BSF Mumbai 2025",
  date: "2025-01-15T10:00:00",
  venue: "Jio Convention Centre, Mumbai",
  registrations: 450,
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

export default function InPersonEventsHome() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">In-Person Events</h1>
          <p className="text-muted-foreground mt-1">Overview of your on-campus events, tours, and festivals</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registrations</p>
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
                  <p className="text-sm text-muted-foreground">Attended</p>
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
                  <p className="text-sm text-muted-foreground">Connections</p>
                  <p className="text-2xl font-bold">{totalStats.connections.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                  <Building2 className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cities Covered</p>
                  <p className="text-2xl font-bold">{totalStats.citiesCovered}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-teal-100 dark:bg-teal-900/30">
                  <Globe className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Countries</p>
                  <p className="text-2xl font-bold">{totalStats.countriesCovered}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Upcoming Event with Countdown */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Next Upcoming Event</CardTitle>
              </div>
              <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950">
                Upcoming
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{nextUpcomingEvent.title}</h3>
                <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {formatDate(nextUpcomingEvent.date)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {formatTime(nextUpcomingEvent.date)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {nextUpcomingEvent.venue}
                  </span>
                </div>
                <p className="text-sm">
                  <span className="font-medium text-foreground">{nextUpcomingEvent.registrations}</span>
                  <span className="text-muted-foreground"> registrations so far</span>
                </p>
              </div>
              <div className="flex flex-col items-start lg:items-end gap-4">
                <CountdownTimer targetDate={nextUpcomingEvent.date} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Latest Published Report */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Latest Published Report</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className="flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-muted/50 cursor-pointer"
              onClick={() => navigate(`/reports/${latestReport.id}`)}
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-lg bg-muted">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{latestReport.title}</h4>
                    <Badge variant="secondary">Report Published</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(latestReport.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {latestReport.venue}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-semibold">{latestReport.registrations}</p>
                    <p className="text-muted-foreground text-xs">Registered</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{latestReport.attended}</p>
                    <p className="text-muted-foreground text-xs">Attended</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{latestReport.connections}</p>
                    <p className="text-muted-foreground text-xs">Connections</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  View Report <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
