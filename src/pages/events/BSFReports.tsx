import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  MapPin, 
  Users,
  Sparkles,
  Radio,
  FileText,
  Download,
  Loader2,
  Building2,
  UserCheck
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { extractFilenameFromHeader, buildBSFFallbackFilename } from "@/lib/utils/download-filename";
import { decodeObjectStrings } from "@/lib/utils/decode-utf8";
import { EventsDataTable } from "@/components/events/EventsDataTable";
import { 
  YearFilter, 
  SeasonFilter, 
  filterByYear, 
  filterBySeason 
} from "@/components/events/EventFilters";

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDateTime = (dateTimeStr: string) => {
  const safe = dateTimeStr.replace(" ", "T");
  const date = new Date(safe);
  if (Number.isNaN(date.getTime())) return dateTimeStr;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getEventStatus = (dateStr: string): "upcoming" | "live" | "completed" => {
  const eventDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);
  
  const diffDays = Math.floor((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays > 0) return "upcoming";
  if (diffDays === 0) return "live";
  return "completed";
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

interface BSFEvent {
  id: string;
  eventName: string;
  city: string;
  date: string;
  venue: string;
  registrants: number;
  attendees: number;
  femalePercentage: number;
  report_downloaded?: boolean;
  last_downloaded_at?: string | null;
  last_downloaded_by?: string | null;
  download_count?: number;
}

interface ApiMeta {
  totalEvents: number;
  totalRegistrants: number;
  totalAttendees: number;
  totalCities: number;
}

const BSFReports = () => {
  const { portalToken } = useAuth();
  const [apiEvents, setApiEvents] = useState<BSFEvent[]>([]);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
  // Filter states
  const [yearFilter, setYearFilter] = useState("All");
  const [seasonFilter, setSeasonFilter] = useState("All");

  useEffect(() => {
    const fetchBSFEvents = async () => {
      if (!portalToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bsf-proxy`,
          {
            headers: {
              Authorization: `Bearer ${portalToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch Business School Festival events");
        }

        const result = await response.json();
        const decodedResult = decodeObjectStrings(result);

        if (decodedResult.success && decodedResult.data?.events) {
          const transformedEvents = decodedResult.data.events.map((event: any) => ({
            id: event.event_id,
            eventName: `Business School Festival ${event.city} ${new Date(event.date).getFullYear()}`,
            city: event.city,
            date: event.date,
            venue: event.venue_name,
            registrants: event.registrants || 0,
            attendees: event.attendees || 0,
            femalePercentage: event.female_candidates_percentage || 0,
            report_downloaded: Boolean(event.report_downloaded),
            last_downloaded_at: event.last_downloaded_at ?? null,
            last_downloaded_by: event.last_downloaded_by ?? null,
            download_count: typeof event.download_count === "number" ? event.download_count : 0,
          }));
          setApiEvents(transformedEvents);
          
          if (decodedResult.data.meta) {
            setMeta(decodedResult.data.meta);
          } else {
            const uniqueCities = new Set(transformedEvents.map((e: any) => e.city));
            setMeta({
              totalEvents: transformedEvents.length,
              totalRegistrants: transformedEvents.reduce((sum: number, e: any) => sum + e.registrants, 0),
              totalAttendees: transformedEvents.reduce((sum: number, e: any) => sum + e.attendees, 0),
              totalCities: uniqueCities.size,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching Business School Festival events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBSFEvents();
  }, [portalToken]);

  const allEvents = apiEvents;
  
  const upcomingEvents = allEvents.filter(e => getEventStatus(e.date) === "upcoming");
  const liveEvents = allEvents.filter(e => getEventStatus(e.date) === "live");
  const completedEvents = allEvents.filter(e => getEventStatus(e.date) === "completed");
  
  // Apply filters to completed events
  const filteredCompletedEvents = useMemo(() => {
    let filtered = completedEvents;
    filtered = filterByYear(filtered, yearFilter);
    filtered = filterBySeason(filtered, seasonFilter);
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [completedEvents, yearFilter, seasonFilter]);

  const handleDownload = async (event: BSFEvent) => {
    if (!portalToken) {
      toast({ title: "Error", description: "Please login to download reports.", variant: "destructive" });
      return;
    }

    setDownloadingId(event.id);
    
    try {
      const response = await fetch(
        `https://seedglobaleducation.com/api/assist/in-person-event/bsf/reports.php?id=${event.id}`,
        {
          headers: {
            Authorization: `Bearer ${portalToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download report");
      }

      const fallbackName = buildBSFFallbackFilename("Business_School_Festival", event.city, event.date);
      const filename = extractFilenameFromHeader(response, fallbackName);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({ title: "Report Downloaded", description: `${event.eventName} report has been downloaded.` });
    } catch (error) {
      console.error("Error downloading report:", error);
      toast({ title: "Download Failed", description: "Failed to download the report. Please try again.", variant: "destructive" });
    } finally {
      setDownloadingId(null);
    }
  };

  const columns = [
    {
      key: "event",
      header: "Event",
      render: (event: BSFEvent) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">{event.eventName}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <MapPin className="h-3 w-3" />
              {event.venue || event.city}
            </div>
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
      render: (event: BSFEvent) => (
        <span className="text-sm">{formatDate(event.date)}</span>
      ),
    },
    {
      key: "city",
      header: "City",
      render: (event: BSFEvent) => (
        <span className="text-sm">{event.city}</span>
      ),
    },
    {
      key: "registrants",
      header: "Registrants",
      className: "text-center",
      render: (event: BSFEvent) => (
        <span className="font-medium">{event.registrants.toLocaleString()}</span>
      ),
    },
    {
      key: "attendees",
      header: "Attendees",
      className: "text-center",
      render: (event: BSFEvent) => (
        <span className="font-medium">{event.attendees.toLocaleString()}</span>
      ),
    },
    {
      key: "female",
      header: "Female %",
      className: "text-center",
      render: (event: BSFEvent) => (
        <span className="font-medium text-pink-600">{event.femalePercentage}%</span>
      ),
    },
    {
      key: "download",
      header: "Report",
      className: "text-right",
      render: (event: BSFEvent) => (
        <Button
          variant="success"
          size="sm"
          disabled={downloadingId === event.id}
          onClick={(e) => {
            e.stopPropagation();
            handleDownload(event);
          }}
        >
          {downloadingId === event.id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {downloadingId === event.id ? "Downloading..." : "Download"}
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Business School Festivals</h1>
          <p className="text-muted-foreground mt-1">All Business School Festival events - upcoming, ongoing, and past</p>
        </div>

        {/* Summary Stats - commented out per user request */}
        {/* {meta && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10"><FileText className="h-5 w-5 text-primary" /></div>
                  <div><p className="text-2xl font-bold text-foreground">{meta.totalEvents}</p><p className="text-xs text-muted-foreground">Total Events</p></div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10"><Building2 className="h-5 w-5 text-accent-foreground" /></div>
                  <div><p className="text-2xl font-bold text-foreground">{meta.totalCities}</p><p className="text-xs text-muted-foreground">Cities Covered</p></div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary/50"><Users className="h-5 w-5 text-secondary-foreground" /></div>
                  <div><p className="text-2xl font-bold text-foreground">{meta.totalRegistrants.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Registrants</p></div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10"><UserCheck className="h-5 w-5 text-primary" /></div>
                  <div><p className="text-2xl font-bold text-foreground">{meta.totalAttendees.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Attendees</p></div>
                </div>
              </CardContent>
            </Card>
          </div>
        )} */}

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
                  key={event.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-lg bg-red-100 dark:bg-red-900/50">
                      <Radio className="h-5 w-5 text-red-600 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{event.eventName}</h4>
                        <Badge className="bg-red-500 text-white border-0">Live Now</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(event.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {event.venue || event.city}
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
                  key={event.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{event.eventName}</h4>
                        <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950">
                          Upcoming
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(event.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {event.venue || event.city}
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
                searchKey={(event) => `${event.eventName} ${event.city} ${event.venue}`}
                filterSlot={
                  <>
                    <YearFilter value={yearFilter} onChange={setYearFilter} />
                    <SeasonFilter value={seasonFilter} onChange={setSeasonFilter} />
                  </>
                }
                emptyMessage="No completed events found"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BSFReports;
