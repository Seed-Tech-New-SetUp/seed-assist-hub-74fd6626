import { AUTH_COOKIES, getCookie } from "@/lib/utils/cookies";
import { decodeObjectStrings } from "@/lib/utils/decode-utf8";

const getAuthToken = (): string | null => {
  return getCookie(AUTH_COOKIES.TOKEN) || getCookie("auth_token");
};

const proxyUrl = (params: URLSearchParams) =>
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/visa-tutor-proxy?${params.toString()}`;

const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
});

// ─── Types ───

export interface Allocation {
  puid: string;
  license_no: string;
  student: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  comms_workflow_consent: boolean;
  allocated_by: string;
  allocated_at: string;
  created_at: string;
  updated_at: string;
  license: {
    activation_status: string;
    usage_status: string;
    alloted_to: string | null;
    sub_partner_id: string;
    start_date: string;
    end_date: string;
  };
}

export interface AllocationsResponse {
  success: boolean;
  data?: { allocations: Allocation[] };
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    current_page: number;
    total_pages: number;
    has_more: boolean;
  };
  error?: string | { code: string; message: string };
}

export interface CreateAllocationPayload {
  license_no: string;
  student_first_name: string;
  student_last_name?: string;
  student_email: string;
  student_phone?: string;
  comms_workflow_consent?: boolean;
}

export interface UpdateAllocationPayload {
  license_no: string;
  student_first_name?: string;
  student_last_name?: string;
  student_email?: string;
  student_phone?: string;
  comms_workflow_consent?: boolean;
}

export interface AllocationDetailResponse {
  success: boolean;
  data?: {
    license: {
      license_number: string;
      puid: string;
      partner_id: string;
      sub_partner_id: string;
      activation_status: string;
      usage_status: string;
      alloted_to: string | null;
      start_date: string;
      end_date: string;
      activation_start_date?: string;
      usage_expiry_date?: string;
    };
    allocation: {
      student_first_name: string;
      student_last_name: string;
      student_email: string;
      student_phone: string;
      comms_workflow_consent: boolean;
      allocated_by: string;
      allocated_at: string;
    } | null;
    api_student: {
      first_name: string;
      last_name: string;
      email: string;
      mobile: string;
      university: string;
      target_country: string;
      target_degree: string;
      target_intake: string;
      visa_status: string;
      visa_interview_date: string;
      visa_interview_status: string;
    } | null;
    performance: {
      total_sessions: number;
      avg_overall_score: number | null;
      best_overall_score: number | null;
      avg_communication_score: number | null;
      avg_body_language_score: number | null;
      avg_visa_score: number | null;
      first_test_date: string | null;
      last_test_date: string | null;
    } | null;
    improvements: Array<{
      metric: string;
      first_score: number;
      latest_score: number;
      best_score: number;
      average_score: number;
      total_attempts: number;
      improvement_pct: number;
    }>;
  };
  error?: string | { code: string; message: string };
}

export interface StatsResponse {
  success: boolean;
  data?: {
    licenses: {
      total: number;
      activated: number;
      not_activated: number;
      in_use: number;
      expired: number;
      unused: number;
      assigned: number;
      unassigned: number;
    };
    allocations: {
      total: number;
      with_consent: number;
      with_email: number;
      coverage_pct: number;
    };
    sessions: {
      total_sessions: number;
      licenses_with_tests: number;
      avg_overall: number | null;
      avg_communication: number | null;
      avg_body_language: number | null;
      avg_visa: number | null;
      best_overall: number | null;
      earliest_test: string | null;
      latest_test: string | null;
    };
    score_distribution: Array<{ range: string; count: number }>;
    top_performers: Array<{
      license_number: string;
      student_name: string;
      best_score: number;
      attempts: number;
      last_test: string;
    }>;
    puids: Array<{
      puid: string;
      total_licenses: number;
      activated: number;
      assigned: number;
      total_sessions: number;
      total_allocations: number;
    }>;
  };
  error?: string;
}

export interface VisaLicense {
  license_number: string;
  alloted_to: string | null;
  created_date: string;
  partner_id: string;
  sub_partner_id: string;
  puid: string;
  student_name: string | null;
  mobile: string | null;
  email: string | null;
  target_degree: string | null;
  visa_app_type: string | null;
  activation_status: string;
  usage_status: string;
  test_attempted: number;
}

export interface LicensesListResponse {
  success: boolean;
  data?: {
    licenses: VisaLicense[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      total_pages: number;
    };
  };
  error?: string;
}

export interface SessionData {
  session_id: number;
  practice_key: string;
  session_date: string;
  role: string | null;
  round: string;
  status: string;
  scores: {
    overall: number;
    communication: number;
    body_language: number;
    visa: number;
  };
  visa_readiness_summary: string;
  visa_readiness_details: string;
}

export interface SessionDetailsResponse {
  success: boolean;
  data?: {
    license_number: string;
    sessions: SessionData[];
  };
  error?: string;
}

export interface BulkAllocationPayload {
  allocations: CreateAllocationPayload[];
  on_conflict?: "skip" | "update";
}

export interface BulkAllocationResponse {
  success: boolean;
  message?: string;
  summary?: {
    total_submitted: number;
    created: number;
    updated: number;
    skipped: number;
    failed: number;
  };
  results?: {
    created: Array<{ row: number; license_no: string }>;
    updated: Array<{ row: number; license_no: string }>;
    skipped: Array<{ row: number; license_no: string; reason: string }>;
    failed: Array<{ row: number; license_no: string; reason: string }>;
  };
  error?: string | { code: string; message: string };
}

// ─── Helper ───

function getErrorMessage(err: unknown): string {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (typeof err === "object" && err !== null && "message" in err) return (err as { message: string }).message;
  return JSON.stringify(err);
}

// ─── API Functions ───

export async function fetchStats(): Promise<StatsResponse> {
  const token = getAuthToken();
  if (!token) return { success: false, error: "No authentication token found" };

  const params = new URLSearchParams({ action: "stats" });
  const response = await fetch(proxyUrl(params), { method: "GET", headers: authHeaders(token) });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return { success: false, error: getErrorMessage(errorData.error) || "Failed to fetch stats" };
  }
  return decodeObjectStrings(await response.json());
}

export async function fetchAllocations(options: {
  search?: string;
  consent?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<AllocationsResponse> {
  const token = getAuthToken();
  if (!token) return { success: false, error: "No authentication token found" };

  const params = new URLSearchParams({ action: "allocations" });
  if (options.search) params.append("search", options.search);
  if (options.consent) params.append("consent", options.consent);
  params.append("limit", String(options.limit || 100));
  params.append("offset", String(options.offset || 0));

  const response = await fetch(proxyUrl(params), { method: "GET", headers: authHeaders(token) });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return { success: false, error: getErrorMessage(errorData.error) || "Failed to fetch allocations" };
  }
  return decodeObjectStrings(await response.json());
}

export async function createAllocation(payload: CreateAllocationPayload): Promise<{ success: boolean; message?: string; data?: unknown; error?: string }> {
  const token = getAuthToken();
  if (!token) return { success: false, error: "No authentication token found" };

  const params = new URLSearchParams({ action: "allocations" });
  const response = await fetch(proxyUrl(params), {
    method: "POST",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { success: false, error: getErrorMessage(data.error) || "Failed to create allocation" };
  }
  return data;
}

export async function updateAllocation(payload: UpdateAllocationPayload): Promise<{ success: boolean; message?: string; data?: unknown; error?: string }> {
  const token = getAuthToken();
  if (!token) return { success: false, error: "No authentication token found" };

  const params = new URLSearchParams({ action: "allocation" });
  const response = await fetch(proxyUrl(params), {
    method: "PUT",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { success: false, error: getErrorMessage(data.error) || "Failed to update allocation" };
  }
  return data;
}

export async function fetchAllocationDetail(licenseNo: string): Promise<AllocationDetailResponse> {
  const token = getAuthToken();
  if (!token) return { success: false, error: "No authentication token found" };

  const params = new URLSearchParams({ action: "allocation", license_no: licenseNo });
  const response = await fetch(proxyUrl(params), { method: "GET", headers: authHeaders(token) });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return { success: false, error: getErrorMessage(errorData.error) || "Failed to fetch allocation detail" };
  }
  return decodeObjectStrings(await response.json());
}

export async function fetchLicenses(options: { search?: string; page?: number; limit?: number } = {}): Promise<LicensesListResponse> {
  const token = getAuthToken();
  if (!token) return { success: false, error: "No authentication token found" };

  const params = new URLSearchParams({ action: "list" });
  if (options.search) params.append("search", options.search);
  params.append("limit", String(options.limit || 20));
  params.append("page", String(options.page || 1));

  const response = await fetch(proxyUrl(params), { method: "GET", headers: authHeaders(token) });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return { success: false, error: getErrorMessage(errorData.error) || "Failed to fetch licenses" };
  }
  return decodeObjectStrings(await response.json());
}

export async function fetchSessionDetails(licenseNumber: string): Promise<SessionDetailsResponse> {
  const token = getAuthToken();
  if (!token) return { success: false, error: "No authentication token found" };

  const params = new URLSearchParams({ action: "session_details", license_number: licenseNumber });
  const response = await fetch(proxyUrl(params), { method: "GET", headers: authHeaders(token) });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return { success: false, error: getErrorMessage(errorData.error) || "Failed to fetch session details" };
  }
  return decodeObjectStrings(await response.json());
}

export async function bulkAllocations(payload: BulkAllocationPayload): Promise<BulkAllocationResponse> {
  const token = getAuthToken();
  if (!token) return { success: false, error: "No authentication token found" };

  const params = new URLSearchParams({ action: "allocations_bulk" });
  const response = await fetch(proxyUrl(params), {
    method: "POST",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  return data;
}
