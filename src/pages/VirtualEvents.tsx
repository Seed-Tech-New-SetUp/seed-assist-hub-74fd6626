import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Plus, Filter, MoreHorizontal, Calendar, Users, Download, Eye, Edit, Video } from "lucide-react";

const events = [
  {
    id: "1",
    name: "MBA Virtual Fair - Europe",
    date: "Dec 15, 2024",
    attendees: 245,
    leads: 89,
    status: "upcoming",
    region: "Europe",
  },
  {
    id: "2",
    name: "Executive MBA Webinar Series",
    date: "Dec 10, 2024",
    attendees: 180,
    leads: 67,
    status: "completed",
    region: "Global",
  },
  {
    id: "3",
    name: "Asia Pacific MBA Showcase",
    date: "Dec 8, 2024",
    attendees: 312,
    leads: 124,
    status: "completed",
    region: "Asia Pacific",
  },
  {
    id: "4",
    name: "North America Info Session",
    date: "Dec 5, 2024",
    attendees: 156,
    leads: 52,
    status: "completed",
    region: "North America",
  },
  {
    id: "5",
    name: "Middle East Business School Fair",
    date: "Dec 20, 2024",
    attendees: 0,
    leads: 0,
    status: "upcoming",
    region: "Middle East",
  },
];

const statusColors = {
  upcoming: "bg-info/10 text-info border-info/20",
  completed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function VirtualEvents() {
  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Virtual Event Reports</h1>
          <p className="text-muted-foreground">
            Manage and track all virtual events and their performance metrics.
          </p>
        </div>
        <Button variant="gradient">
          <Plus className="h-4 w-4 mr-2" />
          Submit New Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold font-display">24</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Video className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Attendees</p>
                <p className="text-2xl font-bold font-display">4,892</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Leads Generated</p>
                <p className="text-2xl font-bold font-display">1,847</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '250ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Conversion</p>
                <p className="text-2xl font-bold font-display">37.8%</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events Table */}
      <Card variant="elevated" className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Event Reports</CardTitle>
              <CardDescription>View and manage all virtual event reports</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search events..." className="pl-9 w-64" variant="ghost" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Region</TableHead>
                <TableHead className="text-right">Attendees</TableHead>
                <TableHead className="text-right">Leads</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event, index) => (
                <TableRow 
                  key={event.id}
                  className="animate-fade-in opacity-0"
                  style={{ animationDelay: `${400 + index * 50}ms`, animationFillMode: 'forwards' }}
                >
                  <TableCell className="font-medium">{event.name}</TableCell>
                  <TableCell className="text-muted-foreground">{event.date}</TableCell>
                  <TableCell>{event.region}</TableCell>
                  <TableCell className="text-right">{event.attendees.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-medium text-primary">{event.leads}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[event.status as keyof typeof statusColors]}>
                      {event.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Report
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download
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
    </DashboardLayout>
  );
}
