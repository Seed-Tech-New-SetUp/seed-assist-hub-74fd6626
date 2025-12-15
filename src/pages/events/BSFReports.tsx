import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, MapPin, Users, Calendar, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { fetchBSFReports, fetchBSFReportById, type BSFReport } from "@/lib/api/reports";
import { exportToXLSX } from "@/lib/utils/xlsx-export";

const BSFReports = () => {
  const [reports, setReports] = useState<BSFReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBSFReports()
      .then(setReports)
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (reportId: string, eventName: string) => {
    const report = await fetchBSFReportById(reportId);
    if (!report) return;
    
    exportToXLSX(
      [{
        "Event Name": report.eventName,
        "City": report.city,
        "Date": report.date,
        "Registrants": report.registrants,
        "Attendees": report.attendees,
        "Connections": report.connections,
      }],
      { filename: `${eventName.replace(/\s+/g, "_")}_Report`, sheetName: "BSF Report" }
    );
    
    toast({ title: "Report Downloaded", description: `${eventName} report has been downloaded.` });
  };

  const handleDownloadAll = () => {
    const exportData = reports.map(r => ({
      "Event Name": r.eventName,
      "City": r.city,
      "Date": r.date,
      "Registrants": r.registrants,
      "Attendees": r.attendees,
      "Connections": r.connections,
    }));
    
    exportToXLSX(exportData, { filename: "BSF_Reports_All", sheetName: "BSF Reports" });
    toast({ title: "All Reports Downloaded", description: "All BSF reports have been downloaded." });
  };

  const totalEvents = reports.length;
  const uniqueCities = new Set(reports.map(r => r.city)).size;
  const totalRegistrants = reports.reduce((sum, r) => sum + r.registrants, 0);
  const totalConnections = reports.reduce((sum, r) => sum + r.connections, 0);

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
            <h1 className="text-2xl font-display font-bold text-foreground">Business School Festival Reports</h1>
            <p className="text-muted-foreground mt-1">View and download reports from BSF events</p>
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
                <div className="p-2 rounded-lg bg-accent/10"><MapPin className="h-5 w-5 text-accent-foreground" /></div>
                <div><p className="text-2xl font-bold text-foreground">{uniqueCities}</p><p className="text-xs text-muted-foreground">Unique Cities</p></div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/50"><Users className="h-5 w-5 text-secondary-foreground" /></div>
                <div><p className="text-2xl font-bold text-foreground">{totalRegistrants.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Registrants</p></div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10"><Calendar className="h-5 w-5 text-primary" /></div>
                <div><p className="text-2xl font-bold text-foreground">{totalConnections.toLocaleString()}</p><p className="text-xs text-muted-foreground">Connections</p></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-lg font-display">BSF Event Reports</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Registrants</TableHead>
                  <TableHead className="text-right">Attendees</TableHead>
                  <TableHead className="text-right">Connections</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.eventName}</TableCell>
                    <TableCell>{report.city}</TableCell>
                    <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">{report.registrants}</TableCell>
                    <TableCell className="text-right">{report.attendees}</TableCell>
                    <TableCell className="text-right">{report.connections}</TableCell>
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

export default BSFReports;
