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
  percentage: string;
}

export interface ProgramInfo {
  school_id: string;
  school_name: string;
  university: string;
  currency: string;
  program_id: string;
  program_name: string;
  program_internal_name: string;
  class_size: string;
  avg_age: string;
  avg_work_experience: string;
  median_earnings_after_graduation: string;
  graduation_rate: string;
  brochure_link: string;
  is_hero_program: boolean;
  diversity: ProgramDiversity[];
}

export interface ProgramFeature {
  id?: string;
  title: string;
  description: string;
  photo_url: string;
}

export interface ProgramMember {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  linkedin_url: string;
  designation: string;
  organisation: string;
  category: "faculty" | "current_student" | "alumni";
  call_to_action: "email" | "linkedin";
  profile_image: string;
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
  const result = await callProgramsProxy<{ success: boolean; data?: { program: ProgramInfo } }>(
    "info",
    "GET",
    { program_id: programId }
  );
  return result.data?.program || null;
}

export async function saveProgramInfo(programId: string, info: Partial<ProgramInfo>): Promise<boolean> {
  const result = await callProgramsProxy<{ success: boolean }>(
    "info",
    "POST",
    { program_id: programId },
    { program_id: programId, ...info }
  );
  return result.success;
}

// ============ Program Features ============

export async function fetchProgramFeatures(programId: string): Promise<ProgramFeature[]> {
  const result = await callProgramsProxy<{ success: boolean; data?: { features: ProgramFeature[] } }>(
    "features",
    "GET",
    { program_id: programId }
  );
  return result.data?.features || [];
}

export async function saveProgramFeature(programId: string, feature: ProgramFeature): Promise<boolean> {
  const result = await callProgramsProxy<{ success: boolean }>(
    "features",
    "POST",
    { program_id: programId },
    feature
  );
  return result.success;
}

export async function deleteProgramFeature(programId: string, featureId: string): Promise<boolean> {
  const result = await callProgramsProxy<{ success: boolean }>(
    "features",
    "DELETE",
    { program_id: programId },
    { id: featureId }
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
  const result = await callProgramsProxy<{ success: boolean }>(
    "members",
    "POST",
    { program_id: programId, category },
    member
  );
  return result.success;
}

export async function deleteProgramMember(
  programId: string,
  category: "faculty" | "current_student" | "alumni",
  memberId: string
): Promise<boolean> {
  const result = await callProgramsProxy<{ success: boolean }>(
    "members",
    "DELETE",
    { program_id: programId, category },
    { id: memberId }
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
