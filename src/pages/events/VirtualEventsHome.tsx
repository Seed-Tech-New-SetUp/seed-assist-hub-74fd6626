import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  UserCheck, 
  Calendar, 
  Clock, 
  ArrowRight,
  FileText,
  CalendarClock,
  Monitor,
  Video
} from "lucide-react";
import { getCookie } from "@/lib/utils/cookies";
import { toast } from "sonner";

interface VirtualOverviewData {
  registrations: number;
  attended: number;
  total_events: number;
  next_upcoming_event: {
    event_id: string;
    title: string;
    date: string;
    start_time: string;
    type: string;
    registrations: number;
  } | null;
  latest_report_published: {
    event_id: string;
    title: string;
    date: string;
    start_time: string;
    type: string;
    registrations: number;
    attended: number;
  } | null;
}

const useCountdown = (targetDate: string, targetTime?: string) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      let fullDateTime = targetDate;
      if (targetTime) {
        fullDateTime = `${targetDate}T${targetTime}`;
      }
      const difference = new Date(fullDateTime).getTime() - new Date().getTime();
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
  }, [targetDate, targetTime]);

  return timeLeft;
};

const CountdownTimer = ({ targetDate, targetTime }: { targetDate: string; targetTime?: string }) => {
  const { days, hours, minutes, seconds } = useCountdown(targetDate, targetTime);

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

const TypeBadge = ({ type }: { type: string }) => {
  const config: Record<string, { label: string; className: string }> = {
    masterclass: { label: "Masterclass", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
    webinar: { label: "Webinar", className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  };

  const normalizedType = type?.toLowerCase() || 'webinar';
  const { label, className } = config[normalizedType] || config.webinar;
  return <Badge variant="secondary" className={className}>{label}</Badge>;
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (timeStr: string) => {
  // Handle time string like "14:00:00"
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${String(hour12).padStart(2, '0')}:${minutes} ${ampm}`;
};

export default function VirtualEventsHome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState<VirtualOverviewData | null>(null);

  useEffect(() => {
    const fetchOverview = async () => {
      const portalToken = getCookie("portal_token");
      if (!portalToken) {
        toast.error("Please log in to view virtual events");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/virtual-events-proxy`,
          {
            headers: {
              Authorization: `Bearer ${portalToken}`,
            },
          }
        );

        const result = await response.json();

        if (result.success && result.data) {
          setOverviewData(result.data);
        } else {
          toast.error("Failed to load virtual events data");
        }
      } catch (error) {
        console.error("Error fetching virtual events overview:", error);
        toast.error("Failed to load virtual events data");
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Virtual Events</h1>
          <p className="text-muted-foreground mt-1">Overview of your online masterclasses and webinars</p>
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
                  {loading ? (
                    <Skeleton className="h-8 w-20 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold">{(overviewData?.registrations || 0).toLocaleString()}</p>
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
                  <p className="text-sm text-muted-foreground">Total Attended</p>
                  {loading ? (
                    <Skeleton className="h-8 w-20 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold">{(overviewData?.attended || 0).toLocaleString()}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                  <Video className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                  {loading ? (
                    <Skeleton className="h-8 w-20 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold">{(overviewData?.total_events || 0).toLocaleString()}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Upcoming Event with Countdown */}
        {loading ? (
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Next Upcoming Event</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-16 w-72" />
              </div>
            </CardContent>
          </Card>
        ) : overviewData?.next_upcoming_event ? (
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Next Upcoming Event</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <TypeBadge type={overviewData.next_upcoming_event.type} />
                  <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950">
                    Upcoming
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{overviewData.next_upcoming_event.title}</h3>
                  <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {formatDate(overviewData.next_upcoming_event.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {formatTime(overviewData.next_upcoming_event.start_time)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Monitor className="h-4 w-4" />
                      Online Event
                    </span>
                  </div>
                  <p className="text-sm">
                    <span className="font-medium text-foreground">{overviewData.next_upcoming_event.registrations}</span>
                    <span className="text-muted-foreground"> registrations so far</span>
                  </p>
                </div>
                <div className="flex flex-col items-start lg:items-end gap-4">
                  <CountdownTimer 
                    targetDate={overviewData.next_upcoming_event.date} 
                    targetTime={overviewData.next_upcoming_event.start_time} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-muted">
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                <CalendarClock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No upcoming virtual events scheduled</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Latest Published Report */}
        {loading ? (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Latest Published Report</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg border">
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            </CardContent>
          </Card>
        ) : overviewData?.latest_report_published ? (
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
                onClick={() => navigate(`/reports/${overviewData.latest_report_published!.event_id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-lg bg-muted">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium">{overviewData.latest_report_published.title}</h4>
                      <TypeBadge type={overviewData.latest_report_published.type} />
                      <Badge variant="secondary">Report Published</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(overviewData.latest_report_published.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(overviewData.latest_report_published.start_time)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden md:flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-semibold">{overviewData.latest_report_published.registrations}</p>
                      <p className="text-muted-foreground text-xs">Registered</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{overviewData.latest_report_published.attended}</p>
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
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Latest Published Report</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-6">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No published reports yet</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}