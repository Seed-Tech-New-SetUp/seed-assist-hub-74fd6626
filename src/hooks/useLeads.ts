import { useQuery } from "@tanstack/react-query";
import {
  fetchUserData,
  fetchLeadStats,
  fetchLeadPrograms,
  fetchLeadCountries,
  fetchLeads,
  LeadsFilter,
  Lead,
} from "@/lib/api/leads";
import * as XLSX from "xlsx";
import { format } from "date-fns";

export function useLeadUserData() {
  return useQuery({
    queryKey: ["leads-user-data"],
    queryFn: fetchUserData,
  });
}

export function useLeadStats() {
  return useQuery({
    queryKey: ["leads-stats"],
    queryFn: fetchLeadStats,
  });
}

export function useLeadPrograms() {
  return useQuery({
    queryKey: ["leads-programs"],
    queryFn: fetchLeadPrograms,
  });
}

export function useLeadCountries() {
  return useQuery({
    queryKey: ["leads-countries"],
    queryFn: fetchLeadCountries,
  });
}

export function useLeads(filters: LeadsFilter) {
  return useQuery({
    queryKey: ["leads-list", filters],
    queryFn: () => fetchLeads(filters),
  });
}

// Helper to decode HTML entities
function decodeHtmlEntities(str: string): string {
  if (!str) return str;
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
}

// Helper to format phone with country code
function formatPhone(phone: string, countryCode: string): string {
  if (!phone) return "";
  return `+${countryCode} ${phone}`;
}

// Helper to format date for display
function formatDateForExport(dateStr: string): string {
  if (!dateStr) return "";
  try {
    return format(new Date(dateStr), "MMM d, yyyy, hh:mm a");
  } catch {
    return dateStr;
  }
}

export function exportLeadsToExcel(leads: Lead[]) {
  // Transform leads data to match the expected Excel format
  const exportData = leads.map((lead) => ({
    "Name": `${lead.first_name} ${lead.last_name}`.trim(),
    "Phone": formatPhone(lead.phone, lead.country_of_residence),
    "Email": lead.email,
    "Country": lead.country_name,
    "Post Graduation Start Year": lead.intended_pg_program_start_year,
    "Study Level": lead.intended_study_level,
    "Subject Area": decodeHtmlEntities(lead.intended_subject_area),
    "Page Views": lead.page_views,
    "Registered On": formatDateForExport(lead.registration_date),
    "Last Activity": formatDateForExport(lead.last_activity),
    "Programs Viewed": lead.programs_viewed,
  }));

  // Create workbook and worksheet
  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Leads");

  // Auto-size columns
  const colWidths = [
    { wch: 25 }, // Name
    { wch: 18 }, // Phone
    { wch: 30 }, // Email
    { wch: 12 }, // Country
    { wch: 12 }, // Start Year
    { wch: 20 }, // Study Level
    { wch: 22 }, // Subject Area
    { wch: 12 }, // Page Views
    { wch: 22 }, // Registered On
    { wch: 22 }, // Last Activity
    { wch: 60 }, // Programs Viewed
  ];
  ws["!cols"] = colWidths;

  // Generate filename with current date
  const today = format(new Date(), "yyyy-MM-dd");
  const filename = `SEED-premium-profile-leads-${today}.xlsx`;

  // Download
  XLSX.writeFile(wb, filename);
}
