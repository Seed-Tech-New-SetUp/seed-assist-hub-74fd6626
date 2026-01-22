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

// ===========================================
// Profile API Types (New)
// ===========================================

export interface ApiProfileResponse {
  success: boolean;
  data: {
    profile: {
      contact_id: string;
      name: string;
      first_name: string;
      last_name: string;
      email: string;
      phone: string | null;
      gender: string;
      date_of_birth: string | null;
      nationality: string;
      country_of_residence: string;
      status: string;
      recommendation_status: string;
      current_round: number;
    };
    education: {
      undergraduate: {
        institution_name: string;
        completion_year: number;
        study_area: string;
        grading_scale: string;
        score: string;
        gpa_display: string;
        transcripts_url: string | null;
      };
      has_postgraduate: boolean;
      postgraduate: {
        institution_name: string;
        completion_year: number;
        study_area: string;
        grading_scale: string;
        score: string;
        gpa_display: string;
        transcripts_url: string | null;
      } | null;
    };
    test_scores: {
      standardised_test: string | null;
      standardised_test_score: string | null;
      english_proficiency_test: string | null;
      english_proficiency_score: string | null;
    };
    work_experience: {
      years: string;
      industry: string | null;
      current_role: string | null;
      current_company: string | null;
    };
    essays: {
      essay_1: string | null;
      essay_2: string | null;
      essay_3: string | null;
    };
    supporting_documents: string | null;
    programs_of_interest: string[];
    awards: {
      available: {
        id: string;
        name: string;
        value: number;
        percentage: number;
        currency: string;
      }[];
      recommended: string[];
      assigned: string | null;
    };
    rounds: number[];
    navigation: {
      previous: { contact_id: string; name: string } | null;
      next: { contact_id: string; name: string } | null;
      current_position: number;
      total_applicants: number;
    };
    meta: {
      scholarship_id: string;
      scholarship_table_id: string;
    };
  };
}

// Transformed profile for UI
export interface ApplicantProfile {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  gender: string;
  dateOfBirth: string | null;
  nationality: string;
  countryCode: string;
  countryOfResidence: string;
  status: WorkflowStatus;
  isSeedRecommended: boolean;
  currentRound: number;
  education: {
    undergraduate: {
      institution: string;
      completionYear: number;
      studyArea: string;
      gradingScale: string;
      score: string;
      gpaDisplay: string;
      transcriptsUrl: string | null;
    };
    hasPostgraduate: boolean;
    postgraduate: {
      institution: string;
      completionYear: number;
      studyArea: string;
      gradingScale: string;
      score: string;
      gpaDisplay: string;
      transcriptsUrl: string | null;
    } | null;
  };
  testScores: {
    standardizedTest: string | null;
    standardizedTestScore: string | null;
    englishProficiencyTest: string | null;
    englishProficiencyScore: string | null;
  };
  workExperience: {
    years: number;
    industry: string | null;
    currentRole: string | null;
    currentCompany: string | null;
  };
  essays: {
    essay1: string | null;
    essay2: string | null;
    essay3: string | null;
  };
  supportingDocuments: string | null;
  programsOfInterest: string[];
  awards: {
    available: {
      id: string;
      name: string;
      value: number;
      percentage: number;
      currency: string;
    }[];
    recommended: string[];
    assigned: string | null;
  };
  rounds: number[];
  navigation: {
    previous: { contactId: string; name: string } | null;
    next: { contactId: string; name: string } | null;
    currentPosition: number;
    totalApplicants: number;
  };
  meta: {
    scholarshipId: string;
    scholarshipTableId: string;
  };
}

// Transformed applicant for UI (list view)
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

