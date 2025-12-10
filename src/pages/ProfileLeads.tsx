import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Filter,
  MoreHorizontal,
  Download,
  Eye,
  Mail,
  Phone,
  UserCheck,
  Users,
  TrendingUp,
  Clock,
  Building2,
} from "lucide-react";

const profileLeads = [
  {
    id: "1",
    name: "Akash Gupta",
    email: "akash.g@email.com",
    phone: "+91 99887 76655",
    source: "School Profile View",
    school: "Harvard Business School",
    program: "MBA Full-Time",
    viewedAt: "2 hours ago",
    engagementScore: 85,
    status: "qualified",
  },
  {
    id: "2",
    name: "Emma Wilson",
    email: "emma.w@email.com",
    phone: "+44 7700 900123",
    source: "Program Page",
    school: "Stanford GSB",
    program: "Executive MBA",
    viewedAt: "5 hours ago",
    engagementScore: 72,
    status: "new",
  },
  {
    id: "3",
    name: "Liu Wei",
    email: "liu.wei@email.com",
    phone: "+86 138 0013 8000",
    source: "Brochure Download",
    school: "Wharton",
    program: "MS Finance",
    viewedAt: "1 day ago",
    engagementScore: 91,
    status: "qualified",
  },
  {
    id: "4",
    name: "Fatima Al-Hassan",
    email: "fatima.a@email.com",
    phone: "+971 50 123 4567",
    source: "Application Started",
    school: "MIT Sloan",
    program: "MBA Full-Time",
    viewedAt: "3 hours ago",
    engagementScore: 95,
    status: "hot",
  },
  {
    id: "5",
    name: "Carlos Mendez",
    email: "c.mendez@email.com",
    phone: "+1 555 234 5678",
    source: "School Profile View",
    school: "Columbia Business School",
    program: "MBA Part-Time",
    viewedAt: "6 hours ago",
    engagementScore: 58,
    status: "new",
  },
];

const statusConfig = {
  hot: { label: "Hot", className: "bg-destructive/10 text-destructive border-destructive/20" },
  qualified: { label: "Qualified", className: "bg-success/10 text-success border-success/20" },
  new: { label: "New", className: "bg-info/10 text-info border-info/20" },
  contacted: { label: "Contacted", className: "bg-warning/10 text-warning border-warning/20" },
};

const sourceColors = {
  "School Profile View": "bg-primary/10 text-primary",
  "Program Page": "bg-info/10 text-info",
  "Brochure Download": "bg-accent/10 text-accent",
  "Application Started": "bg-success/10 text-success",
};

export default function ProfileLeads() {
  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">School Profile Leads</h1>
          <p className="text-muted-foreground">
            Track leads generated from school profile views and engagement.
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Leads
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Profile Leads</p>
                <p className="text-2xl font-bold font-display">1,247</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Qualified Leads</p>
                <p className="text-2xl font-bold font-display text-success">486</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold font-display text-accent">38.9%</p>
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
                <p className="text-sm text-muted-foreground">Last 24 Hours</p>
                <p className="text-2xl font-bold font-display">+67</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Schools by Profile Leads */}
      <Card variant="elevated" className="mb-8 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <CardHeader>
          <CardTitle>Top Schools by Profile Engagement</CardTitle>
          <CardDescription>Schools generating the most profile-based leads</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { school: "Harvard Business School", leads: 312, icon: "HBS" },
              { school: "Stanford GSB", leads: 267, icon: "GSB" },
              { school: "Wharton", leads: 234, icon: "W" },
              { school: "MIT Sloan", leads: 198, icon: "MIT" },
              { school: "Columbia Business School", leads: 167, icon: "CBS" },
            ].map((item, index) => (
              <div
                key={item.school}
                className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/30 animate-fade-in-up opacity-0"
                style={{ animationDelay: `${350 + index * 50}ms`, animationFillMode: 'forwards' }}
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <span className="font-bold text-primary text-sm">{item.icon}</span>
                </div>
                <p className="text-2xl font-bold font-display">{item.leads}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.school}</p>
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
              <CardTitle>Recent Profile Leads</CardTitle>
              <CardDescription>Leads from school profile interactions</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search leads..." className="pl-9 w-64" variant="ghost" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profileLeads.map((lead, index) => {
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
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">{lead.school}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{lead.program}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${lead.engagementScore >= 80 ? 'bg-success' : lead.engagementScore >= 60 ? 'bg-warning' : 'bg-muted-foreground'}`} />
                        <span className="font-medium">{lead.engagementScore}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={status.className}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{lead.viewedAt}</TableCell>
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
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
