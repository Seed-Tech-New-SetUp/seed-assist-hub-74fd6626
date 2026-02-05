import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ICRReportForm } from "@/components/icr/ICRReportForm";
import { PreviousReportsModal } from "@/components/icr/PreviousReportsModal";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { ICRReport } from "@/lib/api/icr";

const AddICRReport = () => {
  const [showPreviousReports, setShowPreviousReports] = useState(false);

  const handleEditReport = (report: ICRReport) => {
    // TODO: Implement edit mode in form
    toast({
      title: "Edit Mode",
      description: `Editing ${report.report_month} report. Feature coming soon!`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Add Monthly Report</h1>
            <p className="text-muted-foreground mt-1">
              Submit your in-country representation monthly performance data
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowPreviousReports(true)}
            className="gap-2"
          >
            <History className="h-4 w-4" />
            View Previous Reports
          </Button>
        </div>

        <ICRReportForm />

        <PreviousReportsModal
          open={showPreviousReports}
          onOpenChange={setShowPreviousReports}
          onEditReport={handleEditReport}
        />
      </div>
    </DashboardLayout>
  );
};

export default AddICRReport;
