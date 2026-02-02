import { supabase } from "@/integrations/supabase/client";
import { AUTH_COOKIES, getCookie } from "@/lib/utils/cookies";

const getAuthToken = (): string | null => {
  return getCookie(AUTH_COOKIES.TOKEN) || getCookie("auth_token");
};

export interface VisaLicense {
  license_number: string;
  student_name: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  mobile?: string;
  activation_status: "active" | "inactive" | "expired";
  usage_status: "used" | "unused" | "partial";
  visa_status?: "not_applied" | "applied" | "approved" | "rejected" | "scheduled";
  visa_interview_date?: string;
  target_degree?: string;
  university?: string;
  target_country?: string;
  target_intake?: string;
  created_at?: string;
  expires_at?: string;
  sessions_completed?: number;
  sessions_total?: number;
}

export interface LicenseDetails extends VisaLicense {
  notes?: string;
  assigned_date?: string;
  last_activity?: string;
}

export interface SessionDetails {
  session_id: number;
  license_number: string;
  session_date: string;
  session_type?: string;
  duration_minutes?: number;
  tutor_name?: string;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  notes?: string;
}

export interface ReassignPayload {
  license_number: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  mobile?: string;
  target_degree?: string;
  visa_status?: string;
  visa_interview_date?: string;
  university?: string;
  target_country?: string;
  target_intake?: string;
}

export interface VisaLicensesResponse {
  success: boolean;
  data?: {
    licenses: VisaLicense[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      current_page: number;
      total_pages: number;
      has_more: boolean;
    };
  };
  error?: string;
}

export interface LicenseDetailsResponse {
  success: boolean;
  data?: LicenseDetails;
  error?: string;
}

export interface SessionDetailsResponse {
  success: boolean;
  data?: SessionDetails[];
  error?: string;
}

export interface ReassignResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface BulkUploadResponse {
  success: boolean;
  message?: string;
  processed?: number;
  errors?: string[];
  error?: string;
}

interface FetchOptions {
  search?: string;
  activation_status?: string;
  usage_status?: string;
  visa_status?: string;
  limit?: number;
  offset?: number;
}

export async function fetchVisaLicenses(options: FetchOptions = {}): Promise<VisaLicensesResponse> {
  const token = getAuthToken();
  if (!token) {
    return { success: false, error: "No authentication token found" };
  }

  const params = new URLSearchParams({ action: "list" });
  if (options.search) params.append("search", options.search);
  if (options.activation_status) params.append("activation_status", options.activation_status);
  if (options.usage_status) params.append("usage_status", options.usage_status);
  if (options.visa_status) params.append("visa_status", options.visa_status);
  params.append("limit", String(options.limit || 100));
  params.append("offset", String(options.offset || 0));

  const { data, error } = await supabase.functions.invoke("visa-tutor-proxy", {
    headers: { Authorization: `Bearer ${token}` },
    body: null,
    method: "GET",
  });

  // Supabase functions.invoke doesn't support query params directly, so we use fetch
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/visa-tutor-proxy?${params.toString()}`,
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
    return { success: false, error: errorData.error || "Failed to fetch licenses" };
  }

  return response.json();
}

export async function fetchLicenseDetails(licenseNumber: string): Promise<LicenseDetailsResponse> {
  const token = getAuthToken();
  if (!token) {
    return { success: false, error: "No authentication token found" };
  }

  const params = new URLSearchParams({
    action: "license_details",
    license_number: licenseNumber,
  });

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/visa-tutor-proxy?${params.toString()}`,
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
    return { success: false, error: errorData.error || "Failed to fetch license details" };
  }

  return response.json();
}

export async function fetchSessionDetails(
  licenseNumber: string,
  sessionId?: number
): Promise<SessionDetailsResponse> {
  const token = getAuthToken();
  if (!token) {
    return { success: false, error: "No authentication token found" };
  }

  const params = new URLSearchParams({
    action: "session_details",
    license_number: licenseNumber,
  });
  if (sessionId) params.append("session_id", String(sessionId));

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/visa-tutor-proxy?${params.toString()}`,
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
    return { success: false, error: errorData.error || "Failed to fetch session details" };
  }

  return response.json();
}

export async function reassignLicense(payload: ReassignPayload): Promise<ReassignResponse> {
  const token = getAuthToken();
  if (!token) {
    return { success: false, error: "No authentication token found" };
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/visa-tutor-proxy?action=reassign`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return { success: false, error: errorData.error || "Failed to reassign license" };
  }

  return response.json();
}

export async function bulkUploadLicenses(file: File): Promise<BulkUploadResponse> {
  const token = getAuthToken();
  if (!token) {
    return { success: false, error: "No authentication token found" };
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/visa-tutor-proxy?action=bulk_upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return { success: false, error: errorData.error || "Failed to upload file" };
  }

  return response.json();
}
