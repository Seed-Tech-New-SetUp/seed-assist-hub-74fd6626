import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchSchoolInfo,
  saveSchoolInfo,
  fetchSchoolFAQs,
  saveSchoolFAQs,
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
  fetchSchoolRankings,
  createSchoolRanking,
  updateSchoolRanking,
  deleteSchoolRanking,
  SchoolInfo,
  SchoolFAQ,
  SchoolSocialMedia,
  SchoolFeature,
  SchoolLogo,
} from "@/lib/api/school-profile";

// ============ School Info Hooks ============

export function useSchoolInfo() {
  return useQuery({
    queryKey: ["school-info"],
    queryFn: fetchSchoolInfo,
  });
}

export function useSaveSchoolInfo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (info: Partial<SchoolInfo>) => saveSchoolInfo(info),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-info"] });
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
  return useMutation({
    mutationFn: (faqs: SchoolFAQ[]) => saveSchoolFAQs(faqs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-faqs"] });
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
  return useMutation({
    mutationFn: (social: SchoolSocialMedia) => saveSchoolSocialMedia(social),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-social-media"] });
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
  return useMutation({
    mutationFn: (feature: { usp_title: string; usp_description: string; usp_image?: string }) =>
      createSchoolFeature(feature),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-features"] });
    },
  });
}

export function useUpdateSchoolFeature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (feature: { usp_id: string; usp_title: string; usp_description: string; usp_image?: string }) =>
      updateSchoolFeature(feature),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-features"] });
    },
  });
}

export function useDeleteSchoolFeature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uspId: string) => deleteSchoolFeature(uspId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-features"] });
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
  return useMutation({
    mutationFn: (logo: { logo: string; logoRatio: string }) => createSchoolLogo(logo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-logos"] });
    },
  });
}

export function useUpdateSchoolLogo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (logo: { logo_id: string; logo?: string; logoRatio?: string }) => updateSchoolLogo(logo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-logos"] });
    },
  });
}

export function useDeleteSchoolLogo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (logoId: string) => deleteSchoolLogo(logoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-logos"] });
    },
  });
}

// ============ Rankings Hooks ============

export function useSchoolRankings() {
  return useQuery({
    queryKey: ["school-rankings"],
    queryFn: fetchSchoolRankings,
  });
}

export function useCreateSchoolRanking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ranking: {
      ranking_organisation: string;
      ranking_year: string;
      level: string;
      rank?: string;
      minimum_range?: string;
      maximum_range?: string;
      supporting_text?: string;
    }) => createSchoolRanking(ranking),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-rankings"] });
    },
  });
}

export function useUpdateSchoolRanking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ranking: {
      description_id: string;
      ranking_org_id: string;
      ranking_addition_id: string;
      ranking_organisation: string;
      ranking_year: string;
      level: string;
      rank?: string;
      minimum_range?: string;
      maximum_range?: string;
      supporting_text?: string;
    }) => updateSchoolRanking(ranking),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-rankings"] });
    },
  });
}

export function useDeleteSchoolRanking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ranking: { description_id: string; ranking_org_id: string; ranking_addition_id: string }) =>
      deleteSchoolRanking(ranking),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-rankings"] });
    },
  });
}
