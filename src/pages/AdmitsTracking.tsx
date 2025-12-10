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
  Filter,
  MoreHorizontal,
  Download,
  Eye,
  Mail,
  GraduationCap,
  CheckCircle2,
  Trophy,
  Calendar,
  DollarSign,
  TrendingUp,
} from "lucide-react";

const admits = [
  {
    id: "1",
    name: "Priya Sharma",
    email: "priya.s@email.com",
    program: "MBA Full-Time",
    school: "Harvard Business School",
    admitDate: "Dec 5, 2024",
    startTerm: "Fall 2025",
    scholarship: "$45,000",
    status: "confirmed",
    depositPaid: true,
  },
  {
    id: "2",
    name: "James Chen",
    email: "j.chen@email.com",
    program: "Executive MBA",
    school: "Stanford GSB",
    admitDate: "Dec 3, 2024",
    startTerm: "Fall 2025",
    scholarship: "$30,000",
    status: "confirmed",
    depositPaid: true,
  },
  {
    id: "3",
    name: "Sarah Williams",
    email: "s.williams@email.com",
    program: "MS Finance",
    school: "MIT Sloan",
    admitDate: "Dec 6, 2024",
    startTerm: "Fall 2025",
    scholarship: "$20,000",
    status: "pending_deposit",
    depositPaid: false,
  },
  {
    id: "4",
    name: "Ahmed Hassan",
    email: "a.hassan@email.com",
    program: "MBA Part-Time",
    school: "Wharton",
    admitDate: "Dec 1, 2024",
    startTerm: "Spring 2025",
    scholarship: "$25,000",
    status: "confirmed",
    depositPaid: true,
  },
  {
    id: "5",
    name: "Maria Garcia",
    email: "m.garcia@email.com",
    program: "MBA Full-Time",
    school: "Columbia Business School",
    admitDate: "Dec 7, 2024",
    startTerm: "Fall 2025",
    scholarship: "$35,000",
    status: "deferred",
    depositPaid: false,
  },
];

const statusConfig = {
  confirmed: {
    label: "Confirmed",
    className: "bg-success/10 text-success border-success/20",
    icon: CheckCircle2,
  },
  pending_deposit: {
    label: "Pending Deposit",
    className: "bg-warning/10 text-warning border-warning/20",
    icon: Calendar,
  },
  deferred: {
    label: "Deferred",
    className: "bg-info/10 text-info border-info/20",
    icon: Calendar,
  },
  declined: {
    label: "Declined",
    className: "bg-destructive/10 text-destructive border-destructive/20",
    icon: Calendar,
  },
};

export default function AdmitsTracking() {
  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Admits Tracking</h1>
          <p className="text-muted-foreground">
            Track admitted students, enrollment status, and scholarship awards.
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Admits</p>
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
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold font-display text-success">124</p>
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
                <p className="text-sm text-muted-foreground">Scholarships Awarded</p>
                <p className="text-2xl font-bold font-display text-accent">$4.8M</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: '250ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Yield Rate</p>
                <p className="text-2xl font-bold font-display">79.5%</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enrollment Pipeline */}
      <Card variant="elevated" className="mb-8 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <CardHeader>
          <CardTitle>Enrollment Pipeline</CardTitle>
          <CardDescription>Status distribution of admitted students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { status: "Confirmed", count: 124, color: "bg-success", percentage: 79 },
              { status: "Pending Deposit", count: 18, color: "bg-warning", percentage: 12 },
              { status: "Deferred", count: 8, color: "bg-info", percentage: 5 },
              { status: "Declined", count: 6, color: "bg-destructive", percentage: 4 },
            ].map((item, index) => (
              <div
                key={item.status}
                className="text-center animate-fade-in-up opacity-0"
                style={{ animationDelay: `${350 + index * 50}ms`, animationFillMode: 'forwards' }}
              >
                <div className={`h-2 w-full rounded-full ${item.color} mb-3`} />
                <p className="text-2xl font-bold font-display">{item.count}</p>
                <p className="text-sm text-muted-foreground">{item.status}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.percentage}%</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Schools by Admits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card variant="elevated" className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '350ms' }}>
          <CardHeader>
            <CardTitle>Top Schools by Admits</CardTitle>
            <CardDescription>Schools with highest enrollment numbers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { school: "Harvard Business School", admits: 28, percentage: 100 },
                { school: "Stanford GSB", admits: 24, percentage: 86 },
                { school: "Wharton", admits: 22, percentage: 78 },
                { school: "MIT Sloan", admits: 18, percentage: 64 },
                { school: "Columbia Business School", admits: 16, percentage: 57 },
              ].map((item, index) => (
                <div
                  key={item.school}
                  className="animate-fade-in-up opacity-0"
                  style={{ animationDelay: `${400 + index * 50}ms`, animationFillMode: 'forwards' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{item.school}</span>
                    <span className="text-sm text-muted-foreground">{item.admits} admits</span>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated" className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <CardHeader>
            <CardTitle>Scholarship Summary</CardTitle>
            <CardDescription>Total awards by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { category: "Merit Awards", amount: "$1.8M", count: 45 },
                { category: "Need-Based", amount: "$1.2M", count: 32 },
                { category: "Diversity Grants", amount: "$950K", count: 28 },
                { category: "Excellence Awards", amount: "$850K", count: 22 },
              ].map((item, index) => (
                <div
                  key={item.category}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 animate-fade-in-up opacity-0"
                  style={{ animationDelay: `${450 + index * 50}ms`, animationFillMode: 'forwards' }}
                >
                  <div>
                    <p className="font-medium text-sm">{item.category}</p>
                    <p className="text-xs text-muted-foreground">{item.count} recipients</p>
                  </div>
                  <p className="font-bold text-primary">{item.amount}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admits Table */}
      <Card variant="elevated" className="animate-fade-in-up" style={{ animationDelay: '450ms' }}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Recent Admits</CardTitle>
              <CardDescription>Track enrollment and deposit status</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search admits..." className="pl-9 w-64" variant="ghost" />
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
                <TableHead>Student</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Start Term</TableHead>
                <TableHead>Scholarship</TableHead>
                <TableHead>Deposit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admits.map((admit, index) => {
                const status = statusConfig[admit.status as keyof typeof statusConfig];
                const StatusIcon = status.icon;
                return (
                  <TableRow
                    key={admit.id}
                    className="animate-fade-in opacity-0"
                    style={{ animationDelay: `${550 + index * 50}ms`, animationFillMode: 'forwards' }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                            {admit.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{admit.name}</p>
                          <p className="text-xs text-muted-foreground">{admit.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{admit.program}</p>
                        <p className="text-xs text-muted-foreground">{admit.school}</p>
                      </div>
                    </TableCell>
                    <TableCell>{admit.startTerm}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5 text-success" />
                        <span className="font-medium text-success">{admit.scholarship}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {admit.depositPaid ? (
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Paid
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={status.className}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
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
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download
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
