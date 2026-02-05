import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ICRReportForm } from "@/components/icr/ICRReportForm";

const AddICRReport = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Add Monthly Report</h1>
          <p className="text-muted-foreground mt-1">
            Submit your in-country representation monthly performance data
          </p>
        </div>

        <ICRReportForm />
      </div>
    </DashboardLayout>
  );
};

export default AddICRReport;