// Remove country short codes from country/nationality strings (e.g., "India (IN)" → "India", "IN" → "India")
function cleanCountryName(countryOrNationality: string): string {
  if (!countryOrNationality) return "";
  
  // Remove parenthetical codes like "(IN)", "(GH)"
  let cleaned = countryOrNationality.replace(/\s*\([A-Z]{2,3}\)\s*/g, "").trim();
  
  // If the result is just a 2-3 letter code, try to find the full country name
  if (/^[A-Z]{2,3}$/.test(cleaned)) {
    const fullName = Object.entries(countryCodeMap).find(([, code]) => code === cleaned)?.[0];
    if (fullName) return fullName;
  }
  
  return cleaned;
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
  const cleanedNationality = cleanCountryName(api.nationality);
  return {
    id: api.contact_id,
    name: api.name,
    email: api.email,
    country: cleanedNationality,
    countryCode: getCountryCode(cleanedNationality),
    nationality: cleanedNationality,
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

function transformProfile(api: ApiProfileResponse["data"]): ApplicantProfile {
  const { profile, education, test_scores, work_experience, essays, awards, navigation, meta } = api;
  const cleanedNationality = cleanCountryName(profile.nationality);
  const cleanedCountryOfResidence = cleanCountryName(profile.country_of_residence);
  
  return {
    id: profile.contact_id,
    name: profile.name,
    firstName: profile.first_name,
    lastName: profile.last_name,
    email: profile.email,
    phone: profile.phone,
    gender: profile.gender,
    dateOfBirth: profile.date_of_birth,
    nationality: cleanedNationality,
    countryCode: getCountryCode(cleanedNationality),
    countryOfResidence: cleanedCountryOfResidence,
    status: normalizeStatus(profile.status),
    isSeedRecommended: profile.recommendation_status === "recommended",
    currentRound: profile.current_round,
    education: {
      undergraduate: {
        institution: education.undergraduate.institution_name,
        completionYear: education.undergraduate.completion_year,
        studyArea: education.undergraduate.study_area,
        gradingScale: education.undergraduate.grading_scale,
        score: education.undergraduate.score,
        gpaDisplay: education.undergraduate.gpa_display,
        transcriptsUrl: education.undergraduate.transcripts_url,
      },
      hasPostgraduate: education.has_postgraduate,
      postgraduate: education.postgraduate ? {
        institution: education.postgraduate.institution_name,
        completionYear: education.postgraduate.completion_year,
        studyArea: education.postgraduate.study_area,
        gradingScale: education.postgraduate.grading_scale,
        score: education.postgraduate.score,
        gpaDisplay: education.postgraduate.gpa_display,
        transcriptsUrl: education.postgraduate.transcripts_url,
      } : null,
    },
    testScores: {
      standardizedTest: test_scores.standardised_test,
      standardizedTestScore: test_scores.standardised_test_score,
      englishProficiencyTest: test_scores.english_proficiency_test,
      englishProficiencyScore: test_scores.english_proficiency_score,
    },
    workExperience: {
      years: parseFloat(work_experience.years) || 0,
      industry: work_experience.industry,
      currentRole: work_experience.current_role,
      currentCompany: work_experience.current_company,
    },
    essays: {
      essay1: essays.essay_1,
      essay2: essays.essay_2,
      essay3: essays.essay_3,
    },
    supportingDocuments: api.supporting_documents,
    programsOfInterest: api.programs_of_interest || [],
    awards: {
      available: awards.available || [],
      recommended: awards.recommended || [],
      assigned: awards.assigned,
    },
    rounds: api.rounds || [],
    navigation: {
      previous: navigation.previous ? {
        contactId: navigation.previous.contact_id,
        name: navigation.previous.name,
      } : null,
      next: navigation.next ? {
        contactId: navigation.next.contact_id,
        name: navigation.next.name,
      } : null,
      currentPosition: navigation.current_position,
      totalApplicants: navigation.total_applicants,
    },
    meta: {
      scholarshipId: meta.scholarship_id,
      scholarshipTableId: meta.scholarship_table_id,
    },
  };
}

// ===========================================
// Status Assignment Types
// ===========================================

export interface StatusAssignmentRequest {
  contact_ids: string[];
  status: string;
  award_id?: string;
  custom_currency?: string;
  custom_amount?: string;
  send_email?: boolean;
}

export interface StatusAssignmentResponse {
  success: boolean;
  data?: {
    message: string;
    updated_count: number;
    status: string;
    email_results?: {
      contact_id: string;
      email: string;
      sent: boolean;
    }[];
  };
  error?: string;
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

  const { data, error } = await supabase.functions.invoke("scholarship-proxy?action=list", {
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

export async function fetchApplicantProfile(contactId: string): Promise<ApplicantProfile> {
  const token = getCookie("portal_token");
  
  if (!token) {
    throw new Error("Authentication required");
  }

  const { data, error } = await supabase.functions.invoke(`scholarship-proxy?action=profile&contact_id=${contactId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (error) {
    console.error("Error fetching applicant profile:", error);
    throw new Error("Failed to fetch applicant profile");
  }

  const response = decodeObjectStrings(data) as ApiProfileResponse;

  if (!response.success || !response.data) {
    throw new Error("Invalid response from server");
  }

  return transformProfile(response.data);
}

export async function updateApplicantStatus(request: StatusAssignmentRequest): Promise<StatusAssignmentResponse> {
  const token = getCookie("portal_token");
  
  if (!token) {
    throw new Error("Authentication required");
  }

  // Map UI status to API status (API accepts: shortlisted, selected, onHold, rejected)
  const statusMap: Record<string, string> = {
    "SHORTLISTED": "shortlisted",
    "ON_HOLD": "onHold",
    "REJECTED": "rejected",
    "WINNER": "selected",
  };

  const apiRequest = {
    ...request,
    status: statusMap[request.status] || request.status.toLowerCase(),
  };

  const { data, error } = await supabase.functions.invoke("scholarship-proxy?action=status_assignment", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: apiRequest,
  });

  if (error) {
    console.error("Error updating applicant status:", error);
    throw new Error("Failed to update applicant status");
  }

  const response = data as StatusAssignmentResponse;

  if (!response.success) {
    throw new Error(response.error || "Failed to update status");
  }

  return response;
}
