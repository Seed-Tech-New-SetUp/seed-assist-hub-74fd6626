import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  fetchSchoolFAQs, 
  saveSchoolFAQs, 
  fetchSchoolInfo,
  saveSchoolInfo,
  fetchSchoolSocialMedia,
  saveSchoolSocialMedia,
  fetchSchoolFeatures,
  createSchoolFeature,
  updateSchoolFeature,
  deleteSchoolFeature,
  fetchSchoolLogos,
  createSchoolLogo,
  updateSchoolLogo,
  deleteSchoolLogo,
  SchoolFAQ,
  SchoolInfo,
  SchoolSocialMedia,
  SchoolFeature,
  SchoolLogo
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

// ============ Features Hooks ============

export function useSchoolFeatures() {
  return useQuery({
    queryKey: ["school-features"],
    queryFn: fetchSchoolFeatures,
  });
}

export function useCreateSchoolFeature() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (feature: { usp_title: string; usp_description: string; usp_image?: string }) => 
      createSchoolFeature(feature),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-features"] });
      toast({
        title: "Feature Added",
        description: "Your feature has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add feature",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateSchoolFeature() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (feature: { usp_id: string; usp_title: string; usp_description: string; usp_image?: string }) => 
      updateSchoolFeature(feature),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-features"] });
      toast({
        title: "Feature Updated",
        description: "Your feature has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update feature",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteSchoolFeature() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (uspId: string) => deleteSchoolFeature(uspId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-features"] });
      toast({
        title: "Feature Deleted",
        description: "Your feature has been removed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete feature",
        variant: "destructive",
      });
    },
  });
}

// ============ Logos Hooks ============

export function useSchoolLogos() {
  return useQuery({
    queryKey: ["school-logos"],
    queryFn: fetchSchoolLogos,
  });
}

export function useCreateSchoolLogo() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (logo: { logo: string; logoRatio: string }) => 
      createSchoolLogo(logo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-logos"] });
      toast({
        title: "Logo Added",
        description: "Your logo has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add logo",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateSchoolLogo() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (logo: { logo_id: string; logo?: string; logoRatio?: string }) => 
      updateSchoolLogo(logo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-logos"] });
      toast({
        title: "Logo Updated",
        description: "Your logo has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update logo",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteSchoolLogo() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (logoId: string) => deleteSchoolLogo(logoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-logos"] });
      toast({
        title: "Logo Deleted",
        description: "Your logo has been removed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete logo",
        variant: "destructive",
      });
    },
  });
}
