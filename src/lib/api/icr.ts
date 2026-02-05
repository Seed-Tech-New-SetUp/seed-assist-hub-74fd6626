import { supabase } from "@/integrations/supabase/client";
import { AUTH_COOKIES, getCookie } from "@/lib/utils/cookies";
import { handleUnauthorized, isUnauthorizedError } from "@/lib/utils/auth-handler";

// ===========================================
// ICR (In-Country Representation) API
// ===========================================

export interface LeadGeneration {
  id: number;
  report_id: number;
  activity_type: string;
  qualified_leads: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface LeadEngagement {
  id: number;
  report_id: number;
  activity_type: string;
  leads_engaged: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface ApplicationFunnel {
  id: number;
  report_id: number;
  leads_engaged: number;
  not_interested: number;
  interested_2026: number;
  applications_submitted: number;
  admitted: number;
  offers_accepted: number;
  enrolled: number;
  created_at: string;
  updated_at: string;
}

export interface ICRReport {
  report_id: number;
  report_month: string; // Format: "YYYY-MM"
  client_name: string;
  client_email: string;
  client_role: string;
  created_at: string;
  updated_at: string;
  lead_generation: LeadGeneration[];
  lead_engagement: LeadEngagement[];
  application_funnel: ApplicationFunnel;
}

export interface ICRSchool {
  school_name: string;
  university: string;
}

export interface ICRFilterOptions {
  years: (string | null)[];
  months: string[];
}

export interface ICRReportsResponse {
  success: boolean;
  data?: {
    reports: ICRReport[];
    meta: {
      count: number;
    };
    filter_options: ICRFilterOptions;
    school: ICRSchool;
  };
  error?: string;
}

// Payload types for create/update
export interface ICRLeadGenerationInput {
  activity_type: string;
  qualified_leads: number;
  description: string;
}

export interface ICRLeadEngagementInput {
  activity_type: string;
  leads_engaged: number;
  description: string;
}

export interface ICRApplicationFunnelInput {
  leadsEngaged: number;
  notInterested: number;
  interested2026: number;
  applicationsSubmitted: number;
  admitted: number;
  offersAccepted: number;
  enrolled: number;
}

export interface ICRCreatePayload {
  reportMonth: string;
  leadGeneration: ICRLeadGenerationInput[];
  leadEngagement: ICRLeadEngagementInput[];
  applicationFunnel: ICRApplicationFunnelInput;
}

export interface ICRUpdatePayload extends ICRCreatePayload {
  report_id: number;
}

export interface ICRMutationResponse {
  success: boolean;
  message?: string;
  report_id?: number;
  error?: string;
}

export async function fetchICRReports(
  year?: string,
  month?: string
): Promise<ICRReportsResponse> {
  const token = getCookie(AUTH_COOKIES.TOKEN) ?? getCookie("auth_token");

  if (!token) {
    handleUnauthorized("Not authenticated");
  }

  try {
    const response = await supabase.functions.invoke('icr-proxy', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: { action: 'list', year, month },
    });

    if (response.error) {
      console.error("ICR API Error:", response.error);
      if (isUnauthorizedError((response.error as { status?: number }).status || 0, { error: response.error.message })) {
        handleUnauthorized(response.error.message);
      }
      return { success: false, error: response.error.message };
    }

    const data = response.data as ICRReportsResponse;
    if (!data.success && data.error && isUnauthorizedError(401, { error: data.error })) {
      handleUnauthorized(data.error);
    }

    return data;
  } catch (error) {
    console.error("ICR fetch error:", error);
    return { success: false, error: "Failed to fetch ICR reports" };
  }
}

export async function createICRReport(payload: ICRCreatePayload): Promise<ICRMutationResponse> {
  const token = getCookie(AUTH_COOKIES.TOKEN) ?? getCookie("auth_token");

  if (!token) {
    handleUnauthorized("Not authenticated");
    return { success: false, error: "Not authenticated" };
  }

  try {
    const response = await supabase.functions.invoke('icr-proxy', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        action: 'create',
        ...payload,
      },
    });

