import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Users, Download, MoreHorizontal, Search, Calendar, UserCheck, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { getCookie } from "@/lib/utils/cookies";
import { Skeleton } from "@/components/ui/skeleton";
import { decodeObjectStrings } from "@/lib/utils/decode-utf8";

interface MasterclassEvent {
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
  female_percentage: number;
  prospects: number;
  report_downloaded: boolean;
  last_downloaded_at: string | null;
  last_downloaded_by: string | null;
  download_count: number;
}

interface MasterclassResponse {
  success: boolean;
  data: {
    events: MasterclassEvent[];
    meta: {
      total_events: number;
      total_registrants: number;
      total_attendees: number;
    };
  };
}

export default function VirtualMasterclass() {
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [masterclassEvents, setMasterclassEvents] = useState<MasterclassEvent[]>([]);
  const [meta, setMeta] = useState<MasterclassResponse['data']['meta'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMasterclassData = async () => {
      try {
        const portalToken = getCookie('portal_token');
        if (!portalToken) {
          toast.error("Session expired. Please log in again.");
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/virtual-events-proxy?action=masterclass`,
          {
            headers: {
              Authorization: `Bearer ${portalToken}`,
            },
          }
        );

        const result: MasterclassResponse = await response.json();

        if (result.success && result.data) {
          const decodedEvents = decodeObjectStrings(result.data.events) as MasterclassEvent[];
          setMasterclassEvents(decodedEvents);
          setMeta(result.data.meta);
        } else {
          toast.error("Failed to fetch masterclass data");
        }
      } catch (error) {
        console.error("Error fetching masterclass data:", error);
        toast.error("Failed to fetch masterclass data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMasterclassData();
  }, []);

  // Filter events based on search and year
  const filteredEvents = masterclassEvents.filter((event) => {
    const matchesSearch = event.event_name.toLowerCase().includes(searchQuery.toLowerCase());
    const eventYear = new Date(event.date).getFullYear().toString();
    const matchesYear = yearFilter === "all" || eventYear === yearFilter;
    return matchesSearch && matchesYear;
  });

  // Get unique years for filter
  const availableYears = [...new Set(masterclassEvents.map(e => new Date(e.date).getFullYear()))].sort((a, b) => b - a);

  const handleDownloadReport = async (event: MasterclassEvent) => {
    if (!event.reports_published) {
      toast.error("Report not yet published for this event");
      return;
    }

    setDownloadingId(event.event_id);
    try {
      const portalToken = getCookie('portal_token');
      if (!portalToken) {
        toast.error("Session expired. Please log in again.");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/virtual-events-proxy?action=download&id=${event.event_id}`,
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
      a.download = `masterclass-report-${event.slug || event.event_id}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Report downloaded: ${event.event_name}`);
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("Failed to download report");
    } finally {
      setDownloadingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeStr: string, timezone: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm} ${timezone}`;
  };

  const getStatusBadge = (status: string, reportsPublished: boolean) => {
    if (status === "completed" && reportsPublished) {
      return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Report Available</Badge>;
    } else if (status === "completed") {
      return <Badge variant="secondary">Processing</Badge>;
    } else if (status === "upcoming") {
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Upcoming</Badge>;
    } else if (status === "live") {
      return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Live Now</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Virtual Event Reports</h1>
            <p className="text-muted-foreground mt-1">View reports from your virtual masterclass and meetup events</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="masterclass">
          <TabsList>
            <TabsTrigger value="masterclass">Masterclass</TabsTrigger>
            <TabsTrigger value="meetups" asChild>
              <Link to="/events/virtual/meetups">MeetUps</Link>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="masterclass" className="space-y-6 mt-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search events..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {availableYears.map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Video className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      {isLoading ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        <p className="text-2xl font-bold">{meta?.total_events ?? 0}</p>
                      )}
                      <p className="text-xs text-muted-foreground">Total Masterclasses</p>
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
                      {isLoading ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        <p className="text-2xl font-bold">{(meta?.total_registrants ?? 0).toLocaleString()}</p>
                      )}
                      <p className="text-xs text-muted-foreground">Total Registrants</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <UserCheck className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      {isLoading ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        <p className="text-2xl font-bold">{(meta?.total_attendees ?? 0).toLocaleString()}</p>
                      )}
                      <p className="text-xs text-muted-foreground">Total Attendees</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reports Table */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Masterclass Reports</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-64" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-8 w-24" />
                      </div>
                    ))}
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No masterclass events found</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event Name</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead className="text-right">Registrants</TableHead>
                        <TableHead className="text-right">Attendees</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Downloaded</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEvents.map((event) => (
                        <TableRow key={event.event_id}>
                          <TableCell className="font-medium max-w-[300px]">
                            <p className="truncate">{event.event_name}</p>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {formatDate(event.date)}
                              </div>
                              <span className="text-xs text-muted-foreground ml-6">
                                {formatTime(event.time, event.timezone)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{event.registrants.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{event.attendees.toLocaleString()}</TableCell>
                          <TableCell>
                            {getStatusBadge(event.status, event.reports_published)}
                          </TableCell>
                          <TableCell>
                            {event.last_downloaded_by ? (
                              <div className="text-xs">
                                <p className="text-foreground">{event.last_downloaded_by}</p>
                                <p className="text-muted-foreground">
                                  {event.last_downloaded_at ? formatDate(event.last_downloaded_at) : ''}
                                </p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">Never</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" disabled={downloadingId === event.event_id}>
                                  {downloadingId === event.event_id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <MoreHorizontal className="h-4 w-4" />
                                  )}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => handleDownloadReport(event)}
                                  disabled={!event.reports_published}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download Report
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}