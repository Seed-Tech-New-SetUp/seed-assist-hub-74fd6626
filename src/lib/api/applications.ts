import { getCookie, AUTH_COOKIES } from "@/lib/utils/cookies";

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

export async function downloadApplicationsExport(): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/applications-proxy?action=export`;
  console.info("[applications] export: requesting", url);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
  });

  if (!response.ok) {
    // Try to surface backend error JSON (e.g. { success:false, error:"No school found for this client" })
    const contentType = response.headers.get("Content-Type") || "";
    let message = `Failed to download export (HTTP ${response.status})`;
    try {
      if (contentType.includes("application/json")) {
        const err = await response.json().catch(() => null);
        if (err?.error) message = err.error;
        else if (err?.message) message = err.message;
        else if (typeof err === "string") message = err;
      } else {
        const text = await response.text().catch(() => "");
        if (text) message = `${message}: ${text.slice(0, 200)}`;
      }
    } catch {
      // ignore parsing errors; keep generic message
    }

    console.error("[applications] export: failed", {
      status: response.status,
      contentType,
    });
    throw new Error(message);
  }

  // Download the file
  const blob = await response.blob();
  console.info("[applications] export: received blob", {
    size: blob.size,
    type: blob.type,
  });

  if (!blob || blob.size === 0) {
    throw new Error("Downloaded file is empty (0 bytes)");
  }
  const objectUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = `applications-export-${new Date().toISOString().split("T")[0]}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(objectUrl);
}