    if (response.error) {
      console.error("ICR Create Error:", response.error);
      if (isUnauthorizedError((response.error as { status?: number }).status || 0, { error: response.error.message })) {
        handleUnauthorized(response.error.message);
      }
      return { success: false, error: response.error.message };
    }

    return response.data as ICRMutationResponse;
  } catch (error) {
    console.error("ICR create error:", error);
    return { success: false, error: "Failed to create ICR report" };
  }
}

export async function updateICRReport(payload: ICRUpdatePayload): Promise<ICRMutationResponse> {
  const token = getCookie(AUTH_COOKIES.TOKEN) ?? getCookie("auth_token");

  if (!token) {
    handleUnauthorized("Not authenticated");
    return { success: false, error: "Not authenticated" };
  }

  try {
    const response = await supabase.functions.invoke('icr-proxy', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        action: 'update',
        ...payload,
      },
    });

    if (response.error) {
      console.error("ICR Update Error:", response.error);
      if (isUnauthorizedError((response.error as { status?: number }).status || 0, { error: response.error.message })) {
        handleUnauthorized(response.error.message);
      }
      return { success: false, error: response.error.message };
    }

    return response.data as ICRMutationResponse;
  } catch (error) {
    console.error("ICR update error:", error);
    return { success: false, error: "Failed to update ICR report" };
  }
}

export async function deleteICRReport(reportId: number): Promise<ICRMutationResponse> {
  const token = getCookie(AUTH_COOKIES.TOKEN) ?? getCookie("auth_token");

  if (!token) {
    handleUnauthorized("Not authenticated");
    return { success: false, error: "Not authenticated" };
  }

  try {
    const response = await supabase.functions.invoke('icr-proxy', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        action: 'delete',
        report_id: reportId,
      },
    });

    if (response.error) {
      console.error("ICR Delete Error:", response.error);
      if (isUnauthorizedError((response.error as { status?: number }).status || 0, { error: response.error.message })) {
        handleUnauthorized(response.error.message);
      }
      return { success: false, error: response.error.message };
    }

    return response.data as ICRMutationResponse;
  } catch (error) {
    console.error("ICR delete error:", error);
    return { success: false, error: "Failed to delete ICR report" };
  }
}

// Helper function to calculate totals from reports
export function calculateICRTotals(reports: ICRReport[]) {
  let totalLeads = 0;
  let totalActivities = 0;
  let totalApplications = 0;
  let totalAdmits = 0;

  reports.forEach((report) => {
    // Sum qualified leads from lead_generation
    report.lead_generation.forEach((lg) => {
      totalLeads += lg.qualified_leads;
    });

    // Count activities (lead_generation + lead_engagement items)
    totalActivities += report.lead_generation.length + report.lead_engagement.length;

    // Sum from application funnel
    if (report.application_funnel) {
      totalApplications += report.application_funnel.applications_submitted;
      totalAdmits += report.application_funnel.admitted;
    }
  });

  return {
    totalLeads,
    totalActivities,
    totalApplications,
    totalAdmits,
    publishedReports: reports.length,
  };
}

// Helper to format month from "YYYY-MM" to readable format
export function formatReportMonth(reportMonth: string): string {
  const [year, month] = reportMonth.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// Activity type display names
export const activityTypeLabels: Record<string, string> = {
  // Lead Generation
  testPrep: 'Test Prep Events',
  collegeCampus: 'College Campus Events',
  highSchool: 'High School Events',
  festivals: 'Festivals / Fairs / Seminars',
  coffeeMeets: 'Coffee Meets / Info-sessions',
  webinars: 'Online Masterclasses / Webinars',
  partners: 'Partners Engaged',
  otherGen: 'Other Activity',
  // Lead Engagement
  phoneCalls: 'Phone Calls',
  onlineMeetings: 'Online Meetings / Profile Evaluations',
  emailConv: 'Email Conversations',
  whatsapp: 'WhatsApp Conversations',
  otherEng: 'Other Activity',
  // Legacy
  campusVisits: 'Campus Visits',
  socialMedia: 'Social Media',
  oneOnOne: 'One-on-One Meetings',
};
