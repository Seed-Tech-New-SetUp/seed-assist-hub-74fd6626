import { supabase } from "@/integrations/supabase/client";
import { getPortalToken } from "@/lib/utils/cookies";
import { handleUnauthorized, isUnauthorizedError } from "@/lib/utils/auth-handler";

// ============ Types ============

export interface Program {
  id: string;
  program_name: string;
  program_internal_name: string;
  school_id: string;
  school_internal_name: string;
  school_name: string;
  university: string;
  region: string;
}

export interface ProgramDiversity {
  id?: string;
  country: string;
  percentage: number;
}

export interface ProgramInfo {
  school_id: string;
  school_name: string;
  university: string;
  currency: string;
  program_id: string;
  program_name: string;
  program_internal_name: string;
  hero_category: number;
  brochure_link: string;
  avg_age: string;
  class_size: number;
  avg_work_experience: string;
  graduation_rate: string;
  median_earnings_after_graduation: string;
  created_by?: string;
  created_on?: string;
  is_approved_by?: string;
  diversity?: ProgramDiversity[];
}

export interface ProgramFeature {
  usp_id?: string;
  program_id?: string;
  usp_title: string;
  usp_description: string;
  usp_image_name?: string;
  usp_file_format?: string;
  created_on?: string;
  created_by?: string;
  is_approved_by?: string;
}

// Backend uses "orgnaisation" (typo in DB) - we match it exactly to avoid confusion
export interface ProgramMemberBackend {
  member_id?: string;
  program_id?: string;
  category: "faculty" | "current_student" | "alumni";
  first_name: string;
  last_name: string;
  email: string;
  linkedin_url: string;
  designation: string;
  orgnaisation: string; // Backend spelling (typo in DB)
  call_to_action: string;
  image_name?: string;
  created_on?: string;
  created_by?: string;
}

export interface ProgramMember {
  member_id?: string;
  program_id?: string;
  category: "faculty" | "current_student" | "alumni";
  first_name: string;
  last_name: string;
  email: string;
  linkedin_url: string;
  designation: string;
  orgnaisation: string; // Backend spelling (typo in DB)
  call_to_action: string;
  image_name?: string;
  created_on?: string;
  created_by?: string;
}

export interface ProgramRanking {
  description_id?: string;
  ranking_addition_id?: string;
  ranking_organisation: string;  // org_id from backend
  ranking_org_name?: string;     // org_name from backend for display
  ranking_year: string;
  rank: string;
  supporting_text: string;
}

// Recruiters are now simple strings (company names)
export type ProgramRecruiter = string;

// Job roles are now simple strings (role names)
export type ProgramJobRole = string;

export interface ProgramFAQ {
  faq_id?: string;
  question: string;
  answer: string;
}

export interface ProgramPOC {
  poc_id?: string;
  name: string;
  designation: string;
  organisation: string;
  contact: string;
  email: string;
}

export interface RankingOrganization {
  id: string;
  name: string;
}

// ============ API Functions ============

