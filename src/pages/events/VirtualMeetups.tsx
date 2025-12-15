import { useState } from "react";
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
import { Video, Users, Link2, Download, MoreHorizontal, Search, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { exportToXLSX } from "@/lib/utils/xlsx-export";

// TODO: Replace with actual API call
// import { fetchMeetupReports } from "@/lib/api/reports";
const fetchMeetupReports = async () => {
  // Simulated API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return [
    {
      id: "1",
      eventName: "Asia MBA Meetup - Singapore",
      date: "2024-03-22",
      region: "Asia",
      attendees: 45,
      connections: 28,
      lastDownloadedBy: { name: "John Smith", date: "2024-03-24" },
    },
    {
      id: "2",
      eventName: "Europe MBA Meetup - London",
      date: "2024-03-15",
      region: "Europe",
      attendees: 62,
      connections: 35,
    },
    {
      id: "3",
      eventName: "North America Meetup - New York",
      date: "2024-03-08",
      region: "North America",
      attendees: 78,
      connections: 42,
      lastDownloadedBy: { name: "Sarah Johnson", date: "2024-03-10" },
    },
    {
      id: "4",
      eventName: "Middle East MBA Meetup - Dubai",
      date: "2024-02-28",
      region: "Middle East",
      attendees: 38,
      connections: 22,
    },
  ];
};

// TODO: Replace with actual API call for individual report data
const fetchMeetupReportData = async (eventId: string) => {
  // Simulated API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Return mock attendee data for the report
  return [
    { name: "John Doe", email: "john@example.com", company: "Tech Corp", registeredAt: "2024-03-20", attended: "Yes" },
    { name: "Jane Smith", email: "jane@example.com", company: "Finance Inc", registeredAt: "2024-03-19", attended: "Yes" },
    { name: "Bob Johnson", email: "bob@example.com", company: "Consulting LLC", registeredAt: "2024-03-18", attended: "No" },
  ];
};

export default function VirtualMeetups() {
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [meetupEvents, setMeetupEvents] = useState<Awaited<ReturnType<typeof fetchMeetupReports>>>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data on mount
  useState(() => {
    fetchMeetupReports().then(data => {
      setMeetupEvents(data);
      setIsLoading(false);
    });
  });

  // Calculate stats
  const totalEvents = meetupEvents.length;
  const totalAttendees = meetupEvents.reduce((sum, e) => sum + e.attendees, 0);
  const totalConnections = meetupEvents.reduce((sum, e) => sum + e.connections, 0);

  const handleDownloadReport = async (event: typeof meetupEvents[0]) => {
    try {
      const reportData = await fetchMeetupReportData(event.id);
      exportToXLSX(reportData, {
        filename: `meetup-report-${event.eventName.replace(/\s+/g, '-').toLowerCase()}`,
        sheetName: 'Attendees'
      });
      toast.success(`Report downloaded: ${event.eventName}`);
    } catch (error) {
      toast.error("Failed to download report");
    }
  };

  const handleDownloadAll = async () => {
    try {
      // Fetch all student records from all events
      const allStudentData: Record<string, unknown>[] = [];
      for (const event of meetupEvents) {
        const students = await fetchMeetupReportData(event.id);
        students.forEach(student => {
          allStudentData.push({
            ...student,
            'Event Name': event.eventName,
            'Event Date': event.date,
          });
        });
      }
      exportToXLSX(allStudentData, {
        filename: 'all-meetup-attendees',
        sheetName: 'All Attendees'
      });
      toast.success("All attendee records downloaded");
    } catch (error) {
      toast.error("Failed to download records");
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
          <Button onClick={handleDownloadAll} className="gap-2">
            <Download className="h-4 w-4" />
            Download All
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="meetups">
          <TabsList>
            <TabsTrigger value="masterclass" asChild>
              <Link to="/events/virtual/masterclass">Masterclass</Link>
            </TabsTrigger>
            <TabsTrigger value="meetups">MeetUps</TabsTrigger>
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
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
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
                      <p className="text-2xl font-bold">{totalEvents}</p>
                      <p className="text-xs text-muted-foreground">Total MeetUps</p>
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

            {/* Reports Table */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">MeetUp Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead className="text-right">Attendees</TableHead>
                      <TableHead className="text-right">Connections</TableHead>
                      <TableHead>Last Downloaded</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {meetupEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.eventName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(event.date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{event.region}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{event.attendees.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{event.connections.toLocaleString()}</TableCell>
                        <TableCell>
                          {event.lastDownloadedBy ? (
                            <div className="text-xs">
                              <p className="text-foreground">{event.lastDownloadedBy.name}</p>
                              <p className="text-muted-foreground">{event.lastDownloadedBy.date}</p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">Never</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleDownloadReport(event)}>
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
