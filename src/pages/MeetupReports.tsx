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
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  MapPin,
  Users,
  Download,
  Eye,
  Edit,
  Calendar,
  Handshake,
  TrendingUp,
} from "lucide-react";

const meetups = [
  {
    id: "1",
    name: "Mumbai MBA Connect",
    date: "Dec 12, 2024",
    location: "Mumbai, India",
    attendees: 85,
    leads: 42,
    status: "completed",
    venue: "Taj Mahal Palace Hotel",
  },
  {
    id: "2",
    name: "Delhi Business Leaders Meetup",
    date: "Dec 18, 2024",
    location: "New Delhi, India",
    attendees: 0,
    leads: 0,
    status: "upcoming",
    venue: "The Imperial Hotel",
  },
  {
    id: "3",
    name: "Bangalore Tech MBA Networking",
    date: "Dec 8, 2024",
    location: "Bangalore, India",
    attendees: 120,
    leads: 67,
    status: "completed",
    venue: "Sheraton Grand",
  },
  {
    id: "4",
    name: "Singapore Executive Meetup",
    date: "Dec 5, 2024",
    location: "Singapore",
    attendees: 65,
    leads: 28,
    status: "completed",
    venue: "Marina Bay Sands",
  },
  {
    id: "5",
    name: "Dubai MBA Coffee Chat",
    date: "Dec 22, 2024",
    location: "Dubai, UAE",
    attendees: 0,
    leads: 0,
    status: "upcoming",
    venue: "Burj Al Arab",
  },
];

const statusColors = {
  upcoming: "bg-info/10 text-info border-info/20",
  completed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function MeetupReports() {
  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Meetup Reports</h1>
          <p className="text-muted-foreground">
            Track in-person meetups, coffee chats, and networking events.
          </p>
        </div>
        <Button variant="gradient">
          <Plus className="h-4 w-4 mr-2" />
          Submit Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Meetups</p>
                <p className="text-2xl font-bold font-display">48</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Handshake className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Attendees</p>
                <p className="text-2xl font-bold font-display">2,340</p>
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
                <p className="text-2xl font-bold font-display">892</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '250ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Conversion</p>
                <p className="text-2xl font-bold font-display">38.1%</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meetups Table */}
      <Card variant="elevated" className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Meetup Reports</CardTitle>
              <CardDescription>View and manage all in-person meetup reports</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search meetups..." className="pl-9 w-64" variant="ghost" />
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
                <TableHead>Location</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead className="text-right">Attendees</TableHead>
                <TableHead className="text-right">Leads</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meetups.map((meetup, index) => (
                <TableRow
                  key={meetup.id}
                  className="animate-fade-in opacity-0"
                  style={{ animationDelay: `${400 + index * 50}ms`, animationFillMode: 'forwards' }}
                >
                  <TableCell className="font-medium">{meetup.name}</TableCell>
                  <TableCell className="text-muted-foreground">{meetup.date}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      {meetup.location}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{meetup.venue}</TableCell>
                  <TableCell className="text-right">{meetup.attendees.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-medium text-primary">{meetup.leads}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[meetup.status as keyof typeof statusColors]}>
                      {meetup.status}
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
