import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  PartyPopper,
  Building2,
  TrendingUp,
  Calendar,
} from "lucide-react";

const festivals = [
  {
    id: "1",
    name: "Global MBA Festival 2024",
    date: "Dec 1-3, 2024",
    location: "London, UK",
    schoolsParticipated: 45,
    attendees: 1250,
    leads: 487,
    status: "completed",
    boothVisits: 892,
  },
  {
    id: "2",
    name: "Asia Pacific B-School Expo",
    date: "Dec 15-16, 2024",
    location: "Singapore",
    schoolsParticipated: 32,
    attendees: 0,
    leads: 0,
    status: "upcoming",
    boothVisits: 0,
  },
  {
    id: "3",
    name: "European Business Education Fair",
    date: "Nov 25-27, 2024",
    location: "Paris, France",
    schoolsParticipated: 38,
    attendees: 980,
    leads: 356,
    status: "completed",
    boothVisits: 645,
  },
  {
    id: "4",
    name: "North America MBA Tour",
    date: "Nov 18-20, 2024",
    location: "New York, USA",
    schoolsParticipated: 52,
    attendees: 1420,
    leads: 612,
    status: "completed",
    boothVisits: 1024,
  },
  {
    id: "5",
    name: "Middle East Education Summit",
    date: "Dec 28-29, 2024",
    location: "Dubai, UAE",
    schoolsParticipated: 28,
    attendees: 0,
    leads: 0,
    status: "upcoming",
    boothVisits: 0,
  },
];

const statusColors = {
  upcoming: "bg-info/10 text-info border-info/20",
  completed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function FestivalReports() {
  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Business School Festival Reports</h1>
          <p className="text-muted-foreground">
            Track major education fairs, expos, and festival participation.
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
                <p className="text-sm text-muted-foreground">Total Festivals</p>
                <p className="text-2xl font-bold font-display">18</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <PartyPopper className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Schools Participated</p>
                <p className="text-2xl font-bold font-display">195</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Attendees</p>
                <p className="text-2xl font-bold font-display">8,450</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '250ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Leads Generated</p>
                <p className="text-2xl font-bold font-display">3,245</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card variant="elevated" className="mb-8 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <CardHeader>
          <CardTitle>Regional Performance</CardTitle>
          <CardDescription>Lead generation by region from festival participation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { region: "North America", leads: 1245, percentage: 38 },
              { region: "Europe", leads: 892, percentage: 27 },
              { region: "Asia Pacific", leads: 678, percentage: 21 },
              { region: "Middle East", leads: 430, percentage: 14 },
            ].map((item, index) => (
              <div
                key={item.region}
                className="animate-fade-in-up opacity-0"
                style={{ animationDelay: `${350 + index * 50}ms`, animationFillMode: 'forwards' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{item.region}</span>
                  <span className="text-sm text-muted-foreground">{item.leads} leads ({item.percentage}%)</span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Festivals Table */}
      <Card variant="elevated" className="animate-fade-in-up" style={{ animationDelay: '350ms' }}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Festival Reports</CardTitle>
              <CardDescription>View and manage all festival participation reports</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search festivals..." className="pl-9 w-64" variant="ghost" />
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
                <TableHead>Festival Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Schools</TableHead>
                <TableHead className="text-right">Attendees</TableHead>
                <TableHead className="text-right">Leads</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {festivals.map((festival, index) => (
                <TableRow
                  key={festival.id}
                  className="animate-fade-in opacity-0"
                  style={{ animationDelay: `${450 + index * 50}ms`, animationFillMode: 'forwards' }}
                >
                  <TableCell className="font-medium">{festival.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {festival.date}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      {festival.location}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{festival.schoolsParticipated}</TableCell>
                  <TableCell className="text-right">{festival.attendees.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-medium text-primary">{festival.leads}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[festival.status as keyof typeof statusColors]}>
                      {festival.status}
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
