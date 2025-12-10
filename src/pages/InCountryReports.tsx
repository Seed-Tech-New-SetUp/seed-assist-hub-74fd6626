import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Download,
  Eye,
  Edit,
  Globe2,
  Users,
  FileText,
  TrendingUp,
  MapPin,
  Building2,
} from "lucide-react";

const representatives = [
  {
    id: "1",
    name: "Vikram Patel",
    country: "India",
    region: "South Asia",
    schools: 12,
    leads: 456,
    events: 8,
    status: "active",
    lastReport: "Dec 8, 2024",
    performance: 94,
  },
  {
    id: "2",
    name: "Chen Xiaoming",
    country: "China",
    region: "East Asia",
    schools: 8,
    leads: 312,
    events: 5,
    status: "active",
    lastReport: "Dec 6, 2024",
    performance: 87,
  },
  {
    id: "3",
    name: "Mohammed Al-Rashid",
    country: "UAE",
    region: "Middle East",
    schools: 6,
    leads: 198,
    events: 4,
    status: "active",
    lastReport: "Dec 5, 2024",
    performance: 82,
  },
  {
    id: "4",
    name: "Sarah Thompson",
    country: "Nigeria",
    region: "Africa",
    schools: 5,
    leads: 145,
    events: 3,
    status: "active",
    lastReport: "Dec 3, 2024",
    performance: 78,
  },
  {
    id: "5",
    name: "Carlos Rodriguez",
    country: "Mexico",
    region: "Latin America",
    schools: 7,
    leads: 234,
    events: 6,
    status: "on_leave",
    lastReport: "Nov 28, 2024",
    performance: 85,
  },
];

const statusColors = {
  active: "bg-success/10 text-success border-success/20",
  on_leave: "bg-warning/10 text-warning border-warning/20",
  inactive: "bg-muted text-muted-foreground border-border",
};

export default function InCountryReports() {
  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">In-Country Representation</h1>
          <p className="text-muted-foreground">
            Track regional representatives and their recruitment activities.
          </p>
        </div>
        <Button variant="gradient">
          <Plus className="h-4 w-4 mr-2" />
          Add Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Countries Covered</p>
                <p className="text-2xl font-bold font-display">24</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Globe2 className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Reps</p>
                <p className="text-2xl font-bold font-display">18</p>
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
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold font-display">4,567</p>
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
                <p className="text-sm text-muted-foreground">Reports This Month</p>
                <p className="text-2xl font-bold font-display">42</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regional Performance */}
      <Card variant="elevated" className="mb-8 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <CardHeader>
          <CardTitle>Regional Performance</CardTitle>
          <CardDescription>Lead generation by geographic region</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { region: "South Asia", leads: 1567, growth: "+18%" },
              { region: "East Asia", leads: 1234, growth: "+12%" },
              { region: "Middle East", leads: 876, growth: "+24%" },
              { region: "Africa", leads: 543, growth: "+32%" },
              { region: "Latin America", leads: 347, growth: "+8%" },
            ].map((item, index) => (
              <div
                key={item.region}
                className="text-center p-4 rounded-lg bg-muted/30 animate-fade-in-up opacity-0"
                style={{ animationDelay: `${350 + index * 50}ms`, animationFillMode: 'forwards' }}
              >
                <p className="text-2xl font-bold font-display">{item.leads}</p>
                <p className="text-sm text-muted-foreground">{item.region}</p>
                <Badge variant="secondary" className="mt-2 text-success bg-success/10">
                  {item.growth}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Representatives Table */}
      <Card variant="elevated" className="animate-fade-in-up" style={{ animationDelay: '350ms' }}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Country Representatives</CardTitle>
              <CardDescription>Manage and track in-country recruitment teams</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search representatives..." className="pl-9 w-64" variant="ghost" />
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
                <TableHead>Representative</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Schools</TableHead>
                <TableHead className="text-right">Leads</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Report</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {representatives.map((rep, index) => (
                <TableRow
                  key={rep.id}
                  className="animate-fade-in opacity-0"
                  style={{ animationDelay: `${450 + index * 50}ms`, animationFillMode: 'forwards' }}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                          {rep.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{rep.name}</p>
                        <p className="text-xs text-muted-foreground">{rep.region}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      {rep.country}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      {rep.schools}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium text-primary">{rep.leads}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16">
                        <Progress value={rep.performance} className="h-1.5" />
                      </div>
                      <span className="text-sm font-medium">{rep.performance}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[rep.status as keyof typeof statusColors]}>
                      {rep.status === 'on_leave' ? 'On Leave' : rep.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{rep.lastReport}</TableCell>
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
                          View Reports
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
