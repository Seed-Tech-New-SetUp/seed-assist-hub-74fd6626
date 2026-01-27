import { getPortalToken } from "@/lib/utils/cookies";
import { decodeObjectStrings } from "@/lib/utils/decode-utf8";
import { handleUnauthorized, isUnauthorizedError } from "@/lib/utils/auth-handler";

// ============ Types ============

export interface SchoolInfo {
  school_id?: string;
  school_name?: string;
  university?: string;
  about?: string;
  currency?: string;
  city?: string;
  state?: string;
  country?: string;
  school_banner?: string;
  school_logo?: string;
  graduate_phd_programs?: string;
  school_brochure_link?: string;
  international_students?: string;
  scholarship_amount?: string | null;
}

export interface SchoolInfoResponse {
  success: boolean;
  data?: {
    school: SchoolInfo;
  };
  error?: string;
}

export interface SchoolFAQ {
  faq_id?: string;
  question: string;
  answer: string;
  created_on?: string;
}

export interface SchoolFAQsResponse {
  success: boolean;
  data?: {
    faqs: SchoolFAQ[];
    count: number;
  };
  error?: string;
}

export interface SchoolSocialMedia {
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
}

export interface SchoolSocialMediaResponse {
  success: boolean;
  data?: {
    social_media: SchoolSocialMedia;
  };
  error?: string;
}

// Features/USP types
export interface SchoolFeature {
  usp_id?: string;
  school_id?: string;
  usp_title: string;
  usp_description: string;
  usp_image_name?: string;
  usp_file_format?: string;
  created_on?: string;
  created_by?: string;
  is_approved_by?: string;
}

export interface SchoolFeaturesResponse {
  success: boolean;
  data?: {
    features: SchoolFeature[];
    count: number;
  };
  error?: string;
}

export interface FeatureMutationResponse {
  success: boolean;
  data?: {
    message: string;
    feature?: SchoolFeature;
    usp_id?: string;
  };
  error?: string;
}

// Logos types
export interface SchoolLogo {
  logo_id?: string;
  school_id?: string;
  logo_file_name?: string;
  logo_file_format?: string;
  logo_ratio?: string;
  created_on?: string;
  created_by?: string;
  is_approved_by?: string;
}

export interface SchoolLogosResponse {
  success: boolean;
  data?: {
    logos: SchoolLogo[];
    count: number;
  };
  error?: string;
}

export interface LogoMutationResponse {
  success: boolean;
  data?: {
    message: string;
    logo?: SchoolLogo;
    logo_id?: string;
  };
  error?: string;
}

// Rankings types
// Update SchoolRanking interface
export interface SchoolRanking {
  description_id?: string;
  school_id?: string;
  level?: string;
  ranking_org_id?: string;
  ranking_addition_id?: string;
  rank?: string;
  minimum_rank_range?: string; // ✅ Backend field name (not minimum_range)
  maximum_rank_range?: string; // ✅ Backend field name (not maximum_range)
  supporting_text?: string;
  created_on?: string;
  created_by?: string;
  is_approved_by?: string;
  org_id?: number;
  ranking_org_name?: string;
  addition_id?: number;
  addition_name?: string;
  year?: string; // ✅ Backend field name (not ranking_year)
}

// Update RankingOrganization interface
export interface RankingOrganization {
  org_id: string; // ✅ Changed from ranking_org_id
  org_name: string; // ✅ Changed from ranking_org_name
}

// Add response wrapper interface
export interface SchoolRankingsResponse {
  success: boolean;
  data: {
    rankings: SchoolRanking[];
    rankings_count: number;
    ranking_organizations: RankingOrganization[];
    organizations_count: number;
    school_id: string;
  };
}

export interface RankingMutationResponse {
  success: boolean;
  data?: {
    message: string;
    ranking?: SchoolRanking;
  };
  error?: string;
}

// ============ API Helper ============

