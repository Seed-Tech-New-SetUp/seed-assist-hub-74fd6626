import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Building2, Users, UserCheck, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { fetchCampusTourReports, fetchCampusTourReportById, type CampusTourReport } from "@/lib/api/reports";
import { exportToXLSX } from "@/lib/utils/xlsx-export";

const CampusTourReports = () => {
  const [reports, setReports] = useState<CampusTourReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampusTourReports()
      .then(setReports)
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (reportId: string, eventName: string) => {
    const report = await fetchCampusTourReportById(reportId);
    if (!report) return;
    
    exportToXLSX(
      [{
        "Event Name": report.eventName,
        "Campus": report.campus,
        "Date": report.date,
        "Campuses Reached": report.campusesReached,
        "Attendees": report.attendees,
        "Students Connected": report.studentsConnected,
      }],
      { filename: `${eventName.replace(/\s+/g, "_")}_Report`, sheetName: "Campus Tour Report" }
    );
    
    toast({ title: "Report Downloaded", description: `${eventName} report has been downloaded.` });
  };

  const handleDownloadAll = () => {
    const exportData = reports.map(r => ({
      "Event Name": r.eventName,
      "Campus": r.campus,
      "Date": r.date,
      "Campuses Reached": r.campusesReached,
      "Attendees": r.attendees,
      "Students Connected": r.studentsConnected,
    }));
    
    exportToXLSX(exportData, { filename: "Campus_Tour_Reports_All", sheetName: "Campus Tour Reports" });
    toast({ title: "All Reports Downloaded", description: "All Campus Tour reports have been downloaded." });
  };

  const totalEvents = reports.length;
  const totalCampuses = reports.reduce((sum, r) => sum + r.campusesReached, 0);
  const totalAttendees = reports.reduce((sum, r) => sum + r.attendees, 0);
  const totalStudents = reports.reduce((sum, r) => sum + r.studentsConnected, 0);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Campus Tour Reports</h1>
            <p className="text-muted-foreground mt-1">View and download reports from Campus Tour events</p>
          </div>
          <Button onClick={handleDownloadAll} className="gap-2">
            <Download className="h-4 w-4" /> Download All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10"><FileText className="h-5 w-5 text-primary" /></div>
                <div><p className="text-2xl font-bold text-foreground">{totalEvents}</p><p className="text-xs text-muted-foreground">Total Events</p></div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10"><Building2 className="h-5 w-5 text-accent-foreground" /></div>
                <div><p className="text-2xl font-bold text-foreground">{totalCampuses}</p><p className="text-xs text-muted-foreground">Campuses Reached</p></div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/50"><Users className="h-5 w-5 text-secondary-foreground" /></div>
                <div><p className="text-2xl font-bold text-foreground">{totalAttendees.toLocaleString()}</p><p className="text-xs text-muted-foreground">Attendees Reached</p></div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10"><UserCheck className="h-5 w-5 text-primary" /></div>
                <div><p className="text-2xl font-bold text-foreground">{totalStudents.toLocaleString()}</p><p className="text-xs text-muted-foreground">Students Connected</p></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-lg font-display">Campus Tour Reports</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Campus</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Attendees</TableHead>
                  <TableHead className="text-right">Students Connected</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.eventName}</TableCell>
                    <TableCell>{report.campus}</TableCell>
                    <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">{report.attendees}</TableCell>
                    <TableCell className="text-right">{report.studentsConnected}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleDownload(report.id, report.eventName)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CampusTourReports;
