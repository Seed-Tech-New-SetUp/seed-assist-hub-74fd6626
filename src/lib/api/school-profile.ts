import { getPortalToken } from "@/lib/utils/cookies";
import { decodeObjectStrings } from "@/lib/utils/decode-utf8";

// ============ Types ============

export interface SchoolInfo {
  school_id?: string;
  school_name?: string;
  university?: string;
  about?: string;
  currency?: string;
  city?: string;
  state?: string;
  country?: string;
  school_banner?: string;
  school_logo?: string;
  graduate_phd_programs?: string;
  school_brochure_link?: string;
  international_students?: string;
  scholarship_amount?: string | null;
}

export interface SchoolInfoResponse {
  success: boolean;
  data?: {
    school: SchoolInfo;
  };
  error?: string;
}

export interface SchoolFAQ {
  faq_id?: string;
  question: string;
  answer: string;
  created_on?: string;
}

export interface SchoolFAQsResponse {
  success: boolean;
  data?: {
    faqs: SchoolFAQ[];
    count: number;
  };
  error?: string;
}

// ============ API Helper ============

async function callSchoolProfileProxy<T>(
  action: string,
  method: "GET" | "POST" = "GET",
  body?: unknown
): Promise<T> {
  const token = getPortalToken();
  if (!token) {
    throw new Error("No authentication token found");
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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

// ============ School Info API ============

export async function fetchSchoolInfo(): Promise<SchoolInfo> {
  const result = await callSchoolProfileProxy<SchoolInfoResponse>("info", "GET");
  const info = result.data?.school || {};
  return decodeObjectStrings(info);
}

export async function saveSchoolInfo(info: Partial<SchoolInfo>): Promise<boolean> {
  const result = await callSchoolProfileProxy<{ success: boolean }>(
    "info",
    "POST",
    info
  );
  return result.success;
}

// ============ FAQs API ============

export async function fetchSchoolFAQs(): Promise<SchoolFAQ[]> {
  const result = await callSchoolProfileProxy<SchoolFAQsResponse>("faqs", "GET");
  const faqs = result.data?.faqs || [];
  return decodeObjectStrings(faqs);
}

export async function saveSchoolFAQs(faqs: SchoolFAQ[]): Promise<boolean> {
  const result = await callSchoolProfileProxy<{ success: boolean }>(
    "faqs",
    "POST",
    { faqs }
  );
  return result.success;
}
