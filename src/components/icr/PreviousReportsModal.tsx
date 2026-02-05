import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Trash2, Pencil, Eye, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchICRReports,
  deleteICRReport,
  formatReportMonth,
  type ICRReport,
} from "@/lib/api/icr";
import { toast } from "@/hooks/use-toast";
import { ICRReportDetailModal } from "./ICRReportDetailModal";

interface PreviousReportsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditReport?: (report: ICRReport) => void;
}

export function PreviousReportsModal({
  open,
  onOpenChange,
  onEditReport,
}: PreviousReportsModalProps) {
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState<ICRReport | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<ICRReport | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["icr-reports-modal"],
    queryFn: () => fetchICRReports(),
    enabled: open,
  });

  const deleteMutation = useMutation({
    mutationFn: (reportId: number) => deleteICRReport(reportId),
    onSuccess: () => {
      toast({
        title: "Report Deleted",
        description: "The report has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["icr-reports"] });
      queryClient.invalidateQueries({ queryKey: ["icr-reports-modal"] });
      setDeleteConfirmOpen(false);
      setReportToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete report",
        variant: "destructive",
      });
    },
  });

  const reports = data?.data?.reports || [];

  const handleViewDetails = (report: ICRReport) => {
    setSelectedReport(report);
    setDetailModalOpen(true);
  };

  const handleDeleteClick = (report: ICRReport) => {
    setReportToDelete(report);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (reportToDelete) {
      deleteMutation.mutate(reportToDelete.report_id);
    }
  };

  const handleEdit = (report: ICRReport) => {
    onOpenChange(false);
    onEditReport?.(report);
  };

  // Calculate totals for a report
  const getReportStats = (report: ICRReport) => {
    const leadsGenerated = report.lead_generation.reduce(
      (sum, lg) => sum + lg.qualified_leads,
      0
    );
    const leadsEngaged = report.lead_engagement.reduce(
      (sum, le) => sum + le.leads_engaged,
      0
    );
    const genActivities = report.lead_generation.length;
    const engActivities = report.lead_engagement.length;

    return { leadsGenerated, leadsEngaged, genActivities, engActivities };
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Previous Reports
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {isLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-40 w-full rounded-xl" />
                ))}
              </div>
            )}

            {error && (
              <div className="text-center py-8 text-destructive">
                Failed to load reports. Please try again.
              </div>
            )}

            {!isLoading && reports.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No reports submitted yet.</p>
                <p className="text-sm">Submit your first monthly report to see it here.</p>
              </div>
            )}

            {reports.map((report) => {
              const stats = getReportStats(report);
              return (
                <Card
                  key={report.report_id}
                  className="p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground mb-2">
                        {formatReportMonth(report.report_month)}
                      </Badge>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Submitted:{" "}
                        {new Date(report.created_at).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-success border-success">
                      SUBMITTED
                    </Badge>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div className="bg-muted/50 p-3 rounded-lg text-center">
                      <p className="text-[10px] uppercase tracking-wider text-primary font-medium mb-1">
                        Leads Generated
                      </p>
                      <p className="text-2xl font-bold">{stats.leadsGenerated}</p>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg text-center">
                      <p className="text-[10px] uppercase tracking-wider text-accent font-medium mb-1">
                        Leads Engaged
                      </p>
                      <p className="text-2xl font-bold">{stats.leadsEngaged}</p>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg text-center">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                        Generation Activities
                      </p>
                      <p className="text-2xl font-bold">{stats.genActivities}</p>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg text-center">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                        Engagement Activities
                      </p>
                      <p className="text-2xl font-bold">{stats.engActivities}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(report)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-1.5" />
                      Delete
                    </Button>
                    <Button
                      variant="accent"
                      size="sm"
                      onClick={() => handleEdit(report)}
                    >
                      <Pencil className="h-4 w-4 mr-1.5" />
                      Edit
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleViewDetails(report)}
                    >
                      <Eye className="h-4 w-4 mr-1.5" />
                      View Full Details
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <ICRReportDetailModal
        report={selectedReport}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the{" "}
              <span className="font-semibold">
                {reportToDelete ? formatReportMonth(reportToDelete.report_month) : ""}
              </span>{" "}
              report? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
