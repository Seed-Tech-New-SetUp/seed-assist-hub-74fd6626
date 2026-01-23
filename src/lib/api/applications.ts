import { getCookie, AUTH_COOKIES } from "@/lib/utils/cookies";
import * as XLSX from "xlsx";

export interface UniversityApplication {
  record_id: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  program_name: string;
  intake: string;
  status: string;
  created_at: string;
}

export interface ApplicationsResponse {
  success: boolean;
  data?: {
    applications: UniversityApplication[];
    meta?: {
      total_applications: number;
      filtered_count: number;
      status_counts: Record<string, number>;
    };
    filter_options?: {
      statuses: string[];
      intakes: string[];
      programs: string[];
    };
    school?: {
      university: string;
      school_name: string;
    };
  };
  error?: string;
}

function getAuthToken(): string | null {
  return getCookie(AUTH_COOKIES.TOKEN) || getCookie("auth_token");
}

export async function fetchApplications(params?: {
  search?: string;
  status?: string;
  program?: string;
  page?: number;
  limit?: number;
}): Promise<ApplicationsResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  // Build query string
  const queryParams = new URLSearchParams({ action: "list" });
  if (params?.search) queryParams.append("search", params.search);
  if (params?.status) queryParams.append("status", params.status);
  if (params?.program) queryParams.append("program", params.program);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/applications-proxy?${queryParams.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch applications");
  }

  return response.json();
}

export function getApplicationsExportUrl(): string {
  const token = getAuthToken();
  if (!token) return "";

  return `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/applications-proxy?action=export`;
}

/**
 * Generate and download an Excel file from the provided applications data (client-side).
 */
export function downloadApplicationsAsExcel(applications: UniversityApplication[], schoolName?: string): void {
  if (!applications || applications.length === 0) {
    throw new Error("No applications data to export");
  }

  // Prepare data for Excel
  const excelData = applications.map((app, index) => ({
    "S.No": index + 1,
    "First Name": app.first_name?.trim() || "",
    "Last Name": app.last_name?.trim() || "",
    "Email": app.email || "",
    "Phone": app.phone_number || "",
    "Program": app.program_name || "",
    "Intake": app.intake || "",
    "Status": app.status || "",
    "Applied Date": app.created_at ? new Date(app.created_at).toLocaleDateString() : "",
  }));

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  
  // Set column widths for better readability
  worksheet["!cols"] = [
    { wch: 6 },   // S.No
    { wch: 15 },  // First Name
    { wch: 15 },  // Last Name
    { wch: 30 },  // Email
    { wch: 15 },  // Phone
    { wch: 25 },  // Program
    { wch: 12 },  // Intake
    { wch: 12 },  // Status
    { wch: 12 },  // Applied Date
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");

  // Generate filename
  const dateStr = new Date().toISOString().split("T")[0];
  const sanitizedSchool = schoolName ? schoolName.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30) : "University";
  const filename = `Applications_${sanitizedSchool}_${dateStr}.xlsx`;

  // Trigger download
  XLSX.writeFile(workbook, filename);
}
