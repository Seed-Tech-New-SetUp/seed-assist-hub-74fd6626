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
  Filter,
  MoreHorizontal,
  FileText,
  CheckCircle2,
  Clock,
  Send,
  Eye,
  Download,
  TrendingUp,
  Users,
} from "lucide-react";

const applications = [
  {
    id: "1",
    applicantName: "David Lee",
    program: "MBA Full-Time",
    school: "Harvard Business School",
    stage: "interview",
    progress: 75,
    submittedDate: "Nov 15, 2024",
    decision: "pending",
  },
  {
    id: "2",
    applicantName: "Anna Martinez",
    program: "Executive MBA",
    school: "Stanford GSB",
    stage: "admitted",
    progress: 100,
    submittedDate: "Oct 20, 2024",
    decision: "admitted",
  },
  {
    id: "3",
    applicantName: "Robert Kim",
    program: "MS Finance",
    school: "MIT Sloan",
    stage: "review",
    progress: 50,
    submittedDate: "Dec 1, 2024",
    decision: "pending",
  },
  {
    id: "4",
    applicantName: "Sophie Turner",
    program: "MBA Part-Time",
    school: "Wharton",
    stage: "submitted",
    progress: 25,
    submittedDate: "Dec 5, 2024",
    decision: "pending",
  },
  {
    id: "5",
    applicantName: "Marcus Brown",
    program: "MBA Full-Time",
    school: "Columbia Business School",
    stage: "waitlisted",
    progress: 90,
    submittedDate: "Nov 1, 2024",
    decision: "waitlisted",
  },
];

const stageConfig = {
  submitted: {
    label: "Submitted",
    className: "bg-muted text-muted-foreground",
  },
  review: {
    label: "Under Review",
    className: "bg-info/10 text-info border-info/20",
  },
  interview: {
    label: "Interview",
    className: "bg-accent/10 text-accent border-accent/20",
  },
  admitted: {
    label: "Admitted",
    className: "bg-success/10 text-success border-success/20",
  },
  waitlisted: {
    label: "Waitlisted",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  rejected: {
    label: "Rejected",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

export default function Applications() {
  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Applications & Admits</h1>
          <p className="text-muted-foreground">
            Track application progress and admit data across all programs.
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold font-display">428</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Admitted</p>
                <p className="text-2xl font-bold font-display text-success">156</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold font-display text-info">198</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '250ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold font-display text-accent">36.4%</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Overview */}
      <Card variant="elevated" className="mb-8 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <CardHeader>
          <CardTitle>Application Pipeline</CardTitle>
          <CardDescription>Current distribution across stages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { stage: "Submitted", count: 74, color: "bg-muted" },
              { stage: "Under Review", count: 98, color: "bg-info" },
              { stage: "Interview", count: 68, color: "bg-accent" },
              { stage: "Waitlisted", count: 32, color: "bg-warning" },
              { stage: "Admitted", count: 156, color: "bg-success" },
            ].map((item, index) => (
              <div 
                key={item.stage} 
                className="text-center animate-fade-in-up opacity-0"
                style={{ animationDelay: `${400 + index * 50}ms`, animationFillMode: 'forwards' }}
              >
                <div className={`h-2 w-full rounded-full ${item.color} mb-3`} />
                <p className="text-2xl font-bold font-display">{item.count}</p>
                <p className="text-sm text-muted-foreground">{item.stage}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card variant="elevated" className="animate-fade-in-up" style={{ animationDelay: '350ms' }}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Track and manage individual applications</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search applications..." className="pl-9 w-64" variant="ghost" />
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
                <TableHead>Applicant</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app, index) => {
                const stage = stageConfig[app.stage as keyof typeof stageConfig];
                return (
                  <TableRow
                    key={app.id}
                    className="animate-fade-in opacity-0"
                    style={{ animationDelay: `${450 + index * 50}ms`, animationFillMode: 'forwards' }}
                  >
                    <TableCell className="font-medium">{app.applicantName}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{app.program}</p>
                        <p className="text-xs text-muted-foreground">{app.school}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-32">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">{app.progress}%</span>
                        </div>
                        <Progress value={app.progress} className="h-1.5" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={stage.className}>
                        {stage.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{app.submittedDate}</TableCell>
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
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Send className="h-4 w-4 mr-2" />
                            Update Status
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
