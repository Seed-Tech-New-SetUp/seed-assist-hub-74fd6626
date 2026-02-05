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
  Building2, 
  UserCheck, 
  Download,
  Loader2 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { extractFilenameFromHeader, buildCampusTourFallbackFilename } from "@/lib/utils/download-filename";
import { decodeObjectStrings } from "@/lib/utils/decode-utf8";
import { EventsDataTable } from "@/components/events/EventsDataTable";
import { 
  YearFilter, 
  SeasonFilter, 
  CountryFilter,
  CityFilter,
  filterByYear, 
  filterBySeason,
  filterByCountry,
  filterByCity
} from "@/components/events/EventFilters";

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};

// Helper to get clean event name without city duplication
const getCleanEventName = (eventName: string, city: string): string => {
  if (!eventName) return "";
  if (!city) return eventName;
  
  // Check if eventName ends with the city name (case insensitive)
  const trimmedCity = city.trim();
  const eventNameTrimmed = eventName.trim();
  
  if (eventNameTrimmed.toLowerCase().endsWith(trimmedCity.toLowerCase())) {
    // Remove the city from the end of the event name
    const cleanName = eventNameTrimmed.slice(0, -trimmedCity.length).trim();
    // Remove trailing dash or hyphen if present
    return cleanName.replace(/[-–—]\s*$/, "").trim();
  }
  
  return eventName;
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
  campusName: string;
  country: string;
  date: string;
  location: string;
  registrants: number;
  attended: number;
  femalePercentage: number;
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
  totalRegistrants?: number;
  totalAttendees?: number;
}

const CampusTourReports = () => {
  const { portalToken } = useAuth();
  const [events, setEvents] = useState<CampusTourEvent[]>([]);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
  // Filter states
  const [yearFilter, setYearFilter] = useState("All");
  const [seasonFilter, setSeasonFilter] = useState("All");
  const [countryFilter, setCountryFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("All");

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
            campusName: event.campus_name || "",
            country: event.country,
            date: event.date,
            location: event.location,
            registrants: event.registrants || 0,
            attended: event.attended || 0,
            femalePercentage: event.female_candidates_percentage || 0,
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

  const handleDownload = async (event: CampusTourEvent) => {
    if (!portalToken) {
      toast({ title: "Error", description: "Please log in to download reports", variant: "destructive" });
      return;
    }

    setDownloadingId(event.id);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/campus-tour-proxy?id=${event.id}`,
        {
          headers: {
            Authorization: `Bearer ${portalToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download report");
      }

      const fallbackName = buildCampusTourFallbackFilename(
        "Campus_Tour",
        event.campusName || event.city,
        event.date
      );
      const filename = extractFilenameFromHeader(response, fallbackName);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({ title: "Report Downloaded", description: `${event.eventName} report has been downloaded.` });
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

  // Apply filters to past events
  const filteredPastEvents = useMemo(() => {
    let filtered = pastEvents;
    filtered = filterByYear(filtered, yearFilter);
    filtered = filterBySeason(filtered, seasonFilter);
    filtered = filterByCountry(filtered, countryFilter);
    filtered = filterByCity(filtered, cityFilter);
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [pastEvents, yearFilter, seasonFilter, countryFilter, cityFilter]);

  // Extract unique countries and cities for filter dropdowns
  const uniqueCountries = useMemo(() => {
    const countries = new Set(pastEvents.map(e => e.country).filter(Boolean));
    return Array.from(countries);
  }, [pastEvents]);

  const uniqueCities = useMemo(() => {
    let filtered = pastEvents;
    if (countryFilter !== "All") {
      filtered = filtered.filter(e => e.country === countryFilter);
    }
    const cities = new Set(filtered.map(e => e.city));
    return Array.from(cities);
  }, [pastEvents, countryFilter]);

  // Stats from API meta - calculate from events if not provided
  const totalEvents = meta?.totalEvents ?? events.length;
  const totalCampuses = meta?.campusReached ?? 0;
  const totalRegistrants = meta?.totalRegistrants ?? events.reduce((sum, e) => sum + e.registrants, 0);
  const totalAttendees = meta?.totalAttendees ?? events.reduce((sum, e) => sum + e.attended, 0);

  const columns = [
    {
      key: "event",
      header: "Event Name",
      sortKey: (event: CampusTourEvent) => event.eventName,
      render: (event: CampusTourEvent) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">
              {getCleanEventName(event.eventName, event.city)} - {event.campusName || event.city}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <MapPin className="h-3 w-3" />
              {event.location || event.city}
            </div>
            {event.report_downloaded && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Downloaded by {event.lastDownloadedBy}
                {event.lastDownloadedAt && ` • ${formatDateTime(event.lastDownloadedAt)}`}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      sortKey: (event: CampusTourEvent) => new Date(event.date),
      render: (event: CampusTourEvent) => (
        <span className="text-sm">{formatDate(event.date)}</span>
      ),
    },
    {
      key: "campus",
      header: "City/Campus",
      sortKey: (event: CampusTourEvent) => event.campusName || event.city,
      render: (event: CampusTourEvent) => (
        <span className="text-sm">{event.campusName || event.city}</span>
      ),
    },
    {
      key: "registrants",
      header: "Registrants",
      className: "text-center",
      sortKey: (event: CampusTourEvent) => event.registrants,
      render: (event: CampusTourEvent) => (
        <span className="font-medium">{event.registrants.toLocaleString()}</span>
      ),
    },
    {
      key: "attended",
      header: "Attended",
      className: "text-center",
      sortKey: (event: CampusTourEvent) => event.attended,
      render: (event: CampusTourEvent) => (
        <span className="font-medium">{event.attended.toLocaleString()}</span>
      ),
    },
    {
      key: "download",
      header: "Report",
      className: "text-right",
      render: (event: CampusTourEvent) => (
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
            <h1 className="text-2xl font-display font-bold text-foreground">Campus Tours</h1>
            <p className="text-muted-foreground mt-1">Connect with prospective students at campus events in top tier institutions globally</p>
          </div>
        </div>

        {/* Summary Stats - commented out per user request */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <div><p className="text-2xl font-bold text-foreground">{totalRegistrants.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Registrants</p></div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10"><UserCheck className="h-5 w-5 text-primary" /></div>
                <div><p className="text-2xl font-bold text-foreground">{totalAttendees.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Attendees</p></div>
              </div>
            </CardContent>
          </Card>
        </div> */}

        {/* Live Events section removed per user request */}

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

        {/* Past Events & Reports - DataTable */}
        {pastEvents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                Past Events & Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EventsDataTable
                data={filteredPastEvents}
                columns={columns}
                searchPlaceholder="Search events..."
                searchKey={(event) => `${event.eventName} ${event.city} ${event.location}`}
                filterSlot={
                  <>
                    <YearFilter value={yearFilter} onChange={setYearFilter} />
                    <SeasonFilter value={seasonFilter} onChange={setSeasonFilter} />
                    <CountryFilter value={countryFilter} onChange={setCountryFilter} regions={uniqueCountries} />
                    <CityFilter value={cityFilter} onChange={setCityFilter} cities={uniqueCities} />
                  </>
                }
                emptyMessage="No past events found"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CampusTourReports;
