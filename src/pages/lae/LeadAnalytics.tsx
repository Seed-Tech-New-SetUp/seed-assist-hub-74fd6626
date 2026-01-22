import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, ClipboardList, Loader2 } from "lucide-react";
import { FileUploadZone } from "@/components/lae/FileUploadZone";
import { FilesList } from "@/components/lae/FilesList";
import { AssignmentCard } from "@/components/lae/AssignmentCard";
import { AnalyticsModal } from "@/components/lae/AnalyticsModal";
import {
  LAEFile,
  LAEAssignment,
  fetchLAEFiles,
  fetchLAEAssignments,
  uploadLAEFile,
  deleteLAEFile,
} from "@/lib/api/lae";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function LeadAnalytics() {
  const { user } = useAuth();

  // File state
  const [files, setFiles] = useState<LAEFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFileName, setUploadingFileName] = useState<string | null>(null);
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null);

  // Assignment state
  const [assignments, setAssignments] = useState<LAEAssignment[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true);

  // Analytics modal state
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [selectedAssignmentName, setSelectedAssignmentName] = useState("");

  // Load files
  const loadFiles = useCallback(async () => {
    setIsLoadingFiles(true);
    try {
      const data = await fetchLAEFiles();
      setFiles(data);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load files",
        variant: "destructive",
      });
    } finally {
      setIsLoadingFiles(false);
    }
  }, []);

  // Load assignments
  const loadAssignments = useCallback(async () => {
    setIsLoadingAssignments(true);
    try {
      const data = await fetchLAEAssignments();
      setAssignments(data);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load assignments",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAssignments(false);
    }
  }, []);

  useEffect(() => {
    loadFiles();
    loadAssignments();
  }, [loadFiles, loadAssignments]);

  // Handle file upload
  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setUploadingFileName(file.name);
    setUploadProgress(0);

    // Simulate progress (actual progress would come from XHR if needed)
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      await uploadLAEFile(file);
      clearInterval(progressInterval);
      setUploadProgress(100);
      toast({
        title: "Success",
        description: `File "${file.name}" uploaded successfully!`,
      });
      loadFiles();
    } catch (error) {
      clearInterval(progressInterval);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadingFileName(null);
        setUploadProgress(0);
      }, 1000);
    }
  };

  // Handle file delete
  const handleDelete = async (fileId: number) => {
    setDeletingFileId(fileId);
    try {
      await deleteLAEFile(fileId);
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
      loadFiles();
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete file",
        variant: "destructive",
      });
    } finally {
      setDeletingFileId(null);
    }
  };

  // Handle view analytics
  const handleViewAnalytics = (assignmentId: string, assignmentName: string) => {
    setSelectedAssignmentId(assignmentId);
    setSelectedAssignmentName(assignmentName);
    setAnalyticsModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome, {(user as any)?.full_name || (user as any)?.client_name || (user as any)?.user_metadata?.full_name || "User"}
          </h1>
          <p className="text-muted-foreground">
            Lead Analytics Engine
          </p>
        </div>

        {/* File Upload and List */}
        <div className="grid lg:grid-cols-2 gap-6">
          <FileUploadZone
            onUpload={handleUpload}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            uploadingFileName={uploadingFileName}
          />
          <FilesList
            files={files}
            isLoading={isLoadingFiles}
            onRefresh={loadFiles}
            onDelete={handleDelete}
            deletingFileId={deletingFileId}
          />
        </div>

        {/* Analytics Assignments */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                Analytics Assignments
              </CardTitle>
              <CardDescription>
                View and analyze your assigned data projects
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadAssignments}
              disabled={isLoadingAssignments}
            >
              <RefreshCw
                className={`h-4 w-4 mr-1.5 ${isLoadingAssignments ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingAssignments ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                <p className="text-sm text-muted-foreground">Loading assignments...</p>
              </div>
            ) : assignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <ClipboardList className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground">No Assignments Yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  You don't have any assignments at the moment.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <AssignmentCard
                    key={assignment.assignment_id}
                    assignment={assignment}
                    onViewAnalytics={handleViewAnalytics}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analytics Modal */}
      <AnalyticsModal
        open={analyticsModalOpen}
        onOpenChange={setAnalyticsModalOpen}
        assignmentId={selectedAssignmentId}
        assignmentName={selectedAssignmentName}
      />
    </DashboardLayout>
  );
}
