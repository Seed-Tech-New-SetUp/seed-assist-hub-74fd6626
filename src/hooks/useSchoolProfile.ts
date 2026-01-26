import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  fetchSchoolFAQs, 
  saveSchoolFAQs, 
  fetchSchoolInfo,
  saveSchoolInfo,
  SchoolFAQ,
  SchoolInfo 
} from "@/lib/api/school-profile";
import { useToast } from "@/hooks/use-toast";

// ============ School Info Hooks ============

export function useSchoolInfo() {
  return useQuery({
    queryKey: ["school-info"],
    queryFn: fetchSchoolInfo,
  });
}

export function useSaveSchoolInfo() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (info: Partial<SchoolInfo>) => saveSchoolInfo(info),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-info"] });
      toast({
        title: "Organisation Details Saved",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save organisation details",
        variant: "destructive",
      });
    },
  });
}

// ============ FAQs Hooks ============

export function useSchoolFAQs() {
  return useQuery({
    queryKey: ["school-faqs"],
    queryFn: fetchSchoolFAQs,
  });
}

export function useSaveSchoolFAQs() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (faqs: SchoolFAQ[]) => saveSchoolFAQs(faqs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-faqs"] });
      toast({
        title: "FAQs Saved",
        description: "Your FAQs have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save FAQs",
        variant: "destructive",
      });
    },
  });
}
