import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { decodeObjectStrings } from "@/lib/utils/decode-utf8";

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

interface OverviewData {
  summary: {
    total_registrations: number;
    total_attended: number;
    total_connections: number;
    total_events: number;
    unique_cities: number;
    unique_countries: number;
  };
  by_event_type: {
    bsf: {
      events: number;
      registrations: number;
      attendees: number;
    };
    campus_tour: {
      events: number;
      registrations: number;
      attendees: number;
    };
  };
  next_event: {
    event_id: string;
    event_slug: string;
    event_type: string;
    city: string;
    country: string;
    date: string;
    start_time?: string;
    timezone?: string;
    registrant_count: number;
    venue_name?: string;
  } | null;
  latest_report: {
    event_id: string;
    event_slug: string;
    event_type: string;
    city: string;
    country: string;
    date: string;
    registrant_count: number;
    attendees_count: number;
  } | null;
}

const useCountdown = (targetDate: string | null) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!targetDate) return;

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

export default function InPersonEventsHome() {
  const navigate = useNavigate();
  const { portalToken, selectedSchool } = useAuth();
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOverviewData = async () => {
      if (!portalToken || !selectedSchool?.school_id) return;

      try {
        setLoading(true);
        const response = await fetch(
          `https://seedglobaleducation.com/api/assist/in-person-event/overview.php?school_id=${selectedSchool.school_id}`,
          {
            headers: {
              Authorization: `Bearer ${portalToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch overview data");
        }

        const result = await response.json();
        // Decode UTF-8 encoded strings to fix special characters
        const decodedResult = decodeObjectStrings(result);
        console.log("In-person overview API response:", decodedResult);
        if (decodedResult.success) {
          setOverviewData(decodedResult.data);
        } else {
          throw new Error(decodedResult.message || "Failed to fetch data");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, [portalToken, selectedSchool?.school_id]);

  const summary = overviewData?.summary;
  const nextEvent = overviewData?.next_event;
  const latestReport = overviewData?.latest_report;

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
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold">{summary?.total_registrations?.toLocaleString() || 0}</p>
                  )}
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
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold">{summary?.total_attended?.toLocaleString() || 0}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold">{summary?.total_events?.toLocaleString() || 0}</p>
                  )}
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
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold">{summary?.unique_cities || 0}</p>
                  )}
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
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold">{summary?.unique_countries || 0}</p>
                  )}
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
                <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950">
                  Upcoming
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">
                    {nextEvent.event_type} - {nextEvent.city}
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {formatDate(nextEvent.date)}
                      {nextEvent.start_time && ` at ${nextEvent.start_time.slice(0, 5)} ${nextEvent.timezone || ''}`}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {nextEvent.venue_name || `${nextEvent.city}, ${nextEvent.country}`}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-start lg:items-end gap-4">
                  <CountdownTimer targetDate={nextEvent.date} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Latest Published Report */}
        {latestReport && (
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
                onClick={() => navigate(`/events/in-person/campus-tours/${latestReport.event_slug}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-lg bg-muted">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{latestReport.event_type} - {latestReport.city}</h4>
                      <Badge variant="secondary">Report Published</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(latestReport.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {latestReport.city}, {latestReport.country}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden md:flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-semibold">{latestReport.registrant_count}</p>
                      <p className="text-muted-foreground text-xs">Registered</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{latestReport.attendees_count}</p>
                      <p className="text-muted-foreground text-xs">Attended</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    View Report <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No data states */}
        {!loading && !nextEvent && !latestReport && (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Events Yet</h3>
              <p className="text-muted-foreground">There are no upcoming events or published reports at the moment.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
