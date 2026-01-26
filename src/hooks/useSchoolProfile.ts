import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSchoolFAQs, saveSchoolFAQs, SchoolFAQ } from "@/lib/api/school-profile";
import { useToast } from "@/hooks/use-toast";

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
