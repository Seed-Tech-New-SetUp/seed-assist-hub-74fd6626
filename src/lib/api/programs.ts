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

export interface ProgramMember {
  member_id?: string;
  program_id?: string;
  category: "faculty" | "current_student" | "alumni";
  first_name: string;
  last_name: string;
  email: string;
  linkedin_url: string;
  designation: string;
  organization: string;
  call_to_action: string;
  image_name?: string;
  created_on?: string;
  created_by?: string;
}

export interface ProgramRanking {
  id?: string;
  organisation: string;
  year: string;
  level: string;
  rank: string;
  supporting_text: string;
}

export interface ProgramRecruiter {
  id?: string;
  company_name: string;
}

export interface ProgramJobRole {
  id?: string;
  role_name: string;
}

export interface ProgramFAQ {
  id?: string;
  question: string;
  answer: string;
}

export interface ProgramPOC {
  id?: string;
  full_name: string;
  designation: string;
  organisation: string;
  contact_no: string;
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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Check for unauthorized/expired token
    if (isUnauthorizedError(response.status, errorData)) {
      handleUnauthorized(errorData.error || errorData.message);
    }
    
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

// ============ Program List ============

export async function fetchPrograms(): Promise<Program[]> {
  const result = await callProgramsProxy<{ success: boolean; data?: { programs: Program[]; count?: number } }>("list");
  return result.data?.programs || [];
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
  const result = await callProgramsProxy<{ success: boolean; data?: { members: ProgramMember[] } }>(
    "members",
    "GET",
    { program_id: programId, category }
  );
  return result.data?.members || [];
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
    formData.append("organization", member.organization || "");
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
        organization: member.organization || "",
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

export async function fetchRankingOrganizations(): Promise<RankingOrganization[]> {
  const result = await callProgramsProxy<{ success: boolean; data?: { organizations: RankingOrganization[] } }>(
    "ranking-orgs"
  );
  return result.data?.organizations || [];
}

export async function fetchProgramRankings(programId: string): Promise<ProgramRanking[]> {
  const result = await callProgramsProxy<{ success: boolean; data?: { rankings: ProgramRanking[] } }>(
    "rankings",
    "GET",
    { program_id: programId, level: "Program" }
  );
  return result.data?.rankings || [];
}

export async function saveProgramRanking(programId: string, ranking: ProgramRanking): Promise<boolean> {
  const result = await callProgramsProxy<{ success: boolean }>(
    "rankings",
    "POST",
    { program_id: programId, level: "Program" },
    ranking
  );
  return result.success;
}

export async function deleteProgramRanking(programId: string, rankingId: string): Promise<boolean> {
  const result = await callProgramsProxy<{ success: boolean }>(
    "rankings",
    "DELETE",
    { program_id: programId, level: "Program" },
    { id: rankingId }
  );
  return result.success;
}

// ============ Program Recruiters ============

export async function fetchProgramRecruiters(programId: string): Promise<ProgramRecruiter[]> {
  const result = await callProgramsProxy<{ success: boolean; data?: { recruiters: ProgramRecruiter[] } }>(
    "recruiters",
    "GET",
    { program_id: programId }
  );
  return result.data?.recruiters || [];
}

export async function saveProgramRecruiter(programId: string, recruiter: ProgramRecruiter): Promise<boolean> {
  const result = await callProgramsProxy<{ success: boolean }>(
    "recruiters",
    "POST",
    { program_id: programId },
    recruiter
  );
  return result.success;
}

export async function deleteProgramRecruiter(programId: string, recruiterId: string): Promise<boolean> {
  const result = await callProgramsProxy<{ success: boolean }>(
    "recruiters",
    "DELETE",
    { program_id: programId },
    { id: recruiterId }
  );
  return result.success;
}

// ============ Program Job Roles ============

export async function fetchProgramJobRoles(programId: string): Promise<ProgramJobRole[]> {
  const result = await callProgramsProxy<{ success: boolean; data?: { job_roles: ProgramJobRole[] } }>(
    "jobroles",
    "GET",
    { program_id: programId }
  );
  return result.data?.job_roles || [];
}

export async function saveProgramJobRole(programId: string, jobRole: ProgramJobRole): Promise<boolean> {
  const result = await callProgramsProxy<{ success: boolean }>(
    "jobroles",
    "POST",
    { program_id: programId },
    jobRole
  );
  return result.success;
}

export async function deleteProgramJobRole(programId: string, jobRoleId: string): Promise<boolean> {
  const result = await callProgramsProxy<{ success: boolean }>(
    "jobroles",
    "DELETE",
    { program_id: programId },
    { id: jobRoleId }
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

export async function saveProgramFAQ(programId: string, faq: ProgramFAQ): Promise<boolean> {
  const result = await callProgramsProxy<{ success: boolean }>(
    "faqs",
    "POST",
    { program_id: programId },
    faq
  );
  return result.success;
}

export async function deleteProgramFAQ(programId: string, faqId: string): Promise<boolean> {
  const result = await callProgramsProxy<{ success: boolean }>(
    "faqs",
    "DELETE",
    { program_id: programId },
    { id: faqId }
  );
  return result.success;
}

// ============ Program POCs ============

export async function fetchProgramPOCs(programId: string): Promise<ProgramPOC[]> {
  const result = await callProgramsProxy<{ success: boolean; data?: { pocs: ProgramPOC[] } }>(
    "pocs",
    "GET",
    { program_id: programId }
  );
  return result.data?.pocs || [];
}

export async function saveProgramPOC(programId: string, poc: ProgramPOC): Promise<boolean> {
  const result = await callProgramsProxy<{ success: boolean }>(
    "pocs",
    "POST",
    { program_id: programId },
    poc
  );
  return result.success;
}

export async function deleteProgramPOC(programId: string, pocId: string): Promise<boolean> {
  const result = await callProgramsProxy<{ success: boolean }>(
    "pocs",
    "DELETE",
    { program_id: programId },
    { id: pocId }
  );
  return result.success;
}