async function callSchoolProfileProxy<T>(action: string, method: "GET" | "POST" = "GET", body?: unknown): Promise<T> {
  const token = getPortalToken();
  if (!token) {
    handleUnauthorized("No authentication token found");
  }

  const queryParams = new URLSearchParams({ action });
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/school-profile-proxy?${queryParams}`;

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
  };

  if (body && method === "POST") {
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

// ============ School Info API ============

export async function fetchSchoolInfo(): Promise<SchoolInfo> {
  const result = await callSchoolProfileProxy<SchoolInfoResponse>("info", "GET");
  const info = result.data?.school || {};
  return decodeObjectStrings(info);
}

export async function saveSchoolInfo(info: Partial<SchoolInfo>): Promise<boolean> {
  const token = getPortalToken();
  if (!token) {
    handleUnauthorized("No authentication token found");
  }

  const formData = new FormData();

  // Sanitize and add text fields
  for (const [key, value] of Object.entries(info)) {
    // Skip school_banner as it will be handled as imageUpload
    if (key === "school_banner") continue;

    const val = value as unknown;
    if (val === false || val === undefined || val === null) {
      formData.append(key, "");
    } else {
      formData.append(key, String(val));
    }
  }

  // Handle banner image upload with the field name "imageUpload"
  if (info.school_banner && info.school_banner.startsWith("data:")) {
    const blob = dataURLtoBlob(info.school_banner);
    formData.append("imageUpload", blob, "banner-image.jpg");
  }

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/school-profile-proxy?action=info`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (isUnauthorizedError(response.status, errorData)) {
      handleUnauthorized(errorData.error || errorData.message);
    }
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  const result = await response.json();
  return result.success;
}

// ============ FAQs API ============

export async function fetchSchoolFAQs(): Promise<SchoolFAQ[]> {
  const result = await callSchoolProfileProxy<SchoolFAQsResponse>("faqs", "GET");
  const faqs = result.data?.faqs || [];
  return decodeObjectStrings(faqs);
}

export async function saveSchoolFAQs(faqs: SchoolFAQ[]): Promise<boolean> {
  const result = await callSchoolProfileProxy<{ success: boolean }>("faqs", "POST", { faqs });
  return result.success;
}

// ============ Social Media API ============

export async function fetchSchoolSocialMedia(): Promise<SchoolSocialMedia> {
  const result = await callSchoolProfileProxy<SchoolSocialMediaResponse>("social", "GET");
  const socialMedia = result.data?.social_media || {};
  return decodeObjectStrings(socialMedia);
}

export async function saveSchoolSocialMedia(socialMedia: SchoolSocialMedia): Promise<boolean> {
  const result = await callSchoolProfileProxy<{ success: boolean }>("social", "POST", socialMedia);
  return result.success;
}

// ============ Features API ============

export async function fetchSchoolFeatures(): Promise<SchoolFeature[]> {
  const result = await callSchoolProfileProxy<SchoolFeaturesResponse>("features-read", "GET");
  const features = result.data?.features || [];
  return decodeObjectStrings(features);
}

