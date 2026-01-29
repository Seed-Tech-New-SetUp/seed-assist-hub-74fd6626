import { useQuery, useMutation } from "@tanstack/react-query";
import {
  fetchUserData,
  fetchLeadStats,
  fetchLeadPrograms,
  fetchLeadCountries,
  fetchLeads,
  exportLeads,
  LeadsFilter,
} from "@/lib/api/leads";

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

export function useExportLeads() {
  return useMutation({
    mutationFn: (filters: LeadsFilter) => exportLeads(filters),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads-export-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
}
