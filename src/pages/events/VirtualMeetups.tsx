import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Video, Users, UserCheck, Download, MoreHorizontal, Search, Calendar, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { decodeObjectStrings } from "@/lib/utils/decode-utf8";

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
  female_percentage: number;
  prospects: number;
  report_downloaded: boolean;
  last_downloaded_at: string | null;
  last_downloaded_by: string | null;
  download_count: number;
}

interface MeetupApiResponse {
  success: boolean;
  data: {
    events: MeetupEvent[];
    meta: {
      total_events: number;
      total_registrants: number;
      total_attendees: number;
    };
  };
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDownloadDate = (dateTimeStr: string | null) => {
  if (!dateTimeStr) return null;
  const safe = dateTimeStr.replace(" ", "T");
  const date = new Date(safe);
  if (Number.isNaN(date.getTime())) return dateTimeStr;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function VirtualMeetups() {
  const { portalToken } = useAuth();
  const token = portalToken;
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [meetupEvents, setMeetupEvents] = useState<MeetupEvent[]>([]);
  const [meta, setMeta] = useState({ total_events: 0, total_registrants: 0, total_attendees: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeetups = async () => {
      if (!token) return;
      
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/virtual-events-proxy?action=meetups`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        const data: MeetupApiResponse = await response.json();
        
        if (data.success && data.data) {
          const decoded = decodeObjectStrings(data.data);
          setMeetupEvents(decoded.events || []);
          setMeta(decoded.meta || { total_events: 0, total_registrants: 0, total_attendees: 0 });
        }
      } catch (error) {
        console.error('Failed to fetch meetups:', error);
        toast.error('Failed to load meetup data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeetups();
  }, [token]);

  // Filter events
  const filteredEvents = meetupEvents.filter(event => {
    const matchesSearch = event.event_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = yearFilter === "all" || event.date.startsWith(yearFilter);
    return matchesSearch && matchesYear;
  });

  // Get unique years for filter
  const years = [...new Set(meetupEvents.map(e => e.date.substring(0, 4)))].sort((a, b) => b.localeCompare(a));

  const handleDownloadReport = async (event: MeetupEvent) => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    setDownloadingId(event.event_id);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/virtual-events-proxy?action=download-meetup&id=${event.event_id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meetup-report-${event.slug || event.event_id}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Report downloaded: ${event.event_name}`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error("Failed to download report");
    } finally {
      setDownloadingId(null);
    }
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
        <Tabs defaultValue="meetups">
          <TabsList>
            <TabsTrigger value="masterclass" asChild>
              <Link to="/events/virtual/masterclass">Masterclass</Link>
            </TabsTrigger>
            <TabsTrigger value="meetups">1:1 Profile Evaluation</TabsTrigger>
          </TabsList>

          <TabsContent value="meetups" className="space-y-6 mt-6">
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
                      {years.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
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
                      <p className="text-2xl font-bold">{meta.total_events}</p>
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
                      <p className="text-2xl font-bold">{meta.total_registrants.toLocaleString()}</p>
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
                      <p className="text-2xl font-bold">{meta.total_attendees.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Total Attendees</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reports Table */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">1:1 Profile Evaluation Reports</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No events found
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Registrants</TableHead>
                        <TableHead className="text-right">Attendees</TableHead>
                        <TableHead>Last Downloaded</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEvents.map((event) => (
                        <TableRow key={event.event_id}>
                          <TableCell className="font-medium">{event.event_name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDate(event.date)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{event.registrants.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{event.attendees.toLocaleString()}</TableCell>
                          <TableCell>
                            {event.last_downloaded_by ? (
                              <div className="text-xs">
                                <p className="text-foreground">{event.last_downloaded_by}</p>
                                <p className="text-muted-foreground">{formatDownloadDate(event.last_downloaded_at)}</p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">Never</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {event.reports_published ? (
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
                                  <DropdownMenuItem onClick={() => handleDownloadReport(event)}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Report
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ) : (
                              <span className="text-xs text-muted-foreground">Pending</span>
                            )}
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
