import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Mail,
  Phone,
  Upload,
  UserPlus,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";

const leads = [
  {
    id: "1",
    name: "Rahul Mehta",
    email: "rahul.m@email.com",
    phone: "+91 98765 43210",
    source: "Virtual Event",
    program: "MBA Full-Time",
    score: 92,
    status: "hot",
    createdAt: "Dec 8, 2024",
  },
  {
    id: "2",
    name: "Jennifer Wu",
    email: "j.wu@email.com",
    phone: "+65 9123 4567",
    source: "Festival",
    program: "Executive MBA",
    score: 85,
    status: "warm",
    createdAt: "Dec 6, 2024",
  },
  {
    id: "3",
    name: "Ahmed Hassan",
    email: "a.hassan@email.com",
    phone: "+971 50 123 4567",
    source: "Campus Tour",
    program: "MS Finance",
    score: 78,
    status: "warm",
    createdAt: "Dec 5, 2024",
  },
  {
    id: "4",
    name: "Maria Garcia",
    email: "maria.g@email.com",
    phone: "+1 555 987 6543",
    source: "Meetup",
    program: "MBA Part-Time",
    score: 65,
    status: "cold",
    createdAt: "Dec 3, 2024",
  },
  {
    id: "5",
    name: "Li Wei",
    email: "li.wei@email.com",
    phone: "+86 138 0013 8000",
    source: "Website",
    program: "MBA Full-Time",
    score: 88,
    status: "hot",
    createdAt: "Dec 7, 2024",
  },
];

const statusConfig = {
  hot: { label: "Hot", className: "bg-destructive/10 text-destructive border-destructive/20" },
  warm: { label: "Warm", className: "bg-warning/10 text-warning border-warning/20" },
  cold: { label: "Cold", className: "bg-info/10 text-info border-info/20" },
};

const sourceColors = {
  "Virtual Event": "bg-primary/10 text-primary",
  "Festival": "bg-accent/10 text-accent",
  "Campus Tour": "bg-info/10 text-info",
  "Meetup": "bg-success/10 text-success",
  "Website": "bg-warning/10 text-warning",
};

export default function LeadGeneration() {
  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Lead Generation</h1>
          <p className="text-muted-foreground">
            Manage and share additional leads across all channels.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import Leads
          </Button>
          <Button variant="gradient">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold font-display">2,847</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hot Leads</p>
                <p className="text-2xl font-bold font-display text-destructive">423</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold font-display text-success">24.3%</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '250ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold font-display">+342</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Source Distribution */}
      <Card variant="elevated" className="mb-8 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <CardHeader>
          <CardTitle>Lead Sources</CardTitle>
          <CardDescription>Distribution by acquisition channel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { source: "Virtual Events", count: 892, percentage: 31 },
              { source: "Festivals", count: 678, percentage: 24 },
              { source: "Campus Tours", count: 524, percentage: 18 },
              { source: "Meetups", count: 445, percentage: 16 },
              { source: "Website", count: 308, percentage: 11 },
            ].map((item, index) => (
              <div
                key={item.source}
                className="text-center animate-fade-in-up opacity-0"
                style={{ animationDelay: `${350 + index * 50}ms`, animationFillMode: 'forwards' }}
              >
                <p className="text-2xl font-bold font-display">{item.count}</p>
                <p className="text-sm text-muted-foreground mb-2">{item.source}</p>
                <Progress value={item.percentage} className="h-1.5" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card variant="elevated" className="animate-fade-in-up" style={{ animationDelay: '350ms' }}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>All Leads</CardTitle>
              <CardDescription>Manage and track lead engagement</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search leads..." className="pl-9 w-64" variant="ghost" />
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
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Leads</TabsTrigger>
              <TabsTrigger value="hot">Hot</TabsTrigger>
              <TabsTrigger value="warm">Warm</TabsTrigger>
              <TabsTrigger value="cold">Cold</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Program Interest</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead, index) => {
                    const status = statusConfig[lead.status as keyof typeof statusConfig];
                    return (
                      <TableRow
                        key={lead.id}
                        className="animate-fade-in opacity-0"
                        style={{ animationDelay: `${450 + index * 50}ms`, animationFillMode: 'forwards' }}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                                {lead.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{lead.name}</p>
                              <p className="text-xs text-muted-foreground">{lead.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={sourceColors[lead.source as keyof typeof sourceColors]}>
                            {lead.source}
                          </Badge>
                        </TableCell>
                        <TableCell>{lead.program}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16">
                              <Progress value={lead.score} className="h-1.5" />
                            </div>
                            <span className="text-sm font-medium">{lead.score}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={status.className}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{lead.createdAt}</TableCell>
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
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Phone className="h-4 w-4 mr-2" />
                                Call
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="hot">
              <p className="text-muted-foreground text-center py-8">Showing hot leads only</p>
            </TabsContent>
            <TabsContent value="warm">
              <p className="text-muted-foreground text-center py-8">Showing warm leads only</p>
            </TabsContent>
            <TabsContent value="cold">
              <p className="text-muted-foreground text-center py-8">Showing cold leads only</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