async function callProgramsProxy<T>(
  action: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  params?: Record<string, string>,
  body?: unknown
): Promise<T> {
  const token = getPortalToken();
  if (!token) {
    handleUnauthorized("No authentication token found");
  }

  // Build query string
  const queryParams = new URLSearchParams({ action, ...params });
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/programs-proxy?${queryParams}`;

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
  };

  if (body && (method === "POST" || method === "PUT")) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));

  // Check for auth errors in response body (even on 200 OK)
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

// ============ Program List ============

export async function fetchPrograms(): Promise<Program[]> {
  const result = await callProgramsProxy<{ success: boolean; data?: { programs: Program[]; count?: number } }>("list");
  return result.data?.programs || [];
}

// ============ Request New Program ============

export async function requestNewProgram(programName: string, programDescription: string): Promise<boolean> {
  const result = await callProgramsProxy<{ success: boolean }>(
    "request-new-program",
    "POST",
    {},
    { programName, programDescription }
  );
  return result.success;
}

// ============ Program Information ============

export async function fetchProgramInfo(programId: string): Promise<ProgramInfo | null> {
  const result = await callProgramsProxy<{ 
    success: boolean; 
    data?: { 
      program: Omit<ProgramInfo, 'diversity'>; 
      diversity?: ProgramDiversity[];
    } 
  }>(
    "info",
    "GET",
    { program_id: programId }
  );
  if (result.data?.program) {
    return {
      ...result.data.program,
      diversity: result.data.diversity || [],
    };
  }
  return null;
}

export async function saveProgramInfo(programId: string, info: Partial<ProgramInfo>): Promise<boolean> {
  // Map frontend field names to backend POST field names
  const payload: Record<string, unknown> = {
    program_id: programId,
    class_size: info.class_size?.toString(),
    average_age: info.avg_age,
    average_work_experience: info.avg_work_experience,
    median_earnings_after_graduation: info.median_earnings_after_graduation,
    graduation_rate: info.graduation_rate,
    brochure_link: info.brochure_link,
    hero_category: info.hero_category,
    diversity: info.diversity,
  };

  const result = await callProgramsProxy<{ success: boolean }>(
    "info",
    "POST",
    { program_id: programId },
    payload
  );
  return result.success;
}

// ============ Program Features ============

export async function fetchProgramFeatures(programId: string): Promise<ProgramFeature[]> {
  const result = await callProgramsProxy<{ 
    success: boolean; 
    data?: { 
      features: ProgramFeature[];
      count?: number;
      program_id?: string;
    } 
  }>(
    "features",
    "GET",
    { program_id: programId }
  );
  return result.data?.features || [];
}

export async function saveProgramFeature(programId: string, feature: ProgramFeature): Promise<boolean> {
  const token = getPortalToken();
  if (!token) {
    handleUnauthorized("No authentication token found");
  }

  const isUpdate = !!feature.usp_id;
  const action = isUpdate ? "features-update" : "features-create";
  
  // Check if there's an image (base64 data)
  const hasImage = feature.usp_image_name?.startsWith("data:");
  
  const queryParams = new URLSearchParams({ action });
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/programs-proxy?${queryParams}`;
  
  let options: RequestInit;
  
  if (hasImage || !isUpdate) {
    // Use FormData for create (always) or update with new image
    const formData = new FormData();
    formData.append("program_id", programId);
    formData.append("usp_title", feature.usp_title);
    formData.append("usp_description", feature.usp_description);
    
    if (isUpdate && feature.usp_id) {
      formData.append("usp_id", feature.usp_id);
    }
    
    if (hasImage && feature.usp_image_name) {
      // Convert base64 to Blob
      const base64Data = feature.usp_image_name;
      const matches = base64Data.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        const mimeType = matches[1];
        const base64 = matches[2];
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });
        const extension = mimeType.split("/")[1] || "jpg";
        formData.append("usp_image", blob, `feature.${extension}`);
      }
    }
    
    options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: formData,
    };
  } else {
    // Use JSON for update without image
    options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify({
        program_id: programId,
        usp_id: feature.usp_id,
        usp_title: feature.usp_title,
        usp_description: feature.usp_description,
      }),
    };
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (isUnauthorizedError(response.status, errorData)) {
      handleUnauthorized(errorData.error || errorData.message);
    }
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  const result = await response.json();
  return result.success;
}

export async function deleteProgramFeature(programId: string, featureId: string): Promise<boolean> {
  const result = await callProgramsProxy<{ success: boolean }>(
    "features-delete",
    "POST",
    {},
    { program_id: programId, usp_id: featureId }
  );
  return result.success;
}

// ============ Program Members (Faculty, Students, Alumni) ============

