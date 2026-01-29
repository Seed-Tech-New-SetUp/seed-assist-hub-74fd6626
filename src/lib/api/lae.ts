import { supabase } from "@/integrations/supabase/client";
import { getCookie, AUTH_COOKIES } from "@/lib/utils/cookies";
import { handleUnauthorized, isUnauthorizedError } from "@/lib/utils/auth-handler";

// Types
export interface LAEFile {
  file_id: number;
  original_file_name: string;
  file_type: string;
  file_size_in_mb: string;
  uploaded_at: string;
  download_url: string;
  assignment_id: string | null;
}

export interface LAEAssignment {
  assignment_id: string;
  assignment_type: string;
  cycle: string | null;
  start_date: string | null;
  status: "pending" | "active" | "in_progress" | "completed";
}

export interface AnalyticsColumnInfo {
  status_column: string | null;
  program_column: string | null;
}

export interface DistributionItem {
  program?: string;
  lead_status?: string;
  count: number;
}

export interface AnalyticsData {
  success: boolean;
  columns: AnalyticsColumnInfo;
  filters: {
    statuses: string[];
    programs: string[];
  };
  total_records: number;
  program_total: number;
  status_total: number;
  program_distribution: DistributionItem[];
  status_distribution: DistributionItem[];
}

export interface DetailDataResponse {
  success: boolean;
  data: Record<string, unknown>[];
  columns: string[];
  headers: string[] | null;
}

// Helper to get auth token
const getAuthToken = (): string | null => {
  return getCookie(AUTH_COOKIES.TOKEN) || getCookie("auth_token");
};

// Helper to check response for auth errors - supports nested { error: { code, message } }
function checkAuthError(data: { success?: boolean; error?: string | { code?: string; message?: string }; message?: string }, error?: { message?: string; status?: number }) {
  if (error?.status === 401 || error?.status === 403) {
    handleUnauthorized(error.message);
  }
  if (data && isUnauthorizedError(error?.status || 0, data)) {
    const errorMessage = typeof data.error === 'object' 
      ? data.error?.message 
      : (data.error || data.message);
    handleUnauthorized(errorMessage);
  }
}

// API Functions
export async function fetchLAEFiles(): Promise<LAEFile[]> {
  const token = getAuthToken();
  if (!token) handleUnauthorized("No authentication token");

  const { data, error } = await supabase.functions.invoke("lae-proxy", {
    body: { action: "list" },
    headers: { Authorization: `Bearer ${token}` },
  });

  checkAuthError(data, error as { message?: string; status?: number });
  if (error) throw new Error(error.message);
  if (!data?.success) throw new Error(data?.error || "Failed to fetch files");

  return data.files || [];
}

export async function uploadLAEFile(file: File): Promise<{ success: boolean; file_id?: string }> {
  const token = getAuthToken();
  if (!token) handleUnauthorized("No authentication token");

  // Convert file to base64
  const reader = new FileReader();
  const base64Promise = new Promise<string>((resolve, reject) => {
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const base64Content = await base64Promise;

  const { data, error } = await supabase.functions.invoke("lae-proxy", {
    body: {
      action: "upload",
      file_name: file.name,
      file_type: file.type,
      file_content: base64Content,
      assignment_id: `LAE_${Date.now()}`,
    },
    headers: { Authorization: `Bearer ${token}` },
  });

  checkAuthError(data, error as { message?: string; status?: number });
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteLAEFile(fileId: number): Promise<{ success: boolean }> {
  const token = getAuthToken();
  if (!token) handleUnauthorized("No authentication token");

  const { data, error } = await supabase.functions.invoke("lae-proxy", {
    body: { action: "delete", file_id: fileId },
    headers: { Authorization: `Bearer ${token}` },
  });

  checkAuthError(data, error as { message?: string; status?: number });
  if (error) throw new Error(error.message);
  if (!data?.success) throw new Error(data?.error || "Failed to delete file");

  return data;
}

export async function fetchLAEAssignments(): Promise<LAEAssignment[]> {
  const token = getAuthToken();
  if (!token) handleUnauthorized("No authentication token");

  const { data, error } = await supabase.functions.invoke("lae-proxy", {
    body: { action: "assignments" },
    headers: { Authorization: `Bearer ${token}` },
  });

  checkAuthError(data, error as { message?: string; status?: number });
  if (error) throw new Error(error.message);
  if (!data?.success) throw new Error(data?.error || "Failed to fetch assignments");

  // Map API response to our interface
  return (data.assignments || []).map((a: Record<string, unknown>) => ({
    assignment_id: a.assignment_id || a.id,
    assignment_type: a.assignment_type || a.type || 'Lead Analytics',
    cycle: a.cycle || null,
    start_date: a.start_date || a.created_at || null,
    status: a.status || 'pending',
  }));
}

export async function fetchAnalyticsData(
  assignmentId: string,
  statusFilter: string = "all",
  programFilter: string = "all"
): Promise<AnalyticsData> {
  const token = getAuthToken();
  if (!token) handleUnauthorized("No authentication token");

  const { data, error } = await supabase.functions.invoke("lae-proxy", {
    body: {
      action: "analytics",
      assignment_id: assignmentId,
      status: statusFilter,
      program: programFilter,
    },
    headers: { Authorization: `Bearer ${token}` },
  });

  checkAuthError(data, error as { message?: string; status?: number });
  if (error) throw new Error(error.message);
  if (!data?.success) throw new Error(data?.error || "Failed to fetch analytics");

  return data;
}

export async function fetchDetailData(
  assignmentId: string,
  filterType: "status" | "program",
  filterValues: string[],
  crossFilters?: { status?: string; program?: string }
): Promise<DetailDataResponse> {
  const token = getAuthToken();
  if (!token) handleUnauthorized("No authentication token");

  const { data, error } = await supabase.functions.invoke("lae-proxy", {
    body: {
      action: "detail",
      assignment_id: assignmentId,
      filter_type: filterType,
      filter_values: filterValues,
      multiple: filterValues.length > 1,
      ...crossFilters,
    },
    headers: { Authorization: `Bearer ${token}` },
  });

  checkAuthError(data, error as { message?: string; status?: number });
  if (error) throw new Error(error.message);
  if (!data?.success) throw new Error(data?.error || "Failed to fetch detail data");

  return data;
}

export function getDetailExportUrl(
  assignmentId: string,
  filterType: "status" | "program",
  filterValues: string[],
  crossFilters?: { status?: string; program?: string }
): string {
  const params = new URLSearchParams({
    assignment_id: assignmentId,
    filter_type: filterType,
    filter_value: filterValues.join(","),
  });

  if (filterValues.length > 1) params.append("multiple", "1");
  if (crossFilters?.status && crossFilters.status !== "all") {
    params.append("status", crossFilters.status);
  }
  if (crossFilters?.program && crossFilters.program !== "all") {
    params.append("program", crossFilters.program);
  }

  return `/api/lae/detail/export?${params.toString()}`;
}

export function getAnalyticsExportUrl(
  assignmentId: string,
  statusFilter?: string,
  programFilter?: string
): string {
  const params = new URLSearchParams({ assignment_id: assignmentId });
  if (statusFilter && statusFilter !== "all") params.append("status", statusFilter);
  if (programFilter && programFilter !== "all") params.append("program", programFilter);

  return `/api/lae/analytics/export?${params.toString()}`;
}
