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
import { Calendar, MapPin, Users, Building2, Download, MoreHorizontal, Search, Filter } from "lucide-react";

// Mock data
const events = [
  {
    id: "1",
    eventName: "Business School Festival - Mumbai",
    eventType: "BSF",
    city: "Mumbai",
    date: "2024-03-15",
    registrants: 450,
    attendees: 380,
    connections: 120,
    lastDownloadedBy: { name: "John Smith", date: "2024-03-20" },
  },
  {
    id: "2",
    eventName: "Campus Tour - IIM Bangalore",
    eventType: "CAMPUS_TOUR",
    city: "Bangalore",
    campus: "IIM Bangalore",
    date: "2024-03-10",
    registrants: 200,
    attendees: 185,
    connections: 75,
  },
  {
    id: "3",
    eventName: "Business School Festival - Delhi",
    eventType: "BSF",
    city: "Delhi",
    date: "2024-02-28",
    registrants: 520,
    attendees: 445,
    connections: 156,
    lastDownloadedBy: { name: "Sarah Johnson", date: "2024-03-05" },
  },
  {
    id: "4",
    eventName: "Campus Tour - ISB Hyderabad",
    eventType: "CAMPUS_TOUR",
    city: "Hyderabad",
    campus: "ISB Hyderabad",
    date: "2024-02-20",
    registrants: 180,
    attendees: 165,
    connections: 68,
  },
];

const eventTypeColors: Record<string, string> = {
  BSF: "bg-primary/10 text-primary border-primary/20",
  CAMPUS_TOUR: "bg-accent/10 text-accent-foreground border-accent/20",
};

export default function InPersonReports() {
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [seasonFilter, setSeasonFilter] = useState<string>("all");
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");

  // Calculate stats
  const totalEvents = events.length;
  const uniqueCities = new Set(events.map(e => e.city)).size;
  const campusTourEvents = events.filter(e => e.eventType === "CAMPUS_TOUR");
  const campusesReached = campusTourEvents.length;
  const totalAttendees = campusTourEvents.reduce((sum, e) => sum + e.attendees, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">In-Person Event Reports</h1>
          <p className="text-muted-foreground mt-1">View and download reports from your in-person events</p>
        </div>

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
              <Select value={seasonFilter} onValueChange={setSeasonFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Season" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Seasons</SelectItem>
                  <SelectItem value="spring">Spring</SelectItem>
                  <SelectItem value="summer">Summer</SelectItem>
                  <SelectItem value="fall">Fall</SelectItem>
                  <SelectItem value="winter">Winter</SelectItem>
                </SelectContent>
              </Select>
              <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="BSF">Business School Festival</SelectItem>
                  <SelectItem value="CAMPUS_TOUR">Campus Tour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
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
                <div className="p-2 rounded-lg bg-accent/10">
                  <MapPin className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{uniqueCities}</p>
                  <p className="text-xs text-muted-foreground">Unique Cities</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Building2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{campusesReached}</p>
                  <p className="text-xs text-muted-foreground">Campuses Reached</p>
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
        </div>

        {/* Reports Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Event Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>City/Campus</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Registrants</TableHead>
                  <TableHead className="text-right">Attendees</TableHead>
                  <TableHead className="text-right">Connections</TableHead>
                  <TableHead>Last Downloaded</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.eventName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={eventTypeColors[event.eventType]}>
                        {event.eventType === "BSF" ? "Festival" : "Campus Tour"}
                      </Badge>
                    </TableCell>
                    <TableCell>{event.campus || event.city}</TableCell>
                    <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">{event.registrants.toLocaleString()}</TableCell>
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
                          <DropdownMenuItem>
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
      </div>
    </DashboardLayout>
  );
}