export async function fetchProgramMembers(
  programId: string,
  category: "faculty" | "current_student" | "alumni"
): Promise<ProgramMember[]> {
  const result = await callProgramsProxy<{ success: boolean; data?: { members: ProgramMemberBackend[] } }>(
    "members",
    "GET",
    { program_id: programId, category }
  );
  return (result.data?.members || []).map((m) => ({
    ...m,
    orgnaisation: m.orgnaisation || "",
  }));
}

export async function saveProgramMember(
  programId: string,
  category: "faculty" | "current_student" | "alumni",
  member: ProgramMember
): Promise<boolean> {
  const token = getPortalToken();
  if (!token) {
    handleUnauthorized("No authentication token found");
  }

  const isUpdate = !!member.member_id;
  const action = isUpdate ? "members-update" : "members-create";
  
  // Check if there's a new image (base64 data)
  const hasImage = member.image_name?.startsWith("data:");
  
  const queryParams = new URLSearchParams({ action });
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/programs-proxy?${queryParams}`;
  
  let options: RequestInit;
  
  if (hasImage || !isUpdate) {
    // Use FormData for create (always) or update with new image
    const formData = new FormData();
    formData.append("program_id", programId);
    formData.append("category", category);
    formData.append("first_name", member.first_name);
    formData.append("last_name", member.last_name);
    formData.append("email", member.email);
    formData.append("linkedin_url", member.linkedin_url || "");
    formData.append("designation", member.designation || "");
    formData.append("orgnaisation", member.orgnaisation || "");
    formData.append("call_to_action", member.call_to_action || "");
    
    if (isUpdate && member.member_id) {
      formData.append("member_id", member.member_id);
    }
    
    if (hasImage && member.image_name) {
      // Convert base64 to Blob
      const base64Data = member.image_name;
      const matches = base64Data.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        const mimeType = matches[1];
        const base64 = matches[2];
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });
        const extension = mimeType.split("/")[1] || "jpg";
        formData.append("member_image", blob, `member.${extension}`);
      }
    }
    
    options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: formData,
    };
  } else {
    // Use JSON for update without image
    options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify({
        program_id: programId,
        member_id: member.member_id,
        category,
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        linkedin_url: member.linkedin_url || "",
        designation: member.designation || "",
        orgnaisation: member.orgnaisation || "",
        call_to_action: member.call_to_action || "",
      }),
    };
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (isUnauthorizedError(response.status, errorData)) {
      handleUnauthorized(errorData.error || errorData.message);
    }
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  const result = await response.json();
  return result.success;
}

export async function deleteProgramMember(
  programId: string,
  category: "faculty" | "current_student" | "alumni",
  memberId: string
): Promise<boolean> {
  const result = await callProgramsProxy<{ success: boolean }>(
    "members-delete",
    "POST",
    {},
    { program_id: programId, member_id: memberId }
  );
  return result.success;
}

// ============ Program Rankings ============

interface RankingsReadResponse {
  success: boolean;
  data?: {
    rankings: ProgramRanking[];
    rankings_count: number;
    ranking_organizations: Array<{ org_id: number; org_name: string }>;
    organizations_count: number;
    program_id: string;
  };
}

export async function fetchProgramRankingsWithOrganizations(programId: string): Promise<{
  rankings: ProgramRanking[];
  organizations: RankingOrganization[];
}> {
  const result = await callProgramsProxy<RankingsReadResponse>(
    "rankings",
    "GET",
    { program_id: programId }
  );
  
  // Ensure ranking_organisation is always a string for combobox compatibility
  const rankings = (result.data?.rankings || []).map(ranking => ({
    ...ranking,
    // Some backend variants may return numbers or alternate keys (e.g. year)
    ranking_organisation: String((ranking as any).ranking_organisation ?? (ranking as any).org_id ?? ""),
    ranking_year: String((ranking as any).ranking_year ?? (ranking as any).year ?? ""),
  }));
  
  const organizations = (result.data?.ranking_organizations || []).map(org => ({
    id: String(org.org_id),
    name: org.org_name,
  }));
  
  return { rankings, organizations };
}

export async function saveProgramRanking(programId: string, ranking: ProgramRanking): Promise<boolean> {
  const isUpdate = !!ranking.ranking_addition_id;
  const action = isUpdate ? "rankings-update" : "rankings-create";
  
  const payload: Record<string, unknown> = {
    program_id: programId,
    ranking_organisation: ranking.ranking_organisation,
    ranking_year: ranking.ranking_year,
    rank: ranking.rank,
    supporting_text: ranking.supporting_text || "",
  };
  
  if (isUpdate) {
    payload.description_id = ranking.description_id;
    payload.ranking_addition_id = ranking.ranking_addition_id;
  }
  
  const result = await callProgramsProxy<{ success: boolean }>(
    action,
    "POST",
    {},
    payload
  );
  return result.success;
}

export async function deleteProgramRanking(
  programId: string, 
  rankingOrgId: string, 
  rankingAdditionId: string
): Promise<boolean> {
  const result = await callProgramsProxy<{ success: boolean }>(
    "rankings-delete",
    "POST",
    {},
    { 
      program_id: programId, 
      ranking_org_id: rankingOrgId,
      ranking_addition_id: rankingAdditionId 
    }
  );
  return result.success;
}

// ============ Program Recruiters ============

export async function fetchProgramRecruiters(programId: string): Promise<ProgramRecruiter[]> {
  const result = await callProgramsProxy<{ success: boolean; data?: { recruiters: string[] } }>(
    "recruiters",
    "GET",
    { program_id: programId }
  );
  return result.data?.recruiters || [];
}

// Save all recruiters at once (replaces existing)
export async function saveProgramRecruiters(programId: string, recruiters: string[]): Promise<boolean> {
  const result = await callProgramsProxy<{ success: boolean }>(
    "recruiters",
    "POST",
    {},
    { program_id: programId, recruiters }
  );
  return result.success;
}

// ============ Program Job Roles ============

export async function fetchProgramJobRoles(programId: string): Promise<string[]> {
  const result = await callProgramsProxy<{ success: boolean; data?: { job_roles: string[] } }>(
    "jobroles",
    "GET",
    { program_id: programId }
  );
  return result.data?.job_roles || [];
}

// Save all job roles at once (replaces existing)
export async function saveProgramJobRoles(programId: string, jobRoles: string[]): Promise<boolean> {
  const result = await callProgramsProxy<{ success: boolean }>(
    "jobroles",
    "POST",
    {},
    { program_id: programId, job_roles: jobRoles }
  );
  return result.success;
}

// ============ Program FAQs ============

export async function fetchProgramFAQs(programId: string): Promise<ProgramFAQ[]> {
  const result = await callProgramsProxy<{ success: boolean; data?: { faqs: ProgramFAQ[] } }>(
    "faqs",
    "GET",
    { program_id: programId }
  );
  return result.data?.faqs || [];
}

// Save all FAQs at once (batch update - replaces existing, creates new)
// FAQs with faq_id will be updated, FAQs without faq_id will be created
export async function saveProgramFAQs(programId: string, faqs: ProgramFAQ[]): Promise<boolean> {
  const result = await callProgramsProxy<{ success: boolean }>(
    "faqs",
    "POST",
    {},
    { program_id: programId, faqs }
  );
  return result.success;
}

// ============ Program POCs ============

export async function fetchProgramPOC(programId: string): Promise<ProgramPOC | null> {
  const result = await callProgramsProxy<{ success: boolean; data?: { poc: ProgramPOC | null } }>(
    "pocs",
    "GET",
    { program_id: programId }
  );
  return result.data?.poc || null;
}

export async function saveProgramPOC(programId: string, poc: ProgramPOC): Promise<boolean> {
  const result = await callProgramsProxy<{ success: boolean }>(
    "pocs",
    "POST",
    {},
    { 
      program_id: programId,
      name: poc.name,
      designation: poc.designation,
      organisation: poc.organisation,
      contact: poc.contact,
      email: poc.email,
    }
  );
  return result.success;
}
