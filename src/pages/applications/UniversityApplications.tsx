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
import { Download, Search, FileSpreadsheet, Users, GraduationCap, Clock } from "lucide-react";
import { exportToXLSX } from "@/lib/utils/xlsx-export";

interface StudentApplication {
  id: string;
  studentName: string;
  email: string;
  program: string;
  applicationDate: string;
  status: "pending" | "under_review" | "admitted" | "rejected" | "waitlisted";
  nationality: string;
  cgpa: string;
  workExperience: string;
}

// Mock data for student applications
const mockApplications: StudentApplication[] = [
  {
    id: "1",
    studentName: "Arjun Sharma",
    email: "arjun.sharma@email.com",
    program: "MBA",
    applicationDate: "2024-01-15",
    status: "admitted",
    nationality: "India",
    cgpa: "3.8/4.0",
    workExperience: "5 years",
  },
  {
    id: "2",
    studentName: "Priya Patel",
    email: "priya.patel@email.com",
    program: "MS Computer Science",
    applicationDate: "2024-01-18",
    status: "under_review",
    nationality: "India",
    cgpa: "3.6/4.0",
    workExperience: "3 years",
  },
  {
    id: "3",
    studentName: "Chen Wei",
    email: "chen.wei@email.com",
    program: "MBA",
    applicationDate: "2024-01-20",
    status: "pending",
    nationality: "China",
    cgpa: "3.9/4.0",
    workExperience: "6 years",
  },
  {
    id: "4",
    studentName: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    program: "MS Finance",
    applicationDate: "2024-01-22",
    status: "waitlisted",
    nationality: "USA",
    cgpa: "3.5/4.0",
    workExperience: "4 years",
  },
  {
    id: "5",
    studentName: "Ahmed Hassan",
    email: "ahmed.hassan@email.com",
    program: "MBA",
    applicationDate: "2024-01-25",
    status: "rejected",
    nationality: "Egypt",
    cgpa: "3.2/4.0",
    workExperience: "2 years",
  },
  {
    id: "6",
    studentName: "Maria Garcia",
    email: "maria.garcia@email.com",
    program: "MS Data Science",
    applicationDate: "2024-02-01",
    status: "admitted",
    nationality: "Spain",
    cgpa: "3.7/4.0",
    workExperience: "4 years",
  },
  {
    id: "7",
    studentName: "Kenji Tanaka",
    email: "kenji.tanaka@email.com",
    program: "MBA",
    applicationDate: "2024-02-05",
    status: "under_review",
    nationality: "Japan",
    cgpa: "3.85/4.0",
    workExperience: "7 years",
  },
  {
    id: "8",
    studentName: "Fatima Al-Rashid",
    email: "fatima.rashid@email.com",
    program: "MS Marketing",
    applicationDate: "2024-02-08",
    status: "pending",
    nationality: "UAE",
    cgpa: "3.4/4.0",
    workExperience: "3 years",
  },
];

const statusConfig: Record<StudentApplication["status"], { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  under_review: { label: "Under Review", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  admitted: { label: "Admitted", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  rejected: { label: "Rejected", className: "bg-red-500/10 text-red-600 border-red-500/20" },
  waitlisted: { label: "Waitlisted", className: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
};

export default function UniversityApplications() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredApplications = mockApplications.filter(
    (app) =>
      app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.nationality.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: mockApplications.length,
    admitted: mockApplications.filter((a) => a.status === "admitted").length,
    pending: mockApplications.filter((a) => a.status === "pending" || a.status === "under_review").length,
  };

  const handleDownload = () => {
    const exportData = filteredApplications.map((app) => ({
      "Student Name": app.studentName,
      "Email": app.email,
      "Program": app.program,
      "Nationality": app.nationality,
      "CGPA": app.cgpa,
      "Work Experience": app.workExperience,
      "Application Date": new Date(app.applicationDate).toLocaleDateString(),
      "Status": statusConfig[app.status].label,
    }));

    exportToXLSX(exportData, {
      filename: `university-applications-${new Date().toISOString().split("T")[0]}`,
      sheetName: "Applications",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              University Applications
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              All student applications submitted via SEED
            </p>
          </div>
          <Button onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Download XLSX
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-lg bg-emerald-500/10">
                <GraduationCap className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admitted</p>
                <p className="text-2xl font-bold text-foreground">{stats.admitted}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                Applications List
              </CardTitle>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Student Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Nationality</TableHead>
                    <TableHead>CGPA</TableHead>
                    <TableHead>Work Exp.</TableHead>
                    <TableHead>Applied On</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                        No applications found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredApplications.map((app) => (
                      <TableRow key={app.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{app.studentName}</TableCell>
                        <TableCell className="text-muted-foreground">{app.email}</TableCell>
                        <TableCell>{app.program}</TableCell>
                        <TableCell>{app.nationality}</TableCell>
                        <TableCell>{app.cgpa}</TableCell>
                        <TableCell>{app.workExperience}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(app.applicationDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusConfig[app.status].className}>
                            {statusConfig[app.status].label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredApplications.length} of {mockApplications.length} applications
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
