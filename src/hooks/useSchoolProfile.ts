import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  fetchSchoolFAQs, 
  saveSchoolFAQs, 
  fetchSchoolInfo,
  saveSchoolInfo,
  fetchSchoolSocialMedia,
  saveSchoolSocialMedia,
  SchoolFAQ,
  SchoolInfo,
  SchoolSocialMedia
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

// ============ Social Media Hooks ============

export function useSchoolSocialMedia() {
  return useQuery({
    queryKey: ["school-social-media"],
    queryFn: fetchSchoolSocialMedia,
  });
}

export function useSaveSchoolSocialMedia() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (socialMedia: SchoolSocialMedia) => saveSchoolSocialMedia(socialMedia),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-social-media"] });
      toast({
        title: "Digital Presence Saved",
        description: "Your social media links have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save social media links",
        variant: "destructive",
      });
    },
  });
}
