import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ICRReportForm } from "@/components/icr/ICRReportForm";
import { PreviousReportsModal } from "@/components/icr/PreviousReportsModal";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import type { ICRReport } from "@/lib/api/icr";

const AddICRReport = () => {
  const [showPreviousReports, setShowPreviousReports] = useState(false);
  const [editReport, setEditReport] = useState<ICRReport | null>(null);
  const queryClient = useQueryClient();

  const handleEditReport = (report: ICRReport) => {
    setEditReport(report);
  };

  const handleCancelEdit = () => {
    setEditReport(null);
  };

  const handleSuccess = () => {
    setEditReport(null);
    queryClient.invalidateQueries({ queryKey: ["icr-reports"] });
    queryClient.invalidateQueries({ queryKey: ["icr-reports-modal"] });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {editReport ? "Edit Monthly Report" : "Add Monthly Report"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {editReport 
                ? "Update your in-country representation monthly performance data"
                : "Submit your in-country representation monthly performance data"
              }
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

        <ICRReportForm 
          editReport={editReport}
          onCancelEdit={handleCancelEdit}
          onSuccess={handleSuccess}
        />

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
