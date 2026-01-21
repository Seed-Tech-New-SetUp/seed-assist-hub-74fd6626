import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Eye,
  FileText,
  Calendar,
  Users,
  Target,
  TrendingUp,
  Briefcase,
  GraduationCap,
  Phone,
  Mail,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import {
  fetchICRReports,
  calculateICRTotals,
  formatReportMonth,
  activityTypeLabels,
  type ICRReport,
} from "@/lib/api/icr";

// Icon mapping for activity types
const activityIcons: Record<string, React.ReactNode> = {
  phoneCalls: <Phone className="h-3.5 w-3.5" />,
  emailConv: <Mail className="h-3.5 w-3.5" />,
  whatsapp: <MessageSquare className="h-3.5 w-3.5" />,
};

export default function InCountryReports() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<ICRReport | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch ICR reports
  const { data: response, isLoading, error } = useQuery({
    queryKey: ["icr-reports"],
    queryFn: () => fetchICRReports(),
  });

  const reports = response?.data?.reports ?? [];
  const school = response?.data?.school;

  // Filter reports by search query
  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return reports;
    const query = searchQuery.toLowerCase();
    return reports.filter((report) => {
      const monthYear = formatReportMonth(report.report_month).toLowerCase();
      const clientName = report.client_name.toLowerCase();
      return monthYear.includes(query) || clientName.includes(query);
    });
  }, [searchQuery, reports]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    return calculateICRTotals(reports);
  }, [reports]);

  const handleViewReport = (report: ICRReport) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  // Calculate totals for a single report
  const getReportTotals = (report: ICRReport) => {
    const totalLeads = report.lead_generation.reduce((sum, lg) => sum + lg.qualified_leads, 0);
    const totalEngaged = report.lead_engagement.reduce((sum, le) => sum + le.leads_engaged, 0);
    return { totalLeads, totalEngaged };
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">
            In-Country <span className="text-primary">Representation</span> Reports
          </h1>
          <p className="text-muted-foreground">
            {school ? `${school.school_name} - ${school.university}` : "View monthly activity reports from your regional representatives."}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published Reports</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold font-display">{summaryStats.publishedReports}</p>
                )}
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold font-display">{summaryStats.totalLeads.toLocaleString()}</p>
                )}
              </div>
              <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Activities</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold font-display">{summaryStats.totalActivities}</p>
                )}
              </div>
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stats" className="animate-fade-in-up" style={{ animationDelay: "250ms" }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Applications</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold font-display">{summaryStats.totalApplications}</p>
                )}
              </div>
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card variant="elevated" className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Published Reports</CardTitle>
              <CardDescription>Monthly activity reports from your in-country representative</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  className="pl-9 w-64"
                  variant="ghost"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : error || !response?.success ? (
            <div className="text-center py-16">
              <AlertCircle className="h-12 w-12 text-destructive/50 mx-auto mb-4" />
              <p className="text-muted-foreground">Failed to load reports. Please try again.</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "No reports found matching your search." : "No reports available yet."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Representative</TableHead>
                  <TableHead className="text-right">Leads Generated</TableHead>
                  <TableHead className="text-right">Leads Engaged</TableHead>
                  <TableHead className="text-right">Applications</TableHead>
                  <TableHead className="text-right">Admitted</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report, index) => {
                  const totals = getReportTotals(report);
                  return (
                    <TableRow
                      key={report.report_id}
                      className="animate-fade-in opacity-0"
                      style={{ animationDelay: `${350 + index * 50}ms`, animationFillMode: "forwards" }}
                    >
                      <TableCell>
                        <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold">
                          {formatReportMonth(report.report_month)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-medium">{report.client_name}</span>
                          <span className="text-xs text-muted-foreground block">{report.client_role}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {totals.totalLeads}
                      </TableCell>
                      <TableCell className="text-right">
                        {report.application_funnel?.leads_engaged ?? totals.totalEngaged}
                      </TableCell>
                      <TableCell className="text-right">
                        {report.application_funnel?.applications_submitted ?? 0}
                      </TableCell>
                      <TableCell className="text-right">
                        {report.application_funnel?.admitted ?? 0}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(report.updated_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewReport(report)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Report Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {selectedReport && formatReportMonth(selectedReport.report_month)} Report
            </DialogTitle>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-6">
              {/* Application Funnel */}
              {selectedReport.application_funnel && (
                <div>
                  <h4 className="text-sm font-semibold text-primary flex items-center gap-2 mb-4 pb-2 border-b">
                    <TrendingUp className="h-4 w-4" />
                    Application Funnel
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-muted/50 p-4 rounded-lg text-center border-2 border-transparent hover:border-primary/30 transition-colors">
                      <p className="text-xs text-muted-foreground uppercase mb-1">Engaged</p>
                      <p className="text-2xl font-bold text-primary">
                        {selectedReport.application_funnel.leads_engaged}
                      </p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg text-center border-2 border-transparent hover:border-primary/30 transition-colors">
                      <p className="text-xs text-muted-foreground uppercase mb-1">Interested 2026</p>
                      <p className="text-2xl font-bold text-primary">
                        {selectedReport.application_funnel.interested_2026}
                      </p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg text-center border-2 border-transparent hover:border-primary/30 transition-colors">
                      <p className="text-xs text-muted-foreground uppercase mb-1">Applications</p>
                      <p className="text-2xl font-bold text-primary">
                        {selectedReport.application_funnel.applications_submitted}
                      </p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg text-center border-2 border-transparent hover:border-primary/30 transition-colors">
                      <p className="text-xs text-muted-foreground uppercase mb-1">Admitted</p>
                      <p className="text-2xl font-bold text-primary">
                        {selectedReport.application_funnel.admitted}
                      </p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg text-center border-2 border-transparent hover:border-primary/30 transition-colors">
                      <p className="text-xs text-muted-foreground uppercase mb-1">Offers Accepted</p>
                      <p className="text-2xl font-bold text-primary">
                        {selectedReport.application_funnel.offers_accepted}
                      </p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg text-center border-2 border-transparent hover:border-primary/30 transition-colors">
                      <p className="text-xs text-muted-foreground uppercase mb-1">Enrolled</p>
                      <p className="text-2xl font-bold text-primary">
                        {selectedReport.application_funnel.enrolled}
                      </p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg text-center border-2 border-transparent hover:border-warning/30 transition-colors">
                      <p className="text-xs text-muted-foreground uppercase mb-1">Not Interested</p>
                      <p className="text-2xl font-bold text-warning">
                        {selectedReport.application_funnel.not_interested}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Lead Generation */}
              {selectedReport.lead_generation.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-primary flex items-center gap-2 mb-4 pb-2 border-b">
                    <GraduationCap className="h-4 w-4" />
                    Lead Generation Activities
                  </h4>
                  <div className="space-y-3">
                    {selectedReport.lead_generation.map((activity) => (
                      <div key={activity.id} className="bg-muted/30 p-4 rounded-lg">
                        <div className="flex flex-wrap justify-between gap-2 mb-2">
                          <span className="font-medium">
                            {activityTypeLabels[activity.activity_type] || activity.activity_type}
                          </span>
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            {activity.qualified_leads} leads
                          </Badge>
                        </div>
                        {activity.description && (
                          <p className="text-sm text-muted-foreground whitespace-pre-line">
                            {activity.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lead Engagement */}
              {selectedReport.lead_engagement.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-primary flex items-center gap-2 mb-4 pb-2 border-b">
                    <Briefcase className="h-4 w-4" />
                    Lead Engagement Activities
                  </h4>
                  <div className="space-y-3">
                    {selectedReport.lead_engagement.map((activity) => (
                      <div key={activity.id} className="bg-muted/30 p-4 rounded-lg">
                        <div className="flex flex-wrap justify-between gap-2 mb-2">
                          <span className="font-medium flex items-center gap-2">
                            {activityIcons[activity.activity_type]}
                            {activityTypeLabels[activity.activity_type] || activity.activity_type}
                          </span>
                          <Badge variant="secondary">
                            {activity.leads_engaged} engaged
                          </Badge>
                        </div>
                        {activity.description && (
                          <p className="text-sm text-muted-foreground whitespace-pre-line">
                            {activity.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Representative Info */}
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Submitted by <span className="font-medium text-foreground">{selectedReport.client_name}</span>
                  {" "}({selectedReport.client_role}) on{" "}
                  {new Date(selectedReport.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
