import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Radio, FileText, Download, Loader2, Users, Sparkles, Video, Link2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getCookie } from "@/lib/utils/cookies";
import { decodeObjectStrings } from "@/lib/utils/decode-utf8";
import { EventsDataTable } from "@/components/events/EventsDataTable";
import { 
  YearFilter, 
  MonthFilter, 
  filterByYear, 
  filterByMonth 
} from "@/components/events/EventFilters";

interface MeetupEvent {
  event_id: string;
  hs_event_record_id: string;
  event_name: string;
  slug: string;
  date: string;
  time: string;
  timezone: string;
  status: string;
  reports_published: boolean;
  registrants: number;
  attendees: number;
  connections: number;
  report_downloaded: boolean;
  last_downloaded_at: string | null;
  last_downloaded_by: string | null;
  download_count: number;
}

interface MeetupResponse {
  success: boolean;
  data: {
    events: MeetupEvent[];
    meta: {
      total_events: number;
      total_registrants: number;
      total_attendees: number;
      total_connections: number;
    };
  };
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (timeStr: string, timezone: string) => {
  if (!timeStr) return timezone || "";
  const [hours, minutes] = timeStr.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm} ${timezone || ""}`;
};

const formatDateTime = (dateTimeStr: string) => {
  if (!dateTimeStr) return "";
  const safe = dateTimeStr.replace(" ", "T");
  const date = new Date(safe);
  if (Number.isNaN(date.getTime())) return dateTimeStr;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getEventStatus = (status: string): "upcoming" | "live" | "completed" => {
  if (status === "completed") return "completed";
  if (status === "live" || status === "ongoing") return "live";
  return "upcoming";
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
    <div className="flex gap-2">
      {[
        { value: days, label: "D" },
        { value: hours, label: "H" },
        { value: minutes, label: "M" },
        { value: seconds, label: "S" },
      ].map((item) => (
        <div key={item.label} className="flex items-center gap-0.5">
          <span className="bg-primary/10 text-primary font-bold text-sm px-2 py-1 rounded">
            {String(item.value).padStart(2, "0")}
          </span>
          <span className="text-xs text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default function VirtualMeetups() {
  const [events, setEvents] = useState<MeetupEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [meta, setMeta] = useState<MeetupResponse["data"]["meta"] | null>(null);
  
  // Filter states
  const [yearFilter, setYearFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("All");

  useEffect(() => {
    const fetchMeetupData = async () => {
      try {
        const portalToken = getCookie("portal_token");
        if (!portalToken) {
          toast({
            title: "Error",
            description: "Session expired. Please log in again.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/virtual-events-proxy?action=meetup`,
          {
            headers: {
              Authorization: `Bearer ${portalToken}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch meetup data");
        }

        const result: MeetupResponse = await response.json();
        const decodedResult = decodeObjectStrings(result) as MeetupResponse;

        if (decodedResult.success && decodedResult.data?.events) {
          setEvents(decodedResult.data.events);
          setMeta(decodedResult.data.meta);
        }
      } catch (error) {
        console.error("Error fetching meetup data:", error);
        toast({
          title: "Error",
          description: "Failed to load meetup events.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMeetupData();
  }, []);

  const handleDownloadReport = async (event: MeetupEvent) => {
    const portalToken = getCookie("portal_token");
    if (!portalToken) {
      toast({
        title: "Error",
        description: "Please login to download reports.",
        variant: "destructive",
      });
      return;
    }

    setDownloadingId(event.event_id);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/virtual-events-proxy?action=download-meetup&id=${event.hs_event_record_id}`,
        {
          headers: {
            Authorization: `Bearer ${portalToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to download report");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${event.event_name.replace(/\s+/g, "_")}_Report.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Report Downloaded",
        description: `${event.event_name} report has been downloaded.`,
      });
    } catch (error) {
      console.error("Error downloading report:", error);
      toast({
        title: "Download Failed",
        description: "Failed to download the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  // Group events by status
  const liveEvents = events.filter((e) => getEventStatus(e.status) === "live");
  const upcomingEvents = events.filter((e) => getEventStatus(e.status) === "upcoming");
  const completedEvents = events.filter((e) => getEventStatus(e.status) === "completed");

  // Apply filters to completed events
  const filteredCompletedEvents = useMemo(() => {
    let filtered = completedEvents;
    filtered = filterByYear(filtered, yearFilter);
    filtered = filterByMonth(filtered, monthFilter);
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [completedEvents, yearFilter, monthFilter]);

  // Calculate stats from meta or events
  const totalEvents = meta?.total_events ?? events.length;
  const totalAttendees = meta?.total_attendees ?? events.reduce((sum, e) => sum + (e.attendees || 0), 0);
  const totalConnections = meta?.total_connections ?? events.reduce((sum, e) => sum + (e.connections || 0), 0);

  const columns = [
    {
      key: "event",
      header: "Event",
      render: (event: MeetupEvent) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <Video className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">{event.event_name}</p>
            {event.time && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <Clock className="h-3 w-3" />
                {formatTime(event.time, event.timezone)}
              </div>
            )}
            {event.report_downloaded && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Downloaded by {event.last_downloaded_by}
                {event.last_downloaded_at && ` • ${formatDateTime(event.last_downloaded_at)}`}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (event: MeetupEvent) => (
        <span className="text-sm">{formatDate(event.date)}</span>
      ),
    },
    {
      key: "registrants",
      header: "Registrants",
      className: "text-center",
      render: (event: MeetupEvent) => (
        <span className="font-medium">{event.registrants.toLocaleString()}</span>
      ),
    },
    {
      key: "attendees",
      header: "Attendees",
      className: "text-center",
      render: (event: MeetupEvent) => (
        <span className="font-medium">{event.attendees.toLocaleString()}</span>
      ),
    },
    {
      key: "connections",
      header: "Connections",
      className: "text-center",
      render: (event: MeetupEvent) => (
        <span className="font-medium">{event.connections?.toLocaleString() || 0}</span>
      ),
    },
    {
      key: "download",
      header: "Report",
      className: "text-right",
      render: (event: MeetupEvent) => (
        event.reports_published ? (
          <Button
            variant="success"
            size="sm"
            disabled={downloadingId === event.event_id}
            onClick={(e) => {
              e.stopPropagation();
              handleDownloadReport(event);
            }}
          >
            {downloadingId === event.event_id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {downloadingId === event.event_id ? "Downloading..." : "Download"}
          </Button>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">Pending</Badge>
        )
      ),
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">1:1 Profile Evaluation</h1>
          <p className="text-muted-foreground mt-1">All meetup events - upcoming, ongoing, and past</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Video className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalEvents}</p>
                  <p className="text-xs text-muted-foreground">Total Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalAttendees.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Attendees</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Link2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalConnections.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Connections</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Events */}
        {liveEvents.length > 0 && (
          <Card className="border-red-500/30 bg-gradient-to-r from-red-500/5 to-transparent">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Radio className="h-5 w-5 text-red-500 animate-pulse" />
                Live Now
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {liveEvents.map((event) => (
                <div
                  key={event.event_id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-lg bg-red-100 dark:bg-red-900/50">
                      <Radio className="h-5 w-5 text-red-600 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{event.event_name}</h4>
                        <Badge className="bg-red-500 text-white border-0">Live Now</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(event.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatTime(event.time, event.timezone)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {event.attendees} / {event.registrants} attending
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((event, index) => (
                  <div
                    key={event.event_id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                        <Video className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{event.event_name}</h4>
                          <Badge
                            variant="outline"
                            className="border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950"
                          >
                            Upcoming
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(event.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatTime(event.time, event.timezone)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {index === 0 && <CountdownTimer targetDate={event.date} />}
                      <div className="text-right">
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {event.registrants} registered
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        )}

        {/* Completed Events with Reports - DataTable */}
        {completedEvents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                Past Events & Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EventsDataTable
                data={filteredCompletedEvents}
                columns={columns}
                searchPlaceholder="Search events..."
                searchKey={(event) => event.event_name}
                filterSlot={
                  <>
                    <YearFilter value={yearFilter} onChange={setYearFilter} />
                    <MonthFilter value={monthFilter} onChange={setMonthFilter} />
                  </>
                }
                emptyMessage="No completed events found"
              />
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {events.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No meetup events yet</h3>
              <p className="text-muted-foreground mt-1">Virtual meetup events will appear here</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
