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

export async function fetchICRReports(
  year?: string,
  month?: string
): Promise<ICRReportsResponse> {
  // Token is stored in secure cookies by the portal auth flow
  // (legacy fallback to "auth_token" kept for backward compatibility)
  const token = getCookie(AUTH_COOKIES.TOKEN) ?? getCookie("auth_token");

  if (!token) {
    handleUnauthorized("Not authenticated");
  }

  try {
    // Build query parameters for the edge function
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (month) params.append('month', month);
    
    // Pass filters in request body since supabase.functions.invoke doesn't support query params
    const response = await supabase.functions.invoke('icr-proxy', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: { year, month },
    });

    if (response.error) {
      console.error("ICR API Error:", response.error);
      // Check for auth errors
      if (isUnauthorizedError((response.error as { status?: number }).status || 0, { error: response.error.message })) {
        handleUnauthorized(response.error.message);
      }
      return { success: false, error: response.error.message };
    }

    // Check response data for auth errors
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
  festivals: 'Education Fairs/Festivals',
  webinars: 'Webinars',
  campusVisits: 'Campus Visits',
  phoneCalls: 'Phone Calls',
  emailConv: 'Email Conversations',
  whatsapp: 'WhatsApp',
  socialMedia: 'Social Media',
  oneOnOne: 'One-on-One Meetings',
};
