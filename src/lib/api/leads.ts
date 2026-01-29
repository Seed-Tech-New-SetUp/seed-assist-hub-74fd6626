import { getPortalToken } from "@/lib/utils/cookies";
import { decodeObjectStrings } from "@/lib/utils/decode-utf8";
import { handleUnauthorized, isUnauthorizedError } from "@/lib/utils/auth-handler";

// ============ Types ============

export interface LeadStats {
  totalLeads: number;
  newLeads: number;
  activeLeads: number;
  engagedLeads: number;
}

export interface LeadProgram {
  id: string;
  program_name: string;
}

export interface LeadCountry {
  key: string;
  value: string;
}

export interface Lead {
  school_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  country_of_residence: string;
  country_name: string;
  flag_code: string;
  phone: string;
  intended_study_level: string;
  intended_subject_area: string;
  intended_pg_program_start_year: string;
  registration_date: string;
  page_views: number;
  programs_viewed: string; // comma-separated
  total_clicks: number;
  last_activity: string;
  utm_sources: string;
}

export interface UserData {
  school_id: string;
  school_name: string;
}

export interface LeadsFilter {
  filter_page?: string;
  program_id?: string;
  date_filter?: string;
  country?: string;
}

// ============ API Helper ============

async function callLeadsProxy<T>(action: string, method: "GET" | "POST" = "GET", body?: unknown): Promise<T> {
  const token = getPortalToken();
  if (!token) {
    handleUnauthorized("No authentication token found");
  }

  const queryParams = new URLSearchParams({ action });
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/school-profile-proxy?${queryParams}`;

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
  };

  if (body && method === "POST") {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));

  if (isUnauthorizedError(response.status, data)) {
    const errorMessage = typeof data.error === 'object' 
      ? data.error?.message 
      : (data.error || data.message);
    handleUnauthorized(errorMessage);
  }

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  if (data.success === false) {
    const errorMessage = typeof data.error === 'object' 
      ? data.error?.message 
      : (data.error || data.message || "Request failed");
    throw new Error(errorMessage);
  }

  return data as T;
}

// ============ Leads API ============

export async function fetchUserData(): Promise<UserData> {
  const result = await callLeadsProxy<{ success: boolean; data: UserData }>("leads-user-data", "GET");
  return decodeObjectStrings(result.data);
}

export async function fetchLeadStats(): Promise<LeadStats> {
  const result = await callLeadsProxy<{ success: boolean; data: LeadStats }>("leads-stats", "GET");
  return result.data;
}

export async function fetchLeadPrograms(): Promise<LeadProgram[]> {
  const result = await callLeadsProxy<{ success: boolean; data: { programs: LeadProgram[]; count: number } }>("leads-programs", "GET");
  return decodeObjectStrings(result.data?.programs || []);
}

export async function fetchLeadCountries(): Promise<LeadCountry[]> {
  const result = await callLeadsProxy<{ success: boolean; data: { countries: LeadCountry[] } }>("leads-countries", "GET");
  return decodeObjectStrings(result.data?.countries || []);
}

export async function fetchLeads(filters: LeadsFilter): Promise<Lead[]> {
  const result = await callLeadsProxy<{ success: boolean; data: { res: Lead[]; count: number } }>("leads-list", "POST", filters);
  return decodeObjectStrings(result.data?.res || []);
}

export async function exportLeads(filters: LeadsFilter): Promise<Blob> {
  const token = getPortalToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const queryParams = new URLSearchParams({ action: "leads-export" });
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/school-profile-proxy?${queryParams}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify(filters),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Export failed with status ${response.status}`);
  }

  return response.blob();
}
