import { useState, useEffect } from "react";
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
  Users,
  Sparkles,
  Radio,
  FileText,
  Download,
  Loader2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { decodeObjectStrings } from "@/lib/utils/decode-utf8";

// Mock data removed - using real API data now

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
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

const BSFReports = () => {
  const navigate = useNavigate();
  const { portalToken } = useAuth();
  const [apiEvents, setApiEvents] = useState<Array<{
    id: string;
    eventName: string;
    city: string;
    date: string;
    venue: string;
    registrants: number;
    attendees: number;
    connections: number;
    event_type?: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBSFEvents = async () => {
      if (!portalToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://seedglobaleducation.com/api/assist/in-person-event/bsf`,
          {
            headers: {
              Authorization: `Bearer ${portalToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch BSF events");
        }

        const result = await response.json();
        // Decode UTF-8 encoded strings to fix special characters
        const decodedResult = decodeObjectStrings(result);
        console.log("BSF API response:", decodedResult);

        if (decodedResult.success && decodedResult.data?.events) {
          const transformedEvents = decodedResult.data.events.map((event: any) => ({
            id: event.event_id,
            eventName: `BSF ${event.city} ${new Date(event.date).getFullYear()}`,
            city: event.city,
            date: event.date,
            venue: event.venue_name,
            registrants: event.registrants || 0,
            attendees: event.attendees || 0,
            connections: 0,
            event_type: event.event_type,
          }));
          setApiEvents(transformedEvents);
        }
      } catch (error) {
        console.error("Error fetching BSF events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBSFEvents();
  }, [portalToken]);

  // Use API events (no more mock data)
  const allEvents = apiEvents;
  
  const upcomingEvents = allEvents.filter(e => getEventStatus(e.date) === "upcoming");
  const liveEvents = allEvents.filter(e => getEventStatus(e.date) === "live");
  const completedEvents = allEvents.filter(e => getEventStatus(e.date) === "completed");
  
  const nextUpcoming = upcomingEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (reportId: string, eventName: string) => {
    if (!portalToken) {
      toast({ title: "Error", description: "Please login to download reports.", variant: "destructive" });
      return;
    }

    setDownloadingId(reportId);
    
    try {
      const response = await fetch(
        `https://seedglobaleducation.com/api/assist/in-person-event/bsf/reports.php?id=${reportId}`,
        {
          headers: {
            Authorization: `Bearer ${portalToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download report");
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${eventName.replace(/\s+/g, "_")}_Report.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({ title: "Report Downloaded", description: `${eventName} report has been downloaded.` });
    } catch (error) {
      console.error("Error downloading report:", error);
      toast({ title: "Download Failed", description: "Failed to download the report. Please try again.", variant: "destructive" });
    } finally {
      setDownloadingId(null);
    }
  };

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
          <p className="text-muted-foreground mt-1">All BSF events - upcoming, ongoing, and past</p>
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
                        <Badge className="bg-red-500 text-white border-0">
                          Live Now
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

        {/* Completed Events with Reports */}
        {completedEvents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                Past Events & Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {completedEvents
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-muted/50 cursor-pointer"
                  onClick={() => navigate(`/reports/${event.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-lg bg-muted">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{event.eventName}</h4>
                        <Badge variant="secondary">Completed</Badge>
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
                  <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-semibold">{event.registrants}</p>
                        <p className="text-muted-foreground text-xs">Registered</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">{event.attendees}</p>
                        <p className="text-muted-foreground text-xs">Attended</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">{event.connections}</p>
                        <p className="text-muted-foreground text-xs">Connections</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      disabled={downloadingId === event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(event.id, event.eventName);
                      }}
                    >
                      {downloadingId === event.id ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-1" />
                      )}
                      {downloadingId === event.id ? "Downloading..." : "Report"}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {allEvents.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No events yet</h3>
              <p className="text-muted-foreground mt-1">Business School Festival events will appear here</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BSFReports;
