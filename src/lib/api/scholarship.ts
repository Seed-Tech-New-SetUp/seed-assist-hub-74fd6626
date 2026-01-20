import { supabase } from "@/integrations/supabase/client";
import { getCookie } from "@/lib/utils/cookies";
import { decodeObjectStrings } from "@/lib/utils/decode-utf8";

// ===========================================
// Scholarship API Types
// ===========================================

export type WorkflowStatus = "pending" | "shortlisted" | "onhold" | "rejected" | "winner" | "recommended";

export interface ApiApplicant {
  contact_id: string;
  name: string;
  email: string;
  nationality: string;
  gender: string;
  status: string;
  award_name: string | null;
  standardised_test: string;
  standardised_test_score: string;
  standardised_test_display: string;
  ug_completion_year: number;
  ug_scale: string;
  ug_score: string;
  ug_gpa_display: string;
  work_experience: string;
  round: number;
}

export interface ApiMeta {
  total_applicants: number;
  filtered_count: number;
  status_counts: {
    recommended: number;
    pending: number;
    shortlisted: number;
    onhold: number;
    rejected: number;
    winners: number;
  };
}

export interface ApiFilterOptions {
  nationalities: string[];
  genders: string[];
  completion_years: number[];
  test_types: string[];
  ug_scales: string[];
  rounds: string[];
}

export interface ApplicantsResponse {
  success: boolean;
  data: {
    applicants: ApiApplicant[];
    meta: ApiMeta;
    filter_options: ApiFilterOptions;
  };
}

// Transformed applicant for UI
export interface Applicant {
  id: string;
  name: string;
  email: string;
  country: string;
  countryCode: string;
  nationality: string;
  gender: string;
  isSeedRecommended: boolean;
  status: WorkflowStatus;
  standardizedTest: {
    name: string;
    score: number;
    display: string;
  };
  ugCompletionYear: number;
  ugGpaDisplay: string;
  ugScale: string;
  workExperience: number;
  round: number;
}

// Country code mapping for common nationalities
const countryCodeMap: Record<string, string> = {
  "Ghana": "GH",
  "Nigeria": "NG",
  "Kenya": "KE",
  "Ethiopia": "ET",
  "Egypt": "EG",
  "India": "IN",
  "China": "CN",
  "Rwanda": "RW",
  "Zimbabwe": "ZW",
  "Congo": "CD",
  "Tanzania": "TZ",
  "Uganda": "UG",
  "Saudi Arabia": "SA",
  "South Africa": "ZA",
  "Cameroon": "CM",
  "Senegal": "SN",
  "Zambia": "ZM",
  "Malawi": "MW",
  "Morocco": "MA",
  "Tunisia": "TN",
  "Algeria": "DZ",
  "Pakistan": "PK",
  "Bangladesh": "BD",
  "Sri Lanka": "LK",
  "Nepal": "NP",
  "Vietnam": "VN",
  "Indonesia": "ID",
  "Philippines": "PH",
  "Malaysia": "MY",
  "Thailand": "TH",
  "Brazil": "BR",
  "Mexico": "MX",
  "Colombia": "CO",
  "Argentina": "AR",
  "Peru": "PE",
  "Chile": "CL",
};

function getCountryCode(nationality: string): string {
  return countryCodeMap[nationality] || "UN"; // UN = unknown/generic flag
}

function normalizeStatus(status: string): WorkflowStatus {
  const normalized = status.toLowerCase().trim();
  if (normalized === "winner" || normalized === "winners") return "winner";
  if (normalized === "on_hold" || normalized === "onhold") return "onhold";
  if (["pending", "shortlisted", "rejected", "recommended"].includes(normalized)) {
    return normalized as WorkflowStatus;
  }
  return "pending";
}

function transformApplicant(api: ApiApplicant): Applicant {
  return {
    id: api.contact_id,
    name: api.name,
    email: api.email,
    country: api.nationality,
    countryCode: getCountryCode(api.nationality),
    nationality: api.nationality,
    gender: api.gender,
    isSeedRecommended: api.status.toLowerCase() === "recommended",
    status: normalizeStatus(api.status),
    standardizedTest: {
      name: api.standardised_test,
      score: parseFloat(api.standardised_test_score) || 0,
      display: api.standardised_test_display,
    },
    ugCompletionYear: api.ug_completion_year,
    ugGpaDisplay: api.ug_gpa_display,
    ugScale: api.ug_scale,
    workExperience: parseFloat(api.work_experience) || 0,
    round: api.round,
  };
}

// ===========================================
// API Functions
// ===========================================

export async function fetchApplicants(): Promise<{
  applicants: Applicant[];
  meta: ApiMeta;
  filterOptions: ApiFilterOptions;
}> {
  const token = getCookie("portal_token");
  
  if (!token) {
    throw new Error("Authentication required");
  }

  const { data, error } = await supabase.functions.invoke("scholarship-proxy", {
    body: {},
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (error) {
    console.error("Error fetching applicants:", error);
    throw new Error("Failed to fetch applicants");
  }

  const response = decodeObjectStrings(data) as ApplicantsResponse;

  if (!response.success || !response.data) {
    throw new Error("Invalid response from server");
  }

  return {
    applicants: response.data.applicants.map(transformApplicant),
    meta: response.data.meta,
    filterOptions: response.data.filter_options,
  };
}

export async function fetchApplicantProfile(contactId: string): Promise<unknown> {
  const token = getCookie("portal_token");
  
  if (!token) {
    throw new Error("Authentication required");
  }

  const { data, error } = await supabase.functions.invoke("scholarship-proxy", {
    body: {},
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (error) {
    console.error("Error fetching applicant profile:", error);
    throw new Error("Failed to fetch applicant profile");
  }

  return decodeObjectStrings(data);
}
