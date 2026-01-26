import { getPortalToken } from "@/lib/utils/cookies";

// ============ Types ============

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

// ============ FAQs API ============

export async function fetchSchoolFAQs(): Promise<SchoolFAQ[]> {
  const result = await callSchoolProfileProxy<SchoolFAQsResponse>("faqs", "GET");
  return result.data?.faqs || [];
}

export async function saveSchoolFAQs(faqs: SchoolFAQ[]): Promise<boolean> {
  const result = await callSchoolProfileProxy<{ success: boolean }>(
    "faqs",
    "POST",
    { faqs }
  );
  return result.success;
}
