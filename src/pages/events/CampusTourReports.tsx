import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Sparkles, 
  Radio,
  FileText, 
  Building2, 
  UserCheck, 
  Download,
  Loader2 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { decodeObjectStrings } from "@/lib/utils/decode-utf8";

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
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getEventStatus = (dateStr: string, status?: string): "upcoming" | "live" | "completed" => {
  if (status === "completed") return "completed";
  
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

interface CampusTourEvent {
  id: string;
  eventName: string;
  subProductName: string;
  city: string;
  country: string;
  date: string;
  location: string;
  registrants: number;
  attended: number;
  connections: number;
  status: string;
  report_downloaded: boolean;
  lastDownloadedBy: string | null;
  lastDownloadedAt: string | null;
}

interface ApiMeta {
  totalEvents: number;
  campusReached: number;
  attendeesReached: number;
  studentsConnected: number;
}

const CampusTourReports = () => {
  const { portalToken } = useAuth();
  const [events, setEvents] = useState<CampusTourEvent[]>([]);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampusTourEvents = async () => {
      if (!portalToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/campus-tour-proxy`,
          {
            headers: {
              Authorization: `Bearer ${portalToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch Campus Tour events");
        }

        const result = await response.json();
        const decodedResult = decodeObjectStrings(result);

        if (decodedResult.success && decodedResult.data) {
          const transformedEvents = decodedResult.data.events.map((event: any) => ({
            id: event.event_id,
            eventName: event.eventName,
            subProductName: event.subProductName || "Campus Tour",
            city: event.city,
            country: event.country,
            date: event.date,
            location: event.location,
            registrants: event.registrants || 0,
            attended: event.attended || 0,
            connections: event.connections || 0,
            status: event.status || "completed",
            report_downloaded: Boolean(event.report_downloaded),
            lastDownloadedBy: event.lastDownloadedBy ?? null,
            lastDownloadedAt: event.lastDownloadedAt ?? null,
          }));
          setEvents(transformedEvents);
          setMeta(decodedResult.data.meta);
        }
      } catch (error) {
        console.error("Error fetching Campus Tour events:", error);
        toast({
          title: "Error",
          description: "Failed to load Campus Tour events",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCampusTourEvents();
  }, [portalToken]);

  const handleDownload = async (eventId: string, eventName: string) => {
    if (!portalToken) {
      toast({ title: "Error", description: "Please log in to download reports", variant: "destructive" });
      return;
    }

    setDownloadingId(eventId);
    try {
      const response = await fetch(
        `https://seedglobaleducation.com/api/assist/in-person-event/campus-tour/reports.php?id=${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${portalToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download report");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${eventName.replace(/\s+/g, "_")}_Report.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({ title: "Report Downloaded", description: `${eventName} report has been downloaded.` });
    } catch (error) {
      console.error("Download error:", error);
      toast({ title: "Download Failed", description: "Could not download the report", variant: "destructive" });
    } finally {
      setDownloadingId(null);
    }
  };

  // Categorize events
  const liveEvents = events.filter((e) => getEventStatus(e.date, e.status) === "live");
  const upcomingEvents = events.filter((e) => getEventStatus(e.date, e.status) === "upcoming");
  const pastEvents = events.filter((e) => getEventStatus(e.date, e.status) === "completed");

  // Stats from API meta
  const totalEvents = meta?.totalEvents ?? events.length;
  const totalCampuses = meta?.campusReached ?? 0;
  const totalAttendees = meta?.attendeesReached ?? 0;
  const totalStudents = meta?.studentsConnected ?? 0;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Campus Tour Reports</h1>
            <p className="text-muted-foreground mt-1">View and download reports from Campus Tour events</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10"><FileText className="h-5 w-5 text-primary" /></div>
                <div><p className="text-2xl font-bold text-foreground">{totalEvents}</p><p className="text-xs text-muted-foreground">Total Events</p></div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10"><Building2 className="h-5 w-5 text-accent-foreground" /></div>
                <div><p className="text-2xl font-bold text-foreground">{totalCampuses}</p><p className="text-xs text-muted-foreground">Campuses Reached</p></div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/50"><Users className="h-5 w-5 text-secondary-foreground" /></div>
                <div><p className="text-2xl font-bold text-foreground">{totalAttendees.toLocaleString()}</p><p className="text-xs text-muted-foreground">Attendees Reached</p></div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10"><UserCheck className="h-5 w-5 text-primary" /></div>
                <div><p className="text-2xl font-bold text-foreground">{totalStudents.toLocaleString()}</p><p className="text-xs text-muted-foreground">Students Connected</p></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Events */}
        {liveEvents.length > 0 && (
          <Card className="border-red-500/30 bg-gradient-to-br from-red-500/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-display">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                Live Now
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {liveEvents.map((event) => (
                <Card key={event.id} className="bg-card/50 border-border/50">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive" className="animate-pulse">
                            <Radio className="h-3 w-3 mr-1" /> Live
                          </Badge>
                          <span className="font-semibold text-foreground">{event.eventName}</span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {event.location}</span>
                          <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {formatDate(event.date)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-lg font-bold text-foreground">{event.registrants}</p>
                          <p className="text-xs text-muted-foreground">Registrants</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-foreground">{event.attended}</p>
                          <p className="text-xs text-muted-foreground">Attended</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-display">
                <Sparkles className="h-5 w-5 text-primary" /> Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingEvents.map((event) => (
                <Card key={event.id} className="bg-card/50 border-border/50">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Upcoming</Badge>
                          <span className="font-semibold text-foreground">{event.eventName}</span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {event.location}</span>
                          <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {formatDate(event.date)}</span>
                        </div>
                      </div>
                      <CountdownTimer targetDate={event.date} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Past Events & Reports */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-display">Past Events & Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {pastEvents.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No past events found</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pastEvents.map((event) => (
                  <Card key={event.id} className="bg-card/50 border-border/50 hover:shadow-md transition-shadow">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-foreground line-clamp-2">{event.eventName}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" /> {event.location}
                          </p>
                        </div>
                        <Badge variant="outline" className="shrink-0">{event.city}</Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(event.date)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-muted/50 rounded p-2 text-center">
                          <p className="font-bold text-foreground">{event.registrants}</p>
                          <p className="text-xs text-muted-foreground">Registrants</p>
                        </div>
                        <div className="bg-muted/50 rounded p-2 text-center">
                          <p className="font-bold text-foreground">{event.attended}</p>
                          <p className="text-xs text-muted-foreground">Attended</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border/50">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full gap-2"
                          onClick={() => handleDownload(event.id, event.eventName)}
                          disabled={downloadingId === event.id}
                        >
                          {downloadingId === event.id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4" />
                              Download Report
                            </>
                          )}
                        </Button>
                        {event.report_downloaded ? (
                          <p className="text-xs text-muted-foreground mt-1 text-center">
                            Report downloaded
                            {event.lastDownloadedBy ? ` • Last by ${event.lastDownloadedBy}` : ""}
                            {event.lastDownloadedAt ? ` • ${formatDateTime(event.lastDownloadedAt)}` : ""}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-1 text-center">Report not downloaded yet</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CampusTourReports;
