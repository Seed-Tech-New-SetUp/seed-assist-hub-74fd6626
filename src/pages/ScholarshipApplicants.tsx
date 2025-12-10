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
  Plus,
  Filter,
  MoreHorizontal,
  GraduationCap,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  Download,
  Eye,
  Edit,
  Mail,
} from "lucide-react";

const applicants = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah.chen@email.com",
    program: "MBA Full-Time",
    school: "Harvard Business School",
    scholarship: "Excellence Award",
    amount: "$50,000",
    status: "approved",
    submittedDate: "Dec 1, 2024",
  },
  {
    id: "2",
    name: "Michael Johnson",
    email: "m.johnson@email.com",
    program: "Executive MBA",
    school: "Stanford GSB",
    scholarship: "Leadership Grant",
    amount: "$35,000",
    status: "pending",
    submittedDate: "Dec 3, 2024",
  },
  {
    id: "3",
    name: "Priya Sharma",
    email: "priya.s@email.com",
    program: "MBA Part-Time",
    school: "Wharton",
    scholarship: "Diversity Scholarship",
    amount: "$40,000",
    status: "under_review",
    submittedDate: "Dec 5, 2024",
  },
  {
    id: "4",
    name: "James Wilson",
    email: "j.wilson@email.com",
    program: "MS Finance",
    school: "MIT Sloan",
    scholarship: "Merit Award",
    amount: "$25,000",
    status: "approved",
    submittedDate: "Nov 28, 2024",
  },
  {
    id: "5",
    name: "Emma Thompson",
    email: "emma.t@email.com",
    program: "MBA Full-Time",
    school: "Columbia Business School",
    scholarship: "Global Leader Fellowship",
    amount: "$60,000",
    status: "rejected",
    submittedDate: "Nov 25, 2024",
  },
];

const statusConfig = {
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    className: "bg-success/10 text-success border-success/20",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-warning/10 text-warning border-warning/20",
  },
  under_review: {
    label: "Under Review",
    icon: Clock,
    className: "bg-info/10 text-info border-info/20",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

export default function ScholarshipApplicants() {
  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Scholarship Applicants</h1>
          <p className="text-muted-foreground">
            Review and manage scholarship applications across all programs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="gradient">
            <Plus className="h-4 w-4 mr-2" />
            Add Applicant
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Applicants</p>
                <p className="text-2xl font-bold font-display">156</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold font-display text-success">48</p>
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
                <p className="text-sm text-muted-foreground">Under Review</p>
                <p className="text-2xl font-bold font-display text-info">72</p>
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
                <p className="text-sm text-muted-foreground">Total Awards</p>
                <p className="text-2xl font-bold font-display text-accent">$2.4M</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Award className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applicants Table */}
      <Card variant="elevated" className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>All Applicants</CardTitle>
              <CardDescription>Manage scholarship applications and track status</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search applicants..." className="pl-9 w-64" variant="ghost" />
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
                <TableHead>Scholarship</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applicants.map((applicant, index) => {
                const status = statusConfig[applicant.status as keyof typeof statusConfig];
                const StatusIcon = status.icon;
                return (
                  <TableRow
                    key={applicant.id}
                    className="animate-fade-in opacity-0"
                    style={{ animationDelay: `${400 + index * 50}ms`, animationFillMode: 'forwards' }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                            {applicant.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{applicant.name}</p>
                          <p className="text-xs text-muted-foreground">{applicant.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{applicant.program}</p>
                        <p className="text-xs text-muted-foreground">{applicant.school}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{applicant.scholarship}</TableCell>
                    <TableCell className="text-right font-semibold text-primary">{applicant.amount}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={status.className}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{applicant.submittedDate}</TableCell>
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
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Application
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Email
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
