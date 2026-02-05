import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, PlusCircle } from "lucide-react";
import {
  fetchICRReports,
  formatReportMonth,
  activityTypeLabels,
  type ICRReport,
} from "@/lib/api/icr";
import { exportMultipleSheetsToXLSX } from "@/lib/utils/xlsx-export";
import { ICRAnalytics } from "@/components/icr/ICRAnalytics";
import { ICRReportForm } from "@/components/icr/ICRReportForm";
import { ICRReportDetailModal } from "@/components/icr/ICRReportDetailModal";

export default function InCountryReports() {
  const [activeTab, setActiveTab] = useState("analytics");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<ICRReport | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [downloadingReportId, setDownloadingReportId] = useState<number | null>(null);

  // Fetch ICR reports
  const { data: response, isLoading, error, refetch } = useQuery({
    queryKey: ["icr-reports"],
    queryFn: () => fetchICRReports(),
  });

  const reports = response?.data?.reports ?? [];
  const school = response?.data?.school;

  // Get list of already submitted months
  const submittedMonths = useMemo(() => {
    return reports.map((r) => r.report_month);
  }, [reports]);

  const handleViewReport = (report: ICRReport) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  // Download ICR report as XLSX
  const handleDownloadReport = (report: ICRReport) => {
    setDownloadingReportId(report.report_id);

    try {
      const monthLabel = formatReportMonth(report.report_month);
      const totalLeads = report.lead_generation.reduce((sum, lg) => sum + lg.qualified_leads, 0);
      const totalEngaged = report.lead_engagement.reduce((sum, le) => sum + le.leads_engaged, 0);
      const funnel = report.application_funnel;

      // Sheet 1: Summary
      const summaryData = [{
        "Month": monthLabel,
        "Representative": report.client_name,
        "Email": report.client_email,
        "Leads Generated": totalLeads,
        "Leads Engaged": totalEngaged,
        "Funnel - Engaged": funnel?.leads_engaged ?? 0,
        "Funnel - Not Interested": funnel?.not_interested ?? 0,
        "Funnel - Interested 2026": funnel?.interested_2026 ?? 0,
        "Applications": funnel?.applications_submitted ?? 0,
        "Admitted": funnel?.admitted ?? 0,
        "Offers Accepted": funnel?.offers_accepted ?? 0,
        "Enrolled": funnel?.enrolled ?? 0,
      }];

      // Sheet 2: Activities
      const activitiesData: Array<Record<string, string | number>> = [];

      // Add lead generation activities
      report.lead_generation.forEach((lg) => {
        activitiesData.push({
          "Month": monthLabel,
          "Representative": report.client_name,
          "Activity Type": "Lead Generation",
          "Activity": activityTypeLabels[lg.activity_type] || lg.activity_type,
          "Count": lg.qualified_leads,
          "Description": lg.description || "",
        });
      });

      // Add lead engagement activities
      report.lead_engagement.forEach((le) => {
        activitiesData.push({
          "Month": monthLabel,
          "Representative": report.client_name,
          "Activity Type": "Lead Engagement",
          "Activity": activityTypeLabels[le.activity_type] || le.activity_type,
          "Count": le.leads_engaged,
          "Description": le.description || "",
        });
      });

      // Ensure there's at least one row for Activities sheet
      if (activitiesData.length === 0) {
        activitiesData.push({
          "Month": monthLabel,
          "Representative": report.client_name,
          "Activity Type": "",
          "Activity": "No activities recorded",
          "Count": 0,
          "Description": "",
        });
      }

      // Generate filename: ICR_Report_MonthName_Year_ReportId.xlsx
      const [year, month] = report.report_month.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      const monthName = date.toLocaleDateString("en-US", { month: "long" });
      const filename = `ICR_Report_${monthName}_${year}_${report.report_id}.xlsx`;

      exportMultipleSheetsToXLSX(
        [
          { data: summaryData, sheetName: "Summary" },
          { data: activitiesData, sheetName: "Activities" },
        ],
        filename
      );
    } catch (err) {
      console.error("Failed to download ICR report:", err);
    } finally {
      setDownloadingReportId(null);
    }
  };

  const handleReportSuccess = () => {
    // Refetch reports after successful submission
    refetch();
    // Switch to analytics tab to see the new report
    setActiveTab("analytics");
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">
            In-Country <span className="text-primary">Representation</span>
          </h1>
          <p className="text-muted-foreground">
            {school ? `${school.school_name} - ${school.university}` : "Monitor regional engagement and performance across different markets"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            View Analytics
          </TabsTrigger>
          <TabsTrigger value="add-report" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Report
          </TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <ICRAnalytics
            reports={reports}
            school={school}
            isLoading={isLoading}
            error={!!error || !response?.success}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onViewReport={handleViewReport}
            onDownloadReport={handleDownloadReport}
            downloadingReportId={downloadingReportId}
          />
        </TabsContent>

        {/* Add Report Tab */}
        <TabsContent value="add-report" className="space-y-6">
          <ICRReportForm
            onSuccess={handleReportSuccess}
            submittedMonths={submittedMonths}
          />
        </TabsContent>
      </Tabs>

      {/* Report Detail Modal */}
      <ICRReportDetailModal
        report={selectedReport}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </DashboardLayout>
  );
}
