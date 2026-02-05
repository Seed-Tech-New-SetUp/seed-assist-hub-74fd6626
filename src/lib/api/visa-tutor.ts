import { supabase } from "@/integrations/supabase/client";
import { AUTH_COOKIES, getCookie } from "@/lib/utils/cookies";
import { decodeObjectStrings } from "@/lib/utils/decode-utf8";

const getAuthToken = (): string | null => {
  return getCookie(AUTH_COOKIES.TOKEN) || getCookie("auth_token");
};

export interface VisaLicense {
  license_number: string;
  alloted_to?: string | null;
  created_date?: string;
  partner_id?: string;
  sub_partner_id?: string;
  puid?: string;
  student_name?: string | null;
  first_name?: string;
  last_name?: string;
  email?: string | null;
  mobile?: string | null;
  target_degree?: string | null;
  visa_app_type?: string | null;
  visa_slot_date?: string | null;
  activation_expiry_date?: string;
  activation_status: string;
  activation_date?: string | null;
  usage_expiry_date?: string | null;
  usage_status: string;
  usage_start_date?: string | null;
  test_attempted?: number;
  university?: string | null;
  target_country?: string | null;
  target_intake?: string | null;
  visa_interview_status?: string | null;
  rejection_visa_status?: string | null;
  language_exam_taken?: boolean;
  aptitude_exam_taken?: boolean;
  performance?: {
    avg_overall_score?: number | null;
    best_overall_score?: number | null;
    avg_communication_score?: number | null;
    avg_body_language_score?: number | null;
    avg_visa_score?: number | null;
    first_test_date?: string | null;
    last_test_date?: string | null;
  };
  // Legacy fields for backward compatibility
  visa_status?: string;
  visa_interview_date?: string;
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

  const data = await response.json();
  return decodeObjectStrings(data);
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

  const data = await response.json();
  return decodeObjectStrings(data);
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

  const data = await response.json();
  return decodeObjectStrings(data);
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