export async function createSchoolFeature(feature: {
  usp_title: string;
  usp_description: string;
  usp_image?: string; // base64 data URL
}): Promise<FeatureMutationResponse> {
  const token = getPortalToken();
  if (!token) {
    handleUnauthorized("No authentication token found");
  }

  const formData = new FormData();
  formData.append("usp_title", feature.usp_title);
  formData.append("usp_description", feature.usp_description);

  // Handle image upload if provided
  if (feature.usp_image && feature.usp_image.startsWith("data:")) {
    const blob = dataURLtoBlob(feature.usp_image);
    formData.append("usp_image", blob, "feature-image.jpg");
  }

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/school-profile-proxy?action=features-create`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (isUnauthorizedError(response.status, errorData)) {
      handleUnauthorized(errorData.error || errorData.message);
    }
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export async function updateSchoolFeature(feature: {
  usp_id: string;
  usp_title: string;
  usp_description: string;
  usp_image?: string; // base64 data URL (optional)
}): Promise<FeatureMutationResponse> {
  const token = getPortalToken();
  if (!token) {
    handleUnauthorized("No authentication token found");
  }

  const formData = new FormData();
  formData.append("usp_id", feature.usp_id);
  formData.append("usp_title", feature.usp_title);
  formData.append("usp_description", feature.usp_description);

  // Handle image upload if provided
  if (feature.usp_image && feature.usp_image.startsWith("data:")) {
    const blob = dataURLtoBlob(feature.usp_image);
    formData.append("usp_image", blob, "feature-image.jpg");
  }

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/school-profile-proxy?action=features-update`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (isUnauthorizedError(response.status, errorData)) {
      handleUnauthorized(errorData.error || errorData.message);
    }
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export async function deleteSchoolFeature(uspId: string): Promise<FeatureMutationResponse> {
  const result = await callSchoolProfileProxy<FeatureMutationResponse>("features-delete", "POST", { usp_id: uspId });
  return result;
}

// ============ Logos API ============

export async function fetchSchoolLogos(): Promise<SchoolLogo[]> {
  const result = await callSchoolProfileProxy<SchoolLogosResponse>("logos-read", "GET");
  const logos = result.data?.logos || [];
  return decodeObjectStrings(logos);
}

export async function createSchoolLogo(logo: {
  logo: string; // base64 data URL
  logoRatio: string;
}): Promise<LogoMutationResponse> {
  const token = getPortalToken();
  if (!token) {
    handleUnauthorized("No authentication token found");
  }

  const formData = new FormData();
  formData.append("logoRatio", logo.logoRatio);

  // Handle image upload
  if (logo.logo && logo.logo.startsWith("data:")) {
    const blob = dataURLtoBlob(logo.logo);
    formData.append("logo", blob, "logo-image.png");
  }

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/school-profile-proxy?action=logos-create`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (isUnauthorizedError(response.status, errorData)) {
      handleUnauthorized(errorData.error || errorData.message);
    }
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export async function updateSchoolLogo(logo: {
  logo_id: string;
  logo?: string; // base64 data URL (optional)
  logoRatio?: string;
}): Promise<LogoMutationResponse> {
  const token = getPortalToken();
  if (!token) {
    handleUnauthorized("No authentication token found");
  }

  const formData = new FormData();
  formData.append("logo_id", logo.logo_id);
  if (logo.logoRatio) {
    formData.append("logoRatio", logo.logoRatio);
  }

  // Handle image upload if provided
  if (logo.logo && logo.logo.startsWith("data:")) {
    const blob = dataURLtoBlob(logo.logo);
    formData.append("logo", blob, "logo-image.png");
  }

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/school-profile-proxy?action=logos-update`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (isUnauthorizedError(response.status, errorData)) {
      handleUnauthorized(errorData.error || errorData.message);
    }
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export async function deleteSchoolLogo(logoId: string): Promise<LogoMutationResponse> {
  const result = await callSchoolProfileProxy<LogoMutationResponse>("logos-delete", "POST", { logo_id: logoId });
  return result;
}

// Helper function to convert base64 data URL to Blob
function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

// Helper function to calculate logo ratio from image dimensions
export function calculateLogoRatio(width: number, height: number): string {
  if (width > height) {
    const ratio = Math.round(width / height);
    return `${ratio}:1`;
  } else {
    const ratio = Math.round(height / width);
    return `1:${ratio}`;
  }
}

// ============ Rankings API ============

export async function fetchSchoolRankings(): Promise<{
  rankings: SchoolRanking[];
  organizations: RankingOrganization[];
}> {
  const result = await callSchoolProfileProxy<SchoolRankingsResponse>("rankings-read", "GET");
  const rankings = decodeObjectStrings(result.data?.rankings || []);
  const organizations = decodeObjectStrings(result.data?.ranking_organizations || []);
  return { rankings, organizations };
}

export async function createSchoolRanking(ranking: {
  ranking_organisation: string;
  ranking_year: string;
  level: string;
  rank?: string;
  minimum_range?: string;
  maximum_range?: string;
  supporting_text?: string;
}): Promise<RankingMutationResponse> {
  const result = await callSchoolProfileProxy<RankingMutationResponse>("rankings-create", "POST", ranking);
  return result;
}

export async function updateSchoolRanking(ranking: {
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
}): Promise<RankingMutationResponse> {
  const result = await callSchoolProfileProxy<RankingMutationResponse>("rankings-update", "POST", ranking);
  return result;
}

export async function deleteSchoolRanking(ranking: {
  description_id: string;
  ranking_org_id: string;
  ranking_addition_id: string;
}): Promise<RankingMutationResponse> {
  const result = await callSchoolProfileProxy<RankingMutationResponse>("rankings-delete", "POST", ranking);
  return result;
}
